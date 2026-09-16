// The generic bar-model helpers, extracted from `affordability-chart.ts` when
// the vehicle-budget, fund-allocation and commute adapters needed the same
// four functions. `affordability-chart.test.ts` covers them through that
// adapter; this file pins the contracts directly, because three more callers
// now depend on them.
import { describe, expect, it } from "vitest";
import {
  barOf,
  emptyBars,
  finishBars,
  LEDGER_RESIDUE_DONG,
  segment,
} from "./bars";

const WORDS = { currency: "₫", million: "triệu", billion: "tỷ" };

const FRAME = {
  ...WORDS,
  title: "Tiêu đề",
  axis: "Số tiền ({unit})",
  assumptions: ["Giả định"],
  tableCaption: "Bảng",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  unavailableReason: "Chưa đủ dữ liệu.",
  unavailableRecovery: "Hãy nhập thu nhập.",
};

describe("segment", () => {
  it("drops a zero or negative value rather than drawing it", () => {
    // A 0 ₫ "phí" segment is a legend entry and a table row claiming a charge
    // that was not made.
    expect(segment("a", "A", 0, WORDS)).toBeNull();
    expect(segment("a", "A", -1, WORDS)).toBeNull();
    expect(segment("a", "A", Number.NaN, WORDS)).toBeNull();
  });

  it("carries the exact figure with its currency symbol", () => {
    expect(segment("a", "A", 8_498_817.884507332, WORDS)).toEqual({
      key: "a",
      label: "A",
      value: 8_498_817.884507332,
      valueLabel: "8.498.818 ₫",
    });
  });
});

describe("barOf", () => {
  it("sums only the segments that survived", () => {
    const bar = barOf(
      "b",
      "Bar",
      [
        segment("x", "X", 1_000, WORDS),
        segment("y", "Y", 0, WORDS),
        segment("z", "Z", 2_500, WORDS),
      ],
      WORDS,
    );
    expect(bar.segments.map((s) => s.key)).toEqual(["x", "z"]);
    expect(bar.total).toBe(3_500);
    expect(bar.totalLabel).toBe("3.500 ₫");
  });

  it("is a zero-total bar with no segments when everything was dropped", () => {
    const bar = barOf("b", "Bar", [segment("x", "X", 0, WORDS)], WORDS);
    expect(bar.segments).toEqual([]);
    expect(bar.total).toBe(0);
  });
});

describe("finishBars", () => {
  const model = finishBars(
    [
      barOf("one", "Một", [segment("x", "X", 12_000_000, WORDS)], WORDS, true),
      barOf(
        "two",
        "Hai",
        [
          segment("x", "X", 3_501_182.115492668, WORDS),
          segment("y", "Y", 8_498_817.884507332, WORDS),
        ],
        WORDS,
      ),
    ],
    [
      { key: "x", label: "X" },
      { key: "y", label: "Y" },
    ],
    FRAME.axis,
    WORDS,
    {
      title: FRAME.title,
      summary: "Tóm tắt",
      assumptions: FRAME.assumptions,
      tableCaption: FRAME.tableCaption,
      itemColumn: FRAME.itemColumn,
      amountColumn: FRAME.amountColumn,
    },
  );

  it("lifts the axis to a readable rung above the tallest bar", () => {
    // 12 triệu sits between the 1,0 and 1,5 rungs of `NICE_MANTISSAS`, so the
    // axis runs to 15 triệu and the tallest bar fills four fifths of it.
    expect(model.max).toBe(15_000_000);
    expect(model.axis.label).toBe("Số tiền (triệu)");
    expect(model.axis.ticks).toHaveLength(5);
  });

  it("tabulates every segment and then the bar's own total, in raw đồng", () => {
    // The chart cell for cell: a table built from `valueLabel` strings could
    // not be restated in a compact unit without parsing localized text.
    expect(model.table.rows).toEqual([
      ["Một — X", { kind: "money", value: 12_000_000 }],
      ["Một", { kind: "money", value: 12_000_000 }],
      ["Hai — X", { kind: "money", value: 3_501_182.115492668 }],
      ["Hai — Y", { kind: "money", value: 8_498_817.884507332 }],
      ["Hai", { kind: "money", value: 12_000_000 }],
    ]);
  });

  it("has nothing unavailable when there is something to draw", () => {
    expect(model.unavailable).toBeNull();
  });
});

describe("emptyBars", () => {
  it("carries a reason and a recovery instead of an axis", () => {
    const model = emptyBars(FRAME);
    expect(model.bars).toEqual([]);
    expect(model.max).toBe(0);
    expect(model.axis.ticks).toEqual([]);
    expect(model.table.rows).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: "Chưa đủ dữ liệu.",
      recovery: "Hãy nhập thu nhập.",
    });
    // The summary IS the reason: `ChartFigure` renders the summary as the
    // text equivalent, so an empty model must not leave it blank.
    expect(model.summary).toBe("Chưa đủ dữ liệu.");
  });

  it("names the axis in the bare currency, having no maximum to scale from", () => {
    expect(emptyBars(FRAME).axis.label).toBe("Số tiền (₫)");
  });
});

describe("LEDGER_RESIDUE_DONG", () => {
  it("is half a đồng — the smallest unit anybody transacts in", () => {
    expect(LEDGER_RESIDUE_DONG).toBe(0.5);
  });
});
