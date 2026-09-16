/**
 * A term deposit against the DATE the money is needed, for
 * /cong-cu/tien-gui-co-ky-han/.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. Dates arrive as plain
 * `{year, month, day}` and all calendar arithmetic goes through `dates.ts`, so
 * nothing here depends on a timezone. Unit-tested in `deposit-plan.test.ts`.
 *
 * WHY THIS EXISTS BESIDE `computeTermDeposit`. That module answers "what does
 * a 6-month deposit earn" on a months/12 approximation, which is the right
 * shape for comparing products and the wrong shape for a question about a
 * date: 31/1 to 31/7 is 181 days, and 182 in a leap year, so two deposits with
 * the same "6 tháng" label do not earn the same amount. ORIGINAL ROW 20 asks
 * whether the money will be AVAILABLE on the day it is needed, and that
 * question is made of dates.
 *
 * SO THIS VIEW COUNTS ACTUAL DAYS OVER 365, and says so. Interest for a term
 * is `opening × rate × days ÷ 365`, simple within the term — the Vietnamese
 * convention `computeTermDeposit` already documents, with the days counted
 * rather than assumed. Thông tư 14/2017/TT-NHNN's daily method (balance ×
 * annual rate ÷ 365, summed over the days of the period) is the basis for
 * counting days at all; the SBV's own explanatory note is cited on the page.
 * Neither this module nor that page reproduces any particular contract: a
 * real one may round differently, may treat the first or last day
 * differently, and may move a maturity that falls on a holiday. None of that
 * is modelled and the copy does not claim it is.
 *
 * FOUR THINGS THIS REFUSES TO DO, each because getting it wrong would mislead
 * a saver about their own money:
 *
 * 1. **No interest after the last modelled maturity.** Without renewal the
 *    deposit runs ONE term; a need date after that comes back as
 *    `afterMaturity`, with the matured cash assumed simply held and earning
 *    nothing here. Accruing term interest past maturity while also saying the
 *    money is freely available would be paying for time twice.
 * 2. **A whole withdrawal, declared as such.** Breaking a running term is
 *    modelled as taking the WHOLE deposit at the early rate the reader
 *    entered. Partial withdrawal is a contract feature that not every product
 *    has, so it is not offered rather than assumed.
 * 3. **Future earning time is not a penalty.** The gap between "held to
 *    maturity" and "taken early" splits into two figures that are reported
 *    separately: the RATE difference over the same days, and the interest for
 *    the days not yet run. Calling the sum a penalty overstates the cost of
 *    breaking early by exactly the second part.
 * 4. **Matured cycles are not lost, and not paid twice.** Interest from a term
 *    that already matured is settled money. With renewal it is rolled into the
 *    principal and comes back as principal; without renewal it was already
 *    paid out and is reported as such rather than as new cash at the exit.
 *
 * BOUNDED BEFORE ANYTHING IS ALLOCATED. `computeTermDeposit` loops once per
 * cycle with no cap; this module checks the term length, the cycle count and
 * the total horizon first, so a finite input cannot ask for a million terms.
 */

import {
  addMonths,
  toDayNumber,
  type CalendarDate,
} from "@/lib/calc/dates";
import {
  MAX_DEPOSIT_CYCLES,
  MAX_DEPOSIT_TOTAL_MONTHS,
} from "@/lib/calc/term-deposit";

/** Days a year is divided into. The basis every figure here is quoted on. */
export const DAYS_PER_YEAR = 365;

/**
 * The cycle and horizon bounds, shared with `term-deposit.ts` so the product
 * discloses ONE limit rather than two.
 */
export const MAX_DEPOSIT_TERMS = MAX_DEPOSIT_CYCLES;
export const MAX_DEPOSIT_MONTHS = MAX_DEPOSIT_TOTAL_MONTHS;

export type DepositPlanInput = {
  /** Amount deposited, in đồng. */
  principal: number;
  /** The term rate the reader was quoted, in percent per year. */
  annualRatePercent: number;
  /**
   * The rate applied to an UNFINISHED term if the deposit is broken, in
   * percent per year.
   *
   * The reader's own figure. No market level is assumed here: what a contract
   * pays on an early withdrawal is capped by the institution's own lowest
   * applicable demand-deposit rate at the time of withdrawal, which this
   * module cannot know.
   */
  earlyRatePercent: number;
  /** The day the deposit is opened. */
  start: CalendarDate;
  /** Length of ONE term, in whole months. */
  termMonths: number;
  /** The day the money is needed. */
  needDate: CalendarDate;
  /** Whether principal AND interest roll into a new term at each maturity. */
  renew: boolean;
  /** Override for the cycle bound; capped by `MAX_DEPOSIT_TERMS`. */
  maxTerms?: number;
};

/** One term, dated. */
export type DepositCycle = {
  /** 1-based. */
  index: number;
  start: CalendarDate;
  maturity: CalendarDate;
  /** Actual days from this term's start to its maturity. */
  days: number;
  /** Balance at work in this term. */
  opening: number;
  /** Term interest for the WHOLE term, at the term rate. */
  interest: number;
};

export type DepositPlanStatus =
  /** The money is needed while a term is still running. */
  | "beforeMaturity"
  /** The money is needed exactly on a maturity date. */
  | "atMaturity"
  /** The money is needed after the last modelled maturity. */
  | "afterMaturity"
  /** Reaching the need date would take more terms than are supported. */
  | "beyondLimit";

/**
 * THREE HORIZONS, NEVER MIXED. A renewed deposit has a first term, a current
 * term and a whole plan, and every figure below says which one it belongs to.
 * Reporting the first term's 181 days beside interest earned over 365 was a
 * defect an independent check caught in the first draft of this module.
 */
export type DepositPlan = {
  status: DepositPlanStatus;
  /** Every term modelled up to and including the one that is broken. */
  cycles: DepositCycle[];
  /** The FIRST term's maturity — the date on the passbook. */
  firstMaturity: CalendarDate;
  /** Actual days in the FIRST term, and its interest at the term rate. */
  firstTermDays: number;
  firstTermInterest: number;
  /** The term the need date falls in or on: its start, maturity and length. */
  currentTermStart: CalendarDate;
  currentMaturity: CalendarDate;
  currentTermDays: number;
  /** How many terms were modelled up to the exit. */
  termsElapsed: number;
  /** Echoed: the day the money is needed. */
  needDate: CalendarDate;
  /** Actual days from the DEPOSIT date to the need date — the whole plan. */
  daysFromStart: number;
  /** Days run inside the unfinished term. Null when none is running. */
  daysIntoBrokenTerm: number | null;
  /** Days from the need date to the pending maturity. Null when none pends. */
  daysToPendingMaturity: number | null;
  /** The pending maturity itself, when a term is still running. */
  pendingMaturity: CalendarDate | null;
  /** Interest from terms that already matured. Settled money. */
  maturedInterest: number | null;
  /** Early-rate interest inside the unfinished term. Null when none. */
  brokenInterest: number | null;
  /** Total interest earned through the exit: matured plus broken. */
  interestAtExit: number | null;
  /**
   * The SAME days at the TERM rate: matured interest plus the term rate over
   * the days actually run inside the broken term. Null when no term is broken.
   */
  termRateSameHorizon: number | null;
  /** `termRateSameHorizon − interestAtExit`: the rate difference, same days. */
  rateDifference: number | null;
  /** Interest if the pending term were allowed to finish. Null when none. */
  interestIfHeldToMaturity: number | null;
  /**
   * Interest for the days NOT yet run: `interestIfHeldToMaturity −
   * termRateSameHorizon`. Future earning time, not a penalty.
   */
  foregoneFutureInterest: number | null;
  /** Interest handed over BEFORE the need date. */
  interestAlreadyPaid: number | null;
  /**
   * What the saver HAS on the need date, under this model's assumptions.
   *
   * Distinct from `newPaymentAtNeedDate` on purpose. When the deposit matured
   * earlier, the proceeds were paid then and are assumed simply held — so the
   * money is available on the need date but the bank pays nothing new that
   * day. Reporting only the principal there would drop the matured interest
   * out of the reader's own money; reporting it as a payment would invent one.
   */
  availableAtNeedDate: number | null;
  /** What is actually paid out ON the need date. 0 after maturity. */
  newPaymentAtNeedDate: number | null;
  /** The balance at work being returned, inside `newPaymentAtNeedDate`. */
  principalReturned: number | null;
  /** Interest paid ON the need date, inside `newPaymentAtNeedDate`. */
  interestPaidAtNeedDate: number | null;
  /**
   * True when the proceeds matured EARLIER and are assumed held until the
   * need date without earning anything in this model.
   */
  proceedsHeldSinceMaturity: boolean;
  /** True when reaching the money requires breaking a running term. */
  requiresEarlyWithdrawal: boolean;
};

/** Actual days between two dates. Null when either does not exist. */
function daysBetween(from: CalendarDate, to: CalendarDate): number | null {
  const a = toDayNumber(from);
  const b = toDayNumber(to);
  if (a === null || b === null) return null;
  return b - a;
}

/** `balance × rate × days ÷ 365`, the one interest expression here. */
function simpleInterest(
  balance: number,
  annualRatePercent: number,
  days: number,
): number {
  return (balance * (annualRatePercent / 100) * days) / DAYS_PER_YEAR;
}

/**
 * Plan a deposit against the date the money is needed.
 *
 * Null when the inputs cannot describe one: a non-positive principal or term,
 * a negative rate, a non-integer term, a date that does not exist, a need date
 * BEFORE the deposit date, or any non-finite figure. A need date the model
 * cannot reach inside its bound is NOT null — it comes back as
 * `beyondLimit`, which is an answer the page reports.
 */
export function planDeposit(input: DepositPlanInput): DepositPlan | null {
  const {
    principal,
    annualRatePercent,
    earlyRatePercent,
    start,
    termMonths,
    needDate,
    renew,
  } = input;

  const numbers = [principal, annualRatePercent, earlyRatePercent, termMonths];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (principal <= 0) return null;
  if (!Number.isInteger(termMonths) || termMonths < 1) return null;

  // EVERY BOUND IS CHECKED BEFORE THE TERM WALK BELOW, so the loop can only
  // run a supported number of times.
  const maxTerms =
    input.maxTerms === undefined ? MAX_DEPOSIT_TERMS : input.maxTerms;
  if (!Number.isSafeInteger(maxTerms) || maxTerms < 1) return null;
  if (maxTerms > MAX_DEPOSIT_TERMS) return null;
  if (termMonths > MAX_DEPOSIT_MONTHS) return null;
  const terms = Math.min(maxTerms, Math.floor(MAX_DEPOSIT_MONTHS / termMonths));
  if (terms < 1) return null;

  const daysFromStart = daysBetween(start, needDate);
  if (daysFromStart === null) return null;
  // The money cannot be needed before it is deposited. Rejected, not clamped:
  // the reader has mistyped one of two dates and only they know which.
  if (daysFromStart < 0) return null;

  const firstMaturity = addMonths(start, termMonths);
  if (firstMaturity === null) return null;
  const firstTermDays = daysBetween(start, firstMaturity);
  if (firstTermDays === null) return null;
  const firstTermInterest = simpleInterest(
    principal,
    annualRatePercent,
    firstTermDays,
  );
  if (!Number.isFinite(firstTermInterest)) return null;

  const cycles: DepositCycle[] = [];
  let opening = principal;
  let cycleStart = start;
  let maturedInterest = 0;
  /** Set when the need date lands inside a term, or on a maturity. */
  let resolved: {
    status: DepositPlanStatus;
    broken: DepositCycle | null;
  } | null = null;

  for (let index = 1; index <= terms; index += 1) {
    const maturity = addMonths(cycleStart, termMonths);
    if (maturity === null) return null;
    const days = daysBetween(cycleStart, maturity);
    if (days === null) return null;
    const interest = simpleInterest(opening, annualRatePercent, days);
    if (!Number.isFinite(interest)) return null;
    const cycle: DepositCycle = {
      index,
      start: cycleStart,
      maturity,
      days,
      opening,
      interest,
    };
    cycles.push(cycle);

    const daysToMaturity = daysBetween(needDate, maturity);
    if (daysToMaturity === null) return null;
    if (daysToMaturity > 0) {
      // The need date falls inside this term.
      resolved = { status: "beforeMaturity", broken: cycle };
      break;
    }
    if (daysToMaturity === 0) {
      // Exactly on a maturity date: the term finished, nothing is broken.
      maturedInterest += interest;
      resolved = { status: "atMaturity", broken: null };
      break;
    }

    // This term matured before the money was needed.
    maturedInterest += interest;
    if (!renew) {
      // One term only, and the proceeds then sit outside the model.
      resolved = { status: "afterMaturity", broken: null };
      break;
    }
    // Renewal: principal AND interest go to work in the next term.
    opening += interest;
    cycleStart = maturity;
  }

  const last = cycles[cycles.length - 1];

  if (resolved === null) {
    /**
     * The walk ran out of supported terms before reaching the need date.
     *
     * EVERY EXIT FIGURE IS NULL here, not zero. The horizon was never
     * reached, so there is no interest "at the exit", no cash and no already
     * paid amount — and a 0 in any of those places reads as a computed
     * answer. The dates and cycles that WERE modelled stay, because they are
     * real and they are what the page's recovery sentence talks about.
     */
    const unreached: DepositPlan = {
      status: "beyondLimit",
      cycles,
      firstMaturity,
      firstTermDays,
      firstTermInterest,
      currentTermStart: last.start,
      currentMaturity: last.maturity,
      currentTermDays: last.days,
      termsElapsed: cycles.length,
      needDate,
      daysFromStart,
      daysIntoBrokenTerm: null,
      daysToPendingMaturity: null,
      pendingMaturity: null,
      maturedInterest: null,
      brokenInterest: null,
      interestAtExit: null,
      termRateSameHorizon: null,
      rateDifference: null,
      interestIfHeldToMaturity: null,
      foregoneFutureInterest: null,
      interestAlreadyPaid: null,
      availableAtNeedDate: null,
      newPaymentAtNeedDate: null,
      principalReturned: null,
      interestPaidAtNeedDate: null,
      proceedsHeldSinceMaturity: false,
      requiresEarlyWithdrawal: false,
    };
    // The guard runs on THIS branch too: the accumulation above is arithmetic
    // and a non-finite figure in it is a broken plan, not a bounded one.
    return finiteOrNull(unreached, [maturedInterest, opening]);
  }

  const broken = resolved.broken;
  const daysIntoBrokenTerm =
    broken === null ? null : daysBetween(broken.start, needDate);
  if (broken !== null && daysIntoBrokenTerm === null) return null;

  const brokenInterest =
    broken === null || daysIntoBrokenTerm === null
      ? null
      : simpleInterest(broken.opening, earlyRatePercent, daysIntoBrokenTerm);

  // The same days at the TERM rate — the honest comparison, because it holds
  // the horizon fixed and changes only the rate.
  const termRateSameHorizon =
    broken === null || daysIntoBrokenTerm === null
      ? null
      : maturedInterest +
        simpleInterest(broken.opening, annualRatePercent, daysIntoBrokenTerm);

  const interestIfHeldToMaturity =
    broken === null ? null : maturedInterest + broken.interest;

  const interestAtExit = maturedInterest + (brokenInterest ?? 0);

  /**
   * WHAT IS AVAILABLE, AND WHAT IS PAID. Two different questions.
   *
   * - Breaking a running term, or landing exactly on a maturity: the bank
   *   hands over the balance at work plus the interest for that term, all on
   *   the need date. Available and paid are the same figure.
   * - After the deposit matured: the proceeds — principal AND its interest —
   *   were paid on the MATURITY date and are assumed simply held. So the
   *   money is available on the need date, the bank pays nothing new that
   *   day, and the matured interest is part of what the saver has rather than
   *   part of a new payment. Reporting only the principal would lose that
   *   interest; reporting a payment would invent one.
   *
   * With renewal there is no earlier payout at all: matured interest was
   * rolled into the principal and returns as principal.
   */
  let principalReturned: number;
  let interestPaidAtNeedDate: number;
  let interestAlreadyPaid: number;
  let availableAtNeedDate: number;
  let newPaymentAtNeedDate: number;
  if (resolved.status === "afterMaturity") {
    principalReturned = 0;
    interestPaidAtNeedDate = 0;
    interestAlreadyPaid = maturedInterest;
    availableAtNeedDate = principal + maturedInterest;
    newPaymentAtNeedDate = 0;
  } else if (broken !== null) {
    principalReturned = broken.opening;
    interestPaidAtNeedDate = brokenInterest ?? 0;
    interestAlreadyPaid = 0;
    newPaymentAtNeedDate = principalReturned + interestPaidAtNeedDate;
    availableAtNeedDate = newPaymentAtNeedDate;
  } else {
    // On a maturity date: the term that just finished pays its interest now,
    // and its opening balance already contains any earlier interest that was
    // rolled in — so nothing here was paid out before this date. Without
    // renewal this branch can only be the FIRST maturity, where there is no
    // earlier interest at all.
    principalReturned = last.opening;
    interestPaidAtNeedDate = last.interest;
    interestAlreadyPaid = 0;
    newPaymentAtNeedDate = principalReturned + interestPaidAtNeedDate;
    availableAtNeedDate = newPaymentAtNeedDate;
  }

  const plan: DepositPlan = {
    status: resolved.status,
    cycles,
    firstMaturity,
    firstTermDays,
    firstTermInterest,
    // The term the need date falls in or on — NOT the first one, which is a
    // different date and a different number of days once a term is renewed.
    currentTermStart: last.start,
    currentMaturity: last.maturity,
    currentTermDays: last.days,
    termsElapsed: cycles.length,
    needDate,
    daysFromStart,
    daysIntoBrokenTerm,
    daysToPendingMaturity:
      broken === null ? null : daysBetween(needDate, broken.maturity),
    pendingMaturity: broken === null ? null : broken.maturity,
    maturedInterest,
    brokenInterest,
    interestAtExit,
    termRateSameHorizon,
    rateDifference:
      termRateSameHorizon === null
        ? null
        : termRateSameHorizon - interestAtExit,
    interestIfHeldToMaturity,
    foregoneFutureInterest:
      interestIfHeldToMaturity === null || termRateSameHorizon === null
        ? null
        : interestIfHeldToMaturity - termRateSameHorizon,
    interestAlreadyPaid,
    availableAtNeedDate,
    newPaymentAtNeedDate,
    principalReturned,
    interestPaidAtNeedDate,
    proceedsHeldSinceMaturity: resolved.status === "afterMaturity",
    // Only a term that is still running has to be broken. A need date on a
    // maturity date, or after the deposit has already matured, does not.
    requiresEarlyWithdrawal: resolved.status === "beforeMaturity",
  };

  return finiteOrNull(plan, []);
}

/**
 * FINITE INPUTS DO NOT PROVE FINITE OUTPUTS.
 *
 * Every figure a plan carries is checked before it is returned — including on
 * the `beyondLimit` branch, which returns early and so used to skip this.
 * `extra` covers accumulations that are not fields on the plan itself.
 */
function finiteOrNull(
  plan: DepositPlan,
  extra: readonly number[],
): DepositPlan | null {
  const figures: (number | null)[] = [
    plan.interestAtExit,
    plan.availableAtNeedDate,
    plan.newPaymentAtNeedDate,
    plan.principalReturned,
    plan.interestPaidAtNeedDate,
    plan.maturedInterest,
    plan.brokenInterest,
    plan.termRateSameHorizon,
    plan.rateDifference,
    plan.interestIfHeldToMaturity,
    plan.foregoneFutureInterest,
    plan.interestAlreadyPaid,
    ...extra,
    ...plan.cycles.flatMap((cycle) => [cycle.opening, cycle.interest]),
  ];
  if (figures.some((value) => value !== null && !Number.isFinite(value))) {
    return null;
  }
  return plan;
}
