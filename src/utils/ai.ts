import type { AppState } from "@/context/AppContext";

export async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userMessage }),
    });
    if (!res.ok) return "ERROR: Could not reach AI. Please try again.";
    const data = await res.json();
    return (data?.content as string) ?? "ERROR: Could not reach AI. Please try again.";
  } catch {
    return "ERROR: Could not reach AI. Please try again.";
  }
}

function fmt(v: any): string {
  if (v == null || v === "") return "(not provided)";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "(none)";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function buildSystemPrompt(appState: AppState, mode: string): string {
  const p = appState.userProfile || {};
  const profileLines = [
    `Educational background: ${fmt(p.background)}`,
    `Interests / energizing activities: ${fmt(p.interests)}`,
    `Motivation for switching to tech: ${fmt(p.motivation)}`,
    `Time available per week: ${fmt(p.timePerWeek)}`,
    `Preferred learning styles: ${fmt(p.learningStyle)}`,
    `Budget: ${fmt(p.budget)}`,
    `Timeline goal: ${fmt(p.timeline)}`,
    `Past blockers: ${fmt(p.blockers)}`,
    `Current skill level: ${fmt(p.skillLevel)}`,
    `Additional context from user: ${fmt(p.additionalContext)}`,
    `Chosen career path: ${fmt(appState.careerPath)}`,
    `Rejected career paths (NEVER suggest these): ${fmt(appState.rejectedPaths)}`,
    `Current week in roadmap: ${appState.currentWeek}`,
    `Completed tasks so far: ${fmt(appState.completedTasks)}`,
    `Execution mode: ${fmt(appState.executionMode)}`,
  ].join("\n");

  return [
    `IDENTITY:\nYou are Raahi — a warm, judgment-free AI career mentor for people switching from non-technical backgrounds into tech. You are a mentor, not a search engine. Every response must feel personal, not generic. You already know who the user is — never ask them to repeat survey information. Speak like a warm senior friend in tech. Never judge the user. Respond in whatever language the user writes in — Hinglish, English, Urdu, match their register exactly. Never use filler phrases like Great question or Certainly. Start every response with substance.`,
    `USER PROFILE:\n${profileLines}`,
    `HARD RULES:\nNever give generic advice. Never re-ask for survey info. Never suggest rejected paths. Never be preachy. Never more than 3 bullets in a row without prose. Always end with a next step or question. Acknowledge emotional distress before giving advice.`,
    `MODE:\nYou are currently in: ${mode}`,
  ].join("\n\n");
}
