import { describe, expect, it } from "vitest";
import { compareVehicleBudget } from "@/lib/calc/vehicle-budget";
import { vehicleBudgetModel } from "./vehicle-budget-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Ngân sách tháng có và không có khoản vay xe",
  axis: "Số tiền mỗi tháng ({unit})",
  assumptions: ["Số liệu đang là ví dụ."],
  tableCaption: "Phân bổ từng tháng",
  itemColumn: "Khoản",
  amountColumn: "Mỗi tháng",
  tableHint: "Thanh đầu là thu nhập, dùng làm mốc.",
  unavailableReason: "Chưa đủ dữ liệu để so hai phương án.",
  unavailableRecovery: "Hãy nhập thu nhập thực nhận và chi phí thiết yếu.",
  unknownReason: "Chưa tính được khoản trả nợ xe.",
  unknownRecovery: "Hãy sửa giá xe, lãi suất và kỳ hạn.",
  brokenReason: "Các khoản đã nhập đã lớn hơn thu nhập ngay khi chưa có xe.",
  brokenRecovery: "Hãy kiểm tra lại thu nhập và chi phí thiết yếu.",
  incomeBar: "Thu nhập thực nhận",
  withoutBar: "Phân bổ — chưa mua xe",
  withBar: "Phân bổ — sau khi mua xe",
  essentials: "Chi phí thiết yếu",
  otherDebts: "Nợ khác đang trả",
  reserve: "Để dành đều mỗi tháng",
  payment: "Trả nợ xe",
  running: "Chi phí vận hành xe",
  leftover: "Còn lại",
  shortfallRow: "Thiếu mỗi tháng",
  summaryBalanced:
    "Thu nhập {income}. Chưa mua xe còn {without}; sau khi mua còn {with}. Khoảng cách {gap}.",
  summaryShortfall:
    "Thu nhập {income}. Chưa mua xe còn {without}; sau khi mua THIẾU {shortfall}. Khoảng cách {gap}.",
  limitedNote: "Chưa nhập chi phí thiết yếu.",
  runningExcludedNote: "Chưa tính chi phí vận hành.",
  upfrontNote: "Tiền trả trước và xe đổi không nằm trong bảng tháng này.",
};

const PAYMENT = 8_498_817.884507332;

const BALANCED = compareVehicleBudget({
  netIncome: 40_000_000,
  essentialExpenses: 22_000_000,
  otherDebts: 3_000_000,
  reserveSaving: 3_000_000,
  vehiclePayment: PAYMENT,
})!;

describe("vehicleBudgetModel on a month that balances", () => {
  const model = vehicleBudgetModel(BALANCED, LABELS);

  it("draws three bars: the income mark, then the two months", () => {
    expect(model.bars.map((bar) => bar.key)).toEqual([
      "income",
      "without",
      "with",
    ]);
  });

  it("totals the net income on all three bars when the month balances", () => {
    // The vehicle moves money between segments; it does not change the income.
    expect(model.bars[0].total).toBe(40_000_000);
    expect(model.bars[1].total).toBe(40_000_000);
    expect(model.bars[2].total).toBeCloseTo(40_000_000, 6);
  });

  it("puts the instalment in the with-car bar and nowhere else", () => {
    expect(model.bars[1].segments.map((s) => s.key)).toEqual([
      "essentials",
      "otherDebts",
      "reserve",
      "leftover",
    ]);
    expect(model.bars[2].segments.map((s) => s.key)).toEqual([
      "essentials",
      "otherDebts",
      "reserve",
      "payment",
      "leftover",
    ]);
  });

  it("emphasises the bar the reader is deciding about", () => {
    expect(model.bars[0].emphasis).toBeUndefined();
    expect(model.bars[1].emphasis).toBeUndefined();
    expect(model.bars[2].emphasis).toBe(true);
  });

  it("states the income, both residuals and the gap in the summary", () => {
    expect(model.summary).toContain("Thu nhập 40,0 triệu");
    expect(model.summary).toContain("còn 12,0 triệu");
    expect(model.summary).toContain("sau khi mua còn 3,5 triệu");
    expect(model.summary).toContain("Khoảng cách 8,5 triệu");
  });

  it("always says the upfront cash is not in this table", () => {
    // Cash spent on a car is cash no longer available for a home deposit, and
    // a MONTHLY ledger cannot show that.
    expect(model.summary).toContain(LABELS.upfrontNote);
  });

  it("discloses that running costs are excluded", () => {
    expect(model.summary).toContain(LABELS.runningExcludedNote);
  });

  it("does not claim the essentials are unknown when they were supplied", () => {
    expect(model.summary).not.toContain(LABELS.limitedNote);
  });

  it("leaves no shortfall row in the table", () => {
    expect(
      model.table.rows.some((row) => row[0] === LABELS.shortfallRow),
    ).toBe(false);
  });

  it("carries the reading instruction for three comparable bars", () => {
    expect(model.table.hint).toBe(LABELS.tableHint);
  });

  it("names the income mark in the legend, ahead of the segments", () => {
    expect(model.legend.map((entry) => entry.key)).toEqual([
      "income",
      "essentials",
      "otherDebts",
      "reserve",
      "payment",
      "leftover",
    ]);
  });
});

/**
 * The deficit case, and the arithmetic the first version got wrong.
 *
 * An independent review found the figure saying "2 triệu before, 0 after, gap
 * 8,5 triệu" on exactly this fixture — because the summary printed
 * `max(0, withCar)`. The exact rows underneath correctly showed −6.498.818 ₫.
 */
describe("vehicleBudgetModel when the vehicle breaks the month", () => {
  const short = compareVehicleBudget({
    netIncome: 30_000_000,
    essentialExpenses: 22_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: PAYMENT,
  })!;
  const model = vehicleBudgetModel(short, LABELS);

  it("draws no leftover segment rather than clamping the deficit to zero", () => {
    expect(model.bars[2].segments.map((s) => s.key)).toEqual([
      "essentials",
      "otherDebts",
      "reserve",
      "payment",
    ]);
  });

  it("leaves the with-car bar LONGER than the income, by the shortfall", () => {
    // The module used to claim the bar "stops at the income". It does not:
    // 22 + 3 + 3 + 8,498818 is 36.498.818 ₫ against a 30.000.000 ₫ income,
    // and the overhang IS the shortfall. Trimming the instalment to fit would
    // have deleted a real expense to make the totals agree.
    expect(model.bars[0].total).toBe(30_000_000);
    expect(model.bars[1].total).toBe(30_000_000);
    expect(model.bars[2].total).toBeCloseTo(36_498_817.884507332, 6);
    expect(model.bars[2].total - model.bars[0].total).toBeCloseTo(
      6_498_817.884507332,
      6,
    );
  });

  it("says THIẾU with the real magnitude, never 'còn 0'", () => {
    expect(model.summary).toContain("THIẾU 6,5 triệu");
    expect(model.summary).not.toContain("còn 0 ₫");
  });

  it("keeps the summary's own arithmetic coherent", () => {
    // 2 triệu before, 6,5 triệu short after: the gap between the two legs is
    // 2 − (−6,5) = 8,5, which is the vehicle's monthly cost. The clamped
    // version claimed 2 → 0 with a gap of 8,5, which is not arithmetic.
    expect(model.summary).toContain("còn 2,0 triệu");
    expect(model.summary).toContain("Khoảng cách 8,5 triệu");
    expect(short.withoutCar - short.withCar!).toBeCloseTo(
      short.difference!,
      6,
    );
  });

  it("carries the shortfall as its own table row, in raw đồng", () => {
    const row = model.table.rows.at(-1)!;
    expect(row[0]).toBe(LABELS.shortfallRow);
    expect(row[1]).toEqual({ kind: "money", value: 6_498_817.884507332 });
  });

  it("agrees with the engine's own signed residual", () => {
    // The table and the raw engine value cannot disagree: both are −6,50.
    expect(short.withCar).toBeCloseTo(-6_498_817.884507332, 6);
    expect(short.shortfallAmount).toBeCloseTo(6_498_817.884507332, 6);
  });
});

describe("vehicleBudgetModel withholds the figure, with the reason for it", () => {
  it("has nothing to draw without a result", () => {
    const model = vehicleBudgetModel(null, LABELS);
    expect(model.unavailable).toEqual({
      reason: LABELS.unavailableReason,
      recovery: LABELS.unavailableRecovery,
    });
    expect(model.bars).toEqual([]);
  });

  it("withholds the comparison when the instalment could not be priced", () => {
    // Not a two-bar picture a reader could mistake for the answer, and above
    // all not a zero-cost car — see `vehicle-budget.ts`'s docstring.
    const unknown = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      otherDebts: 3_000_000,
      reserveSaving: 3_000_000,
      vehiclePayment: null,
    })!;
    const model = vehicleBudgetModel(unknown, LABELS);
    expect(model.bars).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: LABELS.unknownReason,
      recovery: LABELS.unknownRecovery,
    });
    // `ChartFigure` renders `summary` as the text equivalent, so it must carry
    // the specific reason rather than the generic one.
    expect(model.summary).toBe(LABELS.unknownReason);
  });

  it("gives the broken month its own reason, distinct from the other two", () => {
    const broken = compareVehicleBudget({
      netIncome: 20_000_000,
      essentialExpenses: 22_000_000,
      vehiclePayment: 1_000_000,
    })!;
    expect(broken.shortfallWithoutVehicle).toBe(true);
    const model = vehicleBudgetModel(broken, LABELS);
    expect(model.unavailable).toEqual({
      reason: LABELS.brokenReason,
      recovery: LABELS.brokenRecovery,
    });
  });

  it("distinguishes all three withheld states by their sentences", () => {
    const reasons = new Set([
      LABELS.unavailableReason,
      LABELS.unknownReason,
      LABELS.brokenReason,
    ]);
    expect(reasons.size).toBe(3);
  });
});

describe("a valid cash purchase is still drawn", () => {
  it("draws three bars whose with-car leg equals the without-car leg", () => {
    // Payment of 0 is a STATEMENT, not an absence: the two months coincide and
    // that is the honest answer for a buyer paying outright.
    const cash = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      otherDebts: 3_000_000,
      reserveSaving: 3_000_000,
      vehiclePayment: 0,
    })!;
    const model = vehicleBudgetModel(cash, LABELS);
    expect(model.unavailable).toBeNull();
    expect(model.bars).toHaveLength(3);
    expect(model.bars[1].total).toBe(model.bars[2].total);
    expect(model.summary).toContain("Khoảng cách 0 ₫");
  });
});

describe("unknown essential costs", () => {
  it("says so on the figure itself, not only further down the page", () => {
    const limited = compareVehicleBudget({
      netIncome: 40_000_000,
      otherDebts: 3_000_000,
      vehiclePayment: PAYMENT,
    })!;
    const model = vehicleBudgetModel(limited, LABELS);
    expect(model.summary).toContain(LABELS.limitedNote);
    // No essentials segment at all: a zero segment would claim a figure.
    expect(model.bars[1].segments.map((s) => s.key)).toEqual([
      "otherDebts",
      "leftover",
    ]);
  });
});

describe("running costs, once entered", () => {
  it("get their own segment, their own legend entry and no exclusion note", () => {
    const withRunning = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      otherDebts: 3_000_000,
      reserveSaving: 3_000_000,
      vehiclePayment: PAYMENT,
      vehicleRunningCosts: 2_500_000,
    })!;
    const model = vehicleBudgetModel(withRunning, LABELS);
    expect(model.bars[2].segments.map((s) => s.key)).toContain("running");
    expect(model.legend.map((e) => e.key)).toContain("running");
    expect(model.summary).not.toContain(LABELS.runningExcludedNote);
    // The gap is now the instalment PLUS the running costs.
    expect(model.summary).toContain("Khoảng cách 11,0 triệu");
  });
});
