/**
 * Calendar arithmetic for /cong-cu/tinh-ngay/.
 *
 * Pure module: no React, no I/O, no DOM — and, critically, **no `Date`**.
 *
 * That constraint is not stylistic. The suite prerenders result strings at
 * build time that the client must hydrate to byte-identically, so a module
 * that read the clock would produce different output on the server and in the
 * browser and break hydration. Anything that needs "today" takes it as a
 * plain `{year, month, day}` passed in by the caller, which the page reads
 * from the client once, after mount.
 *
 * `Date` is also avoided for a second reason: it carries a timezone, and
 * calendar questions do not. "How many days until 30 tháng 4" has one answer
 * regardless of where the browser thinks it is, and involving a timezone
 * would let it be off by one.
 *
 * Everything routes through a day number — days elapsed since a fixed epoch,
 * computed by the standard Fliegel–Van Flandern algorithm. Two dates become
 * two integers and every question becomes arithmetic on them. The algorithm
 * is exact in integer arithmetic for all Gregorian dates, so there is no
 * floating-point drift to worry about.
 *
 * Unit-tested in `dates.test.ts`, including the leap-year rules that are
 * where calendar code actually breaks: 2000 is a leap year, 1900 and 2100 are
 * not.
 */

export type CalendarDate = {
  /** Full year, e.g. 2026. */
  year: number;
  /** 1–12. */
  month: number;
  /** 1–31, validated against the month and year. */
  day: number;
};

/** Days in each month of a non-leap year. */
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Whether a year is a leap year in the Gregorian calendar.
 *
 * Divisible by 4, except centuries, except centuries divisible by 400. The
 * second exception is the one that gets dropped: 1900 and 2100 are NOT leap
 * years, 2000 is.
 */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) return false;
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

/** How many days a given month has. Null for a month outside 1–12. */
export function daysInMonth(year: number, month: number): number | null {
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_LENGTHS[month - 1];
}

/** Whether a date exists in the calendar. */
export function isValidDate(date: CalendarDate): boolean {
  const { year, month, day } = date;
  if (!Number.isInteger(year) || !Number.isInteger(month)) return false;
  if (!Number.isInteger(day)) return false;
  const length = daysInMonth(year, month);
  if (length === null) return false;
  return day >= 1 && day <= length;
}

/**
 * Days elapsed since a fixed epoch, by Fliegel–Van Flandern.
 *
 * Exact in integer arithmetic for every Gregorian date, so differences never
 * drift. Null for a date that does not exist.
 */
export function toDayNumber(date: CalendarDate): number | null {
  if (!isValidDate(date)) return null;
  const { year, month, day } = date;
  // Shift the year so that March is month 0; then February's variable length
  // falls at the end of the year and the leap rule needs no special case.
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** The inverse of `toDayNumber`. Null for a non-integer input. */
export function fromDayNumber(dayNumber: number): CalendarDate | null {
  if (!Number.isInteger(dayNumber)) return null;
  const a = dayNumber + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

/**
 * Advance a date by whole months, clamping the day to the target month.
 *
 * 31 January plus one month is 28 February (29 in a leap year), because there
 * is no 31 February. Clamping is the convention every calendar library uses
 * and the only one that keeps "one month later" a total function.
 *
 * Null for an invalid date or a non-integer month count.
 */
export function addMonths(
  date: CalendarDate,
  months: number,
): CalendarDate | null {
  if (!isValidDate(date)) return null;
  if (!Number.isInteger(months)) return null;
  const zeroBased = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(zeroBased / 12);
  const month = (((zeroBased % 12) + 12) % 12) + 1;
  const length = daysInMonth(year, month);
  if (length === null) return null;
  return { year, month, day: Math.min(date.day, length) };
}

/** Saturday and Sunday, in the 0 = Monday numbering `dayOfWeek` returns. */
const SATURDAY = 5;
const SUNDAY = 6;

/**
 * Whether a raw day number falls on a weekend.
 *
 * Takes a day number rather than a weekday index because every caller in this
 * module is already working in day-number space, and each one otherwise has
 * to repeat the same normalisation: `%` in JavaScript keeps the sign of the
 * dividend, so a day number that lands negative needs `((n % 7) + 7) % 7`
 * before it can be compared against a weekday index.
 */
function isWeekendDayNumber(dayNumber: number): boolean {
  const weekday = ((dayNumber % 7) + 7) % 7;
  return weekday === SATURDAY || weekday === SUNDAY;
}

/** 0 = Monday … 6 = Sunday. Null for an invalid date. */
export function dayOfWeek(date: CalendarDate): number | null {
  const dayNumber = toDayNumber(date);
  if (dayNumber === null) return null;
  // The epoch day number 0 is a Monday under this algorithm's offset.
  return ((dayNumber % 7) + 7) % 7;
}

/** Saturday or Sunday. */
export function isWeekend(date: CalendarDate): boolean {
  const weekday = dayOfWeek(date);
  return weekday === SATURDAY || weekday === SUNDAY;
}

export type DateDifference = {
  /** Signed: negative when `to` is before `from`. */
  days: number;
  /** `|days|`. */
  absoluteDays: number;
  /** Whole weeks in the gap, plus the leftover days. */
  weeks: number;
  remainderDays: number;
  /** Calendar years, months and days between the two dates. */
  years: number;
  months: number;
  dayComponent: number;
  /** Whole months in the gap, ignoring the day component. */
  totalMonths: number;
  /** Days excluding Saturdays and Sundays. Always non-negative. */
  workdays: number;
  /** Weekend days in the gap. */
  weekendDays: number;
  /** Weekday names are the page's job; these are indices, 0 = Monday. */
  fromWeekday: number;
  toWeekday: number;
};

/**
 * Compare two dates.
 *
 * `days` counts the gap, so the same date twice is 0 — not 1. `workdays`
 * counts the days in the half-open interval that are not weekends, which is
 * the convention that makes "Monday to Friday" five working days.
 *
 * Null when either date does not exist.
 */
export function computeDateDifference(input: {
  from: CalendarDate;
  to: CalendarDate;
}): DateDifference | null {
  const { from, to } = input;
  const fromNumber = toDayNumber(from);
  const toNumber = toDayNumber(to);
  if (fromNumber === null || toNumber === null) return null;

  const days = toNumber - fromNumber;
  const absoluteDays = Math.abs(days);

  // Calendar components, always measured from the earlier date forward so
  // the answer reads the same in both directions.
  //
  // Computed by advancing whole CLAMPED months rather than by subtracting
  // fields and borrowing. Borrowing looks simpler and is wrong: from 31
  // January to 1 March, one borrow of February's 28 days still leaves the day
  // component negative. Advancing months and then counting the leftover days
  // is exact and needs no special cases.
  const [earlier, later] = days >= 0 ? [from, to] : [to, from];
  let totalMonths =
    (later.year - earlier.year) * 12 + (later.month - earlier.month);
  if (totalMonths > 0) {
    const advanced = addMonths(earlier, totalMonths);
    // One month too far when the clamped landing point is past `later`.
    if (advanced !== null && toDayNumber(advanced)! > toDayNumber(later)!) {
      totalMonths -= 1;
    }
  } else {
    totalMonths = 0;
  }
  const anchor = addMonths(earlier, totalMonths)!;
  const dayComponent = toDayNumber(later)! - toDayNumber(anchor)!;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // Count weekends over the half-open interval [earlier, later), in constant
  // time: every whole week contributes exactly two weekend days, so only the
  // `absoluteDays % 7` leftover has to be looked at, and the leftover can be
  // taken from the front because the week is periodic.
  //
  // This used to be a day-by-day walk, and unlike its sibling
  // `computeDateOffset` — which refuses a magnitude beyond 100.000 below,
  // because "the weekday walk is a loop, and an unbounded one is a hang" —
  // this path had no bound. `readDate` in the page accepts any integer year
  // and the call sits in the render body with no debounce, so an 8-digit year
  // typed into the free-text year box blocked the main thread for minutes
  // (year 202666 is 73.282.255 days; 20266666 is 7.401.507.775, and the walk
  // goes superlinear once the counter leaves V8's small-integer range).
  //
  // A bound is not the fix here: 1900→2200 is 109.573 days and the suite
  // sweeps that whole span, so any sane bound would reject legitimate
  // questions. The closed form removes the need for one and is exactly
  // behaviour-preserving.
  const startNumber = Math.min(fromNumber, toNumber);
  const fullWeeks = Math.floor(absoluteDays / 7);
  let weekendDays = fullWeeks * 2;
  const leftoverDays = absoluteDays - fullWeeks * 7;
  for (let offset = 0; offset < leftoverDays; offset += 1) {
    if (isWeekendDayNumber(startNumber + offset)) weekendDays += 1;
  }

  return {
    days,
    absoluteDays,
    weeks: Math.floor(absoluteDays / 7),
    remainderDays: absoluteDays % 7,
    years,
    months,
    dayComponent,
    totalMonths: years * 12 + months,
    workdays: absoluteDays - weekendDays,
    weekendDays,
    fromWeekday: dayOfWeek(from)!,
    toWeekday: dayOfWeek(to)!,
  };
}

export type DateOffsetResult = {
  /** The resulting date. */
  date: CalendarDate;
  /** 0 = Monday. */
  weekday: number;
  /** Whether it lands on a Saturday or Sunday. */
  weekend: boolean;
  /** Echoed back. */
  offsetDays: number;
};

/**
 * Add or subtract a number of days from a date.
 *
 * `days` may be negative. When `skipWeekends` is set, only weekdays are
 * counted — so "5 working days after Friday" is the following Friday, and the
 * result is never a weekend. A ZERO offset from a weekend rolls forward to
 * the next working day, which is what keeps that last promise total: the
 * weekday walk below does the normalising for every other offset, but a zero
 * offset never enters it.
 *
 * Null when the date does not exist, when `days` is not an integer, or when
 * `skipWeekends` is asked for with a magnitude beyond a sane bound (the
 * weekday walk is a loop, and an unbounded one is a hang).
 */
export function computeDateOffset(input: {
  from: CalendarDate;
  days: number;
  skipWeekends?: boolean;
}): DateOffsetResult | null {
  const { from, days, skipWeekends = false } = input;
  const fromNumber = toDayNumber(from);
  if (fromNumber === null) return null;
  if (!Number.isInteger(days)) return null;

  let resultNumber: number;
  if (!skipWeekends) {
    resultNumber = fromNumber + days;
  } else {
    // Walking is the only honest way to skip weekends, so it is bounded.
    if (Math.abs(days) > 100_000) return null;
    const step = days >= 0 ? 1 : -1;
    let remaining = Math.abs(days);
    resultNumber = fromNumber;
    while (remaining > 0) {
      resultNumber += step;
      if (!isWeekendDayNumber(resultNumber)) remaining -= 1;
    }
    // A zero offset never enters the walk above, so a weekend start would be
    // handed straight back and break the "never a weekend" contract. Roll
    // forward to the next working day — the Following convention. Only
    // reachable at days === 0, because the walk always stops on a weekday.
    while (isWeekendDayNumber(resultNumber)) resultNumber += 1;
  }

  const date = fromDayNumber(resultNumber);
  if (date === null) return null;
  const weekday = ((resultNumber % 7) + 7) % 7;

  return {
    date,
    weekday,
    weekend: isWeekendDayNumber(resultNumber),
    offsetDays: days,
  };
}
