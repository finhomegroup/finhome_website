/**
 * Wage-unit conversion for /cong-cu/luong-gio-sang-luong-thang/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `wage.test.ts`.
 *
 * Every conversion here routes through one hourly rate, so the five figures
 * returned are always mutually consistent — converting an hourly rate up to a
 * yearly one and back always lands on the number you started with. A set of
 * pairwise formulas would drift.
 *
 * The schedule is an INPUT, not a constant, because there is no single right
 * answer: Vietnam's Labour Code caps normal hours at 48 per week, an office
 * contract is usually 40, and "monthly pay" for an hourly worker depends on
 * how many weeks a year you count. So the caller supplies hours per week, days
 * per week and weeks per year, and gets figures that follow from them.
 *
 * A month is a YEAR DIVIDED BY 12, never "4 weeks" or "4,33 weeks". 52 weeks
 * is 12 months of 4,333… weeks, and rounding that per month would make
 * `monthly × 12` disagree with `yearly` by about a week's pay.
 */

export type WageUnit = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export type WageSchedule = {
  /** Working hours per week. */
  hoursPerWeek: number;
  /** Working days per week — needed only for the daily figure. */
  daysPerWeek: number;
  /** Paid weeks per year. 52 counts every week; 48 allows a month unpaid. */
  weeksPerYear: number;
};

export type WageInput = WageSchedule & {
  /** The pay figure the user has. */
  amount: number;
  /** Which unit `amount` is quoted in. */
  unit: WageUnit;
};

export type WageResult = {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  /** Hours in a working day, derived: `hoursPerWeek / daysPerWeek`. */
  hoursPerDay: number;
  /** Hours in a year, derived: `hoursPerWeek × weeksPerYear`. */
  hoursPerYear: number;
};

/**
 * Convert a wage between hourly, daily, weekly, monthly and yearly.
 *
 * Null when the schedule cannot describe working time — a non-positive number
 * of hours, days or weeks, or more days than 7 — or when any input is
 * non-finite or the amount is negative. A zero amount is allowed: it converts
 * to zero everywhere, which is correct rather than a guess.
 */
export function convertWage(input: WageInput): WageResult | null {
  const { amount, unit, hoursPerWeek, daysPerWeek, weeksPerYear } = input;

  const numbers = [amount, hoursPerWeek, daysPerWeek, weeksPerYear];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (amount < 0) return null;
  if (hoursPerWeek <= 0 || daysPerWeek <= 0 || weeksPerYear <= 0) return null;
  if (daysPerWeek > 7) return null;

  const hoursPerDay = hoursPerWeek / daysPerWeek;
  const hoursPerYear = hoursPerWeek * weeksPerYear;

  // Everything is expressed as an hourly rate first; the rest follow from it.
  let hourly: number;
  switch (unit) {
    case "hourly":
      hourly = amount;
      break;
    case "daily":
      hourly = amount / hoursPerDay;
      break;
    case "weekly":
      hourly = amount / hoursPerWeek;
      break;
    case "monthly":
      hourly = (amount * 12) / hoursPerYear;
      break;
    case "yearly":
      hourly = amount / hoursPerYear;
      break;
  }

  const yearly = hourly * hoursPerYear;

  return {
    hourly,
    daily: hourly * hoursPerDay,
    weekly: hourly * hoursPerWeek,
    // A month is a twelfth of a year, not four weeks. See the module note.
    monthly: yearly / 12,
    yearly,
    hoursPerDay,
    hoursPerYear,
  };
}
