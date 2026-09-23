/**
 * Rendered-markup contracts for /cong-cu/trai-phieu/ — CSV row 25.
 *
 * WHAT THIS FILE CAN ESTABLISH: that the form is grouped Giá / Lãi suất /
 * Kỳ hạn, that price and yield are adjacent rows of the answer in BOTH
 * directions with the solved one emphasised, that the duration figures are
 * in the detail region, and that an unreachable yield is explained beside
 * the blank rather than filled with a guess.
 *
 * WHAT IT CANNOT: anything about appearance, including whether the split
 * grid ever actually becomes two columns.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { BOND } from "@/content/calculators/bond";

const CONTENT = "@/content/calculators/bond";

type FormPatch = Partial<Record<keyof typeof BOND.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/bond")>(
          CONTENT,
        );
      return {
        BOND: { ...actual.BOND, form: { ...actual.BOND.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/bond-calculator");
    return renderToStaticMarkup(createElement(loaded.BondCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = BOND.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("price and yield are adjacent in both directions", () => {
  it("prices the default bond from its required yield", async () => {
    // 100 triệu face, coupon 8% paid twice a year, 5 years, YTM 10%.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("92.278.265 ₫");
    expect(live).toContain("92,278%");
    expect(live).toContain(C.quoteDiscount);
  });

  it("shows the supplied yield beside the solved price", async () => {
    // The input restated as an output: the relationship is what the page is
    // demonstrating, so both sides of it belong in the answer.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("10,0000%");
    expect(live.indexOf(C.priceResultLabel)).toBeLessThan(
      live.indexOf(C.yieldResultLabel),
    );
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(
      C.priceResultLabel,
    );
  });

  it("swaps the order and the emphasis in the other direction", async () => {
    const html = await render({ defaultMode: "price" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    // The default price is the default yield's own answer, so this is the
    // round trip: 92.278.265 ₫ must solve back to 10%.
    expect(live).toContain("10,0000%");
    expect(live).toContain("92.278.265 ₫");
    expect(live.indexOf(C.yieldResultLabel)).toBeLessThan(
      live.indexOf(C.priceResultLabel),
    );
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(
      C.yieldResultLabel,
    );
  });

  it("never shows the same figure twice across the two regions", async () => {
    // The old arrangement put the supplied side in the detail disclosure.
    // Now that it is in the answer, the detail must not repeat it.
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).not.toContain(C.priceResultLabel);
    expect(detail).not.toContain(C.yieldResultLabel);
  });
});

describe("the sensitivity figures are in the detail region", () => {
  it("holds the durations and the one-point price move", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(`4,1798 ${C.yearsUnit}`);
    expect(detail).toContain(`3,9808 ${C.yearsUnit}`);
    expect(detail).toContain(C.sensitivityLabel);
    expect(detail).toContain("3.673.373 ₫");
  });

  it("keeps the other two yields there too, and stays non-live", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("8,6694%"); // lợi suất hiện tại
    expect(detail).toContain("10,2500%"); // lợi suất hiệu dụng
    expect(detail).toContain(`10 ${C.periodsUnit}`);
    expect(detail).not.toContain('data-results-live="true"');
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the form is grouped by Giá, Lãi suất and Kỳ hạn", () => {
  it("names all three groups plus the untitled mode switch", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(C.priceGroup);
    expect(form).toContain(C.rateGroup);
    expect(form).toContain(C.termGroup);
    // Mode, Giá, Lãi suất, Kỳ hạn. The radio group renders its own
    // fieldset inside the untitled one, so this counts five.
    expect(form.split("<fieldset").length - 1).toBe(5);
  });

  it("puts the required yield with the coupon, not with the price", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.indexOf(C.yieldLabel)).toBeGreaterThan(
      form.indexOf(C.rateGroup),
    );
    expect(form.indexOf(C.yieldLabel)).toBeLessThan(form.indexOf(C.termGroup));
    // In yield mode the market price is the answer, so it is not a field.
    expect(form).not.toContain(C.priceLabel);
  });

  it("puts the market price with the face value in the other direction", async () => {
    const html = await render({ defaultMode: "price" });
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.indexOf(C.priceLabel)).toBeGreaterThan(
      form.indexOf(C.priceGroup),
    );
    expect(form.indexOf(C.priceLabel)).toBeLessThan(form.indexOf(C.rateGroup));
    expect(form).not.toContain(C.yieldLabel);
  });

  it("keeps the payment frequency beside the term it validates", async () => {
    // `yearsInvalid` is a statement about the PAIR: 5,25 years is legal at
    // four payments a year and illegal at two.
    const html = await render({ defaultYears: "5,25" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.yearsInvalid);
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.indexOf(C.frequencyLabel)).toBeGreaterThan(
      form.indexOf(C.yearsLabel),
    );
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid, all three regions and the CTA target", async () => {
    const html = await render();
    expect(html).toContain('id="trai-phieu-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('id="trai-phieu-ket-qua"');
    expect(html).toContain('aria-controls="trai-phieu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("explains an unreachable yield rather than guessing one", async () => {
    // A price far above every đồng the bond will ever pay: no yield solves
    // it, and the figure is left blank.
    const html = await render({
      defaultMode: "price",
      defaultPrice: "1",
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.unsolvableNotice);
    // The price itself is a legal amount; no box is wrong.
    expect(html).not.toContain('aria-invalid="true"');
  });
});
