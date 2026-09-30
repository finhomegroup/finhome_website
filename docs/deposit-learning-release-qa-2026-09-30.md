# Term-deposit learning release QA — 2026-09-30

## Scope and ownership

Route: `/cong-cu/tien-gui-co-ky-han/`. Integrates the retained implementation owner's deposit learning adapter, panel, educational content and tests from the ongoing preview checkout. Canonical term-deposit and actual-day deposit-plan engines, defaults, dependencies, CI and site header are unchanged. Existing savings artwork is reused. Other unfinished tools are excluded.

The two shared render contracts add only this route to their illustrated-tool allowlists. Seven product/content/test files match the reviewed preview source byte-for-byte. Integration and checks below were independently performed in the isolated release checkout on `feat/release-deposit-learning-20260930`, based on `89669a092e5756332ece855e883f08f927fcfcf2`.

## User behavior

- Timeline distinguishes maturity dates from the date money is needed; does not invent monthly balances.
- Presets change the real withdrawal month or need date. Undo restores the last trial; manual edits/mode changes retire stale undo.
- Both months/12 estimates and actual-day/365 planning are explained. Interest already paid along the way is not presented as a new final payout.
- Invalid fields, model limits and display limits have distinct recovery states and suppress misleading quantitative graphics.
- Date renewal capital includes prior interest once; available cash and newly paid cash remain distinct.

## Independent numeric verification

130 comparisons across 19 fixtures passed: 12 term fixtures covering three payout modes, compound on/off, zero/positive interest and partial early withdrawal; six actual-day fixtures around first maturity with renewal on/off; one leap-year fixture. Reference calculations independently use geometric sums and UTC day counts. The checks include principal, earned interest, renewal capital, early/same-horizon interest differences, event placement and display refusal for oversized values. Tolerance is 0.01 dong or relative 1e-10, not relaxed for failures.

## Required gate

`aiws native check` equivalent native API full mode ran against this checkout, not the registered dirty source root. Final full gate passed at 2026-09-30T10:34:16Z: **353 files / 7,810 tests**, TypeScript, lint baseline (3 existing / 0 new), Next.js static build (301 pages), rendered contracts (76 live calculator and 215 non-calculator pages).

Qualification: two default local runs hit five-second import timeouts in `components/navigation-map.test.ts` and `components/sections/app-download-preview.test.ts`. Both passed independently (27 tests). The full passing run used the existing supported environment setting `VITEST_MAX_WORKERS=3`. No timeout, assertion, suite, CI configuration or dependency was changed. Remote default CI and Vercel checks remain required before merge.

## Live static-build browser verification

Actual exported build served on loopback port 3241, with 1440×1000, 320×800 and 390×844 viewports. No horizontal document overflow observed; illustration loaded; fresh tab console returned no errors/warnings.

- Default 500M / 5.5% / 12 months: full value 527.5M; withdrawal at month 9 earns 750k versus 20.625M term-equivalent interest. End-of-plan preset removes the gap; undo restores month 9. Results CTA focuses its existing results anchor.
- 320 px: supported 1e17 principal remains inside the viewport; 1e20 receives a named display-limit state. Higher demand rate correctly labels a positive early-interest difference, not a negative loss. Manual edit retires trial undo.
- Date mode: Jan 31 to Jul 31/Aug 1, with renewal off/on, correctly distinguishes earlier paid interest, renewed capital and newly available cash. The one-day 564-dong increment is retained in exact impact values.
- 390 px: invalid day 32 suppresses quantitative illustration and fix action focuses the invalid field. Term beyond 1,200 months shows the model limit. A far-future need date shows the 120-cycle limit and omitted-event count; a valid preset recovers.
- Quarterly payout with five-month term shows the engine's divisibility limit; six-month / three-cycle quarterly case explains six prior payouts and the inert compounding option. Keyboard activation of date presets works.

Screenshots and machine receipts are retained in the ongoing preview checkout's ignored `.runtime/deposit-release-*` files; no personal financial data was used.

## Limits and release gate

These are independent calculation and browser checks, not bank-contract validation or user-comprehension research. Physical devices, VoiceOver speech and OS reduced-motion behavior were not tested in this release. Existing payout/clawback and rate assumptions remain explicit; no new legal/rate claims are introduced. Public production verification follows only after exact checked-head merge and successful deployment; passing this document does not itself prove deployment.
