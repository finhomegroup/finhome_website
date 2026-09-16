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
 */
export function ResultRow({
  label,
  value,
  prose = false,
}: {
  label: string;
  value: string | null;
  /**
   * The value is a sentence, not a figure: body type, allowed to wrap, and not
   * held at its full width on desktop. A verdict given the figure treatment
   * cannot shrink and pushes the row past its container.
   */
  prose?: boolean;
}) {
  return (
    <div
      aria-atomic="true"
      className="border-t border-ink-4/20 py-3 first:border-t-0 md:flex md:items-baseline md:justify-between md:gap-6"
    >
      <span className="block text-sm leading-snug text-ink-2 md:text-base">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 block md:mt-0 md:text-right",
          prose
            ? "text-base leading-relaxed text-ink md:max-w-sm"
            : "font-display text-xl font-medium tabular-nums text-ink md:shrink-0 md:text-2xl",
        )}
      >
        {value === null ? PLACEHOLDER : value}
      </span>
    </div>
  );
}
