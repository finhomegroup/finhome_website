import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readRetirement } from "@/components/calc/retirement-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import {
  projectRetirement,
  solveRequiredContribution,
  type RetirementInput,
} from "@/lib/calc/retirement";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

// The module at its shipped defaults — docs §6. This page ships its own
// defaults rather than the shared ones, so the parse is worth asserting
// separately: `currentBalance: "250.000"` read with parseDecimal would be 250.
const READ = readRetirement(C.fields.defaults);

function at(over: Partial<RetirementInput> = {}) {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const input = { ...READ.input, ...over };
  const result = projectRetirement(input);
  if (!result) throw new Error("projectRetirement returned null");
  return { input, result, solved: solveRequiredContribution(input) };
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-savings-analysis.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("phan-tich-tiet-kiem-huu-tri at its shipped defaults", () => {
  it("parses its own defaults with the right parser per field kind", () => {
    expect(READ.input).not.toBe(null);
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
    expect(READ.input).toMatchObject({
      currentAge: 45,
      retirementAge: 65,
      endAge: 95,
      currentBalance: 250_000,
      annualContribution: 15_000,
      contributionGrowthPercent: 2,
      returnBeforePercent: 7,
      returnAfterPercent: 5,
      inflationPercent: 2.5,
      desiredAnnualSpending: 80_000,
      otherAnnualIncome: 25_000,
    });
  });

  it("opens on a plan that is SHORT, which is what the page diagnoses", () => {
    // A diagnosis tool whose default state reports "đủ" demonstrates nothing.
    const { result } = at();
    expect(result.depletionAge).not.toBe(null);
    expect(result.capitalCoveragePercent!).toBeLessThan(100);
  });

  it("quotes the coverage, the gap and the age the money runs out", () => {
    const { result } = at();
    expect(formatPercent(result.capitalCoveragePercent!, 1)).toBe("88,9%");
    expect(usd(result.realBalanceShortfallAtRetirement)).toBe("131.532");
    expect(result.depletionAge).toBe(90);
    expect(result.yearsShort).toBe(5);
    expect(C.coverageNotice).toContain("88,9%");
    expect(C.coverageNotice).toContain("131.532");
    expect(C.coverageNotice).toContain("90");
    expect(C.form.gapNotice).toContain("88,9%");
    expect(C.form.gapNotice).toContain("90");
  });

  it("makes the point that 88,9% of the capital is not 88,9% of the retirement", () => {
    // The claim the notice and the first FAQ both rest on: the years lost are
    // far out of proportion to the capital missing. Stated as a measured
    // relation, not an adjective.
    const { result } = at();
    const capitalMissing = 100 - result.capitalCoveragePercent!;
    const yearsMissing = (result.yearsShort / 30) * 100;
    expect(formatPercent(capitalMissing, 1)).toBe("11,1%");
    expect(yearsMissing).toBeCloseTo(16.67, 2);
    expect(yearsMissing).toBeGreaterThan(capitalMissing * 1.4);
    expect(C.coverageNotice).toContain("11,1%");
  });

  it("quotes all three fixes, each solved on its own terms", () => {
    const { result, solved } = at();
    expect(usdCents(solved!.annualContribution)).toBe("19.225,10");
    const extraMonthly = (solved!.annualContribution - 15_000) / 12;
    expect(usdCents(extraMonthly)).toBe("352,09");
    expect(formatPercent((solved!.annualContribution / 15_000 - 1) * 100, 1)).toBe(
      "28,2%",
    );
    expect(usdCents(result.sustainableSpending!)).toBe("73.915,09");
    expect(C.coverageNotice).toContain("352,09");
    expect(C.coverageNotice).toContain("28,2%");
  });

  it("finds the retirement age that fixes the plan with no extra contribution", () => {
    // The component searches upward for the first funded age. Reproduce that
    // search and pin what it finds, plus the two-sided reason it works.
    const { input } = at();
    let firstFunded: number | null = null;
    for (let age = input.retirementAge; age < input.endAge; age += 1) {
      const p = projectRetirement({ ...input, retirementAge: age })!;
      if (p.depletionAge === null) {
        firstFunded = age;
        break;
      }
    }
    expect(firstFunded).toBe(67);

    const now = at().result;
    const later = at({ retirementAge: 67 }).result;
    // Both blades: what you reach goes UP and what you need comes DOWN.
    expect(later.realBalanceAtRetirement).toBeGreaterThan(
      now.realBalanceAtRetirement,
    );
    expect(later.requiredRealBalanceAtRetirement).toBeLessThan(
      now.requiredRealBalanceAtRetirement,
    );
    expect(usd(now.realBalanceAtRetirement)).toBe("1.057.356");
    expect(usd(later.realBalanceAtRetirement)).toBe("1.181.188");
    expect(usd(now.requiredRealBalanceAtRetirement)).toBe("1.188.888");
    expect(usd(later.requiredRealBalanceAtRetirement)).toBe("1.133.533");
    const a = C.faq.items[1].a;
    for (const figure of [
      "1.057.356",
      "1.181.188",
      "1.188.888",
      "1.133.533",
    ]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("makes retiring at 67 need LESS than is already being contributed", () => {
    // The counter-intuitive figure the notice ends on, and the reason the
    // sensitivity table is the strongest thing on the page.
    const later = at({ retirementAge: 67 });
    expect(usdCents(later.solved!.annualContribution)).toBe("13.670,88");
    expect(later.solved!.annualContribution).toBeLessThan(15_000);
    expect(C.coverageNotice).toContain("13.670,88");
  });

  it("pins the sensitivity table the component renders", () => {
    const { input } = at();
    const seen: string[] = [];
    for (const offset of [-5, -3, 0, 2, 5, 7]) {
      const age = input.retirementAge + offset;
      const p = projectRetirement({ ...input, retirementAge: age })!;
      seen.push(
        `${age} ${formatPercent(p.capitalCoveragePercent!, 1)} ${
          p.depletionAge === null ? "-" : p.depletionAge
        }`,
      );
    }
    expect(seen).toEqual([
      "60 60,0% 77",
      "62 70,2% 82",
      "65 88,9% 90",
      "67 104,2% -",
      "70 132,7% -",
      "72 156,7% -",
    ]);
  });

  it("leaves the coverage row EMPTY, not 100%, when no capital is needed", () => {
    // Other income already covers the spend. "100% covered" and "nothing to
    // cover" are different statements and the page must not conflate them.
    const { result } = at({ desiredAnnualSpending: 20_000 });
    expect(result.requiredRealBalanceAtRetirement).toBe(0);
    expect(result.capitalCoveragePercent).toBe(null);
    expect(result.realBalanceShortfallAtRetirement).toBe(0);
    expect(result.depletionAge).toBe(null);
  });

  it("states the nominal requirement with the module's own deflator", () => {
    const { result } = at();
    expect(usd(result.requiredBalanceAtRetirement)).toBe("1.948.132");
    expect(usd(result.balanceAtRetirement)).toBe("1.732.601");
    // The pair must be deflated by the same factor as the real pair, or the
    // page would compare two different years' money.
    expect(
      result.requiredBalanceAtRetirement / result.requiredRealBalanceAtRetirement,
    ).toBeCloseTo(
      result.balanceAtRetirement / result.realBalanceAtRetirement,
      10,
    );
    expect(
      result.requiredBalanceAtRetirement /
        result.requiredRealBalanceAtRetirement,
    ).toBeCloseTo(Math.pow(1.025, 20), 10);
  });

  it("warns that a higher post-retirement return shrinks the gap on screen only", () => {
    // formula.body[3]'s claim, checked rather than asserted in prose alone.
    const optimistic = at({ returnAfterPercent: 7 }).result;
    expect(optimistic.requiredRealBalanceAtRetirement).toBeLessThan(
      at().result.requiredRealBalanceAtRetirement,
    );
    expect(optimistic.depletionAge).toBe(null);
    // Reached is untouched: the lever moved the requirement, not the saving.
    expect(optimistic.realBalanceAtRetirement).toBeCloseTo(
      at().result.realBalanceAtRetirement,
      6,
    );
  });
});

describe("phan-tich-tiet-kiem-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const { result, solved } = at();
    const later = at({ retirementAge: 67 });
    for (const figure of [
      usdCents(result.realBalanceAtRetirement),
      usdCents(result.balanceAtRetirement),
      usdCents(result.requiredRealBalanceAtRetirement),
      usdCents(result.requiredBalanceAtRetirement),
      usdCents(result.realBalanceShortfallAtRetirement),
      formatPercent(result.capitalCoveragePercent!, 1),
      usdCents(result.sustainableSpending!),
      usdCents(result.spendingShortfall),
      usdCents(result.spendingShortfall / 12),
      usdCents(solved!.annualContribution),
      usdCents(solved!.annualContribution / 12),
      usdCents(solved!.annualContribution - 15_000),
      usdCents((solved!.annualContribution - 15_000) / 12),
      usdCents(later.solved!.annualContribution),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
