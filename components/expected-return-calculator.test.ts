/**
 * Rendered-markup contracts for /cong-cu/loi-nhuan-ky-vong/ — CSV row 39.
 *
 * WHAT THIS FILE CAN ESTABLISH: the split region contract, the CTA wiring,
 * that the expected return and the standard deviation are adjacent rows, that
 * the probability total is in the answer region rather than behind the detail
 * disclosure, and that a total which is not 100% still refuses to compute
 * without marking any control invalid.
 *
 * WHAT IT CANNOT: anything about appearance, including whether a scenario's
 * two fields actually share a line at any width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";

const CONTENT = "@/content/calculators/expected-return";

type FormPatch = Partial<
  Record<keyof typeof EXPECTED_RETURN.form, string | readonly string[]>
>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/expected-return")
      >(CONTENT);
      return {
        EXPECTED_RETURN: {
          ...actual.EXPECTED_RETURN,
          form: { ...actual.EXPECTED_RETURN.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/expected-return-calculator");
    return renderToStaticMarkup(
      createElement(loaded.ExpectedReturnCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = EXPECTED_RETURN.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the return and the spread stand together", () => {
  it("answers at the shipped defaults", async () => {
    // 25% of +25%, 50% of +10%, 25% of −15%.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("7,5000%"); // expected return
    expect(live).toContain("14,3614%"); // standard deviation
    expect(live).toContain("1,9149"); // coefficient of variation
  });

  it("puts the standard deviation immediately under the expected return", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.indexOf(C.expectedLabel)).toBeLessThan(
      live.indexOf(C.stdDevLabel),
    );
    expect(live.indexOf(C.stdDevLabel)).toBeLessThan(
      live.indexOf(C.coefficientLabel),
    );
  });

  it("gives the headline to the expected return and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(C.expectedLabel);
  });
});

describe("the probability total is visible", () => {
  it("renders the total in the answer region, not in the detail region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(C.probabilitySumLabel);
    expect(live).toContain("100,00%");
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).not.toContain(C.probabilitySumLabel);
  });

  it("still shows the total when the set does not add to 100%", async () => {
    // The total is the diagnostic: hiding it in the state it explains would
    // leave the reader with a refusal and no way to see the cause.
    const html = await render({
      defaultProbabilities: ["25", "50", "10", "0", "0", "0", "0", "0"],
    });
    expect(html).toContain(C.badSumNotice);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("85,00%");
    expect(live).not.toContain("7,5000%");
  });

  it("does not mark any control invalid for a bad total", async () => {
    // Each probability is a legitimate number on its own; it is the SET that
    // is wrong, so there is no single box to send the reader to.
    const html = await render({
      defaultProbabilities: ["25", "50", "10", "0", "0", "0", "0", "0"],
    });
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("does not silently normalise the total to 100%", async () => {
    const html = await render({
      defaultProbabilities: ["50", "100", "50", "0", "0", "0", "0", "0"],
    });
    // 200% is not a distribution, and rescaling would answer a different
    // question than the one asked.
    expect(html).toContain("200,00%");
    expect(html).toContain(C.badSumNotice);
  });
});

describe("the scenario count still governs the table", () => {
  it("renders two fields per shown scenario and no more", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    // Three scenarios at the default count.
    expect(form).toContain(C.probabilityLabel.replace("{n}", "3"));
    expect(form).not.toContain(C.probabilityLabel.replace("{n}", "4"));
  });

  it("still rejects a grouped count", async () => {
    // `parseCount` is why "3.000" cannot pass as three scenarios.
    const html = await render({ defaultCount: "3.000" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.countInvalid);
  });

  it("drops the scenario fields entirely when the count is unusable", async () => {
    const html = await render({ defaultCount: "1" });
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).not.toContain(C.probabilityLabel.replace("{n}", "1"));
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid and all three regions", async () => {
    const html = await render();
    expect(html).toContain(
      'id="loi-nhuan-ky-vong-nhap" data-calc-region="form"',
    );
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('data-calc-region="detail"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="loi-nhuan-ky-vong-ket-qua"');
    expect(html).toContain('aria-controls="loi-nhuan-ky-vong-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("keeps the distribution-shape measures in one non-live detail group", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("11,2500%"); // semi-deviation
    expect(detail).toContain("25,00%"); // probability of a loss
    expect(detail).toContain("206,2500"); // variance
    expect(detail).not.toContain('data-results-live="true"');
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
