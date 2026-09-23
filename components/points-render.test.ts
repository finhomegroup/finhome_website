/**
 * Rendered-markup contracts for `/cong-cu/diem-chiet-khau/` (audit CSV row 14).
 *
 * The action is "Đặt phí trả trước, tiền giảm mỗi tháng và mốc hòa vốn cùng
 * một khối." What this file pins is WHICH REGION each figure is in. A browser
 * pass at 390 px then read six rows in the answer group, so the three measures
 * behind the verdict sit together at the top of the detail group instead —
 * one block, one region below the decision they explain. Appearance is not
 * checked here and nothing in this file is a visual observation.
 */
import { describe, expect, it } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PointsCalculator } from "@/components/points-calculator";
import { POINTS as C } from "@/content/calculators/points";

const html = renderToStaticMarkup(
  createElement(PointsCalculator, { nextSteps: "NEXT-STEPS-MARKER" }),
);

/**
 * One layout region's own markup, bounded by depth rather than by the next
 * marker — `markupRegion`'s docstring records the bugs a textual bound
 * produces, and `detail` is the last region, so a marker-to-marker slice would
 * run to the end of the document. The negative assertion below depends on that
 * bound being exact.
 */
const regionOf = (name: string): string => {
  const region = markupRegion(html, `data-calc-region="${name}"`);
  expect(region, name).not.toBeNull();
  return region ?? "";
};

describe("§8 row 14: the verdict at the reader's horizon leads alone", () => {
  it("answers with the verdict, the amount and the month, and no more", () => {
    const result = regionOf("result");
    expect(result).toContain(C.form.verdictLabel);
    expect(result).toContain(C.form.holdPositionLabel);
    // The horizon has to stay: a verdict without the month it was taken at
    // cannot be read against the simple break-even at all.
    expect(result).toContain(C.form.holdMonthsLabel);
    // The measures behind it are not co-equal answers.
    expect(result).not.toContain(C.form.costLabel);
    expect(result).not.toContain(C.form.monthlySavingLabel);
    expect(result).not.toContain(C.form.breakEvenLabel);
  });

  it("keeps those three measures in the labelled detail group, once", () => {
    const detail = regionOf("detail");
    expect(detail).toContain(C.form.detailTitle);
    for (const label of [
      C.form.costLabel,
      C.form.monthlySavingLabel,
      C.form.breakEvenLabel,
    ]) {
      expect(detail, label).toContain(label);
      // Once inside the region. Not counted over the whole document: the fee's
      // own form field carries the same words as its result label.
      expect(detail.split(label).length - 1, label).toBe(1);
    }
    // The 64-vs-60 reconciliation is not lost with the row: the break-even is
    // still labelled as the simple arithmetic, and `methodNotice` — which
    // argues the two figures are both true — is still shipped above the tool.
    expect(C.form.breakEvenLabel).toContain("kiểu đơn giản");
    expect(C.methodNotice).toContain("64 tháng");
  });

  it("emphasises the money at the reader's own horizon", () => {
    // The verdict word is prose, so the one emphasised figure is the position
    // at the horizon the reader entered — the number the verdict is about.
    expect(html.split("md:text-3xl").length - 1).toBe(1);
    const emphasis = html.indexOf("md:text-3xl");
    expect(emphasis).toBeGreaterThan(html.indexOf(C.form.holdPositionLabel));
    expect(emphasis).toBeLessThan(html.indexOf(C.form.holdMonthsLabel));
  });

  it("gives the route a CTA and keeps its next steps beside the answer", () => {
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain('aria-controls="diem-chiet-khau-ket-qua"');
    expect(regionOf("result")).toContain("NEXT-STEPS-MARKER");
  });

  it("marks exactly one live region", () => {
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
