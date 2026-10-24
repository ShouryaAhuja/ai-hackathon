/**
 * KioskShell.tsx — Main kiosk layout (T2.3)
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ Header: logo | product name | nav tabs        │
 *   ├──────────────────────────────────────────────┤
 *   │ Screen content (full-height, scrollable)      │
 *   ├──────────────────────────────────────────────┤
 *   │ Status strip (gesture legend + last action)   │
 *   └──────────────────────────────────────────────┘
 *
 * Keyboard shortcuts: wired here, drive the same dispatcher as gestures.
 * Every nav tab is a visible button (accessibility parity, DESIGN.md §12).
 */

import { useEffect, useCallback } from 'react'
import {
  Action,
  keyToAction,
  type KioskState,
} from './actions'
import HomeScreen from './screens/HomeScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import MapScreen from './screens/MapScreen'
import HelpScreen from './screens/HelpScreen'
import LockedScreen from './screens/LockedScreen'

// ---------------------------------------------------------------------------
// Gesture legend data (shown permanently at the bottom)
// ---------------------------------------------------------------------------
const GESTURE_LEGEND = [
  { gesture: '✋ Open Palm', action: 'Home',     key: 'H' },
  { gesture: '☝️ Point Up',  action: 'Schedule', key: 'S' },
  { gesture: '✌️ Victory',   action: 'Map',      key: 'M' },
  { gesture: '🤟 ILY',       action: 'Help',     key: '?' },
  { gesture: '👍 Thumb Up',  action: 'Confirm',  key: '↵' },
  { gesture: '👎 Thumb Down', action: 'Back',    key: '←' },
  { gesture: '✊ Fist',      action: 'Lock',     key: 'L' },
] as const

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------
const NAV_ITEMS: { label: string; action: Action; screen: string }[] = [
  { label: 'Home',     action: Action.HOME,     screen: 'home'     },
  { label: 'Schedule', action: Action.SCHEDULE, screen: 'schedule' },
  { label: 'Map',      action: Action.MAP,      screen: 'map'      },
  { label: 'Help',     action: Action.HELP,     screen: 'help'     },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface KioskShellProps {
  state: KioskState
  onDispatch: (action: Action) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KioskShell({ state, onDispatch }: KioskShellProps) {
  // Keyboard handler
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const action = keyToAction(e.key, {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
      })
      if (action !== null) {
        e.preventDefault()
        onDispatch(action)
      }
    },
    [onDispatch],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Screen router
  const renderScreen = () => {
    switch (state.screen) {
      case 'schedule': return <ScheduleScreen onDispatch={onDispatch} />
      case 'map':      return <MapScreen onDispatch={onDispatch} />
      case 'help':     return <HelpScreen onDispatch={onDispatch} />
      case 'locked':   return <LockedScreen onDispatch={onDispatch} />
      default:         return <HomeScreen onDispatch={onDispatch} />
    }
  }

  const isLocked = state.screen === 'locked'

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-4">
          {/* Hand-ring logo mark */}
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-teal-400">
              <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" opacity="0.5"/>
              <path d="M10 14v-5a1 1 0 0 1 2 0v3m0 0v-2a1 1 0 0 1 2 0v2m0 0v-1a1 1 0 0 1 2 0v3m0 0a1 1 0 0 1 2 0v2c0 2-1.5 4-4 5l-1 .5c-2 1-3-1-2-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
              AirTouch
            </h1>
            <p className="text-sm text-teal-400 font-medium leading-tight mt-0.5">
              Touchless Campus Kiosk
            </p>
          </div>
        </div>

        {/* Nav tabs (disabled when locked) */}
        {!isLocked && (
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, action, screen }) => (
              <button
                key={label}
                type="button"
                onClick={() => onDispatch(action)}
                aria-current={state.screen === screen ? 'page' : undefined}
                className={[
                  'px-5 py-3 rounded-xl text-lg font-semibold transition-all duration-200 min-w-[80px]',
                  state.screen === screen
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Lock / Unlock button */}
        <button
          type="button"
          onClick={() => onDispatch(isLocked ? Action.HOME : Action.LOCK)}
          title={isLocked ? 'Unlock kiosk (Home)' : 'Lock kiosk (Fist gesture or L)'}
          className={[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors text-xl',
            isLocked
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white',
          ].join(' ')}
          aria-label={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content area                                                   */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 overflow-auto" role="main" aria-live="polite" aria-atomic="true">
        {renderScreen()}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Status strip — gesture legend always visible (DESIGN.md §12)       */}
      {/* ------------------------------------------------------------------ */}
      <footer className="shrink-0 border-t border-slate-800 bg-slate-900/60 px-6 py-3">
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <span className="text-xs text-slate-500 mr-2 shrink-0">Gesture legend:</span>
          {GESTURE_LEGEND.map(({ gesture, action, key }) => (
            <div
              key={action}
              className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm"
            >
              <span className="text-base leading-none">{gesture.split(' ')[0]}</span>
              <span className="text-slate-300 font-medium">{gesture.split(' ').slice(1).join(' ')}</span>
              <span className="text-slate-500">→</span>
              <span className="text-teal-400 font-semibold">{action}</span>
              <kbd className="ml-1 text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-600">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        {state.lastAction && (
          <p className="text-center text-xs text-slate-500 mt-1" aria-live="polite">
            Last action:{' '}
            <span className="text-teal-400 font-semibold">{state.lastAction}</span>
          </p>
        )}
      </footer>
    </div>
  )
}

// App.tsx imports kioskReducer and INITIAL_STATE directly from './kiosk/actions'
