/**
 * DwellRing.tsx — Animated circular progress indicator around the active gesture icon.
 * DESIGN.md §3, §12 tokens: teal-500 fill, 800ms dwell time from config.
 */

import { DWELL_MS } from '../config'

interface DwellRingProps {
  /** Normalized progress fraction from 0.0 to 1.0 */
  progress: number
  /** MediaPipe gesture label (e.g. 'Open_Palm', 'Pointing_Up') */
  gesture?: string
  /** Target kiosk action name (e.g. 'Home', 'Schedule') */
  actionName?: string
  /** Pixel diameter of the ring (default 68) */
  size?: number
  /** Ring stroke width (default 5) */
  strokeWidth?: number
}

const GESTURE_ICONS: Record<string, string> = {
  Open_Palm: '✋',
  Pointing_Up: '☝️',
  Victory: '✌️',
  Thumb_Up: '👍',
  Thumb_Down: '👎',
  ILoveYou: '🤟',
  Closed_Fist: '✊',
}

export default function DwellRing({
  progress,
  gesture = '',
  actionName = '',
  size = 68,
  strokeWidth = 5,
}: DwellRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const strokeDashoffset = circumference - clampedProgress * circumference
  const icon = GESTURE_ICONS[gesture] ?? '✋'
  const isHolding = clampedProgress > 0

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
          />

          {/* Active dwell fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-75 ${
              isHolding
                ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]'
                : 'text-transparent'
            }`}
          />
        </svg>

        {/* Center icon / emoji */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className={`text-2xl transition-transform duration-150 ${
              isHolding ? 'scale-110' : 'scale-100 opacity-70'
            }`}
          >
            {icon}
          </span>
        </div>
      </div>

      {/* Label and hold status */}
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium">
          {isHolding ? 'Holding gesture…' : 'Hold to activate'}
        </span>
        <span className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
          {actionName || gesture || 'Ready'}
          {isHolding && (
            <span className="text-xs text-slate-400 font-mono font-normal">
              {Math.round(clampedProgress * 100)}% ({DWELL_MS}ms)
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
