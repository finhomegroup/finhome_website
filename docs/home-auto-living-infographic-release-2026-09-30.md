# Home and auto living-infographic release

## Scope and authority

The user authorized incremental PRs and merge for release after each completed tool on
2026-09-30. Release a verified tool, or a tightly coupled group with its shared
dependencies; do not include unfinished tools or bypass failing CI. This first group
is `/cong-cu/vay-mua-nha/` and `/cong-cu/vay-mua-xe/` only.

Implemented by the retained Claude session; independently integrated and verified in
`feat/release-home-auto-learning-20260930`, based on main `1872cbf`.
The ongoing suite preview remains separate. No financial engine, dependency,
deployment configuration or article changes are included.

## Behavior

- Desktop keeps the form left and results right. The living infographic is first
  inside the result card, before status and exact figures, not a detached section.
- Valid “Xem kết quả” presses focus and scroll to the card top. Invalid presses
  return to the first invalid input. Reduced motion explicitly requests instant
  scrolling instead of inheriting global smooth scrolling.
- Home: inspect principal, interest and remaining debt by month; try a longer term
  or extra payment and undo. The picture is illustrative, not a valuation.
- Auto: distinguish monthly cash flow from upfront payment, try changes and undo;
  missing operating costs remain an explicit warning. Debt is not resale value.
- Controls stay outside the single result announcement region. Shared numeric
  wrapping prevents long amounts from escaping result rows.

## Verification

Full project-native check in the isolated release checkout completed at
2026-09-30 07:11:10 UTC, exit 0:

- 342 test files, 7,650 tests passed.
- TypeScript passed; lint baseline reports 3 expected problems, 0 new.
- Static production build passed.
- Built markup contracts passed for 76 live calculator pages and 214 other pages.
- Additional focused release check: 281 tests passed across 8 files.

Independent browser review used this checkout's static `out/` export on loopback
port 3241, not the development server. Both routes were observed at 1440 × 1000
and 390 × 844: images loaded, no page-level horizontal overflow, visual inside the
card before numeric rows, valid CTA focused its result anchor, one result live
region. Auto trial changed down payment 300 → 350 million and remaining monthly
cash approximately 3.5 → 4.6 million; undo restored 300 million. Invalid price 0
showed an unknown repayment rather than a false zero; recovery restored results.
Home term trial changed 20 → 25 years and undo restored 20; final-month inspection
showed month 240 with zero debt. Blank principal focused the invalid field;
recovery restored the computed result.

Limits: these are bounded desktop-browser viewport observations, not physical-device,
screen-reader speech, OS reduced-motion or user-comprehension tests. Local green
checks do not establish production deployment. CI and actual merge/deployment state
must be checked separately before reporting release.

## Release discipline

Create the scoped PR, wait for its checks to pass, recheck the head SHA and merge
without bypassing branch protections. Keep subsequent tool groups in separate PRs.
Retain the active suite preview and local QA artifacts until their work is integrated;
they are not production assets. Reuse the clean release checkout for the next group.
