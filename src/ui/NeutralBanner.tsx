/**
 * NeutralBanner.tsx — Amber feedback banner displayed on neutral/uncertain detection state.
 * DESIGN.md §3, §12: amber for neutral/uncertain, clear actionable guidance.
 */

interface NeutralBannerProps {
  /** Whether the neutral state is currently active */
  visible: boolean
  /** Optional custom text, defaults to standard prompt text */
  message?: string
}

export default function NeutralBanner({
  visible,
  message = 'Not sure - hold your hand steady or use the buttons',
}: NeutralBannerProps) {
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2.5 px-4 py-2 bg-amber-500/15 border border-amber-500/40 text-amber-200 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-200 shadow-sm"
    >
      <span className="text-base select-none shrink-0" aria-hidden="true">
        ⚠️
      </span>
      <span className="leading-tight">{message}</span>
    </div>
  )
}
