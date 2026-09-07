/**
 * United States Treasury bills.
 *
 * A T-bill pays no coupon. It is sold below face value and redeemed at face,
 * and the return is that difference. The reason this needs a calculator is
 * that the rate the Treasury QUOTES is not the rate an investor EARNS, and
 * the quote is always the lower of the two, for two reasons that compound:
 *
 * 1. The discount rate is expressed as a percent of FACE value, but the
 *    investor only ever put up the (lower) price. A 5% discount on 100 is
 *    5 earned on 95 invested, which is 5,26%.
 * 2. The discount rate annualises over a 360-day year while the investment
 *    actually runs on a 365-day calendar. That adds a further 365/360.
 *
 * Both are conventions, not tricks, but a reader comparing a bill's quoted
 * 5,00% against a bank deposit's 5,00% APY is comparing two different
 * quantities, and the gap is real money.
 *
 * ## What this module deliberately does not do
 *
 * The Treasury publishes a "coupon equivalent" for bills longer than 182
 * days using a quadratic formula I would have to transcribe. Transcribed
 * constants and formulas are a known defect class in this repo (see
 * docs/calculator-suite-status.md §8 — I shipped two coefficient sets
 * wrong). So instead this module reports two yields that are derivable from
 * first principles and verifiable by round-trip:
 *
 * - the simple annualised return, (F − P)/P × 365/t
 * - the bond-equivalent yield, the semiannually-compounded rate whose
 *   half-year growth matches the bill's actual growth
 *
 * For bills of 182 days or less the bond-equivalent yield IS the Treasury's
 * coupon equivalent. For longer bills it differs slightly, and the page says
 * so rather than labelling our figure with the Treasury's name.
 */

/** Days used to annualise a discount quote. A convention, not a calendar. */
const DISCOUNT_BASIS = 360;

/** Days in the actual year the investment runs over. */
const ACTUAL_BASIS = 365;

/** Half of the actual basis — one compounding period for a bond equivalent. */
const HALF_YEAR = ACTUAL_BASIS / 2;

export type TbillInput = {
  /** Face value redeemed at maturity, in USD. */
  faceValue: number;
  /** The quoted discount rate, in percent per year on a 360-day basis. */
  discountRatePercent: number;
  /** Days from settlement to maturity. Bills run 4 to 52 weeks. */
  daysToMaturity: number;
  /** Federal marginal rate, in percent. Bill interest is federally taxable. */
  federalRatePercent: number;
  /**
   * State marginal rate, in percent. Treasury interest is EXEMPT from state
   * income tax, so this is here to price that exemption against a
   * comparable taxable instrument, not to charge it.
   */
  stateRatePercent: number;
};

export type TbillResult = {
  /** What the investor pays. */
  price: number;
  /** Face less price — the whole of the return. */
  discountAmount: number;
  /** Return over the holding period, not annualised. */
  periodReturnPercent: number | null;
  /** (F − P)/P × 365/t. The honest simple annual rate. */
  investmentYieldPercent: number | null;
  /** Semiannually compounded. Equals the Treasury coupon equivalent to 182 days. */
  bondEquivalentYieldPercent: number | null;
  /** Annually compounded — what an APY on a deposit means. */
  effectiveAnnualYieldPercent: number | null;
  /**
   * How much the quote understates the simple yield, in percentage points.
   * Always positive for a positive discount rate.
   */
  quoteUnderstatementPoints: number | null;
  /** Federal tax on the discount, and what is left. */
  federalTax: number;
  afterTaxProfit: number;
  afterTaxYieldPercent: number | null;
  /**
   * The rate a STATE-TAXABLE instrument would have to pay to leave the same
   * money after tax. Above the bill's own yield whenever state tax is
   * non-zero — that gap is what the exemption is worth.
   */
  taxableEquivalentYieldPercent: number | null;
  /** True when the bill's term exceeds the Treasury's 182-day short-bill rule. */
  beyondShortBillRule: boolean;
};

/**
 * Price and yield a bill.
 *
 * Null on a non-positive face value, a term outside 1–366 days, a discount
 * rate that would price the bill at or below zero, or tax rates outside
 * 0–100%. A discount rate high enough to zero the price is rejected rather
 * than clamped, because every yield would then divide by zero and the page
 * would be full of dashes with no explanation.
 */
export function computeUsTbill(input: TbillInput): TbillResult | null {
  const {
    faceValue,
    discountRatePercent,
    daysToMaturity,
    federalRatePercent,
    stateRatePercent,
  } = input;

  if (!Number.isFinite(faceValue) || faceValue <= 0) return null;
  if (!Number.isFinite(daysToMaturity)) return null;
  if (!Number.isInteger(daysToMaturity)) return null;
  if (daysToMaturity < 1 || daysToMaturity > 366) return null;
  if (!Number.isFinite(discountRatePercent)) return null;
  if (federalRatePercent < 0 || federalRatePercent > 100) return null;
  if (stateRatePercent < 0 || stateRatePercent > 100) return null;

  const discountRate = discountRatePercent / 100;

  // The Treasury's own pricing formula: discount annualised on 360 days.
  const price = faceValue * (1 - (discountRate * daysToMaturity) / DISCOUNT_BASIS);
  if (price <= 0) return null;

  const discountAmount = faceValue - price;
  const growth = faceValue / price;

  const periodReturnPercent = (discountAmount / price) * 100;
  const investmentYieldPercent =
    (discountAmount / price) * (ACTUAL_BASIS / daysToMaturity) * 100;

  // The semiannually compounded rate whose half-year growth matches the
  // bill's. Derived, not transcribed: solve (1 + i/2)^(t/182,5) = F/P.
  const bondEquivalentYieldPercent =
    (Math.pow(growth, HALF_YEAR / daysToMaturity) - 1) * 2 * 100;

  // Annually compounded — directly comparable with a deposit's APY.
  const effectiveAnnualYieldPercent =
    (Math.pow(growth, ACTUAL_BASIS / daysToMaturity) - 1) * 100;

  const federalTax = discountAmount * (federalRatePercent / 100);
  const afterTaxProfit = discountAmount - federalTax;
  const afterTaxYieldPercent =
    (afterTaxProfit / price) * (ACTUAL_BASIS / daysToMaturity) * 100;

  // A state-taxable instrument keeps only (1 − state rate) of its interest,
  // so it must gross up by that factor to match. Federal tax hits both
  // equally and therefore cancels from the comparison.
  const stateRate = stateRatePercent / 100;
  const taxableEquivalentYieldPercent =
    stateRate >= 1 ? null : investmentYieldPercent / (1 - stateRate);

  return {
    price,
    discountAmount,
    periodReturnPercent,
    investmentYieldPercent,
    bondEquivalentYieldPercent,
    effectiveAnnualYieldPercent,
    quoteUnderstatementPoints: investmentYieldPercent - discountRatePercent,
    federalTax,
    afterTaxProfit,
    afterTaxYieldPercent,
    taxableEquivalentYieldPercent,
    beyondShortBillRule: daysToMaturity > 182,
  };
}
