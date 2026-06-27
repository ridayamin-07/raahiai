import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { buildSystemPrompt, callAI } from "@/utils/ai";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Your roadmap · Raahi.AI" }] }),
  component: Roadmap,
});

type Week = {
  week: number;
  title: string;
  tasks: string[];
  daily_breakdown: string[];
};
type Phase = {
  title: string;
  weeks: Week[];
  milestone: string;
};
type RoadmapData = { duration_months: number; phases: Phase[] };

function parseRoadmap(text: string): RoadmapData | null {
  let raw = text.trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fenced) raw = fenced[1];
  const s = raw.indexOf("{");
  if (s === -1) return null;
  let candidate = raw.slice(s);
  const e = candidate.lastIndexOf("}");
  if (e !== -1) candidate = candidate.slice(0, e + 1);
  const tryParse = (str: string): RoadmapData | null => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };
  let parsed = tryParse(candidate);
  if (parsed) return parsed;
  // Repair: strip trailing commas and control chars
  const repaired = candidate
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "");
  parsed = tryParse(repaired);
  if (parsed) return parsed;
  // Last resort: balance braces/brackets if truncated
  const openC = (repaired.match(/{/g) || []).length;
  const closeC = (repaired.match(/}/g) || []).length;
  const openB = (repaired.match(/\[/g) || []).length;
  const closeB = (repaired.match(/\]/g) || []).length;
  let balanced = repaired.replace(/,\s*$/, "");
  balanced += "]".repeat(Math.max(0, openB - closeB));
  balanced += "}".repeat(Math.max(0, openC - closeC));
  return tryParse(balanced);
}

function Roadmap() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoadmapData | null>(state.roadmap);
  const [openPhase, setOpenPhase] = useState<number>(0);
  const [showDaily, setShowDaily] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<string[]>(state.completedTasks || []);

  const fetchRoadmap = async (m: number) => {
    setLoading(true);
    setError(null);
    const sys = buildSystemPrompt(state, "roadmap-generation");
    const msg = `Generate a ${m}-month personalised learning roadmap for the user's chosen career path: "${state.careerPath}".
Return ONLY valid JSON, no prose, no markdown fences. Structure:
{
  "duration_months": ${m},
  "phases": [
    {
      "title": "Phase name",
      "milestone": "What they can do/show by the end",
      "weeks": [
        {
          "week": 1,
          "title": "Week theme",
          "tasks": ["task 1", "task 2", "task 3"],
          "daily_breakdown": ["Day 1: ...", "Day 2: ...", "Day 3: ...", "Day 4: ...", "Day 5: ..."]
        }
      ]
    }
  ]
}
Total weeks must equal ${m * 4}. Split into 2-3 phases. Tailor to their time per week, learning style, and skill level.`;
    const out = await callAI(sys, msg);
    if (out.startsWith("ERROR:")) {
      setError(out);
      setLoading(false);
      return;
    }
    const parsed = parseRoadmap(out);
    if (!parsed) {
      setError("Could not parse roadmap. Try again.");
      setLoading(false);
      return;
    }
    setData(parsed);
    update({ roadmap: parsed });
    setLoading(false);
  };

  useEffect(() => {
    if (!state.careerPath) {
      navigate({ to: "/recommendations" });
      return;
    }
    fetchRoadmap(months);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMonths = (m: number) => {
    if (m === months) return;
    setMonths(m);
    fetchRoadmap(m);
  };

  const totalWeeks = data?.phases.reduce((s, p) => s + p.weeks.length, 0) || 0;
  const doneCount = completed.length;
  const overall = totalWeeks ? Math.round((doneCount / (totalWeeks * 3)) * 100) : 0;

  const toggleTask = (id: string) => {
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id];
    setCompleted(next);
    update({ completedTasks: next });
  };

  const pickMode = (mode: string) => {
    update({ executionMode: mode });
    navigate({ to: "/choice" });
  };

  return (
    <div className="min-h-screen bg-[#F1EFE8] pb-20">
      <header className="sticky top-0 z-30 border-b border-[#D3D1C7] bg-[#F1EFE8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold">Raahi<span className="text-[#534AB7]">.AI</span></Link>
          <span className="text-sm text-[#5F5E5A]">Roadmap · {state.careerPath}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-10">
        <h1 className="text-3xl font-bold md:text-4xl">Your roadmap into {state.careerPath || "tech"}</h1>
        <p className="mt-2 text-[#5F5E5A]">One week at a time. Built around your hours and learning style.</p>

        <div className="mt-6 inline-flex rounded-full border border-[#D3D1C7] bg-white p-1">
          {[1, 2, 3].map((m) => (
            <button
              key={m}
              onClick={() => switchMonths(m)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                months === m ? "bg-[#534AB7] text-white" : "text-[#5F5E5A]"
              }`}
            >
              {m} month{m > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-16 grid place-items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EEEDFE] border-t-[#534AB7]" />
            <p className="mt-4 text-[#5F5E5A]">Drafting your {months}-month plan…</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-2xl border border-[#D85A30] bg-[#FAECE7] p-6">
            <p className="font-semibold text-[#633806]">{error}</p>
            <button onClick={() => fetchRoadmap(months)} className="mt-4 rounded-full bg-[#D85A30] px-5 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="mt-8 rounded-2xl border border-[#D3D1C7] bg-white p-5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Week {state.currentWeek} of {totalWeeks}</span>
                <span className="text-[#5F5E5A]">{overall}% complete</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#EEEDFE]">
                <div className="h-2 rounded-full bg-[#534AB7] transition-all" style={{ width: `${overall}%` }} />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {data.phases.map((phase, pi) => {
                const open = openPhase === pi;
                const phaseWeeks = phase.weeks.map((w) => w.week);
                const minW = Math.min(...phaseWeeks);
                const maxW = Math.max(...phaseWeeks);
                const status =
                  state.currentWeek > maxW ? "done" : state.currentWeek >= minW ? "active" : "upcoming";
                const dotColor =
                  status === "done" ? "bg-[#1D9E75]" : status === "active" ? "bg-[#534AB7]" : "bg-[#D3D1C7]";
                const badge =
                  status === "done"
                    ? "bg-[#E1F5EE] text-[#085041]"
                    : status === "active"
                    ? "bg-[#EEEDFE] text-[#3C3489]"
                    : "bg-[#F1EFE8] text-[#5F5E5A]";

                return (
                  <div key={pi} className="overflow-hidden rounded-2xl border border-[#D3D1C7] bg-white">
                    <button
                      onClick={() => setOpenPhase(open ? -1 : pi)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${dotColor}`} />
                        <span className="font-semibold">{phase.title}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>{status}</span>
                      </div>
                      <span className="text-[#5F5E5A]">{open ? "−" : "+"}</span>
                    </button>

                    {open && (
                      <div className="border-t border-[#D3D1C7] bg-[#F1EFE8]/40">
                        <div className="px-5 py-3 text-sm text-[#5F5E5A]">
                          Milestone: <span className="font-medium text-[#2C2C2A]">{phase.milestone}</span>
                        </div>
                        <div className="divide-y divide-[#D3D1C7]">
                          {phase.weeks.map((w) => {
                            const isCurrent = w.week === state.currentWeek;
                            const dailyKey = `p${pi}w${w.week}`;
                            const dailyOpen = showDaily[dailyKey];
                            return (
                              <div key={w.week} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">Week {w.week} — {w.title}</h4>
                                      {isCurrent && (
                                        <span className="rounded-full bg-[#534AB7] px-2 py-0.5 text-xs font-medium text-white">
                                          This week
                                        </span>
                                      )}
                                    </div>
                                    <ul className="mt-3 space-y-2">
                                      {w.tasks.map((t, ti) => {
                                        const id = `${dailyKey}t${ti}`;
                                        const done = completed.includes(id);
                                        return (
                                          <li key={ti} className="flex items-start gap-3 text-sm">
                                            <button
                                              onClick={() => toggleTask(id)}
                                              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                                                done
                                                  ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                                                  : "border-[#D3D1C7] bg-white"
                                              }`}
                                            >
                                              {done ? "✓" : ""}
                                            </button>
                                            <span className={done ? "line-through text-[#5F5E5A]" : ""}>{t}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>

                                    <button
                                      onClick={() => setShowDaily((s) => ({ ...s, [dailyKey]: !s[dailyKey] }))}
                                      className="mt-3 text-xs font-semibold text-[#534AB7]"
                                    >
                                      {dailyOpen ? "Hide daily breakdown ↑" : "Show daily breakdown ↓"}
                                    </button>

                                    {dailyOpen && (
                                      <ul className="mt-3 space-y-1.5 rounded-xl bg-white p-4 text-sm">
                                        {(w.daily_breakdown || []).map((d, di) => (
                                          <li key={di} className="text-[#5F5E5A]">{d}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              to="/chat"
              className="mt-10 flex items-center justify-between rounded-2xl bg-[#534AB7] px-6 py-5 text-white transition hover:bg-[#3C3489]"
            >
              <div>
                <p className="font-semibold">Stuck on this week?</p>
                <p className="text-sm text-[#EEEDFE]">Ask your mentor — Raahi already knows your plan.</p>
              </div>
              <span>↗</span>
            </Link>

            <div className="mt-10 rounded-3xl border border-[#D3D1C7] bg-white p-8">
              <h2 className="text-2xl font-bold">How do you want to walk this?</h2>
              <p className="mt-2 text-[#5F5E5A]">You can change your mind anytime.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => pickMode("solo")}
                  className="flex-1 rounded-2xl border border-[#1D9E75]/40 bg-[#E1F5EE] px-5 py-4 text-left font-semibold text-[#085041] hover:border-[#1D9E75]"
                >
                  I'll execute alone →
                </button>
                <button
                  onClick={() => pickMode("mentor")}
                  className="flex-1 rounded-2xl border border-[#AFA9EC] bg-[#EEEDFE] px-5 py-4 text-left font-semibold text-[#3C3489] hover:border-[#534AB7]"
                >
                  AI mentor walks with me →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
