/**
 * ScheduleScreen.tsx — Campus event schedule (T2.8 sample content)
 * Synthetic, realistic VIT AI Innovate-A-Thon day plan (8 items).
 * High-contrast, buttons >= 72px tall per DESIGN.md §12.
 */

import { useState } from 'react'
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

const TODAY = 'Saturday, 25 October 2026'
const EVENT_NAME =
  'VIT AI Innovate-A-Thon — Department of Cybersecurity and Intelligent Systems'

interface ScheduleEvent {
  id: number
  time: string
  venue: string
  title: string
  speaker: string
  description: string
  tag: string
  tagColor: string
}

const EVENTS: ScheduleEvent[] = [
  {
    id: 1,
    time: '08:30 – 09:00',
    venue: 'SJT Lobby (Ground Floor)',
    title: 'Participant Check-in & Kiosk Badge Collection',
    speaker: 'Event Organizing Team',
    description:
      'Registration verification, badge printing, and Wi-Fi credential setup.',
    tag: 'Check-in',
    tagColor: 'text-slate-300 bg-slate-800 border-slate-700',
  },
  {
    id: 2,
    time: '09:00 – 11:00',
    venue: 'SJT-G07 Lab',
    title: 'AI Innovate-A-Thon — Project Demos & Round 1 Judging',
    speaker: 'Faculty Jury & Industry Evaluators',
    description:
      'In-person live evaluation of Q15 touchless kiosks and AI prototypes.',
    tag: 'Judging',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
  },
  {
    id: 3,
    time: '11:00 – 12:00',
    venue: 'SJT-G01 Auditorium',
    title: 'Opening Keynote: Accessible AI in Public Physical Spaces',
    speaker: 'Dr. K. Ramanathan, Dept. Head CSE & IS',
    description:
      'Exploration of contactless multimodal interactions, assistive tech, and privacy by design.',
    tag: 'Keynote',
    tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/40',
  },
  {
    id: 4,
    time: '12:00 – 13:00',
    venue: 'MB Foyer (Main Building)',
    title: 'Networking Lunch & Interactive Tech Showcase',
    speaker: 'All Teams & Visiting Delegates',
    description:
      'Catered lunch with poster sessions and student innovation exhibits.',
    tag: 'Social',
    tagColor: 'text-green-400 bg-green-500/10 border-green-500/40',
  },
  {
    id: 5,
    time: '13:00 – 14:30',
    venue: 'SJT-225 Smart Seminar Room',
    title: 'Hands-on Workshop: On-Device Vision & Privacy-First UX',
    speaker: 'Research Scholars, Intelligent Systems Lab',
    description:
      'Best practices for WebAssembly client-side inference, zero-cloud architectures, and hold-to-confirm UX.',
    tag: 'Workshop',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/40',
  },
  {
    id: 6,
    time: '14:30 – 15:30',
    venue: 'SJT-G07 Lab',
    title: 'Panel Discussion: Edge ML, Latency Guarantees & Inclusive Tech',
    speaker: 'Industry Advisory Board',
    description:
      'Discussion on deploying computer vision models in resource-constrained environments.',
    tag: 'Panel',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/40',
  },
  {
    id: 7,
    time: '15:30 – 16:30',
    venue: 'Tech Tower Innovation Center',
    title: 'Top-5 Finalist Live Stage Demonstrations',
    speaker: 'Finalist Teams & Grand Jury',
    description:
      'Selected teams pitch full solutions with live audience interaction.',
    tag: 'Finals',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
  },
  {
    id: 8,
    time: '16:30 – 17:30',
    venue: 'Anna Auditorium (Main Stage)',
    title: 'Valedictory Ceremony, Awards & SDG Recognition',
    speaker: 'Dean of Computing & Chief Guest',
    description:
      'Announcement of category winners, certificates of merit, and closing address.',
    tag: 'Awards',
    tagColor: 'text-teal-300 bg-teal-500/20 border-teal-400',
  },
]

export default function ScheduleScreen({ onDispatch }: Props) {
  const [selectedId, setSelectedId] = useState<number>(2)

  return (
    <section className="min-h-full p-6 sm:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header row with buttons >= 72px tall */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-teal-400 tracking-wider uppercase">
            {EVENT_NAME}
          </span>
          <h2
            className="font-extrabold text-white leading-tight mt-1"
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
          >
            Today&rsquo;s Event Schedule
          </h2>
          <p className="mt-1 text-slate-400 text-lg sm:text-xl font-medium">
            📅 {TODAY} · 8 Scheduled Sessions
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
            aria-label="Confirm current session selection"
          >
            <span aria-hidden="true">✓</span>
            <span>Confirm</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* Selected event spotlight banner */}
      {selectedId && (
        <div className="p-4 bg-teal-950/40 border-2 border-teal-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <span>★ Active Selected Session</span>
              <span className="text-slate-500">·</span>
              <span>{EVENTS.find((e) => e.id === selectedId)?.time}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {EVENTS.find((e) => e.id === selectedId)?.title}
            </h3>
            <p className="text-sm text-slate-300">
              📍 Venue:{' '}
              <strong className="text-teal-300">
                {EVENTS.find((e) => e.id === selectedId)?.venue}
              </strong>{' '}
              · Speaker: {EVENTS.find((e) => e.id === selectedId)?.speaker}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDispatch(Action.MAP)}
            className="shrink-0 px-4 py-2 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-400/60 rounded-xl text-teal-200 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>🗺️ Show on Map</span>
          </button>
        </div>
      )}

      {/* Event list (8 items) */}
      <ol className="flex flex-col gap-3.5" aria-label="Schedule of events">
        {EVENTS.map((event) => {
          const isSelected = selectedId === event.id
          return (
            <li
              key={event.id}
              onClick={() => setSelectedId(event.id)}
              className={[
                'flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center rounded-2xl p-5 transition-all cursor-pointer border-2',
                isSelected
                  ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900',
              ].join(' ')}
            >
              {/* Time column */}
              <div className="shrink-0 w-36 sm:text-right">
                <span
                  className="font-mono text-teal-400 font-bold block"
                  style={{ fontSize: '19px' }}
                >
                  {event.time.split('–')[0].trim()}
                </span>
                <span className="block text-slate-400 font-mono text-sm">
                  – {event.time.split('–')[1].trim()}
                </span>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block w-px bg-slate-700/80 self-stretch shrink-0" />

              {/* Content column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3
                    className="text-white font-bold leading-snug"
                    style={{ fontSize: '20px' }}
                  >
                    {event.title}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${event.tagColor}`}
                  >
                    {event.tag}
                  </span>
                </div>
                <p className="mt-1 text-slate-300 text-base">
                  📍 {event.venue}
                </p>
                <p className="mt-0.5 text-slate-400 text-sm">
                  {event.description}
                </p>
              </div>

              {/* Selection indicator */}
              <div className="shrink-0 text-right">
                <span
                  className={[
                    'text-xs font-semibold px-2.5 py-1 rounded-lg border inline-block',
                    isSelected
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700',
                  ].join(' ')}
                >
                  {isSelected ? 'Selected ✓' : 'Tap to Select'}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
