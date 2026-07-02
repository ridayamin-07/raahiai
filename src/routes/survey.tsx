import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/survey")({
  head: () => ({ meta: [{ title: "Tell us about you · Raahi.AI" }] }),
  component: Survey,
});

type Q =
  | { id: string; type: "single"; q: string; options: string[]; required?: boolean }
  | { id: string; type: "multi"; q: string; options: string[]; required?: boolean }
  | { id: string; type: "tags"; q: string; options: string[]; required?: boolean }
  | { id: string; type: "text"; q: string; placeholder?: string; required?: boolean };

const QUESTIONS: Q[] = [
  { id: "background", type: "single", q: "What was your educational background?", options: ["Social sciences / humanities", "Business / commerce", "Arts / design / media", "Natural sciences", "Something else"], required: true },
  { id: "interests", type: "multi", q: "What kinds of activities genuinely energize you?", options: ["Solving puzzles", "Writing / storytelling", "Researching / analyzing", "Designing visuals", "Data / patterns", "Understanding people", "Building things", "Teaching"], required: true },
  { id: "motivation", type: "single", q: "What is pulling you toward tech?", options: ["Better income", "Career growth", "Genuine curiosity", "Want to build impact", "Not sure yet"], required: true },
  { id: "timePerWeek", type: "single", q: "How much time can you dedicate per week?", options: ["Less than 5 hrs", "5–10 hrs", "10–20 hrs", "20+ hrs"], required: true },
  { id: "learningStyle", type: "multi", q: "How do you learn best?", options: ["Videos", "Reading articles", "Hands-on projects", "Structured plan", "Trial and error", "Having someone explain"], required: true },
  { id: "budget", type: "single", q: "What is your budget?", options: ["Free only", "Up to $20/mo", "$20–50/mo", "$50+/mo"], required: true },
  
  { id: "blockers", type: "tags", q: "What has stopped you before?", options: ["Did not know where to start", "Not technical enough", "Can't afford bootcamps", "Overwhelmed by advice", "No network", "Fear of judgment", "Did not know which field", "Just starting"], required: true },
  { id: "skillLevel", type: "single", q: "Have you explored any tech skills?", options: ["Zero experience", "Tried a few things", "Explored seriously", "Have some skills"], required: true },
  { id: "additionalContext", type: "text", q: "Anything else you want us to know?", placeholder: "e.g. I have always been drawn to how apps work...", required: false },
];

function Survey() {
  const { ready, session } = useAuthGuard();
  const { state, update } = useApp();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [profile, setProfile] = useState<Record<string, any>>(state.userProfile || {});
  const navigate = useNavigate();
  if (!ready || !session) return null;

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const value = profile[q.id];
  const standardBgOptions = (QUESTIONS[0] as Extract<Q, { type: "single" }>).options.slice(0, -1);
  const isCustomBg = q.id === "background" && !!value && !standardBgOptions.includes(value);
  const isAnswered = () => {
    if (!q.required) return true;
    if (q.id === "background") return !!value && String(value).trim().length > 0 && value !== "Something else";
    if (q.type === "single" || q.type === "text") return !!value && String(value).trim().length > 0;
    return Array.isArray(value) && value.length > 0;
  };

  const setVal = (v: any) => setProfile((p) => ({ ...p, [q.id]: v }));
  const toggleMulti = (opt: string) => {
    const arr: string[] = Array.isArray(value) ? value : [];
    setVal(arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt]);
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else {
      update({ userProfile: profile });
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F1EFE8] px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#D3D1C7] bg-white p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E1F5EE] text-3xl">✓</div>
          <h1 className="mt-6 text-3xl font-bold">Got it. Reading you back…</h1>
          <p className="mt-3 text-[#5F5E5A]">
            We're going to match your background, time, and goals to careers that actually fit.
          </p>
          <div className="mt-8 grid gap-3 text-left text-sm">
            {Object.entries(profile).slice(0, 6).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 rounded-lg border border-[#D3D1C7] px-4 py-2">
                <span className="text-[#5F5E5A]">{k}</span>
                <span className="font-medium text-[#2C2C2A]">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate({ to: "/recommendations" })}
            className="mt-8 rounded-full bg-[#534AB7] px-7 py-3 font-semibold text-white hover:bg-[#3C3489]"
          >
            Show me my paths →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1EFE8]">
      <div className="sticky top-0 z-30 bg-[#F1EFE8]/95 backdrop-blur">
        <div className="h-2 bg-[#EEEDFE]">
          <div className="h-2 bg-[#534AB7] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 text-sm">
          <Link to="/" className="font-bold">Raahi<span className="text-[#534AB7]">.AI</span></Link>
          <span className="text-[#5F5E5A]">Question {step + 1} of {QUESTIONS.length}</span>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold leading-snug">{q.q}</h1>
        {q.type === "multi" && <p className="mt-2 text-sm text-[#5F5E5A]">Pick as many as feel true.</p>}
        {q.type === "tags" && <p className="mt-2 text-sm text-[#5F5E5A]">Tap any that apply.</p>}

        <div className="mt-8">
          {q.type === "single" && (
            <div className="grid gap-3">
              {q.options.map((opt) => {
                const active = value === opt || (opt === "Something else" && isCustomBg);
                return (
                  <button
                    key={opt}
                    onClick={() => setVal(opt)}
                    className={`rounded-xl border px-5 py-4 text-left transition ${
                      active
                        ? "border-[#534AB7] bg-[#EEEDFE] text-[#3C3489]"
                        : "border-[#D3D1C7] bg-white hover:border-[#AFA9EC]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
              {q.id === "background" && isCustomBg && (
                <input
                  type="text"
                  value={value === "Something else" ? "" : value || ""}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder="Please specify your educational background..."
                  className="rounded-xl border border-[#534AB7] bg-white px-5 py-4 text-[#2C2C2A] placeholder:text-[#5F5E5A] focus:border-[#534AB7] focus:outline-none"
                  autoFocus
                />
              )}
            </div>
          )}

          {q.type === "multi" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {q.options.map((opt) => {
                const arr: string[] = Array.isArray(value) ? value : [];
                const active = arr.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-[#534AB7] bg-[#EEEDFE] text-[#3C3489]"
                        : "border-[#D3D1C7] bg-white hover:border-[#AFA9EC]"
                    }`}
                  >
                    <span className="mr-2">{active ? "✓" : "+"}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "tags" && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const arr: string[] = Array.isArray(value) ? value : [];
                const active = arr.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-[#534AB7] bg-[#534AB7] text-white"
                        : "border-[#D3D1C7] bg-white text-[#2C2C2A] hover:border-[#AFA9EC]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "text" && (
            <textarea
              value={value || ""}
              onChange={(e) => setVal(e.target.value)}
              placeholder={q.placeholder}
              rows={5}
              className="w-full rounded-xl border border-[#D3D1C7] bg-white px-4 py-3 text-[#2C2C2A] placeholder:text-[#5F5E5A] focus:border-[#534AB7] focus:outline-none"
            />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="rounded-full border border-[#D3D1C7] bg-white px-5 py-2.5 text-sm font-semibold text-[#2C2C2A] disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={!isAnswered()}
            className="rounded-full bg-[#534AB7] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[#3C3489] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === QUESTIONS.length - 1 ? "Finish" : "Next →"}
          </button>
        </div>
      </main>
    </div>
  );
}
