/**
 * decision.ts — pure gesture decision engine (no DOM, no side-effects).
 *
 * Pipeline per frame:
 *   rawLabel + rawScore
 *     → threshold (NEUTRAL if score < SCORE_THRESHOLD)
 *     → smoothing  (majority vote over last SMOOTHING_FRAMES labels)
 *     → dwell      (stable for DWELL_MS → emit event; no-hand grace NO_HAND_RESET_MS)
 *     → cooldown   (ignore triggers for COOLDOWN_MS after an emit)
 *
 * All timing is in milliseconds from an external monotonic clock (performance.now()).
 * All constants come from src/config.ts — no magic numbers here.
 */

import {
  SCORE_THRESHOLD,
  SMOOTHING_FRAMES,
  DWELL_MS,
  COOLDOWN_MS,
  NO_HAND_RESET_MS,
  GESTURE_ACTIONS,
  type KioskAction,
} from '../config'

/** A gesture action event emitted when dwell completes and cooldown allows. */
export interface GestureEvent {
  /** Mapped kiosk action (from GESTURE_ACTIONS). */
  action: KioskAction
  /** Raw MediaPipe gesture label that triggered the action. */
  gesture: string
  /** Confidence score at the moment of emission (0–1). */
  confidence: number
}

/** Internal state managed by DecisionEngine. Exposed for unit tests. */
export interface DecisionState {
  /** Ring buffer of the last SMOOTHING_FRAMES thresholded labels. */
  frameBuffer: string[]
  /** Label being held for dwell, or null. */
  dwellLabel: string | null
  /** Timestamp when the current dwell started (ms). */
  dwellStart: number | null
  /** Timestamp of the last emitted action (ms). */
  lastActionAt: number | null
  /** Timestamp of the most recent frame where a hand WAS detected (ms). null if never seen. */
  noHandSince: number | null
}

/** Gesture label used when confidence is below threshold or no hand detected. */
export const NEUTRAL = 'NEUTRAL'

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------

/**
 * Apply confidence threshold. Returns the raw label if score ≥ SCORE_THRESHOLD,
 * otherwise NEUTRAL.
 */
export function applyThreshold(label: string, score: number): string {
  if (label === 'None' || label === '' || score < SCORE_THRESHOLD) {
    return NEUTRAL
  }
  return label
}

/**
 * Compute the majority label in a frame buffer (most frequent).
 * Ties resolved by favouring the most recently added label (last element).
 */
export function majorityLabel(buffer: string[]): string {
  if (buffer.length === 0) return NEUTRAL
  const counts: Record<string, number> = {}
  for (const label of buffer) {
    counts[label] = (counts[label] ?? 0) + 1
  }
  // Find max count first
  let bestCount = 0
  for (const count of Object.values(counts)) {
    if (count > bestCount) bestCount = count
  }
  // Resolve ties by scanning buffer right-to-left; first tie-winner found is the most recent
  for (let i = buffer.length - 1; i >= 0; i--) {
    if (counts[buffer[i]] === bestCount) return buffer[i]
  }
  return buffer[buffer.length - 1]
}

/**
 * Push a new label onto a fixed-size ring buffer.
 * Returns a NEW array (pure).
 */
export function pushFrame(buffer: string[], label: string): string[] {
  const next = [...buffer, label]
  return next.length > SMOOTHING_FRAMES ? next.slice(next.length - SMOOTHING_FRAMES) : next
}

// ---------------------------------------------------------------------------
// DecisionEngine — stateful wrapper around the pure helpers
// ---------------------------------------------------------------------------

/**
 * Stateful gesture decision engine.
 *
 * Usage:
 *   const engine = new DecisionEngine()
 *   // each frame:
 *   const event = engine.update(rawLabel, rawScore, nowMs)
 *   if (event) dispatch(event)
 */
export class DecisionEngine {
  private state: DecisionState = {
    frameBuffer: [],
    dwellLabel: null,
    dwellStart: null,
    lastActionAt: null,
    noHandSince: null,
  }

  /** Expose state for unit tests. */
  getState(): Readonly<DecisionState> {
    return this.state
  }

  /**
   * Process one video frame.
   *
   * @param rawLabel  - MediaPipe categoryName (e.g. 'Open_Palm', 'None').
   * @param rawScore  - Confidence score 0–1.
   * @param nowMs     - Current monotonic timestamp in ms (e.g. performance.now()).
   * @param handPresent - true if ≥1 hand detected in the frame.
   * @returns GestureEvent if an action should fire, null otherwise.
   */
  update(
    rawLabel: string,
    rawScore: number,
    nowMs: number,
    handPresent: boolean,
  ): GestureEvent | null {
    const s = this.state

    // -----------------------------------------------------------------------
    // No-hand grace period: reset dwell after NO_HAND_RESET_MS of absence
    // -----------------------------------------------------------------------
    // noHandSince stores the timestamp of the most recent hand-present frame.
    // When hand is absent: if elapsed since last hand >= NO_HAND_RESET_MS, reset.
    if (!handPresent) {
      const lastHandAt = s.noHandSince // may be null on very first frame
      if (lastHandAt !== null && nowMs - lastHandAt >= NO_HAND_RESET_MS) {
        // Grace expired — reset dwell
        s.dwellLabel = null
        s.dwellStart = null
        s.frameBuffer = []
      }
      // Push NEUTRAL into buffer while hand absent
      s.frameBuffer = pushFrame(s.frameBuffer, NEUTRAL)
      return null
    } else {
      // Hand is present — update last-hand timestamp
      s.noHandSince = nowMs
    }

    // -----------------------------------------------------------------------
    // Threshold + smoothing
    // -----------------------------------------------------------------------
    const thresholded = applyThreshold(rawLabel, rawScore)
    s.frameBuffer = pushFrame(s.frameBuffer, thresholded)
    const smoothed = majorityLabel(s.frameBuffer)

    // -----------------------------------------------------------------------
    // Dwell timer
    // -----------------------------------------------------------------------
    if (smoothed === NEUTRAL || !(smoothed in GESTURE_ACTIONS)) {
      // Different or neutral gesture — reset dwell
      s.dwellLabel = null
      s.dwellStart = null
      return null
    }

    if (s.dwellLabel !== smoothed) {
      // New actionable gesture started
      s.dwellLabel = smoothed
      s.dwellStart = nowMs
      return null
    }

    // Same actionable gesture — check if dwell complete
    const dwellElapsed = nowMs - (s.dwellStart ?? nowMs)
    if (dwellElapsed < DWELL_MS) {
      return null
    }

    // -----------------------------------------------------------------------
    // Cooldown check
    // -----------------------------------------------------------------------
    if (s.lastActionAt !== null && nowMs - s.lastActionAt < COOLDOWN_MS) {
      return null
    }

    // -----------------------------------------------------------------------
    // Emit action
    // -----------------------------------------------------------------------
    const action = GESTURE_ACTIONS[smoothed]
    s.lastActionAt = nowMs
    // Reset dwell so the same gesture doesn't re-fire immediately after cooldown
    s.dwellLabel = null
    s.dwellStart = null
    s.frameBuffer = []

    return { action, gesture: smoothed, confidence: rawScore }
  }

  /** Reset all state (e.g. when switching screens). */
  reset(): void {
    this.state = {
      frameBuffer: [],
      dwellLabel: null,
      dwellStart: null,
      lastActionAt: null,
      noHandSince: null,
    }
  }

  /**
   * Returns the current dwell progress as a fraction 0–1.
   * Useful for driving the DwellRing UI component.
   */
  dwellProgress(nowMs: number): number {
    const s = this.state
    if (s.dwellStart === null || s.dwellLabel === null) return 0
    return Math.min(1, (nowMs - s.dwellStart) / DWELL_MS)
  }
}
