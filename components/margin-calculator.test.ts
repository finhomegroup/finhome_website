/**
 * Rendered-markup contracts for /cong-cu/margin-va-markup/ — audit row 63,
 * "Một khối ngắn, hai nhãn margin và markup giải thích bằng tiếng Việt;
 * không cần chart."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the two loanword rows now say what they
 * divide by, that the emphasised row follows the mode rather than being
 * pinned to one figure, that the block stayed compact and chartless, and that
 * each mode's own impossible value is still refused — while selling BELOW
 * cost still computes, because a loss is a real situation and the page says
 * so.
 *
 * WHAT IT CANNOT: appearance. Nothing here has been seen at a viewport.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { MARGIN } from "@/content/calculators/margin";

const CONTENT = "@/content/calculators/margin";

type FormPatch = Partial<Record<keyof typeof MARGIN.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/margin")>(
          CONTENT,
        );
      return {
        MARGIN: {
          ...actual.MARGIN,
          form: { ...actual.MARGIN.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/margin-calculator");
    return renderToStaticMarkup(createElement(loaded.MarginCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = MARGIN.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the two rates say what they divide by", () => {
  it("labels margin against the sale price and markup against cost", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // The words stay — a supplier uses them — but not alone.
    expect(live!).toContain("Margin (lợi nhuận ÷ giá bán)");
    expect(live!).toContain("Markup (lợi nhuận ÷ giá vốn)");
  });

  it("still shows all four figures for the default cost and price", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    // 600.000 ₫ cost, 1.000.000 ₫ price.
    expect(live!).toContain("1.000.000 ₫");
    expect(live!).toContain("400.000 ₫");
    expect(live!).toContain("40,00%");
    expect(live!).toContain("66,67%");
  });
});

describe("the emphasised row is the answer, not the input", () => {
  it("emphasises margin when the reader entered a price", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.marginResultLabel,
    );
  });

  it("emphasises the price when the reader entered a target margin", async () => {
    const html = await render({ defaultMode: "margin" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    const headline = live!.slice(0, live!.indexOf(HEADLINE));
    expect(headline).toContain(C.priceResultLabel);
    // A 40% margin on 600.000 ₫ is the page's own trap example.
    expect(live!).toContain("1.000.000 ₫");
  });

  it("emphasises the price in markup mode too, at the markup's price", async () => {
    const html = await render({ defaultMode: "markup" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.priceResultLabel,
    );
    // 600.000 ₫ marked up 50% is 900.000 ₫ — margin 33,33%, not 50%.
    expect(live!).toContain("900.000 ₫");
    expect(live!).toContain("33,33%");
  });
});

describe("the block stayed short", () => {
  it("emits one column, one live region and no chart", async () => {
    const html = await render();
    expect(html).toContain('id="margin-nhap" data-calc-region="form"');
    expect(html).not.toContain("lg:grid-cols-5");
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(html).not.toContain("<svg");
    // Nothing earned a detail region either.
    expect(html).not.toContain('data-calc-region="detail"');
  });

  it("points the CTA at the answer without pinning it", async () => {
    const html = await render();
    expect(html).toContain('id="margin-ket-qua"');
    expect(html).toContain('aria-controls="margin-ket-qua"');
    expect(html).not.toContain("fh-cta-pin");
  });
});

describe("each mode keeps its own impossible value", () => {
  it("refuses a zero sale price", async () => {
    const html = await render({ defaultPrice: "0" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.priceInvalid);
  });

  it("refuses a margin of 100, which implies a cost of zero", async () => {
    const html = await render({ defaultMode: "margin", defaultMargin: "100" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.marginInvalid);
  });

  it("refuses a markup of −100, which zeroes the price", async () => {
    const html = await render({ defaultMode: "markup", defaultMarkup: "-100" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.markupInvalid);
  });

  it("refuses a cost of zero, in every mode", async () => {
    const html = await render({ defaultCost: "0" });
    expect(html).toContain(C.costInvalid);
    expect(html).toContain('aria-invalid="true"');
  });

  it("does not refuse a markup of 900, which has no upper limit", async () => {
    const html = await render({ defaultMode: "markup", defaultMarkup: "900" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    // Ten times cost — margin 90%.
    expect(live!).toContain("6.000.000 ₫");
    expect(live!).toContain("90,00%");
  });
});

describe("selling below cost is a result, not an error", () => {
  it("computes both rates negative rather than rejecting the price", async () => {
    // `formula.body` promises exactly this, and it is the reason the price
    // guard is "khác 0" rather than "lớn hơn giá vốn".
    const html = await render({ defaultPrice: "400.000" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    // ASCII hyphen-minus: that is what `formatMoney`/`formatPercent` emit.
    // The copy in `content/calculators/margin.ts` uses the typographic minus
    // U+2212 in prose; the two do not have to agree, but a test that assumed
    // they did would pass for the wrong reason.
    expect(live!).toContain("-200.000 ₫");
    expect(live!).toContain("-50,00%");
    expect(live!).toContain("-33,33%");
  });
});
