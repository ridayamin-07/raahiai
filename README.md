# Raahi: Your Tech Path

# Build Raahi.AI — AI career mentorship web app

Build a complete multi-screen web app called Raahi.AI. It is an AI-powered career mentorship platform for non-tech graduates switching into tech careers.

Tech stack:

- React with Vite

- React Router v6 for navigation

- Tailwind CSS for styling

- No UI component library — build everything from scratch using Tailwind

- Fetch API for all HTTP requests

Color scheme (use these exact hex values throughout):

- Primary purple: #534AB7

- Purple light: #EEEDFE

- Purple dark: #3C3489

- Purple border: #AFA9EC

- Teal: #1D9E75

- Teal light: #E1F5EE

- Teal dark: #085041

- Coral: #D85A30

- Coral light: #FAECE7

- Amber light: #FAEEDA

- Amber border: #EF9F27

- Amber dark: #633806

- Text dark: #2C2C2A

- Text muted: #5F5E5A

- Background: #F1EFE8

- Border: #D3D1C7

- White: #FFFFFF

Typography:

Import Inter from Google Fonts. Use it everywhere.

Global state:

Create a React Context called AppContext that holds:

- userProfile: object (default {})

- careerPath: string (default "")

- rejectedPaths: array (default [])

- roadmap: object (default null)

- currentWeek: number (default 1)

- completedTasks: array (default [])

- stuckStreak: number (default 0)

- executionMode: string (default "")

Persist state to sessionStorage on every update.

Load from sessionStorage on app init.

AI utility (src/utils/ai.js):

Export two functions:

1. callAI(systemPrompt, userMessage)

POST to /.netlify/functions/chat

Body: { systemPrompt, userMessage }

Headers: { Content-Type: application/json }

Return data.content as string

On error return "ERROR: Could not reach AI. Please try again."

2. buildSystemPrompt(appState, mode)

Takes appState object and mode string.

Returns full system prompt string with these four sections:

IDENTITY: "You are Raahi — a warm, judgment-free AI career mentor for people switching from non-technical backgrounds into tech. You are a mentor, not a search engine. Every response must feel personal, not generic. You already know who the user is — never ask them to repeat survey information. Speak like a warm senior friend in tech. Never judge the user. Respond in whatever language the user writes in — Hinglish, English, Urdu, match their register exactly. Never use filler phrases like Great question or Certainly. Start every response with substance."

USER PROFILE: inject all appState fields as readable text

HARD RULES: "Never give generic advice. Never re-ask for survey info. Never suggest rejected paths. Never be preachy. Never more than 3 bullets in a row without prose. Always end with a next step or question. Acknowledge emotional distress before giving advice."

MODE: "You are currently in: [mode]"

Netlify function (netlify/functions/chat.js):

Serverless function that:

- Accepts POST with { systemPrompt, userMessage }

- Reads process.env.OPENAI_API_KEY

- POSTs to https://api.openai.com/v1/chat/completions

- Model: gpt-4o, max_tokens: 2000, temperature: 0.7

- Returns { content: response_text }

Also create netlify.toml:

[build]

  publish = "dist"

  functions = "netlify/functions"

Routes to build:

/ → Landing page (Landing.jsx)

/survey → Onboarding survey (Survey.jsx)

/recommendations → Career recommendations (Recommendations.jsx)

/roadmap → Personalised roadmap (Roadmap.jsx)

/choice → Execution mode choice (Choice.jsx)

/chat → Mentorship chat (Chat.jsx)

Build all 6 screens now with full UI. Details for each:

--- LANDING PAGE ---

Sticky nav: logo "Raahi.AI" (AI in purple), nav links, purple "Start for free" button → /survey

Hero: badge "Career guidance for non-tech switchers", h1 "Your personalised roadmap into tech", subtext, two buttons "Find my path →" (→/survey) and "See how it works" (scroll to #how-it-works), note "Free · No sign-up · 10 minutes"

Language strip below hero: light gray bg, show pills for English, اردو, हिंदी, Hinglish, বাংলা, Filipino

Pain section: 4 cards — No clear starting point, Bootcamps too expensive, Information overload, Fear of judgment

Who it's for section: persona card "The Lost Ambitious" with quote

How it works section (id="how-it-works"): 4 numbered steps

Social proof: 3 testimonial cards

CTA section: purple bg, big button → /survey

Footer: logo left, "Built by Rida · Portfolio project · 2026" right

--- SURVEY PAGE ---

Purple progress bar at top.

One question at a time. Back and Next buttons.

Next disabled if required question unanswered.

On Q10 completion show summary screen then route to /recommendations.

Save all answers to userProfile in AppContext.

10 questions:

Q1 single select: "What was your educational background?" — Social sciences/humanities | Business/commerce | Arts/design/media | Natural sciences | Something else → saves to background

Q2 multi select grid: "What kinds of activities genuinely energize you?" — Solving puzzles | Writing/storytelling | Researching/analyzing | Designing visuals | Data/patterns | Understanding people | Building things | Teaching → saves to interests[]

Q3 single select: "What is pulling you toward tech?" — Better income | Career growth | Genuine curiosity | Want to build impact | Not sure yet → saves to motivation

Q4 single select: "How much time can you dedicate per week?" — Less than 5hrs | 5-10hrs | 10-20hrs | 20+hrs → saves to timePerWeek

Q5 multi select grid: "How do you learn best?" — Videos | Reading articles | Hands-on projects | Structured plan | Trial and error | Having someone explain → saves to learningStyle[]

Q6 single select: "What is your budget?" — Free only | Up to $20/mo | $20-50/mo | $50+/mo → saves to budget

Q7 single select: "What is your timeline goal?" — 1-2 months | 3-6 months | 6-12 months | No deadline → saves to timeline

Q8 tag pills multi: "What has stopped you before?" — Did not know where to start | Not technical enough | Can't afford bootcamps | Overwhelmed by advice | No network | Fear of judgment | Did not know which field | Just starting → saves to blockers[]

Q9 single select: "Have you explored any tech skills?" — Zero experience | Tried a few things | Explored seriously | Have some skills → saves to skillLevel

Q10 free text optional: "Anything else you want us to know?" placeholder "e.g. I have always been drawn to how apps work..." → saves to additionalContext

--- RECOMMENDATIONS PAGE ---

On load: call buildSystemPrompt then callAI to get 3 career recommendations as JSON array.

Each item: career_path, match_score (60-95), why_this_fits (3 strings referencing survey answers), first_step (free task), time_to_job_ready.

Show loading state while calling.

Context strip at top showing user's background, motivation, timePerWeek.

3 recommendation cards: card 1 purple, card 2 teal, card 3 coral.

Each card: role icon + name + tags | match score % + colored bar | "Why this fits you" 3 bullets | "Your first step" box | "Choose this path" button + "Not for me" button.

Rejection: fade card, add to rejectedPaths, show regen button.

All 3 rejected: show amber friction warning before allowing regen.

Regeneration: re-call API with rejectedPaths excluded.

Selection: save careerPath, show confirmation block with "Build my roadmap →" → /roadmap.

Error state with retry button.

--- ROADMAP PAGE ---

On load: call AI to generate roadmap as JSON with phases, weeks, tasks, daily_breakdown, milestones.

Duration tabs: 1 month | 2 months | 3 months. Switching re-calls API.

Overall progress bar: Week X of Y · Z%.

Phases as accordion: colored dot (teal done, purple active, gray upcoming) + title + status badge. Active phase auto-expanded.

Week rows inside phases: circular checkbox + week title + 3 tasks + status tag ("This week" in purple bg).

Daily breakdown toggle: hidden by default, toggle shows 5 daily items per week.

Purple mentor CTA at bottom: "Stuck on this week? Ask your mentor ↗" → /chat.

After roadmap loads show inline choice: "Execute alone" or "AI mentor walks with me" → saves to executionMode → routes to /choice.

Error state with retry.

--- CHOICE PAGE ---

Two equal-weight cards side by side:

Left — "I'll do it myself": teal icon, traits list, "Independent learner" badge. On select: show good luck screen with v2 tools listed (CV generator, Portfolio builder, Interview prep, LinkedIn strategy). Note: "Changed your mind? Tap Start AI mentorship on your roadmap anytime."

Right — "AI mentor walks with me": purple icon, traits list, "Guided learning" badge. On select: show mentor intro message referencing user's background and career path. Button "Start mentorship →" → /chat. Button "View my roadmap first" → /roadmap.

Switch note below cards updates based on selection.

Save executionMode to AppContext.

--- CHAT PAGE ---

Sticky header: Raahi robot avatar + "Raahi — your AI mentor" + green status dot + "Week X of Y" button → /roadmap.

Purple context bar below header: shows background, career path, current week, timePerWeek.

Amber weekly check-in card at top of chat (first visit each week): "Week X check-in: You were supposed to complete [tasks] this week. How did it go?" with 3 buttons: Done it all | Partially done | Got stuck.

Welcome message from Raahi referencing user's background and career path.

4 entry point buttons in 2x2 grid: I'm stuck (on concept/task) | Explain a concept | I'm overwhelmed | Review my work.

Each button pre-fills a contextual message and sends to AI.

Free text input below with send button. Placeholder "Or type freely in any language..."

AI responses appear as chat bubbles.

Typing indicator (3 animated dots) while waiting for response.

Full conversation history maintained in local state.

Each AI call uses buildSystemPrompt with mode matching the entry point used.

Error handling: show error message in chat if AI call fails.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://raahiai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1e3538e9-5f1a-4524-bbbb-dc8885c594f8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
