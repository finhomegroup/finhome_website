/**
 * The nominal-rate-versus-APR bars.
 *
 * Two things this has to get right beyond drawing: the axis is RATES and the
 * fee breakdown is MONEY, and the two must not be mixed on one scale; and the
 * three fee lines have to sum to the result's own `totalFees` exactly, or the
 * breakdown is double-counting something.
 */
import { describe, expect, it } from "vitest";
import { computeApr } from "@/lib/calc/apr";
import {
  aprRateBarsModel,
  type AprChartLabels,
} from "@/lib/calc/charts/apr-chart";
import { isMoneyCell } from "@/lib/calc/table-cell";

const L: AprChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Lãi hợp đồng so với APR",
  nominalBar: "Lãi hợp đồng",
  aprBar: "APR sau phí",
  payoffBar: "APR nếu tất toán ở tháng {n}",
  axis: "Lãi suất ({unit})",
  axisUnit: "%/năm",
  summary: "Hợp đồng {nominal}, APR {apr}, chênh {gap} điểm.",
  noFeeNote: "Chưa có phí nên hai cột bằng nhau.",
  modeledNote: "Mức mô hình hóa, không phải mức công bố.",
  assumptions: ["Lãi suất giữ nguyên suốt kỳ hạn."],
  tableCaption: "Lãi suất và phí",
  itemColumn: "Chỉ tiêu",
  rateColumn: "Lãi suất",
  amountColumn: "Số tiền",
  upfrontRow: "Phí trả ngay",
  pointsRow: "Phí theo phần trăm",
  financedRow: "Phí gộp vào gốc",
  netProceedsRow: "Thực nhận",
  unavailableReason: "Chưa tính được APR.",
  unavailableRecovery: "Hãy kiểm tra các ô đã nhập.",
};

const AMOUNT = 2_000_000_000;

describe("the rate bars", () => {
  const result = computeApr({
    amount: AMOUNT,
    annualRatePercent: 8.5,
    termMonths: 240,
    upfrontFees: 30_000_000,
  })!;
  const model = aprRateBarsModel(result, 8.5, AMOUNT, L);

  it("puts the contract rate and the modelled APR side by side", () => {
    expect(model.bars).toHaveLength(2);
    expect(model.bars[0].total).toBeCloseTo(8.5, 10);
    expect(Math.abs(model.bars[1].total - 8.7080971464)).toBeLessThan(1e-5);
    // The APR bar is the one the page is pointing at.
    expect(model.bars[1].emphasis).toBe(true);
    expect(model.bars[0].emphasis).toBe(false);
  });

  it("labels the axis and its ticks as RATES, not money", () => {
    expect(model.axis.label).toBe("Lãi suất (%/năm)");
    // Percentage points: a tick of 10 on this axis is 10%, not 10 đồng, and
    // the adapter formats it so the shared component cannot guess wrong.
    expect(model.axis.ticks).toHaveLength(5);
    expect(model.axis.ticks[4].label).toBe(model.axis.ticks[4].label);
    expect(model.max).toBeGreaterThanOrEqual(8.7080971464);
    expect(model.max).toBeLessThan(100);
  });

  it("states the gap, which is the fee expressed as a rate", () => {
    expect(model.summary).toContain("8,5000%");
    expect(model.summary).toContain("8,7081%");
    expect(model.summary).toContain("0,2081");
    expect(model.summary).toContain(L.modeledNote);
    expect(model.summary).not.toContain(L.noFeeNote);
  });

  it("sums the three fee lines to the result's own total, exactly", () => {
    const rows = model.table.rows;
    const amountOf = (label: string) => {
      const row = rows.find((cells) => cells[0] === label);
      const cell = row?.[2];
      return isMoneyCell(cell!) ? cell.value : Number.NaN;
    };
    const upfront = amountOf(L.upfrontRow);
    const points = amountOf(L.pointsRow);
    const financed = amountOf(L.financedRow);
    expect(upfront + points + financed).toBeCloseTo(result.totalFees, 6);
    expect(amountOf(L.netProceedsRow)).toBeCloseTo(result.netProceeds, 6);
  });

  it("keeps rates in the rate column and money in the money column", () => {
    for (const cells of model.table.rows) {
      const rate = cells[1];
      const amount = cells[2];
      // Never both: a row is either a rate or an amount.
      expect(rate === null || amount === null).toBe(true);
      if (amount !== null) expect(isMoneyCell(amount)).toBe(true);
      if (rate !== null) expect(typeof rate).toBe("string");
    }
  });
});

describe("a financed fee", () => {
  it("attributes it to the financed line and not to the cash one", () => {
    const result = computeApr({
      amount: AMOUNT,
      annualRatePercent: 8.5,
      termMonths: 240,
      financedFees: 30_000_000,
    })!;
    const model = aprRateBarsModel(result, 8.5, AMOUNT, L);
    const rows = model.table.rows;
    const amountOf = (label: string) => {
      const cell = rows.find((cells) => cells[0] === label)?.[2];
      return isMoneyCell(cell!) ? cell.value : Number.NaN;
    };
    expect(amountOf(L.financedRow)).toBeCloseTo(30_000_000, 6);
    expect(amountOf(L.upfrontRow)).toBeCloseTo(0, 6);
    // A financed fee is borrowed, so the proceeds are untouched.
    expect(amountOf(L.netProceedsRow)).toBeCloseTo(AMOUNT, 6);
  });
});

describe("a payoff month", () => {
  it("adds a third bar, named for the month", () => {
    const result = computeApr({
      amount: AMOUNT,
      annualRatePercent: 8.5,
      termMonths: 240,
      upfrontFees: 30_000_000,
      payoffMonths: 60,
    })!;
    const model = aprRateBarsModel(result, 8.5, AMOUNT, L);
    expect(model.bars).toHaveLength(3);
    expect(model.bars[2].label).toBe("APR nếu tất toán ở tháng 60");
    expect(Math.abs(model.bars[2].total - 8.8922737652)).toBeLessThan(1e-5);
    expect(model.max).toBeGreaterThanOrEqual(8.8922737652);
  });
});

describe("no fees, and nothing to draw", () => {
  it("says the two bars coincide rather than looking broken", () => {
    const result = computeApr({
      amount: AMOUNT,
      annualRatePercent: 8.5,
      termMonths: 240,
    })!;
    const model = aprRateBarsModel(result, 8.5, AMOUNT, L);
    expect(model.bars[0].total).toBeCloseTo(model.bars[1].total, 6);
    expect(model.summary).toContain(L.noFeeNote);
  });

  it("is 0 at a 0% rate with no fees, not an empty figure", () => {
    const result = computeApr({
      amount: AMOUNT,
      annualRatePercent: 0,
      termMonths: 240,
    })!;
    const model = aprRateBarsModel(result, 0, AMOUNT, L);
    expect(model.unavailable).toBeNull();
    expect(model.bars[1].total).toBeCloseTo(0, 6);
  });

  it("explains itself instead of drawing when there is no result", () => {
    const model = aprRateBarsModel(null, 8.5, AMOUNT, L);
    expect(model.unavailable).not.toBeNull();
    expect(model.bars).toEqual([]);
    expect(model.table.rows).toEqual([]);
  });

  it("explains itself when the solver declined a rate", () => {
    // Fees that swallow the loan: the loan figures are still real, but there
    // is no rate to draw.
    const result = computeApr({
      amount: AMOUNT,
      annualRatePercent: 8.5,
      termMonths: 1,
      upfrontFees: 1_900_000_000,
    });
    if (result !== null && result.aprPercent === null) {
      const model = aprRateBarsModel(result, 8.5, AMOUNT, L);
      expect(model.unavailable).not.toBeNull();
    }
    // And an invalid amount is refused outright.
    expect(aprRateBarsModel(result, 8.5, 0, L).unavailable).not.toBeNull();
  });
});
