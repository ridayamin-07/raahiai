import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

/**
 * Client-side auth gate. Redirects to /auth if the user is not signed in.
 * Returns `{ ready, session }` so pages can hold rendering until known.
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
      if (!data.session) {
        navigate({ to: "/auth", search: { redirect: window.location.pathname } as any });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      if (!s) navigate({ to: "/auth", search: {} as any });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return { ready, session };
}
