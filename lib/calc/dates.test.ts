import { describe, it, expect } from "vitest";
import {
  computeDateDifference,
  computeDateOffset,
  dayOfWeek,
  daysInMonth,
  fromDayNumber,
  isLeapYear,
  isValidDate,
  isWeekend,
  toDayNumber,
  type CalendarDate,
} from "@/lib/calc/dates";

const d = (year: number, month: number, day: number): CalendarDate => ({
  year,
  month,
  day,
});

describe("isLeapYear — the rule that gets dropped", () => {
  it("accepts years divisible by four", () => {
    for (const year of [2024, 2028, 1996, 2016]) {
      expect(isLeapYear(year)).toBe(true);
    }
  });

  it("rejects centuries not divisible by 400", () => {
    // The exception to the exception. This is where calendar code breaks.
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2200)).toBe(false);
  });

  it("accepts centuries divisible by 400", () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
    expect(isLeapYear(1600)).toBe(true);
  });

  it("rejects years not divisible by four", () => {
    for (const year of [2025, 2026, 2027]) {
      expect(isLeapYear(year)).toBe(false);
    }
  });
});

describe("daysInMonth", () => {
  it("gives February 29 days only in a leap year", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
  });

  it("gives the fixed lengths for the other months", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("returns null outside 1–12", () => {
    expect(daysInMonth(2026, 0)).toBeNull();
    expect(daysInMonth(2026, 13)).toBeNull();
    expect(daysInMonth(2026, 1.5)).toBeNull();
  });
});

describe("isValidDate", () => {
  it("rejects a day past the month's length", () => {
    expect(isValidDate(d(2025, 2, 29))).toBe(false);
    expect(isValidDate(d(2024, 2, 29))).toBe(true);
    expect(isValidDate(d(2026, 4, 31))).toBe(false);
    expect(isValidDate(d(2026, 4, 30))).toBe(true);
  });

  it("rejects a day or month at zero", () => {
    expect(isValidDate(d(2026, 1, 0))).toBe(false);
    expect(isValidDate(d(2026, 0, 1))).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(isValidDate(d(2026, 1, 1.5))).toBe(false);
    expect(isValidDate(d(2026.5, 1, 1))).toBe(false);
    expect(isValidDate(d(Number.NaN, 1, 1))).toBe(false);
  });
});

describe("toDayNumber and fromDayNumber", () => {
  it("round-trips every date across a long span", () => {
    // The property the whole module rests on.
    for (let year = 1900; year <= 2200; year += 1) {
      for (const [month, day] of [
        [1, 1],
        [2, 28],
        [3, 1],
        [7, 15],
        [12, 31],
      ] as const) {
        const date = d(year, month, day);
        const number = toDayNumber(date)!;
        expect(fromDayNumber(number)).toEqual(date);
      }
    }
  });

  it("round-trips 29 February in leap years", () => {
    for (const year of [1904, 2000, 2024, 2400]) {
      const date = d(year, 2, 29);
      expect(fromDayNumber(toDayNumber(date)!)).toEqual(date);
    }
  });

  it("advances by exactly one across a month boundary", () => {
    expect(toDayNumber(d(2026, 2, 1))! - toDayNumber(d(2026, 1, 31))!).toBe(1);
    expect(toDayNumber(d(2027, 1, 1))! - toDayNumber(d(2026, 12, 31))!).toBe(1);
    expect(toDayNumber(d(2024, 3, 1))! - toDayNumber(d(2024, 2, 29))!).toBe(1);
    expect(toDayNumber(d(2025, 3, 1))! - toDayNumber(d(2025, 2, 28))!).toBe(1);
  });

  it("counts 366 days in a leap year and 365 otherwise", () => {
    expect(
      toDayNumber(d(2025, 1, 1))! - toDayNumber(d(2024, 1, 1))!,
    ).toBe(366);
    expect(
      toDayNumber(d(2026, 1, 1))! - toDayNumber(d(2025, 1, 1))!,
    ).toBe(365);
    // 1900 is not a leap year, so 1900→1901 is 365.
    expect(
      toDayNumber(d(1901, 1, 1))! - toDayNumber(d(1900, 1, 1))!,
    ).toBe(365);
  });

  it("returns null for an invalid date", () => {
    expect(toDayNumber(d(2025, 2, 29))).toBeNull();
    expect(fromDayNumber(1.5)).toBeNull();
  });
});

describe("dayOfWeek", () => {
  it("advances by one each day and wraps at seven", () => {
    const start = toDayNumber(d(2026, 1, 1))!;
    for (let offset = 0; offset < 21; offset += 1) {
      const date = fromDayNumber(start + offset)!;
      expect(dayOfWeek(date)).toBe((dayOfWeek(d(2026, 1, 1))! + offset) % 7);
    }
  });

  it("puts the same weekday 7, 14 and 700 days apart", () => {
    const base = d(2026, 3, 15);
    const weekday = dayOfWeek(base)!;
    for (const offset of [7, 14, 700, -21]) {
      const later = fromDayNumber(toDayNumber(base)! + offset)!;
      expect(dayOfWeek(later)).toBe(weekday);
    }
  });

  it("agrees with isWeekend", () => {
    const start = toDayNumber(d(2026, 1, 1))!;
    for (let offset = 0; offset < 14; offset += 1) {
      const date = fromDayNumber(start + offset)!;
      const weekday = dayOfWeek(date)!;
      expect(isWeekend(date)).toBe(weekday === 5 || weekday === 6);
    }
  });

  it("finds exactly two weekend days in any seven consecutive days", () => {
    const start = toDayNumber(d2026())!;
    for (let base = 0; base < 30; base += 1) {
      let weekends = 0;
      for (let offset = 0; offset < 7; offset += 1) {
        if (isWeekend(fromDayNumber(start + base + offset)!)) weekends += 1;
      }
      expect(weekends).toBe(2);
    }
  });
});

function d2026(): CalendarDate {
  return d(2026, 1, 1);
}

describe("computeDateDifference", () => {
  it("counts the gap, so the same date twice is zero", () => {
    const result = computeDateDifference({
      from: d(2026, 5, 10),
      to: d(2026, 5, 10),
    })!;
    expect(result.days).toBe(0);
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.dayComponent).toBe(0);
    expect(result.workdays).toBe(0);
  });

  it("signs the day count and keeps the magnitude separate", () => {
    const forward = computeDateDifference({
      from: d(2026, 1, 1),
      to: d(2026, 3, 1),
    })!;
    const backward = computeDateDifference({
      from: d(2026, 3, 1),
      to: d(2026, 1, 1),
    })!;
    expect(forward.days).toBe(59);
    expect(backward.days).toBe(-59);
    expect(backward.absoluteDays).toBe(59);
  });

  it("reads the same calendar components in both directions", () => {
    const forward = computeDateDifference({
      from: d(2020, 3, 15),
      to: d(2026, 7, 20),
    })!;
    const backward = computeDateDifference({
      from: d(2026, 7, 20),
      to: d(2020, 3, 15),
    })!;
    expect(forward.years).toBe(backward.years);
    expect(forward.months).toBe(backward.months);
    expect(forward.dayComponent).toBe(backward.dayComponent);
  });

  it("decomposes into years, months and days", () => {
    const result = computeDateDifference({
      from: d(2020, 3, 15),
      to: d(2026, 7, 20),
    })!;
    expect(result.years).toBe(6);
    expect(result.months).toBe(4);
    expect(result.dayComponent).toBe(5);
    expect(result.totalMonths).toBe(76);
  });

  it("clamps a month-end start rather than borrowing", () => {
    // 31 January plus one month clamps to the last day of February, so
    // 31 January → 1 March is 1 month and 1 day in BOTH a leap year and a
    // common year. Field subtraction with a single borrow gets this wrong —
    // it leaves the day component negative in the common year.
    const common = computeDateDifference({
      from: d(2026, 1, 31),
      to: d(2026, 3, 1),
    })!;
    expect(common.months).toBe(1);
    expect(common.dayComponent).toBe(1);

    const leap = computeDateDifference({
      from: d(2024, 1, 31),
      to: d(2024, 3, 1),
    })!;
    expect(leap.months).toBe(1);
    expect(leap.dayComponent).toBe(1);
    // The two agree even though February differs in length, because the
    // clamp lands on the month's last day either way.
    expect(leap.absoluteDays).toBe(common.absoluteDays + 1);
  });

  it("never returns a negative day component", () => {
    // The invariant the clamped-month approach guarantees and field
    // subtraction does not. Swept across every month-end start.
    for (let month = 1; month <= 12; month += 1) {
      const length = daysInMonth(2026, month)!;
      for (const day of [1, 15, length]) {
        for (const offset of [1, 27, 28, 29, 30, 31, 59, 365]) {
          const from = d(2026, month, day);
          const to = computeDateOffset({ from, days: offset })!.date;
          const result = computeDateDifference({ from, to })!;
          expect(result.dayComponent).toBeGreaterThanOrEqual(0);
          expect(result.months).toBeGreaterThanOrEqual(0);
          expect(result.months).toBeLessThan(12);
        }
      }
    }
  });

  it("splits the gap into weeks and a remainder", () => {
    const result = computeDateDifference({
      from: d(2026, 1, 1),
      to: d(2026, 1, 24),
    })!;
    expect(result.absoluteDays).toBe(23);
    expect(result.weeks).toBe(3);
    expect(result.remainderDays).toBe(2);
  });

  it("counts the Monday-to-Friday week as five working days, Monday to Saturday", () => {
    // The convention that justifies the half-open interval, stated the way it
    // is actually true: the SET counted is [Monday, Saturday), which is the
    // five-day working week. Entering Monday as the start and Friday as the
    // end gives 4, because the end date is excluded — both cases are pinned
    // here so the "five working days" claim cannot be misread.
    const start = d(2026, 1, 1);
    const startWeekday = dayOfWeek(start)!;
    // Walk forward to the next Monday.
    const monday = fromDayNumber(
      toDayNumber(start)! + ((7 - startWeekday) % 7),
    )!;
    expect(dayOfWeek(monday)).toBe(0);
    const saturday = fromDayNumber(toDayNumber(monday)! + 5)!;
    const result = computeDateDifference({ from: monday, to: saturday })!;
    expect(result.absoluteDays).toBe(5);
    expect(result.workdays).toBe(5);
    expect(result.weekendDays).toBe(0);

    // Monday to Friday, the way a user reads "thứ Hai đến thứ Sáu".
    const friday = fromDayNumber(toDayNumber(monday)! + 4)!;
    expect(dayOfWeek(friday)).toBe(4);
    const toFriday = computeDateDifference({ from: monday, to: friday })!;
    expect(toFriday.absoluteDays).toBe(4);
    expect(toFriday.workdays).toBe(4);
    expect(toFriday.weekendDays).toBe(0);
  });

  it("counts weekend days in constant time over a span of billions of days", () => {
    // Regression: this used to be a day-by-day walk with no upper bound (the
    // sibling computeDateOffset has one), so an 8-digit year typed into the
    // page's free-text year box walked 7,4 billion iterations and blocked the
    // main thread for over two minutes. With the walk in place this test does
    // not fail on a wrong number — it fails on the timeout below.
    //
    // Reference, hand-derived, not read off the implementation:
    //   n = 7.401.507.775 days between 1/1/2026 and 1/1/20266666
    //   floor(n / 7) = 1.057.358.253 whole weeks (× 7 = 7.401.507.771)
    //   leftover     = 4 days, starting on the start weekday
    //   1/1/2026 is a Thursday (index 3), so the leftover runs
    //   Thu, Fri, Sat, Sun -> 2 of the 4 are weekend days
    //   weekendDays = 2 × 1.057.358.253 + 2 = 2.114.716.508
    const result = computeDateDifference({
      from: d(2026, 1, 1),
      to: d(20266666, 1, 1),
    })!;
    expect(dayOfWeek(d(2026, 1, 1))).toBe(3);
    expect(result.absoluteDays).toBe(7_401_507_775);
    expect(Math.floor(result.absoluteDays / 7)).toBe(1_057_358_253);
    expect(result.absoluteDays % 7).toBe(4);
    expect(result.weekendDays).toBe(2_114_716_508);
    expect(result.workdays).toBe(5_286_791_267);
    expect(result.workdays + result.weekendDays).toBe(result.absoluteDays);
  }, 2_000);

  it("agrees with a day-by-day weekend count over every start weekday", () => {
    // The closed form has to be exactly behaviour-preserving, so check it
    // against the naive count it replaced — using only the module's OTHER
    // exports, so this is not the implementation restating itself.
    for (let base = 0; base < 7; base += 1) {
      const from = fromDayNumber(toDayNumber(d(2026, 1, 1))! + base)!;
      for (const span of [0, 1, 5, 6, 7, 8, 13, 14, 29, 100, 365]) {
        const to = fromDayNumber(toDayNumber(from)! + span)!;
        let naive = 0;
        for (let offset = 0; offset < span; offset += 1) {
          if (isWeekend(fromDayNumber(toDayNumber(from)! + offset)!)) naive += 1;
        }
        const result = computeDateDifference({ from, to })!;
        expect(result.weekendDays).toBe(naive);
        expect(result.workdays).toBe(span - naive);
      }
    }
  });

  it("keeps workdays plus weekend days equal to the total", () => {
    for (const to of [
      d(2026, 1, 15),
      d(2026, 6, 30),
      d(2027, 3, 1),
      d(2030, 12, 31),
    ]) {
      const result = computeDateDifference({ from: d(2026, 1, 1), to })!;
      expect(result.workdays + result.weekendDays).toBe(result.absoluteDays);
    }
  });

  it("counts ten working days in a fortnight", () => {
    const start = d(2026, 1, 1);
    const monday = fromDayNumber(
      toDayNumber(start)! + ((7 - dayOfWeek(start)!) % 7),
    )!;
    const result = computeDateDifference({
      from: monday,
      to: fromDayNumber(toDayNumber(monday)! + 14)!,
    })!;
    expect(result.absoluteDays).toBe(14);
    expect(result.workdays).toBe(10);
    expect(result.weekendDays).toBe(4);
  });

  it("returns null when either date is invalid", () => {
    expect(
      computeDateDifference({ from: d(2025, 2, 29), to: d(2026, 1, 1) }),
    ).toBeNull();
    expect(
      computeDateDifference({ from: d(2026, 1, 1), to: d(2026, 13, 1) }),
    ).toBeNull();
  });
});

describe("computeDateOffset", () => {
  it("adds and subtracts plain days", () => {
    expect(
      computeDateOffset({ from: d(2026, 1, 31), days: 1 })!.date,
    ).toEqual(d(2026, 2, 1));
    expect(
      computeDateOffset({ from: d(2026, 3, 1), days: -1 })!.date,
    ).toEqual(d(2026, 2, 28));
    expect(
      computeDateOffset({ from: d(2024, 3, 1), days: -1 })!.date,
    ).toEqual(d(2024, 2, 29));
  });

  it("is the identity at zero", () => {
    const from = d(2026, 7, 4);
    expect(computeDateOffset({ from, days: 0 })!.date).toEqual(from);
  });

  it("crosses a year boundary", () => {
    expect(
      computeDateOffset({ from: d(2026, 12, 31), days: 1 })!.date,
    ).toEqual(d(2027, 1, 1));
    expect(
      computeDateOffset({ from: d(2026, 1, 1), days: -1 })!.date,
    ).toEqual(d(2025, 12, 31));
  });

  it("agrees with computeDateDifference", () => {
    // The two functions are inverses and must not drift apart.
    const from = d(2026, 2, 14);
    for (const days of [1, 45, 365, 1000, -30, -400]) {
      const to = computeDateOffset({ from, days })!.date;
      expect(computeDateDifference({ from, to })!.days).toBe(days);
    }
  });

  it("never lands on a weekend when skipping weekends", () => {
    const from = d(2026, 1, 1);
    for (let days = 1; days <= 60; days += 1) {
      const result = computeDateOffset({ from, days, skipWeekends: true })!;
      expect(result.weekend).toBe(false);
    }
  });

  it("normalises a zero offset off a weekend", () => {
    // The sweep above starts on a Thursday and never asks for zero, so this
    // is the one path where the weekday walk cannot do the normalising — the
    // walk only runs while there is a day left to count. A weekend start with
    // a zero offset used to be handed straight back, breaking the docstring's
    // and the page's "never a weekend" promise.
    const saturday = d(2026, 1, 3);
    const sunday = d(2026, 1, 4);
    expect(dayOfWeek(saturday)).toBe(5);
    expect(dayOfWeek(sunday)).toBe(6);

    // Following convention: roll forward to Monday 5/1/2026.
    for (const from of [saturday, sunday]) {
      const result = computeDateOffset({ from, days: 0, skipWeekends: true })!;
      expect(result.date).toEqual(d(2026, 1, 5));
      expect(result.weekday).toBe(0);
      expect(result.weekend).toBe(false);
      expect(result.offsetDays).toBe(0);
    }

    // Without the weekday walk it is still the plain identity, weekend or not.
    expect(computeDateOffset({ from: saturday, days: 0 })!.date).toEqual(
      saturday,
    );
    expect(computeDateOffset({ from: saturday, days: 0 })!.weekend).toBe(true);

    // A weekday start with a zero offset is untouched — the roll must not
    // over-apply.
    const thursday = d(2026, 1, 1);
    expect(
      computeDateOffset({ from: thursday, days: 0, skipWeekends: true })!.date,
    ).toEqual(thursday);
  });

  it("never lands on a weekend for any offset from any start weekday", () => {
    // The invariant the docstring promises, swept over both signs and zero.
    for (let base = 0; base < 14; base += 1) {
      const from = fromDayNumber(toDayNumber(d(2026, 1, 1))! + base)!;
      for (let days = -30; days <= 30; days += 1) {
        const result = computeDateOffset({ from, days, skipWeekends: true })!;
        expect(result.weekend).toBe(false);
        expect(isWeekend(result.date)).toBe(false);
      }
    }
  });

  it("puts five working days after a Friday on the next Friday", () => {
    const start = d(2026, 1, 1);
    // Walk to a Friday (weekday index 4).
    const friday = fromDayNumber(
      toDayNumber(start)! + ((4 - dayOfWeek(start)! + 7) % 7),
    )!;
    expect(dayOfWeek(friday)).toBe(4);
    const result = computeDateOffset({
      from: friday,
      days: 5,
      skipWeekends: true,
    })!;
    expect(dayOfWeek(result.date)).toBe(4);
    expect(computeDateDifference({ from: friday, to: result.date })!.days).toBe(
      7,
    );
  });

  it("skips weekends backwards too", () => {
    const result = computeDateOffset({
      from: d(2026, 6, 15),
      days: -5,
      skipWeekends: true,
    })!;
    expect(result.weekend).toBe(false);
    expect(result.offsetDays).toBe(-5);
  });

  it("returns null rather than looping forever on an absurd skip", () => {
    expect(
      computeDateOffset({
        from: d(2026, 1, 1),
        days: 1_000_000,
        skipWeekends: true,
      }),
    ).toBeNull();
    // …but the same magnitude is fine without the weekday walk.
    expect(
      computeDateOffset({ from: d(2026, 1, 1), days: 1_000_000 }),
    ).not.toBeNull();
  });

  it("returns null for an invalid date or a fractional offset", () => {
    expect(
      computeDateOffset({ from: d(2025, 2, 29), days: 1 }),
    ).toBeNull();
    expect(
      computeDateOffset({ from: d(2026, 1, 1), days: 1.5 }),
    ).toBeNull();
  });
});
