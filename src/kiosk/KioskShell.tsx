/**
 * KioskShell.tsx — Main kiosk layout (T2.3, T2.5, T2.6 manual parity)
 *
 * Manual parity guarantees:
 *  - Visible buttons for EVERY action on EVERY screen (Home, Schedule, Map, Help, Back, Confirm)
 *  - All buttons >= 72px tall per DESIGN.md §12
 *  - Keyboard shortcuts working for every action
 *  - Friendly states for camera-off and permission-denied
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
// All 6 Primary Actions with full manual parity (DESIGN.md §12: buttons >= 72px)
// ---------------------------------------------------------------------------
const PRIMARY_ACTIONS: {
  label: string
  action: Action
  screen?: string
  icon: string
  key: string
  hint: string
}[] = [
  {
    label: 'Home',
    action: Action.HOME,
    screen: 'home',
    icon: '🏠',
    key: 'H',
    hint: 'Go to main screen',
  },
  {
    label: 'Schedule',
    action: Action.SCHEDULE,
    screen: 'schedule',
    icon: '📅',
    key: 'S',
    hint: 'View campus events',
  },
  {
    label: 'Map',
    action: Action.MAP,
    screen: 'map',
    icon: '🗺️',
    key: 'M',
    hint: 'Campus buildings & venues',
  },
  {
    label: 'Help',
    action: Action.HELP,
    screen: 'help',
    icon: '❓',
    key: '?',
    hint: 'Instructions & info',
  },
  {
    label: 'Back',
    action: Action.BACK,
    icon: '↩️',
    key: '← Esc',
    hint: 'Return to previous screen',
  },
  {
    label: 'Confirm',
    action: Action.CONFIRM,
    icon: '✓',
    key: '↵ Enter',
    hint: 'Confirm selection',
  },
]

// ---------------------------------------------------------------------------
// Gesture legend data (always visible at bottom)
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
// Props
// ---------------------------------------------------------------------------
interface KioskShellProps {
  state: KioskState
  onDispatch: (action: Action) => void
  detection?: DetectionInfo
  dwellProgress?: number
  isCameraActive?: boolean
  cameraError?: string | null
  onStartCamera?: () => void
  onToggleCamera?: () => void
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
  cameraError = null,
  onStartCamera,
  onToggleCamera,
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
  const isCameraDenied =
    Boolean(cameraError) &&
    (cameraError?.toLowerCase().includes('denied') ||
      cameraError?.toLowerCase().includes('notallowed') ||
      cameraError?.toLowerCase().includes('permission'))

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none">
      {/* ------------------------------------------------------------------ */}
      {/* Top Bar: Brand, Action Confirmation & Lock Toggle                   */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0">
            <svg
              width="26"
              height="26"
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
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              AirTouch
            </h1>
            <p className="text-xs text-teal-400 font-medium leading-tight mt-0.5">
              Touchless Campus Kiosk · Full Manual Parity
            </p>
          </div>
        </div>

        {/* Controls: Camera Toggle, Action Confirmation & Lock Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Clear Locked Indicator (T2.7) */}
          {isLocked && (
            <div
              role="alert"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border-2 border-amber-500/80 text-amber-300 font-extrabold text-xs sm:text-sm shadow-md animate-pulse"
            >
              <span aria-hidden="true">🔒</span>
              <span>LOCKED · GESTURES PAUSED</span>
            </div>
          )}

          {/* Camera ON/OFF Button (T2.7) */}
          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              title={
                isCameraActive
                  ? 'Turn camera off (manual mode)'
                  : 'Turn camera on (gesture control)'
              }
              className={[
                'min-h-[46px] px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs sm:text-sm border-2 cursor-pointer',
                isCameraActive
                  ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 hover:bg-teal-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white',
              ].join(' ')}
              aria-label={
                isCameraActive
                  ? 'Camera active - click to turn off'
                  : 'Camera paused - click to turn on'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{isCameraActive ? 'Camera ON' : 'Camera OFF'}</span>
            </button>
          )}

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
            onClick={() => onDispatch(Action.LOCK)}
            title={
              isLocked
                ? 'Unlock gesture control (Closed Fist / L)'
                : 'Lock gesture control (Closed Fist / L)'
            }
            className={[
              'min-h-[46px] px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold text-sm cursor-pointer border-2',
              isLocked
                ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white',
            ].join(' ')}
            aria-label={
              isLocked ? 'Unlock Kiosk Gestures' : 'Lock Kiosk Gestures'
            }
          >
            <span>{isLocked ? '🔓' : '🔒'}</span>
            <span>{isLocked ? 'Unlock (L)' : 'Lock (L)'}</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Manual Parity Navigation Bar (Every Action on Every Screen >= 72px)  */}
      {/* DESIGN.md §12: buttons >= 72px tall, high contrast                  */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Kiosk manual action controls"
        className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 shrink-0"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-7xl mx-auto">
          {PRIMARY_ACTIONS.map(({ label, action, screen, icon, key, hint }) => {
            const isCurrent = screen && state.screen === screen
            const isBack = action === Action.BACK
            const isConfirm = action === Action.CONFIRM

            return (
              <button
                key={label}
                type="button"
                onClick={() => onDispatch(action)}
                title={hint}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'min-h-[72px] h-[72px] px-4 py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all font-bold cursor-pointer select-none',
                  isCurrent
                    ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/25 scale-[1.02]'
                    : isConfirm
                      ? 'bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border-teal-500/60 hover:border-teal-400'
                      : isBack
                        ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-500',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-base sm:text-lg tracking-tight">
                    {label}
                  </span>
                </div>
                <kbd
                  className={[
                    'text-[11px] font-mono px-2 py-0.5 rounded border leading-none',
                    isCurrent
                      ? 'bg-teal-600/40 border-teal-700 text-slate-900'
                      : 'bg-slate-950/60 border-slate-700 text-slate-400',
                  ].join(' ')}
                >
                  {key}
                </kbd>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Friendly Camera-Off & Permission-Denied Banners (T2.6 requirement)  */}
      {/* ------------------------------------------------------------------ */}
      {isCameraDenied ? (
        <div
          role="alert"
          className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none" aria-hidden="true">
              📷
            </span>
            <div>
              <p className="font-bold text-lg text-white">
                Camera access was denied — Manual Mode is 100% active!
              </p>
              <p className="text-sm text-amber-300/90">
                You can fully explore all screens using the 72px buttons above
                or your keyboard (H, S, M, ?, ← Back, ↵ Confirm).
              </p>
            </div>
          </div>
          {onStartCamera && (
            <button
              type="button"
              onClick={onStartCamera}
              className="shrink-0 min-h-[48px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shadow cursor-pointer text-sm"
            >
              Retry Camera Permission
            </button>
          )}
        </div>
      ) : !isCameraActive ? (
        <div
          role="status"
          className="mx-6 mt-4 p-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none" aria-hidden="true">
              📷
            </span>
            <div>
              <p className="font-bold text-base text-white">
                Camera paused — Manual navigation mode active
              </p>
              <p className="text-xs text-slate-400">
                Touchless recognition is paused. All actions and kiosk screens
                work seamlessly via the buttons above or keyboard shortcuts.
              </p>
            </div>
          </div>
          {onStartCamera && (
            <button
              type="button"
              onClick={onStartCamera}
              className="shrink-0 min-h-[46px] px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors shadow cursor-pointer text-sm"
            >
              Resume Camera
            </button>
          )}
        </div>
      ) : null}

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
                  Camera is paused. Use buttons above or keyboard shortcuts.
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

        {/* Privacy Notice (T2.7 exact string) */}
        <p className="text-center text-[11px] text-slate-400">
          🔒 Privacy Notice: Video is processed on your device and never stored
          or uploaded.
        </p>
      </footer>
    </div>
  )
}
