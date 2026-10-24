# DESIGN.md - UI/UX Standards

> Goal: look like a **credible product**, not a generic AI template. Judges form an opinion in the first 10 seconds.
> Brand-specific values (`[FILL]`) get decided once the problem/domain is known.

## 1. Design principles
1. **Clarity first.** The user understands what the app does within 5-10 seconds of landing.
2. **Show the AI working.** Visible progress, streamed output, sources/confidence where possible.
3. **One primary action per screen.** Large, obvious, above the fold.
4. **Earn trust.** Disclose AI use, handle errors kindly, never fake certainty.
5. **Demo-optimised.** One-click examples, no dead ends, no empty-looking screens.
6. **Consistency over novelty.** Same spacing, colours, components everywhere.

## 2. Anti-"AI slop" checklist
Avoid: purple-to-blue gradient everywhere, generic hero with sparkle emoji, default unstyled library look, glassmorphism overload,
meaningless stock illustrations, Lorem ipsum, centred-everything layouts, emoji as icons, walls of text, inconsistent border radii.
Prefer: a distinct accent colour tied to the domain, real example content, purposeful whitespace, a strong type hierarchy, real icons (Lucide), subtle motion.

## 3. Design tokens (define once in Tailwind config / CSS variables)
| Token | Value |
|---|---|
| Primary / accent | Teal-500 (#14b8a6) for fills/rings/large elements; Teal-700 (#0f766e) for any text or small icons on light backgrounds |
| Neutral scale | Slate/Zinc 50-950 |
| Success / warning / error / info | green-600 / amber-500 / red-600 / blue-600 |
| Background / surface / border | `--bg`, `--surface`, `--border` (light + dark values) |
| Font - UI | Inter (or system UI stack as fallback) |
| Font - display (optional) | Space Grotesk (headings); Inter for body — one display face max |
| Font - code | JetBrains Mono / ui-monospace |
| Type scale | 12 / 14 / 16 / 18 / 24 / 32 / 48 px; line-height 1.5 body, 1.2 headings |
| Spacing | 4 px base: 4, 8, 12, 16, 24, 32, 48, 64 |
| Radius | 8 px controls, 12-16 px cards (pick and stick) |
| Shadow | 2 levels only: subtle (cards), elevated (modals/popovers) |
| Motion | 150-250 ms ease-out; respect `prefers-reduced-motion` |
| Breakpoints | 640 / 768 / 1024 / 1280 |

Support **light and dark** via CSS variables (dark mode is a cheap polish win; skip only if time is critical).

## 4. Layout & structure
- Max content width ~1100-1200 px; generous vertical rhythm.
- **Header:** logo/name, 2-4 nav items max, GitHub link, optional theme toggle.
- **Hero / landing:** headline (outcome-focused), one-sentence subline, primary CTA, example inputs, small screenshot or live preview.
- **Main workspace:** input panel (left/top) -> result panel (right/bottom); stacks vertically on mobile.
- **Footer:** team, GitHub repo, "AI-generated content may be inaccurate" note, licences.

## 5. Component standards
- Buttons: primary (filled), secondary (outline), ghost; clear disabled + loading states (spinner, label change).
- Inputs: visible labels, helper text, inline validation, character counters where limits exist.
- Cards: consistent padding, title, optional action; skeleton variant for loading.
- Results display: structured (headings, lists, tables, badges) rather than a wall of text; copy / download / regenerate actions.
- Feedback: toasts for transient events; inline messages for errors tied to a field/section.
- Badges: "AI-generated", "Demo mode" (when using mocks), confidence level if available.
- Icons: one set (Lucide), consistent stroke width.

## 6. AI-specific UX patterns
| Situation | Pattern |
|---|---|
| Waiting for model | Immediate feedback < 300 ms; skeleton or streamed text; cancel button for long calls |
| Long processing | Step indicator ("Analysing -> Generating -> Formatting") |
| Low confidence / uncertain | Show confidence/caveat, offer to refine input |
| Error / rate limit | Friendly message, what to try next, auto-fallback to demo mode with badge |
| Empty state | Example prompts/inputs as clickable chips |
| Explainability | "Why this result?" expandable panel; sources/citations; highlighted evidence |
| Feedback loop | Thumbs up/down or "regenerate"; optional edit of the result |
| Transparency | Persistent subtle label that content is AI-generated |

## 7. States every view must have
`Loading` - `Empty` - `Error` - `Success` - `Partial/degraded (mock mode)` - `Offline`

## 8. Accessibility baseline
- Contrast >= 4.5:1 for body text; don't rely on colour alone.
- Full keyboard navigation, visible focus rings, logical tab order.
- Semantic HTML (`button`, `nav`, `main`, headings in order); `aria-live` for async results and errors.
- Alt text for meaningful images; labels for all controls; touch targets >= 44 px.

## 9. Content & copy
- Headlines state benefit, not technology ("Find X in seconds", not "AI-powered Y platform").
- Plain language, active voice, specific numbers where honest.
- Error copy: say what happened + what to do next. No stack traces, no blame.
- Use realistic sample data from the problem domain - never Lorem ipsum.

## 10. Demo polish checklist (last hours)
- [ ] Favicon, page title, meta description, social preview image
- [ ] Consistent spacing/radius/colour; no layout shift on load
- [ ] Looks good at 1440 px (projector) and 390 px (phone)
- [ ] Dark/light both checked (or one removed cleanly)
- [ ] Text readable from the back of the room (>= 18 px key text in demo path)
- [ ] No console errors on the live URL
- [ ] Animated GIF/screenshot added to README
- [ ] Tab titles/URLs tidy for screen sharing; notifications off

## 11. Visual direction
Mood: calm, clinical, precise. Reference: hospital check-in kiosks, self-checkout screens. Colour story: slate-900 text on near-white surface, teal-500 only for fills/rings/active states (teal-700 for text), amber for uncertain, green only for confirmed actions, red only for errors. Logo concept: minimal hand outline with a dwell-ring arc around the fingertip. No gradients, no glassmorphism.

---

## 12. Kiosk-specific design (Q15 addendum)
- **Readable from 1-2 m:** body text >= 24 px, headings >= 40 px, buttons >= 72 px tall, high contrast; one primary content area, no dense screens.
- **Layout:** large content on the left/centre; camera preview (small, mirrored, rounded) in a corner with landmark overlay toggle; status strip at the bottom.
- **Gesture legend always visible:** icon + gesture name + action (e.g. "Open palm -> Home"). Judges and visitors should never guess.
- **Feedback hierarchy:** (1) current detected gesture + confidence meter, (2) dwell ring filling around the gesture icon, (3) action confirmation toast + optional sound, (4) neutral banner "Not sure - hold your hand steady or use the buttons".
- **States to design:** No camera / permission denied / loading model / no hand / hand detected / neutral / holding / triggered / cooldown / locked / offline.
- **Colours:** one confident accent for "active/trigger", amber for neutral/uncertain, green only for confirmed action, red only for errors. Do not rely on colour alone (add icons/text).
- **Motion:** smooth ring fill and screen transitions (200 ms); honour `prefers-reduced-motion`.
- **Accessibility parity:** every gesture action has a visible button and a keyboard shortcut; announce actions via `aria-live`; text-size and high-contrast toggles in a corner menu.
- **Branding:** short product name, simple icon (hand + sparkle is a cliche - prefer a hand outline with a ring), campus-event tone (friendly, clear).
- **Demo polish:** pre-grant camera permission; plain backdrop; close other tabs; browser zoom for projector; "Demo mode" is NOT needed (no network dependency).
