# Floating-rate learning release — 2026-09-30

Scope: `/cong-cu/lai-suat-tha-noi/` only. Reuses the existing mortgage context
art, canonical `compareRateStress` schedules and learning controls. No engine,
formula, default, dependency, header or shared formatter changes.

## Interaction contract

- Month selection observes the existing schedule; it never changes loan inputs.
- Principal and interest divide the selected monthly payment, not the loan.
- Boundary comparisons use one zero-based scale. Budget is user supplied,
  never inferred; missing budget is neutral, over-budget is red, within is green.
- Stress radios are non-accumulating selections. Art is context, not evidence.
- Invalid fields, calculation limits, money-display limits and rate-display
  limits remain distinct. Whole-tool results/chart withhold unavailable numbers
  instead of blaming valid inputs. Recovery buttons focus the responsible fields.
- One results live region remains. Keyboard month control and existing results
  anchor are retained. No data is transmitted through URLs.

## Independent verification

Claude retained implementation ownership; Codex integrated reviewed source
patches unchanged and independently verified the isolated release checkout.
Claude's denied test/release-directory actions were not retried or overridden.

Full native project gate completed 2026-09-30 11:37:23 UTC: 355 test files,
7,874 tests, TypeScript, lint with 3 existing/0 new findings, static build of
301 pages, and rendered contracts passed. Local `VITEST_MAX_WORKERS=3` bounded
resource contention; no assertions, timeouts or CI configuration were weakened.
Focused learning tests: 64 passed. Independent recurrence/closed-form probe:
100 comparisons across 7 arithmetic fixtures and 7 limit/recovery fixtures.
Default remote CI and preview remain separate release gates.

Actual exported UI checked at 320, 390 and 1440 px. Covered promo boundary
12→13, keyboard month 13→14 without changing inputs, stress +2 points,
budget 20M (3.89M remaining at month12; 479,346 VND over at month13),
correct CTA focus, one live region and no observed horizontal overflow.
At 320 px, 1e24 amount / 1e19 budget recovery focuses budget correctly;
1e308 model limit and 1e19 rate limit no longer display false input-error
chart text or currency/rate placeholders in results. Advanced rate-field
recovery was verified to open its disclosure and focus its field.
Fresh browser console returned no errors or warnings.

Local evidence in owner checkout `.runtime/`: `floating-release-native-check.json`,
`floating-release-independent-repaired.mjs`, `floating-final-320.png`,
`floating-final-1440.png`. These are local observations, not production proof.

## Limitations and release boundary

Physical devices, VoiceOver and OS reduced-motion behavior are unverified.
The existing advanced-settings summary may echo a percent placeholder for
extreme step/cap inputs at or above 1e18; the result/lesson/chart instead name
the limit and offer recovery. No claim of whole-suite acceptance is made.
Production deployment and public smoke must be recorded after exact-head merge.
Other unfinished source tools are intentionally excluded and preserved.
