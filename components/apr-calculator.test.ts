/**
 * Rendered-markup contracts for /cong-cu/apr/ and /cong-cu/apr-nang-cao/.
 *
 * One component serves both routes, which is what most of this file is about:
 * the mode is a control on the page, so the two URLs must not borrow each
 * other's region ids, and the figures must not depend on which mode is open.
 *
 * Server-rendered with `renderToStaticMarkup` in the runner's existing `node`
 * environment. Nothing here is a visual check — docs §6's rule stands.
 */
import { describe, expect, it } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AprCalculator, type AprMode } from "@/components/apr-calculator";
import { AprAdvancedCalculator } from "@/components/apr-advanced-calculator";
import { APR } from "@/content/calculators/apr";
import { APR_ADVANCED } from "@/content/calculators/apr-advanced";

const C = APR.form;
const A = APR_ADVANCED.form;

const view = (initialMode: AprMode, props?: { nextSteps?: ReactNode }) =>
  renderToStaticMarkup(
    createElement(AprCalculator, { initialMode, ...props }),
  );

/**
 * One layout region's own markup, bounded by depth rather than by the next
 * marker — `markupRegion`'s docstring records the bugs a textual bound
 * produces, and `detail` is the last region, so a marker-to-marker slice would
 * run to the end of the document.
 */
const regionOf = (html: string, name: string): string => {
  const region = markupRegion(html, `data-calc-region="${name}"`);
  expect(region, name).not.toBeNull();
  return region ?? "";
};

describe("§8 rows 8 and 9: the APR is the answer", () => {
  it("emphasises the APR and puts the typed rate under it", () => {
    const html = view("basic");
    expect((html.match(/md:text-3xl/g) ?? []).length).toBe(1);
    // The emphasised value belongs to the APR row: it falls between that
    // row's label and the contract-rate row's.
    expect(html.indexOf("md:text-3xl")).toBeGreaterThan(
      html.indexOf(C.aprLabel),
    );
    expect(html.indexOf("md:text-3xl")).toBeLessThan(
      html.indexOf(C.nominalLabel),
    );
  });

  it("keeps four decimals in the summary and in the pinned line", () => {
    // "Dễ đọc" is hierarchy, not fewer digits: the spread this tool exists to
    // show is a fraction of a point, so the summary keeps the precision and
    // the CTA repeats the SAME formatted string.
    const html = view("basic");
    const apr = html.match(/\d+,\d{4}%/g) ?? [];
    expect(apr.length).toBeGreaterThan(0);
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
    expect(pinned).toContain(apr[0]);
  });

  it("wires each route's CTA to its own answer", () => {
    const basic = view("basic");
    expect(basic).toContain('id="apr-nhap"');
    expect(basic).toContain('id="apr-ket-qua"');
    expect(basic).toContain('aria-controls="apr-ket-qua"');
    expect(regionOf(basic, "form")).toContain('data-calc-cta="true"');
    expect(basic).not.toContain("apr-nang-cao-ket-qua");

    const advanced = view("advanced");
    expect(advanced).toContain('id="apr-nang-cao-nhap"');
    expect(advanced).toContain('aria-controls="apr-nang-cao-ket-qua"');
  });

  it("keeps the region ids of the ROUTE, not of the open mode", () => {
    // A reader who switches to the detailed mode on /cong-cu/apr/ is still on
    // /cong-cu/apr/, so the anchor must not move under them. The wrapper route
    // is the only thing that decides the ids.
    const wrapper = renderToStaticMarkup(
      createElement(AprAdvancedCalculator, null),
    );
    expect(wrapper).toContain('id="apr-nang-cao-ket-qua"');
    expect(wrapper).not.toContain('id="apr-ket-qua"');
  });

  it("holds the fees in one expandable group beside the form", () => {
    // ALREADY SATISFIED before this batch, asserted rather than rebuilt: row
    // 9's "gom phí thành nhóm mở rộng" is this one panel, and the payoff month
    // stays a primary field outside it.
    const form = regionOf(view("advanced"), "form");
    expect(form).toContain(A.feeAllocationTitle);
    expect(form).toContain(A.payoffLabel);
    expect(form.indexOf(A.payoffLabel)).toBeLessThan(
      form.indexOf(A.feeAllocationTitle),
    );
    expect(form).toContain(A.appraisalLabel);
  });

  it("keeps the payoff APR and the settlement horizon beside the answer", () => {
    // Row 9's "giữ APR và giả định tất toán cạnh form".
    const result = regionOf(view("advanced"), "result");
    expect(result).toContain(A.payoffAprLabel);
    expect(result).toContain(A.horizonTitle);
    expect(result).toContain(A.settlementFeeNotice);
  });

  it("leaves the fee detail and the full precision to open", () => {
    // Row 8's second clause, also already satisfied: the effective rate and
    // the fee figures are in the disclosure, not in the summary.
    const detail = regionOf(view("basic"), "detail");
    expect(detail).toContain(C.detailDisclosureTitle);
    expect(detail).toContain(C.effectiveLabel);
    expect(detail).toContain(C.totalFeesLabel);
    expect(detail).toContain(C.pointsCostLabel);
    expect(regionOf(view("basic"), "result")).not.toContain(C.effectiveLabel);
  });

  it("puts the route's next steps and the cross-route links together", () => {
    const html = view("basic", {
      nextSteps: createElement("p", null, "BƯỚC TIẾP THEO"),
    });
    const result = regionOf(html, "result");
    expect(result).toContain("BƯỚC TIẾP THEO");
    expect(result).toContain(C.crossRouteNote);
    expect(result.indexOf(C.crossRouteNote)).toBeLessThan(
      result.indexOf("BƯỚC TIẾP THEO"),
    );
  });

  it("keeps exactly one live results region in both modes", () => {
    for (const mode of ["basic", "advanced"] as const) {
      const html = view(mode);
      expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
    }
  });

  it("reports the same APR in both modes", () => {
    // Mode is presentation. The detailed view adds rows; it must not change
    // the rate, because both modes feed the same fields to the same engine.
    const basic = view("basic").match(/\d+,\d{4}%/g) ?? [];
    const advanced = view("advanced").match(/\d+,\d{4}%/g) ?? [];
    expect(basic[0]).toBe(advanced[0]);
  });
});
