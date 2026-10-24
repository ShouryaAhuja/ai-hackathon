# MEMORY.md - Project Memory (living document)

> Read first every session. Update after every task. Newest entries first in logs.

## 1. Current status
- **Phase:** 2 - Core build (MVP)
- **Selected problem:** **Q15 Gesture-Based Interface (confirmed via T0.8 GO)**.
- **Last completed task:** T3.2 (Create ml/analyze.py, ml/requirements.txt, confusion matrix, per_class.csv, condition_table.csv, threshold curve)
- **Next task:** T3.3 (Collect data: C1 baseline, C2 dim, C3 backlit, C4 cluttered — owner-driven)
- **Blockers:** none
- **Live URL:** https://shouryaahuja.github.io/ai-hackathon/
- **Last known-good tag:** v0.1-demo-safe

## 2. Project facts
- **Event:** VIT AI Innovate-A-Thon (School of CSE & IS, Dept. of Cybersecurity and Intelligent Systems)
- **Timeline:** build online 24 Oct 5:00 PM -> 25 Oct 9:00 AM (MS Teams); in-person presentation 25 Oct 9:00 AM-5:00 PM, SJT-G07
- **Team:** solo + Antigravity agent
- **Required deliverables:** working demo/recorded PoC, gesture-to-action mapping, evaluation table (correct + incorrect), **report file + PPT + demo**; show implemented vs planned; responsible-AI + SDG alignment; include failures
- **Judging:** Innovation & creativity; Functionality & implementation; UX & design; Technical complexity; SDG alignment & presentation
- **Stack:** Vite + React + TS + Tailwind; MediaPipe Gesture Recognizer (self-hosted, no CDN); Python analysis in `ml/`; GitHub Pages
- **No API keys exist in this project.** No backend.

## 3. Owner profile & preferences
- Beginner with AI tooling; solo. Wants a **high-quality, not rubbish** result; explain non-obvious steps briefly, give copy-paste commands.
- Free tools only. Tools: Antigravity IDE (primary), Antigravity App, VS Code + Copilot (fallback), Claude app (planning/review).
- Must be able to explain the pipeline in their own words during Q&A (camera -> landmarks -> classifier -> threshold -> dwell -> action).
- Model use: cheaper model for scaffolding; stronger model for core logic and evaluation; keep the strongest for one hard problem. Verify actual quotas in the IDE.

## 4. Decisions
| Date | Decision | Reason |
|---|---|---|
| 24 Oct | Q15 chosen, subject to T0.8 Go/No-Go | Memorable demo, fully in-browser, no API risk |
| 24 Oct | T0.8 GO — 5/5 gestures local, live URL verified, offline reload OK | Local camera test 5/5, live URL running, Pages deploy verified |
| 24 Oct | Self-host MediaPipe model + WASM in repo | Venue wifi risk; offline-capable |
| 24 Oct | Gesture map frozen in PRD section 6: FROZEN 24 Oct, pre-evaluation, per owner's local test | 5/5 gestures recognised in local test; no swaps needed |
| 24 Oct | Hold-to-confirm + neutral state + manual parity | Trust, accessibility, responsible AI |
| 24 Oct | Custom landmark classifier = stretch only | Depth upgrade after MVP + evaluation exist |
| 24 Oct | Amendment (pre-evaluation): ILoveYou -> Help added as 6th gesture | Reason: Help screen had no gesture path; ILoveYou unused and visually distinct. Owner reliability test passed. |

## 5. Gotchas (verify as you go)
- Camera needs HTTPS or localhost: GitHub Pages OK.
- Vite `base` must equal `/<repo>/`; load assets using `import.meta.env.BASE_URL`.
- Built-in gesture labels expected: `None, Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up, Victory, ILoveYou` - confirm in current docs.
- Mirror the preview (selfie view) but log true (unmirrored) handedness consistently.
- Stop camera tracks on unmount; handle permission denied and no-camera devices.
- Evaluation must separate sessions/conditions between tuning and testing (no leakage).
- Antigravity folder paths/model names mentioned earlier were not verified.

## 6. Evaluation tracking
| Item | Value |
|---|---|
| Thresholds (score / frames / dwell / cooldown) | 0.70 / 7 / 800 ms / 1200 ms (initial) |
| Conditions completed | none |
| Overall accuracy / neutral rate | - |
| False-trigger rate (per min) | - |
| Weakest gesture | - |
| Custom classifier vs pretrained | - |

## 7. Submission checklist (confirmed deliverables)
- **Official PS requirements:**
  1. Working demo or recorded PoC
  2. Gesture-to-action mapping
  3. Evaluation table showing correct and incorrect recognitions
- **Event guidelines requirements:**
  4. Report file (`docs/REPORT.md`)
  5. Presentation slides (PPT)
- **Deadlines & Venue:** Deadline 25 Oct 09:00, presentation at SJT-G07 from 09:00.
- [ ] Working demo / recorded PoC  - [ ] Gesture-to-action mapping  - [ ] Evaluation table  - [ ] Report file  - [ ] PPT  - [ ] Repo link  - [ ] Submitted before deadline (25 Oct 09:00 AM)

## 8. Session log
- `24 Oct 20:13` T3.2: Created ml/analyze.py and ml/requirements.txt (pandas, matplotlib, numpy). Python evaluation script reads trials.csv and generates docs/per_class.csv (precision/recall/F1/support), docs/confusion_matrix.png (annotated counts with NEUTRAL handling), docs/condition_table.csv (accuracy/neutral rate across C1-C4), and docs/threshold_curve.png (accuracy vs abstention curve across 0.5-0.9 thresholds). Verified syntax with python -m py_compile. Ready for owner-driven data collection (T3.3).
- `24 Oct 20:09` T3.1: Built Test Mode UI & empirical trial pipeline (src/testmode/). Pre-trial selection of true gesture (7 options: 6 mapped + None/other) and condition (C1-C4), 3s countdown, 5s live capture window, in-memory trial log with correct/neutral/incorrect verdict, CSV export (trials.csv) with zero image/frame storage. Added Test Mode button to Home and header (and key T). Unit tests for pure trial evaluation, CSV conversion, and metrics (57/57 pass). Lint/build pass.
- `24 Oct 19:13` T2.9: Production deployment verified on live GitHub Pages. GitHub Actions CI/CD completed successfully. Verified live HEAD checks on `/mediapipe/gesture_recognizer.task` and `/mediapipe/vision_wasm_internal.wasm` (HTTP 200). Tagged milestone release `v0.1-demo-safe` and pushed tags. Phase 2 (MVP) complete.
- `24 Oct 19:11` T2.8: Authored realistic, synthetic campus event content per DESIGN.md §9/§12. Schedule populated with 8 VIT AI Innovate-A-Thon sessions (times, venues, tags, interactive selection). Map built with detailed SVG rendering 5 campus buildings (SJT Block venue, MB Block, Tech Tower, Library, Anna Auditorium) with active building inspector. Help screen structured with comprehensive 6-gesture guide (+ fist lock), visual legend, troubleshooting guide, keyboard shortcuts, and organizing committee contacts. All buttons >= 72px tall. Tests pass (47/47).
- `24 Oct 19:09` T2.7: Implemented idle/lock and privacy features. Closed_Fist gesture and L key toggle gesture control lock (other gestures ignored while locked, clear LOCKED indicator displayed, manual controls remain active). Added Camera ON/OFF toggle in header and preview. Added required privacy notice ("Video is processed on your device and never stored or uploaded.") across footer and preview. Verified camera tracks fully stopped on unmount and stop. Tests pass (47/47).
- `24 Oct 19:05` T2.6: Implemented full manual parity per DESIGN.md §12. All 6 actions (Home, Schedule, Map, Help, Back, Confirm) rendered on every screen via a dedicated navigation bar with buttons >= 72px tall and keyboard shortcuts indicated. Contextual Back/Confirm buttons on all screens also >= 72px tall. Camera-off and permission-denied states display reassuring guidance banners while manual mode remains 100% operational. Unit tests expanded (47/47 pass).
- `24 Oct 18:59` T2.5: Built UI feedback suite per DESIGN.md §3/§12: ConfidenceMeter (live bar + %, teal-500 fill, amber when < 0.70 threshold), DwellRing (circular SVG filling over 800ms using dwellProgress), NeutralBanner (amber feedback on uncertain state), CameraPreview (mirrored in corner with canvas landmark overlay drawn without React re-render per frame and toggleable landmarks), and integrated status strip at bottom. Lint/format/tests clean (46/46).
- `24 Oct 18:42` MAP-AMEND-1: Pre-evaluation gesture map amendment: ILoveYou -> Help added as 6th gesture across PRD.md, config.ts, actions.ts, KioskShell legend, with unit tests in decision.test.ts and actions.test.ts.
- `24 Oct 18:28` T2.4: Wired DecisionEngine into App.tsx frame loop and connected emitted GestureEvents to kioskReducer. Mapped KioskAction compatibility in actions.ts, keyboard shortcuts and gestures unified under one dispatcher. 44/44 unit tests pass, lint passes, build passes.
- `24 Oct 18:14` T2.3: Built kiosk shell per DESIGN.md §12: Home/Schedule/Map/Help/Locked screens, responsive header, nav cards, permanent gesture legend, keyboard shortcuts.
- `24 Oct 18:13` T2.2: Created src/kiosk/actions.ts with Action enum, pure kioskReducer, keyboard shortcut mapper, and unit tests (40/40 tests).
- `24 Oct 18:11` T2.1: Created src/vision/decision.ts pure DecisionEngine (threshold, smoothing, dwell, cooldown, no-hand grace) + Vitest unit tests (19/19 tests).
- `24 Oct 18:03` T1.3: Confirmed submission deliverables in MEMORY.md section 7: (1) working demo/recorded PoC, (2) gesture-action mapping, (3) evaluation table (correct + incorrect), (4) report file, (5) PPT. Deadline 25 Oct 09:00, presentation at SJT-G07 from 09:00. Phase 1 complete.
- `24 Oct 18:01` T1.2: Created src/config.ts with frozen gesture-action map and decision parameters.
- `24 Oct 18:00` T1.1: Gesture-action map in PRD.md section 6 confirmed and marked FROZEN 24 Oct, pre-evaluation, per owner's local test (no swaps needed, 5/5 recognised). Logged in decisions.
- `24 Oct 17:58` T0.8 & T0.9: Logged T0.8 GO — 5/5 gestures local, live URL verified, offline reload OK (24 Oct). Phase 0 closed, tagged v0.0-skeleton.
- `24 Oct 17:52` T0.7: PS text verified by owner — matches PRD section 1, no changes needed. Local test: 5/5 gestures recognised. Live GitHub Actions deployment verified (run #40093162405 passed). Live HEAD requests to gesture_recognizer.task (200 OK, application/octet-stream) and vision_wasm_internal.wasm (200 OK, application/wasm) verified.
- `24 Oct 17:44` T0.6: Implemented minimal page with webcam stream, mirrored preview, live GestureRecognizer telemetry (label, confidence score, handedness, hands count) and landmark canvas overlay. Tested with Vite dev server and verified HTTP 200 on model & WASM.
- `24 Oct 17:38` T0.5: Installed @mediapipe/tasks-vision, copied WASM files to public/mediapipe/, downloaded official gesture_recognizer.task model (7.98MB). Added Section 11 Night protocol.
- `24 Oct` Docs rewritten for Q15. Awaiting Phase 0.

## 9. Open questions
- Exact submission deadline/format/portal?
- Is a live GitHub link mandatory?
- Venue equipment (projector, webcam, lighting)?

## 10. Next actions for the agent
1. Do Phase 0 in order; stop at T0.8 and report Go/No-Go evidence.
2. Never skip the live-URL check; never claim a gesture works without testing it.

## 11. Night protocol (24-25 Oct)
1. **SAFETY TAGS:** after every completed task create git tag `wip-<HHMM>` (24h local) and run `git push --tags`. Rollback = one command if something breaks.
2. **PARALLEL DELIVERABLES:** after T0.9, while owner tests on localhost, draft `docs/REPORT.md` skeleton (Problem & users, Architecture, Implementation, [RESULTS - placeholder], Responsible AI, SDG alignment, Implemented vs future work). Fill everything except results. Never block build tasks for this.
3. **EVALUATION SCOPE (owner decision):** 10 trials per gesture, 4 conditions (C1 baseline, C2 dim, C3 backlit, C4 cluttered). C5 distance and C6 second person only if time allows. State exactly what was tested.
4. **VIDEO:** when `v0.1-demo-safe` is tagged, owner records rough 2-min backup demo on phone.
5. **STALL RULE:** if a task stalls more than 15 minutes, STOP and report instead of trying more approaches.
6. **EXPLAIN-BACK:** after each task, report "What I built in plain English" (3-5 sentences) + "What would break if this module were removed" (1-2 sentences).
7. **TAG HYGIENE:** after the event, delete all `wip-*` tags (local + remote). Keep only `v*` milestone tags.
