import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/my-survey")({
  head: () => ({
    meta: [
      { title: "My survey answers · Raahi.AI" },
      { name: "description", content: "Review the answers you gave Raahi.AI and update them any time." },
      { property: "og:title", content: "My survey answers · Raahi.AI" },
      { property: "og:description", content: "Review and edit the answers behind your personalised tech career roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MySurvey,
});

const LABELS: Record<string, string> = {
  background: "Educational background",
  interests: "What energizes you",
  motivation: "Why tech",
  timePerWeek: "Time per week",
  learningStyle: "How you learn best",
  budget: "Budget",
  blockers: "What stopped you before",
  skillLevel: "Tech experience",
  additionalContext: "Anything else",
};

const ORDER = Object.keys(LABELS);

function MySurvey() {
  const { ready, session } = useAuthGuard();
  const { state } = useApp();
  if (!ready || !session) return null;

  const profile = state.userProfile || {};
  const entries = ORDER.filter((k) => profile[k] !== undefined && profile[k] !== "" && !(Array.isArray(profile[k]) && profile[k].length === 0));

  return (
    <div className="min-h-screen bg-[#f5f0e0]">
      <div className="sticky top-0 z-30 border-b border-[#064e3b]/10 bg-[#f5f0e0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 text-sm">
          <Link to="/" className="font-bold">Raahi<span className="text-[#c9a84c]">.AI</span></Link>
          <Link to="/roadmap" className="font-semibold text-[#0d7a5f] hover:underline">My roadmap</Link>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold">My survey answers</h1>
        <p className="mt-2 text-[#4b6b60]">These are the answers Raahi uses to personalise your path.</p>

        {entries.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#e2d4a8] bg-white p-8 text-center">
            <p className="text-[#4b6b60]">You haven't completed the survey yet.</p>
            <Link
              to="/survey"
              className="mt-6 inline-block rounded-full bg-[#064e3b] px-7 py-3 font-semibold text-white hover:bg-[#043326]"
            >
              Take the survey →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3">
              {entries.map((k) => {
                const v = profile[k];
                return (
                  <div key={k} className="rounded-xl border border-[#e2d4a8] bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#0d7a5f]">{LABELS[k]}</p>
                    {Array.isArray(v) ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {v.map((item: string) => (
                          <span key={item} className="rounded-full border border-[#064e3b]/15 bg-[#e6f0eb] px-3 py-1 text-sm font-medium text-[#064e3b]">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-medium text-[#064e3b]">{String(v)}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/survey"
                className="rounded-full bg-[#064e3b] px-7 py-3 font-semibold text-white hover:bg-[#043326]"
              >
                Edit my answers
              </Link>
              <Link
                to="/roadmap"
                className="rounded-full border border-[#064e3b]/20 bg-white px-7 py-3 font-semibold text-[#064e3b] hover:border-[#c9a84c]"
              >
                Back to roadmap
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
