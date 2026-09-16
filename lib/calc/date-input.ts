/**
 * Reading a year/month/day trio out of three raw form strings.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. Unit-tested in
 * `date-input.test.ts`.
 *
 * Three calculators now take a calendar date from the reader — `/cong-cu/
 * tinh-ngay/`, the home-fund goal's start date and the term deposit's
 * deposit/needed dates — and all three need the same two things: the date, and
 * WHICH field to blame when there is not one. This is that step, once.
 *
 * The blame split is the part worth having in one place, and it came out of a
 * shipped defect on the date page:
 *
 * - **The day's own range** (an integer in 1–31) exists in SOME month, so
 *   blaming the day for 32 or 0 is truthful even while the year is blank.
 * - **Whether that day exists** depends on the month (31 tháng 4) and, for 29
 *   February, on the year — so that half waits until the other two fields
 *   parse. Reddening Ngày because Năm was mid-edit announced a reason that was
 *   not true.
 *
 * `parseDecimal`, not `parseCount`: a year may be typed with a leading sign in
 * neither grammar, but the date page's fields accept a bare integer and
 * `parseCount` would reject the empty-but-editing state the same way — the
 * difference that matters is that `parseDecimal` does not eat a "." as
 * thousands grouping, so "1.9" is rejected here rather than becoming 19.
 */

import { isValidDate, type CalendarDate } from "@/lib/calc/dates";
import { parseDecimal } from "@/lib/calc/number";

export type DateFieldsReading = {
  /** The date, or null when any of the three fields is unusable. */
  date: CalendarDate | null;
  yearBad: boolean;
  monthBad: boolean;
  dayBad: boolean;
};

/** The narrowest day that exists in any month, and the widest. */
const DAY_MIN = 1;
const DAY_MAX = 31;

/** Parse three form strings into a date, with per-field blame. */
export function readDateFields(
  year: string,
  month: string,
  day: string,
): DateFieldsReading {
  const y = parseDecimal(year);
  const m = parseDecimal(month);
  const dd = parseDecimal(day);

  const yearBad = y === null || !Number.isInteger(y);
  const monthBad = m === null || !Number.isInteger(m) || m < 1 || m > 12;
  const dayNumberBad =
    dd === null || !Number.isInteger(dd) || dd < DAY_MIN || dd > DAY_MAX;
  const trioUsable =
    y !== null && !yearBad && m !== null && !monthBad && !dayNumberBad;
  const candidate = trioUsable ? { year: y, month: m, day: dd } : null;
  const dayBad =
    dayNumberBad || (candidate !== null && !isValidDate(candidate));

  return {
    date: candidate !== null && !dayBad ? candidate : null,
    yearBad,
    monthBad,
    dayBad,
  };
}
