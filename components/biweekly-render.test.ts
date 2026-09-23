/**
 * Rendered-markup contracts for `/cong-cu/tra-no-hai-tuan/` (audit CSV row 16).
 *
 * The action is "Giữ form gọn; làm nổi bật thời gian và tiền lãi tiết kiệm,
 * tách chi tiết lịch trả." A "Gọn" row, so the check that matters is that the
 * layout stayed SINGLE-column while the answer gained a hierarchy and the two
 * schedule groups moved out of it. Appearance is not checked here and nothing
 * in this file is a visual observation.
 */
import { describe, expect, it } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BiweeklyCalculator } from "@/components/biweekly-calculator";
import { BIWEEKLY as C } from "@/content/calculators/biweekly";

const html = renderToStaticMarkup(createElement(BiweeklyCalculator));

/**
 * One layout region's own markup, bounded by depth rather than by the next
 * marker — `markupRegion`'s docstring records the bugs a textual bound
 * produces, and `detail` is the last region, so a marker-to-marker slice would
 * run to the end of the document.
 */
const regionOf = (name: string): string => {
  const region = markupRegion(html, `data-calc-region="${name}"`);
  expect(region, name).not.toBeNull();
  return region ?? "";
};

describe("§8 row 16: a compact form, the saving emphasised", () => {
  it("stays one column", () => {
    // The "Gọn" classification is the point: this route must not pick up the
    // two-column grid just because most of its neighbours did.
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("leads with the interest saved and the time saved", () => {
    const result = regionOf("result");
    expect(result).toContain(C.form.savingLabel);
    expect(result).toContain(C.form.monthsSavedLabel);
    expect(html.split("md:text-3xl").length - 1).toBe(1);
    const emphasis = html.indexOf("md:text-3xl");
    expect(emphasis).toBeGreaterThan(html.indexOf(C.form.savingLabel));
    expect(emphasis).toBeLessThan(html.indexOf(C.form.monthsSavedLabel));
  });

  it("moves the schedule comparisons into the detail region", () => {
    const detail = regionOf("detail");
    expect(detail).toContain(C.form.extraPaymentSavingLabel);
    expect(detail).toContain(C.form.payoffLabel);
    expect(regionOf("result")).not.toContain(C.form.payoffLabel);
  });

  it("gives the route a CTA pointing at its own answer", () => {
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain('aria-controls="tra-no-hai-tuan-ket-qua"');
  });

  it("marks exactly one live region", () => {
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
