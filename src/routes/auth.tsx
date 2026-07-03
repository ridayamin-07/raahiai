import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · Raahi.AI" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already signed in, bounce out
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (redirect as any) || "/survey" });
    });
  }, [navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!email.trim() || password.length < 8) {
      setErr("Enter your email and a password (8+ characters, avoid common ones).");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}${redirect || "/survey"}` },
      });
      if (error) setErr(error.message);
      else {
        // If email confirmation is disabled the session is created immediately.
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: (redirect as any) || "/survey" });
        else setMsg("Check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setErr(error.message);
      else navigate({ to: (redirect as any) || "/survey" });
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#F1EFE8] text-[#2C2C2A]">
      <header className="border-b border-[#D3D1C7]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            Raahi<span className="text-[#534AB7]">.AI</span>
          </Link>
          <Link to="/" className="text-sm text-[#5F5E5A] hover:text-[#2C2C2A]">← Home</Link>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-[#5F5E5A]">
          {mode === "login"
            ? "Sign in to pick up your roadmap where you left off."
            : "So Raahi can save your roadmap and mentorship context."}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-[#D3D1C7] bg-white p-1 text-sm">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-1.5 font-semibold ${mode === "login" ? "bg-[#534AB7] text-white" : "text-[#5F5E5A]"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-1.5 font-semibold ${mode === "signup" ? "bg-[#534AB7] text-white" : "text-[#5F5E5A]"}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#2C2C2A]">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#D3D1C7] bg-white px-3 py-2.5 text-sm focus:border-[#534AB7] focus:outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#2C2C2A]">Password</span>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#D3D1C7] bg-white px-3 py-2.5 pr-16 text-sm focus:border-[#534AB7] focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[#534AB7] hover:bg-[#ECEAF6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#534AB7]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {err && (
            <div className="rounded-lg border border-[#D85A30] bg-[#FAECE7] px-3 py-2 text-sm text-[#633806]">
              {err}
            </div>
          )}
          {msg && (
            <div className="rounded-lg border border-[#EF9F27] bg-[#FAEEDA] px-3 py-2 text-sm text-[#633806]">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[#534AB7] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3C3489] disabled:opacity-40"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
