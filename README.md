An AI-powered career mentorship platform designed for non-technical graduates across South and Southeast Asia — built to close the gap between "I have a degree" and "I know how to get a job in tech/AI."

The Problem

Most career guidance tools assume technical fluency or Western job-market context. Non-technical graduates in South/SE Asia — humanities, commerce, and social science majors — often have neither, and existing tools don't adapt to that starting point.

What It Does

Raahi.AI acts as a persistent AI mentor that:
Adapts guidance to a user's actual background (tested against Sara, an IR-graduate persona)
Remembers context across sessions instead of resetting every chat
Walks users through career direction-setting in a way that assumes no prior technical vocabulary

Tech Stack

Gemini 2.5 Flash — core LLM
Supabase — auth + database
Lovable — no-code app layer / prompt-driven development

Key Product Decision

Early testing surfaced a critical gap: the app had no authentication or session persistence, so every conversation started from zero. I implemented Supabase-based login and persistent cross-thread rolling context summaries (via Lovable prompt engineering) so the mentor actually "remembers" a user's situation across visits.

Validation

Tested with 6 real users; 5 reported it was genuinely useful. Findings and the full evaluation approach are documented in the case study linked below.

Full Documentation

This repo covers the implementation. The full product thinking — problem framing, evals rubric, failure modes table, guardrails spec, and a Mermaid diagram of the AI workflow — lives here:

📄 Case Study <!-- replace with your Notion/HTML link -->
🎥 Loom Walkthrough <!-- replace with your Loom link -->
📋 Full Portfolio <!-- replace with your portfolio hub link -->
About This Project

Built as part of a self-directed AI Product Management portfolio, applying a background in International Relations (systems thinking, empathy for non-obvious user contexts, cross-cultural communication) to AI product work.

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
