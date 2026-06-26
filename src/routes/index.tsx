import { createFileRoute, Link } from "@tanstack/react-router";

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

function Logo() {
  return (
    <span className="text-xl font-bold tracking-tight text-[#2C2C2A]">
      Raahi<span className="text-[#534AB7]">.AI</span>
    </span>
  );
}

function Landing() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F1EFE8] text-[#2C2C2A]">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#D3D1C7] bg-[#F1EFE8]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden gap-8 text-sm text-[#5F5E5A] md:flex">
            <button onClick={() => scrollTo("how-it-works")} className="hover:text-[#2C2C2A]">How it works</button>
            <button onClick={() => scrollTo("who")} className="hover:text-[#2C2C2A]">Who it's for</button>
            <button onClick={() => scrollTo("proof")} className="hover:text-[#2C2C2A]">Stories</button>
          </nav>
          <Link
            to="/survey"
            className="rounded-full bg-[#534AB7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3C3489]"
          >
            Start for free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#AFA9EC] bg-[#EEEDFE] px-4 py-1.5 text-xs font-medium text-[#3C3489]">
          Career guidance for non-tech switchers
        </span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Your Personalised{"\u00a0"}
          <span className="text-[#534AB7]">Career Mentorship into Tech</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#5F5E5A]">
          Raahi is an AI mentor that learns who you are, suggests careers that actually fit, and
          walks you through it — week by week.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/survey"
            className="rounded-full bg-[#534AB7] px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#3C3489]"
          >
            Find my path →
          </Link>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="rounded-full border border-[#D3D1C7] bg-white px-7 py-3 text-base font-semibold text-[#2C2C2A] transition hover:border-[#AFA9EC]"
          >
            See how it works
          </button>
        </div>
        
      </section>

      {/* Language strip */}
      <section className="bg-[#EEEDFE]/40">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-6 py-6">
          <span className="text-xs uppercase tracking-wider text-[#5F5E5A]">Mentor speaks</span>
          {["English", "اردو", "हिंदी", "Hinglish", "বাংলা", "Filipino"].map((l) => (
            <span
              key={l}
              className="rounded-full border border-[#D3D1C7] bg-white px-4 py-1.5 text-sm text-[#2C2C2A]"
            >
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* Pain */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold md:text-4xl">Switching into tech is brutal alone.</h2>
        <p className="mt-3 max-w-2xl text-[#5F5E5A]">You're not lazy. The system just isn't built for you.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "No clear starting point", d: "You google 'how to get into tech' and drown in 40 tabs." },
            { t: "Bootcamps too expensive", d: "$15k for something you're not even sure fits you?" },
            { t: "Information overload", d: "Every YouTuber says learn something different. None of it sticks." },
            { t: "Fear of judgment", d: "Asking a 'dumb' question feels worse than not asking at all." },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-2xl border border-[#D3D1C7] bg-white p-6 transition hover:border-[#AFA9EC]"
            >
              <h3 className="text-lg font-semibold text-[#2C2C2A]">{c.t}</h3>
              <p className="mt-2 text-sm text-[#5F5E5A]">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who */}
      <section id="who" className="bg-white border-y border-[#D3D1C7]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#534AB7]">Who it's for</span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">The Lost Ambitious</h2>
          <div className="mt-8 rounded-3xl border border-[#AFA9EC] bg-[#EEEDFE] p-8 md:p-10">
            <div className="flex items-start gap-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#534AB7] text-2xl text-white">★</div>
              <div>
                <p className="text-lg italic leading-relaxed text-[#2C2C2A]">
                  "I have a degree, I'm hardworking, and I know tech is where the future is — but every
                  time I try to start, I freeze. I don't know if I should learn Python, design, data,
                  or product. I just need someone to tell me where to begin."
                </p>
                <p className="mt-4 text-sm font-medium text-[#3C3489]">— Graduate, 22–32, non-technical background</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold md:text-4xl">How Raahi works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: 1, t: "Tell us who you are", d: "10 quick questions. No fluff. We learn your background, interests, time, budget." },
            { n: 2, t: "Get 3 careers that fit", d: "Not generic lists — three paths matched to YOUR answers, with reasons." },
            { n: 3, t: "Build your roadmap", d: "Pick a path. Get a week-by-week plan with daily breakdowns." },
            { n: 4, t: "Walk it with a mentor", d: "Chat any time. Stuck, overwhelmed, confused — Raahi already knows you." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-[#D3D1C7] bg-white p-6">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#534AB7] font-bold text-white">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-[#5F5E5A]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof */}
      <section id="proof" className="bg-[#E1F5EE]/40 border-y border-[#D3D1C7]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">People are finding their path</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { q: "I'd been stuck for two years. In a week I knew exactly what to learn next.", n: "Aisha", r: "Sociology grad → UX research" },
              { q: "It actually replied in Hinglish. Felt like talking to my cousin who works at Google.", n: "Rahul", r: "Commerce grad → Data analyst" },
              { q: "The roadmap broke things down so small I couldn't make excuses anymore.", n: "Mariam", r: "English lit → Product manager" },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border border-[#D3D1C7] bg-white p-6">
                <p className="text-[#2C2C2A]">"{t.q}"</p>
                <div className="mt-4 border-t border-[#D3D1C7] pt-4">
                  <p className="text-sm font-semibold">{t.n}</p>
                  <p className="text-xs text-[#5F5E5A]">{t.r}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#534AB7]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Stop scrolling. Start moving.</h2>
          <Link
            to="/survey"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-[#534AB7] transition hover:bg-[#EEEDFE]"
          >
            Find my path →
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#D3D1C7]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-[#5F5E5A]">Built by Rida · Portfolio project · 2026</p>
        </div>
      </footer>
    </div>
  );
}
