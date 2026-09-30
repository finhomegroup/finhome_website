# Commercial affordability living infographic — release QA

Scope: `/cong-cu/kha-nang-mua-nha/` only. Initially extracted on `459c1fde`
(PR219), then fast-forwarded to `a63daa9` (PR222) before final verification.
The intervening content/auto journey changes are preserved, not part of this PR.
Claude Opus session `3a242ee1-c6e7-4bb2-9ce3-d79a96459626` retained implementation
and repair ownership. Codex integrated the six staged candidate files unchanged
and independently checked the numeric, rendering and browser behavior.

## Mechanism and boundary

- Existing learning panel moves into the result column after the primary answer
  and before actions/charts. Its controls remain beside the figure they change.
- Context illustration has no numbers painted on it. One HTML bar divides the
  reference price into own money and loan; another divides savings into money
  used for the price, purchase costs, unused cash and the reserve actually kept.
- Desired reserve greater than savings is disclosed separately; it is not drawn
  as more money than exists. Cash-only, unknown expenses and no-price states are
  explicit. Figures come from the existing engine, whose formulas are unchanged.
- Display/model limits withhold unsupported results consistently across scene,
  rows, CTA, charts, comparison and trial impacts, with named field recovery.
- NOXH changes, statutory/eligibility copy, new dependencies, defaults, canonical
  engines, header, other unfinished tools and later source work are excluded.

## Independent verification

- Separate discounted-payment-sum probe: 12 fixtures, 96 numeric comparisons;
  ten ready scenes. Named price and savings totals reconcile independently.
  Examples cover reserve, fees, financing ceiling, zero rate, no cash, no loan
  and unknown expenses.
- NOXH SSR parity: six ordinary/missing/invalid/cash-only/reserve/no-cash states
  match the pre-integration baseline, normalizing only generated React ID tokens.
  The baseline modules still reproduce the original six SHA256 receipts. Exact
  raw candidate hashes differ because moving the conditional panel changes React
  tree IDs; this is not a visible content change. Additional owner regression
  preserves NOXH's existing extreme housing-cost summary.
- Temporary root parity fixtures were moved out of product paths after running;
  source `.runtime/affordability-independent-fixtures/` retains them for audit.
- Initial full gate: 355 files / 7,913 tests passed; TypeScript found a new test's
  missing `FormValues` annotation. Owner repaired it without changing assertions.
  Subsequent full gate passed tests, TypeScript, lint (3 baseline / 0 new), 301-page
  static build and rendered markup. Final gate after the last copy regression is
  recorded in the release update below.

## Actual exported UI, not test-derived appearance

Served isolated release `out/` on loopback3241; source preview3240 untouched.
Observed 1440×1000, 390×844 and 320×844 using synthetic inputs:

- Reserve trial0→50M changes price2,674,155,117→2,624,155,117VND with loan
  unchanged; undo restores. Rate8.5→9.5 changes price to2,531,058,657VND.
- Manual edits retire undo. Desired reserve700M from600M savings draws600M,
  explains700M desired. Separate scales, legends and intrinsic3:2 art remain
  readable; no observed horizontal page overflow. Controls have at least44px
  outer touch height. No numbers are overlaid on the image.
- Result CTA focuses `kha-nang-mua-nha-ket-qua` (observed top277px at320).
  This route retains answer-before-learning; mortgage/auto visual-first cards
  released earlier are untouched.
- Savings10^19 produces coherent display refusal and disabled trials; recovery
  focuses `down`. Ceiling income10^308 produces model refusal and focuses
  `income`. Oversized advanced housing costs recover by opening the disclosure
  and focusing `housingCosts`.
- Blank essentials produces limited/unknown conclusion, not a false zero or safe
  budget. Restoring inputs restores the scene. Target3B with fees5%, LTV70%,
  reserve100M yields price1,428,571,429, actual loan1B, actual payment8,678,232
  versus18M capacity and a1,571,428,571 price gap, explicitly not a cash gap.
- Captured comparison baseline remains through a display limit. Recovering with
  savings650M compares price2,674,155,117→2,724,155,117, delta50M.
- One result announcement region reports the settled trial/conclusion. Existing
  NumberField help/error live regions remain separate; this is not a claim that
  the entire page contains only one `aria-live` element. No console errors or
  warnings were observed in the test tab.
- Combined invalid target plus display limit originally claimed all fields were
  valid. Owner removed that claim from both limit reasons and added regression;
  final export re-observation is recorded below.

Screenshots retained locally: `affordability-release-1440.png`,
`affordability-release-390.png`, `affordability-release-390-scene.png`,
`affordability-release-320.png` in the source checkout's `.runtime/`.

## Release update and limits

Final full native gate completed 2026-09-30 17:21:58 UTC on base `a63daa9`:
358 files / 7,978 tests, TypeScript, lint 3 baseline / 0 new, 309-page static
build and rendered markup all passed. Local workers were bounded to three;
unchanged default remote CI must pass independently. The numeric probe and
NOXH parity were rerun after the base update and passed.

Final export at 320px re-observed the combined invalid-target/display-limit case:
the target remains invalid, CTA focuses it, and the new limit reason no longer
claims every field is valid. No horizontal overflow observed. Code and assertions
match the retained owner's staged candidates byte-for-byte.

PR, remote CI/preview, merge and production pending at this commit.
No whole-suite readiness claim. Physical devices,
VoiceOver/user comprehension and production runtime logs are not established by
this local evidence. Existing NOXH eligibility/legal review remains separate.
