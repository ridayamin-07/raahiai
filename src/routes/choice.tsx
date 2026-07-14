import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/choice")({
  head: () => ({ meta: [{ title: "Choose how you walk · Raahi.AI" }] }),
  component: Choice,
});

function Choice() {
  const { ready, session } = useAuthGuard();
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string>(state.executionMode || "");
  if (!ready || !session) return null;

  const pick = (mode: string) => {
    setPicked(mode);
    update({ executionMode: mode });
  };

  const p = state.userProfile || {};

  return (
    <div className="min-h-screen bg-[#f5f0e0] pb-20">
      <header className="border-b border-[#e2d4a8] bg-[#f5f0e0]/90 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold">Raahi<span className="text-[#c9a84c]">.AI</span></Link>
          <Link to="/roadmap" className="text-sm text-[#4b6b60] hover:text-[#064e3b]">← Back to roadmap</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-12">
        <h1 className="text-3xl font-bold md:text-4xl">How do you want to walk this?</h1>
        <p className="mt-2 text-[#4b6b60]">Both options work. There's no wrong pick.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Solo */}
          <div className={`rounded-3xl border-2 bg-white p-7 transition ${picked === "solo" ? "border-[#0d7a5f]" : "border-[#e2d4a8]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e1efe4] text-2xl">🧭</div>
              <span className="rounded-full bg-[#e1efe4] px-3 py-1 text-xs font-semibold text-[#064e3b]">Independent learner</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">I'll do it myself</h2>
            <p className="mt-2 text-sm text-[#4b6b60]">You have your roadmap. You'll execute on your own time, your own way.</p>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Full week-by-week plan saved",
                "Check off tasks at your pace",
                "No interruptions or prompts",
                "Comes back when you want",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-[#0d7a5f]">✓</span>{t}</li>
              ))}
            </ul>

            <button
              onClick={() => pick("solo")}
              className={`mt-6 w-full rounded-full px-5 py-3 font-semibold transition ${
                picked === "solo" ? "bg-[#0d7a5f] text-white" : "border border-[#0d7a5f] text-[#064e3b] hover:bg-[#e1efe4]"
              }`}
            >
              {picked === "solo" ? "Selected ✓" : "Choose this"}
            </button>

            {picked === "solo" && (
              <div className="mt-6 rounded-2xl bg-[#e1efe4] p-5">
                <p className="font-semibold text-[#064e3b]">Good luck. You've got this.</p>
                <p className="mt-2 text-sm text-[#064e3b]">Coming soon in v2:</p>
                <ul className="mt-2 space-y-1 text-sm text-[#064e3b]">
                  <li>· CV generator tuned to your path</li>
                  <li>· Portfolio builder</li>
                  <li>· Interview prep flashcards</li>
                  <li>· LinkedIn positioning strategy</li>
                </ul>
                <p className="mt-3 text-xs text-[#064e3b]/80">
                  Changed your mind? Tap "Start AI mentorship" on your roadmap anytime.
                </p>
              </div>
            )}
          </div>

          {/* Mentor */}
          <div className={`rounded-3xl border-2 bg-white p-7 transition ${picked === "mentor" ? "border-[#064e3b]" : "border-[#e2d4a8]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6f0eb] text-2xl">🤝</div>
              <span className="rounded-full bg-[#e6f0eb] px-3 py-1 text-xs font-semibold text-[#043326]">Guided learning</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">AI mentor walks with me</h2>
            <p className="mt-2 text-sm text-[#4b6b60]">Raahi checks in weekly, unblocks you, and adjusts when life happens.</p>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Weekly check-ins on your progress",
                "Unstuck in your own language",
                "Concepts explained for your background",
                "Adjusts the plan when needed",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-[#064e3b]">✓</span>{t}</li>
              ))}
            </ul>

            <button
              onClick={() => pick("mentor")}
              className={`mt-6 w-full rounded-full px-5 py-3 font-semibold transition ${
                picked === "mentor" ? "bg-[#064e3b] text-white" : "border border-[#064e3b] text-[#064e3b] hover:bg-[#e6f0eb]"
              }`}
            >
              {picked === "mentor" ? "Selected ✓" : "Choose this"}
            </button>

            {picked === "mentor" && (
              <div className="mt-6 rounded-2xl bg-[#e6f0eb] p-5">
                <p className="text-sm text-[#043326]">
                  Hey — coming from a {p.background || "non-tech"} background and aiming at {state.careerPath || "your new path"}?
                  You're not starting from zero. I've already got your plan. Whenever you're stuck, overwhelmed, or just need
                  someone to explain something like a human — I'm here. In whatever language you want.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => navigate({ to: "/chat" })}
                    className="rounded-full bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Start mentorship →
                  </button>
                  <button
                    onClick={() => navigate({ to: "/roadmap" })}
                    className="rounded-full border border-[#e2d4a8] bg-white px-5 py-2.5 text-sm font-semibold"
                  >
                    View my roadmap first
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#4b6b60]">
          {picked === "solo"
            ? "You can switch to AI mentorship anytime from your roadmap."
            : picked === "mentor"
            ? "You can switch to solo mode anytime — your roadmap stays yours."
            : "You can switch modes anytime. Nothing here is locked in."}
        </p>
      </main>
    </div>
  );
}
