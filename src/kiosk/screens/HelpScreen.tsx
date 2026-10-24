/**
 * HelpScreen.tsx — Help & Information (T2.8 sample content)
 * Comprehensive 6-gesture guide, visual legend, detailed troubleshooting,
 * manual parity guarantee, buttons >= 72px tall per DESIGN.md §12.
 */

import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

interface GestureInstruction {
  emoji: string
  name: string
  label: string
  action: string
  key: string
  howTo: string
  tip: string
}

const GESTURE_INSTRUCTIONS: GestureInstruction[] = [
  {
    emoji: '✋',
    name: 'Open Palm',
    label: 'Open_Palm',
    action: 'Home',
    key: 'H',
    howTo: 'Face camera with all five fingers extended and spread outward.',
    tip: 'Keep hand at chest height facing directly forward.',
  },
  {
    emoji: '☝️',
    name: 'Point Up',
    label: 'Pointing_Up',
    action: 'Schedule',
    key: 'S',
    howTo:
      'Extend your index finger straight up with other fingers curled into palm.',
    tip: 'Keep index finger vertical and clearly separated from thumb.',
  },
  {
    emoji: '✌️',
    name: 'Victory (V-Sign)',
    label: 'Victory',
    action: 'Campus Map',
    key: 'M',
    howTo: 'Extend your index and middle fingers in a distinct V shape.',
    tip: 'Ensure fingers are noticeably spread apart.',
  },
  {
    emoji: '🤟',
    name: 'I-Love-You (ILY)',
    label: 'ILoveYou',
    action: 'Help & Info',
    key: '?',
    howTo: 'Extend your thumb, index finger, and pinky finger outward.',
    tip: 'Keep middle and ring fingers folded down against palm.',
  },
  {
    emoji: '👍',
    name: 'Thumb Up',
    label: 'Thumb_Up',
    action: 'Confirm / Select',
    key: '↵ Enter',
    howTo: 'Make a fist with your thumb pointing straight up.',
    tip: 'Keep thumb angled upwards, not sideways.',
  },
  {
    emoji: '👎',
    name: 'Thumb Down',
    label: 'Thumb_Down',
    action: 'Back / Cancel',
    key: '← Esc',
    howTo: 'Make a fist with your thumb pointing straight down.',
    tip: 'Great for returning to the previous screen or cancelling.',
  },
  {
    emoji: '✊',
    name: 'Closed Fist',
    label: 'Closed_Fist',
    action: 'Lock / Pause',
    key: 'L',
    howTo: 'Close all fingers tightly into a ball to toggle gesture lock.',
    tip: 'Pauses gesture recognition so accidental movements are ignored. Hold again to unlock.',
  },
]

const TROUBLESHOOTING = [
  {
    title: 'Optimal Lighting',
    desc: 'Face towards an ambient light source. Avoid bright windows directly behind you (backlighting obscures hand silhouette).',
  },
  {
    title: 'Ideal Distance',
    desc: 'Position your hand approximately 0.5 to 1.2 meters (arm’s length) from the webcam lens.',
  },
  {
    title: 'Hold for 800ms (Dwell Ring)',
    desc: 'Hold your hand steady. The teal dwell ring will fill clockwise over 800ms before triggering the action to prevent accidental taps.',
  },
  {
    title: 'Neutral State (Amber Alert)',
    desc: 'If the amber banner appears ("Not sure"), the AI confidence is below the 70% threshold. Hold steady or adjust hand orientation.',
  },
  {
    title: '100% Manual Parity',
    desc: 'You never have to use gestures if you prefer not to. Every single action is available via the 72px buttons and keyboard shortcuts.',
  },
  {
    title: 'Zero Cloud / Total Privacy',
    desc: 'Video is processed on your device and never stored or uploaded. All ML inference runs locally in browser WebAssembly.',
  },
]

const CONTACTS = [
  {
    role: 'Hackathon Organizing Committee',
    name: 'School of CSE & IS, VIT',
    email: 'cseis.hackathon@vit.ac.in',
    loc: 'SJT-G07 Evaluation Desk',
  },
  {
    role: 'Technical Operations Helpdesk',
    name: 'Campus IT Infrastructure Team',
    email: 'kiosk-support@vit.ac.in',
    loc: 'MB Block Room 102',
  },
  {
    role: 'Campus Facilities & Venue Desk',
    name: 'SJT Building Administration',
    email: 'facilities@vit.ac.in',
    loc: 'Ground Floor Reception, SJT',
  },
]

export default function HelpScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-6 sm:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header with buttons >= 72px tall */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-teal-400 tracking-wider uppercase">
            AirTouch Kiosk Guide &amp; Support
          </span>
          <h2
            className="font-extrabold text-white leading-tight mt-1"
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
          >
            How to Use Gesture Controls
          </h2>
          <p className="mt-1 text-slate-400 text-lg sm:text-xl font-medium">
            Learn the 6 touchless hand gestures, troubleshooting tips &amp;
            manual controls
          </p>
        </div>

        {/* Action buttons >= 72px tall */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onDispatch(Action.BACK)}
            className="min-h-[72px] flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-white text-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            aria-label="Go back to previous screen"
          >
            <span aria-hidden="true">←</span>
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
            <span aria-hidden="true">✓</span>
            <span>Confirm</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* 1. Gesture Legend & Instructions (6 gestures + Fist Lock) */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🖐️</span>
          <span>Gesture-to-Action Reference Guide</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GESTURE_INSTRUCTIONS.map((item) => (
            <div
              key={item.label}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 flex flex-col gap-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <div>
                    <h4 className="font-bold text-lg text-white leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {item.label}
                    </span>
                  </div>
                </div>
                <kbd className="text-xs font-mono bg-slate-800 text-teal-300 px-2 py-1 rounded border border-slate-700">
                  {item.key}
                </kbd>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-400">Action:</span>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                  → {item.action}
                </span>
              </div>

              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {item.howTo}
              </p>
              <p className="text-xs text-slate-400 italic mt-auto pt-2 border-t border-slate-800/80">
                💡 {item.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Troubleshooting Guide */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔧</span>
          <span>Troubleshooting &amp; Best Practices</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TROUBLESHOOTING.map((t) => (
            <div
              key={t.title}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5"
            >
              <h4 className="font-bold text-teal-300 text-lg">{t.title}</h4>
              <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Keyboard Shortcuts & Event Support Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keyboard shortcut table */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-white text-xl mb-3 flex items-center gap-2">
            <span>⌨️</span>
            <span>Keyboard Shortcuts (Full Parity)</span>
          </h4>
          <table className="w-full text-base">
            <tbody>
              {[
                ['H', 'Home Screen (Open Palm)'],
                ['S', 'Event Schedule (Point Up)'],
                ['M', 'Campus Map (Victory)'],
                ['?', 'Help & Info (I-Love-You)'],
                ['← / Esc / B', 'Go Back (Thumb Down)'],
                ['↵ / Enter / C', 'Confirm / Select (Thumb Up)'],
                ['L', 'Lock / Pause Gestures (Closed Fist)'],
              ].map(([key, label]) => (
                <tr
                  key={key}
                  className="border-b border-slate-800 last:border-0"
                >
                  <td className="py-2.5 pr-4">
                    <kbd className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg font-mono text-teal-300 text-sm font-bold">
                      {key}
                    </kbd>
                  </td>
                  <td className="py-2.5 text-slate-300 text-sm">{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contacts */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <h4 className="font-bold text-white text-xl flex items-center gap-2">
            <span>📞</span>
            <span>Event Support &amp; Desks</span>
          </h4>
          <div className="flex flex-col gap-3">
            {CONTACTS.map((c) => (
              <div
                key={c.role}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800"
              >
                <p className="font-bold text-teal-400 text-sm">{c.role}</p>
                <p className="text-white text-sm font-semibold">{c.name}</p>
                <p className="text-slate-400 text-xs">
                  📧 {c.email} · 📍 {c.loc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
