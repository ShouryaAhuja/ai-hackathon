/**
 * LockedScreen.tsx — Kiosk locked state (T2.3, T2.6 manual parity, T2.7 idle/lock)
 * Displays a lock message; unlock via button >= 72px tall or Closed_Fist gesture / L key / H key.
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
        <span className="text-6xl" aria-hidden="true">
          🔒
        </span>
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
          style={{ fontSize: 'clamp(22px, 2.2vw, 26px)' }}
        >
          Gesture control is paused to prevent accidental triggers. Manual
          buttons remain active, or press Unlock to Home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onDispatch(Action.HOME)}
          className="min-h-[72px] px-10 py-5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3 border-2 border-teal-400 cursor-pointer text-2xl"
          style={{ minWidth: '260px' }}
          aria-label="Unlock kiosk and return to home screen"
        >
          <span>🔓</span>
          <span>Unlock to Home (H)</span>
        </button>

        <button
          type="button"
          onClick={() => onDispatch(Action.BACK)}
          className="min-h-[72px] px-8 py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border-2 border-slate-700 flex items-center justify-center gap-3 cursor-pointer text-2xl"
          aria-label="Return to previous screen"
        >
          <span>← Back</span>
        </button>
      </div>

      <p className="text-slate-400 text-xl text-center">
        Or hold a{' '}
        <span className="text-teal-400 font-semibold">Closed Fist ✊</span>{' '}
        for about a second to unlock.
      </p>
    </section>
  )
}
