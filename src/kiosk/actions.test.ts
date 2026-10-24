/**
 * actions.test.ts — Vitest unit tests for src/kiosk/actions.ts
 *
 * Tests cover the kioskReducer: all navigation transitions, BACK history,
 * CONFIRM no-op, LOCK, and keyboard shortcut mapping.
 */

import { describe, it, expect } from 'vitest'
import {
  Action,
  kioskReducer,
  keyToAction,
  INITIAL_STATE,
  type KioskState,
} from './actions'

// ---------------------------------------------------------------------------
// kioskReducer — screen navigation
// ---------------------------------------------------------------------------
describe('kioskReducer — navigation', () => {
  it('starts on "home" with empty history', () => {
    expect(INITIAL_STATE.screen).toBe('home')
    expect(INITIAL_STATE.history).toHaveLength(0)
  })

  it('navigates from home to schedule via SCHEDULE', () => {
    const next = kioskReducer(INITIAL_STATE, Action.SCHEDULE)
    expect(next.screen).toBe('schedule')
    expect(next.history).toEqual(['home'])
    expect(next.lastAction).toBe(Action.SCHEDULE)
  })

  it('navigates from home to map via MAP', () => {
    const next = kioskReducer(INITIAL_STATE, Action.MAP)
    expect(next.screen).toBe('map')
    expect(next.history).toEqual(['home'])
  })

  it('navigates from home to help via HELP', () => {
    const next = kioskReducer(INITIAL_STATE, Action.HELP)
    expect(next.screen).toBe('help')
  })

  it('navigates to locked via LOCK', () => {
    const next = kioskReducer(INITIAL_STATE, Action.LOCK)
    expect(next.screen).toBe('locked')
    expect(next.history).toEqual(['home'])
  })

  it('navigates to home from any screen via HOME', () => {
    const fromMap = kioskReducer(
      { ...INITIAL_STATE, screen: 'map', history: ['home'] },
      Action.HOME,
    )
    expect(fromMap.screen).toBe('home')
    expect(fromMap.history).toEqual(['home', 'map'])
  })

  it('does not add duplicate to history when already on target screen', () => {
    const state = kioskReducer(INITIAL_STATE, Action.SCHEDULE) // → schedule
    const again = kioskReducer(state, Action.SCHEDULE) // still schedule
    expect(again.screen).toBe('schedule')
    // history should not grow (already there)
    expect(again.history).toEqual(['home'])
  })
})

// ---------------------------------------------------------------------------
// kioskReducer — BACK
// ---------------------------------------------------------------------------
describe('kioskReducer — BACK', () => {
  it('goes to previous screen when history has entries', () => {
    const state: KioskState = {
      screen: 'schedule',
      history: ['home'],
      lastAction: Action.SCHEDULE,
    }
    const next = kioskReducer(state, Action.BACK)
    expect(next.screen).toBe('home')
    expect(next.history).toHaveLength(0)
  })

  it('stays on current screen when history is empty (root)', () => {
    const next = kioskReducer(INITIAL_STATE, Action.BACK)
    expect(next.screen).toBe('home')
    expect(next.history).toHaveLength(0)
    expect(next.lastAction).toBe(Action.BACK)
  })

  it('supports multi-level navigation and unwinding', () => {
    let state = kioskReducer(INITIAL_STATE, Action.SCHEDULE) // home → schedule
    state = kioskReducer(state, Action.MAP) // schedule → map
    expect(state.screen).toBe('map')
    expect(state.history).toEqual(['home', 'schedule'])

    state = kioskReducer(state, Action.BACK) // → schedule
    expect(state.screen).toBe('schedule')
    expect(state.history).toEqual(['home'])

    state = kioskReducer(state, Action.BACK) // → home
    expect(state.screen).toBe('home')
    expect(state.history).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// kioskReducer — CONFIRM (contextual no-op)
// ---------------------------------------------------------------------------
describe('kioskReducer — CONFIRM', () => {
  it('records lastAction but does not change screen or history', () => {
    const state: KioskState = {
      screen: 'schedule',
      history: ['home'],
      lastAction: null,
    }
    const next = kioskReducer(state, Action.CONFIRM)
    expect(next.screen).toBe('schedule')
    expect(next.history).toEqual(['home'])
    expect(next.lastAction).toBe(Action.CONFIRM)
  })
})

// ---------------------------------------------------------------------------
// keyToAction — keyboard shortcut mapping
// ---------------------------------------------------------------------------
describe('keyToAction', () => {
  it('maps ArrowLeft to BACK', () => {
    expect(keyToAction('ArrowLeft')).toBe(Action.BACK)
  })

  it('maps Escape to BACK', () => {
    expect(keyToAction('Escape')).toBe(Action.BACK)
  })

  it('maps Enter to CONFIRM', () => {
    expect(keyToAction('Enter')).toBe(Action.CONFIRM)
  })

  it('maps "h" to HOME', () => {
    expect(keyToAction('h')).toBe(Action.HOME)
  })

  it('maps "s" to SCHEDULE', () => {
    expect(keyToAction('s')).toBe(Action.SCHEDULE)
  })

  it('maps "m" to MAP', () => {
    expect(keyToAction('m')).toBe(Action.MAP)
  })

  it('maps "l" to LOCK', () => {
    expect(keyToAction('l')).toBe(Action.LOCK)
  })

  it('returns null for unmapped key', () => {
    expect(keyToAction('x')).toBeNull()
  })

  it('returns null when Ctrl modifier is held (browser shortcut avoidance)', () => {
    expect(keyToAction('s', { ctrl: true })).toBeNull()
  })

  it('returns null when Alt modifier is held', () => {
    expect(keyToAction('h', { alt: true })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// KioskAction compatibility (T2.4 wiring: gesture event -> kioskReducer)
// ---------------------------------------------------------------------------
describe('kioskReducer — KioskAction compatibility', () => {
  it('handles "Schedule" KioskAction string', () => {
    const next = kioskReducer(INITIAL_STATE, 'Schedule')
    expect(next.screen).toBe('schedule')
    expect(next.history).toEqual(['home'])
    expect(next.lastAction).toBe(Action.SCHEDULE)
  })

  it('handles "Map" KioskAction string', () => {
    const next = kioskReducer(INITIAL_STATE, 'Map')
    expect(next.screen).toBe('map')
    expect(next.history).toEqual(['home'])
    expect(next.lastAction).toBe(Action.MAP)
  })

  it('handles "Back" KioskAction string to unwind navigation', () => {
    const state = kioskReducer(INITIAL_STATE, 'Schedule')
    const back = kioskReducer(state, 'Back')
    expect(back.screen).toBe('home')
    expect(back.history).toEqual([])
  })

  it('handles "Home", "Confirm", "Lock" KioskAction strings', () => {
    const lock = kioskReducer(INITIAL_STATE, 'Lock')
    expect(lock.screen).toBe('locked')
    expect(lock.lastAction).toBe(Action.LOCK)

    const confirm = kioskReducer(INITIAL_STATE, 'Confirm')
    expect(confirm.lastAction).toBe(Action.CONFIRM)

    const home = kioskReducer(
      { ...INITIAL_STATE, screen: 'map', history: ['home'] },
      'Home',
    )
    expect(home.screen).toBe('home')
    expect(home.lastAction).toBe(Action.HOME)
  })

  it('handles "Help" KioskAction string to navigate to help screen', () => {
    const next = kioskReducer(INITIAL_STATE, 'Help')
    expect(next.screen).toBe('help')
    expect(next.history).toEqual(['home'])
    expect(next.lastAction).toBe(Action.HELP)
  })
})
