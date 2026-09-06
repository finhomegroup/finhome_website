# SP-0: Calculator Foundation and Hub — Design Spec

**Date:** 2026-09-06
**Status:** Draft for review
**Parent:** `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md`
**Goal:** Build the shared foundation that all 75 calculators sit on — UI primitives owning every accessibility contract, Vietnamese number formatting, tested numeric primitives, a calculator registry, the `/cong-cu/` hub page — and prove it by retrofitting the already-shipped Rule of 72 calculator onto it without regression.

---

## Problem

`/cong-cu/quy-tac-72/` works and is fully reviewed, but it is a monolith: `components/rule-of-72-calculator.tsx` hand-rolls its own card, label/`id` pairing, `aria-describedby`, `aria-invalid`, two `aria-live` regions, result rows, and number formatting. Copying that file 74 times would copy every one of those contracts 74 times — and the final whole-branch review of that work found a real accessibility defect *in* that wiring (the validation message was inaudible to screen readers), which is precisely the class of bug that must not be duplicated.

Three further gaps block the suite:

1. **No shared numeric primitives.** 6 calculators need root-finding (IRR, NPV, bond YTM, APR, APR advanced, TVM's rate solve), 1 needs a normal CDF (Black-Scholes), and 17 need an amortization schedule. None exists.
2. **No Vietnamese money formatting.** `formatYears` handles two decimals and nothing else. The final review flagged that `0,05%` already renders `1440,00 năm` where Vietnamese convention is `1.440,00`. Money fields make this unavoidable.
3. **`/cong-cu/` returns a hard 404.** The namespace was chosen deliberately, but nothing serves its index, so a user trimming the URL or a crawler walking the hierarchy hits a dead end.

## Approach (chosen)

**Composable primitives.** Shared components own layout and every accessibility contract; each calculator is a small typed TSX file that assembles them. Rejected alternatives:

- *Declarative config* (one data object per calculator, one generic renderer). Real leverage for the 39 simple/multi-field tools, but the config would have to express conditional fields (loan's PMI mode appears only when PMI > 0), unit toggles that reinterpret a sibling field's meaning (term in years vs months), solve-for-any-variable, and schedule tables. At that point the config is an untyped programming language with worse errors than TSX, and its schema would be guessed from the two shapes surveyed so far rather than learned from real cases.
- *Hybrid* (config for easy, primitives for hard). Two mental models and two code paths for the lifetime of the suite.

A declarative convenience layer is not forbidden forever — if SP-1 produces 16 genuinely near-identical simple calculators, extracting one then will be grounded in real repetition instead of speculation.

## Architecture

```
lib/calc/
  number.ts      parse + format, Vietnamese convention, hydration-deterministic
  finance.ts     pmt/pv/fv/nper/rate, compounding conversion, amortize()
  solve.ts       bisect() root-finder
  stats.ts       normalCdf()
  *.test.ts      one suite per module, reference values from published sources

components/calc/
  calculator-card.tsx    <CalculatorCard>   shell + optional disclaimer slot
  field-group.tsx        <FieldGroup>       titled section of fields
  number-field.tsx       <NumberField>      owns label/id, describedby, invalid, message live region
  select-field.tsx       <SelectField>
  radio-group-field.tsx  <RadioGroupField>
  unit-toggle.tsx        <UnitToggle>       value + unit pair (năm/tháng)
  result-group.tsx       <ResultGroup>      owns THE single results aria-live region
  result-row.tsx         <ResultRow>
  schedule-table.tsx     <ScheduleTable>    class-T schedules
  use-calc-fields.ts     useCalcFields()    state + bind()
  disclaimer.tsx         <CalculatorDisclaimer variant>

content/calculators/
  registry.ts      the ONE list of all calculators; drives hub, sitemap, cross-links

app/cong-cu/
  page.tsx                    hub: all calculators by category, filterable
  quy-tac-72/page.tsx         unchanged route, retrofitted island
```

### `lib/calc/number.ts`

Generalizes and replaces `parseRate`/`formatYears`.

```ts
parseDecimal(raw: string): number | null   // "7,5" | "7.5" | "7," -> 7.5 ; rejects "1e9"
parseMoney(raw: string): number | null    // "500.000.000" | "500,000,000" -> 5e8
formatDecimal(value: number, dp?: number): string  // 11.8957 -> "11,90"
formatMoney(value: number): string        // 1440000 -> "1.440.000"
formatPercent(value: number, dp?: number): string
```

**Vietnamese convention is `.` for thousands and `,` for decimals** — the inverse of English. `parseMoney` must therefore strip `.` as grouping while `parseDecimal` treats `.` as a decimal point. These are deliberately two functions, not one with a flag: a money field and a rate field have genuinely different grammars, and conflating them is how "500.000" silently becomes 500.

**All formatting stays hand-rolled — no `Intl`, no `toLocaleString`.** This is not stylistic. Calculator inputs are prefilled, so the server prerenders result strings the client must hydrate to byte-identically; a hand-rolled formatter removes any Node-ICU vs. browser-ICU divergence. This constraint carries to all 75 calculators.

`formatMoney` also fixes the deferred grouping defect: `1440,00` becomes `1.440,00`. It must additionally guard the `toFixed` exponential-notation threshold (values ≥ 1e21 render as `7.2e+302`), clamping to a sane display ceiling rather than emitting scientific notation into Vietnamese prose.

### `lib/calc/finance.ts`

The five TVM quantities plus the schedule generator, all pure:

```ts
pmt(rate, nper, pv, fv?, type?): number      // payment per period
pv(rate, nper, pmt, fv?, type?): number
fv(rate, nper, pmt, pv?, type?): number
nper(rate, pmt, pv, fv?, type?): number
periodsPerYear(c: Compounding): number       // annually..daily
toEffective(nominal, periodsPerYear): number
toNominal(effective, periodsPerYear): number
amortize(input): ScheduleRow[]               // {period, payment, interest, principal, balance}
```

`rate()` — solving for the interest rate — has no closed form and is delegated to `solve.ts`.

`type?` is the annuity-due flag (payments at period beginning vs end), needed by TVM's Begin/End mode. Including it now costs one parameter; retrofitting it into 17 call sites later would not.

**Sign convention must be fixed and documented here, once.** The Excel/HP-12C convention (outflows negative) is what every reference value in the tests will be drawn from, so the primitives adopt it and each calculator's own module is responsible for presenting user-friendly positive numbers. Getting this wrong is the single most likely source of subtly wrong output across 17 loan calculators.

### `lib/calc/solve.ts`

```ts
bisect(f: (x: number) => number, lo: number, hi: number, opts?): number | null
```

Bisection, not Newton: it cannot diverge, needs no derivative, and returns `null` on a non-bracketing interval rather than a plausible wrong answer. For IRR on a well-formed cash-flow series that trade is correct — a returned number must be trustworthy. Tolerance and max-iteration defaults are explicit, and `null` propagates to the UI as "no solution" exactly as `rule72Years(0)` already does.

### `lib/calc/stats.ts`

```ts
normalCdf(z: number): number
```

Abramowitz–Stegun 7.1.26 (|error| < 7.5e-8), which is ample for an option-price display and avoids a dependency.

### UI primitives — the accessibility contract

Every contract the final review established lives in exactly one place, and no calculator author can forget one:

- `NumberField` generates its own `id` via React 19's `useId`, wires `htmlFor`/`id`, points `aria-describedby` at its own help/validation paragraph, sets `aria-invalid`, and puts **`aria-live="polite"` on that paragraph** — the defect the final review caught, fixed once for 75 calculators.
- `NumberField` renders `type="text"` + `inputMode="decimal"`, because `type="number"` rejects the comma decimal separator Vietnamese keyboards produce.
- A field's unit must be in its **label text**, not only in a visual suffix. The Rule of 72 review found the `%` suffix was `aria-hidden`, leaving non-visual users no unit at all. `NumberField` takes `unit` and appends it to the accessible label rather than relying on the decorative suffix.
- `ResultGroup` renders **the one** `aria-live="polite"` region wrapping all its rows, with `aria-atomic="true"` so a screen reader announces "Trả hằng tháng: 12.500.000 ₫" rather than a bare number with no label — the second half of a finding the last review raised and I deferred.
- `ResultRow` renders `—` for `null`, never `NaN` or `Infinity`.

### `<ScheduleTable>`

A 30-year monthly amortization is 360 rows; prerendering all of them for 17 calculators is real payload. Default view is the **yearly summary** (≤ 40 rows), with a control to expand to monthly. The yearly rows are what the server prerenders; monthly is computed client-side on expand. Table markup uses a real `<table>` with `<caption>` and `<th scope>` — a schedule is tabular data and a div grid would be inaccessible.

### `content/calculators/registry.ts`

```ts
export type CalculatorCategory = "tai-chinh-dau-tu" | "vay-the-chap" | "huu-tri"
  | "the-tin-dung" | "vay-mua-xe" | "chung-khoan" | "khac";

export type CalculatorEntry = {
  slug: string;              // "quy-tac-72" -> /cong-cu/quy-tac-72/
  title: string;             // Vietnamese, shown on the hub
  category: CalculatorCategory;
  status: "live" | "planned"; // planned entries render greyed on the hub, excluded from sitemap
  usRules?: true;             // gates the US-rules disclaimer + sitemap de-prioritisation
};
```

One array is the single source of truth for the hub listing, the sitemap, and future cross-links — replacing what would otherwise be three drifting lists. `app/sitemap.ts` derives calculator entries from `status === "live"`, and `usRules` entries get `priority: 0.3` rather than `0.6`, honouring the decomposition's commitment not to drive Vietnamese users into US-law tools.

SP-0 seeds the registry with **all 75 entries** — Rule of 72 `live`, the other 74 `planned`. That makes the hub immediately useful as a roadmap, makes each later sub-project a `planned → live` flip, and means the sitemap can never accidentally advertise an unbuilt route.

### `/cong-cu/` hub page

Server component listing every `live` and `planned` calculator grouped by category, with a small client island for text filtering. `planned` entries are visibly non-links. Fixes the 404 and gives the suite an entry point.

### Disclaimers

`<CalculatorDisclaimer variant="default" | "us-rules" />`.

- `default` is the existing Rule of 72 text, moved to shared copy: illustrative, user-supplied assumptions, excludes tax/fees/inflation, not a return commitment, not investment advice.
- `us-rules` renders **above** the calculator, not below, and states the tool models United States tax and retirement rules and does not apply to Vietnamese users or to Vietnamese tax and social-insurance law.

## Retrofit of Rule of 72 — the acceptance test

The abstraction is only proven if the one known-good calculator survives it unchanged from the outside.

- `lib/rule-of-72.ts` keeps its domain math (`rule72Years`, `exactYears`) and **drops** `parseRate`/`formatYears`, which are superseded by `lib/calc/number.ts`. `lib/rule-of-72.test.ts` is updated to import the shared helpers; its reference table — including the `"7,5"` and `"7.5"` rows — must still pass with identical expected strings.
- `components/rule-of-72-calculator.tsx` is rewritten to assemble `CalculatorCard` / `NumberField` / `ResultGroup` / `ResultRow`. It should lose roughly half its lines.
- `content/rule-of-72.ts` moves to `content/calculators/rule-of-72.ts`; `rateLabel` keeps its `(%)` and additionally passes `unit` to `NumberField`.
- **Regression gate:** after the retrofit, `out/cong-cu/quy-tac-72/index.html` must still contain `12,00 năm` and `11,90 năm`, still carry `aria-live="polite"` twice, and still expose a matching `for`/`id` pair. The route, its metadata, and both JSON-LD blocks must be byte-equivalent in meaning.

## Testing

`vitest.config.ts` already globs `lib/**/*.test.ts`, so the four new modules are picked up with no config change.

Reference values come from published sources, not from the implementation:

| Module | Reference case |
|---|---|
| `finance.pmt` | 100.000.000 ₫ over 12 months at 12%/yr nominal → known monthly payment |
| `finance.amortize` | Sum of `principal` column equals the original principal; final `balance` is 0 |
| `finance.toEffective` | 12% nominal compounded monthly → 12,6825% effective |
| `solve.bisect` | Recovers a known IRR for a textbook cash-flow series; returns `null` on a non-bracketing interval |
| `stats.normalCdf` | `normalCdf(0) = 0,5`; `normalCdf(1,96) ≈ 0,975` |
| `number.formatMoney` | `1440000 -> "1.440.000"`; `1234.5 -> "1.234,5"` |
| `number.parseMoney` | `"500.000.000" -> 5e8`; `"500,5" -> 500.5` |

`amortize`'s invariant tests (principal sums to the loan, balance ends at zero) matter more than any single spot value — they are what will catch a sign-convention error before it reaches 17 calculators.

No component tests: consistent with the suite's existing decision, and the accessibility wiring is verified by asserting on the built HTML instead.

## The CI gap is now load-bearing

I deferred this on the Rule of 72 branch and I am escalating it here, because the risk changed shape.

There is still no automated test gate: `vercel.json` runs `next build` alone, and there is no `.github/`. With one calculator, that meant one page could silently break. With 75 sharing `pmt`, `amortize`, `bisect` and `formatMoney`, **a single regression in a shared primitive silently produces wrong financial figures across dozens of pages** — on a domain that gives Vietnamese consumers home-loan numbers.

**Recommendation:** SP-0 adds the gate. The minimal version is `"buildCommand": "vitest run && next build"` in `vercel.json`, which blocks any deploy whose tests fail. A GitHub Actions workflow is the better long-term answer if you'd rather not couple deploys to tests. This is the one item in this spec I would not ship the suite without, and it needs your decision because it touches deployment policy.

## Risks

- **Retrofit regression** on the only live calculator. Mitigated by the existing 34 tests plus the built-HTML gate above.
- **Sign-convention error** in `finance.ts` propagating to every loan tool. Mitigated by adopting the Excel/HP-12C convention explicitly, documenting it on every signature, and testing `amortize`'s invariants rather than only spot values.
- **Premature abstraction.** The shapes were surveyed from the two hardest reference calculators (loan, TVM), not guessed — but if SP-2 finds the primitives fight the amortization work, the honest response is to amend SP-0 rather than bend 17 calculators around a bad shell. SP-2 running second exists to surface that early.
- **Schedule table payload.** Mitigated by prerendering yearly and computing monthly on demand.

## Out of scope for SP-0

No new calculators beyond the Rule of 72 retrofit. No declarative config layer. No cross-linking between calculators (SP-8). No hub search beyond simple text filtering. No changes to `components/site-header.tsx` or `scripts/header-cmp.mjs` (both carry pre-existing lint errors outside this work).
