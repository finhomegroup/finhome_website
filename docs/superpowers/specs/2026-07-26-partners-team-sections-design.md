# FinHome Partner and Team Sections

Date: 2026-07-26
Status: Approved design + header enhancement, awaiting plan execution
Source: https://finhomegroup.framer.website/

## Goal

Reconstruct the complete live-page experience spanning “Trở thành đối tác của FinHome” through “Đội ngũ FinHome” in the existing Next.js homepage. The result must be visually indistinguishable from the source at supported desktop, tablet, and mobile widths while remaining semantic, accessible, and maintainable.

## Scope

The implementation includes, in source order:

1. Partner CTA headed “Trở thành đối tác của FinHome”.
2. “Hành trình người mua nhà lần đầu” comparison table.
3. “Điểm chạm của đối tác với FinHome App” matrix.
4. Team introduction headed “Đội ngũ FinHome”.
5. All eight team portraits and the source presentation behavior.

The block is mounted on the homepage after `Signup` and before `News`. Existing sections are otherwise unchanged, except the shared site header (see below).

## Fixed Header and Active Navigation

In addition to the partner/team recreation, the shared `SiteHeader` must gain:

1. **Fixed header** — the pill header remains pinned to the top of the viewport while the page scrolls (desktop and mobile). Content must not jump under the header; section scroll offsets (`scroll-margin-top` / existing `scroll-padding-top`) stay aligned with the fixed header height.
2. **Active nav on scroll** — as the user scrolls the homepage, the nav item whose section is currently in view becomes the active state. Mapping uses the existing `NAV_ITEMS` anchors only:
   - Tính năng → `#tinhnang`
   - Nền tảng → `#nentang`
   - Hỗ trợ → `#hotro`
   - Tin tức → `#tintuc`
3. **Click to section** — clicking a nav item scrolls smoothly to that section (home: hash scroll; other routes: `/#section` as today). The matching item becomes active immediately after click and stays in sync with scroll spy afterward.

Active styling: stronger ink color (`text-ink`) and `aria-current="true"` on the active link; inactive items keep the current muted style. No new nav labels are added for Partner or Team unless the live Framer header gains them later.

Implementation detail: a small client-side scroll spy (IntersectionObserver or equivalent) inside `SiteHeader` or a dedicated hook under `lib/`. Observer root margin must account for the fixed header so the active item does not lag behind the visible section.

## Architecture

Create a composition component named `PartnersAndTeam` under `components/sections/`. It owns section ordering but delegates each responsibility to focused components:

- `PartnerCta`: heading, supporting copy, four decorative icons, and CTA.
- `BuyerJourney`: the five-stage first-home-buyer comparison.
- `PartnerTouchpoints`: the partner-to-product touchpoint matrix.
- `Team`: heading, supporting copy, and eight portraits.

Small repeated table cells or icon treatments may be extracted within the same module when this improves readability. They should not become global components unless another project section can reuse them.

All copy, structured table data, portrait metadata, and asset filenames live in a focused `content/partners-team.ts` module. Data structures must be explicitly typed.

## Assets

Download every source image and icon used by these sections. Store local files under `public/images/partners-team/` with descriptive names. Runtime references to `framerusercontent.com`, Framer scripts, and generated Framer CSS are prohibited.

The implementation should prefer source SVG icons where available. If an icon is embedded and cannot be extracted cleanly, recreate its simple vector geometry as an accessible decorative React SVG rather than using a screenshot.

Team portrait images use descriptive alternative text when a verified member name is available. If the source provides no reliable name, use neutral Vietnamese portrait descriptions instead of inventing identities.

## Visual and Responsive Behavior

Use the project’s existing Maison Neue Extended fonts and design tokens. Match the source’s measured 35px desktop headings, 20px supporting copy, white background, muted `#575757` text, green gradients, rounded treatments, spacing, and maximum content width.

Desktop decorative icons retain their source positions around the centered partner CTA. At smaller breakpoints they are repositioned or scaled according to the source layout, without overlapping text or becoming clipped.

The two wide tables preserve their source column geometry. On narrow screens, they use an intentionally styled horizontal overflow region with visible affordance and touch scrolling rather than shrinking content below readable size. Sticky row labels may be used only if the source behavior or readability requires it and visual comparison confirms that it does not reduce fidelity.

The team portrait presentation must follow the source behavior determined through browser inspection. Desktop image sizing, gaps, crop position, overflow, and any track animation are reproduced. Tablet and mobile variants use the same breakpoints and ordering as the source. Motion respects `prefers-reduced-motion`.

## CTA Behavior

The CTA uses the existing shared `Button` component:

- Default label: “Liên hệ ngay”.
- Hover label: “Tải xuống”.
- Label transition, pill gradient, hover shadow, destination, keyboard behavior, and reduced-motion behavior match the header CTA.

No new destination is introduced; the CTA uses the same configured `CTA_HREF` as the header.

## Integration and Dependency Impact

`app/page.tsx` imports and renders `PartnersAndTeam` after `Signup` and before `News`.

If shared content types, `Button`, `Container`, `Reveal`, image helpers, or global tokens require changes, every direct and indirect consumer must be checked before completion. Existing public component APIs should remain backward compatible unless a verified source requirement makes a change necessary.

The implementation must trace:

- Components consuming changed home content.
- All callers of any modified shared component or utility.
- Homepage anchors and navigation behavior, including fixed header and scroll-spy active state.
- Static asset resolution and build output.
- Responsive overflow interactions with the page-level `overflow-x-clip`.

Shared header impact: every page that renders `SiteHeader` inherits the fixed pin. Scroll-spy active highlighting applies only when the matching section IDs exist in the DOM (homepage). On other routes, nav items remain inactive unless a hash targets a home section after navigation.

## Accessibility and Failure Handling

- Use semantic headings without skipping hierarchy.
- Treat purely decorative icons as hidden from assistive technology.
- Give the CTA an unambiguous accessible name in its default state.
- Tables use real table semantics, headers, scopes, and captions or accessible labels.
- Horizontal table regions are keyboard-focusable when overflow exists and include a concise screen-reader hint.
- Images declare stable dimensions or aspect ratios to prevent layout shift.
- Missing local assets must be caught during build/verification; no remote fallback is added.

## Verification

1. Capture the source at representative desktop, tablet, and mobile widths.
2. Capture the local implementation at the same widths and compare section boundaries, typography, dimensions, spacing, crops, colors, and responsive behavior.
3. Test CTA hover, focus, keyboard activation, and label swap.
4. Test table keyboard and touch scrolling.
5. Verify portrait ordering and any animation, including reduced-motion behavior.
6. Confirm the header stays fixed while scrolling, and that each nav item becomes active when its section enters the viewport; confirm click navigates to the correct section on home and from other routes.
7. Run ESLint and the production Next.js build.
8. Inspect IDE diagnostics for every changed file.
9. Review the full recursive dependency impact of modified functions, modules, types, and shared components.

## Non-goals

- Importing Framer-generated markup or runtime code.
- Recreating unrelated homepage sections beyond the partner/team block and the header behavior above.
- Adding Partner/Team items to the header nav (not present in the current Framer header).
- Changing current contact or app-download destinations.
- Inventing team names, roles, partner claims, or content absent from the live source.
- Refactoring unrelated existing code.
