// Original row 67's waterfall. The fixture is the independent one from the
// P3 handoff: a 2 tỷ gross loan, charges of 1% and 0,5% of the gross plus a
// 5 triệu flat fee, giving 20 + 10 + 5 = 35 triệu withheld and 1,965 tỷ
// received — while the debt is still 2 tỷ.
import { describe, expect, it } from "vitest";
import { computeNetDistribution } from "@/lib/calc/net-distribution";
import { netProceedsModel, type NamedCharge } from "./net-proceeds-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Từ số tiền vay đến số tiền về tay",
  axis: "Số tiền ({unit})",
  assumptions: ["Các khoản trừ là giả định do bạn nhập."],
  tableCaption: "Từng khoản trừ",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  tableHint: "Dòng giữa là số bị trừ, nên mang dấu âm.",
  unavailableReason: "Chưa đủ dữ liệu.",
  unavailableRecovery: "Hãy nhập số tiền và các khoản trừ.",
  grossBar: "Tiền vay trước khi trừ phí",
  netBar: "= Tiền thực về tay",
  remainingSegment: "Phần tiền còn giữ lại",
  deductedSegment: "Phần bị trừ ở khoản phí đó",
  cashSegment: "Tiền thực về tay",
  stepFormat: "− {charge}: {amount}",
  stepRemainingFormat: "còn {remaining}",
  scaleNote:
    "Tổng phí {charges} chỉ bằng {percent}% số tiền vay, nên các đoạn bị trừ rất mảnh.",
  remainingColumn: "Tiền còn lại",
  debtRow: "Nợ gốc vẫn phải trả",
  summary: "Tiền vay {gross}, trừ {charges} phí, còn {net} về tay.",
  obligationNote:
    "Hình này chỉ đi xuống ở phần TIỀN. Khoản NỢ không giảm: vẫn là {gross}.",
  noChargesNote: "Chưa nhập khoản trừ nào, nên hai con số bằng nhau.",
  negativeReason: "Các khoản trừ lớn hơn cả số tiền, nên không vẽ được.",
  negativeRecovery: "Hãy kiểm tra lại các khoản trừ cố định.",
  percentBaseFormat: "{percent}% của số gốc",
  chargeColumn: "Khoản mục",
  basisColumn: "Cơ sở tính",
  flatBasis: "Số tiền cố định",
};

/** The handoff's own charge structure, named. */
const CHARGES: NamedCharge[] = [
  { key: "arrangement", label: "Phí thu xếp", amount: 20_000_000, percent: 1 },
  { key: "insurance", label: "Phí bảo hiểm", amount: 10_000_000, percent: 0.5 },
  { key: "flat", label: "Phí cố định", amount: 5_000_000, percent: null },
];

const RESULT = computeNetDistribution({
  direction: "toNet",
  amount: 2_000_000_000,
  percentDeductions: [1, 0.5],
  fixedDeductions: [5_000_000],
})!;

describe("the engine on the handoff fixture", () => {
  it("withholds 35 triệu and pays out 1,965 tỷ", () => {
    expect(RESULT.gross).toBe(2_000_000_000);
    expect(RESULT.percentAmount).toBeCloseTo(30_000_000, 6);
    expect(RESULT.fixedAmount).toBe(5_000_000);
    expect(RESULT.totalDeducted).toBeCloseTo(35_000_000, 6);
    expect(RESULT.net).toBeCloseTo(1_965_000_000, 6);
  });

  it("inverts to the handoff's gross for a 2 tỷ target", () => {
    // (2.000.000.000 + 5.000.000) ÷ (1 − 0,015), computed by hand.
    const reverse = computeNetDistribution({
      direction: "toGross",
      amount: 2_000_000_000,
      percentDeductions: [1, 0.5],
      fixedDeductions: [5_000_000],
    })!;
    expect(reverse.gross).toBeCloseTo(2_035_532_994.923858, 4);
    expect(reverse.net).toBe(2_000_000_000);
  });
});


describe("netProceedsModel draws the cash waterfall", () => {
  const model = netProceedsModel(RESULT, CHARGES, LABELS);

  it("is a bridge: the gross, one step per charge, the total", () => {
    // Original row 67 specifies "Waterfall tổng → khoản trừ → thực nhận". The
    // first version drew two equal-length composition bars; the second drew
    // remaining-balance bars whose plot contained no deduction at all. A
    // review rejected both — the middle term has to be a drawn quantity.
    expect(model.bars.map((bar) => bar.key)).toEqual([
      "gross",
      "after-arrangement",
      "after-insurance",
      "after-flat",
      "net",
    ]);
  });

  it("DRAWS each charge as its own segment, in its own key", () => {
    // This is the finding: the deduction must be a quantity in the plot, not
    // a difference the reader infers from two bar lengths.
    expect(model.bars[1].segments.map((s) => s.key)).toEqual([
      "remaining",
      "deducted",
    ]);
    const taken = model.bars
      .slice(1, 4)
      .map((bar) => bar.segments.find((s) => s.key === "deducted")!.value);
    expect(taken[0]).toBeCloseTo(20_000_000, 6);
    expect(taken[1]).toBeCloseTo(10_000_000, 6);
    expect(taken[2]).toBeCloseTo(5_000_000, 6);
    // Each charge is drawn exactly once, and they sum to the engine's total.
    expect(taken.reduce((a, b) => a + b, 0)).toBeCloseTo(
      RESULT.totalDeducted,
      6,
    );
  });

  it("starts each step where the row above ended", () => {
    // A step bar's LENGTH is the cash in hand before its charge, so the bar
    // total equals the previous step's kept slice. That is what makes the
    // offset readable without a floating slice on an empty plot.
    const kept = (index: number) =>
      model.bars[index].segments.find((s) => s.key === "remaining")?.value ?? 0;
    expect(model.bars[1].total).toBe(2_000_000_000);
    expect(model.bars[2].total).toBeCloseTo(kept(1), 6);
    expect(model.bars[3].total).toBeCloseTo(kept(2), 6);
    // And every bar's own total is its segments summed — no phantom length.
    for (const bar of model.bars) {
      const sum = bar.segments.reduce((total, s) => total + s.value, 0);
      expect(sum, bar.key).toBeCloseTo(bar.total, 6);
    }
  });

  it("descends by exactly each charge, landing on the engine's net", () => {
    const kept = model.bars
      .slice(1, 4)
      .map((bar) => bar.segments.find((s) => s.key === "remaining")!.value);
    expect(kept[0]).toBeCloseTo(1_980_000_000, 6);
    expect(kept[1]).toBeCloseTo(1_970_000_000, 6);
    expect(kept[2]).toBeCloseTo(1_965_000_000, 6);
    // The closing bar IS the engine's own figure, not a re-derivation.
    expect(model.bars[4].total).toBe(RESULT.net);
    // Every step down equals the charge that caused it, exactly once.
    expect(2_000_000_000 - kept[0]).toBeCloseTo(20_000_000, 6);
    expect(kept[0] - kept[1]).toBeCloseTo(10_000_000, 6);
    expect(kept[1] - kept[2]).toBeCloseTo(5_000_000, 6);
  });

  it("shows the cash still in hand beside each step, not the bar's own total", () => {
    // The bar total is the balance BEFORE the charge; printing it as the
    // row's figure would repeat the row above and read as nothing taken.
    expect(model.bars[1].totalLabel).toBe("còn 1.980.000.000 ₫");
    expect(model.bars[2].totalLabel).toBe("còn 1.970.000.000 ₫");
    expect(model.bars[3].totalLabel).toBe("còn 1.965.000.000 ₫");
  });

  it("never rises: the cash kept only goes one way", () => {
    const kept = model.bars.map(
      (bar) => bar.segments.find((s) => s.key === "remaining")?.value ?? null,
    );
    const path = [2_000_000_000, ...kept.slice(1, 4).map((v) => v!)];
    for (let i = 1; i < path.length; i += 1) {
      expect(path[i], `step ${i}`).toBeLessThanOrEqual(path[i - 1] + 1e-6);
    }
  });

  it("says why the taken slices are thin, with the real share", () => {
    // 35 triệu on 2 tỷ is 1,75%. The honest alternative to a truncated axis.
    expect(model.summary).toContain("1,75%");
    expect(model.summary).toContain("Tổng phí 35.000.000 ₫");
  });

  it("names the charge AND its amount on each step's own label", () => {
    // Readable because BarChart renders bar labels as HTML, not svg text.
    expect(model.bars[1].label).toBe("− Phí thu xếp: 20.000.000 ₫");
    expect(model.bars[2].label).toBe("− Phí bảo hiểm: 10.000.000 ₫");
    expect(model.bars[3].label).toBe("− Phí cố định: 5.000.000 ₫");
  });

  it("labels the first and last bars as CASH, not as debt", () => {
    // The staircase is safe to draw precisely because every bar is money
    // received rather than money owed.
    expect(model.bars[0].label).toBe(LABELS.grossBar);
    expect(model.bars[0].label).toContain("Tiền vay");
    expect(model.bars.at(-1)!.label).toBe(LABELS.netBar);
  });

  it("emphasises only the closing total", () => {
    expect(model.bars.at(-1)!.emphasis).toBe(true);
    for (const bar of model.bars.slice(0, -1)) {
      expect(bar.emphasis).toBeUndefined();
    }
  });

  it("keeps the unchanged DEBT on the figure, in words and in the table", () => {
    expect(model.summary).toContain("Khoản NỢ không giảm");
    expect(model.summary).toContain("vẫn là 2.000.000.000 ₫");
    expect(model.table.rows.at(-1)).toEqual([
      LABELS.debtRow,
      "",
      { kind: "money", value: 2_000_000_000 },
      "",
    ]);
  });

  it("states the two amounts EXACTLY, because they differ by 1,75%", () => {
    // compactMoney at one decimal in tỷ renders both as "2,0 tỷ".
    expect(model.summary).toContain("Tiền vay 2.000.000.000 ₫");
    expect(model.summary).toContain("còn 1.965.000.000 ₫ về tay");
    expect(model.summary).not.toContain("2,0 tỷ");
  });

  it("has a three-entry legend: kept, taken, and the closing total", () => {
    // Every drawn key is named, and `deducted` is named SECOND — the middle
    // term of "tổng → khoản trừ → thực nhận".
    expect(model.legend.map((entry) => entry.key)).toEqual([
      "remaining",
      "deducted",
      "cash",
    ]);
    const drawn = new Set(
      model.bars.flatMap((bar) => bar.segments.map((s) => s.key)),
    );
    for (const key of drawn) {
      expect(
        model.legend.some((entry) => entry.key === key),
        `${key} is drawn but not in the legend`,
      ).toBe(true);
    }
  });

  it("keeps the deduction-by-deduction ledger with its declared bases", () => {
    expect(model.table.rows.slice(0, 5)).toEqual([
      [
        LABELS.grossBar,
        "",
        { kind: "money", value: 2_000_000_000 },
        { kind: "money", value: 2_000_000_000 },
      ],
      [
        "Phí thu xếp",
        "1% của số gốc",
        { kind: "money", value: -20_000_000 },
        { kind: "money", value: 1_980_000_000 },
      ],
      [
        "Phí bảo hiểm",
        "0.5% của số gốc",
        { kind: "money", value: -10_000_000 },
        { kind: "money", value: 1_970_000_000 },
      ],
      [
        "Phí cố định",
        LABELS.flatBasis,
        { kind: "money", value: -5_000_000 },
        { kind: "money", value: 1_965_000_000 },
      ],
      [LABELS.cashSegment, "", { kind: "money", value: RESULT.net }, ""],
    ]);
    expect(model.table.hint).toBe(LABELS.tableHint);
  });

  it("gives the running balance a column, readable where thin slices are not", () => {
    expect(model.table.columns.map((column) => column.label)).toEqual([
      LABELS.chargeColumn,
      LABELS.basisColumn,
      LABELS.amountColumn,
      LABELS.remainingColumn,
    ]);
    // Four columns fit a phone compacted, so no per-row card fallback.
    expect(model.table.mobileCards).toBeUndefined();
  });
});

describe("netProceedsModel with no charges at all", () => {
  const free = computeNetDistribution({
    direction: "toNet",
    amount: 2_000_000_000,
    percentDeductions: [0, 0],
    fixedDeductions: [0],
  })!;
  const model = netProceedsModel(free, [], LABELS);

  it("has no steps between the gross and the total", () => {
    expect(free.net).toBe(free.gross);
    expect(model.bars.map((bar) => bar.key)).toEqual(["gross", "net"]);
    expect(model.bars[0].total).toBe(model.bars[1].total);
  });

  it("says why the two bars are the same length", () => {
    expect(model.summary).toContain(LABELS.noChargesNote);
    // And says nothing about thin slices there are none of.
    expect(model.summary).not.toContain("mảnh");
  });

  it("omits a zero charge that was passed in anyway", () => {
    // A 0 ₫ step would be a bar claiming a deduction nobody was billed.
    const withEmpty = netProceedsModel(
      RESULT,
      [...CHARGES, { key: "empty", label: "Phí trống", amount: 0, percent: 0 }],
      LABELS,
    );
    expect(withEmpty.bars.map((b) => b.key)).not.toContain("after-empty");
    expect(withEmpty.table.rows.some((r) => r[0] === "Phí trống")).toBe(false);
  });
});

describe("netProceedsModel — zero, negative and absent", () => {
  it("DRAWS a net of exactly zero, with an empty closing bar", () => {
    // Nothing arriving is a real answer, and an empty final bar under a full
    // first one is an honest picture of it.
    const nothing = computeNetDistribution({
      direction: "toNet",
      amount: 5_000_000,
      percentDeductions: [0],
      fixedDeductions: [5_000_000],
    })!;
    expect(nothing.net).toBe(0);
    const model = netProceedsModel(
      nothing,
      [{ key: "flat", label: "Phí", amount: 5_000_000, percent: null }],
      LABELS,
    );
    expect(model.unavailable).toBeNull();
    expect(model.bars.map((b) => b.key)).toEqual([
      "gross",
      "after-flat",
      "net",
    ]);
    expect(model.bars.at(-1)!.total).toBe(0);
    expect(model.bars.at(-1)!.segments).toEqual([]);
    // The step bar still draws the charge that took everything: a bar made of
    // nothing but the deduction is the honest picture of that case.
    expect(model.bars[1].segments.map((s) => s.key)).toEqual(["deducted"]);
    expect(model.bars[1].total).toBe(5_000_000);
    expect(model.bars[1].totalLabel).toBe("còn 0 ₫");
  });

  it("withholds the plot when a flat charge swallows more than the whole amount", () => {
    // A bar has no signed form. The negative net is still reported in the
    // page's result rows, which is where that answer belongs.
    const eaten = computeNetDistribution({
      direction: "toNet",
      amount: 100_000,
      percentDeductions: [0],
      fixedDeductions: [200_000],
    })!;
    expect(eaten.net).toBeLessThan(0);
    const model = netProceedsModel(
      eaten,
      [{ key: "flat", label: "Phí", amount: 200_000, percent: null }],
      LABELS,
    );
    expect(model.bars).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: LABELS.negativeReason,
      recovery: LABELS.negativeRecovery,
    });
    expect(model.summary).toBe(LABELS.negativeReason);
  });

  it("has nothing to draw without a result", () => {
    const model = netProceedsModel(null, CHARGES, LABELS);
    expect(model.bars).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: LABELS.unavailableReason,
      recovery: LABELS.unavailableRecovery,
    });
  });

  it("refuses percentages that reach 100 at the engine, before any drawing", () => {
    expect(
      computeNetDistribution({
        direction: "toNet",
        amount: 2_000_000_000,
        percentDeductions: [60, 40],
      }),
    ).toBeNull();
  });
});
