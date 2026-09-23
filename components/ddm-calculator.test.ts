/**
 * Rendered-markup contracts for /cong-cu/co-phieu-tang-truong-deu/ — CSV
 * row 36.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that the
 * model value and the gap against the market price are adjacent rows in that
 * order, that the result is not phrased as an instruction to buy, and that the
 * model's known refusal (g ≥ r) still refuses.
 *
 * WHAT IT CANNOT: anything about appearance, including whether the two rows
 * read as "cạnh nhau" at a given width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { DDM } from "@/content/calculators/ddm";

const CONTENT = "@/content/calculators/ddm";

type FormPatch = Partial<Record<keyof typeof DDM.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/ddm")>(
          CONTENT,
        );
      return { DDM: { ...actual.DDM, form: { ...actual.DDM.form, ...patch } } };
    });
  }
  try {
    const loaded = await import("@/components/ddm-calculator");
    return renderToStaticMarkup(createElement(loaded.DdmCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = DDM.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the model value and the gap sit together", () => {
  it("answers at the shipped defaults", async () => {
    // D0 2.000 ₫, g 5%, r 12% → D1 2.100 ₫ over a 7% denominator.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("30.000 ₫");
    expect(live!).toContain("-16,667%"); // 25.000 against 30.000
    expect(live!).toContain(C.verdictUnder);
  });

  it("puts the gap immediately after the value, before the verdict", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.indexOf(C.valueLabel)).toBeLessThan(
      live.indexOf(C.premiumLabel),
    );
    expect(live.indexOf(C.premiumLabel)).toBeLessThan(
      live.indexOf(C.verdictLabel),
    );
  });

  it("gives the headline to the model value and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(C.valueLabel);
  });

  it("sets the verdict as prose, not as a figure", async () => {
    const html = await render();
    expect(html).toContain("md:max-w-sm");
    expect(html).not.toContain(`md:text-2xl">${C.verdictUnder}`);
  });
});

describe("the result is not a buy order", () => {
  it("states whose assumptions produced the figure, beside the answer", async () => {
    const html = await render();
    expect(html).toContain(C.modelOnlyNote);
    expect(html.indexOf(C.modelOnlyNote)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("keeps that sentence out of the live announcement", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(C.modelOnlyNote);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("keeps the inversions beside the answer, not in the detail region", async () => {
    // The page argues these are the useful output, so they must not be the
    // thing a reader has to scroll past the decomposition to reach.
    const html = await render();
    expect(html).toContain("3,704%"); // implied perpetual growth
    expect(html).toContain("13,400%"); // implied required return
    expect(html.indexOf(C.impliedTitle)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("the two states that are not errors, and the one that is", () => {
  it("treats an empty market price as a supported entry", async () => {
    const html = await render({ defaultPrice: "" });
    expect(html).not.toContain('aria-invalid="true"');
    // The model value still answers; the comparison simply has no input.
    expect(html).toContain("30.000 ₫");
    expect(html).not.toContain(C.verdictUnder);
  });

  it("still rejects a NON-EMPTY impossible market price", async () => {
    const html = await render({ defaultPrice: "0" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.priceInvalid);
  });

  it("refuses to value growth at or above the required return", async () => {
    // The model's known limit, not a tool failure: 12% ≥ 12%.
    const html = await render({ defaultGrowth: "12" });
    expect(html).toContain(C.unpriceableNotice);
    expect(html).toContain('aria-invalid="true"');
    // And it prints no price at all rather than the negative number the
    // formula produces.
    expect(html).not.toContain("30.000 ₫");
  });
});

describe("the region and CTA contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="co-phieu-deu-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("keeps the dividend convention and the assumptions as separate blocks", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.split("<fieldset").length - 1).toBe(3); // 2 groups + the radio
    expect(form).toContain(C.dividendGroup);
    expect(form).toContain(C.assumptionGroup);
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="co-phieu-deu-ket-qua"');
    expect(html).toContain('aria-controls="co-phieu-deu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("puts the return decomposition in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.totalReturnLabel);
    expect(detail!).toContain("2.100 ₫"); // D1
    expect(detail!).toContain("12,000%"); // 7% yield + 5% growth
    expect(detail!).not.toContain('data-results-live="true"');
  });
});
