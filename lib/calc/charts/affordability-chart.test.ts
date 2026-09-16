import { describe, it, expect } from "vitest";
import {
  monthlyAllocationModel,
  priceCompositionModel,
  type MonthlyAllocationLabels,
  type PriceCompositionLabels,
} from "@/lib/calc/charts/affordability-chart";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";

const WORDS = { currency: "₫", million: "triệu", billion: "tỷ" };

const PRICE: PriceCompositionLabels = {
  ...WORDS,
  title: "Giá",
  priceBar: "Giá nhà",
  cashSegment: "Tiền của bạn",
  loanSegment: "Vay",
  costsSegment: "Chi phí mua",
  otherCashBar: "Không vào giá",
  unusedCashSegment: "Còn lại chưa dùng",
  capacityBar: "Gánh được",
  usedCapacitySegment: "Đang dùng",
  unusedCapacitySegment: "Chưa dùng được",
  axis: "Tiền ({unit})",
  summary: "Giá {price}: tiền {cash}, vay {loan}.",
  financingBoundNote: "Bị chặn bởi tiền tự có.",
  costsExcludedNote: "Chưa tính chi phí mua.",
  limitedNote: "Chưa có chi phí sinh hoạt.",
  blockedReason: "Chưa có tầm giá khả thi.",
  blockedRecovery: "Tích lũy thêm hoặc hạ chi phí mua.",
  assumptions: ["Lãi suất không đổi."],
  tableCaption: "Bảng giá",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  unavailableReason: "Chưa tính được.",
  unavailableRecovery: "Kiểm tra lại.",
};

const ALLOC: MonthlyAllocationLabels = {
  ...WORDS,
  title: "Tháng",
  householdBar: "Thu nhập thực nhận",
  essentials: "Sinh hoạt",
  debts: "Nợ đang trả",
  buffer: "Dự phòng",
  housing: "Trả nhà",
  otherHousing: "Chi phí nhà ở khác",
  leftover: "Còn lại",
  ceilingBar: "Trần ngân hàng",
  housingLimitBar: "Giới hạn trả nợ nhà",
  totalDebtLimitBar: "Giới hạn tổng nợ",
  axis: "Tiền ({unit})",
  summaryHousehold:
    "Chặn bởi {binding}, ngân sách {budget}, trả nhà {payment}.",
  headroomNote: "Còn {headroom} chưa dùng.",
  summaryCeiling: "Ngân hàng cho {payment}.",
  bindingHousing: "giới hạn trả nợ nhà",
  bindingTotalDebt: "giới hạn tổng nợ",
  bindingHousehold: "ngân sách hộ",
  infeasibleNote: "Chưa còn chỗ cho khoản vay.",
  limitedNote: "Chưa có chi phí sinh hoạt.",
  ceilingIsNotBudgetNote: "Trần ngân hàng không phải ngân sách sống.",
  assumptions: ["Lãi suất không đổi."],
  tableCaption: "Bảng tháng",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  unavailableReason: "Chưa tính được.",
  unavailableRecovery: "Kiểm tra lại.",
};

const CEILING_INPUT: AffordabilityInput = {
  monthlyIncome: 50_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
};

const HOUSEHOLD_INPUT: AffordabilityInput = {
  ...CEILING_INPUT,
  mode: "household",
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
};

const ceiling = computeAffordability(CEILING_INPUT)!;
const household = computeAffordability(HOUSEHOLD_INPUT)!;

describe("priceCompositionModel", () => {
  const model = priceCompositionModel(ceiling, PRICE);

  it("splits the price into the cash that reaches the seller and the loan", () => {
    const bar = model.bars[0];
    expect(bar.segments.map((s) => s.key)).toEqual(["cash", "loan"]);
    expect(bar.segments[0].value).toBeCloseTo(ceiling.cashToPrice, 6);
    expect(bar.segments[1].value).toBeCloseTo(ceiling.maxLoan, 6);
  });

  it("adds up to exactly the price the module computed", () => {
    // A composition chart whose segments do not sum to the headline is the
    // clearest possible form of chart-disagrees-with-result.
    expect(model.bars[0].total).toBeCloseTo(ceiling.maxPrice, 6);
  });

  it("says purchase costs are excluded when they are", () => {
    // Silence here would let a buyer read the price as all-in.
    expect(model.summary).toContain("Chưa tính chi phí mua.");
  });

  it("separates money that never reaches the price into its own bar", () => {
    const withCosts = computeAffordability({
      ...CEILING_INPUT,
      cashReserve: 100_000_000,
      purchaseCostPercent: 5,
    })!;
    const model2 = priceCompositionModel(withCosts, PRICE);
    const held = model2.bars.find((bar) => bar.key === "otherCash")!;
    expect(held).toBeDefined();
    expect(held.segments.map((s) => s.key)).toContain("costs");
    // The reserve is NOT in usableCash, so this bar carries the purchase
    // costs and any cash the envelope left unspent — and the whole ledger
    // closes against the loan plus the usable cash.
    expect(model2.bars[0].total + held.total).toBeCloseTo(
      withCosts.maxLoan + withCosts.usableCash,
      4,
    );
    expect(model2.summary).not.toContain("Chưa tính chi phí mua.");
  });

  it("never draws a negative segment, because there is no longer one to hide", () => {
    // The reported defect: no cash and a 5% cost rate produced −228 triệu of
    // equity, which the chart hid by dropping the segment. The model now has
    // no feasible price at all here, and says so.
    const broken = computeAffordability({
      monthlyIncome: 50_000_000,
      monthlyDebts: 0,
      annualRatePercent: 0,
      termMonths: 240,
      downPayment: 0,
      purchaseCostPercent: 5,
    })!;
    const model2 = priceCompositionModel(broken, PRICE);
    expect(model2.unavailable).not.toBeNull();
    expect(model2.unavailable!.reason).toBe("Chưa có tầm giá khả thi.");
    expect(model2.unavailable!.recovery).toBe(
      "Tích lũy thêm hoặc hạ chi phí mua.",
    );
    expect(model2.bars).toEqual([]);
    // No bar anywhere may carry a negative value.
    for (const bar of model2.bars) {
      for (const seg of bar.segments) expect(seg.value).toBeGreaterThanOrEqual(0);
    }
  });

  it("shows the borrowing the cash cannot reach, instead of dropping it", () => {
    // The other half of the same defect: when the cash caps the price, the
    // payment could service a much larger loan. That gap is now a bar, so the
    // buyer can see the constraint is the deposit, not their income.
    const capped = computeAffordability({
      ...CEILING_INPUT,
      downPayment: 100_000_000,
      purchaseCostPercent: 5,
    })!;
    expect(capped.priceBinding).toBe("financing");
    const model2 = priceCompositionModel(capped, PRICE);
    const capacity = model2.bars.find((bar) => bar.key === "capacity")!;
    expect(capacity).toBeDefined();
    expect(capacity.segments.map((s) => s.key)).toEqual([
      "usedCapacity",
      "unusedCapacity",
    ]);
    expect(capacity.total).toBeCloseTo(capped.paymentSupportedLoan, 4);
    expect(model2.summary).toContain("Bị chặn bởi tiền tự có.");
  });

  it("omits the capacity bar when the payment is what binds", () => {
    // Nothing to explain, so no third bar.
    const model2 = priceCompositionModel(ceiling, PRICE);
    expect(model2.bars.find((bar) => bar.key === "capacity")).toBeUndefined();
    expect(model2.summary).not.toContain("Bị chặn bởi tiền tự có.");
  });

  it("carries the limited-conclusion warning into the picture itself", () => {
    const limited = computeAffordability({
      ...HOUSEHOLD_INPUT,
      essentialExpenses: undefined,
    })!;
    expect(priceCompositionModel(limited, PRICE).summary).toContain(
      "Chưa có chi phí sinh hoạt.",
    );
  });

  it("draws nothing, with a reason, when there is no price", () => {
    const broke = computeAffordability({
      ...CEILING_INPUT,
      monthlyDebts: 40_000_000,
      downPayment: 0,
    })!;
    expect(broke.maxPrice).toBe(0);
    const model2 = priceCompositionModel(broke, PRICE);
    expect(model2.unavailable).not.toBeNull();
    expect(model2.bars).toEqual([]);
  });

  it("drops a zero segment rather than drawing a bar of nothing", () => {
    const noCash = computeAffordability({ ...CEILING_INPUT, downPayment: 0 })!;
    const model2 = priceCompositionModel(noCash, PRICE);
    expect(model2.bars[0].segments.map((s) => s.key)).toEqual(["loan"]);
  });
});

describe("monthlyAllocationModel — household mode", () => {
  const model = monthlyAllocationModel(
    household,
    {
      netIncome: 44_000_000,
      essentialExpenses: 18_000_000,
      monthlyBuffer: 3_000_000,
      monthlyDebts: 5_000_000,
    },
    ALLOC,
  );

  it("draws the whole month's ledger, summing to net income", () => {
    // The identity that proves nothing is double-counted in the picture:
    // essentials + debts + buffer + housing + leftover = net income.
    const bar = model.bars[0];
    expect(bar.total).toBeCloseTo(44_000_000, 6);
    expect(bar.segments.map((s) => s.key)).toEqual([
      "essentials",
      "debts",
      "buffer",
      "housing",
    ]);
    // No leftover segment here: the household is the binding constraint, so
    // every remaining đồng is allocated to housing.
    expect(bar.segments.find((s) => s.key === "leftover")).toBeUndefined();
  });

  it("shows the lender ceiling as a SEPARATE bar, never as the budget", () => {
    expect(model.bars).toHaveLength(2);
    expect(model.bars[1].key).toBe("ceiling");
    expect(model.bars[1].total).toBeCloseTo(household.assumedRatioCeiling, 6);
    expect(model.summary).toContain(
      "Trần ngân hàng không phải ngân sách sống.",
    );
  });

  it("names the household as the binding constraint when it binds", () => {
    expect(model.summary).toContain("ngân sách hộ");
    expect(model.bars[0].emphasis).toBe(true);
  });

  it("shows a leftover when the lender binds instead", () => {
    const rich = computeAffordability({
      ...HOUSEHOLD_INPUT,
      monthlyNetIncome: 48_000_000,
      essentialExpenses: 10_000_000,
      monthlyBuffer: 1_000_000,
    })!;
    const model2 = monthlyAllocationModel(
      rich,
      {
        netIncome: 48_000_000,
        essentialExpenses: 10_000_000,
        monthlyBuffer: 1_000_000,
        monthlyDebts: 5_000_000,
      },
      ALLOC,
    );
    const leftover = model2.bars[0].segments.find((s) => s.key === "leftover");
    expect(leftover).toBeDefined();
    // 48 − 10 − 5 − 1 = 32 of residual, of which the lender only allows 20.
    expect(leftover!.value).toBeCloseTo(12_000_000, 6);
    expect(model2.bars[0].total).toBeCloseTo(48_000_000, 6);
    expect(model2.summary).toContain("giới hạn trả nợ nhà");
  });

  it("says so when the household cannot carry a loan at all", () => {
    const broke = computeAffordability({
      ...HOUSEHOLD_INPUT,
      monthlyNetIncome: 20_000_000,
    })!;
    const model2 = monthlyAllocationModel(
      broke,
      {
        netIncome: 20_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
      },
      ALLOC,
    );
    expect(model2.summary).toContain("Chưa còn chỗ cho khoản vay.");
    expect(
      model2.bars[0].segments.find((s) => s.key === "housing"),
    ).toBeUndefined();
  });

  it("mirrors every segment into the table, plus each bar's total", () => {
    const rows = model.table.rows;
    // 4 segments + 1 total for the household bar, 1 + 1 for the ceiling bar.
    expect(rows).toHaveLength(7);
    expect(rows[rows.length - 1][0]).toBe("Trần ngân hàng");
  });

  /**
   * The reproduced defect: the housing segment carried the whole BUDGET, so on
   * a cash-bound fixture the ledger showed 17 triệu of "trả nợ nhà" and no
   * headroom at all — while the instalment on the loan actually used was 13,81
   * triệu and 2 triệu of the budget was not debt service. The chart contradicted
   * the page's own headline rows.
   */
  describe("the ledger holds the ACTUAL outflow, not the budget", () => {
    const CASH_BOUND: AffordabilityInput = {
      mode: "household",
      monthlyIncome: 55_000_000,
      monthlyNetIncome: 45_000_000,
      essentialExpenses: 20_000_000,
      monthlyDebts: 3_000_000,
      monthlyBuffer: 5_000_000,
      monthlyHousingCosts: 2_000_000,
      downPayment: 900_000_000,
      cashReserve: 150_000_000,
      purchaseCostPercent: 3,
      assumedMaxLtvPercent: 70,
      annualRatePercent: 8.5,
      termMonths: 240,
      housingRatioPercent: 40,
      totalDebtRatioPercent: 50,
    };
    const bound = computeAffordability(CASH_BOUND)!;
    const model2 = monthlyAllocationModel(
      bound,
      {
        netIncome: 45_000_000,
        essentialExpenses: 20_000_000,
        monthlyBuffer: 5_000_000,
        monthlyDebts: 3_000_000,
        monthlyHousingCosts: 2_000_000,
      },
      ALLOC,
    );

    it("puts the instalment, the other costs and the headroom in three parts", () => {
      expect(bound.priceBinding).toBe("financing");
      const bar = model2.bars[0];
      expect(bar.segments.map((s) => s.key)).toEqual([
        "essentials",
        "debts",
        "buffer",
        "housing",
        "otherHousing",
        "leftover",
      ]);
      const by = (key: string) =>
        bar.segments.find((segment) => segment.key === key)!.value;
      // 13.806.278,71 ₫ of instalment, not the 15 triệu budget.
      expect(by("housing")).toBeCloseTo(13_806_278.712633489, 4);
      expect(by("housing")).toBe(bound.expectedPrincipalInterest);
      expect(by("otherHousing")).toBe(2_000_000);
      // 45 − 20 − 3 − 5 = 17 of residual, less 13,81 and 2 = 1.193.721,29 ₫.
      expect(by("leftover")).toBeCloseTo(1_193_721.287366511, 4);
      // And the ledger still adds up to the net income it came from.
      expect(bar.total).toBeCloseTo(45_000_000, 4);
    });

    it("names the headroom in its own summary", () => {
      expect(model2.summary).toContain("Còn");
      expect(model2.summary).toContain("chưa dùng");
      // Both figures, so the budget and the bill are distinguishable.
      expect(model2.summary).toContain("ngân sách");
      expect(model2.summary).not.toContain("{");
    });

    it("draws no headroom when the payment is what binds", () => {
      // The original fixture: the household's own residual sets the budget and
      // the whole of it really does go to the instalment, so a leftover sliver
      // would be float residue rather than money.
      expect(household.priceBinding).toBe("payment");
      expect(
        model.bars[0].segments.find((segment) => segment.key === "leftover"),
      ).toBeUndefined();
      expect(model.summary).not.toContain("chưa dùng");
    });
  });
});

describe("monthlyAllocationModel — ceiling mode", () => {
  const model = monthlyAllocationModel(ceiling, {}, ALLOC);

  it("draws the two underwriting limits, not an invented household ledger", () => {
    // Inventing a household split from a ratio is the exact conflation the
    // two modes exist to keep apart.
    expect(model.bars.map((b) => b.key)).toEqual([
      "housingLimit",
      "totalDebtLimit",
    ]);
    expect(model.bars[0].total).toBeCloseTo(ceiling.housingLimit, 6);
    expect(model.bars[1].total).toBeCloseTo(ceiling.totalDebtLimit, 6);
  });

  it("still refuses to call the ceiling a budget", () => {
    expect(model.summary).toContain(
      "Trần ngân hàng không phải ngân sách sống.",
    );
  });

  it("marks whichever limit is binding", () => {
    expect(model.bars[0].emphasis).toBe(true);
    expect(model.bars[1].emphasis).toBe(false);
  });

  it("never claims a limited conclusion it cannot have", () => {
    expect(model.summary).not.toContain("Chưa có chi phí sinh hoạt.");
  });

  it("floors a negative total-debt limit at zero rather than drawing below the axis", () => {
    const heavy = computeAffordability({
      ...CEILING_INPUT,
      monthlyDebts: 40_000_000,
    })!;
    expect(heavy.totalDebtLimit).toBeLessThan(0);
    const model2 = monthlyAllocationModel(heavy, {}, ALLOC);
    expect(model2.bars[1].total).toBe(0);
  });

  it("explains a null result", () => {
    const model2 = monthlyAllocationModel(null, {}, ALLOC);
    expect(model2.unavailable).not.toBeNull();
    expect(model2.bars).toEqual([]);
  });
});
