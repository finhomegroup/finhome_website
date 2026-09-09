/**
 * Bond pricing and yield for /cong-cu/trai-phieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `bond.test.ts`.
 *
 * Price and yield are the same relationship read in two directions, so both
 * modes run through one `priceAt` function. Price from yield is a closed
 * form; yield from price has none and is solved with bisection, which returns
 * null rather than a guess when no yield in the searched range produces the
 * given price. That range runs from 1000%/năm down to the yield whose discount
 * factor is `MAX_DISCOUNT_FACTOR`, and a price outside it comes back null at
 * EITHER end:
 *
 * - above what the bond is worth at the LOWER bound — a price higher than
 *   anything the bond's cash flows can justify. This is the end
 *   `MAX_DISCOUNT_FACTOR` moves (past 41 kỳ; below that the Math.max clamp
 *   holds it at −0,999999 per period), and it is far out of reach either way:
 *   1,04e68 ₫ on the default bond, which sits at the clamp.
 * - strictly below what the bond is worth at the fixed 1000%/năm UPPER bound,
 *   which is only 800.001,64 ₫ on the default 100 triệu / 8%/năm / 2 lần/năm /
 *   5 năm bond and 800,00 ₫ on the same bond at a 100.000 ₫ face. That end is
 *   reachable by a fat-fingered price or a face/price unit mix-up, and it is
 *   the more likely of the two in a real session. At exactly the bound the
 *   yield solves to 1000%/năm; a hair under it is null.
 *
 * `form.unsolvableNotice` in content/calculators/bond.ts hedges with "thường
 * là do giá quá cao", which covers the first case only — the too-LOW price
 * lands on the same notice.
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
  /**
   * Whether the bond trades above, below, or within `PAR_BAND_DONG` /
   * `PAR_BAND_FRACTION_OF_FACE` of par.
   */
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

/**
 * Largest discount factor (1 + rate)^periods the yield search may reach.
 *
 * The bracket's lower bound exists only to sit below the root: price rises
 * without bound as the yield falls toward −100% per period. But the bound is
 * also EVALUATED, and `faceValue / (1 + rate) ** periods` overflows. The old
 * bound of −0,999999 × paymentsPerYear puts the PER-PERIOD rate at exactly
 * −0,999999, so the factor is (1e-6)^periods: on the default 100 triệu face
 * that is 1,03e308 at 50 periods and Infinity at 51, and `bisect` returns null
 * at its finiteness guard (solve.ts:40). Every bond past 25 năm bán niên — and
 * 13 năm hằng quý — therefore reported no yield at all.
 *
 * So the bound is derived from the factor instead of being fixed: the lowest
 * rate whose factor is 1e250. That leaves 58 orders of magnitude under
 * Number.MAX_VALUE (1,8e308) for the face value, which `formatMoney` will not
 * render above 1e18 anyway, so `priceAt` at the bound is always finite. The
 * derived bound is never LOWER than the old one (see the Math.max clamp at the
 * call site), so the searched interval is a strict subset and no root that used
 * to be found can fall outside it — this only recovers the ones that
 * overflowed. This is §8 defect 1 of docs/calculator-suite-status.md
 * (solveRate's bracket overflowing at 289 periods) recurring at 51.
 */
const MAX_DISCOUNT_FACTOR = 1e250;

/**
 * How far from face value still counts as "bằng mệnh giá".
 *
 * A band, not an equality test, and sized from what the page RENDERS rather
 * than from the float. `price` reaches faceValue through two independent
 * divisions — the coupon via faceValue × (couponRatePercent/100) /
 * paymentsPerYear, the discount via (yieldPercent/100) / paymentsPerYear — so a
 * bond that is at par BY CONSTRUCTION (yield = coupon) can land on
 * 99999999.99999999, and the bare `===` fallthrough made "par" unreachable
 * there.
 *
 * How often it happened is grid-dependent, so the grid is written down and
 * locked by a test rather than quoted as a bare percentage. Over the grid in
 * bond.test.ts's "par is reachable across the whole offered grid" — faces
 * 100.000 / 1 triệu / 10 triệu / 100 triệu ₫ × the three payment frequencies
 * the form offers (1, 2, 4) × coupon 0,25%…20,00% in 0,25 steps × 1…9 năm,
 * 8.640 combinations, yield set equal to coupon in each — 949 (11,0%) come out
 * with price ≠ faceValue on Node 25.2.1 / V8 14.1, and every one of those 949
 * rendered the face value back exactly in the money row and "100,000%" in the
 * percent-of-face row, directly above a "Thấp hơn mệnh giá" verdict. The engine
 * is named because `**` is implementation-approximated, so the test asserts the
 * tally only to a band and asserts exactly the thing that matters: all 8.640
 * now read "par".
 *
 * Same rule as ddm.ts's FAIR_BAND_PERCENT (docs/calculator-suite-status.md §8),
 * but the band here has to be display precision, not ddm's half a percent —
 * 99,7% of face is a real discount for a bond.
 *
 * The price row rounds to whole đồng, so half a đồng is the finest visible
 * difference; the percent-of-face row shows 3 decimals, so 0,0005% of face is
 * the finest visible difference there. The band is the tighter of the two,
 * which makes "par" exactly "both rows read par". The measured float residue is
 * at most 4,0e-16 of face — 0,125 ₫, or 2,8e-16 of face, on a 450 nghìn tỷ
 * face — so it stays under the 0,5 ₫ cap, and "par" stays reachable, for every
 * face up to 1,2e15 ₫. Not for EVERY renderable face: `formatMoney` goes to
 * 1e18, and from about 1,25e15 ₫ up the 0,5 ₫ cap is tighter than the residue
 * and "par" starts slipping again (2 of 72.000 swept combinations at 1,25e15,
 * 69 at 1,5e15). That is ~2,8× Vietnam's GDP and far outside any bond, but it
 * is the real ceiling on this band.
 */
const PAR_BAND_DONG = 0.5;
const PAR_BAND_FRACTION_OF_FACE = 0.000_005;

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
 * sensitivity estimate — are individually null when bisection finds no root,
 * which means the price falls outside the bracket at one end or the other:
 * above the bond's value at the lowest searched yield (the one whose discount
 * factor is `MAX_DISCOUNT_FACTOR`), or below its value at the fixed 1000%/năm
 * ceiling. See the module docstring for both bounds and why the low-price end
 * is the one a user actually hits. The price and coupon figures remain valid.
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
    // is bracketed. Upper bound 1000%/năm, past any traded bond; lower bound
    // the rate whose discount factor is MAX_DISCOUNT_FACTOR, which keeps the
    // evaluated endpoint finite at any period count.
    //
    // The Math.max clamp is load-bearing: at 41 periods or fewer the derived
    // bound is at or below −1 per period, where growth is 0 and `priceAt`
    // divides by zero. Clamping keeps today's exact behaviour for short bonds;
    // the derived bound takes over from 42 periods, nine before the overflow.
    const lowestRatePerPeriod = Math.max(
      -0.999_999,
      MAX_DISCOUNT_FACTOR ** (-1 / periods) - 1,
    );
    const solved = bisect(
      (y) =>
        priceAt(faceValue, couponPerPeriod, periods, y, paymentsPerYear) -
        price,
      lowestRatePerPeriod * paymentsPerYear,
      10,
    );
    annualYield = solved === null ? null : solved * 100;
  } else {
    // Neither given: there is nothing to solve.
    return null;
  }

  // Strict `<`, not `<=`, so the band's edge cannot round the percent-of-face
  // row to 100,001% at a 100.000 ₫ face.
  const parBand = Math.min(
    PAR_BAND_DONG,
    faceValue * PAR_BAND_FRACTION_OF_FACE,
  );
  const quote =
    Math.abs(price - faceValue) < parBand
      ? "par"
      : price > faceValue
        ? "premium"
        : "discount";

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
