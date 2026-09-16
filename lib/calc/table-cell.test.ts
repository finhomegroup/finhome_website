/**
 * The compact/exact table reading, and the three ways it could lie.
 *
 * 1. Rescaling something that is not money — a rate divided by a million is
 *    the mirror of the 1000x money grammar defect in §4 of the suite doc.
 * 2. Showing a real charge as zero because it rounded away at the table's
 *    precision.
 * 3. Disagreeing with itself: the compact figure and the exact figure must be
 *    one number at two precisions, which is only possible if both are computed
 *    from the raw value rather than one from the other's text.
 */
import { describe, expect, it } from "vitest";
import {
  countCell,
  hasMoneyCell,
  isMoneyCell,
  moneyCell,
  percentCell,
  renderTableCell,
  tableMoneyUnit,
  tableUnitDecimals,
  type TableCell,
} from "@/lib/calc/table-cell";

const W = { lessThan: "<", aboveNegative: ">" };

const compact = (cell: TableCell, unit: Parameters<typeof renderTableCell>[2]) =>
  renderTableCell(cell, "compact", unit, W);
const exact = (cell: TableCell, unit: Parameters<typeof renderTableCell>[2]) =>
  renderTableCell(cell, "exact", unit, W);

describe("tableMoneyUnit", () => {
  it("chooses triệu from the founder's own example", () => {
    // 166,1 triệu / 100,0 triệu / 1.900,0 triệu — one unit, thousands-grouped
    // at the large end rather than a second unit.
    const rows = [
      [moneyCell(166_100_000)],
      [moneyCell(100_000_000)],
      [moneyCell(1_900_000_000)],
    ];
    expect(tableMoneyUnit(rows)).toBe("trieu");
    expect(rows.map((row) => compact(row[0], "trieu"))).toEqual([
      "166,1",
      "100,0",
      "1.900,0",
    ]);
  });

  it("is chosen from the smallest figure, not the largest", () => {
    // A max-based rule would pick tỷ here because of the balance, and then
    // the principal column reads "0,04" on every row — the digits that
    // distinguish the rows are the ones it drops.
    const rows = [[moneyCell(39_800_000), moneyCell(1_960_200_000)]];
    expect(tableMoneyUnit(rows)).toBe("trieu");
    expect(compact(rows[0][0], "trieu")).toBe("39,8");
    expect(compact(rows[0][1], "trieu")).toBe("1.960,2");
  });

  it("uses tỷ only when every figure is above a billion", () => {
    const rows = [[moneyCell(2_000_000_000), moneyCell(3_616_000_000)]];
    expect(tableMoneyUnit(rows)).toBe("ty");
    expect(compact(rows[0][0], "ty")).toBe("2,00");
    expect(compact(rows[0][1], "ty")).toBe("3,62");
  });

  it("stays in đồng when there is nothing to compact", () => {
    // Under a million there is no shorter honest reading, and a control that
    // changes nothing is worse than no control.
    expect(tableMoneyUnit([[moneyCell(250_000), moneyCell(900_000)]])).toBe(
      "dong",
    );
    expect(tableMoneyUnit([["Năm 1", null]])).toBe("dong");
    expect(tableMoneyUnit([])).toBe("dong");
  });

  it("ignores zeros when picking the unit", () => {
    // The final row of an amortization table has a zero balance. That is not
    // evidence the table needs đồng.
    const rows = [
      [moneyCell(1_400_000), moneyCell(0)],
      [moneyCell(168_000_000), moneyCell(0)],
    ];
    expect(tableMoneyUnit(rows)).toBe("trieu");
  });

  it("ignores non-money cells", () => {
    // 240 months and 8,5% must not drag the unit down to đồng, and must not
    // be counted as amounts at all.
    const rows = [[countCell(240), percentCell(8.5), moneyCell(17_356_465)]];
    expect(tableMoneyUnit(rows)).toBe("trieu");
  });

  it("survives a non-finite figure without choosing a unit from it", () => {
    const rows = [[moneyCell(Number.POSITIVE_INFINITY), moneyCell(5_000_000)]];
    expect(tableMoneyUnit(rows)).toBe("trieu");
  });
});

describe("a real charge never renders as zero", () => {
  it("shows a less-than indicator instead of 0,0", () => {
    // 40.000 ₫ in a table headed "triệu đồng" rounds to 0,0 at one decimal
    // place. Printing that would be a false statement about money.
    expect(compact(moneyCell(40_000), "trieu")).toBe("< 0,1");
    expect(compact(moneyCell(1), "trieu")).toBe("< 0,1");
    expect(compact(moneyCell(200_000_000), "ty")).toBe("0,20");
    expect(compact(moneyCell(1_000_000), "ty")).toBe("< 0,01");
  });

  it("points the other way below zero", () => {
    expect(compact(moneyCell(-40_000), "trieu")).toBe("> -0,1");
  });

  it("still prints a true zero as zero", () => {
    expect(compact(moneyCell(0), "trieu")).toBe("0,0");
    expect(compact(moneyCell(0), "ty")).toBe("0,00");
    expect(compact(moneyCell(0), "dong")).toBe("0");
  });

  it("keeps the exact reading exact, including the tiny charge", () => {
    expect(exact(moneyCell(40_000), "trieu")).toBe("40.000");
    expect(exact(moneyCell(1), "trieu")).toBe("1");
  });
});

describe("what is never scaled", () => {
  it("renders a rate identically in both modes", () => {
    for (const unit of ["dong", "trieu", "ty"] as const) {
      expect(compact(percentCell(8.5), unit)).toBe("8,50%");
      expect(exact(percentCell(8.5), unit)).toBe("8,50%");
      expect(compact(percentCell(14, 2), unit)).toBe("14,00%");
    }
  });

  it("renders a count identically in both modes", () => {
    for (const unit of ["dong", "trieu", "ty"] as const) {
      expect(compact(countCell(240), unit)).toBe("240");
      expect(exact(countCell(240), unit)).toBe("240");
      expect(compact(countCell(0), unit)).toBe("0");
    }
    // Grouped, so a five-figure period count is still readable.
    expect(compact(countCell(1_200), "trieu")).toBe("1.200");
  });

  it("passes a string through untouched", () => {
    // A pre-formatted cell from one of the 30-odd calculators that have not
    // been converted: this module cannot know what it is, so it must not try.
    expect(compact("2.000.000.000 ₫", "trieu")).toBe("2.000.000.000 ₫");
    expect(exact("Năm 1", "ty")).toBe("Năm 1");
  });

  it("renders a missing figure as the placeholder, not as 0", () => {
    expect(compact(null, "trieu")).toBe("—");
    expect(exact(null, "trieu")).toBe("—");
  });

  it("renders an unrenderable figure as the placeholder", () => {
    expect(compact(moneyCell(Number.NaN), "trieu")).toBe("—");
    expect(exact(moneyCell(Number.POSITIVE_INFINITY), "trieu")).toBe("—");
  });
});

describe("the two readings are one number", () => {
  it("agrees to the stated precision on a realistic schedule row", () => {
    const value = 168_472_992.25834832;
    expect(compact(moneyCell(value), "trieu")).toBe("168,5");
    expect(exact(moneyCell(value), "trieu")).toBe("168.472.992");
    // The compact figure is the exact one rounded, to the place the unit
    // declares — not a separately computed number.
    const fromExact = Math.round(value / 1e6 * 10) / 10;
    expect(fromExact).toBe(168.5);
  });

  it("groups thousands in the compact reading", () => {
    // "1900,0" is the unreadable run of digits this exists to avoid.
    expect(compact(moneyCell(1_900_000_000), "trieu")).toBe("1.900,0");
  });
});

describe("helpers", () => {
  it("recognises a money cell and only a money cell", () => {
    expect(isMoneyCell(moneyCell(1))).toBe(true);
    expect(isMoneyCell(percentCell(1))).toBe(false);
    expect(isMoneyCell(countCell(1))).toBe(false);
    expect(isMoneyCell("1")).toBe(false);
    expect(isMoneyCell(null)).toBe(false);
  });

  it("finds a money cell anywhere in the rows", () => {
    expect(hasMoneyCell([["a", null], [countCell(1), moneyCell(2)]])).toBe(
      true,
    );
    expect(hasMoneyCell([["a", null], [countCell(1), percentCell(2)]])).toBe(
      false,
    );
  });

  it("states a precision per unit", () => {
    expect(tableUnitDecimals("dong")).toBe(0);
    expect(tableUnitDecimals("trieu")).toBe(1);
    expect(tableUnitDecimals("ty")).toBe(2);
  });
});
