import { describe, expect, it } from "vitest";
import {
  targetPriceModel,
  type TargetPriceLabels,
} from "@/lib/calc/charts/affordability-chart";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { affordabilityStatus } from "@/lib/calc/affordability-status";

const LABELS: TargetPriceLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Căn nhà bạn đang xem so với tầm giá",
  axis: "Giá ({unit})",
  rangeBar: "Tầm giá tham khảo",
  targetBar: "Căn nhà bạn đang xem",
  withinSegment: "Phần trong tầm giá",
  overSegment: "Phần cao hơn tầm giá",
  overMark: "Cao hơn tầm giá",
  headroomMark: "Còn cách tầm giá",
  summaryAbove: "Giá {target}, tầm giá {range}: cao hơn {gap}.",
  summaryWithin: "Giá {target}, tầm giá {range}: thấp hơn {headroom}.",
  summaryAt: "Giá {target} bằng tầm giá {range}.",
  assumptions: ["Chênh lệch giá không phải tiền mặt cần góp thêm."],
  tableCaption: "Giá và tầm giá",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  unavailableReason: "Chưa có căn nhà để so.",
  unavailableRecovery: "Nhập giá căn nhà bạn đang xem.",
};

const INPUT: AffordabilityInput = {
  mode: "household",
  monthlyIncome: 50_000_000,
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  cashReserve: 100_000_000,
  purchaseCostPercent: 3,
  annualRatePercent: 8.5,
  termMonths: 240,
};
const result = computeAffordability(INPUT)!;
const at = (targetPrice: number | null) =>
  targetPriceModel(
    affordabilityStatus({ input: INPUT, result, targetPrice, targetInvalid: false }),
    LABELS,
  );

describe("targetPriceModel — the home being looked at, against the range", () => {
  it("draws nothing without a target: a range alone is not a comparison", () => {
    expect(at(null)).toBeNull();
  });

  it("marks ONLY the part of the price above the range, in words and texture", () => {
    const target = Math.round(result.maxPrice) + 300_000_000;
    const model = at(target)!;
    const bar = model.bars.find((b) => b.key === "target")!;
    expect(bar.total).toBeCloseTo(target, 4);
    expect(bar.marks).toHaveLength(1);
    expect(bar.marks![0]).toMatchObject({ tone: "shortfall", label: "Cao hơn tầm giá" });
    expect(bar.marks![0].start).toBeCloseTo(result.maxPrice, 4);
    expect(bar.marks![0].value).toBeCloseTo(target - result.maxPrice, 4);
    // The range bar is not recoloured or marked.
    expect(model.bars.find((b) => b.key === "range")!.marks ?? []).toEqual([]);
    // A difference sentence carries exact terms, never rounded ones.
    expect(model.summary).toContain("cao hơn");
    expect(model.summary).not.toContain("khoảng");
  });

  it("marks the headroom on the range bar only when the comparison is MET", () => {
    const target = Math.round(result.maxPrice) - 200_000_000;
    const model = at(target)!;
    const range = model.bars.find((b) => b.key === "range")!;
    expect(range.marks).toHaveLength(1);
    expect(range.marks![0]).toMatchObject({ tone: "met", label: "Còn cách tầm giá" });
    expect(range.marks![0].start).toBeCloseTo(target, 4);
  });

  it("marks no headroom when the range leaves costs out (caution)", () => {
    const plain = { ...INPUT, purchaseCostPercent: 0, cashReserve: 0 };
    const r = computeAffordability(plain)!;
    const model = targetPriceModel(
      affordabilityStatus({
        input: plain,
        result: r,
        targetPrice: Math.round(r.maxPrice) - 200_000_000,
        targetInvalid: false,
      }),
      LABELS,
    )!;
    for (const bar of model.bars) expect(bar.marks ?? []).toEqual([]);
  });

  it("tabulates the drawn figures, with the gap as its own row", () => {
    const target = Math.round(result.maxPrice) + 300_000_000;
    const rows = at(target)!.table.rows.map((row) => row[0]);
    expect(rows).toContain("Cao hơn tầm giá");
  });
});
