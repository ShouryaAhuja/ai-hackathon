/**
 * App.tsx — Root component (T2.3 shell + camera infrastructure from T0.6)
 *
 * Responsibilities:
 *  - Manage kiosk state via kioskReducer
 *  - Initialize MediaPipe GestureRecognizer (self-hosted WASM)
 *  - Run continuous camera loop (T2.4 will wire gestures → dispatch)
 *  - Render KioskShell with camera preview in corner overlay
 */

import { useEffect, useRef, useState, useCallback, useReducer } from 'react'
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision'
import KioskShell from './kiosk/KioskShell'
import { kioskReducer, INITIAL_STATE } from './kiosk/actions'

interface DetectionInfo {
  gesture: string
  score: number
  handedness: string
  handsCount: number
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const recognizerRef = useRef<GestureRecognizer | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastVideoTimeRef = useRef<number>(-1)

  const [kioskState, dispatch] = useReducer(kioskReducer, INITIAL_STATE)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true)
  const [showPreview, setShowPreview] = useState<boolean>(true)
  const [detection, setDetection] = useState<DetectionInfo>({
    gesture: 'None',
    score: 0,
    handedness: '-',
    handsCount: 0,
  })

  // ---------------------------------------------------------------------------
  // Initialize GestureRecognizer using local, self-hosted assets
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false

    async function initMediaPipe() {
      try {
        setIsLoading(true)
        setInitError(null)

        const rawBase = import.meta.env.BASE_URL || '/'
        const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
        const wasmPath = `${base}mediapipe`
        const modelPath = `${base}mediapipe/gesture_recognizer.task`

        const vision = await FilesetResolver.forVisionTasks(wasmPath)
        if (isCancelled) return

        let recognizer: GestureRecognizer
        try {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 2,
          })
        } catch {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: { modelAssetPath: modelPath, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 2,
          })
        }

        if (isCancelled) {
          recognizer.close()
          return
        }

        recognizerRef.current = recognizer
        setIsLoading(false)
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          setInitError(`Model error: ${msg}`)
          setIsLoading(false)
        }
      }
    }

    initMediaPipe()

    return () => {
      isCancelled = true
      recognizerRef.current?.close()
      recognizerRef.current = null
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Camera management
  // ---------------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    try {
      setInitError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsCameraActive(true)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setInitError(`Camera error: ${msg}`)
      setIsCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setIsCameraActive(false)
    setDetection({ gesture: 'None', score: 0, handedness: '-', handsCount: 0 })
  }, [])

  // Auto-start camera when model is ready
  useEffect(() => {
    if (!isLoading && !initError && !isCameraActive && recognizerRef.current) {
      startCamera()
    }
  }, [isLoading, initError, isCameraActive, startCamera])

  // ---------------------------------------------------------------------------
  // Frame recognition loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isCameraActive) return

    let animId: number

    function render() {
      const video = videoRef.current
      const canvas = canvasRef.current
      const recognizer = recognizerRef.current

      if (video && recognizer && video.readyState >= 2 && !video.paused) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime
          const timestamp = performance.now()

          try {
            const results = recognizer.recognizeForVideo(video, timestamp)

            if (canvas) {
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
              }
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                if (showLandmarks && results.landmarks?.length) {
                  const du = new DrawingUtils(ctx)
                  for (const lm of results.landmarks) {
                    du.drawConnectors(lm, GestureRecognizer.HAND_CONNECTIONS, {
                      color: '#14b8a6',
                      lineWidth: 3,
                    })
                    du.drawLandmarks(lm, { color: '#0f766e', lineWidth: 1, radius: 3 })
                  }
                }
              }
            }

            if (results.gestures?.length && results.gestures[0].length) {
              const top = results.gestures[0][0]
              const hand =
                results.handedness?.[0]?.[0]?.displayName ||
                results.handedness?.[0]?.[0]?.categoryName ||
                '-'
              setDetection({
                gesture: top.categoryName,
                score: top.score,
                handedness: hand,
                handsCount: results.landmarks?.length ?? 1,
              })
            } else {
              setDetection({ gesture: 'No hand', score: 0, handedness: '-', handsCount: 0 })
            }
          } catch (e) {
            console.warn('Frame recognition error:', e)
          }
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [isCameraActive, showLandmarks])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen">
      {/* Main kiosk UI */}
      <KioskShell state={kioskState} onDispatch={dispatch} />

      {/* ------------------------------------------------------------------ */}
      {/* Corner camera preview                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={[
          'fixed bottom-20 right-4 z-50 flex flex-col gap-1 transition-all duration-300',
          showPreview ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        style={{ width: '220px' }}
      >
        {/* Preview window */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl aspect-[4/3]">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 p-3">
              <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-300 text-center">Loading model…</p>
            </div>
          )}

          {/* Error overlay */}
          {!isLoading && initError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 p-3">
              <p className="text-xs text-red-300 text-center">{initError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* Live badge */}
          {isCameraActive && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-teal-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              LIVE
            </div>
          )}

          {/* Gesture label */}
          {isCameraActive && detection.handsCount > 0 && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded px-2 py-1 text-center text-[11px] text-teal-200 font-medium truncate">
              {detection.gesture} {(detection.score * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setShowLandmarks((p) => !p)}
            title="Toggle landmark overlay"
            className="flex-1 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition-colors"
          >
            {showLandmarks ? 'Hide LM' : 'Show LM'}
          </button>
          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            disabled={isLoading}
            className={[
              'flex-1 py-1 text-[11px] rounded border transition-colors disabled:opacity-50',
              isCameraActive
                ? 'bg-red-900/30 border-red-700/50 text-red-300 hover:bg-red-900/50'
                : 'bg-teal-700/30 border-teal-600/50 text-teal-300 hover:bg-teal-700/50',
            ].join(' ')}
          >
            {isCameraActive ? 'Stop Cam' : 'Start Cam'}
          </button>
        </div>
      </div>

      {/* Toggle preview visibility button */}
      <button
        type="button"
        onClick={() => setShowPreview((p) => !p)}
        title={showPreview ? 'Hide camera preview' : 'Show camera preview'}
        className="fixed bottom-20 right-[236px] z-50 w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
        aria-label={showPreview ? 'Hide camera' : 'Show camera'}
      >
        {showPreview ? '◁' : '▷'}
      </button>
    </div>
  )
}
