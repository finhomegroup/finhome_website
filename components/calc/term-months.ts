/**
 * The loan term as the schedule will see it — the derived WHOLE month count —
 * and the range this site supports, for /cong-cu/vay-mua-nha/ and
 * /cong-cu/vay-mua-xe/.
 *
 * WHY A UI BOUND (2026-09-29, root input-safety review). Both pages validated
 * only `term > 0` and handed `Math.round(term × 12)` to `computeLoan`, whose
 * amortisation walks every period. A finite but enormous typed term therefore
 * asked for an impractical schedule, and `1e308 năm × 12` is Infinity. So the
 * derived count is checked BEFORE any engine call: it must be finite, a safe
 * integer, and within 1 … 1.200 months — 100 years, the suite's one disclosed
 * horizon (refinance, savings, comparison, APR, rent/buy use the same). This
 * is a product support limit, not a bank's maximum term.
 *
 * FRACTIONAL TERMS STAY LEGAL. 5,5 năm is 66 months; the conversion is the
 * pages' existing `Math.round`, unchanged. Nothing here clamps: a count out of
 * range is INVALID and the field says so, never silently moved into range.
 */
export const MAX_TERM_MONTHS = 1200;

/**
 * The whole month count a typed term converts to, or null when it cannot be
 * one (unparsed, non-finite, or overflowing when multiplied by 12). "years"
 * multiplies by 12; any other unit is read as months, as both pages do.
 */
export function derivedTermMonths(term: number | null, termUnit: string): number | null {
  if (term === null || !Number.isFinite(term)) return null;
  const months = termUnit === "years" ? term * 12 : term;
  if (!Number.isFinite(months)) return null;
  const rounded = Math.round(months);
  return Number.isSafeInteger(rounded) ? rounded : null;
}

/** True only for a count the schedule may be built for: 1 … MAX_TERM_MONTHS. */
export function termMonthsSupported(months: number | null): months is number {
  return months !== null && Number.isSafeInteger(months) && months >= 1 && months <= MAX_TERM_MONTHS;
}
