import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AppState = {
  userProfile: Record<string, any>;
  careerPath: string;
  rejectedPaths: string[];
  roadmap: any | null;
  currentWeek: number;
  completedTasks: string[];
  stuckStreak: number;
  executionMode: string;
  checkedInThisWeek: boolean;
  checkInResponse: string;
  chatSummary: string;
};

const DEFAULT_STATE: AppState = {
  userProfile: {},
  careerPath: "",
  rejectedPaths: [],
  roadmap: null,
  currentWeek: 1,
  completedTasks: [],
  stuckStreak: 0,
  executionMode: "",
  checkedInThisWeek: false,
  checkInResponse: "",
  chatSummary: "",
};

type Ctx = {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
  session: Session | null;
  authReady: boolean;
  signOut: () => Promise<void>;
};

const AppContext = createContext<Ctx | null>(null);
const KEY = "raahi.state";

function rowToState(row: any): AppState {
  return {
    userProfile: row.user_profile ?? {},
    careerPath: row.career_path ?? "",
    rejectedPaths: row.rejected_paths ?? [],
    roadmap: row.roadmap ?? null,
    currentWeek: row.current_week ?? 1,
    completedTasks: row.completed_tasks ?? [],
    stuckStreak: row.stuck_streak ?? 0,
    executionMode: row.execution_mode ?? "",
    checkedInThisWeek: row.checked_in_this_week ?? false,
    checkInResponse: row.check_in_response ?? "",
    chatSummary: row.chat_summary ?? "",
  };
}

function stateToRow(s: AppState) {
  return {
    user_profile: s.userProfile,
    career_path: s.careerPath,
    rejected_paths: s.rejectedPaths,
    roadmap: s.roadmap,
    current_week: s.currentWeek,
    completed_tasks: s.completedTasks,
    stuck_streak: s.stuckStreak,
    execution_mode: s.executionMode,
    checked_in_this_week: s.checkedInThisWeek,
    check_in_response: s.checkInResponse,
    chat_summary: s.chatSummary,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const dbLoadedForUser = useRef<string | null>(null);
  const saveTimer = useRef<any>(null);

  // Hydrate from sessionStorage (offline / pre-auth)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to sessionStorage
  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_OUT") {
        dbLoadedForUser.current = null;
        setState(DEFAULT_STATE);
        try { sessionStorage.removeItem(KEY); } catch {}
        try { sessionStorage.removeItem("raahi_checked_in_week"); } catch {}
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile from DB on sign-in
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    if (dbLoadedForUser.current === uid) return;
    dbLoadedForUser.current = uid;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) {
        console.error("[AppContext] load profile", error);
        return;
      }
      if (data) {
        setState(rowToState(data));
      } else {
        // trigger should have created it; upsert as a fallback
        await supabase.from("profiles").insert({ id: uid });
      }
    })();
  }, [session]);

  // Debounced save to DB when signed in and hydrated
  useEffect(() => {
    if (!hydrated) return;
    const uid = session?.user?.id;
    if (!uid) return;
    if (dbLoadedForUser.current !== uid) return; // wait for initial load
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("profiles")
        .update(stateToRow(state))
        .eq("id", uid);
      if (error) console.error("[AppContext] save profile", error);
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [state, session, hydrated]);

  // Sync check-in across screens / reset when week increments
  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored = sessionStorage.getItem("raahi_checked_in_week");
      const storedWeek = stored ? parseInt(stored, 10) : NaN;
      const matches = storedWeek === state.currentWeek;
      if (matches && !state.checkedInThisWeek) {
        setState((s) => ({ ...s, checkedInThisWeek: true }));
      } else if (!matches && state.checkedInThisWeek) {
        setState((s) => ({ ...s, checkedInThisWeek: false, checkInResponse: "" }));
      }
    } catch {}
  }, [hydrated, state.currentWeek, state.checkedInThisWeek]);

  const update = (patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch }));
  const reset = () => setState(DEFAULT_STATE);
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ state, update, reset, session, authReady, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
