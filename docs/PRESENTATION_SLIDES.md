# Presentation Slides & Speaker Script — AirTouch (Q15)

> **Event:** VIT AI Innovate-A-Thon (25 Oct 2026, SJT-G07)  
> **Team:** Solo Developer + Antigravity AI Agent  
> **Topic:** AirTouch — Touchless Campus Information Kiosk (Problem Statement Q15)  
> **Format:** 7-Slide Pitch Deck following the Official Event Flow

---

## Slide 1: Problem & Target Users

### Visual Header
**AirTouch: Touchless Campus Information Kiosk**  
*Accessible, Zero-Latency, Privacy-Preserving Vision for Public Displays*

### Content Bullets
- **The Problem:** Public kiosks (university campuses, transit terminals, hospitals) are high-touch surfaces that pose hygiene risks, cause physical wear, and present accessibility barriers for users with motor difficulties.
- **The Pitfalls of Existing Vision Systems:**
  - Cloud vision APIs introduce 300–800 ms latency and fail without constant internet.
  - Video streaming to third-party servers violates user privacy in public settings.
  - "Always-listening" gesture models hallucinate false activations when passersby wave, point, or converse.
- **Target Audience:** Campus students, visitors, faculty, and mobility-impaired individuals seeking quick, safe, touchless wayfinding.

### Speaker Notes (Timed: ~25 seconds)
> *"Good morning judges. In high-traffic campus environments, touch kiosks are unhygienic and prone to wear. But touchless vision kiosks often fail in the real world: cloud APIs are too slow, streaming video creates privacy violations, and most gesture systems trigger by accident when someone merely waves to a friend. We built AirTouch to solve all three issues."*

---

## Slide 2: Idea & Core Innovation

### Visual Header
**The Intentionality Defense: Edge ML + Multi-Tiered Filtering**

### Content Bullets
- **100% In-Browser Execution:** MediaPipe Vision WASM executes locally on client hardware with zero backend, zero network overhead, and zero API dependencies.
- **Three-Tier Intentionality Filter:**
  1. **Strict Confidence Cutoff ($\tau \ge 0.70$):** Below 70%, the system safely abstains into an amber `NEUTRAL` state.
  2. **7-Frame Majority Temporal Smoothing:** Filters out momentary flickers and transitional hand shapes.
  3. **800 ms Dwell Ring Hold-to-Confirm:** Requires a deliberate, sustained hold before executing any kiosk action.
- **Universal Accessibility Parity:** 100% of kiosk actions have prominent ($\ge 72$ px) on-screen buttons and full keyboard shortcuts.

### Speaker Notes (Timed: ~25 seconds)
> *"Our core innovation is the intentionality defense pipeline. We do not just detect gestures; we distinguish between accidental body movement and deliberate user intent. Through a strict 70% threshold, 7-frame majority voting, and an 800 ms dwell timer, passing hands never trigger an action. And if a user cannot gesture, our interface offers 100% manual button and keyboard parity."*

---

## Slide 3: Technical Architecture & Pipeline

### Visual Header
**Client-Side Vision & Interaction Pipeline**

### Visual Diagram (Show Mermaid or Flowchart)
```
[Webcam 640x480 @ 30fps] 
         │ (getUserMedia, 100% local memory)
         ▼
[MediaPipe Vision WASM] ──> Extracts 21 3D Landmarks locally in 20-30 ms
         │
         ▼
[Confidence Filter (tau >= 0.70)] ──> Scores < 0.70 abstain to 'NEUTRAL'
         │
         ▼
[7-Frame Majority Smoothing] ──> Eliminates single-frame pose noise
         │
         ▼
[800 ms Dwell + 1200 ms Cooldown] ──> Visual ring fills; prevents double-taps
         │
         ▼
[kioskReducer Action Dispatcher] ──> Pure state machine updates UI
```

### Speaker Notes (Timed: ~25 seconds)
> *"Here is how AirTouch works under the hood. The webcam feeds local frames into a self-hosted MediaPipe WASM runtime. The model extracts 21 three-dimensional hand landmarks in 20 to 30 milliseconds. Confidence scores below 0.70 are safely abstained into the neutral state. A rolling 7-frame buffer ensures agreement, and an 800 ms animated dwell ring gives immediate visual feedback before our kiosk state machine updates."*

---

## Slide 4: Live Demo Flow & Kiosk Features

### Visual Header
**End-to-End Live Interaction**

### Content Bullets
- **Vocabulary of 7 Poses:**
  - `Pointing_Up` ☝️ → Campus Event Schedule (8 live sessions)
  - `Thumb_Up` 👍 → Select Session / Confirm
  - `Thumb_Down` 👎 → Back / Previous View
  - `Victory` ✌️ → Interactive SVG Campus Map & Building Inspector
  - `ILoveYou` 🤟 → Help, Legend & Troubleshooting (100% reliability)
  - `Closed_Fist` ✊ → Gesture Lock / Pause Protection
  - `Open_Palm` ✋ → Home Screen Navigation
- **Kiosk Feedback Suite:** Live confidence meter, animated dwell ring, mirrored preview with landmark toggle, and status strip.

### Speaker Notes (Timed: ~30 seconds)
> *"During our live demo, watch the teal dwell ring fill around the active gesture icon. We will demonstrate navigating from the Home screen to the Event Schedule with Pointing_Up, inspecting campus landmarks with the Victory sign, and locking the system against accidental touch using Closed_Fist. Notice that all gestures have immediate, identical button equivalents."*

---

## Slide 5: Empirical Testing, Results & Failure Modes

### Visual Header
**324 Real-World Trials Across 4 Uncontrolled Conditions**

### Data Table & Headline Metrics
- **Overall System Accuracy:** **78.70%** (255/324 trials correct, including 40 idle trials)
- **Safe Neutral Abstention Rate:** **21.30%** (69/324 trials safely abstained)
- **Misread Rate:** **0 misreads in 284 gesture trials** (95% CI upper bound $\sim 1\%$, rule of three)
- **Idle False Triggers:** **0 triggers in 200s idle observation** ($\le 0.9$/min at 95% CI)

### Failure Mode & Sensitivity Insights
- **Weakest Gesture:** `Open_Palm` achieved only 30.2% recall; raw scores clustered at 0.53–0.69, safely below threshold. Users safely get the fallback button rather than the wrong screen.
- **Lighting Challenge:** In harsh backlighting (C3), recognition dropped to 60.0% accuracy; 40.0% safely abstained into `NEUTRAL`.
- **Post-hoc Sensitivity Analysis:** Lowering threshold to $\tau=0.60$ raises accuracy to 91.7% with 0.3% error (discussed in report; frozen at 0.70 for safety).

### Speaker Notes (Timed: ~35 seconds)
> *"We rigorously tested AirTouch across 324 trials under four harsh conditions: normal light, dark room, harsh backlight, and heavy clutter. The results were decisive: in 284 gesture trials, zero steady holds were misread as the wrong action. In 200 seconds of random hand movement, zero accidental actions fired (<=0.9 per minute at 95% confidence). When lighting degraded in our backlit setup, the system safely abstained 40% of trials into the neutral state rather than guessing incorrectly."*

---

## Slide 6: Responsible AI, Privacy & SDG Alignment

### Visual Header
**Privacy-by-Design & Universal Accessibility**

### Content Bullets
- **Zero Video Transmission:** Video is processed in volatile client memory and discarded after each frame. No images or landmark coordinates are ever stored or uploaded.
- **SDG 9 (Industry, Innovation & Infrastructure):** Resilient, client-side edge computing requiring zero server infrastructure.
- **SDG 10 (Reduced Inequalities):** Dual-modality design ensures individuals unable to make hand gestures retain full, dignified access through large, high-contrast touch controls.
- **Fail-Safe Abstention:** Prioritizes user agency—an uncertain system halts and guides rather than making erroneous actions on the user's behalf.

### Speaker Notes (Timed: ~25 seconds)
> *"Responsible AI is at the core of AirTouch. Privacy is protected by design: video is processed entirely in browser memory and never uploaded. We align with SDG 9 and SDG 10: hand gestures are an augmenting convenience, but our persistent touch buttons and keyboard navigation ensure complete digital inclusion for users with motor limitations or injuries."*

---

## Slide 7: Implemented vs. Planned Future Work

### Visual Header
**Current Accomplishments & Future Roadmap**

### Implemented Today (Working Production MVP)
- [x] Client-side MediaPipe WASM runtime with 21 3D landmark extraction.
- [x] 3-tier defense pipeline (0.70 confidence cutoff, 7-frame smoothing, 800 ms dwell).
- [x] Full campus kiosk interface: Home, Schedule, SVG Campus Map, Help, Lock.
- [x] 100% manual button & keyboard parity with $\ge 72$ px touch targets.
- [x] Built-in empirical test harness & Python statistical evaluation suite (`ml/analyze.py`).

### Planned Future Enhancements
- [ ] Lightweight custom MLP landmark classifier trained on campus demographics.
- [ ] Multi-user occlusion handling and hand-tracking disambiguation.
- [ ] Dynamic adaptive thresholding conditioned on real-time ambient lux levels.

### Speaker Notes (Timed: ~20 seconds)
> *"To conclude: today we deliver a fully working, offline-capable, evaluated production kiosk with complete manual parity and zero privacy leakage. In future iterations, we plan to implement lightweight demographic fine-tuning and ambient lux adaptation. Thank you, and we welcome your questions!"*
