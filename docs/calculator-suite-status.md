# Calculator Suite — Status and Handoff

**Read this before touching anything under `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`.**

Last updated: 2026-09-07
Branch: `feat/rule-of-72-calculator` — **35 commits, not merged, not pushed.**

---

## 1. Where things stand

A suite of financial calculators at `/cong-cu/`, modelled on the tool set at `fncalculator.com` but reimplemented from standard finance and written in Vietnamese. Nothing is copied from that site: its pages are JavaScript-rendered so nothing was scrapeable anyway, and its copy and markup are its own property.

| | Count |
|---|---|
| Working calculators | **5** |
| Listed with a placeholder page | 70 |
| Total routes built | 75 |
| Tests | 170, across 9 suites |

**Working:**

| Route | Tool |
|---|---|
| `/cong-cu/vay-mua-nha/` | Loan / mortgage — 11 inputs, yearly amortization table, PMI, extra payments |
| `/cong-cu/tra-no-hai-tuan/` | Bi-weekly repayment vs monthly |
| `/cong-cu/chi-tra-lai/` | Interest-only phase, then amortizing |
| `/cong-cu/lai-kep/` | Compound interest, with contributions |
| `/cong-cu/quy-tac-72/` | Rule of 72, both directions, plus a reference table |

**Deliberately omitted, not forgotten:** a currency converter and a commodities/futures tool. Both need live market data. The site is `output: "export"` with no server, so the only options were an API key in the client bundle or rates that go stale between deploys — neither acceptable for a page giving Vietnamese consumers financial figures. Target is therefore 75, not 77.

## 2. Adding a calculator — the recipe

Five files. Nothing else needs wiring: the hub, the sitemap and the placeholder route all derive from the registry.

1. **`lib/calc/<name>.ts`** — the math. Pure: no React, no I/O, no DOM, no `Date`, no `Math.random`. Return `null` for inputs you reject; never a guess. Everything you return should be **positive** (presentation-shaped) — flip the sign once here, so no page has to think about it.
2. **`lib/calc/<name>.test.ts`** — verify against a published closed form or a hand-computed reference, not against your own implementation. Include the invariants (see §4).
3. **`content/calculators/<name>.ts`** — every Vietnamese string, exported as one `as const` object. No user-facing text in components.
4. **`components/<name>-calculator.tsx`** — `"use client"`, assembles the primitives from `components/calc/`.
5. **`app/cong-cu/<slug>/page.tsx`** — server component: metadata, JSON-LD, the island, prose, FAQ accordion, `<CalculatorDisclaimer />`.

Then in **`content/calculators/registry.ts`**: flip that slug's `status` from `"planned"` to `"live"`.

Copy `app/cong-cu/tra-no-hai-tuan/page.tsx` as your page template — it is the simplest complete example.

## 3. Available building blocks

**Math** (`lib/calc/`):

| Module | Exports |
|---|---|
| `number.ts` | `parseDecimal`, `parseMoney`, `formatDecimal`, `formatMoney`, `formatPercent`, `PLACEHOLDER` |
| `finance.ts` | `pmt`, `pv`, `fv`, `nper`, `solveRate`, `periodsPerYear`, `toEffective`, `toNominal`, `amortize` |
| `solve.ts` | `bisect` — root finder, returns `null` when not bracketed |
| `loan.ts` | `computeLoan`, `yearlySummary` |
| `loan-variants.ts` | `amortizeFixedPayment`, `computeBiweekly`, `computeInterestOnly` |
| `compound.ts` | `computeCompound` |

**UI** (`components/calc/`): `CalculatorCard`, `FieldGroup`, `NumberField`, `SelectField`, `RadioGroupField`, `ResultGroup`, `ResultRow`, `ResultTable`, `CalculatorDisclaimer`, `useCalcFields`.

**Not built yet, and their first consumer should build them:** a unit-toggle field, and a monthly (rather than yearly) schedule view with collapse.

## 4. Conventions that will bite you if you skip them

**Two different number grammars.** Vietnamese uses `.` for thousands and `,` for decimals — the inverse of English. Money fields use `parseMoney`; rate and term fields use `parseDecimal`. Mixing them turns `500.000` into `500`. They are two functions on purpose, not one with a flag.

**Never `Intl`, never `toLocaleString`.** All formatting is hand-rolled. Not stylistic: inputs are prefilled, so the server prerenders result strings the client must hydrate to byte-identically, and hand-rolling removes any Node-ICU vs browser-ICU divergence. This holds for every calculator.

**`finance.ts` follows the Excel / HP-12C sign convention** — outflows negative. So for a loan, `pv` is positive and `pmt` comes back negative. `amortize` is the one documented exception and returns positive figures. Read the module docstring before using it; a sign error here would produce plausible-but-wrong figures on every loan page.

**`rate` in `finance.ts` is always PER PERIOD, never annual.** A 12%/năm nominal rate compounded monthly is `0.12 / 12`.

**Accessibility lives in the primitives, not in your page.** `NumberField` owns the label/`id` pairing, `aria-describedby`, `aria-invalid`, and an `aria-live` on its own help paragraph. `ResultGroup` owns the single results live region; `ResultRow` carries `aria-atomic`. Do not re-implement any of that, and do not add a second live region.

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

- **The branch.** 35 commits on `feat/rule-of-72-calculator`, unmerged and unpushed. The owner has been asked three times and has not chosen; nothing has been pushed as a result.
- **Visual layout.** The `/cong-cu/` hub's three-column index and the calculator pages have never been seen rendered. Worth a look at `pnpm dev`.

**Should be fixed early, from the SP-0 final review:**

- **The disclaimer is the one contract the primitives do NOT own.** `CalculatorCard` has no disclaimer slot, and nothing wires the registry's `usRules` flag to `<CalculatorDisclaimer variant="us-rules">` despite a code comment claiming it does. A calculator can therefore ship with no disclaimer by simple omission. Highest-consequence gap in the suite.
- **`ResultGroup` has no `aria-live` opt-out.** Ten of the remaining loan tools are table-shaped; add `live?: boolean` before somebody wraps a schedule in one.
- **No component tests, and no automated check on the accessibility markup.** The vitest glob now covers `components/`, so tests *can* be written. Either write them, or put the built-HTML greps into a script the build gate runs.
- **No PR-time CI.** The `vercel.json` gate catches a broken build at deploy time, not at review time.

**Deferred minors** are recorded in `.superpowers/sdd/2026-09-06-sp0-calculator-foundation/progress.md` if that directory still exists (it is git-ignored scratch).

## 7. What to build next

Ordered by value per unit of effort. Each is independently mergeable.

**Fast — reuse `computeLoan`, need only new copy:**
`vay-mua-xe`, `so-sanh-khoan-vay`, `phan-tich-khoan-vay`

**Fast — simple math, 1–3 inputs:**
`tinh-phan-tram`, `ty-suat-loi-nhuan-roi`, `tang-luong`, `luong-gio-sang-luong-thang`, `giam-gia-va-thue`, `margin-va-markup`, `lai-suat-thuc-te`, `tinh-tien-tip`, `chi-phi-nhien-lieu`

**Medium — new math needed:**
`tai-cap-von` (+ break-even), `kha-nang-mua-nha` (reverse solve from income), `diem-chiet-khau`, `muc-tieu-tiet-kiem`, `tien-gui-co-ky-han`, `thue-hay-mua`, `bat-dong-san-cho-thue`, `vay-mua-xe`/`thue-mua-xe`, the two credit-card tools

**Needs the root finder:**
`apr`, `apr-nang-cao`, `irr-npv`, `trai-phieu`

**Needs a normal CDF (not yet written):**
`quyen-chon-black-scholes`

**Last, and lowest value to Vietnamese users:** the 29 tools governed by United States tax and retirement law, and the 11 that need vendored datasets (US tax tables, CPI series, Social Security formulas, unit-conversion factors). These are listed in the registry and are honest about what they are.

## 8. Design record

- `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md` — the full 75-tool inventory, classified by structural shape, and why the two data-dependent tools were dropped
- `docs/superpowers/specs/2026-09-06-sp0-calculator-foundation-design.md` — the foundation's design and the reasoning behind the primitives
- `docs/superpowers/plans/2026-09-06-sp0-calculator-foundation.md` — how it was built
- `docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md` — the first calculator

Two defects worth knowing about, because both came from a plan rather than from an implementation, and both were caught only by numeric verification:

1. `solveRate`'s search bracket was originally 1000% per period, which overflowed float64 at 289 periods — so **every loan term over ~24 years returned "no solution"**, including standard 25- and 30-year Vietnamese mortgages. The test suite at the time used only 12-period loans and was structurally incapable of catching it. **Pin at least one realistic-term case (240/300/360 periods) in any module that touches loans.**
2. `formatDecimal` had no finite guard, so a tiny rate rendered `"Infinity năm"` on a live page.

Verify numbers by executing the module, not by re-reading the code.
