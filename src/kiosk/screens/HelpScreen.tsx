/**
 * HelpScreen.tsx — Help & Information (T2.3, T2.6 manual parity)
 * Actions >= 72px tall, comprehensive gesture guide and manual parity explanation.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const FAQS = [
  {
    q: 'How do I use the gesture controls?',
    a: 'Hold your hand up in front of the camera and form one of the 6 gestures shown in the legend at the bottom. Hold it steady for 800ms — the teal dwell ring will fill up to confirm your gesture.',
  },
  {
    q: "What if my gesture isn't recognised?",
    a: 'Ensure your hand is well-lit and clearly visible. You can always use the large 72px buttons on screen or keyboard shortcuts (H, S, M, ?, ← Back, ↵ Confirm, L Lock).',
  },
  {
    q: 'Is my camera footage recorded or stored?',
    a: 'No. Video is processed on your device and never stored or uploaded. Gesture recognition executes entirely in your browser using local WebAssembly.',
  },
  {
    q: "The camera isn't working — can I still navigate?",
    a: 'Yes! AirTouch features 100% manual parity. Every single action is available using the visible buttons or keyboard shortcuts even if the camera is denied or turned off.',
  },
  {
    q: 'How do I lock or unlock the kiosk?',
    a: 'Make a closed fist gesture (or press L on the keyboard) to pause gesture control and lock the screen. Press the unlock button or press H to return to Home.',
  },
] as const

const CONTACTS = [
  {
    role: 'Event Coordination',
    name: 'School of CSE & IS',
    contact: 'cseis@vit.ac.in',
  },
  {
    role: 'Technical Support',
    name: 'IT Helpdesk',
    contact: 'helpdesk@vit.ac.in',
  },
  {
    role: 'Venue Management',
    name: 'SJT Admin',
    contact: 'SJT Reception, Ground Floor',
  },
] as const

export default function HelpScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className="font-extrabold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            Help &amp; Information
          </h2>
          <p className="mt-2 text-slate-400 text-2xl">
            Gesture instructions, troubleshooting &amp; manual controls
          </p>
        </div>

        {/* Action buttons >= 72px tall */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onDispatch(Action.BACK)}
            className="min-h-[72px] flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            aria-label="Go back to previous screen"
          >
            <span>←</span>
            <span>Back</span>
            <kbd className="text-xs font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Esc
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => onDispatch(Action.CONFIRM)}
            className="min-h-[72px] flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 border-2 border-teal-400 text-white text-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            aria-label="Confirm help acknowledged"
          >
            <span>✓</span>
            <span>Confirm</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQs */}
        <div>
          <h3
            className="font-bold text-teal-400 mb-4"
            style={{ fontSize: '28px' }}
          >
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col gap-5">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5"
              >
                <p
                  className="font-semibold text-white"
                  style={{ fontSize: '22px' }}
                >
                  {q}
                </p>
                <p
                  className="mt-2 text-slate-300 leading-relaxed"
                  style={{ fontSize: '18px' }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts & Shortcuts */}
        <div className="flex flex-col gap-6">
          <div>
            <h3
              className="font-bold text-teal-400 mb-4"
              style={{ fontSize: '28px' }}
            >
              Contact &amp; Support
            </h3>
            <div className="flex flex-col gap-4">
              {CONTACTS.map(({ role, name, contact }) => (
                <div
                  key={role}
                  className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5"
                >
                  <p
                    className="font-semibold text-teal-300"
                    style={{ fontSize: '22px' }}
                  >
                    {role}
                  </p>
                  <p className="text-white mt-0.5" style={{ fontSize: '20px' }}>
                    {name}
                  </p>
                  <p
                    className="text-slate-400 mt-0.5"
                    style={{ fontSize: '18px' }}
                  >
                    {contact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard shortcuts card */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6">
            <h4
              className="font-bold text-white mb-3"
              style={{ fontSize: '22px' }}
            >
              Keyboard Shortcuts (100% Parity)
            </h4>
            <table className="w-full text-lg">
              <tbody>
                {[
                  ['H', 'Home Screen'],
                  ['S', 'Event Schedule'],
                  ['M', 'Campus Map'],
                  ['?', 'Help & Info'],
                  ['← / Esc / B', 'Go Back'],
                  ['↵ / Enter / C', 'Confirm / Select'],
                  ['L', 'Lock / Pause Gestures'],
                ].map(([key, label]) => (
                  <tr
                    key={key}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="py-2.5 pr-4">
                      <kbd className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg font-mono text-teal-300 text-base">
                        {key}
                      </kbd>
                    </td>
                    <td className="py-2.5 text-slate-300">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
