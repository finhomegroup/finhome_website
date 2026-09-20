# finance-core conformance: does `lib/calc/` agree with the canonical engine?

Run 2026-09-20. Two answers, and the second one matters more:

- **The arithmetic agrees.** The TVM primitives (`pmt`/`pv` versus the engine's annuity and
  loan-from-payment) match to a rounding convention. No numeric reconciliation is needed.
- **The underwriting does not.** At the pipeline level the two diverge by up to **+117%** on this
  site's side, and they diverge *only* when the household has existing debt. The cause is a single
  policy difference in where debt enters the ratio test — not a defect, and not something a
  refactor can resolve.

This exists because `AGENTS.md` records that the affordability / capacity / amortization / annuity /
APR modules in `lib/calc/` duplicate the canonical FinHome engine, and the architecture plan requires
comparing on fixtures *before* deleting anything. A disagreement would be a real defect — a customer
seeing one affordability figure on the website and another in the app. It turns out there is a
disagreement, and it is deliberate on both sides.

## What was compared

The primitives both codebases independently implement:

| Website | Canonical engine |
| --- | --- |
| `pmt(rate, periods, present)` in `lib/calc/finance.ts` | `calculateAnnuityMonthlyPayment(principal, annualRate, years)` |
| `pv(rate, periods, payment)` in `lib/calc/finance.ts` | `loanFromPayment({ method: 'annuity', paymentCap, annualRate, loanTermYears })` |

Grid: rates `0, 3, 6, 8.5, 11, 14`%; terms `5, 10, 15, 20, 25, 30` years; principals
`300M, 1B, 3B, 7.5B` VND; payment caps `10M, 20M, 50M` VND.

## Result

| Direction | Cases | Max absolute delta | Max relative delta | Cases beyond rounding |
| --- | --- | --- | --- | --- |
| Payment from loan | 144 | 0.4976 VND | 4.00 × 10⁻⁵ % | **0** |
| Loan from payment | 108 | 0 VND | 0 % | **0** |

The sub-đồng delta in the first direction is fully explained: the engine applies `Math.round` to whole
đồng, the website's `pmt` returns an unrounded float with the opposite sign convention
(outflow-negative). Same formula, different output contract. The inverse direction is bit-identical.

## Pipeline comparison: they diverge, and it is a policy difference

Run 2026-09-20, after the primitive comparison above. **The two answer the same question under
different underwriting conventions.** This is not a bug on either side, and it is not a rounding
artifact — it is a product decision with a user-visible consequence.

Monthly housing payment each side says a household can carry, VND millions, at 36% / 8.5% / 240
months:

| Household (income / expenses / debt) | Engine | Website | Website vs engine |
| --- | --- | --- | --- |
| 25 / 10 / 0 | 9.00 | 9.00 | — |
| 30 / 3 / 0 | 10.80 | 10.80 | — |
| 40 / 15 / 3 | 11.40 | 14.20 | **+24.6%** |
| 60 / 20 / 5 | 16.60 | 20.80 | **+25.3%** |
| 120 / 35 / 10 | 33.20 | 41.60 | **+25.3%** |
| 50 / 18 / 15 | 3.00 | 6.50 | **+116.7%** |

**They agree exactly at zero existing debt, and diverge as debt rises.**

### The cause, proven rather than inferred

For income 50M, expenses 18M, existing debt 15M — both formulas reproduce their reported output:

| | Engine | Website |
| --- | --- | --- |
| 36% applied as | back-end cap, **existing debt subtracted**: `50×0.36 − 15 = 3.0` | front-end on housing alone: `50×0.36 = 18.0` |
| second test | residual: `50 − max(18,7) − 15 − 0.2×50 = 7.0` | back-end incl. debt: `50×0.43 − 15 = 6.5` |
| result | `min → 3.0` | `min → 6.5` (`bindingLimit: "totalDebt"`) |

So the single divergence is **where existing debt enters the ratio test**. The website uses the
standard two-ratio mortgage convention — a front-end ratio on housing and a back-end ratio on total
debt service. The engine treats its 36% as a single back-end cap and subtracts existing debt from it.

Both are defensible. The engine is materially more conservative for indebted households, and
identical for debt-free ones.

### What is NOT the cause

Three engine mechanisms that look like they should drive this do not, in this grid:

- **`min(ratioCap, residualCap)`** — the website's `household` mode also takes a minimum, adding
  `householdResidual` on top of both ratios. Same structure, not a difference.
- **`EXPENSE_FLOOR` (7M)** and **`LIFE_EVENT_BUFFER_RATIO` (0.2 × income)** — real, and absent from
  the website, but `residualCap` never binds in any row above (7.0M vs a 3.0M ratio cap in the worst
  case). They are latent here, and would bind for a household with high reported expenses relative
  to income.

### Consequence for the migration

Adopting the engine on this site would **lower the affordability figure shown to indebted
households** — by about a quarter in the common case and by half for the debt-heavy case above. That
is a change to what the public site tells people they can afford, so it needs an owner decision, not
a refactor. Three options: adopt the engine's convention, keep this site's convention and have the
engine expose it as an option, or converge on one agreed policy first.

Also note `computeAnnuity` in `lib/calc/annuity.ts` is **not** a duplicate despite the name overlap.
It takes `premium`, `deferralYears`, `taxRatePercent` and `paymentAtStart` — a general annuity
instrument calculator, closer in kind to `black-scholes` or `bond` than to mortgage amortization. It
belongs to the generic-instruments group that stays owned here.

## Reproducing

The engine's package emits ESM with extensionless relative specifiers, which **Node cannot execute**
(`ERR_MODULE_NOT_FOUND`) — fine for Next.js and Metro, which resolve extensionless, but it means the
harness compiles the engine to CommonJS first. Both sides were compiled to CJS into a scratch
directory and required from a plain Node script; no repository files were modified.

## Why the migration has not happened

`@finhome/finance-core` is **not published**. It lives in the `finance-core/` directory of the
`finhome_reactnative` repo, and this is a separate repository with its own CI, so consuming it needs
a registry: git dependencies do not address subdirectories, a `file:` link would break Vercel builds,
and vendoring would recreate the duplication this is meant to remove.

Publishing needs a token with `write:packages`. That is the single blocker.
