/**
 * actions.ts — Kiosk action system (T2.2)
 *
 * Exports:
 *  - Action enum        — canonical set of kiosk actions
 *  - KioskScreen type   — valid screen names
 *  - KioskState         — full reducer state
 *  - kioskReducer       — pure state reducer (no side-effects)
 *  - dispatch / useKioskDispatch — global dispatcher + React hook
 *
 * Keyboard shortcuts (wired up in <KioskShell> via useEffect):
 *   ArrowLeft / Backspace / Escape → BACK
 *   ArrowRight / Enter             → CONFIRM
 *   Home / h                       → HOME
 *   s                              → SCHEDULE
 *   m                              → MAP
 *   ?                              → HELP
 *   l                              → LOCK
 *
 * Design rule: every gesture action must have a keyboard equivalent and a
 * visible button (accessibility parity per DESIGN.md section 12).
 */

import type { KioskAction } from '../config'

// ---------------------------------------------------------------------------
// Action "enum" (const object — compatible with erasableSyntaxOnly TS mode)
// ---------------------------------------------------------------------------

export const Action = {
  HOME: 'HOME',
  SCHEDULE: 'SCHEDULE',
  MAP: 'MAP',
  HELP: 'HELP',
  BACK: 'BACK',
  CONFIRM: 'CONFIRM',
  LOCK: 'LOCK',
} as const

export type Action = (typeof Action)[keyof typeof Action]

export type KioskDispatchAction = Action | KioskAction

const KIOSK_ACTION_TO_ACTION: Record<KioskAction, Action> = {
  Home: Action.HOME,
  Schedule: Action.SCHEDULE,
  Map: Action.MAP,
  Help: Action.HELP,
  Confirm: Action.CONFIRM,
  Back: Action.BACK,
  Lock: Action.LOCK,
}

export function isKioskAction(action: unknown): action is KioskAction {
  return typeof action === 'string' && action in KIOSK_ACTION_TO_ACTION
}

export function toAction(action: Action | KioskAction): Action {
  if (isKioskAction(action)) {
    return KIOSK_ACTION_TO_ACTION[action]
  }
  return action
}

// ---------------------------------------------------------------------------
// Screen type + navigation graph
// ---------------------------------------------------------------------------

export type KioskScreen = 'home' | 'schedule' | 'map' | 'help' | 'locked'

/**
 * Where each action navigates to from a given screen.
 * null means "stay on current screen" (handled separately via CONFIRM / BACK).
 */
export const SCREEN_MAP: Record<Action, KioskScreen | null> = {
  [Action.HOME]: 'home',
  [Action.SCHEDULE]: 'schedule',
  [Action.MAP]: 'map',
  [Action.HELP]: 'help',
  [Action.BACK]: null, // resolved by reducer history
  [Action.CONFIRM]: null, // contextual; currently a no-op / placeholder
  [Action.LOCK]: 'locked',
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface KioskState {
  screen: KioskScreen
  /** Navigation history stack for BACK support. */
  history: KioskScreen[]
  /** Set to true when action cooldown animation should show (cleared by caller). */
  lastAction: Action | null
}

export const INITIAL_STATE: KioskState = {
  screen: 'home',
  history: [],
  lastAction: null,
}

// ---------------------------------------------------------------------------
// Reducer (pure — no side-effects, no DOM, no refs)
// ---------------------------------------------------------------------------

export function kioskReducer(state: KioskState, rawAction: Action | KioskAction): KioskState {
  const action = toAction(rawAction)
  switch (action) {
    case Action.BACK: {
      if (state.history.length === 0) {
        // Already at root — stay (no navigation)
        return { ...state, lastAction: action }
      }
      const prev = state.history[state.history.length - 1]
      return {
        screen: prev,
        history: state.history.slice(0, -1),
        lastAction: action,
      }
    }

    case Action.CONFIRM: {
      // CONFIRM is contextual — currently a no-op that records the intent.
      // Screens that need confirm behaviour (e.g. lock confirmation) can
      // inspect lastAction in their own logic.
      return { ...state, lastAction: action }
    }

    case Action.HOME:
    case Action.SCHEDULE:
    case Action.MAP:
    case Action.HELP:
    case Action.LOCK: {
      const targetScreen = SCREEN_MAP[action]!
      if (state.screen === targetScreen) {
        // Already here — just record the action
        return { ...state, lastAction: action }
      }
      return {
        screen: targetScreen,
        history: [...state.history, state.screen],
        lastAction: action,
      }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Keyboard shortcut map (key → Action)
// ---------------------------------------------------------------------------

export const KEYBOARD_SHORTCUTS: Record<string, Action> = {
  // BACK
  ArrowLeft: Action.BACK,
  Backspace: Action.BACK,
  Escape: Action.BACK,
  // CONFIRM
  ArrowRight: Action.CONFIRM,
  Enter: Action.CONFIRM,
  // Navigation
  Home: Action.HOME,
  h: Action.HOME,
  s: Action.SCHEDULE,
  m: Action.MAP,
  '?': Action.HELP,
  l: Action.LOCK,
}

/**
 * Returns the Action for a given keyboard event key, or null if not mapped.
 * Ignores modifier keys (Ctrl, Alt, Meta) to avoid conflicts with browser shortcuts.
 */
export function keyToAction(
  key: string,
  modifiers: { ctrl?: boolean; alt?: boolean; meta?: boolean } = {},
): Action | null {
  if (modifiers.ctrl || modifiers.alt || modifiers.meta) return null
  return KEYBOARD_SHORTCUTS[key] ?? null
}
