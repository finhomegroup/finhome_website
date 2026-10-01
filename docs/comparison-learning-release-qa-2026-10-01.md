# Comparison living-infographic release verification — 2026-10-01

## Scope and ownership

Routes: `/cong-cu/so-sanh-khoan-vay/` and
`/cong-cu/lai-co-dinh-hay-tha-noi/`, sharing `LoanCompareCalculator`.
Claude owns the implementation and repair; Codex independently reviewed,
integrated and verified the isolated release checkout. Base: main
`96ce98a66bdaf2aa2793cc63227b1734414c482e`. No new financial formula,
dependency, network request, persistence or default scenario was introduced.

The 3D scene provides context. Three independently named 2D scales show monthly
payments, interest plus fees to a chosen month, and principal still owed.
The horizon slider and four keyboard-accessible buttons write the existing form
field. Exact ties are explicit. Unknown fees withhold fee-dependent conclusions
without hiding ordinary fee-independent payments and debt.

## Release-blocking repair, now verified locally

The first candidate confidently ranked amounts beyond display capacity and could
crash on overflowing fees. The final candidate uses a single whole-tool limit:
no ranking, spread, chart, table, APR or scene readings are printed when the
comparison exceeds display or numeric capacity. Recovery names causal fields
where known, otherwise asks the reader to review assumptions. Invalid syntax
retains its field error; numeric refusal is not mislabeled invalid input.

The legacy cost chart now includes the horizon exit fee as its own segment and
table column; its total equals principal plus the modeled horizon cost.

## Executed proof after final application

- Full registered-project native check, actual execution root
  `finhome-tool-releases-20260930`, completed 2026-10-01T00:46:59Z, exit 0.
  362 test files / 8,083 tests; TypeScript; lint baseline 3, new problems 0;
  309-page static build; markup contracts: 76 live calculators, 0 planned,
  223 non-calculator pages. Counts are this run's output, not a permanent total.
- Independent discounted-payment and monthly-ledger probe: 12 fixtures,
  300 numeric comparisons passed. Covers zero rates, horizon 0, ties, fees,
  different terms, maturity, exit fees, promotional reset and three offers.
- Final static export served locally on port 3241, not the user's 3240 preview.
  Measured 1440x1000, 390x844 and 320x844 viewports. Inspected screenshots;
  document scroll width equals viewport width at each measured size.
- Offers: result CTA focuses the existing result anchor; horizon 60→72 updates
  form and lanes; month 0 gives an explicit tie; unknown-fee A withholds rankings
  while preserving monthly/debt readings; unchecking restores ranking.
- At 320px, keyboard ArrowRight changes horizon 60→61 and the form follows.
  Four step buttons measure at least 44px high and labels wrap inside them.
- Amount 1e19 produces a coherent display refusal and named amount recovery;
  recovery focuses the amount field without falsely setting aria-invalid.
  Restoring 2 billion restores comparison results.
- Fixed/floating: horizon 12→24 changes costs; at 24, B costs 361,948,206 VND,
  11,541,839 VND below A. Payment lane explicitly changes B from 16.11 million
  to 20.48 million beginning month 13, under the entered scenario.
- Fee percent 1e308 produces numeric refusal without crashing; concurrent
  invalid A rate keeps its own field error. Restoring both returns normal output.
- Next-tool link opens floating-rate calculator, browser Back returns to
  fixed/floating. UI explicitly says inputs are not transferred or stored.
  Observed browser console error log empty during this final path.

Local raw receipts and screenshots remain in the source checkout's ignored
`.runtime/comparison-release-*` artifacts; these are not required by CI.
Two previously existing illustrated-route test memberships were integrated
without removing the already-released deposit membership.

## Boundaries and release gates

This is scoped visual/functional evidence, not an external accessibility audit,
bank quote validation or completion of the entire calculator suite. No browser
test proves all possible numeric inputs. Existing calculator tests and the
single refusal mechanism cover additional edge cases.

At preparation of this note, remote PR CI, deployment preview, merge and public
production smoke are pending. Only merge the exact reviewed head after green
remote checks; verify deployment and both public routes separately.
