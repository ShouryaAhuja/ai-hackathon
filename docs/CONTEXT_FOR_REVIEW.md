# CONTEXT_FOR_REVIEW.md — AirTouch System Snapshot

> Generated: 2026-10-24T20:25:00+05:30  
> Repository: `ShouryaAhuja/ai-hackathon`  
> Live URL: https://shouryaahuja.github.io/ai-hackathon/  
> Last Milestone Tag: `v0.1-demo-safe`

---

## 1. STATUS

### Git Log (`git log --oneline -20`)
```text
41208cb feat(T3.2): ml/analyze.py evaluation script and requirements.txt - per_class metrics, confusion matrix, condition breakdown, threshold curve
26f1155 feat(T3.1): test mode UI - pre-trial gesture and condition selection, 3s countdown, 5s capture, verdict, CSV export, pure tests
03e25b3 feat(T2.9): deploy live, verify assets, tag v0.1-demo-safe
8d15293 feat(T2.8): realistic sample content - 8-item Schedule, 5-building SVG campus Map, 6-gesture Help guide with troubleshooting and legend
f44ef86 feat(T2.7): idle and lock - Closed_Fist toggle, camera on/off, clear locked indicator, privacy notice, clean camera track stop
cbe1a23 feat(T2.6): full manual parity - visible buttons >= 72px for all actions, keyboard shortcuts, friendly camera-off and denied states
ccb3546 feat(T2.5): UI feedback - ConfidenceMeter, DwellRing, NeutralBanner, status strip, CameraPreview
b740f8e feat: add ILoveYou->Help as sixth gesture (pre-evaluation map amendment)
9916bba feat: wire decision engine into kiosk dispatcher end-to-end (T2.4)
098a709 feat(T2.3): kiosk shell - Home/Schedule/Map/Help/Lock screens, header nav, gesture legend, keyboard shortcuts
567e1b0 feat(T2.2): actions.ts Action const-enum, kioskReducer, keyboard shortcuts + tests (40/40)
0e87cbb feat(T2.1): decision.ts pure engine + Vitest tests (19/19 pass)
b584a17 docs: confirm submission deliverables in MEMORY.md and complete Phase 1 for T1.3
6acca24 feat: create src/config.ts with gesture-action map and decision parameters for T1.2
1a48af4 feat: freeze gesture-action map in PRD.md and log decision for T1.1
8966ddf docs: log T0.8 GO decision, close Phase 0, and tag v0.0-skeleton
55c0d8f docs: verify live Pages deployment and record 5/5 gesture recognition verification for T0.7
819b0b6 feat: implement minimal gesture recognition page with mirrored preview and live telemetry
873719e feat: install MediaPipe tasks-vision, self-host WASM and gesture recognizer model, add night protocol
df7454a docs: fix task status and task IDs, fill placeholders, define accessible visual direction
```

### Git Tags (`git tag`)
```text
v0.0-skeleton
v0.1-demo-safe
wip-1739
wip-1745
wip-1753
wip-1759
wip-1800
wip-1801
wip-1803
wip-1811
wip-1813
wip-1818
wip-1832
wip-1843
wip-1859
wip-1905
wip-1909
wip-1911
wip-2009
wip-2013
```

### Tasks Status (from TASKS.md)
* **Completed (21 tasks):**
  * **Phase 0 (Setup & Go/No-Go):** T0.1, T0.2, T0.3, T0.4, T0.5, T0.6, T0.7, T0.8, T0.9
  * **Phase 1 (Freeze Spec):** T1.1, T1.2, T1.3
  * **Phase 2 (Core Build MVP):** T2.1, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8, T2.9
  * **Phase 3 (Test Mode & Eval Setup):** T3.1, T3.2
* **In Progress / Next:**
  * T3.3 (Collect data: C1 baseline, C2 dim, C3 backlit, C4 cluttered — owner-driven)
* **Remaining / Skipped:**
  * None skipped. Tasks T3.3 through T6.4 are scheduled according to the project timeline.
* **Stalls / Simplifications:**
  * No tasks stalled. During T2.5, React state re-rendering for landmark skeletal lines was bypassed by painting directly to a mirrored `<canvas>` 2D context inside the `requestAnimationFrame` loop, preventing render stutter.
  * During T3.1, live sample frame counting was moved from a state setter inside `useEffect` to frame telemetry to comply with React 19 hook purity rules.

---

## 2. FILE TREE

### `src/` (Source Code)
* `src/App.css` — Global styling and base animations
* `src/App.tsx` — Root component: initializes MediaPipe WASM, runs rAF video loop, feeds DecisionEngine, coordinates KioskShell and CameraPreview
* `src/config.ts` — Frozen gesture-to-action map and decision parameters (thresholds, dwell, cooldown)
* `src/index.css` — Tailwind CSS base directives and custom design tokens
* `src/main.tsx` — React 19 application entry point
* `src/assets/hero.png` — Static brand hero graphic
* `src/assets/react.svg` — React logo asset
* `src/assets/vite.svg` — Vite logo asset
* `src/kiosk/actions.test.ts` — Unit tests for Action enum, kioskReducer navigation, and keyboard mapping (28 tests)
* `src/kiosk/actions.ts` — Canonical Action const-object, pure kioskReducer state machine, screen navigation graph, keyboard shortcuts
* `src/kiosk/KioskShell.tsx` — Main kiosk frame: brand header, manual action bar (>=72px tall), status strip, gesture legend, screen router
* `src/kiosk/screens/HelpScreen.tsx` — Help screen: 6-gesture guide, visual legend, troubleshooting tips, keyboard table, contacts
* `src/kiosk/screens/HomeScreen.tsx` — Landing screen: large hero heading, 3 nav cards, manual quick action bar, Test Mode launcher
* `src/kiosk/screens/LockedScreen.tsx` — Kiosk lock screen displayed when gesture control is paused; includes >=72px unlock button
* `src/kiosk/screens/MapScreen.tsx` — Interactive SVG campus map with 5 labelled buildings (SJT Block venue, MB, TT, Library, Auditorium)
* `src/kiosk/screens/ScheduleScreen.tsx` — Event day plan: 8 realistic sessions with times, venues, category tags, and session inspector
* `src/testmode/recorder.test.ts` — Unit tests for verdict evaluation, frame aggregation, CSV conversion, and metrics (9 tests)
* `src/testmode/recorder.ts` — Pure helper functions: computeVerdict, aggregateCaptureWindow, trialsToCsv, computeMetrics, downloadCsv
* `src/testmode/TestModeScreen.tsx` — Empirical evaluation UI: true gesture & condition selector, 3s countdown, 5s capture, live verdict, CSV download
* `src/testmode/types.ts` — TypeScript definitions for true gestures, conditions, frame samples, trial records, and metrics
* `src/ui/CameraPreview.tsx` — Mirrored corner webcam preview with canvas landmark overlay (no React re-render) and landmark/camera toggles
* `src/ui/ConfidenceMeter.tsx` — Live confidence bar and percentage with 70% threshold tick (teal-500 when >=0.70, amber-500 below)
* `src/ui/DwellRing.tsx` — Circular SVG ring centered on active gesture icon, filling clockwise over 800ms
* `src/ui/NeutralBanner.tsx` — Amber alert banner displayed when detection is below threshold ("Not sure - hold your hand steady or use the buttons")
* `src/vision/decision.test.ts` — Unit tests for pure DecisionEngine (threshold, smoothing, dwell, cooldown, no-hand grace) (20 tests)
* `src/vision/decision.ts` — Pure DecisionEngine state machine managing thresholding, majority vote smoothing, dwell confirmation, and cooldown

### `public/mediapipe/` (Self-Hosted Vision Assets)
* `public/mediapipe/gesture_recognizer.task` — Official MediaPipe pretrained gesture recognition model file (8.37 MB)
* `public/mediapipe/vision_wasm_internal.js` — WebAssembly JavaScript loader for vision tasks
* `public/mediapipe/vision_wasm_internal.wasm` — MediaPipe vision WebAssembly binary (13.52 MB)
* `public/mediapipe/vision_wasm_module_internal.js` — Vision WebAssembly ES module wrapper
* `public/mediapipe/vision_wasm_module_internal.wasm` — Vision WebAssembly module binary (13.52 MB)
* `public/mediapipe/vision_wasm_nosimd_internal.js` — Non-SIMD fallback loader for older browsers
* `public/mediapipe/vision_wasm_nosimd_internal.wasm` — Non-SIMD fallback WebAssembly binary (12.63 MB)

### `ml/` (Python Evaluation Pipeline)
* `ml/analyze.py` — Python 3 evaluation script reading trials.csv and outputting per_class.csv, confusion_matrix.png, condition_table.csv, threshold_curve.png
* `ml/requirements.txt` — Python dependencies (pandas>=2.0.0, matplotlib>=3.7.0, numpy>=1.24.0)

### `docs/` (Documentation & Context)
* `docs/CONTEXT_FOR_REVIEW.md` — Context snapshot file (this document)

---

## 3. CONFIG (`src/config.ts`)

Exact constant values extracted directly from `src/config.ts`:

```typescript
export const GESTURE_ACTIONS: Record<string, KioskAction> = {
  Open_Palm: 'Home',
  Pointing_Up: 'Schedule',
  Victory: 'Map',
  ILoveYou: 'Help',
  Thumb_Up: 'Confirm',
  Thumb_Down: 'Back',
  Closed_Fist: 'Lock',
} as const

export const SCORE_THRESHOLD = 0.7       // Minimum confidence score required to accept a gesture (below -> neutral)
export const SMOOTHING_FRAMES = 7       // Number of consecutive recent frames used for temporal majority smoothing
export const DWELL_MS = 800             // Milliseconds user must hold a gesture steady before action triggers
export const COOLDOWN_MS = 1200         // Milliseconds to ignore gesture triggers after an action executes
export const NO_HAND_RESET_MS = 300     // Milliseconds of missing hand detection before resetting dwell progress
```

---

## 4. GESTURES

### Gestures Actually Used by the App & Test Mode
1. `Open_Palm` → **Home** (Navigate to Home screen; does not unlock when locked)
2. `Pointing_Up` → **Schedule** (Navigate to campus event schedule)
3. `Victory` → **Map** (Navigate to SVG campus map)
4. `Thumb_Up` → **Confirm** (Contextual confirmation / selection)
5. `Thumb_Down` → **Back** (Unwind screen navigation history)
6. `ILoveYou` → **Help** (Navigate to help, instructions, and FAQ)
7. `Closed_Fist` → **Lock** (Toggle gesture-control lock: hold ~800ms to lock or unlock touchless control)
8. `None` / below threshold → **NEUTRAL** (System abstains; shows NeutralBanner "Not sure - hold your hand steady or use the buttons")

### Test Mode Ground-Truth Options
Test Mode (`src/testmode/types.ts`) presents 7 selectable ground-truth options:
1. `Open_Palm` (Home)
2. `Pointing_Up` (Schedule)
3. `Victory` (Map)
4. `ILoveYou` (Help)
5. `Thumb_Up` (Confirm)
6. `Thumb_Down` (Back)
7. `None` (No Gesture / Other: used to test true negative rejection and false-trigger rate)

### Differences from Initial PRD.md §6
* **Amendment MAP-AMEND-1 (24 Oct pre-evaluation):** `ILoveYou -> Help` was added as the 6th active gesture (originally PRD.md §6 had 5 core gestures and lacked a direct gesture path to Help).
* `Closed_Fist` was listed as optional row 7 in PRD.md §6; it is fully implemented in the app as a toggleable gesture-control lock (`Action.LOCK`).

---

## 5. TEST MODE LOGIC

### How a Trial is Recorded & Judged
1. **Pre-Trial Selection:** The tester chooses the **Ground-Truth Gesture** (from 7 options) and the **Condition Tag** (`C1_baseline`, `C2_dim`, `C3_backlit`, `C4_cluttered`) *before* starting the trial.
2. **Countdown (3 seconds):** Clicking "START 5-SECOND TRIAL" initiates a 3-second preparation countdown (`3 -> 2 -> 1`) displaying an animated timer and prompting the tester to pose.
3. **Capture Window (5.0 seconds):** The system opens an active 5-second sampling window. During these 5 seconds, each frame evaluated by the live MediaPipe GestureRecognizer is recorded:
   * `timestamp`: performance monotonic timestamp
   * `rawLabel`: top categoryName from recognizer
   * `rawScore`: top confidence score (0.0 to 1.0)
   * `predictedLabel`: result of `applyThreshold(rawLabel, rawScore)` (yields raw label if `score >= 0.70` and `label != 'None'`, otherwise `'NEUTRAL'`)
   * `latencyMs`: frame latency
4. **Which Label Counts as "Predicted":**
   * At the end of the 5.0 seconds, `aggregateCaptureWindow()` computes the **majority predicted label** (the mode across all frames in the 5s capture window).
   * If the majority label is `'NEUTRAL'`, the predicted output is `'NEUTRAL'`. If a valid gesture held majority, that gesture name is the predicted label.
5. **Verdict Rules (`computeVerdict`):**
   * **For intentional mapped gestures (`Open_Palm`, `Pointing_Up`, `Victory`, `Thumb_Up`, `Thumb_Down`, `ILoveYou`):**
     * **`correct`:** `predicted === trueGesture` (model correctly identified the gesture)
     * **`neutral`:** `predicted === 'NEUTRAL'` (model safely abstained due to low confidence < 0.70 or no hand detected)
     * **`incorrect`:** `predicted !== trueGesture` and `predicted !== 'NEUTRAL'` (misclassification into a different gesture)
   * **For "No Gesture" (`None` / `Other`):**
     * **`correct`:** `predicted === 'NEUTRAL'` or `predicted === 'None'` (system successfully abstained from triggering when no gesture was intended)
     * **`incorrect`:** `predicted` is any active action gesture (false positive trigger)
6. **CSV Export (`trials.csv`):**
   * Clicking "Export CSV" downloads all trials stored in memory.
   * **Column Names:**  
     `timestamp,session_id,condition,true_gesture,predicted,raw_label,raw_score,latency_ms,verdict`
   * **Privacy Guarantee:** Zero images or video frames are ever recorded or stored; only textual labels, scores, and timestamps are saved.

---

## 6. KNOWN ISSUES & ENVIRONMENT OBSERVATIONS

1. **MediaPipe Version & Model:**
   * Package: `@mediapipe/tasks-vision@^1.1.1` (installed and verified).
   * Model: `gesture_recognizer.task` (7.98 MB, self-hosted in `public/mediapipe/`, SHA/size verified on live URL).
   * Execution delegate: Tries `GPU` first, automatically falls back to `CPU` if WebGL/GPU acceleration is unavailable.
2. **Console Warnings / Errors:**
   * `npm run lint`: 0 errors, 0 warnings (ESLint clean).
   * `npm test`: 57 passed across 3 test files (0 failures).
   * `npm run build`: built in 272ms with 0 warnings or errors.
3. **Lighting & Background Sensitivity:**
   * Backlit conditions (C3: window behind user) and low light (C2) can cause confidence scores to drop below the 0.70 threshold into the `NEUTRAL` state. This is an intended safety behavior, not a bug, but must be documented during T3.3 evaluation.
4. **Python Environment for `ml/analyze.py`:**
   * Python 3.15 is present (`C:\Users\shour\.local\bin\python3.15.exe`), and `python -m py_compile ml/analyze.py` compiles with exit code 0.
   * `pandas` and `matplotlib` are not yet installed in that specific environment; they must be installed via `pip install -r ml/requirements.txt` prior to executing data analysis in T3.3.

---

## 7. DATA

* **Trial CSV Files Found:** **None found** (`Get-ChildItem -Recurse -Filter "*.csv"` returned zero files). Data collection has not been run yet; it is intentionally reserved for owner-driven execution in Task T3.3.
* **`ml/analyze.py` Status:** **Exists** (created and syntax-verified in T3.2).
* **Execution:** Because no trial CSV files have been recorded yet, `ml/analyze.py` has not processed real data. When `trials.csv` is exported from the kiosk Test Mode, running `python ml/analyze.py trials.csv` will generate `docs/per_class.csv`, `docs/confusion_matrix.png`, `docs/condition_table.csv`, and `docs/threshold_curve.png`.

---

## 8. DEVIATIONS FROM SPECIFICATIONS

1. **Addition of 6th Gesture (`ILoveYou -> Help`):**
   * *PRD.md §6* initially listed 5 core gestures. Amendment `MAP-AMEND-1` added `ILoveYou -> Help` to ensure the Help screen was reachable touchlessly without overloading other gestures.
2. **Lock Gesture Implementation:**
   * `Closed_Fist` was listed as optional row 7 in PRD.md §6. In the implementation, `Closed_Fist` acts as an interaction lock: while locked, touchless gestures are ignored to prevent accidental triggers, and a prominent amber "LOCKED · GESTURES PAUSED" banner is shown.
3. **Enhanced Kiosk Controls:**
   * The kiosk header includes a dedicated **Camera ON/OFF** toggle button and a **Test Mode (T)** launcher button, providing immediate manual overrides from any view.
4. **Target Sizing:**
   * Buttons on all screens are `>= 72px` tall, strictly adhering to DESIGN.md §12 for kiosk accessibility from 1–2 meters distance.

---

## 9. HOW IT WORKS

1. **Video Capture:** The webcam stream is captured via `navigator.mediaDevices.getUserMedia` at 640x480 resolution without sending any frames to a network or server.
2. **Model Inference:** Each video frame is processed in real time by the self-hosted MediaPipe `GestureRecognizer` WebAssembly runtime via `recognizeForVideo()`.
3. **Perception Output:** The model outputs 21 3D hand landmark coordinates, handedness, and the top gesture category with a confidence score (0.0 to 1.0).
4. **Canvas Landmark Overlay:** Hand skeleton connections are rendered directly to a mirrored `<canvas>` 2D context inside the animation frame loop without triggering React component re-renders.
5. **Threshold Filter:** `applyThreshold()` evaluates whether the score meets or exceeds `SCORE_THRESHOLD` (0.70); any frame below threshold or unmapped outputs `NEUTRAL`.
6. **Temporal Majority Smoothing:** The thresholded label is pushed to a 7-frame ring buffer where `majorityLabel()` takes the mode to filter out single-frame classification flicker.
7. **Dwell Confirmation:** When a recognized action gesture is held steady, `DecisionEngine` advances a timer, filling an SVG `DwellRing` clockwise toward 800ms (`DWELL_MS`).
8. **Trigger & Cooldown:** Once the 800ms hold is satisfied, `DecisionEngine` emits a `GestureEvent` and locks out duplicate triggers for 1200ms (`COOLDOWN_MS`).
9. **Action Dispatch:** The emitted action (`Home`, `Schedule`, `Map`, `Help`, `Confirm`, `Back`, `Lock`) is delivered to `kioskReducer`, unified with button clicks and keyboard shortcuts.
10. **State Transition:** The pure kiosk state machine transitions the active screen, maintains the history stack for Back navigation, and updates the status strip.
