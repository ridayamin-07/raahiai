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
  const [showCheckIn, setShowCheckIn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const p = state.userProfile || {};
  const totalWeeks = totalWeeksFromRoadmap(state.roadmap);

  const prevWeekTasks: string[] = (() => {
    const prev = state.currentWeek - 1;
    if (prev < 1 || !state.roadmap?.phases) return [];
    for (const ph of state.roadmap.phases) {
      for (const w of ph.weeks || []) if (w.week === prev) return w.tasks || [];
    }
    return [];
  })();

  useEffect(() => {
    if (!state.careerPath) {
      navigate({ to: "/recommendations" });
      return;
    }
    const welcome: Msg = {
      role: "assistant",
      content: `Hey. So — ${p.background || "you"} background, going for ${state.careerPath}. I've got your plan in front of me. We're on week ${state.currentWeek} of ${totalWeeks}.\n\nTell me what's going on, or pick one of the buttons below. Type in any language — I'll match you.`,
    };

    setMessages([welcome]);

    // Show check-in bubble only if not yet checked in this week and there's a prior week
    if (!state.checkedInThisWeek && prevWeekTasks.length > 0) {
      setShowCheckIn(true);
    }

    // Handle prefill from roadmap "Got stuck" navigation
    try {
      const prefill = sessionStorage.getItem("raahi_prefill_chat");
      if (prefill) {
        setInput(prefill);
        sessionStorage.removeItem("raahi_prefill_chat");
      }
    } catch {}
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

  const handleCheckin = async (response: string, stuck: boolean) => {
    try {
      sessionStorage.setItem("raahi_checked_in_week", String(state.currentWeek));
    } catch {}
    update({
      checkedInThisWeek: true,
      checkInResponse: response,
      stuckStreak: stuck ? (state.stuckStreak || 0) + 1 : 0,
    });
    setShowCheckIn(false);

    setSending(true);
    setMode("checkin_mode");
    const sys = buildSystemPrompt(
      { ...state, checkedInThisWeek: true, checkInResponse: response },
      "checkin_mode",
    );
    const userMsg = `Weekly check-in. Last week's tasks were: ${
      prevWeekTasks.join(", ") || "(none recorded)"
    }. The user's response: "${response}". Acknowledge their status warmly, reference their specific tasks, and suggest the next concrete step for this week.`;
    const out = await callAI(sys, userMsg);
    setMessages((m) => [...m, { role: "assistant", content: out }]);
    setSending(false);
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
          {showCheckIn && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl border border-[#D3D1C7] bg-white px-4 py-3 text-sm leading-relaxed text-[#2C2C2A]">
                <p>
                  Before we dive in — last week you were working on{" "}
                  {prevWeekTasks.join(", ")}. How did it go?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCheckin("Done it all", false)}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                    style={{ background: "#534AB7" }}
                  >
                    Done it all
                  </button>
                  <button
                    onClick={() => handleCheckin("Partially done", false)}
                    className="rounded-full border border-[#D3D1C7] bg-white px-4 py-1.5 text-xs font-semibold text-[#5F5E5A]"
                  >
                    Partially done
                  </button>
                  <button
                    onClick={() => handleCheckin("Got stuck", true)}
                    className="rounded-full border border-[#D3D1C7] bg-white px-4 py-1.5 text-xs font-semibold text-[#5F5E5A]"
                  >
                    Got stuck
                  </button>
                </div>
              </div>
            </div>
          )}
          {messages.map((m, i) => {
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
