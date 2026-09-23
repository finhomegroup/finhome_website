/**
 * Rendered-markup contracts for /cong-cu/lai-suat-thuc-te/ — audit row 60,
 * "Một khối gọn lãi niêm yết → lãi hiệu dụng; giảm số lẻ ở kết quả mặc định."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the headline now opens at two decimals,
 * that every four-decimal figure the page used to show is still ON the page,
 * that the page announces exactly one live region after gaining a second
 * result group, and that a difference living entirely beyond the second
 * decimal survives the change. That last one is the point of the row: a
 * "fewer decimals" repair on a tool whose subject IS the third decimal place
 * is the kind that deletes the thing being taught.
 *
 * WHAT IT CANNOT: anything about appearance. `renderToStaticMarkup` in the
 * runner's plain `node` environment — no viewport, no pin geometry, no
 * judgement about whether two decimals reads better.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { EFFECTIVE_RATE } from "@/content/calculators/effective-rate";

const CONTENT = "@/content/calculators/effective-rate";

type FormPatch = Partial<Record<keyof typeof EFFECTIVE_RATE.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/effective-rate")
      >(CONTENT);
      return {
        EFFECTIVE_RATE: {
          ...actual.EFFECTIVE_RATE,
          form: { ...actual.EFFECTIVE_RATE.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/effective-rate-calculator");
    return renderToStaticMarkup(
      createElement(loaded.EffectiveRateCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = EFFECTIVE_RATE.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the default result opens at two decimals", () => {
  it("rounds the two headline rates and says it rounded them", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // 8%/năm ghép hằng tháng is 8,29995% effective.
    expect(live!).toContain("8,30%");
    expect(live!).not.toContain("8,3000%");
    expect(live!).toContain("8,00%");
    expect(live!).toContain(C.approxEffectiveLabel);
    expect(live!).toContain(C.approxNominalLabel);
    // The rounding is disclosed where the rounded figures are.
    expect(html).toContain(C.approxNote);
  });

  it("emphasises exactly one row, the effective rate", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.approxEffectiveLabel,
    );
  });

  it("keeps the period count out of the rounding, being a count", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(`12 ${C.periodsUnit}`);
  });
});

describe("the exact figures are still on the page", () => {
  it("keeps all four four-decimal rows in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.exactTitle);
    for (const label of [
      C.effectiveLabel,
      C.nominalLabel,
      C.periodicLabel,
      C.gainLabel,
    ]) {
      expect(detail!, `detail lost "${label}"`).toContain(label);
    }
    // The figures the primary group used to render: effective, nominal,
    // periodic (0,08 ÷ 12 = 0,6667%) and the compounding gain in points.
    expect(detail!).toContain("8,3000%");
    expect(detail!).toContain("8,0000%");
    expect(detail!).toContain("0,6667%");
    expect(detail!).toContain(`0,3000 ${C.pointsUnit}`);
  });

  it("announces one live region, not two", async () => {
    // `check-built-markup.mjs` allows exactly one per route, and this page
    // gained a second `ResultGroup` in this pass.
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("keeps the comparison table, carded, below the exact rows", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(EFFECTIVE_RATE.table.caption);
    expect(detail!).toContain("md:hidden");
    expect(detail!.indexOf(C.exactTitle)).toBeLessThan(
      detail!.indexOf(EFFECTIVE_RATE.table.caption),
    );
  });
});

describe("a difference that lives beyond the second decimal", () => {
  it("survives at 1%/năm, where every frequency rounds to 1,00%", async () => {
    // THE ROW'S REAL RISK, as a case. At 1%/năm the whole span from monthly
    // to daily compounding is under half a basis point: monthly is
    // 1,00459599%, weekly 1,00491955%. Two decimals renders both "1,00%" —
    // so if the four-decimal figures had gone away with the headline, the
    // page would state that compounding frequency does not matter here,
    // which is exactly the misreading the tool exists to prevent.
    const html = await render({ defaultRate: "1" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("1,00%");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain("1,0046%");
    // The table still separates the frequencies that the headline cannot.
    expect(detail!).toContain("1,0049%");
    expect(detail!).not.toBe(null);
  });
});

describe("the region, CTA and invalid contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain(
      'id="lai-suat-thuc-te-nhap" data-calc-region="form"',
    );
    expect(html).toContain('data-calc-region="result"');
    // Row 60 is a "Gọn" row: no 40/60 split for three controls.
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="lai-suat-thuc-te-ket-qua"');
    expect(html).toContain('aria-controls="lai-suat-thuc-te-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    // Compact form: no pinned restatement, so nothing is said twice.
    expect(html).not.toContain("fh-cta-pin");
  });

  it("marks the rate unusable at −100 and shows no result rows", async () => {
    const html = await render({ defaultRate: "-100" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.rateInvalid);
    const live = markupRegion(html, 'data-results-live="true"');
    // The placeholder, not a fabricated figure — and no table to compare.
    expect(live!).not.toContain("%,");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).not.toContain(EFFECTIVE_RATE.table.caption);
  });

  it("treats a blank rate as unusable rather than as zero", async () => {
    const html = await render({ defaultRate: "" });
    expect(html).toContain('aria-invalid="true"');
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).not.toContain(EFFECTIVE_RATE.table.caption);
  });

  it("accepts a valid zero, which is not a required-field error", async () => {
    const html = await render({ defaultRate: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("0,00%");
  });

  it("puts the actions after the answer and outside the live region", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("8,30%");
    expect(live!).not.toContain('data-test="actions"');
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
    expect(html.indexOf('data-test="next-steps"')).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});
