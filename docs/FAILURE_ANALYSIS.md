# AirTouch: Empirical Failure Analysis & Error Characterization

**Document:** `docs/FAILURE_ANALYSIS.md`  
**Dataset:** 324 unique trials recorded via AirTouch Test Mode across four real-world conditions  
**Operating Threshold:** `SCORE_THRESHOLD = 0.70` (Frozen per PRD §6)  
**Analysis Date:** 25 October 2026  
**Source of Truth:** `ml/data/` (32 CSV sessions), evaluated via `ml/analyze.py`

---

## 1. Executive Summary

Empirical evaluation of 324 trials yielded an **Overall System Accuracy of 78.70%** (255/324 correct), a **Neutral Abstention Rate of 21.30%** (69/324 abstained), and an **Error / Misclassification Rate of 0.00%** (0 false activations). 

Most importantly, across 40 dedicated No-Gesture trials (200 seconds of active idle movement), the kiosk recorded **0 accidental activations (0.00 false triggers per minute)**. 

Every single non-correct trial in the 324-trial benchmark was a **safe abstention into the `NEUTRAL` state**. The system never hallucinated an incorrect navigation action. However, the 21.30% abstention rate is not evenly distributed across gestures or environments. This document presents five concrete, data-backed failure modes observed during empirical testing, explains their root causes based on real capture conditions, and details their mitigations.

---

## 2. Real-World Environmental Context

Testing was intentionally conducted under **uncontrolled, real-world home/office conditions**, not sterile laboratory environments:

| Condition Tag | Environmental Setup | Physical Challenge | Total Trials | Accuracy | Neutral Rate |
|---|---|---|---|---|---|
| **C1: Baseline** | Normal indoor light, mildly cluttered background | Layered newspapers on desk behind user | 80 | 80.0% | 20.0% |
| **C2: Dim Light** | Overhead lights switched off, low ambient illuminance | Sensor noise, reduced landmark edge contrast | 84 | 88.1% | 11.9% |
| **C3: Backlit** | Desk lamp placed directly behind user's head/torso | Strong optical silhouette, camera auto-underexposure | 80 | 60.0% | 40.0% |
| **C4: Cluttered** | Heavy background clutter: layered newspapers, boxes, clothes | High-frequency edge noise competing with fingers | 80 | 86.2% | 13.8% |

**Handedness & Pose Notes:**
- **Handedness:** Unconstrained in C1 and C2 (alternating left and right hands); held to one consistent dominant hand in C3 and C4.
- **Victory Orientation:** The owner observed that the Victory gesture is orientation-sensitive: reliable when the palm directly faces the camera lens, but prone to confidence drops if the hand is angled or rotated dorsally (back of hand facing camera).

---

## 3. Concrete Failure Case 1: `Open_Palm` Sub-Threshold Clustering (Weakest Gesture)

### Quantitative Finding
- **Class Metrics:** Support: 43 trials | Correct: 13 | Neutral Abstentions: 30 | Recall: **30.23%** | F1-Score: **0.4643**
- **Abstention Breakdown:** C1: 7/10 | C2: 9/13 | C3: 7/10 | C4: 7/10

### Ground-Truth Observation
In all 30 abstained trials, MediaPipe's top raw label was indeed `Open_Palm`—the classifier correctly identified the gesture category. However, the raw confidence scores clustered tightly between **0.5288 and 0.6921** (mean raw score: **0.6373**). Because the kiosk's frozen threshold is `0.70`, every one of these trials was rejected into the `NEUTRAL` state.

```
Individual Trial Excerpts (Open_Palm Abstentions):
• Trial C1_baseline #0 : raw_label="Open_Palm", raw_score=0.6495 -> NEUTRAL
• Trial C1_baseline #8 : raw_label="Open_Palm", raw_score=0.6832 -> NEUTRAL
• Trial C2_dim      #0 : raw_label="Open_Palm", raw_score=0.6812 -> NEUTRAL
• Trial C4_cluttered #3 : raw_label="Open_Palm", raw_score=0.6710 -> NEUTRAL
```

### Root Cause
An open palm presents 5 spread, extended fingers. In mildly or heavily cluttered environments (C1 newspapers, C4 boxes and clothes), high-frequency background edges visually intersect the gaps between extended fingers. This creates minor spatial ambiguity in the 21-point landmark mesh, causing MediaPipe to output confidence scores in the 0.60–0.68 range rather than > 0.70.

### Mitigations
1. **Implemented:** The safe `NEUTRAL` banner immediately alerts the user: *"Not sure — hold your hand steady or use the buttons"*. The user is never trapped because the physical `Home` button (>= 72px) is continuously active.
2. **Recommended Post-Hackathon:** Implement class-specific thresholding (e.g., `0.60` for `Open_Palm`, while keeping `0.70` for others), or normalize hand landmark bounding box size to prompt the user to bring the hand slightly closer.

---

## 4. Concrete Failure Case 2: Silhouette Blindness in C3 (Backlit Condition)

### Quantitative Finding
- **Condition Metrics:** Total: 80 trials | Correct: 48 | Neutral: 32 | Accuracy: **60.0%** | Neutral Rate: **40.0%**
- **Most Affected Gestures in C3:**
  - `Thumb_Up`: 10/10 trials abstained (0% recall in C3)
  - `Thumb_Down`: 8/10 trials abstained (20% recall in C3)
  - `Pointing_Up`: 5/10 trials abstained (50% recall in C3)
  - `Open_Palm`: 7/10 trials abstained (30% recall in C3)

### Ground-Truth Observation
Unlike C1, C2, and C4 where abstentions were caused by scores slightly below threshold (0.60–0.69), C3 produced **complete landmark dropouts** (`raw_label = 'No hand'`, `raw_score = 0.0`):

```
C3 Backlit Complete Dropout Excerpts:
• Pointing_Up (Trial #0, C3): raw_label="No hand", raw_score=0.0000 -> NEUTRAL
• Pointing_Up (Trial #3, C3): raw_label="No hand", raw_score=0.0000 -> NEUTRAL
• Victory     (Trial #9, C3): raw_label="No hand", raw_score=0.0000 -> NEUTRAL
• Closed_Fist (Trial #9, C3): raw_label="No hand", raw_score=0.0000 -> NEUTRAL
```

### Root Cause
The desk lamp positioned directly behind the user flooded the webcam sensor with intense backlighting. Standard laptop webcams use global auto-exposure, which drastically underexposes the foreground subject to compensate for the light source. The user's hand was rendered as an almost pitch-black silhouette, completely eliminating the internal optical gradients needed by MediaPipe's Palm Detector SSD model to localize hand keypoints.

### Mitigations
1. **Implemented:** When no hand landmarks are detected, the system does not crash or misclassify; it cleanly defaults to `NEUTRAL` and resets the dwell timer after 300 ms (`NO_HAND_RESET_MS`).
2. **Kiosk Guidance:** In public deployment, kiosks must be angled away from direct outdoor windows or high-intensity spotlights. The on-screen feedback instructs users when backlighting is degrading visibility.

---

## 5. Concrete Failure Case 3: Asymmetric Sensitivity in Thumb Gestures

### Quantitative Finding
- `Thumb_Up`: Recall: **60.0%** | Abstentions: **16** (C1: 3, C3: 10, C4: 3) | Precision: **100%**
- `Thumb_Down`: Recall: **75.0%** | Abstentions: **10** (C1: 1, C2: 1, C3: 8) | Precision: **100%**

### Ground-Truth Observation
In both thumb gestures, four fingers are tightly curled into the palm while the thumb is extended. In C3 (backlit) and C4 (heavy clutter), the system struggled to differentiate the extended thumb from the fist body:

```
Thumb Failure Excerpts:
• Thumb_Up   (Trial #1, C1): raw_label="Thumb_Up", raw_score=0.6420 -> NEUTRAL
• Thumb_Up   (Trial #5, C4): raw_label="Thumb_Up", raw_score=0.6685 -> NEUTRAL
• Thumb_Down (Trial #2, C3): raw_label="Thumb_Down", raw_score=0.6110 -> NEUTRAL
• Thumb_Down (Trial #8, C3): raw_label="No hand", raw_score=0.0000 -> NEUTRAL
```

### Root Cause
When the thumb is pointed upward or downward, the angle of the wrist and forearm partially occludes the thumb base (CMC joint). In dim or cluttered environments, the thumb tip contour blends into the forearm silhouette, lowering classification confidence to ~0.62–0.66.

### Mitigations
1. **Hold-to-Confirm Dwell:** Because dwell is 800 ms, users who notice the confidence bar hovering in amber can slightly rotate their wrist toward the camera to achieve the required 0.70 threshold.
2. **Manual Parity:** The prominent on-screen `Confirm` and `Back` buttons provide instantaneous, single-tap alternatives.

---

## 6. Concrete Failure Case 4: Victory Orientation Sensitivity

### Quantitative Finding
- `Victory`: Support: 40 trials | Correct: 37 | Abstentions: 3 | Recall: **92.5%** | Precision: **100%**
- Abstentions: C1: 2 | C3: 1 | C2 & C4: 0

### Ground-Truth Observation
During C1 baseline collection, two Victory trials failed to trigger:

```
Victory Orientation Excerpt:
• Victory (Trial #7, C1): raw_label="Victory", raw_score=0.4946 -> NEUTRAL
• Victory (Trial #8, C1): raw_label="None",    raw_score=0.6888 -> NEUTRAL
```

### Root Cause
As noted in the owner's empirical observations, the pretrained MediaPipe model expects the **palmar surface** (front of the palm) to face the camera. When the user turned their hand slightly sideways or dorsally (knuckles facing camera), the 2D projection of the index and middle fingers caused joint occlusion, dropping raw score to 0.4946 or misclassifying the pose as an ambiguous hand shape (`None` @ 0.6888).

### Mitigations
1. **Interactive Landmark Preview:** The live camera preview in the corner renders the hand skeleton in real time, enabling users to visually verify that both fingers are cleanly tracked.
2. **Legend Visuals:** The Kiosk Help screen explicitly illustrates the Victory sign with the palm facing front.

---

## 7. Concrete Failure Case 5: The Threshold Trade-off (0.70 vs. 0.60)

### Empirical Sensitivity Data
Re-evaluating all 324 trials across the threshold spectrum ($0.50 \le \tau \le 0.90$) reveals the exact mathematical trade-off between safety and usability:

| Operating Threshold | System Accuracy | Neutral Abstention Rate | Misclassification Rate | Total False Triggers |
|:---:|:---:|:---:|:---:|:---:|
| **0.50** | 93.5% | 6.2% | 0.3% (1/324) | 0 |
| **0.55** | 92.9% | 6.8% | 0.3% (1/324) | 0 |
| **0.60** | **91.7%** | **8.0%** | **0.3% (1/324)** | **0** |
| **0.65** | 85.5% | 14.2% | 0.3% (1/324) | 0 |
| **0.70 (Frozen)** | **78.7%** | **21.3%** | **0.0% (0/324)** | **0** |
| **0.75** | 69.8% | 30.2% | 0.0% (0/324) | 0 |
| **0.80** | 63.6% | 36.4% | 0.0% (0/324) | 0 |
| **0.85** | 58.6% | 41.4% | 0.0% (0/324) | 0 |
| **0.90** | 39.2% | 60.8% | 0.0% (0/324) | 0 |

### Engineering Takeaway
- At the **frozen threshold of 0.70**, AirTouch is **100% conservative**: zero accidental triggers and zero misclassifications occur, but 21.3% of valid user gestures are forced into the neutral state.
- At an optimized threshold of **0.60**, overall accuracy jumps by **+13.0 percentage points (78.7% -> 91.7%)**, neutral abstentions plummet from 21.3% to **8.0%**, and only a single trial across the entire 324-trial benchmark is misclassified.
- **Protocol Discipline:** In accordance with rigorous scientific practice, `src/config.ts` was **left frozen at 0.70** to avoid post-hoc data snooping, and this trade-off is presented transparently to the judging panel.

---

## 8. Summary Table of Empirical Failures & System Mitigations

| Failure Mode | Frequency in Data | Primary Cause | System Guardrail Implemented |
|---|---|---|---|
| **Sub-threshold `Open_Palm`** | 30/43 trials (69.8%) | Background clutter edges competing with 5 spread fingers | Amber Neutral Banner + Persistent `Home` button |
| **Backlight Silhouette Dropout** | 32/80 trials (40.0% in C3) | Optical underexposure from lamp directly behind user | 300ms graceful reset (`NO_HAND_RESET_MS`) + Manual mode |
| **Curled Thumb Joint Occlusion** | 26/80 trials (32.5% combined) | Wrist angle occluding thumb root landmark | Visible live confidence meter + Dwell ring feedback |
| **Victory Angle Sensitivity** | 3/40 trials (7.5%) | Dorsal / knuckle orientation obscuring 2D finger separation | Live mirrored landmark canvas preview for self-correction |
| **Idle Hand Movement** | 0/40 trials (0.0% false triggers) | Hand passing through frame without gesture intent | 800ms dwell timer + 7-frame majority voting filter |
