/**
 * ScheduleScreen.tsx — Campus event schedule (T2.3)
 * Synthetic, realistic VIT event data.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const TODAY = '25 October 2026'

const EVENTS = [
  { time: '09:00 – 11:00', venue: 'SJT-G07',    title: 'VIT AI Innovate-A-Thon — Demos & Judging', tag: 'Hackathon',  tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { time: '11:00 – 12:00', venue: 'SJT-G01',    title: 'Opening Keynote: AI in Society',            tag: 'Keynote',    tagColor: 'text-teal-400  bg-teal-500/10  border-teal-500/30'  },
  { time: '12:00 – 13:00', venue: 'MB Foyer',   title: 'Lunch & Networking',                        tag: 'Social',     tagColor: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { time: '13:00 – 14:30', venue: 'SJT-225',    title: 'Workshop: Responsible AI Design',           tag: 'Workshop',   tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { time: '14:30 – 15:30', venue: 'SJT-G07',    title: 'Panel: From Research to Product',           tag: 'Panel',      tagColor: 'text-blue-400  bg-blue-500/10  border-blue-500/30'  },
  { time: '15:30 – 17:00', venue: 'Main Stage', title: 'Award Ceremony & Closing',                  tag: 'Ceremony',   tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
] as const

export default function ScheduleScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-8 max-w-4xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-extrabold text-white leading-none" style={{ fontSize: 'clamp(40px, 5vw, 56px)' }}>
            Today&rsquo;s Schedule
          </h2>
          <p className="mt-1 text-slate-400" style={{ fontSize: '24px' }}>{TODAY}</p>
        </div>
        <button
          type="button"
          onClick={() => onDispatch(Action.BACK)}
          className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-lg font-semibold transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Event list */}
      <ol className="flex flex-col gap-4" aria-label="Schedule of events">
        {EVENTS.map(({ time, venue, title, tag, tagColor }) => (
          <li
            key={title}
            className="flex gap-5 items-start bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
          >
            {/* Time column */}
            <div className="shrink-0 w-36 text-right">
              <span className="font-mono text-teal-400 font-semibold" style={{ fontSize: '20px' }}>
                {time.split('–')[0].trim()}
              </span>
              <span className="block text-slate-500 font-mono text-base">
                – {time.split('–')[1].trim()}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px bg-slate-700 self-stretch shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-white font-bold" style={{ fontSize: '24px' }}>{title}</h3>
                <span className={`text-sm px-2.5 py-1 rounded-full border font-semibold ${tagColor}`}>
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
