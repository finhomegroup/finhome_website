/**
 * Which palette slot each segment KEY gets.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `palette.test.ts`.
 *
 * THE DEFECT THIS MODULE EXISTS TO FIX. `BarChart` used to colour a segment by
 * its POSITION inside its own bar (`SERIES_FILL[segmentIndex % n]`), while
 * `ChartFigure` coloured the legend by position in the model's `legend` array.
 * Those two agree only when every bar carries exactly the legend's segments in
 * exactly the legend's order — and they do not, because `segment()` drops a
 * zero value and several models have optional segments.
 *
 * An independent review found it on the vehicle-budget figure at 390 px: the
 * legend said "chi phí thiết yếu" was green, and the first segment of both
 * budget bars was rendered grey, because the income bar's single segment had
 * taken slot 0 in its own bar and the legend's slot 0 was the income entry. A
 * reader matching a colour to the legend read the wrong quantity. That is a
 * chart-meaning defect, not a styling preference.
 *
 * THE RULE. A key's slot is fixed by the MODEL, not by where it happens to
 * appear:
 *
 * 1. keys named in `legend`, in legend order, take slots 0..n-1;
 * 2. any segment key NOT in the legend takes the next slot, in order of first
 *    appearance — so it is deterministic and cannot silently collide with a
 *    legend key.
 *
 * Every consumer — the legend swatches and the plot fills — reads this same
 * map, so they cannot drift apart again.
 *
 * THE PALETTE IS FOUR COLOURS, so slots repeat past four. That is a real
 * limit: colour is never the only channel in this suite (segments are ordered
 * and labelled, series carry stroke patterns, and every model ships a table),
 * and `paletteSlots` reports the count so a caller can assert it has not
 * quietly grown past what the palette can distinguish.
 */

/** How many distinct fills/swatches the shared palette actually has. */
export const PALETTE_SLOTS = 4;

/**
 * Map every segment key to its palette slot.
 *
 * `legend` fixes the canonical order; `segmentKeys` is every key that is
 * actually drawn, in first-appearance order. A key appearing in both gets its
 * legend slot.
 */
export function paletteIndexByKey(input: {
  legend: readonly { key: string }[];
  segmentKeys: readonly string[];
}): Map<string, number> {
  const slots = new Map<string, number>();
  for (const entry of input.legend) {
    // First occurrence wins: a legend key can repeat across a stacked model
    // (a fee segment is not on every bar), and the first is the one carrying
    // the label — the same rule `ChartFigure` applies when it dedupes.
    if (!slots.has(entry.key)) slots.set(entry.key, slots.size);
  }
  for (const key of input.segmentKeys) {
    if (!slots.has(key)) slots.set(key, slots.size);
  }
  return slots;
}

/**
 * The slot for one key, with a stable fallback.
 *
 * `fallback` is used only for a key the map has never seen, which should not
 * happen when the map was built from the same model — it exists so a
 * component renders something rather than throwing.
 */
export function paletteSlot(
  slots: Map<string, number>,
  key: string,
  fallback: number,
): number {
  return (slots.get(key) ?? fallback) % PALETTE_SLOTS;
}
