import { cn } from "@/lib/cn";
import { CellReading, MoneyUnitLine } from "@/components/calc/money-reading";
import { TABLE_UI } from "@/content/calculators/table-ui";
import {
  hasMoneyCell,
  tableMoneyUnit,
  type TableCell,
} from "@/lib/calc/table-cell";

/**
 * Floor for a prose label column, so wide figures cannot squeeze it.
 *
 * 8,5rem is 136 px at the default root size — a little above the 105 px the
 * compact comparison table was measured at and read cleanly, which is the
 * evidence this number comes from.
 */
const LABEL_MIN_WIDTH = "min-w-[8.5rem]";

export type ResultTableColumn = {
  /** Column heading text. */
  label: string;
  /** Right-align numeric columns; the first column is usually a label. */
  numeric?: boolean;
  /**
   * Keep this column's cells on one line.
   *
   * For a short period or option label — "Năm 1", "Tháng 24", "Phương án A".
   * The founder's screenshot had "Năm 1" broken across two lines while the
   * figure beside it ran into the next column. Leave it off for a prose label
   * ("Giá nhà — Tiền của bạn"), which must be allowed to wrap or it forces the
   * whole table wider than the screen.
   */
  nowrap?: boolean;
};

/**
 * A tabular block of computed results.
 *
 * A real `<table>` with a `<caption>` and `scope`-ed headers, not a styled grid
 * of divs: a rate schedule IS tabular data, and a div grid gives assistive
 * technology no way to associate a cell with its row and column.
 *
 * Deliberately NOT wrapped in an `aria-live` region, unlike `ResultGroup`. A
 * table can hold hundreds of rows — a 30-year monthly amortization schedule is
 * 360 — and announcing all of them on every keystroke would be unusable. When
 * a calculator shows both, the live region belongs on the summary rows. The
 * mode control below does not change that: switching precision re-renders
 * cells, and a live region would read the whole table back.
 *
 * TWO CELL SHAPES, on purpose.
 *
 * - A `string` (or `null`) is pre-formatted and rendered as given. That is how
 *   most of the suite's calculators call this component and nothing about them
 *   changes.
 * - A typed cell from `lib/calc/table-cell.ts` carries the RAW number, so the
 *   table can show it compactly — one stated unit for every amount in the
 *   table — with the exact đồng figure one keystroke away. Never by parsing a
 *   formatted string back into a number; see that module's docstring.
 *
 * A typed table ALWAYS states its unit, and that is separate from whether it
 * offers the precision control. Typed cells carry no currency symbol — which
 * is what stops a "₫" wrapping onto its own line — so the unit line is the
 * only thing on the page saying the figures are money. A small loan whose
 * whole table fits in đồng has nothing to compact and gets no control, but it
 * still gets the line.
 *
 * WHY THE PRECISION SWITCH IS CSS AND NOT STATE. Both readings are rendered
 * and a `:has(:checked)` rule in `app/globals.css` shows one of them, so this
 * component stays usable from a SERVER component — `ChartFigure` renders it on
 * the education pages, which ship no calculator JavaScript at all — and a
 * prerendered page needs no hydration to switch. The control is a native
 * checkbox, so it is keyboard- and touch-operable for free, and `display:none`
 * keeps the hidden reading out of the accessibility tree rather than reading
 * every figure twice.
 */
export function ResultTable({
  caption,
  columns,
  rows,
  className,
  mobileCards = false,
}: {
  caption: string;
  columns: ResultTableColumn[];
  rows: readonly (readonly TableCell[])[];
  className?: string;
  /**
   * Below `md`, render one block per row instead of the table.
   *
   * For a table too wide to read at 390 px even compacted. Leave it off where
   * the compact table fits — a four-column mortgage year table does, and a
   * block list is more scrolling for no gain. See the JSX for the contract.
   */
  mobileCards?: boolean;
}) {
  const unit = tableMoneyUnit(rows);
  /**
   * A table of amounts ALWAYS states its unit.
   *
   * The cells carry no currency symbol — that is what stops a "₫" wrapping
   * onto its own line — so the unit line is the only thing on the page saying
   * these figures are money at all. A 400.000 ₫ loan puts the whole table in
   * đồng and there is nothing to compact, but "33.695 | 7.961 | 392.039" with
   * no unit anywhere is worse than the defect this unit set out to fix.
   */
  const stateUnit = hasMoneyCell(rows);
  /**
   * The CONTROL is the part that depends on the unit.
   *
   * In đồng the compact reading and the exact reading are the same figures, so
   * a switch would change nothing — and a control that does nothing is worse
   * than no control.
   */
  const switchable = stateUnit && unit !== "dong";

  /**
   * Whether the first column gets a readable minimum width.
   *
   * The reproduced defect: in the exact-đồng reading the comparison's metric
   * label compressed to roughly one word per line — `Trả / hằng / tháng /
   * (giai / đoạn / đầu)` — because the wide figures took the space. A label
   * that cannot be read is worse than a table that scrolls, and the scroll
   * is already contained in this frame, so the label column gets a floor and
   * the amounts push the table wider instead.
   *
   * Skipped for a `nowrap` first column — a period or option label is short
   * and already sized to its content — and for a numeric one, which holds
   * figures rather than prose.
   */
  const labelFloor =
    columns.length > 0 && !columns[0].nowrap && !columns[0].numeric;

  /** One cell, at whichever precision is showing. */
  const content = (cell: TableCell) => (
    <CellReading cell={cell} unit={unit} switchable={switchable} />
  );

  return (
    <div className={cn("fh-rt", className)}>
      {stateUnit ? (
        <div className="mb-3">
          {/* The caption, for the eye. The real `<caption>` below is `sr-only`
              and carries it for assistive technology, so it is announced ONCE;
              this copy is `aria-hidden` and is the same prop, so the two
              cannot drift. Duplicating it visually is what lets the unit line
              and the control sit UNDER the heading rather than above it. */}
          <p
            aria-hidden
            className="text-left font-display text-base font-medium text-ink"
          >
            {caption}
          </p>
          <div className="mt-1">
            <MoneyUnitLine unit={unit} switchable={switchable} />
          </div>
        </div>
      ) : null}

      {mobileCards ? (
        /*
         * One block per row on a phone, the table from `md` up.
         *
         * For a table too wide to read at 390 px even compacted — the
         * floating-rate tool's six columns are 390 px inside a 266 px panel,
         * so they scroll rather than read. A block puts the row's own heading
         * (its first cell: the month range) above label/value pairs for the
         * rest, which is the sequence a reader actually wants.
         *
         * Exactly ONE of the two is in the accessibility tree at any width:
         * `hidden`/`md:hidden` is `display: none`, not visual hiding, so
         * nothing is announced twice. Both are built from the same cells, so
         * they cannot disagree, and both sit in this one `fh-rt` scope, so the
         * single precision control drives both.
         */
        <ul className="md:hidden" aria-label={caption}>
          {rows.map((cells, rowIndex) => (
            <li
              key={rowIndex}
              className="border-t border-ink-4/20 py-3 first:border-t-0 first:pt-0"
            >
              {/* The first column's heading travels with its value: a bare
                  "1–12" has lost what it counts. Two spans with a gap, not two
                  text children — Next's renderer separates adjacent text. */}
              <p className="flex flex-wrap items-baseline gap-x-1 font-display text-sm font-medium text-ink">
                {columns[0]?.label ? <span>{columns[0].label}</span> : null}
                <span>{content(cells[0])}</span>
              </p>
              <dl className="mt-1.5 space-y-1">
                {cells.slice(1).map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    // A two-track grid, not a flex row: the label track takes
                    // what is left and wraps, the value track is sized to its
                    // own content and never squeezed.
                    className="grid grid-cols-[1fr_auto] items-baseline gap-x-3"
                  >
                    <dt className="text-sm leading-snug text-ink-2">
                      {columns[cellIndex + 1]?.label}
                    </dt>
                    <dd className="whitespace-nowrap text-right font-display text-base font-medium tabular-nums text-ink">
                      {content(cell)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      ) : null}

      {switchable ? (
        // BEFORE the frame, not after it. At 390 px the exact reading shows
        // only the first option's column, and the hint sat below all fifteen
        // rows — so the reader's first view gave no indication that B was
        // offscreen, and finding that out required scrolling past the thing
        // the hint was about. Same single hint and no control, moved.
        //
        // The hide is on a WRAPPER, not on the hint itself: `.fh-rt-exact`'s
        // `display: revert` rule in globals.css is more specific than a
        // Tailwind `hidden`, so a class on the same element would lose. Below
        // `md` a card list has replaced the scrolling table, and a hint naming
        // a frame that is not there is worse than no hint.
        <div className={cn(mobileCards && "hidden md:block")}>
          <p className="fh-rt-exact mb-2 text-xs text-ink-3">
            {TABLE_UI.scrollHint}
          </p>
        </div>
      ) : null}

      {/* The scroll lives in this frame, never on the document: a table wider
          than the phone scrolls here and the page does not move sideways. It
          is focusable and labelled because a region a mouse can scroll and a
          keyboard cannot is not reachable at all. */}
      <div
        className={cn("max-w-full overflow-x-auto", mobileCards && "hidden md:block")}
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption
            className={cn(
              "text-left",
              stateUnit
                ? "sr-only"
                : "mb-3 font-display text-base font-medium text-ink",
            )}
          >
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn(
                    // `pl-4 first:pl-0` is the column gap the founder's
                    // screenshot had none of: the old cells had vertical
                    // padding only, so a long figure ran into its neighbour.
                    // A heading may still wrap on its own — it is words, not a
                    // figure — which is why nothing here is nowrap.
                    "border-b border-ink-4/30 pb-2 pl-4 align-bottom font-display text-sm font-medium text-ink-2 first:pl-0",
                    column.numeric && "text-right",
                    column === columns[0] && labelFloor && LABEL_MIN_WIDTH,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, rowIndex) => (
              // Row keys are positional: these tables are generated from a
              // computation, so a row has no identity beyond its position.
              <tr key={rowIndex} className="border-b border-ink-4/15 last:border-b-0">
                {cells.map((cell, cellIndex) => {
                  const column = columns[cellIndex];
                  // The first cell labels its row, so it is a header for that row.
                  return cellIndex === 0 ? (
                    <th
                      key={cellIndex}
                      scope="row"
                      className={cn(
                        "py-2 pl-4 font-normal text-ink-2 first:pl-0",
                        column?.nowrap && "whitespace-nowrap",
                        column?.numeric && "text-right tabular-nums",
                        labelFloor && LABEL_MIN_WIDTH,
                      )}
                    >
                      {content(cell)}
                    </th>
                  ) : (
                    <td
                      key={cellIndex}
                      className={cn(
                        "py-2 pl-4 tabular-nums text-ink first:pl-0",
                        // A figure and its unit are one token. Letting
                        // "1.959.771.451 ₫" break put the "₫" on its own line
                        // in the founder's screenshot.
                        (column?.numeric || column?.nowrap) &&
                          "whitespace-nowrap",
                        column?.numeric && "text-right",
                      )}
                    >
                      {content(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
