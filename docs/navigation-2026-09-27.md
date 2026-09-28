# Simplified site navigation — 2026-09-27 (LOCAL PREVIEW; bounded verification passed)

## Independent verification — Codex

Claude session `9af4faa6-44fd-4ae3-bbbd-c8fe59557bf6` implemented the navigation
and its repair; Codex independently reviewed the scoped diff and actual browser.
No commit, push or deployment.

The native full check in the shared checkout stopped on concurrent retirement work:
39 tests failed on a duplicate `statusView` declaration in
`components/retirement-plan-calculator.tsx`. That is not a navigation finding and
was not repaired here. To avoid interfering, the six navigation files were copied
onto detached base `c7ab5a4` in
`../.worktrees/finhome-nav-preview-qdUSPL`; the five code/test files have matching
SHA-256 hashes in both checkouts. No unrelated working-tree changes were copied.

The isolated checkout's project-owned `pnpm gate` passed under Node 24.21.0:
319 test files / 7,119 tests, TypeScript, baseline lint (3 existing / 0 new),
Next static build (290 pages), markup (76 live calculator pages + 204 other pages).
This proves the navigation snapshot against that base, not integration with the
unfinished retirement work.

Actual browser observations on the static export at `http://127.0.0.1:3240`:

- 1440×900 desktop and 390×844 mobile screenshots inspected: three primary items
  plus secondary support; tool/about disclosures readable; no document overflow.
- Desktop: click and Enter open; Escape from a child closes and restores trigger
  focus; Tab skips closed children and closes an open panel when leaving; outside
  click closes. Blog and vision routes resolve with correct active states.
- Mobile: same item order; choosing the car-loan link closes the menu; Escape closes
  and restores the hamburger. At 390×500 the menu is 380 px high, scrolls internally,
  and support remains keyboard-reachable. No horizontal document overflow.
- 1280×500 desktop: dropdown capped at 380 px versus 457 px content; last link
  reachable by keyboard and Tab exits to Bài viết.
- Homepage shows Mở công cụ initially; Hỗ trợ reaches the existing #hotro section.
  Calculator header has no global Thử ngay; Xem kết quả remains unchanged.
- Separate app-mode tab confirms the header is display:none; closing that temporary
  tab leaves the normal website preview unchanged.

Screen-reader speech, real-device touch, real zoom and user comprehension/conversion
are unverified. Screenshots live in workspace
`artifacts/finhome-navigation-preview-2026-09-27/`.
The isolated worktree and loopback server on 3240 are intentionally retained for
user review; retire them after review/integration, not while this preview is in use.

Implemented by Claude on branch `feat/retirement-tool-first-hero-20260927` (base
`c7ab5a4`). Codex verifies in a browser and runs the full native gate. Not committed,
pushed or deployed.

## What the header now is

| Position | Entry | Destination |
|---|---|---|
| Primary 1 | **Công cụ** (disclosure) | Khả năng mua nhà, Vay mua nhà, Vay mua xe, Kế hoạch hưu trí, Mục tiêu tiết kiệm, then **Tất cả công cụ** `/cong-cu/` |
| Primary 2 | **Bài viết** (direct link) | `/blog/` (was "Tin tức") |
| Primary 3 | **Về FinHome** (disclosure) | Tầm nhìn & sứ mệnh `/vision/`, Tính năng `#tinhnang`, Nền tảng `#nentang`, Trải nghiệm `#trainghiem` |
| Secondary | **Hỗ trợ** | `#hotro` |

- Hash links stay same-page on `/` and become `/#section` elsewhere (unchanged helper).
- The tools shortcut renders on the **homepage only** and says **"Mở công cụ"** visibly
  from the start (review repair: no "Thử ngay" → hover swap in the header; it shows
  `CTA_HOVER_LABEL` as its label). The shared `CTA_LABEL` / `CTA_HREF` constants are
  unchanged and still used by `sections/steps.tsx`. Calculator routes, the hub, the
  blog and `/vision/` carry no global tool CTA; "Xem kết quả" is untouched.
- Desktop panels (review repair) are capped at `max-h-[calc(100dvh-7.5rem)]` with
  `overflow-y-auto overscroll-contain`, like the mobile panel, so every link stays
  reachable on a short window such as 1280×500 (not browser-measured here).
- Mobile: the hamburger opens the same three entries in the same order as accordions,
  then Hỗ trợ (and the CTA on `/` only). The panel has `max-h-[calc(100dvh-7.5rem)]`
  with its own scroll; rows are `min-h-11` (44 px).
- App mode: the wrapper keeps `data-finhome-site-chrome="header"`, which
  `html[data-finhome-app="true"]` hides. Logo, fonts, colours and URLs are unchanged.

## Mechanisms

- Data: `content/site.ts` — `PRIMARY_NAV`, `UTILITY_NAV`, `NAV_LINKS` (flattened). The
  old flat `NAV_ITEMS` is gone. Tool links are real live routes; `content/site.test.ts`
  pins each to a live registry entry and an `app/cong-cu/<slug>/page.tsx`.
- Disclosures are `<button aria-expanded aria-controls>` over a panel with the `hidden`
  attribute while closed (so closed links are not in the tab order). No `menu` roles.
  Escape closes and returns focus to the trigger (or to the hamburger on mobile);
  pointer-down outside `[data-nav-keep-open]`, tabbing out of a panel, choosing a link
  and a route change all close. The transition logic is `navMenuTransition` (exported,
  pure).
- Active state: `aria-current="page"` on the exact route, `"true"` inside a section
  (e.g. an article under Bài viết); group triggers carry `data-active` and the active
  style. Inside a panel only the exact page is marked.

## The lint baseline constraint

`scripts/check-lint-baseline.mjs` keys two pre-existing `react-hooks/set-state-in-effect`
problems by line: `components/site-header.tsx:52` and `:83`. They are preserved, not
fixed. Lines 1–86 of the header keep their positions (only the import on line 13
changed); all new code is below the marked comment. Moving those lines turns
`check:lint` red; fixing them needs a separate, approved baseline update.

## Checks run here

`components/site-header.test.ts` (new; server-rendered markup + `navMenuTransition`),
`content/site.test.ts` and `content/cta.test.ts` (assertions restated on the new
shape), related suites (`content`, footer, calculator page, `app`) — pass; `tsc
--noEmit` clean; `check:lint` 3 baseline / 0 new.

## Initial implementer handoff (before the independent checks above)

- Nothing was observed in a browser: layout at 1280 px and wider (5 entries plus CTA
  in the pill), the panel position, mobile accordion and scroll on a short screen,
  focus rings, touch targets, overflow.
- No jsdom here: real key presses, focus moves and pointer events are not exercised
  by tests — only the transition they call. Escape focus restore, outside click and
  blur-to-close need a browser check.
- No screen-reader pass.
