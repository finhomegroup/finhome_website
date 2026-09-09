# Calculator Suite — Status and Handoff

**Read this before touching anything under `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`.**

Last updated: 2026-09-09
Branch: `feat/rule-of-72-calculator` — **not merged, not pushed.**
Everything below is committed; nothing is in the working tree.

---

## 1. Where things stand

A suite of financial calculators at `/cong-cu/`, modelled on the tool set at `fncalculator.com` but reimplemented from standard finance and written in Vietnamese. Nothing is copied from that site: its pages are JavaScript-rendered so nothing was scrapeable anyway, and its copy and markup are its own property.

| | Count |
|---|---|
| Working calculators | **62** |
| Listed with a placeholder page | 13 |
| Total routes built | 75 |
| Tests | 1393, across 70 suites |

The 13 remaining placeholders are the United States retirement tier, all flagged `usRules`.
The counts above are derived from `content/calculators/registry.ts` (`liveCalculators()` /
`plannedCalculators()`) — re-derive them rather than trusting this table, which has been
stale before.

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
| `/cong-cu/loi-nhuan-co-phieu/` | Trade return net of VN fees; transfer tax charged on losses too |
| `/cong-cu/co-phieu-tang-truong-deu/` | Gordon growth; leads with the implied growth and return |
| `/cong-cu/co-phieu-tang-truong-khong-deu/` | Two-stage DDM; terminal share in the headline |
| `/cong-cu/gia-tri-tien-te-theo-thoi-gian/` | TVM solver; the one page that exposes the sign convention |
| `/cong-cu/lai-suat-tha-noi/` | Promo-then-floating; instalment recalculated at each reset |
| `/cong-cu/lai-co-dinh-hay-tha-noi/` | Leads with the break-even fixed rate, not the verdict |
| `/cong-cu/phi-quy-dau-tu/` | Fee drag: 2%/năm takes ~36% of the gain over 20 years |
| `/cong-cu/vay-thuong-mai/` | Grace period + balloon; three payments, not one |
| `/cong-cu/loi-suat-tuong-duong-thue/` | Untaxed deposit vs 5%-taxed coupon, on one footing |
| `/cong-cu/tiet-kiem-hoc-phi/` | Tuition as a stream, discounted to the start of study |
| `/cong-cu/thu-nhap-dau-tu/` | Sustainable withdrawal, computed on the REAL return |
| `/cong-cu/doi-don-vi/` | Sào/mẫu by region, lượng vàng at 37,5 g |
| `/cong-cu/quyen-chon-black-scholes/` | Call, put and all five greeks. Gamma PEAKS near the strike; it does not fall monotonically in the spot |
| `/cong-cu/du-bao-kinh-doanh/` | Revenue and cost forecast on a growth rate |
| `/cong-cu/cac-chi-so-tai-chinh/` | Ratios off a statement, plus P/E and P/B from a share price |
| `/cong-cu/phan-tich-bao-cao-tai-chinh/` | Common-size statements, plus the DuPont decomposition |
| `/cong-cu/phan-phoi-rong/` | Net proceeds of a withdrawal after tax and fees |
| `/cong-cu/tinh-ngay/` | Date arithmetic — the reference date comes in from the client, never `Date` |
| `/cong-cu/tiet-kiem-thue-vay-mua-nha/` | Mortgage interest deduction (US law) |
| `/cong-cu/tai-khoan-tiet-kiem-y-te-hoa-ky/` | HSA (US law) |
| `/cong-cu/thue-co-tuc/` | Dividend tax (US law) |
| `/cong-cu/ke-hoach-huu-tri/` | Retirement accumulation and drawdown (US law) |
| `/cong-cu/lam-phat-hoa-ky/` | Purchasing power on the US CPI series |
| `/cong-cu/tin-phieu-kho-bac-hoa-ky/` | US T-bill — discount yield and investment yield kept apart |
| `/cong-cu/thue-luong-hoa-ky/` | US payroll tax and paycheck deductions |

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
| `number.ts` | `parseDecimal`, `parseMoney`, `parseCount`, `parseMagnitude`, `formatDecimal`, `formatMoney`, `formatPercent`, `PLACEHOLDER` |
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
| `stock-return.ts` | `computeStockReturn` — closed-form break-even price |
| `ddm.ts` | `computeDdm` — rejects `g >= r`; closed-form inversions |
| `ddm-multi.ts` | `computeDdmMulti` — first stage may exceed `r`, terminal may not |
| `tvm.ts` | `solveTvm` — solves any one of PV/FV/PMT/N/rate; raw sign convention |
| `floating-loan.ts` | `computeFloatingLoan`, `buildPhases`, `compareFixedFloating` |
| `fund-fees.ts` | `computeFundFees` — runs the plan with and without fees |
| `commercial-loan.ts` | `computeCommercialLoan` — grace period and balloon |
| `tax-equivalent.ts` | `computeTaxEquivalent` |
| `education-savings.ts` | `computeEducationSavings` — target is a discounted stream |
| `withdrawal.ts` | `computeWithdrawal` — perpetual draw off the real return |
| `units.ts` | `convertUnit`, `UNITS` — one factor per unit, no pairwise table |
| `normal.ts` | `normalCdf`, `normalPdf`, `inverseNormalCdf` |
| `black-scholes.ts` | `computeBlackScholes` — European call/put plus greeks |

**UI** (`components/calc/`): `CalculatorPage`, `calculatorMetadata`, `CalculatorCard`, `FieldGroup`, `NumberField`, `SelectField`, `RadioGroupField`, `ResultGroup`, `ResultRow`, `ResultTable`, `CalculatorDisclaimer`, `useCalcFields`.

**`CalculatorPage` is the page shell, and it owns the two contracts a hand-written page could silently drop:** it always renders `<CalculatorDisclaimer />`, and it reads the registry's `usRules` flag itself and renders the `us-rules` variant above the calculator. It also throws during `next build` on a slug that is not in the registry. Both gaps from the SP-0 review are closed by using it.

The six calculators built before the shell existed still render their own page bodies. That is deliberate: their built HTML is a regression gate, and rewriting them through the shell would move rendered markup for no functional gain. Migrate them whenever their markup is next allowed to change.

**A repeating-field primitive is now overdue.** `irr-npv` and `loi-nhuan-ky-vong` both needed a variable-length list of inputs and both solved it the same way: a fixed pool of keys in `useCalcFields` plus a count field deciding how many render. Keeping every key in state means shrinking the count and growing it again does not lose what was typed. The third tool to need this should extract it.

**Not built yet, and their first consumer should build them:** a unit-toggle field (`SelectField` alongside the number field is the current idiom — see `fuel-calculator.tsx`), and a monthly (rather than yearly) schedule view with collapse.

## 4. Conventions that will bite you if you skip them

**Four number grammars, not two.** Vietnamese uses `.` for thousands and `,` for decimals — the inverse of English. Pick the parser from the FIELD, not by habit; they are four functions on purpose, not one with a flag:

| Field kind | Parser | Why the others are wrong |
|---|---|---|
| Money (₫) | `parseMoney` | `parseDecimal("500.000")` is `500` — a 1000× error |
| Rate, ratio, term in years-with-a-fraction | `parseDecimal` | `parseMoney("7.5")` is `75` |
| Whole count — years, days, periods, an age | `parseCount` | `parseMoney("3.0")` is `30`, and it eats the dot *before* any `Number.isInteger` guard runs, so the field's own error is unreachable. `parseDecimal("1.000")` is `1`. Digits only, no sign |
| Dimensionless magnitude — length, area, weight | `parseMagnitude` | Neither money nor rate: these run below 10 *and* their own option labels write `3.600 m²`. The grammar decides — a dot followed by exactly three digits repeated to the end is grouping, any other dot is a decimal point. The leading group may not start with `0`, or `"0.500"` reads as 500 |

Getting this wrong is the single most repeated defect in this suite's history: it has shipped a P/E out by 1000×, a 30-year forecast from a typed `3.0`, and 500 lượng of gold for `0.5`.

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

**The build needs about 1,3 GB of free disk** for `.next` plus 125 MB for `out`. This machine ran out of space mid-session at 127 MiB free, which broke every tool call until `.next` and `out` were cleared. Both are gitignored and regenerable, so deleting them is the fix. If a verification step fails oddly, check `df -h /` first.

There is **no browser automation** in this environment. Every check above is a test, a typecheck, a build, or a grep on the built HTML in `out/`. Do not fake a browser observation; report visual items as unverified.

## 6. Open decisions and known gaps

**Needs a human:**

- **The branch.** `feat/rule-of-72-calculator` is unmerged and unpushed, and well past a
  hundred commits (`git log --oneline main..HEAD | wc -l` for the current number). One commit
  per calculator, each self-contained — the registry flip ships with its page, so no commit
  leaves `registry.test.ts` red. The audit fixes follow the same rule: one commit per fix
  batch, each with its own test pins moved. The owner has been asked repeatedly and has not
  chosen a merge strategy; nothing has been pushed as a result.
- **Visual layout.** The `/cong-cu/` hub's multi-column index and the calculator pages have never been seen rendered. Worth a look at `pnpm dev`. This now covers all 62 live pages, several of which render a wide results table (`so-sanh-khoan-vay` has four columns, `lai-suat-thuc-te` eight rows, `phan-tich-bao-cao-tai-chinh` the widest) — `ResultTable` scrolls horizontally on narrow screens, which is untested by eye. There is **no browser automation in this environment**, so nothing about focus order, colour contrast, touch-target size or that horizontal scroll has ever been observed; every accessibility claim in this document is inferred from JSX and built markup. Do not report a visual item as verified.
- **The rental-tax model needs a tax professional's sign-off.** `bat-dong-san-cho-thue` now
  implements 5% VAT on all revenue plus 5% PIT on the excess above a 500 triệu threshold,
  per Luật 149/2025/QH15 (GTGT, 01/01/2026) and Luật Thuế TNCN 109/2025/QH15 (01/07/2026).
  Those citations were established from secondary sources, not from the original statutes.
  This is a bank-published page telling Vietnamese consumers what tax they owe, so the
  threshold, both rates and both bases should be confirmed against the original legal text
  before it ships. All three are inputs, so a correction is a one-line default change.

**Closed since the SP-0 review:**

- ~~The disclaimer is the one contract the primitives do NOT own.~~ `CalculatorPage` now owns both the disclaimer and the `usRules` wiring. Only applies to routes that use the shell; the six pre-shell pages still carry their own disclaimer inline, correctly, but by hand.
- ~~`ResultGroup` has no `aria-live` opt-out.~~ It takes `live?: boolean` now.

**Still open:**

- **Almost no component-level coverage, and this is where the worst bugs live.** There is no
  jsdom and the vitest glob is `{lib,content,components}/**/*.test.ts` (`.ts`, not `.tsx`), so
  a test under `components/` can exercise pure exported helpers but cannot render React.
  That gap is not academic: an audit of the whole suite found that **three of its five
  worst defects were invisible to a green 1242-test run**, because they lived in a component
  or in a default input rather than in a module — a ₫ share price parsed with
  `parseDecimal` (P/E out by 1000×), a stale prefilled tax threshold, and a `parseMoney`
  count field turning a typed `3.0` into 30. Until component rendering can be tested, the
  highest-value substitute is to assert the **module-at-its-shipped-defaults**: parse the
  content file's own default strings with the same parser the component uses, call the
  module, format with the same formatter, and pin the result.
  See `components/calc/calculator-page.test.ts` for the pure-helper pattern that does work.
- **No automated check on the accessibility markup.** The built-HTML greps are still run by
  hand: one `Công cụ này chỉ mang tính minh họa` per page, exactly one `aria-live="polite"`
  beyond the per-field ones, one `<h1>`, both JSON-LD blocks parsing as valid JSON, and
  `og:image`/`twitter:title` present. Putting these in a script the build gate runs is the
  single cheapest win left. (When counting in `out/*/index.html`, strip `<script>` first —
  the RSC flight payload duplicates every string, so a raw grep reports 2 for everything.)
- **No PR-time CI.** The `vercel.json` gate catches a broken build at deploy time, not at review time.
- **Nothing enforces "one live region per page".** It is a convention plus a code comment; a grep in a build-gate script would make it real.
- **`vercel.json` runs `vitest run && next build`, so a fix and its test pins must land in
  the same commit.** Several assertions in this suite pinned a *wrong* value, so correcting
  a module without correcting its test blocks deployment of unrelated work.

**Deferred minors** are recorded in `.superpowers/sdd/2026-09-06-sp0-calculator-foundation/progress.md` if that directory still exists (it is git-ignored scratch).

## 7. What to build next

Ordered by value per unit of effort. Each is independently mergeable.

**Done** — the three tiers that used to head this list are built: the two fast tiers (`vay-mua-xe`, `so-sanh-khoan-vay`, `phan-tich-khoan-vay` and all nine simple-math tools) and the whole medium tier (`tai-cap-von`, `kha-nang-mua-nha`, `diem-chiet-khau`, `muc-tieu-tiet-kiem`, `tien-gui-co-ky-han`, `thue-mua-xe`, `thue-hay-mua`, `bat-dong-san-cho-thue`, and both credit-card tools).

**Needs the root finder — done.** `apr`, `apr-nang-cao`, `irr-npv` and `trai-phieu` are built. Read §8's tolerance note before writing tests against a solved rate.

**Equity tier — done**, all nine. The only equity slugs left are `quyen-chon-black-scholes` (needs the normal CDF) and `thue-co-tuc` (United States law).

**Needs a normal CDF — done.** `lib/calc/normal.ts` exists and is tested against published tables; `quyen-chon-black-scholes` is built on it.

**The VN-relevant tier — done.** `du-bao-kinh-doanh`, `cac-chi-so-tai-chinh`,
`phan-tich-bao-cao-tai-chinh`, `phan-phoi-rong` and `tinh-ngay` are built. `tinh-ngay` keeps
the rule it was warned about: **no `Date` in `lib/calc/`**, because prerendered output must
hydrate byte-identically — the reference date arrives from the client as a plain
`{year, month, day}` and `dates.ts` stays pure. Do not regress that.

**Only the United States retirement tier is left — 13 slugs**, all `planned`, all `usRules`,
all served by the shared placeholder route: `tinh-huu-tri`, `gop-401k`, `toi-da-401k`,
`phan-tich-tiet-kiem-huu-tri`, `phan-tich-thu-nhap-huu-tri`, `thu-nhap-huu-tri`,
`ira-truyen-thong-hay-roth`, `rut-toi-thieu-bat-buoc`, `uoc-tinh-an-sinh-xa-hoi`,
`phan-tich-an-sinh-xa-hoi`, `chi-tra-an-sinh-xa-hoi`, `phan-bo-tai-san`, `nien-kim`.

These are last for a reason: they are the lowest value to Vietnamese users, and most need a
**vendored dataset** — contribution and catch-up limits, RMD divisor tables, the Social
Security bend points and the PIA formula. Every hard-coded constant is a transcription risk,
which §8 names as a defect class of its own. Before writing one of these, read the
`us-*.ts` modules already built: they establish the pattern of listing each constant with
the tax year it represents and asserting the table is internally consistent (brackets
contiguous, ascending, no gap or overlap at a boundary, top bracket unbounded, marginal rate
monotonic) and of probing income exactly ON each boundary. `CalculatorPage` renders the
`us-rules` notice from the registry flag automatically — no per-page wiring.

## 8. Design record

- `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md` — the full 75-tool inventory, classified by structural shape, and why the two data-dependent tools were dropped
- `docs/superpowers/specs/2026-09-06-sp0-calculator-foundation-design.md` — the foundation's design and the reasoning behind the primitives
- `docs/superpowers/plans/2026-09-06-sp0-calculator-foundation.md` — how it was built
- `docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md` — the first calculator

Two defects worth knowing about, because both came from a plan rather than from an implementation, and both were caught only by numeric verification:

**A `verdict: "fair"` compared with `===` is unreachable.** `ddm.ts` first tested `price === intrinsicValue`, and `intrinsicValue` is a division that lands on 30000.000000000004 — so the verdict could never fire. Fixed with a documented half-percent band, which is also the honest resolution of a model built on estimates. **Any equality comparison against a computed float needs a band, and the band belongs in a named constant with a comment saying why.**

1. `solveRate`'s search bracket was originally 1000% per period, which overflowed float64 at 289 periods — so **every loan term over ~24 years returned "no solution"**, including standard 25- and 30-year Vietnamese mortgages. The test suite at the time used only 12-period loans and was structurally incapable of catching it. **Pin at least one realistic-term case (240/300/360 periods) in any module that touches loans.**
2. `formatDecimal` had no finite guard, so a tiny rate rendered `"Infinity năm"` on a live page.

Two more from the medium tier, both caught by tests rather than by review:

3. `savings-goal.ts` negated `fv()` in one branch and not the others. Both the starting balance and the contributions are outflows, so they go in negative and `fv` comes back **positive** — the extra flip made every "what will I have" answer negative. `pmt()` in the same module *does* need a flip. **The sign convention is per-function, not per-module; check each call against `finance.ts`'s docstring.**
4. `rent-vs-buy.ts` counted the buyer's upfront cash on the buying side only. Renting therefore looked cheaper by the whole deposit — about 1 tỷ on the defaults — and the verdict was biased. **In any two-sided comparison, assert that both sides start from identical wealth**; the `netCost = totalRent − investmentGain` identity test is what caught it.

**Transcribed numeric coefficients are a defect class of their own.** Both Beasley–Springer–Moro coefficient sets in `normal.ts` were wrong on the first pass — the tail from the fourth term on, and the central region using a five-term variant from a different algorithm. Neither was visible by reading the code, and both would have surfaced downstream as a plausible option price. What caught them was **testing the module against published reference values, and round-tripping the inverse through the forward**. Any approximation copied from a paper needs both.

**A tolerance can be too TIGHT as well as too loose.** `normal.test.ts` first asserted `normalCdf` to seven decimal places; the approximation's own stated error is 7,5 × 10⁻⁸, so a correct implementation failed. Assert to the method's documented accuracy and say so in a comment — and remember composite figures (an interval is two CDF calls) accumulate error.

**Testing a solved rate: mind the tolerance.** `bisect` stops at a 1e-10 bracket on the rate it is solving for, so anything derived from that rate carries a matching relative error. On a 2 tỷ loan that is a couple of đồng of present value; on an APR it is ±1,2e-7 percentage points. Assert an absolute bound with a comment (`expect(Math.abs(npv)).toBeLessThan(1)`) rather than `toBeCloseTo(0, 8)`, which fails for a correct answer. Three tests in `apr.test.ts` and `irr-npv.test.ts` were written the tight way first and had to be loosened.

Verify numbers by executing the module, not by re-reading the code. Several figures quoted in `content/calculators/*.ts` prose were wrong on the first pass and only fixed by running the module — the comment at the top of each content file records which figures came from where, so re-read the module if you change a default.

### From the 2026-09-09 suite-wide audit

A full audit of all 62 live tools found 41 defects that the then-green 1242-test suite could
not see. The five worst are worth knowing as patterns, because four of them are recurrences:

5. **The `solveRate` bracket overflow came back, in `bond.ts`.** Yield-from-price returned
   `null` for every bond past 50 coupon periods — so every 30-year government bond — and the
   page printed a *false explanation* for the blank ("giá quá cao so với tổng tiền trái phiếu
   sẽ trả"). Identical mechanism to defect 1, different module, and again the tests used only
   short terms. **A root finder's bracket is an overflow surface: pin a long-dated case in
   every module that has one.** Worse than a blank is a blank with a confident wrong reason.
6. **A float product must be snapped before it is floored.** `compound.ts` computed
   `Math.floor(years * perYear)`; `1.4 * 365` is `510.99999999999994`, so 1,4 năm ghép lãi
   hằng ngày lost a whole compounding run. `Math.round` is not the fix either — it credits a
   partial period. Snap to the nearest integer within a named relative band, *then* floor.
7. **A comparison against a computed float needs a band — and the band's why-comment has to
   be TRUE.** Two bands shipped with comments naming a "worst-case residue" that was not the
   worst case, one off by ~884×. A wrong justification is worse than none: it tells the next
   maintainer the region is covered. If you state a swept maximum, run the sweep.
8. **Vendored legal and tax constants need their effective date AND their base recorded.**
   `bat-dong-san-cho-thue` prefilled a rental-tax exemption threshold of 100 triệu that had
   been revised twice (→ 200 → 500 triệu), so the page's own default state charged
   17.100.000 ₫ of tax that was not owed and every headline figure below it was wrong. The
   deeper error was structural: it modelled 5% VAT + 5% PIT as one flat 10% on gross, but
   **the two taxes have different bases** — VAT on all revenue once the threshold is passed
   (a cliff), PIT only on the excess (a taper). At 900 triệu that is 65 triệu, not 90.
   A single combined rate overstates by `pitPercent` of the threshold at *every* revenue
   above it, which is why spot-checking one figure never caught it.
9. **The same money counted on both sides of a ledger.** `apr.ts` added financed fees to
   `netProceeds` while also charging them as cost, so financing a fee produced *no* APR
   effect and the page taught that as a general rule in three places. It was provable without
   any external standard: `totalCost` differed from `totalPaid − netProceeds` by exactly the
   fee in the financed branch and agreed exactly in the upfront branch. **Assert your ledger
   identities; an internal inconsistency needs no reference value to prove.**

Two process lessons, both cheap:

- **Audit the test file as a defect surface.** Several assertions pinned the wrong value and
  so actively defended the bug — `apr.test.ts` had `toBeCloseTo(8.5, 6)` on an APR that
  should have been 8,7081%. A test that cannot fail is a finding.
- **Never pin the suite's own size.** `expect(planned.length).toBe(13)` fails the deploy gate
  the day an unrelated calculator ships. Assert the property, not the count.
