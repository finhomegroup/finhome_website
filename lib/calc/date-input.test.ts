/**
 * `readDateFields` — the step between three form strings and a calendar date.
 *
 * `dates-calculator.test.ts` sweeps the per-field blame through the date
 * page's own entry point; this file pins the contract the two NEW consumers
 * (the home-fund start date and the term deposit's dates) depend on: a date or
 * nothing, never a guess, and a Vietnamese grouping dot rejected rather than
 * silently read as a thousands separator.
 */
import { describe, expect, it } from "vitest";
import { readDateFields } from "@/lib/calc/date-input";

describe("readDateFields", () => {
  it("reads a complete trio", () => {
    const r = readDateFields("2026", "9", "15");
    expect(r.date).toEqual({ year: 2026, month: 9, day: 15 });
    expect([r.yearBad, r.monthBad, r.dayBad]).toEqual([false, false, false]);
  });

  it("accepts 29 February in a leap year and refuses it otherwise", () => {
    expect(readDateFields("2028", "2", "29").date).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    const notLeap = readDateFields("2026", "2", "29");
    expect(notLeap.date).toBeNull();
    expect(notLeap.dayBad).toBe(true);
    expect(notLeap.monthBad).toBe(false);
  });

  it("blames only the year when the year is the only fault", () => {
    const r = readDateFields("", "12", "31");
    expect(r.yearBad).toBe(true);
    expect(r.monthBad).toBe(false);
    expect(r.dayBad).toBe(false);
    expect(r.date).toBeNull();
  });

  it("blames a day that exists in no month, whatever else is missing", () => {
    for (const day of ["0", "32", "45", "-3", "15,5"]) {
      const r = readDateFields("", "", day);
      expect(r.dayBad, day).toBe(true);
    }
  });

  it("refuses a grouped number, which is not a calendar field", () => {
    // `parseMoney` would read "2.026" as 2026 and "1.9" as 19. This field's
    // grammar is a bare integer, so both are rejected.
    expect(readDateFields("2.026", "9", "15").yearBad).toBe(true);
    expect(readDateFields("2026", "1.9", "15").monthBad).toBe(true);
  });

  it("refuses a month outside 1–12", () => {
    for (const month of ["0", "13", "1,5"]) {
      const r = readDateFields("2026", month, "15");
      expect(r.monthBad, month).toBe(true);
      expect(r.date).toBeNull();
    }
  });
});
