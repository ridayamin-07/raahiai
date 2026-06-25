import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { buildSystemPrompt, callAI } from "@/utils/ai";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat with Raahi · Raahi.AI" }] }),
  component: Chat,
});

type Msg = { role: "user" | "assistant" | "system-card"; content: string; mode?: string };

const ENTRY_BUTTONS = [
  { key: "stuck", label: "I'm stuck", sub: "on a concept or task", mode: "unblock-stuck", prompt: (week: number) => `I'm stuck this week (week ${week}). Can you walk me through what I should do next, broken into smaller pieces?` },
  { key: "explain", label: "Explain a concept", sub: "in plain language", mode: "concept-explainer", prompt: () => `Explain the most important concept I need to understand this week, in plain language tailored to my background.` },
  { key: "overwhelm", label: "I'm overwhelmed", sub: "talk me through it", mode: "emotional-support", prompt: () => `I'm feeling overwhelmed today. I don't know if I can keep going. Help me think clearly about what to do right now.` },
  { key: "review", label: "Review my work", sub: "give me honest feedback", mode: "work-review", prompt: () => `I want you to review something I made this week. I'll paste it next — start by asking what kind of feedback would help me most.` },
];

function totalWeeksFromRoadmap(rm: any): number {
  if (!rm?.phases) return 12;
  return rm.phases.reduce((s: number, p: any) => s + (p.weeks?.length || 0), 0);
}

function Chat() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState("mentorship");
  const scrollRef = useRef<HTMLDivElement>(null);

  const p = state.userProfile || {};
  const totalWeeks = totalWeeksFromRoadmap(state.roadmap);

  useEffect(() => {
    if (!state.careerPath) {
      navigate({ to: "/recommendations" });
      return;
    }
    const welcome: Msg = {
      role: "assistant",
      content: `Hey. So — ${p.background || "you"} background, going for ${state.careerPath}. I've got your plan in front of me. We're on week ${state.currentWeek} of ${totalWeeks}.\n\nTell me what's going on, or pick one of the buttons below. Type in any language — I'll match you.`,
    };

    const checkinKey = `raahi.checkin.w${state.currentWeek}`;
    const seen = typeof window !== "undefined" && sessionStorage.getItem(checkinKey);

    const initial: Msg[] = [];
    if (!seen) {
      // Find this week's tasks
      let tasks: string[] = [];
      state.roadmap?.phases?.forEach((ph: any) =>
        ph.weeks?.forEach((w: any) => { if (w.week === state.currentWeek) tasks = w.tasks || []; })
      );
      initial.push({
        role: "system-card",
        content: JSON.stringify({ week: state.currentWeek, tasks }),
      });
      if (typeof window !== "undefined") sessionStorage.setItem(checkinKey, "1");
    }
    initial.push(welcome);
    setMessages(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text: string, callMode: string) => {
    if (!text.trim() || sending) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    setMode(callMode);

    const sys = buildSystemPrompt(state, callMode);
    // include short history
    const historyText = next
      .filter((m) => m.role !== "system-card")
      .slice(-8)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const out = await callAI(sys, historyText);
    setMessages((m) => [...m, { role: "assistant", content: out }]);
    setSending(false);
  };

  const handleEntry = (e: typeof ENTRY_BUTTONS[number]) => {
    send(e.prompt(state.currentWeek), e.mode);
  };

  const handleCheckin = (status: "done" | "partial" | "stuck") => {
    setMessages((m) => m.filter((x) => x.role !== "system-card"));
    if (status === "stuck") update({ stuckStreak: (state.stuckStreak || 0) + 1 });
    else update({ stuckStreak: 0 });
    const label =
      status === "done" ? "I finished everything for this week." :
      status === "partial" ? "I did some of it, not all." :
      "I got stuck and didn't make progress.";
    send(label, "weekly-checkin");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F1EFE8]">
      <header className="sticky top-0 z-30 border-b border-[#D3D1C7] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EEEDFE] text-xl">🤖</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#2C2C2A]">Raahi — your AI mentor</p>
                <span className="h-2 w-2 rounded-full bg-[#1D9E75]" />
              </div>
              <p className="text-xs text-[#5F5E5A]">{mode}</p>
            </div>
          </div>
          <Link
            to="/roadmap"
            className="rounded-full border border-[#D3D1C7] bg-white px-3 py-1.5 text-xs font-semibold text-[#2C2C2A]"
          >
            Week {state.currentWeek} of {totalWeeks} ↗
          </Link>
        </div>
        <div className="border-t border-[#D3D1C7] bg-[#EEEDFE]/60">
          <div className="mx-auto flex max-w-3xl flex-wrap gap-x-3 gap-y-1 px-4 py-2 text-xs text-[#3C3489]">
            <span><b>Background:</b> {p.background || "—"}</span>
            <span>·</span>
            <span><b>Path:</b> {state.careerPath || "—"}</span>
            <span>·</span>
            <span><b>Week:</b> {state.currentWeek}</span>
            <span>·</span>
            <span><b>Hours/wk:</b> {p.timePerWeek || "—"}</span>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((m, i) => {
            if (m.role === "system-card") {
              const parsed = JSON.parse(m.content);
              return (
                <div key={i} className="rounded-2xl border border-[#EF9F27] bg-[#FAEEDA] p-5">
                  <p className="font-semibold text-[#633806]">Week {parsed.week} check-in</p>
                  <p className="mt-1 text-sm text-[#633806]">
                    You were supposed to complete{" "}
                    {parsed.tasks?.length
                      ? `"${parsed.tasks.slice(0, 3).join(", ")}"`
                      : "your week's tasks"}{" "}
                    this week. How did it go?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => handleCheckin("done")} className="rounded-full bg-[#1D9E75] px-4 py-1.5 text-xs font-semibold text-white">Done it all</button>
                    <button onClick={() => handleCheckin("partial")} className="rounded-full bg-[#EF9F27] px-4 py-1.5 text-xs font-semibold text-white">Partially done</button>
                    <button onClick={() => handleCheckin("stuck")} className="rounded-full bg-[#D85A30] px-4 py-1.5 text-xs font-semibold text-white">Got stuck</button>
                  </div>
                </div>
              );
            }
            const isUser = m.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#534AB7] text-white"
                      : m.content.startsWith("ERROR:")
                      ? "bg-[#FAECE7] border border-[#D85A30] text-[#633806]"
                      : "bg-white border border-[#D3D1C7] text-[#2C2C2A]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl border border-[#D3D1C7] bg-white px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#534AB7]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#534AB7]" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#534AB7]" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {messages.filter((m) => m.role === "user").length === 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ENTRY_BUTTONS.map((b) => (
              <button
                key={b.key}
                onClick={() => handleEntry(b)}
                className="rounded-2xl border border-[#D3D1C7] bg-white p-4 text-left transition hover:border-[#534AB7]"
              >
                <p className="font-semibold text-[#2C2C2A]">{b.label}</p>
                <p className="text-xs text-[#5F5E5A]">{b.sub}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-[#D3D1C7] bg-white">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input, mode); }}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type freely in any language..."
            className="flex-1 rounded-full border border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2.5 text-sm placeholder:text-[#5F5E5A] focus:border-[#534AB7] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full bg-[#534AB7] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
