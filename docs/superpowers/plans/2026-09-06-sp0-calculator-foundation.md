# SP-0: Calculator Foundation and Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared foundation for a 75-calculator suite — Vietnamese number parsing/formatting, a root-finder, the annuity and amortization functions, UI primitives owning every accessibility contract, a calculator registry, the `/cong-cu/` hub page, and an automated test gate — then prove it by retrofitting the shipped Rule of 72 calculator onto it with no externally visible change.

**Architecture:** Composable primitives. Shared components own layout and all accessibility wiring; each calculator is a small typed TSX file assembling them. Pure math lives in `lib/calc/*` with no React and no I/O. A single registry array drives the hub and the sitemap.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19.2.4, TypeScript 5, Tailwind CSS v4, vitest 5, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-06-sp0-calculator-foundation-design.md`
**Parent:** `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md`

## Global Constraints

- **Package manager is pnpm.** Never npm or yarn.
- **Static export.** `next.config.ts` sets `output: "export"` and `trailingSlash: true`. No request-time data, no dynamic params, no server actions, no `cookies()`/`headers()`.
- **All number formatting is hand-rolled. Never `Intl`, never `toLocaleString`.** Calculator inputs are prefilled, so the server prerenders result strings the client must hydrate to byte-identically; a hand-rolled formatter removes any Node-ICU vs. browser-ICU divergence.
- **Vietnamese number convention: `.` groups thousands, `,` is the decimal mark.** The inverse of English.
- **`lib/calc/*` modules are pure** — no React, no I/O, no DOM, no `Date`, no `Math.random`.
- **Finance sign convention is Excel/HP-12C: outflows negative.** Every reference value in the tests is drawn from that convention. Presentation-layer sign flipping is each calculator's own job, never the primitive's.
- **All user-facing copy lives under `content/`.** No hardcoded Vietnamese strings in components or pages.
- **`type="text"` + `inputMode="decimal"` for numeric inputs.** `type="number"` rejects the comma decimal separator Vietnamese keyboards produce.
- **No new design tokens.** Colors come from `app/globals.css`: `ink`, `ink-2`, `ink-3`, `ink-4`, `brand-green`, `bg-soft`. Error states reuse `red-200/400/600` exactly as `components/delete-account-form.tsx` already does.
- **`pnpm lint` already fails at baseline** with exactly 3 pre-existing problems: `components/site-header.tsx:52:5` (error), `components/site-header.tsx:83:5` (error), `scripts/header-cmp.mjs:13:10` (warning). These are OUT OF SCOPE. Do not touch either file. The pass condition for every task is **"no NEW problems beyond those 3"**, never "lint clean".
- **Do not touch `components/site-header.tsx` or `scripts/header-cmp.mjs`.**
- **No header nav entry.** `NAV_ITEMS` drives anchor-based active-section highlighting; a route link there would fight it.
- **Import alias:** `@/` maps to the repo root.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `vercel.json` | Modify | Test gate: `buildCommand` runs vitest before next build. |
| `lib/calc/number.ts` | Create | Vietnamese parse + format. Pure. |
| `lib/calc/number.test.ts` | Create | Its tests. |
| `lib/calc/solve.ts` | Create | `bisect` root-finder. Pure. |
| `lib/calc/solve.test.ts` | Create | Its tests. |
| `lib/calc/finance.ts` | Create | `pmt`/`pv`/`fv`/`nper`/`solveRate`, compounding conversion, `amortize`. Pure. |
| `lib/calc/finance.test.ts` | Create | Its tests. |
| `components/calc/use-calc-fields.ts` | Create | Field state + `bind()`. |
| `components/calc/calculator-card.tsx` | Create | Card shell. |
| `components/calc/field-group.tsx` | Create | Titled `fieldset` of fields. |
| `components/calc/number-field.tsx` | Create | Owns label/`id`, `aria-describedby`, `aria-invalid`, message live region. |
| `components/calc/result-group.tsx` | Create | Owns THE single results `aria-live` region. |
| `components/calc/result-row.tsx` | Create | One label/value row, `aria-atomic`. |
| `components/calc/disclaimer.tsx` | Create | Default + US-rules variants. |
| `content/calculators/shared.ts` | Create | Disclaimer copy, shared across all calculators. |
| `content/calculators/registry.ts` | Create | The ONE list of built calculators + category labels. |
| `content/calculators/hub.ts` | Create | Hub page copy. |
| `app/cong-cu/page.tsx` | Create | The hub. Fixes the current 404. |
| `app/sitemap.ts` | Modify | Derive calculator entries from the registry. |
| `content/rule-of-72.ts` | Delete → move | Becomes `content/calculators/rule-of-72.ts`. |
| `lib/rule-of-72.ts` | Modify | Drop `parseRate`/`formatYears`; keep the domain math. |
| `lib/rule-of-72.test.ts` | Modify | Import shared helpers; same expected strings. |
| `components/rule-of-72-calculator.tsx` | Modify | Rewritten onto the primitives. |
| `app/cong-cu/quy-tac-72/page.tsx` | Modify | Import path + shared disclaimer. |

---

### Task 1: Automated test gate

The suite's 75 calculators will share `pmt`, `amortize`, `bisect` and `formatMoney`. A regression in any one silently produces wrong loan figures across dozens of pages, and today nothing runs the tests except a human. This task closes that first, so every later task in this plan is protected by it.

**Files:**
- Modify: `vercel.json`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks (it is a deployment-policy change).

- [ ] **Step 1: Change the build command**

`vercel.json` currently reads:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "next build",
  "outputDirectory": "out"
}
```

Change `buildCommand` so tests gate the build:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "vitest run && next build",
  "outputDirectory": "out"
}
```

Change nothing else in the file.

- [ ] **Step 2: Verify the gate passes on green tests**

Run: `pnpm exec vitest run && pnpm exec next build`
Expected: 34 tests pass, then the build succeeds. This is the exact command sequence Vercel will now run.

- [ ] **Step 3: Verify the gate actually blocks on red tests**

A gate nobody has seen fail is not a verified gate. Temporarily break one assertion, confirm the sequence aborts before building, then restore it.

```bash
# Break it: flip one expected value in the reference table.
sed -i '' 's/\["6", "12,00", "11,90"\]/["6", "99,99", "11,90"]/' lib/rule-of-72.test.ts
pnpm exec vitest run && pnpm exec next build; echo "exit=$?"
# Restore it.
sed -i '' 's/\["6", "99,99", "11,90"\]/["6", "12,00", "11,90"]/' lib/rule-of-72.test.ts
git diff --stat lib/rule-of-72.test.ts
```

Expected: the middle command FAILS with a non-zero exit and **no build output** — vitest's `&&` short-circuits `next build`. The final `git diff --stat` must show **no changes** to `lib/rule-of-72.test.ts`, proving the restore worked. If it shows a change, restore it manually before continuing.

- [ ] **Step 4: Confirm tests pass again after the restore**

Run: `pnpm test`
Expected: 34/34 passing.

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "ci: gate deploys on the test suite"
```

---

### Task 2: Vietnamese number parsing and formatting

**Files:**
- Create: `lib/calc/number.ts`
- Test: `lib/calc/number.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `parseDecimal(raw: string): number | null`
  - `parseMoney(raw: string): number | null`
  - `formatDecimal(value: number, dp?: number): string`
  - `formatMoney(value: number, dp?: number): string`
  - `formatPercent(value: number, dp?: number): string`

  Later tasks: Task 9 replaces `lib/rule-of-72.ts`'s `parseRate` with `parseDecimal` and its `formatYears(v)` with `formatDecimal(v, 2)`.

- [ ] **Step 1: Write the failing tests**

Create `lib/calc/number.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parseDecimal,
  parseMoney,
  formatDecimal,
  formatMoney,
  formatPercent,
} from "@/lib/calc/number";

describe("parseDecimal", () => {
  it("accepts integers and both decimal marks", () => {
    expect(parseDecimal("6")).toBe(6);
    expect(parseDecimal("7.5")).toBe(7.5);
    expect(parseDecimal("7,5")).toBe(7.5);
  });

  it("tolerates a trailing separator while the user is still typing", () => {
    expect(parseDecimal("7,")).toBe(7);
    expect(parseDecimal("7.")).toBe(7);
  });

  it("tolerates surrounding whitespace and a leading dot", () => {
    expect(parseDecimal("  6  ")).toBe(6);
    expect(parseDecimal(".5")).toBe(0.5);
  });

  it("accepts a negative value (validity is a caller's concern)", () => {
    expect(parseDecimal("-5")).toBe(-5);
  });

  it("rejects empty, non-numeric, and exponent input", () => {
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("   ")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("7abc")).toBeNull();
    expect(parseDecimal("7.5.2")).toBeNull();
    expect(parseDecimal(".")).toBeNull();
    expect(parseDecimal("1e9")).toBeNull();
  });
});

describe("parseMoney", () => {
  it("strips '.' as a thousands separator", () => {
    expect(parseMoney("500.000.000")).toBe(500_000_000);
    expect(parseMoney("1.000")).toBe(1000);
  });

  it("accepts an ungrouped integer", () => {
    expect(parseMoney("500000")).toBe(500_000);
  });

  it("treats ',' as the decimal mark, per Vietnamese convention", () => {
    expect(parseMoney("500,5")).toBe(500.5);
    expect(parseMoney("1.234,5")).toBe(1234.5);
  });

  it("rejects more than one decimal mark", () => {
    expect(parseMoney("1,2,3")).toBeNull();
  });

  it("rejects empty, non-numeric, and bare-separator input", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("   ")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney(",")).toBeNull();
    expect(parseMoney(".")).toBeNull();
  });
});

describe("formatDecimal", () => {
  it("defaults to two decimals with a comma mark", () => {
    expect(formatDecimal(12)).toBe("12,00");
    expect(formatDecimal(11.8957)).toBe("11,90");
    expect(formatDecimal(7.2725)).toBe("7,27");
  });

  it("honours an explicit precision", () => {
    expect(formatDecimal(7.2725, 0)).toBe("7");
    expect(formatDecimal(7.2725, 4)).toBe("7,2725");
  });
});

describe("formatMoney", () => {
  it("groups thousands with '.' and defaults to no decimals", () => {
    expect(formatMoney(1_440_000)).toBe("1.440.000");
    expect(formatMoney(100_000_000)).toBe("100.000.000");
    expect(formatMoney(1000)).toBe("1.000");
  });

  it("does not group below a thousand", () => {
    expect(formatMoney(999)).toBe("999");
    expect(formatMoney(500)).toBe("500");
    expect(formatMoney(0)).toBe("0");
  });

  it("uses a comma for requested decimals", () => {
    expect(formatMoney(1234.5, 1)).toBe("1.234,5");
    expect(formatMoney(1234.56, 2)).toBe("1.234,56");
  });

  it("keeps the sign outside the grouping", () => {
    expect(formatMoney(-8_884_879)).toBe("-8.884.879");
  });

  it("returns the placeholder rather than scientific notation or NaN", () => {
    expect(formatMoney(Number.NaN)).toBe("—");
    expect(formatMoney(Number.POSITIVE_INFINITY)).toBe("—");
    expect(formatMoney(1e21)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("appends the sign to a comma decimal", () => {
    expect(formatPercent(12.6825)).toBe("12,68%");
    expect(formatPercent(6, 0)).toBe("6%");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run lib/calc/number.test.ts`
Expected: FAIL — the module `@/lib/calc/number` does not exist, so the import cannot resolve.

- [ ] **Step 3: Write the implementation**

Create `lib/calc/number.ts`:

```ts
/**
 * Vietnamese number parsing and formatting for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `number.test.ts`.
 *
 * Vietnamese convention is the inverse of English: "." groups thousands and
 * "," is the decimal mark. `500.000` is five hundred thousand, not five
 * hundred. That is why parsing a money field and parsing a rate field are two
 * separate functions rather than one with a flag — they have different
 * grammars, and conflating them is how 500.000 silently becomes 500.
 *
 * Everything here is hand-rolled rather than `Intl.NumberFormat("vi-VN", …)`.
 * Calculator inputs are prefilled, so the server prerenders result strings the
 * client must hydrate to byte-identically; hand-rolling removes any
 * Node-ICU vs. browser-ICU divergence.
 */

/** Rendered in place of a number that does not exist or cannot be shown. */
export const PLACEHOLDER = "—";

/**
 * Above this magnitude `toFixed` drifts toward exponential notation, and the
 * figure is meaningless in Vietnamese prose anyway. We show the placeholder
 * rather than emit "7.2e+302" into a sentence about đồng.
 */
const MAX_DISPLAY = 1e18;

/**
 * Plain decimal numbers only. Exponent notation, stray letters and a bare
 * separator are all rejected. A single trailing separator is allowed so
 * results don't blank out mid-typing when the user has entered "7,".
 */
const DECIMAL = /^-?(\d+[.]?\d*|[.]\d+)$/;

/** Digits with optional "." grouping and at most one "," decimal mark. */
const MONEY = /^-?[\d.]*,?\d*$/;

/** Parse a rate or plain decimal field. Accepts "7.5" and "7,5". */
export function parseDecimal(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parse a money field. "." is discarded as thousands grouping and "," is the
 * decimal mark, so "500.000.000" is 5e8 and "500,5" is 500.5.
 *
 * Grouping is not validated into strict triples — a user mid-entry has typed
 * "5000" long before they type "5.000".
 */
export function parseMoney(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "" || !MONEY.test(trimmed)) return null;
  const cleaned = trimmed.replace(/\./g, "").replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** 11.8957 -> "11,90". */
export function formatDecimal(value: number, dp = 2): string {
  return value.toFixed(dp).replace(".", ",");
}

/** 1440000 -> "1.440.000". `dp` defaults to 0: VND has no circulating subunit. */
export function formatMoney(value: number, dp = 0): string {
  if (!Number.isFinite(value) || Math.abs(value) >= MAX_DISPLAY) {
    return PLACEHOLDER;
  }
  const sign = value < 0 ? "-" : "";
  const [whole, fraction] = Math.abs(value).toFixed(dp).split(".");
  // Insert "." at every thousands boundary, right to left.
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped}${fraction ? `,${fraction}` : ""}`;
}

/** 12.6825 -> "12,68%". */
export function formatPercent(value: number, dp = 2): string {
  return `${formatDecimal(value, dp)}%`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run lib/calc/number.test.ts`
Expected: PASS, all cases green.

- [ ] **Step 5: Confirm nothing else broke**

Run: `pnpm test && pnpm exec tsc --noEmit`
Expected: all suites pass (34 pre-existing + the new ones), no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/calc/number.ts lib/calc/number.test.ts
git commit -m "feat: Vietnamese number parsing and formatting for the calculator suite"
```

---

### Task 3: Bisection root-finder

**Files:**
- Create: `lib/calc/solve.ts`
- Test: `lib/calc/solve.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `bisect(f: (x: number) => number, lo: number, hi: number, options?: BisectOptions): number | null` and `type BisectOptions = { tolerance?: number; maxIterations?: number }`. Task 4's `solveRate` consumes it.

- [ ] **Step 1: Write the failing tests**

Create `lib/calc/solve.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { bisect } from "@/lib/calc/solve";

describe("bisect", () => {
  it("finds a simple root", () => {
    const root = bisect((x) => x * x - 4, 0, 10);
    expect(root).not.toBeNull();
    expect(root as number).toBeCloseTo(2, 8);
  });

  it("returns an exact endpoint when it is already the root", () => {
    expect(bisect((x) => x - 3, 3, 10)).toBe(3);
    expect(bisect((x) => x - 10, 3, 10)).toBe(10);
  });

  it("returns null when the interval does not bracket a root", () => {
    // f(3)=5 and f(10)=96 are both positive: no sign change, so no root here.
    expect(bisect((x) => x * x - 4, 3, 10)).toBeNull();
  });

  it("returns null when the function is not finite at an endpoint", () => {
    expect(bisect(() => Number.NaN, 0, 1)).toBeNull();
    expect(bisect((x) => 1 / x, 0, 1)).toBeNull();
  });

  it("recovers a known IRR from a cash-flow series", () => {
    const flows = [-1000, 500, 500, 500];
    const npv = (r: number) =>
      flows.reduce((sum, cf, i) => sum + cf / (1 + r) ** i, 0);

    const irr = bisect(npv, -0.9, 10);
    expect(irr).not.toBeNull();
    expect(irr as number).toBeCloseTo(0.23375193, 6);
    // The defining property matters more than the digits: NPV at the IRR is 0.
    expect(npv(irr as number)).toBeCloseTo(0, 6);
  });

  it("honours an explicit tolerance", () => {
    const loose = bisect((x) => x * x - 2, 0, 2, { tolerance: 1e-2 });
    expect(loose as number).toBeCloseTo(Math.SQRT2, 1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run lib/calc/solve.test.ts`
Expected: FAIL — `@/lib/calc/solve` does not exist.

- [ ] **Step 3: Write the implementation**

Create `lib/calc/solve.ts`:

```ts
/**
 * Numeric root-finding for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `solve.test.ts`.
 *
 * Bisection rather than Newton–Raphson, deliberately. Bisection cannot
 * diverge, needs no derivative, and — the property that matters here —
 * returns null on an interval that does not bracket a root instead of a
 * plausible wrong answer. These solvers back IRR, bond yield-to-maturity and
 * APR, where a returned number must be trustworthy.
 */

export type BisectOptions = {
  /** Stop when the bracket is narrower than this. */
  tolerance?: number;
  /** Hard iteration ceiling; bisection halves the bracket each pass. */
  maxIterations?: number;
};

/**
 * Find x in [lo, hi] with f(x) = 0.
 *
 * Returns null when f is non-finite at either endpoint, or when f(lo) and
 * f(hi) share a sign so no root is bracketed.
 */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  { tolerance = 1e-10, maxIterations = 200 }: BisectOptions = {},
): number | null {
  let a = lo;
  let b = hi;
  let fa = f(a);
  const fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return null;

  for (let i = 0; i < maxIterations; i += 1) {
    const mid = (a + b) / 2;
    const fMid = f(mid);
    if (!Number.isFinite(fMid)) return null;
    if (fMid === 0 || (b - a) / 2 < tolerance) return mid;
    if (fa * fMid < 0) {
      b = mid;
    } else {
      a = mid;
      fa = fMid;
    }
  }

  return (a + b) / 2;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run lib/calc/solve.test.ts`
Expected: PASS.

- [ ] **Step 5: Confirm nothing else broke**

Run: `pnpm test && pnpm exec tsc --noEmit`
Expected: all suites pass, no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/calc/solve.ts lib/calc/solve.test.ts
git commit -m "feat: bisection root-finder for the calculator suite"
```

---

### Task 4: Annuity functions, compounding conversion, amortization

The largest math task, and the one whose sign convention 17 later loan calculators depend on.

**Files:**
- Create: `lib/calc/finance.ts`
- Test: `lib/calc/finance.test.ts`

**Interfaces:**
- Consumes: `bisect` from `@/lib/calc/solve` (Task 3).
- Produces:
  - `pmt(rate, nper, pv, fv?, type?): number`
  - `pv(rate, nper, pmt, fv?, type?): number`
  - `fv(rate, nper, pmt, pv?, type?): number`
  - `nper(rate, pmt, pv, fv?, type?): number`
  - `solveRate(nper, pmt, pv, fv?, type?): number | null`
  - `periodsPerYear(compounding: Compounding): number`
  - `toEffective(nominal: number, periodsPerYear: number): number`
  - `toNominal(effective: number, periodsPerYear: number): number`
  - `amortize(input: AmortizeInput): ScheduleRow[] | null`
  - `type Compounding`, `type ScheduleRow`, `type AmortizeInput`

- [ ] **Step 1: Write the failing tests**

Create `lib/calc/finance.test.ts`. Note the reference values were computed independently from the formulas and are pinned here as the contract:

```ts
import { describe, it, expect } from "vitest";
import {
  pmt,
  pv,
  fv,
  nper,
  solveRate,
  periodsPerYear,
  toEffective,
  toNominal,
  amortize,
} from "@/lib/calc/finance";

// A 100 million đồng loan over 12 months at 12%/năm nominal, compounded
// monthly -> 1%/period. Used across several tests below.
const RATE = 0.01;
const N = 12;
const PRINCIPAL = 100_000_000;
const PAYMENT = -8_884_878.8678; // Excel convention: an outflow, so negative.

describe("pmt", () => {
  it("matches the reference payment for the standard loan", () => {
    expect(pmt(RATE, N, PRINCIPAL)).toBeCloseTo(PAYMENT, 4);
  });

  it("returns a plain division when the rate is zero", () => {
    expect(pmt(0, 10, 1000)).toBeCloseTo(-100, 10);
  });

  it("is smaller in magnitude for an annuity due (type 1)", () => {
    const due = pmt(RATE, N, PRINCIPAL, 0, 1);
    expect(Math.abs(due)).toBeLessThan(Math.abs(pmt(RATE, N, PRINCIPAL)));
    // Paying at the period start earns one period of interest: pmt / (1 + r).
    expect(due).toBeCloseTo(pmt(RATE, N, PRINCIPAL) / (1 + RATE), 6);
  });
});

describe("pv / fv / nper round-trip", () => {
  it("pv recovers the principal from the payment", () => {
    expect(pv(RATE, N, pmt(RATE, N, PRINCIPAL))).toBeCloseTo(PRINCIPAL, 4);
  });

  it("fv of a fully amortizing loan is zero", () => {
    expect(fv(RATE, N, pmt(RATE, N, PRINCIPAL), PRINCIPAL)).toBeCloseTo(0, 4);
  });

  it("nper recovers the term from the payment", () => {
    expect(nper(RATE, pmt(RATE, N, PRINCIPAL), PRINCIPAL)).toBeCloseTo(N, 6);
  });

  it("handles a zero rate in each direction", () => {
    expect(pv(0, 10, -100)).toBeCloseTo(1000, 10);
    expect(fv(0, 10, -100)).toBeCloseTo(1000, 10);
    expect(nper(0, -100, 1000)).toBeCloseTo(10, 10);
  });
});

describe("solveRate", () => {
  it("recovers the period rate from the reference loan", () => {
    const solved = solveRate(N, pmt(RATE, N, PRINCIPAL), PRINCIPAL);
    expect(solved).not.toBeNull();
    expect(solved as number).toBeCloseTo(RATE, 8);
  });

  it("returns null when no rate can satisfy the cash flows", () => {
    // Both the principal and the payment are inflows — you receive 100 million
    // AND receive 1000 every period. No interest rate makes that balance, and
    // the solver must say so rather than return a plausible number.
    //
    // Note for whoever maintains this: a merely *unfavourable* loan is NOT an
    // unsolvable one. `solveRate(12, -1, 100_000_000)` — repaying 1 đồng a
    // month on a 100 million loan — resolves to about -78%/period, because a
    // steep enough negative rate does balance it. Verified numerically while
    // writing this plan.
    expect(solveRate(12, 1000, 100_000_000)).toBeNull();
  });
});

describe("periodsPerYear", () => {
  it("maps every compounding frequency", () => {
    expect(periodsPerYear("annually")).toBe(1);
    expect(periodsPerYear("semiannually")).toBe(2);
    expect(periodsPerYear("quarterly")).toBe(4);
    expect(periodsPerYear("monthly")).toBe(12);
    expect(periodsPerYear("semimonthly")).toBe(24);
    expect(periodsPerYear("biweekly")).toBe(26);
    expect(periodsPerYear("weekly")).toBe(52);
    expect(periodsPerYear("daily")).toBe(365);
  });
});

describe("toEffective / toNominal", () => {
  it("converts 12% nominal compounded monthly to 12,6825% effective", () => {
    expect(toEffective(0.12, 12)).toBeCloseTo(0.126825, 6);
  });

  it("round-trips", () => {
    expect(toNominal(toEffective(0.12, 12), 12)).toBeCloseTo(0.12, 10);
  });

  it("is the identity for annual compounding", () => {
    expect(toEffective(0.12, 1)).toBeCloseTo(0.12, 10);
    expect(toNominal(0.12, 1)).toBeCloseTo(0.12, 10);
  });
});

describe("amortize", () => {
  const schedule = amortize({
    principal: PRINCIPAL,
    ratePerPeriod: RATE,
    periods: N,
  });

  it("produces one row per period", () => {
    expect(schedule).not.toBeNull();
    expect((schedule as []).length).toBe(N);
  });

  it("presents the payment as a positive figure", () => {
    expect((schedule as { payment: number }[])[0].payment).toBeGreaterThan(0);
  });

  // The two invariants that catch a sign-convention error before it reaches
  // 17 loan calculators. These matter more than any single spot value.
  it("repays exactly the principal, no more and no less", () => {
    const rows = schedule as { principal: number }[];
    const repaid = rows.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  it("ends at a zero balance", () => {
    const rows = schedule as { balance: number }[];
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("splits every row into interest plus principal", () => {
    const rows = schedule as
      { payment: number; interest: number; principal: number }[];
    for (const row of rows) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("charges interest on the opening balance in period 1", () => {
    const rows = schedule as { interest: number }[];
    expect(rows[0].interest).toBeCloseTo(PRINCIPAL * RATE, 6);
  });

  it("handles a zero rate as pure principal repayment", () => {
    const flat = amortize({ principal: 1200, ratePerPeriod: 0, periods: 12 });
    const rows = flat as { payment: number; interest: number }[];
    expect(rows.length).toBe(12);
    expect(rows[0].payment).toBeCloseTo(100, 10);
    expect(rows[0].interest).toBeCloseTo(0, 10);
  });

  it("shortens the schedule when extra principal is paid each period", () => {
    const withExtra = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
      extraPerPeriod: 2_000_000,
    });
    const rows = withExtra as { balance: number }[];
    expect(rows.length).toBeLessThan(N);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("still repays exactly the principal with extra payments", () => {
    const withExtra = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
      extraPerPeriod: 2_000_000,
    }) as { principal: number }[];
    const repaid = withExtra.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  it("returns null on inputs that cannot produce a schedule", () => {
    expect(amortize({ principal: 0, ratePerPeriod: RATE, periods: N })).toBeNull();
    expect(amortize({ principal: -1, ratePerPeriod: RATE, periods: N })).toBeNull();
    expect(amortize({ principal: PRINCIPAL, ratePerPeriod: RATE, periods: 0 })).toBeNull();
    expect(amortize({ principal: PRINCIPAL, ratePerPeriod: -0.01, periods: N })).toBeNull();
    expect(
      amortize({ principal: PRINCIPAL, ratePerPeriod: Number.NaN, periods: N }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run lib/calc/finance.test.ts`
Expected: FAIL — `@/lib/calc/finance` does not exist.

- [ ] **Step 3: Write the implementation**

Create `lib/calc/finance.ts`:

```ts
/**
 * Time-value-of-money primitives and amortization for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `finance.test.ts`.
 *
 * SIGN CONVENTION — read this before using anything here.
 *
 * These functions follow the Excel / HP-12C convention: money you pay out is
 * NEGATIVE, money you receive is POSITIVE. So for a loan you take, the
 * principal `pv` is positive (you receive it) and `pmt` comes back negative
 * (you pay it). Every reference value in the test suite is drawn from that
 * convention.
 *
 * Presenting user-friendly positive numbers is each calculator's job, not
 * this module's. `amortize` is the one deliberate exception: it is a
 * presentation-shaped helper and returns positive figures, which its own
 * docstring restates.
 *
 * `rate` is always a rate PER PERIOD, never annual. Convert first:
 * a 12%/năm nominal rate compounded monthly is `0.12 / 12`.
 *
 * `type` is the annuity-due flag: 0 (default) for payments at the end of each
 * period, 1 for the beginning.
 */

import { bisect } from "@/lib/calc/solve";

export type Compounding =
  | "annually"
  | "semiannually"
  | "quarterly"
  | "monthly"
  | "semimonthly"
  | "biweekly"
  | "weekly"
  | "daily";

const PERIODS_PER_YEAR: Record<Compounding, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
  daily: 365,
};

/** How many compounding periods a year holds. */
export function periodsPerYear(compounding: Compounding): number {
  return PERIODS_PER_YEAR[compounding];
}

/** Nominal annual rate -> effective annual rate. 0.12 monthly -> 0.126825. */
export function toEffective(nominal: number, periods: number): number {
  return (1 + nominal / periods) ** periods - 1;
}

/** Effective annual rate -> nominal annual rate. The inverse of toEffective. */
export function toNominal(effective: number, periods: number): number {
  return periods * ((1 + effective) ** (1 / periods) - 1);
}

/** Payment per period. Negative for a loan you are repaying. */
export function pmt(
  rate: number,
  periods: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + future) / periods;
  const growth = (1 + rate) ** periods;
  return (
    (-(present * growth + future) * rate) / ((growth - 1) * (1 + rate * type))
  );
}

/** Present value of a stream of payments. */
export function pv(
  rate: number,
  periods: number,
  payment: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(future + payment * periods);
  const growth = (1 + rate) ** periods;
  return (
    -(future + payment * (1 + rate * type) * ((growth - 1) / rate)) / growth
  );
}

/** Future value of a stream of payments. */
export function fv(
  rate: number,
  periods: number,
  payment: number,
  present = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + payment * periods);
  const growth = (1 + rate) ** periods;
  return -(
    present * growth +
    payment * (1 + rate * type) * ((growth - 1) / rate)
  );
}

/** Number of periods required. */
export function nper(
  rate: number,
  payment: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(present + future) / payment;
  const adjusted = payment * (1 + rate * type);
  return (
    Math.log((adjusted - future * rate) / (adjusted + present * rate)) /
    Math.log(1 + rate)
  );
}

/**
 * Rate per period, solved numerically — there is no closed form.
 *
 * Null when no rate in the searched bracket satisfies the cash flows, which
 * callers must surface as "no solution" rather than substituting a guess.
 */
export function solveRate(
  periods: number,
  payment: number,
  present: number,
  future = 0,
  type: 0 | 1 = 0,
): number | null {
  // Lower bound just above -100%: at exactly -1 the growth term collapses.
  return bisect(
    (rate) => fv(rate, periods, payment, present, type) - future,
    -0.999_999,
    10,
  );
}

export type ScheduleRow = {
  /** 1-based period index. */
  period: number;
  /** Total paid this period, as a positive figure. */
  payment: number;
  /** Portion of `payment` that is interest, positive. */
  interest: number;
  /** Portion of `payment` that reduces the balance, positive. */
  principal: number;
  /** Balance remaining after this period, positive, 0 on the final row. */
  balance: number;
};

export type AmortizeInput = {
  /** Opening balance, positive. */
  principal: number;
  /** Interest rate per period, e.g. 0.01 for 1%/month. Zero is allowed. */
  ratePerPeriod: number;
  /** Scheduled number of periods. */
  periods: number;
  /** Optional additional principal paid every period. */
  extraPerPeriod?: number;
};

/**
 * Build a full amortization schedule.
 *
 * Unlike the primitives above, every figure here is POSITIVE — this is a
 * presentation-shaped helper feeding a table a user reads.
 *
 * Extra payments shorten the schedule, so the returned array can be shorter
 * than `periods`. The final row is trimmed so the balance lands exactly on
 * zero instead of a rounding residue.
 *
 * Null when the inputs cannot describe a loan.
 */
export function amortize(input: AmortizeInput): ScheduleRow[] | null {
  const { principal, ratePerPeriod, periods, extraPerPeriod = 0 } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(ratePerPeriod) || ratePerPeriod < 0) return null;
  if (!Number.isFinite(periods) || periods <= 0) return null;
  if (!Number.isFinite(extraPerPeriod) || extraPerPeriod < 0) return null;

  const scheduled = Math.abs(pmt(ratePerPeriod, periods, principal));
  const rows: ScheduleRow[] = [];
  let balance = principal;

  for (let period = 1; period <= periods && balance > 0; period += 1) {
    const interest = balance * ratePerPeriod;
    let principalPart = scheduled + extraPerPeriod - interest;
    // Final period: never repay more than is outstanding.
    if (principalPart > balance) principalPart = balance;
    const payment = interest + principalPart;
    balance -= principalPart;
    // Squash a floating-point residue so the last row reads exactly zero.
    if (Math.abs(balance) < 1e-6) balance = 0;
    rows.push({ period, payment, interest, principal: principalPart, balance });
  }

  return rows;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run lib/calc/finance.test.ts`
Expected: PASS, all cases green.

- [ ] **Step 5: Confirm nothing else broke**

Run: `pnpm test && pnpm exec tsc --noEmit && pnpm lint`
Expected: all suites pass; no type errors; lint shows only the 3 pre-existing problems.

- [ ] **Step 6: Commit**

```bash
git add lib/calc/finance.ts lib/calc/finance.test.ts
git commit -m "feat: annuity functions, compounding conversion and amortization"
```

---

### Task 5: Input primitives

The accessibility contract lives here and nowhere else. Every defect the Rule of 72 review found in hand-rolled field markup is fixed once, in `NumberField`, for all 75 calculators.

**Files:**
- Create: `components/calc/use-calc-fields.ts`
- Create: `components/calc/calculator-card.tsx`
- Create: `components/calc/field-group.tsx`
- Create: `components/calc/number-field.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/cn`.
- Produces:
  - `useCalcFields<T extends Record<string, string>>(initial: T)` → `{ values: T, bind(key): FieldBinding, reset(): void }`
  - `type FieldBinding = { value: string; onValueChange: (next: string) => void }`
  - `<CalculatorCard>{children}</CalculatorCard>`
  - `<FieldGroup title?>{children}</FieldGroup>`
  - `<NumberField label unit? help error? value onValueChange invalid? />`

  Task 9 consumes all of these.

- [ ] **Step 1: Create the field-state hook**

Create `components/calc/use-calc-fields.ts`:

```ts
"use client";

import { useState } from "react";

/** What a field component needs to be controlled. Spread it onto the field. */
export type FieldBinding = {
  value: string;
  onValueChange: (next: string) => void;
};

/**
 * Field state for a calculator form.
 *
 * Values are kept as raw STRINGS, never parsed numbers. The parse happens at
 * render time, in the calculator, so that a half-typed "7," survives in the
 * input instead of being normalised away under the user's cursor.
 */
export function useCalcFields<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);

  function bind(key: keyof T & string): FieldBinding {
    return {
      value: values[key],
      onValueChange: (next: string) =>
        setValues((current) => ({ ...current, [key]: next })),
    };
  }

  function reset() {
    setValues(initial);
  }

  return { values, bind, reset };
}
```

- [ ] **Step 2: Create the card shell**

Create `components/calc/calculator-card.tsx`:

```tsx
import { cn } from "@/lib/cn";

/**
 * The white card every calculator's form and results sit in. Matches the card
 * styling already established in `app/delete-account/page.tsx`.
 *
 * Server component: no interactivity of its own.
 */
export function CalculatorCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create the field group**

Create `components/calc/field-group.tsx`:

```tsx
import { cn } from "@/lib/cn";

/**
 * A titled group of related fields — "Khoản vay", "Chi phí nhà" and so on.
 *
 * Renders a real `fieldset`/`legend`, which is what actually associates the
 * group's name with its fields for assistive technology. A styled `div` with
 * a heading would look identical and convey nothing.
 *
 * Untitled groups are allowed: single-field calculators need the spacing
 * without inventing a heading.
 */
export function FieldGroup({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      {title ? (
        <legend className="mb-3 font-display text-base font-medium text-ink">
          {title}
        </legend>
      ) : null}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
```

- [ ] **Step 4: Create the number field**

Create `components/calc/number-field.tsx`:

```tsx
"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A numeric input with its label, unit, help text and validation message.
 *
 * This component owns the whole accessibility contract for calculator input,
 * so that no calculator author has to remember it and none can get it wrong:
 *
 * - `useId` generates the id, so `htmlFor`/`id` cannot drift apart and two
 *   fields on one page cannot collide.
 * - `aria-describedby` points at the help paragraph.
 * - `aria-invalid` reflects the validity flag.
 * - The help paragraph carries `aria-live="polite"`, because
 *   `aria-describedby` content is announced on FOCUS only. Without the live
 *   region a screen-reader user who types an invalid value is never told
 *   why the results disappeared. (Found by review on the first calculator.)
 * - `unit` is appended to the visible LABEL, not just rendered as a
 *   decorative suffix, so a non-visual user gets the unit at all. The suffix
 *   span is `aria-hidden` precisely because the label already carries it.
 *
 * `type="text"` rather than `type="number"`: number inputs reject the comma
 * decimal separator Vietnamese keyboards produce, which is exactly what
 * `parseDecimal`/`parseMoney` are built to accept. `inputMode="decimal"`
 * still gives mobile the numeric keypad.
 */
export function NumberField({
  label,
  unit,
  help,
  error,
  value,
  onValueChange,
  invalid = false,
  placeholder,
}: {
  label: string;
  /** e.g. "%" or "₫" — appended to the accessible label. */
  unit?: string;
  help: string;
  /** Shown in place of `help` while `invalid`. */
  error?: string;
  value: string;
  onValueChange: (next: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const showError = invalid && Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-base font-medium text-ink"
      >
        {unit ? `${label} (${unit})` : label}
      </label>

      <div className="mt-3 flex items-center gap-3">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={helpId}
          aria-invalid={invalid}
          className={cn(
            "w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
            "placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
            invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        {unit ? (
          <span aria-hidden className="shrink-0 text-base text-ink-2">
            {unit}
          </span>
        ) : null}
      </div>

      <p
        id={helpId}
        aria-live="polite"
        className={cn(
          "mt-2 text-sm leading-relaxed",
          showError ? "text-red-600" : "text-ink-3",
        )}
      >
        {showError ? error : help}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no type errors; lint shows only the 3 pre-existing problems.

- [ ] **Step 6: Commit**

```bash
git add components/calc/use-calc-fields.ts components/calc/calculator-card.tsx components/calc/field-group.tsx components/calc/number-field.tsx
git commit -m "feat: calculator input primitives owning the a11y contract"
```

---

### Task 6: Output primitives and the shared disclaimer

**Files:**
- Create: `components/calc/result-group.tsx`
- Create: `components/calc/result-row.tsx`
- Create: `components/calc/disclaimer.tsx`
- Create: `content/calculators/shared.ts`

**Interfaces:**
- Consumes: `cn` from `@/lib/cn`; `PLACEHOLDER` from `@/lib/calc/number` (Task 2).
- Produces:
  - `<ResultGroup title>{children}</ResultGroup>`
  - `<ResultRow label value />` where `value: string | null`
  - `<CalculatorDisclaimer variant?="default" | "us-rules" />`
  - `CALCULATOR_COPY` from `content/calculators/shared.ts`

  Task 9 consumes `ResultGroup`, `ResultRow` and `CalculatorDisclaimer`.

- [ ] **Step 1: Create the shared copy module**

Create `content/calculators/shared.ts`. The `disclaimer` string is moved verbatim from `content/rule-of-72.ts` so the retrofit in Task 9 changes no rendered text:

```ts
// Copy shared by every calculator in the suite.
//
// `disclaimer` is the text every calculator shows below its results. It was
// written for the Rule of 72 calculator and is reproduced here VERBATIM —
// Task 9's retrofit must not change a single rendered character, because the
// built HTML is the regression gate.
//
// `usRulesNotice` is shown ABOVE the calculator, not below, on the ~29 tools
// governed by United States tax and retirement law. Those tools are built for
// parity with the reference site but do not apply to Vietnamese users, and
// burying that at the bottom of the page would not be telling them.

export const CALCULATOR_COPY = {
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, dựa trên mức lãi suất do bạn tự nhập và giả định lãi suất không đổi. Kết quả không trừ thuế, phí và lạm phát, không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",

  usRulesNotice:
    "Công cụ này mô phỏng quy định về thuế và hưu trí của Hoa Kỳ. Kết quả không áp dụng cho người dùng tại Việt Nam và không phản ánh pháp luật thuế, bảo hiểm xã hội hay hưu trí của Việt Nam. Công cụ được cung cấp để tham khảo và đối chiếu.",
} as const;
```

- [ ] **Step 2: Create the result row**

Create `components/calc/result-row.tsx`:

```tsx
import { PLACEHOLDER } from "@/lib/calc/number";

/**
 * One label/value line of a result group.
 *
 * `aria-atomic` sits HERE rather than on the enclosing live region. It applies
 * to the changed node's nearest ancestor carrying it, so on the row a screen
 * reader announces "Trả hằng tháng: 12.500.000 ₫" — label and value together.
 * On the group it would instead re-announce every output of a six-result
 * calculator on every keystroke.
 *
 * `value` arrives already formatted, including any unit: the calculator knows
 * whether its number is money, a percentage or years, and this component does
 * not need to. `null` means "no result", never zero.
 */
export function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div
      aria-atomic="true"
      className="flex items-baseline justify-between gap-4 border-t border-ink-4/20 py-3 first:border-t-0"
    >
      <span className="text-sm leading-snug text-ink-2 md:text-base">
        {label}
      </span>
      <span className="shrink-0 font-display text-xl font-medium tabular-nums text-ink md:text-2xl">
        {value === null ? PLACEHOLDER : value}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Create the result group**

Create `components/calc/result-group.tsx`:

```tsx
import { cn } from "@/lib/cn";

/**
 * The results panel of a calculator, and the single `aria-live` region for
 * everything inside it.
 *
 * One region per group, never one per row: a screen reader should announce a
 * recomputation once, not once per output. The per-row `aria-atomic` on
 * `ResultRow` is what makes each announcement carry its own label.
 *
 * `title` renders as an `h2`, which suits every current page — the calculator
 * sits under the page `h1` alongside the prose sections.
 */
export function ResultGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl bg-bg-soft p-5", className)}>
      <h2 className="font-display text-base font-medium text-ink">{title}</h2>
      <div className="mt-2" aria-live="polite">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the disclaimer**

Create `components/calc/disclaimer.tsx`:

```tsx
import { cn } from "@/lib/cn";
import { CALCULATOR_COPY } from "@/content/calculators/shared";

/**
 * The notice every calculator carries.
 *
 * `default` goes below the results: the tool is illustrative, assumes a
 * constant user-supplied rate, excludes tax, fees and inflation, and is not
 * investment advice. Mandatory on every calculator — these pages put
 * financial figures in front of Vietnamese consumers.
 *
 * `us-rules` goes ABOVE the calculator and is styled to be noticed, for the
 * tools that model United States tax and retirement law. A Vietnamese user
 * should learn that a tool does not apply to them before they spend five
 * minutes filling it in, not afterwards.
 */
export function CalculatorDisclaimer({
  variant = "default",
  className,
}: {
  variant?: "default" | "us-rules";
  className?: string;
}) {
  const isUsRules = variant === "us-rules";

  return (
    <p
      className={cn(
        "rounded-xl border p-4 text-sm leading-relaxed",
        isUsRules
          ? "border-red-400/40 bg-red-50 text-ink-2"
          : "border-ink-4/15 bg-bg-soft text-ink-2",
        className,
      )}
    >
      {isUsRules ? CALCULATOR_COPY.usRulesNotice : CALCULATOR_COPY.disclaimer}
    </p>
  );
}
```

- [ ] **Step 5: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no type errors; lint shows only the 3 pre-existing problems.

- [ ] **Step 6: Commit**

```bash
git add components/calc/result-group.tsx components/calc/result-row.tsx components/calc/disclaimer.tsx content/calculators/shared.ts
git commit -m "feat: calculator result primitives and shared disclaimer"
```

---

### Task 7: Calculator registry and sitemap derivation

**Files:**
- Create: `content/calculators/registry.ts`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `absUrl`, `canonicalPath` from `@/lib/seo` (already exist).
- Produces:
  - `type CalculatorCategory`, `type CalculatorEntry`
  - `CALCULATORS: CalculatorEntry[]`
  - `CATEGORY_LABELS: Record<CalculatorCategory, string>`
  - `CATEGORY_ORDER: CalculatorCategory[]`
  - `calculatorPath(slug: string): string`

  Task 8's hub page consumes all of these.

- [ ] **Step 1: Create the registry**

Create `content/calculators/registry.ts`:

```ts
// The single source of truth for which calculators exist.
//
// The hub page (`app/cong-cu/page.tsx`) and the sitemap (`app/sitemap.ts`)
// both derive from this array, so a new calculator is registered once rather
// than in three places that then drift.
//
// ONLY calculators that are actually built appear here. There is deliberately
// no "planned" status: the hub shows finished tools only, so a planned entry
// would have no reader, and inventing 74 Vietnamese names now — which each
// sub-project would then revise when it designs that calculator — is
// speculative work with a drift risk. The full 75-tool inventory lives in
// `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md`.

export type CalculatorCategory =
  | "tai-chinh-dau-tu"
  | "vay-the-chap"
  | "huu-tri"
  | "the-tin-dung"
  | "vay-mua-xe"
  | "chung-khoan"
  | "khac";

export type CalculatorEntry = {
  /** Route segment: "quy-tac-72" -> /cong-cu/quy-tac-72/ */
  slug: string;
  /** Vietnamese name, shown on the hub. */
  title: string;
  /** One line under the title on the hub. */
  summary: string;
  category: CalculatorCategory;
  /**
   * Set on tools that model United States tax or retirement law. Drives the
   * `us-rules` notice and a lower sitemap priority, so we don't actively
   * drive Vietnamese users into rules that don't apply to them.
   */
  usRules?: true;
};

export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  "tai-chinh-dau-tu": "Tài chính & Đầu tư",
  "vay-the-chap": "Vay & Thế chấp",
  "huu-tri": "Hưu trí",
  "the-tin-dung": "Thẻ tín dụng",
  "vay-mua-xe": "Vay & Thuê mua xe",
  "chung-khoan": "Chứng khoán",
  khac: "Khác",
};

/** Display order of categories on the hub. */
export const CATEGORY_ORDER: CalculatorCategory[] = [
  "vay-the-chap",
  "tai-chinh-dau-tu",
  "the-tin-dung",
  "vay-mua-xe",
  "chung-khoan",
  "huu-tri",
  "khac",
];

export const CALCULATORS: CalculatorEntry[] = [
  {
    slug: "quy-tac-72",
    title: "Quy tắc 72",
    summary: "Tính số năm để số tiền gốc nhân đôi nhờ lãi kép.",
    category: "tai-chinh-dau-tu",
  },
];

/** Site-relative path for a calculator, without the trailing slash. */
export function calculatorPath(slug: string): string {
  return `/cong-cu/${slug}`;
}
```

- [ ] **Step 2: Derive the sitemap from the registry**

`app/sitemap.ts` currently hardcodes the Rule of 72 route. Replace that hardcoded entry with a derived block.

Add the import alongside the existing ones:

```ts
import { CALCULATORS, calculatorPath } from "@/content/calculators/registry";
```

Then **remove** this hardcoded entry from `staticEntries`:

```ts
    {
      url: absUrl(canonicalPath("/cong-cu/quy-tac-72")),
      changeFrequency: "monthly",
      priority: 0.6,
    },
```

and in its place put the hub entry:

```ts
    { url: absUrl(canonicalPath("/cong-cu")), changeFrequency: "monthly", priority: 0.5 },
```

Then add a derived block next to the existing `postEntries`, and include it in the return:

```ts
  // Derived from the registry so a new calculator never needs a sitemap edit.
  // US-rules tools get a lower priority: they exist for parity with the
  // reference site, but we don't advertise them to Vietnamese searchers.
  const calculatorEntries: MetadataRoute.Sitemap = CALCULATORS.map((calc) => ({
    url: absUrl(canonicalPath(calculatorPath(calc.slug))),
    changeFrequency: "monthly",
    priority: calc.usRules ? 0.3 : 0.6,
  }));

  return [...staticEntries, ...calculatorEntries, ...postEntries];
```

- [ ] **Step 3: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no type errors; lint shows only the 3 pre-existing problems.

- [ ] **Step 4: Verify the sitemap output is unchanged for the existing route and gained the hub**

Run:
```bash
pnpm build
grep -o 'cong-cu/quy-tac-72/' out/sitemap.xml
grep -o '<loc>[^<]*cong-cu/</loc>' out/sitemap.xml
grep -c '<url>' out/sitemap.xml
```
Expected: the calculator route still present (proving the derivation replaced the hardcoded entry without losing it), the hub URL now present, and the total `<url>` count one higher than before this task.

- [ ] **Step 5: Commit**

```bash
git add content/calculators/registry.ts app/sitemap.ts
git commit -m "feat: calculator registry driving the sitemap"
```

---

### Task 8: The `/cong-cu/` hub page

`/cong-cu/` is currently a hard 404 — the namespace was chosen deliberately but nothing serves its index.

**Files:**
- Create: `content/calculators/hub.ts`
- Create: `app/cong-cu/page.tsx`

**Interfaces:**
- Consumes: `CALCULATORS`, `CATEGORY_LABELS`, `CATEGORY_ORDER`, `calculatorPath` (Task 7); `SiteHeader`, `SiteFooter`, `Container`, `Reveal`, `canonicalPath` (all existing).
- Produces: the `/cong-cu/` route. Nothing imports it.

- [ ] **Step 1: Create the hub copy**

Create `content/calculators/hub.ts`:

```ts
// Copy for the /cong-cu/ hub page.

export const CALCULATOR_HUB = {
  slug: "/cong-cu",
  pageTitle: "Công cụ tính toán tài chính",
  metaTitle: "Công cụ tính toán tài chính",
  metaDescription:
    "Bộ công cụ tính toán tài chính miễn phí của FinHome: lãi kép, thời gian nhân đôi tiền, khoản vay và nhiều công cụ khác, bằng tiếng Việt.",
  lede:
    "Các công cụ miễn phí giúp bạn tự tính toán trước khi ra quyết định tài chính. Chọn một công cụ bên dưới để bắt đầu.",
} as const;
```

- [ ] **Step 2: Create the hub page**

Create `app/cong-cu/page.tsx`. It follows the server-shell pattern of `app/delete-account/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { CALCULATOR_HUB as C } from "@/content/calculators/hub";
import {
  CALCULATORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  calculatorPath,
} from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath } from "@/lib/seo";

export const metadata: Metadata = {
  title: C.metaTitle,
  description: C.metaDescription,
  alternates: { canonical: canonicalPath(C.slug) },
  openGraph: {
    type: "website",
    url: canonicalPath(C.slug),
    title: `${C.metaTitle} — FinHome`,
    description: C.metaDescription,
  },
};

export default function CalculatorHubPage() {
  // Only categories that actually have a built calculator are rendered, so
  // the page grows as the registry does without ever showing an empty section.
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: CALCULATORS.filter((calc) => calc.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {C.lede}
            </p>
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                  {CATEGORY_LABELS[group.category]}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.items.map((calc) => (
                    <li key={calc.slug}>
                      <Link
                        href={`${calculatorPath(calc.slug)}/`}
                        className={cn(
                          "block rounded-2xl border border-ink-4/15 bg-white p-5 shadow-sm transition-colors hover:border-brand-green/50",
                          FH_POINTER,
                        )}
                      >
                        <span className="block font-display text-base font-medium text-ink">
                          {calc.title}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                          {calc.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no type errors; lint shows only the 3 pre-existing problems.

- [ ] **Step 4: Verify the route is emitted and the 404 is gone**

Run:
```bash
pnpm build
test -f out/cong-cu/index.html && echo "HUB OK"
grep -o 'href="/cong-cu/quy-tac-72/"' out/cong-cu/index.html | head -1
grep -o 'Tài chính &amp; Đầu tư\|Tài chính & Đầu tư' out/cong-cu/index.html | head -1
```
Expected: `HUB OK`, the link to the one live calculator present, and its category heading rendered.

- [ ] **Step 5: Commit**

```bash
git add content/calculators/hub.ts app/cong-cu/page.tsx
git commit -m "feat: /cong-cu/ calculator hub page"
```

---

### Task 9: Retrofit Rule of 72 onto the primitives

This is the acceptance test for the whole foundation. The abstraction is only proven if the one known-good calculator survives it with no externally visible change.

**Files:**
- Move: `content/rule-of-72.ts` → `content/calculators/rule-of-72.ts`
- Modify: `lib/rule-of-72.ts` (drop `parseRate` and `formatYears`)
- Modify: `lib/rule-of-72.test.ts` (import the shared helpers)
- Modify: `components/rule-of-72-calculator.tsx` (rewrite onto primitives)
- Modify: `app/cong-cu/quy-tac-72/page.tsx` (import path, shared disclaimer)

**Interfaces:**
- Consumes: everything from Tasks 2, 5, 6.
- Produces: nothing new. The route, its metadata and its JSON-LD are unchanged.

- [ ] **Step 1: Move the content module**

```bash
mkdir -p content/calculators
git mv content/rule-of-72.ts content/calculators/rule-of-72.ts
```

Then edit `content/calculators/rule-of-72.ts`: **delete the `disclaimer` field entirely** (its text now lives in `content/calculators/shared.ts`, and the page will render `<CalculatorDisclaimer />`). Change nothing else — every other string must stay byte-identical.

- [ ] **Step 2: Strip the superseded helpers from the math module**

In `lib/rule-of-72.ts`, delete the `DECIMAL` constant, the `parseRate` function, and the `formatYears` function, along with their doc comments. Keep the module docstring, `LN2`, `rule72Years` and `exactYears` exactly as they are.

The file's remaining docstring line referencing the reference table stays accurate. After the edit the module exports exactly two functions.

- [ ] **Step 3: Point the tests at the shared helpers**

In `lib/rule-of-72.test.ts`:

Change the import block from:

```ts
import {
  parseRate,
  rule72Years,
  exactYears,
  formatYears,
} from "@/lib/rule-of-72";
```

to:

```ts
import { rule72Years, exactYears } from "@/lib/rule-of-72";
import { parseDecimal, formatDecimal } from "@/lib/calc/number";
```

Then, throughout the file, replace every `parseRate(` with `parseDecimal(` and every `formatYears(` with `formatDecimal(`.

**Delete the entire `describe("parseRate", …)` and `describe("formatYears", …)` blocks** — those behaviours are now owned and tested by `lib/calc/number.test.ts`, and duplicating them here would be two suites asserting the same thing. Keep `describe("rule72Years")`, `describe("exactYears")` and `describe("reference values (spec table)")` unchanged apart from the renames above.

The reference table's expected strings must not change: `["6", "12,00", "11,90"]`, `["7.5", "9,60", "9,58"]` and every other row stay exactly as they are. That table passing after the swap is what proves `formatDecimal(v, 2)` is behaviourally identical to the deleted `formatYears(v)`.

- [ ] **Step 4: Run the tests**

Run: `pnpm test`
Expected: all suites pass. The Rule of 72 suite is now smaller (the two moved blocks are gone) but the reference table still passes with identical expected strings.

- [ ] **Step 5: Rewrite the calculator island onto the primitives**

Replace the whole contents of `components/rule-of-72-calculator.tsx` with:

```tsx
"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, parseDecimal } from "@/lib/calc/number";
import { exactYears, rule72Years } from "@/lib/rule-of-72";
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";

export function RuleOf72Calculator() {
  const fields = useCalcFields({ rate: C.form.defaultRate });

  const rate = parseDecimal(fields.values.rate);
  const estimate = rate === null ? null : rule72Years(rate);
  const exact = rate === null ? null : exactYears(rate);
  // A null estimate covers every rejected case: empty, unparseable, zero,
  // negative. `exact` is null under exactly the same conditions.
  const invalid = estimate === null;

  const years = (value: number | null) =>
    value === null ? null : `${formatDecimal(value)} ${C.form.unit}`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateSuffix}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={invalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-6">
        <ResultRow label={C.form.estimateLabel} value={years(estimate)} />
        <ResultRow label={C.form.exactLabel} value={years(exact)} />
      </ResultGroup>
    </CalculatorCard>
  );
}
```

Note on `rateLabel`: it is currently the string `"Lãi suất hằng năm (%)"`. `NumberField` appends `unit` to the label itself, so passing both would render `"Lãi suất hằng năm (%) (%)"`. **Change `rateLabel` in `content/calculators/rule-of-72.ts` back to `"Lãi suất hằng năm"`** — the `(%)` is now supplied by the `unit` prop, which is exactly the mechanism that put the unit in the accessible label in the first place. The rendered label text is unchanged.

- [ ] **Step 6: Update the page's imports and disclaimer**

In `app/cong-cu/quy-tac-72/page.tsx`:

Change the content import from:

```ts
import { RULE_OF_72 as C } from "@/content/rule-of-72";
```

to:

```ts
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";
```

Add:

```ts
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
```

Then replace the hand-rolled disclaimer paragraph:

```tsx
            {/* Mandatory: this page outputs return figures on a finance domain. */}
            <p className="rounded-xl border border-ink-4/15 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
              {C.disclaimer}
            </p>
```

with:

```tsx
            {/* Mandatory: this page outputs return figures on a finance domain. */}
            <CalculatorDisclaimer />
```

Change nothing else — the metadata, both JSON-LD blocks, and every prose section stay as they are.

- [ ] **Step 7: Verify typecheck, lint and tests**

Run: `pnpm test && pnpm exec tsc --noEmit && pnpm lint`
Expected: all suites pass; no type errors; lint shows only the 3 pre-existing problems. In particular `tsc` must confirm nothing still imports `@/content/rule-of-72` or the deleted `parseRate`/`formatYears`.

- [ ] **Step 8: The regression gate — the built page must be unchanged in substance**

Run:
```bash
pnpm build
test -f out/cong-cu/quy-tac-72/index.html && echo "ROUTE OK"
grep -o '12,00 năm' out/cong-cu/quy-tac-72/index.html | wc -l
grep -o '11,90 năm' out/cong-cu/quy-tac-72/index.html | head -1
grep -o 'aria-live="polite"' out/cong-cu/quy-tac-72/index.html | wc -l
grep -o 'aria-atomic="true"' out/cong-cu/quy-tac-72/index.html | wc -l
grep -o 'Lãi suất hằng năm (%)' out/cong-cu/quy-tac-72/index.html | head -1
grep -o 'không phải lời khuyên đầu tư' out/cong-cu/quy-tac-72/index.html | head -1
node -e '
const fs = require("node:fs");
const html = fs.readFileSync("out/cong-cu/quy-tac-72/index.html", "utf8");
const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
console.log("ld+json types:", blocks.map((b) => b["@type"]).join(", "));
console.log("faq questions:", blocks.find((b) => b["@type"] === "FAQPage").mainEntity.length);
'
```
Expected, every line:
- `ROUTE OK`
- `12,00 năm` count is `1`
- `11,90 năm` present
- `aria-live="polite"` count is **2** (the field's help paragraph and the result group)
- `aria-atomic="true"` count is **2** (one per result row — this is new and correct)
- `Lãi suất hằng năm (%)` present (proving `unit` reached the label)
- the disclaimer's closing phrase present (proving the shared component renders the same text)
- `ld+json types: WebApplication, FAQPage` and `faq questions: 4`

Any mismatch means the retrofit changed observable behaviour and must be fixed before commit.

- [ ] **Step 9: Confirm the island actually got simpler**

Run: `wc -l components/rule-of-72-calculator.tsx`
Expected: fewer than 55 lines, down from 98. If it did not shrink substantially, the primitives are not carrying their weight and that is worth reporting as a concern.

- [ ] **Step 10: Commit**

```bash
git add -A lib/rule-of-72.ts lib/rule-of-72.test.ts components/rule-of-72-calculator.tsx app/cong-cu/quy-tac-72/page.tsx content/calculators/rule-of-72.ts content/rule-of-72.ts
git commit -m "refactor: retrofit Rule of 72 onto the shared calculator primitives"
```

---

### Task 10: Full verification pass

No production code changes. Its own reviewer gate, proving the foundation and the retrofit hold together.

**Files:**
- None created or modified. If a check fails, fix it in the file that owns the defect and re-run every check from the top.

**Interfaces:**
- Consumes: everything from Tasks 1–9.
- Produces: nothing.

- [ ] **Step 1: Run the full automated suite**

Run:
```bash
pnpm test && pnpm exec tsc --noEmit && pnpm lint; echo "lint exit=$?"
```
Expected: all suites pass; no type errors; lint exits 1 with **exactly** the 3 pre-existing problems in `components/site-header.tsx` and `scripts/header-cmp.mjs` and nothing else.

- [ ] **Step 2: Run the deploy command exactly as Vercel will**

Run: `pnpm exec vitest run && pnpm exec next build`
Expected: tests pass, then the build succeeds. This is Task 1's gate in its real form.

- [ ] **Step 3: Confirm every route is emitted**

Run:
```bash
test -f out/cong-cu/index.html && echo "HUB OK"
test -f out/cong-cu/quy-tac-72/index.html && echo "CALC OK"
grep -o 'cong-cu/quy-tac-72/' out/sitemap.xml
grep -o '<loc>[^<]*cong-cu/</loc>' out/sitemap.xml
```
Expected: `HUB OK`, `CALC OK`, and both URLs in the sitemap.

- [ ] **Step 4: Confirm the accessibility contract survived into the HTML**

Run:
```bash
for f in out/cong-cu/quy-tac-72/index.html; do
  echo "--- $f"
  grep -o 'aria-live="polite"' "$f" | wc -l
  grep -o 'aria-atomic="true"' "$f" | wc -l
  grep -o 'aria-invalid="false"' "$f" | wc -l
  grep -oE 'for="[^"]+"' "$f" | head -2
  grep -oE 'id="[^"]+-help"' "$f" | head -2
  grep -oE 'aria-describedby="[^"]+"' "$f" | head -2
done
```
Expected: `aria-live` = 2, `aria-atomic` = 2, `aria-invalid="false"` = 1, and the `for=` / `id="…-help"` / `aria-describedby=` values consistent with each other — the `for` target must match the input's generated id, and `aria-describedby` must match the `-help` paragraph's id. React's `useId` values contain colons; that is expected and valid in HTML5.

- [ ] **Step 5: Confirm the shared math is genuinely shared**

Run:
```bash
grep -rn "toLocaleString\|Intl\." lib/calc components/calc app/cong-cu components/rule-of-72-calculator.tsx || echo "NO ICU APIS — OK"
grep -rn "parseRate\|formatYears" lib components app content || echo "NO STALE HELPERS — OK"
grep -rn "@/content/rule-of-72" app components lib || echo "NO STALE IMPORT PATH — OK"
```
Expected: all three print their OK line. Any hit is a leftover from the retrofit.

- [ ] **Step 6: Confirm no calculator can ship without a disclaimer**

Run:
```bash
grep -o 'không phải lời khuyên đầu tư' out/cong-cu/quy-tac-72/index.html | head -1
```
Expected: present. (With one calculator this is a single check; SP-8 turns it into a loop over the registry.)

- [ ] **Step 7: Confirm no copied content from the reference site**

Run:
```bash
grep -ril 'fncalculator\|Years Required for Principal to Double\|Rule of 72 Estimate' app components lib content || echo "CLEAN"
```
Expected: `CLEAN`.

- [ ] **Step 8: Commit any fixes**

If Steps 1–7 required changes:

```bash
git add -A
git commit -m "fix: address SP-0 verification findings"
```

If nothing needed fixing, skip this step — there is nothing to commit.

---

## Self-Review

**Spec coverage** — every section of the SP-0 design spec maps to a task:

| Spec section | Task |
|---|---|
| `lib/calc/number.ts` (parse/format, VN convention, hand-rolled) | 2 |
| `lib/calc/finance.ts` (annuity fns, compounding, amortize, sign convention) | 4 |
| `lib/calc/solve.ts` (bisect, null on non-bracketing) | 3 |
| UI primitives + the full a11y contract (`aria-live` on help, unit in label, per-row `aria-atomic`) | 5, 6 |
| `content/calculators/registry.ts` (+ `usRules` sitemap de-prioritisation) | 7 |
| `/cong-cu/` hub page, built calculators only, no text filter | 8 |
| Disclaimers (default below, `us-rules` above) | 6 |
| Rule of 72 retrofit + regression gate | 9 |
| Testing table (all reference values) | 2, 3, 4 |
| Test gate decision (`vercel.json`) | 1 |
| Risks: retrofit regression / sign convention / payload | 9 Step 8; 4 Step 1 invariants; n/a (ScheduleTable deferred) |
| Out-of-scope deferrals (SelectField, RadioGroupField, UnitToggle, ScheduleTable, normalCdf) | none — deliberately absent |

**Placeholder scan** — no `TBD`, no "add error handling", no "similar to Task N". Every code step contains complete content; every verification step names the command and the expected output.

**Type consistency** — `parseDecimal`/`formatDecimal` keep identical signatures across Tasks 2 and 9. `bisect`'s signature in Task 3 matches its Task 4 call in `solveRate`. `FieldBinding` from Task 5's `useCalcFields` is spread onto Task 5's `NumberField` and consumed that way in Task 9. `ResultRow`'s `value: string | null` in Task 6 matches Task 9's `years()` helper return type. `CalculatorEntry` in Task 7 matches the Task 8 hub's field access (`slug`, `title`, `summary`, `category`) and the sitemap's `usRules` read. `PLACEHOLDER` is exported by Task 2 and imported by Task 6.

**One cross-task hazard, called out explicitly:** Task 9 Step 5 must change `rateLabel` from `"Lãi suất hằng năm (%)"` to `"Lãi suất hằng năm"`, because `NumberField` now appends the unit itself and leaving both would render `(%) (%)`. The rendered output is unchanged, and Task 9 Step 8 greps for `Lãi suất hằng năm (%)` in the built HTML to prove it.
