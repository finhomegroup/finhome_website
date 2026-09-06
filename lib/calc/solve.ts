/**
 * Numeric root-finding for the calculator suite.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `solve.test.ts`.
 *
 * Bisection rather than Newton–Raphson, deliberately. Bisection cannot
 * diverge, needs no derivative, and — the property that matters here —
 * returns null on an interval that does not bracket a root instead of a
 * plausible wrong answer. These solvers back IRR, bond yield-to-maturity and
 * APR, where a returned number must be trustworthy.
 */

export type BisectOptions = {
  /** Stop when the bracket is narrower than this. */
  tolerance?: number;
  /** Hard iteration ceiling; bisection halves the bracket each pass. */
  maxIterations?: number;
};

/**
 * Find x in [lo, hi] with f(x) = 0.
 *
 * Returns null when f is non-finite at either endpoint, when f(lo) and
 * f(hi) share a sign so no root is bracketed, or when the bracket is
 * reversed or degenerate (lo >= hi, including a NaN bound).
 */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  { tolerance = 1e-10, maxIterations = 200 }: BisectOptions = {},
): number | null {
  if (!(lo < hi)) return null;

  let a = lo;
  let b = hi;
  let fa = f(a);
  const fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return null;

  for (let i = 0; i < maxIterations; i += 1) {
    const mid = (a + b) / 2;
    const fMid = f(mid);
    if (!Number.isFinite(fMid)) return null;
    if (fMid === 0 || (b - a) / 2 < tolerance) return mid;
    if (fa * fMid < 0) {
      b = mid;
    } else {
      a = mid;
      fa = fMid;
    }
  }

  return (a + b) / 2;
}
