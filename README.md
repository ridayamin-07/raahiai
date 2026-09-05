***An AI-powered career mentorship platform that guides non-technical graduates from 'I don't know where to start' to personalized career recommendation, actionable roadmap, and an AI mentorship throughout the journey.***

**LOOM WALKTHROUGH**
https://www.loom.com/share/e27576791fae4a8abd71eb6be484abfb


→ **THE PROBLEM**

Non-technical graduates who want to break into tech run into two compounding problems:

1. They don't know where to begin.
2. Once they start, they have no personalized mentorship to guide them from learning theory to becoming job-ready.


→ **USER PERSONA - The Lost Ambitious**

> ***Fresh graduate with a non-technical degree in South or Southeast Asia.***
> 
***Core need:*** a clear, personalised starting point into tech with ongoing guidance. 

***Core frustration*:** every resource either assumes prior knowledge, costs money they don't have, or gives advice too generic to act on.


→ **THE SOLUTION - WHAT RAAHI DOES?**

- Raahi is a personalized AI career mentorship platform that takes a non-technical user from confusion to clarity in one session: generating a career recommendation, a week-by-week roadmap, and an AI mentor that already knows who they are before they type a word.

- Unlike generic tools that give the same advice to everyone, Raahi builds every output from the user's specific background, goals, constraints, and blockers, collected once through a 10-question survey and injected into every AI interaction that follows.


→ **TECH STACK**

- Gemini 2.5 Flash — core LLM
- Supabase — auth + database
- Lovable — no-code app layer / prompt-driven development


→ **AI WORKFLOW**

Three inputs enter the system: user profile, user message, and feature mode, and are assembled into one master prompt sent to Gemini. Two output types come back: structured JSON (rendered as UI) or prose (rendered as chat). State updates after every call, so each response is more contextual than the last.

<img width="2585" height="2916" alt="1  Raahi AI Workflow" src="https://github.com/user-attachments/assets/153931a3-1120-4ff4-98dc-3b0a70bffc98" />


→ **PROMPT ARCHITECTURE**

***One master system prompt*** powers every feature: recommendations, roadmap, mentorship, check-ins, and stuck diagnosis. The architecture has three layers injected into every single API call:

- **Identity layer:** Raahi's persona, tone rules, and hard constraints. Never changes regardless of feature or user.
- **User context layer:** full profile injected dynamically: background, career path, current week, completed tasks, blockers, stuck streak. The AI always knows who it's talking to before the user types a word.
- **Mode layer:** switches between recommendation, roadmap, mentorship, check-in, and stuck modes. Same brain, different behaviour.

***Three deliberate prompt decisions:***

- **JSON output format** for recommendations and roadmap enables dynamic UI rendering without parsing prose
- **Survey-reference rule:** Every recommendation reason must name something from the user's actual answers, preventing generic output
- **Language-match rule:** AI responds in whatever language the user writes in, delivering the language-flexibility promise at the model level not just the marketing level

***Why AI ?***

This problem cannot be solved with rules-based logic because 

- ***Personalisation*** at this depth requires understanding the relationship between a user's background, interests, constraints, and goals simultaneously, a rules-based system can route, it cannot reason
- The same career path needs a completely different explanation for an IR graduate versus a business graduate. AI generates that ***nuance*** dynamically, rules cannot encode it
- ***Stuck pattern detection*** across multiple weeks requires contextual memory and judgment recognising that two consecutive stuck weeks signal a pace problem, not just a task problem, is inference not logic
- ***Language flexibility*** cannot be rules-based, matching register, tone, and language to whatever the user writes in requires natural language understanding, not conditional logic


→ **DECISIONS WORTH KNOWING** 

- ***Why I cut CV builder, portfolio, interview prep from v1***
    
    Each cut feature depends on the core journey being validated first. An unvalidated foundation with 8 features is worse than a validated one with 4. Core value first. Everything else is downstream of that.
    
- ***Why Week 1 completion is the North Star, not sign-ups***
    
    Sign-ups prove marketing worked. Week 1 completion proves the product worked — it means the user trusted the recommendations, committed to the roadmap, and followed through on real tasks. One number validates the entire chain.
    
- ***Why Raahi speaks first in the chat screen***
    
    It demonstrates context awareness referencing the user's background, career path, and current week — breaking the generic AI feeling in the first sentence. And it creates a comfortable environment before any question is asked. A good mentor doesn't wait to be asked. They make it clear from the first moment that asking is safe.

- **Early testing surfaced a critical gap:** the app had no authentication or session persistence, so every conversation started from zero. I implemented Supabase-based login and persistent cross-thread rolling context summaries (via Lovable prompt engineering) so the mentor actually "remembers" a user's situation across visits.


→ **REAL USER TESTING**

Conducted live user testing, 5 of 6 users found Raahi useful, citing the 'roadmap mode' as most valuable.

One of the user sad:

> And to be honest, it is a great initiative. I really liked it. It gave me a lot of clarity about which fields I can pursue in tech field.
>


→ **KEY LEARNINGS**

1. Problem identification and problem definition are two different skills.
2. A focused product is not a compromise. It is a better product.
3. Metrics are not random. Every number is a deliberate choice.


**FULL DOCUMENTATION**

This repo covers the implementation. The full product thinking — problem framing, evals rubric, failure modes table, guardrails spec  lives here:

PRD: https://lovely-asterisk-eb3.notion.site/Raahi-AI-PRD-3bf818c33dd380d6bab3d9e955fdd785?source=copy_link

Case Study: https://lovely-asterisk-eb3.notion.site/Raahi-AI-Case-Study-3bf818c33dd3802b90e1efa22a4f76fe?source=copy_link 

Prompt Arcitecture: https://lovely-asterisk-eb3.notion.site/Raahi-AI-Prompt-Archiecture-3bf818c33dd38017b394d0600f955723?source=copy_link 

Failure Modes & Guardrails: https://lovely-asterisk-eb3.notion.site/Raahi-AI-Failure-Modes-Guardrails-3bf818c33dd380ce8bc8fb540ff2b1da?source=copy_link

Full Portfolio: https://lovely-asterisk-eb3.notion.site/Raahi-AI-AI-Tech-Career-Mentorship-Platform-c4f818c33dd382ea918d01aa6d2612a1?source=copy_link 


→ **ABOUT THIS PROJECT**
This project was built with Lovable (https://lovable.dev/dashboard).

**Live app**: https://raahiai.lovable.app 
