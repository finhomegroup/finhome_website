/**
 * Home affordability for /cong-cu/kha-nang-mua-nha/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `affordability.test.ts`.
 *
 * This runs the mortgage calculation BACKWARDS: instead of "here is my loan,
 * what is the payment", it is "here is what I can pay, how big a loan is
 * that". The inversion is `pv()` — the present value of the affordable
 * instalment over the term — not a search, so it is exact.
 *
 * The affordable instalment is the binding one of two limits, which is how a
 * bank actually underwrites:
 *
 * - a HOUSING limit, a share of gross income the housing payment may not
 *   exceed;
 * - a TOTAL DEBT limit, a share of gross income that all debt service —
 *   housing plus existing car loans, card minimums, other instalments — may
 *   not exceed.
 *
 * Whichever leaves less room wins, and the result names which one it was. A
 * borrower turned down by their bank almost always hit the second limit while
 * looking at the first.
 *
 * The default limits here are 40% and 50%. Vietnamese banks work in this
 * range rather than to a published statutory cap, so they are inputs with
 * defaults, not constants — and the page says they are a convention.
 *
 * Recurring housing costs other than principal and interest — management
 * fees, property insurance — are subtracted from the affordable instalment
 * BEFORE it is inverted into a loan amount. A tool that ignored them would
 * hand a buyer a figure their real budget cannot carry.
 */

import { pv } from "@/lib/calc/finance";

export type AffordabilityInput = {
  /** Gross household income per month, in đồng. */
  monthlyIncome: number;
  /** Existing debt service per month: car loans, card minimums, other loans. */
  monthlyDebts?: number;
  /** Cash available for the deposit, in đồng. */
  downPayment?: number;
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
  /** Recurring housing costs per month other than principal and interest. */
  monthlyHousingCosts?: number;
  /** Share of gross income the housing payment may take, in percent. */
  housingRatioPercent?: number;
  /** Share of gross income ALL debt service may take, in percent. */
  totalDebtRatioPercent?: number;
};

export type AffordabilityResult = {
  /** Housing budget under the housing limit alone. */
  housingLimit: number;
  /** Housing budget left under the total-debt limit, after existing debts. */
  totalDebtLimit: number;
  /** The binding budget: the smaller of the two, floored at 0. */
  affordableHousingPayment: number;
  /** Which limit bound. `"housing"` on a tie — it is the simpler story. */
  bindingLimit: "housing" | "totalDebt";
  /** What is left for principal and interest after other housing costs. */
  affordablePrincipalInterest: number;
  /** The loan that instalment supports. */
  maxLoan: number;
  /** `maxLoan + downPayment`: the price to shop at. */
  maxPrice: number;
  /** Deposit as a share of `maxPrice`, in percent. Null when the price is 0. */
  downPaymentPercent: number | null;
  /**
   * True when housing costs alone eat the whole budget, so no loan is
   * affordable. `maxLoan` is 0 and the page must say why.
   */
  noRoom: boolean;
};

/**
 * Work out what a buyer can afford.
 *
 * Null when the inputs cannot describe a purchase: a non-positive income or
 * term, a negative rate or amount, a ratio outside 0–100, a non-integer
 * number of months, or any non-finite number.
 *
 * Never null merely because the answer is "nothing": a borrower whose debts
 * already exceed the limit gets `maxLoan: 0` and `noRoom: true`, which is a
 * real answer they need, not an error.
 */
export function computeAffordability(
  input: AffordabilityInput,
): AffordabilityResult | null {
  const {
    monthlyIncome,
    monthlyDebts = 0,
    downPayment = 0,
    annualRatePercent,
    termMonths,
    monthlyHousingCosts = 0,
    housingRatioPercent = 40,
    totalDebtRatioPercent = 50,
  } = input;

  const numbers = [
    monthlyIncome,
    monthlyDebts,
    downPayment,
    annualRatePercent,
    termMonths,
    monthlyHousingCosts,
    housingRatioPercent,
    totalDebtRatioPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (monthlyIncome <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (housingRatioPercent > 100 || totalDebtRatioPercent > 100) return null;

  const housingLimit = monthlyIncome * (housingRatioPercent / 100);
  // The total-debt limit is what is LEFT for housing once existing debt
  // service is taken out, which is why it can come out negative.
  const totalDebtLimit =
    monthlyIncome * (totalDebtRatioPercent / 100) - monthlyDebts;

  const bindingLimit = totalDebtLimit < housingLimit ? "totalDebt" : "housing";
  const affordableHousingPayment = Math.max(
    0,
    Math.min(housingLimit, totalDebtLimit),
  );

  // Other housing costs come out before the instalment is inverted: they are
  // paid every month too, and a buyer's budget does not care which line the
  // money leaves on.
  const affordablePrincipalInterest = Math.max(
    0,
    affordableHousingPayment - monthlyHousingCosts,
  );

  // pv() follows the outflow-negative convention, so the affordable payment
  // goes in negative and the loan comes back positive.
  const monthlyRate = annualRatePercent / 100 / 12;
  const maxLoan =
    affordablePrincipalInterest > 0
      ? pv(monthlyRate, termMonths, -affordablePrincipalInterest)
      : 0;
  if (!Number.isFinite(maxLoan)) return null;

  const maxPrice = maxLoan + downPayment;

  return {
    housingLimit,
    totalDebtLimit,
    affordableHousingPayment,
    bindingLimit,
    affordablePrincipalInterest,
    maxLoan,
    maxPrice,
    downPaymentPercent: maxPrice > 0 ? (downPayment / maxPrice) * 100 : null,
    noRoom: affordablePrincipalInterest <= 0,
  };
}
