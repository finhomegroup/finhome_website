import { describe, expect, it } from "vitest";
import {
  CATCH_UP_AGE,
  catchUpAllowance,
  catchUpMustBeRoth,
  catchUpTier,
  iraCatchUpAllowance,
  RETIREMENT_LIMIT_YEAR_ORDER,
  RETIREMENT_LIMITS,
  SUPER_CATCH_UP_FIRST_AGE,
  SUPER_CATCH_UP_LAST_AGE,
} from "@/lib/calc/us-retirement-limits";

const YEARS = Object.keys(RETIREMENT_LIMITS)
  .map(Number)
  .sort((a, b) => a - b);

describe("the vendored limits table", () => {
  it("has at least two years and keys each entry by its own year", () => {
    // A mis-keyed entry would serve one year's limits under another year's
    // name, which no other assertion here would notice.
    expect(YEARS.length).toBeGreaterThanOrEqual(2);
    for (const year of YEARS) {
      expect(RETIREMENT_LIMITS[year].year).toBe(year);
    }
  });

  it("offers every table year in the selector, newest first", () => {
    expect([...RETIREMENT_LIMIT_YEAR_ORDER].sort((a, b) => a - b)).toEqual(
      YEARS,
    );
    for (let i = 1; i < RETIREMENT_LIMIT_YEAR_ORDER.length; i += 1) {
      expect(RETIREMENT_LIMIT_YEAR_ORDER[i - 1]).toBeGreaterThan(
        RETIREMENT_LIMIT_YEAR_ORDER[i],
      );
    }
  });

  it("keeps every limit positive and a whole number of dollars", () => {
    for (const year of YEARS) {
      const p = RETIREMENT_LIMITS[year];
      for (const [name, value] of Object.entries(p)) {
        if (value === null) continue;
        expect(Number.isFinite(value), `${year} ${name}`).toBe(true);
        expect(value, `${year} ${name}`).toBeGreaterThan(0);
        expect(Number.isInteger(value), `${year} ${name}`).toBe(true);
      }
    }
  });

  it("keeps the limits in the order the statute puts them", () => {
    for (const year of YEARS) {
      const p = RETIREMENT_LIMITS[year];
      // A catch-up is an addition to the base limit, so it is smaller.
      expect(p.catchUp50, `${year}`).toBeLessThan(p.electiveDeferral);
      // SECURE 2.0's window is the HIGHER allowance; if these ever swapped,
      // a 61-year-old would silently be offered less than a 55-year-old.
      expect(p.catchUp60to63, `${year}`).toBeGreaterThan(p.catchUp50);
      // 415(c) covers deferral plus match plus non-elective, so it must sit
      // above the deferral limit alone.
      expect(p.annualAdditions, `${year}`).toBeGreaterThan(p.electiveDeferral);
      // Pay above the compensation ceiling is invisible to the plan, and the
      // ceiling has to leave room for a full 415(c) allocation.
      expect(p.compensation, `${year}`).toBeGreaterThan(p.annualAdditions);
      // An IRA is the small account: its limit is far below a 401(k)'s.
      expect(p.ira, `${year}`).toBeLessThan(p.electiveDeferral);
      expect(p.iraCatchUp50, `${year}`).toBeLessThan(p.ira);
    }
  });

  it("never lets an indexed limit fall from one year to the next", () => {
    // Every figure here is indexed and rounds in 500 or 1.000 steps, so it
    // can stand still but not go backwards. A transcription slip that moved
    // a digit would usually break this.
    for (let i = 1; i < YEARS.length; i += 1) {
      const older = RETIREMENT_LIMITS[YEARS[i - 1]];
      const newer = RETIREMENT_LIMITS[YEARS[i]];
      for (const key of [
        "electiveDeferral",
        "catchUp50",
        "catchUp60to63",
        "annualAdditions",
        "compensation",
        "ira",
        "iraCatchUp50",
      ] as const) {
        expect(newer[key], `${key} fell from ${older.year} to ${newer.year}`)
          .toBeGreaterThanOrEqual(older[key]);
      }
    }
  });

  it("rounds each limit to the step its own statute indexes in", () => {
    for (const year of YEARS) {
      const p = RETIREMENT_LIMITS[year];
      // 402(g), 415(c) and 401(a)(17) index in 500, 1.000 and 5.000 steps.
      expect(p.electiveDeferral % 500, `${year} 402(g)`).toBe(0);
      expect(p.catchUp50 % 500, `${year} catch-up`).toBe(0);
      expect(p.annualAdditions % 1_000, `${year} 415(c)`).toBe(0);
      expect(p.compensation % 5_000, `${year} 401(a)(17)`).toBe(0);
      expect(p.ira % 500, `${year} IRA`).toBe(0);
      expect(p.iraCatchUp50 % 100, `${year} IRA catch-up`).toBe(0);
    }
  });

  it("pins the published figures for each year in the table", () => {
    // The whole file is a transcription, so the transcription itself is what
    // needs asserting. If one of these ever fails, check the IRS notice
    // before changing the test.
    expect(RETIREMENT_LIMITS[2025]).toMatchObject({
      electiveDeferral: 23_500,
      catchUp50: 7_500,
      catchUp60to63: 11_250,
      annualAdditions: 70_000,
      compensation: 350_000,
      ira: 7_000,
      iraCatchUp50: 1_000,
      rothCatchUpWageThreshold: null,
    });
    expect(RETIREMENT_LIMITS[2026]).toMatchObject({
      electiveDeferral: 24_500,
      catchUp50: 8_000,
      catchUp60to63: 11_250,
      annualAdditions: 72_000,
      compensation: 360_000,
      ira: 7_500,
      iraCatchUp50: 1_100,
      rothCatchUpWageThreshold: 150_000,
    });
  });
});

describe("catchUpTier", () => {
  it("gives nothing below 50", () => {
    for (const age of [0, 25, 40, 48, 49]) {
      expect(catchUpTier(age)).toBe("none");
      expect(catchUpAllowance(RETIREMENT_LIMITS[2026], age)).toBe(0);
      expect(iraCatchUpAllowance(RETIREMENT_LIMITS[2026], age)).toBe(0);
    }
  });

  it("switches ON at exactly 50, not after it", () => {
    expect(catchUpTier(CATCH_UP_AGE - 1)).toBe("none");
    expect(catchUpTier(CATCH_UP_AGE)).toBe("age50");
    expect(catchUpAllowance(RETIREMENT_LIMITS[2026], 50)).toBe(8_000);
  });

  it("covers 60 to 63 inclusive at BOTH ends", () => {
    expect(catchUpTier(SUPER_CATCH_UP_FIRST_AGE - 1)).toBe("age50");
    for (let age = SUPER_CATCH_UP_FIRST_AGE; age <= SUPER_CATCH_UP_LAST_AGE; age += 1) {
      expect(catchUpTier(age), `age ${age}`).toBe("age60to63");
      expect(catchUpAllowance(RETIREMENT_LIMITS[2026], age)).toBe(11_250);
    }
  });

  it("DROPS back to the ordinary catch-up at 64", () => {
    // The one non-monotonic step in the whole schedule, and the one people
    // are caught out by. 63 -> 64 is a fall of 3.250 USD in 2026.
    expect(catchUpTier(SUPER_CATCH_UP_LAST_AGE + 1)).toBe("age50");
    const p = RETIREMENT_LIMITS[2026];
    expect(catchUpAllowance(p, 63)).toBe(11_250);
    expect(catchUpAllowance(p, 64)).toBe(8_000);
    expect(catchUpAllowance(p, 64)).toBeLessThan(catchUpAllowance(p, 63));
    expect(catchUpAllowance(p, 70)).toBe(8_000);
  });

  it("treats a non-finite age as no catch-up rather than throwing", () => {
    expect(catchUpTier(Number.NaN)).toBe("none");
    expect(catchUpAllowance(RETIREMENT_LIMITS[2026], Number.NaN)).toBe(0);
  });

  it("gives the IRA catch-up at any age from 50 up, with no higher window", () => {
    // The IRA has no equivalent of the 60-63 tier, which is a real asymmetry
    // between the two accounts rather than an omission here.
    const p = RETIREMENT_LIMITS[2026];
    for (const age of [50, 55, 61, 64, 75]) {
      expect(iraCatchUpAllowance(p, age)).toBe(1_100);
    }
  });
});

describe("catchUpMustBeRoth", () => {
  it("is off for every wage in a year with no threshold", () => {
    for (const wages of [0, 100_000, 1_000_000]) {
      expect(catchUpMustBeRoth(RETIREMENT_LIMITS[2025], wages)).toBe(false);
    }
  });

  it("triggers strictly ABOVE the threshold, not at it", () => {
    const p = RETIREMENT_LIMITS[2026];
    expect(catchUpMustBeRoth(p, 149_999)).toBe(false);
    // The statute says "in excess of", so the boundary itself is exempt.
    expect(catchUpMustBeRoth(p, 150_000)).toBe(false);
    expect(catchUpMustBeRoth(p, 150_001)).toBe(true);
  });
});
