import { describe, it, expect } from "vitest";
import {
  costBarsModel,
  paymentTimelineModel,
  referenceInstalment,
  type CompareCostLabels,
  type ComparePaymentLabels,
} from "@/lib/calc/charts/compare-chart";
import { compareLoans } from "@/lib/calc/loan-compare";

const WORDS = { currency: "₫", million: "triệu", billion: "tỷ" };
const OPTIONS = ["Phương án A", "Phương án B", "Phương án C"] as const;

const COST: CompareCostLabels = {
  ...WORDS,
  title: "Chi phí vay",
  principalSegment: "Số tiền vay",
  interestSegment: "Lãi",
  feeSegment: "Phí thu trước",
  balanceSegment: "Dư nợ còn lại",
  axis: "Tiền ({unit})",
  summary: "Tháng {horizon}: {option} rẻ nhất ({cost}); chênh {spread}.",
  rankedOnNote: "Xếp theo lãi cộng phí.",
  winnerChangesNote: "Cả kỳ hạn thì {fullTermOption} rẻ hơn {horizonOption}.",
  exclusionNote: "Chưa tính ưu đãi, bảo hiểm và phí tất toán sớm.",
  assumptions: ["Cùng một số tiền vay."],
  tableCaption: "Bảng chi phí",
  optionColumn: "Phương án",
  interestColumn: "Lãi",
  feeColumn: "Phí",
  balanceColumn: "Dư nợ",
  costColumn: "Chi phí đến mốc",
  fullTermCostColumn: "Chi phí cả kỳ hạn",
  unavailableReason: "Cần ít nhất hai phương án.",
  unavailableRecovery: "Nhập lãi suất và kỳ hạn cho phương án thứ hai.",
};

const PAY: ComparePaymentLabels = {
  ...WORDS,
  title: "Khoản trả mỗi tháng",
  xAxis: "Tháng",
  yAxis: "Khoản trả ({unit})",
  summary: "{lowestOption} trả thấp nhất ({lowest}); rẻ nhất là {cheapestOption}.",
  monthlyIsNotCostNote: "Trả ít mỗi tháng không có nghĩa là vay rẻ hơn.",
  resetNote: "{count} phương án có bậc khi hết ưu đãi.",
  horizonMarker: "Tháng {n}: mốc so sánh",
  exclusionNote: "Chưa tính ưu đãi, bảo hiểm và phí tất toán sớm.",
  assumptions: ["Cùng một số tiền vay."],
  tableCaption: "Bảng khoản trả",
  optionColumn: "Phương án",
  paymentColumn: "Khoản trả",
  resetPaymentColumn: "Sau ưu đãi",
  monthsColumn: "Số tháng",
  unavailableReason: "Cần ít nhất hai phương án.",
  unavailableRecovery: "Nhập lãi suất và kỳ hạn cho phương án thứ hai.",
};

const AMOUNT = 2_000_000_000;

/** Acceptance scenario 5: identical loans, one with a 1% fee. */
const FEE_ONLY = compareLoans({
  amount: AMOUNT,
  options: [
    { annualRatePercent: 8.5, termMonths: 240, feePercent: 0 },
    { annualRatePercent: 8.5, termMonths: 240, feePercent: 1 },
  ],
})!;

/** The trade the page exists for: a longer term is lighter but dearer. */
const TERM_TRADE = compareLoans({
  amount: AMOUNT,
  options: [
    { annualRatePercent: 8.5, termMonths: 240, feePercent: 0 },
    { annualRatePercent: 8.5, termMonths: 300, feePercent: 0 },
  ],
})!;

describe("the fee-only acceptance scenario", () => {
  it("gives both options the same instalment and a 20 triệu fee gap", () => {
    const [a, b] = FEE_ONLY.rows;
    expect(a!.monthlyPayment).toBeCloseTo(b!.monthlyPayment, 6);
    expect(b!.upfrontFee).toBeCloseTo(20_000_000, 6);
    expect(FEE_ONLY.spread).toBeCloseTo(20_000_000, 6);
    expect(FEE_ONLY.bestIndex).toBe(0);
  });

  it("shows the fee as its own visible segment", () => {
    // A fee folded into "cost" would make two visually identical bars.
    const model = costBarsModel(FEE_ONLY, OPTIONS, COST);
    expect(model.bars[0].segments.map((s) => s.key)).toEqual([
      "principal",
      "interest",
    ]);
    expect(model.bars[1].segments.map((s) => s.key)).toEqual([
      "principal",
      "interest",
      "fee",
    ]);
    expect(
      model.bars[1].segments.find((s) => s.key === "fee")!.value,
    ).toBeCloseTo(20_000_000, 6);
  });

  it("declares no monthly-only winner", () => {
    const model = paymentTimelineModel(FEE_ONLY, OPTIONS, PAY);
    // Equal instalments: ties resolve to the first, and the note keeps the
    // reader from reading a tie as equivalence.
    expect(model.summary).toContain(
      "Trả ít mỗi tháng không có nghĩa là vay rẻ hơn.",
    );
  });
});

describe("costBarsModel", () => {
  const model = costBarsModel(TERM_TRADE, OPTIONS, COST);

  it("shows the principal repaid so a bar is not read as a smaller loan", () => {
    // Measured at the horizon now. `TERM_TRADE` has no horizon of its own, so
    // it defaults to the longest term — where the principal repaid IS the
    // whole loan, to within float residue, and nothing is still owed.
    for (const bar of model.bars) {
      expect(bar.segments[0].key).toBe("principal");
      expect(Math.abs(bar.segments[0].value - AMOUNT)).toBeLessThan(0.01);
      expect(bar.segments.some((segment) => segment.key === "balance")).toBe(
        false,
      );
    }
  });

  it("shows the debt still owed as a segment at a short horizon", () => {
    // The measure that stops an offer looking cheap by deferring principal.
    const short = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 8.5, termMonths: 300 },
      ],
      horizonMonths: 60,
    })!;
    const shortModel = costBarsModel(short, OPTIONS, COST);
    for (const [index, bar] of shortModel.bars.entries()) {
      const balance = bar.segments.find((segment) => segment.key === "balance");
      expect(balance, String(index)).toBeDefined();
      expect(balance!.value).toBeGreaterThan(0);
      // The bar totals principal + interest + fee + balance = amount + cost.
      expect(bar.total).toBeCloseTo(
        AMOUNT + short.rows[index]!.horizonCost,
        4,
      );
    }
    // The longer term has repaid less by month 60, so it still owes more.
    expect(
      shortModel.bars[1].segments.find((s) => s.key === "balance")!.value,
    ).toBeGreaterThan(
      shortModel.bars[0].segments.find((s) => s.key === "balance")!.value,
    );
  });

  it("sums each bar to principal plus the cost of borrowing", () => {
    TERM_TRADE.rows.forEach((row, index) => {
      if (row === null) return;
      expect(model.bars[index].total).toBeCloseTo(
        AMOUNT + row.costOfBorrowing,
        6,
      );
    });
  });

  it("marks the option ranked cheapest, and says what the rank is on", () => {
    expect(model.bars[TERM_TRADE.bestIndex].emphasis).toBe(true);
    expect(model.summary).toContain("Xếp theo lãi cộng phí.");
  });

  it("never calls an option best or names a lender", () => {
    // The comparison is between the user's own quotes; the tool has no view
    // on who they came from.
    expect(model.summary.toLowerCase()).not.toContain("tốt nhất");
    expect(model.summary.toLowerCase()).not.toContain("ngân hàng");
  });

  it("states the costs the model does not carry", () => {
    // `compareLoans` prices one upfront fee and one fixed rate. Anything else
    // in a real quote is excluded, and saying so is part of the model.
    expect(model.summary).toContain(
      "Chưa tính ưu đãi, bảo hiểm và phí tất toán sớm.",
    );
  });

  it("mirrors the comparison into the table, to the đồng", () => {
    // The RAW figure, unrounded: the table renders it compactly and exactly
    // from the same number, so anything rounded here would be rounded in both
    // readings and could never be reconciled against a statement.
    expect(model.table.rows).toHaveLength(2);
    expect(model.table.rows[0][0]).toBe("Phương án A");
    TERM_TRADE.rows.forEach((row, index) => {
      if (row === null) return;
      // Horizon measures, then the full-term sum, each under its own heading.
      expect(model.table.rows[index][1]).toEqual({
        kind: "money",
        value: row.horizonInterest,
      });
      expect(model.table.rows[index][2]).toEqual({
        kind: "money",
        value: row.upfrontFee,
      });
      expect(model.table.rows[index][3]).toEqual({
        kind: "money",
        value: row.horizonBalance,
      });
      expect(model.table.rows[index][4]).toEqual({
        kind: "money",
        value: row.horizonCost,
      });
      expect(model.table.rows[index][5]).toEqual({
        kind: "money",
        value: row.costOfBorrowing,
      });
    });
  });

  it("skips an option that could not be priced, keeping the others aligned", () => {
    const partial = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 9, termMonths: 240 },
        { annualRatePercent: -1, termMonths: 0 },
      ],
    })!;
    const model2 = costBarsModel(partial, OPTIONS, COST);
    expect(model2.bars).toHaveLength(2);
    expect(model2.bars.map((b) => b.label)).toEqual([
      "Phương án A",
      "Phương án B",
    ]);
  });

  it("explains a comparison with nothing to compare", () => {
    const none = compareLoans({
      amount: AMOUNT,
      options: [{ annualRatePercent: 8.5, termMonths: 240 }],
    });
    expect(none).toBeNull();
    const model2 = costBarsModel(none, OPTIONS, COST);
    expect(model2.unavailable).not.toBeNull();
    expect(model2.unavailable!.recovery).toContain("phương án thứ hai");
    expect(model2.bars).toEqual([]);
  });
});

describe("paymentTimelineModel", () => {
  const model = paymentTimelineModel(TERM_TRADE, OPTIONS, PAY);

  it("draws each option over its OWN term", () => {
    // Different end points are the visible form of "these are not the same
    // commitment".
    expect(model.series[0].points.map((p) => p.period)).toEqual([1, 240]);
    expect(model.series[1].points.map((p) => p.period)).toEqual([1, 300]);
    expect(model.xMax).toBe(300);
  });

  it("takes its levels from computeLoan, not from its own arithmetic", () => {
    expect(model.series[0].points[0].value).toBeCloseTo(
      referenceInstalment(AMOUNT, 8.5, 240)!,
      6,
    );
    expect(model.series[1].points[0].value).toBeCloseTo(
      referenceInstalment(AMOUNT, 8.5, 300)!,
      6,
    );
  });

  it("ranks the lightest instalment opposite to the cheapest loan", () => {
    // The lesson, asserted: the 300-month option is lighter monthly and
    // dearer overall, so the two charts point at different options.
    const lighter = TERM_TRADE.rows[1]!;
    const cheaper = TERM_TRADE.rows[TERM_TRADE.bestIndex]!;
    expect(lighter.monthlyPayment).toBeLessThan(cheaper.monthlyPayment);
    expect(lighter.costOfBorrowing).toBeGreaterThan(cheaper.costOfBorrowing);
    expect(model.summary).toContain("Phương án B trả thấp nhất");
    expect(model.summary).toContain("rẻ nhất là Phương án A");
  });

  it("gives each option a distinct stroke, so colour is not the only cue", () => {
    expect(model.series[0].stroke).toBe("solid");
    expect(model.series[1].stroke).toBe("dashed");
    const three = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 9, termMonths: 240 },
        { annualRatePercent: 8, termMonths: 300 },
      ],
    })!;
    const model3 = paymentTimelineModel(three, OPTIONS, PAY);
    expect(model3.series.map((s) => s.stroke)).toEqual([
      "solid",
      "dashed",
      "dotted",
    ]);
  });

  it("preserves a third option rather than dropping it", () => {
    const three = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 9, termMonths: 240 },
        { annualRatePercent: 8, termMonths: 300 },
      ],
    })!;
    expect(paymentTimelineModel(three, OPTIONS, PAY).series).toHaveLength(3);
    expect(costBarsModel(three, OPTIONS, COST).bars).toHaveLength(3);
  });

  it("holds the level flat, so the line is a step not a slope", () => {
    expect(model.step).toBe(true);
    for (const series of model.series) {
      expect(series.points[0].value).toBeCloseTo(series.points[1].value, 6);
    }
  });

  it("bounds the payment axis from zero", () => {
    expect(model.yMin).toBe(0);
    expect(model.yMax).toBeGreaterThanOrEqual(
      Math.max(...model.series.map((s) => s.points[0].value)),
    );
  });

  it("explains a comparison with nothing to compare", () => {
    const model2 = paymentTimelineModel(null, OPTIONS, PAY);
    expect(model2.unavailable).not.toBeNull();
    expect(model2.series).toEqual([]);
  });
});
