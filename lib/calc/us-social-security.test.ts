import { describe, expect, it } from "vitest";
import { PAYROLL_YEARS } from "@/lib/calc/us-payroll";
import {
  aimeFromEarnings,
  AVERAGING_YEARS,
  BEND_POINT_YEAR_ORDER,
  BEND_POINTS,
  benefitFactorPercent,
  claimingSchedule,
  EARLIEST_CLAIM_AGE,
  EARNINGS_TEST,
  earningsTestWithholding,
  fullRetirementAgeMonths,
  LATEST_CLAIM_AGE,
  piaFromAime,
  roundDownToDime,
  roundDownToDollar,
  splitAgeMonths,
  SPOUSAL_MAX_PERCENT,
  spousalFactorPercent,
} from "@/lib/calc/us-social-security";

const YEARS = Object.keys(BEND_POINTS)
  .map(Number)
  .sort((a, b) => a - b);

describe("the vendored bend points", () => {
  it("keys each entry by its own year and offers them newest first", () => {
    for (const year of YEARS) expect(BEND_POINTS[year].year).toBe(year);
    expect([...BEND_POINT_YEAR_ORDER].sort((a, b) => a - b)).toEqual(YEARS);
    for (let i = 1; i < BEND_POINT_YEAR_ORDER.length; i += 1) {
      expect(BEND_POINT_YEAR_ORDER[i - 1]).toBeGreaterThan(
        BEND_POINT_YEAR_ORDER[i],
      );
    }
  });

  it("keeps the first bend point well below the second, and both rising", () => {
    for (const year of YEARS) {
      const p = BEND_POINTS[year];
      expect(p.firstBendPoint).toBeGreaterThan(0);
      expect(p.secondBendPoint).toBeGreaterThan(p.firstBendPoint * 4);
    }
    for (let i = 1; i < YEARS.length; i += 1) {
      // Both are indexed to the average wage index, which does not fall.
      expect(BEND_POINTS[YEARS[i]].firstBendPoint).toBeGreaterThan(
        BEND_POINTS[YEARS[i - 1]].firstBendPoint,
      );
      expect(BEND_POINTS[YEARS[i]].secondBendPoint).toBeGreaterThan(
        BEND_POINTS[YEARS[i - 1]].secondBendPoint,
      );
    }
  });

  it("pins the published figures", () => {
    // The whole table is a transcription, so the transcription is what needs
    // asserting. Check the SSA's published formula before changing these.
    expect(BEND_POINTS[2024]).toMatchObject({
      firstBendPoint: 1_174,
      secondBendPoint: 7_078,
      taxableMaximum: 168_600,
    });
    expect(BEND_POINTS[2025]).toMatchObject({
      firstBendPoint: 1_226,
      secondBendPoint: 7_391,
      taxableMaximum: 176_100,
    });
  });

  it("agrees with us-payroll.ts on the taxable maximum, where both have a year", () => {
    // Two modules transcribe the same published figure for their own
    // purposes. Asserting they agree turns each into a check on the other,
    // which is the cheapest guard available against a transcription slip.
    let overlap = 0;
    for (const year of YEARS) {
      const payroll = PAYROLL_YEARS[year];
      if (payroll === undefined) continue;
      overlap += 1;
      expect(
        BEND_POINTS[year].taxableMaximum,
        `taxable maximum disagrees for ${year}`,
      ).toBe(payroll.socialSecurityWageBase);
    }
    // And the years really do overlap, so this is not a vacuous pass.
    expect(overlap).toBeGreaterThan(0);
  });
});

describe("fullRetirementAgeMonths", () => {
  it("is 66 flat for 1943 to 1954", () => {
    for (const year of [1943, 1948, 1954]) {
      expect(fullRetirementAgeMonths(year)).toBe(66 * 12);
    }
  });

  it("steps two months a year through the 1955 to 1959 cohorts", () => {
    expect(fullRetirementAgeMonths(1955)).toBe(66 * 12 + 2);
    expect(fullRetirementAgeMonths(1956)).toBe(66 * 12 + 4);
    expect(fullRetirementAgeMonths(1957)).toBe(66 * 12 + 6);
    expect(fullRetirementAgeMonths(1958)).toBe(66 * 12 + 8);
    expect(fullRetirementAgeMonths(1959)).toBe(66 * 12 + 10);
  });

  it("is 67 flat from 1960", () => {
    for (const year of [1960, 1975, 2005]) {
      expect(fullRetirementAgeMonths(year)).toBe(67 * 12);
    }
  });

  it("steps two months a year through the older cohorts too", () => {
    expect(fullRetirementAgeMonths(1937)).toBe(65 * 12);
    expect(fullRetirementAgeMonths(1938)).toBe(65 * 12 + 2);
    expect(fullRetirementAgeMonths(1942)).toBe(65 * 12 + 10);
  });

  it("never falls as the birth year rises", () => {
    // The schedule only ever moves the age later. A slip in one of the two
    // stepped ranges would usually break this.
    let previous = 0;
    for (let year = 1930; year <= 2010; year += 1) {
      const months = fullRetirementAgeMonths(year);
      expect(months, `${year}`).toBeGreaterThanOrEqual(previous);
      previous = months;
    }
  });

  it("splits a month count back into years and months", () => {
    expect(splitAgeMonths(66 * 12 + 6)).toEqual({ years: 66, months: 6 });
    expect(splitAgeMonths(67 * 12)).toEqual({ years: 67, months: 0 });
  });
});

describe("benefitFactorPercent", () => {
  it("is exactly 100% at full retirement age", () => {
    for (const birthYear of [1943, 1957, 1960]) {
      const fra = fullRetirementAgeMonths(birthYear);
      expect(benefitFactorPercent(fra, fra)).toBeCloseTo(100, 10);
    }
  });

  it("gives 70% at 62 for a full retirement age of 67", () => {
    // The published figure, and the one a single-rate reduction gets wrong:
    // 60 months at 5/9 of 1% would be 66,67%.
    const fra = fullRetirementAgeMonths(1960);
    expect(benefitFactorPercent(fra, 62 * 12)).toBeCloseTo(70, 10);
  });

  it("gives 75% at 62 for a full retirement age of 66", () => {
    const fra = fullRetirementAgeMonths(1950);
    expect(benefitFactorPercent(fra, 62 * 12)).toBeCloseTo(75, 10);
  });

  it("switches tiers at exactly 36 months early", () => {
    const fra = fullRetirementAgeMonths(1960);
    // 36 months early: all in the first tier, 20%.
    expect(benefitFactorPercent(fra, fra - 36)).toBeCloseTo(80, 10);
    // 37 months: the extra month is charged at the lower 5/12 rate.
    expect(benefitFactorPercent(fra, fra - 37)).toBeCloseTo(
      80 - 5 / 12,
      10,
    );
    // Which is a SMALLER step than the month before it — the reduction
    // decelerates, and a page that used one rate would show it accelerating.
    const step36 = benefitFactorPercent(fra, fra - 35)! - benefitFactorPercent(fra, fra - 36)!;
    const step37 = benefitFactorPercent(fra, fra - 36)! - benefitFactorPercent(fra, fra - 37)!;
    expect(step37).toBeLessThan(step36);
  });

  it("gives 124% at 70 for a full retirement age of 67", () => {
    const fra = fullRetirementAgeMonths(1960);
    expect(benefitFactorPercent(fra, 70 * 12)).toBeCloseTo(124, 10);
  });

  it("gives 132% at 70 for a full retirement age of 66", () => {
    const fra = fullRetirementAgeMonths(1950);
    expect(benefitFactorPercent(fra, 70 * 12)).toBeCloseTo(132, 10);
  });

  it("rejects a claim outside 62 to 70 rather than capping it", () => {
    const fra = fullRetirementAgeMonths(1960);
    expect(benefitFactorPercent(fra, 61 * 12 + 11)).toBe(null);
    expect(benefitFactorPercent(fra, 70 * 12 + 1)).toBe(null);
    expect(benefitFactorPercent(fra, Number.NaN)).toBe(null);
  });

  it("rises monotonically with the claiming month", () => {
    const fra = fullRetirementAgeMonths(1960);
    let previous = 0;
    for (let months = EARLIEST_CLAIM_AGE * 12; months <= LATEST_CLAIM_AGE * 12; months += 1) {
      const factor = benefitFactorPercent(fra, months)!;
      expect(factor, `${months} months`).toBeGreaterThan(previous);
      previous = factor;
    }
  });
});

describe("spousalFactorPercent", () => {
  it("caps at half the worker's PIA at full retirement age", () => {
    const fra = fullRetirementAgeMonths(1960);
    expect(spousalFactorPercent(fra, fra)).toBe(SPOUSAL_MAX_PERCENT);
  });

  it("earns NO delayed credit past full retirement age", () => {
    // The asymmetry that catches people: waiting adds nothing to a spousal
    // benefit, while it adds 8% a year to a worker's own.
    const fra = fullRetirementAgeMonths(1960);
    expect(spousalFactorPercent(fra, 68 * 12)).toBe(SPOUSAL_MAX_PERCENT);
    expect(spousalFactorPercent(fra, 70 * 12)).toBe(SPOUSAL_MAX_PERCENT);
    expect(benefitFactorPercent(fra, 70 * 12)!).toBeGreaterThan(100);
  });

  it("gives 32,5% at 62 for a full retirement age of 67", () => {
    // The published figure. 25% for the first 36 months plus 10% for the
    // next 24 is a 35% reduction, applied to the 50% maximum.
    const fra = fullRetirementAgeMonths(1960);
    expect(spousalFactorPercent(fra, 62 * 12)).toBeCloseTo(32.5, 10);
  });

  it("gives 35% at 62 for a full retirement age of 66", () => {
    const fra = fullRetirementAgeMonths(1950);
    expect(spousalFactorPercent(fra, 62 * 12)).toBeCloseTo(35, 10);
  });

  it("rejects a claim outside 62 to 70", () => {
    const fra = fullRetirementAgeMonths(1960);
    expect(spousalFactorPercent(fra, 61 * 12)).toBe(null);
    expect(spousalFactorPercent(fra, 71 * 12)).toBe(null);
  });
});

describe("aimeFromEarnings", () => {
  it("divides a full career's earnings by twelve", () => {
    const r = aimeFromEarnings(78_000, 35, 2025)!;
    expect(r.aime).toBeCloseTo(6_500, 10);
    expect(r.yearsCounted).toBe(35);
    expect(r.zeroYears).toBe(0);
    expect(r.cappedByTaxableMaximum).toBe(false);
  });

  it("averages a SHORT career against zeros, not against itself", () => {
    // The most misunderstood part of the formula. Twenty-five years of the
    // same earnings gives 25/35 of the AIME, not all of it.
    const full = aimeFromEarnings(78_000, 35, 2025)!;
    const short = aimeFromEarnings(78_000, 25, 2025)!;
    expect(short.zeroYears).toBe(10);
    expect(short.aime).toBeCloseTo(full.aime * (25 / 35), 10);
    expect(short.aime).toBeLessThan(full.aime);
  });

  it("counts no more than 35 years, however long the career", () => {
    const at35 = aimeFromEarnings(78_000, 35, 2025)!;
    for (const years of [36, 45, 70]) {
      const longer = aimeFromEarnings(78_000, years, 2025)!;
      expect(longer.yearsCounted).toBe(AVERAGING_YEARS);
      expect(longer.aime).toBeCloseTo(at35.aime, 10);
    }
  });

  it("cuts earnings above the taxable maximum", () => {
    const p = BEND_POINTS[2025];
    const r = aimeFromEarnings(400_000, 35, 2025)!;
    expect(r.cappedByTaxableMaximum).toBe(true);
    expect(r.cappedEarnings).toBe(p.taxableMaximum);
    expect(r.aime).toBeCloseTo(p.taxableMaximum / 12, 10);
    // Exactly at the maximum is not "capped": nothing was cut.
    const at = aimeFromEarnings(p.taxableMaximum, 35, 2025)!;
    expect(at.cappedByTaxableMaximum).toBe(false);
    expect(at.aime).toBeCloseTo(r.aime, 10);
  });

  it("uses the formula year's own taxable maximum", () => {
    const older = aimeFromEarnings(400_000, 35, 2024)!;
    const newer = aimeFromEarnings(400_000, 35, 2025)!;
    expect(newer.aime).toBeGreaterThan(older.aime);
  });

  it("rejects what it cannot use", () => {
    expect(aimeFromEarnings(-1, 35, 2025)).toBe(null);
    expect(aimeFromEarnings(78_000, -1, 2025)).toBe(null);
    expect(aimeFromEarnings(78_000, 30.5, 2025)).toBe(null);
    expect(aimeFromEarnings(78_000, 71, 2025)).toBe(null);
    expect(aimeFromEarnings(78_000, 35, 2026)).toBe(null);
  });

  it("gives zero for a career of no years", () => {
    const r = aimeFromEarnings(78_000, 0, 2025)!;
    expect(r.aime).toBe(0);
    expect(r.zeroYears).toBe(AVERAGING_YEARS);
    expect(piaFromAime(r.aime, 2025)!.pia).toBe(0);
  });
});

describe("piaFromAime", () => {
  it("applies 90/32/15 across the three tiers", () => {
    const p = BEND_POINTS[2025];
    const r = piaFromAime(8_000, 2025)!;
    expect(r.firstTierAime).toBe(p.firstBendPoint);
    expect(r.secondTierAime).toBe(p.secondBendPoint - p.firstBendPoint);
    expect(r.thirdTierAime).toBe(8_000 - p.secondBendPoint);
    expect(r.firstTierPia).toBeCloseTo(p.firstBendPoint * 0.9, 6);
    expect(r.secondTierPia).toBeCloseTo(
      (p.secondBendPoint - p.firstBendPoint) * 0.32,
      6,
    );
    expect(r.thirdTierPia).toBeCloseTo((8_000 - p.secondBendPoint) * 0.15, 6);
    expect(r.pia).toBeCloseTo(
      roundDownToDime(r.firstTierPia + r.secondTierPia + r.thirdTierPia),
      10,
    );
  });

  it("stays in the first tier below the first bend point", () => {
    const r = piaFromAime(1_000, 2025)!;
    expect(r.pia).toBeCloseTo(900, 10);
    expect(r.secondTierAime).toBe(0);
    expect(r.thirdTierAime).toBe(0);
    expect(r.marginalRatePercent).toBe(90);
    expect(r.replacementRatePercent).toBeCloseTo(90, 10);
  });

  it("puts the next dollar in the tier ABOVE a bend point", () => {
    const p = BEND_POINTS[2025];
    // Exactly at the bend point, the next dollar is charged at the next
    // rate down. Reporting 90% there would overstate the marginal rate.
    expect(piaFromAime(p.firstBendPoint - 1, 2025)!.marginalRatePercent).toBe(90);
    expect(piaFromAime(p.firstBendPoint, 2025)!.marginalRatePercent).toBe(32);
    expect(piaFromAime(p.secondBendPoint - 1, 2025)!.marginalRatePercent).toBe(32);
    expect(piaFromAime(p.secondBendPoint, 2025)!.marginalRatePercent).toBe(15);
  });

  it("is continuous at both bend points", () => {
    // A tier boundary that jumped would mean the tier arithmetic was wrong.
    const p = BEND_POINTS[2025];
    for (const bend of [p.firstBendPoint, p.secondBendPoint]) {
      const below = piaFromAime(bend - 1, 2025)!.pia;
      const at = piaFromAime(bend, 2025)!.pia;
      const above = piaFromAime(bend + 1, 2025)!.pia;
      expect(at - below).toBeLessThan(1);
      expect(above - at).toBeLessThan(1);
    }
  });

  it("makes the formula regressive, which is its whole design", () => {
    const low = piaFromAime(2_000, 2025)!;
    const high = piaFromAime(10_000, 2025)!;
    expect(high.pia).toBeGreaterThan(low.pia);
    // Five times the earnings, about 2,57 times the benefit.
    expect(high.pia / low.pia).toBeGreaterThan(2.5);
    expect(high.pia / low.pia).toBeLessThan(2.6);
    expect(high.replacementRatePercent!).toBeLessThan(
      low.replacementRatePercent!,
    );
  });

  it("uses the eligibility year's own bend points", () => {
    const older = piaFromAime(8_000, 2024)!;
    const newer = piaFromAime(8_000, 2025)!;
    // The bend points rose, so more of the same AIME falls in the higher
    // tiers and the PIA is larger.
    expect(newer.pia).toBeGreaterThan(older.pia);
  });

  it("refuses an eligibility year the table does not cover", () => {
    expect(piaFromAime(8_000, 2023)).toBe(null);
    expect(piaFromAime(8_000, 2026)).toBe(null);
  });

  it("rejects a negative AIME and handles zero", () => {
    expect(piaFromAime(-1, 2025)).toBe(null);
    const zero = piaFromAime(0, 2025)!;
    expect(zero.pia).toBe(0);
    expect(zero.replacementRatePercent).toBe(null);
  });
});

describe("the statutory roundings", () => {
  it("rounds the PIA DOWN to the next lower dime", () => {
    expect(roundDownToDime(1_234.56)).toBeCloseTo(1_234.5, 10);
    expect(roundDownToDime(1_234.5)).toBeCloseTo(1_234.5, 10);
    expect(roundDownToDime(1_234.49)).toBeCloseTo(1_234.4, 10);
    expect(roundDownToDime(0)).toBe(0);
  });

  it("does not lose a dime to a float residue", () => {
    // 1234,6 is not representable, and Math.floor on the raw product would
    // give 1234,5 — a real ten-cent error created by float representation.
    expect(roundDownToDime(1_234.6)).toBeCloseTo(1_234.6, 10);
    expect(roundDownToDime(0.3)).toBeCloseTo(0.3, 10);
    expect(roundDownToDime(2_921.7)).toBeCloseTo(2_921.7, 10);
  });

  it("rounds a monthly benefit DOWN to the next lower dollar", () => {
    expect(roundDownToDollar(1_234.99)).toBe(1_234);
    expect(roundDownToDollar(1_234.0)).toBe(1_234);
    expect(roundDownToDollar(0.99)).toBe(0);
  });

  it("applies both roundings in the schedule, always downward", () => {
    const fra = fullRetirementAgeMonths(1960);
    const schedule = claimingSchedule(2_500.55, fra)!;
    for (const option of schedule) {
      expect(Number.isInteger(option.monthlyBenefit)).toBe(true);
      expect(option.monthlyBenefit).toBeLessThanOrEqual(
        2_500.55 * (option.factorPercent / 100),
      );
    }
  });
});

describe("claimingSchedule", () => {
  it("offers every whole age from 62 to 70", () => {
    const fra = fullRetirementAgeMonths(1960);
    const schedule = claimingSchedule(3_000, fra)!;
    expect(schedule).toHaveLength(9);
    expect(schedule[0].age).toBe(62);
    expect(schedule.at(-1)!.age).toBe(70);
  });

  it("marks full retirement age when it lands on a whole year", () => {
    const schedule = claimingSchedule(3_000, fullRetirementAgeMonths(1960))!;
    const atFra = schedule.filter((option) => option.isFullRetirementAge);
    expect(atFra).toHaveLength(1);
    expect(atFra[0].age).toBe(67);
    expect(atFra[0].factorPercent).toBeCloseTo(100, 10);
  });

  it("marks NO whole age when full retirement age falls mid-year", () => {
    // The 1957 cohort reaches it at 66 and 6 months, so no row is exactly
    // 100% — and a page must not label one of them as though it were.
    const schedule = claimingSchedule(3_000, fullRetirementAgeMonths(1957))!;
    expect(schedule.some((option) => option.isFullRetirementAge)).toBe(false);
    const at66 = schedule.find((option) => option.age === 66)!;
    const at67 = schedule.find((option) => option.age === 67)!;
    expect(at66.factorPercent).toBeLessThan(100);
    expect(at67.factorPercent).toBeGreaterThan(100);
    expect(at66.monthsFromFra).toBe(-6);
    expect(at67.monthsFromFra).toBe(6);
  });

  it("rises with every year waited", () => {
    const schedule = claimingSchedule(3_000, fullRetirementAgeMonths(1960))!;
    for (let i = 1; i < schedule.length; i += 1) {
      expect(schedule[i].monthlyBenefit).toBeGreaterThan(
        schedule[i - 1].monthlyBenefit,
      );
    }
    // And the whole range is 70% to 124% of the PIA.
    expect(schedule[0].monthlyBenefit).toBe(Math.floor(3_000 * 0.7));
    expect(schedule.at(-1)!.monthlyBenefit).toBe(Math.floor(3_000 * 1.24));
  });

  it("keeps the annual figure exactly twelve monthly ones", () => {
    const schedule = claimingSchedule(2_345.67, fullRetirementAgeMonths(1958))!;
    for (const option of schedule) {
      expect(option.annualBenefit).toBe(option.monthlyBenefit * 12);
    }
  });

  it("rejects a negative PIA and handles zero", () => {
    expect(claimingSchedule(-1, 804)).toBe(null);
    const zero = claimingSchedule(0, 804)!;
    for (const option of zero) expect(option.monthlyBenefit).toBe(0);
  });
});

describe("earningsTestWithholding", () => {
  const BASE = {
    annualBenefit: 24_000,
    annualEarnings: 40_000,
    exemptAmount: EARNINGS_TEST.underFraAnnual,
    withholdingRatio: EARNINGS_TEST.underFraWithholdingRatio,
    atOrAboveFra: false,
  };

  it("withholds one dollar for every two above the exempt amount", () => {
    const r = earningsTestWithholding(BASE)!;
    expect(r.excessEarnings).toBe(40_000 - 23_400);
    expect(r.withheld).toBeCloseTo((40_000 - 23_400) / 2, 6);
    expect(r.paid).toBeCloseTo(24_000 - r.withheld, 6);
    expect(r.exempt).toBe(false);
  });

  it("withholds one in three in the year full retirement age is reached", () => {
    const r = earningsTestWithholding({
      ...BASE,
      exemptAmount: EARNINGS_TEST.fraYearAnnual,
      withholdingRatio: EARNINGS_TEST.fraYearWithholdingRatio,
      annualEarnings: 80_000,
    })!;
    expect(r.excessEarnings).toBe(80_000 - 62_160);
    expect(r.withheld).toBeCloseTo((80_000 - 62_160) / 3, 6);
  });

  it("withholds nothing at or above full retirement age", () => {
    const r = earningsTestWithholding({
      ...BASE,
      annualEarnings: 500_000,
      atOrAboveFra: true,
    })!;
    expect(r.withheld).toBe(0);
    expect(r.paid).toBe(24_000);
    expect(r.excessEarnings).toBe(0);
    expect(r.exempt).toBe(true);
  });

  it("withholds nothing below the exempt amount", () => {
    const r = earningsTestWithholding({ ...BASE, annualEarnings: 20_000 })!;
    expect(r.excessEarnings).toBe(0);
    expect(r.withheld).toBe(0);
    expect(r.paid).toBe(24_000);
  });

  it("never withholds more than the benefit itself", () => {
    // The test withholds a benefit; it does not create a debt. Without the
    // cap a high earner would show a negative payment.
    const r = earningsTestWithholding({ ...BASE, annualEarnings: 500_000 })!;
    expect(r.withheld).toBe(24_000);
    expect(r.paid).toBe(0);
    expect(r.paid).toBeGreaterThanOrEqual(0);
  });

  it("rejects negative money and a zero ratio", () => {
    expect(earningsTestWithholding({ ...BASE, annualBenefit: -1 })).toBe(null);
    expect(earningsTestWithholding({ ...BASE, annualEarnings: -1 })).toBe(null);
    expect(earningsTestWithholding({ ...BASE, exemptAmount: -1 })).toBe(null);
    expect(earningsTestWithholding({ ...BASE, withholdingRatio: 0 })).toBe(null);
  });

  it("keeps the exempt amounts in the order the statute puts them", () => {
    // The year-of-FRA amount is far higher and withholds less harshly.
    expect(EARNINGS_TEST.fraYearAnnual).toBeGreaterThan(
      EARNINGS_TEST.underFraAnnual,
    );
    expect(EARNINGS_TEST.fraYearWithholdingRatio).toBeGreaterThan(
      EARNINGS_TEST.underFraWithholdingRatio,
    );
  });
});
