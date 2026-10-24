/**
 * types.ts — Types for AirTouch Test Mode & Evaluation Pipeline (T3.1)
 *
 * Captures true gesture labels, condition tags, frame samples,
 * trial records, and aggregate summary metrics.
 */

export type TrueGesture =
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Victory'
  | 'Thumb_Up'
  | 'Thumb_Down'
  | 'ILoveYou'
  | 'Closed_Fist'
  | 'None'

export type ConditionTag =
  'C1_baseline' | 'C2_dim' | 'C3_backlit' | 'C4_cluttered'

export type TrialVerdict = 'correct' | 'neutral' | 'incorrect'

export interface TrueGestureOption {
  value: TrueGesture
  label: string
  emoji: string
  action: string
}

export const TRUE_GESTURE_OPTIONS: TrueGestureOption[] = [
  { value: 'Open_Palm', label: 'Open Palm', emoji: '✋', action: 'Home' },
  { value: 'Pointing_Up', label: 'Point Up', emoji: '☝️', action: 'Schedule' },
  { value: 'Victory', label: 'Victory (V)', emoji: '✌️', action: 'Map' },
  { value: 'ILoveYou', label: 'I-Love-You', emoji: '🤟', action: 'Help' },
  { value: 'Thumb_Up', label: 'Thumb Up', emoji: '👍', action: 'Confirm' },
  { value: 'Thumb_Down', label: 'Thumb Down', emoji: '👎', action: 'Back' },
  { value: 'Closed_Fist', label: 'Closed Fist', emoji: '✊', action: 'Lock' },
  { value: 'None', label: 'No Gesture', emoji: '🚫', action: 'None / Other' },
]

export interface ConditionOption {
  value: ConditionTag
  label: string
  description: string
  badgeColor: string
}

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    value: 'C1_baseline',
    label: 'C1: Baseline',
    description: 'Good indoor light, plain uncluttered background',
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
  {
    value: 'C2_dim',
    label: 'C2: Dim Light',
    description: 'Low ambient light, overheads dimmed or off',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    value: 'C3_backlit',
    label: 'C3: Backlit',
    description: 'Window or lamp behind user causing silhouette',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    value: 'C4_cluttered',
    label: 'C4: Cluttered',
    description: 'Complex background with movement or objects',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
]

export interface FrameSample {
  timestamp: number
  rawLabel: string
  rawScore: number
  predictedLabel: string
  latencyMs: number
}

export interface TrialRecord {
  /** ISO timestamp string */
  timestamp: string
  /** Unique session ID */
  session_id: string
  /** Condition tag (e.g. C1_baseline) */
  condition: ConditionTag | string
  /** True gesture performed by user */
  true_gesture: TrueGesture | string
  /** Predicted label after thresholding (incl. NEUTRAL) */
  predicted: string
  /** Raw gesture label returned by GestureRecognizer */
  raw_label: string
  /** Raw confidence score 0.0 – 1.0 */
  raw_score: number
  /** Recognition latency in milliseconds */
  latency_ms: number
  /** Number of actions emitted by DecisionEngine during the 5s capture window */
  triggers_fired: number
  /** Evaluated verdict */
  verdict: TrialVerdict
}

export interface EvaluationMetrics {
  totalTrials: number
  correctCount: number
  neutralCount: number
  incorrectCount: number
  accuracyRate: number
  neutralRate: number
  errorRate: number
  avgLatencyMs: number
  byCondition: Record<
    string,
    { total: number; correct: number; neutral: number; incorrect: number }
  >
  byGesture: Record<
    string,
    { total: number; correct: number; neutral: number; incorrect: number }
  >
}
