import { afterEach, describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { REFINANCE as C } from "@/content/calculators/refinance";
import { CALCULATOR_COPY } from "@/content/calculators/shared";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { LineChart } from "@/components/calc/chart/line-chart";
import { refinanceChartModel } from "@/lib/calc/charts/refinance-chart";
import { compareRefinance } from "@/lib/calc/refinance";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { PLOT, yFor } from "@/lib/calc/charts/geometry";
import { readFileSync } from "node:fs";

async function render(patch: Partial<Record<keyof typeof C.form, string>> = {}) {
  vi.resetModules();
  vi.doMock("@/content/calculators/refinance", () => ({ REFINANCE: { ...C, form: { ...C.form, ...patch } } }));
  const { RefinanceCalculator } = await import("@/components/refinance-calculator");
  return renderToStaticMarkup(createElement(RefinanceCalculator));
}
afterEach(() => { vi.doUnmock("@/content/calculators/refinance"); vi.resetModules(); });

describe("refinance actual SSR component contracts, not browser proof", () => {
  it("uses one live result region, one hidden SVG, typed charttable and disclosed fees", async () => {
    const html = await render();
    expect(html.match(/data-results-live="true"/g)).toHaveLength(1);
    expect(html).toContain("180.064.623 ₫");
    expect(html).toContain("271.787.072 ₫");
    expect(html).toContain(C.chart.tableHint);
    expect(html.indexOf(C.chart.tableHint)).toBeLessThan(html.indexOf("<table"));
    expect(html).toContain('aria-hidden="true" focusable="false"');
    expect(html).toContain('open=""');
    expect(html).toContain(C.form.oldFeeLabel);
    expect(html).toContain(C.form.costsLabel);
    expect(html).toContain("20.000.000 ₫");
    expect(html).toContain("Số tiền: triệu đồng");
    expect(html).toContain("<dl");
    expect(html).not.toContain("Infinity");
    expect(html).not.toContain("NaN");
    const source = readFileSync("components/refinance-calculator.tsx", "utf8");
    expect(source.indexOf("</ResultGroup>")).toBeLessThan(source.indexOf("<ChartFigure"));
    expect(source).toContain("onReset={fields.reset}");
    expect(source).toContain('parseCount(fields.values.horizon)');
  });
  it.each([
    { defaultBalance: "" }, { defaultCurrentRate: "" }, { defaultNewRate: "" },
    { defaultRemaining: "3.0" }, { defaultNewTerm: "3.0" }, { defaultHorizon: "3.0" },
    { defaultCosts: "" }, { defaultOldFee: "" }, { defaultHorizon: "1201" },
  ])("invalid fields clear figures, SVG and all data tables: %o", async (patch) => {
    const html = await render(patch);
    expect(html).not.toContain("180.064.623");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<table");
    expect(html).not.toContain("<dl");
    expect(html).toContain(C.chart.unavailableRecovery);
    expect(html).toContain('aria-invalid="true"');
    expect(html.match(/data-results-live="true"/g)).toHaveLength(1);
  });
  it("rebuilds after invalid and displays independent fixture A with signed cost", async () => {
    await render({ defaultHorizon: "" });
    const html = await render({ defaultCurrentRate: "8,5", defaultRemaining: "120", defaultNewTerm: "240" });
    expect(html).toContain("-147.461.455 ₫");
    expect(html).toContain("406.440.386 ₫");
    expect(html).toContain("<svg");
    expect(html).toContain("<table");
    expect(html).toContain(C.form.noBreakEven);
  });
  it("period zero shows paid upfront fees and a singleton chartpoint", async () => {
    const html = await render({ defaultHorizon: "0" });
    expect(html).toContain("-40.000.000 ₫");
    expect(html).toContain("<circle");
  });
  it("zero fees disclose the assumption, zero rates remain valid", async () => {
    const html = await render({ defaultCosts: "0", defaultOldFee: "0", defaultCurrentRate: "0", defaultNewRate: "0" });
    expect(html).toContain(C.form.feesNone);
    expect(html).toContain(C.form.zeroBreakEven);
    expect(html).not.toContain('aria-invalid="true"');
  });
  it("signed axis renders its zero line at middle and passes yMin to paths", () => {
    const m = refinanceChartModel(compareRefinance({ balance: 2e9, currentRatePercent: 11, remainingMonths: 216, newRatePercent: 8.5, newTermMonths: 300, closingCosts: 40e6, horizonMonths: 60 }), { ...CHART_UI.money, ...C.chart });
    const html = renderToStaticMarkup(createElement(LineChart, { model: m }));
    expect(html).toContain('y1="89" y2="89" class="stroke-ink-2"');
    // Both ledgers are drawn, each with its own stroke, and each starts at
    // the −40 triệu of fees BELOW the zero rule. The coordinate is derived
    // from the model rather than pinned: the axis magnitude now covers both
    // series, so a hardcoded y would only pin the older single-line scale.
    const startY = yFor(-40e6, m.yMax, PLOT, m.yMin).toFixed(2).replace(/\.?0+$/, "");
    expect(m.series).toHaveLength(2);
    expect(html).toContain(`d="M 42 ${startY}`);
    expect(yFor(-40e6, m.yMax, PLOT, m.yMin)).toBeGreaterThan(89);
    expect((html.match(/<path /g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('stroke-dasharray="6 4"');
  });
  it("refinance disclaimer includes modeled fees without changing shared default", () => {
    const own = renderToStaticMarkup(createElement(CalculatorDisclaimer, { text: C.disclaimer }));
    const shared = renderToStaticMarkup(createElement(CalculatorDisclaimer));
    expect(own).toContain("Đã tính các phí trả ngay bạn nhập");
    expect(own).not.toContain("Kết quả không trừ thuế, phí");
    expect(shared).toContain(CALCULATOR_COPY.disclaimer);
    expect(readFileSync("app/cong-cu/tai-cap-von/page.tsx", "utf8")).toContain("disclaimer={C.disclaimer}");
  });
});
