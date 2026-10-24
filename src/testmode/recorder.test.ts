/**
 * recorder.test.ts — Unit tests for pure testmode trial evaluation and CSV export.
 */

import { describe, it, expect } from 'vitest'
import {
  computeVerdict,
  aggregateCaptureWindow,
  trialsToCsv,
  computeMetrics,
} from './recorder'
import { type FrameSample, type TrialRecord } from './types'

describe('recorder — computeVerdict', () => {
  it('returns "correct" when predicted matches true gesture', () => {
    expect(computeVerdict('Open_Palm', 'Open_Palm')).toBe('correct')
    expect(computeVerdict('Pointing_Up', 'Pointing_Up')).toBe('correct')
    expect(computeVerdict('Victory', 'Victory')).toBe('correct')
    expect(computeVerdict('ILoveYou', 'ILoveYou')).toBe('correct')
    expect(computeVerdict('Thumb_Up', 'Thumb_Up')).toBe('correct')
    expect(computeVerdict('Thumb_Down', 'Thumb_Down')).toBe('correct')
  })

  it('returns "neutral" when true gesture was intentional but prediction is NEUTRAL', () => {
    expect(computeVerdict('Open_Palm', 'NEUTRAL')).toBe('neutral')
    expect(computeVerdict('Pointing_Up', 'NEUTRAL')).toBe('neutral')
    expect(computeVerdict('Victory', '')).toBe('neutral')
  })

  it('returns "incorrect" when true gesture is misclassified as another gesture', () => {
    expect(computeVerdict('Open_Palm', 'Pointing_Up')).toBe('incorrect')
    expect(computeVerdict('Victory', 'Thumb_Up')).toBe('incorrect')
    expect(computeVerdict('Thumb_Up', 'Thumb_Down')).toBe('incorrect')
  })

  it('handles "None" / no-gesture condition properly', () => {
    // When no gesture was intended, abstaining as NEUTRAL is CORRECT
    expect(computeVerdict('None', 'NEUTRAL')).toBe('correct')
    expect(computeVerdict('None', 'None')).toBe('correct')
    // Triggering an action when no gesture was intended is INCORRECT (false trigger)
    expect(computeVerdict('None', 'Open_Palm')).toBe('incorrect')
    expect(computeVerdict('Other', 'Pointing_Up')).toBe('incorrect')
  })
})

describe('recorder — aggregateCaptureWindow', () => {
  it('handles empty frame sequence gracefully', () => {
    const trial = aggregateCaptureWindow(
      [],
      'Victory',
      'C1_baseline',
      'sess-01',
      '2026-10-24T18:00:00Z',
    )
    expect(trial.predicted).toBe('NEUTRAL')
    expect(trial.verdict).toBe('neutral')
    expect(trial.true_gesture).toBe('Victory')
    expect(trial.session_id).toBe('sess-01')
    expect(trial.condition).toBe('C1_baseline')
    expect(trial.latency_ms).toBe(0)
  })

  it('aggregates majority predicted label and computes average score/latency', () => {
    const frames: FrameSample[] = [
      {
        timestamp: 100,
        rawLabel: 'Pointing_Up',
        rawScore: 0.9,
        predictedLabel: 'Pointing_Up',
        latencyMs: 25,
      },
      {
        timestamp: 200,
        rawLabel: 'Pointing_Up',
        rawScore: 0.85,
        predictedLabel: 'Pointing_Up',
        latencyMs: 30,
      },
      {
        timestamp: 300,
        rawLabel: 'None',
        rawScore: 0.4,
        predictedLabel: 'NEUTRAL',
        latencyMs: 20,
      },
      {
        timestamp: 400,
        rawLabel: 'Pointing_Up',
        rawScore: 0.92,
        predictedLabel: 'Pointing_Up',
        latencyMs: 25,
      },
    ]

    const trial = aggregateCaptureWindow(
      frames,
      'Pointing_Up',
      'C2_dim',
      'sess-02',
    )
    expect(trial.predicted).toBe('Pointing_Up')
    expect(trial.raw_label).toBe('Pointing_Up')
    expect(trial.verdict).toBe('correct')
    expect(trial.condition).toBe('C2_dim')
    expect(trial.latency_ms).toBe(25) // (25+30+20+25)/4 = 25
    expect(trial.raw_score).toBeCloseTo((0.9 + 0.85 + 0.92) / 3, 2)
  })

  it('identifies neutral when majority frames are below threshold', () => {
    const frames: FrameSample[] = [
      {
        timestamp: 100,
        rawLabel: 'Open_Palm',
        rawScore: 0.55,
        predictedLabel: 'NEUTRAL',
        latencyMs: 20,
      },
      {
        timestamp: 200,
        rawLabel: 'Open_Palm',
        rawScore: 0.6,
        predictedLabel: 'NEUTRAL',
        latencyMs: 22,
      },
      {
        timestamp: 300,
        rawLabel: 'Open_Palm',
        rawScore: 0.75,
        predictedLabel: 'Open_Palm',
        latencyMs: 24,
      },
    ]

    const trial = aggregateCaptureWindow(
      frames,
      'Open_Palm',
      'C3_backlit',
      'sess-03',
    )
    expect(trial.predicted).toBe('NEUTRAL')
    expect(trial.verdict).toBe('neutral')
  })
})

describe('recorder — trialsToCsv', () => {
  it('generates compliant CSV with exact headers and rows', () => {
    const mockTrials: TrialRecord[] = [
      {
        timestamp: '2026-10-24T18:00:00.000Z',
        session_id: 'session-alpha',
        condition: 'C1_baseline',
        true_gesture: 'Open_Palm',
        predicted: 'Open_Palm',
        raw_label: 'Open_Palm',
        raw_score: 0.8842,
        latency_ms: 24.5,
        verdict: 'correct',
      },
      {
        timestamp: '2026-10-24T18:00:10.000Z',
        session_id: 'session-alpha',
        condition: 'C2_dim',
        true_gesture: 'Victory',
        predicted: 'NEUTRAL',
        raw_label: 'Victory',
        raw_score: 0.621,
        latency_ms: 30.1,
        verdict: 'neutral',
      },
    ]

    const csv = trialsToCsv(mockTrials)
    const lines = csv.trim().split('\n')

    expect(lines[0]).toBe(
      'timestamp,session_id,condition,true_gesture,predicted,raw_label,raw_score,latency_ms,verdict',
    )
    expect(lines).toHaveLength(3)

    expect(lines[1]).toBe(
      '2026-10-24T18:00:00.000Z,session-alpha,C1_baseline,Open_Palm,Open_Palm,Open_Palm,0.8842,25,correct',
    )
    expect(lines[2]).toBe(
      '2026-10-24T18:00:10.000Z,session-alpha,C2_dim,Victory,NEUTRAL,Victory,0.6210,30,neutral',
    )
  })
})

describe('recorder — computeMetrics', () => {
  it('calculates aggregate metrics and breakdowns correctly', () => {
    const mockTrials: TrialRecord[] = [
      {
        timestamp: 'T1',
        session_id: 's1',
        condition: 'C1_baseline',
        true_gesture: 'Open_Palm',
        predicted: 'Open_Palm',
        raw_label: 'Open_Palm',
        raw_score: 0.9,
        latency_ms: 20,
        verdict: 'correct',
      },
      {
        timestamp: 'T2',
        session_id: 's1',
        condition: 'C1_baseline',
        true_gesture: 'Pointing_Up',
        predicted: 'NEUTRAL',
        raw_label: 'Pointing_Up',
        raw_score: 0.6,
        latency_ms: 22,
        verdict: 'neutral',
      },
      {
        timestamp: 'T3',
        session_id: 's1',
        condition: 'C2_dim',
        true_gesture: 'Victory',
        predicted: 'Thumb_Up',
        raw_label: 'Thumb_Up',
        raw_score: 0.8,
        latency_ms: 24,
        verdict: 'incorrect',
      },
      {
        timestamp: 'T4',
        session_id: 's1',
        condition: 'C2_dim',
        true_gesture: 'None',
        predicted: 'NEUTRAL',
        raw_label: 'None',
        raw_score: 0.1,
        latency_ms: 18,
        verdict: 'correct',
      },
    ]

    const metrics = computeMetrics(mockTrials)
    expect(metrics.totalTrials).toBe(4)
    expect(metrics.correctCount).toBe(2)
    expect(metrics.neutralCount).toBe(1)
    expect(metrics.incorrectCount).toBe(1)
    expect(metrics.accuracyRate).toBe(0.5) // 2/4
    expect(metrics.neutralRate).toBe(0.25) // 1/4
    expect(metrics.errorRate).toBe(0.25) // 1/4

    // Check condition breakdown
    expect(metrics.byCondition['C1_baseline'].total).toBe(2)
    expect(metrics.byCondition['C1_baseline'].correct).toBe(1)
    expect(metrics.byCondition['C1_baseline'].neutral).toBe(1)

    // Check gesture breakdown
    expect(metrics.byGesture['Open_Palm'].correct).toBe(1)
    expect(metrics.byGesture['None'].correct).toBe(1)
  })
})
