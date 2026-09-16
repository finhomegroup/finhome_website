import { cn } from "@/lib/cn";
import { CellReading, MoneyUnitLine } from "@/components/calc/money-reading";
import {
  hasMoneyCell,
  tableMoneyUnit,
  type TableCell,
} from "@/lib/calc/table-cell";

export type DetailFigure = {
  label: string;
  /** Raw typed cell, or a pre-formatted string for a non-money figure. */
  value: TableCell;
  /**
   * The value is a sentence, not a figure.
   *
   * Affordability's "which ceiling bound the price" rows are prose. Given the
   * figure treatment they get `shrink-0` and a display-size font, and a
   * sentence that cannot shrink pushes the row past the container.
   */
  prose?: boolean;
};

/**
 * A block of label/value figures inside an expanded detail panel.
 *
 * WHY THIS IS NOT `ResultGroup` + `ResultRow`.
 *
 * Two things this needs that a row cannot own alone:
 *
 * - **One money unit for the whole block.** The unit has to be chosen from
 *   every amount in the block at once, so something above the rows must see
 *   them all. React context is not available in a server component, and these
 *   panels are server-rendered, so the figures arrive as an array instead.
 * - **Compact by default.** The observed defect: opening "Xem chi tiết và
 *   từng giai đoạn" at 390 px put `2.862.633.323 ₫` and `4.862.633.323 ₫`
 *   beside their labels in a flex row whose value was `shrink-0`, squeezing
 *   each label into a one-word vertical column. Shortening the FIGURE is half
 *   the fix; the layout below is the other half.
 *
 * LAYOUT. On a phone the label sits ABOVE its value, each with the full width
 * of the panel — no competition, nothing squeezed, and a long label wraps as
 * prose instead of one word per line. From `md` up it returns to a spaced
 * label/value row, which is what reads best where there is room.
 *
 * A real `<dl>`: these ARE term/definition pairs, and it gives assistive
 * technology the association that a div of two spans does not. No `aria-live`
 * anywhere — this is optional detail behind a disclosure, and a block of ten
 * figures re-announced on every keystroke is the failure mode docs §4 names.
 * The `h3` sits under the page's `h2` results heading.
 */
export function DetailFigures({
  title,
  figures,
  className,
}: {
  title: string;
  figures: readonly DetailFigure[];
  className?: string;
}) {
  const cells = figures.map((figure) => [figure.value]);
  const unit = tableMoneyUnit(cells);
  // Always state the unit when there is an amount; only the CONTROL depends on
  // the unit, because in đồng both readings are the same figures.
  const stateUnit = hasMoneyCell(cells);
  const switchable = stateUnit && unit !== "dong";

  return (
    <section className={cn("fh-rt rounded-2xl bg-bg-soft p-5", className)}>
      <h3 className="font-display text-base font-medium text-ink">{title}</h3>
      {stateUnit ? (
        <div className="mt-1">
          <MoneyUnitLine unit={unit} switchable={switchable} />
        </div>
      ) : null}
      <dl className="mt-2">
        {figures.map((figure) => (
          <div
            key={figure.label}
            className="border-t border-ink-4/20 py-3 first:border-t-0 md:flex md:items-baseline md:justify-between md:gap-6"
          >
            <dt className="text-sm leading-snug text-ink-2 md:text-base">
              {figure.label}
            </dt>
            <dd
              className={cn(
                "mt-1 md:mt-0 md:text-right",
                figure.prose
                  ? // Prose: body type, wraps, and bounded so a long sentence
                    // does not run the full width of a desktop panel.
                    "text-base leading-relaxed text-ink md:max-w-sm"
                  : "font-display text-xl font-medium tabular-nums text-ink md:shrink-0 md:text-2xl",
              )}
            >
              <CellReading
                cell={figure.value}
                unit={unit}
                switchable={switchable}
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
