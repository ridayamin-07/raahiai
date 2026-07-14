import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApp } from "@/context/AppContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { buildSystemPrompt, callAI, refreshChatSummary } from "@/utils/ai";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThread,
});

type Msg = { role: "user" | "assistant"; content: string };

const ENTRY_BUTTONS = [
  { key: "stuck", label: "I'm stuck", sub: "on a concept or task", mode: "unblock-stuck", prompt: (w: number) => `I'm stuck this week (week ${w}). Can you walk me through what I should do next, broken into smaller pieces?` },
  { key: "explain", label: "Explain a concept", sub: "in plain language", mode: "concept-explainer", prompt: () => `Explain the most important concept I need to understand this week, in plain language tailored to my background.` },
  { key: "overwhelm", label: "I'm overwhelmed", sub: "talk me through it", mode: "emotional-support", prompt: () => `I'm feeling overwhelmed today. I don't know if I can keep going. Help me think clearly about what to do right now.` },
  { key: "review", label: "Review my work", sub: "give me honest feedback", mode: "work-review", prompt: () => `I want you to review something I made this week. I'll paste it next — start by asking what kind of feedback would help me most.` },
];

function totalWeeksFromRoadmap(rm: any): number {
  if (!rm?.phases) return 12;
  return rm.phases.reduce((s: number, p: any) => s + (p.weeks?.length || 0), 0);
}

function ChatThread() {
  const { ready, session } = useAuthGuard();
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [mode, setMode] = useState("mentorship");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const p = state.userProfile || {};
  const totalWeeks = totalWeeksFromRoadmap(state.roadmap);

  // Load messages for this thread
  useEffect(() => {
    if (!session || !threadId) return;
    setLoadingMsgs(true);
    setMessages([]);
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      const msgs = (data || []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      setMessages(msgs);
      setLoadingMsgs(false);
      try {
        const prefill = sessionStorage.getItem("raahi_prefill_chat");
        if (prefill) {
          setInput(prefill);
          sessionStorage.removeItem("raahi_prefill_chat");
        }
      } catch {}
    })();
  }, [session, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, sending]);

  const persistMessage = async (role: "user" | "assistant", content: string) => {
    if (!session) return;
    await supabase.from("chat_messages").insert({
      thread_id: threadId,
      user_id: session.user.id,
      role,
      content,
    });
  };

  const maybeTitleThread = async (firstUserText: string) => {
    if (messages.length !== 0) return;
    const title = firstUserText.trim().slice(0, 60) || "New chat";
    await supabase.from("chat_threads").update({ title, updated_at: new Date().toISOString() }).eq("id", threadId);
  };

  const bumpThread = async () => {
    await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
  };

  const send = async (text: string, callMode: string) => {
    if (!text.trim() || sending) return;
    if (!state.careerPath) {
      navigate({ to: "/recommendations" });
      return;
    }
    const userMsg: Msg = { role: "user", content: text };
    const isFirst = messages.length === 0;
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    setMode(callMode);

    // Persist user message + title thread if first
    persistMessage("user", text);
    if (isFirst) maybeTitleThread(text);

    const sys = buildSystemPrompt(state, callMode);
    const historyText = next
      .slice(-8)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const out = await callAI(sys, historyText);
    setMessages((m) => [...m, { role: "assistant", content: out }]);
    setSending(false);

    if (!out.startsWith("ERROR:")) {
      persistMessage("assistant", out);
      bumpThread();
      refreshChatSummary(state.chatSummary || "", { user: text, assistant: out })
        .then((nextSummary) => {
          if (nextSummary && nextSummary !== state.chatSummary) update({ chatSummary: nextSummary });
        })
        .catch(() => {});
    }
  };

  const handleEntry = (e: typeof ENTRY_BUTTONS[number]) => {
    send(e.prompt(state.currentWeek), e.mode);
  };

  if (!ready || !session) return null;

  return (
    <div className="flex h-full flex-col bg-[#f5f0e0]">
      <header className="border-b border-[#e2d4a8] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f0eb] text-xl">🤖</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#064e3b]">Raahi — your AI mentor</p>
                <span className="h-2 w-2 rounded-full bg-[#0d7a5f]" />
              </div>
              <p className="text-xs text-[#4b6b60]">{mode}</p>
            </div>
          </div>
          {state.careerPath && (
            <Link
              to="/roadmap"
              className="rounded-full border border-[#e2d4a8] bg-white px-3 py-1.5 text-xs font-semibold text-[#064e3b]"
            >
              Week {state.currentWeek} of {totalWeeks} ↗
            </Link>
          )}
        </div>
        {state.careerPath && (
          <div className="border-t border-[#e2d4a8] bg-[#e6f0eb]/60">
            <div className="mx-auto flex max-w-3xl flex-wrap gap-x-3 gap-y-1 px-4 py-2 text-xs text-[#043326]">
              <span><b>Background:</b> {p.background || "—"}</span>
              <span>·</span>
              <span><b>Path:</b> {state.careerPath || "—"}</span>
              <span>·</span>
              <span><b>Week:</b> {state.currentWeek}</span>
            </div>
          </div>
        )}
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6">
        {loadingMsgs ? (
          <p className="text-center text-sm text-[#4b6b60]">Loading…</p>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-[#e2d4a8] bg-white px-4 py-3 text-sm text-[#064e3b]">
                Hey. So — {p.background || "you"} background, going for {state.careerPath || "your path"}. Tell me what's going on, or tap a quick prompt below. Type in any language — I'll match you.
              </div>
            )}
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isError = m.content.startsWith("ERROR:");
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#064e3b] text-white whitespace-pre-wrap"
                        : isError
                        ? "bg-[#FAECE7] border border-[#D85A30] text-[#633806] whitespace-pre-wrap"
                        : "bg-white border border-[#e2d4a8] text-[#064e3b]"
                    }`}
                  >
                    {isUser || isError ? (
                      m.content
                    ) : (
                      <div className="prose-chat">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: (p) => <h1 className="mb-2 mt-3 text-base font-bold text-[#064e3b]" {...p} />,
                            h2: (p) => <h2 className="mb-2 mt-3 text-base font-bold text-[#064e3b]" {...p} />,
                            h3: (p) => <h3 className="mb-1 mt-3 text-sm font-bold text-[#064e3b]" {...p} />,
                            h4: (p) => <h4 className="mb-1 mt-2 text-sm font-bold text-[#064e3b]" {...p} />,
                            p: (p) => <p className="mb-2 last:mb-0" {...p} />,
                            ul: (p) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...p} />,
                            ol: (p) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...p} />,
                            li: (p) => <li className="leading-relaxed" {...p} />,
                            strong: (p) => <strong className="font-bold text-[#064e3b]" {...p} />,
                            em: (p) => <em className="italic" {...p} />,
                            a: (p) => <a className="text-[#064e3b] underline" target="_blank" rel="noreferrer" {...p} />,
                            code: ({ className, children, ...rest }: any) => {
                              const isBlock = /language-/.test(className || "");
                              return isBlock ? (
                                <code className="block overflow-x-auto rounded-md bg-[#f5f0e0] p-2 font-mono text-xs" {...rest}>{children}</code>
                              ) : (
                                <code className="rounded bg-[#f5f0e0] px-1 py-0.5 font-mono text-xs" {...rest}>{children}</code>
                              );
                            },
                            blockquote: (p) => <blockquote className="my-2 border-l-2 border-[#e2d4a8] pl-3 text-[#4b6b60]" {...p} />,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-[#e2d4a8] bg-white px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#064e3b]" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#064e3b]" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#064e3b]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {!loadingMsgs && messages.filter((m) => m.role === "user").length === 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ENTRY_BUTTONS.map((b) => (
              <button
                key={b.key}
                onClick={() => handleEntry(b)}
                className="rounded-2xl border border-[#e2d4a8] bg-white p-4 text-left transition hover:border-[#064e3b]"
              >
                <p className="font-semibold text-[#064e3b]">{b.label}</p>
                <p className="text-xs text-[#4b6b60]">{b.sub}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#e2d4a8] bg-white">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input, mode); }}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type freely in any language..."
            className="flex-1 rounded-full border border-[#e2d4a8] bg-[#f5f0e0] px-4 py-2.5 text-sm placeholder:text-[#4b6b60] focus:border-[#064e3b] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
