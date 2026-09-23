/**
 * Rendered-markup contracts for /cong-cu/loi-nhuan-ky-nam-giu/ — CSV row 40.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that the
 * annual figure is the one headline, that the whole-period row names its own
 * span (the row's "tách rõ" requirement), and that the two ways the annual
 * figure can be absent are still told apart in words.
 *
 * WHAT IT CANNOT: anything about appearance.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { HOLDING_PERIOD } from "@/content/calculators/holding-period";

const CONTENT = "@/content/calculators/holding-period";

type FormPatch = Partial<Record<keyof typeof HOLDING_PERIOD.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/holding-period")
      >(CONTENT);
      return {
        HOLDING_PERIOD: {
          ...actual.HOLDING_PERIOD,
          form: { ...actual.HOLDING_PERIOD.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/holding-period-calculator");
    return renderToStaticMarkup(createElement(loaded.HoldingPeriodCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = HOLDING_PERIOD.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("period and annual are told apart", () => {
  it("answers at the shipped defaults", async () => {
    // 100 triệu to 118 triệu plus 12 triệu received, over 3 years.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("30,0000%"); // whole period
    expect(live!).toContain("18,0000%"); // of which capital gain
    expect(live!).toContain("12,0000%"); // of which income
    expect(live!).toContain("9,1393%"); // per year
  });

  it("names the span on the whole-period row", async () => {
    const html = await render();
    expect(html).toContain("Lợi nhuận cả kỳ nắm giữ (3 năm)");
  });

  it("reads the span from the entered value", async () => {
    const html = await render({ defaultYears: "0,5" });
    expect(html).toContain("Lợi nhuận cả kỳ nắm giữ (0,5 năm)");
  });

  it("gives the headline to the ANNUAL figure and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.annualisedLabel,
    );
  });
});

describe("the two ways the annual figure goes missing", () => {
  it("names an empty holding period as a choice, not an error", async () => {
    const html = await render({ defaultYears: "" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain(C.noAnnualNotice);
    expect(html).not.toContain(C.totalLossNotice);
    // The whole-period figures are still answered, with the bare label.
    expect(html).toContain("30,0000%");
    expect(html).toContain(`>${C.hprLabel}<`);
  });

  it("names a total loss separately", async () => {
    const html = await render({ defaultEnd: "0", defaultIncome: "0" });
    expect(html).toContain(C.totalLossNotice);
    expect(html).not.toContain(C.noAnnualNotice);
    expect(html).toContain("-100,0000%");
  });

  it("explains both beside the answer, not under the money detail", async () => {
    const html = await render({ defaultYears: "" });
    expect(html.indexOf(C.noAnnualNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("the region and CTA contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="ky-nam-giu-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("keeps all four inputs in ONE block", async () => {
    // Row 40: "gộp đầu vào vào khối gọn".
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!.split("<fieldset").length - 1).toBe(1);
    expect(form!).toContain(C.group);
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="ky-nam-giu-ket-qua"');
    expect(html).toContain('aria-controls="ky-nam-giu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("puts the money figures in a single non-live detail group", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain("18.000.000 ₫"); // capital gain
    expect(detail!).toContain("30.000.000 ₫"); // total gain
    expect(detail!).toContain("130.000.000 ₫"); // total proceeds
    expect(detail!).toContain("40,00%"); // income's share of the gain
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
