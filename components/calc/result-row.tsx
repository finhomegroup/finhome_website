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
 */
export function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div
      aria-atomic="true"
      className="flex items-baseline justify-between gap-4 border-t border-ink-4/20 py-3 first:border-t-0"
    >
      <span className="text-sm leading-snug text-ink-2 md:text-base">
        {label}
      </span>
      <span className="shrink-0 font-display text-xl font-medium tabular-nums text-ink md:text-2xl">
        {value === null ? PLACEHOLDER : value}
      </span>
    </div>
  );
}
