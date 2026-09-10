import { describe, it, expect } from "vitest";
import {
  computeEducationSavings,
  type EducationSavingsInput,
} from "@/lib/calc/education-savings";

// 80 triệu a year today, starting in 10 years, a 4-year course, tuition
// inflating 8%/năm, 200 triệu saved, invested at 7%/năm.
const BASE: EducationSavingsInput = {
  annualTuitionToday: 80_000_000,
  yearsUntilStart: 10,
  yearsOfStudy: 4,
  tuitionInflationPercent: 8,
  currentSavings: 200_000_000,
  investmentReturnPercent: 7,
};

function plan(input: EducationSavingsInput) {
  const result = computeEducationSavings(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeEducationSavings — the tuition stream", () => {
  it("emits one row per year of study", () => {
    const result = plan(BASE);
    expect(result.years).toHaveLength(4);
    expect(result.years.map((row) => row.year)).toEqual([1, 2, 3, 4]);
  });

  it("inflates each year to the year it is actually paid", () => {
    const result = plan(BASE);
    // Year 1 is paid at year 10 from now, year 4 at year 13.
    expect(result.years[0].yearsFromNow).toBe(10);
    expect(result.years[3].yearsFromNow).toBe(13);
    expect(result.years[0].tuition).toBeCloseTo(
      80_000_000 * 1.08 ** 10,
      2,
    );
    expect(result.years[3].tuition).toBeCloseTo(
      80_000_000 * 1.08 ** 13,
      2,
    );
  });

  it("discounts each year back to the START of study, not to today", () => {
    // The step a naive version skips. Year 1 is not discounted at all; year
    // 4 comes back three years.
    const result = plan(BASE);
    expect(result.years[0].presentValueAtStart).toBeCloseTo(
      result.years[0].tuition,
      6,
    );
    expect(result.years[3].presentValueAtStart).toBeCloseTo(
      result.years[3].tuition / 1.07 ** 3,
      2,
    );
  });

  it("needs less than the undiscounted total, by a wide margin", () => {
    // Money not yet spent keeps earning, so summing the inflated years
    // overstates the requirement.
    const result = plan(BASE);
    expect(result.targetAtStart).toBeLessThan(result.totalTuitionNominal);
    expect(result.targetAtStart / result.totalTuitionNominal).toBeLessThan(
      0.95,
    );
  });

  it("makes target and total equal on a one-year course", () => {
    const result = plan({ ...BASE, yearsOfStudy: 1 });
    expect(result.targetAtStart).toBeCloseTo(result.totalTuitionNominal, 6);
  });

  it("makes target and total equal at a 0% return", () => {
    const result = plan({ ...BASE, investmentReturnPercent: 0 });
    expect(result.targetAtStart).toBeCloseTo(result.totalTuitionNominal, 4);
  });

  it("does not inflate when tuition inflation is zero", () => {
    const result = plan({ ...BASE, tuitionInflationPercent: 0 });
    for (const row of result.years) {
      expect(row.tuition).toBeCloseTo(80_000_000, 6);
    }
    expect(result.totalTuitionNominal).toBeCloseTo(320_000_000, 4);
  });

  it("grows the requirement steeply with tuition inflation", () => {
    let previous = 0;
    for (const tuitionInflationPercent of [0, 4, 8, 12]) {
      const value = plan({ ...BASE, tuitionInflationPercent }).targetAtStart;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });
});

describe("computeEducationSavings — funding it", () => {
  it("grows today's savings to the start date", () => {
    const result = plan(BASE);
    expect(result.currentSavingsAtStart).toBeCloseTo(
      200_000_000 * 1.07 ** 10,
      2,
    );
  });

  it("computes the shortfall at the start date", () => {
    const result = plan(BASE);
    expect(result.shortfallAtStart).toBeCloseTo(
      result.targetAtStart - result.currentSavingsAtStart,
      6,
    );
    expect(result.shortfallAtStart).toBeGreaterThan(0);
    expect(result.alreadyFunded).toBe(false);
  });

  it("solves a contribution that closes the shortfall exactly", () => {
    // Compound the solved contribution forward and it must equal the gap.
    const result = plan(BASE);
    const monthlyRate = 1.07 ** (1 / 12) - 1;
    const grown =
      (result.monthlyContribution *
        ((1 + monthlyRate) ** result.monthsToSave - 1)) /
      monthlyRate;
    expect(grown).toBeCloseTo(result.shortfallAtStart, 2);
  });

  it("needs less each month with more time", () => {
    const soon = plan({ ...BASE, yearsUntilStart: 5 }).monthlyContribution;
    const later = plan({ ...BASE, yearsUntilStart: 18 }).monthlyContribution;
    expect(later).toBeLessThan(soon);
  });

  it("reports already-funded when savings cover the target", () => {
    const result = plan({ ...BASE, currentSavings: 3_000_000_000 });
    expect(result.alreadyFunded).toBe(true);
    expect(result.shortfallAtStart).toBe(0);
    expect(result.monthlyContribution).toBe(0);
    // The return's share of REACHING the target is 0 here: principal alone
    // already covers it. Unfloored, the difference would be
    // −2.299.398.621 ₫ and the page would render that as "lãi đóng góp".
    expect(result.interestEarned).toBe(0);
  });

  it("never reports a negative contribution from the return", () => {
    // Swept across the over-funded range, where the shortfall floor makes
    // the contributions 0 and the raw difference goes negative.
    for (const currentSavings of [
      600_000_000, 700_000_000, 1_000_000_000, 3_000_000_000, 50_000_000_000,
    ]) {
      const result = plan({ ...BASE, currentSavings });
      expect(result.interestEarned).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps a partly over-funded plan's return contribution positive", () => {
    // 600 triệu is already-funded (it GROWS past the target by the start
    // date) but is well under the target itself, so the floor must not
    // clamp this one. Reference from the definition — the tuition stream
    // discounted to the start of study, less the principal put in:
    const target = [0, 1, 2, 3].reduce(
      (sum, k) => sum + (80_000_000 * 1.08 ** (10 + k)) / 1.07 ** k,
      0,
    );
    const result = plan({ ...BASE, currentSavings: 600_000_000 });
    expect(result.alreadyFunded).toBe(true);
    expect(result.totalContributions).toBe(0);
    expect(result.interestEarned).toBeCloseTo(target - 600_000_000, 2);
    expect(result.interestEarned).toBeCloseTo(100_601_379.336, 2);
  });

  it("reports a NEGATIVE return contribution when the return loses money", () => {
    // The floor exists for the over-funded case only. A negative investment
    // return is an input the page accepts (it rejects only <= -100), and there
    // the return genuinely destroys value that the monthly contribution has to
    // make up. Flooring it to 0 claimed the return contributed nothing and
    // left the detail block not adding up.
    //
    // Reference from the definition, not from the implementation: the return's
    // share is whatever the target is made of that the saver did not put in,
    // i.e. target − today's savings − everything contributed.
    for (const investmentReturnPercent of [-2, -5, -10]) {
      const result = plan({ ...BASE, investmentReturnPercent });
      expect(result.alreadyFunded).toBe(false);
      expect(result.interestEarned).toBeLessThan(0);
      expect(result.interestEarned).toBeCloseTo(
        result.targetAtStart - 200_000_000 - result.totalContributions,
        2,
      );
    }
    // The figure the page shows at −5%/năm, pinned.
    expect(
      plan({ ...BASE, investmentReturnPercent: -5 }).interestEarned,
    ).toBeCloseTo(-280_396_228.0, 0);
    // A zero return contributes exactly nothing — the boundary between the two.
    expect(
      plan({ ...BASE, investmentReturnPercent: 0 }).interestEarned,
    ).toBeCloseTo(0, 6);
  });

  it("has no return contribution when study starts now and savings cover it", () => {
    // No time elapses, so the return provides nothing — and certainly not a
    // negative amount, which is what the unfloored difference gave.
    const result = plan({
      annualTuitionToday: 50_000_000,
      yearsUntilStart: 0,
      yearsOfStudy: 1,
      currentSavings: 100_000_000,
    });
    expect(result.monthsToSave).toBe(0);
    expect(result.interestEarned).toBe(0);
  });

  it("has no contribution to solve when study starts now", () => {
    const result = plan({ ...BASE, yearsUntilStart: 0 });
    expect(result.noTimeToSave).toBe(true);
    expect(result.monthsToSave).toBe(0);
    expect(result.monthlyContribution).toBe(0);
    // The target is still meaningful, at today's prices.
    expect(result.years[0].tuition).toBeCloseTo(80_000_000, 6);
    expect(result.shortfallAtStart).toBeGreaterThan(0);
  });

  it("divides evenly at a 0% return", () => {
    const result = plan({ ...BASE, investmentReturnPercent: 0 });
    expect(result.monthlyContribution).toBeCloseTo(
      result.shortfallAtStart / 120,
      4,
    );
  });

  it("keeps the funding identity", () => {
    const result = plan(BASE);
    expect(result.totalContributions).toBeCloseTo(
      result.monthlyContribution * result.monthsToSave,
      6,
    );
    // BASE is under-funded, so the floor on interestEarned is inactive and
    // the raw identity holds exactly. Over-funded plans are covered above.
    expect(result.interestEarned).toBeCloseTo(
      result.targetAtStart - 200_000_000 - result.totalContributions,
      6,
    );
  });
});

describe("computeEducationSavings — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(
      computeEducationSavings({ ...BASE, annualTuitionToday: 0 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, annualTuitionToday: -1 }),
    ).toBeNull();
    expect(computeEducationSavings({ ...BASE, yearsOfStudy: 0 })).toBeNull();
    expect(computeEducationSavings({ ...BASE, yearsOfStudy: 3.5 })).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, yearsUntilStart: -1 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, yearsUntilStart: 10.5 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, currentSavings: -1 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, tuitionInflationPercent: -100 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, investmentReturnPercent: -100 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...BASE, annualTuitionToday: Number.NaN }),
    ).toBeNull();
  });

  it("allows a negative return above −100%", () => {
    expect(
      computeEducationSavings({ ...BASE, investmentReturnPercent: -3 }),
    ).not.toBeNull();
  });
});
