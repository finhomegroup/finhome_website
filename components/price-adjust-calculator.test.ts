/**
 * Rendered-markup contracts for /cong-cu/giam-gia-va-thue/ — audit row 62,
 * "Chia Giá / Giảm / Thuế; ưu tiên số cuối phải trả, chi tiết từng bước mở
 * thêm."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the form is three named groups, that the
 * final payable figure is the single emphasised answer, that the four
 * component figures and the step ledger moved into the non-announced detail
 * region, and that the combination-level refusal keeps its explanation next
 * to the answer it is withholding.
 *
 * THE ARITHMETIC IS `lib/calc/price-adjust.test.ts`'s. The default case below
 * is pinned to literals because it is the pre-implementation runtime baseline;
 * everything else asserts placement.
 *
 * WHAT IT CANNOT: appearance. The long tax passage DID push the answer off a
 * desktop screen — measured on export 2026-09-22T20:56:03Z at 1440×1000, form
 * column 2386,25 px tall, result region at -321,5 to -75,5 with the last tax
 * field focused — and the block at the end of this file pins the three
 * structural halves of that repair. It cannot establish that the repair
 * measures better; only that the passage is still on the page verbatim, that
 * it is now collapsed, and that the answer is restated on the CTA.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { PRICE_ADJUST } from "@/content/calculators/price-adjust";

const CONTENT = "@/content/calculators/price-adjust";

type FormPatch = Partial<Record<keyof typeof PRICE_ADJUST.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/price-adjust")
      >(CONTENT);
      return {
        PRICE_ADJUST: {
          ...actual.PRICE_ADJUST,
          form: { ...actual.PRICE_ADJUST.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/price-adjust-calculator");
    return renderToStaticMarkup(
      createElement(loaded.PriceAdjustCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = PRICE_ADJUST.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the form is three groups", () => {
  it("names Giá, Giảm and Thuế separately", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    expect(form!).toContain(C.priceGroup);
    expect(form!).toContain(C.discountGroup);
    expect(form!).toContain(C.taxGroup);
    // The tax pair is inside the tax group, not trailing the price group.
    expect(form!.indexOf(C.taxGroup)).toBeLessThan(
      form!.indexOf(C.taxIncludedLegend),
    );
    expect(form!.indexOf(C.discountGroup)).toBeLessThan(
      form!.indexOf(C.taxGroup),
    );
  });

  it("no longer titles a group after something it does not only hold", async () => {
    // "Giá và thuế" was the old title of a group holding price, tax rate and
    // the tax-included radio.
    const html = await render();
    expect(html).not.toContain("Giá và thuế");
  });
});

describe("the final payable figure leads", () => {
  it("keeps the pre-implementation default figures", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // 1.000.000 → 20% → 800.000 → 10% → 720.000, tax already inside.
    expect(live!).toContain("720.000 ₫");
    expect(live!).toContain("280.000 ₫");
  });

  it("emphasises exactly one row, and it is the payable one", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.finalLabel);
  });

  it("announces three rows, not seven", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.savingLabel);
    expect(live!).toContain(C.savingPercentLabel);
    for (const moved of [
      C.discountLabel,
      C.netLabel,
      C.taxAmountLabel,
      C.withoutDiscountLabel,
    ]) {
      expect(live!, `"${moved}" is still announced`).not.toContain(moved);
    }
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the components and the ledger are detail", () => {
  it("puts all four component figures under one detail title", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.detailTitle);
    for (const label of [
      C.discountLabel,
      C.netLabel,
      C.taxAmountLabel,
      C.withoutDiscountLabel,
    ]) {
      expect(detail!, `detail lost "${label}"`).toContain(label);
    }
    // Tax inside the label price: 720.000 ₫ payable holds 53.333 ₫ of tax.
    expect(detail!).toContain("53.333 ₫");
  });

  it("keeps the step ledger, with the model's own running balance", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.ledgerTitle);
    expect(detail!).toContain(C.ledgerSteps.list);
    expect(detail!).toContain(C.ledgerSteps.firstPercent);
    expect(detail!).toContain(C.ledgerSteps.secondPercent);
    // The tax-included branch says so rather than adding a step.
    expect(detail!).toContain(C.ledgerSteps.taxInside);
    expect(detail!).not.toContain(C.ledgerSteps.taxAdded);
  });

  it("teaches the non-additivity only while both percentages are live", async () => {
    const both = await render();
    const bothDetail = markupRegion(both, 'data-calc-region="detail"');
    expect(bothDetail!).toContain(C.combinedNote);
    // 20% then 10% is 28%, not 30%.
    expect(bothDetail!).toContain("28,00%");
    expect(bothDetail!).toContain("30,00%");

    const one = await render({ defaultSecondDiscountPercent: "0" });
    expect(one).not.toContain(C.combinedNote);
  });

  it("does not announce any of the detail groups", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("<table");
  });
});

describe("the layout wiring", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="giam-gia-va-thue-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="giam-gia-va-thue-ket-qua"');
    expect(html).toContain('aria-controls="giam-gia-va-thue-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).not.toContain("<svg");
  });
});

describe("the refusals", () => {
  it("explains a discount larger than the price beside the answer", async () => {
    // Every field is legal; the combination is not. So no field is flagged,
    // and the reason sits where the missing figure would be.
    const html = await render({ defaultDiscountAmount: "5.000.000" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain(C.tooMuchNotice);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
    // Before the detail region, not after the ledger.
    expect(html.indexOf(C.tooMuchNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
    // And no ledger is drawn for a calculation that has no result.
    expect(html).not.toContain(C.ledgerStepColumn);
  });

  it("does not show the notice while the combination works", async () => {
    const html = await render();
    expect(html).not.toContain(C.tooMuchNotice);
  });

  it("still bounds the tax rate at 100, and blames only that field", async () => {
    const html = await render({ defaultTax: "500" });
    expect(html).toContain(C.taxInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
  });

  it("still bounds both discount percentages at 100", async () => {
    const first = await render({ defaultDiscountPercent: "101" });
    expect(first.split('aria-invalid="true"').length - 1).toBe(1);
    const second = await render({ defaultSecondDiscountPercent: "101" });
    expect(second.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("accepts a zero tax and a zero discount", async () => {
    const html = await render({
      defaultTax: "0",
      defaultDiscountPercent: "0",
      defaultSecondDiscountPercent: "0",
    });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("1.000.000 ₫");
  });

  it("adds the tax on top when the price is quoted before tax", async () => {
    const html = await render({ defaultTaxIncluded: "no" });
    const live = markupRegion(html, 'data-results-live="true"');
    // 720.000 net + 8% = 777.600.
    expect(live!).toContain("777.600 ₫");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.ledgerSteps.taxAdded);
    expect(detail!).not.toContain(C.ledgerSteps.taxInside);
  });
});

/**
 * The measured repair. Three parts, asserted separately so a regression names
 * which one came back.
 */
describe("the tax passage no longer sits open between the inputs and the answer", () => {
  it("carries the short warning on the field and the full text in a disclosure", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    // Both are present, and both are inside the form column.
    expect(form!).toContain(C.taxHelpShort);
    expect(form!).toContain(C.taxDetailTitle);
    // VERBATIM. Nothing about the excluded categories, the expiry date or the
    // seller's-method caveat may be paraphrased away by this repair.
    expect(form!).toContain(C.taxHelp);
    // Collapsed: a native `<details>` with no `open`.
    expect(form!).toContain("<details");
    expect(form!).not.toContain("<details open");
    // And it follows the field it explains.
    expect(form!.indexOf(C.taxLabel)).toBeLessThan(
      form!.indexOf(C.taxDetailTitle),
    );
  });

  it("does not leave the long passage as the field's own help text", async () => {
    const html = await render();
    // The short help is what the field itself describes. The long passage is
    // reachable, but it is not what `aria-describedby` points at any more.
    const field = html.slice(
      html.indexOf(C.taxLabel),
      html.indexOf(C.taxDetailTitle),
    );
    expect(field).toContain(C.taxHelpShort);
    expect(field).not.toContain(C.taxHelp);
  });

  it("pins the payable figure to the CTA, as the same string the row renders", async () => {
    const html = await render();
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta).not.toBeNull();
    expect(cta!).toContain("fh-cta-pin");
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).toContain(C.finalLabel);
    // 720.000 ₫ is what the emphasised row shows; one formatting, not two.
    expect(cta!).toContain("720.000 ₫");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("720.000 ₫");
    // Visual only. The live region stays the single announcement.
    expect(cta!).toContain('aria-hidden="true"');
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("shows the placeholder rather than a stale figure when the combination is refused", async () => {
    const html = await render({ defaultDiscountAmount: "5.000.000" });
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).not.toContain("₫");
  });
});
