/**
 * recorder.ts — Pure trial evaluation, aggregation, CSV generation,
 * and performance metrics calculation (T3.1).
 *
 * Rules:
 *  - Pure functions with no DOM / camera dependencies
 *  - Handles NEUTRAL class explicitly
 *  - Evaluates verdict: correct / neutral / incorrect
 *  - Formats CSV export compliant with ml/analyze.py requirements
 */

import {
  type TrueGesture,
  type ConditionTag,
  type FrameSample,
  type TrialRecord,
  type TrialVerdict,
  type EvaluationMetrics,
} from './types'

/**
 * Computes trial verdict based on true intention vs predicted outcome.
 *
 * Logic:
 *  - If true gesture is 'None' or 'Other' (no gesture intended):
 *      predicted 'NEUTRAL' or 'None' -> 'correct' (properly abstained!)
 *      predicted any action gesture   -> 'incorrect' (false trigger)
 *  - If true gesture is an intentional action:
 *      predicted === trueGesture      -> 'correct'
 *      predicted === 'NEUTRAL'        -> 'neutral' (safe abstention below threshold)
 *      predicted !== trueGesture      -> 'incorrect' (misclassification)
 */
export function computeVerdict(
  trueGesture: TrueGesture | string,
  predicted: string,
): TrialVerdict {
  const isNoGesture =
    trueGesture === 'None' ||
    trueGesture === 'Other' ||
    trueGesture === 'no_gesture' ||
    trueGesture === ''

  if (isNoGesture) {
    if (predicted === 'NEUTRAL' || predicted === 'None' || predicted === '') {
      return 'correct'
    }
    return 'incorrect'
  }

  if (predicted === trueGesture) {
    return 'correct'
  }

  if (predicted === 'NEUTRAL' || predicted === 'None' || predicted === '') {
    return 'neutral'
  }

  return 'incorrect'
}

/**
 * Aggregates a sequence of frame samples collected during a 5-second capture window
 * into a single unified TrialRecord.
 */
export function aggregateCaptureWindow(
  frames: FrameSample[],
  trueGesture: TrueGesture | string,
  condition: ConditionTag | string,
  sessionId: string,
  trialTimestamp: string = new Date().toISOString(),
  triggersFired: number = 0,
): TrialRecord {
  if (frames.length === 0) {
    const verdict = computeVerdict(trueGesture, 'NEUTRAL')
    return {
      timestamp: trialTimestamp,
      session_id: sessionId,
      condition,
      true_gesture: trueGesture,
      predicted: 'NEUTRAL',
      raw_label: 'None',
      raw_score: 0,
      latency_ms: 0,
      triggers_fired: triggersFired,
      verdict,
    }
  }

  // Find majority predicted label across all frames
  const predictedCounts: Record<string, number> = {}
  for (const f of frames) {
    predictedCounts[f.predictedLabel] =
      (predictedCounts[f.predictedLabel] ?? 0) + 1
  }
  let majorityPredicted = 'NEUTRAL'
  let maxPredCount = -1
  for (const [label, count] of Object.entries(predictedCounts)) {
    if (count > maxPredCount) {
      maxPredCount = count
      majorityPredicted = label
    }
  }

  // Find most frequent raw label
  const rawCounts: Record<string, number> = {}
  for (const f of frames) {
    rawCounts[f.rawLabel] = (rawCounts[f.rawLabel] ?? 0) + 1
  }
  let topRawLabel = 'None'
  let maxRawCount = -1
  for (const [label, count] of Object.entries(rawCounts)) {
    if (count > maxRawCount) {
      maxRawCount = count
      topRawLabel = label
    }
  }

  // Compute average score for the top raw label (or overall average)
  const matchingFrames = frames.filter((f) => f.rawLabel === topRawLabel)
  const framesToAverage = matchingFrames.length > 0 ? matchingFrames : frames
  const avgScore =
    framesToAverage.reduce((acc, f) => acc + f.rawScore, 0) /
    framesToAverage.length

  // Compute average recognition latency
  const avgLatency =
    frames.reduce((acc, f) => acc + f.latencyMs, 0) / frames.length

  const verdict = computeVerdict(trueGesture, majorityPredicted)

  return {
    timestamp: trialTimestamp,
    session_id: sessionId,
    condition,
    true_gesture: trueGesture,
    predicted: majorityPredicted,
    raw_label: topRawLabel,
    raw_score: Number(avgScore.toFixed(4)),
    latency_ms: Number(avgLatency.toFixed(1)),
    triggers_fired: triggersFired,
    verdict,
  }
}

/**
 * Converts an array of TrialRecords into RFC-compliant CSV string.
 *
 * Headers: timestamp,session_id,condition,true_gesture,predicted,raw_label,raw_score,latency_ms,triggers_fired,verdict
 */
export function trialsToCsv(trials: TrialRecord[]): string {
  const headers = [
    'timestamp',
    'session_id',
    'condition',
    'true_gesture',
    'predicted',
    'raw_label',
    'raw_score',
    'latency_ms',
    'triggers_fired',
    'verdict',
  ]

  const escapeCell = (val: string | number): string => {
    const s = String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const rows = trials.map((t) => [
    escapeCell(t.timestamp),
    escapeCell(t.session_id),
    escapeCell(t.condition),
    escapeCell(t.true_gesture),
    escapeCell(t.predicted),
    escapeCell(t.raw_label),
    t.raw_score.toFixed(4),
    Math.round(t.latency_ms),
    t.triggers_fired ?? 0,
    escapeCell(t.verdict),
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

/**
 * Computes live evaluation metrics and condition/gesture breakdowns from stored trials.
 */
export function computeMetrics(trials: TrialRecord[]): EvaluationMetrics {
  const total = trials.length
  if (total === 0) {
    return {
      totalTrials: 0,
      correctCount: 0,
      neutralCount: 0,
      incorrectCount: 0,
      accuracyRate: 0,
      neutralRate: 0,
      errorRate: 0,
      avgLatencyMs: 0,
      byCondition: {},
      byGesture: {},
    }
  }

  let correct = 0
  let neutral = 0
  let incorrect = 0
  let totalLatency = 0

  const byCondition: EvaluationMetrics['byCondition'] = {}
  const byGesture: EvaluationMetrics['byGesture'] = {}

  for (const t of trials) {
    if (t.verdict === 'correct') correct++
    else if (t.verdict === 'neutral') neutral++
    else incorrect++

    totalLatency += t.latency_ms

    // Condition breakdown
    if (!byCondition[t.condition]) {
      byCondition[t.condition] = {
        total: 0,
        correct: 0,
        neutral: 0,
        incorrect: 0,
      }
    }
    byCondition[t.condition].total++
    byCondition[t.condition][t.verdict]++

    // Gesture breakdown
    if (!byGesture[t.true_gesture]) {
      byGesture[t.true_gesture] = {
        total: 0,
        correct: 0,
        neutral: 0,
        incorrect: 0,
      }
    }
    byGesture[t.true_gesture].total++
    byGesture[t.true_gesture][t.verdict]++
  }

  return {
    totalTrials: total,
    correctCount: correct,
    neutralCount: neutral,
    incorrectCount: incorrect,
    accuracyRate: Number((correct / total).toFixed(4)),
    neutralRate: Number((neutral / total).toFixed(4)),
    errorRate: Number((incorrect / total).toFixed(4)),
    avgLatencyMs: Number((totalLatency / total).toFixed(1)),
    byCondition,
    byGesture,
  }
}

/**
 * Formats a Date object into a sortable YYYYMMDD_HHMMSS timestamp string for filenames.
 */
export function formatTimestampForFilename(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`
}

/**
 * Triggers a browser download of CSV text as a file.
 */
export function downloadCsv(
  csvContent: string,
  filename: string = 'trials.csv',
): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
