/**
 * KioskShell.tsx — Main kiosk layout with integrated feedback status strip (T2.3, T2.5)
 * Follows DESIGN.md §3, §4, §12.
 */

import { useEffect, useCallback } from 'react'
import { Action, keyToAction, type KioskState } from './actions'
import { SCORE_THRESHOLD, GESTURE_ACTIONS } from '../config'
import ConfidenceMeter from '../ui/ConfidenceMeter'
import DwellRing from '../ui/DwellRing'
import NeutralBanner from '../ui/NeutralBanner'
import HomeScreen from './screens/HomeScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import MapScreen from './screens/MapScreen'
import HelpScreen from './screens/HelpScreen'
import LockedScreen from './screens/LockedScreen'

export interface DetectionInfo {
  gesture: string
  score: number
  handedness: string
  handsCount: number
}

// ---------------------------------------------------------------------------
// Gesture legend data (DESIGN.md §12: always visible, all 6 gestures + Lock)
// ---------------------------------------------------------------------------
const GESTURE_LEGEND = [
  {
    gestureKey: 'Open_Palm',
    emoji: '✋',
    label: 'Open Palm',
    action: 'Home',
    key: 'H',
  },
  {
    gestureKey: 'Pointing_Up',
    emoji: '☝️',
    label: 'Point Up',
    action: 'Schedule',
    key: 'S',
  },
  {
    gestureKey: 'Victory',
    emoji: '✌️',
    label: 'Victory',
    action: 'Map',
    key: 'M',
  },
  {
    gestureKey: 'ILoveYou',
    emoji: '🤟',
    label: 'ILY',
    action: 'Help',
    key: '?',
  },
  {
    gestureKey: 'Thumb_Up',
    emoji: '👍',
    label: 'Thumb Up',
    action: 'Confirm',
    key: '↵',
  },
  {
    gestureKey: 'Thumb_Down',
    emoji: '👎',
    label: 'Thumb Down',
    action: 'Back',
    key: '←',
  },
  {
    gestureKey: 'Closed_Fist',
    emoji: '✊',
    label: 'Fist',
    action: 'Lock',
    key: 'L',
  },
] as const

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------
const NAV_ITEMS: { label: string; action: Action; screen: string }[] = [
  { label: 'Home', action: Action.HOME, screen: 'home' },
  { label: 'Schedule', action: Action.SCHEDULE, screen: 'schedule' },
  { label: 'Map', action: Action.MAP, screen: 'map' },
  { label: 'Help', action: Action.HELP, screen: 'help' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface KioskShellProps {
  state: KioskState
  onDispatch: (action: Action) => void
  detection?: DetectionInfo
  dwellProgress?: number
  isCameraActive?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KioskShell({
  state,
  onDispatch,
  detection = { gesture: 'None', score: 0, handedness: '-', handsCount: 0 },
  dwellProgress = 0,
  isCameraActive = true,
}: KioskShellProps) {
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
      case 'schedule':
        return <ScheduleScreen onDispatch={onDispatch} />
      case 'map':
        return <MapScreen onDispatch={onDispatch} />
      case 'help':
        return <HelpScreen onDispatch={onDispatch} />
      case 'locked':
        return <LockedScreen onDispatch={onDispatch} />
      default:
        return <HomeScreen onDispatch={onDispatch} />
    }
  }

  const isLocked = state.screen === 'locked'
  const isHandPresent = detection.handsCount > 0
  const activeGesture = detection.gesture
  const isActionable = activeGesture in GESTURE_ACTIONS
  const isConfident =
    isHandPresent && isActionable && detection.score >= SCORE_THRESHOLD
  const isNeutral = isHandPresent && !isConfident
  const targetActionName = isActionable
    ? GESTURE_ACTIONS[activeGesture]
    : undefined

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              className="text-teal-400"
              aria-hidden="true"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.5"
              />
              <path
                d="M10 14v-5a1 1 0 0 1 2 0v3m0 0v-2a1 1 0 0 1 2 0v2m0 0v-1a1 1 0 0 1 2 0v3m0 0a1 1 0 0 1 2 0v2c0 2-1.5 4-4 5l-1 .5c-2 1-3-1-2-2.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

        {/* Action badge & Lock / Unlock button */}
        <div className="flex items-center gap-3">
          {state.lastAction && (
            <div
              role="status"
              aria-live="polite"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-semibold animate-in fade-in duration-150"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Action: {state.lastAction}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onDispatch(isLocked ? Action.HOME : Action.LOCK)}
            title={
              isLocked
                ? 'Unlock kiosk (Home)'
                : 'Lock kiosk (Fist gesture or L)'
            }
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
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content area                                                  */}
      {/* ------------------------------------------------------------------ */}
      <main
        className="flex-1 overflow-auto"
        role="main"
        aria-live="polite"
        aria-atomic="true"
      >
        {renderScreen()}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Status strip at bottom (DESIGN.md §12)                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="shrink-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3 flex flex-col gap-2.5">
        {/* Real-time feedback bar: Neutral banner, Dwell ring, Confidence meter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl">
          {/* Left: NeutralBanner OR guidance state */}
          <div className="flex items-center min-h-[38px] flex-1">
            {isNeutral ? (
              <NeutralBanner visible={true} />
            ) : isConfident ? (
              <div className="flex items-center gap-2 text-sm text-teal-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span>
                  Holding <strong>{targetActionName}</strong> gesture…
                </span>
              </div>
            ) : isHandPresent ? (
              <div className="text-xs text-slate-400">
                Hand detected — hold a gesture steady for 800ms to activate
              </div>
            ) : !isCameraActive ? (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>📷</span>
                <span>
                  Camera is paused. Use on-screen buttons or keyboard shortcuts.
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>👋</span>
                <span>Show hand in camera to navigate touchlessly</span>
              </div>
            )}
          </div>

          {/* Center: DwellRing */}
          <div className="shrink-0 flex items-center justify-center">
            <DwellRing
              progress={dwellProgress}
              gesture={isActionable ? activeGesture : ''}
              actionName={targetActionName}
              size={52}
              strokeWidth={4}
            />
          </div>

          {/* Right: ConfidenceMeter */}
          <div className="shrink-0">
            <ConfidenceMeter
              score={detection.score}
              handPresent={isHandPresent}
              gesture={detection.gesture}
              threshold={SCORE_THRESHOLD}
            />
          </div>
        </div>

        {/* Permanent Gesture Legend */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-xs text-slate-500 mr-2 shrink-0 font-medium">
            Gestures:
          </span>
          {GESTURE_LEGEND.map(({ gestureKey, emoji, label, action, key }) => {
            const isMatch = activeGesture === gestureKey && isHandPresent
            const isHighlighted = isMatch && isConfident

            return (
              <div
                key={action}
                className={[
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs sm:text-sm transition-all duration-150 border',
                  isHighlighted
                    ? 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-md shadow-teal-500/20 scale-105'
                    : isMatch
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-300',
                ].join(' ')}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {emoji}
                </span>
                <span className="font-medium">{label}</span>
                <span className="text-slate-500">→</span>
                <span
                  className={
                    isHighlighted
                      ? 'text-teal-300 font-bold'
                      : 'text-teal-400 font-semibold'
                  }
                >
                  {action}
                </span>
                <kbd className="ml-1 text-[11px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-600">
                  {key}
                </kbd>
              </div>
            )
          })}
        </div>
      </footer>
    </div>
  )
}
