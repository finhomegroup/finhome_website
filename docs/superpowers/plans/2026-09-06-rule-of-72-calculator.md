# Rule of 72 Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Vietnamese-language, FinHome-branded Rule of 72 calculator at `/cong-cu/quy-tac-72/` that reproduces the capability of `fncalculator.com/financialcalculator?type=rule72Calculator` with original copy and the repo's existing design system.

**Architecture:** Server page shell + one client island, mirroring the existing `/delete-account` pattern. Pure arithmetic lives in `lib/rule-of-72.ts` (unit-tested); all Vietnamese copy lives in `content/rule-of-72.ts`; only the rate input and its two result rows are `"use client"`. The page itself is a server component owning metadata, JSON-LD, and prose.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19.2.4, TypeScript 5, Tailwind CSS v4, Radix Accordion, pnpm. Vitest is added by this plan as the repo's first test runner.

**Spec:** `docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md`

## Global Constraints

- **Static export only.** `next.config.ts` sets `output: "export"` and `trailingSlash: true`. The page must be fully prerenderable — no request-time data, no dynamic params, no server actions.
- **Route is exactly** `/cong-cu/quy-tac-72/` → file `app/cong-cu/quy-tac-72/page.tsx`, built output `out/cong-cu/quy-tac-72/index.html`.
- **All user-facing copy is Vietnamese** and lives in `content/rule-of-72.ts`. No hardcoded Vietnamese strings in components or pages.
- **No copying from fncalculator.com.** Reimplement the arithmetic only. No layout, markup, or prose from the source site (it carries a 2012–2017 copyright notice).
- **Decimal display uses a comma** (`11,90`), produced by `formatYears`, never `Intl.NumberFormat`. Hydration must match the prerendered string exactly.
- **Reuse existing primitives:** `Container`, `Reveal`, `Accordion`, `SiteHeader`, `SiteFooter`, `cn`, `canonicalPath`, `absUrl`, `JsonLd`. Add no new design tokens; colors come from `app/globals.css` (`ink`, `ink-2`, `ink-3`, `ink-4`, `brand-green`, `bg-soft`).
- **Package manager is pnpm.** Use `pnpm`, never `npm` or `yarn`.
- **The disclaimer block is mandatory** and must ship in the same task as the page.
- **Import alias:** `@/` maps to the repo root (see `tsconfig.json`).

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `vitest.config.ts` | Create | Test runner config; `@/` alias; only picks up `lib/**/*.test.ts`. |
| `package.json` | Modify | Add `vitest` devDependency + `"test"` script. |
| `lib/rule-of-72.ts` | Create | Pure arithmetic + input parsing + number formatting. No React, no I/O. |
| `lib/rule-of-72.test.ts` | Create | Unit tests for the above. |
| `content/rule-of-72.ts` | Create | Every Vietnamese string on the page. |
| `components/rule-of-72-calculator.tsx` | Create | `"use client"` island: rate input, validation, two result rows. |
| `lib/seo.ts` | Modify | Add `faqSchema` and `calculatorSchema` builders. |
| `lib/seo.test.ts` | Create | Unit tests for the two new builders. |
| `app/cong-cu/quy-tac-72/page.tsx` | Create | Server shell: metadata, JSON-LD, prose sections, FAQ, disclaimer. |
| `app/sitemap.ts` | Modify | Register the new route. |
| `content/site.ts` | Modify | Footer link to the calculator. |

---

### Task 1: Vitest setup + pure arithmetic module

The repo has no test runner today. This task adds a minimal one scoped to `lib/**/*.test.ts` and delivers the tested math module. Setup is folded in here because this is the first task whose deliverable needs it.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency, add `"test"` script)
- Create: `lib/rule-of-72.ts`
- Test: `lib/rule-of-72.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `parseRate(raw: string): number | null`
  - `rule72Years(rate: number): number | null`
  - `exactYears(rate: number): number | null`
  - `formatYears(value: number): string`

- [ ] **Step 1: Install vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Create the vitest config**

Create `vitest.config.ts`. `import.meta.url` is used rather than `__dirname` because the repo is ESM (`"type": "module"` in `package.json`), where `__dirname` does not exist.

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Pure logic only — no jsdom, no component tests. Keeps the runner fast
    // and the dependency surface at exactly one package.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    // Mirror the `@/*` -> repo-root alias from tsconfig.json so test files can
    // import modules the same way app code does.
    alias: { "@": root },
  },
});
```

- [ ] **Step 3: Add the test script**

In `package.json`, add `"test": "vitest run"` to `"scripts"`, immediately after `"lint": "eslint"`:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
```

- [ ] **Step 4: Write the failing tests**

Create `lib/rule-of-72.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parseRate,
  rule72Years,
  exactYears,
  formatYears,
} from "@/lib/rule-of-72";

describe("parseRate", () => {
  it("parses a plain integer", () => {
    expect(parseRate("6")).toBe(6);
  });

  it("parses a dot decimal", () => {
    expect(parseRate("7.5")).toBe(7.5);
  });

  it("parses a comma decimal (Vietnamese keyboard)", () => {
    expect(parseRate("7,5")).toBe(7.5);
  });

  it("tolerates a trailing separator while the user is still typing", () => {
    expect(parseRate("7,")).toBe(7);
    expect(parseRate("7.")).toBe(7);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseRate("  6  ")).toBe(6);
  });

  it("parses a leading-dot decimal", () => {
    expect(parseRate(".5")).toBe(0.5);
  });

  it("parses a negative rate (validity is decided downstream)", () => {
    expect(parseRate("-5")).toBe(-5);
  });

  it("returns null for empty or whitespace-only input", () => {
    expect(parseRate("")).toBeNull();
    expect(parseRate("   ")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseRate("abc")).toBeNull();
    expect(parseRate("7abc")).toBeNull();
    expect(parseRate("7.5.2")).toBeNull();
    expect(parseRate(".")).toBeNull();
  });

  it("returns null for exponent notation", () => {
    expect(parseRate("1e9")).toBeNull();
  });
});

describe("rule72Years", () => {
  it("divides 72 by the rate", () => {
    expect(rule72Years(6)).toBeCloseTo(12, 10);
    expect(rule72Years(10)).toBeCloseTo(7.2, 10);
    expect(rule72Years(72)).toBeCloseTo(1, 10);
  });

  it("returns null when the principal never doubles", () => {
    expect(rule72Years(0)).toBeNull();
    expect(rule72Years(-5)).toBeNull();
  });

  it("returns null for non-finite input", () => {
    expect(rule72Years(Number.NaN)).toBeNull();
    expect(rule72Years(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("exactYears", () => {
  it("solves (1 + r)^t = 2", () => {
    expect(exactYears(6)).toBeCloseTo(11.8957, 4);
    expect(exactYears(10)).toBeCloseTo(7.2725, 4);
    expect(exactYears(72)).toBeCloseTo(1.2781, 4);
  });

  it("returns null when the principal never doubles", () => {
    expect(exactYears(0)).toBeNull();
    expect(exactYears(-5)).toBeNull();
  });

  it("returns null for non-finite input", () => {
    expect(exactYears(Number.NaN)).toBeNull();
    expect(exactYears(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("formatYears", () => {
  it("renders two decimals with a Vietnamese decimal comma", () => {
    expect(formatYears(12)).toBe("12,00");
    expect(formatYears(11.8957)).toBe("11,90");
    expect(formatYears(7.2725)).toBe("7,27");
  });
});

// The reference table from the spec, end to end through parse -> compute ->
// format. This is the contract the page's displayed numbers must satisfy.
describe("reference values (spec table)", () => {
  const cases: [string, string | null, string | null][] = [
    ["2", "36,00", "35,00"],
    ["6", "12,00", "11,90"],
    ["7", "10,29", "10,24"],
    ["7,5", "9,60", "9,58"],
    ["10", "7,20", "7,27"],
    ["72", "1,00", "1,28"],
    ["0", null, null],
    ["-5", null, null],
    ["", null, null],
    ["abc", null, null],
  ];

  it.each(cases)("rate %s -> estimate %s, exact %s", (raw, estimate, exact) => {
    const rate = parseRate(raw);
    const est = rate === null ? null : rule72Years(rate);
    const ex = rate === null ? null : exactYears(rate);
    expect(est === null ? null : formatYears(est)).toBe(estimate);
    expect(ex === null ? null : formatYears(ex)).toBe(exact);
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — vitest cannot resolve `@/lib/rule-of-72` ("Failed to resolve import" / module not found), because the module does not exist yet.

- [ ] **Step 6: Write the implementation**

Create `lib/rule-of-72.ts`:

```ts
/**
 * Rule of 72 — the arithmetic behind /cong-cu/quy-tac-72/.
 *
 * Pure module: no React, no I/O, no DOM. Every export is unit-tested in
 * `lib/rule-of-72.test.ts`, which also pins the reference value table from
 * the design spec.
 */

const LN2 = Math.log(2);

/**
 * Plain decimal numbers only. Anything else — exponent notation, stray
 * letters, a bare separator — is rejected. A single trailing separator is
 * allowed so results don't blank out mid-typing when the user hits "7,".
 */
const DECIMAL = /^-?(\d+[.]?\d*|[.]\d+)$/;

/** Parse the rate field. Accepts "7.5" and "7,5" (Vietnamese decimal comma). */
export function parseRate(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (!DECIMAL.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Rule-of-72 estimate: 72 / rate.
 *
 * Null when `rate` is not a doubling rate — at 0% the principal never doubles
 * (and 72/0 is Infinity), and at a negative rate it shrinks.
 */
export function rule72Years(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return 72 / rate;
}

/** Exact solution of (1 + r)^t = 2, i.e. t = ln2 / ln(1 + r). */
export function exactYears(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return LN2 / Math.log(1 + rate / 100);
}

/**
 * 11.8957 -> "11,90".
 *
 * Hand-rolled rather than `Intl.NumberFormat("vi-VN", …)`: the input is
 * prefilled, so the server prerenders a result string the client must hydrate
 * to identically, and this removes any Node-ICU vs. browser-ICU mismatch.
 */
export function formatYears(value: number): string {
  return value.toFixed(2).replace(".", ",");
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `pnpm test`
Expected: PASS — all tests green, including every row of the reference table.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml lib/rule-of-72.ts lib/rule-of-72.test.ts
git commit -m "feat: rule-of-72 arithmetic module with vitest setup"
```

---

### Task 2: Vietnamese copy module

**Files:**
- Create: `content/rule-of-72.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `RULE_OF_72`, a `const`-asserted object. Fields used by later tasks:
  `slug`, `pageTitle`, `metaTitle`, `metaDescription`, `lede`,
  `form.{rateLabel, rateSuffix, rateHelp, rateInvalid, resultTitle, estimateLabel, exactLabel, unit, defaultRate}`,
  `formula.{title, body}`, `example.{title, body}`, `caveats.{title, items}`,
  `faq.{title, items}` where `items: { q: string; a: string }[]`, and `disclaimer`.

- [ ] **Step 1: Create the content module**

Create `content/rule-of-72.ts`. This is original FinHome copy — do not paste anything from fncalculator.com.

```ts
// Copy for /cong-cu/quy-tac-72/ — the Rule of 72 calculator.
//
// Original FinHome copy. The arithmetic is standard finance, but none of the
// wording or layout here is taken from the reference tool at fncalculator.com.
//
// `faq.items` is reused verbatim as FAQPage JSON-LD on the page, so the prose
// and the structured data cannot drift apart.

export const RULE_OF_72 = {
  slug: "/cong-cu/quy-tac-72",

  pageTitle: "Quy tắc 72: Bao lâu để tiền của bạn nhân đôi?",
  metaTitle: "Quy tắc 72 — Tính số năm để tiền nhân đôi",
  metaDescription:
    "Nhập lãi suất hằng năm để biết cần bao nhiêu năm để số tiền gốc nhân đôi. Công cụ miễn phí của FinHome, so sánh ước tính theo quy tắc 72 với kết quả chính xác.",

  lede:
    "Quy tắc 72 là cách nhẩm nhanh: lấy 72 chia cho lãi suất hằng năm, bạn có ngay số năm để số tiền gốc nhân đôi nhờ lãi kép. Nhập lãi suất bên dưới để xem kết quả.",

  form: {
    rateLabel: "Lãi suất hằng năm",
    rateSuffix: "%",
    rateHelp: "Nhập lãi suất kép hằng năm, ví dụ 6 hoặc 7,5.",
    rateInvalid: "Vui lòng nhập lãi suất lớn hơn 0 để tính thời gian nhân đôi.",
    resultTitle: "Số năm để gốc nhân đôi",
    estimateLabel: "Ước tính theo quy tắc 72",
    exactLabel: "Kết quả chính xác",
    unit: "năm",
    // Prefilled: ~6%/năm is a realistic Vietnamese deposit rate and sits
    // inside the 6–10% band where the rule is accurate. A default also means
    // the statically exported HTML ships a worked result, not empty fields.
    defaultRate: "6",
  },

  formula: {
    title: "Công thức và cách hoạt động",
    body: [
      "Ước tính theo quy tắc 72: Số năm ≈ 72 ÷ lãi suất (%). Với lãi suất 6%/năm, bạn cần khoảng 72 ÷ 6 = 12 năm để số tiền gốc nhân đôi.",
      "Kết quả chính xác được tính từ công thức lãi kép: giải phương trình (1 + r)^t = 2, ta có t = ln2 ÷ ln(1 + r). Ở mức 6%/năm, con số chính xác là 11,90 năm — rất gần với ước tính 12 năm.",
      "Quy tắc này chỉ đúng với lãi kép, tức là lãi được nhập vào gốc và tiếp tục sinh lãi. Với lãi đơn, tiền của bạn tăng theo đường thẳng và quy tắc 72 không áp dụng được.",
    ],
  },

  example: {
    title: "Ví dụ với 500 triệu đồng",
    body: [
      "Giả sử bạn có 500 triệu đồng và đầu tư ở mức 7%/năm với lãi kép. Theo quy tắc 72, thời gian để khoản này thành 1 tỷ đồng là 72 ÷ 7 ≈ 10,3 năm. Công thức chính xác cho 10,24 năm — chênh lệch chưa tới một tháng.",
      "Cùng số tiền đó, nếu lãi suất chỉ 5%/năm thì cần khoảng 14,4 năm; nếu đạt 10%/năm thì chỉ cần khoảng 7,2 năm. Mỗi điểm phần trăm lãi suất đều rút ngắn đáng kể thời gian chờ.",
    ],
  },

  caveats: {
    title: "Khi nào quy tắc 72 không còn chính xác",
    items: [
      "Quy tắc chính xác nhất trong khoảng lãi suất 6%–10%/năm. Ra ngoài khoảng này, sai số tăng dần theo cả hai hướng.",
      "Với lãi kép liên tục, tử số đúng về mặt toán học gần với 69 hơn là 72, vì ln2 ≈ 0,69.",
      "Kết quả giả định lãi suất không đổi suốt kỳ hạn. Trên thực tế lãi suất huy động, lợi nhuận đầu tư và lạm phát đều thay đổi theo thời gian.",
      "Công cụ không trừ thuế, phí giao dịch, phí quản lý hay tác động của lạm phát lên sức mua.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Quy tắc 72 là gì?",
        a: "Quy tắc 72 là cách nhẩm nhanh số năm cần thiết để một khoản tiền nhân đôi nhờ lãi kép: lấy 72 chia cho lãi suất hằng năm tính theo phần trăm. Ví dụ ở mức 8%/năm, bạn cần khoảng 72 ÷ 8 = 9 năm.",
      },
      {
        q: "Quy tắc 72 có chính xác không?",
        a: "Đây là ước tính, không phải kết quả tuyệt đối. Trong khoảng 6%–10%/năm, sai số thường dưới một năm so với công thức lãi kép chính xác. Với lãi suất rất thấp hoặc rất cao, bạn nên dùng công thức chính xác t = ln2 ÷ ln(1 + r).",
      },
      {
        q: "Quy tắc 72 áp dụng cho lãi kép hay lãi đơn?",
        a: "Chỉ lãi kép. Quy tắc 72 xuất phát từ công thức tăng trưởng lũy tiến, nên nó chỉ đúng khi lãi được nhập vào gốc và tiếp tục sinh lãi ở kỳ sau.",
      },
      {
        q: "Cần lãi suất bao nhiêu để nhân đôi tiền trong 5 năm?",
        a: "Đảo ngược công thức: 72 ÷ 5 = 14,4. Bạn cần mức lãi kép khoảng 14,4%/năm và duy trì liên tục trong 5 năm. Đây là mức cao hơn nhiều so với lãi suất tiết kiệm thông thường, nên thường đi kèm rủi ro lớn hơn.",
      },
    ],
  },

  disclaimer:
    "Công cụ này chỉ mang tính minh họa, dựa trên mức lãi suất do bạn tự nhập và giả định lãi suất không đổi. Kết quả không trừ thuế, phí và lạm phát, không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",
} as const;
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (The module is not imported anywhere yet — this only confirms it is valid TypeScript.)

- [ ] **Step 3: Verify the numbers quoted in the copy**

The prose hardcodes several figures. Confirm each against the tested module rather than trusting the text:

Run:
```bash
pnpm exec vitest run --reporter=dot lib/rule-of-72.test.ts && node -e '
const r72 = r => 72 / r;
const ex = r => Math.log(2) / Math.log(1 + r / 100);
for (const r of [5, 6, 7, 8, 10]) console.log(r + "%", r72(r).toFixed(2), ex(r).toFixed(2));
console.log("72/5 =", (72 / 5).toFixed(1));
'
```
Expected: `6% 12.00 11.90`, `7% 10.29 10.24`, `8% 9.00 9.01`, `10% 7.20 7.27`, `5% 14.40 14.21`, and `72/5 = 14.4` — matching the `12 năm`/`11,90 năm`, `10,3 năm`/`10,24 năm`, `72 ÷ 8 = 9 năm`, `7,2 năm`, `14,4 năm`, and `14,4%/năm` claims in the copy.

- [ ] **Step 4: Commit**

```bash
git add content/rule-of-72.ts
git commit -m "content: Vietnamese copy for the Rule of 72 calculator"
```

---

### Task 3: Calculator client island

**Files:**
- Create: `components/rule-of-72-calculator.tsx`

**Interfaces:**
- Consumes: `parseRate`, `rule72Years`, `exactYears`, `formatYears` from `@/lib/rule-of-72`; `RULE_OF_72` from `@/content/rule-of-72`; `cn` from `@/lib/cn`.
- Produces: `RuleOf72Calculator` — a named export taking no props, rendering a self-contained card. Task 5 mounts it.

- [ ] **Step 1: Create the component**

Create `components/rule-of-72-calculator.tsx`. Input styling is copied from the established pattern in `components/delete-account-form.tsx` so the field matches the rest of the site.

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  parseRate,
  rule72Years,
  exactYears,
  formatYears,
} from "@/lib/rule-of-72";
import { RULE_OF_72 as C } from "@/content/rule-of-72";

function ResultRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-ink-4/20 py-3 first:border-t-0">
      <span className="text-sm leading-snug text-ink-2 md:text-base">
        {label}
      </span>
      <span className="shrink-0 font-display text-xl font-medium tabular-nums text-ink md:text-2xl">
        {value === null ? "—" : `${value} ${C.form.unit}`}
      </span>
    </div>
  );
}

export function RuleOf72Calculator() {
  const [raw, setRaw] = useState(C.form.defaultRate);

  const rate = parseRate(raw);
  const estimate = rate === null ? null : rule72Years(rate);
  const exact = rate === null ? null : exactYears(rate);
  // A null estimate covers every rejected case: empty, unparseable, zero,
  // negative. `exact` is null under exactly the same conditions.
  const invalid = estimate === null;

  return (
    <div className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
      <label
        htmlFor="rule72-rate"
        className="block font-display text-base font-medium text-ink"
      >
        {C.form.rateLabel}
      </label>

      <div className="mt-3 flex items-center gap-3">
        <input
          id="rule72-rate"
          // Text, not number: `type="number"` rejects the comma decimal
          // separator Vietnamese keyboards produce. inputMode gives mobile the
          // numeric keypad anyway.
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          aria-describedby="rule72-rate-help"
          aria-invalid={invalid}
          className={cn(
            "w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
            "placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
            invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        <span aria-hidden className="text-base text-ink-2">
          {C.form.rateSuffix}
        </span>
      </div>

      <p
        id="rule72-rate-help"
        className={cn(
          "mt-2 text-sm leading-relaxed",
          invalid ? "text-red-600" : "text-ink-3",
        )}
      >
        {invalid ? C.form.rateInvalid : C.form.rateHelp}
      </p>

      <div className="mt-6 rounded-2xl bg-bg-soft p-5">
        <h2 className="font-display text-base font-medium text-ink">
          {C.form.resultTitle}
        </h2>
        {/* One live region wrapping both rows: screen readers announce the
            recomputed results, not every keystroke in the input. */}
        <div className="mt-2" aria-live="polite">
          <ResultRow
            label={C.form.estimateLabel}
            value={estimate === null ? null : formatYears(estimate)}
          />
          <ResultRow
            label={C.form.exactLabel}
            value={exact === null ? null : formatYears(exact)}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no errors, no warnings.

- [ ] **Step 3: Commit**

```bash
git add components/rule-of-72-calculator.tsx
git commit -m "feat: Rule of 72 calculator input and result island"
```

---

### Task 4: JSON-LD schema builders

**Files:**
- Modify: `lib/seo.ts` (append after `articleSchema`)
- Test: `lib/seo.test.ts`

**Interfaces:**
- Consumes: existing `absUrl`, `canonicalPath`, and `SITE` inside `lib/seo.ts`.
- Produces:
  - `faqSchema(items: readonly { q: string; a: string }[]): Record<string, unknown>`
  - `calculatorSchema(input: { name: string; description: string; path: string }): Record<string, unknown>`

- [ ] **Step 1: Write the failing tests**

Create `lib/seo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { faqSchema, calculatorSchema } from "@/lib/seo";

describe("faqSchema", () => {
  it("maps items to a FAQPage with Question/Answer pairs", () => {
    const schema = faqSchema([
      { q: "Câu hỏi 1?", a: "Trả lời 1." },
      { q: "Câu hỏi 2?", a: "Trả lời 2." },
    ]);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Câu hỏi 1?",
        acceptedAnswer: { "@type": "Answer", text: "Trả lời 1." },
      },
      {
        "@type": "Question",
        name: "Câu hỏi 2?",
        acceptedAnswer: { "@type": "Answer", text: "Trả lời 2." },
      },
    ]);
  });

  it("handles an empty list", () => {
    expect(faqSchema([]).mainEntity).toEqual([]);
  });
});

describe("calculatorSchema", () => {
  const schema = calculatorSchema({
    name: "Quy tắc 72",
    description: "Tính số năm để tiền nhân đôi.",
    path: "/cong-cu/quy-tac-72",
  });

  it("is a free Vietnamese finance WebApplication", () => {
    expect(schema["@type"]).toBe("WebApplication");
    expect(schema.applicationCategory).toBe("FinanceApplication");
    expect(schema.inLanguage).toBe("vi-VN");
    expect(schema.isAccessibleForFree).toBe(true);
  });

  it("builds an absolute, trailing-slash URL from the path", () => {
    expect(schema.url).toMatch(/\/cong-cu\/quy-tac-72\/$/);
    expect(String(schema.url).startsWith("http")).toBe(true);
  });

  it("carries the supplied name and description", () => {
    expect(schema.name).toBe("Quy tắc 72");
    expect(schema.description).toBe("Tính số năm để tiền nhân đôi.");
  });

  it("is serialisable (JsonLd stringifies it)", () => {
    expect(() => JSON.stringify(schema)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `lib/seo.test.ts` errors because `faqSchema` and `calculatorSchema` are not exported from `@/lib/seo`. The `lib/rule-of-72.test.ts` suite from Task 1 still passes.

- [ ] **Step 3: Add the builders**

Append to `lib/seo.ts`, after the existing `articleSchema` function:

```ts
/**
 * FAQPage structured data. Callers pass the same array they render as prose,
 * so the visible copy and the markup cannot drift apart.
 */
export function faqSchema(
  items: readonly { q: string; a: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** WebApplication structured data for a free on-site calculator tool. */
export function calculatorSchema(input: {
  name: string;
  description: string;
  /** Site-relative route, e.g. "/cong-cu/quy-tac-72". */
  path: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absUrl(canonicalPath(input.path)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    inLanguage: "vi-VN",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    publisher: { "@type": "Organization", name: SITE.name },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test`
Expected: PASS — both suites green.

- [ ] **Step 5: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts
git commit -m "feat: FAQPage and WebApplication JSON-LD builders"
```

---

### Task 5: The page

**Files:**
- Create: `app/cong-cu/quy-tac-72/page.tsx`

**Interfaces:**
- Consumes: `RuleOf72Calculator` (Task 3); `RULE_OF_72` (Task 2); `faqSchema`, `calculatorSchema` (Task 4); existing `SiteHeader`, `SiteFooter`, `Container`, `Reveal`, `Accordion`, `JsonLd`, `canonicalPath`.
- Produces: the static route. Nothing imports this file.

- [ ] **Step 1: Create the page**

Create `app/cong-cu/quy-tac-72/page.tsx`. Structure follows `app/delete-account/page.tsx` (server shell, local presentational helpers, content pulled from a `content/*` module).

```tsx
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { RuleOf72Calculator } from "@/components/rule-of-72-calculator";
import { RULE_OF_72 as C } from "@/content/rule-of-72";
import { canonicalPath, calculatorSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  // The root layout's "%s — FinHome" template appends the brand.
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

function Prose({ title, body }: { title: string; body: readonly string[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-ink-2">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function RuleOf72Page() {
  return (
    <>
      <JsonLd
        data={calculatorSchema({
          name: C.metaTitle,
          description: C.metaDescription,
          path: C.slug,
        })}
      />
      <JsonLd data={faqSchema(C.faq.items)} />
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

          <div className="mx-auto mt-10 max-w-3xl">
            <RuleOf72Calculator />
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            <Prose title={C.formula.title} body={C.formula.body} />
            <Prose title={C.example.title} body={C.example.body} />

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {C.caveats.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {C.caveats.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    <span className="text-base leading-relaxed text-ink-2">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {C.faq.title}
              </h2>
              <div className="mt-4">
                <Accordion items={[...C.faq.items]} />
              </div>
            </section>

            {/* Mandatory: this page outputs return figures on a finance domain. */}
            <p className="rounded-xl border border-ink-4/15 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
              {C.disclaimer}
            </p>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
```

Note: `Accordion` types `items` as a mutable `{ q: string; a: string }[]`, but `RULE_OF_72` is `as const`, so `C.faq.items` is `readonly`. `[...C.faq.items]` spreads it to a mutable copy — without this, `tsc` fails with "readonly … is not assignable to mutable".

- [ ] **Step 2: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no errors, no warnings.

- [ ] **Step 3: Verify the static export emits the route**

Run:
```bash
pnpm build && test -f out/cong-cu/quy-tac-72/index.html && echo "ROUTE OK"
```
Expected: build succeeds, prints `ROUTE OK`.

- [ ] **Step 4: Verify the prerendered HTML contains the computed default result**

Run:
```bash
grep -o '12,00 năm' out/cong-cu/quy-tac-72/index.html | head -1
grep -o '11,90 năm' out/cong-cu/quy-tac-72/index.html | head -1
grep -c 'FAQPage\|WebApplication' out/cong-cu/quy-tac-72/index.html
```
Expected: `12,00 năm` and `11,90 năm` each print once (proving the prefilled default is prerendered, not blank), and the JSON-LD grep count is at least `2`.

- [ ] **Step 5: Commit**

```bash
git add app/cong-cu/quy-tac-72/page.tsx
git commit -m "feat: /cong-cu/quy-tac-72 Rule of 72 calculator page"
```

---

### Task 6: Discovery wiring — sitemap and footer

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `content/site.ts` (`FOOTER.columns`)

**Interfaces:**
- Consumes: `RULE_OF_72.slug` is *not* imported here — `app/sitemap.ts` and `content/site.ts` use the literal `"/cong-cu/quy-tac-72"`, matching how every other route is written in those two files.
- Produces: nothing consumed by later tasks.

Deliberately **no header nav entry**: `NAV_ITEMS` in `content/site.ts` is anchor-based for the one-page homepage and drives the active-section highlighting in `components/site-header.tsx`, so a route link there would fight that logic.

- [ ] **Step 1: Register the route in the sitemap**

In `app/sitemap.ts`, add an entry to `staticEntries` after the `/vision` line:

```ts
    { url: absUrl(canonicalPath("/vision")), changeFrequency: "monthly", priority: 0.5 },
    {
      url: absUrl(canonicalPath("/cong-cu/quy-tac-72")),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: absUrl(canonicalPath("/privacy-policy")), changeFrequency: "yearly", priority: 0.3 },
```

- [ ] **Step 2: Add the footer link**

In `content/site.ts`, add a third column to `FOOTER.columns`, before the existing `FinHome` column:

```ts
    {
      title: "Công cụ",
      links: [{ label: "Quy tắc 72", href: "/cong-cu/quy-tac-72" }],
    },
```

`components/site-footer.tsx` renders `FOOTER.columns` generically and already routes `href` values starting with `/` through `next/link`, so no component change is needed.

- [ ] **Step 3: Verify the sitemap contains the route**

Run:
```bash
pnpm build && grep -o 'cong-cu/quy-tac-72/' out/sitemap.xml
```
Expected: prints `cong-cu/quy-tac-72/`.

- [ ] **Step 4: Verify the footer link renders and does not break narrow layouts**

Run: `pnpm dev`, then open `http://localhost:3000/cong-cu/quy-tac-72/`.

Check, at a 375px-wide viewport (iPhone SE) in devtools:
1. The footer shows a `Công cụ` column with a `Quy tắc 72` link, and clicking it loads the calculator page.
2. The three footer columns do not overflow horizontally — no sideways scrollbar on the page.

The footer wraps its columns in `flex gap-12 sm:gap-20 lg:gap-24`, which was laid out for two columns. **If a third column overflows at 375px**, do not restyle the footer: instead delete the new `Công cụ` column and add `{ label: "Quy tắc 72", href: "/cong-cu/quy-tac-72" }` as the first link inside the existing `Tính năng` column. Note which option you shipped in the commit message.

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts content/site.ts
git commit -m "feat: link the Rule of 72 calculator from footer and sitemap"
```

---

### Task 7: Full verification pass

No production code changes. This task exists as its own reviewer gate: it proves the delivered page behaves as the spec claims, in a browser, before the branch is offered for merge.

**Files:**
- None created or modified. If a check fails, fix it in the file that owns the defect and re-run every check in this task from the top.

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: nothing.

- [ ] **Step 1: Run the full automated suite**

Run:
```bash
pnpm test && pnpm lint && pnpm exec tsc --noEmit && pnpm build
```
Expected: tests pass, lint clean, no type errors, build succeeds.

- [ ] **Step 2: Confirm the exported route**

Run:
```bash
test -f out/cong-cu/quy-tac-72/index.html && echo "ROUTE OK"
grep -o 'cong-cu/quy-tac-72/' out/sitemap.xml
```
Expected: `ROUTE OK`, then `cong-cu/quy-tac-72/`.

- [ ] **Step 3: Verify calculator behaviour in the browser**

Run `pnpm dev` and open `http://localhost:3000/cong-cu/quy-tac-72/`. With devtools console open, confirm each row:

| Input | Ước tính theo quy tắc 72 | Kết quả chính xác |
|---|---|---|
| `6` (default on load) | `12,00 năm` | `11,90 năm` |
| `7.5` | `9,60 năm` | `9,58 năm` |
| `7,5` (comma) | `9,60 năm` | `9,58 năm` |
| `2` | `36,00 năm` | `35,00 năm` |
| `10` | `7,20 năm` | `7,27 năm` |
| `0` | `—` + validation message | `—` |
| `-5` | `—` + validation message | `—` |
| cleared (empty) | `—` + validation message | `—` |
| `abc` | `—` + validation message | `—` |

No cell may ever show `Infinity`, `NaN`, or `—` where a number is expected. The validation message is `Vui lòng nhập lãi suất lớn hơn 0 để tính thời gian nhân đôi.`

- [ ] **Step 4: Confirm no hydration mismatch**

With the page freshly loaded (hard reload, `Cmd+Shift+R`), the devtools console must contain **no** warning mentioning `hydration`, `did not match`, or `Text content does not match`. This is the check that guards the `formatYears` decision — a failure here means a formatting difference between the build and the browser.

- [ ] **Step 5: Confirm accessibility basics**

1. Click the `Lãi suất hằng năm` label text — focus must move into the input (proves `htmlFor`/`id` are wired).
2. Tab to the input and type — the help text below it is announced via `aria-describedby`; when the value is invalid the input carries `aria-invalid="true"`. Verify both attributes in the devtools element inspector.

- [ ] **Step 6: Confirm the structured data is valid**

Run:
```bash
node -e '
const fs = require("node:fs");
const html = fs.readFileSync("out/cong-cu/quy-tac-72/index.html", "utf8");
const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const types = blocks.map(b => b["@type"]);
console.log("types:", types.join(", "));
const faq = blocks.find(b => b["@type"] === "FAQPage");
console.log("faq questions:", faq.mainEntity.length);
'
```
Expected: `types:` includes `WebApplication` and `FAQPage`, and `faq questions: 4`. A `JSON.parse` throw here means malformed JSON-LD.

- [ ] **Step 7: Confirm no copied content from the source site**

Run:
```bash
grep -ril 'fncalculator\|Years Required for Principal to Double\|Rule of 72 Estimate' app components lib content
```
Expected: no output. (Comments referencing the reference tool by name are permitted in the design spec and plan under `docs/`, which this grep excludes, but no source file should carry the source site's strings.)

- [ ] **Step 8: Responsive check**

At 375px, 768px, and 1440px viewport widths, confirm: no horizontal page scroll, the calculator card's result rows keep label and value on one line each without overlapping, and the FAQ accordion opens and closes.

- [ ] **Step 9: Commit any fixes**

If Steps 1–8 required changes:

```bash
git add -A
git commit -m "fix: address Rule of 72 calculator verification findings"
```

If nothing needed fixing, skip this step — there is nothing to commit.

---

## Self-Review

**Spec coverage** — every section of `docs/superpowers/specs/2026-09-06-rule-of-72-calculator-design.md` maps to a task:

| Spec section | Task |
|---|---|
| Approach (server shell + client island) | 3, 5 |
| Files table | 1–6 (all eleven files) |
| The math (4 functions, validity rule, rounding, formatting) | 1 |
| Reference values table | 1 (unit tests), 7 (browser) |
| UI/UX (layout, live compute, default `6`, text input, a11y, styling) | 3, 5, 7 |
| Content (6 required pieces incl. disclaimer) | 2, 5 |
| SEO (metadata, `calculatorSchema`, `faqSchema`, footer link, no nav entry) | 4, 5, 6 |
| Verification (5 numbered checks) | 7 |
| Risks (hydration, regulatory, scope creep) | 7 Step 4; 2+5 disclaimer; scope fixed by the Files table |

**Placeholder scan** — no `TBD`/`TODO`, no "add error handling", no "similar to Task N". Every code step contains complete, runnable content; every test step names the exact command and expected result.

**Type consistency** — `parseRate`/`rule72Years`/`exactYears`/`formatYears` keep identical signatures across Tasks 1, 3 and 7. `faqSchema(readonly { q, a }[])` in Task 4 matches the `as const` `RULE_OF_72.faq.items` passed in Task 5. `calculatorSchema({ name, description, path })` matches its Task 5 call site. `Accordion`'s mutable `items` prop vs. the readonly content array is resolved explicitly in Task 5 Step 1.
