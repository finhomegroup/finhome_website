/**
 * Pay-rise arithmetic for /cong-cu/tang-luong/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `raise.test.ts`.
 *
 * Three ways into the same triangle of current pay, new pay and the rise
 * between them: give any two and the third follows. Whichever way in, the
 * result carries all three, so the page can always show the rise both as a
 * percentage and as an amount — the two figures a salary negotiation is
 * actually conducted in.
 *
 * `perYear` exists because a Vietnamese salary is quoted per month while a
 * rise is felt per year, and 13th-month pay is common: a 2 triệu/tháng rise
 * is 26 triệu/năm on a 13-month contract, not 24. Defaults to 12.
 *
 * Nothing here models tax or social insurance. A rise in gross pay is not the
 * same rise in take-home pay, and the page says so rather than implying this
 * is a net figure.
 */

export type RaiseMode =
  /** Current pay + a percentage. */
  | "percent"
  /** Current pay + an amount. */
  | "amount"
  /** Current pay + the target pay; solves the percentage. */
  | "target";

export type RaiseInput = {
  mode: RaiseMode;
  /** Pay per period before the rise, in đồng. */
  current: number;
  /**
   * The second figure. A percentage in `percent` mode, an amount per period
   * in `amount` mode, the new pay per period in `target` mode.
   */
  value: number;
  /** Pay periods per year. 12 for monthly pay, 13 with a 13th-month bonus. */
  perYear?: number;
};

export type RaiseResult = {
  /** Pay per period before the rise. */
  current: number;
  /** Pay per period after the rise. */
  next: number;
  /** The rise per period. Negative on a pay cut. */
  increase: number;
  /** The rise as a percent of current pay. */
  increasePercent: number;
  /** The rise over a year: `increase × perYear`. */
  increasePerYear: number;
  /** Pay after the rise, over a year. */
  nextPerYear: number;
};

/**
 * Work out a pay rise.
 *
 * Null when the inputs cannot describe one: current pay of zero or less
 * (there is no percentage rise from nothing), a non-positive number of pay
 * periods, or any non-finite number. A negative `value` is allowed — a pay
 * cut is a real thing to want to compute — but pay after the rise below zero
 * is not, on any of the three modes.
 */
export function computeRaise(input: RaiseInput): RaiseResult | null {
  const { mode, current, value, perYear = 12 } = input;

  const numbers = [current, value, perYear];
  if (numbers.some((figure) => !Number.isFinite(figure))) return null;
  if (current <= 0) return null;
  if (perYear <= 0) return null;

  let next: number;
  switch (mode) {
    case "percent":
      next = current * (1 + value / 100);
      break;
    case "amount":
      next = current + value;
      break;
    case "target":
      next = value;
      break;
  }

  // Pay after the rise cannot be below zero on any mode: losing the whole
  // salary is the floor, −100%. Rejected rather than guessed, and checked
  // here rather than per branch so `amount` and `percent` cannot render an
  // impossible salary that `target` refuses. `next === 0` stays legal.
  if (next < 0) return null;

  const increase = next - current;

  return {
    current,
    next,
    increase,
    increasePercent: (increase / current) * 100,
    increasePerYear: increase * perYear,
    nextPerYear: next * perYear,
  };
}
