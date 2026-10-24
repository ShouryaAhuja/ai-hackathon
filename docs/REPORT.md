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

### 4.1 Empirical Evaluation Overview
AirTouch was formally evaluated across **324 unique trials** using the built-in Test Mode (`src/testmode/`), and quantitatively analyzed using `ml/analyze.py`. In compliance with the frozen evaluation protocol, the operating threshold was held strictly at `SCORE_THRESHOLD = 0.70`.

Testing was conducted across four distinct, realistic environmental conditions rather than idealized laboratory settings:
- **C1 (Baseline):** Normal indoor light with mild background clutter (newspapers on desk).
- **C2 (Dim Light):** Overhead lighting turned off, low ambient light level.
- **C3 (Backlit):** Desk lamp positioned directly behind the user, generating high optical contrast and hand silhouettes.
- **C4 (Heavy Clutter):** Complex, layered background containing newspapers, boxes, and clothing.
- **Handedness & Orientation:** Alternating left/right hand in C1–C2, consistent dominant hand in C3–C4. Victory was tested with front-facing palmar orientation.

### 4.2 Overall Performance Summary
- **Total Unique Trials:** 324 (Note: the 78.70% overall system accuracy figure includes the 40 No-Gesture trials, where safely predicting NEUTRAL is evaluated as correct).
- **Overall System Accuracy:** **78.70%** (255 / 324 correct across all trials)
- **Neutral Abstention Rate:** **21.30%** (69 / 324 safely abstained into `NEUTRAL`)
- **Gesture Reliability:** No 5-second steady hold was majority-labelled as the wrong gesture: 0 misreads in 284 gesture trials, with a 95% confidence upper bound near 1% (rule of three).
- **Idle False Triggers:** 0 triggers in 200 seconds of idle observation; upper bound ~0.9 per minute at 95% confidence.
- **Mean Frame Inference Latency:** **93.3 ms**

#### Gesture-Only Results (Excluding Idle No-Gesture Trials)
| Metric | Value |
|---|---|
| Gesture trials | 284 |
| Recognised correctly | 215 (75.7%) |
| Safely abstained | 69 (24.3%) |
| Misread as a different gesture | 0 of 284 |
| No-Gesture trials correctly rejected | 40 of 40 |
| Triggers during 200 s idle | 0 (<=0.9/min, 95% CI upper bound) |

### 4.3 Condition Breakdown Table (`docs/condition_table.csv`)

| Environmental Condition | Total Trials | Correct | Neutral (Abstained) | Errors | False Triggers | Accuracy (%) | Neutral Rate (%) | Mean Latency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **C1: Baseline (mild clutter)** | 80 | 64 | 16 | 0 | 0 | **80.0%** | 20.0% | 94.6 ms |
| **C2: Dim Light** | 84 | 74 | 10 | 0 | 0 | **88.1%** | 11.9% | 95.9 ms |
| **C3: Backlit (lamp silhouette)** | 80 | 48 | 32 | 0 | 0 | **60.0%** | 40.0% | 88.5 ms |
| **C4: Heavy Clutter** | 80 | 69 | 11 | 0 | 0 | **86.2%** | 13.8% | 94.0 ms |
| **ALL CONDITIONS (Combined)** | **324** | **255** | **69** | **0** | **0** | **78.7%** | **21.3%** | **93.3 ms** |

### 4.4 Per-Class Precision, Recall & F1-Score (`docs/per_class.csv`)

| Gesture Class | Kiosk Action | Precision | Recall | F1-Score | Support | Abstentions | Notes |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| `Open_Palm` | Home | 1.000 | 0.302 | **0.464** | 43 | 30 | Our most natural gesture is our least reliable (30 of 43 trials abstained, 30% recall); the safe fallback means users get the button, not a wrong action. Raw scores clustered at 0.53-0.69, all safely below the 0.70 threshold. |
| `Pointing_Up` | Schedule | 1.000 | 0.775 | **0.873** | 40 | 9 | Robust; occasional silhouette dropout in C3 |
| `Victory` | Campus Map | 1.000 | 0.925 | **0.961** | 40 | 3 | High reliability when palm faces lens |
| `Thumb_Up` | Confirm | 1.000 | 0.600 | **0.750** | 40 | 16 | C3 backlight occluded thumb silhouette |
| `Thumb_Down` | Back | 1.000 | 0.750 | **0.857** | 40 | 10 | High precision; C3 backlighting caused abstentions |
| `ILoveYou` | Help | 1.000 | 1.000 | **1.000** | 41 | 0 | Strongest gesture: 100% precision & recall across all conditions |
| `Closed_Fist` | Lock | 1.000 | 0.975 | **0.987** | 40 | 1 | Exceptional clutter and dim-light resistance |
| `None` (Idle) | Neutral | 0.367 | 1.000 | **0.537** | 40 | 0 | Correctly rejected (40/40 trials stayed neutral) |
| **Macro Average** | — | **0.921** | **0.791** | **0.804** | 324 | 69 | — |
| **Weighted Average** | — | **0.922** | **0.787** | **0.801** | 324 | 69 | — |

### 4.5 Key Observations & Threshold Sensitivity
1. **Zero Accidental Actions:** No 5-second steady hold was majority-labelled as the wrong gesture: 0 misreads in 284 gesture trials, with a 95% confidence upper bound near 1% (rule of three). In idle observation, there were 0 triggers in 200 seconds of idle observation; upper bound ~0.9 per minute at 95% confidence.
2. **First-Class Neutral State:** When recognition degraded in C3 (backlit condition), the system safely abstained 40.0% of trials into `NEUTRAL`, never triggering an unintended navigation.
3. **Threshold Sensitivity Analysis:** Plotting performance across operating thresholds ($0.50 \le \tau \le 0.90$, see `docs/threshold_curve.png`) demonstrated that lowering the threshold from 0.70 to a Post-hoc Sensitivity Point of $\tau=0.60$ shifts overall accuracy to **91.7%** (abstentions drop to 8.0%) with only a 0.3% error rate. $\tau=0.60$ is a post-hoc observation from already-collected data, not an achieved result. The evaluation threshold remains the pre-registered $\tau=0.70$. Validating 0.60 would require fresh data collected after this freeze.
   *Note: the threshold curve is approximate — the CSV stores one aggregated score per trial, not frame-level scores, so this is a reconstruction rather than a frame-level re-run.*
4. **Detailed Failure Analysis:** See [docs/FAILURE_ANALYSIS.md](file:///d:/work/AI_Hackathon/docs/FAILURE_ANALYSIS.md) for root-cause analyses on `Open_Palm` sub-threshold clustering, C3 backlight silhouette blindness, thumb occlusions, and Victory angle sensitivity.

### 4.6 Limitations & Threats to Validity
- **Sample Scope:** One participant, one recording session, 10 trials per cell; trials are not independent (numbers are indicative rather than population-level statistical claims).
- **Environmental Confounds:** C3 combined backlighting with desk clutter; C1 had mild newspaper clutter rather than a pristine backdrop.
- **Gesture Protocol Scope:** Fist was evaluated primarily across C1 and C4 in targeted scope trials (though 10 trials per cell were recorded, evaluation scope focused on C1 and C4).
- **Interaction Variables:** Handedness was not controlled in C1/C2 (alternating hands); distance (~0.5m vs 1.5m) and a second background person were untested.
- **Metric Inclusions:** All per-condition accuracy figures (C1=80.0%, C2=88.1%, C3=60.0%, C4=86.2%) include the 10 No-Gesture trials per condition (where staying NEUTRAL is judged correct).

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
