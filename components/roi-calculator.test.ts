/**
 * Rendered-markup contracts for /cong-cu/ty-suat-loi-nhuan-roi/ — CSV row 23.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, which of
 * the four figures is the headline, that the whole-period row names its own
 * period, and that the optional holding period is still optional — the state
 * this page is most likely to break, because an empty field there is a
 * supported answer and not an error.
 *
 * WHAT IT CANNOT: anything about appearance. `emphasis` is asserted as a class
 * the shared primitive owns, which says the row was given the headline
 * treatment, NOT that it looks like one at any width.
 *
 * Server-rendered with `renderToStaticMarkup` in the runner's plain `node`
 * environment.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { ROI } from "@/content/calculators/roi";

const CONTENT = "@/content/calculators/roi";

type FormPatch = Partial<Record<keyof typeof ROI.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/roi")>(
          CONTENT,
        );
      return { ROI: { ...actual.ROI, form: { ...actual.ROI.form, ...patch } } };
    });
  }
  try {
    const loaded = await import("@/components/roi-calculator");
    return renderToStaticMarkup(createElement(loaded.RoiCalculator, props ?? null));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = ROI.form;

/** The `emphasis` treatment `ResultRow` owns — see components/calc/result-row.tsx. */
const HEADLINE = "md:text-3xl";

describe("the answer at the shipped defaults", () => {
  it("computes 500 triệu to 700 triệu over 3 years", async () => {
    const html = await render();
    // 200 triệu gained, 40% over the period, 1,4× the capital, 11,87%/năm.
    expect(html).toContain("200.000.000 ₫");
    expect(html).toContain("40,00%");
    expect(html).toContain("1,40 lần");
    expect(html).toContain("11,87%");
  });

  it("makes the ANNUAL figure the one headline", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();

    // Exactly one row carries the headline treatment, and it is the annual one.
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    const headline = live!.slice(0, live!.indexOf(HEADLINE));
    expect(headline).toContain(C.annualisedLabel);
    // …and the annual figure is the value in that row, not a later one.
    expect(live!.indexOf("11,87%")).toBeGreaterThan(live!.indexOf(HEADLINE));
  });

  it("puts the money gain ahead of both ratios", async () => {
    // Row 23: "ưu tiên lợi nhuận ròng và thời gian nắm giữ".
    const html = await render();
    expect(html.indexOf(C.gainLabel)).toBeLessThan(html.indexOf("ROI tổng"));
    expect(html.indexOf(C.gainLabel)).toBeLessThan(
      html.indexOf(C.multipleLabel),
    );
  });
});

describe("whole-period ROI is not sold as an annual return", () => {
  it("names the period in the whole-period row's own label", async () => {
    const html = await render();
    expect(html).toContain("ROI tổng (cả 3 năm)");
  });

  it("reads the period from the entered value, not from the default", async () => {
    const html = await render({ defaultYears: "0,5" });
    expect(html).toContain("ROI tổng (cả 0,5 năm)");
    // A label, not a rounding: half a year does not become "cả 1 năm".
    expect(html).not.toContain("ROI tổng (cả 1 năm)");
  });

  it("falls back to the bare label when there is no period to name", async () => {
    const html = await render({ defaultYears: "" });
    expect(html).toContain(`>${C.roiLabel}<`);
    expect(html).not.toContain("(cả");
  });
});

describe("the holding period stays optional", () => {
  it("leaves an empty period valid, with the ROI rows still answered", async () => {
    const html = await render({ defaultYears: "" });
    // Not an error state: no field is marked invalid…
    expect(html).not.toContain('aria-invalid="true"');
    // …the whole-period figures are still there…
    expect(html).toContain("40,00%");
    expect(html).toContain("200.000.000 ₫");
    // …and the reason the annual row is blank is stated in words.
    expect(html).toContain(C.noAnnualNotice);
  });

  it("marks a NEGATIVE period invalid, which is a real bad entry", async () => {
    const html = await render({ defaultYears: "-2" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.yearsInvalid);
  });

  it("explains a total loss rather than blanking the headline silently", async () => {
    const html = await render({ defaultFinal: "0" });
    expect(html).toContain(C.totalLossNotice);
    expect(html).toContain("-100,00%");
  });
});

describe("the region and CTA contract", () => {
  it("emits the form and result regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    // CSV row 23 is "Gọn": three fields do not become two desktop columns.
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA from the form region at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="roi-nhap" data-calc-region="form"');
    expect(html).toContain('id="roi-ket-qua"');
    expect(html).toContain('aria-controls="roi-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("keeps exactly one live results region", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("puts the near-answer actions after the answer and outside the live region", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // The slice really is the answer, so "not inside" means something.
    expect(live!).toContain("11,87%");
    expect(live!).not.toContain('data-test="actions"');
    expect(html.indexOf("11,87%")).toBeLessThan(
      html.indexOf('data-test="actions"'),
    );
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
  });
});
