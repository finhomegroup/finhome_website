/**
 * Fibonacci retracement and extension levels, for /cong-cu/fibonacci/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `fibonacci.test.ts`.
 *
 * A retracement level is the price at which a move has given back a set
 * fraction of itself. Direction decides which way you measure from:
 *
 *   uptrend   — the move ran low → high, so a pullback falls FROM the high
 *   downtrend — the move ran high → low, so a bounce rises FROM the low
 *
 * Getting that backwards produces levels that look plausible and sit on the
 * wrong side of the market, which is why direction is a required input rather
 * than something inferred.
 *
 * Extensions go BEYOND the end of the move, in the direction of the trend:
 * where price might reach if the move continues past its previous extreme.
 *
 * Two of the ratios are not Fibonacci ratios at all. 50% is just half the
 * range, and 78,6% is the square root of 61,8% — both are in every charting
 * package by convention, so they are here, and the module says what they are
 * rather than dressing them up.
 */

/** The retracement fractions, shallowest first. */
const RETRACEMENT_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;

/** The extension fractions, nearest first. */
const EXTENSION_RATIOS = [1.272, 1.414, 1.618, 2, 2.618] as const;

export type FibonacciDirection = "uptrend" | "downtrend";

export type FibonacciLevel = {
  /** The fraction of the move, as a percent: 61,8 rather than 0,618. */
  ratioPercent: number;
  /** The price at that fraction. */
  price: number;
  /** True for the two levels that are conventional rather than Fibonacci. */
  conventional: boolean;
};

export type FibonacciResult = {
  /** `high − low`. */
  range: number;
  /** Echoed back so the page never re-derives it. */
  high: number;
  low: number;
  direction: FibonacciDirection;
  /** Retracements, from the start of the move to its end. */
  retracements: FibonacciLevel[];
  /** Extensions beyond the end of the move, in the trend's direction. */
  extensions: FibonacciLevel[];
};

/** 50% and 78,6% are convention, not Fibonacci ratios. */
function isConventional(ratio: number): boolean {
  return ratio === 0.5 || ratio === 0.786;
}

/**
 * Compute Fibonacci levels for a move.
 *
 * Null when the inputs cannot describe one: a non-positive price, a low above
 * the high, or any non-finite number. A high equal to the low is allowed and
 * collapses every level onto that price — degenerate but not wrong.
 */
export function computeFibonacci(input: {
  /** The high of the move. */
  high: number;
  /** The low of the move. */
  low: number;
  /** Which way the move ran. Decides the direction of measurement. */
  direction: FibonacciDirection;
}): FibonacciResult | null {
  const { high, low, direction } = input;

  if (!Number.isFinite(high) || !Number.isFinite(low)) return null;
  if (high <= 0 || low <= 0) return null;
  if (low > high) return null;

  const range = high - low;
  const up = direction === "uptrend";

  const retracements: FibonacciLevel[] = RETRACEMENT_RATIOS.map((ratio) => ({
    ratioPercent: ratio * 100,
    // Uptrend: a pullback comes down from the high. Downtrend: a bounce goes
    // up from the low. Same fraction, opposite anchor.
    price: up ? high - range * ratio : low + range * ratio,
    conventional: isConventional(ratio),
  }));

  const extensions: FibonacciLevel[] = EXTENSION_RATIOS.map((ratio) => ({
    ratioPercent: ratio * 100,
    // Beyond the end of the move: above the high in an uptrend, below the
    // low in a downtrend.
    price: up ? low + range * ratio : high - range * ratio,
    conventional: false,
  }));

  return { range, high, low, direction, retracements, extensions };
}
