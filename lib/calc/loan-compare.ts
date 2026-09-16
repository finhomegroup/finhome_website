/**
 * Side-by-side loan comparison for /cong-cu/so-sanh-khoan-vay/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `loan-compare.test.ts`.
 *
 * WHAT A BUYER IS ACTUALLY CHOOSING BETWEEN, and why the first version of this
 * module could not answer it. It priced each offer as a constant rate held for
 * the whole term. Vietnamese mortgage offers are not that: they quote a
 * promotional rate for 6–24 months and a different rate after it, and a buyer
 * rarely holds the loan to month 240. So an offer is priced here over a
 * COMMON HOLDING HORIZON, with its own promotional path and its own fees, and
 * the debt still outstanding at that horizon is part of the comparison rather
 * than an omission.
 *
 * FOUR MEASURES, KEPT APART ON PURPOSE. They routinely disagree, and the
 * disagreement is the lesson:
 *
 * - `monthlyPayment` / `resetPayment` — cash flow. Never a ranking: the
 *   instalment rewards a longer term, which is the opposite of cheaper.
 * - `costOfBorrowing` — interest plus fees over the FULL term.
 * - `horizonCost` — interest plus fees up to the selected horizon, including
 *   any early-settlement penalty actually charged there. This is what
 *   `bestIndex` ranks on, because it is the question the buyer asked. The
 *   identity `horizonCost = horizonInterest + upfrontFee + exitFeeAtHorizon`
 *   holds by construction and equals
 *   `horizonPaid + horizonBalance − amount + upfrontFee + exitFeeAtHorizon`,
 *   so an offer that merely defers principal cannot look cheap.
 * - `aprPercent` / `horizonAprPercent` — a MODELLED nominal rate implied by
 *   the actual cash flows, including fees. Not a statutory disclosure and not
 *   a bank quotation; see `cash-flow-rate.ts`.
 *
 * RATE PATHS ARE THE USER'S HYPOTHESES. Nothing here forecasts a rate or
 * knows a lender's offer.
 *
 * AN EARLY-SETTLEMENT PENALTY IS CHARGED AT THE HORIZON, NOT AT ORIGINATION.
 * `exitFee` is a separate field for exactly that reason: an earlier version of
 * this module told readers to add a future settlement penalty to the upfront
 * fee box, which is the wrong DATE and therefore the wrong APR — money paid in
 * month 60 is not money surrendered on day one. It applies only when there is
 * still a balance at the horizon, because a loan that has matured is not being
 * settled early.
 *
 * BACKWARD COMPATIBILITY. An option with no promotional fields is still
 * priced by `computeLoan`, exactly as before — not by the phased engine with
 * one phase — so existing callers' figures are unchanged to the đồng. With no
 * `horizonMonths` the horizon defaults to the longest term among the options,
 * where every horizon measure coincides with its full-term twin.
 *
 * `rows` is POSITIONALLY ALIGNED with the options passed in, with `null` at
 * any position that could not be priced, and `unusableIndexes` names those
 * positions. A comparison whose rows silently compacted would report
 * "phương án B is cheapest" while pointing at the column the user typed as C.
 */

import { nominalAnnualPercent, solveMonthlyFlowRate } from "@/lib/calc/cash-flow-rate";
import { computeLoan } from "@/lib/calc/loan";
import {
  buildPhases,
  computeFloatingLoan,
  type PhaseSummary,
} from "@/lib/calc/floating-loan";
import { toEffective, type ScheduleRow } from "@/lib/calc/finance";

/** The longest horizon and term this tool supports, in months. */
export const MAX_COMPARE_MONTHS = 1200;

export type LoanOption = {
  /**
   * Nominal annual rate in percent. With a promotional stretch this is the
   * rate AFTER it — the one that governs most of the term.
   */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
  /** Upfront fee as a percent of the amount borrowed. */
  feePercent?: number;
  /** A further one-off fee in đồng, paid AT ORIGINATION, on top of `feePercent`. */
  upfrontFee?: number;
  /**
   * Early-settlement penalty in đồng, charged AT THE HORIZON.
   *
   * Only applied when a balance is still outstanding there. Never folded into
   * `upfrontFee`: the two are paid on different dates and an APR is sensitive
   * to which.
   */
  exitFee?: number;
  /** Months at the promotional rate. 0 or absent means no promotional rate. */
  promoMonths?: number;
  /** Promotional nominal annual rate in percent. */
  promoRatePercent?: number;
};

export type LoanComparisonRow = {
  /** Position of this option in the input array. */
  index: number;
  /** Scheduled instalment in force at month 1. */
  monthlyPayment: number;
  /** Instalment after the promotional reset. Equals `monthlyPayment` without one. */
  resetPayment: number;
  /** First month on the post-promotional rate. Null without a promotional stretch. */
  resetMonth: number | null;
  /** Phase summaries when the option has a promotional stretch. */
  phases: PhaseSummary[] | null;
  /** Interest alone, across the whole term. */
  totalInterest: number;
  /** Every upfront fee in đồng, percent-based and one-off together. */
  upfrontFee: number;
  /**
   * The early-settlement penalty actually charged at the horizon.
   *
   * 0 when none was entered OR when the loan has matured by then, because a
   * matured loan is not being settled early.
   */
  exitFeeAtHorizon: number;
  /** Interest plus fees: what borrowing under this option costs in full. */
  costOfBorrowing: number;
  /** Principal + interest + fees — everything that leaves the borrower. */
  totalOutlay: number;
  /** Months the schedule runs. */
  months: number;

  /** The horizon this row was measured over: `min(selected, months)`. */
  horizonMonths: number;
  /** Instalments actually paid up to the horizon. */
  horizonPaid: number;
  /** Interest inside the horizon. */
  horizonInterest: number;
  /** Principal retired inside the horizon. */
  horizonPrincipal: number;
  /** Debt still owed at the horizon. 0 once the loan has matured. */
  horizonBalance: number;
  /**
   * `horizonInterest + upfrontFee + exitFeeAtHorizon`. What `bestIndex` ranks
   * on, and the only measure that carries the settlement penalty — the
   * full-term `costOfBorrowing` cannot, because a loan held to maturity is
   * never settled early.
   */
  horizonCost: number;

  /** Modelled nominal APR over the full term. Null when unsolvable. */
  aprPercent: number | null;
  /** The same rate compounded, for readers who want the annual equivalent. */
  aprEffectivePercent: number | null;
  /** Modelled nominal APR if the debt is settled at the horizon. */
  horizonAprPercent: number | null;

  /** How much dearer at the horizon than the cheapest. Exactly 0 on the winner. */
  extraVsBest: number;
  /** The same over the full term. */
  extraVsBestFullTerm: number;
};

export type LoanComparison = {
  /** The shared principal every option is quoted against. */
  amount: number;
  /** The horizon the comparison was measured over. */
  horizonMonths: number;
  /** True when the caller did not choose one and the longest term was used. */
  horizonIsDefault: boolean;
  /** Aligned with the input options; `null` where an option was unusable. */
  rows: (LoanComparisonRow | null)[];
  /** Positions that were supplied but could not be priced. */
  unusableIndexes: number[];
  /** Index into `rows` of the cheapest option AT THE HORIZON. */
  bestIndex: number;
  /** Index of the cheapest option over the FULL term. May differ. */
  bestFullTermIndex: number;
  /** True when the two winners are different options. */
  horizonChangesWinner: boolean;
  /** Horizon cost under the dearest option less the cheapest. */
  spread: number;
  /** The same over the full term. */
  fullTermSpread: number;
};

/**
 * What the loan looks like month by month, however its rate moves.
 *
 * A HALF-SPECIFIED PROMOTION IS REJECTED, NOT DOWNGRADED. An earlier version
 * of this module fell back to a constant post-promotional loan whenever the
 * promotional pair was unusable — a positive duration with no rate, or a
 * duration reaching the whole term. An independent review reproduced the
 * consequence in the live UI: an offer whose promotional rate was the text
 * `abc` was priced and RANKED as a constant 11% loan the reader never
 * described, with the invalid field still on screen. Pricing a different
 * contract is worse than declining to price one, so the option comes back
 * `null`, its position is preserved, and `unusableIndexes` names it.
 *
 * `promoMonths: 0` with no rate is not half a promotion — it is the absence of
 * one, and stays a plain constant-rate loan.
 */
function scheduleOf(
  amount: number,
  option: LoanOption,
): { schedule: ScheduleRow[]; phases: PhaseSummary[] | null } | null {
  const promoMonths = option.promoMonths ?? 0;
  const promoRatePercent = option.promoRatePercent;
  const promoRateGiven =
    promoRatePercent !== undefined && Number.isFinite(promoRatePercent);

  if (promoMonths === 0 && !promoRateGiven) {
    // `computeLoan`, NOT the phased engine with a single phase: the two round
    // the final instalment differently, and existing callers' figures must not
    // move by a đồng.
    const loan = computeLoan({
      amount,
      annualRatePercent: option.annualRatePercent,
      termMonths: option.termMonths,
    });
    return loan === null ? null : { schedule: loan.schedule, phases: null };
  }

  // Anything else is a promotional offer, and every part of it has to be
  // usable: a duration without a rate, a rate without a duration, or a
  // duration that swallows the term describes no contract this model can
  // price.
  if (promoMonths <= 0 || !promoRateGiven) return null;
  if (promoMonths >= option.termMonths) return null;

  const phases = buildPhases({
    termMonths: option.termMonths,
    promoMonths,
    promoRatePercent: promoRatePercent as number,
    postRatePercent: option.annualRatePercent,
  });
  if (phases === null) return null;
  const result = computeFloatingLoan({ amount, phases });
  return result === null
    ? null
    : { schedule: result.schedule, phases: result.phases };
}

/** One option's figures, before the cross-option comparison. */
function priceOption(
  amount: number,
  option: LoanOption,
  index: number,
  selectedHorizon: number,
): LoanComparisonRow | null {
  const {
    annualRatePercent,
    termMonths,
    feePercent = 0,
    upfrontFee: flatFee = 0,
    exitFee = 0,
    promoMonths = 0,
    promoRatePercent = 0,
  } = option;

  const numbers = [
    annualRatePercent,
    termMonths,
    feePercent,
    flatFee,
    exitFee,
    promoMonths,
    promoRatePercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (!Number.isInteger(termMonths) || termMonths < 1) return null;
  if (termMonths > MAX_COMPARE_MONTHS) return null;
  if (!Number.isInteger(promoMonths)) return null;

  const built = scheduleOf(amount, option);
  if (built === null) return null;
  const { schedule, phases } = built;
  if (schedule.length === 0) return null;

  const upfrontFeeTotal = (feePercent / 100) * amount + flatFee;

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const months = schedule.length;

  const horizonMonths = Math.min(selectedHorizon, months);
  let horizonPaid = 0;
  let horizonInterest = 0;
  let horizonPrincipal = 0;
  for (let period = 0; period < horizonMonths; period += 1) {
    horizonPaid += schedule[period].payment;
    horizonInterest += schedule[period].interest;
    horizonPrincipal += schedule[period].principal;
  }
  const horizonBalance =
    horizonMonths === 0 ? amount : schedule[horizonMonths - 1].balance;
  // Charged only where there is something to settle early. At maturity the
  // balance is 0 and no penalty applies, however large a figure was entered.
  const exitFeeAtHorizon = horizonBalance > 0 ? exitFee : 0;

  // Flows for the modelled APR: what reached the borrower at month 0, then
  // every instalment. A financed fee would belong in the principal rather than
  // here; this tool's fees are all paid in cash, which the page states.
  const proceeds = amount - upfrontFeeTotal;
  const fullFlows = [proceeds, ...schedule.map((row) => -row.payment)];
  const periodicRate = proceeds > 0 ? solveMonthlyFlowRate(fullFlows) : null;

  // Settling at the horizon: the same instalments for fewer months, then the
  // outstanding balance AND the penalty, both discounted from the month they
  // are actually paid. Putting the penalty at month 0 instead would raise the
  // APR by more than the penalty costs.
  const horizonFlows = [
    proceeds,
    ...schedule.slice(0, horizonMonths).map((row) => -row.payment),
  ];
  if (horizonBalance > 0) {
    horizonFlows[horizonFlows.length - 1] -= horizonBalance + exitFeeAtHorizon;
  }
  const horizonRate =
    proceeds > 0 && horizonFlows.length > 1
      ? solveMonthlyFlowRate(horizonFlows)
      : null;

  const resetMonth = phases === null || phases.length < 2 ? null : phases[1].fromMonth;
  const resetPayment =
    phases === null || phases.length < 2 ? schedule[0].payment : phases[1].payment;

  return {
    index,
    monthlyPayment: phases === null ? schedule[0].payment : phases[0].payment,
    resetPayment,
    resetMonth,
    phases,
    totalInterest,
    upfrontFee: upfrontFeeTotal,
    exitFeeAtHorizon,
    costOfBorrowing: totalInterest + upfrontFeeTotal,
    totalOutlay: totalPaid + upfrontFeeTotal,
    months,
    horizonMonths,
    horizonPaid,
    horizonInterest,
    horizonPrincipal,
    horizonBalance,
    horizonCost: horizonInterest + upfrontFeeTotal + exitFeeAtHorizon,
    aprPercent: nominalAnnualPercent(periodicRate),
    aprEffectivePercent:
      periodicRate === null ? null : toEffective(periodicRate * 12, 12) * 100,
    horizonAprPercent: nominalAnnualPercent(horizonRate),
    // Filled in once every option has been priced.
    extraVsBest: 0,
    extraVsBestFullTerm: 0,
  };
}

/**
 * Compare loan options quoted against the same principal.
 *
 * Null when there is nothing to compare: a non-positive or non-finite amount,
 * an out-of-range horizon, or fewer than two options that could be priced. A
 * single option is a loan calculation, not a comparison —
 * /cong-cu/vay-mua-nha/ is the tool for that.
 *
 * `horizonMonths` is how long the buyer expects to hold the loan. Omit it and
 * the longest term among the options is used, where every horizon measure
 * equals its full-term twin — which is what keeps existing callers' numbers
 * unchanged. 0 is allowed and means "fees paid, nothing repaid yet".
 *
 * Ties are resolved toward the FIRST option. It is the one the borrower listed
 * first, and declaring a later identical option the winner would suggest a
 * difference that does not exist.
 */
export function compareLoans(input: {
  amount: number;
  options: readonly LoanOption[];
  horizonMonths?: number;
}): LoanComparison | null {
  const { amount, options, horizonMonths } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const horizonIsDefault = horizonMonths === undefined;
  if (!horizonIsDefault) {
    if (!Number.isInteger(horizonMonths) || horizonMonths < 0) return null;
    if (horizonMonths > MAX_COMPARE_MONTHS) return null;
  }

  // The default horizon has to be known before any option is priced, so the
  // terms are read first. Only finite, in-range terms count toward it.
  const longestTerm = options.reduce((longest, option) => {
    const term = option.termMonths;
    if (!Number.isInteger(term) || term < 1 || term > MAX_COMPARE_MONTHS) {
      return longest;
    }
    return Math.max(longest, term);
  }, 0);
  const selectedHorizon = horizonIsDefault ? longestTerm : horizonMonths;
  if (selectedHorizon === 0 && horizonIsDefault) return null;

  const rows = options.map((option, index) =>
    priceOption(amount, option, index, selectedHorizon),
  );
  const priced = rows.filter((row): row is LoanComparisonRow => row !== null);
  if (priced.length < 2) return null;

  let best = priced[0];
  let dearest = priced[0];
  let bestFullTerm = priced[0];
  let dearestFullTerm = priced[0];
  for (const row of priced) {
    // Strict `<`, so a tie leaves the earlier option as the winner.
    if (row.horizonCost < best.horizonCost) best = row;
    if (row.horizonCost > dearest.horizonCost) dearest = row;
    if (row.costOfBorrowing < bestFullTerm.costOfBorrowing) bestFullTerm = row;
    if (row.costOfBorrowing > dearestFullTerm.costOfBorrowing) {
      dearestFullTerm = row;
    }
  }

  for (const row of priced) {
    row.extraVsBest = row.horizonCost - best.horizonCost;
    row.extraVsBestFullTerm = row.costOfBorrowing - bestFullTerm.costOfBorrowing;
  }

  return {
    amount,
    horizonMonths: selectedHorizon,
    horizonIsDefault,
    rows,
    unusableIndexes: rows
      .map((row, index) => (row === null ? index : -1))
      .filter((index) => index >= 0),
    bestIndex: best.index,
    bestFullTermIndex: bestFullTerm.index,
    horizonChangesWinner: best.index !== bestFullTerm.index,
    spread: dearest.horizonCost - best.horizonCost,
    fullTermSpread:
      dearestFullTerm.costOfBorrowing - bestFullTerm.costOfBorrowing,
  };
}
