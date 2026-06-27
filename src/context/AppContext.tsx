import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
};

type Ctx = {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
};

const AppContext = createContext<Ctx | null>(null);
const KEY = "raahi.state";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  // Sync checkedInThisWeek across screens / reset when week increments
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

  return <AppContext.Provider value={{ state, update, reset }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
