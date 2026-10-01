# Collection hero — /blog/mua-nha-bang-con-so/ (2026-10-01)

Owner: Claude Code (implementation, tests). Parent: full aiws gate and real
browser proof on the 127.0.0.1:3272 preview after build — both PASSED (see
"Independent verification"). Deploy approved by the user 2026-10-01, via a
GitHub PR and the Vercel Git integration; see "Status" for what is and is not
yet live.

## What changed

- `components/education/collection-hero.tsx` (new): the page's existing H1
  "Mua nhà bằng con số" and lede as live HTML on a solid brand-green-ink block,
  one short line, two actions — **Bắt đầu từ chương 01** (`#ngan-sach`) and
  **Mở công cụ Khả năng mua nhà** (`/cong-cu/kha-nang-mua-nha/`) — and the
  photograph. Inter 400/700 (scoped reading font, pinned by
  `chapters.test.ts`); the shared header and its original logo are unchanged.
- `content/education/collection.ts`: `hero` copy and photo provenance.
- `app/blog/mua-nha-bang-con-so/page.tsx`: the hero replaces the plain H1/lede
  inside `#muc-luc` (so "Xem lại năm chương" still lands on it), before the
  unchanged chapter nav. The chapter-01 illustration no longer has
  `fetchPriority="high"`/eager loading; the hero is the only high-priority
  image (React also emits its `<link rel="preload">`).
- Reused selectively from `artifacts/collection-hero/pending-hero.patch`: the
  structure, focus-on-green ring and CTA pair. NOT reused: 8055525, its crop,
  alt text or longer copy. The patch stays recoverable, unapplied.

Five chapters, chapter nav, articles, calculators, routes and the /blog/
pagination/dates work are untouched.

## Crop (CSS only, from the photo's composition)

Woman's face ≈44% and man's ≈71% of the width, heads at 40–51% of the height,
feet ≈87%, empty sunlit wall in the left quarter. From `lg` the full frame
shows in a box close to 3:2 at the right 64%, under one full-hero overlay
(see "Seam fix"); faces land at ≈64% and ≈81% of the hero, clear of the text. Below
`lg` the photo stacks above the text in a 5:3 box zoomed to source x 22–88%,
y 31–91% (both heads and feet in frame); no text over it, and the credit
moves into the text block. Not mirrored (the book cover has small print).

## Photo provenance

| Field | Value |
|---|---|
| Source | Pexels 7592756, https://www.pexels.com/photo/young-asian-couple-looking-at-each-other-7592756/ |
| Photographer | Miriam Alonso |
| Source metadata (verified by parent) | alt "Full body of positive Asian couple sitting with crossed legs on floor while smiling and looking at each other"; description "Asian couple enjoying leisure time indoors sitting on floor smiling together" |
| Licence | https://www.pexels.com/license/ — checked 2026-10-01 by parent; free website/promotional use, no implied endorsement |
| Original (unmodified) | `public/images/people/pexels-7592756-original.jpg`, 5040×3360, 2.141.425 B, downloaded from the parent-observed link |
| Web derivatives (sips resize, no crop/retouch) | `public/images/education/hub-hero-pexels-7592756-1280.jpg` 1280×853, 136.528 B; `…-2400.jpg` 2400×1600, 733.253 B; `srcSet` + `sizes` |
| Visible credit | "Ảnh minh họa: Miriam Alonso / Pexels" — on the photo from `lg`, in the text block below |
| Illustrative note | "Người trong ảnh chỉ để minh họa, không phải nhân vật trong các ví dụ." |
| Alt text | in-frame only; no ethnicity, nationality or figures (tested) |

Used nowhere else (tested by a source walk). Editorial note: the homepage hero
(7593053) is also by Miriam Alonso — a different photograph, so the
distinct-source rule holds, but it may be the same session; worth a human look
side by side.

## Tests

`components/education/collection-hero.test.ts` (new, 10): provenance fields;
JPEG headers of the original and both derivatives match the declared sizes and
aspect; alt text claims no ethnicity; 7592756 appears only in its data,
component and test, and differs from the homepage photo; no reference to
8055525/8055092/6818113/AI25 IDs; hero markup (live H1, lede, body, img
src/srcset/alt, priority, credit in both layouts, note); chapter-01 then tool
order with a 48px primary target; on the full page exactly one `<h1>`, inside
`#muc-luc`, before the chapter nav and all five chapters; one high-priority
`<img>` (the hero) and none on the illustration; news backlink and every
chapter's start/tool links. `chapters.test.ts`: the typography guard now also
scans the hero file.

## Checks (Claude, Node v24.21.0)

- `pnpm exec vitest run` collection-hero, chapters, navigation-map,
  brand-contrast, page-background, blog-layout, site-header,
  home-photo-preview, tool-education-series: 9 files / 233 tests passed (three
  first-run failures were test-side — React's hoisted preload link, `<Link>`
  trailing slash, the component's own doc comment — and were fixed in the test).
- `pnpm exec tsc --noEmit`: clean. `pnpm check:lint`: 3 baseline, 0 new.
- At that point (historical) full gate, build and browser had not been run by
  Claude; they were then done independently by the parent — see below.

## Independent verification (parent)

- **Native full gate PASSED:** 361 files / 8.028 tests, types, lint 0 new,
  build, markup. Record: `/tmp/finhome-hero-approved-native-check.json`.
- **Browser, built static preview 127.0.0.1:3272, 1440×900 and 390×844
  (visual pass — SUPERSEDED: the user then found a seam this pass missed; see
  "Seam fix"):** both faces clear, no text overlap; the correct existing
  logo; Inter computed with fonts loaded; photo loaded; one H1.
  320px wide: no horizontal overflow; both CTAs 48px tall.
- **Journeys:** "Bắt đầu từ chương 01" lands on `#ngan-sach` with the chapter
  heading visible; "Mở công cụ Khả năng mua nhà" opens the real tool (H1 "Khả
  năng mua nhà: bạn nên nhắm giá nào?"); Back returns to the collection.
- Console error/warning log empty. Viewport reset afterwards.
- Screenshots inspected by the parent:
  `artifacts/collection-hero/approved-desktop.jpg`, `approved-mobile.jpg`.

## Seam fix (user-reported, 2026-10-01)

**Seen by the user:** a thin vertical seam where the green block met the photo,
and the wall's skirting line showing low in the fade.

**Cause:** two layers met at the photo box's fractional-pixel left edge (36%
of the hero): the section's solid green, and a 14% wash INSIDE the photo box
that started at a hardcoded `#117f36`. The photo's anti-aliased edge pixels
showed through as a line, and the ~113px ramp was steep enough for the
skirting line to read in it.

**Fix (homepage architecture, `components/sections/hero.tsx`):** the photo
box's wash is removed; ONE overlay (`data-hero-overlay`) covers the whole hero
from `lg`, `linear-gradient(to right, var(--color-brand-green-ink) 40%,
transparent 56%)` (`COLLECTION_HERO_OVERLAY`). The photo edge at 36% is 4
points inside the opaque zone, so no edge can show; text ends at 40%, all on
solid green; the ramp is 16% of the hero (~1.4× the old one). The homepage's
20/60 stops were NOT reused: here the text is wider and the leftmost person
(woman's hair) starts at ≈57% of the hero at 1024px (taller boxes crop more),
≈58–59% at 1280, ≈59.7% at 1440 — modelled in the test for heights 480–560px,
all past `clearAt`. The credit now sits above the overlay. Below `lg`
unchanged (photo above text, no overlay, approved crop). No border, blur or
image editing; photo 7592756, unmirrored, copy, routes and CTAs unchanged.

**Regression** (`collection-hero.test.ts`, +5): photo edge ≥2 points inside
the solid zone and text within it, matching Tailwind widths; leftmost person
past the ramp at lg/xl/1440 for several heights; exactly one overlay, full-hero,
desktop-only, using the token and the declared stops, not inside the photo box,
before the text; no hardcoded brand hex in the component.

**Checks (Claude, Node v24.21.0):** focused vitest (collection-hero, chapters,
brand-contrast, page-background, navigation-map, home-photo-preview) 6 files /
138 tests passed; `tsc --noEmit` clean; `pnpm check:lint` 3 baseline, 0 new.
At that point (historical) full gate, build and browser had not been run by
Claude; the parent's independent verification follows.

**Independent seam-fix verification (parent):**

- Native gate PASSED: 361 files / 8.033 tests, types, lint 0 new, build,
  markup — `/tmp/finhome-hero-seam-native-check.json`.
- Browser, 1440×900, 1280×900 and 1024×900: the old vertical seam is no longer
  visible; one full-hero overlay with the token, 40→56%; text readable, both
  faces clear. The physical wall/skirting line is still naturally visible
  inside the photo — it is part of the photographed room and was not removed
  (no image editing).
- 390×844: mobile unchanged, no overlay. No horizontal overflow at any width
  checked; console warnings/errors none.
- Screenshots inspected by the parent:
  `artifacts/collection-hero/gradient-fixed-1440.jpg`, `gradient-fixed-1280.jpg`,
  `gradient-fixed-1024.jpg`, `gradient-fixed-mobile.jpg`; the before/after
  seam captures at 1440 are retained.
- This is a visual inspection, not pixel-perfect automated verification.
- The 3272 preview is retained, the viewport was reset; nothing committed,
  pushed or deployed.

## Status

Earlier (historical): the photo was approved, not publication. **Now:** the
user approved deploying the hero with the fixed gradient (2026-10-01). It is
committed and opened as a PR against `main`; it is NOT merged or live until
that PR is merged and the Vercel production deployment succeeds. The commit
holds the component, its test, the page, `collection.ts`, `chapters.test.ts`,
this recap and the three 7592756 images only. The paused
`pending-hero.patch`, all `artifacts/`, and the rejected
`pexels-{8055092,8055525}` originals stay untracked, unreferenced and
recoverable; the 3272 preview is retained.

## Not in scope / pending

- New files are untracked until a commit is approved: the component, its test,
  this recap, and the three image files above (all three must be committed
  together for Git-based deployment).
- `public/images/people/pexels-{8055092,8055525}-original.jpg` (rejected) and
  `artifacts/collection-hero/pending-hero.patch` stay untracked and
  recoverable; nothing references them. They appear in a LOCAL `out/` build
  because `public/` is copied as-is, but are excluded from Git deployments.
