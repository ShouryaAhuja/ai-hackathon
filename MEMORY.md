# MEMORY.md - Project Memory (living document)

> Read first every session. Update after every task. Newest entries first in logs.

## 1. Current status
- **Phase:** 0 - Setup + Go/No-Go
- **Selected problem:** **Q15 Gesture-Based Interface (conditional on T0.8 Go/No-Go)**. Fallback: Q19 Water Quality (or Q11).
- **Last completed task:** T0.6 (minimal gesture recognition page with mirrored preview & telemetry)
- **Next task:** T0.7
- **Blockers:** none
- **Live URL:** https://shouryaahuja.github.io/ai-hackathon/  - **Last known-good tag:** none

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
| 24 Oct | Self-host MediaPipe model + WASM in repo | Venue wifi risk; offline-capable |
| 24 Oct | Gesture map frozen in PRD section 6 before formal evaluation | Official requirement: define before testing |
| 24 Oct | Hold-to-confirm + neutral state + manual parity | Trust, accessibility, responsible AI |
| 24 Oct | Custom landmark classifier = stretch only | Depth upgrade after MVP + evaluation exist |

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

## 7. Submission checklist (confirm exact rules first)
- [ ] Report file  - [ ] PPT  - [ ] Demo link/video  - [ ] Repo link  - [ ] Submitted before deadline (time: ASSUME 25 Oct 9:00 AM — owner to confirm exact deadline/format on Teams before 5 PM)

## 8. Session log
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
