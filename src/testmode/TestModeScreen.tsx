/**
 * TestModeScreen.tsx — Empirical evaluation & trial recording interface (T3.1)
 *
 * Implements:
 *  - Pre-trial True Gesture selection (7 options: 6 mapped gestures + no gesture/other)
 *  - Condition tag selection (C1 baseline, C2 dim, C3 backlit, C4 cluttered)
 *  - 3-second countdown followed by 5-second live capture window
 *  - Live evaluation against decision pipeline (records timestamp, session id, condition,
 *    true gesture, predicted label after threshold, raw top label, raw score, latency ms)
 *  - In-memory trial storage + post-trial verdict display (correct / neutral / incorrect)
 *  - Instant CSV export (trials.csv) with zero frame/image storage (privacy by design)
 *  - Buttons >= 72px tall per DESIGN.md §12
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Action } from '../kiosk/actions'
import { SCORE_THRESHOLD } from '../config'
import { applyThreshold } from '../vision/decision'
import {
  type TrueGesture,
  type ConditionTag,
  type TrialRecord,
  type FrameSample,
  TRUE_GESTURE_OPTIONS,
  CONDITION_OPTIONS,
} from './types'
import {
  aggregateCaptureWindow,
  trialsToCsv,
  computeMetrics,
  downloadCsv,
  formatTimestampForFilename,
} from './recorder'

interface Props {
  onDispatch: (action: Action) => void
  currentDetection?: {
    gesture: string
    score: number
    handedness: string
    handsCount: number
  }
  isCameraActive?: boolean
  onStartCamera?: () => void
}

type TestPhase = 'idle' | 'countdown' | 'capturing' | 'verdict'

export default function TestModeScreen({
  onDispatch,
  currentDetection = {
    gesture: 'None',
    score: 0,
    handedness: '-',
    handsCount: 0,
  },
  isCameraActive = true,
  onStartCamera,
}: Props) {
  // Test configuration state
  const [trueGesture, setTrueGesture] = useState<TrueGesture>('Open_Palm')
  const [condition, setCondition] = useState<ConditionTag>('C1_baseline')
  const [sessionId] = useState<string>(() => {
    const d = new Date()
    return `session-${d.toISOString().slice(0, 10).replace(/-/g, '')}-${d.toTimeString().slice(0, 8).replace(/:/g, '')}`
  })

  // Trial execution state
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3)
  const [captureTimeRemaining, setCaptureTimeRemaining] = useState<number>(5.0)
  const [trials, setTrials] = useState<TrialRecord[]>(() => {
    try {
      const stored = localStorage.getItem('airtouch_trials')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.warn('Failed to load trials from localStorage:', e)
    }
    return []
  })
  const [lastTrial, setLastTrial] = useState<TrialRecord | null>(null)

  // Persist trials to localStorage on change (labels, scores, timestamps only - never frames)
  useEffect(() => {
    try {
      if (trials.length > 0) {
        localStorage.setItem('airtouch_trials', JSON.stringify(trials))
      } else {
        localStorage.removeItem('airtouch_trials')
      }
    } catch (e) {
      console.warn('Failed to persist trials to localStorage:', e)
    }
  }, [trials])

  // In-flight capture samples
  const capturedFramesRef = useRef<FrameSample[]>([])
  const timerIntervalRef = useRef<number | null>(null)
  const lastFrameTimestampRef = useRef<number>(0)

  // Sample incoming video frames during active 5-second capture window
  useEffect(() => {
    if (phase !== 'capturing') return

    const now = performance.now()
    const latency = Math.max(
      1,
      Math.min(100, Math.round(now - lastFrameTimestampRef.current)),
    )
    lastFrameTimestampRef.current = now

    const rawLabel = currentDetection.gesture || 'None'
    const rawScore = currentDetection.score || 0
    const predictedLabel = applyThreshold(rawLabel, rawScore)

    capturedFramesRef.current.push({
      timestamp: now,
      rawLabel,
      rawScore,
      predictedLabel,
      latencyMs: latency,
    })
  }, [phase, currentDetection])

  // Stop active timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // Start trial execution sequence (3s countdown -> 5s capture -> verdict)
  const startTrial = useCallback(() => {
    if (phase !== 'idle' && phase !== 'verdict') return
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    setPhase('countdown')
    setCountdownSeconds(3)
    capturedFramesRef.current = []

    let countdownLeft = 3
    timerIntervalRef.current = window.setInterval(() => {
      countdownLeft -= 1
      setCountdownSeconds(countdownLeft)

      if (countdownLeft <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

        // Begin 5-second capture window
        setPhase('capturing')
        setCaptureTimeRemaining(5.0)
        capturedFramesRef.current = []

        let captureLeftMs = 5000
        const stepMs = 100
        timerIntervalRef.current = window.setInterval(() => {
          captureLeftMs -= stepMs
          setCaptureTimeRemaining(Math.max(0, captureLeftMs / 1000))

          if (captureLeftMs <= 0) {
            if (timerIntervalRef.current)
              clearInterval(timerIntervalRef.current)

            // Aggregate collected frames and compute trial record
            const trialResult = aggregateCaptureWindow(
              capturedFramesRef.current,
              trueGesture,
              condition,
              sessionId,
            )

            setTrials((prev) => [trialResult, ...prev])
            setLastTrial(trialResult)
            setPhase('verdict')
          }
        }, stepMs)
      }
    }, 1000)
  }, [phase, trueGesture, condition, sessionId])

  // Export CSV handler with sortable timestamped filename
  const handleExportCsv = useCallback(() => {
    if (trials.length === 0) return
    const csvContent = trialsToCsv(trials)
    const timestamp = formatTimestampForFilename(new Date())
    const filename = `trials_${condition}_${timestamp}.csv`
    downloadCsv(csvContent, filename)
  }, [trials, condition])

  // Clear trial log handler with explicit confirmation modal
  const handleClearTrials = useCallback(() => {
    if (trials.length === 0) return
    if (
      window.confirm(
        'Clear all recorded trials? This will delete all saved trial records from local storage on this device.',
      )
    ) {
      setTrials([])
      setLastTrial(null)
      setPhase('idle')
      try {
        localStorage.removeItem('airtouch_trials')
      } catch (e) {
        console.warn('Failed to remove trials from localStorage:', e)
      }
    }
  }, [trials.length])

  // Compute live metrics
  const metrics = computeMetrics(trials)

  return (
    <section className="min-h-full p-6 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header Row                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
              Phase 3 Evaluation Protocol
            </span>
            <span className="text-xs font-mono text-slate-400">
              ID: {sessionId}
            </span>
          </div>
          <h2
            className="font-extrabold text-white leading-tight mt-1"
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
          >
            🧪 Test Mode &amp; Evaluation
          </h2>
          <p className="mt-1 text-slate-400 text-base sm:text-lg">
            Record ground-truth trials across conditions. All frames processed
            locally; labels and scores exported to CSV.
          </p>
        </div>

        {/* Action buttons >= 72px tall */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onDispatch(Action.HOME)}
            className="min-h-[72px] flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            aria-label="Exit test mode and return to kiosk home"
          >
            <span aria-hidden="true">🏠</span>
            <span>Exit Test</span>
            <kbd className="text-xs font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Esc / H
            </kbd>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={trials.length === 0}
            className="min-h-[72px] flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:pointer-events-none border-2 border-teal-400 text-white text-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            aria-label="Export recorded trials as CSV"
          >
            <span aria-hidden="true">📥</span>
            <span>Export CSV</span>
            <span className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              {trials.length} trials
            </span>
          </button>
        </div>
      </div>

      {/* Camera Inactive Alert */}
      {!isCameraActive && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              📷
            </span>
            <div>
              <p className="font-bold text-base text-white">
                Camera is currently paused
              </p>
              <p className="text-xs text-amber-300/90">
                Please turn on camera to record empirical trials with the live
                vision pipeline.
              </p>
            </div>
          </div>
          {onStartCamera && (
            <button
              type="button"
              onClick={onStartCamera}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Start Camera
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. Trial Configuration Panel: True Gesture & Condition Tag          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step A: Select TRUE Gesture */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 text-xs font-black flex items-center justify-center">
                1
              </span>
              <span>Select Ground-Truth Gesture (BEFORE trial)</span>
            </h3>
            <span className="text-xs font-mono text-teal-400 font-semibold">
              {trueGesture}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TRUE_GESTURE_OPTIONS.map((g) => {
              const isSelected = trueGesture === g.value
              return (
                <button
                  key={g.value}
                  type="button"
                  disabled={phase === 'countdown' || phase === 'capturing'}
                  onClick={() => setTrueGesture(g.value)}
                  className={[
                    'p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer text-center',
                    isSelected
                      ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-md font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700 hover:border-slate-500',
                  ].join(' ')}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {g.emoji}
                  </span>
                  <span className="text-xs font-semibold leading-tight">
                    {g.label}
                  </span>
                  <span
                    className={
                      isSelected
                        ? 'text-[10px] text-slate-900 font-mono'
                        : 'text-[10px] text-slate-400 font-mono'
                    }
                  >
                    → {g.action}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step B: Select Condition Tag */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 text-xs font-black flex items-center justify-center">
                2
              </span>
              <span>Select Environmental Condition Tag</span>
            </h3>
            <span className="text-xs font-mono text-teal-400 font-semibold">
              {condition}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CONDITION_OPTIONS.map((c) => {
              const isSelected = condition === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  disabled={phase === 'countdown' || phase === 'capturing'}
                  onClick={() => setCondition(c.value)}
                  className={[
                    'p-3 rounded-xl border-2 flex flex-col items-start gap-1 transition-all cursor-pointer text-left',
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-slate-500',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={
                        isSelected
                          ? 'font-bold text-teal-300 text-sm'
                          : 'font-semibold text-white text-sm'
                      }
                    >
                      {c.label}
                    </span>
                    {isSelected && (
                      <span className="text-teal-400 text-xs">✓ Active</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-snug">
                    {c.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Execution Arena: Big Start Button, Countdown & Capture Window     */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-5 text-center shadow-xl">
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div className="text-left">
                <p className="text-lg font-bold text-white leading-tight">
                  Ready to test:{' '}
                  <strong className="text-teal-400">{trueGesture}</strong> under{' '}
                  <strong className="text-teal-400">{condition}</strong>
                </p>
                <p className="text-sm text-slate-400">
                  Click below to start. 3-second countdown gives you time to
                  pose, then 5 seconds of live recording.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startTrial}
              disabled={!isCameraActive}
              className="min-h-[72px] w-full px-8 py-5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 border-2 border-teal-400 text-white font-extrabold text-2xl transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>▶</span>
              <span>START 5-SECOND TRIAL</span>
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 animate-pulse">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              GET READY · POSE {trueGesture.toUpperCase()}
            </span>
            <div className="w-28 h-28 rounded-full bg-teal-500/20 border-4 border-teal-400 flex items-center justify-center my-2 shadow-2xl shadow-teal-500/40">
              <span className="text-6xl font-black text-teal-300 font-mono">
                {countdownSeconds}
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Position your hand steady in camera view…
            </p>
          </div>
        )}

        {phase === 'capturing' && (
          <div className="w-full flex flex-col items-center gap-4 py-4 max-w-xl">
            <div className="flex items-center justify-between w-full text-sm font-mono">
              <span className="text-teal-400 font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                RECORDING TRIAL ({trueGesture})
              </span>
              <span className="text-white font-black text-lg">
                {captureTimeRemaining.toFixed(1)}s remaining
              </span>
            </div>

            {/* Visual 5-second progress bar */}
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-teal-500 transition-all duration-100 ease-linear rounded-full shadow-lg shadow-teal-500/50"
                style={{
                  width: `${((5.0 - captureTimeRemaining) / 5.0) * 100}%`,
                }}
              />
            </div>

            {/* Live frame telemetry feed */}
            <div className="flex items-center gap-6 text-xs font-mono text-slate-300 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
              <span>
                Live top:{' '}
                <strong className="text-teal-400">
                  {currentDetection.gesture}
                </strong>
              </span>
              <span>
                Score:{' '}
                <strong className="text-teal-400">
                  {(currentDetection.score * 100).toFixed(0)}%
                </strong>
              </span>
              <span>
                Threshold:{' '}
                <strong className="text-slate-400">
                  {SCORE_THRESHOLD * 100}%
                </strong>
              </span>
              <span>
                Status: <strong className="text-red-400">RECORDING</strong>
              </span>
            </div>
          </div>
        )}

        {phase === 'verdict' && lastTrial && (
          <div className="w-full flex flex-col items-center gap-4 py-2 max-w-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Verdict Badge */}
            <div
              className={[
                'w-full p-5 rounded-2xl border-2 flex items-center justify-between gap-4 text-left shadow-lg',
                lastTrial.verdict === 'correct'
                  ? 'bg-green-500/15 border-green-500/60 text-green-200 shadow-green-500/10'
                  : lastTrial.verdict === 'neutral'
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-amber-500/10'
                    : 'bg-rose-500/15 border-rose-500/60 text-rose-200 shadow-rose-500/10',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-hidden="true">
                  {lastTrial.verdict === 'correct'
                    ? '✓'
                    : lastTrial.verdict === 'neutral'
                      ? '⚠️'
                      : '✗'}
                </span>
                <div>
                  <h4 className="text-xl font-extrabold uppercase tracking-wide">
                    {lastTrial.verdict === 'correct'
                      ? 'Verdict: Correct'
                      : lastTrial.verdict === 'neutral'
                        ? 'Verdict: Neutral (Abstained)'
                        : 'Verdict: Incorrect (Misclassified)'}
                  </h4>
                  <p className="text-sm mt-0.5 opacity-90">
                    True: <strong>{lastTrial.true_gesture}</strong> · Predicted:{' '}
                    <strong>{lastTrial.predicted}</strong> (raw:{' '}
                    {lastTrial.raw_label} @{' '}
                    {(lastTrial.raw_score * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono opacity-80">
                <span className="block">{lastTrial.latency_ms} ms</span>
                <span className="block">{lastTrial.condition}</span>
              </div>
            </div>

            {/* Quick Next Trial Button */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={startTrial}
                className="min-h-[72px] flex-1 px-8 py-5 rounded-2xl bg-teal-600 hover:bg-teal-500 border-2 border-teal-400 text-white font-extrabold text-xl transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>▶</span>
                <span>REPEAT OR NEXT TRIAL</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Live Evaluation Dashboard & Stored Trials Table                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-xl text-white">
              Evaluation Metrics &amp; In-Memory Log
            </h3>
            <span className="text-xs font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
              {metrics.totalTrials} Trials Logged
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={trials.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/50 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleClearTrials}
              disabled={trials.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-30 cursor-pointer"
              aria-label="Clear all recorded trials from memory and local storage"
            >
              Clear All Trials
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Accuracy</span>
            <p className="text-2xl font-black text-teal-400 mt-1">
              {(metrics.accuracyRate * 100).toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-500">
              {metrics.correctCount} / {metrics.totalTrials} correct
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Neutral / Abstain
            </span>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {(metrics.neutralRate * 100).toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-500">
              {metrics.neutralCount} / {metrics.totalTrials} abstained
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Error Rate
            </span>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {(metrics.errorRate * 100).toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-500">
              {metrics.incorrectCount} / {metrics.totalTrials} errors
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Avg Latency
            </span>
            <p className="text-2xl font-black text-slate-200 mt-1">
              {metrics.avgLatencyMs} ms
            </p>
            <span className="text-[11px] text-slate-500">
              Inference frame time
            </span>
          </div>
        </div>

        {/* Recent Trials Table */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">True Gesture</th>
                <th className="py-2.5 px-3">Predicted</th>
                <th className="py-2.5 px-3">Raw Label</th>
                <th className="py-2.5 px-3">Raw Score</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {trials.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-slate-500 font-sans"
                  >
                    No trials recorded yet. Select True Gesture &amp; Condition
                    above and click Start Trial.
                  </td>
                </tr>
              ) : (
                trials.map((t, idx) => (
                  <tr
                    key={`${t.timestamp}-${idx}`}
                    className="hover:bg-slate-800/40"
                  >
                    <td className="py-2 px-3 text-slate-500">
                      {trials.length - idx}
                    </td>
                    <td className="py-2 px-3">{t.condition}</td>
                    <td className="py-2 px-3 font-bold text-white">
                      {t.true_gesture}
                    </td>
                    <td className="py-2 px-3 font-semibold text-teal-300">
                      {t.predicted}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{t.raw_label}</td>
                    <td className="py-2 px-3">
                      {(t.raw_score * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3">{Math.round(t.latency_ms)} ms</td>
                    <td className="py-2 px-3">
                      <span
                        className={[
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                          t.verdict === 'correct'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : t.verdict === 'neutral'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
                        ].join(' ')}
                      >
                        {t.verdict}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
