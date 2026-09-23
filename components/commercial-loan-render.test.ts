/**
 * Rendered-markup contracts for `/cong-cu/vay-thuong-mai/` (audit CSV row 10).
 *
 * The action is "Đặt ba khoản phải trả cạnh nhau; nhấn khoản gốc cuối kỳ,
 * không chỉ tháng thông thường." Both halves are structural — which rows are
 * in the primary group, and which one of them is the emphasised figure — so
 * they are checkable in server-rendered HTML and nowhere else. Appearance is
 * not checked here and nothing in this file is a visual observation.
 */
import { describe, expect, it } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommercialLoanCalculator } from "@/components/commercial-loan-calculator";
import { COMMERCIAL_LOAN as C } from "@/content/calculators/commercial-loan";

const html = renderToStaticMarkup(
  createElement(CommercialLoanCalculator, {
    nextSteps: "NEXT-STEPS-MARKER",
  }),
);

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

describe("§8 row 10: three payments, and the balloon is the one emphasised", () => {
  it("keeps all three payments in the primary group", () => {
    const result = regionOf("result");
    // A single "khoản trả hằng tháng" would be true for neither stretch of
    // this loan, so all three stay together.
    expect(result).toContain(C.form.balloonResultLabel);
    expect(result).toContain(C.form.gracePaymentLabel);
    expect(result).toContain(C.form.amortizingPaymentLabel);
  });

  it("emphasises the end-of-term principal, not an ordinary month", () => {
    expect(html.split("md:text-3xl").length - 1).toBe(1);
    const emphasis = html.indexOf("md:text-3xl");
    const balloon = html.indexOf(C.form.balloonResultLabel);
    const grace = html.indexOf(C.form.gracePaymentLabel);
    expect(emphasis).toBeGreaterThan(balloon);
    expect(emphasis).toBeLessThan(grace);
  });

  it("gives the route a CTA pointing at its own answer", () => {
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain('aria-controls="vay-thuong-mai-ket-qua"');
  });

  it("keeps the next steps beside the answer and the table below it", () => {
    expect(regionOf("result")).toContain("NEXT-STEPS-MARKER");
    expect(regionOf("detail")).toContain("<table");
  });

  it("marks exactly one live region", () => {
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
