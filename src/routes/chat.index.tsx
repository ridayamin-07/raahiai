import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const { ready, session } = useAuthGuard();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !session) return;
    (async () => {
      const { data } = await supabase
        .from("chat_threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      let id = data?.[0]?.id as string | undefined;
      if (!id) {
        const inserted = await supabase
          .from("chat_threads")
          .insert({ user_id: session.user.id, title: "New chat" })
          .select("id")
          .single();
        id = inserted.data?.id;
      }
      if (id) navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
    })();
  }, [ready, session, navigate]);

  return (
    <div className="grid h-full place-items-center text-sm text-[#5F5E5A]">Loading your chats…</div>
  );
}
