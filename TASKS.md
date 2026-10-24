# TASKS.md - Q15 Touchless Campus Kiosk (solo + agent)

Rules: do the **first unchecked task only**. Verify, commit, tick, update `MEMORY.md`.
Legend: `[ ]` todo, `[~]` doing, `[x]` done, `[!]` blocked. Timeboxes are targets; if a task overruns 2x, simplify and log it.
Deadline anchor: work backwards from the **official submission time (confirm: likely 25 Oct 9:00 AM)**. Sleep is a task - plan at least 4 hours.

## Phase 0 - Setup + GO/NO-GO (first ~60-75 min)
- [x] T0.1 (you) Create public GitHub repo; clone; enable Pages (Settings -> Pages -> Source: GitHub Actions) (done in pre-Q15 skeleton, verified live)
- [x] T0.2 Copy docs into repo root; `.gitignore` (node, python, `.env*`, `ml/data/raw/`); MIT licence; commit (done in pre-Q15 skeleton, verified live)
- [x] T0.3 Scaffold Vite + React + TS + Tailwind; `base: '/<repo>/'`; ESLint/Prettier; commit (done in pre-Q15 skeleton, verified live)
- [x] T0.4 GitHub Actions deploy workflow; push "Hello"; **(you) verify live URL in incognito** (done in pre-Q15 skeleton, verified live)
- [x] T0.5 Download MediaPipe model + WASM into `public/mediapipe/` (follow current docs); commit — TIP: WASM files ship inside the npm package; copy from node_modules/@mediapipe/tasks-vision/wasm/ into public/mediapipe/. Only the .task model file needs a one-time download.
- [x] T0.6 Minimal page: camera on, mirrored preview, live `label + score` text via GestureRecognizer
- [x] T0.7 Deploy; open **live URL**; test the 5 gestures (and Network -> Offline reload)
- [x] **T0.8 GO/NO-GO (30 min max):** GO if live URL runs, camera works, >= 4 of 5 gestures recognised clearly in your room. NO-GO -> switch to Q19 (tell me; I'll regenerate docs). Log decision in `MEMORY.md`
- [x] T0.9 Tag `v0.0-skeleton`

## Phase 1 - Freeze the spec (~20 min)
- [ ] T1.1 Confirm gesture-action map in `PRD.md` section 6 using T0.7 observations; swap any unreliable gesture now
- [ ] T1.2 Write `src/config.ts` (map + thresholds); fill project name, palette, kiosk content outline in PRD/DESIGN
- [ ] T1.3 Confirm submission requirements (report/PPT/video/link) and write them into `MEMORY.md`

## Phase 2 - Core build (target 3-4 h)
- [ ] T2.1 `decision.ts`: threshold -> neutral, smoothing, dwell, cooldown (pure) + Vitest unit tests
- [ ] T2.2 `actions.ts`: Action enum + dispatcher + kiosk state reducer; keyboard shortcuts
- [ ] T2.3 Kiosk shell: Home screen + header + nav; large, readable typography (DESIGN.md)
- [ ] T2.4 Wire gestures -> decision -> dispatcher; Home / Schedule / Map / Help / Back / Confirm work end-to-end
- [ ] T2.5 UI feedback: ConfidenceMeter, DwellRing, NeutralBanner ("Not sure - try again or use the buttons"), mirrored preview + landmark overlay toggle
- [ ] T2.6 Manual alternative: buttons for every action; works with camera off; camera permission-denied state
- [ ] T2.7 Idle/lock behaviour (optional fist lock); camera on/off; privacy notice
- [ ] T2.8 Sample campus-event content (schedule, map SVG, help text) - synthetic, realistic
- [ ] T2.9 Deploy; full smoke test on **live URL**; tag `v0.1-demo-safe`

## Phase 3 - Test mode + evaluation (target 2-3 h)
- [ ] T3.1 Test mode UI: pick true gesture + condition; auto-run N trials with countdown; log to memory; export CSV
- [ ] T3.2 `ml/analyze.py`: per-class precision/recall/F1, confusion matrix (incl. NEUTRAL), per-condition table, threshold curve
- [ ] T3.3 Collect data: C1 baseline, C2 dim, C3 backlit, C4 cluttered, C5 distance, C6 other person/hand (20 trials/gesture/condition; reduce if needed, record honestly)
- [ ] T3.4 False-trigger session (2 min of normal movement/talking) -> count accidental actions
- [ ] T3.5 Tune threshold/dwell on validation conditions only; report on test conditions; save figures to `docs/`
- [ ] T3.6 Write failure analysis: 3-5 concrete failures with cause (lighting, occlusion, similarity)
- [ ] T3.7 Tag `v0.2-evaluated`

## Phase 4 - Depth upgrade (ONLY if Phases 2-3 done and time remains; target <= 2 h)
- [ ] T4.1 "Record samples" mode -> landmarks CSV (no images)
- [ ] T4.2 `ml/train_classifier.py`: normalise landmarks; train LR/RF/MLP; session-based split
- [ ] T4.3 Compare vs pretrained on identical test set; table + discussion (report honestly)
- [ ] T4.4 Export weights JSON; integrate behind `Recognizer` interface with a settings toggle
- [ ] T4.5 Re-deploy and smoke-test

## Phase 5 - Polish, freeze, deliverables (reserve >= 3-4 h before deadline)
- [ ] T5.1 **FEATURE FREEZE**
- [ ] T5.2 UI polish per `DESIGN.md` section 10 + kiosk checklist; favicon/title/meta; no console errors
- [ ] T5.3 Accessibility pass: keyboard-only run, contrast, ARIA live, text size, reduced motion
- [ ] T5.4 README (pitch, live link, GIF, mapping table, evaluation summary, how to run, limitations)
- [ ] T5.5 **Report file** (problem, users, architecture, dataset/labels/split, evaluation incl. failures, responsible AI, SDG, implemented vs future)
- [ ] T5.6 **PPT** following official flow (7 sections)
- [ ] T5.7 **Record demo video** (2-3 min, full flow + one failure + manual mode); save locally and upload per submission rules
- [ ] T5.8 Secrets/debug cleanup; final deploy; run Smoke Test; tag `v1.0-demo`
- [ ] T5.9 Submit everything; confirm receipt; **screenshot proof**

## Phase 6 - Presentation prep (~1 h + sleep)
- [ ] T6.1 Demo script timed <= 3 min; rehearse twice (once with network off)
- [ ] T6.2 Q&A sheet: how does it work (pipeline in your own words), why MediaPipe, accuracy and limits, bias, privacy, why neutral state, what next, cost, what is implemented vs planned
- [ ] T6.3 Pre-flight checklist: laptop charged + charger, external USB light (if any), plain backdrop, camera permission pre-granted, offline build running, backup video open, notifications off, browser zoom set
- [ ] T6.4 Sleep. Seriously.

## Smoke test (every deploy)
- [ ] Live URL loads in incognito; no console errors; model + WASM load (no 404)
- [ ] Offline reload still recognises gestures
- [ ] Each of 5 gestures triggers correct action with dwell ring; neutral state appears for random hand shapes
- [ ] Manual buttons + keyboard perform every action; camera-denied path works
- [ ] Test mode logs and exports CSV
- [ ] Works at 1440 px and on phone-sized viewport (UI at least usable)

## Parking lot
- Swipe gestures, voice control, multiple hands, kiosk analytics
