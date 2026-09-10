import { describe, it, expect } from "vitest";
import {
  computeBlackScholes,
  type BlackScholesInput,
} from "@/lib/calc/black-scholes";

// A textbook case: spot 100, strike 100, 1 year, 20% vol, 5% rate, no
// dividend. Published values: call 10,4506, put 5,5735.
const TEXTBOOK: BlackScholesInput = {
  spot: 100,
  strike: 100,
  timeToExpiryYears: 1,
  volatilityPercent: 20,
  riskFreeRatePercent: 5,
};

function bs(input: BlackScholesInput) {
  const result = computeBlackScholes(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeBlackScholes — against published values", () => {
  it("matches the textbook at-the-money case", () => {
    const result = bs(TEXTBOOK);
    expect(result.callPrice).toBeCloseTo(10.450_584, 4);
    expect(result.putPrice).toBeCloseTo(5.573_526, 4);
  });

  it("matches the textbook d₁ and d₂", () => {
    const result = bs(TEXTBOOK);
    expect(result.d1).toBeCloseTo(0.35, 8);
    expect(result.d2).toBeCloseTo(0.15, 8);
  });

  it("matches published greeks for the same case", () => {
    const result = bs(TEXTBOOK);
    expect(result.callGreeks.delta).toBeCloseTo(0.636_831, 5);
    expect(result.putGreeks.delta).toBeCloseTo(-0.363_169, 5);
    expect(result.callGreeks.gamma).toBeCloseTo(0.018_762, 5);
    // Vega per percentage point: 37,524 per unit ÷ 100.
    expect(result.callGreeks.vega).toBeCloseTo(0.375_240, 5);
  });

  it("prices a deep in-the-money call near its discounted intrinsic", () => {
    const result = bs({ ...TEXTBOOK, spot: 200 });
    const discountedIntrinsic = 200 - 100 * Math.exp(-0.05);
    expect(result.callPrice).toBeCloseTo(discountedIntrinsic, 2);
    expect(result.callGreeks.delta).toBeCloseTo(1, 3);
  });

  it("prices a deep out-of-the-money call near zero", () => {
    const result = bs({ ...TEXTBOOK, spot: 20 });
    expect(result.callPrice).toBeLessThan(0.001);
    expect(result.callGreeks.delta).toBeLessThan(0.001);
  });
});

describe("computeBlackScholes — put-call parity", () => {
  it("holds across a grid of inputs", () => {
    // The invariant worth trusting over any single price:
    //   call − put = S·e^(−qt) − K·e^(−rt)
    for (const spot of [60, 100, 140]) {
      for (const timeToExpiryYears of [0.25, 1, 3]) {
        for (const volatilityPercent of [10, 30, 60]) {
          for (const dividendYieldPercent of [0, 3]) {
            const result = bs({
              ...TEXTBOOK,
              spot,
              timeToExpiryYears,
              volatilityPercent,
              dividendYieldPercent,
            });
            const parity =
              spot * Math.exp((-dividendYieldPercent / 100) * timeToExpiryYears) -
              100 * Math.exp((-0.05) * timeToExpiryYears);
            expect(result.callPrice - result.putPrice).toBeCloseTo(parity, 6);
          }
        }
      }
    }
  });

  it("holds in the zero-volatility limit too", () => {
    const result = bs({ ...TEXTBOOK, volatilityPercent: 0 });
    const parity = 100 - 100 * Math.exp(-0.05);
    expect(result.callPrice - result.putPrice).toBeCloseTo(parity, 8);
  });

  it("keeps delta_call − delta_put equal to e^(−qt)", () => {
    for (const dividendYieldPercent of [0, 2, 5]) {
      const result = bs({ ...TEXTBOOK, dividendYieldPercent });
      expect(
        result.callGreeks.delta - result.putGreeks.delta,
      ).toBeCloseTo(Math.exp((-dividendYieldPercent / 100) * 1), 8);
    }
  });
});

describe("computeBlackScholes — how the price responds", () => {
  it("rises with volatility for both call and put", () => {
    let previousCall = 0;
    let previousPut = 0;
    for (const volatilityPercent of [5, 15, 30, 60, 100]) {
      const result = bs({ ...TEXTBOOK, volatilityPercent });
      expect(result.callPrice).toBeGreaterThan(previousCall);
      expect(result.putPrice).toBeGreaterThan(previousPut);
      previousCall = result.callPrice;
      previousPut = result.putPrice;
    }
  });

  it("rises with time for both, at these rates", () => {
    let previousCall = 0;
    for (const timeToExpiryYears of [0.1, 0.5, 1, 2, 5]) {
      const result = bs({ ...TEXTBOOK, timeToExpiryYears });
      expect(result.callPrice).toBeGreaterThan(previousCall);
      previousCall = result.callPrice;
    }
  });

  it("rises with spot for a call and falls for a put", () => {
    const low = bs({ ...TEXTBOOK, spot: 80 });
    const high = bs({ ...TEXTBOOK, spot: 120 });
    expect(high.callPrice).toBeGreaterThan(low.callPrice);
    expect(high.putPrice).toBeLessThan(low.putPrice);
  });

  it("cuts the call and lifts the put as the dividend yield rises", () => {
    const none = bs(TEXTBOOK);
    const paying = bs({ ...TEXTBOOK, dividendYieldPercent: 6 });
    expect(paying.callPrice).toBeLessThan(none.callPrice);
    expect(paying.putPrice).toBeGreaterThan(none.putPrice);
  });

  it("never prices below intrinsic value", () => {
    for (const spot of [50, 80, 100, 130, 200]) {
      const result = bs({ ...TEXTBOOK, spot });
      expect(result.callPrice).toBeGreaterThanOrEqual(
        result.callIntrinsic - 1e-9,
      );
      expect(result.callTimeValue).toBeGreaterThanOrEqual(-1e-9);
    }
  });

  it("keeps delta between 0 and 1 for a call, −1 and 0 for a put", () => {
    for (const spot of [20, 60, 100, 150, 400]) {
      const result = bs({ ...TEXTBOOK, spot });
      expect(result.callGreeks.delta).toBeGreaterThanOrEqual(0);
      expect(result.callGreeks.delta).toBeLessThanOrEqual(1);
      expect(result.putGreeks.delta).toBeGreaterThanOrEqual(-1);
      expect(result.putGreeks.delta).toBeLessThanOrEqual(0);
    }
  });

  it("gives a long option negative theta", () => {
    const result = bs(TEXTBOOK);
    expect(result.callGreeks.theta).toBeLessThan(0);
    expect(result.putGreeks.theta).toBeLessThan(0);
  });

  it("shares gamma and vega between call and put", () => {
    const result = bs(TEXTBOOK);
    expect(result.callGreeks.gamma).toBe(result.putGreeks.gamma);
    expect(result.callGreeks.vega).toBe(result.putGreeks.vega);
  });

  it("gives a call positive rho and a put negative rho", () => {
    const result = bs(TEXTBOOK);
    expect(result.callGreeks.rho).toBeGreaterThan(0);
    expect(result.putGreeks.rho).toBeLessThan(0);
  });
});

describe("computeBlackScholes — the limiting cases", () => {
  it("is exactly intrinsic value at expiry", () => {
    const itm = bs({ ...TEXTBOOK, timeToExpiryYears: 0, spot: 130 });
    expect(itm.callPrice).toBe(30);
    expect(itm.putPrice).toBe(0);
    expect(itm.callTimeValue).toBe(0);
    expect(itm.d1).toBeNull();
    expect(itm.d2).toBeNull();
    expect(itm.callGreeks.delta).toBe(1);
    expect(itm.callGreeks.gamma).toBe(0);
    expect(itm.callGreeks.vega).toBe(0);
    expect(itm.callGreeks.theta).toBe(0);
  });

  it("is intrinsic value at expiry for an out-of-the-money option too", () => {
    const otm = bs({ ...TEXTBOOK, timeToExpiryYears: 0, spot: 70 });
    expect(otm.callPrice).toBe(0);
    expect(otm.putPrice).toBe(30);
    expect(otm.callGreeks.delta).toBe(0);
    expect(otm.putGreeks.delta).toBe(-1);
  });

  it("is the discounted forward intrinsic at zero volatility", () => {
    const result = bs({ ...TEXTBOOK, volatilityPercent: 0 });
    const forward = 100 * Math.exp(0.05);
    expect(result.forwardPrice).toBeCloseTo(forward, 8);
    expect(result.callPrice).toBeCloseTo(
      Math.exp(-0.05) * (forward - 100),
      8,
    );
    expect(result.putPrice).toBe(0);
    expect(result.d1).toBeNull();
  });

  it("reports the forward price in every branch", () => {
    for (const timeToExpiryYears of [0, 0.5, 2]) {
      for (const volatilityPercent of [0, 25]) {
        const result = bs({
          ...TEXTBOOK,
          timeToExpiryYears,
          volatilityPercent,
        });
        expect(result.forwardPrice).toBeCloseTo(
          100 * Math.exp(0.05 * timeToExpiryYears),
          8,
        );
      }
    }
  });

  it("handles a negative risk-free rate", () => {
    // It has happened in real markets and the formula is unaffected.
    const result = bs({ ...TEXTBOOK, riskFreeRatePercent: -0.5 });
    expect(result.callPrice).toBeGreaterThan(0);
    expect(result.putPrice).toBeGreaterThan(result.callPrice);
  });
});

describe("computeBlackScholes — the risk-neutral probability", () => {
  it("is N(d₂) for the call", () => {
    const result = bs(TEXTBOOK);
    // N(0,15) = 0,559618…
    expect(result.callProbabilityItmPercent).toBeCloseTo(55.961_8, 3);
  });

  it("goes to 100 deep in the money and 0 deep out", () => {
    expect(
      bs({ ...TEXTBOOK, spot: 1000 }).callProbabilityItmPercent!,
    ).toBeCloseTo(100, 2);
    expect(
      bs({ ...TEXTBOOK, spot: 10 }).callProbabilityItmPercent!,
    ).toBeCloseTo(0, 2);
  });

  it("is exactly 100 or 0 at expiry", () => {
    expect(
      bs({ ...TEXTBOOK, timeToExpiryYears: 0, spot: 130 })
        .callProbabilityItmPercent,
    ).toBe(100);
    expect(
      bs({ ...TEXTBOOK, timeToExpiryYears: 0, spot: 70 })
        .callProbabilityItmPercent,
    ).toBe(0);
  });
});

describe("computeBlackScholes — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeBlackScholes({ ...TEXTBOOK, spot: 0 })).toBeNull();
    expect(computeBlackScholes({ ...TEXTBOOK, spot: -1 })).toBeNull();
    expect(computeBlackScholes({ ...TEXTBOOK, strike: 0 })).toBeNull();
    expect(computeBlackScholes({ ...TEXTBOOK, strike: -1 })).toBeNull();
    expect(
      computeBlackScholes({ ...TEXTBOOK, timeToExpiryYears: -1 }),
    ).toBeNull();
    expect(
      computeBlackScholes({ ...TEXTBOOK, volatilityPercent: -1 }),
    ).toBeNull();
    expect(
      computeBlackScholes({ ...TEXTBOOK, dividendYieldPercent: -1 }),
    ).toBeNull();
    expect(computeBlackScholes({ ...TEXTBOOK, spot: Number.NaN })).toBeNull();
    expect(
      computeBlackScholes({ ...TEXTBOOK, riskFreeRatePercent: Number.NaN }),
    ).toBeNull();
  });
});
