/**
 * ScheduleScreen.tsx — Campus event schedule (T2.3, T2.6 manual parity)
 * Large, accessible typography, buttons >= 72px tall.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const TODAY = '25 October 2026'

const EVENTS = [
  {
    time: '09:00 – 11:00',
    venue: 'SJT-G07',
    title: 'VIT AI Innovate-A-Thon — Demos & Judging',
    tag: 'Hackathon',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    time: '11:00 – 12:00',
    venue: 'SJT-G01',
    title: 'Opening Keynote: AI in Society',
    tag: 'Keynote',
    tagColor: 'text-teal-400  bg-teal-500/10  border-teal-500/30',
  },
  {
    time: '12:00 – 13:00',
    venue: 'MB Foyer',
    title: 'Lunch & Networking',
    tag: 'Social',
    tagColor: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  {
    time: '13:00 – 14:30',
    venue: 'SJT-225',
    title: 'Workshop: Responsible AI Design',
    tag: 'Workshop',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
  {
    time: '14:30 – 15:30',
    venue: 'SJT-G07',
    title: 'Panel: From Research to Product',
    tag: 'Panel',
    tagColor: 'text-blue-400  bg-blue-500/10  border-blue-500/30',
  },
  {
    time: '15:30 – 17:00',
    venue: 'Main Stage',
    title: 'Award Ceremony & Closing',
    tag: 'Ceremony',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
] as const

export default function ScheduleScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header row with buttons >= 72px tall */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className="font-extrabold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            Today&rsquo;s Schedule
          </h2>
          <p className="mt-2 text-slate-400 text-2xl">{TODAY}</p>
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
            aria-label="Confirm current selection"
          >
            <span>✓</span>
            <span>Confirm</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* Event list */}
      <ol className="flex flex-col gap-4" aria-label="Schedule of events">
        {EVENTS.map(({ time, venue, title, tag, tagColor }) => (
          <li
            key={title}
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
          >
            {/* Time column */}
            <div className="shrink-0 w-36 sm:text-right">
              <span
                className="font-mono text-teal-400 font-semibold"
                style={{ fontSize: '20px' }}
              >
                {time.split('–')[0].trim()}
              </span>
              <span className="block text-slate-400 font-mono text-base">
                – {time.split('–')[1].trim()}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-slate-700 self-stretch shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3
                  className="text-white font-bold"
                  style={{ fontSize: '24px' }}
                >
                  {title}
                </h3>
                <span
                  className={`text-sm px-2.5 py-1 rounded-full border font-semibold ${tagColor}`}
                >
                  {tag}
                </span>
              </div>
              <p className="mt-1 text-slate-400 text-lg">📍 {venue}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
