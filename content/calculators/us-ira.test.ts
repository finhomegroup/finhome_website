import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsIra, type UsIraInput } from "@/lib/calc/us-ira";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";
import { US_IRA as C } from "@/content/calculators/us-ira";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): UsIraInput {
  return {
    year: Number(D.year),
    age: parseCount(D.age)!,
    annualContribution: parseMoney(D.contribution)!,
    currentRatePercent: parseDecimal(D.currentRate)!,
    retirementRatePercent: parseDecimal(D.retirementRate)!,
    returnPercent: parseDecimal(D.returnPercent)!,
    years: parseCount(D.years)!,
    capitalGainsRatePercent: parseDecimal(D.capitalGains)!,
  };
}

function run(over: Partial<UsIraInput> = {}) {
  const result = computeUsIra({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUsIra returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-ira.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("ira-truyen-thong-hay-roth at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "7.500" through parseDecimal is 7,5 — a 1000x error that would make
    // every figure on the page plausible and wrong.
    expect(shippedInput()).toEqual({
      year: 2026,
      age: 35,
      annualContribution: 7_500,
      currentRatePercent: 24,
      retirementRatePercent: 22,
      returnPercent: 7,
      years: 30,
      capitalGainsRatePercent: 15,
    });
    // And the shipped contribution is exactly the year's limit, not a stale
    // literal from an older one.
    expect(shippedInput().annualContribution).toBe(RETIREMENT_LIMITS[2026].ira);
    expect(run().excessContribution).toBe(0);
  });

  it("opens on the case that contradicts the rule of thumb", () => {
    // Retirement rate BELOW today's, and Roth still wins. A default state
    // where the rule of thumb happens to work would demonstrate nothing.
    const input = shippedInput();
    expect(input.retirementRatePercent).toBeLessThan(input.currentRatePercent);
    expect(run().verdict).toBe("roth");
  });

  it("quotes the headline figures", () => {
    const r = run();
    expect(usd(r.totalContributed)).toBe("225.000");
    expect(usd(r.balanceAtHorizon)).toBe("758.048");
    expect(usd(r.withdrawalTax)).toBe("166.771");
    expect(usd(r.traditionalAfterTax)).toBe("591.277");
    expect(usd(r.sideAccountAfterTax)).toBe("162.742");
    expect(usd(r.traditionalTotalEqualCost)).toBe("754.019");
    expect(usd(r.rothAdvantageEqualCost)).toBe("4.029");
    expect(formatPercent(r.breakEvenRetirementRatePercent!, 2)).toBe("21,47%");
    expect(C.equalCostNotice).toContain("4.029");
    expect(C.equalCostNotice).toContain("21,47%");
  });

  it("quotes the margin by which the rule of thumb is wrong", () => {
    const r = run();
    const margin = 24 - r.breakEvenRetirementRatePercent!;
    expect(formatMoney(margin, 2)).toBe("2,53");
    expect(C.equalCostNotice).toContain("2,53");
  });

  it("pins the side account's own figures", () => {
    const r = run();
    expect(usdCents(r.upfrontTaxSaving)).toBe("1.800,00");
    expect(usdCents(r.netCostTraditional)).toBe("5.700,00");
    expect(usdCents(r.netCostRoth)).toBe("7.500,00");
    expect(usd(r.sideAccountContribution)).toBe("54.000");
    expect(usd(r.sideAccountGain)).toBe("127.931");
    expect(usd(r.sideAccountTax)).toBe("19.190");
    // formula.body[1] states the per-year cost of each side.
    expect(C.formula.body[1]).toContain("5.700");
    expect(C.formula.body[1]).toContain("1.800");
  });

  it("keeps the two sides at identical after-tax cost, in the copy's own terms", () => {
    const r = run();
    expect(r.netCostTraditional + r.upfrontTaxSaving).toBeCloseTo(
      r.netCostRoth,
      10,
    );
    expect(r.netCostTraditional * 30 + r.sideAccountContribution).toBeCloseTo(
      r.totalContributed,
      8,
    );
  });

  it("reduces to an exact tie with no gains tax and an unchanged rate", () => {
    // The algebraic claim in formula.body[2], asserted rather than asserted
    // in prose only.
    const r = run({ capitalGainsRatePercent: 0, retirementRatePercent: 24 });
    expect(r.rothAdvantageEqualCost).toBeCloseTo(0, 6);
    expect(r.verdict).toBe("equal");
    expect(formatPercent(r.breakEvenRetirementRatePercent!, 2)).toBe("24,00%");
    expect(C.formula.body[3]).toContain("21,47%");
    expect(C.formula.body[3]).toContain("24%");
  });

  it("quotes the same-contribution framing and the pre-tax equivalent", () => {
    const r = run();
    expect(usd(r.rothAdvantageSameContribution)).toBe("166.771");
    // Which is exactly the withdrawal tax, not a separate effect.
    expect(r.rothAdvantageSameContribution).toBeCloseTo(r.withdrawalTax, 6);
    expect(usdCents(r.extraCostOfRoth)).toBe("1.800,00");
    expect(usdCents(r.rothAsPreTaxContribution!)).toBe("9.868,42");
    expect(C.formula.body[4]).toContain("9.868,42");
    expect(C.faq.items[2].a).toContain("9.868,42");
  });

  it("quotes the cost of guessing wrong, which is the FAQ's advice", () => {
    const at22 = run();
    const at12 = run({ retirementRatePercent: 12 });
    expect(usd(Math.abs(at22.rothAdvantageEqualCost))).toBe("4.029");
    expect(usd(Math.abs(at12.rothAdvantageEqualCost))).toBe("71.776");
    expect(at12.verdict).toBe("traditional");
    // "khoảng 4.000" and "hơn 70.000" — a range, so assert the bounds the
    // copy claims rather than a formatted string.
    expect(Math.abs(at22.rothAdvantageEqualCost)).toBeGreaterThan(3_500);
    expect(Math.abs(at22.rothAdvantageEqualCost)).toBeLessThan(4_500);
    expect(Math.abs(at12.rothAdvantageEqualCost)).toBeGreaterThan(70_000);
    expect(C.faq.items[0].a).toContain("4.000");
    expect(C.faq.items[0].a).toContain("70.000");
  });

  it("pins the sensitivity table the component renders", () => {
    const rates = Array.from(
      new Set([0, 10, 12, 22, 24, 32, 35, 37, 22]),
    ).sort((a, b) => a - b);
    expect(rates).toEqual([0, 10, 12, 22, 24, 32, 35, 37]);
    const verdicts = rates.map(
      (rate) => run({ retirementRatePercent: rate }).verdict,
    );
    expect(verdicts).toEqual([
      "traditional",
      "traditional",
      "traditional",
      "roth",
      "roth",
      "roth",
      "roth",
      "roth",
    ]);
    // The switch happens between 12% and 22%, which straddles the 21,47%
    // break-even — so the table cannot contradict the headline row.
    const breakEven = run().breakEvenRetirementRatePercent!;
    expect(breakEven).toBeGreaterThan(12);
    expect(breakEven).toBeLessThan(22);
  });

  it("reports 'equal' inside the band, not a winner by a rounding residue", () => {
    const near = run({ retirementRatePercent: 21 });
    expect(near.verdict).toBe("equal");
    expect(usd(Math.abs(near.rothAdvantageEqualCost))).toBe("3.552");
    expect(C.formula.body[5]).toContain("nửa phần trăm");
  });

  it("quotes the age-50 limit", () => {
    const older = run({ age: 50 });
    expect(usd(older.contributionLimit)).toBe("8.600");
    expect(older.contributionLimit).toBe(
      RETIREMENT_LIMITS[2026].ira + RETIREMENT_LIMITS[2026].iraCatchUp50,
    );
    // And no 60-63 window, which the field help says out loud.
    expect(run({ age: 61 }).contributionLimit).toBe(older.contributionLimit);
    expect(C.form.ageHelp).toContain("60");
  });

  it("says out loud that it does not model the income phase-outs", () => {
    // The one place this page could mislead, so the disclosure is a standing
    // element rather than a conditional notice.
    expect(C.form.deductibilityNotice).toContain("giả định");
    expect(C.form.deductibilityNotice).toContain("ngưỡng");
    expect(C.faq.items[4].q).toContain("quá cao");
  });
});

describe("ira-truyen-thong-hay-roth — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const at12 = run({ retirementRatePercent: 12 });
    const at21 = run({ retirementRatePercent: 21 });
    const older = run({ age: 50 });
    for (const figure of [
      usd(r.totalContributed),
      usd(r.balanceAtHorizon),
      usd(r.withdrawalTax),
      usd(r.traditionalAfterTax),
      usd(r.sideAccountAfterTax),
      usd(r.sideAccountContribution),
      usd(r.sideAccountGain),
      usd(r.sideAccountTax),
      usd(r.traditionalTotalEqualCost),
      usd(r.rothAdvantageEqualCost),
      formatPercent(r.breakEvenRetirementRatePercent!, 2),
      usdCents(r.upfrontTaxSaving),
      usdCents(r.netCostTraditional),
      usdCents(r.netCostRoth),
      usdCents(r.rothAsPreTaxContribution!),
      usd(at12.rothAdvantageEqualCost * -1),
      usd(Math.abs(at21.rothAdvantageEqualCost)),
      usd(older.contributionLimit),
      formatMoney(r.growthFactor, 4),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
