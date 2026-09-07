# Calculator Suite — Status and Handoff

**Read this before touching anything under `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`.**

Last updated: 2026-09-07
Branch: `feat/rule-of-72-calculator` — **69 commits, not merged, not pushed.**
Everything below is committed; nothing is in the working tree.

---

## 1. Where things stand

A suite of financial calculators at `/cong-cu/`, modelled on the tool set at `fncalculator.com` but reimplemented from standard finance and written in Vietnamese. Nothing is copied from that site: its pages are JavaScript-rendered so nothing was scrapeable anyway, and its copy and markup are its own property.

| | Count |
|---|---|
| Working calculators | **37** |
| Listed with a placeholder page | 38 |
| Total routes built | 75 |
| Tests | 742, across 39 suites |

**Working:**

| Route | Tool |
|---|---|
| `/cong-cu/vay-mua-nha/` | Loan / mortgage — 11 inputs, yearly amortization table, PMI, extra payments |
| `/cong-cu/tra-no-hai-tuan/` | Bi-weekly repayment vs monthly |
| `/cong-cu/chi-tra-lai/` | Interest-only phase, then amortizing |
| `/cong-cu/lai-kep/` | Compound interest, with contributions |
| `/cong-cu/quy-tac-72/` | Rule of 72, both directions, plus a reference table |
| `/cong-cu/vay-mua-xe/` | Vehicle loan — amount financed derived from price, deposit and trade-in |
| `/cong-cu/so-sanh-khoan-vay/` | Three loan options side by side, ranked on interest + arrangement fee |
| `/cong-cu/phan-tich-khoan-vay/` | Cost structure over time: crossover month, halfway points, per-quarter split |
| `/cong-cu/tinh-phan-tram/` | Percentage of, share of, and change between |
| `/cong-cu/ty-suat-loi-nhuan-roi/` | ROI and CAGR |
| `/cong-cu/tang-luong/` | Pay rise from a percentage, an amount or a target |
| `/cong-cu/luong-gio-sang-luong-thang/` | Wage conversion across five units |
| `/cong-cu/giam-gia-va-thue/` | Discount and VAT, tax-inclusive by default |
| `/cong-cu/margin-va-markup/` | Margin/markup/price, any two given |
| `/cong-cu/lai-suat-thuc-te/` | Nominal ↔ effective, plus every compounding frequency |
| `/cong-cu/tinh-tien-tip/` | Bill split with service charge, VAT and per-share rounding |
| `/cong-cu/chi-phi-nhien-lieu/` | Trip fuel cost, both consumption units |
| `/cong-cu/tai-cap-von/` | Refinance: break-even months **and** lifetime saving, which can disagree |
| `/cong-cu/kha-nang-mua-nha/` | Affordability, solved backwards via `pv()`; names which DTI limit bound |
| `/cong-cu/diem-chiet-khau/` | Discount points, judged on a hold horizon rather than naive break-even |
| `/cong-cu/muc-tieu-tiet-kiem/` | Savings goal: solves for contribution, horizon or final balance |
| `/cong-cu/tien-gui-co-ky-han/` | Term deposit on Vietnamese conventions, plus the early-withdrawal loss |
| `/cong-cu/thue-mua-xe/` | Vehicle lease: depreciation + finance charge, money factor |
| `/cong-cu/tra-het-the-tin-dung/` | Card payoff, daily accrual, both directions |
| `/cong-cu/tra-toi-thieu-the-tin-dung/` | Minimum payment vs the same amount held flat |
| `/cong-cu/bat-dong-san-cho-thue/` | Rental yields: gross, cap rate, cash-on-cash, DSCR + VN rental tax |
| `/cong-cu/thue-hay-mua/` | Rent vs buy on net cost, month-by-month, with a break-even month |
| `/cong-cu/apr/` | APR — the first tool needing the root finder; upfront vs financed fees |
| `/cong-cu/apr-nang-cao/` | Itemised fees, and the APR that applies if you repay early |
| `/cong-cu/irr-npv/` | NPV, IRR, MIRR, profitability index, payback both ways |
| `/cong-cu/trai-phieu/` | Bond price ↔ yield, three yields kept apart, duration in years |
| `/cong-cu/capm/` | CAPM + Jensen's alpha; rejects being given return *and* premium |
| `/cong-cu/wacc/` | WACC with the tax shield on debt only, contributions itemised |
| `/cong-cu/loi-nhuan-ky-vong/` | Expected return, σ, coefficient of variation, semi-deviation |
| `/cong-cu/loi-nhuan-ky-nam-giu/` | Holding period return split into capital gain and income |
| `/cong-cu/diem-pivot/` | Pivot levels by four methods, shown together because they disagree |
| `/cong-cu/fibonacci/` | Retracements and extensions; flags the two non-Fibonacci ratios |

**Deliberately omitted, not forgotten:** a currency converter and a commodities/futures tool. Both need live market data. The site is `output: "export"` with no server, so the only options were an API key in the client bundle or rates that go stale between deploys — neither acceptable for a page giving Vietnamese consumers financial figures. Target is therefore 75, not 77.

## 2. Adding a calculator — the recipe

Five files. Nothing else needs wiring: the hub, the sitemap and the placeholder route all derive from the registry.

1. **`lib/calc/<name>.ts`** — the math. Pure: no React, no I/O, no DOM, no `Date`, no `Math.random`. Return `null` for inputs you reject; never a guess. Everything you return should be **positive** (presentation-shaped) — flip the sign once here, so no page has to think about it.
2. **`lib/calc/<name>.test.ts`** — verify against a published closed form or a hand-computed reference, not against your own implementation. Include the invariants (see §4).
3. **`content/calculators/<name>.ts`** — every Vietnamese string, exported as one `as const` object. No user-facing text in components.
4. **`components/<name>-calculator.tsx`** — `"use client"`, assembles the primitives from `components/calc/`.
5. **`app/cong-cu/<slug>/page.tsx`** — a `metadata` export from `calculatorMetadata()` plus one `<CalculatorPage>` element. Roughly 30 lines; see §3.

Then in **`content/calculators/registry.ts`**: flip that slug's `status` from `"planned"` to `"live"`.

Copy `app/cong-cu/tinh-phan-tram/page.tsx` as your page template — it is the shortest complete example on the shell. `app/cong-cu/tra-no-hai-tuan/page.tsx` is the old hand-written shape; do not copy that one for new work.

## 3. Available building blocks

**Math** (`lib/calc/`):

| Module | Exports |
|---|---|
| `number.ts` | `parseDecimal`, `parseMoney`, `formatDecimal`, `formatMoney`, `formatPercent`, `PLACEHOLDER` |
| `finance.ts` | `pmt`, `pv`, `fv`, `nper`, `solveRate`, `periodsPerYear`, `toEffective`, `toNominal`, `amortize` |
| `solve.ts` | `bisect` — root finder, returns `null` when not bracketed |
| `loan.ts` | `computeLoan`, `yearlySummary` |
| `loan-variants.ts` | `amortizeFixedPayment`, `computeBiweekly`, `computeInterestOnly` |
| `loan-compare.ts` | `compareLoans` — options priced against one principal, ranked on interest + fee |
| `loan-analysis.ts` | `analyseLoan` — crossover month, halfway points, per-quarter split |
| `compound.ts` | `computeCompound` |
| `auto-loan.ts` | `computeAutoLoan` |
| `percent.ts` | `computePercent` |
| `roi.ts` | `computeRoi` |
| `raise.ts` | `computeRaise` |
| `wage.ts` | `convertWage` |
| `price-adjust.ts` | `adjustPrice` |
| `margin.ts` | `computeMargin` |
| `effective-rate.ts` | `convertRate`, `COMPOUNDING_ORDER` |
| `tip.ts` | `splitBill` |
| `fuel.ts` | `computeFuelCost` |
| `refinance.ts` | `compareRefinance` |
| `affordability.ts` | `computeAffordability` — the reverse solve, via `pv()` |
| `points.ts` | `computePoints` — includes the balance-aware hold comparison |
| `savings-goal.ts` | `computeSavingsGoal` — one entry point, three modes |
| `term-deposit.ts` | `computeTermDeposit` — simple interest in-term, compounding at rollover |
| `auto-lease.ts` | `computeAutoLease` |
| `card-debt.ts` | `payFixed`, `payMinimum`, `paymentForMonths` |
| `rental-property.ts` | `computeRentalProperty` |
| `rent-vs-buy.ts` | `compareRentVsBuy` |
| `apr.ts` | `computeApr` — shared by both APR pages; solves via `solveRate` |
| `irr-npv.ts` | `computeIrrNpv`, `netPresentValue` — declines a non-unique IRR |
| `bond.ts` | `computeBond` — price↔yield, duration in YEARS not periods |
| `capm.ts` | `computeCapm` |
| `wacc.ts` | `computeWacc` |
| `expected-return.ts` | `computeExpectedReturn` — rejects probabilities that miss 100 |
| `holding-period.ts` | `computeHoldingPeriod` |
| `pivot.ts` | `computePivots` — four methods; Woodie absent without an open |
| `fibonacci.ts` | `computeFibonacci` |

**UI** (`components/calc/`): `CalculatorPage`, `calculatorMetadata`, `CalculatorCard`, `FieldGroup`, `NumberField`, `SelectField`, `RadioGroupField`, `ResultGroup`, `ResultRow`, `ResultTable`, `CalculatorDisclaimer`, `useCalcFields`.

**`CalculatorPage` is the page shell, and it owns the two contracts a hand-written page could silently drop:** it always renders `<CalculatorDisclaimer />`, and it reads the registry's `usRules` flag itself and renders the `us-rules` variant above the calculator. It also throws during `next build` on a slug that is not in the registry. Both gaps from the SP-0 review are closed by using it.

The six calculators built before the shell existed still render their own page bodies. That is deliberate: their built HTML is a regression gate, and rewriting them through the shell would move rendered markup for no functional gain. Migrate them whenever their markup is next allowed to change.

**A repeating-field primitive is now overdue.** `irr-npv` and `loi-nhuan-ky-vong` both needed a variable-length list of inputs and both solved it the same way: a fixed pool of keys in `useCalcFields` plus a count field deciding how many render. Keeping every key in state means shrinking the count and growing it again does not lose what was typed. The third tool to need this should extract it.

**Not built yet, and their first consumer should build them:** a unit-toggle field (`SelectField` alongside the number field is the current idiom — see `fuel-calculator.tsx`), and a monthly (rather than yearly) schedule view with collapse.

## 4. Conventions that will bite you if you skip them

**Two different number grammars.** Vietnamese uses `.` for thousands and `,` for decimals — the inverse of English. Money fields use `parseMoney`; rate and term fields use `parseDecimal`. Mixing them turns `500.000` into `500`. They are two functions on purpose, not one with a flag.

**Never `Intl`, never `toLocaleString`.** All formatting is hand-rolled. Not stylistic: inputs are prefilled, so the server prerenders result strings the client must hydrate to byte-identically, and hand-rolling removes any Node-ICU vs browser-ICU divergence. This holds for every calculator.

**`finance.ts` follows the Excel / HP-12C sign convention** — outflows negative. So for a loan, `pv` is positive and `pmt` comes back negative. `amortize` is the one documented exception and returns positive figures. Read the module docstring before using it; a sign error here would produce plausible-but-wrong figures on every loan page.

**`rate` in `finance.ts` is always PER PERIOD, never annual.** A 12%/năm nominal rate compounded monthly is `0.12 / 12`.

**Accessibility lives in the primitives, not in your page.** `NumberField` owns the label/`id` pairing, `aria-describedby`, `aria-invalid`, and an `aria-live` on its own help paragraph. `ResultGroup` owns the results live region; `ResultRow` carries `aria-atomic`. Do not re-implement any of that.

**Exactly one live results region per page.** `ResultGroup` now takes `live`, defaulting to true and existing to be turned off. A second `ResultGroup` for a breakdown or a secondary view must pass `live={false}` — see `tip-calculator.tsx` (2 live rows, 7 not) and `fuel-calculator.tsx`. Keep the live group to the handful of rows the user came for; a nine-row group re-announced on every keystroke is the same failure mode a live table is.

**Never put a table inside a live region.** `ResultTable` is deliberately outside `ResultGroup`. A 360-row amortization schedule inside a polite live region re-announces on every keystroke and makes the page unusable with a screen reader.

**Every calculator ships a disclaimer.** `<CalculatorDisclaimer />` below the results. Tools flagged `usRules` in the registry additionally get `variant="us-rules"` **above** the calculator.

**Invariants worth asserting in every loan-shaped test:** total payments minus total interest equals the principal; the final balance is strictly `0`; `interest + principal === payment` on every row. These catch sign and accumulation errors that spot-checking a single number will not.

## 5. Verification

```bash
pnpm test                                  # all suites
pnpm exec tsc --noEmit                     # must be clean
pnpm exec vitest run && pnpm exec next build   # exactly what Vercel runs
pnpm lint                                  # see the baseline below
```

**`pnpm lint` fails at baseline and always has.** Exactly three pre-existing problems, none in this suite's files:

- `components/site-header.tsx:52:5` — error, `react-hooks/set-state-in-effect`
- `components/site-header.tsx:83:5` — error, same rule
- `scripts/header-cmp.mjs:13:10` — warning, unused variable

**Pass condition is "no NEW problems beyond those three", never "clean".** Do not fix those two files; they are outside this work.

`vercel.json`'s `buildCommand` is `vitest run && next build`, so a failing test blocks deployment. Accepted trade-off: a red test also blocks deploys of unrelated content changes.

There is **no browser automation** in this environment. Every check above is a test, a typecheck, a build, or a grep on the built HTML in `out/`. Do not fake a browser observation; report visual items as unverified.

## 6. Open decisions and known gaps

**Needs a human:**

- **The branch.** 69 commits on `feat/rule-of-72-calculator`, unmerged and unpushed. One commit per calculator, each self-contained — the registry flip ships with its page, so no commit leaves `registry.test.ts` red. The owner has been asked repeatedly and has not chosen a merge strategy; nothing has been pushed as a result.
- **Visual layout.** The `/cong-cu/` hub's multi-column index and the calculator pages have never been seen rendered. Worth a look at `pnpm dev`. This now covers seventeen pages, including three that render a wide results table (`so-sanh-khoan-vay` has four columns, `lai-suat-thuc-te` eight rows) — `ResultTable` scrolls horizontally on narrow screens, which is untested by eye.

**Closed since the SP-0 review:**

- ~~The disclaimer is the one contract the primitives do NOT own.~~ `CalculatorPage` now owns both the disclaimer and the `usRules` wiring. Only applies to routes that use the shell; the six pre-shell pages still carry their own disclaimer inline, correctly, but by hand.
- ~~`ResultGroup` has no `aria-live` opt-out.~~ It takes `live?: boolean` now.

**Still open:**

- **No component tests, and no automated check on the accessibility markup.** The vitest glob now covers `components/`, so tests *can* be written. Either write them, or put the built-HTML greps into a script the build gate runs. The greps that were run by hand for the eleven newest routes: one `Công cụ này chỉ mang tính minh họa` per page, exactly one `aria-live="polite"` beyond the per-field ones, one `<h1>`, and both JSON-LD blocks.
- **No PR-time CI.** The `vercel.json` gate catches a broken build at deploy time, not at review time.
- **Nothing enforces "one live region per page".** It is a convention plus a code comment; a grep in a build-gate script would make it real.

**Deferred minors** are recorded in `.superpowers/sdd/2026-09-06-sp0-calculator-foundation/progress.md` if that directory still exists (it is git-ignored scratch).

## 7. What to build next

Ordered by value per unit of effort. Each is independently mergeable.

**Done** — the three tiers that used to head this list are built: the two fast tiers (`vay-mua-xe`, `so-sanh-khoan-vay`, `phan-tich-khoan-vay` and all nine simple-math tools) and the whole medium tier (`tai-cap-von`, `kha-nang-mua-nha`, `diem-chiet-khau`, `muc-tieu-tiet-kiem`, `tien-gui-co-ky-han`, `thue-mua-xe`, `thue-hay-mua`, `bat-dong-san-cho-thue`, and both credit-card tools).

**Needs the root finder — done.** `apr`, `apr-nang-cao`, `irr-npv` and `trai-phieu` are built. Read §8's tolerance note before writing tests against a solved rate.

**Equity tier — six of nine done.** `capm`, `wacc`, `loi-nhuan-ky-vong`, `loi-nhuan-ky-nam-giu`, `diem-pivot` and `fibonacci` are built. Still open in that category: `loi-nhuan-co-phieu` (stock return net of Vietnam's 0,1% transfer tax and 5% dividend tax), `co-phieu-tang-truong-deu` (Gordon growth — reject `g >= r`) and `co-phieu-tang-truong-khong-deu` (multi-stage DDM).

**Next, and VN-relevant, no new machinery needed:**
`gia-tri-tien-te-theo-thoi-gian`, `lai-suat-tha-noi`, `lai-co-dinh-hay-tha-noi`, `vay-thuong-mai`, `tiet-kiem-hoc-phi`, `thu-nhap-dau-tu`, `phi-quy-dau-tu`, `loi-suat-tuong-duong-thue`, `du-bao-kinh-doanh`, `cac-chi-so-tai-chinh`, `phan-tich-bao-cao-tai-chinh`, `phan-phoi-rong`, `tinh-ngay`, `doi-don-vi`.

Note `tinh-ngay` and `doi-don-vi`: the first needs date arithmetic, and the suite's rule is **no `Date` in `lib/calc/`** because prerendered output must hydrate byte-identically. Pass the reference date in as an input from the client, or the page will differ between build time and view time.

**Needs a normal CDF (not yet written):**
`quyen-chon-black-scholes`. An Abramowitz–Stegun or Hart approximation is fine; put it in `lib/calc/` as its own tested module, not inline.

**Last, and lowest value to Vietnamese users:** the 29 tools governed by United States tax and retirement law, and those among them needing vendored datasets (US tax tables, CPI series, Social Security formulas). All are flagged `usRules` in the registry, and `CalculatorPage` now renders the `us-rules` notice from that flag automatically — no per-page wiring.

## 8. Design record

- `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md` — the full 75-tool inventory, classified by structural shape, and why the two data-dependent tools were dropped
- `docs/superpowers/specs/2026-09-06-sp0-calculator-foundation-design.md` — the foundation's design and the reasoning behind the primitives
- `docs/superpowers/plans/2026-09-06-sp0-calculator-foundation.md` — how it was built
- `docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md` — the first calculator

Two defects worth knowing about, because both came from a plan rather than from an implementation, and both were caught only by numeric verification:

1. `solveRate`'s search bracket was originally 1000% per period, which overflowed float64 at 289 periods — so **every loan term over ~24 years returned "no solution"**, including standard 25- and 30-year Vietnamese mortgages. The test suite at the time used only 12-period loans and was structurally incapable of catching it. **Pin at least one realistic-term case (240/300/360 periods) in any module that touches loans.**
2. `formatDecimal` had no finite guard, so a tiny rate rendered `"Infinity năm"` on a live page.

Two more from the medium tier, both caught by tests rather than by review:

3. `savings-goal.ts` negated `fv()` in one branch and not the others. Both the starting balance and the contributions are outflows, so they go in negative and `fv` comes back **positive** — the extra flip made every "what will I have" answer negative. `pmt()` in the same module *does* need a flip. **The sign convention is per-function, not per-module; check each call against `finance.ts`'s docstring.**
4. `rent-vs-buy.ts` counted the buyer's upfront cash on the buying side only. Renting therefore looked cheaper by the whole deposit — about 1 tỷ on the defaults — and the verdict was biased. **In any two-sided comparison, assert that both sides start from identical wealth**; the `netCost = totalRent − investmentGain` identity test is what caught it.

**Testing a solved rate: mind the tolerance.** `bisect` stops at a 1e-10 bracket on the rate it is solving for, so anything derived from that rate carries a matching relative error. On a 2 tỷ loan that is a couple of đồng of present value; on an APR it is ±1,2e-7 percentage points. Assert an absolute bound with a comment (`expect(Math.abs(npv)).toBeLessThan(1)`) rather than `toBeCloseTo(0, 8)`, which fails for a correct answer. Three tests in `apr.test.ts` and `irr-npv.test.ts` were written the tight way first and had to be loosened.

Verify numbers by executing the module, not by re-reading the code. Several figures quoted in `content/calculators/*.ts` prose were wrong on the first pass and only fixed by running the module — the comment at the top of each content file records which figures came from where, so re-read the module if you change a default.
