# RULES.md - Engineering Rules

Act as a senior software engineer with applied AI/ML experience, building a hackathon project that must
be demoable from a **public GitHub live link**. Optimise for: **working demo > clean code > extra features.**

## 0. Prime directives
1. **Always have a working main branch.** Never leave `main` broken. Deploy-able at all times.
2. **One task at a time.** Take the first unchecked item in `TASKS.md`. Finish, verify, commit, then stop or continue.
3. **Scope discipline.** No feature that is not in `PRD.md` "Must have". Ideas go to `PRD.md` -> "Later", not into code.
4. **Simplest thing that works.** Prefer boring, well-known libraries. No new framework/dependency without a one-line justification in `MEMORY.md`.
5. **Ask when blocked, don't guess silently.** If a requirement is ambiguous and the cost of being wrong is high, ask. Otherwise choose a sensible default and log it in `MEMORY.md`.
6. **Never claim something works without running it.** Run the code/build/test and report the real result.

## 1. Security & secrets (GitHub public repo = everything is visible)
- **Never commit secrets.** API keys live in `.env` (gitignored) locally and in GitHub Actions Secrets / serverless env vars in prod.
- **Never put an API key in client-side code.** Anything in a browser bundle is public (including `VITE_*` / `NEXT_PUBLIC_*` vars). Call paid/keyed AI APIs only through a server-side proxy (serverless function), or use client-side/in-browser models.
- Commit `.env.example` with variable names and dummy values only.
- Add `.env*` (except `.env.example`) to `.gitignore` **before the first commit**. If a key leaks: revoke it immediately, don't just delete the commit.
- Validate and size-limit all user input; escape output; no `eval`, no `dangerouslySetInnerHTML` with model output unsanitised.
- Treat LLM output as **untrusted input** (prompt injection, malformed JSON, unsafe HTML).
- Don't send personal/sensitive data to third-party models. Use synthetic or public data for the demo. Check dataset/model licenses.

## 2. Code quality
- Language defaults: TypeScript (strict) for web; Python 3.11+ with type hints for backend/ML.
- Small functions, clear names, single responsibility. No dead code, no commented-out blocks, no stray `console.log`/`print` debugging in commits.
- Handle errors explicitly. No empty `catch`. Every network/AI call has: **timeout, error handling, user-visible failure state.**
- Config via environment/constants file, no magic numbers or hard-coded URLs scattered in code.
- Format/lint with the project's formatter (Prettier + ESLint / Ruff + Black). Run before each commit.
- Comments explain *why*, not *what*.

## 3. Testing & verification
- Write tests for core logic and AI-output parsing/validation (unit level). Don't chase coverage numbers.
- Before marking a task done: build passes, app runs, the feature is manually exercised once end to end.
- Keep a `smoke test` checklist (in `TASKS.md`) run before every deploy and before the presentation.
- Fix root causes; don't paper over failures with retries or try/except.

## 4. Git & deployment
- Branching: `main` is always deployable. Work on short-lived `feat/<name>` branches, or commit small directly to `main` if solo and tests pass.
- Commits: small, atomic, Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- Commit after **every** working task. Tag a known-good release (`v0.1-demo-safe`) before risky changes and before presenting.
- Deployment is via **GitHub Actions -> GitHub Pages** (see `ARCHITECTURE.md`). After each deploy, open the live URL and verify - do not trust a green CI alone.
- GitHub Pages gotchas to honour: correct `base` path (`/<repo-name>/`), use hash-based routing or a `404.html` SPA fallback, relative asset paths, case-sensitive filenames, no server-side code.
- Keep the repo small: no large model weights/datasets in git (use Git LFS, Hugging Face Hub, or release assets; hard limit ~100 MB/file, aim far below).

## 5. AI / LLM engineering rules
- **Provider abstraction.** All model calls go through one module (`src/ai/` or `app/ai/`) with a single interface. Swapping provider/model must be a config change, not a refactor.
- **Prompts are code.** Store prompts in versioned files (not inline strings); keep a `prompts/` folder; note the version in `MEMORY.md` when changed.
- **Structured outputs.** Request JSON, validate with a schema (Zod / Pydantic), repair-or-fallback on failure. Never `JSON.parse` raw model text unguarded.
- **Resilience.** Timeout, limited retries with backoff, graceful fallback message, and a **cached/mock mode** so the demo works if the API is down or rate-limited.
- **Cost & rate limits.** Free tiers are small. Cache identical requests, cap tokens, debounce user input, show loading state. Log token usage in dev.
- **Determinism for demo.** Low temperature for anything that must be repeatable; keep a set of pre-tested demo inputs with known good outputs.
- **Grounding & honesty.** Where applicable use retrieval/context so answers cite sources; show uncertainty; never present model output as verified fact. UI must disclose AI-generated content.
- **Safety.** Basic input filtering, output length limits, refusal-handling UX, and no secrets/system prompts leaked to the client.
- **Evaluate, don't vibe.** Maintain a tiny eval set (10-30 representative inputs, expected behaviour) in `evals/` and re-run after prompt/model changes. Record results in `MEMORY.md`.
- **Streaming UX** where possible; never leave the user staring at a blank screen.

## 6. ML rules (apply only if the project trains/uses a classical or custom model)
- **Baseline first** (rule-based or simple model) so improvements are measurable. Prefer pretrained/fine-tuned over training from scratch.
- Reproducibility: fixed random seeds, pinned `requirements.txt`, documented data source and preprocessing, saved config per run.
- Correct splits: train/val/test separated **before** any preprocessing that learns from data -> no leakage. Report the metric that matches the problem (not just accuracy); include a confusion matrix or error examples.
- Keep notebooks for exploration only; move reusable logic into `ml/` Python modules.
- **Deployment fit:** the live site is static. Pick one: (a) precompute results and ship JSON, (b) export to ONNX/TF.js/transformers.js and run in-browser, (c) host inference on a free service (Hugging Face Spaces / Cloudflare Workers / Render) and call it from the site. Decide in `ARCHITECTURE.md`.
- Mind model size and cold-start time for the demo; quantise if needed.
- Document limitations, dataset bias, and failure cases - judges value this.

## 7. Performance & reliability
- Page loads fast on a normal connection: lazy-load heavy assets, compress images, avoid giant bundles.
- No blocking the main thread with heavy compute (use workers for in-browser ML).
- Every async view implements **loading, empty, error, success** states.
- Test the **live URL** in an incognito window and on mobile before presenting. Have an offline backup (screen recording + screenshots).

## 8. Documentation
- `README.md` must contain: one-line pitch, live demo link, screenshot/GIF, features, tech stack, architecture diagram, how to run locally, env vars, limitations, team.
- Update `MEMORY.md` after every task. Keep it short and factual.

## 9. Definition of Done (per task)
- [ ] Code runs locally and in the production build
- [ ] Lint/format/tests pass
- [ ] Error + loading states handled
- [ ] No secrets or debug code committed
- [ ] `TASKS.md` ticked, `MEMORY.md` updated, committed
- [ ] (If user-facing) verified on the deployed URL

## 10. Things the agent must NOT do
- Rewrite large parts of working code unprompted or "refactor for fun" during a hackathon.
- Add dependencies, services, or accounts that need paid plans or credit cards.
- Delete or overwrite files without checking git status.
- Invent APIs, library functions, or config options - check the docs or the installed package.
- Hide failures or fake results (hard-coded outputs presented as live AI) without clearly marking them as mock/demo mode.

---

## 11. Q15-specific rules (gesture kiosk)
- **Privacy by design:** never upload, store or log camera frames. Test logs hold labels, scores, condition tags only. Show a privacy notice. Stop camera tracks when leaving the view.
- **Spec before testing:** the gesture-action map in `PRD.md` is frozen before the formal evaluation; any change after that must be logged in `MEMORY.md` and the evaluation re-run for the changed gesture.
- **No fake results:** evaluation numbers must come from logged trials in test mode. Never hard-code or estimate accuracy. Report failures and neutral/abstention rates.
- **No leakage:** tune thresholds on validation conditions/sessions; report on separate test conditions/sessions.
- **Safe interaction:** every gesture action requires dwell + cooldown; no destructive actions; manual parity for all actions; neutral state on low confidence.
- **Self-hosted assets:** no runtime CDN links. Verify offline reload before each deploy.
- **Pure logic is tested:** `decision.ts`, `smoothing.ts` and the kiosk reducer need unit tests (Vitest).
- **Performance guardrails:** camera <= 640x480, single recognizer instance, `requestAnimationFrame` loop, no React re-render per frame for landmarks (draw on canvas).
- **Explainability for Q&A:** keep `docs/HOW_IT_WORKS.md` (one page, plain English) updated as the pipeline changes so the owner can explain it.
