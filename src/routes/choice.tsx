import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/choice")({
  head: () => ({ meta: [{ title: "Choose how you walk · Raahi.AI" }] }),
  component: Choice,
});

function Choice() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string>(state.executionMode || "");

  const pick = (mode: string) => {
    setPicked(mode);
    update({ executionMode: mode });
  };

  const p = state.userProfile || {};

  return (
    <div className="min-h-screen bg-[#F1EFE8] pb-20">
      <header className="border-b border-[#D3D1C7] bg-[#F1EFE8]/90 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold">Raahi<span className="text-[#534AB7]">.AI</span></Link>
          <Link to="/roadmap" className="text-sm text-[#5F5E5A] hover:text-[#2C2C2A]">← Back to roadmap</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-12">
        <h1 className="text-3xl font-bold md:text-4xl">How do you want to walk this?</h1>
        <p className="mt-2 text-[#5F5E5A]">Both options work. There's no wrong pick.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Solo */}
          <div className={`rounded-3xl border-2 bg-white p-7 transition ${picked === "solo" ? "border-[#1D9E75]" : "border-[#D3D1C7]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E1F5EE] text-2xl">🧭</div>
              <span className="rounded-full bg-[#E1F5EE] px-3 py-1 text-xs font-semibold text-[#085041]">Independent learner</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">I'll do it myself</h2>
            <p className="mt-2 text-sm text-[#5F5E5A]">You have your roadmap. You'll execute on your own time, your own way.</p>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Full week-by-week plan saved",
                "Check off tasks at your pace",
                "No interruptions or prompts",
                "Comes back when you want",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-[#1D9E75]">✓</span>{t}</li>
              ))}
            </ul>

            <button
              onClick={() => pick("solo")}
              className={`mt-6 w-full rounded-full px-5 py-3 font-semibold transition ${
                picked === "solo" ? "bg-[#1D9E75] text-white" : "border border-[#1D9E75] text-[#085041] hover:bg-[#E1F5EE]"
              }`}
            >
              {picked === "solo" ? "Selected ✓" : "Choose this"}
            </button>

            {picked === "solo" && (
              <div className="mt-6 rounded-2xl bg-[#E1F5EE] p-5">
                <p className="font-semibold text-[#085041]">Good luck. You've got this.</p>
                <p className="mt-2 text-sm text-[#085041]">Coming soon in v2:</p>
                <ul className="mt-2 space-y-1 text-sm text-[#085041]">
                  <li>· CV generator tuned to your path</li>
                  <li>· Portfolio builder</li>
                  <li>· Interview prep flashcards</li>
                  <li>· LinkedIn positioning strategy</li>
                </ul>
                <p className="mt-3 text-xs text-[#085041]/80">
                  Changed your mind? Tap "Start AI mentorship" on your roadmap anytime.
                </p>
              </div>
            )}
          </div>

          {/* Mentor */}
          <div className={`rounded-3xl border-2 bg-white p-7 transition ${picked === "mentor" ? "border-[#534AB7]" : "border-[#D3D1C7]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEEDFE] text-2xl">🤝</div>
              <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-semibold text-[#3C3489]">Guided learning</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">AI mentor walks with me</h2>
            <p className="mt-2 text-sm text-[#5F5E5A]">Raahi checks in weekly, unblocks you, and adjusts when life happens.</p>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Weekly check-ins on your progress",
                "Unstuck in your own language",
                "Concepts explained for your background",
                "Adjusts the plan when needed",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-[#534AB7]">✓</span>{t}</li>
              ))}
            </ul>

            <button
              onClick={() => pick("mentor")}
              className={`mt-6 w-full rounded-full px-5 py-3 font-semibold transition ${
                picked === "mentor" ? "bg-[#534AB7] text-white" : "border border-[#534AB7] text-[#534AB7] hover:bg-[#EEEDFE]"
              }`}
            >
              {picked === "mentor" ? "Selected ✓" : "Choose this"}
            </button>

            {picked === "mentor" && (
              <div className="mt-6 rounded-2xl bg-[#EEEDFE] p-5">
                <p className="text-sm text-[#3C3489]">
                  Hey — coming from a {p.background || "non-tech"} background and aiming at {state.careerPath || "your new path"}?
                  You're not starting from zero. I've already got your plan. Whenever you're stuck, overwhelmed, or just need
                  someone to explain something like a human — I'm here. In whatever language you want.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => navigate({ to: "/chat" })}
                    className="rounded-full bg-[#534AB7] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Start mentorship →
                  </button>
                  <button
                    onClick={() => navigate({ to: "/roadmap" })}
                    className="rounded-full border border-[#D3D1C7] bg-white px-5 py-2.5 text-sm font-semibold"
                  >
                    View my roadmap first
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#5F5E5A]">
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
