/**
 * Rendered-markup contracts for /cong-cu/phan-tich-thu-nhap-huu-tri/ — audit
 * row 51, "Tách nguồn thu cố định và phần phải rút từ quỹ; ghi đơn vị tiền
 * ngay trong tóm tắt", at "Hai cột".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the announced group holds the fixed
 * sources and NOT the portfolio draw, that the draw has its own unannounced
 * group, that the summary states money with its unit rather than percentages
 * alone, that there is one emphasised answer and one live region, and that
 * both wide tables sit in the full-width detail band.
 *
 * THE ARITHMETIC IS `lib/calc/retirement-income-sources.test.ts`'s. The
 * figures pinned below are the ones `content/calculators/
 * retirement-income-analysis.ts` already documents for the shipped defaults,
 * repeated here as the runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance. Whether the split columns are usable at a stated
 * width is Codex's review, not this file's claim.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { RETIREMENT_INCOME_ANALYSIS } from "@/content/calculators/retirement-income-analysis";

const CONTENT = "@/content/calculators/retirement-income-analysis";
const F = RETIREMENT_INCOME_ANALYSIS.form;

// `Record<…, string>`, not `Partial<typeof F.defaults>`: the content file is
// `as const`, so the derived type would only accept each key's SHIPPED value.
type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/retirement-income-analysis")
      >(CONTENT);
      return {
        RETIREMENT_INCOME_ANALYSIS: {
          ...actual.RETIREMENT_INCOME_ANALYSIS,
          form: {
            ...actual.RETIREMENT_INCOME_ANALYSIS.form,
            defaults: {
              ...actual.RETIREMENT_INCOME_ANALYSIS.form.defaults,
              ...defaults,
            },
          },
        },
      };
    });
  }
  try {
    const loaded = await import(
      "@/components/retirement-income-analysis-calculator"
    );
    return renderToStaticMarkup(
      createElement(loaded.RetirementIncomeAnalysisCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the layout wiring", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="phan-tich-thu-nhap-huu-tri-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="phan-tich-thu-nhap-huu-tri-ket-qua"');
    expect(html).toContain(
      'aria-controls="phan-tich-thu-nhap-huu-tri-ket-qua"',
    );
    expect(html).toContain("lg:grid-cols-5");
    // Thirteen inputs: the CTA carries the current answer on a wide screen.
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps all four field groups, in the same order", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [
      F.needGroup,
      F.fixedGroup,
      F.flexGroup,
      F.portfolioGroup,
    ].map((title) => form!.indexOf(title));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

describe("the fixed sources are the announced answer", () => {
  it("emphasises the first year's coverage, and only that row", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      F.firstCoverageLabel,
    );
    // Shipped defaults: 82,5% in the first year, 56,6% in the last.
    expect(live!).toContain("82,5%");
    expect(live!).toContain("56,6%");
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("states the fixed income as money, with its unit, in the summary", async () => {
    // ROW 51's second half. A coverage percentage carries no unit at all, and
    // every amount on this page is US dollars.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(F.fixedFirstLabel);
    expect(live!).toContain(F.fixedLastLabel);
    expect(live!).toContain("66.000 USD");
    // The same money, last year, in first-year prices: the page's lesson.
    expect(live!).toContain("45.241 USD");
  });

  it("keeps the portfolio draw OUT of the announced group", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    for (const moved of [
      F.firstDrawLabel,
      F.lastDrawLabel,
      F.initialRateLabel,
      F.depletionLabel,
      F.unmetLabel,
      F.finalRealLabel,
    ]) {
      expect(live!, `"${moved}" is still announced`).not.toContain(moved);
    }
  });
});

describe("the portfolio draw is its own group", () => {
  it("carries both years and the first-year rate, unannounced", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result).not.toBeNull();
    expect(result!).toContain(F.drawTitle);
    expect(result!).toContain(F.firstDrawLabel);
    expect(result!).toContain(F.lastDrawLabel);
    expect(result!).toContain(F.initialRateLabel);
    // 14.000 USD drawn in the first year, 2,33% of a 600.000 balance.
    expect(result!).toContain("14.000 USD");
    expect(result!).toContain("2,33%");
  });

  it("keeps what happens TO the portfolio in its own group below", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain(F.portfolioTitle);
    expect(result!.indexOf(F.drawTitle)).toBeLessThan(
      result!.indexOf(F.portfolioTitle),
    );
    expect(result!).toContain(F.finalRealLabel);
    // The default portfolio lasts, so there is no depletion age to state.
    expect(result!).toContain(F.coveredNotice);
  });
});

describe("the two wide tables are detail", () => {
  it("puts both below the columns, at full width", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(F.sourceTable.caption);
    expect(detail!).toContain(F.yearTable.caption);
    // And neither is announced.
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("<table");
  });

  it("renders no detail band at all while a field is unusable", async () => {
    const html = await render({ need: "-1" });
    expect(html).toContain(F.moneyInvalid);
    expect(html).toContain(F.invalidNotice);
    // An empty full-width band announces that something is missing.
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
  });
});

describe("the preserved guards", () => {
  it("still bounds an age, and blames only that field", async () => {
    const html = await render({ startAge: "130" });
    expect(html).toContain(F.ageInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("still accepts a zero pension indexation as a real answer", async () => {
    // 0 is the common case, not a blank: the page says so in `pensionHelp`.
    const html = await render();
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("82,5%");
  });
});
