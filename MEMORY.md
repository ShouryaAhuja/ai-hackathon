# MEMORY.md - Project Memory (living document)

> Read this first every session. Update after every task. Keep entries short, factual, dated.
> Newest entries at the top of each log. If this file grows past ~300 lines, summarise old entries.

## 1. Current status
- **Phase:** 0 - Setup (problem statement not yet received)
- **Last completed task:** T0.2
- **Next task:** T0.3
- **Blockers:** waiting for problem statement
- **Live URL:** `https://shouryaahuja.github.io/ai-hackathon/`
- **Last known-good tag:** none

## 2. Project facts
- **Project name:** `ai-hackathon`
- **Problem statement:** see `PRD.md`
- **Team:** `Shourya Ahuja`
- **Deadline / presentation time:** presentation next day `[FILL exact time]`
- **Tech decisions so far:** Vite + React + TS + Tailwind (proposed); GitHub Pages deploy (fixed); AI access pattern `[OPEN]`; LLM `[OPEN]`

## 3. Owner profile & preferences
- Owner is a **beginner** with AI tooling; explain non-obvious steps briefly, avoid jargon, give copy-paste commands.
- Prefers **free** tools only (no credit card).
- Tools available: **Antigravity IDE** (primary; agent panel Ctrl+L), Antigravity App, **VS Code + GitHub Copilot** (fallback), Claude app (planning/review).
- Keep setup minimal: do not introduce extra frameworks/tools/plugins unless they clearly save time for the demo.

## 4. Environment notes (verify, don't assume)
- Antigravity IDE customisation is file-based: `AGENTS.md` at repo root is expected to auto-load. Exact folder paths for skills/rules and model names mentioned earlier were **not verified** - check the IDE/docs if relying on them.
- Flash-class models are fast but weaker on long multi-file builds; switch to a stronger model for the main build if available.
- External repo/tool notes from earlier research (treat with caution): the `awesome-free-llm-apis` list is read-only reference, not a tool; GSD original repo reported archived (use a fork if ever needed); Impeccable (design skill) optional only for frontend polish; Ralph-loop idea (PRD + one task per iteration + progress file) is already adopted via `TASKS.md` + this file.

## 5. Decision log
| Date | Decision | Reason | Reversible? |
|---|---|---|---|
| (today) | Deploy as static site on GitHub Pages | Hackathon requires GitHub live link | No |
| (today) | Use 7 root-level md docs as agent context | Keep agent aligned, cheap to maintain | Yes |
| (today) | Default stack Vite + React + TS + Tailwind | Fast, simple Pages deploy | Yes, before Phase 2 |
| (today) | Mock/cached fallback mode is mandatory | Free APIs may fail during demo | No |

## 6. Gotchas & lessons (add as discovered)
- GitHub Pages is static: no server code; secrets can't live in the frontend. Use a serverless proxy or in-browser models.
- Vite needs `base: '/<repo-name>/'` or assets 404 on Pages. Use HashRouter to avoid refresh-404s.
- `VITE_*` env vars are bundled into public JS - never put secrets there.
- Free LLM tiers have tight rate limits; cache and debounce.

## 7. AI/ML tracking
| Item | Value |
|---|---|
| Provider / model | `[FILL]` |
| Prompt version | none yet |
| Eval set size / last score | none yet |
| Avg latency | `[FILL]` |
| Known failure cases | `[FILL]` |
| (ML) dataset / split / baseline / best metric | `[FILL]` |

## 8. Session log (newest first)
- `[2026-10-24 16:40]` T0.1 & T0.2: Initialized git repository with main branch and remote origin (ShouryaAhuja/ai-hackathon), added .gitignore and MIT LICENSE, committed 7 core workflow documents.
- Docs scaffolded (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY, AGENTS). No code yet. Awaiting problem statement.

## 9. Open questions
- Problem statement and any mandatory tech/data?
- Team size / roles?
- Official judging rubric?
- Is GitHub Pages mandatory, or is any hosted link acceptable?

## 10. Next actions for the agent
1. Do Phase 0 tasks in `TASKS.md` in order.
2. After the problem statement is pasted into `PRD.md`, run Phase 1, then update this file.
