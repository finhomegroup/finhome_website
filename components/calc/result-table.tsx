import { cn } from "@/lib/cn";
import { PLACEHOLDER } from "@/lib/calc/number";

export type ResultTableColumn = {
  /** Column heading text. */
  label: string;
  /** Right-align numeric columns; the first column is usually a label. */
  numeric?: boolean;
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
 * a calculator shows both, the live region belongs on the summary rows.
 *
 * `rows` cells are pre-formatted strings; `null` renders the placeholder. The
 * calculator knows whether a number is money, a percentage or years, so this
 * component does not need to.
 */
export function ResultTable({
  caption,
  columns,
  rows,
  className,
}: {
  caption: string;
  columns: ResultTableColumn[];
  rows: (string | null)[][];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-3 text-left font-display text-base font-medium text-ink">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={cn(
                  "border-b border-ink-4/30 pb-2 font-display text-sm font-medium text-ink-2",
                  column.numeric && "text-right",
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
                const content = cell === null ? PLACEHOLDER : cell;
                // The first cell labels its row, so it is a header for that row.
                return cellIndex === 0 ? (
                  <th
                    key={cellIndex}
                    scope="row"
                    className="py-2 font-normal text-ink-2"
                  >
                    {content}
                  </th>
                ) : (
                  <td
                    key={cellIndex}
                    className={cn(
                      "py-2 tabular-nums text-ink",
                      column?.numeric && "text-right",
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
