import { describe, it, expect } from "vitest";
import { computeWithdrawal, type WithdrawalInput } from "@/lib/calc/withdrawal";

// 5 tỷ portfolio, drawing 30 triệu a month, earning 8%/năm, withdrawal
// rising 4%/năm with inflation.
const BASE: WithdrawalInput = {
  balance: 5_000_000_000,
  monthlyWithdrawal: 30_000_000,
  annualReturnPercent: 8,
  inflationPercent: 4,
};

function draw(input: WithdrawalInput) {
  const result = computeWithdrawal(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeWithdrawal — how long it lasts", () => {
  it("runs out at some point on a heavy withdrawal", () => {
    const result = draw(BASE);
    expect(result.monthsLasted).not.toBeNull();
    expect(result.yearsLasted).toBeCloseTo(result.monthsLasted! / 12, 10);
    expect(result.finalBalance).toBe(0);
  });

  it("lasts longer at a lower withdrawal", () => {
    let previous = 0;
    for (const monthlyWithdrawal of [60_000_000, 40_000_000, 30_000_000]) {
      const value = draw({ ...BASE, monthlyWithdrawal }).monthsLasted!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("lasts longer at a higher return", () => {
    const low = draw({ ...BASE, annualReturnPercent: 4 }).monthsLasted!;
    const high = draw({ ...BASE, annualReturnPercent: 10 }).monthsLasted!;
    expect(high).toBeGreaterThan(low);
  });

  it("runs out sooner when inflation raises the withdrawal", () => {
    const flat = draw({ ...BASE, inflationPercent: 0 }).monthsLasted;
    const rising = draw(BASE).monthsLasted!;
    // With no inflation the 8% return covers a 7,2%/năm draw indefinitely.
    expect(flat).toBeNull();
    expect(rising).not.toBeNull();
  });

  it("never runs out when the withdrawal is zero", () => {
    const result = draw({ ...BASE, monthlyWithdrawal: 0 });
    expect(result.monthsLasted).toBeNull();
    expect(result.totalWithdrawn).toBe(0);
    expect(result.finalBalance).toBeGreaterThan(5_000_000_000);
  });

  it("reports no payout month rather than a huge number when it survives", () => {
    // The cap must surface as null, not as 1200.
    const result = draw({ ...BASE, monthlyWithdrawal: 5_000_000 });
    expect(result.monthsLasted).toBeNull();
    expect(result.yearsLasted).toBeNull();
  });

  it("empties in one month when the withdrawal exceeds the balance", () => {
    const result = draw({ ...BASE, monthlyWithdrawal: 9_000_000_000 });
    expect(result.monthsLasted).toBe(1);
    // The last withdrawal is trimmed to what was actually there.
    expect(result.totalWithdrawn).toBeLessThan(9_000_000_000);
    expect(result.totalWithdrawn).toBeGreaterThan(5_000_000_000);
  });
});

describe("computeWithdrawal — the withdrawal rises with inflation", () => {
  it("steps up once a year, not every month", () => {
    const result = draw({ ...BASE, monthlyWithdrawal: 10_000_000 });
    // Survives the cap, so the final withdrawal is year 100's.
    expect(result.finalMonthlyWithdrawal).toBeCloseTo(
      10_000_000 * 1.04 ** 99,
      -3,
    );
  });

  it("ends on a much larger withdrawal than it started with", () => {
    const result = draw(BASE);
    expect(result.finalMonthlyWithdrawal).toBeGreaterThan(30_000_000);
  });

  it("keeps the withdrawal flat when inflation is zero", () => {
    const result = draw({ ...BASE, inflationPercent: 0, monthlyWithdrawal: 60_000_000 });
    expect(result.finalMonthlyWithdrawal).toBeCloseTo(60_000_000, 6);
  });
});

describe("computeWithdrawal — the perpetual withdrawal", () => {
  it("is computed on the REAL return, not the nominal one", () => {
    // The point people miss: a withdrawal that must rise with inflation is
    // funded by the real return.
    const result = draw(BASE);
    expect(result.realReturnPercent).toBeCloseTo(
      ((1.08 / 1.04) - 1) * 100,
      8,
    );
    const realMonthly = (1 + (1.08 / 1.04 - 1)) ** (1 / 12) - 1;
    expect(result.perpetualMonthlyWithdrawal).toBeCloseTo(
      5_000_000_000 * realMonthly,
      2,
    );
  });

  it("is well below the nominal return's monthly figure", () => {
    const result = draw(BASE);
    expect(result.perpetualMonthlyWithdrawal!).toBeLessThan(
      result.firstMonthReturn,
    );
  });

  it("explains why the default plan runs out", () => {
    // 30 triệu is above what the portfolio can pay forever, so it depletes.
    const result = draw(BASE);
    expect(30_000_000).toBeGreaterThan(result.perpetualMonthlyWithdrawal!);
    expect(result.monthsLasted).not.toBeNull();
  });

  it("survives indefinitely at the perpetual withdrawal", () => {
    const perpetual = draw(BASE).perpetualMonthlyWithdrawal!;
    // A hair under, to stay clear of the rounding boundary.
    const result = draw({ ...BASE, monthlyWithdrawal: perpetual * 0.99 });
    expect(result.monthsLasted).toBeNull();
  });

  it("is null when the real return is not positive", () => {
    // Nothing is perpetual when inflation eats the whole return.
    expect(
      draw({ ...BASE, annualReturnPercent: 4, inflationPercent: 4 })
        .perpetualMonthlyWithdrawal,
    ).toBeNull();
    expect(
      draw({ ...BASE, annualReturnPercent: 2, inflationPercent: 5 })
        .perpetualMonthlyWithdrawal,
    ).toBeNull();
  });
});

describe("computeWithdrawal — the plain-language flags", () => {
  it("flags a withdrawal above the first month's return", () => {
    const result = draw({ ...BASE, monthlyWithdrawal: 40_000_000 });
    expect(result.firstMonthReturn).toBeCloseTo(
      5_000_000_000 * (1.08 ** (1 / 12) - 1),
      2,
    );
    expect(40_000_000).toBeGreaterThan(result.firstMonthReturn);
    expect(result.drawingDownPrincipal).toBe(true);
  });

  it("does NOT flag the default plan, which still runs out", () => {
    // Worth pinning, because it is the page's argument: the month-one
    // comparison is not the test of sustainability. 30 triệu is inside the
    // first month's 32.170.151 ₫ of return — 5.000.000.000 × (1,08^(1/12) − 1)
    // = 32.170.150,55, the module's monthly convention — so nothing is being
    // drawn from principal yet, and the portfolio depletes anyway, because the
    // withdrawal rises 4% a year while the return does not.
    const result = draw(BASE);
    expect(result.drawingDownPrincipal).toBe(false);
    expect(30_000_000).toBeLessThan(result.firstMonthReturn);
    expect(result.monthsLasted).not.toBeNull();
  });

  it("states the withdrawal rate against the starting balance", () => {
    expect(draw(BASE).withdrawalRatePercent).toBeCloseTo(7.2, 8);
  });
});

describe("computeWithdrawal — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeWithdrawal({ ...BASE, balance: 0 })).toBeNull();
    expect(computeWithdrawal({ ...BASE, balance: -1 })).toBeNull();
    expect(
      computeWithdrawal({ ...BASE, monthlyWithdrawal: -1 }),
    ).toBeNull();
    expect(
      computeWithdrawal({ ...BASE, annualReturnPercent: -100 }),
    ).toBeNull();
    expect(
      computeWithdrawal({ ...BASE, inflationPercent: -100 }),
    ).toBeNull();
    expect(computeWithdrawal({ ...BASE, balance: Number.NaN })).toBeNull();
    expect(
      computeWithdrawal({ ...BASE, monthlyWithdrawal: Number.NaN }),
    ).toBeNull();
  });

  it("allows a negative return above −100%", () => {
    const result = draw({ ...BASE, annualReturnPercent: -5 });
    expect(result.monthsLasted).not.toBeNull();
    expect(result.perpetualMonthlyWithdrawal).toBeNull();
  });
});
