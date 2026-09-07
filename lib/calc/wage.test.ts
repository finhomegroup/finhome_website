import { describe, it, expect } from "vitest";
import { convertWage, type WageInput, type WageUnit } from "@/lib/calc/wage";

// A 40-hour, 5-day, 52-week office schedule: 2.080 hours a year.
const SCHEDULE = { hoursPerWeek: 40, daysPerWeek: 5, weeksPerYear: 52 };
const BASE: WageInput = { ...SCHEDULE, amount: 100_000, unit: "hourly" };

function wage(input: WageInput) {
  const result = convertWage(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("convertWage — the schedule", () => {
  it("derives hours per day and per year", () => {
    const result = wage(BASE);
    expect(result.hoursPerDay).toBe(8);
    expect(result.hoursPerYear).toBe(2080);
  });

  it("follows a 48-hour, 6-day week", () => {
    // Vietnam's Labour Code caps normal hours at 48 per week.
    const result = wage({
      ...BASE,
      hoursPerWeek: 48,
      daysPerWeek: 6,
    });
    expect(result.hoursPerDay).toBe(8);
    expect(result.hoursPerYear).toBe(48 * 52);
  });
});

describe("convertWage — from an hourly rate", () => {
  it("scales up to every other unit", () => {
    const result = wage(BASE);
    expect(result.hourly).toBe(100_000);
    expect(result.daily).toBeCloseTo(800_000, 6);
    expect(result.weekly).toBeCloseTo(4_000_000, 6);
    expect(result.yearly).toBeCloseTo(208_000_000, 6);
    // A month is a twelfth of a year, so 2.080 × 100.000 ÷ 12.
    expect(result.monthly).toBeCloseTo(17_333_333.333_33, 4);
  });

  it("treats a month as a twelfth of a year, not as four weeks", () => {
    const result = wage(BASE);
    expect(result.monthly * 12).toBeCloseTo(result.yearly, 6);
    // Four weeks would be 16 triệu — nearly 1,3 triệu short of the truth.
    expect(result.monthly).not.toBeCloseTo(result.weekly * 4, 0);
  });
});

describe("convertWage — every direction agrees", () => {
  const units: WageUnit[] = [
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ];

  it("round-trips: entering any unit reproduces the same five figures", () => {
    // The reason every conversion routes through one hourly rate. Take the
    // full set from an hourly rate, then re-enter each figure in its own unit
    // and require the whole set back.
    const reference = wage(BASE);
    for (const unit of units) {
      const result = wage({ ...SCHEDULE, amount: reference[unit], unit });
      for (const other of units) {
        expect(result[other]).toBeCloseTo(reference[other], 4);
      }
    }
  });

  it("converts a monthly salary to an hourly rate", () => {
    // 20 triệu/tháng on a 40-hour week is 240 triệu/năm over 2.080 hours.
    const result = wage({ ...SCHEDULE, amount: 20_000_000, unit: "monthly" });
    expect(result.yearly).toBeCloseTo(240_000_000, 6);
    expect(result.hourly).toBeCloseTo(240_000_000 / 2080, 6);
    expect(result.hourly).toBeCloseTo(115_384.615_38, 4);
  });

  it("converts a daily rate using days per week, not 7", () => {
    const result = wage({ ...SCHEDULE, amount: 800_000, unit: "daily" });
    expect(result.hourly).toBeCloseTo(100_000, 6);
    expect(result.weekly).toBeCloseTo(4_000_000, 6);
  });
});

describe("convertWage — the schedule changes the answer", () => {
  it("pays a shorter week less per year at the same hourly rate", () => {
    const full = wage(BASE);
    const short = wage({ ...BASE, hoursPerWeek: 20 });
    expect(short.yearly).toBeCloseTo(full.yearly / 2, 6);
    expect(short.hourly).toBe(full.hourly);
  });

  it("pays a shorter week MORE per hour at the same yearly salary", () => {
    const full = wage({ ...SCHEDULE, amount: 240_000_000, unit: "yearly" });
    const short = wage({
      ...SCHEDULE,
      hoursPerWeek: 20,
      amount: 240_000_000,
      unit: "yearly",
    });
    expect(short.hourly).toBeCloseTo(full.hourly * 2, 6);
    expect(short.yearly).toBeCloseTo(full.yearly, 6);
  });

  it("counts only the paid weeks", () => {
    // 48 paid weeks, i.e. a month unpaid, at the same hourly rate.
    const result = wage({ ...BASE, weeksPerYear: 48 });
    expect(result.hoursPerYear).toBe(48 * 40);
    expect(result.yearly).toBeCloseTo(100_000 * 48 * 40, 6);
  });
});

describe("convertWage — edges and rejection", () => {
  it("converts zero to zero", () => {
    const result = wage({ ...BASE, amount: 0 });
    expect(result.hourly).toBe(0);
    expect(result.monthly).toBe(0);
    expect(result.yearly).toBe(0);
  });

  it("returns null rather than a guess", () => {
    expect(convertWage({ ...BASE, amount: -1 })).toBeNull();
    expect(convertWage({ ...BASE, hoursPerWeek: 0 })).toBeNull();
    expect(convertWage({ ...BASE, hoursPerWeek: -1 })).toBeNull();
    expect(convertWage({ ...BASE, daysPerWeek: 0 })).toBeNull();
    expect(convertWage({ ...BASE, weeksPerYear: 0 })).toBeNull();
    expect(convertWage({ ...BASE, amount: Number.NaN })).toBeNull();
    expect(
      convertWage({ ...BASE, hoursPerWeek: Number.POSITIVE_INFINITY }),
    ).toBeNull();
  });

  it("rejects more than seven days in a week", () => {
    expect(convertWage({ ...BASE, daysPerWeek: 8 })).toBeNull();
    expect(convertWage({ ...BASE, daysPerWeek: 7 })).not.toBeNull();
  });
});
