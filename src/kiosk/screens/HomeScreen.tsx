/**
 * HomeScreen.tsx — Landing screen (T2.3, T2.6 manual parity)
 * Large heading, brief description, nav cards and manual parity buttons >= 72px tall.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const NAV_CARDS = [
  {
    action: Action.SCHEDULE,
    icon: '📅',
    title: 'Schedule',
    desc: "Today's events and upcoming campus activities",
    gesture: '☝️ Point Up',
    key: 'S',
    color:
      'from-teal-500/20 to-teal-600/5 border-teal-500/30 hover:border-teal-400/60',
    accent: 'text-teal-400',
  },
  {
    action: Action.MAP,
    icon: '🗺️',
    title: 'Campus Map',
    desc: 'Buildings, classrooms, parking and facilities',
    gesture: '✌️ Victory',
    key: 'M',
    color:
      'from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-400/60',
    accent: 'text-blue-400',
  },
  {
    action: Action.HELP,
    icon: '❓',
    title: 'Help & Info',
    desc: 'Contact details, FAQs and kiosk instructions',
    gesture: '🤟 ILY',
    key: '?',
    color:
      'from-violet-500/20 to-violet-600/5 border-violet-500/30 hover:border-violet-400/60',
    accent: 'text-violet-400',
  },
] as const

export default function HomeScreen({ onDispatch }: Props) {
  return (
    <section className="flex flex-col items-center justify-center min-h-full p-8 gap-8">
      {/* Hero */}
      <div className="text-center max-w-3xl">
        <h2
          className="text-6xl font-extrabold tracking-tight text-white leading-tight"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          Welcome to VIT
        </h2>
        <p
          className="mt-4 text-slate-300 leading-relaxed max-w-2xl mx-auto"
          style={{ fontSize: 'clamp(22px, 2.2vw, 26px)' }}
        >
          Use hand gestures, the large buttons below, or keyboard shortcuts to
          navigate. Hold any gesture steady for 800ms to activate.
        </p>
      </div>

      {/* Nav cards (touch targets >= 200px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        {NAV_CARDS.map(
          ({ action, icon, title, desc, gesture, key, color, accent }) => (
            <button
              key={title}
              type="button"
              onClick={() => onDispatch(action)}
              className={[
                'flex flex-col items-start gap-3 p-7 rounded-2xl border-2 bg-gradient-to-b transition-all duration-200',
                'text-left hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] cursor-pointer',
                color,
              ].join(' ')}
              style={{ minHeight: '200px' }}
            >
              <span className="text-4xl">{icon}</span>
              <div>
                <h3
                  className={`font-bold text-white ${accent}`}
                  style={{ fontSize: 'clamp(24px, 2.5vw, 30px)' }}
                >
                  {title}
                </h3>
                <p className="mt-1 text-slate-400" style={{ fontSize: '18px' }}>
                  {desc}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm text-slate-400">
                <span>{gesture}</span>
                <kbd className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-mono border border-slate-700">
                  {key}
                </kbd>
              </div>
            </button>
          ),
        )}
      </div>

      {/* Manual Quick Action Bar (buttons >= 72px tall per DESIGN.md §12) */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-4xl">
        <button
          type="button"
          onClick={() => onDispatch(Action.CONFIRM)}
          className="min-h-[72px] flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xl border-2 border-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-2xl">✓</span>
          <span>Confirm / Select</span>
          <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-1 rounded border border-teal-600">
            ↵ Enter
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => onDispatch(Action.SCHEDULE)}
          className="min-h-[72px] flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl border-2 border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-2xl">📅</span>
          <span>Open Schedule</span>
          <kbd className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700">
            S
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => onDispatch(Action.MAP)}
          className="min-h-[72px] flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl border-2 border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-2xl">🗺️</span>
          <span>Open Map</span>
          <kbd className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700">
            M
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => onDispatch(Action.TEST)}
          className="min-h-[72px] flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 font-bold text-xl border-2 border-teal-500/60 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md"
          aria-label="Open evaluation test mode"
        >
          <span className="text-2xl">🧪</span>
          <span>Test Mode</span>
          <kbd className="text-xs font-mono bg-slate-900 text-teal-200 px-2 py-1 rounded border border-teal-600">
            T
          </kbd>
        </button>
      </div>

      {/* Privacy note */}
      <p className="text-slate-400 text-base text-center">
        🔒 All gesture recognition runs entirely in your browser. Video is
        processed on your device and never stored or uploaded.
      </p>
    </section>
  )
}
