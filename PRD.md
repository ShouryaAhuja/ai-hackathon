# PRD - Product Requirements Document

> Status: **DRAFT - waiting for problem statement.** Items marked `[FILL]` are completed once the statement arrives.
> Fixed sections (judging, constraints, quality bar) are already valid.

## 1. Overview
- **Project name:** `[FILL]`
- **One-line pitch:** `[FILL]` (format: "For <user>, <product> is a <category> that <key benefit>, unlike <alternative>.")
- **Problem statement (verbatim):** `[FILL - paste official text]`
- **Theme / track:** `[FILL]`
- **Live demo URL:** `https://<username>.github.io/<repo-name>/`
- **Repo:** `[FILL]`

## 2. Context & constraints (known now)
| Item | Value |
|---|---|
| Event | AI hackathon |
| Time | Problem statement released ~1-2 h from drafting; presentation next day |
| Build window | Short (aim: ~1 working day). Must reserve last 3-4 h for polish + pitch |
| Delivery | Public GitHub repo + **live link** (GitHub Pages) |
| Team | `[FILL: solo / team size, roles]` |
| Dev tools | Antigravity IDE (primary), VS Code + Copilot (fallback), Claude app (planning/review) |
| Budget | Free tiers only (no credit card) |
| AI/ML | Required in a meaningful way; ML optional depending on problem |

## 3. Users & problem
- **Target user / persona:** `[FILL]`
- **Pain point:** `[FILL]`
- **Current alternatives & why they fall short:** `[FILL]`
- **Why AI is the right tool here (not just a gimmick):** `[FILL]`

## 4. Goals & success criteria
**Hackathon success = judges can open the link and see the core idea work in under 2 minutes.**
- G1: One core flow works end to end, live, with real AI. `[FILL: define the flow]`
- G2: Clear, memorable demo narrative (problem -> solution -> live demo -> impact).
- G3: Looks polished and trustworthy (see `DESIGN.md`).
- G4: Technically credible: sensible architecture, handled failures, honest about limitations.

Typical judging criteria to design against (adjust when official rubric is known): **Innovation, Technical depth, Real-world impact/usefulness, Execution/polish & demo, Presentation.** `[FILL: official rubric]`

## 5. Scope
### Must have (MVP - the demo path)
1. `[FILL]` Core user flow: input -> AI processing -> useful, visible output
2. Landing/home view that explains the product in <10 seconds
3. Loading, error and empty states for the AI step
4. Pre-loaded example inputs (one-click demo) so judges don't need to think
5. Deployed on GitHub Pages and working on the live URL
6. README with demo link, screenshots, architecture

### Should have (only after Must is done and deployed)
- `[FILL]` e.g. history of results, export/share, comparison view, streaming output
- Explainability: show sources / reasoning / confidence
- Simple metrics view (latency, accuracy on eval set)

### Could have / Later (parking lot - do NOT build unprompted)
- Auth, accounts, databases, payments, multi-language, mobile app
- `[FILL]`

### Non-goals
- Production-grade scale, security hardening beyond basics, full test coverage, pixel-perfect cross-browser support.

## 6. Functional requirements
| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-1 | `[FILL] core action` | Must | `[FILL]` |
| FR-2 | Show AI result with clear formatting | Must | Result renders within target latency; failure shows friendly message |
| FR-3 | Demo/example inputs | Must | >=3 one-click examples produce good outputs |
| FR-4 | Mock/cached fallback mode | Must | App still demos if API is down/rate-limited, clearly labelled |
| FR-5 | AI-content disclosure | Must | UI states output is AI-generated and may be imperfect |
| FR-6 | `[FILL]` | | |

## 7. Non-functional requirements
- **Performance:** first load < 3 s on average connection; AI response feedback (spinner/stream) < 300 ms; full AI response target < 8 s (cache/mocks for demo).
- **Reliability:** graceful degradation; no unhandled exceptions visible to the user.
- **Security/privacy:** no secrets client-side; no personal data stored; synthetic/public data only.
- **Accessibility:** keyboard navigable, sufficient contrast, labelled inputs, responsive to mobile.
- **Compatibility:** latest Chrome/Edge/Safari/Firefox, desktop first, usable on mobile.
- **Cost:** $0 (free tiers).

## 8. AI/ML requirements
- **AI capability needed:** `[FILL: generation / classification / extraction / RAG / vision / speech / recommendation / forecasting]`
- **Model choice & rationale:** `[FILL]` (see `ARCHITECTURE.md` section 5)
- **Data:** source `[FILL]`, license `[FILL]`, size `[FILL]`
- **Quality metric:** `[FILL]` target `[FILL]`
- **Known risks:** hallucination, bias, latency, rate limits, prompt injection -> mitigations in `RULES.md` section 5

## 9. Demo & presentation plan
- **Demo script (2-3 min):** hook (problem, 20 s) -> live flow (90 s) -> "under the hood" slide (30 s) -> impact + next steps (30 s)
- **Backup plan:** screen recording + screenshots + mock mode
- **Pitch deck outline:** Problem - Solution - Demo - How it works - Impact - What's next - Team

## 10. Open questions
- [ ] Problem statement received? Any mandatory tech/API/dataset?
- [ ] Team size and roles?
- [ ] Official judging rubric and submission format/deadline?
- [ ] Is the live link mandatory to be GitHub Pages, or is any host acceptable?
