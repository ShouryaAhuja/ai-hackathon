/**
 * ConfidenceMeter.tsx — Real-time gesture confidence indicator.
 * DESIGN.md §3, §12 tokens: teal-500 (#14b8a6) when >= threshold (0.70),
 * amber-500 when below threshold.
 * All threshold values imported from src/config.ts.
 */

import { SCORE_THRESHOLD } from '../config'

interface ConfidenceMeterProps {
  /** Confidence score between 0 and 1 */
  score: number
  /** Whether at least one hand is detected in frame */
  handPresent: boolean
  /** Current gesture label or null */
  gesture?: string
  /** Minimum acceptance threshold, defaults to SCORE_THRESHOLD */
  threshold?: number
  /** Optional compact styling */
  compact?: boolean
}

export default function ConfidenceMeter({
  score,
  handPresent,
  gesture = 'None',
  threshold = SCORE_THRESHOLD,
  compact = false,
}: ConfidenceMeterProps) {
  const percentage = handPresent ? Math.round(score * 100) : 0
  const isConfident = handPresent && score >= threshold
  const isNeutral = handPresent && score < threshold

  // Bar fill color per DESIGN.md §12: teal-500 for valid, amber-500 for uncertain
  const barColor = !handPresent
    ? 'bg-slate-700'
    : isConfident
      ? 'bg-teal-500'
      : 'bg-amber-500'

  const textColor = !handPresent
    ? 'text-slate-500'
    : isConfident
      ? 'text-teal-400'
      : 'text-amber-400'

  return (
    <div
      className={`flex flex-col gap-1.5 ${compact ? 'min-w-[160px]' : 'min-w-[220px]'}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Gesture recognition confidence"
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              !handPresent
                ? 'bg-slate-600'
                : isConfident
                  ? 'bg-teal-400 animate-pulse'
                  : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="font-sans font-medium text-slate-300">
            {handPresent ? gesture : 'No Hand'}
          </span>
        </span>
        <span className={`font-bold ${textColor}`}>
          {percentage}%
          <span className="text-[10px] text-slate-500 font-normal ml-1">
            (min {Math.round(threshold * 100)}%)
          </span>
        </span>
      </div>

      {/* Progress track with threshold marker */}
      <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
        {/* Fill bar */}
        <div
          className={`h-full transition-all duration-150 ease-out rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Threshold indicator line at 70% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 pointer-events-none"
          style={{ left: `${Math.round(threshold * 100)}%` }}
          title={`Threshold: ${Math.round(threshold * 100)}%`}
        />
      </div>

      {/* Helper caption */}
      {isNeutral && (
        <span className="text-[10px] text-amber-400/90 font-medium">
          Below threshold (hold steady)
        </span>
      )}
    </div>
  )
}
