/** Same-debt, same-month comparison. Pure; no discounting or future exit fees.
 * Signed saving is old minus new. Cash-flow relief is NOT economic saving.
 */
import { computeLoan } from "@/lib/calc/loan";

export type RefinanceInput = {
  balance: number;
  currentRatePercent: number;
  remainingMonths: number;
  newRatePercent: number;
  newTermMonths: number;
  /** Upfront switching costs. Legacy callers may include ALL fees here. */
  closingCosts?: number;
  /** Old settlement fee, only if NOT already included in closingCosts. */
  earlySettlementFee?: number;
  /** Common completed-month horizon, 0–1200. Defaults to both maturities. */
  horizonMonths?: number;
};

export type RefinanceMonth = {
  month: number;
  currentPaid: number;
  newPaid: number;
  currentInterest: number;
  newInterest: number;
  currentBalance: number;
  newBalance: number;
  cashFlowSaving: number;
  costSaving: number;
};

export type RefinanceResult = {
  currentPayment: number;
  newPayment: number;
  monthlySaving: number;
  currentRemainingInterest: number;
  newTotalInterest: number;
  interestSaving: number;
  lifetimeSaving: number;
  /** Compatibility alias: TOTAL upfront fees, including earlySettlementFee. */
  closingCosts: number;
  earlySettlementFee: number;
  newUpfrontFees: number;
  horizonMonths: number;
  horizon: RefinanceMonth;
  horizonCostSaving: number;
  horizonCashFlowSaving: number;
  /** Period zero through the chosen horizon; one source for table and plot. */
  timeline: RefinanceMonth[];
  /** First non-negative COST difference within the chosen horizon, not forever. */
  breakEvenMonths: number | null;
  cashFlowBreakEvenMonths: number | null;
  costTurnsNegativeAgain: boolean;
  termExtended: boolean;
  termShortened: boolean;
  termChangeMonths: number;
};

// Half a đồng is a reporting tolerance, not a floating-point error bound.
// Do not round financial amounts to this band.
const BREAK_EVEN_BAND_DONG = 0.5;

export function compareRefinance(input: RefinanceInput): RefinanceResult | null {
  const { balance, currentRatePercent, remainingMonths, newRatePercent,
    newTermMonths, closingCosts = 0, earlySettlementFee = 0,
    horizonMonths = Math.max(remainingMonths, newTermMonths) } = input;
  if (![closingCosts, earlySettlementFee].every((n) => Number.isFinite(n) && n >= 0)
    || ![remainingMonths, newTermMonths].every((n) => Number.isInteger(n) && n > 0 && n <= 1200)
    || !Number.isInteger(horizonMonths) || horizonMonths < 0 || horizonMonths > 1200) return null;
  const fees = closingCosts + earlySettlementFee;
  if (!Number.isFinite(fees)) return null;
  const current = computeLoan({ amount: balance, annualRatePercent: currentRatePercent, termMonths: remainingMonths });
  const next = computeLoan({ amount: balance, annualRatePercent: newRatePercent, termMonths: newTermMonths });
  if (!current || !next) return null;

  let currentPaid = 0, newPaid = 0, currentInterest = 0, newInterest = 0;
  let currentBalance = balance, newBalance = balance;
  let breakEvenMonths: number | null = null;
  let cashFlowBreakEvenMonths: number | null = null;
  let costTurnsNegativeAgain = false;
  const timeline: RefinanceMonth[] = [];
  for (let month = 0; month <= horizonMonths; month++) {
    if (month > 0) {
      const oldRow = current.schedule[month - 1];
      const newRow = next.schedule[month - 1];
      currentPaid += oldRow?.payment ?? 0;
      newPaid += newRow?.payment ?? 0;
      currentInterest += oldRow?.interest ?? 0;
      newInterest += newRow?.interest ?? 0;
      currentBalance = oldRow?.balance ?? 0;
      newBalance = newRow?.balance ?? 0;
    }
    // Same-principal identity avoids cancellation of large balances.
    // Tests independently check old paid+balance minus new paid+balance+fees.
    const costSaving = currentInterest - newInterest - fees;
    const cashFlowSaving = currentPaid - newPaid - fees;
    timeline.push({ month, currentPaid, newPaid, currentInterest, newInterest,
      currentBalance, newBalance, costSaving, cashFlowSaving });
    if (breakEvenMonths === null && costSaving >= -BREAK_EVEN_BAND_DONG) breakEvenMonths = month;
    if (cashFlowBreakEvenMonths === null && cashFlowSaving >= -BREAK_EVEN_BAND_DONG) cashFlowBreakEvenMonths = month;
    if (breakEvenMonths !== null && costSaving < -BREAK_EVEN_BAND_DONG) costTurnsNegativeAgain = true;
  }
  const horizon = timeline[timeline.length - 1];
  const interestSaving = current.totalInterest - next.totalInterest;
  if (![...Object.values(horizon), interestSaving, interestSaving - fees].every(Number.isFinite)) return null;
  return {
    currentPayment: current.monthlyPrincipalInterest, newPayment: next.monthlyPrincipalInterest,
    monthlySaving: current.monthlyPrincipalInterest - next.monthlyPrincipalInterest,
    currentRemainingInterest: current.totalInterest, newTotalInterest: next.totalInterest,
    interestSaving, lifetimeSaving: interestSaving - fees, closingCosts: fees,
    earlySettlementFee, newUpfrontFees: closingCosts, horizonMonths, horizon,
    horizonCostSaving: horizon.costSaving, horizonCashFlowSaving: horizon.cashFlowSaving,
    timeline, breakEvenMonths, cashFlowBreakEvenMonths, costTurnsNegativeAgain,
    termExtended: newTermMonths > remainingMonths, termShortened: newTermMonths < remainingMonths,
    termChangeMonths: newTermMonths - remainingMonths,
  };
}
