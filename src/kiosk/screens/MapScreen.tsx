/**
 * MapScreen.tsx — Campus map (T2.3, T2.6 manual parity)
 * SVG floor-plan of a simplified campus layout with action buttons >= 72px tall.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

// Simple SVG campus map — buildings labeled, roads implied
const CampusSVG = () => (
  <svg
    viewBox="0 0 700 480"
    className="w-full max-w-2xl mx-auto rounded-2xl border-2 border-slate-700 shadow-xl"
    style={{ background: '#0f172a' }}
    role="img"
    aria-label="VIT campus map showing key buildings"
  >
    {/* Roads */}
    <rect x="0" y="220" width="700" height="40" fill="#1e293b" />
    <rect x="330" y="0" width="40" height="480" fill="#1e293b" />
    {/* Road labels */}
    <text
      x="350"
      y="13"
      textAnchor="middle"
      fill="#475569"
      fontSize="11"
      fontFamily="monospace"
    >
      North Ave
    </text>
    <text
      x="350"
      y="472"
      textAnchor="middle"
      fill="#475569"
      fontSize="11"
      fontFamily="monospace"
    >
      South Ave
    </text>
    <text x="8" y="237" fill="#475569" fontSize="11" fontFamily="monospace">
      West Rd
    </text>
    <text x="570" y="237" fill="#475569" fontSize="11" fontFamily="monospace">
      East Rd
    </text>

    {/* SJT Block — highlighted (event venue) */}
    <rect
      x="30"
      y="30"
      width="270"
      height="170"
      rx="8"
      fill="#134e4a"
      stroke="#14b8a6"
      strokeWidth="2.5"
    />
    <text
      x="165"
      y="105"
      textAnchor="middle"
      fill="#5eead4"
      fontSize="22"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      SJT Block
    </text>
    <text
      x="165"
      y="130"
      textAnchor="middle"
      fill="#2dd4bf"
      fontSize="13"
      fontFamily="sans-serif"
    >
      G-01 G-07 225
    </text>
    <rect x="60" y="145" width="105" height="28" rx="4" fill="#0f766e" />
    <text
      x="112"
      y="163"
      textAnchor="middle"
      fill="#f0fdfa"
      fontSize="12"
      fontFamily="sans-serif"
    >
      📍 You are here
    </text>

    {/* MB — Main Block */}
    <rect
      x="30"
      y="280"
      width="270"
      height="160"
      rx="8"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="1.5"
    />
    <text
      x="165"
      y="360"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="20"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      MB Block
    </text>
    <text
      x="165"
      y="385"
      textAnchor="middle"
      fill="#64748b"
      fontSize="13"
      fontFamily="sans-serif"
    >
      Admin · Foyer · Cafeteria
    </text>

    {/* TT — Tech Tower */}
    <rect
      x="400"
      y="30"
      width="270"
      height="170"
      rx="8"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="1.5"
    />
    <text
      x="535"
      y="115"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="20"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      Tech Tower
    </text>
    <text
      x="535"
      y="140"
      textAnchor="middle"
      fill="#64748b"
      fontSize="13"
      fontFamily="sans-serif"
    >
      CS · AI · Research Labs
    </text>

    {/* Library */}
    <rect
      x="400"
      y="280"
      width="270"
      height="160"
      rx="8"
      fill="#1e293b"
      stroke="#334155"
      strokeWidth="1.5"
    />
    <text
      x="535"
      y="360"
      textAnchor="middle"
      fill="#94a3b8"
      fontSize="20"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      Library
    </text>
    <text
      x="535"
      y="385"
      textAnchor="middle"
      fill="#64748b"
      fontSize="13"
      fontFamily="sans-serif"
    >
      Open 08:00 – 22:00
    </text>

    {/* Compass */}
    <text
      x="660"
      y="25"
      textAnchor="middle"
      fill="#64748b"
      fontSize="14"
      fontFamily="monospace"
    >
      N↑
    </text>
  </svg>
)

export default function MapScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className="font-extrabold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            Campus Map
          </h2>
          <p className="mt-2 text-slate-400 text-2xl">
            Vellore Institute of Technology — Main Campus
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
            aria-label="Confirm SJT Block location"
          >
            <span>✓</span>
            <span>Confirm Venue</span>
            <kbd className="text-xs font-mono bg-teal-800 text-teal-100 px-2 py-0.5 rounded border border-teal-600">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      <CampusSVG />

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2 text-lg text-teal-300 font-medium">
          <span className="w-5 h-5 rounded-md bg-teal-700 border-2 border-teal-400 inline-block" />
          Event Venue (SJT Block)
        </div>
        <div className="flex items-center gap-2 text-lg text-slate-300 font-medium">
          <span className="w-5 h-5 rounded-md bg-slate-700 border-2 border-slate-500 inline-block" />
          Campus Buildings
        </div>
        <div className="flex items-center gap-2 text-lg text-slate-400 font-medium">
          <span className="w-5 h-5 rounded-md bg-slate-800 border-2 border-slate-700 inline-block" />
          Campus Walkways
        </div>
      </div>
    </section>
  )
}
