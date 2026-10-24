/**
 * MapScreen.tsx — Campus map (T2.3)
 * SVG floor-plan of a simplified campus layout.
 */
import { Action } from '../actions'

interface Props {
  onDispatch: (action: Action) => void
}

// Simple SVG campus map — buildings labeled, roads implied
const CampusSVG = () => (
  <svg
    viewBox="0 0 700 480"
    className="w-full max-w-2xl mx-auto rounded-2xl border border-slate-700"
    style={{ background: '#0f172a' }}
    role="img"
    aria-label="VIT campus map showing key buildings"
  >
    {/* Roads */}
    <rect x="0" y="220" width="700" height="40" fill="#1e293b" />
    <rect x="330" y="0" width="40" height="480" fill="#1e293b" />
    {/* Road labels */}
    <text x="350" y="13" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="monospace">North Ave</text>
    <text x="350" y="472" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="monospace">South Ave</text>
    <text x="8" y="237" fill="#475569" fontSize="11" fontFamily="monospace">West Rd</text>
    <text x="570" y="237" fill="#475569" fontSize="11" fontFamily="monospace">East Rd</text>

    {/* SJT Block — highlighted (event venue) */}
    <rect x="30" y="30" width="270" height="170" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
    <text x="165" y="105" textAnchor="middle" fill="#5eead4" fontSize="22" fontWeight="bold" fontFamily="sans-serif">SJT Block</text>
    <text x="165" y="130" textAnchor="middle" fill="#2dd4bf" fontSize="13" fontFamily="sans-serif">G-01  G-07  225</text>
    <rect x="60" y="145" width="90" height="28" rx="4" fill="#0f766e" />
    <text x="105" y="163" textAnchor="middle" fill="#f0fdfa" fontSize="12" fontFamily="sans-serif">📍 You are here</text>

    {/* MB — Main Block */}
    <rect x="30" y="280" width="270" height="160" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
    <text x="165" y="360" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold" fontFamily="sans-serif">MB Block</text>
    <text x="165" y="385" textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="sans-serif">Admin · Foyer · Cafeteria</text>

    {/* TT — Tech Tower */}
    <rect x="400" y="30" width="270" height="170" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
    <text x="535" y="115" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold" fontFamily="sans-serif">Tech Tower</text>
    <text x="535" y="140" textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="sans-serif">CS · AI · Research Labs</text>

    {/* Library */}
    <rect x="400" y="280" width="270" height="160" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
    <text x="535" y="360" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold" fontFamily="sans-serif">Library</text>
    <text x="535" y="385" textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="sans-serif">Open 08:00 – 22:00</text>

    {/* Compass */}
    <text x="660" y="25" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="monospace">N↑</text>
  </svg>
)

export default function MapScreen({ onDispatch }: Props) {
  return (
    <section className="min-h-full p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-extrabold text-white leading-none" style={{ fontSize: 'clamp(40px, 5vw, 56px)' }}>
            Campus Map
          </h2>
          <p className="mt-1 text-slate-400" style={{ fontSize: '24px' }}>
            Vellore Institute of Technology — Main Campus
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDispatch(Action.BACK)}
          className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-lg font-semibold transition-colors"
        >
          ← Back
        </button>
      </div>

      <CampusSVG />

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2 text-lg text-teal-400">
          <span className="w-4 h-4 rounded bg-teal-700 border border-teal-500 inline-block" />
          Event Venue (SJT)
        </div>
        <div className="flex items-center gap-2 text-lg text-slate-400">
          <span className="w-4 h-4 rounded bg-slate-700 border border-slate-600 inline-block" />
          Other Buildings
        </div>
        <div className="flex items-center gap-2 text-lg text-slate-500">
          <span className="w-4 h-4 rounded bg-slate-800 inline-block" />
          Roads
        </div>
      </div>
    </section>
  )
}
