/**
 * Decision parameters and gesture-to-action configuration for AirTouch Kiosk (Q15).
 * Matching ARCHITECTURE.md Section 6.
 */

export type GestureLabel =
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Victory'
  | 'Thumb_Up'
  | 'Thumb_Down'
  | 'Closed_Fist'
  | 'ILoveYou'
  | 'None'

export type KioskAction =
  'Home' | 'Schedule' | 'Map' | 'Help' | 'Confirm' | 'Back' | 'Lock'

export const GESTURE_ACTIONS: Record<string, KioskAction> = {
  Open_Palm: 'Home',
  Pointing_Up: 'Schedule',
  Victory: 'Map',
  ILoveYou: 'Help',
  Thumb_Up: 'Confirm',
  Thumb_Down: 'Back',
  Closed_Fist: 'Lock',
} as const

/** Minimum confidence score required to accept a gesture (below this -> neutral state) */
export const SCORE_THRESHOLD = 0.7

/** Number of consecutive recent frames used for temporal majority smoothing */
export const SMOOTHING_FRAMES = 7

/** Milliseconds user must hold a gesture steady before action triggers (prevents accidents) */
export const DWELL_MS = 800

/** Milliseconds to ignore gesture triggers after an action executes (prevents double triggers) */
export const COOLDOWN_MS = 1200

/** Milliseconds of missing hand detection before resetting dwell progress */
export const NO_HAND_RESET_MS = 300
