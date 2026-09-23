/**
 * Rendered-markup contracts for /cong-cu/phi-quy-dau-tu/ (CSV row 29).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * WHAT THIS FILE EXISTS FOR. `lib/calc/fund-fees.test.ts` already proves the
 * arithmetic and `content/calculators/fund-fees.test.ts` the copy; neither can
 * see WHERE a figure is on the page, which is the whole of row 29 ("nhấn số
 * tiền phí lấy đi ở kỳ hạn đã chọn; hai dòng giá trị nằm cạnh ô nhập phí").
 * The fee boxes are the bottom group of a seven-field form, so a regression
 * here is silent: every number stays right and the two that answer the fee
 * schedule drift back below eight secondary rows.
 *
 * DOM structure and order are all this can assert. Whether the split grid ever
 * becomes two columns, and whether anything is legible at any width, remain
 * unverified here.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { FUND_FEES } from "@/content/calculators/fund-fees";

type Loose = Record<string, unknown>;

/** Render the calculator, optionally overriding some of its FORM defaults. */
async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/fund-fees";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        FUND_FEES: Loose;
      };
      const original = actual.FUND_FEES;
      return {
        FUND_FEES: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/fund-fees-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.FundFeesCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const F = FUND_FEES.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the fee bite is the headline", () => {
  it("emphasises the đồng lost and nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(F.valueLostLabel);
    // The module's own figure for the shipped plan.
    expect(live).toContain("1.066.857.503 ₫");
  });

  it("keeps the two value lines ahead of the percentage", async () => {
    // Row 29's "hai dòng giá trị", and original row 27's "đặt chênh lệch sau
    // phí trước thuật ngữ": money first, the share of forgone profit third.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.indexOf(F.valueLostLabel)).toBeLessThan(
      live.indexOf(F.netValueLabel),
    );
    expect(live.indexOf(F.netValueLabel)).toBeLessThan(
      live.indexOf(F.profitLostLabel),
    );
    expect(live).toContain("3.197.188.632 ₫");
    expect(live).toContain("35,99%");
  });

  it("ties the headline to the horizon in its own label", async () => {
    // "Số tiền bị mất" emphasised with no period attached reads as a property
    // of the fee schedule. It is a property of the schedule AND the horizon,
    // so the figure has to move when the horizon does.
    expect(F.valueLostLabel).toContain("mốc bạn cần tiền");
    const short = await render({ defaultMonths: "36" });
    expect(short).not.toContain("1.066.857.503 ₫");
    expect(markupRegion(short, 'data-results-live="true"')).toContain(
      F.valueLostLabel,
    );
  });
});

describe("the notices that explain a dash sit beside it", () => {
  it("explains a blank percentage when there is no profit to lose", async () => {
    // Reachable from a plausible entry — a flat year — unlike the detail
    // group's money-weighted blanks, which need absurd inputs.
    const html = await render({ defaultGrossReturn: "0" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.noProfitNotice);
    expect(result).toContain("—");
    // The fee figures are still real, which is the notice's own point.
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("explains an entirely blank answer when nothing was paid in", async () => {
    const html = await render({
      defaultInitial: "0",
      defaultContribution: "0",
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.nothingInvestedNotice);
    // Every field parses, so nothing is marked invalid — the notice is the
    // only thing standing between the reader and three dashes.
    expect(html).not.toContain('aria-invalid="true"');
  });
});

describe("the secondary rows are in the detail region", () => {
  it("moves both follow-up groups out of the answer's path", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.compareTitle);
    expect(detail).toContain(F.detailTitle);
    expect(detail).toContain("4.264.046.135 ₫");
    expect(detail).toContain("515.853.900 ₫");
    expect(detail).toContain("2,281 điểm %");
    // And out of the live region, which holds three rows.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.compareTitle);
    expect(live).not.toContain(F.grossValueLabel);
  });

  it("keeps exactly one live results region", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(markupRegion(html, 'data-calc-region="detail"')).not.toContain(
      'data-results-live="true"',
    );
  });

  it("renders the chart ahead of the detail region", async () => {
    const html = await render();
    expect(html.indexOf("<figure")).toBeGreaterThan(-1);
    expect(html.indexOf("<figure")).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid, all three regions and the CTA target", async () => {
    const html = await render();
    expect(html).toContain('id="phi-quy-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('id="phi-quy-ket-qua"');
    expect(html).toContain('aria-controls="phi-quy-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("keeps the plan and the fee schedule as two real fieldsets", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(F.planGroup);
    expect(form).toContain(F.feeGroup);
    expect(form.split("<fieldset").length - 1).toBe(2);
    // The fee boxes are the LAST thing in the form, which is why row 29 asks
    // for the two value lines to sit beside them.
    expect(form.indexOf(F.planGroup)).toBeLessThan(form.indexOf(F.feeGroup));
  });

  it("marks the CTA help as pointing at a bad field only when one exists", async () => {
    const clean = await render();
    const broken = await render({ defaultMonths: "0" });
    // `ResultCta`'s `invalid` drives only the help sentence; the jump
    // destination is read from the DOM. So this asserts the two states
    // differ, not which words either one uses.
    expect(broken).toContain('aria-invalid="true"');
    expect(clean).not.toContain('aria-invalid="true"');
  });
});
