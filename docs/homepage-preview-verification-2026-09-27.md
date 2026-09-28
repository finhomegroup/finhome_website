# Homepage preview verification — 27 September 2026

Scope: isolated preview at `http://127.0.0.1:3240/`, not production. Claude
implemented; Codex inspected the actual rendered page independently.

## Current result

- Header keeps the white pill on app-derived `#F2F2F7` gray. Desktop shell
  reserves 104px (24px + 56px pill + 24px); mobile reserves 88px
  (16px + 56px + 16px). Other page variants are unchanged.
- Hero uses the native full-width linear gradient: brand-green-ink opaque
  through 20%, transparent at 60%. It now visibly lightens within the copy
  area; the previous opacity plateau was rejected.
- Photo remains the original JPEG, CSS-mirrored. The man's left side receives
  a green tint; do not describe both people as completely untinted.
- Final desktop image and hero bottom coordinates match. The thin green strip
  introduced by viewport-based height rounding is removed through grid layout.

## Observed checks

1. Desktop: actual captures at 1280px and 1440px; pill spacing, earlier fade,
   natural photo, and no horizontal overflow observed. At 1440px the computed
   gradient is `linear-gradient(to right, rgb(17, 127, 54) 20%, rgba(0, 0, 0, 0) 60%)`.
2. Mobile: 390px capture shows the gray shell, white pill, readable stacked copy,
   two CTAs and the smaller photo. Copy still has a solid green underpinning
   in this stacked layout; this is not a claim that the mobile text area fades.
3. Mobile menu opens; Escape closes it; primary CTA reaches `/cong-cu/` with
   the tools catalogue rendered. No form was submitted.
4. Remaining visual gate: white text over the lighter desktop gradient is NOT
   certified contrast-safe. A text-local shadow helps visually but is not a
   WCAG pass. Text-only enlargement, screen reader, real devices, and the final
   1920px layout have not been independently verified in this iteration.

Final screenshot: `.superpowers/hero-verify-7pFfzi/final-desktop-proof.png`
(1440px). Runtime screenshots stay local/ignored. The file named
`final-tablet-1024.png` captured an actual 1280px viewport; use measured width,
not that filename, as evidence. It does NOT establish a final tablet check.

Claude reports all five post-edit gates passed: 7,144 tests; TypeScript; lint
3 baseline / 0 new; static build 290 pages; markup contracts passed. Codex
independently reran the two scoped test files after the last code change:
48 tests passed. Native wrapper cannot target this unmanaged worktree without
changing registered project identity; project-owned checks ran here instead.

## Sources and handoff

- App source reference (read-only):
  `finhome_reactnative/features/shared/constants/theme.ts`, `SemanticColors.light`.
- Apple HIG materials/layout support distinct navigation layers and whitespace,
  not these exact pixel values:
  <https://developer.apple.com/design/human-interface-guidelines/materials>
  <https://developer.apple.com/design/human-interface-guidelines/layout>
- Six illustrated tool cards were generated as a separate concept only; they
  are not installed in the website. Generated logo is not an approved brand change.
- Existing unrelated work preserved. No commit, push, PR, or deployment.
