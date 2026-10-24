/**
 * MapScreen.tsx — Campus map (T2.8 sample content)
 * SVG floor-plan of a realistic campus layout with 5 labelled buildings.
 * Interactive building inspection, high-contrast legend, buttons >= 72px tall.
 */

import { useState } from 'react'
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

interface BuildingInfo {
  id: string
  name: string
  shortCode: string
  rooms: string
  description: string
  hours: string
  isVenue?: boolean
}

const BUILDINGS: BuildingInfo[] = [
  {
    id: 'sjt',
    name: 'Silver Jubilee Tower (SJT)',
    shortCode: 'SJT',
    rooms: 'SJT-G01 Auditorium · SJT-G07 Lab (Judging) · Room 225',
    description:
      'Main event venue for VIT AI Innovate-A-Thon. Live demonstrations and project judging.',
    hours: 'Open 24/7 during Hackathon',
    isVenue: true,
  },
  {
    id: 'mb',
    name: 'Main Building (MB Block)',
    shortCode: 'MB',
    rooms: 'Central Foyer · Registrar Office · Ground Cafeteria',
    description:
      'Administrative offices, participant credentials verification, lunch and dinner buffet.',
    hours: '07:30 – 21:00',
  },
  {
    id: 'tt',
    name: 'Technology Tower (TT)',
    shortCode: 'TT',
    rooms: 'School of CSE & IS · AI Research Labs · Server Farm',
    description:
      'Department headquarters, high-performance computing clusters, mentor lounges.',
    hours: '08:00 – 22:00',
  },
  {
    id: 'lib',
    name: 'Central Library',
    shortCode: 'LIB',
    rooms: 'Reference Section · Digital Study Pods · IT Helpdesk',
    description:
      'Quiet study workspaces, power hubs, and technical documentation workstations.',
    hours: '08:00 – 23:00',
  },
  {
    id: 'aud',
    name: 'Anna Auditorium Complex',
    shortCode: 'AUD',
    rooms: 'Main Plenary Stage · Audio-Visual Control · Green Rooms',
    description:
      'Valedictory ceremony, keynote addresses, and prize distribution stage.',
    hours: '08:30 – 18:00',
  },
]

export default function MapScreen({ onDispatch }: Props) {
  const [activeBuildingId, setActiveBuildingId] = useState<string>('sjt')
  const activeBuilding =
    BUILDINGS.find((b) => b.id === activeBuildingId) ?? BUILDINGS[0]

  return (
    <section className="min-h-full p-6 sm:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header with buttons >= 72px tall */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-teal-400 tracking-wider uppercase">
            Vellore Institute of Technology · Main Campus Layout
          </span>
          <h2
            className="font-extrabold text-white leading-tight mt-1"
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
          >
            Interactive Campus Map
          </h2>
          <p className="mt-1 text-slate-400 text-lg sm:text-xl font-medium">
            5 Key Campus Facilities · You are at SJT Block (G07)
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
            aria-label="Confirm current building selection"
          >
            <span aria-hidden="true">✓</span>
            <span>Confirm Venue</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* SVG Map of 5 campus buildings */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 p-2 shadow-2xl">
        <svg
          viewBox="0 0 760 480"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Map of VIT campus with 5 labelled buildings"
        >
          {/* Background grid */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.8"
                opacity="0.6"
              />
            </pattern>
          </defs>
          <rect width="760" height="480" fill="url(#grid)" />

          {/* Primary Roads & Walkways */}
          <rect x="0" y="215" width="760" height="46" fill="#1e293b" />
          <rect x="355" y="0" width="46" height="480" fill="#1e293b" />

          {/* Secondary Walkways */}
          <rect
            x="180"
            y="70"
            width="16"
            height="340"
            fill="#0f172a"
            stroke="#334155"
            strokeDasharray="4 4"
          />
          <rect
            x="545"
            y="70"
            width="16"
            height="340"
            fill="#0f172a"
            stroke="#334155"
            strokeDasharray="4 4"
          />

          {/* Road name labels */}
          <text
            x="378"
            y="18"
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            NORTH CIRCLE AVE
          </text>
          <text
            x="378"
            y="472"
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SOUTH LINK RD
          </text>
          <text
            x="12"
            y="242"
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            WEST WAY
          </text>
          <text
            x="660"
            y="242"
            fill="#64748b"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            EAST BLVD
          </text>

          {/* 1. SJT Block (Silver Jubilee Tower) — Event Venue */}
          <g
            className="cursor-pointer transition-transform"
            onClick={() => setActiveBuildingId('sjt')}
          >
            <rect
              x="30"
              y="30"
              width="290"
              height="160"
              rx="12"
              fill={activeBuildingId === 'sjt' ? '#115e59' : '#134e4a'}
              stroke="#14b8a6"
              strokeWidth={activeBuildingId === 'sjt' ? '3.5' : '2'}
            />
            <text
              x="175"
              y="80"
              textAnchor="middle"
              fill="#5eead4"
              fontSize="22"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              SJT Block
            </text>
            <text
              x="175"
              y="105"
              textAnchor="middle"
              fill="#99f6e4"
              fontSize="13"
              fontFamily="sans-serif"
            >
              Silver Jubilee Tower · Event Venue
            </text>
            <text
              x="175"
              y="125"
              textAnchor="middle"
              fill="#2dd4bf"
              fontSize="12"
              fontFamily="sans-serif"
            >
              G-01 Auditorium · G-07 (Hackathon) · R-225
            </text>
            <rect
              x="110"
              y="142"
              width="130"
              height="28"
              rx="6"
              fill="#0f766e"
              stroke="#2dd4bf"
              strokeWidth="1"
            />
            <text
              x="175"
              y="161"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              📍 YOU ARE HERE
            </text>
          </g>

          {/* 2. Main Building (MB Block) */}
          <g
            className="cursor-pointer transition-transform"
            onClick={() => setActiveBuildingId('mb')}
          >
            <rect
              x="30"
              y="285"
              width="290"
              height="160"
              rx="12"
              fill={activeBuildingId === 'mb' ? '#334155' : '#1e293b'}
              stroke={activeBuildingId === 'mb' ? '#38bdf8' : '#475569'}
              strokeWidth={activeBuildingId === 'mb' ? '3' : '1.5'}
            />
            <text
              x="175"
              y="345"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="20"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              MB Block (Main Building)
            </text>
            <text
              x="175"
              y="375"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="13"
              fontFamily="sans-serif"
            >
              Administration · Central Foyer · Food Court
            </text>
            <text
              x="175"
              y="400"
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontFamily="sans-serif"
            >
              Badge Printing &amp; Networking Lunch
            </text>
          </g>

          {/* 3. Tech Tower (TT) */}
          <g
            className="cursor-pointer transition-transform"
            onClick={() => setActiveBuildingId('tt')}
          >
            <rect
              x="430"
              y="30"
              width="290"
              height="160"
              rx="12"
              fill={activeBuildingId === 'tt' ? '#334155' : '#1e293b'}
              stroke={activeBuildingId === 'tt' ? '#a78bfa' : '#475569'}
              strokeWidth={activeBuildingId === 'tt' ? '3' : '1.5'}
            />
            <text
              x="575"
              y="80"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="20"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Tech Tower (TT)
            </text>
            <text
              x="575"
              y="110"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="13"
              fontFamily="sans-serif"
            >
              School of CSE &amp; IS · AI Research Labs
            </text>
            <text
              x="575"
              y="135"
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontFamily="sans-serif"
            >
              Server Hub · Mentor Meeting Rooms
            </text>
          </g>

          {/* 4. Central Library */}
          <g
            className="cursor-pointer transition-transform"
            onClick={() => setActiveBuildingId('lib')}
          >
            <rect
              x="430"
              y="285"
              width="140"
              height="160"
              rx="12"
              fill={activeBuildingId === 'lib' ? '#334155' : '#1e293b'}
              stroke={activeBuildingId === 'lib' ? '#fbbf24' : '#475569'}
              strokeWidth={activeBuildingId === 'lib' ? '3' : '1.5'}
            />
            <text
              x="500"
              y="345"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="17"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Central Library
            </text>
            <text
              x="500"
              y="375"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontFamily="sans-serif"
            >
              Study Pods
            </text>
            <text
              x="500"
              y="400"
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontFamily="sans-serif"
            >
              IT Helpdesk
            </text>
          </g>

          {/* 5. Anna Auditorium */}
          <g
            className="cursor-pointer transition-transform"
            onClick={() => setActiveBuildingId('aud')}
          >
            <rect
              x="585"
              y="285"
              width="135"
              height="160"
              rx="12"
              fill={activeBuildingId === 'aud' ? '#334155' : '#1e293b'}
              stroke={activeBuildingId === 'aud' ? '#f43f5e' : '#475569'}
              strokeWidth={activeBuildingId === 'aud' ? '3' : '1.5'}
            />
            <text
              x="652"
              y="345"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="17"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Anna Auditorium
            </text>
            <text
              x="652"
              y="375"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontFamily="sans-serif"
            >
              Grand Stage
            </text>
            <text
              x="652"
              y="400"
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontFamily="sans-serif"
            >
              Awards &amp; Finals
            </text>
          </g>

          {/* Compass rose */}
          <g transform="translate(710, 25)">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="1"
            />
            <text
              x="16"
              y="21"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
            >
              N↑
            </text>
          </g>
        </svg>
      </div>

      {/* Building Details Card */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-teal-400">
              {activeBuilding.shortCode}
            </span>
            <h3 className="text-2xl font-bold text-white">
              {activeBuilding.name}
            </h3>
            {activeBuilding.isVenue && (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 text-xs font-bold">
                Current Event Venue
              </span>
            )}
          </div>
          <p className="mt-1 text-slate-300 text-base">
            {activeBuilding.description}
          </p>
          <p className="mt-1 text-slate-400 text-sm">
            📍 Key Venues:{' '}
            <strong className="text-slate-200">{activeBuilding.rooms}</strong> ·
            Hours: {activeBuilding.hours}
          </p>
        </div>

        {/* Quick building switcher buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBuildingId(b.id)}
              className={[
                'px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer',
                activeBuildingId === b.id
                  ? 'bg-teal-500 text-slate-950 border-teal-300 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700',
              ].join(' ')}
            >
              {b.shortCode}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
