/**
 * App.tsx — Root component (T2.3 kiosk shell, T2.4 decision wiring, T2.5 feedback components)
 *
 * Responsibilities:
 *  - Manage kiosk state via kioskReducer
 *  - Initialize MediaPipe GestureRecognizer (self-hosted WASM)
 *  - Run continuous camera loop with native canvas drawing (no React re-render per frame)
 *  - Feed frames into DecisionEngine and dispatch events
 *  - Render KioskShell with live status strip + CameraPreview in corner
 */

import { useEffect, useRef, useState, useCallback, useReducer } from 'react'
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision'
import KioskShell, { type DetectionInfo } from './kiosk/KioskShell'
import CameraPreview from './ui/CameraPreview'
import { kioskReducer, INITIAL_STATE } from './kiosk/actions'
import { DecisionEngine } from './vision/decision'

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const recognizerRef = useRef<GestureRecognizer | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastVideoTimeRef = useRef<number>(-1)
  const lastUiUpdateRef = useRef<number>(0)
  const decisionEngineRef = useRef<DecisionEngine>(new DecisionEngine())

  const [kioskState, dispatch] = useReducer(kioskReducer, INITIAL_STATE)
  const [dwellProgress, setDwellProgress] = useState<number>(0)

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
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
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
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      const msg = isDenied
        ? 'Permission denied: Please allow camera access in your browser to use gestures.'
        : err instanceof Error
          ? err.message
          : String(err)
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
    decisionEngineRef.current.reset()
    setDwellProgress(0)
  }, [])

  // Auto-start camera when model is ready
  useEffect(() => {
    if (!isLoading && !initError && !isCameraActive && recognizerRef.current) {
      startCamera()
    }
  }, [isLoading, initError, isCameraActive, startCamera])

  // ---------------------------------------------------------------------------
  // Frame recognition loop (native canvas drawing, no React re-render per frame)
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

            // Direct canvas 2D manipulation — NO React state for landmarks
            if (canvas) {
              if (
                canvas.width !== video.videoWidth ||
                canvas.height !== video.videoHeight
              ) {
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
                    du.drawLandmarks(lm, {
                      color: '#0f766e',
                      lineWidth: 1,
                      radius: 3,
                    })
                  }
                }
              }
            }

            // Feed into DecisionEngine
            if (results.gestures?.length && results.gestures[0].length) {
              const top = results.gestures[0][0]
              const hand =
                results.handedness?.[0]?.[0]?.displayName ||
                results.handedness?.[0]?.[0]?.categoryName ||
                '-'

              const gestureEvent = decisionEngineRef.current.update(
                top.categoryName,
                top.score,
                timestamp,
                true,
              )

              if (gestureEvent) {
                dispatch(gestureEvent.action)
              }

              const progress =
                decisionEngineRef.current.dwellProgress(timestamp)

              // Throttle React state update to ~20fps (50ms) to eliminate render overhead
              if (
                timestamp - lastUiUpdateRef.current >= 50 ||
                gestureEvent ||
                progress === 0
              ) {
                lastUiUpdateRef.current = timestamp
                setDetection({
                  gesture: top.categoryName,
                  score: top.score,
                  handedness: hand,
                  handsCount: results.landmarks?.length ?? 1,
                })
                setDwellProgress(progress)
              }
            } else {
              decisionEngineRef.current.update('', 0, timestamp, false)
              if (timestamp - lastUiUpdateRef.current >= 50) {
                lastUiUpdateRef.current = timestamp
                setDetection({
                  gesture: 'No hand',
                  score: 0,
                  handedness: '-',
                  handsCount: 0,
                })
                setDwellProgress(0)
              }
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

  // Stop camera tracks when unmounting (RULES.md §11)
  useEffect(() => () => stopCamera(), [stopCamera])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen">
      {/* Main kiosk shell with status strip */}
      <KioskShell
        state={kioskState}
        onDispatch={dispatch}
        detection={detection}
        dwellProgress={dwellProgress}
        isCameraActive={isCameraActive}
        cameraError={initError}
        onStartCamera={startCamera}
      />

      {/* Mirrored camera preview in corner */}
      <CameraPreview
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isLoading={isLoading}
        initError={initError}
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks((prev) => !prev)}
        onToggleCamera={isCameraActive ? stopCamera : startCamera}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((prev) => !prev)}
        currentGesture={detection.gesture}
        currentScore={detection.score}
        dwellProgress={dwellProgress}
      />
    </div>
  )
}
