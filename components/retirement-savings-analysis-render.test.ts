/**
 * Rendered-markup contracts for `/cong-cu/phan-tich-tiet-kiem-huu-tri/`
 * (plan row 48 — the capital gap, and what closes it).
 *
 * WHY A RENDER TEST AND NOT A MODULE TEST. docs §6 records that three of this
 * suite's five worst defects were invisible to a green test run because they
 * lived in a COMPONENT or in a DEFAULT INPUT rather than in a module, and this
 * route carried two of that class at once:
 *
 * 1. **Finance inside JSX.** The component ran its own retirement-age search
 *    loop and called `projectRetirement` / `solveRequiredContribution` inside
 *    the table's `.map()`. `lib/calc/long-term-plan.ts`'s docstring names this
 *    file as the reason it exists.
 * 2. **A naive funded verdict.** `result.depletionAge === null`, repeated three
 *    times, which is exactly the float-residue artefact `fundedAtBoundary()`
 *    exists to fix — so the page could tell a reader their mathematically
 *    funded plan was short.
 *
 * Neither is visible to a module test. Only rendering the component at a
 * chosen default can see them, which is what this file does:
 * `renderToStaticMarkup` in the runner's plain `node` environment with
 * `vi.doMock` on the shared content module to patch one default — the idiom
 * `components/calc/chart/chart-render.test.ts` established and
 * `components/retirement-plan-render.test.ts` (row 44) followed. It is the
 * right fidelity here too: every calculator is prerendered at its defaults and
 * must hydrate byte-identically.
 *
 * What this file CANNOT check is appearance. Layout, contrast, touch targets
 * and overflow stay unverified by eye; nothing here may be reported as a
 * visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MAX_EXTRA_WORKING_YEARS } from "@/lib/calc/long-term-plan";
import { fill } from "@/lib/calc/charts/labels";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const CONTENT_PATH = "@/content/calculators/long-term-plan";

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

/** Render the calculator, optionally on a patched default scenario. */
async function render(
  defaults?: Partial<Record<string, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        LONG_TERM_PLAN: typeof LONG_TERM_PLAN;
      };
      return {
        LONG_TERM_PLAN: {
          ...actual.LONG_TERM_PLAN,
          defaults: { ...actual.LONG_TERM_PLAN.defaults, ...defaults },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/retirement-savings-analysis-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.RetirementSavingsAnalysisCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

describe("phan-tich-tiet-kiem-huu-tri, rendered at its shipped defaults", () => {
  it("reads the SHARED đồng scenario, not a scenario of its own", async () => {
    // The merge's whole point: four routes, one set of assumptions. A route
    // holding its own copy of the eleven defaults is how the four came to
    // disagree in the first place — and this one shipped its own USD scenario
    // long after `usRules` was removed from its registry entry, so the page
    // showed dollar amounts with no notice explaining them.
    const html = await render();
    expect(html).toContain(LONG_TERM_PLAN.defaults.currentBalance);
    expect(html).toContain(LONG_TERM_PLAN.defaults.desiredAnnualSpending);
    expect(html).not.toContain("USD");
    expect(html).toContain("₫");
  });

  it("keeps exactly one live results region, with the table outside it", async () => {
    // docs §4: exactly one live region per page, and never a table inside
    // one. `check:markup` counts the same attribute on the built HTML, and
    // `check-built-markup.mjs` allows this slug exactly one.
    const html = await render();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = html.slice(html.indexOf('data-results-live="true"'));
    const liveEnd = live.indexOf("</dl>");
    expect(liveEnd).toBeGreaterThan(-1);
    expect(live.slice(0, liveEnd)).not.toContain("<table");
  });

  it("opens on a plan that is SHORT, and prices all three remedies", async () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing —
    // the judgement `content/calculators/long-term-plan.ts` records for the
    // shared scenario, and the reason this route is the one where the default
    // actually pays off: all three remedies are available in it.
    const html = await render();
    expect(html).toContain(C.form.gapNotice);
    expect(html).not.toContain(C.form.fundedNotice);
    expect(html).toContain(C.form.remedies.contributeLabel);
    expect(html).toContain(C.form.remedies.retireLabel);
    expect(html).toContain(C.form.remedies.spendLabel);
    // And none of the three renders an unavailability sentence, or a "không
    // cần" that would say this plan has nothing to close.
    //
    // `changeUnavailable` is deliberately NOT in this list: it is an em dash,
    // and an em dash occurs in the shared field help, so asserting its absence
    // would pass for the wrong reason. A check that cannot fail is a finding
    // (docs §8), and so is one that cannot pass.
    for (const missing of [
      C.form.remedies.contributeUnavailable,
      C.form.remedies.contributeNoTime,
      C.form.remedies.spendUnavailable,
      C.form.remedies.noChange,
      C.form.onlySpendLessNotice,
    ]) {
      expect(html, `default scenario renders "${missing}"`).not.toContain(
        missing,
      );
    }
  });

  it("renders the remedy table as one block per row on a phone", async () => {
    // Row 44 retired its seven-column table because at 390 px it measured
    // 762 px inside a 300 px scroll frame; this route's six-column age sweep
    // was the same shape. `mobileCards` puts one block per remedy below `md`,
    // and exactly ONE of the two presentations is in the accessibility tree at
    // any width, so nothing is announced twice.
    const html = await render();
    expect(html).toContain(C.form.remedies.caption);
    expect(count(html, "<table")).toBe(1);
    expect(html).toMatch(/<ul class="md:hidden"/);
    expect(html).toMatch(/class="[^"]*hidden md:block[^"]*"[^>]*role="region"/);
  });
});

/**
 * The component's source with its comments stripped.
 *
 * Stripped because the file DOCUMENTS the defect it used to carry, and naming
 * `projectRetirement` in a comment that explains why it is gone is the
 * opposite of the finding this check is looking for. The first version of this
 * test failed on its own prose.
 */
const SOURCE = readFileSync(
  "components/retirement-savings-analysis-calculator.tsx",
  "utf8",
)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

/**
 * A gap that neither remedy PRESERVING the spend closes.
 *
 * The shared scenario with a desired spend two orders of magnitude past it:
 * `solveRequiredContribution` brackets nothing (`state: "unreachable"`) and no
 * retirement age inside `MAX_EXTRA_WORKING_YEARS` funds it either, so the only
 * lever left is the spend. Measured, not assumed — a 2 tỷ spend still solves a
 * contribution, which is what made the first version of this fixture wrong.
 */
const UNREACHABLE = { desiredAnnualSpending: "20.000.000.000" } as const;

/**
 * Retirement today, and short.
 *
 * `state: "noTimeToContribute"` — the other cause of an unavailable
 * contribution remedy, and a different sentence from "the solver found
 * nothing". Both arrive as `available: false`.
 */
const RETIRE_TODAY = {
  currentAge: "60",
  retirementAge: "60",
  currentBalance: "1.000.000.000",
  annualContribution: "0",
  desiredAnnualSpending: "500.000.000",
  otherAnnualIncome: "0",
} as const;

describe("no finance runs inside this component", () => {
  it("calls the engine through resolveLongTermPlan and nowhere else", async () => {
    // `lib/calc/long-term-plan.ts`'s docstring names THIS FILE as the reason
    // it exists: "the age search and the remedy set were living in a component
    // (`retirement-savings-analysis-calculator.tsx` searched for a funded
    // retirement age in JSX); finance in a component is invisible to a module
    // test, which docs §6 records as where three of this suite's five worst
    // defects lived."
    //
    // Checked on the SOURCE text, the way `components/calc/live-region.test.ts`
    // checks the live-region convention, because the defect is a shape rather
    // than an output: a component that reproduces the search correctly today
    // is still a second copy of the search, free to drift from the three
    // sibling routes tomorrow.
    expect(SOURCE).toContain("resolveLongTermPlan");
    for (const engine of [
      "projectRetirement",
      "solveRequiredContribution",
      "requiredRealBalanceAtRetirement",
      "sustainableSpending",
    ]) {
      expect(
        SOURCE.includes(engine),
        `still reaches past the merged model for ${engine}`,
      ).toBe(false);
    }
    // And no loop of its own. The remedy set is three named answers off one
    // `GapAnswer`; a `for` here would be the age search growing back.
    expect(SOURCE).not.toMatch(/\bfor\s*\(/);
    expect(SOURCE).toContain("remedyFor");
  });

  it("names the search bound the model actually enforces", async () => {
    // "No retirement age works" and "no retirement age within seven years
    // works" are different claims, and `MAX_EXTRA_WORKING_YEARS` is which one
    // is true. A bound the engine enforces has to exist in the copy — docs §7
    // — and substituted from the constant rather than typed as a literal that
    // can drift.
    //
    // Asserted on the RENDERED sentence rather than on the content string,
    // which carries a `{years}` placeholder, and on the whole filled phrase
    // rather than on "7": that digit occurs by accident in any page with a
    // percentage on it, and a check that cannot fail is a finding (docs §8).
    const html = await render(UNREACHABLE);
    expect(html).toContain(
      fill(C.form.remedies.retireUnavailable, {
        years: String(MAX_EXTRA_WORKING_YEARS),
      }),
    );
    // And the page says the spend is the only lever left, which is a third
    // state — not funded, and not an invalid form.
    expect(html).toContain(C.form.onlySpendLessNotice);
    expect(html).not.toContain(C.form.invalidNotice);
  });

  it("gives an unavailable contribution its own reason, per cause", async () => {
    // `available: false` has two causes and they are two different claims.
    // Rendering one sentence for both is docs §7's "a null has as many
    // meanings as it has causes, and a page must say which" — and the wrong
    // one here would tell a reader who has already retired that the tool
    // searched for a contribution and failed, when there is no year to
    // contribute in at all.
    const unreachable = await render(UNREACHABLE);
    expect(unreachable).toContain(C.form.remedies.contributeUnavailable);
    expect(unreachable).not.toContain(C.form.remedies.contributeNoTime);

    const today = await render(RETIRE_TODAY);
    expect(today).toContain(C.form.remedies.contributeNoTime);
    expect(today).not.toContain(C.form.remedies.contributeUnavailable);
  });
});

/**
 * A plan that is funded, which the projection reports as depleting.
 *
 * The same fixture row 44's render test uses, and constructed rather than
 * found so it is reproducible: at a zero REAL return
 * (`returnAfterPercent === inflationPercent`) the annuity-due factor is
 * exactly the retirement span, so a round balance over a round span is a round
 * sustainable spend a form field can actually hold. 4 tỷ over 25 years is
 * 160.000.000 ₫ a year from the portfolio plus the 36.000.000 ₫ of other
 * income, so a desired spend of exactly 196.000.000 ₫ is the boundary.
 *
 * `projectRetirement` then reports `depletionAge` 84 against a horizon of 85,
 * with an unpaid fraction of one đồng — the artefact `fundedAtBoundary`'s
 * docstring describes. Retiring today keeps the accumulation phase out of it,
 * so the only thing under test is the drawdown verdict.
 */
const FUNDED_BOUNDARY = {
  currentAge: "60",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "4.000.000.000",
  annualContribution: "0",
  contributionGrowthPercent: "0",
  returnBeforePercent: "4",
  returnAfterPercent: "4",
  inflationPercent: "4",
  desiredAnnualSpending: "196.000.000",
  otherAnnualIncome: "36.000.000",
} as const;

describe("the funded boundary, on the rendered page", () => {
  it("calls a float-residue depletion FUNDED, as fundedAtBoundary decides", async () => {
    // THE DEFECT THIS FILE EXISTS FOR, and the one this route carried three
    // times over: `const funded = result !== null && result.depletionAge ===
    // null`, repeated at the verdict row, the notice and the table. Read
    // straight off `depletionAge`, this fixture renders "Thiếu" with a
    // depletion age of 84 beside it and a gap notice underneath — telling a
    // reader their mathematically funded plan is short by a fraction of one
    // đồng in the final year of the horizon.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain(C.form.fundedNotice);
    expect(html).not.toContain(C.form.gapNotice);
  });

  it("states the residue it forgave instead of hiding it", async () => {
    // `fundedAtBoundary` returns the residue precisely so a consumer can say
    // it. A verdict that silently forgives a shortfall is one the reader
    // cannot check — and the same policy must never forgive a real shortfall,
    // which the default scenario proves it does not.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain("0,000004");
  });

  it("shows no depletion age beside a funded verdict", async () => {
    // Two adjacent rows saying "Đủ" and "Tiền cạn ở tuổi 84" contradict each
    // other. The optional row is MOUNTED conditionally rather than nulled,
    // because `ResultRow` renders a dash beside its label, which reads as a
    // figure the tool failed to find.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).not.toContain(C.form.depletionLabel);
  });
});
