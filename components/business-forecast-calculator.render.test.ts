/**
 * Rendered-markup contracts for /cong-cu/du-bao-kinh-doanh/ — audit row 66,
 * "Đưa kết quả dự phóng cạnh đầu vào; nhãn giả định tăng trưởng/biên lợi nhuận
 * nhìn thấy cùng kết luận", at "Theo nhóm + kết quả".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the forecast renders in a result region
 * beside the form, that the entered growth/cost/tax assumptions render with
 * the conclusion rather than only in the fields, that the signed loss and the
 * never-profitable state survive, and that the eight-column per-year table
 * moved to the full-width band.
 *
 * THE ARITHMETIC IS `lib/calc/forecast.test.ts`'s. The two percentages pinned
 * here are the ones `leverageNotice` already quotes for the shipped defaults
 * (margin 10,00% → 16,66%); the money headline is compared to the CTA's copy
 * of it rather than re-derived, which is the property that matters here.
 *
 * WHAT IT CANNOT: appearance. Whether the split reads at a stated width is
 * Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";

const CONTENT = "@/content/calculators/business-forecast";
const F = BUSINESS_FORECAST.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

// `Record<…, string>`, not `Partial<typeof F.defaults>`: the content file is
// `as const`, so the derived type would only accept each key's SHIPPED value.
type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<
          typeof import("@/content/calculators/business-forecast")
        >(CONTENT);
      return {
        BUSINESS_FORECAST: {
          ...actual.BUSINESS_FORECAST,
          form: {
            ...actual.BUSINESS_FORECAST.form,
            defaults: {
              ...actual.BUSINESS_FORECAST.form.defaults,
              ...defaults,
            },
          },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/business-forecast-calculator");
    return renderToStaticMarkup(
      createElement(loaded.BusinessForecastCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** The emphasised row's rendered value, whatever it is. */
function headlineValue(live: string): string {
  const match = live.match(/md:text-3xl[^>]*>([^<]+)</);
  expect(match).not.toBeNull();
  return match![1];
}

describe("the forecast is beside the inputs", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="du-bao-kinh-doanh-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="du-bao-kinh-doanh-ket-qua"');
    expect(html).toContain('aria-controls="du-bao-kinh-doanh-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps the three input groups in the form, in order", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [F.revenueGroup, F.costGroup, F.horizonGroup].map((title) =>
      form!.indexOf(title),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("emphasises the final operating profit, and pins that same string", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      F.finalProfitLabel,
    );
    expect(rows(live!)).toBe(4);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);

    const cta = markupRegion(html, 'data-calc-cta="true"')!;
    expect(cta).toContain('data-calc-answer="true"');
    expect(cta).toContain(F.finalProfitLabel);
    // One formatting of one quantity, in both places.
    expect(cta).toContain(headlineValue(live!));
  });

  it("keeps the margin and its move as support", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    // `leverageNotice` already states 10,00% → 16,66% for these defaults.
    expect(live).toContain("16,66%");
    expect(live).toContain(`+6,66 ${F.pointsUnit}`);
  });
});

describe("the assumptions are visible with the conclusion", () => {
  it("states the entered growth, cost and tax figures", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(
      F.assumptionLine
        .replace("{growth}", "+15,00")
        .replace("{variable}", "60,00")
        .replace("{fixedGrowth}", "+8,00")
        .replace("{tax}", "17,00"),
    );
    // Context, not an announced answer.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.assumptionLine.slice(0, 20));
  });

  it("follows the fields rather than the defaults, and signs a decline", async () => {
    const html = await render({ growth: "-5", fixedGrowth: "0" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    // A negative growth rate reads as one, and zero carries no sign at all.
    expect(result).toContain(
      F.assumptionLine
        .replace("{growth}", "−5,00")
        .replace("{variable}", "60,00")
        .replace("{fixedGrowth}", "0,00")
        .replace("{tax}", "17,00"),
    );
  });

  it("states no assumptions while the forecast is refused", async () => {
    const html = await render({ years: "0" });
    expect(html).toContain(F.yearsInvalid);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.invalidNotice);
    expect(result).not.toContain(F.assumptionLine.slice(0, 20));
  });
});

describe("the period totals stay a conclusion", () => {
  it("keeps the totals group and the never-profitable state in the result column", async () => {
    // Fixed costs far above the contribution margin: no year turns a profit.
    const html = await render({ fixed: "9.000.000.000", growth: "0" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.totalsTitle);
    expect(result).toContain(F.firstProfitableLabel);
    expect(result).toContain(F.neverProfitable);
    // And the loss is signed, in the headline and in the totals.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(headlineValue(live)).toContain("−");
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.lossNotice);
  });
});

describe("the per-year table is the full-width band", () => {
  it("moves the eight columns below the two columns", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.table.caption);
    expect(detail).toContain("2026");
    expect(detail).toContain("2030");
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("<table");
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain(F.table.caption);
  });

  it("renders no band at all while the forecast is refused", async () => {
    const html = await render({ variable: "120" });
    expect(html).toContain(F.variableInvalid);
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
  });
});
