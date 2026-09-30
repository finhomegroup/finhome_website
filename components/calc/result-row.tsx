import { cn } from "@/lib/cn";
import { PLACEHOLDER } from "@/lib/calc/number";

/**
 * One label/value line of a result group.
 *
 * `aria-atomic` sits HERE rather than on the enclosing live region. It applies
 * to the changed node's nearest ancestor carrying it, so on the row a screen
 * reader announces "Trả hằng tháng: 12.500.000 ₫" — label and value together.
 * On the group it would instead re-announce every output of a six-result
 * calculator on every keystroke.
 *
 * `value` arrives already formatted, including any unit: the calculator knows
 * whether its number is money, a percentage or years, and this component does
 * not need to. `null` means "no result", never zero.
 *
 * LAYOUT: label ABOVE value on a phone, spaced row from `md` up.
 *
 * The row used to be a flex row at every width with `shrink-0` on the value.
 * At 390 px — worse inside a 266 px detail panel — a nine-digit figure took
 * the width it needed and the label was squeezed into a one-word vertical
 * column. `shrink-0` now applies only from `md`, where there is room for both,
 * so desktop rendering is unchanged and the phone gets the full panel width
 * for each of the two lines.
 *
 * A FIGURE LONGER THAN ITS ROW WRAPS; IT IS NEVER CLIPPED (2026-09-29). An
 * accepted but huge input — a 1e17 price on /cong-cu/thue-hay-mua/ — gave
 * `16.129.831.713.745.744 ₫`, one unbreakable run of digits and dots, which
 * ran past a 320 px card and lost its last digits to the card's edge while the
 * page itself did not scroll. The text is untouched (no inserted breaks, no
 * abbreviation, same size); only the box changed:
 *
 * - the value is `max-w-full` with `overflow-wrap: anywhere`, so a run that
 *   cannot fit breaks inside itself as a LAST resort — it only applies when
 *   the figure would otherwise overflow, which a normal figure never does;
 * - from `md`, the row may wrap (`md:flex-wrap`) and the label takes the
 *   remaining width from a zero basis (`md:flex-1`). A normal figure still sits
 *   beside its label exactly as before; one wider than the row minus the
 *   label's longest word moves to its own line instead of pushing out.
 *   `md:shrink-0` stays: below the row's width the value is still held whole.
 * - A PROSE row keeps its previous desktop box: a sentence already shrinks and
 *   wraps by words, so it takes neither the wrap nor the zero-basis label.
 */
/** One place, so the noted and un-noted label render identically. */
const LABEL = "block text-sm leading-snug text-ink-2 md:text-base";

/** A figure row's label from `md`: whatever the value leaves, never below one word. */
const FIGURE_LABEL_BOX = "md:flex-1";

/** A figure longer than its row breaks inside itself rather than being clipped. */
const CONTAIN = "max-w-full [overflow-wrap:anywhere]";

export function ResultRow({
  label,
  value,
  note,
  prose = false,
  emphasis = false,
}: {
  label: string;
  value: string | null;
  /**
   * SUPPLEMENTARY CONTEXT for this row's own answer — a second labelled figure
   * that qualifies the value rather than competing with it.
   *
   * Added for the measured card-route repair: the two credit-card pages
   * announced five peer figures, one of which was the payoff DATE — a fact the
   * reader needs but not a second answer. Set at body size inside the row's
   * `aria-atomic` node, so a screen reader still hears one row: label, value,
   * then the qualifier.
   *
   * This is not a place for a caveat or a sentence of guidance. Those are
   * `<p>` siblings of the group, outside the live region, and they stay there.
   */
  note?: string;
  /**
   * The value is a sentence, not a figure: body type, allowed to wrap, and not
   * held at its full width on desktop. A verdict given the figure treatment
   * cannot shrink and pushes the row past its container.
   */
  prose?: boolean;
  /**
   * THE one main answer of the page. At most one row per group may set this.
   *
   * The 2026-09-21 audit's P2 finding was "nhiều con số cùng mức nhấn" — a
   * reader arriving at a group of four identically-sized figures has to work
   * out which one answered their question. This is one step up the existing
   * type scale in the existing display face; it introduces no new token, no
   * colour and no surface, because the problem was hierarchy rather than
   * decoration.
   *
   * Ignored with `prose`: a verdict sentence set at 30px wraps to three lines
   * and stops being a headline.
   */
  emphasis?: boolean;
}) {
  const labelBox = prose ? undefined : FIGURE_LABEL_BOX;
  return (
    <div
      aria-atomic="true"
      className={cn(
        "border-t border-ink-4/20 py-3 first:border-t-0 md:flex md:items-baseline md:justify-between md:gap-x-6",
        !prose && "md:flex-wrap md:gap-y-1",
      )}
    >
      {note ? (
        // Only when there IS a note: an unconditional wrapper would change the
        // markup of every row in the suite for the rows that have none.
        <span className={cn("block md:mr-auto", labelBox)}>
          <span className={LABEL}>{label}</span>
          <span className="mt-1 block text-sm leading-snug text-ink-3">
            {note}
          </span>
        </span>
      ) : (
        <span className={cn(LABEL, labelBox)}>{label}</span>
      )}
      <span
        className={cn(
          "mt-1 block md:mt-0 md:text-right",
          CONTAIN,
          prose
            ? "text-base leading-relaxed text-ink md:max-w-sm"
            : emphasis
              ? "font-display text-2xl font-medium tabular-nums text-ink md:shrink-0 md:text-3xl"
              : "font-display text-xl font-medium tabular-nums text-ink md:shrink-0 md:text-2xl",
        )}
      >
        {value === null ? PLACEHOLDER : value}
      </span>
    </div>
  );
}
