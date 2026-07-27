# Homepage One-Viewport Sections

Date: 2026-07-26  
Status: Implemented  
Related: homepage section components under `components/sections/`

## Goal

Make every major homepage section occupy **exactly one viewport** at all breakpoints. Scrolling the page advances section-by-section; if a section’s content is taller than the viewport, it scrolls **inside** that section rather than growing the page past one screen for that block.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Scope | Whole homepage (not partners-only) |
| Breakpoints | All (mobile, tablet, desktop) |
| Pattern | Shared `SectionFrame` + CSS scroll-snap |
| Partners | `PartnerCta` + dashboard tables share one viewport; `Team` is its own viewport |
| Header / footer | Header stays fixed (not a section viewport). Footer keeps natural height (not forced to `100dvh`) |

## Scope

### In

Homepage sections that each become one viewport (in order):

1. `Hero` (`#trangchu`)
2. `Steps` (`#tinhnang`)
3. `Platform` (`#nentang`)
4. `Testimonials`
5. `Faq` (`#hotro`) — includes Signup (`#dangky`) in the **same** viewport
6. `PartnerCta` (`#doitac`) — includes PartnerTables dashboard in the **same** viewport
7. `Team`
8. `News` (`#tintuc`)

Shared layout:

- New reusable shell (working name: `SectionFrame`) used by the sections above.
- `main` on the home page enables vertical scroll-snap.

### Out

- Blog and legal pages.
- Changing section copy, imagery, or feature content except as needed to fit (spacing, scale, overflow).
- Forcing the site footer into a full viewport.
- Reintroducing partner-tables scroll-tilt (already removed; tables stay flat).

## Architecture

### `SectionFrame`

A thin layout wrapper (server-compatible; no client JS required for the shell itself) that:

- Sets section height to one dynamic viewport: prefer `h-dvh` / `100dvh`, with `100svh` fallback where useful for mobile browser chrome.
- Vertically centers primary content when it fits (`flex` + `justify-center` or equivalent).
- Allows inner overflow: `overflow-y-auto` (and `overflow-x` clipped as today) when content exceeds the frame.
- Applies `scroll-snap-align: start` (and `snap-always` if needed for reliable snaps).
- Preserves existing section `id`s and `scroll-mt-*` so hash nav and the fixed header still land correctly.

Sections keep their own markup; they wrap (or replace outer `<section>` padding) with `SectionFrame` / shared classes rather than duplicating height/snap rules in ten files.

### Home `main`

On `app/page.tsx` (home only):

- Enable vertical scroll-snap with **`mandatory`** (fallback to `proximity` only if QA shows mandatory fights the fixed header or hash nav).
- Use the **existing document/`html` scroller** (do not introduce a nested `main` `h-dvh` scrollport unless snap proves unreliable with document scroll). Apply snap type on `html` or `main` as the smallest change that works with the current layout shell.

### Content fitting strategy (all breakpoints)

1. Prefer reducing vertical padding and gaps inside the frame before shrinking type.
2. Scale large media (hero art, partner dashboard image, platform cards) with `max-h` / `object-contain` / flex shrink so the primary composition stays visible without leaving the viewport.
3. If content still overflows after reasonable compression, keep it usable via **inner section scroll** — do not let the section grow past one viewport.

Dense sections most likely to need inner scroll on short phones: `Faq`, `News`, `Platform`, `Team`, `PartnerTables`.

## Visual and interaction notes

- Sticky/fixed header continues to overlay the top of each viewport; section content padding / `scroll-margin-top` must keep titles clear of the header.
- Scroll-snap should not break existing nav hash scrolling (`#tinhnang`, `#doitac`, etc.).
- `prefers-reduced-motion`: do not add extra transition chrome for snap; keep snap behavior (it is layout, not decorative motion). Reveal animations already respect reduced motion elsewhere.
- No new decorative cards, pills, or hero overlays beyond what sections already have.

## Accessibility

- Keyboard and screen-reader users can still reach all content (including content below the fold inside a section’s inner scroll).
- Focusable controls inside overflowing sections remain reachable.
- Do not trap focus inside a section.
- Preserve semantic headings and existing ARIA (e.g. partner dashboard `sr-only` tables).

## Testing checklist

- Desktop (~1440×900) and laptop (~1280×720): each listed section fills exactly one viewport; snap advances one section per gesture.
- Tablet and mobile (including short landscape): same one-viewport rule; overflow sections scroll internally.
- Hash nav from header still scrolls to the correct section under the fixed header.
- Partner CTA, flat dashboard image, and Team each occupy their own viewport in sequence.
- Footer appears after News at natural height without being forced to `100dvh`.

## Non-goals

- Full-page JS libraries (fullPage.js, etc.).
- Changing the Framer visual language of individual sections beyond fit-to-viewport adjustments.
- Making the footer a snap section.
