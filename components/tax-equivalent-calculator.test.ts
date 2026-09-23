/**
 * Rendered-markup contracts for /cong-cu/loi-suat-tuong-duong-thue/ — CSV row 26.
 *
 * WHAT THIS FILE CAN ESTABLISH: that the summary was shortened WITHOUT losing
 * the resolution the comparison needs, that the unrounded figures are still on
 * the page, that the tax row survived the shortening, and that the headline
 * follows the direction the reader chose rather than being fixed to one
 * conversion. The rounding assertions are the load-bearing ones: a "fewer
 * decimals" repair is the kind that quietly deletes the difference the page is
 * about.
 *
 * WHAT IT CANNOT: anything about appearance, and nothing about whether a
 * `<details>` is discoverable — only that it is a disclosure with the numbers
 * inside it.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { TAX_EQUIVALENT } from "@/content/calculators/tax-equivalent";

const CONTENT = "@/content/calculators/tax-equivalent";

type FormPatch = Partial<Record<keyof typeof TAX_EQUIVALENT.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/tax-equivalent")
      >(CONTENT);
      return {
        TAX_EQUIVALENT: {
          ...actual.TAX_EQUIVALENT,
          form: { ...actual.TAX_EQUIVALENT.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/tax-equivalent-calculator");
    return renderToStaticMarkup(
      createElement(loaded.TaxEquivalentCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = TAX_EQUIVALENT.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the summary is shorter without being less true", () => {
  it("rounds the summary to three places, not two", async () => {
    // 5,5% tax-free at a 5% rate grosses up to 5,789474%. The page's own
    // comparison turns on the second and third digit after the comma — at two
    // places the 5,51% after-tax figure and the 5,5% deposit it is being
    // compared with stop being distinguishable in the way the copy claims.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("5,789%");
    expect(live!).not.toContain("5,789474%");
    expect(live!).not.toContain("5,79%");
  });

  it("keeps the tax row in the summary", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.taxCostLabel);
    // 0,289474 points, at the summary's precision.
    expect(live!).toContain(`0,289 ${C.pointsUnit}`);
  });

  it("keeps all three summary labels", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    for (const label of [C.taxableLabel, C.afterTaxLabel, C.taxCostLabel]) {
      expect(live!, `summary lost "${label}"`).toContain(label);
    }
  });
});

describe("full precision, on request", () => {
  it("puts the unrounded figures in a disclosure below", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain("<details");
    expect(detail!).toContain(C.fullPrecisionTitle);
    expect(detail!).toContain("5,789474%");
  });

  it("loses no figure the old always-open detail group showed", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    for (const label of [
      C.taxableLabel,
      C.afterTaxLabel,
      C.taxCostLabel,
      C.taxFreeLabel,
      C.grossUpLabel,
    ]) {
      expect(detail!, `disclosure lost "${label}"`).toContain(label);
    }
    // The relative gross-up, unrounded: 5,263158%, the figure the FAQ quotes.
    expect(detail!).toContain("5,263158%");
  });

  it("leaves the second group out of the live announcement", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the headline follows the reader's question", () => {
  it("emphasises the grossed-up rate in the tax-free direction", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.taxableLabel);
  });

  it("emphasises the after-tax rate in the other direction", async () => {
    const html = await render({ defaultDirection: "toAfterTax" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    const headline = live!.slice(0, live!.indexOf(HEADLINE));
    expect(headline).toContain(C.afterTaxLabel);
    // 5,5% taxable nets 5,225% at a 5% rate — the entered figure is now the
    // gross one, which is the whole meaning of the direction switch.
    expect(live!).toContain("5,225%");
  });
});

describe("the region, CTA and no-solution contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="loi-suat-thue-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="loi-suat-thue-ket-qua"');
    expect(html).toContain('aria-controls="loi-suat-thue-ket-qua"');
  });

  it("names the 100% tax rate as having no answer, beside the answer", async () => {
    const html = await render({ defaultTaxRate: "100" });
    expect(html).toContain(C.impossibleNotice);
    expect(html).toContain('aria-invalid="true"');
    // The explanation is in the result region, not hidden in the disclosure.
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).not.toContain(C.impossibleNotice);
  });

  it("puts the actions after the answer and outside the live region", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("5,789%");
    expect(live!).not.toContain('data-test="actions"');
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
    expect(html.indexOf('data-test="next-steps"')).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});
