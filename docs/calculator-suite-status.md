# Calculator Suite — Status and Handoff

**Read this before touching anything under `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`.**

Last updated: 2026-09-15
Branch: `main` at `5096360` — calculator suite integrated on top of the
2026-09-15 upstream (branding, two new news posts, planning-only homepage).
Check `git status` before assuming the working tree is clean; audit remediation may be
present but not committed yet.

**Every count in this document's current-state sections was derived from the
WORKING TREE on 2026-09-15, not from a commit.** The long-horizon unit (rows
44/45/48/50) was uncommitted and still being edited when they were taken —
the test count moved once mid-session, on an unchanged file count — so the
basis is "derived from the named file or command on that tree", and there is
no revision to check them against. Re-derive; do not reconcile against
`5096360`.

**The gate's page counts moved with that upstream and will move again.** On the
tree that carried the long-horizon unit it is **259 static pages** (from `next
build`'s own "Generating static pages (259/259)") and **174 non-calculator
pages** (from `pnpm check:markup`, which also reports 75 live and 0 planned
calculator pages) — not the 258 and 173 this line used to give, and not the 257
and 172 several unit records quote. `next build` counts every prerendered
route, including `robots.txt`, `sitemap.xml`, `icon.svg` and the manifest, so
it will always exceed the 256 `.html` files in `out/`; `check:markup` counts
only the hub, `/vision/`, `/blog/` and the blog posts, so the two figures are
not a subset of each other and neither is live-plus-planned plus the other.
Nothing in the suite pins any of them — keep it that way, because a
legitimately added news post must not turn the deploy gate red.

---

## 1. Where things stand

A suite of financial calculators at `/cong-cu/`, modelled on the tool set at `fncalculator.com` but reimplemented from standard finance and written in Vietnamese. Nothing is copied from that site: its pages are JavaScript-rendered so nothing was scrapeable anyway, and its copy and markup are its own property.

| | Count |
|---|---|
| Working calculators | **75** |
| Listed with a placeholder page | 0 |
| Total routes built | 75 |
| Tests | 4318, across 199 suites (after the long-horizon consolidation) |

**The suite is complete.** All 75 planned tools are built; **15** of them are flagged
`usRules`. The counts above are derived on this tree from
`content/calculators/registry.ts` (`liveCalculators()` / `plannedCalculators()`) and from
`pnpm exec vitest run`'s own summary — re-derive them rather than trusting this
table, which has been stale before. **The `usRules` count in particular moved for a
reason rather than by drift**, and 20 → 15 is FIVE removals from two different units,
not one: the long-horizon unit took the flag off original rows 44, 45, 48 and 50, and
row 56's unit had already taken it off `phan-bo-tai-san` — see that entry's own comment
in the registry, which records that the notice was inaccurate there before it was
misleading. So a figure of 19 or 20 in an older record is not a miscount, it is a dated
state. The nine genuinely US rows in the `huu-tri` category keep it
(`gop-401k`, `toi-da-401k`, `phan-tich-thu-nhap-huu-tri`, `ira-truyen-thong-hay-roth`,
`rut-toi-thieu-bat-buoc`, `uoc-tinh-an-sinh-xa-hoi`, `phan-tich-an-sinh-xa-hoi`,
`chi-tra-an-sinh-xa-hoi`, `nien-kim`), as do the six outside it. **Do not grep
"theo quy định Hoa Kỳ" as a proxy for the flag** — two flagged rows
(`uoc-tinh-an-sinh-xa-hoi`, `chi-tra-an-sinh-xa-hoi`) do not contain that phrase in
their summary, and `content/calculators/loan.ts` contains it in a PMI group title on a
row that is not flagged. The flag is the registry field; nothing else.

**`app/cong-cu/[slug]/` no longer exists.** It served the `planned` placeholders, and with
nothing planned its `generateStaticParams()` returns an empty array — which `output:
"export"` rejects outright, so an unused placeholder route does not sit harmlessly, it
fails `next build`. If you add a `planned` entry to the registry, restore that route and
its content file (`git log --diff-filter=D -- 'app/cong-cu/[slug]'` finds the commit);
`registry.test.ts` asserts the route's presence against whether anything is planned, in
BOTH directions, so either mistake is a red test with a message naming the fix rather than
a silent 404 or a broken build.

**Working:**

| Route | Tool |
|---|---|
| `/cong-cu/vay-mua-nha/` | Loan / mortgage — 11 inputs, yearly amortization table, PMI, extra payments |
| `/cong-cu/tra-no-hai-tuan/` | Bi-weekly repayment vs monthly |
| `/cong-cu/chi-tra-lai/` | **Ân hạn gốc** plus a rate reset, in one schedule — two independent dates |
| `/cong-cu/lai-kep/` | Compound interest, with contributions |
| `/cong-cu/quy-tac-72/` | Rule of 72, both directions, plus a reference table |
| `/cong-cu/vay-mua-xe/` | Vehicle loan — amount financed derived from price, deposit and trade-in |
| `/cong-cu/so-sanh-khoan-vay/` | Three loan options side by side, ranked on interest + arrangement fee |
| `/cong-cu/phan-tich-khoan-vay/` | Cost structure over time: crossover month, halfway points, per-quarter split, and ANY month of the term examined |
| `/cong-cu/tinh-phan-tram/` | Percentage of, share of, and change between |
| `/cong-cu/ty-suat-loi-nhuan-roi/` | ROI and CAGR |
| `/cong-cu/tang-luong/` | Pay rise from a percentage, an amount or a target |
| `/cong-cu/luong-gio-sang-luong-thang/` | Wage conversion across five units |
| `/cong-cu/giam-gia-va-thue/` | Discount and VAT, tax-inclusive by default |
| `/cong-cu/margin-va-markup/` | Margin/markup/price, any two given |
| `/cong-cu/lai-suat-thuc-te/` | Nominal ↔ **effective** (renamed "hiệu dụng" by original row 58; the slug is unchanged), plus every compounding frequency, and an explicit statement that it is NOT an APR |
| `/cong-cu/tinh-tien-tip/` | Bill split with service charge, VAT and per-share rounding |
| `/cong-cu/chi-phi-nhien-lieu/` | Trip fuel cost, both consumption units |
| `/cong-cu/tai-cap-von/` | Refinance: break-even months **and** lifetime saving, which can disagree |
| `/cong-cu/kha-nang-mua-nha/` | Affordability, solved backwards via `pv()`; names which DTI limit bound |
| `/cong-cu/diem-chiet-khau/` | Discount points, judged on a hold horizon rather than naive break-even |
| `/cong-cu/muc-tieu-tiet-kiem/` | Savings goal: solves for contribution, horizon or final balance |
| `/cong-cu/tien-gui-co-ky-han/` | Term deposit on Vietnamese conventions, plus the early-withdrawal loss |
| `/cong-cu/thue-mua-xe/` | **Thuê tài chính ô tô** (renamed 2026-09-16 — see below): depreciation + finance charge, money factor. VAT rate on the rental ships as **0** |
| `/cong-cu/tra-het-the-tin-dung/` | **The card-payoff workspace** — fixed payment, target month or the declining minimum, two dated debt paths, one household allocation |
| `/cong-cu/tra-toi-thieu-the-tin-dung/` | The SAME workspace opened on the minimum, with its own framing. Not a second form |
| `/cong-cu/bat-dong-san-cho-thue/` | Rental yields: gross, cap rate, cash-on-cash, DSCR + VN rental tax |
| `/cong-cu/thue-hay-mua/` | Rent vs buy on net cost, month by month, with a break-even month, both trajectories drawn and a named growth-scenario band |
| `/cong-cu/apr/` | APR — the first tool needing the root finder; upfront vs financed fees |
| `/cong-cu/apr-nang-cao/` | Itemised fees, the APR that applies if you repay early, and what the loan has COST by that month against the full term |
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
| `/cong-cu/lai-co-dinh-hay-tha-noi/` | A **perspective of the loan comparison**: two named rate structures at one common horizon. Not a second form |
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
| `/cong-cu/ke-hoach-huu-tri/` | **The long-horizon trajectory** — accumulation then drawdown, in đồng, year by year, naming the year the money runs out. One of FOUR routes on one model; renders `longTermTrajectoryModel` |
| `/cong-cu/lam-phat-hoa-ky/` | Purchasing power on the US CPI series |
| `/cong-cu/tin-phieu-kho-bac-hoa-ky/` | US T-bill — discount yield and investment yield kept apart |
| `/cong-cu/thue-luong-hoa-ky/` | US payroll tax and paycheck deductions |
| `/cong-cu/tinh-huu-tri/` | The **contribution** the same plan needs, in đồng. A view of the long-horizon model, not a second form |
| `/cong-cu/thu-nhap-huu-tri/` | The **sustainable draw** the accumulation supports, beside the draw the reader wants; renders `longTermWithdrawalModel` |
| `/cong-cu/phan-tich-tiet-kiem-huu-tri/` | The capital **gap** — reached vs needed — and three priced remedies. No chart; the remedies are a `ResultTable` |
| `/cong-cu/phan-tich-thu-nhap-huu-tri/` | Income sources with their OWN indexation rates (US law) |
| `/cong-cu/gop-401k/` | 401(k) deferral, the match, and the four ceilings (US law) |
| `/cong-cu/toi-da-401k/` | Per-paycheck deferral to the limit; the front-loading trap (US law) |
| `/cong-cu/ira-truyen-thong-hay-roth/` | Traditional vs Roth from EQUAL after-tax cost (US law) |
| `/cong-cu/rut-toi-thieu-bat-buoc/` | RMD on the Uniform Lifetime Table (US law) |
| `/cong-cu/uoc-tinh-an-sinh-xa-hoi/` | AIME → PIA → benefit by claiming age (US law) |
| `/cong-cu/chi-tra-an-sinh-xa-hoi/` | Household benefit, spousal and survivor (US law) |
| `/cong-cu/phan-tich-an-sinh-xa-hoi/` | Claiming break-even, on totals AND present value (US law) |
| `/cong-cu/phan-bo-tai-san/` | Target mix, drift, rebalancing trades, real portfolio σ |
| `/cong-cu/nien-kim/` | Period-certain annuity; inverts an insurer's quote (US law) |

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
| `loan-compare.ts` | `compareLoans` — options priced against one principal AND one holding horizon, each with its own promotional path and fees. Ranked on `horizonCost`; `bestFullTermIndex` keeps the full-term ranking visible. Omit `horizonMonths` and it defaults to the longest term, where horizon measures equal full-term ones. **A half-specified promotion is REJECTED, never downgraded to a constant-rate loan** — pricing a contract the reader did not describe is worse than declining to price one. `exitFee` is charged at the HORIZON, not at origination: the date changes the APR |
| `loan-analysis.ts` | `analyseLoan` — crossover month, halfway points, per-quarter split. Takes the mortgage's `method`, so trả góp đều / trả gốc đều mean ONE thing in this suite, and an optional `selectedMonth` anywhere in the term. An out-of-range month is REFUSED, not clamped |
| `grace-loan.ts` | `computeGraceLoan` — ân hạn gốc AND a rate reset in ONE schedule. The grace end and the promotion end are INDEPENDENT months and routinely differ; the balance does not move during grace, the payment still changes if the rate changes inside it, and the balance standing at a later reset is re-amortized over what is left. A comparison that cannot be built returns `null`, never a zero difference — `extraInterest === 0` must mean the grace period was free |
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
| `affordability.ts` | `computeAffordability` — the reverse solve, via `pv()`. `affordablePrincipalInterest` is the monthly BUDGET the price was solved from; `expectedPrincipalInterest` is what the loan actually used charges. They differ whenever the cash bound the price, and calling the first one "trả gốc và lãi mỗi tháng" was a shipped defect |
| `affordability-compare.ts` | `compareAffordabilityScenarios` — which inputs differ between two scenarios, the signed differences, and whether the two sides answer the same QUESTION. No financial model: every figure is one `computeAffordability` already returned |
| `points.ts` | `computePoints` — includes the balance-aware hold comparison |
| `savings-goal.ts` | `computeSavingsGoal` — one entry point, three modes. CONTINUOUS: its `months` is fractional on purpose |
| `savings-schedule.ts` | `projectSavings`, `savingsScheduleFor` — the DISCRETE monthly projection. Every consumer month, balance and total on `/cong-cu/muc-tieu-tiet-kiem/` and in C09 comes from here, so the headline, the chart marker and the table cannot sit at three horizons. Bounded: `MAX_PROJECTION_MONTHS`, `MAX_SERIES_POINTS`. The funded test is STRICT wherever `balanceIsExact` holds (month 0 at any rate; a zero rate on whole đồng inside the safe-integer range) and only otherwise allows `FUNDED_ULPS` units in the last place of the larger figure — **never a fixed number of đồng, and never on arithmetic that had no error**. Both shipped: a fixed allowance funded a 1 ₫ goal at 0,5 ₫, and a ULP allowance funded a 1e15 ₫ integer goal three đồng early. The mode is PASSED IN, not inferred from whether a solve landed on an integer |
| `cash-flow-rate.ts` | `solveMonthlyFlowRate` — IRR over an arbitrary monthly flow vector, bracketed on the ANNUAL rate. For a payment path that CHANGES, which `solveRate` cannot take |
| `house-fund.ts` | `houseFundTarget`, `planHouseFund` — a home-purchase goal composed from the PRICE (deposit + costs-on-the-price + reserve, each once) and dated through `dates.ts`. The reserve is INSIDE the target and the whole starting fund earns the assumed rate; the alternative definition agrees on the funding gap and NOT on the date, so no equivalence is claimed. One projection: `projectSavings`. A higher contribution is compared only when explicitly entered, and `monthsEarlier` is null unless BOTH legs fund |
| `date-input.ts` | `readDateFields` — three form strings to a `CalendarDate`, with per-field blame. The day's own range can be judged alone; whether the day EXISTS waits for the month and year, or the error names the wrong field |
| `term-deposit.ts` | `computeTermDeposit` — simple interest in-term, compounding at rollover, months/12 by construction. Cycles bounded BEFORE the loop (`MAX_DEPOSIT_CYCLES` 120, `MAX_DEPOSIT_TOTAL_MONTHS` 1.200) |
| `deposit-plan.ts` | `planDeposit` — the same product against the DATE the money is needed, on actual days ÷ 365. Three horizons kept apart (first term, current term, whole plan); no interest after the last modelled maturity; the gap to maturity split into a same-days RATE difference and days NOT YET RUN, never one "penalty"; whole withdrawal only, declared; money AVAILABLE distinguished from a payment MADE that day; `beyondLimit` carries null figures, not zeros |
| `auto-lease.ts` | `computeAutoLease` |
| `card-debt.ts` | `payFixed`, `payMinimum`, `paymentForMonths`, `monthlyCardRate`, `minimumPaymentFor`, `MAX_CARD_MONTHS`. The daily accrual, the share-of-the-amount-due minimum and the floor are a SIMULATION of a common statement shape driven by the reader's own figures — not the terms of any named contract, which is why the rate, the share and the floor are all inputs. The last three exports exist so a page can tell "this payment never clears" from "this plan runs past the supported horizon", both of which come back as `null`, WITHOUT writing the month-1 rule a second time |
| `card-plan.ts` | `planCardPayoff`, `cardRefusalReason` — ONE dated plan with the other path beside it, behind both card routes. A level plan is compared against the declining minimum and the minimum against its own first payment held FLAT, so each route's point survives as a mode. `target` solves with `paymentForMonths` and then simulates that payment, so the quoted figure and the drawn schedule are one plan. `payoffDate` is `start + n months` anchored to the START day — chaining through the first payment date drifts on a short month — and the freed monthly amount is the household allocation that was ENTERED, never a declining minimum's first payment, which released nothing |
| `rental-property.ts` | `computeRentalProperty` — **two taxes, and two THRESHOLDS**, both defaulting to the 1 tỷ/năm of Nghị định 141/2026/NĐ-CP (which replaced 500 triệu, 01/01/2026). They coincide today and are separate inputs because the PIT deduction is allocated across one taxpayer's rental contracts, so `pitThresholdPerYear` is its own field (falling back to the VAT one) and `taxable` / `pitApplies` are reported separately. `pitReliefPercent` is the reader's DECLARATION of NQ43 eligibility, defaults to 0, and reduces PIT ONLY — taking 30% off the combined bill is wrong by 30% of the VAT. Both `pitPerYear` (before) and `pitAfterReliefPerYear` are returned so the two are never conflated |
| `rent-vs-buy.ts` | `compareRentVsBuy`, `compareGrowthScenarios`, `growthScenarioRates` — both sides start from the SAME upfront cash, and the renter's investable pool is that cash MINUS the rental deposit, because the landlord holds the deposit and it earns nothing while held (a deposit above the cash is refused, not financed). Month 0 owes the whole loan; `trajectory` carries both net costs at every month; growth scenarios are named, bounded and carry the rate they assumed. `growthScenarioRates(g)` is `[0, g, g+3]` de-duplicated — always the no-growth case and always the reader's own. `tied` is a THIRD verdict state banded by `TIE_BAND_DONG`, because `buyingWins` is `advantage > 0` and would call a tie a win for renting. A null `breakEvenMonth` has two meanings — never ahead, or ahead and overtaken before the horizon — and `trajectory` is what tells them apart. Term and horizon bounded by `MAX_RENT_BUY_MONTHS` before `amortize` allocates, and both bounds are named in the form |
| `apr.ts` | `computeApr` — shared by both APR pages and the comparison's fee view; solves via `solveRate`. Terms and payoff months bounded by `MAX_APR_MONTHS`. Also returns the MONEY at a chosen payoff month, because a rate is not a sum: `payoffInterest`, `payoffCost` (= interest + every fee, counted once) and `payoffBalance` (principal still owed, deliberately NOT inside the cost). `payoffCost` equals the settlement-economic cost `H × payment + balance + cashFees − amount`, and at H = term it degenerates into `totalCost` |
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
| `long-term-plan.ts` | `resolveLongTermPlan` — ONE `RetirementInput` resolved into all four long-term views at once (trajectory, required contribution, gap + three remedies, withdrawal + three paths), so rows 44/45/48/50 cannot disagree. No engine of its own: every figure is `projectRetirement` or `solveRequiredContribution`. Also `fundedAtBoundary`, `firstFundedRetirementAge` and `MAX_EXTRA_WORKING_YEARS` (7) — the retirement-age search and the remedy set MOVED HERE out of `retirement-savings-analysis-calculator.tsx`, where finance in JSX is invisible to a module test, and the `retireLater` remedy is what replaced that loop. **`fundedAtBoundary` is the funded verdict** — a closed-form sustainable spend fed back through the projection can leave the FINAL year unpayable by ~1e-8 đồng, and that is float residue, not a missing year; it is forgiven only in the final year, only when negligible against that year's need, and the residue is reported. Read the next paragraph before believing "every view uses it": that was true of this module and FALSE of the product for one whole unit. `monthlyEquivalent` is `annual / 12`, a BUDGETING division: twelve month-end deposits land BEHIND one January deposit, so it is not a funded monthly instruction. Nothing here formats or localises |
| `tvm-questions.ts` | `answerTvmQuestion` — the three everyday questions behind the TVM page (original row 18). An ADAPTER with no engine: the algebra is `solveTvm`, the schedule is `projectSavings`. Amounts arrive POSITIVE as a saver states them, the sign convention is applied once and reported on `signed`, and end-of-month contributions are the only timing — the annuity-due option stays in the advanced mode, where no schedule is drawn. **An algebraic period is not a contribution schedule**: 36,56 periods and a funded month of 37 are both reported and never substituted for each other |
| `rental-scenarios.ts` | `compareRentalScenarios` — the reader's own rental inputs under three named variations (one more empty month a year, running costs +50%, both). No engine: every figure is `computeRentalProperty`. Each scenario is rebuilt from the ORIGINAL input, so nothing compounds; vacancy is capped at 100% and the figure used is reported; a null ratio stays null rather than becoming a zero difference |
| `floating-loan.ts` | `computeFloatingLoan`, `buildPhases`, `compareFixedFloating`, `compareRateStress`. **Bounded at `MAX_FLOATING_MONTHS` (1.200) BEFORE the schedule loop allocates**, for every consumer — the floating tool, the fixed/floating perspective, the comparison's promotional offers and the education visuals. `compareRateStress` builds the reader's own schedule AND one named ±percentage-POINT scenario from the same inputs, so selecting a preset twice cannot compound; it reports the budget gap at the RESET and at the PEAK separately, because a stepped scenario can fit one and miss the other |
| `fund-fees.ts` | `computeFundFees` — runs the plan with and without fees |
| `commercial-loan.ts` | `computeCommercialLoan` — grace period and balloon |
| `tax-equivalent.ts` | `computeTaxEquivalent` |
| `education-savings.ts` | `computeEducationSavings` — target is a discounted stream |
| `withdrawal.ts` | `computeWithdrawal` — perpetual draw off the real return |
| `units.ts` | `convertUnit`, `UNITS` — one factor per unit, no pairwise table |
| `vehicle-budget.ts` | `compareVehicleBudget` — the household month with and without a car (original row 31). `vehiclePayment` is `number \| null`: `0` is a cash purchase, `null` is an unpriceable loan and withholds every with-car figure. `?? 0` there shipped an invalid rate as a free car |
| `commute-compare.ts` | `compareCommutes` — two manually entered one-way commutes on ONE basis (original row 68), each priced through `computeFuelCost` so the round-trip doubling happens once. Household and per-person figures are both returned and never mixed; a BLANK workday count withholds the month rather than reading as zero, and derived non-finites are refused before an SVG can see them |
| `fund-allocation.ts` | `allocateFunds` — one pot split by purpose and need date (original row 56). Keeps ALLOCATED, UNALLOCATED, SHORTFALL and TIME-NOT-STATED apart; the requested total is never reported as funded. Purposes draw in the reader's order and `orderMatchesTimeline` reports whether that matches the dates as a fact, not as advice |
| `raise-savings.ts` | `planRaiseSaving` — a chosen share of a stated NET rise, through `planHouseFund` → `projectSavings` (original row 63). No engine of its own. Four distinguishable states: compared, baselineOnly (a 0% share preserves the baseline exactly), unknownNet (a gross rise is never converted to a net one — there is no tax model), payCut (frees nothing, never a negative contribution) |
| `normal.ts` | `normalCdf`, `normalPdf`, `inverseNormalCdf` |
| `black-scholes.ts` | `computeBlackScholes` — European call/put plus greeks |
| `retirement.ts` | also `requiredRealBalanceAtRetirement` — the EXACT inverse of `sustainableSpending`, from one shared annuity factor |
| `retirement-income-sources.ts` | `projectIncomeSources` — one indexation rate PER SOURCE |
| `us-retirement-limits.ts` | The dated 401(k)/IRA ceilings, `catchUpTier`, `catchUpMustBeRoth` |
| `us-401k.ts` | `computeUs401k` — four ceilings, each on what the statute binds |
| `us-401k-max.ts` | `computeUs401kMax` — per-paycheck deferral; per-period vs true-up match |
| `us-ira.ts` | `computeUsIra` — traditional vs Roth on equal after-tax cost |
| `us-rmd.ts` | `computeRmd`, `UNIFORM_LIFETIME`, `rmdStartAge` |
| `us-social-security.ts` | `piaFromAime` (dated bend points), `benefitFactorPercent`, `spousalFactorPercent`, `householdBenefit`, `claimingAnalysis`, `earningsTestWithholding` |
| `asset-allocation.ts` | `analyseAllocation`, `mixStatistics` — the full covariance sum, not an average of σ |
| `annuity.ts` | `computeAnnuity` — period certain, exclusion ratio, and the quote inverted |

**UI** (`components/calc/`): `CalculatorPage`, `calculatorMetadata`, `CalculatorCard`, `FieldGroup`, `NumberField`, `SelectField`, `RadioGroupField`, `ResultGroup`, `ResultRow`, `ResultTable`, `DetailFigures`, `CalculatorDisclaimer`, `useCalcFields`.

**Editorial emphasis is DATA beside the paragraph, never markup inside it.**
`lib/prose-emphasis.ts` (`emphasise`, `missingPhrases`, `emphasisShare`) plus
`components/ui/prose-text.tsx` render editor-selected phrases as `<strong>`
from a plain string and a separate phrase list. Read that module's docstring
before touching any explanation copy — it records why a span-tree content type
and an automatic rule were both rejected. Three consequences that will bite:

- **The paragraph is still one string**, so the search index, the JSON-LD and
  what a reader copies cannot drift from what they see. Joining the returned
  spans reproduces the input exactly, and tests assert that on real content.
- **A declared phrase that matches nothing is a FAILING TEST**, not a silent
  no-op — `missingPhrases` is what `content/education/reading-comprehension.test.ts`
  and `plan-disposition.test.ts` use. Reword a sentence and its phrase list has
  to move with it.
- **Emphasis is capped.** `MAX_EMPHASIS_SHARE` (0,3 for articles, 0,2 for a
  calculator's method) is a ratchet at today's maximum, exactly like
  `MAX_LIVE_ROWS`. The first pass of the reading unit emphasised 31–51% of
  several short answers and that assertion is what caught it.

`CalculatorPage`'s `prose` takes an optional `emphasis`. **Three routes render
their own page body and do NOT inherit it** — `vay-mua-nha`, `quy-tac-72` and
`tra-no-hai-tuan` — so a route filed as `emphasis` there needs the prop
threaded through by hand. `check:markup` fails when a row filed `emphasis` in
`content/calculators/plan-disposition.ts` ships no `<strong>`, which is the
only check that can tell "declared" from "rendered".

**`CalculatorPage` takes `sources`** — `{ title, intro?, items: [{ url, label,
note? }] }`, field for field the same shape an education article's source list
uses, rendered as real links below the FAQ. Optional, and it should stay
optional: most of the 75 compute arithmetic with nothing to cite, and a "Nguồn"
heading over nothing is worse than no heading. The case it exists for is a tool
that PREFILLS a legal or tax parameter — naming a decree and a date in prose is
not a citation a reader can check, which is what an independent review found on
`loi-suat-tuong-duong-thue`. `intro` is where the provenance limit goes, because
a list of official links implies a completeness no page here has earned.

**A shared disclaimer must not infer the MODEL from the FORM.** The default text
in `content/calculators/shared.ts` has now been wrong twice in the same way. It
first asserted a constant user-supplied rate on all 75; its second version made
that conditional on there being a rate field and said tax and fees are counted
only where a box exists. Both fail on live routes — `ke-hoach-huu-tri` has rate
fields and uses different returns before and after retirement, and
`thue-luong-hoa-ky` applies statutory tax with no rate box — so the default now
says only that the figures come from the inputs AND the assumptions written on
that page, and points at the page's own stated scope. Accurate per-route
overrides are where the real assumptions live; keep them.

**`READING_DISPOSITIONS` records a PLANNED treatment for all 75 rows, not
completion.** `emphasis` is verified against the content files and the built
HTML; `context`, `direct` and `reference` only assert that this pass added
nothing, and `READING_WORK_PENDING` names the rows whose own unit has not run
— eleven when the reading pass shipped, four after the eighteenth unit took
the seven capital rows off it, and **EMPTY as of the long-horizon unit**, which
took the last four off. Do not read a label there as evidence a row is
finished, and do not read the empty list as evidence the suite is: it says only
that no row's reading treatment is still blocked on a unit that has not run.
Per-row completion lives in the execution record.

**An empty `READING_WORK_PENDING` is the CORRECT terminal state, and the
guard has to survive it.** That list reaching zero broke its own test twice,
in the same file, for the same reason — see §8. The current shape is the one to
copy: the check is a helper taking the list AS A PARAMETER, so the empty case
can be exercised without emptying the real one; it reports BOTH directions (a
row that ships verified emphasis but is still listed, and a listed row claiming
`emphasis` with no prose to back it); and its vacuity guard DERIVES both
controls by searching the data, naming no slug. Derived on this tree, the
treatment tally across all 75 rows is 13 `emphasis`, 27 `context`, 4 `direct`
and 31 `reference`; re-derive rather than quoting that.

**A value never holds itself at content width on a phone.** `ResultRow` and
`DetailFigures` stack label ABOVE value below `md` and apply `md:shrink-0`, not
`shrink-0`. The unprefixed version squeezed a nine-digit figure's label into a
one-word vertical column at 390 px, worse inside a 266 px detail panel. Both
take `prose` for a value that is a sentence rather than a figure — a verdict
given the figure treatment cannot shrink and pushes the row past its container.

**`DetailFigures` is the block for an expanded detail panel**, in place of
`ResultGroup live={false}` + `ResultRow`. It takes `{ label, value, prose? }[]`
so it can see every amount at once and pick ONE money unit for the block —
context is unavailable in a server component, and these panels are
server-rendered. Amounts are compact by default with the exact reading behind
the same checkbox `ResultTable` uses. A real `<dl>`, an `h3`, no `aria-live`.

**`ResultTable` takes `mobileCards`** for a table too wide to read at 390 px
even compacted: below `md` it renders one block per row — the row's first cell
as a heading, then label/value pairs from the column headings. Exactly one of
the two presentations is in the accessibility tree at any width
(`hidden`/`md:hidden` is `display: none`), both are built from the same cells,
and one precision control drives both.

**The rule is five columns up; four fit at 390 px compacted** — the same rule
stated under `ChartTable` below, and it applies to every `ResultTable`, not
only to chart tables. This paragraph used to end "Only the floating-rate tool's
six-column phase table needs it; the four-column mortgage and comparison tables
fit." That "only" was true once and then did active harm: **two separate agents
read it, took it at face value, and concluded `mobileCards` did not apply to a
six-column table** — one of them recorded the condition backwards as "starts at
five columns, so a three-column table correctly has none", and the other left
three Social Security tables scrolling because it never reached the `ChartTable`
paragraph twenty-five lines down. On row 54 that meant a six-column table at
596 px inside a 300 px frame, with **three of six columns off-screen** at 390 px
— and the three off-screen ones were `Tổng danh nghĩa`, `Giá trị hiện tại` and
`Hòa vốn so với 62`, while the paragraph directly beneath the table explained a
comparison between two of them.

Do not restate the call-site count here. It has been wrong twice: there are now
seven non-chart call sites plus the chart adapters, and a sentence naming "only
the floating-rate tool" is how the previous count rotted. Derive it when you
need it, and state the RULE rather than the census.

**`ResultTable` takes typed cells now, and that is how a table stays readable.**
`lib/calc/table-cell.ts` exports `moneyCell` / `percentCell` / `countCell`. A
table built from them shows every AMOUNT in one stated unit — "Số tiền: triệu
đồng", `166,1` / `100,0` / `1.900,0` — with the exact đồng figures behind a
checkbox. Three rules the module exists to keep:

- **Never scale from a formatted string.** Turning "166.083.333 ₫" into triệu
  means parsing localized text back into a number, which is §4's 1000× grammar
  trap. A cell carries the raw engine value; rounding is display only.
- **A rate and a count are not amounts.** `percentCell(8.5)` is "8,50%" in both
  readings and `countCell(240)` is "240". Only `moneyCell` is ever divided.
- **A real charge never renders as zero.** A non-zero figure that rounds away
  at the table's precision shows `< 0,1`, not `0,0`.
- **A table of amounts always states its unit.** Typed cells carry no currency
  symbol — that is what stops a "₫" wrapping onto its own line — so the unit
  line is the only thing saying the figures are money. Stating it was
  originally gated on the table being switchable, and a 400.000 ₫ loan then
  rendered `33.695 | 7.961 | 392.039` with no currency anywhere. The line is
  gated on there being an amount; only the CONTROL is gated on the unit, since
  in đồng both readings are the same figures.

The unit is chosen from the SMALLEST non-zero figure, not the largest: a
max-based rule puts a mortgage table into tỷ because of the opening balance,
and then a year's principal reads "0,04" on every row. A plain `string` is
still a valid cell, so the ~30 calculators that pass pre-formatted rows are
unchanged. The compact/exact switch is a native checkbox plus a `:has()` rule
in `app/globals.css` — no state, no `"use client"` — because `ChartFigure`
renders this from the server-rendered education pages.

**The acquisition shell** (added 2026-09-14 on the 5 P1 tools; `thue-hay-mua`
and the card workspace joined it on 2026-09-15):

| Component | What it owns |
|---|---|
| `ExampleNotice` | The labelled example-vs-your-figures state, and the reset. A prefilled result is not evidence the reader got an answer, so the page says which it is. |
| `AdvancedFields` | A `<details>` panel that states what is ACTIVE inside it on its own summary line and opens itself when anything inside is moving the result. Collapsed AND silent is not allowed. |
| `ToolNextSteps` | The route to the next buying question, plus the honest statement that this site stores nothing. Renders nothing for a tool with no entry in `content/calculators/next-steps.ts`, which is most of the 75 — re-derive the count from that file rather than trusting a number here. |
| `ChartFigure` + `BarChart` / `ColumnChart` / `LineChart` | The chart frame and the three plot shapes. See below. |

**`palette.ts` decides a segment's colour, and nothing else may.** A segment's
fill comes from its KEY through `paletteIndexByKey`, which orders keys by the
model's own `legend` and appends any drawn key the legend does not name.
`BarChart` and `ChartFigure`'s swatches read the same map, because they
previously disagreed: the plot coloured by a segment's position INSIDE ITS OWN
BAR and the legend by position in the legend array, so on any model where one
bar omits an earlier segment — which `segment()` causes whenever it drops a
zero — the same key drew in two colours and matched no swatch. A reader
matching a colour to the legend read the wrong quantity. Four slots, so colour
is never the only channel: segments stay ordered and labelled and every model
still ships a table.

**A LINE series' legend mark is a line, and it carries that series' own dash.**
Fixed 2026-09-17 after the defect was measured on the live site. `ChartFigure`
built its line legend with `model.series.map((s) => ({ key, label }))` and
dropped `s.stroke`, so the plot separated series on two channels — colour and
`STROKE_DASH` — while the key that explains the plot separated them on one.
That is "colour is never the only channel" holding on the drawing and breaking
in the legend, which is the worse of the two places to break it: the legend is
the only thing mapping a label to a line. On
`/blog/lai-co-dinh-hay-tha-noi/` at a verified 390 px that meant three solid
dots for `ink-3` solid / `brand-green` dashed / `brand-softgreen` dotted, and
slots 1 and 2 are two greens measured 1,75:1 apart from each other. A line
series now renders an 18×10 `<svg>` whose `<line>` reads the SAME
`STROKE_DASH` entry the plot does; a bar or area segment keeps its solid
`bg-*` block, because a fill's mark should look like a fill. Two consequences:

- **Do not assert a `viewBox=` count as a proxy for "one plot".** A line chart
  now emits one legend `<svg>` per series on top of its plot. That is the
  warning under `BarChart` below arriving —
  `components/card-payoff-calculator.test.ts` pinned `viewBox=` at 1 and had to
  be rewritten to exclude `viewBox="0 0 18 10"`. Assert `aria-hidden` and
  `focusable="false"` over EVERY `<svg>`, which is the real contract.
- **The invariant is in `components/calc/chart/legend-render.test.ts`**, not
  just the markup: no two series may share BOTH slot and dash. That test needs
  its vacuity guard — `legendMarks` returns `[]` when the legend renders solid
  blocks, and `new Set([]).size === [].length`, so the invariant held
  truthfully over nothing until a length assertion was added. §8 defect 22 is
  the same shape, and it caught this one.

**A bar chart's labels are HTML, not svg text.** `BarChart` renders each bar's
name and total above its own track and emits one small SVG per bar plus one
for the tick row. A fixed 10-unit `<text>` in a 360-unit viewBox renders around
8 px at a 300 px plot, which is what an independent review measured on a
phone. Only tick numbers stay inside a drawing, for the reason `geometry.ts`
gives about axis titles. Consequence for tests: **do not assert one `<svg>`
per chart** — assert that every `<svg>` is `aria-hidden` and
`focusable="false"`, which is the actual contract.

**A sentence whose content IS a difference must not round its own terms.**
`compactMoney` is right for an axis and wrong for a summary comparing two near
figures: at one decimal place in tỷ it renders both a 2 tỷ debt and a 1,965 tỷ
payout as "2,0 tỷ", and it renders "1,0 tỷ trong 1,1 tỷ … thiếu 50,0 triệu",
whose three numbers contradict each other. `net-proceeds-chart` and
`fund-allocation-chart` use `fullMoney` in their summaries for exactly this
reason, and each says so at the call site.

**Charts** (`lib/calc/charts/`): `types.ts` (`niceMax`, `linearTicks`),
`palette.ts` (`paletteIndexByKey`, `paletteSlot`), `bars.ts` (`emptyBars`,
`segment`, `barOf`, `finishBars` — the generic bar-model builder shared by
`affordability-chart`, `vehicle-budget-chart`, `commute-chart`,
`net-proceeds-chart` and `fund-allocation-chart`),
`labels.ts` (`compactMoney`, `fullMoney`, `axisUnit`, `axisTickLabel`, `fill`),
`geometry.ts` (`PLOT`, `linePath`, `areaPath`, `stackSegments`,
`stackedAreaPaths`), and the adapters: `loan-chart`, `affordability-chart`,
`floating-chart`, `savings-chart`, `compare-chart`, `grace-chart`,
`apr-chart`, `refinance-chart`, `compound-chart`, `deposit-chart`,
`rent-buy-chart`, `card-chart`, `debt-path-chart`.

**`debt-path-chart` is the shape two questions share**, so it is one adapter
with two callers: C07 puts a 240-month schedule beside a 300-month one and
C10 puts a schedule with an extra payment beside the same loan without one.
Both are "two balances falling at different speeds, each ending on its own
month". Month 0 is the SHARED OPENING BALANCE, passed in separately —
`amortize` pushes CLOSING balances, so a path drawn from rows alone starts a
month in and understates the debt at the start, and two paths on one loan
must visibly begin from the same place.

**`refinance-chart` draws TWO signed ledgers, not one.** `costSaving` counts
the debt still owed and `cashFlowSaving` counts only money already handed
over; they cross zero in different months (14 and 18 on C12's fixture) and
the order REVERSES when the new term is stretched (cash at 10, economics
still at 14). Each gets its own line, its own marker and its own words. A
reader shown one "break-even" cannot know which of the two it is.

**`ChartTable` takes `mobileCards`**, plumbed through `ChartFigure` to the
`ResultTable` mechanism below. Set it from five columns up; four fit at
390 px compacted.

**A SIGNED axis is not a positive one with minus signs on it.** Three of
these draw a quantity that is genuinely negative — a cost saving that has
not arrived, a net cost the modelled gain exceeded, the advantage of buying
before the crossing. `rent-buy-chart`'s `signedBounds` lifts each end to its
own `niceMax` rung and always keeps 0 inside the plot, so the reference line
at zero is real and an all-positive series still gets the whole plot height;
`yFor` takes the `yMin`. Clamping a negative to the baseline to fit a
positive-only axis deletes exactly the case a comparison tool exists to show.

**Three strokes is the ceiling on a multi-line comparison.**
`ChartSeries.stroke` has solid, dashed and dotted, and colour is never the
only channel — so a fourth line on one plot would be told apart by colour
alone. `rentBuyScenariosModel` refuses more than `MAX_SCENARIO_SERIES` (3)
with a reason and a recovery instead of drawing an ambiguous fourth, and
`growthScenarioRates` cannot return more than three.

**A STACKED AREA is a fourth model kind, and it is not three filled lines.**
`AreaChartModel` + `stackedAreaPaths` + `AreaChart` draw disjoint cumulative
bands that sum to the top edge; `ChartSeries.area` fills each series from
ZERO, so three of those overlap and no band's own height can be read. Original
row 16 needs the former. Its x axis is REAL elapsed time and may be
fractional: 1,5 năm ghép nửa năm credits three periods and its last point sits
at 1,5, labelled by time rather than as "Năm 2".

**An END-OF-PERIOD row is not the period's own date, and a mandatory table
row is never dropped to hit a row count.** Both from `long-term-chart.ts`,
both measured on the live adapter. `RetirementYear` is an end-of-year row, so
placing it at `age − currentAge` showed the balance after a full year of
growth as today's, ended a five-year plan at 4, and put the retirement marker
on the end of the first retirement year rather than on the capital at the
retirement date. The timeline is now explicit: period p is the DATE p years
from the start, period 0 carries the true opening capital and is not an engine
row, an engine row for age `a` sits at `a − start + 1`, and the age at a date
is `startAge + date`. Separately, its table used to gather mandatory and
optional years into one set, sort, and slice — which silently dropped the
horizon. Mandatory dates are chosen FIRST and never truncated; the bounded
fill takes what is left.

**Four URLs, one model, one content object, one view control.** Original rows
44, 45, 48 and 50 are `/cong-cu/ke-hoach-huu-tri/`, `/cong-cu/tinh-huu-tri/`,
`/cong-cu/phan-tich-tiet-kiem-huu-tri/` and `/cong-cu/thu-nhap-huu-tri/`, and
all four are kept — a merge here means one engine and one set of defaults, not
one page. Three shared pieces, and which one owns what matters:

- **`content/calculators/long-term-plan.ts`** exports `LONG_TERM_PLAN` with
  exactly four top-level keys: `defaults` (eleven đồng-denominated input
  strings), `money` (`currency: "₫"` plus the magnitude words), `fields` (group
  titles, three invalid messages, and the label/unit/help triple for every one
  of the eleven fields), and `views` + `scope`. **The eleven defaults live here
  once**, so the four routes cannot open on different assumptions, and
  re-denominating is one file rather than four.
- **`components/calc/long-term-views.tsx`** (`LongTermViews`) is the four-view
  control, rendered through `CalculatorPage`'s `afterCalculator` slot with
  `current` set to `trajectory` / `contribution` / `gap` / `withdrawal`. Its
  items come from `LONG_TERM_PLAN.views`, so a route cannot advertise a view
  that does not exist — an unknown slug THROWS rather than rendering a dead
  link — and the current view is a non-focusable `aria-current="page"` element
  rather than a link to the page you are already on.
- **`longTermMoney`** in `components/calc/retirement-fields.tsx` is the one
  formatter these four use: `formatMoney` plus the shared `₫` suffix, so the
  suffix is not re-typed per call site.

**Only two of the four render a chart**: row 44's `longTermTrajectoryModel` and
row 50's `longTermWithdrawalModel`, both from
`lib/calc/charts/long-term-chart.ts`. Rows 45 and 48 have no figure — 48's
three priced remedies are a `ResultTable` with `mobileCards`, not the bar
comparison the model slice's handoff sketched. Treat that as an open gap rather
than a decision, and see §7.

**An axis of COUNTS is ticked by `countTicks`, not `linearTicks`.**
`linearTicks` cuts an axis into equal intervals and lets the caller format
whatever value lands there — right for money, wrong for months and years. On a
three-year plan its five ticks fall at 0 / 0,75 / 1,5 / 2,25 / 3, and a
formatter that rounds prints "0, 1, 2, 2, 3": the label 2 drawn twice at two
different dates, year 1 missing. `countTicks(max, maxTicks, format)` chooses
whole counts first, positions each at `value / max`, always keeps the last one,
and keeps a genuinely fractional end as its own tick. `value-paths-chart` uses
it. **The other seven line adapters still round labels on fractional
positions** — `debt-path`, `rent-buy` (×2), `savings`, `compare`, `floating`,
`card` — which is invisible at their 240-to-1200-month horizons and real on a
short one; migrate each when its markup is next allowed to move.

**`value-paths-chart` samples a GLOBAL horizon, so every path's own endpoints
are mandatory.** `valuePathsModel` is the shared "a few labelled quantities in
đồng over time" adapter behind rows 25, 26, 27 and 18. Its stride runs over
`xMax`, and a path that ends before that had no point at its own last period
unless the stride happened to land there: two paths of 0..179 and 0..1200 drew
the short one to 170 and dropped its 179 row from the table — nine months of a
drawdown deleted at exactly the end. Each path's first and last period is now
in the mandatory sample set beside the caller's markers. It also takes
`references` (a horizontal rule for a target AMOUNT — a goal drawn as a
vertical marker would say the goal was a date; the axis lifts to hold a target
no path reaches) and an `unavailable` override, because `ChartFigure` renders
the reason and recovery INSTEAD of the summary when a model is unavailable.

**A bridge is one adapter shape with two ledgers.** `net-proceeds-chart` (row
67) and `rental-waterfall-chart` (row 15) both draw a step bar as the cash that
was in hand split into KEPT and TAKEN, so the deduction is a drawn quantity
rather than a difference between two bar lengths. The step ORDER is the
engine's, because each step is the base of the next.

**A DEFICIT IS A DRAWN QUANTITY TOO, and "a bar has no signed form" is not a
reason to omit it.** The rental bridge first clamped its debt step at the cash
that existed and put the shortfall in prose. Review measured the result: a
194,34 triệu debt service against 147 triệu of available cash rendered as a bar
truncated at zero, with the 47,34 triệu that decides the whole question living
only in a sentence — and the plan row asks for "rent → costs → debt →
remaining/SHORTFALL" in the FIGURE. Now the short step splits into what the
rent covered and what it did not, and the closing bar is a `deficit` bar on the
same axis with its own legend entry and its own colour, so its length is
comparable to the rent bar. Three quantities reconcile in the summary, in the
table and in the drawing: available + deficit = debt service. A deficit bar is
NOT a cash bar and never carries the cash label. Row 67's negative net is still
withheld rather than drawn, and that is a different judgement: there a negative
net is a small transfer eaten by a flat fee, here it is the answer the tool
exists to give.

**A timeline is not a chart of amounts.** `depositTimelineModel` +
`DepositTimeline` order dates, not money — the deposit, the needed date and
the relevant maturity — with a decorative track over a real ordered list, so
the figure reads with no CSS and a marker collision costs nothing.

`loan-chart` has a third granularity, `"window"`: the same 24-month stacked
columns positioned to CONTAIN an examined month, sliding back from the end so
the last months of a loan are reachable. It is used only by
`/cong-cu/phan-tich-khoan-vay/`, where original row 6 requires arbitrary
examination; the mortgage page's `"year"` and `"firstMonths"` are unchanged and
a test pins that. `ChartColumn.emphasis` marks the examined period as an
OUTLINE — a shape, not a colour, like the series strokes.

**The rule the chart layer exists to keep:** an adapter turns a calculator
result into a FULLY RESOLVED model — every number, label, tick, and the
accessible table — and the components draw it without computing anything. A
chart that disagreed with its own table would have to be a bug in an adapter,
where a test can see it. No user-facing Vietnamese in `lib/`: the magnitude
words arrive from `content/calculators/chart-ui.ts`.

**Do not add chart chrome for consistency.** Plan rows that say "không cần
chart" have none. A direct answer and a compact table is the right output for
a simple utility.

**`CalculatorPage` is the page shell, and it owns the two contracts a hand-written page could silently drop:** it always renders `<CalculatorDisclaimer />`, and it reads the registry's `usRules` flag itself and renders the `us-rules` variant above the calculator. It also throws during `next build` on a slug that is not in the registry. Both gaps from the SP-0 review are closed by using it.

The calculators built before the shell existed still render their own page bodies. That is deliberate: their built HTML is a regression gate, and rewriting them through the shell would move rendered markup for no functional gain. Migrate them whenever their markup is next allowed to change — `/cong-cu/chi-tra-lai/` moved on 2026-09-15, when original row 14 rewrote its model, framing, form and charts anyway.

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
pnpm gate                                  # the whole deploy gate, one command — see below
pnpm test                                  # all suites
pnpm exec tsc --noEmit                     # must be clean
pnpm check:lint                            # pnpm lint fails at baseline; this is the real pass/fail
pnpm exec next build                       # static export to out/
pnpm check:markup                          # rendered-markup contracts; run AFTER next build
pnpm verify:commits [range] [--tests-only] # per-commit gate over a range, in a throwaway worktree
pnpm lint                                  # see the baseline below — do not use this as pass/fail
```

**`pnpm lint` fails at baseline and always has.** Exactly three pre-existing problems, none in this suite's files:

- `components/site-header.tsx:52:5` — error, `react-hooks/set-state-in-effect`
- `components/site-header.tsx:83:5` — error, same rule
- `scripts/header-cmp.mjs:13:10` — warning, unused variable

**Pass condition is "no NEW problems beyond those three", never "clean".** Do not fix those two files; they are outside this work.

**`pnpm gate`** (`vitest run && tsc --noEmit && pnpm check:lint && next build && pnpm check:markup`)
is the one place this sequence is defined. `vercel.json`'s `buildCommand` and
`.github/workflows/ci.yml` both call it, so the deploy gate and the PR-time gate cannot
silently drift into checking different things. `scripts/verify-commits.mjs` is deliberately
narrower — it walks arbitrary history, and `check:lint`/`check:markup` did not exist for most
of this branch's commits — so its full mode runs vitest + tsc + build only; see its own top
comment. A failing step anywhere in `pnpm gate` blocks deployment. Accepted trade-off: a red
test also blocks deploys of unrelated content changes, and now so does a rendered-markup
contract breach.

**The build needs about 1,3 GB of free disk** for `.next` plus 125 MB for `out`. This machine ran out of space mid-session at 127 MiB free, which broke every tool call until `.next` and `out` were cleared. Both are gitignored and regenerable, so deleting them is the fix. If a verification step fails oddly, check `df -h /` first.

**None of the commands above checks appearance.** Every one of them is a test, a
typecheck, a build, or a grep on the built HTML in `out/`. Layout, contrast,
touch-target size and overflow are unverified by a fully green gate.

**A browser IS available on this project, and that changes what may be
claimed — not what a green gate proves.** The blanket "there is no browser
automation in this environment" that used to close this section is wrong and
has been wrong since 2026-09-14; §6 records the observations that have actually
been made, each tied to a viewport that was MEASURED at capture time rather
than assumed. The standing rule is narrower and is the one to follow: a visual
item is verified only if it was observed in a browser at a stated, measured
viewport, and everything else is unverified. Do not fake a browser
observation, and do not promote an inference from JSX or built markup into one.

## 6. Open decisions and known gaps

> **READ THIS BEFORE ACTING ON ANY "unverified at 390 px" CLAIM BELOW.**
>
> On **2026-09-16** every live route was rendered and measured at a **verified**
> 390 px and 1280 px layout viewport. The results are in
> **`docs/visual-evidence.json`**, and `pnpm check:done` reports coverage from
> that file rather than from prose. Several bullets below predate it and are
> struck where they are now false. **Do not redo the geometry sweep** — it is
> recorded, and it is cheap to re-run from the method the manifest documents.
>
> **What it established (75 of 75 routes, both viewports):** `innerWidth`
> matched the requested viewport on every route; **no route** produced
> `documentElement.scrollWidth` greater than the viewport, so nothing makes the
> PAGE scroll sideways; 11 routes contain an element wider than 390 px and all
> 11 are tables inside the `ResultTable` frame, which is the intended
> containment; every one of the 75 tool links on the hub is exactly 44 × 350 px
> at 390 px, meeting the touch-target minimum; and the same 30 routes ship
> `<strong>` at both viewports with identical counts.
>
> **What it did NOT establish, so the bullets about it stay open:** this was a
> GEOMETRY sweep. It says nothing about colour contrast, focus order, whether a
> chart's zero reference or below-axis region reads correctly, whether a
> compact figure is legible, or whether a drawing is the right drawing. A table
> that fits is not a table that reads well. Every bullet below about a FIGURE
> or a CHART remains a browser question for a person.
>
> **One method warning, because it produced false evidence before it was
> caught:** `chrome --headless --screenshot --window-size=390,844` is NOT a
> valid way to do this on a macOS host. The window clamps to a minimum between
> 500 and 560 CSS px and the image is then CROPPED — captures at 390 and at 500
> came back pixel-identical in their left 390 columns while 560 reflowed. The
> file is 390 wide and the layout is not. The manifest records the working
> method (same-origin iframes at an explicit width against the built export)
> and asserts `viewportVerifiedForAll` so a future harness cannot quietly
> repeat the mistake.

**Needs a human:**

- **Expanded-detail readability at 390 px and 1280 px.** The stacked rows, the
  compact detail figures and the floating tool's phone blocks are unverified by
  eye. Codex measured the chart/detail TABLES at 390 px; the label/value rows
  and the block list have not been looked at.
- **What the eighteenth unit's surfaces have and have NOT been seen.** Correcting
  a blanket claim this entry made: the supervisor's own review drove the live
  pages and recorded bounded browser evidence for several of them —
  `fund-fees-mobile-exact.png` (row 27's typed table at 390 px in both
  readings), `tvm-month37-mobile-exact.png` (row 18's month-36/37 boundary in
  the chart and table), `education-fund-mobile-exact.png` (row 25's ledger in
  compact and exact readings), row 26's caveat switching branch at 2 tỷ / 8% /
  −4%, and row 24's three primary-source links. Those are ACCEPTED observations
  and are not mine to re-claim; the artifact folder holds them. What remains
  unobserved is everything the nineteenth repair changed: row 15's waterfall
  with its DRAWN deficit bar and split debt step, its five-column scenario
  table at 390 px, row 15's 1 tỷ tax defaults on the live form, row 18's
  already-funded headline, and row 25's withheld monthly figure with its gap
  rows. Rendered-markup tests cover structure and that the drawings change;
  nothing here covers pixels, and no browser ran in this session.
- **The four education path figures added on 2026-09-15 have never been
  seen.** C07's and C10's two-debt-path charts, C11's three stepped payment
  lines and C12's two signed ledgers are all unobserved, and so is the
  five-column refinance table's one-block-per-month fallback below `md`.
- **The two figures added on 2026-09-15 have never been seen.**
  `/cong-cu/thue-hay-mua/` now renders a two-line net-cost trajectory and a
  three-line signed scenario band — the first charts in the suite with a
  negative `yMin`, so whether the zero reference and the below-axis region
  read correctly is a browser question. The card workspace draws a 125-month
  minimum curve beside a 22-month one in a single plot, and its form puts a
  budget field and a three-field date row plus a "today" button in one group.
  Neither the negative axis nor that form row is verified at 390 px.
- **Table readability at 390 px and 1280 px.** The 2026-09-14 unit rebuilt the
  mechanism — one stated compact unit per table, real column gaps, unbroken
  figures, a keyboard-reachable scroll frame, an exact-đồng reading behind a
  checkbox — on the five P1 tools. Whether the compact mortgage table actually
  fits a 390 px viewport, and whether the exact one scrolls inside its own
  frame rather than moving the page, are BROWSER observations and are not
  verified here. The other 70 routes still pass pre-formatted đồng strings and
  read exactly as they did.
- **~~Visual layout.~~ MEASURED 2026-09-16 — see the note at the top of this
  section.** ~~The `/cong-cu/` hub's multi-column index and the calculator pages
  have never been seen rendered. Worth a look at `pnpm dev`.~~ The hub HAS now
  been driven in a browser at both viewports, and all 75 live pages were
  measured. ~~`ResultTable` scrolls horizontally on narrow screens, which is
  untested by eye.~~ That containment is now confirmed: 11 routes hold an
  element wider than 390 px, all of them tables, and **no** route makes the page
  itself scroll sideways — the frame contains it, which is what it was built to
  do. The wide ones are exactly the rows tracked in
  `components/calc/wide-table-pending.mjs`, each of which now carries a
  `measured390` verdict pinned against the manifest.

  **NO LIVE ROUTE HAS AN ELEMENT WIDER THAN 390 px AS OF 2026-09-16.** The
  manifest's `elementsWiderThanViewport` went 11 → 9 → 7 → 0 across three
  changes: the two four-column rows, the two loan-comparison routes, then the
  seven-row P3/P4 shelf (eight tables, since
  `phan-tich-thu-nhap-huu-tri` carries two). `NARROW_OVERFLOW_MEASURED` is
  empty and `WIDE_TABLE_PENDING` is down to one entry.

  That one entry is the interesting residue. `lai-kep` has five columns, so it
  violates §3, and it MEASURED TO FIT at 390 px — a rule debt with no rendered
  symptom, and now the clearest surviving evidence that column count and
  rendered overflow are independent. It is deliberately not "fixed": carding a
  table that fits is what `ResultTable`'s docstring tells you not to do.

  A note for whoever runs the next sweep, because three of the tables fixed in
  this round were invisible to the previous one. `elementsWiderThanViewport`
  asks only whether an element exceeds the VIEWPORT. It cannot see a table that
  overflows its own 300 px scroll frame while staying under 390 px, and it
  cannot see a table whose column count GROWS WITH USER INPUT — the loan
  comparison's metric table measured 281 px with the prefilled two offers and
  354 px with the third offer the page's own title invites. Measure the frame
  relationship, and fill each form to its advertised maximum first.

  Two findings came out of that sweep, and the first is now closed:

  - **The five-column rule under-detects — still true, and both instances are
    now FIXED.** `vay-thuong-mai` and `lai-suat-thuc-te` have FOUR columns
    each, so §3 asked nothing of them, and both overflowed 390 px anyway. They
    were recorded in `NARROW_OVERFLOW_MEASURED`, deliberately kept out of
    `WIDE_TABLE_PENDING` because `check:markup` verifies that list against the
    column rule and would report a non-violator as a stale entry. Conversely
    `lai-kep` has five columns, violates §3, and does NOT overflow. Column
    count and rendered overflow are independent, and that remains the finding.

    Re-measured at a verified 390 px viewport on 2026-09-16 after the fix:
    `vay-thuong-mai` 485 px → **300 px** inside its 300 px frame (12 over-wide
    elements → 0) and `lai-suat-thuc-te` 400 px → `mobileCards`, which renders
    no table at all below `md` (13 → 0). `NARROW_OVERFLOW_MEASURED` is now
    empty; its non-vacuity floor was removed so an empty backlog is not a
    failure, the same correction `STATUTORY_UNDECLARED` already needed.

    **THE CAUSE RECORDED HERE WAS HALF WRONG, and it changed the fix.** This
    entry used to say the cause in both cases was Vietnamese header length.
    Per-column measurement showed that was true only of `lai-suat-thuc-te`. On
    `vay-thuong-mai` the headers merely MATCHED the width of the cells beside
    them; the binding constraints were an 8,5rem prose label floor misapplied
    to a column of "1", "2", "3" (136 px for content needing 32) and untyped
    money cells, which opted the table out of the compact reading and pinned
    each amount column at the width of "5.000.000.000" (125 px). Shortening
    its headers alone moved the table 380 px → 380 px — no gain whatever.
    **"The widest text in the column" is not the same as "the reason the
    column is that wide", and only changing one thing at a time separates
    them.**

    The two fixes differ because the two causes did. `vay-thuong-mai` adopted
    the four-column mortgage year table's pattern — typed `countCell` /
    `moneyCell`, `numeric` + `nowrap` on the period column, and headers
    without the redundant "trong năm" — and now fits as a table. For
    `lai-suat-thuc-te` neither lever exists: its figures are percentages, so
    there is no compact reading, and its first column is genuine prose, so the
    label floor is doing its job. Shortening all three of its headers lands at
    about 304 px, still over and at the cost of labels that no longer say what
    they compare against, so it took `mobileCards` instead.
  - **The hub's search box was below the fold, and has been moved.** It sat at
    y 1866 on a 390 px viewport (1.022 px below the fold) and y 1158 at
    1280×900, on a page whose headline asks "Bạn đang muốn biết điều gì?". It
    is now above the fold at both, and the five question cards unmount while a
    query is active so results land directly beneath the input. The remaining
    open question there is SEARCH PRECISION, not layout: folding strips
    diacritics, so the token `uu` is a substring of `huu` and `het uu dai`
    returns two retirement tools beside the right answer. `tool-search.test.ts`
    asserts recall thoroughly and precision not at all. Fixing it trades
    against the unaccented matching that makes `kha nang mua nha` work, so it
    is a product decision.

  Still unobserved and still wanted by eye: the longest input forms in the suite
  (`phan-tich-thu-nhap-huu-tri` and `phan-bo-tai-san` both render 11 fields
  across four groups), and legibility of the dense rows — `toi-da-401k` renders
  26 of them and `phan-tich-bao-cao-tai-chinh` is the widest table in the suite.
  Fitting is measured; reading is not.

  **~~There is no browser automation in this environment, so nothing about focus
  order, colour contrast, touch-target size or that horizontal scroll has ever
  been observed; every accessibility claim in this document is inferred from JSX
  and built markup.~~ CORRECTED 2026-09-15.** That was a blanket claim and it is
  wrong in both directions. A browser IS available on this project — §6's "Still
  open" list has said so since 2026-09-14 — and by now a handful of surfaces have
  been observed at measured viewports while the overwhelming majority still have
  not. **The rule that replaces it: a visual item is verified only if it was
  observed in a browser at a stated, measured viewport, and the viewport must be
  measured rather than assumed.** That last clause is load-bearing because this
  project has already rejected a screenshot that claimed 390 px while actually
  rendering at 433, so `window.innerWidth` is read at capture time and reported
  with the observation. Everything not on the list below is still unverified, and
  an inference from JSX or built markup may never be promoted into an
  observation.

  **Observed on the four long-horizon routes (2026-09-15, the supervisor's own
  browser pass, screenshots at
  `artifacts/finhome-tools-audit-2026-09-14/longterm-*-verified*.png` — outside
  the repo, and accepted as theirs rather than re-claimed here):**

  - At **390×844**, all four routes have
    `document.documentElement.scrollWidth === 390`. No page-level horizontal
    overflow on any of them. Earlier browser passes measured element offsets
    and table widths; I have not found a record of PAGE-level overflow being
    checked before this one, but I did not audit every artifact folder, so
    treat "first" as unverified and "checked on these four" as verified.
  - **Row 44's old every-5-years table measured 762 px inside a 300 px
    `overflow-x-auto` wrapper.** The scroll frame worked exactly as designed —
    and reading one row still cost about 2,5 screens of sideways scrolling,
    which is the finding. A mechanism behaving correctly is not the same as a
    table being readable. It was replaced by the trajectory chart plus a
    compact 4-column `checkpoints()`-driven table behind the shared
    "Xem số liệu dạng bảng" disclosure.
  - **The trajectory chart renders legibly at both ends**: figure 300 px at a
    390 px viewport, 702 px at 1280.
  - **Emphasis renders as `font-weight: 600` in `rgb(0,0,0)` against
    `rgb(87,87,87)` body text** — weight and ink contrast, NOT underline. The
    source agrees: `components/ui/prose-text.tsx` renders `font-semibold
    text-ink`, and `app/globals.css` sets `--color-ink: #000000` and
    `--color-ink-2: #575757`. **Worth recording WHY it is not underline:** on
    the web an underline means "link", and these pages carry real links, so
    underlining editorial emphasis would make the page's own source list and
    next-step links ambiguous.

  **Still not observed, on these four routes specifically:** focus order through
  the eleven-field form, touch-target size anywhere, the `LongTermViews` control
  at any viewport, row 48's remedy table in its `mobileCards` presentation (its
  label budget is pinned by a geometry test, which is not an observation), and
  every exact-đồng reading behind a precision checkbox. And the other 71 routes
  are exactly as unobserved as they were.
- **The rental-tax model needs a tax professional's sign-off.** `bat-dong-san-cho-thue`
  implements 5% VAT on all revenue plus 5% PIT on the excess above a threshold. **The
  prefilled threshold is 1 tỷ/năm for both**, per Nghị định 141/2026/NĐ-CP Article 1,
  which replaced the 500 triệu of Nghị định 68 with effect from 01/01/2026; the
  12/06/2026 rental guidance covers both taxes below that revenue. The eighteenth unit
  left both defaults at the superseded 500 triệu "so no figure moves", and review
  rejected that: it charged a qualifying simple rental 65 triệu of tax it does not owe at
  900 triệu of revenue, and preserving a known-stale default is not acceptance. The
  nineteenth repair moved them and swept every quoted figure, the tests and the
  provenance with them. Also here now: the VAT threshold and the PIT deduction are
  separate inputs (they coincide at 1 tỷ today, and the PIT deduction is ALLOCATED across
  one taxpayer's rental contracts, so a landlord letting two places should enter a
  smaller share); the page links Decree 141, the rental guidance, the MoF answer, Law 109,
  NQ43 and the still-draft implementing decree; and NQ43's 30% PIT reduction is a reader
  DECLARATION, default off, applied to PIT only. What is STILL open and is what this
  entry is about: none of this is a professional's confirmation for a specific contract,
  the citations were read as published documents rather than as signed originals, and
  nothing here determines a reader's eligibility.

**Closed since the SP-0 review:**

- ~~The disclaimer is the one contract the primitives do NOT own.~~ `CalculatorPage` now owns both the disclaimer and the `usRules` wiring. Only applies to routes that use the shell; the six pre-shell pages still carry their own disclaimer inline, correctly, but by hand.
- ~~`ResultGroup` has no `aria-live` opt-out.~~ It takes `live?: boolean` now.

**Closed since the 2026-09-09 post-audit remediation:**

- ~~The 2026 Social Security figures were absent.~~ The 2026 PIA bend points, taxable
  maximum and retirement earnings-test exempt amounts are now transcribed in
  `us-social-security.ts`; the pages default to 2026 and their prose is pinned by tests.

- ~~No automated check on the accessibility markup.~~ `scripts/check-built-markup.mjs`
  (`pnpm check:markup`) now asserts, on the built export: one disclaimer, one `<h1>`, both
  JSON-LD blocks parsing with no placeholder, the share-card tags, canonical/sitemap
  membership for live pages, `noindex`/sitemap-absence for planned placeholders, and exactly
  the allowed number of `data-results-live="true"` regions. It strips `<script>` before
  counting, for the reason recorded above. It also covers the hub, `/vision/`, `/blog/` and
  every blog post for the share-card tags — the four pages the metadata fix (below) actually
  touched, which otherwise had no standing guard at all. It is wired into the deploy gate.
- ~~No PR-time CI.~~ `.github/workflows/ci.yml` runs the same gate (`pnpm gate`: tests,
  typecheck, `check:lint`, build, `check:markup`) on every pull request and on push to `main`.
- ~~Nothing enforces "one live region per page".~~ `components/calc/live-region.test.ts`
  checks it at the source-text level and `ResultGroup`'s `data-results-live` attribute lets
  `check-built-markup.mjs` check it again on the built HTML — both now require an EXACT match
  against the allowed count, not just a ceiling. **This enforces the count each page is
  allowed, not that the count is low** — see "still open" below; the widest live regions have
  not shrunk.
- ~~Four non-calculator pages ship a degraded or wrong share card.~~ (`/cong-cu/`, `/vision`,
  `/blog`, blog posts.) `lib/seo.ts`'s `pageMetadata()` states `openGraph` and `twitter` in
  full for every page, because Next replaces both objects wholesale rather than merging them.
  All four pages now use it. See `scripts/check-built-markup.mjs`'s non-calculator-page check,
  above, for the standing guard.
- ~~The rental-tax threshold has no visible vintage, and the copy can drift from the
  constant.~~ `/cong-cu/bat-dong-san-cho-thue/` now states the threshold, both rates, both
  statutes and both in-force dates under the tax rows, and
  `content/calculators/rental-property.test.ts` asserts every consumer-facing site that
  quotes the threshold — the vintage notice, the help text under the input field, and the
  FAQ answer — agrees with the exported `VN_RENTAL_TAX_DEFAULTS`. **The citations still need a
  tax professional's sign-off** — see "needs a human" above; this closed the drift risk, not
  the sign-off.

**Still open:**

- **~~A test under `components/` cannot render React.~~ CORRECTED 2026-09-14.**
  This section used to say there is no way to render a component here. That is
  wrong, and `components/loan-calculator.test.ts` had already been doing it:
  **`renderToStaticMarkup` from `react-dom/server` runs in the runner's
  existing `node` environment**, with no jsdom, no @testing-library and no new
  dependency. `.test.ts` not `.test.tsx`, so `createElement` instead of JSX.
  Server rendering is also the right fidelity for this suite, because every
  calculator is prerendered at its defaults and must hydrate byte-identically.
  `components/calc/chart/chart-render.test.ts` is the worked example: it
  renders all five chart-bearing calculators, patches one content default per
  case with `vi.doMock`, and asserts accessibility structure plus the fact that
  the drawing CHANGES when an input changes. Use this for anything where the
  defect would live in a component — which, per the paragraph below, is where
  three of the suite's five worst defects lived. What it still cannot check is
  appearance: layout, contrast, touch targets and overflow remain unverified by
  eye, and nothing rendered in a test may be reported as a visual check.
  **A browser IS available on this project** — the 2026-09-14 review drove the
  local dev server and measured real document offsets, which is how the
  mortgage page's 1067 px first input and 4030 px chart were found. Order and
  disclosure are testable here; pixels are not. Ask for a browser pass rather
  than reporting a layout claim from a vitest run.

- **~~Almost no component-level coverage.~~ PARTLY CORRECTED 2026-09-15.** Four
  rendered-markup test files now exist for the long-horizon routes —
  `components/retirement-plan-render.test.ts`,
  `retirement-target-render.test.ts`,
  `retirement-savings-analysis-render.test.ts` and
  `retirement-income-render.test.ts` — each rendering its own client component
  with `renderToStaticMarkup` and patching one content default with
  `vi.doMock`, on the idiom `components/calc/chart/chart-render.test.ts`
  established. They exist because the module-at-its-defaults substitute below
  is structurally incapable of seeing this unit's worst defect: a funded
  verdict decided in JSX. **A page whose defect would live in a component now
  gets a render test, not a module test.** What they still cannot check is
  appearance, and none of them may be cited as a visual check.

  **Two counting corrections to the claim this bullet used to open with**,
  which was "every one of the 13 retirement-tier pages ships a
  `content/calculators/<name>.test.ts`". First, a content test is named after
  the content MODULE, never after the slug — there is no
  `content/calculators/ke-hoach-huu-tri.test.ts` and there never was; row 45's
  is `retirement-target.test.ts`, row 48's is
  `retirement-savings-analysis.test.ts`, row 50's is
  `retirement-income.test.ts`. Second, it is not every one of them. Derived on
  this tree: the `huu-tri` category holds FOURTEEN rows, 13 of which ship their
  own content test, and the one exception is **`ke-hoach-huu-tri`** — it has
  none of its own and is covered instead by the shared
  `content/calculators/long-term-plan.test.ts`, which asserts its prose figures
  against the shipped defaults. That is a defensible arrangement for a route
  whose content is a view of a shared object, but it is not what the sentence
  claimed, and a future agent looking for row 44's content test will not find
  one.

  The substitute itself, unchanged and still worth following: each of those
  content tests parses the page's OWN default strings with the
  same parsers the component uses, runs the module, formats with the same formatters, pins
  the result, and binds every figure quoted in the prose to the module's output plus a
  provenance-header check. That pattern caught nothing on these pages, which is the point:
  it is cheap enough to write first. **Follow it for any new calculator.** The gap it does
  not close is the rendering itself. **That sentence used to continue "there is no jsdom
  … so a test under `components/` cannot render React", and that is false** — see the
  corrected bullet above this one; `renderToStaticMarkup` runs in the runner's plain
  `node` environment with no jsdom and no new dependency, and the four files named above
  do exactly that. What a module test genuinely cannot see is still worth stating:
  a figure decided in JSX, a superseded default object a component still imports, or
  a verdict a component derives for itself instead of asking the model.
  That gap is not academic: an audit of the whole suite found that **three of its five
  worst defects were invisible to a green 1242-test run**, because they lived in a component
  or in a default input rather than in a module — a ₫ share price parsed with
  `parseDecimal` (P/E out by 1000×), a stale prefilled tax threshold, and a `parseMoney`
  count field turning a typed `3.0` into 30. Where a render test is not warranted, the
  cheapest substitute is still to assert the **module-at-its-shipped-defaults**: parse the
  content file's own default strings with the same parser the component uses, call the
  module, format with the same formatter, and pin the result.
  See `components/calc/calculator-page.test.ts` for the pure-helper pattern that does work.
- **Nine of the 13 new pages render four or five ResultGroups.** Exactly one is live on
  each, so the convention holds and `live-region.test.ts` passes — but a page with a live
  group plus four non-live ones plus two tables is a long page, and whether that reads well
  has not been seen. It is the same unobserved-visual concern as the wide tables above, one
  level up.
- **The widest live regions have not been shrunk, and that is a real unresolved concern.**
  `loan-calculator.tsx` announces a 9-row live region on every keystroke, then `biweekly` and
  `loan-analysis` at 8, and `auto-loan`, `interest-only` and `price-adjust` at 7 — which, by
  §4's own standard above, is "the same failure mode a live table is" for at least the top
  three. `live-region.test.ts`'s `MAX_LIVE_ROWS = 9` is a ratchet at today's maximum, not an
  endorsement: it stops a new page from making things worse, and deliberately does not lower
  the ceiling. Deciding which rows a user "came for" versus which belong in a non-live
  breakdown is an editorial judgement per page, and it changes rendered markup on six pages
  whose built HTML has been treated as a regression gate — worth its own pass, not a
  mechanical fix.
- **`pnpm gate` runs `check:markup` after `next build`, so a fix, its test pins, AND any
  rendered-markup contract must land in the same commit.** Several assertions in this suite
  pinned a *wrong* value, so correcting a module without correcting its test blocks
  deployment of unrelated work; the same is now true of a rendered-HTML contract.

- **The funded-boundary fix reached the four components but NOT row 44's chart
  adapter.** Observed by reading source on the working tree of 2026-09-15, after
  the long-horizon unit: `longTermWithdrawalModel` asks the model
  (`path.funded || path.projection.depletionAge === null`, with a comment naming
  `fundedAtBoundary`), but `longTermTrajectoryModel` still selects its depletion
  marker, its summary sentence and its mandatory checkpoint dates from a bare
  `result.depletionAge`. On the float-residue case that is exactly the
  contradiction the unit set out to remove, one level down: `ke-hoach-huu-tri`'s
  verdict row can say the plan is funded while the figure directly beneath it
  carries a "cạn ở tuổi X" marker and a depleted summary. `components/retirement-plan-render.test.ts`
  does not catch it, because its assertions are on the form-level notice strings
  rather than on the chart model. **Re-derive this before acting on it** — that
  file was being edited while this entry was written, so treat it as a lead and
  check the three selection sites rather than trusting the description.

  **CLOSED — re-derived 2026-09-17.** That instruction to re-derive is what
  closed it. `longTermTrajectoryModel` now reads
  `fundedAtBoundary(result, plan.input.endAge).funded` and drives the depletion
  marker, the summary sentence and the mandatory checkpoints from it; the file
  carries its own comment recording the superseded `result.depletionAge` branch
  and the "funded to within four millionths of one đồng" case it misread. Both
  long-term adapters ask the model now.

- **Two containment assertions still bound a region by the next closing tag with
  no `-1` guard.** §8 records the lesson and two of the four call sites were
  fixed in this unit; these two were not.
  `components/retirement-target-render.test.ts` does
  `live.slice(0, live.indexOf("</dl>"))`, and
  `components/rental-property-calculator.test.ts` does
  `html.indexOf("</div>", live)`. When the tag is absent `indexOf` returns −1 and
  `slice(0, -1)` quietly becomes "everything but the last character", so the
  assertion passes for the wrong reason — which is the same failure the fixed
  sites had, not a smaller version of it.

  **CLOSED — re-derived 2026-09-17.** Both call sites use the depth-counting
  `markupRegion` now, and each carries a comment naming the bound it replaced.

- **The four long-horizon routes have no `content/calculators/next-steps.ts`
  entry.** Derived on this tree: that file holds 31 entries and none of the four
  slugs is among them, so `ToolNextSteps` renders nothing on any of them. Item 5
  of the model slice's own handoff asked for next-step links alongside the
  reading disposition; the disposition shipped and the links did not. That is a
  gap, not a decision — most of the 75 legitimately have no entry, but these four
  are a connected set of views where "where do I go next" has an obvious answer.

  **NOT A GAP — it is a GUARDED DECISION, re-derived 2026-09-17.**
  `next-steps.ts` forbids an entry on any row filed with a `library`; all four
  are `library: "dai-han"`; and the file's own comment records both the rule
  ("never as a reading funnel" onto a library or utility tool) and the
  arithmetic — 34 of the 36 P4 rows are shelved, and the two that are not
  (`diem-chiet-khau`, `tra-no-hai-tuan`) do carry entries. So `ToolNextSteps`
  rendering nothing on these four is the contract holding, not an omission.
  **Do not close this by adding the four entries: a test forbids them.** The
  entry count also moved, 31 → 34, which is the usual reason not to quote one.

- **Two of the four chart palette slots are below the 3:1 non-text contrast
  floor, and slots 2↔3 are below the normal-vision separation floor.** Measured
  in a browser on 2026-09-17 at a verified 390 px, and re-derived with a
  palette validator rather than by eye. `SERIES_FILL` / `SERIES_STROKE` /
  `SWATCHES` in `components/calc/chart/chart-figure.tsx` are
  `ink-3` / `brand-green` / `brand-softgreen` / `ink-4`, against a white plot:

  | Slot | Token | Hex | vs white |
  |---|---|---|---|
  | 0 | `ink-3` | `#727272` | 4,81:1 |
  | 1 | `brand-green` | `#17ab48` | 3,02:1 |
  | 2 | `brand-softgreen` | `#90d77b` | **1,72:1** |
  | 3 | `ink-4` | `#bcbcbc` | **1,90:1** |

  Slot 2 ↔ slot 3 measures ΔE 14,4 for NORMAL colour vision — under the ~15
  that tells an adjacent pair apart at all — and slot 1 ↔ slot 2 (the two
  greens) measures 1,75:1 against each other.

  **This is a call site the 2026-09-16 a11y pass did not consider, not a
  reversal of it.** That pass reasoned about `brand-green`/`brand-softgreen` as
  "the logo, icons, borders and focus rings", which WCAG 1.4.3 exempts, and
  about `ink-4` as the footer's LIGHT-on-dark token (9,16:1 there). Both are
  true. What the chart layer does is different: it reuses them as
  **data-bearing marks on a light ground**, where 1.4.11 asks 3:1 and no
  logotype exemption applies. `app/globals.css` is right that moving a brand
  green is a brand decision — which is why this is filed open rather than
  changed. The chart layer could instead SELECT compliant tokens without
  moving any brand token; `brand-green-ink` `#117f36` already exists at 5,11:1.

  **Where this is and is not already relieved.** The validator's contrast check
  is a WARN that "obligates visible labels or a table view", and the plot has
  that relief by construction — every model ships a `ChartTable`, the legend is
  textual, and the markers block names each series in prose. Two places have no
  such relief: the legend SWATCH, where the colour block IS the identity mark,
  and two ADJACENT stacked fills, where ΔE 14,4 is the whole separation.
  `/cong-cu/kha-nang-mua-nha/` reaches all four slots (nine swatches, observed
  at 1280 px on 2026-09-17), so slot 3 is live rather than theoretical.
  Reproduce with the `dataviz` skill's validator:
  `node scripts/validate_palette.js "#727272,#17ab48,#90d77b,#bcbcbc" --mode light`.
  Ignore its lightness-band and chroma-floor FAILs — those encode "use a
  categorical hue scheme", and two greens plus two neutrals is a deliberate
  brand choice `chart-figure.tsx` states in its own docstring.

- **A legend with more than four entries identifies two of them by the same
  colour, and `monthlyAllocation` has six.** Found by LOOKING on 2026-09-17, at
  a measured 390 px, on `/cong-cu/kha-nang-mua-nha/`'s "Mỗi tháng tiền đi đâu"
  figure — and it is pre-existing, not introduced by that day's unit, which only
  added a second surface rendering the same model
  (`/blog/o-chung-cu-ton-them-bao-nhieu-moi-thang/`). Measured: **6 legend
  entries, 4 distinct swatch colours, 2 collisions.**

  | Colliding pair | Colour |
  |---|---|
  | "Sinh hoạt thiết yếu" / "Chi phí nhà ở khác" | `rgb(114,114,114)` |
  | "Nợ đang trả" / "Còn lại chưa dùng" | `rgb(23,171,72)` |

  **This is the defect `lib/calc/charts/palette.ts` exists to prevent, arriving
  by a different route.** That module fixed a slot MISMATCH between plot and
  legend; this is slot EXHAUSTION, where the two agree perfectly and both are
  ambiguous because `paletteSlot` takes `% PALETTE_SLOTS`. Its own docstring
  anticipated the guard and it had never been wired — "`paletteSlots` reports
  the count so a caller can assert it has not quietly grown past what the
  palette can distinguish."

  **A ratchet is now wired** in `components/calc/chart/legend-render.test.ts`:
  `monthlyAllocation` is recorded as known debt so the gate stays green on a
  pre-existing defect, and a NEW model that exhausts the palette fails
  immediately. Verified to go red when a second entry is added to that list.

  **No fix was attempted, deliberately.** Unlike a line series, a bar segment
  has no second channel available — `STROKE_DASH` applies to strokes, not fills
  — so the options are fewer segments, a texture fill, or a wider palette, and
  all three are product or brand decisions. It is the same decision as the
  palette-contrast entry above and should be taken with it.

  **Nothing in the test suite could have caught this.** Every assertion about
  that figure passed: the labels are all present, the plot and legend agree, the
  slots are assigned from the shared map. What is wrong is only visible as
  colour, at which point only an eye or a colour measurement will do.

- **`readingTime` on the education collection is DERIVED, and guarded.**
  `content/education/reading-time.test.ts` asserts it tracks
  `round(prose / 200)` within ±1 minute, and separately asserts the collection
  cannot advertise fewer than three distinct times while its lengths vary by
  more than 1,2×. That second assertion is the defect that actually happened:
  all 23 entries said 6 or 7 minutes across a 60% spread in length. Do not
  nudge one entry — re-derive all of them, and if the formula changes, change
  it for the whole collection at once.

- **The education cross-link graph has no orphans, and that is now a property
  worth preserving.** Checked 2026-09-17: every article has at least one
  inbound `nextSlugs` link. Before that pass, C13 and C14 had none (original),
  and none of C19–C23 did. `nextSlugs` has no count constraint, so prefer
  ADDING a link to displacing one — displacing silently removes a route through
  the collection.

**Deferred minors** are recorded in `.superpowers/sdd/2026-09-06-sp0-calculator-foundation/progress.md` if that directory still exists (it is git-ignored scratch).

## 7. What to build next

**A 76th tool shipped on 2026-09-17, and the suite is no longer 75.** `/cong-cu/nha-o-xa-hoi/`
is a SECOND ROUTE onto the affordability calculator at the social-housing
programme's statutory parameters, plus four education articles (C16–C19).
Read the twenty-third unit in `docs/finhome-tools-execution-2026-09-14.md`
before touching `lib/calc/social-housing.ts`,
`content/calculators/social-housing.ts`, `components/social-housing-conditions.tsx`,
the `programme` prop on `components/affordability-calculator.tsx`, or any of the
four new article slugs. The design spec is
`docs/superpowers/specs/2026-09-17-social-housing-track-design.md`.

Four things from it that apply repo-wide:

- **`PRIORITY_COUNTS.P1` is 6, not the plan's 5**, and P1 membership is
  ENFORCED ACROSS FIVE SURFACES — the hub's question cards, `next-steps.ts`,
  the education seam in both directions, the `emphasis` reading disposition
  (which must ship real `<strong>`), and the education coverage map. Promoting
  a row to P1 fails six tests until all five are wired. Budget for that.
- **A registry entry's comment must sit OUTSIDE its brace.**
  `scripts/check-built-markup.mjs` anchors on `\{\s*slug:`, so a comment
  between `{` and `slug:` silently drops the entry from the parse. Its own
  total-count guard is what catches this ("matched 75 of 76").
- **A statutory figure carries its instrument, and an unverified period
  returns `undefined` rather than a neighbour's number.**
  `lib/calc/social-housing.ts` ships the whole NĐ 100/2024 → 261/2025 → 54/2026
  → 136/2026 amendment chain for that reason: the ceiling moved three times in
  24 months, and a `luatvietnam.vn` page titled "2026" was still serving the
  superseded figures while the module was written. Cite the instrument, never a
  site.
- **`assumedMaxLtvPercent` means two different things on two routes.** Its
  docstring says "a user assumption, not a bank's limit and not a regulation";
  under the social-housing programme 80% is exactly a regulation. The `programme`
  prop overrides that field's help text, and that override is the point of the
  prop rather than a detail of it.

**All four review items shipped on 2026-09-17.** The 30 triệu household has an
article in every one of the five groups (C17 `BUDGET`, C20 `SAVING`,
C21 `PAYMENT`, C22 `CHOICE`, C23 `RESILIENCE`), and the collection is **23
bài** — derive that from `EDUCATION_ARTICLES`, never from this line.


**The four long-horizon household rows shipped on 2026-09-15 — original rows
44, 45, 48 and 50.** This is the unit §7 used to predict as "the long-horizon
household rows, whose consolidation and localisation unit has not run". It is
run. All four URLs are kept — `/cong-cu/ke-hoach-huu-tri/`,
`/cong-cu/tinh-huu-tri/`, `/cong-cu/phan-tich-tiet-kiem-huu-tri/`,
`/cong-cu/thu-nhap-huu-tri/` — and they now answer four questions off ONE
`resolveLongTermPlan` call and ONE set of đồng defaults, with a shared view
control between them. `usRules` and the "theo quy định Hoa Kỳ" summaries came
off exactly those four slugs; the nine genuinely US `huu-tri` rows keep the
flag. **That was the correction of an inconsistent flag, not a
reclassification** — all four have been filed `library: "dai-han"` in
`content/calculators/plan-disposition.ts` the whole time, so the flag and the
filing had been disagreeing with each other, and the filing was right.
(`nien-kim` is also `dai-han` and is genuinely US; the library grouping is not
the merge set.)

**With these four, every P3 row has now had its unit.** Derived rather than
tallied from prose: `dispositionsByPriority("P3")` returns 22 rows, and the
sixteenth unit's eleven (17, 31, 56, 58, 59, 60, 62, 63, 67, 68, 70) plus the
eighteenth's seven (15, 18, 21, 24, 25, 26, 27) plus these four are exactly
that set, with no overlap and nothing left over. `READING_WORK_PENDING` is
correspondingly empty for the first time. **The 36 P4 rows are what remain**,
plus the requirement-by-requirement 75/12 audit.

**Read the twenty-second unit in
`docs/finhome-tools-execution-2026-09-14.md` before touching any of these
routes**, and the twenty-first before touching the model under them. The files
a future agent must read first, in the order the dependency runs:

1. `lib/calc/long-term-plan.ts` — `resolveLongTermPlan`, and `fundedAtBoundary`,
   which is the funded verdict. Do not re-derive funded-ness from
   `depletionAge`; §8 records what that cost.
2. `content/calculators/long-term-plan.ts` — `LONG_TERM_PLAN`: the eleven
   shared đồng defaults, all field copy, the view list and the scope notice.
   **Changing a default here moves quoted figures on all four routes**, and
   each route's prose is pinned to the model's real output by its own test.
3. `components/calc/long-term-views.tsx` and `components/calc/retirement-fields.tsx`
   (`readRetirement`, `longTermMoney`) — the view control and the shared field
   reader.
4. `lib/calc/charts/long-term-chart.ts` — `longTermTrajectoryModel` (row 44)
   and `longTermWithdrawalModel` (row 50). Read §6's open entry about this file
   before assuming its two models agree with each other.
5. The four components — `retirement-plan-calculator.tsx`,
   `retirement-target-calculator.tsx`,
   `retirement-savings-analysis-calculator.tsx`,
   `retirement-income-calculator.tsx` — and their four
   `*-render.test.ts` files, which are the only tests that can see a defect
   living in the JSX.

**What this unit did NOT deliver, and is not claimed:** row 48 has no figure,
so the three-remedy comparison the model slice's handoff asked for is still
open; none of the four has a `next-steps.ts` entry; and row 44's chart adapter
still decides depletion for itself (all three in §6). Two docstrings outside
this unit's own files also still describe the pre-merge state and were left
alone — `READING_WORK_PENDING`'s own comment in
`content/calculators/plan-disposition.ts`, which still says rows 45, 48 and 50
"each still renders its own pre-merge component and its own USD copy", and
`RETIREMENT_DEFAULTS`'s docstring in `components/calc/retirement-fields.tsx`,
which says the same. Both are now false; whoever next opens those files should
sweep them.

**Rows 19, 16, 20 and 71 shipped on 2026-09-15** (home-fund goal with dates
and an extra-saving comparison; the three-band compound area; the deposit's
needed-date view with its timeline; land-unit region confirmation), together
with C04/C09's exercises and C09's two-path visual. Read the eleventh unit in
`docs/finhome-tools-execution-2026-09-14.md` before touching any of them.

**The seven P3 capital rows shipped in the eighteenth unit and were repaired
after review in the nineteenth** — original rows 15, 18, 21, 24, 25, 26 and 27.
Read BOTH units in
`docs/finhome-tools-execution-2026-09-14.md` before touching
`lib/calc/tvm-questions.ts`, `rental-scenarios.ts`, `rental-property.ts`,
`lib/calc/charts/value-paths-chart.ts`, `tvm-timeline-chart.ts`,
`rental-waterfall-chart.ts`, `content/calculators/shared.ts` or any of those
seven routes, plus `lib/calc/education-savings.ts` and its chart. Two things
that apply repo-wide: the shared disclaimer's default text changed again (see
§3), and `CalculatorPage` has a `sources` slot. **Row 15's tax figures are
still a release gate** — the defaults are now Decree 141's 1 tỷ and the
documents are linked, and that is not a professional's sign-off for any
specific contract. Three model contracts the repair changed, all of them
breaking: `computeEducationSavings().monthlyContribution` is
`number | null` (null when no month exists to solve in),
`interestEarned` is measured against what the plan will HOLD rather than
against the target, and `EducationFundPoint` carries `tuitionPaid` /
`tuitionUnpaid` beside `tuitionDue`.

**The reading-comprehension pass shipped in the seventeenth unit**, together
with the last three review findings on rows 56, 68 and 67. All twelve articles
carry editor-selected emphasis, a per-figure reading sentence and split dense
paragraphs; nine calculator explanation surfaces carry the same restrained
emphasis and all 75 have a stated reading disposition. Read that unit in
`docs/finhome-tools-execution-2026-09-14.md` before touching
`lib/prose-emphasis.ts`, `components/ui/prose-text.tsx`,
`content/education/types.ts`, either `articles-*.ts`,
`content/calculators/plan-disposition.ts`, `lib/calc/fund-allocation.ts`,
`lib/calc/commute-compare.ts` or `lib/calc/charts/net-proceeds-chart.ts`.
Row 67's figure is a BRIDGE now: each step bar is the cash in hand split into
kept and taken, so the deduction is a drawn quantity rather than a difference
between two bar lengths.

**Eleven P3 buyer-support rows shipped in the sixteenth unit** — original rows
17, 31, 56, 58, 59, 60, 62, 63, 67, 68 and 70. Read that unit in
`docs/finhome-tools-execution-2026-09-14.md` before touching
`lib/calc/vehicle-budget.ts`, `commute-compare.ts`, `fund-allocation.ts`,
`raise-savings.ts`, `lib/calc/charts/palette.ts`,
`components/calc/chart/bar-chart.tsx` or any of those eleven routes. The
founder's web/app boundary that unit was built against is in
`artifacts/finhome-release-review-2026-09-15/website-plan-v3.md`: **standalone
tools stay on the web, the integrated journey is the app's.** Eleven more P3
rows and 36 P4 rows remain, and none of the sixteenth unit's UI has been seen
in a browser. (Both halves of that last sentence were true when this entry was
written and the first half no longer is: the eleven became seven in the
eighteenth unit and zero in the twenty-second — see the top of this section.
The sixteenth unit's UI is still unobserved.)

**C07, C10, C11 and C12's comparative visuals shipped in the fourteenth
unit**, together with the last three rent-copy findings. All twelve education
articles now carry the visual their original row asked for. `debt-path-chart`
and the refinance chart's second ledger came out of that unit; read it before
touching `lib/calc/charts/debt-path-chart.ts`, `refinance-chart.ts` or
`content/education/articles-2.ts`.

**Rows 8, 29, 30 and C08 shipped later the same day** — the thirteenth unit
in that document, which is the one to read before touching
`/cong-cu/thue-hay-mua/` or either card route. Row 8 got its two net-cost
trajectories, a named growth-scenario band and a form that puts the six
known figures first; rows 29/30 became ONE payoff workspace behind both
existing card URLs, with two dated debt paths and a household allocation that
is entered rather than inferred. **All twelve P2 rows are now implemented and so are all twelve articles'
visuals. The 22 P3 / 36 P4 dispositions are what remain, and none of the new
figures has been seen rendered.**

**All 75 tools are live, and as of 2026-09-14 the suite is mid-way through an
acquisition and education upgrade.** Read
`docs/finhome-tools-execution-2026-09-14.md` before touching
`app/cong-cu/page.tsx`, the five P1 tools, `lib/calc/charts/` or the shell
components listed in §3 — it holds the work-package boundaries and an honest
per-package state.

Where that upgrade stands: W01, W03, W04, W05, W06 and W07 are implemented and
locally tested, pending independent browser acceptance; W02 is wired on 7 of 75
routes (the 5 P1 tools plus `thue-hay-mua` and the card workspace).
**W08 is implemented for all 12 P2 rows as of the thirteenth unit, with the
final gate at 3364 tests/157 files, types, baseline lint, 257 pages and the
markup contracts on 2026-09-15 — but none of the last three rows' UI has been
browser-verified, and W09 (22 P3 / 36 P4 dispositions) remains open.** The
plan disposition for all 75 rows is in
`content/calculators/plan-disposition.ts`. **W09's P3 half closed in the
twenty-second unit** — all 22 P3 rows have had their unit, four of them with
browser evidence at a measured viewport (§6); the 36 P4 dispositions are the
remainder. Every figure in the sentence above is a dated gate reading and none
of them should be carried forward: this tree reports 4318 tests / 199 files and
259 static pages. **The test count moved from 4314 to 4318 during the hour this
record was written**, with the file count unchanged — which is the practical
argument for the "re-derive, never quote" rule rather than a theoretical one.

**The primary CTA points at `/cong-cu/`** (`content/site.ts`). The app is not
yet on the App Store or Google Play; when links arrive, that file is the one
place to revisit, and `content/cta.test.ts` holds the "no download claim"
contract. Do not add a store constant before there is a store URL.

**The education collection lives at `/blog/mua-nha-bang-con-so/`**, with its
twelve articles at `/blog/<slug>/`. Read `content/education/` and
`lib/calc/charts/education-visual.ts` before touching it: an article declares
its hypothetical as DATA and the production engine computes the visual, so the
prose and the picture cannot disagree. Education entries in `POSTS` carry
`kind: "education"` and `newsPosts()` keeps them out of the news feed and the
four topic filters. The four chart components are deliberately NOT `"use
client"`, so those pages ship no chart JavaScript.

**Six conventions from the house-fund unit (2026-09-15), worth copying:**

- **A table must stop where its curve stops.** The savings comparison drew the
  faster plan to its funded month and then evaluated the closed form out to
  the slower plan's month, reporting balances no plan ever has — precise
  looking in the exact-đồng reading. A cell past a path's own horizon is the
  placeholder, and every attainment month is a checkpoint whatever the
  thinning stride works out to.
- **Do not assert an inequality that holds on your fixture.** "A higher
  contribution means more of your own money and less interest" is false at a
  0% rate, where both plans put in exactly the target and both earn nothing.
  Pick the sentence from the figures, or say CAN rather than WILL.
- **Money AVAILABLE is not money PAID.** A deposit that matured months before
  the date the money is needed pays nothing that day; what the saver has is
  principal plus the interest already received. Reporting the principal alone
  loses their interest, and reporting a payment invents one.
- **Name the horizon on every figure.** A renewed deposit has a first term, a
  current term and a whole plan — 181, 184 and 365 days on one fixture. The
  first draft put the first term's day count beside the whole plan's interest.
- **Foregone future time is not a penalty.** Split the gap between "taken
  early" and "held to maturity" into the RATE difference over the same days
  and the interest for days not yet run; their sum under one label overstates
  the cost of breaking early by exactly the second part.
- **An ambiguous unit needs a confirmed choice, not a default.** `sào` opened
  on the Northern 360 m², so a Central plot converted 38,875% low with no
  invalid state. The resolver returns null until a region is chosen and the
  page explains the refusal.
- **A column of figures states the unit the figures are IN.** The regional
  comparison showed 0,072 beside 0,09999 under a bare "Kết quả" while its row
  labels named 360 m² and 499,95 m² — three units in one table and none of
  them the answer's.
- **A factor is a convention, not an authority.** 360 / 499,95 m² per sào are
  named conventions with local usage varying (a commune notice states 500 m²);
  the copy points at the m² on the certificate and claims no legal
  measurement authority.
- **Copy feedback is bound to the text it was about.** A bare "copied" flag
  survived an edit to the inputs, so a changed equation was still reported as
  being on the clipboard. Carry the attempted string with the outcome; that
  also stales a late async resolution.
- **A per-route disclaimer must keep the clause the guard counts.**
  `check:markup` proves every calculator carries a disclaimer by counting the
  shared opening clause, so a tool-specific disclaimer replaces what follows
  it and not the clause itself. Replacing the whole text failed the gate with
  "one disclaimer: found 0".
- **An adaptive unit beats a fixed decimal on a time axis.** One decimal place
  of YEARS turned three days of daily compounding into "0,0 năm" on the
  summary, the marker, every table row and every tick. Pick years, months or
  days from the credited span, and snap the float residue before formatting.
- **A partial YEAR is not an uncredited PERIOD.** 1,5 năm ghép nửa năm is
  exactly three periods; saying the term was not a whole number of compounding
  periods was a different — and false — claim. Two facts, two notices.
- **A zero rate needs its own sentence wherever a sentence mentions interest.**
  "The extra contributions and the interest they earn" describes nothing at
  0%. The same applies to "both plans put in exactly the target", which holds
  only when the gap divides evenly.
- **Sweep a corrected claim across every place it is repeated.** The
  unqualified reserve-date claim and the "starting early beats contributing
  more" ordering each survived in a FAQ after the first fix landed elsewhere.

**Six conventions from the rent/buy and card-payoff unit (2026-09-15), worth
copying:**

- **A verdict is scoped or it is a claim.** "Mua" beside a figure is a
  statement about a decision; the same word with its horizon in the row label
  and its four assumptions in the sentence underneath is a statement about a
  calculation. Where one input nobody can know dominates the answer, put the
  scenario view ON the page rather than telling the reader to run the tool
  three times.
- **A scenario band is not an interval.** Name every scenario by the rate it
  assumed, attach no likelihood to any of them, and say "kịch bản … không
  phải khoảng tin cậy" in the figure's own summary. Draw the DIFFERENCE
  between the two sides rather than both sides per scenario: the question is
  whether the answer changes, and that is one quantity crossing zero.
- **Two routes onto one tool, never two forms.** Consolidating a mode into
  another tool means the second route renders the same component at a
  different opening state and keeps its own title, notice, prose and FAQ —
  and its content file keeps NO form strings, so the two cannot drift. That
  also makes the strategy a PROP, which only a render test can check.
- **A released budget is an allocation, not a consequence.** A declining
  minimum payment frees nothing by itself: it was already falling. What is
  freed when a debt clears is the amount the household deliberately set
  aside, which only they can state — so it is an input, and the page says
  whether that amount even covers the plan.
- **A calendar anchor is not a chain.** "n months later" must be computed from
  the anchor date, not by adding one month n times or by chaining through an
  intermediate date: 31 Jan + 1 month is 28 Feb, and 21 months after that is
  28 Nov, where 22 months after the anchor is 30 Nov. Clamping once is a
  convention; clamping twice is a drift.
- **An illustrative parameter is not a market fact.** A default rate, a
  minimum-payment share and a floor are there so the page has something to
  compute; the copy points at the reader's own biểu phí and quotes no range.
  "That is what the statement does" and "phần lớn thẻ tại Việt Nam quy định
  5%" are claims about contracts nobody here has read.

**Four from the education-visual unit (2026-09-15), worth copying:**

- **A second figure on one page must agree with the first.** The rent/buy
  trajectory said buying was ahead from month 90 to 302 while the scenario
  band on the same page said it was never ahead — the same null, described
  two different ways. Where two figures read the same result, derive the
  same distinction in both from the same field.
- **Attribute a negative value to the side that produced it.** The buyer's
  net cost goes below zero on assumed house-price growth and the renter's on
  assumed investment gain; one sentence for both called the renter's own cash
  an appreciating house.
- **A break-even scan establishes ONE earlier month, not all of them.** A
  backward search that stops at the first month not ahead proves the month
  immediately before and nothing about the months before that. Claim that
  month and point at the lines.
- **A break-even is not a break-even.** Where a model has both a cost measure
  and a cash-flow measure, each needs its own line, its own marker and its
  own label: they cross zero in different months, and a stretched term makes
  the cash one arrive FIRST while more debt is still owed. One unlabelled
  "hòa vốn" is the defect the whole refinance lesson is about.

**Five more from the same unit's review-repair pass, each a shipped defect:**

- **A null has as many meanings as it has causes, and a page must say which.**
  Three of them showed up at once here. `breakEvenMonth: null` means either
  "buying was never ahead" or "it was ahead from month 90 to 302 and then
  overtaken" — and the second rendered as the first, falsely, in the reader's
  favour. `payFixed` returning null means either "this payment can never
  clear the debt" or "this plan runs past the model's 100-year window". Where
  two answers share a shape, classify them from the same expressions the
  model uses (`monthlyCardRate`, `minimumPaymentFor`, the `trajectory`) — not
  from a second copy of the rule — and give each its own sentence.
- **A `>` verdict encodes a tie as a loss.** `buyingWins = advantage > 0`
  announced "Thuê" beside an advantage of 0 ₫ on a cash purchase with every
  rate at zero. A two-way comparison needs a third state, banded in a named
  constant (`TIE_BAND_DONG`, absolute not relative) with its own wording in
  every consumer.
- **A signed difference needs a signed LABEL.** "Kế hoạch của bạn nhanh hơn:
  −97 tháng" was rendered live. Pick the label from the sign — faster /
  slower / equal — and render the magnitude unsigned.
- **A bound the engine enforces has to exist in the form.** A horizon of
  1.201 cleared the result and both charts with no field marked invalid, so
  the chart's own recovery sentence pointed at an errored field that was not
  there. Name the limit in the field's help AND its error, substituted from
  the constant.
- **A shared disclaimer can be false on one page.** The site-wide text says
  results exclude fees; three fee fields are inside this one's result. Override
  the text for that route and keep the clause `check:markup` counts.
- **A freed budget has two dates.** The payoff month still contains the last
  payment — 2.758.272 ₫ of a 3.000.000 ₫ allocation — so the whole amount is
  free only from the following cycle. Report the remainder and the first full
  month, and anchor both to the original start date rather than to a payoff
  date that may have been clamped.

**Five conventions from the borrower-suite unit (2026-09-15), worth copying:**

- **A rate is not a sum of money.** Where a tool lets a reader pick a horizon,
  an APR at that horizon does not tell them what the loan has cost by then.
  Report the interest and the money-surrendered total, put the principal still
  owed BESIDE the cost rather than inside it, and make the horizon measure
  degenerate into the full-term one at the term so the two cannot disagree.
- **A budget is not a bill.** Where a tool solves a price BACKWARDS from what
  the reader can pay, the affordable payment is a CEILING and the instalment
  on the loan actually used is a different, usually smaller, figure. Report
  both, label which is which, and never let a chart segment carry the budget
  while a headline row carries the instalment.
- **Bound a schedule BEFORE you allocate it, not by sampling afterwards.** A
  chart that draws 361 points off a four-hundred-million-row schedule has
  already done the work. Every loop that runs once per month checks the
  suite's one disclosed horizon (1.200) first.
- **A failed comparison is not a zero difference.** `x === null ? base :
  compute()` makes "could not compare" indistinguishable from "they cost the
  same". Make the field nullable and say so on the page.
- **A scenario preset is a SELECTION, not an increment.** Rebuild the baseline
  from the inputs on every call, so pressing "+1" twice cannot mean +2 and
  returning to the baseline recovers the original figures exactly.
- **Say AT a month, not FROM it, unless you computed the boundary.** A peak
  instalment is the highest one, not the first one over a budget; "vượt ngân
  sách từ tháng 229" was wrong in the reader's favour on a fixture whose
  budget is first exceeded in month 25.

**Three conventions the earlier repair unit established, also worth copying:**

- **An optional result row is not mounted, not nulled.** `ResultRow` renders
  its label with a `—` when the value is null, so an optional row shows a dash
  beside a figure the tool actually knows. Mount the row conditionally.
- **No unverified population claim in copy.** No underwriting ratio range, no
  prepayment-fee range, no house-price growth rate, and nothing that says a
  bank lends, allows or approves an amount. Ratios and financing shares are the
  reader's assumptions. Two content tests sweep every string for the ranges
  that were removed.
- **An annualised month is not a year.** A "first year" label must sum the real
  first twelve schedule rows; multiplying one month by twelve is wrong for
  declining-principal schedules, early payoffs and mid-year PMI cancellation.

The rest of this section is kept as the record of how the original tiers were
ordered and what each needed.

Ordered by value per unit of effort. Each was independently mergeable.

**Done** — the three tiers that used to head this list are built: the two fast tiers (`vay-mua-xe`, `so-sanh-khoan-vay`, `phan-tich-khoan-vay` and all nine simple-math tools) and the whole medium tier (`tai-cap-von`, `kha-nang-mua-nha`, `diem-chiet-khau`, `muc-tieu-tiet-kiem`, `tien-gui-co-ky-han`, `thue-mua-xe`, `thue-hay-mua`, `bat-dong-san-cho-thue`, and both credit-card tools).

**Needs the root finder — done.** `apr`, `apr-nang-cao`, `irr-npv` and `trai-phieu` are built. Read §8's tolerance note before writing tests against a solved rate.

**Equity tier — done**, all nine. The only equity slugs left are `quyen-chon-black-scholes` (needs the normal CDF) and `thue-co-tuc` (United States law).

**Needs a normal CDF — done.** `lib/calc/normal.ts` exists and is tested against published tables; `quyen-chon-black-scholes` is built on it.

**The VN-relevant tier — done.** `du-bao-kinh-doanh`, `cac-chi-so-tai-chinh`,
`phan-tich-bao-cao-tai-chinh`, `phan-phoi-rong` and `tinh-ngay` are built. `tinh-ngay` keeps
the rule it was warned about: **no `Date` in `lib/calc/`**, because prerendered output must
hydrate byte-identically — the reference date arrives from the client as a plain
`{year, month, day}` and `dates.ts` stays pure. Do not regress that.

**The United States retirement tier — done**, all 13. They came last for a reason: lowest
value to Vietnamese users, and most needed a **vendored dataset**. Four things learned
building them, all of which generalise:

- **Vendor as little as the tool can get away with, and say which pages need it.** Only
  ONE of the three Social Security pages needs the annually indexed bend points; the other
  two take the PIA as an input, because the reader's own statement prints it. A page that
  takes a figure as input cannot go stale. `us-social-security.ts`'s docstring splits its
  own two halves by exactly this risk.
- **Two modules transcribing the same published figure should check each other.** The
  Social Security taxable maximum is in both `us-social-security.ts` and `us-payroll.ts`,
  and a test asserts they agree for every year both cover. That is the cheapest guard
  available against a transcription slip, and it is free wherever tables overlap.
- **Assert the table's SHAPE, not just spot values.** `us-rmd.ts`'s divisor table is 49
  rows. The test checks contiguous ages, every divisor positive, strictly falling with age
  and therefore a strictly rising required percentage — which catches a mistyped digit
  (12,2 entered as 21,2) that no plausibility check would.
- **Refuse the year rather than borrow one.** Every dated table in this tier returns null
  for a year it does not cover, and every page has a notice for that case.

`CalculatorPage` renders the `us-rules` notice from the registry flag automatically — no
per-page wiring.

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

### The `thue-mua-xe` rename, and the VAT correction behind it (2026-09-16)

The row's **visible name changed from "thuê mua" to "thuê tài chính"** in twelve
places — page title, meta title, meta description, lede, `contextNotice`,
`contextDetail`, the cross-link, three FAQ surfaces, the registry title and
summary, the category label, and the disposition question. **The slug did not
change.** `/cong-cu/thue-mua-xe/` is a published URL on a static export with no
redirect layer, and the slug is part of the search haystack, so the old word
still finds the tool — `content/calculators/auto-lease.test.ts` pins that with a
control proving it is the SLUG doing the matching and not a leftover in the
title or summary.

**Why it was a correctness fix and not a style preference.** "Thuê mua" asserts
an eventual purchase, and this page's own `contextDetail` says ownership is
"tùy hợp đồng" and that the lessee ends with the car only if the contract allows
a buy-out and they pay it. The word promised what the product does not. It is
correct in housing law — khoản 22 Điều 2 Luật Nhà ở 27/2023/QH15 defines `thuê
mua nhà ở` as paying a share up front with the rest as monthly rent and
ownership at the end, which genuinely is rent-then-own — so the blog posts using
it for social housing are right and untouched, and glossed rather than renamed.
For a vehicle, Nghị định 39/2014/NĐ-CP calls the activity `cho thuê tài chính`.

**The VAT line was worse than the name.** The field prefilled 10% and
`formula.body` asserted "VAT được tính trên khoản trả này … 10% là 1.149.722 ₫".
A genuine finance lease is `dịch vụ cấp tín dụng` and therefore không chịu thuế
GTGT under Điều 5 khoản 9 điểm a Luật Thuế GTGT 48/2024/QH15 — no rate on the
rental at all. The default is now **0**, the field stays editable because a
taxable asset lease is real (and carries 8% until 31/12/2026), and the page
discloses that the lessor passes the asset's input VAT through on a
`CTTC`-flagged invoice, which the model does not simulate. Every quoted figure
moved with it: the monthly payment from 12.646.944 ₫ to 11.497.222 ₫, total cost
from 555.290.000 ₫ to 513.900.000 ₫.

**Nothing in `lib/calc/auto-lease.ts` changed except comments.** The module now
says explicitly that it takes no view on whether a rate applies — statute names
belong in `content/`, the same rule `lib/calc/rental-property.ts` already states
for its three tax parameters. A pure module that knows a tax rate is a module
that goes stale by decree.

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

### From the United States retirement tier

Six more, and four of them were caught by a test written to check something else. Each is
worth reading before touching the module named.

10. **A root finder's bracket, for the THIRD time.** `annuity.ts` solved a quoted payout's
    implied rate on the PER-PERIOD rate with a bracket just above −100%. At 480 monthly
    periods `(1 + rate) ** periods` underflows to zero, the annuity factor divides by it,
    and `bisect` correctly refuses a non-finite endpoint — so **every contract longer than
    about 25 years returned "no solution"**. It now solves on the ANNUAL rate, where the
    worst case is 1e-18. Same mechanism as defects 1 and 5, third module, and this time
    the long-dated test §8 already demanded is what caught it. **Write that test first.**
11. **Bisection converges on a BRACKET, so its midpoint can be on the wrong side.**
    `solveRequiredContribution` returned a contribution 1e-4 short of funding the plan, and
    handed back a projection reporting depletion at `endAge - 1` beside a headline saying
    the plan was funded. Economically nothing; contractually the whole function. It now
    settles onto the funded side before returning. The pre-existing test asserted that
    contract and passed only because its single starting balance landed on the other side —
    **if a property depends on which side of a root you land, sweep the input that decides
    it.**
12. **A start-of-year flow and an end-of-year balance need DIFFERENT deflators.**
    `retirement.ts` had one, correct for balances. Reusing it for a withdrawal understates
    it by exactly one year of inflation — 53.658,54 for a 55.000 spend — and no single-year
    spot check reveals it. Both flows now carry their own real-terms figure, computed in
    the module, and on a funded plan `realWithdrawal` equals the level spend that was asked
    for in EVERY year. That identity is the test.
13. **Do not average standard deviations.** `asset-allocation.ts` computes the full
    covariance sum. Averaging σ would overstate the risk of every mix shown and make
    diversification look inert. Two identities pin it: at a correlation of 1 the two figures
    must coincide, and at −1 with weights inverse to the σs the risk must cancel to zero.
    **Where a quantity does not combine linearly, assert the case where it does.**
14. **A monotonicity you assume is a finding waiting to happen.** The Social Security
    break-even against claiming at 62 is NOT monotone in the claiming age: it peaks at
    78,00 for a claim at 64, dips to 77,62 at 65, then climbs to 80,37 at 70. The cause is
    the two-tier early reduction — the reward for waiting ACCELERATES, so the years just
    after 62 are the poorest value. The first test asserted a monotone rise and failed;
    pinning the real shape is what let the page explain it, and it has a usable
    consequence for a reader. The same schedule puts the best claiming age in the MIDDLE
    of the range at some horizons.
15. **A downward statutory rounding needs a float epsilon, and the reference matters.**
    Social Security rounds the PIA down to the dime and a monthly benefit down to the
    dollar. `2_800 * 0.7` is 1959,9999999999998, so a bare `Math.floor` turns a whole
    dollar of somebody's benefit into a rounding artefact. The module has a named epsilon
    nine orders below the smallest unit — and the first draft of a NEW test asserted
    `Math.floor` as its reference and expected 1.959. **When a module has a rounding
    helper, the test's reference must be that helper, not a re-derivation.

### From the long-horizon consolidation (original rows 44/45/48/50)

Seven more. What makes this set worth reading as a group is where the defects
were: **not one of the seven was in an engine.** They were in a component, in a
default object, in prose, in a claim, and three of them were in tests. The
suite was fully green through all of them.

16. **A POLICY IN A MODULE IS NOT A POLICY IN THE PRODUCT UNTIL A COMPONENT
    READS IT.** `fundedAtBoundary()` shipped in `lib/calc/long-term-plan.ts` in
    the model slice, with a documented float-residue policy, its own tests, a
    measured worst case and a reported residue — the whole apparatus. **No
    component consumed it.** All of them decided funded-ness with a bare
    `result.depletionAge === null`, which is precisely the artefact the function
    exists to absorb, so a plan funded to within four millionths of one đồng
    rendered as "không đủ" with a depletion age underneath it. The module was
    correct, its tests were correct, and the page was wrong. Now three of the
    four components call `fundedAtBoundary` directly and the fourth reads
    `path.funded`, which the model built from it; the module's docstring states
    the rule as "every funded verdict here is `path.funded`, never
    `depletionAge === null`". **When you add a policy function, grep for the
    naive expression it replaces and fix every hit in the same change** —
    shipping the function is the easy half. The residue of this exact defect is
    still live one level down in the chart adapter; §6 has it.
17. **A removed flag and a superseded default are two edits, and one without
    the other is worse than neither.** `usRules` came off `tinh-huu-tri` in the
    model slice while its component still imported `RETIREMENT_DEFAULTS`, the
    superseded USD object. The notice that existed to explain the dollars was
    gone; the dollars were not. **Removing a caveat is a change to the thing the
    caveat was about.** Both halves belong in one commit, and this is the second
    time a stale prefilled default has reached a live page in this suite — see
    defect 8.
18. **Finance living in JSX is invisible to every test that could catch it.**
    `retirement-savings-analysis-calculator.tsx` ran its own retirement-age
    search loop and called `projectRetirement` / `solveRequiredContribution`
    inside the remedy table's `.map()`. It is deleted: the search is
    `firstFundedRetirementAge` in the model, bounded by
    `MAX_EXTRA_WORKING_YEARS` (7) and gated by `fundedAtBoundary`, and the
    `retireLater` remedy is what the component now renders. The component has
    no loop left in it, and the model's docstring names that file as the reason
    it exists. §6 already recorded that three of this suite's five worst defects
    lived in a component or in a default input; this unit adds two more to that
    tally, which makes it the suite's dominant defect location rather than a
    historical note.
19. **Re-denominating a page silently falsifies every figure its prose quotes.**
    Every explanation on these four routes quoted results derived from the USD
    defaults. Changing the defaults to đồng left all of that copy syntactically
    fine, semantically wrong, and completely untested — **no test failed**,
    because nothing bound the prose to the model. All four routes now pin their
    quoted figures against the model's real output at the shipped defaults, the
    pattern §6 describes. **A number in a sentence is a test fixture that has
    not been written yet.**
20. **An inequality that held on one fixture is not a teaching.** Two claims on
    these routes turned out to be false rather than merely stale, and **both
    were dropped rather than rescaled**, which is the part worth copying:
    - Row 48 taught that a small capital shortfall costs a *disproportionate*
      number of years. At đồng magnitudes, 10,3% of the capital missing costs
      12,0% of the retirement years — a real relationship, and not the
      dramatic one the sentence promised. The page now states the near-
      proportionality, names the scenario it holds on, says it is not a rule,
      and explains why the tool shows the depletion age instead of letting the
      reader infer it from a ratio.
    - Row 45 taught that the growing and the level contribution plans "describe
      the same plan". They do not: on the shipped defaults the level plan costs
      57,9% more in year one and puts in 578.432.701 ₫ LESS in total, because
      money in earlier compounds longer. The page now says that choosing
      between them is choosing whether the hard part falls at the start or the
      end of the term, and that the two totals differ.

    Rescaling a wrong claim to new units preserves the wrongness. Ask whether
    the sentence is still TRUE at the new magnitudes, and if it is not, the
    figures are not the problem.
21. **A test asserting a temporary truth as a permanent invariant — twice in the
    same file, for the same reason.** `expect(READING_WORK_PENDING.length).toBeGreaterThan(0)`
    is the "never pin the suite's own size" mistake (defect list above, process
    lessons): a correct repo fails it the day the last pending unit runs, which
    is exactly what happened. Its replacement then did it again one level in —
    the new vacuity guard NAMED `tinh-huu-tri` as the "legitimately pending"
    control, and went red the day that row shipped. **A guard that hard-codes an
    example of the state it is guarding has the same lifetime as the example.**
    Both are fixed the same way: the check is bidirectional (a listed row that
    ships the work, and a delisted row that does not), it takes the list as a
    PARAMETER so the empty case is testable without emptying the real one, and
    the vacuity guard DERIVES its two controls by searching the data and names
    no slug. This is the same shape as the `app/cong-cu/[slug]` trap §1 records,
    where the route's presence is asserted against whether anything is planned
    in both directions rather than being pinned.
22. **A containment assertion can pass by coincidence, and a `-1` bound passes
    silently.** A live-region check bounded the region with the next `</dl>` —
    but the `data-results-live` marker sits on a `<div>`, so the region has no
    `</dl>` of its own. On that page the first one was **16.054 characters
    later**, inside `ResultTable`'s `mobileCards` branch, and the assertion
    passed only because that `<dl>` happened to close before the `<table>`
    opened. Remove `mobileCards` and `indexOf` returns −1, `slice(0, -1)` yields
    almost the whole document, and the assertion keeps passing — now for a
    second wrong reason. Two rules, and the second is the cheaper one:
    **bound a region by its own nesting** (depth-count the tag the marker is
    actually on, which is what the fixed version does), **and give every
    containment assertion a vacuity guard** that fails when the bound was not
    found. Two of the four sites in this family are fixed; §6 names the two that
    are not.
23. **A two-track grid that never squeezes the value starves the label
    instead.** In `ResultTable`'s `mobileCards` presentation at 390 px, a
    24-character label beside a 233 px money figure collapsed to a 55 px track
    and wrapped to four lines — while **the same label beside a short value sat
    on one line, in the same table**. That asymmetry is what makes it a content
    problem rather than a layout one: the primitive is behaving as designed, and
    it is shared by 19 call sites outside its own module (7 calculator
    components, 3 content files and 9 chart adapters, derived by grepping
    `mobileCards` on this tree), so changing its track behaviour would move
    markup on all of them to fix copy on one. **The fix was shorter content
    labels, pinned by a geometry-bound test rather than by the string.** The
    working number, which is the reusable part: roughly **300 px** is available
    inside a card at a 390 px viewport, an exact đồng figure with its suffix
    takes about 230 px of it, so **a money-column label wants to stay around 12
    characters**. `content/calculators/retirement-savings-analysis.test.ts`
    encodes that as arithmetic over the rendered cells — `ROW_PX` 300, `GAP_PX`
    12, `LABEL_PX_PER_CHAR` 7,5, `VALUE_PX_PER_CHAR` 10 — and re-runs it against
    a synthetic tỷ-scale amount so the bound holds on reader input and not just
    on the defaults, plus a floor so a heading cannot be trimmed into
    meaninglessness. `components/retirement-target-render.test.ts` uses the
    weaker form of the same idea, a fixed `MAX_CARD_LABEL_CHARS = 12`; it is
    measurement-derived rather than recomputed from the cells, so it will not
    react if the value column's content grows. Prefer the arithmetic one.**
