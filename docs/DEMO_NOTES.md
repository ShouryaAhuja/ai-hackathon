# Live Demo Guide & Presenter Notes — AirTouch (Q15)

> **Quick Reference for Stage Presentation**  
> Event: VIT AI Innovate-A-Thon (25 Oct 2026, SJT-G07)  
> Live URL: https://shouryaahuja.github.io/ai-hackathon/

---

## 1. Optimal Gesture Sequence for the Live Demo

> [!TIP]
> **Open the demo with our strongest gestures:**
> For the live demo, open with **`ILoveYou` (Help)**, **`Closed_Fist` (Lock)**, or **`Pointing_Up` (Schedule)** — these achieved **97%–100% reliability** across empirical evaluation.
>
> **Do NOT start the demo with `Open_Palm` (30% recall).**
> If demonstrating `Open_Palm` (Home), hold the palm directly facing the camera with fingers slightly spread — sub-threshold scores were 0.53–0.69, so a clean, upright posture can push it over the 0.70 threshold.

### Recommended 60-Second Demo Flow
1. **Introduction (10s):** Show the campus kiosk home screen. Point out that the system is running 100% in-browser on client hardware with zero backend or API calls.
2. **Gesture 1 — `Pointing_Up` ☝️ (10s):** Hold index finger up for 800 ms. Watch the teal dwell ring fill smoothly and navigate to **Schedule**.
3. **Gesture 2 — `Thumb_Up` 👍 (5s):** Select an event session item on the schedule screen.
4. **Gesture 3 — `Thumb_Down` 👎 (5s):** Back out to the schedule view.
5. **Gesture 4 — `Victory` ✌️ (10s):** Palm facing the camera with peace sign; navigates to **Campus Map**.
6. **Gesture 5 — `ILoveYou` 🤟 (10s):** Navigate to **Help / Legend** (100% precision and recall in testing).
7. **Gesture 6 — `Closed_Fist` ✊ (10s):** Lock the kiosk into pause mode to demonstrate accidental trigger protection.

---

## 2. Kiosk Lock & Unlock: How to Unlock on Stage

If you lock the kiosk with `Closed_Fist` ✊, here is exactly how to unlock it:

1. **Touchless Gesture Unlock (`Closed_Fist` ✊):**
   - In `App.tsx`, while locked, all navigation gestures are suppressed.
   - Showing `Open_Palm` will **NOT** unlock the kiosk via gesture.
   - **Hold `Closed_Fist` ✊ steadily for 800 ms** to toggle lock off and return to your previous screen.
2. **Manual Button Unlock (Fail-safe):**
   - Click the large teal **"Unlock to Home (H)"** button (routes to Home).
   - Or click **"← Back"** to restore the previous screen.
3. **Keyboard Shortcut (Emergency fast unlock):**
   - Press **`L`** on your keyboard to toggle unlock.
   - Or press **`H`** (Home) or **`Escape`** (Back).

---

## 3. Fallbacks & Stage Resilience

- **Lighting Issues at Venue:** If stage lighting creates harsh backlighting (like condition C3), angle the laptop screen slightly downward so the ceiling lights do not shine straight into the webcam.
- **Victory Angle:** Ensure the palm faces directly towards the camera lens when making the Victory sign.
- **Manual Parity:** If nervous or if a gesture takes two attempts, seamlessly tap the on-screen button or press the keyboard key. Highlight this to judges as intentional **accessibility parity**, not a failure!
