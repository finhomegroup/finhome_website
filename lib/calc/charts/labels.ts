/**
 * Turning numbers into the strings a chart model carries.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `labels.test.ts`.
 *
 * `lib/` holds no user-facing Vietnamese, so every word arrives from the
 * caller's content file — including the currency symbol and the magnitude
 * words. What lives here is only the arithmetic of choosing a magnitude and
 * the grammar of assembling the pieces, which is the part worth testing.
 */

import {
  formatDecimal,
  formatMoney,
  scaleDecimals,
  scaleMoney,
} from "@/lib/calc/number";

/** The words a money label needs, supplied by the page's content file. */
export type MoneyWords = {
  /** The currency symbol, e.g. "₫". */
  currency: string;
  /** The word for a million, e.g. "triệu". */
  million: string;
  /** The word for a billion, e.g. "tỷ". */
  billion: string;
};

/**
 * A short label for an axis tick or a chart annotation: "2,3 tỷ".
 *
 * Compact on purpose — an axis cannot carry "2.304.616.796 ₫" four times —
 * and therefore ROUNDED. The precise figure always appears in the model's
 * accompanying table, which uses `fullMoney` below. The two are the same
 * number at two precisions, never two different numbers.
 */
export function compactMoney(value: number, words: MoneyWords): string {
  const { value: scaled, scale } = scaleMoney(value);
  if (scale === "ty") {
    return `${formatDecimal(scaled, scaleDecimals(scale))} ${words.billion}`;
  }
  if (scale === "trieu") {
    return `${formatDecimal(scaled, scaleDecimals(scale))} ${words.million}`;
  }
  // `formatMoney`, not `formatDecimal`: below a million the figure is shown in
  // full, and an ungrouped "950000 ₫" is exactly the unreadable label this
  // function exists to avoid. Caught by its own test.
  return `${formatMoney(scaled, scaleDecimals(scale))} ${words.currency}`;
}

/** The exact figure with its symbol: "2.304.616.796 ₫". */
export function fullMoney(value: number, words: MoneyWords): string {
  return `${formatMoney(value)} ${words.currency}`;
}

/**
 * The magnitude word an axis title should name, chosen from the axis maximum
 * so every tick on that axis reads in the same unit.
 *
 * Choosing per tick instead would put "800 triệu" next to "2,3 tỷ" on one
 * axis, which is readable but makes the intervals look uneven.
 */
export function axisUnit(max: number, words: MoneyWords): string {
  const { scale } = scaleMoney(max);
  if (scale === "ty") return words.billion;
  if (scale === "trieu") return words.million;
  return words.currency;
}

/**
 * A tick label on an axis whose unit is stated in its title: the bare number.
 *
 * `max` fixes the divisor for the whole axis, so this is NOT `compactMoney`
 * applied per value — that would rescale each tick independently.
 */
export function axisTickLabel(value: number, max: number): string {
  const { scale } = scaleMoney(max);
  if (scale === "dong") {
    // Grouped, for the same reason as `compactMoney`: a tick reading 250000
    // is harder to read at a glance than one reading 250.000.
    return formatMoney(value, 0);
  }
  const divisor = scale === "ty" ? 1e9 : 1e6;
  return formatDecimal(value / divisor, scaleDecimals(scale));
}

/**
 * Substitute `{name}` placeholders in a content string.
 *
 * Chart summaries are whole Vietnamese sentences with figures in them, and
 * the sentence has to live in the content file — so the numbers are injected
 * rather than the sentence being assembled from fragments, which would make
 * the grammar unfixable by whoever owns the copy.
 *
 * A placeholder with no value supplied is left alone rather than replaced
 * with "undefined": a visible `{months}` in prose is a bug someone reports,
 * where "undefined tháng" reads like a broken tool.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}
