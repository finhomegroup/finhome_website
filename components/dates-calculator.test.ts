// Guard for the date page's PER-FIELD BLAME, i.e. which of Ngày / Tháng / Năm
// gets `aria-invalid` and its error message for a given trio of raw strings.
//
// `lib/calc/dates.test.ts` cannot see this: it covers the arithmetic and takes
// numbers, while the defect lives in the step between three form strings and
// three `invalid` flags. Two things went wrong there and both are pinned below:
//
//   1. Blaming the day for a blank Năm. The Ngày error reads "Ngày không tồn
//      tại trong tháng đã chọn.", which is false of a day that does exist in
//      some month — clearing Năm reddened Ngày and announced a wrong reason.
//   2. Over-correcting that by dropping the day's range check, which let a day
//      impossible in EVERY month (0, 32, 45, -3) go unflagged whenever Tháng or
//      Năm was also bad. Measured 208 such trios in a 864-case sweep.
//
// Runs in the repo's node environment with no jsdom: it imports the client
// module but only calls the PURE exported `readDate`, and never renders.

import { describe, expect, it } from "vitest";

import { readDate } from "@/components/dates-calculator";
import { daysInMonth, isValidDate } from "@/lib/calc/dates";
import { DATES as C } from "@/content/calculators/dates";

/**
 * Reference for "does this day exist in any month at all", from the calendar
 * rather than from the module: month lengths run 28..31, so an integer day is
 * possible somewhere iff it is in 1..31, and impossible everywhere otherwise.
 */
const DAY_MIN = 1;
const DAY_MAX = 31;

describe("readDate — the calendar half waits for a candidate", () => {
  it("does not blame the day when only Năm is missing", () => {
    // 31 exists in 7 of the 12 months, so with no year and no usable month
    // there is nothing that makes it wrong — the year is the only fault.
    const r = readDate("", "12", "31");
    expect(r.yearBad).toBe(true);
    expect(r.monthBad).toBe(false);
    expect(r.dayBad).toBe(false);
    expect(r.date).toBeNull();
  });

  it("does not blame the day when only Tháng is out of range", () => {
    const r = readDate("2026", "13", "1");
    expect(r.monthBad).toBe(true);
    expect(r.yearBad).toBe(false);
    expect(r.dayBad).toBe(false);
    expect(r.date).toBeNull();
  });

  it("does not blame a day that exists in SOME month while Năm is mid-edit", () => {
    // 31 tháng 4 does not exist, but with Năm blank there is no candidate to
    // judge, so the day cannot be the one at fault yet.
    const r = readDate("", "4", "31");
    expect(r.yearBad).toBe(true);
    expect(r.monthBad).toBe(false);
    expect(r.dayBad).toBe(false);
    expect(r.date).toBeNull();
  });

  it("keeps the 29-February coupling once all three are present", () => {
    // The one value in 1..31 whose existence depends on the YEAR.
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);

    const leap = readDate("2024", "2", "29");
    expect(leap.dayBad).toBe(false);
    expect(leap.date).toEqual({ year: 2024, month: 2, day: 29 });

    const common = readDate("2025", "2", "29");
    expect(common.dayBad).toBe(true);
    expect(common.yearBad).toBe(false);
    expect(common.monthBad).toBe(false);
    expect(common.date).toBeNull();
  });

  it("keeps the month coupling once all three are present", () => {
    expect(daysInMonth(2026, 4)).toBe(30);
    const r = readDate("2026", "4", "31");
    expect(r.dayBad).toBe(true);
    expect(r.date).toBeNull();
  });
});

describe("readDate — the number half needs no candidate", () => {
  it("blames a day impossible in every month even with Năm blank", () => {
    // The over-correction regression: these were silently accepted on the Ngày
    // field whenever another field was also bad, and only turned red once a
    // year was typed.
    for (const day of ["0", "32", "45", "-3"]) {
      const r = readDate("", "1", day);
      expect(r.dayBad, `day ${day} with a blank year`).toBe(true);
      expect(r.yearBad).toBe(true);
      expect(r.date).toBeNull();
    }
  });

  it("blames a day impossible in every month even with Tháng out of range", () => {
    for (const day of ["0", "32", "45", "-3", "1,5", "x", ""]) {
      const r = readDate("2026", "13", day);
      expect(r.dayBad, `day ${day} with month 13`).toBe(true);
      expect(r.monthBad).toBe(true);
      expect(r.date).toBeNull();
    }
  });

  it("blames a non-numeric or fractional day on its own", () => {
    for (const day of ["", "x", "1,5"]) {
      const r = readDate("2026", "1", day);
      expect(r.dayBad, `day "${day}"`).toBe(true);
      expect(r.date).toBeNull();
    }
  });

  it("agrees with the calendar on which days are impossible everywhere", () => {
    // Sweep the whole integer window plus its shoulders, with a deliberately
    // unusable month so ONLY the number half can be speaking.
    for (let day = -3; day <= 34; day += 1) {
      const possibleSomewhere = day >= DAY_MIN && day <= DAY_MAX;
      const r = readDate("", "", String(day));
      expect(r.dayBad, `day ${day} with year and month blank`).toBe(
        !possibleSomewhere,
      );
      // Cross-check the reference against the calendar module itself.
      const existsSomewhere = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].some((m) =>
        isValidDate({ year: 2024, month: m, day }),
      );
      expect(existsSomewhere).toBe(possibleSomewhere);
    }
  });
});

describe("readDate — invariants the fix must not break", () => {
  const years = ["2026", "2024", "2025", "", "abc", "20,5", "-1", "0"];
  const months = ["1", "2", "4", "12", "", "13", "0", "2,5", "zz"];
  const days = ["1", "28", "29", "30", "31", "", "0", "32", "45", "-3", "1,5", "x"];

  it("never leaves a blank result with no field flagged, and never flags a good one", () => {
    for (const y of years) {
      for (const m of months) {
        for (const d of days) {
          const r = readDate(y, m, d);
          const anyBad = r.yearBad || r.monthBad || r.dayBad;
          const label = `y="${y}" m="${m}" d="${d}"`;
          // A blank result always has a reason attached to a field...
          if (r.date === null) expect(anyBad, `silent blank: ${label}`).toBe(true);
          // ...and a result that came out is never accompanied by an error.
          if (r.date !== null) expect(anyBad, `flagged but ok: ${label}`).toBe(false);
        }
      }
    }
  });

  it("returns the date iff the trio names a real calendar date", () => {
    for (const y of ["2024", "2025", "2026"]) {
      for (const m of ["1", "2", "4", "12"]) {
        for (const d of ["1", "28", "29", "30", "31"]) {
          const candidate = { year: Number(y), month: Number(m), day: Number(d) };
          const r = readDate(y, m, d);
          expect(r.date, `${d}/${m}/${y}`).toEqual(
            isValidDate(candidate) ? candidate : null,
          );
        }
      }
    }
  });

  it("reads the page defaults clean, so the prefilled page shows no error", () => {
    const from = readDate(
      C.form.defaultFromYear,
      C.form.defaultFromMonth,
      C.form.defaultFromDay,
    );
    const to = readDate(
      C.form.defaultToYear,
      C.form.defaultToMonth,
      C.form.defaultToDay,
    );
    expect(from.date).toEqual({ year: 2026, month: 1, day: 1 });
    expect(to.date).toEqual({ year: 2026, month: 12, day: 31 });
    for (const r of [from, to]) {
      expect(r.yearBad).toBe(false);
      expect(r.monthBad).toBe(false);
      expect(r.dayBad).toBe(false);
    }
  });
});
