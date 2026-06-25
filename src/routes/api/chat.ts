import { createFileRoute } from "@tanstack/react-router";

type Body = { systemPrompt?: string; userMessage?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const { systemPrompt, userMessage } = body;
        if (!systemPrompt || !userMessage) {
          return new Response(JSON.stringify({ error: "Missing fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              max_tokens: 2000,
              temperature: 0.7,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
            }),
          });
          if (!r.ok) {
            const txt = await r.text();
            return new Response(JSON.stringify({ error: "AI error", detail: txt }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          const data: any = await r.json();
          const content = data?.choices?.[0]?.message?.content ?? "";
          return new Response(JSON.stringify({ content }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e?.message ?? "Unknown" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
