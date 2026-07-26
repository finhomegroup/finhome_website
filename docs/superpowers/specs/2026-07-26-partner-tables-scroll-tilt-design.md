# Partner Tables Scroll-Tilt Flatten

Date: 2026-07-26
Status: Approved design, awaiting implementation plan
Related: `docs/superpowers/specs/2026-07-26-partners-team-sections-design.md`
Source behavior: Framer `Img container` on https://finhomegroup.framer.website/ — `transform: perspective(1200px) rotateX(30deg)` flattening on scroll

## Goal

Make the buyer-journey and partner-touchpoint tables read as **one shared visual unit** that starts tilted in 3D and **scroll-links to flat** as the user scrolls through the section — matching the live Framer dashboard image motion — without replacing the existing semantic HTML tables.

## Scope

**In**

- One shared tilt wrapper around both tables in `components/sections/partner-tables.tsx`.
- Scroll-linked `rotateX` from `30deg` → `0deg` on `md+` viewports.
- Always-flat on viewports below `md`.
- Always-flat when `prefers-reduced-motion: reduce`.
- Preserve semantic tables, sticky row labels, horizontal scroll shells, captions, and existing copy/assets.

**Out**

- Replacing tables with the Framer raster PNG.
- Tilting the partner CTA (`PartnerCta`) or team section.
- Changing table content, column geometry, or breakpoints for table overflow.
- CSS scroll-driven animations as the primary approach.
- New global animation utilities unless a tiny local helper is clearly cleaner.

## Behavior

### Desktop / tablet (`md` and up)

1. Both tables live inside one `perspective` parent (target: `perspective(1200px)`, matching Framer).
2. The tilted child starts at `rotateX(30deg)` when the unit is approaching / early in view.
3. As the user scrolls, `rotateX` maps continuously with scroll progress to `0deg` (flat).
4. Mapping uses Framer Motion `useScroll` + `useTransform` on a ref attached to the tilt unit (or its scroll-tracking container), not a one-shot enter animation.
5. `transform-style: preserve-3d` / `will-change: transform` only as needed for smooth compositing; avoid layout thrash.

### Mobile (below `md`)

- No 3D transform. Tables render flat at all scroll positions.
- Horizontal scroll behavior unchanged.

### Reduced motion

- When `usePrefersReducedMotion()` is true, skip scroll-linked tilt; render flat always (same as mobile).
- Do not introduce a hydration mismatch: follow the existing `usePrefersReducedMotion` SSR-safe pattern.

## Visual composition

- Treat the two tables as **one tilted card/unit** (Framer’s single dashboard image), not two independently tilting Reveals.
- Prefer a single outer motion wrapper; keep each table’s internal `ScrollableTable` / sticky header structure.
- Titles remain part of the tilted unit (journey title + touchpoint title stay with their tables inside the wrapper), unless visual QA shows the titles should sit outside — default is **inside** so the whole composition matches the Framer image.
- Existing `Reveal` fade/slide may remain on the outer section or be dropped for the tilt unit if it fights scroll-linked motion; prefer one clear motion story (tilt) over stacking competing enter animations on the same node.

## Architecture

| Piece | Role |
| --- | --- |
| `PartnerTables` | Section shell + Container; owns the tilt wrapper |
| Local `TiltFlatOnScroll` (name flexible) | Client component: ref, `useScroll`/`useTransform`, reduced-motion + `md` gating |
| `BuyerJourneyTable` / `PartnerTouchpointTable` | Unchanged internals; composed as children of the tilt unit |

**Tech:** Framer Motion (already installed), Tailwind for layout/`md` gating, existing `usePrefersReducedMotion`.

**Breakpoint gating:** Apply motion styles only at `md+`. Implementation may use a `matchMedia('(min-width: 768px)')` subscription (SSR-safe like reduced-motion) and/or CSS that forces `transform: none` below `md`. JS gating is required so scroll listeners are not wasted on mobile.

## Scroll mapping (defaults)

Tune during implementation against the live Framer page; start with:

- Track element: the tilt unit itself (`target: ref`).
- Progress: element viewport progress, e.g. `offset: ["start end", "center center"]` (enters from below tilted; reaches flat near center).
- Output: `rotateX` `30` → `0` (degrees), composed as `perspective(1200px) rotateX(${deg}deg)`.

Adjust offsets if the table flattens too early/late relative to Framer; do not change the 30° / 1200px starting values without a measured Framer discrepancy.

## Accessibility and UX constraints

- Semantic `<table>` markup, captions, and keyboard-focusable horizontal regions stay intact.
- 3D transform must not clip interactive/focusable content unsafely; overflow on the perspective parent may need `overflow: visible` and enough vertical padding so the tilted bottom edge is not cut off.
- Sticky columns inside a transformed ancestor can break in some browsers; verify sticky row labels still work when flat and degrade gracefully while tilted (acceptable: sticky only reliably when flat / near-flat).
- No motion when reduced-motion is set.

## Files

- Modify: `components/sections/partner-tables.tsx` (primary).
- Possibly add: small local helper in the same file, or `lib/use-media-query.ts` only if media gating is non-trivial and reusable.
- Do not change: `content/partners-team.ts`, `partner-cta.tsx`, `team.tsx`, unless a compose-order tweak in `partners-and-team.tsx` is required (not expected).

## Success criteria

1. On `md+`, the combined tables start visibly tilted (~30°) and flatten smoothly while scrolling, without a discrete “pop flat” snap.
2. Below `md`, always flat; no perspective transform.
3. `prefers-reduced-motion: reduce` → always flat.
4. Tables remain readable, semantic, and horizontally scrollable as today.
5. Visual feel is close to Framer’s dashboard image tilt at desktop width.

## Non-goals / explicit non-regressions

- Do not reintroduce the Framer CDN image as the production UI.
- Do not invent table copy or toggle states.
- Do not commit unless the user explicitly requests a commit.
