/**
 * HelpScreen.tsx — Help & Information (T2.3)
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const FAQS = [
  {
    q: 'How do I use the gesture controls?',
    a: 'Hold your hand up in front of the camera and make one of the 6 gestures shown in the legend at the bottom. Hold it steady for about 1 second — a ring will fill up as the system confirms your gesture.',
  },
  {
    q: "What if my gesture isn't recognised?",
    a: 'Try in better lighting, against a plain background. You can always use the buttons in the navigation bar or press keyboard shortcuts (H, S, M, L for Lock, ← for Back, ↵ for Confirm).',
  },
  {
    q: 'Is my camera footage recorded or stored?',
    a: 'No. All gesture recognition runs entirely in your browser using WebAssembly. No video, images, or landmarks are sent anywhere or stored on any server.',
  },
  {
    q: "The camera isn't working — can I still navigate?",
    a: 'Yes. The kiosk is fully functional without a camera. Use the navigation buttons at the top or keyboard shortcuts.',
  },
  {
    q: 'How do I lock or unlock the kiosk?',
    a: 'Make a closed fist gesture (or press L on the keyboard) to lock. Press the unlock icon in the top-right corner (or press H) to return to the home screen.',
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
    <section className="min-h-full p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="font-extrabold text-white leading-none"
          style={{ fontSize: 'clamp(40px, 5vw, 56px)' }}
        >
          Help &amp; Information
        </h2>
        <button
          type="button"
          onClick={() => onDispatch(Action.BACK)}
          className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-lg font-semibold transition-colors"
        >
          ← Back
        </button>
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
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

        {/* Contacts */}
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
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

          {/* Keyboard shortcuts card */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4
              className="font-bold text-white mb-3"
              style={{ fontSize: '22px' }}
            >
              Keyboard Shortcuts
            </h4>
            <table className="w-full text-lg">
              <tbody>
                {[
                  ['H', 'Go Home'],
                  ['S', 'Schedule'],
                  ['M', 'Map'],
                  ['L', 'Lock'],
                  ['←  Esc', 'Back'],
                  ['↵  →', 'Confirm'],
                ].map(([key, label]) => (
                  <tr
                    key={key}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="py-2 pr-4">
                      <kbd className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg font-mono text-teal-300 text-base">
                        {key}
                      </kbd>
                    </td>
                    <td className="py-2 text-slate-300">{label}</td>
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
