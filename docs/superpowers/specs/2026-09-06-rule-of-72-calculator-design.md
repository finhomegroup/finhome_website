# Rule of 72 Calculator (Quy tắc 72) — Design Spec

**Date:** 2026-09-06
**Status:** Draft for review
**Goal:** Ship a FinHome-branded, Vietnamese-language Rule of 72 calculator at `/cong-cu/quy-tac-72/`, functionally equivalent to `fncalculator.com/financialcalculator?type=rule72Calculator` but rewritten for the Vietnamese market and wrapped in SEO content that can rank.

---

## Problem

`fncalculator.com` hosts ~75 financial calculators. Its Rule of 72 page is a single-input tool: enter **Annual Interest Rate (%)**, get **Years Required for Principal to Double** via two methods — a *Rule of 72 Estimate* (`72 / r`) and an *Exact Answer* (`ln 2 / ln(1 + r)`). All math is client-side; the layout is a 2012-era table with a left sidebar listing every other calculator, and the pages carry a `2012-2017` copyright notice.

FinHome wants that capability on its own domain. The site currently has no calculator of any kind — the routes are `/`, `/blog`, `/blog/[slug]`, `/vision`, `/terms`, `/privacy-policy`, `/delete-account` — so this introduces a new page type.

## Scope (locked)

**In scope:** one calculator, the Rule of 72, at one route.

**Out of scope for this pass:** the other ~74 fncalculator tools; a `/cong-cu/` index/hub page; any config-driven "calculator framework". The route is namespaced under `/cong-cu/` purely so that adding a second calculator later is a drop-in rather than a URL migration.

**Explicitly rejected:** a pixel-faithful clone of fncalculator's layout and English copy. We reimplement the *arithmetic* (public-domain finance, not authorable) with original Vietnamese copy and FinHome's existing design system. No layout, prose, or markup is copied from the source site.

## Approach (chosen)

**Server page shell + one client island.** This mirrors the existing `/delete-account` pattern in this repo: a server `page.tsx` owns metadata, JSON-LD, and prose; copy lives in a `content/*.ts` module; only the interactive form is `"use client"`.

Two alternatives were considered and rejected:

- *Whole page as one client component* — fewer files, but ships ~2KB of static SEO prose through hydration for no benefit and breaks the repo's content/presentation split.
- *Config-driven calculator framework now* — premature. Abstracting a form shape from a single example reliably produces the wrong abstraction. When a second calculator exists, the shared parts will be evident from two real cases.

The site is a static export (`output: "export"`, `trailingSlash: true`), so the page must be fully prerenderable — no request-time data, no dynamic params.

## Files

| File | Status | Role |
|---|---|---|
| `lib/rule-of-72.ts` | new | Pure math + number formatting. No React, no I/O. |
| `content/rule-of-72.ts` | new | All Vietnamese copy: headings, explainer, worked example, FAQ, disclaimer. |
| `components/rule-of-72-calculator.tsx` | new | `"use client"` — rate input + two result rows. |
| `app/cong-cu/quy-tac-72/page.tsx` | new | Server shell: metadata, JSON-LD, header/footer, prose, mounts the calculator. |
| `lib/seo.ts` | edit | Add `faqSchema(items)` and `calculatorSchema()` builders (neither exists today). |
| `app/sitemap.ts` | edit | Add the route at priority `0.6`, `changeFrequency: "monthly"`. |
| `content/site.ts` | edit | Add a `Công cụ` column to `FOOTER.columns` containing the calculator link. |
| `lib/rule-of-72.test.ts` | new | Vitest unit tests for the pure module. |
| `package.json`, `vitest.config.ts` | edit / new | Minimal vitest setup (see Verification). |

## The math

`lib/rule-of-72.ts` exports three functions and one formatter:

```ts
/** Parse user input: accepts "7.5" and "7,5" (Vietnamese decimal comma). */
export function parseRate(raw: string): number | null;

/** Rule-of-72 estimate: 72 / rate. Null when rate is not a doubling rate. */
export function rule72Years(rate: number): number | null;

/** Exact solution of (1 + r)^t = 2  →  ln 2 / ln(1 + r). */
export function exactYears(rate: number): number | null;

/** 11.8957 -> "11,90" — hand-rolled, not Intl (see note below). */
export function formatYears(value: number): string;
```

**Validity rule.** Both year functions return `null` when `rate <= 0` or the input is not finite. This is not defensive padding: at 0% the principal never doubles and `72 / 0` is `Infinity`; at a negative rate it shrinks. `parseRate` returns `null` for empty or unparseable input. The component renders a validation message in place of numbers whenever it holds a `null`.

**Rounding.** Results display to 2 decimal places.

**Formatting.** `formatYears` uses `toFixed(2).replace(".", ",")` rather than `Intl.NumberFormat("vi-VN", …)`. The input is prefilled, so the server prerenders a computed result and the client must hydrate to the identical string; a hand-rolled formatter removes any risk of a Node-ICU vs. browser-ICU mismatch producing a hydration error.

**Reference values** (these become the unit-test table):

| Rate | `rule72Years` | `exactYears` |
|---|---|---|
| 2% | 36.00 | 35.00 |
| 6% | 12.00 | 11.90 |
| 7% | 10.29 | 10.24 |
| 7.5% | 9.60 | 9.58 |
| 10% | 7.20 | 7.27 |
| 72% | 1.00 | 1.28 |
| 0%, −5%, `""`, `"abc"` | `null` | `null` |

The estimate is closest to exact in the 6–10% band and drifts in both directions outside it. The page states this in prose rather than hiding it.

## UI / UX

Route: `/cong-cu/quy-tac-72/`. Page structure, top to bottom:

```
┌─ SiteHeader ────────────────────────────────┐
│  H1: Quy tắc 72 — Bao lâu để tiền nhân đôi? │
│  Lede: 1–2 câu                               │
│  ┌── card ───────────────────────────────┐  │
│  │ Lãi suất hằng năm (%)   [   6    ] %  │  │
│  │ ─────────────────────────────────────  │  │
│  │ Số năm để gốc nhân đôi                 │  │
│  │   Ước tính theo quy tắc 72   12,00 năm │  │
│  │   Kết quả chính xác          11,90 năm │  │
│  └────────────────────────────────────────┘  │
│  H2: Công thức và cách hoạt động             │
│  H2: Ví dụ với 500 triệu đồng                │
│  H2: Khi nào quy tắc 72 không còn chính xác  │
│  H2: Câu hỏi thường gặp  (accordion)         │
│  Miễn trừ trách nhiệm                        │
└─ SiteFooter ────────────────────────────────┘
```

**Interaction.** Computes live on every input change — no Calculate button (the source site has one; it adds a click for zero benefit on a single-field form).

**Default value.** The input is prefilled with `6`, chosen because ~6%/năm is a realistic Vietnamese deposit rate and it sits inside the band where the rule is accurate. A prefilled default also means the statically exported HTML contains a worked result rather than empty fields.

**Input type.** A text input, not `type="number"` — `parseRate` must accept the comma decimal separator that Vietnamese keyboards produce, and `type="number"` rejects it. `inputMode="decimal"` gives mobile the numeric keypad.

**Accessibility.** A real `<label for>` on the input; `aria-describedby` pointing at the helper/validation text; the two result rows wrapped in a single `aria-live="polite"` region so screen readers announce recomputation without announcing every keystroke of the input.

**Styling.** Reuses existing primitives — `Container`, `SectionFrame`, `components/ui/accordion` for the FAQ, and the input styling already established in `components/delete-account-form.tsx` (`rounded-xl border border-ink-4/40 … focus:border-brand-green focus:ring-2 focus:ring-brand-green/30`). No new design tokens.

## Content

All copy lives in `content/rule-of-72.ts` as a single exported object, matching the `content/delete-account.ts` convention. Copy is original Vietnamese, written in FinHome voice.

Required pieces:

1. **H1 + lede** — what the tool answers.
2. **Formula section** — `Số năm ≈ 72 / lãi suất (%)`, and the exact form `ln 2 / ln(1 + lãi suất)`. Explains that the rule applies to **lãi kép** (compound interest), not **lãi đơn**.
3. **Worked example** — 500 triệu đồng at 7%/năm doubles to 1 tỷ đồng in ≈ 10,3 năm by the rule (10,24 năm exact).
4. **Accuracy caveats** — most accurate at 6–10%; for continuous compounding the correct numerator is closer to 69; the rule is an estimate, not a projection.
5. **FAQ** — four Q&A pairs, which also feed `FAQPage` JSON-LD:
   - Quy tắc 72 là gì?
   - Quy tắc 72 có chính xác không?
   - Quy tắc 72 áp dụng cho lãi kép hay lãi đơn?
   - Cần lãi suất bao nhiêu để nhân đôi tiền trong 5 năm? (`72 / 5 = 14,4%/năm`)
6. **Disclaimer** — the tool is illustrative, uses a fixed assumed rate, ignores tax, fees and inflation, and is not investment advice. Non-negotiable: this is a finance-app domain outputting return figures.

## SEO

**Metadata** (exported from `page.tsx`): Vietnamese `title` and `description`, `alternates.canonical: canonicalPath("/cong-cu/quy-tac-72")`, and an `openGraph` block following the `/vision` page's shape. The root layout's `"%s — FinHome"` title template applies automatically.

**JSON-LD**, rendered through the existing `<JsonLd>` component, using two new builders in `lib/seo.ts`:

- `calculatorSchema()` → `WebApplication`, `applicationCategory: "FinanceApplication"`, `inLanguage: "vi-VN"`, `isAccessibleForFree: true`.
- `faqSchema(items)` → `FAQPage` built from the content module's FAQ array, so the prose and the structured data cannot drift apart.

**Internal linking.** A footer link under a new `Công cụ` column. Deliberately **no header nav entry**: `NAV_ITEMS` is anchor-based for the one-page homepage and drives `use-active-section` highlighting, so a route link there would fight the active-section logic. Blog posts about savings or mortgage rates can link in later; that is not part of this pass.

## Verification

The repo has **no test framework** today. This pass adds a minimal one, scoped to the pure math module only:

- Add `vitest` as a dev dependency, a `vitest.config.ts`, and a `"test": "vitest run"` script.
- `lib/rule-of-72.test.ts` covers the reference-value table above, including every `null` case.
- No component or E2E tests. The math is where a silent wrong answer is possible; the form is not.

Manual/build verification, all required before this is called done:

1. `pnpm test` — all unit tests pass.
2. `pnpm lint` — clean.
3. `pnpm build` — succeeds, and `out/cong-cu/quy-tac-72/index.html` exists and contains the prerendered `12,00` / `11,90` results.
4. Browser check: typing `7,5` and `7.5` both yield `9,60` / `9,58`; clearing the field and entering `0` or `-5` shows the validation message, not `Infinity` or `NaN`.
5. No hydration warning in the console on load.

## Risks

- **Hydration mismatch** on the prefilled default. Mitigated by the hand-rolled formatter; caught by check 5.
- **Regulatory read.** A tool that outputs investment-return figures on a finance domain could be read as advisory. Mitigated by the mandatory disclaimer block and by framing outputs as an arithmetic estimate over a user-supplied rate, never a FinHome forecast or offer.
- **Scope creep toward the other 74 calculators.** Contained by keeping this route self-contained and building no shared abstraction until a second calculator justifies one.
