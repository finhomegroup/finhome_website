# /blog/ layout follow-up — pagination, dates, guide block (2026-09-30)

Owner: Claude Code (implementation, tests). Codex: native full check
(`aiws native check finhome-website --task auto-education-20260930 --mode full`)
and browser proof. **Released 2026-10-01 as PR #224** (see "Release" below);
statements further down that nothing was committed or deployed describe the
state at the time they were written.

## What changed

1. **Pagination** (`components/blog-pagination.tsx`, `paginationWindow` in
   `content/blog-pagination.ts`). The feed rendered one button per page; at
   390px, 21 pages put "Trước" at x=-88 and "Sau" at x=403. Now:
   - below `sm`: "Trước", "3 / 21" (read as "Trang 3 trên 21", `aria-live`),
     "Sau";
   - from `sm`: first, last, current ±1 and "…" gaps, at most seven slots, with
     a run of five kept at either end so the row length stays constant.
   Every control is ≥44px (`min-h-11`/`size-11`), has a focus ring, and
   Trước/Sau are disabled at the first/last page and while loading. The
   topic filter, `?topic=`/`?page=` URL format and "keep current state on
   failure" are kept. The load/history/race handling was NOT left as it was:
   a Back/Forward bug found in the browser led to the repair below.
   On mobile, first/last are reached by stepping; the numbered list with
   explicit first/last shows from `sm`.
2. **Dates** (`content/post-date.ts`, `components/post-date.tsx`). Market cards
   and the NEWS article header show `POSTS.date` as
   `<time datetime="YYYY-MM-DD">dd/mm/yyyy</time>` with an sr-only "Ngày
   đăng". The label is built from the ISO digits (no timezone shift); invalid
   or absent values (e.g. 2026-02-30) render nothing, including no separator.
   No update timestamps. Guides and collection articles keep their header.
   The "Bài viết liên quan" cards are unchanged.
3. **Guide block** (`app/blog/page.tsx`). Seven full-width stacked cards
   became three compact cards (a row with a small cover on phones, three
   columns from `sm`, excerpt clamped to two lines from `sm`), followed by a
   native `<details>` "Xem tất cả {n} bài hướng dẫn" / "Thu gọn" holding the
   rest. The count is derived from `POSTS`. Every guide link is in the server
   HTML exactly once; the summary sits between the two lists, so toggling does
   not move it or the focus. Titles and "Đọc và thử với số của bạn →" are
   unchanged; the two reading paths, the collection link and the feed anchor
   are unchanged.

No new dependency, analytics, persistence, route or network call. No change to
search/topic filters, the collection page, chapters, articles or tools.

## Tests

`components/blog-layout.test.ts` (new): window bounds for 1–60 pages (≤7 slots,
first/last/current present, no gap hiding a single page, clamping); pager
markup (labels, `aria-current`, 44px classes, disabled states, loading);
`postDate` valid/invalid cases and that every news entry has a valid date;
rendered `/blog/` (dates on first-page cards, bounded pager, 3 + disclosure,
each guide once, wording and reading paths); news header date, none on a guide
or collection article.

## Verification actually run

Claude, Node v24.21.0 on PATH (a first attempt through absolute binary paths
was denied by the session gate and not bypassed; the parent then provided
Node 24 on PATH):

- `pnpm exec vitest run components/blog-layout.test.ts
  components/navigation-map.test.ts components/ui/brand-contrast.test.ts
  components/page-background.test.ts lib/serverless-imports.test.ts
  content/education/chapters.test.ts`: 6 files / 133 tests passed; verbose
  run of the new file: 29/29 executed and passed (incl. the /blog/ and article
  renders). No repair was needed.
- `pnpm exec tsc --noEmit`: clean (re-run after adding the preview script).
- `pnpm check:lint`: 3 total, 3 baseline, 0 new.
- Not run by Claude: full `vitest run`, `next build`, `check:markup` — Codex's
  native full check. No browser: layout, clipping and tap targets at 390px and
  desktop are NOT verified by any test.

## Back/Forward repair (2026-10-01)

**Codex native full gate before this repair:** 359 files / 7.967 tests,
types, lint 0 new, build, markup — all passed. **Browser (built preview,
390×844):** three compact guide rows; Enter opens all seven, a second Enter
collapses with focus kept on the summary; no overflow; the market feed starts
at y≈1329.5 (was ≈3805). **Real bug found:** page 1 → "Trang sau" (URL
`?page=2`, pager 2/21, 28/09 posts) → browser Back: the URL returned to
`/blog/` but the pager stayed at 2/21 with the page-2 posts.

**Cause (pre-existing, in `BlogPostGrid`):** the popstate listener was
registered once and closed over the first render's `load`, which still saw
topic "all", page 1, loading false. On Back, `load("all", 1)` hit the "already
here" early return. The same stale closure also let a late response overwrite
a restored page (the no-fetch page-1 path did not cancel requests in flight)
and could drop a history step that arrived during a load.

**Fix:** `components/blog-feed-navigation.ts` — a framework-free navigator
that owns the LIVE feed state (`createFeedNavigator`), plus `feedParams` /
`feedUrl` (the old URL read/write, unchanged in behaviour). `BlogPostGrid`
creates one navigator for its lifetime and routes clicks, the initial
`?topic=/?page=` URL and popstate through it. Rules: every navigation
supersedes any in-flight request; a user click during a load is ignored (the
buttons are disabled too); a history step is never dropped and never pushes;
failure keeps the current posts. For a user click, the URL records the clamped
page the server returns; a history step pushes nothing, so the URL it landed
on stays as is. Markup, the topic filter and first/last/current controls are
unchanged. The effect's `eslint-disable` for exhaustive-deps is gone (deps are
now `[nav]`). No dependency added.

**Regression:** `components/blog-feed-navigation.test.ts` (11 tests) drives the
real navigator through a fake history stack whose back()/forward() fire the
same popstate wiring as the component: the reported sequence, multi-step
Back/Forward with a topic, forward-entry replacement, Back during a slow
request, out-of-order responses, cancel-by-returning, click-while-loading,
failure and clamping. Non-vacuity checked: comparing against the initial
snapshot instead of the live state (the old closure's behaviour) makes the
reported-bug test fail with page 2 still shown; reverted. No DOM environment
exists in the repo, so scrolling/focus/real popstate are still the browser's.

**Checks (Claude, Node v24.21.0):** focused vitest (navigation, blog-layout,
navigation-map, brand-contrast, page-background, serverless-imports,
tool-education-series, chapters) 8 files / 187 tests passed; `tsc --noEmit`
clean; `pnpm check:lint` 3 total, 3 baseline, 0 new. No build.

## Final independent evidence (Codex)

- **Native full gate PASSED** at 2026-09-30T17:25:10Z: 360 files / 7.978
  tests, types, lint (3 baseline, 0 new), build, markup. Source unchanged
  since the gate.
- **Browser, built preview (real in-app browser):**
  - 390×844: page 1 → 2 → Back restores page 1 (first card dated 30/09);
    Forward restores page 2 (28/09).
  - Topic "Giá & Cung": 1/8 → 2/8 → Back restores 1/8 and keeps the topic.
  - 1440×900: on the last page (21), Sau is disabled; back on page 1, Trước
    is disabled.
  - 320px and 390px: no horizontal overflow; step buttons 44px tall.
  - Guide summary: Enter expands and collapses, focus stays on the summary.
  - Article `nguoi-mua-can-ho-doi-chien-thuat`: 30/09/2026 with
    `dateTime="2026-09-30"`.
  - Console: no warnings or errors.
- Final screenshots: `artifacts/blog-layout-followup/05-mobile-guides-final.jpg`,
  `06-mobile-pagination-final.jpg`, `07-desktop-guides-final.jpg`,
  `08-article-date-final.jpg`.
- The local preview on 127.0.0.1:3272 is intentionally still running for
  review. At that point (historical) nothing was committed, pushed or
  deployed; the release followed on 2026-10-01.

## Release 2026-10-01

- **PR #224 squash-merged** as `96ce98a66bdaf2aa2793cc63227b1734414c482e`
  (source fix `4349c68`; tested merge head `9728fd3`, base `8d95f23`, exactly
  11 files). Merged with `--match-head-commit`, normal protections, no admin
  override, branch kept.
- **Final full gate** on the merged tree after integrating main #223: 360 files
  / 8.018 tests, types, lint 3 baseline / 0 new, build, markup — passed. PR
  checks `gate`, Vercel preview and Preview Comments passed.
- **Post-merge (parent, GitHub status):** CI on main succeeded; Vercel
  production deployment `4TWk1Ws3Z3mMpBU2QENhcxyUHHQu` SUCCESS.
- **Real production UI (parent), https://www.finhome.group/blog/ at 390×844
  and 1440×900:** compact guide block expands and collapses; page 1 (first
  card 30/09) → page 2 (28/09) → Back to 1 → Forward to 2, correct; no
  horizontal overflow; news article `nguoi-mua-can-ho-doi-chien-thuat` shows
  30/09/2026 with ISO `2026-09-30`; console error/warning log empty.
  Screenshots: `artifacts/blog-layout-followup/09-production-mobile.jpg`,
  `10-production-article.jpg`.
- **Not verified:** Vercel team logs returned 403, so no server-side error
  scan is claimed; log drains and monitoring were not audited.
- **Local state:** hero originals untracked and excluded from the Git
  deployment, preserved locally; the 127.0.0.1:3272 preview is retained for
  comparison. This documentation update is local only — not committed,
  pushed or deployed.

## Local preview for the browser pass (git-ignored, not production)

`/.superpowers/blog-preview/serve.mjs` (under an existing ignore rule;
`/.claude/` was refused as a sensitive location). It serves `out/` plus the
REAL `api/blog-posts.ts`, bundled by the already-installed esbuild 0.27.0 into
`.next/finhome-preview/blog-posts.mjs` (git- and ESLint-ignored generated
area; rebuilt on every start) and called through a minimal
`VercelRequest/Response` shim — no API logic is duplicated. Loopback only
(127.0.0.1:3272), GET/HEAD only, static files restricted to `out/` (no dot
segments, NUL or backslash; realpath must stay inside `out/`), `/x` → `/x/`
redirect, `out/404.html` fallback, `no-store`. Needs `next build` first.

- Serve: `node .superpowers/blog-preview/serve.mjs` → `http://127.0.0.1:3272/blog/`
- `node .superpowers/blog-preview/serve.mjs --self-test` (run, no port opened):
  `status 200; page 2/8; 9 posts of 71` for `?page=2&topic=gia-cung`, the
  handler's own Cache-Control, path guard rejects four traversal probes.

**Lint repair after Codex's native full check** (vitest 359 files / 7.967
tests, types pass, lint FAIL): the first bundle location,
`.superpowers/blog-preview/.cache/blog-posts.mjs`, is not lint-ignored, and
`check:lint` reported an unused `LABEL_BY_ID` at line 3159 of that generated
file. Repair: the bundle moved to `.next/finhome-preview/`; the old file was
renamed (recoverable, not deleted) to
`.superpowers/blog-preview/.cache/blog-posts.mjs.disabled`. No ignore rule or
product lint setting changed and no `eslint-disable` was added. After
re-bundling (`--self-test`: same result as above), `pnpm check:lint`: 3 total,
3 baseline, 0 new. No build run.

## Paused: collection hero (`/blog/mua-nha-bang-con-so/`)

Paused by the user until an image is approved; photo 8055525 was rejected.
The partial hero is preserved as `artifacts/collection-hero/pending-hero.patch`
(against `1150f3b`; not applied, not verified with `git apply --check`, which
was also gated). `page.tsx` and `collection.ts` are back to HEAD. The two
downloaded originals `public/images/people/pexels-{8055092,8055525}-original.jpg`
are untracked and referenced nowhere. Left in place on instruction; their
removal is PENDING and outside this scope. They were never staged or
committed, so the Git-based Vercel deployment of PR #224 excluded them; they
remain preserved locally only. A future release that deploys from a local
build (not from Git) would need them removed from `public/` first.
