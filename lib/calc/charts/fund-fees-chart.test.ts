// Original row 27's visual, against the audit's independent fixture.
//
// The oracle was computed in plain JavaScript with no production import:
// initial 500 triệu, monthly end contribution 5 triệu, effective gross 6%,
// entry 1% on each payment, management 2% effective annual retention, exit
// 0,5% once at a 36-month horizon. Closed form: g = 1,06^(1/12),
// q = g × 0,98^(1/12), A(q,n) = (q^n − 1)/(q − 1), gross = 500m × g^n +
// 5m × A(g,n), before-exit net = 495m × q^n + 4,95m × A(q,n).
import { describe, expect, it } from "vitest";
import { computeFundFees } from "@/lib/calc/fund-fees";
import { fundFeesChartModel } from "./fund-fees-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Giá trị có phí và không phí, đến mốc bạn cần tiền",
  series: "{label}",
  xAxis: "Tháng",
  yAxis: "Giá trị ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Đến mốc đã chọn",
  tableHint: "Đọc hai dòng cuối cùng nhau.",
  periodColumn: "Tháng",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy kiểm tra lại số liệu.",
  grossPath: "Không phí",
  netPath: "Sau phí",
  exitMarker: "Mốc cần tiền: trừ phí bán {fee}",
  exitMarkerNone: "Mốc cần tiền",
  summary:
    "Đến tháng {months}: không phí {gross}, sau phí còn {net} — chênh {gap}.",
  gapNote: "Phí thu {fees}; khoảng cách là {gap}.",
  gapAboveFees: "Khoảng cách lớn hơn phí.",
  gapBelowFees: "Khoảng cách nhỏ hơn phí.",
  gapEqualsFees: "Hai con số bằng nhau.",
  exitNote: "Trước khi bán {beforeExit}; sau phí bán còn {afterExit}.",
  noFeeNote: "Không có phí nào nên hai đường trùng nhau.",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  paidRow: "Tổng đã nộp",
  grossRow: "Giá trị nếu không phí",
  beforeExitRow: "Giá trị trước khi bán",
  exitFeeRow: "Phí bán",
  afterExitRow: "Tiền nhận về",
  gapRow: "Khoảng cách giá trị",
  feesRow: "Tổng phí đã thu",
};

const INPUT = {
  initial: 500_000_000,
  monthlyContribution: 5_000_000,
  months: 36,
  grossReturnPercent: 6,
  entryFeePercent: 1,
  managementFeePercent: 2,
  exitFeePercent: 0.5,
};

describe("the engine matches the audit's independent closed form", () => {
  const r = computeFundFees(INPUT)!;

  it("walks both balances month by month", () => {
    expect(r.series).toHaveLength(37);
    expect(r.series[0]).toEqual({
      month: 0,
      gross: 500_000_000,
      net: 495_000_000,
    });
  });

  it("hits the oracle at months 12, 24 and 36", () => {
    const at = (month: number) => r.series.find((p) => p.month === month)!;
    expect(at(12).gross).toBeCloseTo(591_632_641.7101858, 4);
    expect(at(12).net).toBeCloseTo(574_655_069.9528188, 4);
    expect(at(24).gross).toBeCloseTo(688_763_241.9229832, 4);
    expect(at(24).net).toBeCloseTo(657_400_756.619807, 4);
    expect(at(36).gross).toBeCloseTo(791_721_678.148548, 4);
    expect(at(36).net).toBeCloseTo(743_356_975.9294744, 4);
  });

  it("charges the exit fee once, after the last drawn point", () => {
    // The distinction the whole figure exists to keep.
    expect(r.series.at(-1)!.net).toBeCloseTo(743_356_975.9294744, 4);
    expect(r.netValue).toBeCloseTo(739_640_191.049827, 4);
    expect(r.exitFee).toBeCloseTo(3_716_784.879647372, 4);
  });

  it("reports each charge and the wealth gap separately", () => {
    expect(r.totalContributed).toBe(680_000_000);
    expect(r.totalEntryFees).toBeCloseTo(6_800_000, 6);
    expect(r.totalManagementFees).toBeCloseTo(37_324_601.43786996, 4);
    expect(r.totalFees).toBeCloseTo(47_841_386.31751733, 4);
    // NOT equal: the gap includes the growth the fees would have produced.
    expect(r.valueLost).toBeCloseTo(52_081_487.09872103, 4);
    expect(r.valueLost).toBeGreaterThan(r.totalFees);
  });

  it("bounds the plan before the series allocates", () => {
    expect(computeFundFees({ ...INPUT, months: 1201 })).toBeNull();
    expect(computeFundFees({ ...INPUT, months: 1200 })).not.toBeNull();
  });
});

describe("the figure keeps the before-exit and after-exit figures apart", () => {
  const model = fundFeesChartModel(computeFundFees(INPUT)!, LABELS);

  it("draws two paths to the chosen horizon", () => {
    expect(model.series.map((s) => s.key)).toEqual(["gross", "net"]);
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.xMax).toBe(36);
    expect(model.unavailable).toBeNull();
  });

  it("ends the drawn line at the BEFORE-exit balance", () => {
    const net = model.series.find((s) => s.key === "net")!;
    expect(net.points.at(-1)!.value).toBeCloseTo(743_356_975.9294744, 4);
  });

  it("names the exit fee on a marker at the horizon", () => {
    expect(model.markers).toHaveLength(1);
    expect(model.markers[0].period).toBe(36);
    expect(model.markers[0].label).toContain("phí bán");
  });

  it("quotes the AFTER-exit figure as the money received", () => {
    expect(model.summary).toContain("sau phí còn 739.640.191 ₫");
    expect(model.summary).toContain("Trước khi bán 743.356.976 ₫");
  });

  it("leads with money, not with a percentage of forgone profit", () => {
    // Row 27: "đặt chênh lệch sau phí trước thuật ngữ".
    const firstNumber = model.summary.match(/[\d.]+ ₫/)?.[0];
    expect(firstNumber).toBeTruthy();
    expect(model.summary.indexOf("₫")).toBeLessThan(
      model.summary.indexOf("%") === -1 ? Infinity : model.summary.indexOf("%"),
    );
  });

  it("states both quantities and, on THIS fixture, which is larger", () => {
    expect(model.summary).toContain("Phí thu 47.841.386 ₫");
    expect(model.summary).toContain("khoảng cách là 52.081.487 ₫");
    expect(model.summary).toContain(LABELS.gapAboveFees);
    expect(model.summary).not.toContain(LABELS.gapBelowFees);
  });

  it("tabulates both endpoints on their own rows, in raw money", () => {
    const rows = new Map(
      model.table.rows.map((row) => [row[0] as string, row[1]]),
    );
    /**
     * A typed cell carries a RAW float, and the monthly loop reaches it by a
     * different route than the audit's closed form: 743.356.975,9294735
     * against 743.356.975,9294744, nine ten-millionths of a đồng apart from
     * float associativity. Asserting the cell with `toEqual` would pin one
     * spelling of that residue, so the check is kind plus a tolerance well
     * inside a đồng — the same treatment the suite already gives row 63's
     * 8e-9 discrepancy.
     */
    const money = (label: string, expected: number) => {
      const cell = rows.get(label) as { kind: string; value: number };
      expect(cell.kind, label).toBe("money");
      expect(cell.value, label).toBeCloseTo(expected, 4);
    };

    money(LABELS.beforeExitRow, 743_356_975.9294744);
    money(LABELS.afterExitRow, 739_640_191.049827);
    // The exit fee is a deduction and reads as one.
    money(LABELS.exitFeeRow, -3_716_784.879647372);
  });
});

describe("the no-fee and absent cases", () => {
  it("says the two paths coincide when no fee was entered", () => {
    const free = computeFundFees({
      ...INPUT,
      entryFeePercent: 0,
      managementFeePercent: 0,
      exitFeePercent: 0,
    })!;
    const model = fundFeesChartModel(free, LABELS);
    expect(free.totalFees).toBe(0);
    expect(model.summary).toContain(LABELS.noFeeNote);
    // No exit fee, so the marker names the date without inventing a charge.
    expect(model.markers[0].label).toBe(LABELS.exitMarkerNone);
    // And the fee-free path really is the savings answer at an EFFECTIVE 6%.
    expect(free.grossValue).toBeCloseTo(791_721_678.148548, 4);
  });

  it("withholds the plot with no result", () => {
    const model = fundFeesChartModel(null, LABELS);
    expect(model.series).toEqual([]);
    expect(model.unavailable).not.toBeNull();
  });
});

// The gap and the fees are two quantities, and NEITHER always dominates.
// Fixture reproduced on the live page by an independent review.
describe("the gap can be SMALLER than the fees, and the copy has to say so", () => {
  const FALLING = {
    initial: 500_000_000,
    monthlyContribution: 0,
    months: 12,
    grossReturnPercent: -50,
    entryFeePercent: 20,
    managementFeePercent: 0,
    exitFeePercent: 0,
  };

  it("charges 100 triệu of entry fee for a 50 triệu wealth gap", () => {
    const r = computeFundFees(FALLING)!;
    expect(r.grossValue).toBeCloseTo(250_000_000, 4);
    expect(r.netValue).toBeCloseTo(200_000_000, 4);
    expect(r.valueLost).toBeCloseTo(50_000_000, 4);
    expect(r.totalFees).toBeCloseTo(100_000_000, 4);
    expect(r.valueLost).toBeLessThan(r.totalFees);
    // No profit before fees, so there is no "share of profit lost" to quote.
    expect(r.profitLostPercent).toBeNull();
  });

  it("picks the falling-market sentence, never the growth one", () => {
    const model = fundFeesChartModel(computeFundFees(FALLING)!, LABELS);
    expect(model.summary).toContain(LABELS.gapBelowFees);
    expect(model.summary).not.toContain(LABELS.gapAboveFees);
    expect(model.summary).not.toContain(LABELS.gapEqualsFees);
  });

  it("calls them equal at a zero return, where they are one quantity", () => {
    const flat = computeFundFees({
      ...FALLING,
      grossReturnPercent: 0,
      entryFeePercent: 2,
    })!;
    expect(flat.valueLost).toBeCloseTo(flat.totalFees, 6);
    const model = fundFeesChartModel(flat, LABELS);
    expect(model.summary).toContain(LABELS.gapEqualsFees);
    expect(model.summary).not.toContain(LABELS.gapAboveFees);
    expect(model.summary).not.toContain(LABELS.gapBelowFees);
  });

  it("calls them equal at zero fees too, where both are zero", () => {
    const none = computeFundFees({
      ...FALLING,
      entryFeePercent: 0,
    })!;
    expect(none.totalFees).toBe(0);
    expect(none.valueLost).toBe(0);
    expect(fundFeesChartModel(none, LABELS).summary).toContain(
      LABELS.gapEqualsFees,
    );
  });
});
