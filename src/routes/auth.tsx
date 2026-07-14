import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
    <div className="min-h-screen bg-[#f5f0e0] text-[#064e3b]">
      <header className="border-b border-[#e2d4a8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            Raahi<span className="text-[#064e3b]">.AI</span>
          </Link>
          <Link to="/" className="text-sm text-[#4b6b60] hover:text-[#064e3b]">← Home</Link>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-[#4b6b60]">
          {mode === "login"
            ? "Sign in to pick up your roadmap where you left off."
            : "So Raahi can save your roadmap and mentorship context."}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-[#e2d4a8] bg-white p-1 text-sm">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-1.5 font-semibold ${mode === "login" ? "bg-[#064e3b] text-white" : "text-[#4b6b60]"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-1.5 font-semibold ${mode === "signup" ? "bg-[#064e3b] text-white" : "text-[#4b6b60]"}`}
          >
            Create account
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            setErr(null);
            setBusy(true);
            const result = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (result.error) {
              setErr(result.error.message || "Could not sign in with Google.");
              setBusy(false);
              return;
            }
            if (result.redirected) return; // browser navigates away
            navigate({ to: (redirect as any) || "/survey" });
          }}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[#e2d4a8] bg-white px-5 py-3 text-sm font-semibold text-[#064e3b] shadow-sm transition hover:bg-[#f5f0e0] disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.3 29.4 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.4 0-9.9-3.2-11.3-7.9l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 4.9l6.1 5c-.4.4 6.8-4.9 6.8-13.9 0-1.2-.1-2.4-.3-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-[#4b6b60]">
          <span className="h-px flex-1 bg-[#e2d4a8]" />
          or use email
          <span className="h-px flex-1 bg-[#e2d4a8]" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#064e3b]">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e2d4a8] bg-white px-3 py-2.5 text-sm focus:border-[#064e3b] focus:outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#064e3b]">Password</span>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e2d4a8] bg-white px-3 py-2.5 pr-16 text-sm focus:border-[#064e3b] focus:outline-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[#064e3b] hover:bg-[#e6f0eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064e3b]"
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
            className="w-full rounded-full bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#043326] disabled:opacity-40"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
