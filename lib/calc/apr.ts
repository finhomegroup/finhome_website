/**
 * Annual percentage rate for /cong-cu/apr/ and /cong-cu/apr-nang-cao/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `apr.test.ts`.
 *
 * APR answers the one question a headline rate cannot: what does this loan
 * cost once the fees are counted? The mechanism is that fees change what you
 * RECEIVE without changing what you PAY, so the rate implied by the actual
 * cash flows is higher than the rate in the contract.
 *
 * Two kinds of fee, and they work differently — which is why they are
 * separate inputs rather than one total:
 *
 * - **Paid up front** (điểm chiết khấu, phí thẩm định, công chứng, bảo hiểm
 *   năm đầu). These reduce the net proceeds. The payment is unchanged, so the
 *   whole effect lands on the APR.
 * - **Financed** (rolled into the principal). These raise the amount interest
 *   is charged on, so the payment goes up while the net proceeds stay the
 *   same. The APR still rises, but the borrower feels it monthly instead.
 *
 * The APR itself is solved numerically — there is no closed form — via
 * `solveRate`, and it comes back null rather than a guess when the cash flows
 * do not bracket a rate. The result is quoted as a NOMINAL annual rate
 * (periodic × 12), which is the disclosure convention, and the effective
 * annual rate is reported alongside because they are not the same number and
 * the difference is not small at high rates.
 *
 * `payoffMonths` exists because APR assumes the loan runs to term, and most
 * do not. Repay early and the fees are spread over fewer months, so the real
 * cost is higher — sometimes dramatically. That case is solved as the same
 * cash flows plus a balloon of the outstanding balance.
 */

import { amortize, pmt, solveRate, toEffective } from "@/lib/calc/finance";

export type AprInput = {
  /** Amount you want in hand, in đồng, before any fees. */
  amount: number;
  /** Contract nominal annual rate, in percent. */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
  /** Fees paid in cash at drawdown. Reduce the net proceeds. */
  upfrontFees?: number;
  /** Fees added to the principal. Raise the payment. */
  financedFees?: number;
  /** Points: a percent of the principal, paid up front. */
  pointsPercent?: number;
  /** If given, also solve the APR for repaying after this many months. */
  payoffMonths?: number;
};

export type AprResult = {
  /** `amount + financedFees` — what interest is actually charged on. */
  principal: number;
  /** Points in đồng, derived from `principal`. */
  pointsCost: number;
  /** Every fee added up, financed or not. */
  totalFees: number;
  /** What actually reaches you: principal less the fees paid up front. */
  netProceeds: number;
  /** Scheduled instalment on `principal` at the contract rate. */
  monthlyPayment: number;
  /** The monthly rate the real cash flows imply. Null when unsolvable. */
  periodicRate: number | null;
  /** APR as a nominal annual rate: `periodicRate × 12 × 100`. */
  aprPercent: number | null;
  /** The same rate compounded — what it actually costs over a year. */
  aprEffectivePercent: number | null;
  /** `aprPercent − annualRatePercent`, in percentage points. */
  aprSpreadPoints: number | null;
  /** Every payment over the full term. */
  totalPaid: number;
  /** Interest alone, over the full term. */
  totalInterest: number;
  /** Interest plus fees: the whole cost of borrowing. */
  totalCost: number;
  /** Echoed back, clamped to the term. Null when no early payoff was asked. */
  payoffMonths: number | null;
  /** Balance outstanding at `payoffMonths`. */
  payoffBalance: number | null;
  /** APR if the loan is cleared at `payoffMonths`, as a nominal annual rate. */
  payoffAprPercent: number | null;
};

/**
 * Compute the APR of a loan.
 *
 * Null when the inputs cannot describe one: a non-positive amount or term, a
 * negative rate or fee, points at or above 100%, a non-integer number of
 * months, fees paid up front that exceed the principal (you would be paying
 * to receive nothing), or any non-finite number.
 *
 * The APR fields — not the whole result — come back null when `solveRate`
 * cannot bracket a rate. That is a real outcome to surface, not an error: the
 * loan figures are still valid and worth showing.
 */
export function computeApr(input: AprInput): AprResult | null {
  const {
    amount,
    annualRatePercent,
    termMonths,
    upfrontFees = 0,
    financedFees = 0,
    pointsPercent = 0,
    payoffMonths,
  } = input;

  const numbers = [
    amount,
    annualRatePercent,
    termMonths,
    upfrontFees,
    financedFees,
    pointsPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (amount <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (pointsPercent >= 100) return null;

  // Financed fees are borrowed, so interest is charged on them too.
  const principal = amount + financedFees;
  const pointsCost = principal * (pointsPercent / 100);
  const paidUpFront = upfrontFees + pointsCost;
  // Paying more in fees than the loan is worth is not a loan.
  if (paidUpFront >= principal) return null;

  const netProceeds = principal - paidUpFront;
  const monthlyRate = annualRatePercent / 100 / 12;

  const monthlyPayment = Math.abs(pmt(monthlyRate, termMonths, principal));
  if (!Number.isFinite(monthlyPayment)) return null;

  const schedule = amortize({
    principal,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
  });
  if (schedule === null) return null;

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);

  // The APR: the rate at which the payments discount back to what you got.
  // Outflow-negative convention, so the payment goes in negative and the
  // proceeds positive. A zero balloon means the loan runs to term.
  const periodicRate = solveRate(termMonths, -monthlyPayment, netProceeds);
  const aprPercent = periodicRate === null ? null : periodicRate * 12 * 100;

  // The early-payoff case: same payments for fewer months, then a balloon of
  // whatever is still owed. Spreading the fees over fewer months costs more.
  let clampedPayoff: number | null = null;
  let payoffBalance: number | null = null;
  let payoffAprPercent: number | null = null;

  if (payoffMonths !== undefined) {
    if (!Number.isFinite(payoffMonths) || payoffMonths <= 0) return null;
    if (!Number.isInteger(payoffMonths)) return null;
    clampedPayoff = Math.min(payoffMonths, termMonths);
    payoffBalance = schedule[clampedPayoff - 1].balance;
    const payoffRate = solveRate(
      clampedPayoff,
      -monthlyPayment,
      netProceeds,
      -payoffBalance,
    );
    payoffAprPercent = payoffRate === null ? null : payoffRate * 12 * 100;
  }

  return {
    principal,
    pointsCost,
    totalFees: paidUpFront + financedFees,
    netProceeds,
    monthlyPayment,
    periodicRate,
    aprPercent,
    aprEffectivePercent:
      periodicRate === null ? null : toEffective(periodicRate * 12, 12) * 100,
    aprSpreadPoints: aprPercent === null ? null : aprPercent - annualRatePercent,
    totalPaid,
    totalInterest,
    totalCost: totalInterest + paidUpFront + financedFees,
    payoffMonths: clampedPayoff,
    payoffBalance,
    payoffAprPercent,
  };
}
