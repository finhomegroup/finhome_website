import { describe, expect, it } from "vitest";
import {
  ALLOCATION_RULES,
  analyseAllocation,
  ASSET_CLASSES,
  CASH_SIGMA_PERCENT,
  mixStatistics,
  REBALANCE_BAND_POINTS,
  targetAllocation,
  type AssetAllocationInput,
} from "@/lib/calc/asset-allocation";

const BASE: AssetAllocationInput = {
  age: 45,
  riskTolerance: "moderate",
  holdings: { equity: 500_000, bond: 150_000, cash: 50_000 },
  returns: { equity: 10, bond: 5, cash: 3 },
  equitySigmaPercent: 16,
  bondSigmaPercent: 6,
  equityBondCorrelation: 0.1,
};

const run = (over: Partial<AssetAllocationInput> = {}) => {
  const result = analyseAllocation({ ...BASE, ...over });
  if (!result) throw new Error("analyseAllocation returned null");
  return result;
};

describe("targetAllocation", () => {
  it("applies each risk tolerance's own base", () => {
    expect(targetAllocation(45, "conservative")).toEqual({
      equity: 55,
      bond: 35,
      cash: 10,
    });
    expect(targetAllocation(45, "moderate")).toEqual({
      equity: 65,
      bond: 30,
      cash: 5,
    });
    expect(targetAllocation(45, "aggressive")).toEqual({
      equity: 75,
      bond: 25,
      cash: 0,
    });
  });

  it("always sums to exactly 100", () => {
    // Including at both ends, where the raw rule overflows or goes negative.
    for (const tolerance of ["conservative", "moderate", "aggressive"] as const) {
      for (let age = 0; age <= 120; age += 1) {
        const target = targetAllocation(age, tolerance)!;
        const total = ASSET_CLASSES.reduce((sum, key) => sum + target[key], 0);
        expect(total, `${tolerance} at ${age}`).toBeCloseTo(100, 10);
        for (const key of ASSET_CLASSES) {
          expect(target[key], `${tolerance} at ${age} ${key}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("leaves room for the cash sleeve at a young age", () => {
    // "120 minus 20" is 100, which would leave nothing for the sleeve.
    const young = targetAllocation(20, "aggressive")!;
    expect(young.equity).toBe(100);
    expect(young.cash).toBe(0);
    // Moderate at 20 is not clamped at all: 110 - 20 is 90, which leaves
    // room for both the sleeve and a little in bonds.
    const youngModerate = targetAllocation(20, "moderate")!;
    expect(youngModerate.equity).toBe(90);
    expect(youngModerate.bond).toBe(5);
    expect(youngModerate.cash).toBe(5);
    // The clamp bites for moderate only below age 15.
    expect(targetAllocation(10, "moderate")!.equity).toBe(95);
    expect(targetAllocation(10, "moderate")!.bond).toBe(0);
  });

  it("floors equity at zero for a very old holder", () => {
    const old = targetAllocation(115, "conservative")!;
    expect(old.equity).toBe(0);
    expect(old.bond).toBe(90);
    expect(old.cash).toBe(10);
  });

  it("lowers the equity share with every year of age", () => {
    for (const tolerance of ["conservative", "moderate", "aggressive"] as const) {
      const base = ALLOCATION_RULES[tolerance].equityBase;
      // Inside the range where the rule is not clamped.
      for (let age = base - 90; age < base; age += 1) {
        if (age < 0) continue;
        const here = targetAllocation(age, tolerance)!;
        const older = targetAllocation(age + 1, tolerance)!;
        expect(older.equity, `${tolerance} at ${age}`).toBeLessThanOrEqual(
          here.equity,
        );
      }
    }
  });

  it("rejects an impossible age", () => {
    expect(targetAllocation(-1, "moderate")).toBe(null);
    expect(targetAllocation(121, "moderate")).toBe(null);
    expect(targetAllocation(Number.NaN, "moderate")).toBe(null);
  });
});

describe("mixStatistics — risk is not an average", () => {
  const stats = (
    weights: { equity: number; bond: number; cash: number },
    correlation = 0.1,
  ) =>
    mixStatistics({
      weights,
      returns: BASE.returns,
      equitySigmaPercent: 16,
      bondSigmaPercent: 6,
      equityBondCorrelation: correlation,
    })!;

  it("averages the RETURNS, because those do add", () => {
    const r = stats({ equity: 60, bond: 35, cash: 5 });
    expect(r.expectedReturnPercent).toBeCloseTo(
      0.6 * 10 + 0.35 * 5 + 0.05 * 3,
      10,
    );
  });

  it("puts the standard deviation BELOW the weighted average", () => {
    const r = stats({ equity: 60, bond: 35, cash: 5 });
    expect(r.standardDeviationPercent).toBeLessThan(
      r.weightedAverageSigmaPercent,
    );
    expect(r.diversificationBenefitPoints).toBeGreaterThan(0);
  });

  it("makes the two EQUAL at a correlation of exactly one", () => {
    // The identity that proves the covariance sum is right: with every
    // correlation at 1 the risks do simply add, so the two figures must
    // coincide. Cash is the exception — its correlation is taken as zero —
    // so this holds exactly only for a mix with no cash.
    const r = stats({ equity: 60, bond: 40, cash: 0 }, 1);
    expect(r.standardDeviationPercent).toBeCloseTo(
      r.weightedAverageSigmaPercent,
      10,
    );
    expect(r.diversificationBenefitPoints).toBeCloseTo(0, 10);
  });

  it("grows the benefit as the correlation falls", () => {
    let previous = -1;
    for (const correlation of [1, 0.5, 0.1, 0, -0.5, -1]) {
      const r = stats({ equity: 60, bond: 40, cash: 0 }, correlation);
      expect(r.diversificationBenefitPoints, `rho ${correlation}`).toBeGreaterThan(
        previous,
      );
      previous = r.diversificationBenefitPoints;
    }
  });

  it("can reach zero risk at a correlation of −1", () => {
    // The textbook case: two perfectly anti-correlated assets weighted in
    // inverse proportion to their standard deviations cancel exactly.
    // 6 / (16 + 6) = 27,27% equity against 72,73% bonds.
    const equity = (6 / 22) * 100;
    const r = stats({ equity, bond: 100 - equity, cash: 0 }, -1);
    expect(r.standardDeviationPercent).toBeCloseTo(0, 8);
    // And with no risk there is no return-per-risk figure to report.
    expect(r.returnPerRiskUnit).toBe(null);
  });

  it("gives an all-cash mix the cash standard deviation", () => {
    const r = stats({ equity: 0, bond: 0, cash: 100 });
    expect(r.standardDeviationPercent).toBeCloseTo(CASH_SIGMA_PERCENT, 10);
    expect(r.expectedReturnPercent).toBeCloseTo(3, 10);
  });

  it("gives a single-asset mix that asset's own standard deviation", () => {
    // A mix of one cannot diversify, so the two figures coincide whatever
    // the correlation input says.
    for (const correlation of [-1, 0, 1]) {
      const r = stats({ equity: 100, bond: 0, cash: 0 }, correlation);
      expect(r.standardDeviationPercent).toBeCloseTo(16, 10);
      expect(r.diversificationBenefitPoints).toBeCloseTo(0, 10);
    }
  });

  it("reports return per unit of risk", () => {
    const r = stats({ equity: 60, bond: 35, cash: 5 });
    expect(r.returnPerRiskUnit).toBeCloseTo(
      r.expectedReturnPercent / r.standardDeviationPercent,
      10,
    );
  });

  it("rejects a correlation outside minus one to one", () => {
    for (const correlation of [-1.01, 1.01, Number.NaN]) {
      expect(
        mixStatistics({
          weights: { equity: 60, bond: 40, cash: 0 },
          returns: BASE.returns,
          equitySigmaPercent: 16,
          bondSigmaPercent: 6,
          equityBondCorrelation: correlation,
        }),
      ).toBe(null);
    }
  });

  it("rejects a negative standard deviation or weight", () => {
    expect(
      mixStatistics({
        weights: { equity: 60, bond: 40, cash: 0 },
        returns: BASE.returns,
        equitySigmaPercent: -1,
        bondSigmaPercent: 6,
        equityBondCorrelation: 0,
      }),
    ).toBe(null);
    expect(
      mixStatistics({
        weights: { equity: -10, bond: 110, cash: 0 },
        returns: BASE.returns,
        equitySigmaPercent: 16,
        bondSigmaPercent: 6,
        equityBondCorrelation: 0,
      }),
    ).toBe(null);
  });
});

describe("analyseAllocation — drift and trades", () => {
  it("reports the current weights and the drift in POINTS", () => {
    const r = run();
    expect(r.totalValue).toBe(700_000);
    expect(r.currentWeights!.equity).toBeCloseTo((500_000 / 700_000) * 100, 10);
    expect(r.target.equity).toBe(65);
    expect(r.driftPoints!.equity).toBeCloseTo(
      r.currentWeights!.equity - 65,
      10,
    );
  });

  it("keeps the drift summing to zero, because the weights both sum to 100", () => {
    for (const holdings of [
      { equity: 500_000, bond: 150_000, cash: 50_000 },
      { equity: 100_000, bond: 700_000, cash: 200_000 },
      { equity: 1, bond: 0, cash: 0 },
    ]) {
      const r = run({ holdings });
      const total = ASSET_CLASSES.reduce(
        (sum, key) => sum + r.driftPoints![key],
        0,
      );
      expect(total).toBeCloseTo(0, 8);
    }
  });

  it("makes the trades net to zero: rebalancing adds no money", () => {
    for (const age of [25, 45, 70]) {
      const r = run({ age });
      const net = ASSET_CLASSES.reduce((sum, key) => sum + r.trades![key], 0);
      expect(net, `age ${age}`).toBeCloseTo(0, 6);
      // And after trading, every class is exactly on target.
      for (const key of ASSET_CLASSES) {
        const after = BASE.holdings[key] + r.trades![key];
        expect((after / r.totalValue) * 100, `age ${age} ${key}`).toBeCloseTo(
          r.target[key],
          8,
        );
      }
    }
  });

  it("flags a rebalance only beyond the band", () => {
    // On target: no drift, nothing due.
    const onTarget = run({
      holdings: { equity: 650_000, bond: 300_000, cash: 50_000 },
    });
    expect(onTarget.maxDriftPoints).toBeCloseTo(0, 8);
    expect(onTarget.rebalanceDue).toBe(false);

    // Exactly at the band is not beyond it.
    const atBand = run({
      holdings: { equity: 700_000, bond: 250_000, cash: 50_000 },
    });
    expect(atBand.maxDriftPoints).toBeCloseTo(REBALANCE_BAND_POINTS, 8);
    expect(atBand.rebalanceDue).toBe(false);

    const beyond = run({
      holdings: { equity: 800_000, bond: 150_000, cash: 50_000 },
    });
    expect(beyond.maxDriftPoints!).toBeGreaterThan(REBALANCE_BAND_POINTS);
    expect(beyond.rebalanceDue).toBe(true);
  });

  it("compares the risk of what is held with the risk of the target", () => {
    // An overweight-equity portfolio must show more risk than its target.
    const r = run({
      holdings: { equity: 900_000, bond: 50_000, cash: 50_000 },
    });
    expect(r.currentStats!.standardDeviationPercent).toBeGreaterThan(
      r.targetStats.standardDeviationPercent,
    );
    expect(r.currentStats!.expectedReturnPercent).toBeGreaterThan(
      r.targetStats.expectedReturnPercent,
    );
  });

  it("still gives a target for an EMPTY portfolio, and no weights", () => {
    // "Nothing here" is not "0% equity, sell nothing".
    const r = run({ holdings: { equity: 0, bond: 0, cash: 0 } });
    expect(r.totalValue).toBe(0);
    expect(r.target.equity).toBe(65);
    expect(r.targetStats.expectedReturnPercent).toBeGreaterThan(0);
    expect(r.currentWeights).toBe(null);
    expect(r.driftPoints).toBe(null);
    expect(r.trades).toBe(null);
    expect(r.maxDriftPoints).toBe(null);
    expect(r.currentStats).toBe(null);
    expect(r.rebalanceDue).toBe(false);
  });

  it("rejects what it cannot analyse", () => {
    expect(analyseAllocation({ ...BASE, age: 121 })).toBe(null);
    expect(
      analyseAllocation({
        ...BASE,
        holdings: { equity: -1, bond: 0, cash: 0 },
      }),
    ).toBe(null);
    expect(analyseAllocation({ ...BASE, equitySigmaPercent: -1 })).toBe(null);
    expect(analyseAllocation({ ...BASE, equityBondCorrelation: 2 })).toBe(null);
  });

  it("exposes the rule it used, so a page can quote it", () => {
    expect(run().rule).toBe(ALLOCATION_RULES.moderate);
    expect(run({ riskTolerance: "aggressive" }).rule.equityBase).toBe(120);
  });
});
