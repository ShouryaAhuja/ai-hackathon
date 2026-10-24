/**
 * HomeScreen.tsx — Landing screen (T2.3)
 * Large heading, brief description, 4 big nav cards.
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
    <section className="flex flex-col items-center justify-center min-h-full p-10 gap-10">
      {/* Hero */}
      <div className="text-center max-w-3xl">
        <h2
          className="text-6xl font-extrabold tracking-tight text-white leading-tight"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          Welcome to VIT
        </h2>
        <p
          className="mt-4 text-slate-300 leading-relaxed max-w-xl mx-auto"
          style={{ fontSize: 'clamp(24px, 2.4vw, 28px)' }}
        >
          Use hand gestures or the buttons below to navigate. Hold any gesture
          steady for&nbsp;1&nbsp;second to activate.
        </p>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {NAV_CARDS.map(
          ({ action, icon, title, desc, gesture, key, color, accent }) => (
            <button
              key={title}
              type="button"
              onClick={() => onDispatch(action)}
              className={[
                'flex flex-col items-start gap-3 p-7 rounded-2xl border bg-gradient-to-b transition-all duration-200',
                'text-left hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]',
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
              <div className="mt-auto flex items-center gap-2 text-sm text-slate-500">
                <span>{gesture}</span>
                <kbd className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700">
                  {key}
                </kbd>
              </div>
            </button>
          ),
        )}
      </div>

      {/* Privacy note */}
      <p className="text-slate-500 text-base text-center">
        🔒 All gesture recognition runs entirely in your browser. No video
        leaves this device.
      </p>
    </section>
  )
}
