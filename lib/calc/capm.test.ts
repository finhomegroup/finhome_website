import { describe, it, expect } from "vitest";
import { computeCapm, type CapmInput } from "@/lib/calc/capm";

// Risk-free 4%, market 12%, beta 1,2 — an 8% premium.
const BASE: CapmInput = {
  riskFreeRatePercent: 4,
  beta: 1.2,
  marketReturnPercent: 12,
};

function capm(input: CapmInput) {
  const result = computeCapm(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeCapm — the model", () => {
  it("derives the premium and prices the risk", () => {
    const result = capm(BASE);
    expect(result.marketPremiumPercent).toBeCloseTo(8, 10);
    expect(result.riskPremiumPercent).toBeCloseTo(9.6, 10);
    expect(result.expectedReturnPercent).toBeCloseTo(13.6, 10);
  });

  it("accepts the premium directly instead of the market return", () => {
    const result = capm({
      riskFreeRatePercent: 4,
      beta: 1.2,
      marketPremiumPercent: 8,
    });
    expect(result.expectedReturnPercent).toBeCloseTo(13.6, 10);
  });

  it("returns the market return at a beta of 1", () => {
    const result = capm({ ...BASE, beta: 1 });
    expect(result.expectedReturnPercent).toBeCloseTo(12, 10);
    expect(result.profile).toBe("market");
  });

  it("returns the risk-free rate at a beta of 0", () => {
    const result = capm({ ...BASE, beta: 0 });
    expect(result.expectedReturnPercent).toBeCloseTo(4, 10);
    expect(result.riskPremiumPercent).toBe(0);
    expect(result.profile).toBe("defensive");
  });

  it("rises linearly with beta", () => {
    const one = capm({ ...BASE, beta: 1 }).expectedReturnPercent;
    const two = capm({ ...BASE, beta: 2 }).expectedReturnPercent;
    const three = capm({ ...BASE, beta: 3 }).expectedReturnPercent;
    expect(two - one).toBeCloseTo(three - two, 10);
  });
});

describe("computeCapm — beta profiles", () => {
  it("labels the four cases", () => {
    expect(capm({ ...BASE, beta: -0.5 }).profile).toBe("inverse");
    expect(capm({ ...BASE, beta: 0.6 }).profile).toBe("defensive");
    expect(capm({ ...BASE, beta: 1 }).profile).toBe("market");
    expect(capm({ ...BASE, beta: 1.8 }).profile).toBe("aggressive");
  });

  it("prices a negative beta below the risk-free rate", () => {
    // Not a bug: an asset that pays off when everything else falls is worth
    // holding at a discount to the risk-free rate.
    const result = capm({ ...BASE, beta: -0.5 });
    expect(result.expectedReturnPercent).toBeCloseTo(0, 10);
    expect(result.expectedReturnPercent).toBeLessThan(4);
  });

  it("handles a market return below the risk-free rate", () => {
    // A negative premium flips the sign of the risk reward.
    const result = capm({ ...BASE, marketReturnPercent: 2 });
    expect(result.marketPremiumPercent).toBeCloseTo(-2, 10);
    expect(result.expectedReturnPercent).toBeCloseTo(1.6, 10);
  });
});

describe("computeCapm — Jensen's alpha", () => {
  it("is the actual return less what the model expected", () => {
    const result = capm({ ...BASE, actualReturnPercent: 18 });
    expect(result.alphaPercent).toBeCloseTo(4.4, 10);
  });

  it("is negative when the asset underperformed its risk", () => {
    const result = capm({ ...BASE, actualReturnPercent: 10 });
    expect(result.alphaPercent).toBeCloseTo(-3.6, 10);
  });

  it("is zero when the asset returned exactly the expectation", () => {
    const result = capm({ ...BASE, actualReturnPercent: 13.6 });
    expect(result.alphaPercent).toBeCloseTo(0, 10);
  });

  it("is null when no actual return was given", () => {
    expect(capm(BASE).alphaPercent).toBeNull();
  });
});

describe("computeCapm — rejected inputs", () => {
  it("rejects giving neither the market return nor the premium", () => {
    expect(
      computeCapm({ riskFreeRatePercent: 4, beta: 1.2 }),
    ).toBeNull();
  });

  it("rejects giving BOTH, which would be two claims about one quantity", () => {
    expect(
      computeCapm({
        riskFreeRatePercent: 4,
        beta: 1.2,
        marketReturnPercent: 12,
        marketPremiumPercent: 8,
      }),
    ).toBeNull();
    // …even when they agree, because the module cannot know they do without
    // choosing a reconciliation rule the user did not ask for.
    expect(
      computeCapm({
        riskFreeRatePercent: 4,
        beta: 1.2,
        marketReturnPercent: 12,
        marketPremiumPercent: 99,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(
      computeCapm({ ...BASE, riskFreeRatePercent: Number.NaN }),
    ).toBeNull();
    expect(computeCapm({ ...BASE, beta: Number.NaN })).toBeNull();
    expect(
      computeCapm({ ...BASE, marketReturnPercent: Number.NaN }),
    ).toBeNull();
    expect(
      computeCapm({ ...BASE, actualReturnPercent: Number.NaN }),
    ).toBeNull();
    expect(
      computeCapm({ ...BASE, beta: Number.POSITIVE_INFINITY }),
    ).toBeNull();
  });

  it("allows a negative risk-free rate", () => {
    // Unusual but not impossible, and the arithmetic is unaffected.
    const result = capm({ ...BASE, riskFreeRatePercent: -1 });
    expect(result.marketPremiumPercent).toBeCloseTo(13, 10);
    expect(result.expectedReturnPercent).toBeCloseTo(14.6, 10);
  });
});
