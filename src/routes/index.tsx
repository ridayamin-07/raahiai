import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raahi.AI — Your Personalised Career Mentorship into Tech" },
      {
        name: "description",
        content:
          "Free AI career mentorship for non-tech graduates switching into tech. No sign-up, 5 minutes.",
      },
    ],
  }),
  component: Landing,
});

// Emerald Prestige palette (locked)
const C = {
  cream: "#f5f0e0",
  creamSoft: "#faf6e8",
  emerald: "#064e3b",
  emeraldMid: "#0d7a5f",
  gold: "#c9a84c",
  blueDeep: "#1e40af",
  blueBright: "#3b82f6",
  ink: "#064e3b",
};

const sora = { fontFamily: "'Sora', ui-sans-serif, system-ui, sans-serif" } as const;
const manrope = { fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif" } as const;

function Logo() {
  return (
    <span className="text-xl font-bold tracking-tight text-[#064e3b]" style={sora}>
      Raahi<span className="text-[#c9a84c]">.AI</span>
    </span>
  );
}

function Landing() {
  const { session, signOut } = useApp();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };
  const primaryHref = session ? "/roadmap" : "/survey";
  const primaryLabel = session ? "Continue my roadmap →" : "Find my path →";

  return (
    <div className="min-h-screen bg-[#f5f0e0] text-[#064e3b]" style={manrope}>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#064e3b]/10 bg-[#f5f0e0]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden gap-8 text-sm font-medium text-[#064e3b]/70 md:flex">
            <button onClick={() => scrollTo("how-it-works")} className="hover:text-[#064e3b]">How it works</button>
            <button onClick={() => scrollTo("who")} className="hover:text-[#064e3b]">Who it's for</button>
            <button onClick={() => scrollTo("delivers")} className="hover:text-[#064e3b]">What you get</button>
            <button onClick={() => scrollTo("proof")} className="hover:text-[#064e3b]">Stories</button>
          </nav>
          {session ? (
            <div className="flex items-center gap-2">
              <Link to="/roadmap" className="text-sm font-semibold text-[#0d7a5f] hover:underline">My roadmap</Link>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-[#064e3b]/20 bg-white px-4 py-2 text-sm font-semibold text-[#064e3b] hover:border-[#c9a84c]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" search={{ redirect: undefined }} className="text-sm font-semibold text-[#064e3b]/70 hover:text-[#064e3b]">Sign in</Link>
              <Link
                to="/survey"
                className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-[#f5f0e0] shadow-sm transition hover:bg-[#0d7a5f]"
              >
                Start for free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl" style={sora}>
              Your Personalised{" "}
              <span className="text-[#0d7a5f]">Tech Career</span> Mentorship
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#064e3b]/75 md:text-xl">
              Raahi is an AI mentor that learns who you are, suggests careers that actually fit, and
              walks you through it — week by week.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={primaryHref}
                className="rounded-lg bg-[#064e3b] px-8 py-4 text-base font-bold text-[#f5f0e0] shadow-xl transition hover:bg-[#0d7a5f]"
              >
                {primaryLabel}
              </Link>
              <button
                onClick={() => scrollTo("how-it-works")}
                className="rounded-lg border-2 border-[#c9a84c] bg-transparent px-8 py-4 text-base font-bold text-[#064e3b] transition hover:bg-[#c9a84c]/10"
              >
                See how it works
              </button>
            </div>

            {/* Language strip */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#064e3b]/60">
                Mentor speaks
              </span>
              {["English", "اردو", "हिंदी", "Hinglish", "বাংলা", "Filipino"].map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-[#064e3b]/15 bg-white/60 px-3 py-1 text-xs font-medium text-[#064e3b]"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative lg:col-span-5">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#1e40af] p-8 shadow-2xl">
              <div className="flex h-full w-full flex-col rounded-2xl border-2 border-[#c9a84c]/30 bg-[#f5f0e0]/5 p-6 backdrop-blur-sm">
                <span className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[#c9a84c]">
                  Raahi · your mentor
                </span>
                <div className="mb-3 h-3 w-2/3 rounded bg-[#f5f0e0]/25" />
                <div className="mb-3 h-3 w-full rounded bg-[#f5f0e0]/25" />
                <div className="mb-8 h-3 w-1/2 rounded bg-[#f5f0e0]/25" />
                <p className="text-sm leading-relaxed text-[#f5f0e0]/80" style={sora}>
                  "Given your English degree and love of storytelling, UX research
                  fits you better than pure engineering. Here's why…"
                </p>
                <div className="mt-auto flex items-end justify-between pt-6">
                  <div className="h-12 w-12 rounded-full bg-[#c9a84c]" />
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-[#3b82f6]/40 text-xs font-semibold text-white">
                    Week 3 of 12
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain */}
      <section className="bg-white/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold leading-tight md:text-5xl" style={sora}>
              Switching into tech is brutal alone.
            </h2>
            <p className="mt-4 text-lg text-[#064e3b]/70">
              You're not lazy. The system just isn't built for you.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "No clear starting point", d: "You google 'how to get into tech' and drown in 40 tabs.", c: "#0d7a5f" },
              { t: "Bootcamps too expensive", d: "$15k for something you're not even sure fits you?", c: "#1e40af" },
              { t: "Information overload", d: "Every YouTuber says learn something different. None of it sticks.", c: "#c9a84c" },
              { t: "Fear of judgment", d: "Asking a 'dumb' question feels worse than not asking at all.", c: "#3b82f6" },
            ].map((c) => (
              <div key={c.t} className="border-b-4 bg-white p-6 shadow-sm" style={{ borderBottomColor: c.c }}>
                <h3 className="text-lg font-bold" style={sora}>{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#064e3b]/70">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section id="who" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#0d7a5f]">Who it's for</span>
            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl" style={sora}>
              The <span className="text-[#c9a84c] italic">Lost Ambitious</span>.
            </h2>
            <p className="mt-6 text-lg text-[#064e3b]/70">
              Graduates, 22–32, with a non-technical degree and a real hunger — but no map.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-[#064e3b]/10 bg-gradient-to-br from-[#064e3b] to-[#0d7a5f] p-10 shadow-2xl md:p-12">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#c9a84c]/15 blur-3xl" />
              <div className="relative">
                <span className="text-6xl leading-none text-[#c9a84c]" style={sora}>"</span>
                <p className="mt-2 text-xl italic leading-relaxed text-[#f5f0e0] md:text-2xl">
                  I have a degree, I'm hardworking, and I know tech is where the future is — but
                  every time I try to start, I freeze. I don't know if I should learn Python,
                  design, data, or product. I just need someone to tell me where to begin.
                </p>
                <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#c9a84c]">
                  — Graduate, 22–32, non-technical background
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold md:text-5xl" style={sora}>Your Pathway to Success</h2>
            <div className="mx-auto mt-6 h-1 w-24 bg-[#c9a84c]" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Tell us who you are", d: "10 quick questions. No fluff. We learn your background, interests, time, budget.", c: "#0d7a5f" },
              { n: "02", t: "Get 3 careers that fit", d: "Not generic lists — three paths matched to YOUR answers, with reasons.", c: "#3b82f6" },
              { n: "03", t: "Build your roadmap", d: "Pick a path. Get a week-by-week plan with daily breakdowns.", c: "#c9a84c" },
              { n: "04", t: "Walk it with a mentor", d: "Chat any time. Stuck, overwhelmed, confused — Raahi already knows you.", c: "#1e40af" },
            ].map((s) => (
              <div key={s.n} className="border-b-4 bg-white p-8 shadow-sm" style={{ borderBottomColor: s.c }}>
                <span className="mb-4 block text-5xl font-bold text-[#c9a84c]/25" style={sora}>{s.n}</span>
                <h3 className="text-xl font-bold" style={sora}>{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#064e3b]/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Raahi delivers */}
      <section id="delivers" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0d7a5f]">What Raahi delivers</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl" style={sora}>
            Everything you need to go from{" "}
            <span className="text-[#1e40af]">lost</span> to <span className="text-[#0d7a5f]">hired</span>.
          </h2>
          <p className="mt-4 text-lg text-[#064e3b]/70">
            Start with the core journey. Unlock more as you grow.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Available now */}
          <div>
            <span className="inline-flex rounded-full bg-[#064e3b] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#f5f0e0]">
              Available now
            </span>
            <div className="mt-6 grid gap-4">
              {[
                { t: "Personalised career recommendations", d: "AI analyzes your background and suggests the 3 tech roles that fit you specifically — not a generic list.", c: "#0d7a5f" },
                { t: "Personalised roadmap", d: "A week-by-week plan built around your timeline, budget, and learning style. Edit it anytime.", c: "#1e40af" },
                { t: "AI mentorship chat", d: "Your mentor knows your background, your roadmap, and where you are right now. Available anytime, judgment-free.", c: "#c9a84c" },
                { t: "Weekly accountability check-in", d: "Raahi checks in at the start of every week, reviews your progress, and adjusts your plan if needed.", c: "#3b82f6" },
              ].map((f) => (
                <div key={f.t} className="flex gap-4 border-l-4 bg-white p-5 shadow-sm" style={{ borderLeftColor: f.c }}>
                  <div className="mt-1 h-6 w-6 shrink-0 rounded" style={{ backgroundColor: f.c }} />
                  <div>
                    <h4 className="font-bold text-[#064e3b]" style={sora}>{f.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-[#064e3b]/70">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming soon */}
          <div>
            <span className="inline-flex rounded-full border border-[#064e3b]/20 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/60">
              Coming in v2
            </span>
            <div className="mt-6 grid gap-4">
              {[
                { t: "CV and cover letter generator", d: "AI-written applications tailored to your target role and the skills you have built." },
                { t: "Portfolio builder", d: "Guides you on which projects to build based on current hiring trends for your target role." },
                { t: "Interview prep", d: "AI mock interviews for your specific target role with personalised feedback." },
                { t: "Job search and LinkedIn strategy", d: "Targeted outreach templates, LinkedIn optimisation, and company research guides." },
              ].map((f) => (
                <div key={f.t} className="relative flex gap-4 border border-dashed border-[#064e3b]/20 bg-[#f5f0e0] p-5">
                  <div className="mt-1 h-6 w-6 shrink-0 rounded border-2 border-[#064e3b]/30 bg-transparent" />
                  <div className="pr-16">
                    <h4 className="font-bold text-[#064e3b]/80" style={sora}>{f.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-[#064e3b]/55">{f.d}</p>
                  </div>
                  <span className="absolute right-4 top-4 rounded bg-[#c9a84c]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#064e3b]">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="proof" className="bg-[#064e3b] py-24 text-[#f5f0e0]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold md:text-5xl" style={sora}>People are finding their path</h2>
            <div className="mx-auto mt-6 h-1 w-24 bg-[#c9a84c]" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { q: "I'd been stuck for two years. In a week I knew exactly what to learn next.", n: "Aisha", r: "Sociology grad → UX research" },
              { q: "It actually replied in Hinglish. Felt like talking to my cousin who works at Google.", n: "Rahul", r: "Commerce grad → Data analyst" },
              { q: "The roadmap broke things down so small I couldn't make excuses anymore.", n: "Mariam", r: "English lit → Product manager" },
            ].map((t) => (
              <blockquote key={t.n} className="border-l-2 border-[#c9a84c] bg-white/[0.03] p-8">
                <p className="text-lg italic leading-relaxed text-[#f5f0e0]/95">"{t.q}"</p>
                <footer className="mt-6 border-t border-[#f5f0e0]/15 pt-4">
                  <p className="text-sm font-bold text-[#c9a84c]" style={sora}>{t.n}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[#f5f0e0]/60">{t.r}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-[#064e3b]/10 bg-white p-12 text-center shadow-2xl md:p-16">
            <h2 className="text-4xl font-bold md:text-5xl" style={sora}>
              Stop scrolling<br />Start moving
            </h2>
            <div className="mt-10 flex justify-center">
              <Link
                to="/survey"
                className="rounded-xl bg-[#0d7a5f] px-12 py-5 text-lg font-bold text-white shadow-lg shadow-[#0d7a5f]/25 transition hover:scale-[1.02] hover:bg-[#064e3b]"
              >
                Start Your Free Assessment →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#064e3b]/10 bg-[#f5f0e0]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-[#064e3b]/60">Built by Rida · Portfolio project · 2026</p>
        </div>
      </footer>
    </div>
  );
}
