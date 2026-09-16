// Original row 15's "waterfall tiền thuê → chi phí → trả nợ".
//
// The ledger identity this file exists to pin: the last step's remainder is
// the engine's own `cashFlowPerYear`. A deduction counted twice, or one added
// back into the rent, is then a failing test rather than a plausible picture.
import { describe, expect, it } from "vitest";
import { computeRentalProperty } from "@/lib/calc/rental-property";
import { formatMoney } from "@/lib/calc/number";
import { rentalWaterfallModel } from "./rental-waterfall-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Tiền thuê một năm đi những đâu",
  axis: "Số tiền ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Sổ tiền thuê một năm",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy nhập tiền thuê.",
  grossBar: "Tiền thuê đủ 12 tháng",
  netBar: "Dòng tiền còn lại",
  remainingSegment: "Còn lại",
  deductedSegment: "Bị trừ ở bước này",
  cashSegment: "Tiền còn về tay bạn",
  deficitBar: "Phải bù thêm",
  deficitSegment: "Phần phải bù thêm",
  coveredSegment: "Tiền thuê trả được",
  uncoveredSegment: "Tiền thuê không trả nổi",
  stepFormat: "− {charge} {amount}",
  stepRemainingFormat: "còn {remaining}",
  stepShortfallFormat: "thiếu {shortfall}",
  vacancyStep: "Mất do trống",
  taxStep: "Thuế cho thuê",
  expensesStep: "Chi phí vận hành",
  debtStep: "Trả nợ vay",
  vatRow: "trong đó: thuế GTGT",
  pitRow: "trong đó: thuế TNCN phải nộp",
  pitReliefRow: "trong đó: đã giảm 30% thuế TNCN",
  noiRow: "Lợi nhuận vận hành",
  shortfallRow: "Thiếu so với khoản trả nợ",
  shortfallOperatingRow: "Thiếu so với thuế và chi phí",
  summary: "Thuê {gross}; trừ {deducted}; còn {cash}.",
  shortfallNote: "Còn {available}, nợ {debt}, thiếu {shortfall}.",
  shortfallOperatingNote:
    "Không vay. Thu {collected}, thuế và chi phí {costs}, thiếu {shortfall}.",
  noTaxNote: "Chưa vượt ngưỡng GTGT.",
  noDebtNote: "Mua bằng tiền tươi.",
  chargeColumn: "Khoản",
  remainingColumn: "Còn lại",
  tableHint: "Đọc từ trên xuống.",
};

/** The page's own shipped defaults. */
const INPUT = {
  price: 3_000_000_000,
  downPayment: 1_200_000_000,
  purchaseCosts: 150_000_000,
  annualRatePercent: 9,
  termMonths: 240,
  monthlyRent: 15_000_000,
  vacancyPercent: 5,
  monthlyExpenses: 2_000_000,
};

const cellValue = (cell: unknown): number =>
  typeof cell === "object" && cell !== null && "value" in cell
    ? (cell as { value: number }).value
    : Number.NaN;

describe("the bridge on the page's own defaults", () => {
  const result = computeRentalProperty(INPUT)!;
  const model = rentalWaterfallModel(result, LABELS);

  it("opens on a full year at full occupancy", () => {
    expect(model.bars[0].key).toBe("gross");
    expect(model.bars[0].total).toBe(180_000_000);
  });

  it("gives each deduction its own step, in ledger order", () => {
    // No tax step: the default rent is below the threshold, and a zero step
    // would be a bar claiming a charge nobody was billed.
    expect(model.bars.map((bar) => bar.key)).toEqual([
      "gross",
      "after-vacancy",
      "after-expenses",
      "after-debt",
      // The year is short, so the closing bar is the deficit.
      "deficit",
    ]);
    // 180 triệu of collected rent is far below the 1 tỷ threshold, so no tax
    // step — and a zero step would be a bar claiming a charge nobody was
    // billed.
    expect(result.taxable).toBe(false);
    expect(result.pitApplies).toBe(false);
    expect(model.summary).toContain(LABELS.noTaxNote);
  });

  it("starts each COVERED step where the one above it ended", () => {
    // A step bar's TOTAL is the balance BEFORE its deduction …
    const totals = model.bars.map((bar) => bar.total);
    expect(totals[1]).toBe(180_000_000);
    expect(totals[2]).toBeCloseTo(171_000_000, 4);
    // … except the short one, where the CHARGE sets the length, because the
    // charge is bigger than the money that was there. That is the honest
    // picture and the reason the step splits into covered/uncovered.
    expect(totals[3]).toBeCloseTo(result.debtServicePerYear, 4);
    expect(totals[3]).toBeGreaterThan(147_000_000);
  });

  it("draws each deduction as its own segment, not as a gap", () => {
    for (const bar of model.bars.slice(1, 4)) {
      expect(bar.segments.map((s) => s.key)).toContain("deducted");
    }
  });

  it("lands the last step on the engine's own cash flow", () => {
    // The ledger identity. These defaults are cash-NEGATIVE, so the closing
    // bar is the DEFICIT rather than cash in hand.
    expect(result.cashFlowPerYear).toBeLessThan(0);
    expect(model.bars.some((bar) => bar.key === "net")).toBe(false);
    const rows = model.table.rows;
    const shortfall = rows.find((row) => row[0] === LABELS.shortfallRow)!;
    expect(cellValue(shortfall[1])).toBeCloseTo(result.cashFlowPerYear, 4);
    expect(model.summary).toContain("thiếu");
  });

  it("DRAWS the deficit, on the same axis as every other bar", () => {
    // The repair: the first version clamped this step at zero and put the
    // deficit in prose, so the figure that decides the whole question was
    // not in the picture. Now it is a bar, measurable against the rent bar.
    const deficit = model.bars.find((bar) => bar.key === "deficit")!;
    expect(deficit).toBeDefined();
    expect(deficit.total).toBeCloseTo(-result.cashFlowPerYear, 4);
    expect(deficit.emphasis).toBe(true);
    expect(deficit.segments.map((s) => s.key)).toEqual(["deficit"]);
    // Same scale: the axis holds it, and it is NOT labelled as cash.
    expect(model.max).toBeGreaterThanOrEqual(deficit.total);
    expect(deficit.label).toBe(LABELS.deficitBar);
    expect(deficit.label).not.toBe(LABELS.netBar);
  });

  it("splits the short step into what the rent covered and what it did not", () => {
    const debtStep = model.bars.find((bar) => bar.key === "after-debt")!;
    const covered = debtStep.segments.find((s) => s.key === "deducted")!;
    const uncovered = debtStep.segments.find((s) => s.key === "deficit")!;
    // No kept slice: nothing survives this step.
    expect(debtStep.segments.some((s) => s.key === "remaining")).toBe(false);
    // Exact reconciliation, all three ways.
    expect(covered.value).toBeCloseTo(result.netOperatingIncomePerYear, 4);
    expect(uncovered.value).toBeCloseTo(-result.cashFlowPerYear, 4);
    expect(covered.value + uncovered.value).toBeCloseTo(
      result.debtServicePerYear,
      4,
    );
    expect(debtStep.total).toBeCloseTo(result.debtServicePerYear, 4);
    // The step's own figure is an UNSIGNED magnitude with the word.
    expect(debtStep.totalLabel).toContain("thiếu");
    expect(debtStep.totalLabel).not.toContain("−");
  });

  it("reconciles the three figures in the summary too", () => {
    // The house formatter, never `toLocaleString` (docs §4).
    const money = (value: number) => `${formatMoney(value)} ₫`;
    expect(model.summary).toContain(
      `Còn ${money(result.netOperatingIncomePerYear)}`,
    );
    expect(model.summary).toContain(`nợ ${money(result.debtServicePerYear)}`);
    expect(model.summary).toContain(
      `thiếu ${money(-result.cashFlowPerYear)}`,
    );
  });

  it("tabulates the running balance, including the negative end", () => {
    const remainders = model.table.rows
      .slice(1, 4)
      .map((row) => cellValue(row[2]));
    expect(remainders[0]).toBeCloseTo(171_000_000, 4);
    expect(remainders[1]).toBeCloseTo(147_000_000, 4);
    expect(remainders[2]).toBeCloseTo(result.cashFlowPerYear, 4);
  });
});

describe("a taxed, cash-positive plan", () => {
  // 1,08 tỷ of collected rent, which is over the 1 tỷ threshold for both
  // taxes; a big deposit, so the year still ends positive.
  const INPUT_TAXED = {
    ...INPUT,
    downPayment: 2_800_000_000,
    monthlyRent: 90_000_000,
    vacancyPercent: 0,
  };
  const result = computeRentalProperty(INPUT_TAXED)!;
  const model = rentalWaterfallModel(result, LABELS);

  it("draws ONE tax step but tabulates the two bases separately", () => {
    expect(result.taxable).toBe(true);
    expect(model.bars.map((bar) => bar.key)).toContain("after-tax");
    const rows = model.table.rows;
    const vat = rows.find((row) => row[0] === LABELS.vatRow)!;
    const pit = rows.find((row) => row[0] === LABELS.pitRow)!;
    expect(cellValue(vat[1])).toBeCloseTo(-result.vatPerYear, 4);
    expect(cellValue(pit[1])).toBeCloseTo(-result.pitPerYear, 4);
    // And the two "trong đó" rows sum to the single drawn tax step.
    expect(result.vatPerYear + result.pitAfterReliefPerYear).toBeCloseTo(
      result.rentalTaxPerYear,
      6,
    );
  });

  it("closes with the answer as its own bar", () => {
    expect(result.cashFlowPerYear).toBeGreaterThan(0);
    const net = model.bars.find((bar) => bar.key === "net")!;
    expect(net.total).toBeCloseTo(result.cashFlowPerYear, 4);
    expect(net.emphasis).toBe(true);
    expect(model.summary).not.toContain("Thiếu");
  });

  it("states the year's own figures exactly, never compacted", () => {
    // A summary comparing two near amounts must not round its own terms.
    expect(model.summary).toContain("1.080.000.000 ₫");
  });

  it("charges 54 triệu of VAT and 4 triệu of PIT at 1,08 tỷ", () => {
    // The fixture the source review supplied, against the 1 tỷ defaults.
    expect(result.vatPerYear).toBeCloseTo(54_000_000, 6);
    expect(result.pitPerYear).toBeCloseTo(4_000_000, 6);
    expect(result.rentalTaxPerYear).toBeCloseTo(58_000_000, 6);
  });
});

// Three ledger cases source review reproduced against this adapter.
describe("the tax rows reconcile with the step above them", () => {
  const cellOf = (row: unknown[], index: number) =>
    (row[index] as { value: number }).value;
  const rowNamed = (model: ReturnType<typeof rentalWaterfallModel>, label: string) =>
    model.table.rows.find((row) => row[0] === label);

  it("reports PIT AFTER a declared relief, so 54 + 2,8 = 56,8", () => {
    const r = computeRentalProperty({
      ...INPUT,
      downPayment: 3_000_000_000,
      monthlyRent: 90_000_000,
      vacancyPercent: 0,
      monthlyExpenses: 0,
      pitReliefPercent: 30,
    })!;
    expect(r.vatPerYear).toBeCloseTo(54_000_000, 6);
    expect(r.pitPerYear).toBeCloseTo(4_000_000, 6);
    expect(r.pitAfterReliefPerYear).toBeCloseTo(2_800_000, 6);
    expect(r.rentalTaxPerYear).toBeCloseTo(56_800_000, 6);

    const model = rentalWaterfallModel(r, LABELS);
    const vat = rowNamed(model, LABELS.vatRow)!;
    const pit = rowNamed(model, LABELS.pitRow)!;
    expect(cellOf(vat, 1)).toBeCloseTo(-54_000_000, 6);
    // The defect: this used to be the PRE-relief 4 triệu, so the two rows
    // summed to 58 triệu under a 56,8 triệu step.
    expect(cellOf(pit, 1)).toBeCloseTo(-2_800_000, 6);
    expect(-cellOf(vat, 1) + -cellOf(pit, 1)).toBeCloseTo(
      r.rentalTaxPerYear,
      6,
    );
    // And the relief is stated, so the 2,8 is checkable against the 4.
    const relief = rowNamed(model, LABELS.pitReliefRow)!;
    expect(cellOf(relief, 1)).toBeCloseTo(1_200_000, 6);
    // The drawn tax step is the after-relief total.
    const taxStep = model.bars.find((bar) => bar.key === "after-tax")!;
    expect(
      taxStep.segments.find((s) => s.key === "deducted")!.value,
    ).toBeCloseTo(56_800_000, 4);
  });

  it("breaks down a PIT-ONLY plan, which the VAT gate used to hide", () => {
    // 600 triệu of revenue: under the 1 tỷ VAT gate, over a 100 triệu
    // allocated PIT deduction. 25 triệu of PIT is owed and none of it was
    // itemised, because the row list was gated on `taxable`.
    const r = computeRentalProperty({
      ...INPUT,
      downPayment: 3_000_000_000,
      monthlyRent: 50_000_000,
      vacancyPercent: 0,
      monthlyExpenses: 0,
      pitThresholdPerYear: 100_000_000,
    })!;
    expect(r.effectiveRentPerYear).toBe(600_000_000);
    expect(r.taxable).toBe(false);
    expect(r.vatPerYear).toBe(0);
    expect(r.pitApplies).toBe(true);
    expect(r.pitPerYear).toBeCloseTo(25_000_000, 6);

    const model = rentalWaterfallModel(r, LABELS);
    expect(rowNamed(model, LABELS.vatRow)).toBeUndefined();
    const pit = rowNamed(model, LABELS.pitRow)!;
    expect(cellOf(pit, 1)).toBeCloseTo(-25_000_000, 6);
    // A tax step IS drawn, so the summary must not say no tax applies.
    expect(model.bars.map((b) => b.key)).toContain("after-tax");
    expect(model.summary).not.toContain(LABELS.noTaxNote);
  });

  it("does not blame debt for a shortfall with NO loan", () => {
    // Paid in cash, and the running costs alone exceed the rent.
    const r = computeRentalProperty({
      ...INPUT,
      downPayment: 3_000_000_000,
      monthlyRent: 10_000_000,
      monthlyExpenses: 15_000_000,
    })!;
    expect(r.debtServicePerYear).toBe(0);
    expect(r.cashFlowPerYear).toBeLessThan(0);

    const model = rentalWaterfallModel(r, LABELS);
    expect(model.summary).toContain("Không vay");
    expect(model.summary).not.toContain("nợ ");
    // The deficit is still drawn, and its row does not name an instalment.
    expect(model.bars.some((bar) => bar.key === "deficit")).toBe(true);
    expect(rowNamed(model, LABELS.shortfallOperatingRow)).toBeDefined();
    expect(rowNamed(model, LABELS.shortfallRow)).toBeUndefined();
  });
});

describe("cash purchase and refusals", () => {
  it("omits the debt step and says why", () => {
    const cash = computeRentalProperty({
      ...INPUT,
      downPayment: 3_000_000_000,
    })!;
    const model = rentalWaterfallModel(cash, LABELS);
    expect(model.bars.map((bar) => bar.key)).not.toContain("after-debt");
    expect(model.summary).toContain(LABELS.noDebtNote);
    expect(model.bars.at(-1)!.key).toBe("net");
  });

  it("withholds the figure with no rent to walk from", () => {
    const empty = computeRentalProperty({ ...INPUT, monthlyRent: 0 })!;
    const model = rentalWaterfallModel(empty, LABELS);
    expect(model.unavailable).not.toBeNull();
    expect(model.bars).toEqual([]);
  });

  it("withholds the figure with no result at all", () => {
    expect(rentalWaterfallModel(null, LABELS).unavailable).not.toBeNull();
  });
});
