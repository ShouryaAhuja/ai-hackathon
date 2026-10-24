# TASKS.md

Rules for use: do the **first unchecked task only**. Mark `[x]` when done and verified. Add new tasks at the right phase; don't reorder
without noting why in `MEMORY.md`. Each task = small enough to finish and commit in 15-45 min.
Legend: `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked.

## Phase 0 - Setup (DO NOW, before the problem statement) ~30-45 min
- [x] T0.1 Create GitHub repo (public), clone locally, `git init` if needed, add `.gitignore` (node, python, `.env*`, OS files) and MIT license
- [x] T0.2 Copy these 7 docs into repo root (`AGENTS.md`, `RULES.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `TASKS.md`, `MEMORY.md`) and commit
- [x] T0.3 Scaffold Vite + React + TS app; set `base: '/<repo-name>/'`; use `HashRouter`
- [ ] T0.4 Add Tailwind, ESLint, Prettier; add `.env.example`
- [ ] T0.5 Add GitHub Actions workflow to build + deploy to Pages; enable Pages (Source: GitHub Actions)
- [ ] T0.6 Push a "Hello" page and **verify the live URL loads in incognito** (this de-risks deployment early)
- [ ] T0.7 Confirm the IDE agent can read `AGENTS.md` (ask it to summarise the rules) and can run `npm run build`
- [ ] T0.8 Create LLM provider account(s) / free API keys (at least 2 providers for redundancy); store only in local `.env`
- [ ] T0.9 (Optional) Create serverless proxy hello-world (Cloudflare Worker) and call it from the app; confirm CORS works from the Pages origin
- [ ] T0.10 Tag `v0.0-skeleton`

## Phase 1 - Scope & plan (first 15-30 min after problem statement)
- [ ] T1.1 Paste problem statement into `PRD.md`; note mandatory tech/data/rubric/deadline
- [ ] T1.2 Choose ONE core user flow that can be demoed end to end; write it as 3-5 steps in `PRD.md`
- [ ] T1.3 Fill `PRD.md` `[FILL]` fields: persona, pain, why AI, Must/Should/Later lists
- [ ] T1.4 Decide AI access pattern (A/B/C/D) and model/provider; update `ARCHITECTURE.md` ADR table
- [ ] T1.5 Decide visual direction + palette; update `DESIGN.md` tokens
- [ ] T1.6 Break the Must-have list into concrete tasks in Phase 2 below
- [ ] T1.7 Update `MEMORY.md` with decisions and project name; commit `docs: scope finalised`

## Phase 2 - Core build (MVP) - fill in after T1.6
- [ ] T2.1 Build `src/ai/client.ts` with provider interface, timeout, error type, mock mode
- [ ] T2.2 Define Zod schema(s) for model output; write prompt v1 in `prompts/`
- [ ] T2.3 Implement core flow backend/proxy/model call, test with 3 inputs in isolation
- [ ] T2.4 Build main workspace UI (input -> loading -> result) wired to real AI
- [ ] T2.5 Add loading, error, empty states
- [ ] T2.6 Add example inputs (>=3) with verified good outputs; cache them as mock fallback
- [ ] T2.7 Add AI-disclosure label and "Demo mode" badge
- [ ] T2.8 Build landing/hero explaining the product
- [ ] T2.9 `[FILL]` feature-specific tasks...
- [ ] T2.10 Deploy and verify core flow on the **live URL**; tag `v0.1-demo-safe`

## Phase 3 - Quality & AI evaluation
- [ ] T3.1 Create `evals/` with 10-20 representative inputs and expected behaviour; run and record results
- [ ] T3.2 Iterate prompt/model once or twice based on eval failures (log versions in `MEMORY.md`)
- [ ] T3.3 Add unit tests for output parsing/validation and key utilities
- [ ] T3.4 Handle edge cases: empty input, very long input, offensive/injection-style input, API failure, offline
- [ ] T3.5 (If ML) baseline vs final model comparison + metrics + model card
- [ ] T3.6 Basic accessibility and responsive pass (keyboard, contrast, mobile)

## Phase 4 - Should-have features (only if Phase 2 + 3 are done and deployed)
- [ ] T4.1 `[FILL]`
- [ ] T4.2 `[FILL]`

## Phase 5 - Polish & freeze (reserve last 3-4 hours before presenting)
- [ ] T5.1 **Feature freeze.** No new features after this point
- [ ] T5.2 Design polish using `DESIGN.md` section 10 checklist
- [ ] T5.3 README complete: pitch, live link, GIF/screenshots, architecture diagram, run locally, limitations, team
- [ ] T5.4 Remove debug code, unused deps, secrets scan (`git log -p | grep -i key`), check `.env` not committed
- [ ] T5.5 Final deploy; run **Smoke Test** below on live URL (desktop + phone, incognito)
- [ ] T5.6 Tag `v1.0-demo`; keep a second tab with the tagged build / local build as backup
- [ ] T5.7 Record a 2-3 min screen recording of the full demo as insurance; save screenshots

## Phase 6 - Presentation
- [ ] T6.1 Write demo script (time it, <= 3 min) and rehearse twice
- [ ] T6.2 Build slides: Problem - Solution - Live demo - How it works (architecture) - Impact - What's next - Team
- [ ] T6.3 Prepare answers: "Why AI?", "How accurate?", "What are the limits?", "How would it scale?", "What's novel?", "Cost?"
- [ ] T6.4 Pre-flight (30 min before): warm up proxy/service, test internet, test all demo inputs, close notifications, charge laptop, open backups

## Smoke test (run before every deploy and before presenting)
- [ ] Live URL loads in incognito, no console errors, assets load (no 404s)
- [ ] Refresh on a sub-route works (no 404)
- [ ] Core flow works with each example input; result is correct and well formatted
- [ ] Error state appears correctly when network is blocked/API fails
- [ ] Mock/demo mode fallback works and is labelled
- [ ] Mobile viewport usable
- [ ] No secrets visible in DevTools -> Sources/Network

## Parking lot (ideas - do not build unless promoted to a phase)
- 
