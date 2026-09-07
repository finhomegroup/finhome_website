import { describe, it, expect } from "vitest";
import {
  computeExpectedReturn,
  type ReturnScenario,
} from "@/lib/calc/expected-return";

// Three scenarios: boom 25%, base 10%, bust −15%.
const BASE: ReturnScenario[] = [
  { probabilityPercent: 25, returnPercent: 25 },
  { probabilityPercent: 50, returnPercent: 10 },
  { probabilityPercent: 25, returnPercent: -15 },
];

function scenarios(list: readonly ReturnScenario[]) {
  const result = computeExpectedReturn(list);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeExpectedReturn — the mean", () => {
  it("is the probability-weighted average", () => {
    // 0,25 × 25 + 0,5 × 10 + 0,25 × (−15) = 6,25 + 5 − 3,75 = 7,5%.
    expect(scenarios(BASE).expectedReturnPercent).toBeCloseTo(7.5, 10);
  });

  it("is the return itself when one outcome is certain", () => {
    const result = scenarios([
      { probabilityPercent: 100, returnPercent: 12 },
    ]);
    expect(result.expectedReturnPercent).toBeCloseTo(12, 10);
    expect(result.standardDeviationPercent).toBeCloseTo(0, 10);
    expect(result.downsideRiskPercent).toBeCloseTo(0, 10);
  });

  it("ignores a zero-probability scenario", () => {
    const withZero = scenarios([
      ...BASE,
      { probabilityPercent: 0, returnPercent: 500 },
    ]);
    expect(withZero.expectedReturnPercent).toBeCloseTo(7.5, 10);
    // …but it still counts as the best case, because it is in the set.
    expect(withZero.bestCasePercent).toBe(500);
  });
});

describe("computeExpectedReturn — the spread", () => {
  it("computes variance as the weighted squared deviation", () => {
    // Deviations from 7,5: +17,5, +2,5, −22,5.
    // 0,25 × 306,25 + 0,5 × 6,25 + 0,25 × 506,25 = 76,5625 + 3,125 + 126,5625
    const result = scenarios(BASE);
    expect(result.variance).toBeCloseTo(206.25, 8);
    expect(result.standardDeviationPercent).toBeCloseTo(
      Math.sqrt(206.25),
      10,
    );
    expect(result.standardDeviationPercent).toBeCloseTo(14.3614, 3);
  });

  it("uses population statistics, with no n − 1 correction", () => {
    // These are probabilities over a known distribution, so the sample
    // correction does not apply. A 50/50 of +10 and −10 has a deviation of
    // exactly 10, not 10 × sqrt(2).
    const result = scenarios([
      { probabilityPercent: 50, returnPercent: 10 },
      { probabilityPercent: 50, returnPercent: -10 },
    ]);
    expect(result.expectedReturnPercent).toBeCloseTo(0, 10);
    expect(result.standardDeviationPercent).toBeCloseTo(10, 10);
  });

  it("computes risk per unit of return", () => {
    const result = scenarios(BASE);
    expect(result.coefficientOfVariation).toBeCloseTo(
      result.standardDeviationPercent / 7.5,
      10,
    );
  });

  it("uses the coefficient to rank two investments plain deviation cannot", () => {
    // Higher return AND higher deviation — only the ratio decides.
    const modest = scenarios([
      { probabilityPercent: 50, returnPercent: 16 },
      { probabilityPercent: 50, returnPercent: 4 },
    ]);
    const wild = scenarios([
      { probabilityPercent: 50, returnPercent: 60 },
      { probabilityPercent: 50, returnPercent: -20 },
    ]);
    expect(wild.expectedReturnPercent).toBeGreaterThan(
      modest.expectedReturnPercent,
    );
    expect(wild.standardDeviationPercent).toBeGreaterThan(
      modest.standardDeviationPercent,
    );
    // Modest is better per unit of risk.
    expect(modest.coefficientOfVariation!).toBeLessThan(
      wild.coefficientOfVariation!,
    );
  });

  it("has no coefficient when the expected return is not positive", () => {
    const zero = scenarios([
      { probabilityPercent: 50, returnPercent: 10 },
      { probabilityPercent: 50, returnPercent: -10 },
    ]);
    expect(zero.coefficientOfVariation).toBeNull();
    const negative = scenarios([
      { probabilityPercent: 50, returnPercent: 0 },
      { probabilityPercent: 50, returnPercent: -20 },
    ]);
    expect(negative.coefficientOfVariation).toBeNull();
  });
});

describe("computeExpectedReturn — downside risk", () => {
  it("counts only the outcomes below the expectation", () => {
    // Only the −15 scenario is below 7,5 by more than… no: 10 is above 7,5,
    // so only −15 counts. 0,25 × 22,5² = 126,5625, root 11,25.
    const result = scenarios(BASE);
    expect(result.downsideRiskPercent).toBeCloseTo(11.25, 8);
    expect(result.downsideRiskPercent).toBeLessThan(
      result.standardDeviationPercent,
    );
  });

  it("is zero when nothing can come in below the mean", () => {
    const result = scenarios([
      { probabilityPercent: 100, returnPercent: 8 },
    ]);
    expect(result.downsideRiskPercent).toBeCloseTo(0, 10);
  });

  it("ignores an upside surprise that standard deviation punishes", () => {
    // The reason semi-deviation exists. Adding a big WIN raises the standard
    // deviation and must not raise the downside measure by as much.
    const plain = scenarios([
      { probabilityPercent: 50, returnPercent: 10 },
      { probabilityPercent: 50, returnPercent: 0 },
    ]);
    const withUpside = scenarios([
      { probabilityPercent: 45, returnPercent: 10 },
      { probabilityPercent: 45, returnPercent: 0 },
      { probabilityPercent: 10, returnPercent: 80 },
    ]);
    expect(withUpside.standardDeviationPercent).toBeGreaterThan(
      plain.standardDeviationPercent,
    );
    expect(
      withUpside.standardDeviationPercent - withUpside.downsideRiskPercent,
    ).toBeGreaterThan(
      plain.standardDeviationPercent - plain.downsideRiskPercent,
    );
  });
});

describe("computeExpectedReturn — the plain-language figures", () => {
  it("totals the probability of a loss", () => {
    expect(scenarios(BASE).probabilityOfLossPercent).toBeCloseTo(25, 10);
  });

  it("does not count a zero return as a loss", () => {
    const result = scenarios([
      { probabilityPercent: 50, returnPercent: 0 },
      { probabilityPercent: 50, returnPercent: 10 },
    ]);
    expect(result.probabilityOfLossPercent).toBe(0);
  });

  it("reports the best and worst outcomes in the set", () => {
    const result = scenarios(BASE);
    expect(result.bestCasePercent).toBe(25);
    expect(result.worstCasePercent).toBe(-15);
  });
});

describe("computeExpectedReturn — rejected inputs", () => {
  it("rejects probabilities that do not sum to 100", () => {
    // Not normalised: a set summing to 90 is usually a missing scenario, and
    // rescaling would answer a question nobody asked.
    expect(
      computeExpectedReturn([
        { probabilityPercent: 40, returnPercent: 10 },
        { probabilityPercent: 50, returnPercent: 5 },
      ]),
    ).toBeNull();
    expect(
      computeExpectedReturn([
        { probabilityPercent: 60, returnPercent: 10 },
        { probabilityPercent: 60, returnPercent: 5 },
      ]),
    ).toBeNull();
  });

  it("tolerates a rounding-sized miss", () => {
    expect(
      computeExpectedReturn([
        { probabilityPercent: 33.33, returnPercent: 10 },
        { probabilityPercent: 33.33, returnPercent: 5 },
        { probabilityPercent: 33.34, returnPercent: 0 },
      ]),
    ).not.toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeExpectedReturn([])).toBeNull();
    expect(
      computeExpectedReturn([
        { probabilityPercent: -10, returnPercent: 10 },
        { probabilityPercent: 110, returnPercent: 5 },
      ]),
    ).toBeNull();
    expect(
      computeExpectedReturn([
        { probabilityPercent: 100, returnPercent: Number.NaN },
      ]),
    ).toBeNull();
    expect(
      computeExpectedReturn([
        { probabilityPercent: Number.NaN, returnPercent: 10 },
      ]),
    ).toBeNull();
  });
});
