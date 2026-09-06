# Full Calculator Suite — Project Decomposition

**Date:** 2026-09-06
**Status:** Decomposition for review — NOT an implementation spec
**Goal:** Reach parity with the ~77 calculators on `fncalculator.com`, on `finhome.group`, in Vietnamese, on FinHome's design system.

---

## Why this document exists

`docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md` covered one calculator and produced 11 commits. That calculator is the **simplest tool on the reference site**: one input, two scalar outputs, no table, no numeric solver, no external data.

The remaining ~76 are not 76 repetitions of it. They span six structurally different shapes, two of which need numeric routines the repo does not have, and one of which needs data the repo cannot obtain on a static export. A single spec covering all of them would be a spec in name only.

This document decomposes the work into **nine sub-projects**, each of which gets its own spec → plan → implement → review cycle, and each of which is independently mergeable and independently useful.

## Inventory by shape

Shape classes, in rising order of what they demand from the shared foundation:

| Class | Meaning | Foundation demand |
|---|---|---|
| **S** | 1–3 numeric inputs → 1–4 scalar outputs | What Rule of 72 already proves |
| **M** | 4–10 inputs, grouped sections, selects/radios/unit toggles, several output groups | Field config, grouped layout, non-text input types |
| **T** | An **M** plus a generated per-period schedule | Table rendering, pagination or collapse, CSV-free but scannable |
| **N** | Needs a numeric routine: root-finding or a statistical function | New tested math primitives (bisection/Newton, normal CDF) |
| **V** | Solves for any one of N variables | Inverse-solve dispatch, per-target validation |
| **D** | Needs external or reference data | **Architectural blocker — see below** |

### Finance and Investment (14)

| Calculator | Class |
|---|---|
| Rule of 72 Calculator | **S — DONE** |
| Return On Investment (ROI) Calculator | S |
| Tax Equivalent Yield Calculator | S |
| Compound Interest Calculator | M |
| Savings Goal Calculator | M |
| Certificate of Deposit (CD) Calculator | M |
| College Savings Calculator | M |
| Investment Income Calculator | M |
| Mutual Fund Fee Calculator | M |
| US Health Savings Account Calculator | M (US-specific) |
| TVM Calculator | V |
| IRR NPV Calculator | N (root-finding) |
| Bond Calculator | N (YTM root-finding) |
| Currency Converter | **D (live FX)** |

### Loan/Mortgage (16)

| Calculator | Class |
|---|---|
| Loan Calculator | T |
| Loan Comparison Calculator | M |
| Loan Refinance Calculator | T |
| APR Calculator | N |
| APR Advanced Calculator | N |
| Commercial Loan Calculator | T |
| Loan Analysis Calculator | T |
| Home Affordability Calculator | M |
| Rent vs Buy Calculator | T |
| Mortgage Tax Saving Calculator | M (US tax) |
| Discount Points Calculator | M |
| Adjustable Rate Calculator | T |
| Fixed vs Adjustable Rate Calculator | T |
| Bi-weekly Payment Calculator | T |
| Interest Only Calculator | T |
| Rental Property Calculator | T |

### Retirement (14) — all US-specific

Retirement Planner, 401k Contribution, 401k Save the Max, Retirement Savings Analysis, Retirement Income Analysis, Traditional IRA vs Roth IRA, Required Minimum Distribution (RMD), Asset Allocation, Retirement Income, Retirement Calculator, Annuity Calculator → **T/M**.
Social Security Estimator, Social Security Analysis, Social Security Distribution → **D** (US benefit formulas, bend points, wage-index series).

### Stock (12)

Stock Return and Capital Gain, Stock Constant Growth, Stock Non-constant Growth, CAPM, Expected Return, Holding Period Return, Weighted Average Cost of Capital → **S/M**.
Black-Scholes Option Calculator → **N** (normal CDF). Pivot Point, Fibonacci → **S**. Dividend Tax → **M (US tax)**. Commodities and Futures → **D (market data)**.

### Credit Card (2)

Credit Card Payoff Calculator → **T**. Credit Card Minimum Calculator → **T**.

### Auto Loan and Lease (2)

Auto Loan Calculator → **T**. Auto Lease Calculator → **M**.

### Miscellaneous (17)

Percentage, Tip, Discount and Tax, Margin and Markup, Effective Rate, Hourly to Salary, Salary Increase → **S**.
Business Forecast, Fuel, Net Distribution, Balance Sheet and Income Statement Analysis, Financial Ratios → **M**.
US Treasury Bill → M (US-specific). Date Calculator → **D** (needs a real clock — see note). Unit Conversion → **D** (large factor table). US Inflation Calculator → **D** (CPI series). US Paycheck Tax Calculator → **D** (federal + 50 state tables).

### Totals

| Class | Count |
|---|---|
| S | 17 (1 done) |
| M | 22 |
| T | 17 |
| N | 6 |
| V | 2 |
| **D (blocked or data-dependent)** | **11** |
| ≈ total | 77 |

## The one genuine blocker: class D

Eleven calculators cannot be cloned as client-side arithmetic. `next.config.ts` sets `output: "export"` — there is no server, no API route, no scheduled revalidation. Each D calculator needs a decision:

| Calculator | What it needs | Options |
|---|---|---|
| Currency Converter | Live FX rates | (a) client-side call to a third-party API — exposes a key in the bundle and puts us under their ToS; (b) build-time snapshot — visibly stale, and wrong rates on a bank-adjacent site are a real problem; (c) **omit** |
| Commodities and Futures | Live market data | Same three, same objection, higher stakes |
| US Inflation Calculator | CPI-U series | Vendored static dataset (legitimate — it's historical and revised rarely) |
| US Paycheck Tax | Federal + state tax tables | Large vendored dataset, obsolete every tax year |
| Social Security ×3 | US benefit formulas, bend points, wage indexes | Vendored, annual maintenance, and **entirely inapplicable to Vietnamese users** |
| Dividend Tax, Mortgage Tax Saving | US tax brackets | Vendored, annual maintenance |
| Unit Conversion | Conversion factor table | Vendored static table — genuinely fine |
| Date Calculator | Current date | Needs `new Date()`, which collides with the hydration determinism rule the suite is built on. Solvable (compute in an effect after mount), but it is the one calculator that must break the existing pattern |

**My recommendation, which you should overrule if you disagree:** vendor the static datasets (inflation, unit conversion, tax tables), special-case the Date calculator's clock, and **omit the two live-data calculators** (Currency Converter, Commodities and Futures) rather than ship rates that are either stale or dependent on an unowned third-party key. If you want those two, the honest version is a page that clearly labels the data source and its timestamp.

## The US-specific question, recorded

You chose full parity after I flagged it, so this is not a re-litigation — it is the record of what ships and the mitigation I'm committing to.

**29 of the 77** are governed by US tax or US retirement law: the 14 retirement calculators, US Paycheck Tax, Mortgage Tax Saving, Dividend Tax, US HSA, US Treasury Bill, US Inflation, Social Security ×3, Traditional vs Roth IRA, RMD, 401k ×2, Net Distribution.

**Mitigation:** every one of these carries a prominent notice, above the calculator rather than buried at the bottom, stating the tool models United States tax and retirement rules and does not apply to Vietnamese users or to Vietnamese tax and social-insurance law. They are also excluded from the sitemap's high-priority tier and from any FinHome-branded internal linking, so we don't actively drive Vietnamese users into them.

## Sub-projects

Each is a separate spec → plan → implement → review cycle. Each ends mergeable.

### SP-0: Foundation and hub — **do this first**

The current Rule of 72 page hard-codes its own card, label, help text, live region, and result rows. Copying that 76 times would copy every future bug with it, and the final review of the Rule of 72 branch specifically warned that the accessibility wiring is what wants extracting before the pattern is duplicated.

Scope:
- A config-driven calculator shell: field definitions (number, select, radio, unit-toggle), grouped sections, result groups, and the accessibility wiring (label/`id` pairing, `aria-describedby`, `aria-invalid`, one `aria-live` region, the validation-message live region the final review added) in exactly one place.
- A results-table component for class T.
- Shared numeric primitives with tests: bisection/Newton root-finder, normal CDF, annuity/present-value/future-value helpers, period-count and compounding-frequency conversion.
- A shared disclaimer component, with the US-specific variant.
- `/cong-cu/` hub page: all calculators by category, searchable, which also fixes the current hard 404 at that path.
- A registry so the hub, sitemap, and cross-links derive from one list instead of three.
- **Retrofit Rule of 72 onto the shell**, proving the abstraction against a known-good, fully-tested case before 76 more depend on it.

Justification for building the framework now, having explicitly declined to earlier: at one calculator it was speculative. At 77, with six known shapes and the two hardest already surveyed, it is the opposite of speculative.

### SP-1: Simple calculators (16 remaining, class S)

Fastest visible progress and it stress-tests the shell's simplest path. ROI, tax-equivalent yield, percentage, tip, discount and tax, margin and markup, effective rate, hourly to salary, salary increase, CAPM, expected return, holding period return, WACC, stock constant growth, pivot point, Fibonacci.

### SP-2: Loan and mortgage (16, mostly class T)

The category that matters most for FinHome's actual product and Vietnamese search intent. Delivers the amortization table, which SP-0 must have designed for.

### SP-3: Savings and investment (11, class M/N)

Compound interest, savings goal, CD, college savings, investment income, mutual fund fee, IRR/NPV, bond, TVM, TVM advanced, stock non-constant growth. Exercises the root-finder and the solve-for-any-variable dispatch.

### SP-4: Credit card and auto (4, class T/M)

Small, self-contained, high everyday utility.

### SP-5: Retirement (14, US-specific)

Gated behind the US-notice component from SP-0. Largest block of tools inapplicable to the audience, so it is deliberately late.

### SP-6: Remaining stock and misc (11)

Black-Scholes (needs SP-0's normal CDF), dividend tax, business forecast, fuel, net distribution, balance sheet analysis, financial ratios, US Treasury Bill, US HSA, RMD-adjacent leftovers.

### SP-7: Vendored-data calculators (5)

Unit conversion, US inflation, US paycheck tax, date calculator, Social Security ×3 — each with its dataset, its provenance note, and its staleness policy.

### SP-8: Suite-wide finish

Cross-linking between related calculators, hub search, sitemap priority tiers, per-calculator `WebApplication` + `FAQPage` structured data at scale, and a single pass to confirm no calculator ships without its disclaimer.

## Sequencing

```
SP-0 (foundation + hub + retrofit)   <- blocks everything
  ├─ SP-1 simple (16)
  ├─ SP-2 loan/mortgage (16)
  ├─ SP-3 savings/investment (11)
  ├─ SP-4 credit card + auto (4)
  ├─ SP-6 stock/misc (11)
  └─ SP-5 retirement (14, US-gated)
        └─ SP-7 vendored data (5)
              └─ SP-8 suite-wide finish
```

SP-1 through SP-6 are mutually independent once SP-0 lands, so their order can follow whatever you want live soonest. My recommendation is SP-2 immediately after SP-0, ahead of the easier SP-1, because loan and mortgage tools are the ones FinHome's users actually search for.

## Honest estimate

This is not a one-session task and I won't pretend otherwise. Each calculator needs its own math module, its own Vietnamese copy (~60–90 lines), unit tests against reference values, a route, and structured data. Class T and N calculators need materially more.

SP-0 alone is comparable in size to the entire Rule of 72 branch. The full suite is realistically a multi-week effort delivered across many sessions. Structuring it as nine mergeable sub-projects means you get working, shippable calculators continuously rather than one enormous unreviewable branch at the end — which is also why I declined to just keep appending to the current branch's single plan.

## What I need from you

1. **Approve or amend this decomposition**, particularly the sub-project order.
2. **Rule on the two live-data calculators** (Currency Converter, Commodities and Futures): omit, third-party client-side API, or timestamped build-time snapshot?
3. Confirm the US-specific mitigation (prominent above-calculator notice, de-prioritised in sitemap, excluded from internal linking) is what you want.

Once approved, SP-0 gets its own full design spec and implementation plan, and I start there.
