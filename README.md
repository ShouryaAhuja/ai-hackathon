# AirTouch — Touchless Campus Information Kiosk

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-teal?style=for-the-badge&logo=github)](https://shouryaahuja.github.io/ai-hackathon/)
[![Status](https://img.shields.io/badge/Status-v1.0--demo-brightgreen?style=for-the-badge)](https://shouryaahuja.github.io/ai-hackathon/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **VIT AI Innovate-A-Thon 2026**  
> **Problem Statement :** Gesture-Based Interface for Public Kiosks   
> **Live Web Application:** [https://shouryaahuja.github.io/ai-hackathon/](https://shouryaahuja.github.io/ai-hackathon/)

---

## 1. Executive Summary & Pitch

In busy public environments such as universities, transit hubs, and healthcare facilities, interactive kiosks are high-touch surfaces that present hygiene concerns and accessibility barriers. Existing computer-vision solutions frequently rely on high-latency cloud APIs, raise serious video privacy concerns, and suffer from accidental activations when bystanders merely gesture or move past the camera.

**AirTouch** is a zero-latency, private, touchless campus kiosk interface running **100% in-browser on client hardware**. Powered by MediaPipe Gesture Recognizer running inside client WebAssembly, AirTouch enforces an intentionality defense pipeline:
1. **Confidence Thresholding ($\tau = 0.70$):** Ambiguous gestures fall safely into a first-class `NEUTRAL` state.
2. **7-Frame Majority Temporal Smoothing:** Eliminates transient noise and pose transition artifacts.
3. **800 ms Dwell Hold-to-Confirm:** Visual feedback ring prevents accidental triggers during incidental hand movement.
4. **100% Manual Parity:** Every gesture action is mirrored by large ($\ge 72$ px) touch buttons and keyboard shortcuts.

---

## 2. Gesture-to-Action Mapping

The kiosk gesture vocabulary is frozen in `src/config.ts` and maps 7 hand poses to kiosk actions:

| Hand Gesture | Visual Pose | Kiosk Action | Target Screen / Behaviour | Keyboard Shortcut |
|---|:---:|---|---|:---:|
| `Open_Palm` | ✋ | **Home** | Navigates to main kiosk menu | `H` / `Home` |
| `Pointing_Up` | ☝️ | **Schedule** | Campus event day plan (8 sessions) | `S` |
| `Victory` | ✌️ | **Campus Map** | Interactive SVG campus map & building inspector | `M` |
| `ILoveYou` | 🤟 | **Help** | Gesture legend, user guide & troubleshooting | `?` / `/` |
| `Thumb_Up` | 👍 | **Confirm** | Selects highlighted schedule session / item | `Enter` / `C` |
| `Thumb_Down` | 👎 | **Back** | Returns to previous view / cancels modal | `Esc` / `Backspace` |
| `Closed_Fist` | ✊ | **Lock** | Toggles gesture pause (hold to lock / unlock) | `L` |

---

## 3. System Architecture & Vision Pipeline

AirTouch operates entirely on the client edge with zero backend infrastructure and zero API keys:

```
[Webcam Stream] 
       │ (640x480 @ 30fps via getUserMedia, processed entirely on-device)
       ▼
[MediaPipe Vision WASM] 
       │ (Local TF Lite gesture_recognizer.task extracts 21 3D hand keypoints)
       ▼
[Confidence Threshold Filter (tau >= 0.70)] 
       │ (Rejects scores < 0.70 or unmapped poses safely into 'NEUTRAL')
       ▼
[7-Frame Majority Temporal Smoothing] 
       │ (Rolling window buffer eliminates flickers and transition noise)
       ▼
[800 ms Dwell Timer & 1200 ms Cooldown] 
       │ (Animated Dwell Ring ensures deliberate intent before firing)
       ▼
[Unified Kiosk Action Dispatcher]
       │ (Executes navigation via pure Redux-style kioskReducer)
       ▼
[100% Manual Parity UI]
       (Mirrored on every screen by >= 72px buttons & keyboard shortcuts)
```

---

## 4. Empirical Evaluation Summary

The pipeline was benchmarked using an in-app test harness across **324 empirical trials** recorded under four uncontrolled real-world conditions:
- **C1 (Baseline):** Normal indoor light, mild newspaper clutter behind user ($N=80$).
- **C2 (Dim Light):** Overhead room lights switched off, low ambient illuminance ($N=84$).
- **C3 (Backlit):** Bright desk lamp behind user causing severe silhouette contrast ($N=80$).
- **C4 (Heavy Clutter):** Layered newspapers, cardboard boxes, and fabric in frame ($N=80$).

### Gesture-Only Performance (Excluding Idle Rejections)

| Metric | Empirical Value |
|---|---|
| **Total Gesture Trials** | 284 |
| **Recognised Correctly** | **215 (75.7%)** |
| **Safely Abstained (`NEUTRAL`)** | **69 (24.3%)** |
| **Misread as Wrong Gesture** | **0 of 284** (95% CI upper bound $\sim 1\%$, rule of three) |
| **No-Gesture Trials Correctly Rejected** | **40 of 40 (100%)** |
| **Triggers During 200s Idle Movement** | **0 triggers** ($\le 0.9$/min, 95% CI upper bound) |

*Note: The 78.70% overall system accuracy (255/324) includes the 40 No-Gesture trials where remaining in NEUTRAL is judged correct.*

### Key Scientific Findings
1. **Zero Accidental Actions:** No 5-second steady hold was majority-labelled as the wrong gesture (0 misreads in 284 gesture trials). In idle observation, there were 0 triggers in 200 seconds of movement ($\le 0.9$/min at 95% confidence).
2. **First-Class Safe Abstention:** In backlit conditions (C3), recognition degraded to 60.0% accuracy; the remaining 40.0% was safely caught by the `NEUTRAL` state. The user was never redirected to the wrong screen.
3. **Weakest Gesture:** `Open_Palm` had only 30.2% recall (30/43 trials abstained). Raw confidence scores clustered at 0.53–0.69, safely below our 0.70 threshold.
4. **Post-hoc Sensitivity Analysis:** Post-hoc analysis showed lowering threshold to $\tau=0.60$ yields 91.7% accuracy with 0.3% error. $\tau=0.60$ is a post-hoc observation from already-collected data, not an achieved result; our evaluation threshold remains frozen at $\tau=0.70$.

---

## 5. Deliverables & Documentation Index

- **Full Technical & Scientific Report:** [`docs/REPORT.md`](docs/REPORT.md)
- **Empirical Failure Analysis (5 Real Modes):** [`docs/FAILURE_ANALYSIS.md`](docs/FAILURE_ANALYSIS.md)
- **Pipeline Deep-Dive & Oral Q&A Guide:** [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md)
- **Stage Presentation & Demo Notes:** [`docs/DEMO_NOTES.md`](docs/DEMO_NOTES.md)
- **Evaluation Datasets (32 Real CSVs):** [`ml/data/`](ml/data/)
- **Python Statistical Evaluation Script:** [`ml/analyze.py`](ml/analyze.py)
- **Evaluation Plots & Tables:** [`docs/confusion_matrix.png`](docs/confusion_matrix.png), [`docs/threshold_curve.png`](docs/threshold_curve.png), [`docs/per_class.csv`](docs/per_class.csv), [`docs/condition_table.csv`](docs/condition_table.csv)

---

## 6. How to Run Locally

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$ (for ML analysis only)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/ShouryaAhuja/ai-hackathon.git
cd ai-hackathon

# Install frontend dependencies
npm install

# Run unit tests
npx vitest run

# Start local development server
npm run dev
```

### Reproduce Evaluation Analysis
```bash
# Set up Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install analysis dependencies
pip install -r ml/requirements.txt

# Run analysis on all 32 collected trial CSVs
python ml/analyze.py ml/data/*.csv
```

---

## 7. Responsible AI, Privacy & Accessibility

- **Data Minimization & Local Processing:** Video frames are passed directly from `getUserMedia` to an HTML5 `<video>` element in memory. Video is processed frame-by-frame on the user's CPU/GPU and **never saved, uploaded, or transmitted**.
- **Universal Access & Manual Parity:** Hand gestures are an augmenting modality, never a gatekeeper. Users with motor tremors, arm fatigue, or physical limitations can operate 100% of the kiosk using large on-screen buttons or keyboard shortcuts.
- **Fail-Safe Neutral State:** Rather than forcing a low-confidence guess, AirTouch defaults to a non-destructive neutral state with helpful visual guidance.

---

## 8. Limitations & Threats to Validity

- **Participant Sample:** Data was collected by a single participant across one collection evening ($N=324$ trials). While environmental conditions (lighting, clutter) were varied systematically, results are indicative of single-user ergonomics rather than population-scale anthropometrics.
- **Orientation Constraints:** The `Victory` gesture is sensitive to hand angle (requires palm facing camera); `Open_Palm` confidence drops when fingers are close together.
- **Threshold Reconstruction:** The threshold sensitivity curve is a post-hoc reconstruction from aggregated trial scores rather than a full frame-level stream replay.
