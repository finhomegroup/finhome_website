# Vision Page — Compass, Core Values Icons, Operating Principles Redesign

Date: 2026-08-01
Status: Approved design, awaiting plan execution
Source: https://finhomegroup.framer.website/ (two reference screenshots: hero compass + "Giá trị cốt lõi" card start, and "Nguyên tắc vận hành" section)

## Goal

Clone the visual presentation of three sections from the FinHome Framer reference site into the existing `/vision` route: the animated "compass" hero graphic, the "Giá trị cốt lõi" (core values) cards, and the "Nguyên tắc vận hành" (operating principles) section. Existing Vietnamese copy in `content/brand-identity.ts` is reused as-is except where the reference introduces a new short subtitle; no proprietary content is invented.

## Scope

1. New animated compass graphic in the `/vision` hero, replacing the current 3-card pillar grid.
2. Icon badges added to each "Giá trị cốt lõi" card.
3. Full layout rebuild of "Nguyên tắc vận hành" to match the reference's two-column, card-based design.
4. One new content field (`principlesSubtitle`) and one new shared icon file.

## 1. Compass component (`components/vision-compass.tsx`, new)

Client component (`"use client"`), built with `framer-motion` (already a dependency) and the existing `usePrefersReducedMotion` hook (pattern from `components/reveal.tsx`).

- Center: circular badge with the existing FinHome "F" mark on a green gradient fill, sitting on a soft blurred green glow.
- Two concentric dashed rings plus two small solid "planet" dots grouped together; this group rotates continuously and indefinitely (`framer-motion` `animate({ rotate: 360 })`, `repeat: Infinity`, `ease: "linear"`). Rotation is skipped entirely when `prefers-reduced-motion` is set (group renders static).
- Five floating pill labels are absolutely positioned around the rings and do **not** rotate with the dashed group (only the dashed rings/dots spin — confirmed with the user): **Mục đích, Tầm nhìn, Sứ mệnh, Giá trị cốt lõi, Nguyên tắc vận hành**. This adds "Mục đích" versus the reference, which only shows four labels — the fifth is derived from this codebase's own content (`BRAND_IDENTITY.pillars[0].title`) since our page already treats "Mục đích" as a pillar equal to Tầm nhìn/Sứ mệnh.
- First three pill labels bind directly to `BRAND_IDENTITY.pillars[n].title`. The remaining two ("Giá trị cốt lõi", "Nguyên tắc vận hành") are short decorative captions written directly in the component — not pulled from `valuesTitle`/`principlesTitle`, which are longer full section headings used elsewhere on the page.

## 2. Hero layout (`app/vision/page.tsx`, first `<section>`)

Replace the current `grid-cols-3` pillar cards with a two-column layout:

- Left: `<VisionCompass />`, sticky on large screens (`lg:sticky lg:top-24 lg:self-start`); static, non-sticky, stacked above the text on mobile/tablet.
- Right: three plain text blocks (heading + paragraph, no card chrome) rendered from `BRAND_IDENTITY.pillars` in existing order (Mục đích, Tầm nhìn, Sứ mệnh), matching the reference's plain-text presentation.

The eyebrow/back-link/north-star headline above this block is unchanged.

## 3. Core values icons (`components/vision-icons.tsx`, new + edits to the values card block)

Add a circular icon badge (~44px, `radial-gradient(...#17ab48 0%, #a2db46 100%)` fill — reusing the gradient already used for the principle numerals) to the top of each `BRAND_IDENTITY.values` card, above the existing tagline/title/bullet list. Each icon is a small hand-drawn inline SVG (no new icon-library dependency), mapped by semantic meaning:

| Value | Icon |
|---|---|
| Minh bạch trên hết | magnifying glass |
| An toàn là sức mạnh | shield |
| Trao quyền qua thấu hiểu | lightbulb |
| Chính trực mọi lúc | check badge |
| Bền vững | leaf / infinity loop |
| Tiến hoá | cycling/refresh arrows |

## 4. Operating principles redesign (`app/vision/page.tsx` third `<section>`)

Full rebuild to match the reference layout (currently a centered heading + 3-column card grid with a plain top-aligned gradient numeral):

- Two-column layout: left column is sticky on large screens and contains the section heading `BRAND_IDENTITY.principlesTitle` plus a new short subtitle; right column stacks the three principle cards vertically (not side-by-side).
- Each card: rounded-3xl corners, soft light gradient background (white → `bg-soft`-ish gray) with a subtle shadow, an icon badge (same style/gradient as the values badges) next to the title, the existing detail paragraph below, and the numeral (`01`/`02`/`03`, sequential in content order — the reference's out-of-order 02/01/03 display is treated as an unintentional template quirk and is not reproduced) shown large and light-gray in the bottom-right of the card.
- Icon mapping by concept (our wording differs from the reference but maps to the same three ideas):
  1. "Đi nhanh — nhưng không bao giờ mù mờ" → trending-up/lightning icon
  2. "Quan tâm người dùng, không chỉ chỉ số" → target icon
  3. "Hành động như người chủ" → rocket icon

### New content field

Add to `content/brand-identity.ts`:

```ts
principlesSubtitle: "<short 1–2 line Vietnamese subtitle, tone-matched to existing copy, not copied verbatim from the reference>",
```

Exact final wording is written during implementation, matching the register of the rest of `BRAND_IDENTITY` (e.g. `valuesSubtitle`).

## Accessibility & motion

- Compass rotation respects `prefers-reduced-motion` (static fallback, no spin).
- Decorative icons (compass rings/dots, value badges, principle badges) are `aria-hidden`; they carry no independent meaning beyond the adjacent text.
- Heading hierarchy is preserved (no skipped levels) when the hero and principles sections are restructured.

## Non-goals

- No change to `journeyIntro`/journey tables section.
- No rewrite of existing Vietnamese copy for pillars, values, or principles — only presentation changes and the one new subtitle string.
- No new npm dependency (no icon library); all icons are hand-drawn inline SVG.
- No scroll-jacking / IntersectionObserver-driven content switching — "sticky" is plain CSS `position: sticky`.
- No changes outside `/vision` and its two new component files.

## Verification

1. `npm run dev`, visually compare `/vision` against both reference screenshots at desktop width.
2. Check mobile/tablet: compass stacks above text (not sticky), principle cards stack full-width.
3. Emulate `prefers-reduced-motion: reduce` and confirm the compass no longer spins.
4. Confirm numeral order on principle cards reads 01, 02, 03 top to bottom.
5. Run lint/typecheck (`next build` or project's existing check script) and fix any diagnostics in changed files.
