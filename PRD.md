# PRD - Touchless Campus Kiosk (Q15: Gesture-Based Interface)

> Status: **Q15 selected, conditional on the Go/No-Go camera test (TASKS.md T0.8).** Fallback: Q19 (water quality) or Q11.
> Solo builder + Antigravity agent. Event: VIT AI Innovate-A-Thon.

## 1. Overview
- **Project name:** AirTouch
- **One-line pitch:** For visitors at campus events, AirTouch is a touchless information kiosk that recognises five hand gestures in the browser, shows its confidence, stays neutral when unsure, and always offers a manual alternative.
- **Problem statement (official, Q15):** A public information kiosk at a campus event should let visitors trigger a small set of basic actions without touching the screen. Build a webcam-based prototype recognising a clearly defined set of **at least five static hand gestures** (or use a public gesture dataset if webcam capture is not feasible). Static gestures only, not sign-language translation.
- **Live demo URL:** https://shouryaahuja.github.io/ai-hackathon/
- **Repo:** github.com/ShouryaAhuja/ai-hackathon

## 2. Context & constraints
| Item | Value |
|---|---|
| Event | AI Innovate-A-Thon, online build 24 Oct 5:00 PM to 25 Oct 9:00 AM (MS Teams); in-person presentation 25 Oct 9:00 AM-5:00 PM, SJT-G07, VIT |
| Team | **Solo + AI agent (Antigravity)** |
| Deliverables (official) | Working demo or recorded proof of concept, gesture-to-action mapping, evaluation table (correct and incorrect recognitions); plus **report file, PPT, demo** |
| Hosting | GitHub Pages (static) |
| Budget | $0, no credit card |
| Network risk | Venue wifi unreliable -> **everything self-hosted in the repo, no runtime CDN** |

## 3. Users & problem
- **Primary users:** Visitors at a campus event using a public kiosk (students, parents, guests).
- **Secondary:** Event organisers (want a hygienic, low-maintenance kiosk).
- **Pain:** Shared touchscreens are unhygienic, get worn out, and are unusable for some people (wet/gloved hands, mobility limits, queues). Touchless control helps but must not trap users when recognition fails.
- **Why AI:** Hand-pose recognition from a webcam is a perception problem that rules cannot solve; ML landmarks + classification makes it work in real time on a laptop.
- **Differentiator (our story):** *Trustworthy* gesture control: confidence is visible, uncertainty is a first-class state (neutral), accidental triggers are prevented (hold-to-confirm), accessibility is built in (manual alternative), and evaluation is honest (lighting/background/person tests with failures shown).

## 4. Goals & success criteria
- G1: Live demo works reliably on judges' request, offline-capable, with a recorded backup.
- G2: >= 5 gestures defined **before** testing, each mapped to a kiosk action.
- G3: Honest evaluation table across >= 4 conditions with per-class results and failure analysis.
- G4: Polished kiosk UI that looks like a real product, readable from 1-2 m.
- G5: Responsible-AI story: privacy (video never leaves device), bias/lighting limits, accessibility, human control.

Judging criteria (official): Innovation & creativity - Functionality & implementation - UX & design - Technical complexity - SDG alignment & presentation.

## 5. Scope
### Must have
1. Webcam capture + on-device hand-gesture recognition (MediaPipe Gesture Recognizer, self-hosted)
2. **Gesture-to-action mapping** (section 6), defined up front and shown on screen
3. **Confidence indicator** (live bar + percentage) and **neutral state** below threshold
4. **Hold-to-confirm** (dwell ~0.8 s ring) + temporal smoothing to prevent accidental triggers
5. **Manual alternative:** on-screen buttons + keyboard shortcuts for every action (full parity)
6. Kiosk content: 4-5 screens (Home, Schedule, Map, Help, Confirm/Back) with sample campus-event data
7. **Test mode:** log predicted vs true gesture + condition label; export CSV; confusion matrix + per-class scores
8. Evaluation across conditions (lighting, background, distance, second person) with failures documented
9. Privacy notice ("video is processed on your device and never stored or uploaded") and camera on/off control
10. Deployed on GitHub Pages; recorded backup demo video; README, report, PPT

### Should have (only after Must is deployed)
- **Custom landmark classifier** trained on own samples, compared against the pretrained recogniser (the technical-depth upgrade)
- Per-condition threshold tuning shown in evaluation
- Audio/visual feedback on trigger (sound toggle), high-contrast mode, large-text mode
- Left- and right-hand support results reported separately

### Later (do NOT build unprompted)
- Dynamic gestures / swipes, sign-language, multi-hand, multi-user, remote analytics, voice control

### Non-goals / honesty statements
- Not sign-language translation. Not a security/authentication system. No live integration with any real kiosk hardware (simulated kiosk UI in browser). Do not claim performance beyond what the evaluation shows.

## 6. Gesture-to-action mapping (DEFINED BEFORE TESTING - freeze this)
FROZEN 24 Oct, pre-evaluation, per owner's local test.

| # | Gesture | MediaPipe label | Kiosk action | Notes |
|---|---|---|---|---|
| 1 | Open palm | `Open_Palm` | **Home** | Also "wake" from idle |
| 2 | Pointing up | `Pointing_Up` | **Open Schedule** | |
| 3 | Victory (V sign) | `Victory` | **Open Campus Map** | |
| 4 | Thumbs up | `Thumb_Up` | **Confirm / Select** | |
| 5 | Thumbs down | `Thumb_Down` | **Back / Cancel** | |
| 6 | I-love-you sign | `ILoveYou` | **Help** | Added 24 Oct pre-evaluation amendment - see MEMORY.md |
| (opt) 7 | Closed fist | `Closed_Fist` | **Pause gesture control (lock)** | Optional; frees user from accidental triggers |
| - | Anything else / low confidence | `None` / below threshold | **Neutral: no action** | Shown explicitly as "Not sure - try again or use buttons" |

> Verify the exact built-in label list against the current MediaPipe docs on day one. If a label is unreliable in testing, swap the gesture **before** the formal evaluation, and record the change in `MEMORY.md`.

## 7. Functional requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-1 | Start/stop camera with explicit user permission | Permission prompt handled; denial shows friendly message + manual mode |
| FR-2 | Recognise 5 mapped gestures in real time | >= 15 FPS on dev laptop; label + confidence updated live |
| FR-3 | Confidence threshold (default 0.7, tunable) | Below threshold -> neutral state, no action |
| FR-4 | Smoothing + dwell | Action fires only if same gesture stable >= N frames and held ~0.8 s; progress ring visible |
| FR-5 | Cooldown after action | No repeated trigger within ~1.2 s |
| FR-6 | Manual parity | Every action available by button + keyboard; works with camera off |
| FR-7 | Test mode | Choose true gesture + condition; record N trials; export CSV; show confusion matrix/per-class P/R |
| FR-8 | Mirrored preview with landmarks overlay | Optional toggle; helps users self-correct |
| FR-9 | Accessibility | Keyboard-only usable, ARIA live announcements of actions, high contrast, text size control |
| FR-10 | Works offline after first load | Models + WASM served from repo; verified with network disabled |

## 8. Non-functional requirements
- **Latency:** gesture-to-feedback < 300 ms perceived. **FPS:** >= 15 on a mid laptop.
- **Privacy:** no frames stored or transmitted; no analytics; test logs contain labels only.
- **Reliability:** graceful degradation to manual mode; recorded backup demo.
- **Compatibility:** latest Chrome/Edge (primary), Firefox/Safari best-effort. Camera needs HTTPS (GitHub Pages satisfies).
- **Cost:** $0. No API keys anywhere in this project.

## 9. AI/ML requirements
- **Capability:** on-device hand landmark detection + static gesture classification.
- **Model A (baseline, pretrained):** MediaPipe Gesture Recognizer (`.task` model file, self-hosted).
- **Model B (stretch):** small classifier (logistic regression / MLP / random forest) on normalised 21-point hand landmarks from our own collected samples; compared against Model A on the same held-out test set.
- **Data:** self-collected, consent from participants (self + any helper), labelled by gesture and condition; no faces stored (landmarks only for Model B; raw frames not kept).
- **Split:** by session/condition to avoid leakage (e.g. train on conditions 1-3, test on unseen condition + unseen person).
- **Metrics:** per-class precision/recall/F1, confusion matrix, neutral-rate (abstentions), **false-trigger rate** (actions per minute with no intentional gesture), median latency.
- **Risks:** lighting, backgrounds, skin-tone/hand-size bias, partial occlusion, handedness, similar poses (Pointing_Up vs Open_Palm transitions) -> mitigations: threshold, smoothing, dwell, neutral state, manual alternative, honest reporting.

## 10. Evaluation plan (drives the official evaluation table)
| Condition | Variation |
|---|---|
| C1 | Baseline: good indoor light, plain background |
| C2 | Dim light |
| C3 | Backlit (window/lamp behind) |
| C4 | Cluttered background |
| C5 | Distance: ~0.5 m vs ~1.5 m |
| C6 | Different person (if available) / other hand |
- 20 trials per gesture per condition (target; reduce to 10 if time-limited, state it honestly).
- Report: table of correct / incorrect / neutral per gesture per condition; confusion matrix; 3-5 annotated failure examples; threshold sensitivity (accuracy vs abstention curve).

## 11. Responsible AI & SDG alignment
- **Privacy:** local processing, no storage, visible camera indicator, consent notice.
- **Bias/fairness:** report performance across lighting, hand, skin-tone range available to us; state we could not cover everything.
- **Human control:** neutral state, dwell, cooldown, lock gesture, manual alternative; no irreversible actions.
- **Accessibility:** touchless is not accessible for everyone - hence full manual parity, keyboard use, large targets.
- **SDGs:** SDG 3 (hygiene/health, touchless), SDG 9 (innovation/inclusive infrastructure), SDG 10 (reduced inequalities via accessible interaction), SDG 11 (inclusive public spaces).
- **Implemented vs future:** state clearly: implemented = [list at the end]; future = dynamic gestures, multi-user, real kiosk hardware, larger and more diverse dataset.

## 12. Demo & presentation plan
- **Demo (<= 3 min):** hook (hygiene/accessibility, 20 s) -> live gestures + neutral state + hold ring (60 s) -> manual alternative (15 s) -> evaluation table + one failure (45 s) -> responsible AI + future (30 s).
- **Judge participation:** hand the camera to a judge for 20 seconds.
- **Backup:** recorded video + screenshots + offline local build.
- **Slides (follow official flow):** Problem/users - Idea/innovation - Architecture - Demo - Testing/results/limits - Responsible AI + SDG - Implemented vs planned.

## 13. Open questions
- [ ] What exactly must be submitted by 25 Oct 9:00 AM (report/PPT/demo link/video)? Format and portal?
- [ ] Is a live GitHub link mandatory, or is any demo acceptable? (Plan assumes live link.)
- [ ] Will the in-person venue have a webcam/projector? Bring own laptop + external light?
