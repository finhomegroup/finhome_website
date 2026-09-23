/**
 * Rendered-markup contracts for /cong-cu/loi-nhuan-co-phieu/ (CSV row 35).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * WHAT THIS FILE EXISTS FOR. `content/calculators/stock-return.test.ts` proves
 * the copy and the citations, `lib/calc/stock-return.test.ts` the arithmetic.
 * Neither can see that the twelve-row fee and tax itemisation sat between the
 * form and the answer, which is the whole of row 35's "đưa phần giải thích
 * thuế dài ra khỏi đường nhập→kết quả".
 *
 * ONE ASSERTION HERE IS ABOUT A SENTENCE, not a position, and it belongs with
 * the layout rather than with the copy: `taxedOnLossNotice` tells the reader to
 * compare two rows, and moving one of them into a region BELOW the notice would
 * have made its "ở trên" false. The test pins the repaired pointer against the
 * region the row actually ended up in.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { STOCK_RETURN } from "@/content/calculators/stock-return";

type Loose = Record<string, unknown>;

/** Render the calculator, optionally overriding some of its FORM defaults. */
async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/stock-return";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        STOCK_RETURN: Loose;
      };
      const original = actual.STOCK_RETURN;
      return {
        STOCK_RETURN: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/stock-return-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(createElement(loaded.StockReturnCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const F = STOCK_RETURN.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** The taxed-on-a-loss fixture the page's own notice is built on. */
const LOSS = { defaultSell: "24.000", defaultDividend: "0" };

describe("the đồng of profit or loss is the headline", () => {
  it("emphasises the net figure and nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(F.netProfitLabel);
    // The module's own figures for the shipped trade.
    expect(live).toContain("72.900.000 ₫");
    expect(live).toContain("24,264%");
  });

  it("keeps the percentage, the annual figure and break-even with it", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.indexOf(F.netProfitLabel)).toBeLessThan(
      live.indexOf(F.returnLabel),
    );
    expect(live.indexOf(F.returnLabel)).toBeLessThan(
      live.indexOf(F.annualisedLabel),
    );
    expect(live.indexOf(F.annualisedLabel)).toBeLessThan(
      live.indexOf(F.breakEvenLabel),
    );
    expect(live).toContain("11,474%");
    expect(live).toContain("28.692 ₫");
  });

  it("shows a loss as a loss, tax and all", async () => {
    const html = await render(LOSS);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("-61.050.000 ₫");
    expect(live).toContain("-20,320%");
    // Break-even above the purchase price, which is the page's second point.
    expect(live).toContain("30.120 ₫");
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("drops the annual figure when the holding period is left blank", async () => {
    // An empty optional field is not an error — docs' variable-row rule.
    const html = await render({ defaultYears: "" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(F.annualisedLabel);
    expect(live).toContain("—");
  });
});

describe("the tax itemisation is off the input→result path", () => {
  it("puts all twelve component rows in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    for (const label of [
      F.grossReturnLabel,
      F.dragLabel,
      F.totalCostLabel,
      F.grossProceedsLabel,
      F.sellFeeLabel,
      F.transferTaxResultLabel,
      F.netProceedsLabel,
      F.grossDividendsLabel,
      F.dividendTaxResultLabel,
      F.netDividendsLabel,
      F.totalFeesLabel,
      F.totalTaxesLabel,
    ]) {
      expect(detail, `${label} left the detail region`).toContain(label);
    }
    expect(detail).toContain("300.450.000 ₫");
    expect(detail).toContain("0,736 điểm %");
    // And none of them is in the live region, which holds four rows.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.totalTaxesLabel);
    expect(live).not.toContain(F.grossReturnLabel);
  });

  it("keeps the detail region non-live, with one live region on the page", async () => {
    const html = await render();
    expect(markupRegion(html, 'data-calc-region="detail"')).not.toContain(
      'data-results-live="true"',
    );
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("points the taxed-on-a-loss notice at the section, not upwards", async () => {
    // The row it names moved BELOW this notice. "ở trên" would now be false.
    const html = await render(LOSS);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.taxedOnLossNotice);
    expect(F.taxedOnLossNotice).toContain(F.detailTitle);
    expect(F.taxedOnLossNotice).not.toContain("ở trên");
    // The row the notice sends the reader to is where it says it is.
    expect(markupRegion(html, 'data-calc-region="detail"')).toContain(
      F.grossReturnLabel,
    );
  });
});

describe("the long tax explanation is not in the tool at all", () => {
  it("leaves the worked examples to the page notice's disclosure", async () => {
    // The route renders them through `CalculatorPage`'s `noticeDetail`, so
    // this component must not carry a second copy of them.
    const html = await render();
    expect(html).not.toContain(STOCK_RETURN.taxOnLossDetail);
    expect(html).not.toContain(STOCK_RETURN.taxOnLossNotice);
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid, all three regions and the CTA target", async () => {
    const html = await render();
    expect(html).toContain(
      'id="loi-nhuan-co-phieu-nhap" data-calc-region="form"',
    );
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('id="loi-nhuan-co-phieu-ket-qua"');
    expect(html).toContain('aria-controls="loi-nhuan-co-phieu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("keeps the trade and the cost schedule as two real fieldsets", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(F.tradeGroup);
    expect(form).toContain(F.costGroup);
    expect(form.split("<fieldset").length - 1).toBe(2);
    expect(form.indexOf(F.tradeGroup)).toBeLessThan(form.indexOf(F.costGroup));
  });

  it("marks the CTA help as pointing at a bad field only when one exists", async () => {
    const clean = await render();
    const broken = await render({ defaultBuy: "0" });
    // `ResultCta`'s `invalid` drives only the help sentence; the jump
    // destination is read from the DOM. So this asserts the two states
    // differ, not which words either one uses.
    expect(broken).toContain('aria-invalid="true"');
    expect(clean).not.toContain('aria-invalid="true"');
  });

  it("does not add a housing funnel to a tool with no next steps", async () => {
    // `next-steps.ts` has no entry for this slug, so the route passes no
    // `actions`/`nextSteps` — and this component takes no props for them.
    const html = await render();
    expect(html).not.toContain("data-calc-actions");
  });
});
