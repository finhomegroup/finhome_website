/**
 * Loan / mortgage computation for /cong-cu/vay-mua-nha/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `loan.test.ts`.
 *
 * Unlike the primitives in `finance.ts`, everything this module RETURNS is
 * positive — it is presentation-shaped, feeding rows a user reads. It calls
 * `pmt` (which follows the Excel outflow-negative convention) and flips the
 * sign once, here, so no calculator page has to think about it.
 *
 * `annualRatePercent` is a nominal annual rate; the monthly period rate is
 * `annualRatePercent / 100 / 12`. This models a FIXED rate for the whole term,
 * matching the reference tool. Vietnamese home loans in practice carry a
 * promotional rate for the first 6–24 months and then float, so a real
 * borrower's payment rises after the promotional period — the page copy says
 * so explicitly rather than leaving the user to assume otherwise.
 */

import { amortize, pmt, type ScheduleRow } from "@/lib/calc/finance";

/** How long private mortgage insurance is charged. */
export type PmiMode =
  /** Until the balance falls to 80% of the property price. */
  | "until80"
  /** For the whole life of the loan. */
  | "life";

export type LoanInput = {
  /** Principal borrowed, in đồng. */
  amount: number;
  /** Nominal annual rate in percent, e.g. 8.5 for 8,5%/năm. */
  annualRatePercent: number;
  /** Term in months. A 20-year loan is 240. */
  termMonths: number;
  /** Optional extra principal paid every month. */
  extraPerMonth?: number;
  /** Recurring costs, each quoted per year. */
  propertyTaxPerYear?: number;
  insurancePerYear?: number;
  otherFeePerYear?: number;
  /** Annual PMI as a percent of the original loan amount. */
  pmiPercent?: number;
  pmiMode?: PmiMode;
  /** Purchase price, needed only for the `until80` PMI test. */
  propertyPrice?: number;
};

export type LoanResult = {
  /** Scheduled principal-and-interest instalment, per month. */
  monthlyPrincipalInterest: number;
  /** PMI charged per month while it applies, 0 when not applicable. */
  monthlyPmi: number;
  /** Tax + insurance + other fees, converted to a monthly figure. */
  monthlyEscrow: number;
  /** What leaves the borrower's account in a typical month, all in. */
  monthlyPayment: number;
  /** Principal + interest actually paid across the whole schedule. */
  totalPrincipalInterest: number;
  /** Interest alone, across the whole schedule. */
  totalInterest: number;
  /** Everything paid over the life of the loan: P&I + PMI + escrow. */
  totalPayment: number;
  /** `monthlyPayment` × 12. */
  annualPayment: number;
  /** Annual P&I divided by the original principal — the mortgage constant. */
  mortgageConstant: number;
  /** How many months PMI is charged for. */
  pmiMonths: number;
  /** Months the schedule actually runs; shorter than `termMonths` with extra payments. */
  months: number;
  schedule: ScheduleRow[];
  /** Interest avoided by the extra payment. Null when there is no extra payment. */
  interestSaving: number | null;
  /** Months knocked off the term by the extra payment. Null when there is none. */
  monthsSaved: number | null;
};

/** Sum a column of the schedule. */
function total(schedule: ScheduleRow[], key: "interest" | "payment"): number {
  return schedule.reduce((sum, row) => sum + row[key], 0);
}

/**
 * How many months PMI applies for.
 *
 * `life` is the whole schedule. `until80` charges it until the outstanding
 * balance first falls to 80% of the purchase price — so a buyer who put 20%
 * down is never charged, which is the real-world behaviour the reference
 * tool's radio button describes.
 */
function pmiMonthsFor(
  schedule: ScheduleRow[],
  mode: PmiMode,
  propertyPrice: number | undefined,
): number {
  if (mode === "life") return schedule.length;
  if (!propertyPrice || propertyPrice <= 0) return 0;
  const threshold = propertyPrice * 0.8;
  const cleared = schedule.findIndex((row) => row.balance <= threshold);
  return cleared === -1 ? schedule.length : cleared + 1;
}

/**
 * Compute a loan.
 *
 * Null when the inputs cannot describe a loan — a non-positive amount or term,
 * a negative rate, or any non-finite number. Callers surface that as "no
 * result" rather than rendering a guess.
 */
export function computeLoan(input: LoanInput): LoanResult | null {
  const {
    amount,
    annualRatePercent,
    termMonths,
    extraPerMonth = 0,
    propertyTaxPerYear = 0,
    insurancePerYear = 0,
    otherFeePerYear = 0,
    pmiPercent = 0,
    pmiMode = "until80",
    propertyPrice,
  } = input;

  const numbers = [
    amount,
    annualRatePercent,
    termMonths,
    extraPerMonth,
    propertyTaxPerYear,
    insurancePerYear,
    otherFeePerYear,
    pmiPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (amount <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;

  const monthlyRate = annualRatePercent / 100 / 12;

  const schedule = amortize({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
    extraPerPeriod: extraPerMonth,
  });
  if (schedule === null) return null;

  // The scheduled instalment ignores any extra payment: it is what the bank
  // asks for, which is the figure a borrower recognises.
  const monthlyPrincipalInterest = Math.abs(pmt(monthlyRate, termMonths, amount));
  if (!Number.isFinite(monthlyPrincipalInterest)) return null;

  const monthlyEscrow =
    (propertyTaxPerYear + insurancePerYear + otherFeePerYear) / 12;
  const monthlyPmi = (pmiPercent / 100) * amount / 12;
  const pmiMonths = monthlyPmi > 0
    ? pmiMonthsFor(schedule, pmiMode, propertyPrice)
    : 0;

  const totalPrincipalInterest = total(schedule, "payment");
  const totalInterest = total(schedule, "interest");
  const totalPayment =
    totalPrincipalInterest +
    monthlyPmi * pmiMonths +
    monthlyEscrow * schedule.length;

  const monthlyPayment = monthlyPrincipalInterest + monthlyEscrow + monthlyPmi;

  let interestSaving: number | null = null;
  let monthsSaved: number | null = null;
  if (extraPerMonth > 0) {
    const baseline = amortize({
      principal: amount,
      ratePerPeriod: monthlyRate,
      periods: termMonths,
    });
    if (baseline !== null) {
      interestSaving = total(baseline, "interest") - totalInterest;
      monthsSaved = baseline.length - schedule.length;
    }
  }

  return {
    monthlyPrincipalInterest,
    monthlyPmi,
    monthlyEscrow,
    monthlyPayment,
    totalPrincipalInterest,
    totalInterest,
    totalPayment,
    annualPayment: monthlyPayment * 12,
    mortgageConstant: (monthlyPrincipalInterest * 12) / amount,
    pmiMonths,
    months: schedule.length,
    schedule,
    interestSaving,
    monthsSaved,
  };
}

export type YearSummary = {
  /** 1-based year index. */
  year: number;
  interest: number;
  principal: number;
  /** Balance outstanding at the end of the year. */
  balance: number;
};

/**
 * Collapse a monthly schedule into one row per year.
 *
 * A 30-year loan is 360 monthly rows; prerendering all of them is real
 * payload, and nobody reads month 197. The yearly view is what the page shows
 * by default.
 */
export function yearlySummary(schedule: ScheduleRow[]): YearSummary[] {
  const years: YearSummary[] = [];
  for (let index = 0; index < schedule.length; index += 1) {
    const row = schedule[index];
    const year = Math.floor(index / 12) + 1;
    let current = years[year - 1];
    if (!current) {
      current = { year, interest: 0, principal: 0, balance: row.balance };
      years[year - 1] = current;
    }
    current.interest += row.interest;
    current.principal += row.principal;
    current.balance = row.balance;
  }
  return years;
}
