import { createFileRoute } from "@tanstack/react-router";

type Body = { systemPrompt?: string; userMessage?: string; maxTokens?: number };

const MAX_PROMPT_CHARS = 50_000;
const MAX_MESSAGE_CHARS = 50_000;
const MAX_TOKENS_CAP = 8000;
const DEFAULT_MAX_TOKENS = 2000;

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
        const { systemPrompt, userMessage, maxTokens } = body;
        if (
          typeof systemPrompt !== "string" ||
          typeof userMessage !== "string" ||
          !systemPrompt ||
          !userMessage
        ) {
          return new Response(JSON.stringify({ error: "Missing fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (
          systemPrompt.length > MAX_PROMPT_CHARS ||
          userMessage.length > MAX_MESSAGE_CHARS
        ) {
          return new Response(
            JSON.stringify({ error: "Input too large" }),
            { status: 413, headers: { "Content-Type": "application/json" } },
          );
        }
        if (maxTokens !== undefined && typeof maxTokens !== "number") {
          return new Response(
            JSON.stringify({ error: "Invalid maxTokens" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const clampedMaxTokens = Math.min(
          Math.max(1, typeof maxTokens === "number" ? maxTokens : DEFAULT_MAX_TOKENS),
          MAX_TOKENS_CAP,
        );

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          console.error("[api/chat] Missing LOVABLE_API_KEY");
          return new Response(JSON.stringify({ error: "Service unavailable" }), {
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
              max_tokens: clampedMaxTokens,
              temperature: 0.7,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
            }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.error("[api/chat] Upstream AI error", r.status, txt);
            return new Response(
              JSON.stringify({ error: "Upstream AI service returned an error" }),
              { status: 502, headers: { "Content-Type": "application/json" } },
            );
          }
          const data: any = await r.json();
          const content = data?.choices?.[0]?.message?.content ?? "";
          return new Response(JSON.stringify({ content }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("[api/chat] Handler error", e);
          return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
