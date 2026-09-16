/**
 * Typed cells for a result table, and the two precisions one can be shown at.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `table-cell.test.ts`.
 *
 * WHY A CELL TYPE AND NOT A PRE-FORMATTED STRING.
 *
 * A table of full-đồng figures is unreadable on a phone: "166.083.333 ₫"
 * beside "1.959.771.451 ₫" in four columns runs past 390 px, the currency
 * suffix wraps onto its own line, and the rightmost column clips. The fix is a
 * COMPACT reading — one consistent unit for the whole table, "166,1" beside
 * "1.900,0" under a stated "Số tiền: triệu đồng" — with the exact figures still
 * available for reconciliation.
 *
 * That cannot be done from a formatted string. Scaling "166.083.333 ₫" to
 * triệu means parsing the localized text back into a number, which is the
 * 1000× defect class §4 of the suite doc is about: `parseDecimal("500.000")`
 * is 500. So a cell carries the RAW number the engine produced and this module
 * formats it — once per mode, from the same number. Rounding is display only;
 * nothing here feeds arithmetic.
 *
 * `string` stays a valid cell so the 30-odd calculators that already pass
 * pre-formatted rows keep working unchanged. A string is never rescaled: this
 * module cannot know what it is.
 *
 * PERCENTAGES AND COUNTS ARE NEVER SCALED. A rate is 8,50% in both modes and a
 * month number is 36 in both. Dividing either by a million is the mirror image
 * of the defect above, and it is why the cell says which kind of number it is
 * rather than the table guessing from the column.
 */

import {
  PLACEHOLDER,
  formatMoney,
  formatPercent,
} from "@/lib/calc/number";

/** An amount in đồng, at full precision. */
export type MoneyCell = { kind: "money"; value: number };

/** A rate already expressed in percentage points: 8.5 renders "8,50%". */
export type PercentCell = { kind: "percent"; value: number; dp: number };

/** A whole count — months, periods, options. Grouped, never scaled. */
export type CountCell = { kind: "count"; value: number };

export type TypedTableCell = MoneyCell | PercentCell | CountCell;

/**
 * One cell of a result table.
 *
 * `string` is a label or an already-formatted figure, `null` renders the
 * placeholder, and the typed forms carry the raw number so the table can
 * choose a precision.
 */
export type TableCell = string | null | TypedTableCell;

/** The unit every money cell in one table is read in. */
export type TableMoneyUnit = "dong" | "trieu" | "ty";

/** Compact is the default; exact exists for reconciling against a statement. */
export type TableMode = "compact" | "exact";

/**
 * The two words a compact cell needs when a real charge would round to zero.
 *
 * `lib/` holds no user-facing Vietnamese, so they arrive from a content file
 * (`content/calculators/table-ui.ts`).
 */
export type TableWords = {
  /** Reads "less than": "< 0,1". */
  lessThan: string;
  /** Reads "greater than", for a tiny negative: "> -0,1". */
  aboveNegative: string;
};

export function moneyCell(value: number): MoneyCell {
  return { kind: "money", value };
}

export function percentCell(value: number, dp = 2): PercentCell {
  return { kind: "percent", value, dp };
}

export function countCell(value: number): CountCell {
  return { kind: "count", value };
}

export function isTypedCell(cell: TableCell): cell is TypedTableCell {
  return typeof cell === "object" && cell !== null;
}

export function isMoneyCell(cell: TableCell): cell is MoneyCell {
  return isTypedCell(cell) && cell.kind === "money";
}

type Rows = readonly (readonly TableCell[])[];

/** True when at least one cell carries a raw đồng figure. */
export function hasMoneyCell(rows: Rows): boolean {
  return rows.some((row) => row.some(isMoneyCell));
}

const DIVISOR: Record<TableMoneyUnit, number> = {
  dong: 1,
  trieu: 1e6,
  ty: 1e9,
};

/**
 * Decimal places a compact figure carries, per unit.
 *
 * One place in triệu ("166,1") is the granularity the founder's example asks
 * for and it keeps a 100 triệu figure distinguishable from a 100,4 triệu one.
 * Two in tỷ, because a tỷ table only happens when every figure is above a
 * billion and one place there would collapse 2,04 and 2,00 into "2,0". None in
 * đồng: VND has no circulating subunit.
 */
export function tableUnitDecimals(unit: TableMoneyUnit): number {
  return unit === "dong" ? 0 : unit === "trieu" ? 1 : 2;
}

/**
 * Pick ONE unit for every money cell in a table.
 *
 * Chosen from the SMALLEST non-zero figure, not the largest. A max-based rule
 * would put a mortgage table into tỷ because of the opening balance, and then
 * a year's principal reads "0,04" while the balance reads "1,96" — the small
 * column loses every digit that distinguishes its rows. Choosing from the
 * smallest keeps those rows distinct and lets thousands grouping carry the
 * large end: "166,1" beside "1.900,0".
 *
 * Zeros are ignored, because a zero balance in the final row is not evidence
 * the table needs đồng. A table with no money cell, or one whose figures are
 * all under a million, stays in đồng — there is nothing to compact.
 */
export function tableMoneyUnit(rows: Rows): TableMoneyUnit {
  let min = Infinity;
  let max = 0;
  for (const row of rows) {
    for (const cell of row) {
      if (!isMoneyCell(cell)) continue;
      const magnitude = Math.abs(cell.value);
      if (!Number.isFinite(magnitude) || magnitude === 0) continue;
      if (magnitude < min) min = magnitude;
      if (magnitude > max) max = magnitude;
    }
  }
  if (max < 1e6) return "dong";
  return min < 1e9 ? "trieu" : "ty";
}

/** True when the formatted text has no significant digit left. */
function roundedAway(text: string): boolean {
  return /^-?0*(?:,0*)?$/.test(text);
}

/**
 * A money figure in the table's unit.
 *
 * `formatMoney`, not `formatDecimal`: the whole part needs thousands grouping
 * or a balance of 1.900 triệu reads "1900,0", which is the unreadable run of
 * digits this module exists to avoid.
 *
 * A NON-ZERO figure that rounds away does not render as "0,0". A 40.000 ₫
 * charge shown as zero in a table headed "triệu đồng" is a false statement
 * about money; it renders "< 0,1" (or "> -0,1" below zero) instead. An exact
 * zero is still "0,0", because that one is true.
 */
function compactMoneyText(
  value: number,
  unit: TableMoneyUnit,
  words: TableWords,
): string {
  const dp = tableUnitDecimals(unit);
  const text = formatMoney(value / DIVISOR[unit], dp);
  if (text === PLACEHOLDER || value === 0 || !Number.isFinite(value)) {
    return text;
  }
  if (!roundedAway(text)) return text;
  const smallest = formatMoney(10 ** -dp, dp);
  return value > 0
    ? `${words.lessThan} ${smallest}`
    : `${words.aboveNegative} -${smallest}`;
}

/**
 * The text one cell shows, at one precision.
 *
 * `unit` applies to money cells only. Percentages and counts render the same
 * in both modes — see the module docstring.
 */
export function renderTableCell(
  cell: TableCell,
  mode: TableMode,
  unit: TableMoneyUnit,
  words: TableWords,
): string {
  if (cell === null) return PLACEHOLDER;
  if (typeof cell === "string") return cell;
  if (cell.kind === "percent") return formatPercent(cell.value, cell.dp);
  if (cell.kind === "count") return formatMoney(cell.value, 0);
  return mode === "exact"
    ? formatMoney(cell.value, 0)
    : compactMoneyText(cell.value, unit, words);
}
