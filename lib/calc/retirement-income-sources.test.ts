import { describe, expect, it } from "vitest";
import {
  INCOME_SOURCE_KEYS,
  projectIncomeSources,
  type RetirementIncomeSourcesInput,
} from "@/lib/calc/retirement-income-sources";

const BASE: RetirementIncomeSourcesInput = {
  startAge: 67,
  endAge: 95,
  annualNeed: 80_000,
  inflationPercent: 2.5,
  portfolioBalance: 600_000,
  portfolioReturnPercent: 5,
  sources: {
    // Indexed at inflation, as the page wires it.
    social: { annualAmount: 30_000, indexationPercent: 2.5, throughAge: 120 },
    // Level nominal, which is the case the module exists for.
    pension: { annualAmount: 18_000, indexationPercent: 0, throughAge: 120 },
    work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 72 },
    other: { annualAmount: 6_000, indexationPercent: 2.5, throughAge: 120 },
  },
};

const run = (over: Partial<RetirementIncomeSourcesInput> = {}) => {
  const result = projectIncomeSources({ ...BASE, ...over });
  if (!result) throw new Error("projectIncomeSources returned null");
  return result;
};

describe("projectIncomeSources — the span", () => {
  it("runs from the start age to the year before the end age", () => {
    const r = run();
    expect(r.years).toHaveLength(28);
    expect(r.first.age).toBe(67);
    expect(r.last.age).toBe(94);
  });

  it("indexes the need at inflation, so the real need is level", () => {
    const r = run();
    for (const year of r.years) {
      expect(year.realNeed).toBeCloseTo(80_000, 6);
    }
    expect(r.last.need).toBeCloseTo(80_000 * Math.pow(1.025, 27), 4);
  });
});

describe("projectIncomeSources — each source on its own rate", () => {
  it("holds an indexed source level in real terms", () => {
    const r = run();
    for (const year of r.years) {
      expect(year.realBySource.social).toBeCloseTo(30_000, 6);
      // The real column IS the nominal one deflated by the flow deflator —
      // asserted so the page never has to do this division itself.
      expect(year.realBySource.social).toBeCloseTo(
        year.bySource.social / Math.pow(1.025, year.age - 67),
        6,
      );
    }
    expect(r.realValueKeptPercent.social).toBeCloseTo(100, 6);
  });

  it("adds the real sources up to the real fixed income", () => {
    const r = run();
    for (const year of r.years) {
      const sum = INCOME_SOURCE_KEYS.reduce(
        (total, key) => total + year.realBySource[key],
        0,
      );
      expect(year.realFixedIncome).toBeCloseTo(sum, 6);
    }
  });

  it("leaves a level pension paying the same number for 28 years", () => {
    const r = run();
    for (const year of r.years) {
      expect(year.bySource.pension).toBe(18_000);
    }
    // And that number buys 51,7% of what it bought at 67 — the fact a single
    // shared indexation rate hides completely.
    expect(r.realValueKeptPercent.pension!).toBeCloseTo(
      (1 / Math.pow(1.025, 27)) * 100,
      6,
    );
    expect(r.realValueKeptPercent.pension!).toBeGreaterThan(51);
    expect(r.realValueKeptPercent.pension!).toBeLessThan(52);
  });

  it("stops a source after its final age, inclusive", () => {
    const r = run();
    const at72 = r.years.find((y) => y.age === 72)!;
    const at73 = r.years.find((y) => y.age === 73)!;
    expect(at72.bySource.work).toBeGreaterThan(0);
    expect(at73.bySource.work).toBe(0);
    expect(at73.realBySource.work).toBe(0);
    // "Stopped" is reported as null, not as 0% of its value kept: a source
    // that ended and a source that lost all its value are different facts.
    expect(r.realValueKeptPercent.work).toBe(null);
  });

  it("pays nothing at all from a source that ends before it starts", () => {
    // Someone who retires at 67 and says they will work until 60 has told us
    // they will not work, which is an answer rather than an input error.
    const r = run({
      sources: {
        ...BASE.sources,
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 60 },
      },
    });
    for (const year of r.years) expect(year.bySource.work).toBe(0);
    expect(r.realTotalBySource.work).toBe(0);
    expect(r.realValueKeptPercent.work).toBe(null);
  });

  it("adds the sources up to the fixed income, every year", () => {
    const r = run();
    for (const year of r.years) {
      const sum = INCOME_SOURCE_KEYS.reduce(
        (total, key) => total + year.bySource[key],
        0,
      );
      expect(year.fixedIncome).toBeCloseTo(sum, 6);
    }
  });
});

describe("projectIncomeSources — the portfolio fills the gap", () => {
  it("draws exactly the gap while there is money to draw", () => {
    const r = run();
    for (const year of r.years) {
      if (year.balance > 0) {
        expect(year.withdrawal).toBeCloseTo(year.gap, 6);
        expect(year.unmet).toBeCloseTo(0, 6);
      }
      expect(year.withdrawal).toBeLessThanOrEqual(year.gap + 1e-9);
      expect(year.fixedIncome + year.withdrawal + year.unmet).toBeCloseTo(
        Math.max(year.need, year.fixedIncome),
        6,
      );
    }
  });

  it("never draws more than the balance", () => {
    const r = run({ portfolioBalance: 50_000 });
    for (const year of r.years) {
      expect(year.withdrawal).toBeGreaterThanOrEqual(0);
      expect(year.balance).toBeGreaterThanOrEqual(0);
    }
    expect(r.depletionAge).not.toBe(null);
    expect(r.firstUnmetAge).not.toBe(null);
  });

  it("reports no gap at all when the sources cover the need", () => {
    const r = run({ annualNeed: 40_000 });
    for (const year of r.years) {
      expect(year.gap).toBe(0);
      expect(year.withdrawal).toBe(0);
      expect(year.unmet).toBe(0);
      expect(year.fixedCoveragePercent!).toBeGreaterThan(100);
    }
    expect(r.depletionAge).toBe(null);
    // The portfolio simply compounds, untouched.
    expect(r.finalBalance).toBeCloseTo(600_000 * Math.pow(1.05, 28), 2);
  });

  it("credits the return on what is LEFT after the year's draw", () => {
    const r = run();
    const first = r.first;
    expect(first.balance).toBeCloseTo(
      (600_000 - first.withdrawal) * 1.05,
      6,
    );
    // Crediting the return first would leave more, which is the error this
    // ordering exists to avoid.
    expect(first.balance).toBeLessThan(600_000 * 1.05 - first.withdrawal);
  });

  it("floors the balance at zero rather than letting it go negative", () => {
    const r = run({ portfolioReturnPercent: -100, portfolioBalance: 10_000 });
    for (const year of r.years) {
      expect(year.balance).toBeGreaterThanOrEqual(0);
    }
  });

  it("reports the first withdrawal as a rate on the opening balance", () => {
    const r = run();
    expect(r.initialWithdrawalRatePercent!).toBeCloseTo(
      (r.first.withdrawal / 600_000) * 100,
      10,
    );
    // No balance means no rate, not a zero rate.
    expect(run({ portfolioBalance: 0 }).initialWithdrawalRatePercent).toBe(null);
  });
});

describe("projectIncomeSources — the squeeze it exists to show", () => {
  it("shows the fixed sources covering far less at the end than at the start", () => {
    const r = run();
    // Two effects compound: the level pension decays in real terms, and the
    // work income stops entirely. Both are invisible in a first-year figure.
    expect(r.first.fixedCoveragePercent!).toBeGreaterThan(
      r.last.fixedCoveragePercent!,
    );
    expect(r.first.fixedCoveragePercent!).toBeCloseTo((66_000 / 80_000) * 100, 6);
    expect(r.last.fixedCoveragePercent!).toBeLessThan(60);
  });

  it("makes the portfolio draw GROW in real terms as the sources decay", () => {
    // The consequence a page must show: the portfolio is asked for more real
    // money every year, which is the opposite of what a level-draw plan
    // assumes.
    const r = run();
    const early = r.years.find((y) => y.age === 73)!;
    const late = r.years.find((y) => y.age === 90)!;
    expect(late.realWithdrawal).toBeGreaterThan(early.realWithdrawal);
  });

  it("adds the real totals up to the real need, when nothing is unmet", () => {
    // The ledger identity: every real dollar of need came from a source or
    // from the portfolio. An internal inconsistency here needs no reference
    // value to prove — see docs §8 defect 9.
    const r = run();
    expect(r.realTotalUnmet).toBeCloseTo(0, 6);
    expect(r.realTotalFixedIncome + r.realTotalWithdrawn).toBeCloseTo(
      r.realTotalNeed,
      4,
    );
    const sumBySource = INCOME_SOURCE_KEYS.reduce(
      (total, key) => total + r.realTotalBySource[key],
      0,
    );
    expect(sumBySource).toBeCloseTo(r.realTotalFixedIncome, 4);
  });

  it("keeps the ledger identity when the portfolio runs dry", () => {
    const r = run({ portfolioBalance: 100_000 });
    expect(r.realTotalUnmet).toBeGreaterThan(0);
    expect(
      r.realTotalFixedIncome + r.realTotalWithdrawn + r.realTotalUnmet,
    ).toBeCloseTo(r.realTotalNeed, 4);
  });

  it("names the age the shortfall starts, not just that there is one", () => {
    const r = run({ portfolioBalance: 200_000 });
    expect(r.firstUnmetAge).not.toBe(null);
    const before = r.years.filter((y) => y.age < r.firstUnmetAge!);
    for (const year of before) expect(year.unmet).toBeCloseTo(0, 6);
    const at = r.years.find((y) => y.age === r.firstUnmetAge)!;
    expect(at.unmet).toBeGreaterThan(0);
  });
});

describe("projectIncomeSources — indexation as a lever", () => {
  it("removes the entire squeeze when every source is indexed", () => {
    const r = run({
      sources: {
        social: { annualAmount: 30_000, indexationPercent: 2.5, throughAge: 120 },
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 120 },
        other: { annualAmount: 6_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    for (const year of r.years) {
      expect(year.realFixedIncome).toBeCloseTo(66_000, 6);
      expect(year.fixedCoveragePercent!).toBeCloseTo((66_000 / 80_000) * 100, 6);
    }
    for (const key of INCOME_SOURCE_KEYS) {
      expect(r.realValueKeptPercent[key]!).toBeCloseTo(100, 6);
    }
  });

  it("prices a partial indexation clause between the two extremes", () => {
    // A 1%/năm clause on the pension, which some plans do carry.
    const level = run();
    const partial = run({
      sources: {
        ...BASE.sources,
        pension: { annualAmount: 18_000, indexationPercent: 1, throughAge: 120 },
      },
    });
    const full = run({
      sources: {
        ...BASE.sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    expect(partial.realTotalBySource.pension).toBeGreaterThan(
      level.realTotalBySource.pension,
    );
    expect(partial.realTotalBySource.pension).toBeLessThan(
      full.realTotalBySource.pension,
    );
    expect(full.realTotalBySource.pension).toBeCloseTo(18_000 * 28, 4);
  });

  it("leaves real and nominal identical at zero inflation", () => {
    const r = run({
      inflationPercent: 0,
      sources: {
        ...BASE.sources,
        social: { annualAmount: 30_000, indexationPercent: 0, throughAge: 120 },
        other: { annualAmount: 6_000, indexationPercent: 0, throughAge: 120 },
        work: { annualAmount: 12_000, indexationPercent: 0, throughAge: 72 },
      },
    });
    for (const year of r.years) {
      expect(year.realNeed).toBeCloseTo(year.need, 6);
      expect(year.realFixedIncome).toBeCloseTo(year.fixedIncome, 6);
      expect(year.realWithdrawal).toBeCloseTo(year.withdrawal, 6);
    }
    for (const key of INCOME_SOURCE_KEYS) {
      const kept = r.realValueKeptPercent[key];
      if (kept !== null) expect(kept).toBeCloseTo(100, 6);
    }
  });
});

describe("projectIncomeSources — rejections", () => {
  it("rejects ages out of order or out of range", () => {
    expect(projectIncomeSources({ ...BASE, endAge: 67 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, endAge: 60 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, startAge: -1 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, endAge: 130 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, startAge: 67.5 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, startAge: 0, endAge: 101 })).toBe(
      null,
    );
  });

  it("rejects negative money and out-of-range rates", () => {
    expect(projectIncomeSources({ ...BASE, annualNeed: -1 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, portfolioBalance: -1 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, inflationPercent: 101 })).toBe(null);
    expect(projectIncomeSources({ ...BASE, portfolioReturnPercent: -101 })).toBe(
      null,
    );
  });

  it("rejects a bad source rather than dropping it", () => {
    for (const bad of [
      { annualAmount: -1, indexationPercent: 0, throughAge: 120 },
      { annualAmount: 1, indexationPercent: 200, throughAge: 120 },
      { annualAmount: 1, indexationPercent: 0, throughAge: 72.5 },
      { annualAmount: 1, indexationPercent: 0, throughAge: 130 },
      { annualAmount: Number.NaN, indexationPercent: 0, throughAge: 120 },
    ]) {
      expect(
        projectIncomeSources({
          ...BASE,
          sources: { ...BASE.sources, pension: bad },
        }),
      ).toBe(null);
    }
  });

  it("handles a need of zero without dividing by it", () => {
    const r = run({ annualNeed: 0 });
    for (const year of r.years) {
      expect(year.fixedCoveragePercent).toBe(null);
      expect(year.totalCoveragePercent).toBe(null);
      expect(year.gap).toBe(0);
    }
  });

  it("runs a one-year projection", () => {
    const r = run({ endAge: 68 });
    expect(r.years).toHaveLength(1);
    expect(r.first).toBe(r.last);
    // Every "kept its value" figure is 100% over a single year.
    expect(r.realValueKeptPercent.pension!).toBeCloseTo(100, 6);
  });
});
