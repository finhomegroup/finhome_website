import { TABLE_UI } from "@/content/calculators/table-ui";
import {
  isMoneyCell,
  renderTableCell,
  type TableCell,
  type TableMoneyUnit,
} from "@/lib/calc/table-cell";

/**
 * The two pieces every block of compact amounts needs, shared by the table and
 * the detail figures so one page cannot state its unit two different ways.
 *
 * Both are SERVER components with no state. The precision switch is a native
 * checkbox plus a `:has(:checked)` rule in `app/globals.css`, scoped to the
 * nearest `.fh-rt` ancestor — so a caller wraps its block in `fh-rt` and gets
 * one switch for everything inside it. See `result-table.tsx`'s docstring for
 * why it is CSS and not React state.
 */

/**
 * "Số tiền: triệu đồng", and the control that swaps it for full đồng.
 *
 * `switchable` is false when the block's own unit is already đồng: both
 * readings are then the same figures, so the line renders once with no
 * hide/show wrapper and no control. It is NEVER omitted while there is an
 * amount in the block — typed cells carry no currency symbol, so this line is
 * the only thing saying the figures are money.
 */
export function MoneyUnitLine({
  unit,
  switchable,
}: {
  unit: TableMoneyUnit;
  switchable: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {switchable ? (
        <p className="text-xs text-ink-3">
          <span className="fh-rt-compact">{TABLE_UI.units[unit]}</span>
          <span className="fh-rt-exact">{TABLE_UI.units.dong}</span>
        </p>
      ) : (
        <p className="text-xs text-ink-3">{TABLE_UI.units[unit]}</p>
      )}
      {switchable ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
          <input
            type="checkbox"
            className="fh-rt-switch size-4 shrink-0 accent-brand-green"
          />
          {TABLE_UI.exactToggle}
        </label>
      ) : null}
    </div>
  );
}

/**
 * One cell, at whichever precision is showing.
 *
 * An amount renders BOTH readings and the CSS shows one; a rate, a count, a
 * label and a missing figure render once, because they are the same at either
 * precision — scaling any of them would be the mirror of the money grammar
 * defect `lib/calc/table-cell.ts` exists to prevent.
 */
export function CellReading({
  cell,
  unit,
  switchable,
}: {
  cell: TableCell;
  unit: TableMoneyUnit;
  switchable: boolean;
}) {
  if (!switchable || !isMoneyCell(cell)) {
    return renderTableCell(cell, "compact", unit, TABLE_UI);
  }
  return (
    <>
      <span className="fh-rt-compact">
        {renderTableCell(cell, "compact", unit, TABLE_UI)}
      </span>
      <span className="fh-rt-exact">
        {renderTableCell(cell, "exact", unit, TABLE_UI)}
      </span>
    </>
  );
}
