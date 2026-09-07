/**
 * The standard normal distribution.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `normal.test.ts`.
 *
 * Written because `quyen-chon-black-scholes` needs Φ(x) and JavaScript has no
 * `erf`. Kept as its own module rather than inlined, so the approximation can
 * be tested against published values independently of the option maths — an
 * error here would show up as a plausible-looking option price.
 *
 * `normalCdf` uses the Zelen & Severo rational approximation (Abramowitz &
 * Stegun 26.2.17), whose stated absolute error is under 7,5 × 10⁻⁸. That is
 * far below the precision any option price is quoted to, and it needs no
 * iteration. The approximation is defined for x ≥ 0 and extended to negative
 * x by the symmetry Φ(−x) = 1 − Φ(x), which is exact rather than approximate.
 *
 * `normalPdf` is the density, needed for the option greeks.
 *
 * `inverseNormalCdf` uses the Beasley–Springer–Moro algorithm, accurate to
 * about 3 × 10⁻⁹ over the central region and adequate in the tails. It is
 * here because "what confidence interval does this correspond to" is the
 * natural companion question, and rolling it by bisection on `normalCdf`
 * would be both slower and less accurate.
 */

/** Coefficients for Abramowitz & Stegun 26.2.17. */
const A_S_P = 0.231_641_9;
const A_S_B = [
  0.319_381_530, -0.356_563_782, 1.781_477_937, -1.821_255_978,
  1.330_274_429,
] as const;

/** 1 / sqrt(2π). */
const INV_SQRT_2PI = 0.398_942_280_401_432_7;

/**
 * The standard normal density, φ(x).
 *
 * Returns NaN for a non-finite input rather than a number, so a caller that
 * forgets to validate gets NaN rather than a plausible density.
 */
export function normalPdf(x: number): number {
  if (!Number.isFinite(x)) return Number.NaN;
  return INV_SQRT_2PI * Math.exp((-x * x) / 2);
}

/**
 * The standard normal cumulative distribution, Φ(x).
 *
 * Returns NaN for a non-finite input, except ±Infinity which correctly give
 * 1 and 0 — those are the limits, not errors, and an option with infinite
 * moneyness is a case the pricing code can hit.
 */
export function normalCdf(x: number): number {
  if (Number.isNaN(x)) return Number.NaN;
  if (x === Number.POSITIVE_INFINITY) return 1;
  if (x === Number.NEGATIVE_INFINITY) return 0;

  // The approximation is stated for x >= 0. Negative x uses the exact
  // symmetry Φ(−x) = 1 − Φ(x), so no accuracy is lost on that half.
  const negative = x < 0;
  const z = Math.abs(x);

  const t = 1 / (1 + A_S_P * z);
  let poly = 0;
  let power = t;
  for (const coefficient of A_S_B) {
    poly += coefficient * power;
    power *= t;
  }

  const upper = normalPdf(z) * poly;
  return negative ? upper : 1 - upper;
}

/**
 * Beasley–Springer central-region coefficients: FOUR each, not five.
 *
 * The first attempt used a five-coefficient variant from a different
 * algorithm, which left the central region out by about 8 × 10⁻⁵ — four
 * orders of magnitude worse than this approximation's claim. Caught by
 * round-tripping through `normalCdf`, which is why that test is here.
 */
const BSM_A = [
  2.506_628_238_84, -18.615_000_625_29, 41.391_197_735_34,
  -25.441_060_496_37,
] as const;
const BSM_B = [
  -8.473_510_930_90, 23.083_367_437_43, -21.062_241_018_26,
  3.130_829_098_33,
] as const;
/**
 * Moro's tail coefficients, in full published precision.
 *
 * Transcribed carelessly on the first pass — everything from the fourth
 * coefficient on was wrong, which put the 95% critical value out by 5 × 10⁻⁵.
 * The tests that caught it compare against the critical values people
 * actually quote, which is why they caught it.
 */
const BSM_C = [
  0.337_475_482_272_614_7, 0.976_169_019_091_718_6, 0.160_797_971_491_820_9,
  0.027_643_881_033_386_3, 0.003_840_572_937_360_9, 0.000_395_189_651_191_9,
  0.000_032_176_788_176_8, 0.000_000_288_816_736_4, 0.000_000_396_031_518_7,
] as const;

/**
 * The inverse of `normalCdf`: the z-score with `probability` below it.
 *
 * Null for a probability at or outside 0 and 1 — the answer there is ±∞, and
 * returning a very large finite number would be a guess — or for a non-finite
 * input.
 */
export function inverseNormalCdf(probability: number): number | null {
  if (!Number.isFinite(probability)) return null;
  if (probability <= 0 || probability >= 1) return null;

  const y = probability - 0.5;

  // Central region: a rational approximation in y². Both polynomials are
  // written out by Horner's rule rather than looped, because the nesting
  // order is the approximation and a loop would obscure it.
  if (Math.abs(y) < 0.42) {
    const r = y * y;
    const numerator =
      y * (((BSM_A[3] * r + BSM_A[2]) * r + BSM_A[1]) * r + BSM_A[0]);
    const denominator =
      ((((BSM_B[3] * r + BSM_B[2]) * r + BSM_B[1]) * r + BSM_B[0]) * r + 1);
    return numerator / denominator;
  }

  // Tails: a Chebyshev-style series in log(−log(·)).
  let r = probability;
  if (y > 0) r = 1 - probability;
  r = Math.log(-Math.log(r));

  let value = BSM_C[0];
  let power = 1;
  for (let index = 1; index < BSM_C.length; index += 1) {
    power *= r;
    value += BSM_C[index] * power;
  }

  return y < 0 ? -value : value;
}
