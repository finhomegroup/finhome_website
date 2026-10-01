# Homepage and navigation — release handoff

## CURRENT — homepage hero image replaced by an AI illustration, 1 Oct 2026 (local, not released)

User scope: replace the homepage hero photo with AI-generated fictional people, keeping the same gradient pattern.
Implementation: Claude Code. Browser review at 1440, 1024, 390 and 320: Codex, after the final code.
Claude ran no browser. Not committed, pushed or deployed.

- **Source:** a Codex built-in image-generation edit of Pexels 7593053 (Miriam Alonso).
  - The brief, as relayed: keep the exact composition (wall, sofa, light, head and body positions);
    show a fictional Asian young-adult couple in a sage athletic set and an ivory knit polo; unbranded laptop; no text or logos.
  - Copied byte-for-byte to `artifacts/homepage-ai-hero-2026-10-01/homepage-hero-original.png`.
  - Measured 1595×986 PNG (aspect 1.6176; the stock is 3805×2352, 1.6178).
    SHA-256 `4eec3eb89ee4a4ad2d05c4c476b3ae43c25707ef0f7fd502af82ba4d82455ceb`.
  - `manifest.json` there holds the source path, prompt summary and measured sizes; Codex retained the exact built-in imagegen prompt in `prompt.md` beside it.
  - The stock photo is recorded only as the composition reference, not as the image's author or subjects.
- **Web files:** `public/images/home/ai-hero-couple-{800,1200,1595}.webp` (29 / 55 / 83 KB).
  These are plain sharp resizes of the full frame, with no upscale (1595 is the source width), made by `derive.mjs`.
  - `src` is the 1200 file, with srcset 800/1200/1595 and `sizes="(min-width: 1280px) 80vw, 100vw"`.
  - Intrinsic `width`/`height` are 1595/986. It stays eager and high priority; React hoists its preload.
- **Unchanged:**
  - `HERO_OVERLAY` 20/60, `HERO_PHOTO` 80, `HERO_TABLET` 12, `HERO_PHONE` wash 0.12 / crop 16.
  - The mirror, the fades, the layout, the copy and the CTAs.
  - Only the source-dimension-derived crop aspects changed: phone `aspect-[1340/986]` (1595 × 0.84) and tablet `aspect-[1404/986]` (1595 × 0.88), replacing 3196/2352 and 3348/2352.
  - Faces sit at the same fractions in the new image, so the face-tint geometry tests are unchanged.
- **Label:** a small "Ảnh minh họa AI" chip (11 px, `bg-black/60`) in the photo's lower-right corner.
  That corner is the mirrored frame's bare floor, past the 60% clear point and away from faces, copy and CTAs. It ignores the pointer. The image stays decorative (`alt=""`).
- **Kept:** `public/images/home/pexels-7593053-original.jpg` stays on disk, because the released car social package (`/social/vay-mua-xe/`) uses it.
- **Tests:** `components/sections/home-photo-preview.test.ts` replaces the stock-provenance assertion. It now checks:
  - AI kind, hash, approval date and composition reference; no photographer credit on the page;
  - same aspect as the reference;
  - each WebP's real width, none wider than the source;
  - srcset, sizes and priority; the label's text, size and position.
  All geometry, contrast and CTA checks are kept.
- **Full native gate PASSED:** `aiws native check finhome-website --task auto-education-20260930 --mode full`.
  - Run: Node 24.21, 2026-10-01T13:54:29Z–13:55:18Z, exit 0.
  - 365 files / 8,154 tests, `tsc` clean, lint 0 new, `next build` 310 pages, `check:markup` all contracts hold.
  - Log: `/tmp/finhome-homepage-ai-hero-full.log`.
  - Only this document changed after the gate.
- **Not verified by Claude:** any rendered view, the label's legibility over the floor, or the 320 px layout. Codex owns those checks.
- **Independently verified by Codex after implementation:** local homepage at measured CSS viewports 1440×952, 1024×852, 390×796 and 320×852. The browser's requested outer heights included 48 px of chrome. All four load the new responsive AI WebP, have no horizontal overflow, preserve complete faces and keep the small label readable and clear of text/CTAs. Computed horizontal gradient remains exactly `linear-gradient(to right, rgb(17, 127, 54) 20%, rgba(0, 0, 0, 0) 60%)`; opacity remains 1 on desktop/tablet and 0.12 on phones. Existing CTA labels and destinations remain `/cong-cu/` and `/blog/mua-nha-bang-con-so/`. Screenshots: `artifacts/homepage-ai-hero-2026-10-01/homepage-{desktop,tablet,mobile,small-mobile}.jpg`. This proves scoped local appearance, not production deployment or a formal contrast/accessibility certification. Source PNG and prior stock are intentionally retained for provenance and existing social consumers.

## Release authorization — 28 Sep 2026

The user requested commit, push, a pull request, then merge only when checks are green.
This authorizes the reviewed website change; it does not assert app-store availability.
The explicitly allowed illustrative QR remains labelled as a preview and noninteractive.
No store/deep-link or financial-data handoff is enabled. Historical preview notes below
describe the evidence available at their respective checkpoints.

## CURRENT — upstream calculators integrated + navigation map (web scope), 28 Sep 2026

Codex completed independent representative browser verification at 1440×1000 and
390×844. Destinations, new-tab input retention, invalid/recovery, app-mode chrome
hiding, and retirement visualization updates passed; see navigation map §10 for
evidence and limits. This is not full accessibility or real-device certification.

- **Upstream integration:** `origin/main` `ebee1dc7cb847675a14ad1a1c37c03f80e316a17`,
  diffed against detached HEAD `c7ab5a4`.
  - 53 of 55 paths were applied mechanically with `git apply` (binaries included) after
    `git apply --check`. `git apply --reverse --check` on the same patch then passed, so
    those 53 files are byte-for-byte upstream.
  - The 2 overlapping files were merged by hand. `app/globals.css` gained the granary
    tokens, the bowl/basket motion rules and `@keyframes fh-header-in`.
    `components/site-header.tsx` gained the motion-safe slide-in on the fixed state.
  - Kept in both: the shared gray, `ink-3` #6d6d6d, the hero and header tokens, and the
    white-pill nav.
  - Calculator code, formulas, defaults and chart assets are upstream's, unmodified.
- **Navigation map, web scope:** the per-ID disposition and evidence are in
  `docs/navigation-map-2026-09-28.md` §9. Summary:
  - **Removed:** the no-op signup (`signup.tsx`, `SIGNUP_SECTION`, with its iOS and
    "1,000+" claims), replaced by the real support email and phone.
  - **Footer:** the feature links now go to `/#tinhnang` under "Tính năng ứng dụng"; the
    dead `#` social icons no longer render.
  - **"Tìm hiểu ứng dụng FinHome" → `#app-download-title`** in three places: the Về
    FinHome menu, the app-feature section (replacing "Thử ngay") and five home-buying tools.
  - **`/blog/`:** two reading paths (the guide collection; the feed at `#tin-thi-truong`).
  - **Tools:** education links open in an announced new tab. The near-answer pair is
    ranked primary then secondary.
- **Unchanged here:** the hero photo and gradients, the QR illustration and its caption,
  the gray background and header, the calculator "Xem kết quả" contract, and app-mode
  chrome hiding.

---

## CURRENT — one gray page background + the white-pill header on every public route, 28 Sep 2026

Codex independently reviewed the rendered preview on 28 Sep 2026: `/`, the article
`/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/` and retirement calculator at 1440 and
390 px, plus `/blog/` at 1440 px. The page and header paint rgb(242, 242, 247);
white pills/cards/fields remain distinct. No horizontal overflow was observed.
The mobile menu opened and closed normally. In a separate temporary tab,
`/cong-cu/ke-hoach-huu-tri/?app=1` still hid both header and footer and painted
the gray page. This is representative visual/runtime evidence, not every route
or a full accessibility certification. User acceptance remains separate.

Screenshots are retained locally under `.superpowers/global-shell-verify-KRSAJh/`:
`before-article.png`, `after-article-desktop.png`, `after-article-mobile.png`,
`after-blog-desktop.png`, `after-tool-desktop.png`, `after-tool-mobile.png`,
`after-menu-mobile.png`, `after-home-desktop.png`, `after-home-mobile.png`.
Claude implemented; Codex verified. No commit, push or deployment.

Final gates independently rerun on Node v24.21.0: Vitest 322 files / 7,162 tests
passed; TypeScript passed; lint 3 baseline / 0 new problems; Next build 290/290
pages; markup contracts passed for 76 calculators and 204 other pages.
`git diff --check` passed. The earlier delegate run used Node 25 and is not the
acceptance evidence; the Node 24 runs supersede it.

- **Why:** the homepage was gray (#f2f2f7 shell) while the blog and other pages were white.
- **One canonical token:** `--color-page-bg: #f2f2f7` (the FinHome app's own `bg`) in
  `app/globals.css`. `:root --background` now points at it (with a same-value fallback), so
  the existing `body { background: var(--background) }` paints it on every route.
  `--color-header-shell` is an alias, `var(--color-page-bg)`, so the header band and the
  page cannot drift apart.
- **One header:** the `variant` prop is gone. The former homepage header is now
  `SiteHeader`'s only rendering on all 14 call sites:
  - a white 56 px pill (`header-surface`, `header-border` edge) on the gray shell;
  - 16 px above and below on mobile, 24 px from xl, with an 88 / 104 px in-flow spacer.

  The old transparent floating capsule (87 px, `pt-[37px]`) is not reachable any more.
  Menu entries, order, disclosures, hash links, `aria-current`, the homepage-only tools
  CTA and app-mode hiding (`data-finhome-site-chrome`) are unchanged. The lint-baseline
  lines 52/83 in `site-header.tsx` did not move.
- **Audit:** no `<main>`, root `<body>` or page wrapper set its own background. White was
  the body default only, so nothing needed harmonising.
  - Every remaining `bg-white` is a content surface and stays white: calculator
    cards and fields, blog/news cards, legal and delete-account panels, filter pills, the
    menu panels and the header pill.
  - Coloured sections are untouched: hero, `bg-bg-soft` sections, the dark footer and the
    calculator status tints.
  - No page declares a white article reading area, so article text now sits on the gray
    page.
- **Contrast consequence, fixed by precedent:** `--color-ink-3` #727272 was only ≈4.32:1 on
  #f2f2f7. Per its own history comment, the token moved, not its call sites:
  `#6d6d6d` (≈4.63 on the gray page, ≈5.17 on white). `brand-contrast.test.ts` now lists
  the gray page as a ground for `ink-3` and `brand-green-ink`, and checks the translucent
  `.fh-body` / `.fh-lead` ink composited over it. **This is a site-wide, slightly darker
  muted text colour.**
- **App mode:** chrome hiding is unchanged. The embedded page ground is now the same gray
  as the app's own `bg`.
- **Layout consequence:** the header height grew by 1 px on mobile and 17 px from xl
  on non-home routes (87 → 88/104). The representative article and calculator checks
  above showed separation from content without overlap. Long-reading comfort has
  not been user-tested.
- **Regression tests:** `components/page-background.test.ts` (token, alias, body, no
  `<main>`/`<body>` override, white surfaces kept, app mode, no header variant), and
  `components/site-header.test.ts` (the pill, spacing and no old capsule on seven routes).

---

## Independent browser review — 28 Sep 2026

Codex observed the rebuilt local preview at measured viewport widths **390, 844,
1024 and 1440 px** after the final phone styling change. No horizontal overflow at
these widths. At 390 × 844, the hero is about 728 px tall, both 48 px CTA links are
visible, both faces are unobscured, and the photo blends into the pale background
without the previous opaque-green horizontal boundary. Phone copy remains above
the photo; it is not the desktop side-by-side layout. At 844 and 1024, text and
photo share the hero and neither face is covered by text. The desktop composition
and white navbar pill remain present at 1440. These are visual observations, not
a complete accessibility or contrast certification; white text over the desktop
and tablet ramp retains the contrast limitation recorded below.

Evidence retained locally in `.superpowers/hero-mobile-verify-XkROl7/`:
`phone-390.png`, `tablet-844.png`, `tablet-1024.png`, `desktop-1440.png`.
This supersedes the browser-pending notes for those four widths below; user
acceptance is still separate. Claude implemented; Codex independently inspected
the actual rendering. No commit, push or deployment performed.

## CURRENT — phone hero as one pale portrait, 28 Sep 2026

Browser acceptance is **PENDING** (Codex: 390, 844, 1024, 1440, after build). Desktop
(`xl`+) and the new tablet (`md` → `xl`) are unchanged by this step; every phone change is
unprefixed or `max-md:`, and each md+ style is restored with an `md:` class.

- **Why:** the ≈842 px raster may be a 421 CSS px phone at 2×, so the phone had to change
  too. The user asked for pattern consistency — one continuous background and a horizontal
  fade — not the literal 20→60% opacity on a portrait screen.
- **Ground:** the section is `bg-hero-wall`, a new token `--color-hero-wall: #e8eee9` in
  `app/globals.css`. **It is a visual estimate of the photo's wall; pixel sampling was not
  available.** A mismatch would show as a faint edge at the photo's top.
- **Wash:** the SAME single horizontal overlay element, still solid to 20% and clear at
  60%, runs over text and photo at `opacity-[0.12]` (`HERO_PHONE.washOpacity`), with
  `md:opacity-100` restoring desktop and tablet.
- **Copy:** unchanged text. H1 in brand-green-ink; body (17 px) and reassurance in ink-2;
  no text shadow below md. Contrast computed on CSS colours at the most-tinted point
  (wash 0.12 over the wall): H1 ≈3.7:1 (large-text threshold 3:1), ink-2 ≈5.3:1.
  These depend on the estimated wall value.
- **CTAs (48 px):** primary is `bg-cta` with white text (≈5.4:1); secondary is bordered
  brand-green-ink on white (≈5.1:1). Desktop and tablet styles are restored with `md:`.
- **Photo:** full width, below the copy. `HERO_PHONE.cropLeftPct` = 16 trims the mirrored
  left (sun patch and bare wall) with `object-left` before the mirror, so the couple reads
  larger. Both people stay whole. Its top 12% melts into the same wall colour
  (`from-hero-wall`), ending above the hair (14%); this replaces the opaque green fade.
  Faces: the man ≈0.9% ink, the woman ≈0.
- **Geometry limit (unchanged, honest):** at 390 the copy spans ≈5–95% of the width, so
  the photo sits below the copy, not beside it. The composition is one ground and one wash,
  not side by side.
- **Unverified:** the wall match, the real line count and height at 390, and whether the
  photo shows in the first viewport.

---

## CURRENT — tablet hero uses the desktop pattern, 28 Sep 2026

Browser acceptance is **PENDING** (Codex: 390, 844, 1024, 1440). The figures below come
from the source geometry, not from rendering.

- **Why:** at ≈842 px the user rejected centred copy on a solid green block with a separate
  photo underneath and a visible top fade.
- **Tablet (`md` → `xl`, 768–1279):** the same single grid cell and the same single
  horizontal overlay (solid to 20%, clear at 60%) as desktop. The copy is left-aligned, not
  centred, and capped at 20rem below `lg` and 26rem from `lg`. It ends at ≈44.3% of the
  width at 768 and ≈42.6% at 1024, left of the man's body. The vertical fade is phone-only.
- **Tablet photo framing (`HERO_TABLET.startPct` = 12):** the photo starts at 12%, under
  solid ink. At minimum it is the full hero width, and 12% is cropped off the mirrored
  right: wall and the woman's far knee only. The photo box stretches to the grid row
  (`object-cover object-right`; object-position applies before the CSS mirror). If the
  copy makes the row taller, the photo grows and everyone moves right. At minimum scale:
  the man's face is at 58% (≈5% ink), the woman's at 77% (clear), and the man's left body
  at 46% (≈35% ink). The woman's head stays in frame up to ≈1.22× scale.
- **Phone:** SUPERSEDED by the entry above (a pale portrait).
- **Desktop (`xl`+):** same visual contract. The shared grid-cell and layer classes now
  start at `md:` (they already applied at `xl`), plus `xl:self-start`. The photo is
  natural-ratio at 80%, uncropped, and the 20→60 gradient is identical.
- **Unverified:** the real copy height at 768/844 (the Maison Neue Extended line count),
  and therefore the actual scale and crop; contrast of the copy over the ramp.

---

## CURRENT — app-download preview section, 28 Sep 2026

- **New `AppDownloadPreview`** after the buyer questions, before Steps: eyebrow "Ứng dụng
  FinHome", H2 "Chuẩn bị mua nhà từng bước cùng FinHome" (brand-green-ink, bg-soft
  section), a plain-language line about reviewing finances, trying repayment options and
  preparing to buy in the app — no synced-data, saved-plan or store-availability claim.
- **QR panel is ILLUSTRATIVE (user-permitted for this preview).** The old QR + store-badge
  image `o8jJXgRiX6LN7LOGgMXmaxsupVs.png`, non-interactive, full aspect, ≤340 px, alt text
  saying it is illustrative, and the caption "QR minh họa — bản xem trước" directly under
  it. No link, button, store URL or generated QR anywhere in the section.
- **Phone artwork** `Z8KIqP7hqZvzaK06QSJARSULQQw.png` now lives here (config moved from
  `HERO.images.phone` to `APP_DOWNLOAD_PREVIEW`); the duplicate in Steps is removed, so the
  homepage shows it once. Layout: one column below lg (copy → QR → phone), two from lg
  (copy + QR left, phone right).
- **REQUIRED BEFORE PUBLISH:** a real app download URL, a QR generated from it, and real
  store badges linking to real listings must replace the illustrative panel and caption.
- Hero, photo, gradient, header, navigation and cards unchanged. Browser review pending.
- **Codex observed (independent review, 28 Sep 2026):** at actual 1440 desktop and 390
  mobile there is no horizontal overflow; both assets load; the caption is visible; the
  section has zero anchors and zero buttons; the phone is shown whole and not duplicated.
  Captures (local, git-ignored): `.superpowers/app-download-preview-EQ8acG/desktop.png`,
  `mobile.png`, `mobile-art.png`. Follow-up repair: both lazy images now carry their
  intrinsic size (phone 895×1024, panel 512×196, verified by Codex with `sips`) to prevent
  layout shift; responsive `w-*` / `h-auto` classes unchanged. **No QR destination, scan or
  download is claimed or proven — the panel is illustrative only.**

---

## CURRENT — grid height fix + native gradient, 27 Sep 2026

Independent 1440 screenshot (the reviewer's observation, not Claude's): the fade starts
inside the copy and the gray header shell/pill spacing is good, with no horizontal
overflow; it found an ≈8 px solid-green strip under the photo. Cause: `xl:min-h-[49.5vw]`
counts the scrollbar while the photo is 80% of the content width, plus rounding.

- **Fix.** At xl the hero is a one-cell grid: copy and the natural-ratio photo share the
  cell, so the row is as tall as the taller of the two — normally the photo, in flow and
  top-aligned under the header. No viewport-based height remains. **Tall-text fallback:**
  if the copy outgrows the photo, the row grows and solid green shows below the photo; no
  crop, nobody moves.
- **Gradient.** Now the native `linear-gradient(to right, var(--color-brand-green-ink) 20%,
  transparent 60%)` — same linear 20→60% ramp (CSS interpolates alpha linearly, in
  premultiplied colour so it stays green), replacing a generated 41-stop gradient.
  `heroOverlayAlpha` stays as the tested model.
- Photo, copy, CTAs, navigation, header and tints unchanged from the section below.
  **Contrast is not fully verified**; no WCAG pass is claimed for the copy over the ramp.

---

## BASE (still current except its xl height, now the grid above) — linear 20→60% overlay + white pill on gray shell, 27 Sep 2026

- **Overlay.** One brand-green-ink overlay over the whole hero, every width, LINEAR:
  20%: 1 · 30%: 0,75 · 40%: 0,5 · 50%: 0,25 · 60%: 0 of the hero width. It visibly
  lightens from 20%. The held `smootherstep^7` curve (nominal 20/60, visually ≈43/58) is
  withdrawn, and so is the "≥93% green under the copy" requirement.
- **Photo behind the whole ramp.** Mirrored, natural aspect, right-aligned at **80%** of
  the width, so it starts exactly at 20% (overlay opaque there — no seam) and every step of
  the fade is over the photo, not green-on-green. xl: pinned top-right under the header,
  min-height 49,5vw ≈ its natural height. Below xl: in flow under the copy.
- **Tint (tested).** Man's face ≈56,8% of the width → ≈8% green; his left body from ≈47,2%
  → up to ≈32%; the woman is clear.
- **Copy contrast — limitation, not a pass.** The copy crosses the ramp; at its right end
  (≈39,7–43,1% at 1280–1920) the overlay is ≈0,42–0,51, so plain white-on-background over
  the pale wall is ≈2,1–2,4:1 (estimate, wall L≈0,84) — below 4,5:1 and 3:1. A restrained
  glyph shadow (dark edge + green halo) is applied to the H1, body and reassurance; the
  secondary CTA gets a 70% green fill. No text card or broad underlay. Readability needs
  the browser check; no WCAG pass is claimed. Below xl the copy is on solid green.
- **Header (homepage only).** `SiteHeader variant="white"`: a centred 56 px pill in the
  app's `surface` #FFFFFF with a `border` #E5E5EA edge and a bounded shadow, floating on a
  `bg` #F2F2F7 shell (tokens `--color-header-shell/surface/border`, values read from
  `finhome_reactnative/features/shared/constants/theme.ts`, app not edited). 16 px above
  and below on mobile, 24 px from xl; in-flow spacer exactly 88 / 104 px. The spacing is
  our choice, not an Apple mandate. Navigation unchanged; other pages keep the default.
- **Trade-offs.** The 80% photo makes the xl hero ≈633 / 712 / 949 px tall at 1280 / 1440 /
  1920. Light tint on the man. Copy contrast as above.
- Browser proof pending the user; nothing here was observed in a browser.

---

## PREVIOUS — pill on white + held 20→60% curve, 27 Sep 2026 (superseded above)

- **Header (homepage only).** `SiteHeader variant="white"`: the ORIGINAL pill, desktop and
  mobile, on a white header background (was transparent). The flat full-width bar of the
  previous iteration is superseded. Other pages keep the default transparent capsule.
- **Overlay.** ONE horizontal overlay over the whole hero, every width: brand-green-ink
  solid to **20%** of the hero width, transparent at **60%** (the user's exact boundaries;
  the earlier 12%/32%-of-photo stops are gone). Eased as `1 − smootherstep(t)^7` over 41
  stops 1% apart, zero slope at 60% (no kink).
- **Why that curve.** The 28rem white copy ends at 39,7 / 40,8 / 43,1% of 1280 / 1440 /
  1920, and white text over the pale wall needs ≈≥93% green for 4,5:1. A plain eased
  fade from 20% leaves ≈52% at 40%. This curve keeps ≥95% under the copy, so the
  VISIBLE fall is ≈43–58%, not the whole 20–60% span. Stated plainly: the stop
  boundaries are exactly 20/60; the perceived gradient starts later.
- **Photo.** Mirrored at EVERY width (mobile was unmirrored — superseded, or the same
  overlay would bury both faces), natural aspect, right-aligned at **74%** of the width
  (left edge at 26%, where the overlay is still solid — no seam). xl: pinned top-right
  under the header; min-height 45,8vw ≈ the photo's natural height. Below xl: in flow
  after the copy, 10% top fade above the hair.
- **Faces and bodies.** Both faces are clear of the overlay (man's face ≈60,0%, woman's
  ≈74%). The man's LEFT body (silhouette edge ≈51% of the width) is under up to ≈42%
  green — the unavoidable cost of a 20→60% overlay on a photo whose people begin at
  ≈34% of it. The woman is untinted. Tested.
- **Trade-offs.** Mobile photo is smaller (74% width ≈ 289×179 at 390). The man's arm
  and leg are visibly tinted at their left edge. At 1920 the hero is ≈878 px tall.
- Browser proof pending the user/Codex; nothing here was observed in a browser.

---

## PREVIOUS — white header bar + photo from the top, 27 Sep 2026 (superseded above)

User direction after the mirrored repair: keep the left-to-right soft green fade, use a
full-width white navbar like the NerdWallet reference, remove the green "blanket" over
the top of the photo and the faint vertical line where the image starts.

- **Header, homepage only.** `SiteHeader variant="bar"` (default `"floating"` capsule is
  unchanged on every other page): full-width `bg-white` with a bottom border, 64 px spacer;
  same links, disclosures, keyboard, CTA and app-mode marker (tested). The lint
  baseline's two lines stay at 52 / 83.
- **Hero below the bar.** No `-mt-[87px]` tuck. At xl the mirrored photo is pinned
  TOP-right, so it starts directly under the header; the xl min-height is the photo's
  natural height, `min(40.8vw, 640px)`, so the photo is never stretched to the copy.
  Enlarged content adds green BELOW the photo instead.
- **No top blanket at xl.** The 10% top fade now applies below xl only.
- **Seam.** The horizontal fade starts 4 px left of the image edge (`-left-1`) over the
  section's solid green, so the mirrored image's sub-pixel edge is covered.
- Blend, silhouette clearance, copy and CTAs unchanged from the section below.
- **Trade-off.** With enlarged text the section grows below a fixed-size photo, leaving a
  straight horizontal photo edge onto green at its bottom; no person is affected.
  Browser proof pending the user/Codex; nothing here was observed in a browser.

---

## PREVIOUS — mirrored recomposition + shorter hook, 27 Sep 2026 (its copy, mirroring and blend remain current; its bottom-anchored placement and top fade at xl are superseded above)

User feedback: the 44→46% fade read as a hard vertical seam; they want a softer blend
with no tint on skin or body, and a shorter plain-language hook.

- **Copy.** H1 "Nhà bao nhiêu tiền thì vừa sức bạn?"; supporting line "Bắt đầu với điều
  bạn muốn biết: nhà tầm giá nào, mỗi tháng trả góp bao nhiêu hay cần để dành thêm bao
  nhiêu. Chọn một công cụ và thử với số của bạn." (a choice of tools). CTAs, routes,
  reassurance, cards, navigation unchanged.
- **Why widening the fade could not work.** The silhouettes span ≈5,5–66% of the
  original's width, so they start near its left edge, where the green is.
- **Recomposition, CSS only.** From `xl` the photo is mirrored (`xl:-scale-x-100`; the
  JPEG is untouched): the blank wall and basket move to the left and the people to
  ≈34–94,5% of the photo. It is shown WHOLE (natural aspect, no crop) at
  `min(66vw, 1035px)` wide, anchored bottom-right; the section's xl min-height is
  `min(40.8vw, 640px)` to match. Enlarged content only adds green above the photo —
  the people never move or crop (tested with +160 and +480 px).
- **Blend.** An 11-stop smootherstep gradient over the wall: solid `brand-green-ink` to
  12% of the photo's width, clear at 32% — ≈169 / 190 / 207 px wide at 1280 / 1440 /
  1920 (was ≈26 px). Copy ends on solid green; the fade clears 17–21 px before the
  silhouettes. A 10% top fade blends the photo's upper wall into the green. Only the
  basket sits under the fade.
- **Below `xl`:** natural (unmirrored) band, unchanged, 10% fade above the heads.
- **Trade-offs.** (1) The desktop photo is a mirror image — acceptable for a decorative,
  text-free scene; the laptop's logo is also mirrored. (2) At 1280–1440 the photo is
  shorter than the section (522 / 587 px), so a band of solid green sits above its
  top-right, blended by the 10% top fade — less "edge to edge" than before. (3) The
  copy column is 28rem: a larger ROOT font size widens it, which this geometry does not
  compensate for (section height growth is handled; column widening is not).
- **Browser proof pending Codex.** Claude computed the geometry and the tests assert it;
  nothing here was observed in a browser.

---

## PREVIOUS — first immersive geometry (72% / 51%, then 56% / 44→46%), 27 Sep 2026 — superseded by the mirrored recomposition above

### Independent browser review — Codex

**Latest silhouette-repair verification:** observed the new 56% / left-anchored
photo and 44–46% fade at 1280×900, 1440×900 and 1920×1080. Both people remain
visible, including the woman's shoulder, arms and crossed legs, outside the
green fade. No horizontal overflow. Mobile 390×844 remains unchanged, with CTA
bottom y≈455 and no overflow. Viewport override reset after review. This
supersedes the body-wash finding in the previous paragraph below. The narrow
transition is visibly more pronounced than the old wide fade, a deliberate
trade-off to avoid hiding the subject without altering the photograph.
Enlarged-text right-edge crop remains a documented pre-release concern, not
covered by these normal-text screenshots. Claude completed all five gate steps
again on Node24.21.0 after its test/doc repair (7,134 passing tests). No release.

Observed the refreshed static export at `http://127.0.0.1:3240/` at 1440×900,
1280×900, 1024×768 and 390×844. No horizontal document overflow at those sizes.
Desktop photo fills the right side of the hero with no rounded frame; faces and
laptop remain visible. The fade does cover part of the woman's shoulder/body,
not the main face area. Tablet/mobile use a full-width image band and vertical
fade, with no detached card. At 390×844 the primary CTA ends at y≈455 and the
photo occupies x=0–390, y≈583–823. Browser computed hero background is
`rgb(17,127,54)`, matching the existing brand-green-ink token; white on that solid
colour computes to 5.106:1. This is not a pixel-by-pixel audit of the photograph.
Tab from the primary CTA reaches the secondary CTA with a visible 2px white
outline. Enlarged text, real-device behaviour and screen-reader output remain
unverified. The user still owns acceptance of the visual direction.

Claude reports the five post-edit project gate steps pass on Node24.21.0:
320 files / 7,134 tests; TypeScript; lint 3 baseline / 0 new; build 290 pages;
markup 76 live calculators + 204 other pages. Scope remains this isolated
worktree, not integration or deployment. Existing photo assets are retained.

The user rejected the framed photo card and the off-brand #07543e teal and asked for an
immersive background hero like the NerdWallet/SMG references. Implemented by Claude
session `9af4faa6-44fd-4ae3-bbbd-c8fe59557bf6` in this worktree; Codex verifies visually.
Copy, routes, hierarchy and lower sections unchanged; the Pexels JPEG is unchanged.

- **Background, not a card.** The photo is a full-bleed child of the hero section — no
  margin, no max-width, no rounding — with `object-cover`.
- **Silhouette repair (after Codex's review).** The first immersive geometry (photo right
  72%, `object-[40%_20%]`, fade to 51%) cleared only the face centres and green-washed the
  woman's shoulder, torso and legs at x≈44–51%. Now: photo right **56%**, anchored
  **left** (`xl:object-[0%_20%]`) so the crop falls on the blank wall, fade solid to 44%
  and transparent by **46%**. Whole-silhouette bounds, read from the original (knee
  ≈5,75% → arm/laptop ≈65,7% across, hair ≈14% → feet ≈96% down), clear the fade by
  ≥18 px and stay in frame at 1280/1440/1920 × 640/650/800; the test asserts this. The
  72%/51% bullet below is superseded by this one.
  **Constraint:** the fade clears the whole silhouette at every height, but if the hero
  grows taller than ≈671 / 755 / 1007 px at 1280 / 1440 / 1920 (e.g. enlarged text), the
  photo re-covers by height and the man's arm/laptop is cropped at the right. Default
  hero height is 640–650 px, inside the limit. Correction to the line above: "in frame"
  holds up to those heights, not at 1280×800.
- **Palette.** Section `bg-brand-green-ink` (#117f36; white on it 5,11:1). Primary CTA
  white with `text-brand-green-ink`, hover `bg-bg-soft`; secondary white outline, hover
  `bg-cta`. `brand-green` (#17ab48, 3,02:1 under white) never sits behind text. No
  #07543e / #edf6ef / #142a22 / #52645b remain in the hero or buyer questions.
- **`xl`+ (1280 px up).** Photo absolute on the right 72% at full section height,
  `object-[40%_20%]`, `min-h-[640px]`. A section-wide gradient is solid brand-green-ink
  to 44% and transparent by 51%. Computed from those values (and asserted by
  `home-photo-preview.test.ts` at 1280/1440/1920 px): the woman's face lands at
  ≈52,7–53,2% of the width and the man's at ≈67%, both right of the fade; the 28rem copy
  ends at ≈39,7–43,1%, always on solid green; heads and laptop inside the height.
- **Below `xl`.** Copy on solid green, then a full-width photo band in the same section,
  240 / 420 / 460 px (mobile / md / lg), anchored top (`object-[40%_0%]`). A
  top-to-bottom fade over its first 10% joins it to the green; the heads start at
  ≥14% of the band, so the fade stays above them; the laptop stays in view (asserted at
  390 / 768 / 1024). Tablet copy stays centred (earlier repair).
- **Buyer questions** recoloured only: `bg-bg-soft`, `text-ink`, `text-ink-2`,
  `brand-green-ink` ring/focus/arrow. Card structure unchanged.
- **Tests.** The previous "whole photo, never cropped, no gradient" assertions were
  **superseded by the user's explicit request**; their intent (no face obscured, no text on
  a face) is kept as computed geometry, plus background/no-frame and palette checks.

NOT verified by Claude in a browser: the rendered fade and faces at real widths,
overflow, 390×844 above-the-fold position with the 240 px band, 768–1279 layout, larger
text, focus rings, colour of the fade over the photo's wall. The geometry assumes the
section is 640 px tall at xl; taller (larger text) re-covers by height and was not
separately computed. The 1,1 MB eager JPEG is unchanged. `buyer-couple-preview.png`
(superseded AI image) is retained on disk, unreferenced.

---

*Everything below is PREVIOUS history (framed-card and AI-image previews), kept as
evidence; it no longer describes the current hero.*

## Independent review of the real-photo replacement — Codex, 27 September 2026

Claude session `9af4faa6-44fd-4ae3-bbbd-c8fe59557bf6` implemented this replacement.
Codex inspected the rendered preview at port 3240 at 1440×900, 1024×768 and
390×844: no horizontal document overflow; both faces and the laptop remain
visible, with no text or CSS tint over them. The original loads at natural width
3805 px. At 390×844 the image renders at 350×216 px and the primary CTA ends at
y=455, before the first scroll. The primary CTA opens `/cong-cu/`; Back returns
to the homepage. Viewport overrides were reset after review.

Codex reran all five owning-project gate steps in this exact isolated worktree
on Node 24.21.0 after Claude's implementation (whose first gate used Node 25):
320 test files / 7,131 tests pass; TypeScript passes; lint has 3 baseline issues
and 0 new; build exports 290 pages; markup contracts pass (76 live calculators,
204 other pages). The harness preparation resolves the primary checkout, not
this unmanaged worktree, so these checks were run directly in the actual source
root rather than claiming a primary-checkout check verifies this preview.

The Pexels page and https://www.pexels.com/license/ were reviewed during asset
selection: website use and modification are permitted; do not imply endorsement
by the people depicted. No model-release audit or independent licence counsel
review is claimed. No production performance, real-device accessibility or
conversion verification. The 1.1 MB JPEG and superseded AI PNG are intentionally
retained locally for preview/source comparison; responsive encoding and removal
of unused preview assets remain pre-release cleanup. No commit, push or deploy.

## PREVIOUS — framed real-photo card, 27 Sep 2026 (superseded by the immersive hero above)

The user approved replacing the defective AI image with a real photo:
**Pexels photo 7593053, "Man and woman sitting on a sofa", by Miriam Alonso**
(https://www.pexels.com/photo/man-and-woman-sitting-on-a-sofa-7593053/). Downloaded by
Claude with the user-approved command
`curl -fL https://images.pexels.com/photos/7593053/pexels-photo-7593053.jpeg -o public/images/home/pexels-7593053-original.jpg`
(1.138 KB received). Stored UNMODIFIED as `public/images/home/pexels-7593053-original.jpg`,
3805×2352 (≈1,62:1): no resampling (the local resize tool needed a further approval, so
the original ships at full resolution — clarity over payload for this preview), no
generative editing. Licence: the Pexels License as offered on that photo page (free
use; attribution not required) — **the licence text was not re-read by Claude**;
confirm it before release. Source and size are also recorded as `HERO.photoSource`.

Layout (`components/sections/hero.tsx`): the photo renders WHOLE at its natural aspect
(`h-auto`, intrinsic `width`/`height`, no `object-cover`, no gradient, tint or overlay),
in its own column. `xl`+: two columns, text left on solid `#07543e`, photo right, rounded.
`md` to below `xl`: centred 42rem copy (Codex's tablet repair, kept) then the photo as a
centred block of the same width. Below `md`: copy then full-width photo. DOM order is
copy → photo at every width. The faces sit at ≈35% / ≈54% across and ≈17–33% down;
nothing crops them. Tests: `components/sections/home-photo-preview.test.ts`.

**Superseded asset retained:** `public/images/home/buyer-couple-preview.png` (the AI
image) is still on disk and referenced nowhere (a test asserts that). Not deleted, per
instruction. Everything below about it — Codex's first review, its generation prompt,
its crop rules — is **OBSOLETE history**, kept as evidence.

Not verified by Claude in a browser: overflow at 1440/1280/1024/390, the photo's rendered
size and the 390×844 above-the-fold position with the new photo, focus rings, larger
text. The 1,1 MB eager JPEG is the likely LCP image. Codex re-reviews at port 3240.

---

*Historical sections below refer to the superseded AI image.*

## Independent final review — Codex, 27 September 2026

Reviewed the final static export at http://127.0.0.1:3240/ after Claude's tablet repair.
At 1440×900, 1024×768 and 390×844 the page has no horizontal document overflow;
the photo keeps both faces visible. The repaired tablet copy/actions are centred,
and the taller image band no longer cuts the tops of heads. On 390×844 the primary
CTA ends at about y=455, before the first scroll. Desktop retains one H1.
Screenshots were saved and reopened in `.runtime/homepage-photo-review/`:
`desktop.png`, `tablet.png`, `mobile.png`.

Before the tablet-only repair, actual browser actions on the same source at port
3242 verified H01→H02→H03 (Enter on primary CTA, then all three question links),
H04 (education collection), and browser Back. Tab from the primary CTA reached
the secondary link with a visible 2px solid focus outline. No browser errors were
observed; the development server logged a Next smooth-scroll advisory. Full
screen-reader output, real-device touch, enlarged text, contrast measurement and
conversion impact remain unverified.

Claude session `9af4faa6-44fd-4ae3-bbbd-c8fe59557bf6` implemented and repaired the
preview. Its final worktree gate: 320 files / 7,131 tests, TypeScript, baseline
lint (3 existing, 0 new), build (290 pages), markup all pass. `git diff --check`
also passes. Verification applies to this isolated checkout, not integration with
the concurrent retirement changes in the primary checkout. No commit/push/deploy.

Asset: `public/images/home/buyer-couple-preview.png`, generated with built-in
image_gen from the approved reference. Edit prompt: remove all overlaid text,
logo, buttons and links; reconstruct background beneath them; preserve the same
Asian couple, natural skin, composition, room, light, laptop, notebook and table;
no new objects or typography. It remains approximately 1.5 MiB and needs a
responsive encoding/performance pass before release. The source image and this
isolated preview are intentionally retained for review.

Brief: `docs/homepage-photo-preview-brief.md`. Implemented by Claude in this worktree
(`.worktrees/finhome-nav-preview-qdUSPL`, base `c7ab5a4` + the uncommitted navigation
preview). Codex owns the browser review. Not committed, pushed or deployed. The flow
(H01 homepage → H02 hero/tool card → H03 existing tool; alternative H04 articles)
stays **proposed** pending visual acceptance.

## What changed

| File | Change |
|---|---|
| `content/home.ts` | `HERO` rewritten with the brief's copy, two CTAs, reassurance line and `photo` path; the marquee/QR-panel/badge keys and the unused `cta` removed; `images.phone` kept. New `BUYER_QUESTIONS`. |
| `components/sections/hero.tsx` | New photo hero (below). QR / store-badge panel and phone artwork removed from it. `#trangchu` and the `-mt-[87px]` header tuck kept. |
| `components/sections/buyer-questions.tsx` | New: "Bắt đầu từ câu hỏi bạn đang có" + three full-card links in a `<ul>` (not numbered), visible focus ring. |
| `components/sections/steps.tsx` | The phone artwork (`HERO.images.phone`) now renders once, whole, after the step cards. Nothing else in the section moved. |
| `app/page.tsx` | Order: Hero → BuyerQuestions → Steps → (unchanged rest). |
| `components/sections/home-photo-preview.test.ts` | New regression tests (11). |

Destinations, all verified as existing `app/**/page.tsx`: `/cong-cu/`,
`/blog/mua-nha-bang-con-so/`, `/cong-cu/kha-nang-mua-nha/`, `/cong-cu/vay-mua-nha/`,
`/cong-cu/muc-tieu-tiet-kiem/`. No store links, no new forms, no stored state.

## OBSOLETE — the AI image and its crop (superseded 27 Sep; kept as history)

`public/images/home/buyer-couple-preview.png` (supplied by Codex, 1916×821, ≈2,33:1,
1,6 MB, not re-encoded) already fades to green over its left ~35%; the faces are at
≈64% and ≈79% of its width. Decorative `alt=""` — not a customer, not an endorsement.

- **Below `xl`:** copy + CTAs on solid `#07543e`, then a 240 px photo band anchored
  `object-[100%_30%]` (at 390 px it shows ≈30–100% of the width: both faces).
- **Tablet, `md` to below `xl` (repair after Codex's review):** copy and CTAs CENTRED
  in a 42rem column; photo band 350 px anchored to the top (`object-[100%_0%]`) so the
  heads (≈12% down the image) stay whole — at 1024×350 the image covers by width and
  shows its top ≈80%. Below `md` (390 px) and `xl`+ are unchanged.
- **`xl`+ (the header's desktop breakpoint):** the photo is full-bleed, anchored right;
  copy capped at 28rem on the green side; a CSS gradient over the LEFT HALF only
  reinforces the painted fade and ends before the faces (≈58–64% of width at
  1280–1920 px). `lg` was rejected on paper: at 1024 px the woman's face lands at ≈48%,
  beside the copy.
- Height is `min-h-[640px]` at `xl`, never fixed, so larger text grows the band.

## Codex's independent browser review (Codex's observations, not Claude's)

On `http://127.0.0.1:3242`, serving this worktree: desktop 1440 and 1280 and mobile 390
passed crop and overflow; the main CTA worked with keyboard Enter; all five new
destinations opened. At 1024×768 it found the 28rem copy stranded far left beside an
empty right half, and the 240 px band cropping the tops of both heads — repaired as
above, pending Codex's re-check.

Correction: an earlier `content/home.ts` comment said the app "is not in the stores".
Availability was not verified; the removed store panel was only a non-interactive
image. The comment now says just that.

These positions are computed from the image's pixel geometry, **not observed in a
browser.**

## Checks run here

New preview tests (one H1; brief copy; CTAs and question cards are real links to
existing routes; decorative photo; no QR/store panel or phone image in the hero; no
guarantee/approval wording; DOM order copy → photo; gradient left/xl-only; three
parallel cards; phone artwork once, after the questions; page order). Then the five
`pnpm gate` steps, run separately after this document (numbers in the handoff message).

## NOT verified

- Claude observed nothing in a browser. Beyond Codex's review above, the tablet repair
  (768–1279, including 1024×768), larger-text reflow and focus rings still need a
  browser re-check; the 390×844 above-the-fold position is Codex's to confirm.
- The photo is a 1,6 MB PNG eagerly loaded as the likely LCP image; its encoding can be
  optimised separately without changing its content.
- No conversion claim: the intended metric (a visitor edits valid inputs and gets a
  result, not the default render; guardrails load / readability / abandonment) needs
  real traffic.
