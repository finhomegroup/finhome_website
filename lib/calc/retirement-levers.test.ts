// A lever press writes the field's next raw string in the field's own
// grammar — the same string typing would have produced.
import { describe, expect, it } from "vitest";
import { parseMoney } from "@/lib/calc/number";
import { formatMoneyInput } from "@/lib/calc/number-input";
import { projectRetirement, type RetirementInput } from "@/lib/calc/retirement";
import {
  annualEquivalent,
  contributionDelta,
  leverFacts,
  monthlyEquivalent,
} from "./retirement-lever-facts";
import {
  LEVER_STEP_PER_MONTH,
  LEVER_STEP_PER_YEAR,
  retirementLevers,
  stepMoneyField,
  stepRetirementAge,
} from "./retirement-levers";

describe("stepMoneyField", () => {
  it("steps whole đồng and keeps the reader's grouping", () => {
    expect(stepMoneyField("60.000.000", 1)).toEqual({ next: "72.000.000", block: null });
    expect(stepMoneyField("60.000.000", -1)).toEqual({ next: "48.000.000", block: null });
    expect(stepMoneyField("  60000000 ", 1).next).toBe("72.000.000");
  });

  it("keeps a typed fraction verbatim", () => {
    expect(stepMoneyField("60.000.000,5", 1).next).toBe("72.000.000,5");
    expect(stepMoneyField("60.000.000,", 1).next).toBe("72.000.000,");
  });

  it("clamps to zero once, dropping the fraction, then stops", () => {
    expect(stepMoneyField("5.000.000", -1).next).toBe("0");
    expect(stepMoneyField("5.000.000,5", -1).next).toBe("0");
    expect(stepMoneyField("0", -1)).toEqual({ next: null, block: "atMinimum" });
  });

  it("refuses what it cannot read, and what it cannot hold exactly", () => {
    for (const raw of ["abc", "", "-5.000", "1,2,3"]) {
      expect(stepMoneyField(raw, 1).block, raw).toBe("unreadable");
    }
    expect(stepMoneyField("9.007.199.254.740.991", 1).block).toBe("tooLarge");
  });

  it("round-trips: the next string parses to exactly one step away", () => {
    for (const raw of ["0", "1", "12.000.000", "60.000.000", "123.456.789,25", "999.999.999.999"]) {
      const up = stepMoneyField(raw, 1).next!;
      expect(parseMoney(up)).toBe(parseMoney(raw)! + LEVER_STEP_PER_YEAR);
      expect(formatMoneyInput(up)).toBe(up);
    }
  });
});

describe("stepRetirementAge", () => {
  const ages = (currentAge: number, retirementAge: number, endAge: number) => ({
    currentAge: String(currentAge),
    retirementAge: String(retirementAge),
    endAge: String(endAge),
  });

  it("moves one year inside today … the year before the end", () => {
    expect(stepRetirementAge(ages(35, 60, 85), 1).next).toBe("61");
    expect(stepRetirementAge(ages(35, 60, 85), -1).next).toBe("59");
    expect(stepRetirementAge(ages(35, 35, 85), -1).block).toBe("atEarliestAge");
    expect(stepRetirementAge(ages(35, 84, 85), 1).block).toBe("atLatestAge");
  });

  it("moves an out-of-range age TOWARD the valid range", () => {
    expect(stepRetirementAge(ages(35, 60, 60), -1).next).toBe("59");
    expect(stepRetirementAge(ages(35, 60, 60), 1).block).toBe("afterEndAge");
    expect(stepRetirementAge(ages(65, 60, 85), 1).next).toBe("65");
    expect(stepRetirementAge(ages(65, 60, 85), -1).block).toBe("beforeCurrentAge");
    expect(stepRetirementAge(ages(35, 90, 85), -1).next).toBe("84");
    expect(stepRetirementAge(ages(35, 90, 85), 1).block).toBe("afterEndAge");
    expect(stepRetirementAge(ages(90, 60, 85), 1).block).toBe("noValidAge");
  });

  it("refuses an age that is not a whole count", () => {
    expect(
      stepRetirementAge({ currentAge: "35", retirementAge: "3.5", endAge: "85" }, 1).block,
    ).toBe("unreadable");
  });
});

describe("retirementLevers", () => {
  const DEFAULTS = {
    currentAge: "35",
    retirementAge: "60",
    endAge: "85",
    annualContribution: "60.000.000",
    desiredMonthlySpending: "20.000.000",
  };

  it("offers saving, retirement age and the monthly pension, in that order", () => {
    const levers = retirementLevers(DEFAULTS);
    expect(levers.map((lever) => lever.key)).toEqual([
      "annualContribution",
      "retirementAge",
      "desiredMonthlySpending",
    ]);
    expect(levers[0].up.next).toBe("72.000.000");
    expect(levers[1].up.next).toBe("61");
    // The pension is asked per month, so its step is a month's: 1 triệu.
    expect(levers[2].down.next).toBe("19.000.000");
    expect(parseMoney(levers[2].up.next!)).toBe(20_000_000 + LEVER_STEP_PER_MONTH);
  });

  it("clamps the monthly pension to 0 ₫ below one monthly step", () => {
    const levers = retirementLevers({ ...DEFAULTS, desiredMonthlySpending: "500.000" });
    expect(levers[2].down.next).toBe("0");
    expect(levers[2].up.next).toBe("1.500.000");
  });

  it("makes the saving lever inert when retiring today", () => {
    const [saving] = retirementLevers({ ...DEFAULTS, retirementAge: "35" });
    expect(saving.up.block).toBe("noAccumulationYears");
    expect(saving.down.block).toBe("noAccumulationYears");
  });

  it("lets each lever read its own field when a neighbour is malformed", () => {
    const levers = retirementLevers({ ...DEFAULTS, desiredMonthlySpending: "abc" });
    expect(levers[0].up.next).toBe("72.000.000");
    expect(levers[2].up.block).toBe("unreadable");
  });
});

describe("contributionDelta", () => {
  const BASE: RetirementInput = {
    currentAge: 35,
    retirementAge: 60,
    endAge: 85,
    currentBalance: 500_000_000,
    annualContribution: 60_000_000,
    contributionGrowthPercent: 5,
    returnBeforePercent: 8,
    returnAfterPercent: 5,
    inflationPercent: 4,
    desiredAnnualSpending: 240_000_000,
    otherAnnualIncome: 36_000_000,
  };

  it("is the difference of the two projections' contributions", () => {
    const current = projectRetirement(BASE)!;
    const stepped = projectRetirement({
      ...BASE,
      annualContribution: BASE.annualContribution + LEVER_STEP_PER_YEAR,
    })!;
    const delta = contributionDelta(current, stepped)!;
    const rows = (r: typeof current) =>
      r.years.filter((row) => row.accumulating).reduce((s, row) => s + row.contribution, 0);
    expect(delta.total).toBeCloseTo(rows(stepped) - rows(current), 3);
    expect(delta.lastContributionAge).toBe(59);
    // The growth is the point: 25 growing steps are far more than 25 × 12 triệu.
    expect(delta.total).toBeGreaterThan(25 * LEVER_STEP_PER_YEAR);
    expect(delta.total).toBeCloseTo(572_700_000, -6);
  });

  it("has nothing to say when there is no year to save in", () => {
    const today = { ...BASE, retirementAge: 35 };
    expect(contributionDelta(projectRetirement(today), projectRetirement(today))).toBeNull();
    expect(contributionDelta(null, projectRetirement(BASE))).toBeNull();
  });
});

describe("leverFacts", () => {
  it("reads each fact from its own field, and changes a unit exactly", () => {
    const facts = leverFacts({
      currentAge: "35",
      retirementAge: "60",
      endAge: "85",
      annualContribution: "15.000.000",
      desiredMonthlySpending: "8.000.000",
      contributionGrowthPercent: "6",
    });
    expect(facts).toMatchObject({
      annualContribution: 15_000_000,
      desiredMonthlySpending: 8_000_000,
      retirementAge: 60,
      contributionGrowthPercent: 6,
      savingYears: 25,
      retiredYears: 25,
    });
    expect(annualEquivalent(8_000_000)).toBe(96_000_000);
    expect(monthlyEquivalent(15_000_000)).toBe(1_250_000);
  });

  it("blanks only the slot a malformed field feeds", () => {
    const facts = leverFacts({
      currentAge: "35",
      retirementAge: "90",
      endAge: "85",
      annualContribution: "abc",
      desiredMonthlySpending: "-1",
      contributionGrowthPercent: "6",
    });
    expect(facts.annualContribution).toBeNull();
    expect(facts.desiredMonthlySpending).toBeNull();
    expect(facts.savingYears).toBeNull();
    expect(facts.retiredYears).toBeNull();
    expect(facts.retirementAge).toBe(90);
    expect(facts.contributionGrowthPercent).toBe(6);
  });
});
