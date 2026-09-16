import { describe, it, expect } from "vitest";
import {
  floatingChartModel,
  type FloatingChartLabels,
} from "@/lib/calc/charts/floating-chart";
import { buildPhases, computeFloatingLoan } from "@/lib/calc/floating-loan";
import { pmt } from "@/lib/calc/finance";
import { renderTableCell } from "@/lib/calc/table-cell";
import { TABLE_UI } from "@/content/calculators/table-ui";

const L: FloatingChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Khoản trả theo thời gian",
  paymentSeries: "Khoản trả mỗi tháng",
  budgetReference: "Ngân sách bạn nhập",
  resetMarker: "Tháng {n}",
  xAxis: "Tháng",
  yAxis: "Khoản trả ({unit})",
  summary:
    "Đầu {first}, cao nhất {highest} từ tháng {resetMonth}, tăng {change} ({changePercent}).",
  summaryFlat: "Khoản trả giữ ở {first} suốt kỳ hạn.",
  scenarioNote: "Đây là kịch bản bạn nhập, không phải báo giá ngân hàng.",
  budgetNote: "Đường ngân sách là số bạn tự nhập.",
  changePercentUndefined: "không xác định được tỷ lệ",
  assumptions: ["Lãi sau ưu đãi là giả định."],
  tableCaption: "Từng giai đoạn",
  phaseColumn: "Tháng",
  rateColumn: "Lãi suất",
  paymentColumn: "Khoản trả",
  unavailableReason: "Chưa tính được.",
  unavailableRecovery: "Kiểm tra lại số đã nhập.",
};

/**
 * Acceptance scenario 3: 2 tỷ over 240 months, 12 months at 7,5%, then 14%.
 *
 * The reference instalments are recomputed here from first principles rather
 * than read off the module, because the transition index is the thing most
 * likely to be off by one.
 */
const AMOUNT = 2_000_000_000;
const phases = buildPhases({
  termMonths: 240,
  promoMonths: 12,
  promoRatePercent: 7.5,
  postRatePercent: 14,
})!;
const result = computeFloatingLoan({ amount: AMOUNT, phases })!;

/** Balance after `months` of a level instalment at `annualRate`. */
function balanceAfter(
  months: number,
  principal: number,
  annualRate: number,
  totalMonths: number,
): number {
  const r = annualRate / 100 / 12;
  const payment = Math.abs(pmt(r, totalMonths, principal));
  const growth = (1 + r) ** months;
  return principal * growth - payment * ((growth - 1) / r);
}

describe("the acceptance scenario, recomputed independently", () => {
  it("puts the promotional instalment at 16,112 triệu", () => {
    const reference = Math.abs(pmt(7.5 / 100 / 12, 240, AMOUNT));
    expect(result.firstPayment).toBeCloseTo(reference, 6);
    expect(result.firstPayment).toBeCloseTo(16_112_000, -3);
  });

  it("re-amortizes the remaining balance over the remaining 228 months", () => {
    // The mechanic, checked rather than assumed: the balance after 12 months
    // at 7,5% spread over 228 months at 14%.
    const balance = balanceAfter(12, AMOUNT, 7.5, 240);
    const reference = Math.abs(pmt(14 / 100 / 12, 228, balance));
    expect(result.highestPayment).toBeCloseTo(reference, 4);
    expect(result.highestPayment).toBeCloseTo(24_554_087, 0);
  });

  it("puts the transition at month 13, not month 12", () => {
    // The off-by-one that matters: the promotional rate covers months 1–12, so
    // the new instalment is first paid in month 13.
    expect(result.phases[0].toMonth).toBe(12);
    expect(result.phases[1].fromMonth).toBe(13);
  });
});

describe("floatingChartModel", () => {
  const model = floatingChartModel(result, null, L);

  it("steps rather than sloping, because the payment jumps", () => {
    // A diagonal between two phase levels would draw a gradual climb that
    // does not happen to the borrower.
    expect(model.step).toBe(true);
  });

  it("draws one point per phase start plus a closing point", () => {
    const points = model.series[0].points;
    expect(points.map((p) => p.period)).toEqual([1, 13, 240]);
    expect(points[0].value).toBeCloseTo(result.firstPayment, 6);
    expect(points[1].value).toBeCloseTo(result.highestPayment, 6);
  });

  it("marks the reset month on the chart", () => {
    expect(model.markers).toHaveLength(1);
    expect(model.markers[0].period).toBe(13);
    expect(model.markers[0].label).toBe("Tháng 13");
  });

  it("states both instalments, the month and the change", () => {
    expect(model.summary).toContain("16,1 triệu");
    expect(model.summary).toContain("24,6 triệu");
    expect(model.summary).toContain("tháng 13");
    // 8,44 triệu of increase, 52,4% of the promotional instalment.
    expect(model.summary).toContain("8,4 triệu");
    expect(model.summary).toContain("52,4%");
  });

  it("says the scenario is the user's assumption, every time", () => {
    // Not left to the page: a rate the tool was given must never read as a
    // rate a bank quoted.
    expect(model.summary).toContain("không phải báo giá ngân hàng");
  });

  it("bounds the y axis from zero, so the jump is not exaggerated", () => {
    // Truncating the axis would turn a 52% rise into a picture of a 300% one.
    expect(model.yMin).toBe(0);
    expect(model.yMax).toBeGreaterThanOrEqual(result.highestPayment);
    expect(model.yAxis.ticks[0].label).toBe("0,0");
  });

  it("mirrors the phase table, rate for rate", () => {
    expect(model.table.rows).toHaveLength(2);
    expect(model.table.rows[0][0]).toBe("1–12");
    expect(model.table.rows[1][0]).toBe("13–240");
    // A RATE cell, not a money cell. This is the distinction that stops a
    // compact money unit from being applied to it: 7,5 divided by a million
    // would render "< 0,1" where the page must say "7,50%".
    expect(model.table.rows[0][1]).toEqual({
      kind: "percent",
      value: 7.5,
      dp: 2,
    });
    expect(model.table.rows[1][1]).toEqual({
      kind: "percent",
      value: 14,
      dp: 2,
    });
    expect(
      renderTableCell(model.table.rows[0][1], "compact", "trieu", TABLE_UI),
    ).toBe("7,50%");
    expect(
      renderTableCell(model.table.rows[0][1], "exact", "trieu", TABLE_UI),
    ).toBe("7,50%");
  });

  it("has no budget line unless one was supplied", () => {
    expect(model.references).toEqual([]);
    expect(model.summary).not.toContain("Đường ngân sách");
  });
});

describe("the budget line comes only from an explicit input", () => {
  it("draws it and labels it as the user's own number", () => {
    const model = floatingChartModel(result, 20_000_000, L);
    expect(model.references).toHaveLength(1);
    expect(model.references[0].value).toBe(20_000_000);
    expect(model.references[0].label).toContain("20.000.000 ₫");
    expect(model.summary).toContain("Đường ngân sách là số bạn tự nhập.");
  });

  it("keeps the line inside the plot when it exceeds the payments", () => {
    // A reference line drawn off the top of the chart is worse than none.
    const model = floatingChartModel(result, 60_000_000, L);
    expect(model.yMax).toBeGreaterThanOrEqual(60_000_000);
  });

  it("ignores a zero or negative budget rather than drawing at the axis", () => {
    expect(floatingChartModel(result, 0, L).references).toEqual([]);
    expect(floatingChartModel(result, -1, L).references).toEqual([]);
  });
});

describe("degenerate cases", () => {
  it("describes a flat rate as flat, with no invented shock", () => {
    const flatPhases = buildPhases({
      termMonths: 240,
      promoMonths: 0,
      promoRatePercent: 8.5,
      postRatePercent: 8.5,
    })!;
    const flat = computeFloatingLoan({ amount: AMOUNT, phases: flatPhases })!;
    const model = floatingChartModel(flat, null, L);
    expect(model.markers).toEqual([]);
    expect(model.summary).toContain("giữ ở");
    expect(model.summary).not.toContain("tăng");
  });

  it("does not divide by zero when the first instalment is zero", () => {
    // A 0% promotional period on a term long enough that the instalment is
    // still positive is the ordinary case, so the pathological one is forced:
    // `paymentShockPercent` is 0 by construction when firstPayment is 0, and
    // rendering that as "0,00%" beside a real increase would be false.
    const zeroFirst = {
      ...result,
      firstPayment: 0,
      paymentShock: result.highestPayment,
      paymentShockPercent: 0,
    };
    const model = floatingChartModel(zeroFirst, null, L);
    expect(model.summary).toContain("không xác định được tỷ lệ");
    expect(model.summary).not.toContain("0,0%");
  });

  it("explains a null result rather than drawing an empty axis", () => {
    const model = floatingChartModel(null, null, L);
    expect(model.unavailable).not.toBeNull();
    expect(model.unavailable!.recovery).toBe("Kiểm tra lại số đã nhập.");
    expect(model.series).toEqual([]);
    expect(model.markers).toEqual([]);
    expect(model.table.rows).toEqual([]);
  });

  it("handles a stepped scenario with several resets", () => {
    const stepped = buildPhases({
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      adjustEveryMonths: 12,
      adjustStepPoints: 0.5,
      rateCapPercent: 14,
    })!;
    const many = computeFloatingLoan({ amount: AMOUNT, phases: stepped })!;
    const model = floatingChartModel(many, null, L);
    expect(model.markers.length).toBeGreaterThan(5);
    // Markers are in ascending month order, so the chart's rules cannot cross.
    for (let i = 1; i < model.markers.length; i += 1) {
      expect(model.markers[i].period).toBeGreaterThan(
        model.markers[i - 1].period,
      );
    }
    // The first marker is the one the summary names.
    expect(model.summary).toContain(`tháng ${model.markers[0].period}`);
  });
});
