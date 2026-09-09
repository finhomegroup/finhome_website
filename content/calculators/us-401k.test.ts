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
import { computeUs401k, type Us401kInput } from "@/lib/calc/us-401k";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";
import { US_401K as C } from "@/content/calculators/us-401k";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): Us401kInput {
  return {
    year: Number(D.year),
    age: parseCount(D.age)!,
    annualSalary: parseMoney(D.salary)!,
    deferralPercent: parseDecimal(D.deferral)!,
    employerMatchPercent: parseDecimal(D.matchPercent)!,
    employerMatchLimitPercent: parseDecimal(D.matchLimit)!,
    employerExtraPercent: parseDecimal(D.extra)!,
    marginalRatePercent: parseDecimal(D.marginal)!,
    returnPercent: parseDecimal(D.returnPercent)!,
    years: parseCount(D.years)!,
  };
}

function run(over: Partial<Us401kInput> = {}) {
  const result = computeUs401k({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUs401k returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-401k.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("gop-401k at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "90.000" through parseDecimal is 90, and the age and the year are
    // counts, not money: parseMoney("30") is fine but parseMoney("3.0")
    // would be 30, which is the failure this pattern exists to catch.
    expect(shippedInput()).toEqual({
      year: 2026,
      age: 35,
      annualSalary: 90_000,
      deferralPercent: 3,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 6,
      employerExtraPercent: 0,
      marginalRatePercent: 24,
      returnPercent: 7,
      years: 30,
    });
  });

  it("opens on a reader who IS leaving match behind", () => {
    // A page about forfeited match whose default state forfeits nothing has
    // nothing to show.
    const r = run();
    expect(r.unclaimedMatch).toBeGreaterThan(0);
  });

  it("quotes the year's forfeited match and what it grows to", () => {
    const r = run();
    expect(usdCents(r.deferral)).toBe("2.700,00");
    expect(usdCents(r.employerMatch)).toBe("2.700,00");
    expect(usdCents(r.unclaimedMatch)).toBe("2.700,00");
    expect(usd(r.unclaimedMatchAtHorizon)).toBe("272.897");
    expect(C.forfeitNotice).toContain("2.700");
    expect(C.forfeitNotice).toContain("272.897");
  });

  it("quotes the cost of fixing it, and the return on that cost", () => {
    const now = run();
    const full = run({ deferralPercent: 6 });
    const extraNetCost = full.netCostOfDeferral - now.netCostOfDeferral;
    const extraIn = full.totalContribution - now.totalContribution;
    expect(usdCents(extraNetCost)).toBe("2.052,00");
    expect(usdCents(extraIn)).toBe("5.400,00");
    expect(formatPercent((extraIn / extraNetCost) * 100, 0)).toBe("263%");
    expect(usd(now.projectedBalance)).toBe("545.794");
    expect(usd(full.projectedBalance)).toBe("1.091.589");
    // "đúng gấp đôi" — a dollar-for-dollar match on a doubled deferral is
    // exactly twice the contribution, so exactly twice the balance.
    expect(full.projectedBalance / now.projectedBalance).toBeCloseTo(2, 10);
    for (const figure of ["2.052", "5.400", "263%", "545.794", "1.091.589"]) {
      expect(C.forfeitNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("makes the forfeited match equal the match received, at 3% of a 6% formula", () => {
    // Not a coincidence worth hiding: half the threshold claims half the
    // match. Asserted so the two equal figures in the notice are explained
    // rather than looking like a copy-paste slip.
    const r = run();
    expect(r.unclaimedMatch).toBe(r.employerMatch);
    expect(r.matchReturnPercent).toBe(100);
    expect(r.matchValueAtHorizon).toBeCloseTo(r.unclaimedMatchAtHorizon, 6);
  });

  it("quotes the compensation ceiling's effect on a high earner", () => {
    const rich = run({ annualSalary: 500_000, deferralPercent: 6 });
    expect(rich.compensationCapped).toBe(true);
    expect(usd(rich.planCompensation)).toBe("360.000");
    expect(usd(rich.employerMatch)).toBe("21.600");
    expect(usd(500_000 * 0.06)).toBe("30.000");
    expect(usd(500_000 * 0.06 - rich.employerMatch)).toBe("8.400");
    const a = C.faq.items[3].a;
    for (const figure of ["360.000", "21.600", "30.000", "8.400"]) {
      expect(a, `FAQ 4 is missing ${figure}`).toContain(figure);
    }
    // And the copy's ceiling figure is the module's, not a literal.
    expect(a).toContain(usd(RETIREMENT_LIMITS[2026].compensation));
  });

  it("quotes the drop in the deferral ceiling at 64", () => {
    const at63 = run({ age: 63, annualSalary: 200_000, deferralPercent: 100 });
    const at64 = run({ age: 64, annualSalary: 200_000, deferralPercent: 100 });
    expect(usd(at63.deferralLimit)).toBe("35.750");
    expect(usd(at64.deferralLimit)).toBe("32.500");
    expect(usd(at63.deferralLimit - at64.deferralLimit)).toBe("3.250");
    const a = C.faq.items[1].a;
    for (const figure of ["35.750", "32.500", "3.250"]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("keeps the prose's 415(c) and 401(a)(17) figures tied to the table", () => {
    const p = RETIREMENT_LIMITS[2026];
    // formula.body[3] quotes the compensation ceiling and the match it caps.
    expect(C.formula.body[3]).toContain(usd(p.compensation));
    expect(C.formula.body[3]).toContain(usd(p.compensation * 0.06));
    expect(C.formula.body[3]).toContain(usd(500_000 * 0.06));
  });

  it("pins the sensitivity table the component renders", () => {
    const input = shippedInput();
    const percents = Array.from(
      new Set(
        [0, 2, 4, 6, 8, 10, 15, input.deferralPercent, input.employerMatchLimitPercent]
          .filter((percent) => percent >= 0 && percent <= 100)
          .map((percent) => Math.round(percent * 100) / 100),
      ),
    ).sort((a, b) => a - b);
    expect(percents).toEqual([0, 2, 3, 4, 6, 8, 10, 15]);

    const unclaimed = percents.map((percent) =>
      usd(run({ deferralPercent: percent }).unclaimedMatch),
    );
    expect(unclaimed).toEqual([
      "5.400",
      "3.600",
      "2.700",
      "1.800",
      "0",
      "0",
      "0",
      "0",
    ]);
    // The claim the table intro makes: the column reaches zero at the
    // threshold and never goes negative.
    for (const percent of percents) {
      expect(run({ deferralPercent: percent }).unclaimedMatch).toBeGreaterThanOrEqual(0);
    }
  });

  it("stops paying match above the threshold, as the table intro says", () => {
    const at = run({ deferralPercent: 6 });
    for (const percent of [8, 10, 15, 100]) {
      expect(run({ deferralPercent: percent }).employerMatch).toBe(
        at.employerMatch,
      );
    }
  });

  it("quotes the deduction the Roth catch-up rule removes", () => {
    const r = run({
      age: 55,
      annualSalary: 200_000,
      deferralPercent: 100,
      marginalRatePercent: 32,
    });
    expect(r.catchUpForcedRoth).toBe(true);
    expect(usd(r.deferral)).toBe("32.500");
    expect(usd(r.deductibleDeferral)).toBe("24.500");
    expect(usdCents(r.catchUpUsed * 0.32)).toBe("2.560,00");
    // The header records it; the prose states the rule without the figures,
    // which is deliberate — the threshold is a moving statutory number and
    // the page points at the module for it.
    expect(C.formula.body[5]).toContain("Roth");
  });

  it("refuses a year with no published limits rather than borrowing one", () => {
    expect(computeUs401k({ ...shippedInput(), year: 2019 })).toBe(null);
    expect(C.form.yearHelp).toContain("từ chối");
  });
});

describe("gop-401k — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const full = run({ deferralPercent: 6 });
    const rich = run({ annualSalary: 500_000, deferralPercent: 6 });
    const at63 = run({ age: 63, annualSalary: 200_000, deferralPercent: 100 });
    const at64 = run({ age: 64, annualSalary: 200_000, deferralPercent: 100 });
    const roth = run({
      age: 55,
      annualSalary: 200_000,
      deferralPercent: 100,
      marginalRatePercent: 32,
    });
    for (const figure of [
      usdCents(r.deferral),
      usdCents(r.employerMatch),
      usdCents(r.unclaimedMatch),
      usdCents(r.totalContribution),
      usdCents(r.incomeTaxSaved),
      usdCents(r.netCostOfDeferral),
      usd(r.projectedBalance),
      usd(r.matchValueAtHorizon),
      usd(r.unclaimedMatchAtHorizon),
      usdCents(full.totalContribution),
      usd(full.projectedBalance),
      usdCents(full.netCostOfDeferral - r.netCostOfDeferral),
      usdCents(full.totalContribution - r.totalContribution),
      usd(rich.planCompensation),
      usd(rich.employerMatch),
      usd(at63.deferralLimit),
      usd(at64.deferralLimit),
      usd(at63.deferralLimit - at64.deferralLimit),
      usd(roth.deferral),
      usd(roth.deductibleDeferral),
      usdCents(roth.catchUpUsed * 0.32),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
