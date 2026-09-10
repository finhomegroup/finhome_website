/**
 * Tax-equivalent yield, for /cong-cu/loi-suat-tuong-duong-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `tax-equivalent.test.ts`.
 *
 * Two yields quoted before tax are not comparable when one of them is taxed.
 * The fix is to restate both on the same footing, and there are two ways to
 * do it — hence two directions:
 *
 *   taxable equivalent = tax-free yield ÷ (1 − tax rate)
 *   after-tax yield    = taxable yield × (1 − tax rate)
 *
 * The Vietnamese case this exists for is specific and often missed: interest
 * on a personal savings deposit is NOT subject to personal income tax, while
 * a corporate bond coupon and a cash dividend are, at 5%. So a deposit at
 * 5,5% and a bond at 5,8% are not 0,3 points apart — the bond nets 5,51%,
 * which is a dead heat. The tool exists to stop that comparison being made
 * on the quoted numbers.
 *
 * The relationship is not symmetric in the way people expect: dividing by
 * (1 − t) moves a yield further than multiplying by (1 − t) does, so the
 * gross-up is always larger than the haircut. Both directions are provided
 * rather than one, because which is more useful depends on which product the
 * reader already holds.
 */

export type TaxEquivalentDirection =
  /** Have a tax-free yield; find the taxable yield that matches it. */
  | "toTaxable"
  /** Have a taxable yield; find what it is worth after tax. */
  | "toAfterTax";

export type TaxEquivalentInput = {
  direction: TaxEquivalentDirection;
  /** The yield you have, in percent per year. */
  yieldPercent: number;
  /** Tax rate on the taxable product, in percent. Vietnam: 5 on coupons. */
  taxRatePercent: number;
};

export type TaxEquivalentResult = {
  /** The tax-free yield in the comparison. */
  taxFreePercent: number;
  /** The pre-tax yield of the taxable product. */
  taxablePercent: number;
  /** What the taxable product keeps after tax — equal to `taxFreePercent`. */
  afterTaxPercent: number;
  /** Percentage points of yield the tax takes. */
  taxCostPoints: number;
  /**
   * How much extra the taxable product must quote to match, as a percent of
   * the tax-free yield. At a 5% tax rate this is 5,263%, not 5%.
   */
  grossUpPercent: number;
};

/**
 * Put a taxed and an untaxed yield on the same footing.
 *
 * Null when the inputs cannot describe the comparison: a tax rate outside
 * 0–100 (at exactly 100 the gross-up is infinite), or any non-finite number.
 *
 * A negative yield is allowed — a real yield net of higher inflation is
 * genuinely negative, and the arithmetic is unaffected.
 */
export function computeTaxEquivalent(
  input: TaxEquivalentInput,
): TaxEquivalentResult | null {
  const { direction, yieldPercent, taxRatePercent } = input;

  if (!Number.isFinite(yieldPercent)) return null;
  if (!Number.isFinite(taxRatePercent)) return null;
  // At exactly 100% tax no taxable yield can ever match a positive tax-free
  // one, so the gross-up has no finite value.
  if (taxRatePercent < 0 || taxRatePercent >= 100) return null;

  const retention = 1 - taxRatePercent / 100;

  let taxFreePercent: number;
  let taxablePercent: number;

  if (direction === "toTaxable") {
    taxFreePercent = yieldPercent;
    taxablePercent = yieldPercent / retention;
  } else {
    taxablePercent = yieldPercent;
    taxFreePercent = yieldPercent * retention;
  }

  if (!Number.isFinite(taxablePercent) || !Number.isFinite(taxFreePercent)) {
    return null;
  }

  return {
    taxFreePercent,
    taxablePercent,
    // By construction the taxable product nets exactly the tax-free yield.
    afterTaxPercent: taxablePercent * retention,
    taxCostPoints: taxablePercent - taxFreePercent,
    // Dividing by (1 − t) is a bigger move than multiplying by it: at t = 5%
    // the gross-up is 5,263%, not 5%.
    grossUpPercent:
      taxFreePercent !== 0
        ? ((taxablePercent - taxFreePercent) / Math.abs(taxFreePercent)) * 100
        : 0,
  };
}
