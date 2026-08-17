import { useRouter, useRouterState } from "@tanstack/react-router";

export function NavArrows() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/") return null;

  const btn =
    "grid h-9 w-9 place-items-center rounded-full border border-[#e2d4a8] bg-white text-[#064e3b] shadow-sm transition hover:bg-[#e6f0eb] active:scale-95";

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <button
        type="button"
        aria-label="Go back"
        title="Go back"
        onClick={() => router.history.back()}
        className={btn}
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Go forward"
        title="Go forward"
        onClick={() => router.history.forward()}
        className={btn}
      >
        →
      </button>
    </div>
  );
}
