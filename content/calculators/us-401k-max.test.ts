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
import { computeUs401kMax, type Us401kMaxInput } from "@/lib/calc/us-401k-max";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): Us401kMaxInput {
  return {
    year: Number(D.year),
    age: parseCount(D.age)!,
    annualSalary: parseMoney(D.salary)!,
    payPeriodsPerYear: Number(D.periods),
    periodsElapsed: parseCount(D.elapsed)!,
    contributedSoFar: parseMoney(D.contributed)!,
    employerMatchPercent: parseDecimal(D.matchPercent)!,
    employerMatchLimitPercent: parseDecimal(D.matchLimit)!,
    frontLoadPercent: parseDecimal(D.frontLoad)!,
  };
}

function run(over: Partial<Us401kMaxInput> = {}) {
  const result = computeUs401kMax({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUs401kMax returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-401k-max.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("toi-da-401k at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      year: 2026,
      age: 40,
      annualSalary: 130_000,
      payPeriodsPerYear: 26,
      periodsElapsed: 0,
      contributedSoFar: 0,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 6,
      frontLoadPercent: 50,
    });
  });

  it("offers a payroll-frequency option for every value the module accepts", () => {
    // The select's values are the only pay-period counts a reader can pick,
    // so each has to produce a usable result rather than a null page.
    for (const periods of [12, 24, 26, 52]) {
      expect(run({ payPeriodsPerYear: periods }).periodsRemaining).toBe(periods);
    }
    expect(Object.keys(C.form.periodOptions)).toHaveLength(4);
  });

  it("quotes the per-paycheck answer and its percent", () => {
    const r = run();
    expect(usd(r.limit)).toBe("24.500");
    expect(usdCents(r.payPerPeriod)).toBe("5.000,00");
    expect(usdCents(r.perPeriodAmount!)).toBe("942,31");
    expect(formatPercent(r.perPeriodPercent!, 2)).toBe("18,85%");
    expect(C.frontLoadNotice).toContain("942,31");
    expect(C.frontLoadNotice).toContain("18,85%");
  });

  it("quotes the match threshold, per period and per year", () => {
    const r = run();
    expect(usdCents(r.matchThresholdPerPeriod)).toBe("300,00");
    expect(usdCents(r.matchThresholdAnnual)).toBe("7.800,00");
    expect(C.frontLoadNotice).toContain("7.800");
  });

  it("loses nothing on the level schedule, under either kind of plan", () => {
    const r = run();
    expect(usdCents(r.planned.matchPerPeriodPlan)).toBe("7.800,00");
    expect(usdCents(r.planned.matchTrueUpPlan)).toBe("7.800,00");
    expect(r.planned.matchLostWithoutTrueUp).toBeCloseTo(0, 6);
    expect(r.planned.emptyPeriods).toBe(0);
    expect(r.planned.underThresholdPeriods).toBe(0);
    // So the page shows the reassuring notice, which still names the price
    // of front-loading rather than declaring the question closed.
    expect(C.form.evenNotice).toContain("4.800");
  });

  it("quotes the front-loading loss, and where it comes from", () => {
    const r = run();
    expect(r.frontLoaded.emptyPeriods).toBe(16);
    expect(usdCents(r.frontLoaded.matchPerPeriodPlan)).toBe("3.000,00");
    expect(usdCents(r.frontLoaded.matchTrueUpPlan)).toBe("7.800,00");
    expect(usdCents(r.frontLoadCost)).toBe("4.800,00");
    // Same money in, so the loss is purely about the spread.
    expect(r.frontLoaded.totalDeferral).toBeCloseTo(r.planned.totalDeferral, 6);
    // And it is exactly the match on the empty paychecks.
    expect(r.frontLoadCost).toBeCloseTo(
      r.frontLoaded.emptyPeriods * r.matchThresholdPerPeriod,
      6,
    );
    for (const figure of ["7.800", "3.000", "4.800", "16", "10"]) {
      expect(C.frontLoadNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the harder front-load in the FAQ range", () => {
    const hard = run({ frontLoadPercent: 100 });
    expect(hard.frontLoaded.emptyPeriods).toBe(21);
    expect(usdCents(hard.frontLoadCost)).toBe("6.300,00");
  });

  it("quotes the mid-year catch-up figures", () => {
    const mid = run({ periodsElapsed: 13, contributedSoFar: 10_000 });
    expect(usd(mid.remainingRoom)).toBe("14.500");
    expect(usdCents(mid.perPeriodAmount!)).toBe("1.115,38");
    expect(formatPercent(mid.perPeriodPercent!, 2)).toBe("22,31%");
  });

  it("quotes the lumpy case, where nothing is empty and match is still lost", () => {
    // The reader's OWN version of the trap: front-loaded by accident in the
    // first half of the year, then below the threshold for the rest.
    const lumpy = run({ periodsElapsed: 13, contributedSoFar: 23_000 });
    expect(usdCents(lumpy.perPeriodAmount!)).toBe("115,38");
    expect(formatPercent(lumpy.perPeriodPercent!, 2)).toBe("2,31%");
    expect(lumpy.planned.emptyPeriods).toBe(0);
    expect(lumpy.planned.underThresholdPeriods).toBe(13);
    expect(usdCents(lumpy.planned.matchLostWithoutTrueUp)).toBe("2.400,00");
  });

  it("says the limit is out of reach with one paycheck left", () => {
    const late = run({ periodsElapsed: 25 });
    expect(late.exceedsPay).toBe(true);
    expect(formatPercent(late.perPeriodPercent!, 2)).toBe("490,00%");
    expect(usd(late.maxStillPossible)).toBe("5.000");
    expect(usd(late.remainingRoom)).toBe("24.500");
    expect(C.form.unreachableNotice).toContain("nhiều nhất còn đưa được");
  });

  it("quotes the age-61 limit and paycheck", () => {
    const older = run({ age: 61 });
    expect(usd(older.limit)).toBe("35.750");
    expect(usdCents(older.perPeriodAmount!)).toBe("1.375,00");
    expect(formatPercent(older.perPeriodPercent!, 2)).toBe("27,50%");
    expect(older.limit).toBe(
      RETIREMENT_LIMITS[2026].electiveDeferral +
        RETIREMENT_LIMITS[2026].catchUp60to63,
    );
  });

  it("gives the table one match figure per period, from the module", () => {
    // The page renders `matches` rather than recomputing the per-period cap,
    // so the column and the total below it cannot disagree.
    const r = run();
    expect(r.planned.matches).toHaveLength(26);
    expect(r.frontLoaded.matches).toHaveLength(26);
    expect(r.planned.matches.reduce((a, b) => a + b, 0)).toBeCloseTo(
      r.planned.matchPerPeriodPlan,
      6,
    );
    expect(r.frontLoaded.matches.reduce((a, b) => a + b, 0)).toBeCloseTo(
      r.frontLoaded.matchPerPeriodPlan,
      6,
    );
    // The claim the table intro makes: the front-loaded column hits zero and
    // stays there.
    expect(r.frontLoaded.matches.at(-1)).toBe(0);
    expect(r.frontLoaded.matches[0]).toBeGreaterThan(0);
  });

  it("keeps the table under the row ceiling at weekly payroll", () => {
    const weekly = run({ payPeriodsPerYear: 52 });
    const step = Math.ceil(weekly.planned.deferrals.length / 26);
    expect(step).toBe(2);
    const shown = weekly.planned.deferrals.filter((_, i) => i % step === 0);
    expect(shown).toHaveLength(26);
  });
});

describe("toi-da-401k — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const hard = run({ frontLoadPercent: 100 });
    const mid = run({ periodsElapsed: 13, contributedSoFar: 10_000 });
    const lumpy = run({ periodsElapsed: 13, contributedSoFar: 23_000 });
    const late = run({ periodsElapsed: 25 });
    const older = run({ age: 61 });
    for (const figure of [
      usd(r.limit),
      usdCents(r.payPerPeriod),
      usdCents(r.perPeriodAmount!),
      formatPercent(r.perPeriodPercent!, 2),
      usdCents(r.matchThresholdPerPeriod),
      usdCents(r.matchThresholdAnnual),
      usdCents(r.planned.matchPerPeriodPlan),
      usdCents(r.frontLoaded.matchPerPeriodPlan),
      usdCents(r.frontLoaded.matchTrueUpPlan),
      usdCents(r.frontLoadCost),
      usdCents(hard.frontLoadCost),
      usd(mid.remainingRoom),
      usdCents(mid.perPeriodAmount!),
      formatPercent(mid.perPeriodPercent!, 2),
      usdCents(lumpy.perPeriodAmount!),
      formatPercent(lumpy.perPeriodPercent!, 2),
      usdCents(lumpy.planned.matchLostWithoutTrueUp),
      formatPercent(late.perPeriodPercent!, 2),
      usd(late.maxStillPossible),
      usd(older.limit),
      usdCents(older.perPeriodAmount!),
      formatPercent(older.perPeriodPercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
