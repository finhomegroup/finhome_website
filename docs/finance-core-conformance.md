# finance-core conformance: does `lib/calc/` agree with the canonical engine?

Run 2026-09-20. **Yes, at the TVM primitive level.** No numeric reconciliation is needed before
migrating the affordability family.

This exists because `AGENTS.md` records that the affordability / capacity / amortization / annuity /
APR modules in `lib/calc/` duplicate the canonical FinHome engine, and the architecture plan requires
comparing on fixtures *before* deleting anything. A disagreement here would be a real defect —
a customer seeing one affordability figure on the website and another in the app.

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

## What was NOT compared, and why it matters

This covers the **primitives, not the pipelines.** `computeAffordability` here and
`affordability-pipeline` in the engine have different APIs and different semantics — this module runs
two modes (`ceiling` on gross income, `household` on net income less expenses and buffer) and reports
a `bindingLimit`, while the engine produces a scenario assessment with decision tiers. Comparing
those requires mapping inputs between the two shapes and is a separate exercise.

So: the arithmetic agrees. Whether the two produce the same *verdict* for the same household is still
unverified, and that is the comparison that matters most for the consolidation.

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
