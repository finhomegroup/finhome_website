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

import {
  amortize,
  amortizeFlatPrincipal,
  pmt,
  type ScheduleRow,
} from "@/lib/calc/finance";

/**
 * How the principal is repaid.
 *
 * Both are offered by Vietnamese banks and the choice changes both the first
 * instalment and the lifetime interest, so it is an input rather than an
 * assumption the tool makes silently on the borrower's behalf.
 */
export type RepaymentMethod =
  /** Level instalment for the whole term — "trả góp đều" / niên kim. */
  | "annuity"
  /** Constant principal slice, falling instalment — "trả gốc đều". */
  | "flatPrincipal";

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
  /** Repayment structure. Defaults to `"annuity"`, the level instalment. */
  method?: RepaymentMethod;
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
  /** Which structure produced this schedule. */
  method: RepaymentMethod;
  /**
   * Scheduled principal-and-interest instalment, per month — what the BANK
   * asks for, with no extra payment in it.
   *
   * Under `flatPrincipal` there is no single instalment: this is the FIRST
   * month's, which is the highest one and the one a borrower has to be able to
   * find. `finalScheduledPrincipalInterest` is the other end of the range.
   */
  monthlyPrincipalInterest: number;
  /**
   * The principal-and-interest of the last instalment on the ORIGINAL
   * schedule — the one with no extra payment.
   *
   * A REFERENCE figure, not the borrower's actual last payment. Under
   * `annuity` it equals `monthlyPrincipalInterest`; under `flatPrincipal` it
   * is the cheapest scheduled month. With an extra payment the loan ends
   * earlier and the real last payment is `finalMonthOutflow`, which is
   * usually much smaller. The two must never be labelled as though one were a
   * component of the other.
   */
  referenceFinalInstalment: number;
  /**
   * Principal + interest actually paid in the final month of the ACTUAL
   * schedule, excluding escrow and PMI.
   *
   * `finalMonthOutflow` is this plus whichever recurring costs still apply.
   */
  actualFinalPrincipalInterest: number;
  /** PMI charged per month while it applies, 0 when not applicable. */
  monthlyPmi: number;
  /** Tax + insurance + other fees, converted to a monthly figure. */
  monthlyEscrow: number;
  /**
   * The SCHEDULED monthly bill: principal, interest, PMI and escrow.
   *
   * This deliberately excludes `extraPerMonth`. It is the figure the bank
   * collects, which is what a borrower recognises from their contract — but on
   * its own it is NOT what leaves their account when they are also paying
   * extra. That is `monthlyPlannedOutflow`, and the two must be shown as
   * separate lines: the audit found this page reporting 17.356.465 ₫ as the
   * monthly total while the schedule had already been shortened by a
   * 2.000.000 ₫ monthly extra the borrower was actually paying.
   */
  monthlyPayment: number;
  /** The extra principal the borrower chose to add, per month. 0 when none. */
  monthlyExtra: number;
  /**
   * Everything that actually leaves the borrower's account in a FULL month:
   * `monthlyPayment + monthlyExtra`.
   *
   * Only meaningful while `hasFullMonths` is true. The final month is almost
   * always smaller — see `finalMonthOutflow`.
   */
  monthlyPlannedOutflow: number;
  /**
   * `monthlyPlannedOutflow × 12` — an ANNUALISED full month, not a year of
   * actual payments.
   *
   * Wrong as a "money paid in the first year" figure for anything but a level
   * annuity that runs past twelve months: under `flatPrincipal` the
   * instalment falls every month, a large extra can end the loan inside the
   * year, and PMI can stop partway through. Use `firstYearOutflow` when the
   * label says "in the first year".
   */
  annualisedPlannedOutflow: number;
  /**
   * Money that actually leaves the account over the first twelve months — or
   * over the whole loan when it is shorter.
   *
   * Summed from the real schedule rows, plus escrow for each of those months
   * and PMI only for the months it is charged. This is the figure a
   * first-year label may use.
   */
  firstYearOutflow: number;
  /** How many months `firstYearOutflow` covers: `min(12, months)`. */
  firstYearMonths: number;
  /**
   * What leaves the account in the LAST month of the schedule.
   *
   * Capped at the outstanding balance by construction, so a tiny loan or a
   * very large extra payment cannot report a month that repays more than is
   * owed. Includes escrow, and PMI only if PMI is still being charged then.
   */
  finalMonthOutflow: number;
  /** 1-based index of that final month — the same figure as `months`. */
  finalMonthPeriod: number;
  /**
   * False when the schedule is a single month, i.e. the loan clears before any
   * full month is ever paid. `monthlyPlannedOutflow` describes nothing in that
   * case and the page must show the final month instead.
   */
  hasFullMonths: boolean;
  /** Principal + interest actually paid across the whole schedule. */
  totalPrincipalInterest: number;
  /** Interest alone, across the whole schedule. */
  totalInterest: number;
  /** Everything paid over the life of the loan: P&I + PMI + escrow. */
  totalPayment: number;
  /** `monthlyPayment` × 12 — the scheduled year, excluding any extra. */
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
  principal: number,
  schedule: ScheduleRow[],
  mode: PmiMode,
  propertyPrice: number | undefined,
): number {
  if (mode === "life") return schedule.length;
  if (!propertyPrice || propertyPrice <= 0) return 0;
  const threshold = propertyPrice * 0.8;
  // `amortize` (finance.ts) pushes CLOSING balances, so the opening principal
  // is never a row of the schedule. Without this test `findIndex` matches row 0
  // — already one payment in — and a buyer who is at or below 80% LTV on day
  // one is charged the month the docstring above promises they never owe.
  // `<=` because 80% LTV exactly counts as cleared, matching the row test below.
  if (principal <= threshold) return 0;
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
    method = "annuity",
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

  const build = method === "flatPrincipal" ? amortizeFlatPrincipal : amortize;
  const schedule = build({
    principal: amount,
    ratePerPeriod: monthlyRate,
    periods: termMonths,
    extraPerPeriod: extraPerMonth,
  });
  if (schedule === null) return null;

  // The scheduled instalment ignores any extra payment: it is what the bank
  // asks for, which is the figure a borrower recognises.
  //
  // Under `flatPrincipal` there is no closed form to call — the instalment
  // falls every month — so it is read off a schedule built WITHOUT the extra
  // payment. Reading it off `schedule` instead would fold the borrower's own
  // extra into "what the bank asks for", which is the exact confusion this
  // whole result shape exists to undo.
  let monthlyPrincipalInterest: number;
  let referenceFinalInstalment: number;
  if (method === "flatPrincipal") {
    const scheduled = amortizeFlatPrincipal({
      principal: amount,
      ratePerPeriod: monthlyRate,
      periods: termMonths,
    });
    if (scheduled === null) return null;
    monthlyPrincipalInterest = scheduled[0].payment;
    referenceFinalInstalment = scheduled[scheduled.length - 1].payment;
  } else {
    monthlyPrincipalInterest = Math.abs(pmt(monthlyRate, termMonths, amount));
    referenceFinalInstalment = monthlyPrincipalInterest;
  }
  if (!Number.isFinite(monthlyPrincipalInterest)) return null;
  if (!Number.isFinite(referenceFinalInstalment)) return null;

  const monthlyEscrow =
    (propertyTaxPerYear + insurancePerYear + otherFeePerYear) / 12;
  const pmiPerMonth = (pmiPercent / 100) * amount / 12;
  const pmiMonths = pmiPerMonth > 0
    ? pmiMonthsFor(amount, schedule, pmiMode, propertyPrice)
    : 0;
  // "0 when not applicable", per the field doc on `monthlyPmi` above: if PMI is
  // charged for no months it is not part of the monthly bill either. Zeroing the
  // field rather than only excluding it from `monthlyPayment` keeps the rendered
  // "Trong đó PMI" row from contradicting "Tổng trả hằng tháng" — and
  // `totalPayment` below already multiplies by `pmiMonths`, so the monthly and
  // the lifetime figure must not disagree.
  const monthlyPmi = pmiMonths > 0 ? pmiPerMonth : 0;

  const totalPrincipalInterest = total(schedule, "payment");
  const totalInterest = total(schedule, "interest");
  const totalPayment =
    totalPrincipalInterest +
    monthlyPmi * pmiMonths +
    monthlyEscrow * schedule.length;

  const monthlyPayment = monthlyPrincipalInterest + monthlyEscrow + monthlyPmi;
  const monthlyPlannedOutflow = monthlyPayment + extraPerMonth;

  // The final month, read off the schedule rather than recomputed: the
  // schedule already caps its last principal slice at whatever is outstanding,
  // so this cannot report a month that repays more than is owed however large
  // the extra payment is.
  const finalRow = schedule[schedule.length - 1];
  const finalMonthPeriod = schedule.length;
  // PMI is charged for `pmiMonths` months from the start, so it only lands on
  // the final row if that count reaches it.
  const finalMonthPmi = pmiMonths >= finalMonthPeriod ? monthlyPmi : 0;
  const finalMonthOutflow = finalRow.payment + monthlyEscrow + finalMonthPmi;

  // The first twelve months, summed from the ACTUAL rows rather than
  // multiplied out of one of them — see `annualisedPlannedOutflow` for why
  // that difference is not cosmetic.
  const firstYearMonths = Math.min(12, schedule.length);
  const firstYearPrincipalInterest = schedule
    .slice(0, firstYearMonths)
    .reduce((sum, row) => sum + row.payment, 0);
  const firstYearOutflow =
    firstYearPrincipalInterest +
    monthlyEscrow * firstYearMonths +
    monthlyPmi * Math.min(pmiMonths, firstYearMonths);

  let interestSaving: number | null = null;
  let monthsSaved: number | null = null;
  if (extraPerMonth > 0) {
    const baseline = build({
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
    method,
    monthlyPrincipalInterest,
    referenceFinalInstalment,
    actualFinalPrincipalInterest: finalRow.payment,
    monthlyPmi,
    monthlyEscrow,
    monthlyPayment,
    monthlyExtra: extraPerMonth,
    monthlyPlannedOutflow,
    annualisedPlannedOutflow: monthlyPlannedOutflow * 12,
    firstYearOutflow,
    firstYearMonths,
    finalMonthOutflow,
    finalMonthPeriod,
    hasFullMonths: schedule.length > 1,
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
