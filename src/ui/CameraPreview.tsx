/**
 * CameraPreview.tsx — Mirrored corner webcam preview with canvas landmark overlay.
 * Follows DESIGN.md §12 and RULES.md §11:
 *  - Small, rounded, mirrored (scale-x-[-1]) in corner
 *  - Landmark overlay toggle
 *  - Canvas drawing occurs directly without React re-render per frame
 */

import React from 'react'

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isCameraActive: boolean
  isLoading: boolean
  initError: string | null
  showLandmarks: boolean
  onToggleLandmarks: () => void
  onToggleCamera: () => void
  showPreview: boolean
  onTogglePreview: () => void
  currentGesture?: string
  currentScore?: number
  dwellProgress?: number
}

export default function CameraPreview({
  videoRef,
  canvasRef,
  isCameraActive,
  isLoading,
  initError,
  showLandmarks,
  onToggleLandmarks,
  onToggleCamera,
  showPreview,
  onTogglePreview,
  currentGesture = 'None',
  currentScore = 0,
  dwellProgress = 0,
}: CameraPreviewProps) {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Corner preview container                                           */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Webcam feed and gesture monitor"
        className={[
          'fixed bottom-28 right-6 z-40 flex flex-col gap-2 transition-all duration-300',
          showPreview
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        ].join(' ')}
        style={{ width: '240px' }}
      >
        {/* Preview box */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl aspect-[4/3]">
          {/* Mirrored video element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            aria-label="Camera preview mirrored"
          />

          {/* Mirrored canvas for direct 2D landmark rendering (NO React re-render per frame) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
            aria-hidden="true"
          />

          {/* Model Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <div className="w-7 h-7 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-200 font-medium">
                Loading vision model…
              </p>
              <p className="text-[10px] text-slate-400">
                Running 100% offline in browser
              </p>
            </div>
          )}

          {/* Camera / Permission / Model Error State */}
          {!isLoading && initError && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <span className="text-xl" aria-hidden="true">
                📷
              </span>
              <p className="text-xs text-red-300 font-medium leading-tight">
                {initError}
              </p>
              <p className="text-[10px] text-slate-400">
                Manual buttons and keyboard shortcuts remain 100% functional.
              </p>
              <button
                type="button"
                onClick={onToggleCamera}
                className="mt-1 text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-medium"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Camera Off State */}
          {!isLoading && !initError && !isCameraActive && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <span className="text-2xl opacity-60" aria-hidden="true">
                📷
              </span>
              <p className="text-xs text-slate-300 font-medium">
                Camera is paused
              </p>
              <p className="text-[10px] text-slate-400">
                Use buttons below to navigate
              </p>
              <button
                type="button"
                onClick={onToggleCamera}
                className="mt-1 text-xs px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium shadow"
              >
                Turn On Camera
              </button>
            </div>
          )}

          {/* Live badge */}
          {isCameraActive && !isLoading && !initError && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] text-teal-300 font-semibold border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              LIVE PREVIEW
            </div>
          )}

          {/* Current gesture pill inside preview */}
          {isCameraActive &&
            currentGesture !== 'None' &&
            currentGesture !== 'No hand' && (
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs rounded-lg px-2 py-1 text-center text-xs font-semibold text-teal-300 border border-slate-700 truncate">
                {currentGesture} ({Math.round(currentScore * 100)}%)
                {dwellProgress > 0 && (
                  <span className="text-slate-300 ml-1 font-normal font-mono">
                    [{Math.round(dwellProgress * 100)}%]
                  </span>
                )}
              </div>
            )}
        </div>

        {/* Controls toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={onToggleLandmarks}
            title={
              showLandmarks
                ? 'Hide skeleton landmarks'
                : 'Show skeleton landmarks'
            }
            className={[
              'flex-1 py-1 px-2 text-xs font-medium rounded-lg border transition-colors',
              showLandmarks
                ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white',
            ].join(' ')}
          >
            {showLandmarks ? 'Landmarks: ON' : 'Landmarks: OFF'}
          </button>

          <button
            type="button"
            onClick={onToggleCamera}
            disabled={isLoading}
            title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
            className={[
              'py-1 px-2.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50',
              isCameraActive
                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-teal-600/30 border-teal-500/50 text-teal-300 hover:bg-teal-600/50',
            ].join(' ')}
          >
            {isCameraActive ? 'Stop' : 'Start'}
          </button>
        </div>

        {/* Privacy notice (T2.7 exact string) */}
        <p className="text-[10px] text-slate-400 text-center leading-tight">
          Video is processed on your device and never stored or uploaded.
        </p>
      </aside>

      {/* Floating toggle pill to show/hide the preview */}
      <button
        type="button"
        onClick={onTogglePreview}
        title={showPreview ? 'Minimize camera preview' : 'Open camera preview'}
        className="fixed bottom-28 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 rounded-xl shadow-lg backdrop-blur transition-all"
        style={{
          transform: showPreview ? 'translateX(-248px)' : 'translateX(0)',
        }}
        aria-label={
          showPreview ? 'Minimize camera preview' : 'Open camera preview'
        }
      >
        <span aria-hidden="true">{showPreview ? '▶' : '◀'}</span>
        <span>{showPreview ? 'Hide Cam' : 'Show Cam'}</span>
      </button>
    </>
  )
}
