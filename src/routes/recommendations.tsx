import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { buildSystemPrompt, callAI } from "@/utils/ai";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Your career matches · Raahi.AI" }] }),
  component: Recommendations,
});

type Rec = {
  career_path: string;
  match_score: number;
  why_this_fits: string[];
  first_step: string;
  time_to_job_ready: string;
};

const CARD_THEMES = [
  { bg: "bg-[#e6f0eb]", border: "border-[#a4c8b8]", accent: "#064e3b", chip: "bg-[#064e3b] text-white", bar: "bg-[#064e3b]" },
  { bg: "bg-[#e1efe4]", border: "border-[#0d7a5f]/40", accent: "#0d7a5f", chip: "bg-[#0d7a5f] text-white", bar: "bg-[#0d7a5f]" },
  { bg: "bg-[#FAECE7]", border: "border-[#D85A30]/40", accent: "#D85A30", chip: "bg-[#D85A30] text-white", bar: "bg-[#D85A30]" },
];

function tryParseJson(text: string): Rec[] | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return null;
}

function Recommendations() {
  const { ready, session } = useAuthGuard();
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [rejectedNow, setRejectedNow] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Rec | null>(null);
  const [warnRegen, setWarnRegen] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    setError(null);
    const sys = buildSystemPrompt(state, "recommendations");
    const msg = `Based on the user's profile, recommend exactly 3 career paths in tech that fit them.
Return ONLY a JSON array, no prose, no markdown fences. Each item must have:
{
  "career_path": string,
  "match_score": number between 60 and 95,
  "why_this_fits": [string, string, string]  // each bullet must reference specific survey answers,
  "first_step": string  // a concrete free task they can do today,
  "time_to_job_ready": string
}
NEVER include any of these rejected paths: ${[...state.rejectedPaths, ...rejectedNow].join(", ") || "(none)"}.`;
    const out = await callAI(sys, msg);
    if (out.startsWith("ERROR:")) {
      setError(out);
      setLoading(false);
      return;
    }
    const parsed = tryParseJson(out);
    if (!parsed || parsed.length === 0) {
      setError("Could not parse AI response. Try again.");
      setLoading(false);
      return;
    }
    setRecs(parsed.slice(0, 3));
    setRejectedNow([]);
    setWarnRegen(false);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready || !session) return;
    if (!state.userProfile?.background) {
      navigate({ to: "/survey" });
      return;
    }
    fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  const reject = (path: string) => {
    setRejectedNow((arr) => [...arr, path]);
    update({ rejectedPaths: [...state.rejectedPaths, path] });
  };

  const allRejected = recs.length > 0 && recs.every((r) => rejectedNow.includes(r.career_path));

  const handleRegen = () => {
    if (allRejected && !warnRegen) {
      setWarnRegen(true);
      return;
    }
    fetchRecs();
  };

  const choose = (r: Rec) => {
    setChosen(r);
    update({ careerPath: r.career_path });
  };

  const p = state.userProfile || {};

  if (!ready || !session) return null;

  return (
    <div className="min-h-screen bg-[#f5f0e0] pb-20">
      <header className="border-b border-[#e2d4a8] bg-[#f5f0e0]/90 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold">Raahi<span className="text-[#064e3b]">.AI</span></Link>
          <Link to="/survey" className="text-sm text-[#4b6b60] hover:text-[#064e3b]">← Edit answers</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        <h1 className="text-3xl font-bold md:text-4xl">3 paths matched to who you are</h1>
        <p className="mt-2 text-[#4b6b60]">Each one is built from your answers. Reject any that don't feel right.</p>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-[#e2d4a8] bg-white px-5 py-4 text-sm">
          <span className="text-[#4b6b60]">For:</span>
          <span className="font-medium">{p.background || "—"}</span>
          <span className="text-[#4b6b60]">·</span>
          <span className="font-medium">{p.motivation || "—"}</span>
          <span className="text-[#4b6b60]">·</span>
          <span className="font-medium">{p.timePerWeek || "—"}</span>
        </div>

        {loading && (
          <div className="mt-12 grid place-items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e6f0eb] border-t-[#064e3b]" />
            <p className="mt-4 text-[#4b6b60]">Reading your answers carefully…</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-2xl border border-[#D85A30] bg-[#FAECE7] p-6">
            <p className="font-semibold text-[#633806]">Something went wrong</p>
            <p className="mt-1 text-sm text-[#633806]">{error}</p>
            <button onClick={fetchRecs} className="mt-4 rounded-full bg-[#D85A30] px-5 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        )}

        {!loading && !error && !chosen && (
          <>
            {warnRegen && allRejected && (
              <div className="mt-8 rounded-2xl border border-[#EF9F27] bg-[#FAEEDA] p-5">
                <p className="font-semibold text-[#633806]">Hold on — you rejected all three.</p>
                <p className="mt-1 text-sm text-[#633806]">
                  This is normal. But if every option feels wrong, your survey answers might point somewhere else
                  than you think. Want to try once more, or revisit your answers?
                </p>
                <div className="mt-3 flex gap-3">
                  <button onClick={fetchRecs} className="rounded-full bg-[#064e3b] px-5 py-2 text-sm font-semibold text-white">Regenerate anyway</button>
                  <Link to="/survey" className="rounded-full border border-[#e2d4a8] bg-white px-5 py-2 text-sm font-semibold">Edit my answers</Link>
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {recs.map((r, i) => {
                const theme = CARD_THEMES[i % 3];
                const rejected = rejectedNow.includes(r.career_path);
                return (
                  <div
                    key={r.career_path + i}
                    className={`relative rounded-3xl border ${theme.border} ${theme.bg} p-6 transition ${
                      rejected ? "opacity-40 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl">★</div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.chip}`}>
                        {Math.round(r.match_score)}% match
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-[#064e3b]">{r.career_path}</h3>
                    <p className="mt-1 text-xs text-[#4b6b60]">Job-ready in {r.time_to_job_ready}</p>

                    <div className="mt-3 h-2 w-full rounded-full bg-white/70">
                      <div className={`h-2 rounded-full ${theme.bar}`} style={{ width: `${Math.min(100, r.match_score)}%` }} />
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                        Why this fits you
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-[#064e3b]">
                        {(r.why_this_fits || []).map((w, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span style={{ color: theme.accent }}>•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => choose(r)}
                        className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ background: theme.accent }}
                      >
                        Choose this path
                      </button>
                      <button
                        onClick={() => reject(r.career_path)}
                        className="rounded-full border border-[#e2d4a8] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b6b60] hover:text-[#064e3b]"
                      >
                        Not for me
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {rejectedNow.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleRegen}
                  className="rounded-full border border-[#a4c8b8] bg-white px-6 py-2.5 text-sm font-semibold text-[#064e3b] hover:bg-[#e6f0eb]"
                >
                  ↻ Regenerate fresh paths
                </button>
              </div>
            )}
          </>
        )}

        {chosen && (
          <div className="mt-10 rounded-3xl border border-[#0d7a5f]/40 bg-[#e1efe4] p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#0d7a5f] text-2xl text-white">✓</div>
            <h2 className="mt-4 text-2xl font-bold">You picked {chosen.career_path}</h2>
            <p className="mt-2 text-[#064e3b]">Good choice. Let's build a week-by-week plan you can actually follow.</p>
            <button
              onClick={() => navigate({ to: "/roadmap" })}
              className="mt-6 rounded-full bg-[#0d7a5f] px-7 py-3 font-semibold text-white hover:bg-[#064e3b]"
            >
              Build my roadmap →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
