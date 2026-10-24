# AirTouch: Touchless Campus Information Kiosk
## Engineering Report & System Specification (Problem Q15)

**Event:** VIT AI Innovate-A-Thon (School of CSE & IS, Dept. of Cybersecurity and Intelligent Systems)  
**Timeline:** 24 October 2026, 5:00 PM — 25 October 2026, 9:00 AM  
**Venue Presentation:** SJT-G07, 25 October 2026  
**Repository:** [github.com/ShouryaAhuja/ai-hackathon](https://github.com/ShouryaAhuja/ai-hackathon)  
**Live Production URL:** [https://shouryaahuja.github.io/ai-hackathon/](https://shouryaahuja.github.io/ai-hackathon/)  
**Primary Deliverables:** Working Web Application, Self-Hosted On-Device ML Pipeline, Empirical Evaluation Suite (`ml/analyze.py`), Slide Deck, and Project Report.

---

## 1. Problem Statement & User Context

### 1.1 The Challenge (Q15)
Public information kiosks at campus events (such as orientation days, conferences, and technical symposiums) present persistent hygiene and usability friction:
1. **Hygiene & Public Health:** Physical touchscreens harbor bacteria and viruses, deterring users who are hygiene-conscious.
2. **Wear & Tear:** Public touchscreens rapidly degrade under heavy usage and outdoor campus conditions.
3. **Accessibility Barriers:** Users with wet hands, gloves, or certain physical limitations find traditional touchscreens frustrating or inoperable.
4. **False Triggers in Vision Systems:** Naive gesture interfaces often frustrate users by triggering unwanted navigation whenever a person casually moves their hands.

### 1.2 Target Users
- **Primary:** Event attendees, students, parents, and visiting dignitaries navigating campus schedules and maps.
- **Secondary:** Campus facilities and event organizers who need a low-maintenance, sanitary, and reliable public directory.

### 1.3 Value Proposition
AirTouch provides a *trustworthy*, touchless kiosk interface that recognizes seven distinct hand gestures directly in the client browser, displays live confidence telemetry, abstains into a safe neutral state when uncertain, enforces deliberate dwell times to eliminate accidental triggers, and maintains 100% manual parity via large touch buttons and keyboard shortcuts.

---

## 2. System Architecture & Design Principles

### 2.1 Architectural Overview
AirTouch is built with a client-only, zero-backend architecture. All computer vision inference, state transitions, and UI rendering occur in-browser.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AirTouch Client Kiosk                         │
│                                                                        │
│   Webcam Stream (640x480 @ 30 FPS, getUserMedia, Client-Side Only)    │
│                                │                                       │
│                                ▼                                       │
│   MediaPipe Vision WASM Runtime (Self-hosted in public/mediapipe/)     │
│   21-Point 3D Hand Landmark Extraction + Gesture Classification        │
│                                │                                       │
│                                ▼                                       │
│   Decision Engine Pipeline (src/vision/decision.ts)                    │
│   ├── Confidence Threshold Filter (Score >= 0.70; else NEUTRAL)        │
│   ├── Temporal Majority Filter (7-frame rolling buffer)                │
│   └── Dwell Timer & Cooldown Filter (800ms dwell, 1200ms cooldown)     │
│                                │                                       │
│                                ▼                                       │
│   Unified Action Dispatcher (src/kiosk/actions.ts)                     │
│   ▲                                                                    │
│   └── Manual Parity Inputs (Touch buttons >= 72px, Keyboard Shortcuts) │
│                                │                                       │
│                                ▼                                       │
│   Kiosk Screens: Home | Schedule | Campus Map | Help & Legend | Locked │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Architectural Principles
1. **Zero External Runtime Dependencies:** Models (`gesture_recognizer.task`, 7.98 MB) and WASM binaries (`vision_wasm_internal.wasm`, 13.52 MB) are self-hosted in `public/mediapipe/`. The app operates offline without external API keys or CDNs.
2. **Separation of Perception and Decision:** Raw computer vision labels are never directly bound to navigation. They pass through a pure, unit-tested decision engine (`src/vision/decision.ts`) ensuring verifiable stability.
3. **Full Manual Parity:** No user is trapped if vision conditions degrade. Physical touch buttons and keyboard shortcuts exist for every action.
4. **Zero Persistent Imagery:** Neither video frames nor facial/hand images are ever recorded, cached, or transmitted.

---

## 3. Implementation Details

### 3.1 Technology Stack
- **Framework:** React 19 + TypeScript (Strict Mode) + Vite
- **Styling & Design System:** Tailwind CSS, high-contrast palette (Teal-500 `#14b8a6` active fills, Amber-500 `#f59e0b` neutral warnings, Slate-950 `#020617` backdrop)
- **Computer Vision:** `@mediapipe/tasks-vision` (WebAssembly + WebGL GPU delegate with automatic CPU fallback)
- **Testing:** Vitest (59 unit tests covering reducer, decision engine, smoothing, metrics, and CSV serialization)
- **Evaluation Analytics:** Python 3.12 + pandas + matplotlib + numpy (`ml/analyze.py`)

### 3.2 Frozen Gesture-to-Action Mapping
The gesture mapping was frozen prior to formal empirical evaluation per PRD Section 6:

| # | Gesture Name | MediaPipe Label | Kiosk Action | Visual Feedback | Keyboard Fallback |
|---|---|---|---|---|---|
| 1 | Open Palm | `Open_Palm` | **Home** (return to main menu) | Dwell Ring + Teal Confidence | `H` or `Esc` |
| 2 | Pointing Up | `Pointing_Up` | **Schedule** (event timetable) | Dwell Ring + Teal Confidence | `S` |
| 3 | Victory (V) | `Victory` | **Campus Map** (SVG locator) | Dwell Ring + Teal Confidence | `M` |
| 4 | Thumbs Up | `Thumb_Up` | **Confirm / Select** | Dwell Ring + Teal Confidence | `Enter` |
| 5 | Thumbs Down | `Thumb_Down` | **Back / Cancel** | Dwell Ring + Teal Confidence | `Backspace` |
| 6 | I-Love-You | `ILoveYou` | **Help & Troubleshooting** | Dwell Ring + Teal Confidence | `?` |
| 7 | Closed Fist | `Closed_Fist` | **Lock Gesture Control** | Immediate Lock Indicator | `L` |
| - | Low Score / Other | `None` / `< 0.70` | **Neutral State (No Action)** | Amber Banner: "Not sure" | — |

### 3.3 Decision Engine Guardrails
- `SCORE_THRESHOLD = 0.70`: Rejects low-confidence inferences and unrecognized hands.
- `SMOOTHING_FRAMES = 7`: Majority voting across recent 7 video frames eliminates sensor jitter and hand transition noise.
- `DWELL_MS = 800`: Requires the user to hold the target pose steadily for 800 ms before dispatching.
- `COOLDOWN_MS = 1200`: Locks interaction for 1.2 seconds after an action to prevent double-triggering.
- `NO_HAND_RESET_MS = 300`: Gracefully resets in-progress dwell if a hand is momentarily occluded.

---

## 4. Quantitative Evaluation & Results

```
[RESULTS - PLACEHOLDER]
This section will be populated directly from empirical trial data collected via AirTouch Test Mode (src/testmode/)
and evaluated through ml/analyze.py.

Evaluation Protocol:
- Benchmark across four distinct environmental conditions:
  • C1: Baseline (optimal indoor lighting, plain background)
  • C2: Dim Light (low ambient illuminance)
  • C3: Backlit (strong backlight / silhouette)
  • C4: Cluttered (complex background with dynamic movement)
- Performance metrics evaluated per condition and per gesture:
  • True Positive Rate / Precision / Recall / F1-Score
  • Abstention Rate (percentage of frames safely mapped to NEUTRAL)
  • False Trigger Rate (accidental actions fired during non-gesture sessions)
  • Mean Inference Frame Latency (target < 30ms)
- Quantitative artifacts to be embedded:
  • docs/per_class.csv
  • docs/confusion_matrix.png
  • docs/condition_table.csv
  • docs/threshold_curve.png
```

---

## 5. Responsible AI, Privacy & Safety

### 5.1 Privacy by Design
- **Local Processing Only:** Camera video streams are ingested into transient HTML5 video memory and processed locally via client-side WebAssembly.
- **Zero Video / Image Storage:** No frames or face/hand imagery are saved in memory, local storage, cookies, or remote databases. Test mode records only scalar labels, scores, and timestamps.
- **Explicit User Control:** Prominent Camera ON/OFF toggle, persistent privacy disclaimer, and a dedicated `Closed_Fist` lock gesture that allows users to pause gesture recognition at will.

### 5.2 Honest AI & Safe Rejection (Neutral State)
Conventional vision prototypes often force a classification even when confidence is abysmal. AirTouch treats **uncertainty as a first-class UI state**:
- When confidence drops below 70%, the interface displays an amber feedback banner: *"Not sure — hold your hand steady or use the buttons"*.
- Actions never trigger on ambiguous inputs, preventing accidental navigation or catastrophic user frustration.

### 5.3 Accessibility Parity
Touchless interaction is not universally accessible for individuals with motor disabilities, tremors, or missing limbs. AirTouch adheres to accessibility parity:
- Every action has an on-screen button with a minimum touch target height of **72 px** (exceeding standard 48 px WCAG guidelines).
- Comprehensive keyboard navigation covers 100% of kiosk features.
- Semantic HTML and ARIA labels provide screen reader compatibility.

---

## 6. Sustainable Development Goals (SDG) Alignment

AirTouch aligns directly with four United Nations Sustainable Development Goals:

1. **SDG 3: Good Health & Well-Being (Target 3.3 & 3.9)**  
   *Hygiene in Public Spaces:* Eliminates physical contact with high-traffic touchscreens in campus venues, dining halls, and clinics, breaking disease transmission vectors without requiring single-use sanitary wipes or gloves.

2. **SDG 9: Industry, Innovation, and Infrastructure (Target 9.1 & 9.c)**  
   *Inclusive Edge-AI Computing:* Implements advanced vision AI without costly server infrastructure, expensive GPUs, or high-bandwidth cloud connections, democratizing smart kiosk deployments in educational institutions.

3. **SDG 10: Reduced Inequalities (Target 10.2 & 10.3)**  
   *Universal Interaction Modality:* Bridges physical interaction barriers for visitors with wet, dirty, or gloved hands, while preserving full manual touch and keyboard parity so that no user is excluded.

4. **SDG 11: Sustainable Cities & Communities (Target 11.7)**  
   *Accessible, Resilient Public Spaces:* Enhances campus navigation and public building usability through reliable, accessible, and touchless interactive infrastructure.

---

## 7. Implemented vs. Future Work

### 7.1 What Is Implemented & Production-Ready
- [x] Client-side real-time hand landmark tracking and gesture recognition (MediaPipe WASM).
- [x] 7 frozen gesture classes mapped to full kiosk navigation (Home, Schedule, Map, Help, Confirm, Back, Lock).
- [x] Three-stage decision guardrail: confidence thresholding (0.70), temporal smoothing (7 frames), dwell-to-confirm (800ms) with animated SVG Dwell Ring.
- [x] Safe rejection handling via first-class Neutral state and live feedback meter.
- [x] Full manual parity across every screen (buttons >= 72px, keyboard shortcuts).
- [x] Self-contained campus content: 8-session Schedule, 5-building interactive SVG Campus Map, comprehensive Help & Legend.
- [x] Test Mode UI (`src/testmode/`) with automated countdown, 5-second capture, CSV export with date-time naming, localStorage persistence, and `triggers_fired` telemetry.
- [x] Empirical evaluation script (`ml/analyze.py`) with multi-CSV loading, deduplication, confusion matrix visualization, condition breakdown, and threshold curve plotting.
- [x] Zero-backend deployment on GitHub Pages with automated CI/CD and self-hosted model assets.

### 7.2 Future Work (Post-Hackathon Roadmap)
- [ ] **Custom Landmark Classifier:** Train an on-device lightweight MLP / Random Forest directly on normalized 21-point landmark coordinates to compare against the pretrained recognizer.
- [ ] **Dynamic Gesture Support:** Continuous swipe gestures for smooth schedule scrolling and map zooming.
- [ ] **Multi-User Spatial Filtering:** Depth-based spatial clustering to ignore background bystanders and track only the primary user in front of the kiosk.
- [ ] **Adaptive Illumination Compensation:** Automated camera exposure and contrast adjustments when severe backlight or dim environments are detected.
