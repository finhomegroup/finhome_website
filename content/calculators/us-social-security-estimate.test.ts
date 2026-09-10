import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseMoney,
} from "@/lib/calc/number";
import {
  aimeFromEarnings,
  BEND_POINTS,
  claimingSchedule,
  fullRetirementAgeMonths,
  piaFromAime,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ESTIMATE as C } from "@/content/calculators/us-social-security-estimate";

const D = C.form.defaults;

/** The component's own parse and pipeline, reproduced — docs §6. */
function estimate(
  over: Partial<{
    formulaYear: number;
    earnings: number;
    yearsWorked: number;
    birthYear: number;
    claimAge: number;
  }> = {},
) {
  const input = {
    formulaYear: Number(D.formulaYear),
    earnings: parseMoney(D.earnings)!,
    yearsWorked: parseCount(D.yearsWorked)!,
    birthYear: parseCount(D.birthYear)!,
    claimAge: parseCount(D.claimAge)!,
    ...over,
  };
  const aime = aimeFromEarnings(
    input.earnings,
    input.yearsWorked,
    input.formulaYear,
  );
  if (!aime) throw new Error("aimeFromEarnings returned null");
  const pia = piaFromAime(aime.aime, input.formulaYear);
  if (!pia) throw new Error("piaFromAime returned null");
  const fraMonths = fullRetirementAgeMonths(input.birthYear);
  const schedule = claimingSchedule(pia.pia, fraMonths)!;
  const chosen = schedule.find((option) => option.age === input.claimAge)!;
  return { input, aime, pia, fraMonths, schedule, chosen };
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-social-security-estimate.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("uoc-tinh-an-sinh-xa-hoi at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const { input } = estimate();
    expect(input).toEqual({
      formulaYear: 2026,
      earnings: 78_000,
      yearsWorked: 35,
      birthYear: 1965,
      claimAge: 67,
    });
    // "78.000" through parseDecimal would be 78 — an AIME of 6,50 a month.
    expect(input.earnings).toBe(78_000);
  });

  it("opens on a full career at full retirement age", () => {
    // The clean baseline, so every variation the copy quotes is a departure
    // from a state the reader can see.
    const r = estimate();
    expect(r.aime.zeroYears).toBe(0);
    expect(r.aime.cappedByTaxableMaximum).toBe(false);
    expect(r.chosen.isFullRetirementAge).toBe(true);
    expect(r.chosen.factorPercent).toBeCloseTo(100, 10);
  });

  it("quotes the AIME, the PIA and the replacement rate", () => {
    const r = estimate();
    expect(usdCents(r.aime.aime)).toBe("6.500,00");
    expect(usdCents(r.pia.pia)).toBe("2.825,80");
    expect(formatPercent(r.pia.replacementRatePercent!, 2)).toBe("43,47%");
    expect(C.regressiveNotice).toContain("2.825,80");
    expect(C.regressiveNotice).toContain("43,47%");
  });

  it("quotes each tier of the formula from the module's bend points", () => {
    const r = estimate();
    const p = BEND_POINTS[2026];
    expect(usdCents(r.pia.firstTierAime)).toBe("1.286,00");
    expect(r.pia.firstTierAime).toBe(p.firstBendPoint);
    expect(usdCents(r.pia.firstTierPia)).toBe("1.157,40");
    expect(usdCents(r.pia.secondTierAime)).toBe("5.214,00");
    expect(usdCents(r.pia.secondTierPia)).toBe("1.668,48");
    expect(r.pia.thirdTierAime).toBe(0);
    expect(r.pia.marginalRatePercent).toBe(32);
  });

  it("quotes the whole claiming schedule the table renders", () => {
    const r = estimate();
    expect(r.schedule).toHaveLength(9);
    const at = (age: number) =>
      r.schedule.find((option) => option.age === age)!;
    expect(usd(at(62).monthlyBenefit)).toBe("1.978");
    expect(usd(at(67).monthlyBenefit)).toBe("2.825");
    expect(usd(at(70).monthlyBenefit)).toBe("3.503");
    expect(usd(at(70).monthlyBenefit - at(62).monthlyBenefit)).toBe("1.525");
    expect(formatMoney(at(70).monthlyBenefit / at(62).monthlyBenefit, 2)).toBe(
      "1,77",
    );
    expect(C.form.table.intro).toContain("1,77");
    expect(C.faq.items[2].a).toContain("1.978");
    expect(C.faq.items[2].a).toContain("3.503");
    expect(C.faq.items[2].a).toContain("1,77");
  });

  it("quotes what ten missing years cost, and why it is not 28,6%", () => {
    const full = estimate();
    const short = estimate({ yearsWorked: 25 });
    expect(short.aime.zeroYears).toBe(10);
    expect(usdCents(short.aime.aime)).toBe("4.642,86");
    expect(usdCents(short.pia.pia)).toBe("2.231,50");
    expect(usdCents(full.pia.pia - short.pia.pia)).toBe("594,30");
    const lost = (1 - short.pia.pia / full.pia.pia) * 100;
    expect(formatPercent(lost, 1)).toBe("21,0%");
    // Less than the 10-in-35 share, because the lost AIME sits in the 32%
    // tier rather than the 90% one. This is the FAQ's actual claim.
    expect(lost).toBeLessThan((10 / 35) * 100);
    expect(C.form.zeroYearsNotice).toContain("594,30");
    expect(C.form.zeroYearsNotice).toContain("21,0%");
    const a = C.faq.items[1].a;
    for (const figure of ["2.825,80", "2.231,50", "21,0%", "28,6%"]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the high earner, capped at the taxable maximum", () => {
    const high = estimate({ earnings: 400_000 });
    const p = BEND_POINTS[2026];
    expect(high.aime.cappedByTaxableMaximum).toBe(true);
    expect(usd(high.aime.cappedEarnings)).toBe("184.500");
    expect(high.aime.cappedEarnings).toBe(p.taxableMaximum);
    expect(usdCents(high.aime.aime)).toBe("15.375,00");
    expect(usdCents(high.pia.pia)).toBe("4.369,40");
    expect(formatPercent(high.pia.replacementRatePercent!, 2)).toBe("28,42%");
    expect(high.pia.marginalRatePercent).toBe(15);
  });

  it("quotes the low earner, and the regressivity between the two", () => {
    const low = estimate({ earnings: 30_000 });
    const mid = estimate();
    const high = estimate({ earnings: 400_000 });
    expect(usdCents(low.pia.pia)).toBe("1.545,80");
    expect(formatPercent(low.pia.replacementRatePercent!, 2)).toBe("61,83%");
    // The two ratios the notice puts side by side.
    expect(formatMoney(400_000 / 78_000, 2)).toBe("5,13");
    expect(formatMoney(high.pia.pia / mid.pia.pia, 2)).toBe("1,55");
    // Replacement falls monotonically as earnings rise, which is the claim.
    expect(low.pia.replacementRatePercent!).toBeGreaterThan(
      mid.pia.replacementRatePercent!,
    );
    expect(mid.pia.replacementRatePercent!).toBeGreaterThan(
      high.pia.replacementRatePercent!,
    );
    for (const figure of ["61,83%", "28,42%", "184.500", "5,13", "1,55"]) {
      expect(C.regressiveNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("reads the full retirement age off the birth year", () => {
    expect(estimate().fraMonths).toBe(67 * 12);
    expect(estimate({ birthYear: 1957 }).fraMonths).toBe(66 * 12 + 6);
    expect(estimate({ birthYear: 1950 }).fraMonths).toBe(66 * 12);
    expect(C.form.birthYearHelp).toContain("67");
    expect(C.form.birthYearHelp).toContain("1960");
  });

  it("marks no whole age as full retirement age for a mid-year cohort", () => {
    // The 1957 cohort reaches it at 66 and 6 months, so the table's "tuổi
    // hưởng đủ" marker must not appear on any row.
    const r = estimate({ birthYear: 1957 });
    expect(r.schedule.some((option) => option.isFullRetirementAge)).toBe(false);
  });

  it("says out loud that it is an estimate, as a standing notice", () => {
    // The one place this page could mislead, so the disclosure is not
    // conditional on any input.
    expect(C.form.estimateNotice).toContain("ƯỚC TÍNH");
    expect(C.form.estimateNotice).toContain("my Social Security");
    expect(C.faq.items[4].q).toContain("my Social Security");
  });

  it("explains why the formula year is not the eligibility year", () => {
    expect(C.form.formulaYearHelp).toContain("giá hôm nay");
    expect(C.faq.items[0].q).toContain("62");
    expect(C.formula.body[3]).toContain("300 USD");
  });
});

describe("uoc-tinh-an-sinh-xa-hoi — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = estimate();
    const short = estimate({ yearsWorked: 25 });
    const high = estimate({ earnings: 400_000 });
    const low = estimate({ earnings: 30_000 });
    const at = (age: number) =>
      r.schedule.find((option) => option.age === age)!;
    for (const figure of [
      usdCents(r.aime.aime),
      usdCents(r.pia.pia),
      formatPercent(r.pia.replacementRatePercent!, 2),
      usdCents(r.pia.firstTierAime),
      usdCents(r.pia.firstTierPia),
      usdCents(r.pia.secondTierAime),
      usdCents(r.pia.secondTierPia),
      usd(at(62).monthlyBenefit),
      usd(at(67).monthlyBenefit),
      usd(at(70).monthlyBenefit),
      usd(at(70).monthlyBenefit - at(62).monthlyBenefit),
      usdCents(short.aime.aime),
      usdCents(short.pia.pia),
      usdCents(r.pia.pia - short.pia.pia),
      usd(high.aime.cappedEarnings),
      usdCents(high.aime.aime),
      usdCents(high.pia.pia),
      formatPercent(high.pia.replacementRatePercent!, 2),
      usdCents(low.aime.aime),
      usdCents(low.pia.pia),
      formatPercent(low.pia.replacementRatePercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
