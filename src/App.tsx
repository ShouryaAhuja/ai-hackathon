import { useEffect, useRef, useState, useCallback } from 'react'
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision'

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

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true)
  const [detection, setDetection] = useState<DetectionInfo>({
    gesture: 'None',
    score: 0,
    handedness: '-',
    handsCount: 0,
  })

  // Initialize GestureRecognizer using local, self-hosted assets
  useEffect(() => {
    let isCancelled = false

    async function initMediaPipe() {
      try {
        setIsLoading(true)
        setInitError(null)

        // Ensure base URL properly formats the local path without external CDN
        const rawBase = import.meta.env.BASE_URL || '/'
        const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
        const wasmPath = `${base}mediapipe`
        const modelPath = `${base}mediapipe/gesture_recognizer.task`

        const vision = await FilesetResolver.forVisionTasks(wasmPath)

        if (isCancelled) return

        let recognizer: GestureRecognizer
        try {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          })
        } catch (gpuErr) {
          console.warn(
            'GPU delegate initialization failed, falling back to CPU:',
            gpuErr,
          )
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: 'CPU',
            },
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
          console.error(
            'Failed to initialize MediaPipe GestureRecognizer:',
            err,
          )
          setInitError(`Model initialization error: ${msg}`)
          setIsLoading(false)
        }
      }
    }

    initMediaPipe()

    return () => {
      isCancelled = true
      if (recognizerRef.current) {
        recognizerRef.current.close()
        recognizerRef.current = null
      }
    }
  }, [])

  // Start webcam
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
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Camera access error:', err)
      setInitError(`Camera permission denied or camera not found: ${msg}`)
      setIsCameraActive(false)
    }
  }, [])

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    setIsCameraActive(false)
    setDetection({
      gesture: 'None',
      score: 0,
      handedness: '-',
      handsCount: 0,
    })
  }, [])

  // Auto-start camera once model is ready
  useEffect(() => {
    if (!isLoading && !initError && !isCameraActive && recognizerRef.current) {
      startCamera()
    }
  }, [isLoading, initError, isCameraActive, startCamera])

  // Continuous frame recognition loop inside useEffect
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

                if (
                  showLandmarks &&
                  results.landmarks &&
                  results.landmarks.length > 0
                ) {
                  const drawingUtils = new DrawingUtils(ctx)
                  for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(
                      landmarks,
                      GestureRecognizer.HAND_CONNECTIONS,
                      {
                        color: '#14b8a6', // Teal-500
                        lineWidth: 3,
                      },
                    )
                    drawingUtils.drawLandmarks(landmarks, {
                      color: '#0f766e', // Teal-700
                      lineWidth: 1,
                      radius: 3,
                    })
                  }
                }
              }
            }

            if (
              results.gestures &&
              results.gestures.length > 0 &&
              results.gestures[0].length > 0
            ) {
              const topGesture = results.gestures[0][0]
              const topHandedness =
                results.handedness &&
                results.handedness.length > 0 &&
                results.handedness[0].length > 0
                  ? results.handedness[0][0].displayName ||
                    results.handedness[0][0].categoryName
                  : '-'

              setDetection({
                gesture: topGesture.categoryName,
                score: topGesture.score,
                handedness: topHandedness,
                handsCount: results.landmarks ? results.landmarks.length : 1,
              })
            } else {
              setDetection({
                gesture: 'No hand detected',
                score: 0,
                handedness: '-',
                handsCount: 0,
              })
            }
          } catch (recognitionErr) {
            console.warn('Frame recognition error:', recognitionErr)
          }
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [isCameraActive, showLandmarks])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-400 font-bold">
            🖐
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AirTouch Kiosk
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Q15 Prototype
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Gesture Recognizer Live Verification (T0.6)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLandmarks((prev) => !prev)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            {showLandmarks ? 'Hide Landmarks' : 'Show Landmarks'}
          </button>
          {isCameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs px-3 py-1.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors"
            >
              Stop Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-500 transition-colors disabled:opacity-50"
            >
              Start Camera
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera View */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Mirrored Video element */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />

            {/* Mirrored Canvas element for landmarks overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
            />

            {/* Overlays / State indicators */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-200">
                  Loading self-hosted MediaPipe WASM and Gesture Recognizer
                  model...
                </p>
                <p className="text-xs text-slate-400">
                  Zero external CDN downloads
                </p>
              </div>
            )}

            {!isLoading && initError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold">
                  !
                </div>
                <p className="text-sm font-medium text-red-300 max-w-md">
                  {initError}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-white"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {!isLoading && !initError && !isCameraActive && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                <p className="text-sm text-slate-400">
                  Camera is currently paused.
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs font-semibold rounded-lg text-white"
                >
                  Turn Camera On
                </button>
              </div>
            )}

            {/* Mirrored badge */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 border border-white/10 z-10">
              Mirrored Preview
            </div>

            {/* Active status badge */}
            {isCameraActive && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-medium text-teal-300 border border-teal-500/30 z-10">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Live Video
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-between px-1">
            <span>
              🔒 All inference occurs entirely in your browser via WebAssembly.
            </span>
            <span>No images or video leave your device.</span>
          </p>
        </div>

        {/* Right Column: Live Detection Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Gesture Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Live Recognition Telemetry
            </h2>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Detected Gesture:</span>
              <div className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span
                  className={
                    detection.gesture === 'No hand detected'
                      ? 'text-slate-500'
                      : 'text-teal-400'
                  }
                >
                  {detection.gesture}
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="font-mono font-bold text-white">
                  {(detection.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, Math.max(0, detection.score * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Handedness</span>
                <span className="font-semibold text-slate-200">
                  {detection.handedness}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  Hands Detected
                </span>
                <span className="font-semibold text-slate-200">
                  {detection.handsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Test Gesture Checklist */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-xs flex flex-col gap-3">
            <h3 className="font-semibold text-slate-300">
              Expected Gesture Set (Q15):
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-slate-400">
              <li
                className={`p-2 rounded border ${detection.gesture === 'Open_Palm' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                ✋ Open_Palm
              </li>
              <li
                className={`p-2 rounded border ${detection.gesture === 'Closed_Fist' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                ✊ Closed_Fist
              </li>
              <li
                className={`p-2 rounded border ${detection.gesture === 'Pointing_Up' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                ☝️ Pointing_Up
              </li>
              <li
                className={`p-2 rounded border ${detection.gesture === 'Thumb_Up' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                👍 Thumb_Up
              </li>
              <li
                className={`p-2 rounded border ${detection.gesture === 'Thumb_Down' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                👎 Thumb_Down
              </li>
              <li
                className={`p-2 rounded border ${detection.gesture === 'Victory' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-800'}`}
              >
                ✌️ Victory
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
