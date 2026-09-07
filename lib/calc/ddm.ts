/**
 * The Gordon growth model, for /cong-cu/co-phieu-tang-truong-deu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `ddm.test.ts`.
 *
 *   value = next year's dividend ÷ (required return − growth)
 *
 * The whole model lives or dies on that denominator. As growth approaches the
 * required return the value goes to infinity, and at or above it the formula
 * produces a NEGATIVE value that looks like a number and means nothing. So
 * `growth >= requiredReturn` is rejected rather than computed — the honest
 * answer is "this model cannot price that", not a negative price.
 *
 * The dividend input can be either the one just paid (D0, which the model
 * grows once) or next year's (D1, used as given). Both conventions are in
 * circulation and they differ by a factor of (1 + g), which is a real error
 * to make, so the mode is explicit rather than assumed.
 *
 * Given a market price, the module also inverts the model two ways: the
 * growth rate the price implies, and the return the price implies. Those are
 * more useful than the valuation itself — instead of arguing about whether a
 * share is worth 50.000 ₫, you can ask whether 7,2% perpetual growth is
 * plausible. Both inversions have closed forms; neither is searched.
 */

/**
 * How close to the model's value counts as "fair", in percent.
 *
 * A band, not an equality test. `intrinsicValue` is the result of a division,
 * so it lands on 30000.000000000004 rather than 30000 — and a strict `===`
 * against the price would make the `fair` verdict unreachable in practice.
 * Half a percent is also the honest resolution of the model: its inputs are
 * estimates, and a price within half a percent of its output is not
 * meaningfully cheap or dear.
 */
const FAIR_BAND_PERCENT = 0.5;

export type DdmInput = {
  /** The dividend figure, in đồng per share. */
  dividend: number;
  /** True when `dividend` is next year's (D1); false when it is D0. */
  dividendIsNext?: boolean;
  /** Perpetual growth rate, in percent per year. May be negative. */
  growthPercent: number;
  /** Required rate of return, in percent per year. */
  requiredReturnPercent: number;
  /** Market price per share, for the verdict and the two inversions. */
  price?: number;
};

export type DdmResult = {
  /** D1 — next year's dividend, grown from D0 if that is what was given. */
  nextDividend: number;
  /** The model's value per share. */
  intrinsicValue: number;
  /** `D1 ÷ intrinsic value`. */
  dividendYieldPercent: number;
  /** Equal to the growth rate: the other half of the total return. */
  capitalGainsYieldPercent: number;
  /** The two yields added — equal to the required return, by construction. */
  totalReturnPercent: number;
  /** Echoed back. Null when no price was given. */
  price: number | null;
  /** How far the price sits above the model's value, in percent. */
  premiumDiscountPercent: number | null;
  /**
   * Whether the price is below, above or within `FAIR_BAND_PERCENT` of the
   * model's value.
   */
  verdict: "undervalued" | "overvalued" | "fair" | null;
  /**
   * The perpetual growth rate that would justify the market price, holding
   * the required return fixed. Null without a price.
   */
  impliedGrowthPercent: number | null;
  /**
   * The return the market price implies, holding growth fixed:
   * `D1 ÷ price + growth`. Null without a price.
   */
  impliedReturnPercent: number | null;
};

/**
 * Value a share on perpetual constant dividend growth.
 *
 * Null when the model cannot price the inputs: a non-positive dividend, a
 * growth rate at or above the required return, a non-positive price when one
 * is given, or any non-finite number.
 */
export function computeDdm(input: DdmInput): DdmResult | null {
  const {
    dividend,
    dividendIsNext = false,
    growthPercent,
    requiredReturnPercent,
    price,
  } = input;

  const numbers = [dividend, growthPercent, requiredReturnPercent];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (dividend <= 0) return null;
  // The denominator. At or above the required return the formula returns a
  // negative number that is not a price.
  if (growthPercent >= requiredReturnPercent) return null;

  const growth = growthPercent / 100;
  const required = requiredReturnPercent / 100;

  // D0 is grown once; D1 is used as given. A factor of (1 + g) apart.
  const nextDividend = dividendIsNext ? dividend : dividend * (1 + growth);
  const intrinsicValue = nextDividend / (required - growth);
  if (!Number.isFinite(intrinsicValue) || intrinsicValue <= 0) return null;

  let echoedPrice: number | null = null;
  let premiumDiscountPercent: number | null = null;
  let verdict: DdmResult["verdict"] = null;
  let impliedGrowthPercent: number | null = null;
  let impliedReturnPercent: number | null = null;

  if (price !== undefined) {
    if (!Number.isFinite(price) || price <= 0) return null;
    echoedPrice = price;
    premiumDiscountPercent = ((price - intrinsicValue) / intrinsicValue) * 100;
    verdict =
      Math.abs(premiumDiscountPercent) <= FAIR_BAND_PERCENT
        ? "fair"
        : premiumDiscountPercent < 0
          ? "undervalued"
          : "overvalued";

    // Implied growth. With D1 fixed:      P = D1/(r − g)  →  g = r − D1/P.
    // With D0 given, D1 moves with g:     P = D0(1+g)/(r − g)
    //                                     →  g = (P·r − D0)/(P + D0).
    const impliedGrowth = dividendIsNext
      ? required - dividend / price
      : (price * required - dividend) / (price + dividend);
    impliedGrowthPercent = Number.isFinite(impliedGrowth)
      ? impliedGrowth * 100
      : null;

    // Implied return, holding the growth assumption fixed.
    impliedReturnPercent = (nextDividend / price + growth) * 100;
  }

  return {
    nextDividend,
    intrinsicValue,
    dividendYieldPercent: (nextDividend / intrinsicValue) * 100,
    capitalGainsYieldPercent: growthPercent,
    totalReturnPercent:
      (nextDividend / intrinsicValue) * 100 + growthPercent,
    price: echoedPrice,
    premiumDiscountPercent,
    verdict,
    impliedGrowthPercent,
    impliedReturnPercent,
  };
}
