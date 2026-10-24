/**
 * LockedScreen.tsx — Kiosk locked state (T2.3)
 * Displays a lock message; unlock via Home button or H key.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

export default function LockedScreen({ onDispatch }: Props) {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-full gap-8 p-10"
      aria-live="assertive"
    >
      {/* Lock icon */}
      <div className="w-28 h-28 rounded-3xl bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center">
        <span className="text-6xl" aria-hidden="true">🔒</span>
      </div>

      <div className="text-center">
        <h2
          className="font-extrabold text-amber-400 leading-tight"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          Kiosk Locked
        </h2>
        <p
          className="mt-4 text-slate-300 max-w-lg mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(24px, 2.4vw, 28px)' }}
        >
          This kiosk is temporarily locked. Press unlock to resume or use the button below.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDispatch(Action.HOME)}
        className="px-10 py-5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors shadow-lg shadow-teal-500/20"
        style={{ fontSize: '28px', minWidth: '240px' }}
        aria-label="Unlock kiosk and go to home screen"
      >
        Unlock (H)
      </button>

      <p className="text-slate-500 text-xl">
        Or make the <span className="text-teal-400 font-semibold">Open Palm</span> gesture
      </p>
    </section>
  )
}
