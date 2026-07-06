import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Menu, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat with Raahi · Raahi.AI" }] }),
  component: ChatLayout,
});

type Thread = { id: string; title: string; updated_at: string };

function ChatLayout() {
  const { ready, session } = useAuthGuard();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (!error && data) setThreads(data as Thread[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session) return;
    load();
  }, [session, load]);

  // Refresh list when active thread changes (title may have updated)
  useEffect(() => {
    if (session && activeId) load();
  }, [activeId, session, load]);

  const newChat = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: session.user.id, title: "New chat" })
      .select("id")
      .single();
    if (error || !data) return;
    setMobileOpen(false);
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  };

  const deleteThread = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    await supabase.from("chat_threads").delete().eq("id", id);
    const remaining = threads.filter((t) => t.id !== id);
    setThreads(remaining);
    if (activeId === id) {
      if (remaining[0]) navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
      else navigate({ to: "/chat" });
    }
  };

  if (!ready || !session) return null;

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-[#D3D1C7] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#D3D1C7]">
        <Link to="/" className="text-sm font-semibold text-[#2C2C2A]">← Raahi</Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded p-1 text-[#5F5E5A] md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        <button
          onClick={newChat}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#534AB7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#453ea0]"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading && <p className="px-3 py-2 text-xs text-[#5F5E5A]">Loading…</p>}
        {!loading && threads.length === 0 && (
          <p className="px-3 py-2 text-xs text-[#5F5E5A]">No chats yet. Start one!</p>
        )}
        <ul className="space-y-1">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <li key={t.id} className="group relative">
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  onClick={() => setMobileOpen(false)}
                  className={`block truncate rounded-lg px-3 py-2 pr-8 text-sm ${
                    isActive
                      ? "bg-[#EEEDFE] text-[#2C2C2A] font-medium"
                      : "text-[#3C3B37] hover:bg-[#F1EFE8]"
                  }`}
                >
                  {t.title || "Untitled"}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[#5F5E5A] opacity-0 hover:text-[#D85A30] group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full bg-[#F1EFE8]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-[#D3D1C7] bg-white px-3 py-2 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 text-[#2C2C2A]"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-[#2C2C2A]">Chats</span>
        </div>
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
