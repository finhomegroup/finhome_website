/**
 * Bond pricing and yield for /cong-cu/trai-phieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `bond.test.ts`.
 *
 * Price and yield are the same relationship read in two directions, so both
 * modes run through one `priceAt` function. Price from yield is a closed
 * form; yield from price has none and is solved with bisection, which returns
 * null rather than a guess when no yield in the searched range produces the
 * given price.
 *
 * Conventions, all of which change the answer:
 *
 * - Everything is quoted PER YEAR and converted internally to per-period by
 *   dividing by `paymentsPerYear`. A 10%/năm coupon paid semiannually pays 5%
 *   of face twice a year, and the yield is likewise nominal-annual, so
 *   `yield / 2` discounts each period. This is the bond-market convention
 *   (semiannual bond basis), not effective annual compounding — the effective
 *   yield is reported separately because they are different numbers.
 * - `years × paymentsPerYear` must be a whole number of periods. A bond
 *   priced between coupon dates needs accrued interest and a fractional
 *   first period, which this module does not model; it rejects that input
 *   instead of silently rounding.
 * - Duration is in YEARS, not periods. Macaulay duration divides the
 *   period-weighted present values by `paymentsPerYear`; modified duration
 *   then divides by `1 + yield/paymentsPerYear`. Getting the units wrong here
 *   inflates duration by a factor of the payment frequency.
 */

import { bisect } from "@/lib/calc/solve";

export type BondInput = {
  /** Face (par) value repaid at maturity, in đồng. */
  faceValue: number;
  /** Annual coupon rate as a percent of face. 0 for a zero-coupon bond. */
  couponRatePercent: number;
  /** Years to maturity. */
  years: number;
  /** Coupon payments per year. 1 for annual, 2 for semiannual. */
  paymentsPerYear?: number;
  /** Required yield per year, in percent. Used in `fromYield` mode. */
  yieldPercent?: number;
  /** Market price, in đồng. Used in `fromPrice` mode. */
  price?: number;
};

export type BondResult = {
  /** Coupon paid each period, in đồng. */
  couponPerPeriod: number;
  /** Coupons paid over a year. */
  couponPerYear: number;
  /** Number of coupon periods remaining. */
  periods: number;
  /** Clean price: present value of the coupons and the face value. */
  price: number;
  /** Price as a percent of face. 100 is par. */
  pricePercentOfFace: number;
  /** Yield to maturity per year, nominal. Null when unsolvable. */
  yieldPercent: number | null;
  /** The same yield compounded to an effective annual figure. */
  effectiveYieldPercent: number | null;
  /** Coupon per year divided by price — the running yield. */
  currentYieldPercent: number | null;
  /** Whether the bond trades above, below or at par. */
  quote: "premium" | "discount" | "par";
  /** Macaulay duration, in YEARS. Null when the yield is unknown. */
  macaulayDurationYears: number | null;
  /** Modified duration, in years. The price sensitivity measure. */
  modifiedDurationYears: number | null;
  /**
   * Approximate price change for a 1-percentage-point rise in yield, using
   * modified duration alone. Negative — prices fall when yields rise.
   */
  priceChangePerPointRise: number | null;
  /** Coupons plus face value, undiscounted. */
  totalCashFlows: number;
};

/** Present value of a bond's cash flows at a given annual yield. */
function priceAt(
  faceValue: number,
  couponPerPeriod: number,
  periods: number,
  annualYield: number,
  paymentsPerYear: number,
): number {
  const rate = annualYield / paymentsPerYear;
  if (rate === 0) return couponPerPeriod * periods + faceValue;
  const growth = (1 + rate) ** periods;
  return couponPerPeriod * ((1 - 1 / growth) / rate) + faceValue / growth;
}

/**
 * Price a bond, or find its yield.
 *
 * Pass `yieldPercent` to get the price; pass `price` to get the yield. Null
 * when the inputs cannot describe a bond: a non-positive face value or term,
 * a negative coupon, fewer than one payment a year, a non-integer number of
 * periods (`years × paymentsPerYear`), a non-positive price, neither a yield
 * nor a price, or any non-finite number.
 *
 * In `fromPrice` mode the yield-dependent fields — yield, duration, the
 * sensitivity estimate — are individually null when bisection finds no root.
 * The price and coupon figures remain valid.
 */
export function computeBond(input: BondInput): BondResult | null {
  const {
    faceValue,
    couponRatePercent,
    years,
    paymentsPerYear = 2,
    yieldPercent: requiredYield,
    price: marketPrice,
  } = input;

  const numbers = [faceValue, couponRatePercent, years, paymentsPerYear];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (faceValue <= 0 || years <= 0) return null;
  if (paymentsPerYear < 1 || !Number.isInteger(paymentsPerYear)) return null;

  const periods = years * paymentsPerYear;
  // A bond priced between coupon dates needs accrued interest and a partial
  // first period. Out of scope, so reject rather than round.
  if (!Number.isInteger(periods)) return null;

  const couponPerYear = faceValue * (couponRatePercent / 100);
  const couponPerPeriod = couponPerYear / paymentsPerYear;

  let price: number;
  let annualYield: number | null;

  if (requiredYield !== undefined) {
    if (!Number.isFinite(requiredYield)) return null;
    // At or below −100%/năm per period the discount factors collapse.
    if (requiredYield / paymentsPerYear <= -100) return null;
    annualYield = requiredYield;
    price = priceAt(
      faceValue,
      couponPerPeriod,
      periods,
      annualYield / 100,
      paymentsPerYear,
    );
    if (!Number.isFinite(price) || price <= 0) return null;
  } else if (marketPrice !== undefined) {
    if (!Number.isFinite(marketPrice) || marketPrice <= 0) return null;
    price = marketPrice;
    // Price falls monotonically in yield, so a single root exists whenever it
    // is bracketed. Lower bound just above the collapse point of the period
    // rate; upper bound 1000%/năm, past any traded bond.
    const solved = bisect(
      (y) =>
        priceAt(faceValue, couponPerPeriod, periods, y, paymentsPerYear) -
        price,
      -0.999_999 * paymentsPerYear,
      10,
    );
    annualYield = solved === null ? null : solved * 100;
  } else {
    // Neither given: there is nothing to solve.
    return null;
  }

  const quote =
    price > faceValue ? "premium" : price < faceValue ? "discount" : "par";

  // Duration is only defined once a yield is known.
  let macaulayDurationYears: number | null = null;
  let modifiedDurationYears: number | null = null;
  let priceChangePerPointRise: number | null = null;

  if (annualYield !== null) {
    const rate = annualYield / 100 / paymentsPerYear;
    let weighted = 0;
    let present = 0;
    for (let period = 1; period <= periods; period += 1) {
      const cash =
        period === periods ? couponPerPeriod + faceValue : couponPerPeriod;
      const pv = cash / (1 + rate) ** period;
      weighted += period * pv;
      present += pv;
    }
    if (present > 0) {
      // Divide by paymentsPerYear to turn periods into years.
      macaulayDurationYears = weighted / present / paymentsPerYear;
      modifiedDurationYears = macaulayDurationYears / (1 + rate);
      // A 1-percentage-point rise: ΔP ≈ −modified duration × P × 0,01.
      priceChangePerPointRise = -modifiedDurationYears * price * 0.01;
    }
  }

  return {
    couponPerPeriod,
    couponPerYear,
    periods,
    price,
    pricePercentOfFace: (price / faceValue) * 100,
    yieldPercent: annualYield,
    effectiveYieldPercent:
      annualYield === null
        ? null
        : ((1 + annualYield / 100 / paymentsPerYear) ** paymentsPerYear - 1) *
          100,
    currentYieldPercent: price > 0 ? (couponPerYear / price) * 100 : null,
    quote,
    macaulayDurationYears,
    modifiedDurationYears,
    priceChangePerPointRise,
    totalCashFlows: couponPerPeriod * periods + faceValue,
  };
}
