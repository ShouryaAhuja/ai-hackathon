# HOW IT WORKS — AirTouch Vision & Interaction Pipeline

> **Quick Reference Guide for Oral Q&A**  
> *AirTouch: Touchless Campus Information Kiosk (Q15)*  
> One-line summary: Camera frames are converted to 21 3D hand landmarks in-browser, classified into gestures, filtered for stability, and confirmed via a dwell timer before triggering a kiosk action.

---

## 1. The 7-Step Pipeline (From Webcam to Kiosk Action)

```
[1. Webcam Frame] 
      │ (640x480 @ 30fps via getUserMedia, processed entirely on-device)
      ▼
[2. Hand Landmark Detection] 
      │ (MediaPipe Vision WASM detects 21 3D hand keypoints in real time)
      ▼
[3. Gesture Classification] 
      │ (On-device neural model outputs candidate gesture label + raw score)
      ▼
[4. Confidence Thresholding (>= 0.70)] 
      │ (Scores < 0.70 or unmapped gestures abstain safely into 'NEUTRAL')
      ▼
[5. Temporal Smoothing (Majority of 7 frames)] 
      │ (Flicker filter: eliminates single-frame noise and transition artifacts)
      ▼
[6. Dwell Timer & Cooldown (800ms hold + 1200ms grace)] 
      │ (Intentionality filter: visual ring fills over 800ms; prevents accidental triggers)
      ▼
[7. Unified Kiosk Action Dispatcher]
        (Executes navigation or selection; fully mirrored by physical buttons & keyboard)
```

---

## 2. Step-by-Step Breakdown

### Step 1: Video Capture (`getUserMedia`)
- Captures mirrored front-facing video at 640×480 resolution (capped for fast inference and low CPU/GPU power consumption).
- **Privacy Guarantee:** Video frames are passed directly to an in-memory HTML5 `<video>` element, processed in volatile memory, and **never uploaded, stored, or sent to any server**.

### Step 2: 21-Point Hand Landmark Detection
- The self-hosted MediaPipe WASM runtime extracts 21 three-dimensional coordinates $(x, y, z)$ representing key finger joints, palm base, and fingertips.
- Coordinates are normalized relative to hand bounding box and wrist origin, rendering detection robust to position in frame.

### Step 3: Raw Gesture Classification
- A local TensorFlow Lite task model (`gesture_recognizer.task`, 7.98 MB) evaluates landmark geometry and outputs probabilities for predefined static hand poses:
  - `Open_Palm`, `Pointing_Up`, `Victory`, `Thumb_Up`, `Thumb_Down`, `ILoveYou`, `Closed_Fist`.

### Step 4: Confidence Thresholding (`SCORE_THRESHOLD = 0.70`)
- If the model's top confidence score is below **70%**, or if the detected pose is not in the kiosk's vocabulary:
  - The system abstains into the **`NEUTRAL`** state.
  - A friendly amber banner informs the user: *"Not sure — hold your hand steady or use the buttons"*.
  - **No accidental actions can fire in the neutral state.**

### Step 5: Temporal Smoothing (`SMOOTHING_FRAMES = 7`)
- Raw per-frame predictions can flicker during hand transitions (e.g., closing a hand briefly mimics pointing).
- A rolling window buffer collects the last 7 frames (~200–250 ms of video).
- Only when the **majority** of the window agrees on the same gesture does the system consider that gesture candidate active.

### Step 6: Dwell Hold-to-Confirm & Cooldown (`DWELL_MS = 800`, `COOLDOWN_MS = 1200`)
- **Intentionality Guarantee:** A user merely passing their hand through the frame will not trigger an action.
- The user must hold the gesture steadily for **800 ms**.
- A visible **Dwell Ring** animates clockwise around the active gesture icon in teal, providing immediate feedback.
- Once 800 ms elapses, the action fires, and a **1200 ms cooldown** initiates to prevent repeated accidental triggers.

### Step 7: Action Dispatcher & Full Manual Parity
- The emitted `GestureEvent` routes through a unified state machine (`kioskReducer`):
  - `Open_Palm` → Home (`Action.HOME`)
  - `Pointing_Up` → Schedule (`Action.SCHEDULE`)
  - `Victory` → Campus Map (`Action.MAP`)
  - `ILoveYou` → Help & Legend (`Action.HELP`)
  - `Thumb_Up` → Confirm Selection (`Action.CONFIRM`)
  - `Thumb_Down` → Back / Cancel (`Action.BACK`)
  - `Closed_Fist` → Gesture Lock (`Action.LOCK` — toggles touchless control off/on)
- **Manual Parity:** Every single action has a persistent button (>= 72px tall) and a keyboard shortcut (`H`, `S`, `M`, `?`, `Enter`, `Esc`, `L`). The kiosk is 100% functional even if the camera is disabled or denied.

### Kiosk Lock & Unlock Mechanism (Presenter Guide)
When the kiosk is in the **Locked** state (`screen === 'locked'`):
- **Gesture Unlock (`Closed_Fist` ONLY):** In `App.tsx`, while locked, all gestures except `Closed_Fist` (`Action.LOCK`) are suppressed. Showing `Open_Palm` does **not** unlock the kiosk via gesture. To unlock touchlessly, hold **`Closed_Fist` ✊** steadily for 800 ms to toggle lock off and restore the previous screen.
- **On-Screen Manual Unlock:** Click the large teal **"Unlock to Home (H)"** button (dispatches `Action.HOME` to Home) or the **"← Back"** button (restores the previous screen).
- **Keyboard Shortcut Unlock:** Press **`L`** (toggles lock off back to previous screen), **`H`** (unlocks to Home), or **`Escape`** / **`Backspace`** (returns to previous screen).

---

## 3. Anticipated Judge Questions & Strong Answers

#### Q: "Why run this in the browser instead of using a cloud Vision API (OpenAI / Google Cloud Vision)?"
> **Answer:** *"Three reasons: latency, privacy, and venue reliability. In-browser MediaPipe WASM runs locally at 20–30 ms per frame with zero round-trip latency. Video never leaves the user's laptop, satisfying privacy requirements for public spaces. Finally, our entire application and ML assets are self-hosted in the repo — it works completely offline without venue Wi-Fi or API keys."*

#### Q: "How do you prevent false activations when someone just waves or scratches their nose?"
> **Answer:** *"Through a three-layer filter: first, a strict 70% confidence threshold that rejects ambiguous poses into a safe 'NEUTRAL' state; second, a 7-frame temporal smoothing window that rejects transient pose transitions; and third, an 800 ms dwell timer that requires deliberate holding before any action dispatches. Random movements never sustain a pose for 800 ms."*

#### Q: "What happens if a user has tremors, a bandage, or cannot make hand gestures?"
> **Answer:** *"Responsible AI requires accessibility parity. Gestures are an additional, touchless modality — not an exclusive barrier. Every screen provides large (>= 72px) touch/click buttons and keyboard shortcuts. Furthermore, if camera permission is denied or turned off, the interface gracefully degrades into full manual mode."*

#### Q: "What if lighting is dim or backlit?"
> **Answer:** *"Our empirical evaluation specifically benchmarks four environmental conditions: C1 baseline, C2 dim light, C3 backlight, and C4 cluttered backgrounds. When lighting degrades landmark visibility, the system safely abstains into the neutral state rather than hallucinating wrong actions."*
