import { describe, it, expect } from "vitest";
import { solveTvm, type TvmInput } from "@/lib/calc/tvm";
import { pmt } from "@/lib/calc/finance";

// A 2 tỷ loan at 8,5%/năm over 240 months, in the module's own convention:
// the borrower receives the principal (positive) and pays instalments.
const LOAN: TvmInput = {
  solveFor: "payment",
  presentValue: 2_000_000_000,
  futureValue: 0,
  periods: 240,
  ratePercentPerPeriod: 8.5 / 12,
};

function tvm(input: TvmInput) {
  const result = solveTvm(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("solveTvm — solving for the payment", () => {
  it("agrees with pmt() and comes back negative for a loan", () => {
    const result = tvm(LOAN);
    expect(result.payment).toBeCloseTo(
      pmt(8.5 / 100 / 12, 240, 2_000_000_000),
      6,
    );
    // Outflow-negative: the borrower pays this out.
    expect(result.payment).toBeLessThan(0);
    expect(Math.abs(result.payment)).toBeCloseTo(17_356_465, 0);
  });

  it("reports the interest paid as a negative net", () => {
    const result = tvm(LOAN);
    expect(result.totalPayments).toBeCloseTo(result.payment * 240, 6);
    // Interest PAID shows as negative under the sign convention.
    expect(result.netInterest).toBeLessThan(0);
    expect(Math.abs(result.netInterest)).toBeCloseTo(2_165_551_520, -1);
  });

  it("restates a monthly rate as a nominal annual one", () => {
    const result = tvm(LOAN);
    expect(result.ratePercentPerPeriod).toBeCloseTo(8.5 / 12, 8);
    expect(result.annualRateIfMonthlyPercent).toBeCloseTo(8.5, 8);
  });

  it("asks for less each period when payments come at the start", () => {
    const ordinary = tvm(LOAN);
    const due = tvm({ ...LOAN, paymentAtBeginning: true });
    expect(Math.abs(due.payment)).toBeLessThan(Math.abs(ordinary.payment));
    expect(due.paymentAtBeginning).toBe(true);
  });
});

describe("solveTvm — the five solve directions agree", () => {
  it("round-trips payment → present value", () => {
    const payment = tvm(LOAN).payment;
    const back = tvm({
      solveFor: "presentValue",
      payment,
      futureValue: 0,
      periods: 240,
      ratePercentPerPeriod: 8.5 / 12,
    });
    expect(back.presentValue).toBeCloseTo(2_000_000_000, 2);
  });

  it("round-trips payment → periods", () => {
    const payment = tvm(LOAN).payment;
    const back = tvm({
      solveFor: "periods",
      payment,
      presentValue: 2_000_000_000,
      futureValue: 0,
      ratePercentPerPeriod: 8.5 / 12,
    });
    expect(back.periods).toBeCloseTo(240, 4);
  });

  it("round-trips payment → rate", () => {
    const payment = tvm(LOAN).payment;
    const back = tvm({
      solveFor: "rate",
      payment,
      presentValue: 2_000_000_000,
      futureValue: 0,
      periods: 240,
    });
    // Within 1e-6 of a percentage point — the solver's own precision.
    expect(back.ratePercentPerPeriod).toBeCloseTo(8.5 / 12, 6);
    expect(back.annualRateIfMonthlyPercent).toBeCloseTo(8.5, 5);
  });

  it("round-trips a savings plan through the future value", () => {
    // Nothing today, 1 triệu paid in monthly at 1%/period for 12 periods.
    const forward = tvm({
      solveFor: "futureValue",
      presentValue: 0,
      payment: -1_000_000,
      periods: 12,
      ratePercentPerPeriod: 1,
    });
    expect(forward.futureValue).toBeCloseTo(12_682_503.013, 2);
    // Money received at the end, so positive.
    expect(forward.futureValue).toBeGreaterThan(0);
    const back = tvm({
      solveFor: "payment",
      presentValue: 0,
      futureValue: forward.futureValue,
      periods: 12,
      ratePercentPerPeriod: 1,
    });
    expect(back.payment).toBeCloseTo(-1_000_000, 4);
  });

  it("reports the interest earned as a positive net for a saver", () => {
    const result = tvm({
      solveFor: "futureValue",
      presentValue: 0,
      payment: -1_000_000,
      periods: 12,
      ratePercentPerPeriod: 1,
    });
    expect(result.netInterest).toBeGreaterThan(0);
    expect(result.netInterest).toBeCloseTo(682_503.013, 2);
  });
});

describe("solveTvm — zero rate and zero payment", () => {
  it("divides evenly at a 0% rate", () => {
    const result = tvm({ ...LOAN, ratePercentPerPeriod: 0 });
    expect(result.payment).toBeCloseTo(-2_000_000_000 / 240, 6);
    expect(result.netInterest).toBeCloseTo(0, 2);
  });

  it("handles a lump sum with no payments", () => {
    // 100 triệu today at 1%/period for 60 periods.
    const result = tvm({
      solveFor: "futureValue",
      presentValue: -100_000_000,
      payment: 0,
      periods: 60,
      ratePercentPerPeriod: 1,
    });
    expect(result.futureValue).toBeCloseTo(100_000_000 * 1.01 ** 60, 2);
  });

  it("solves the rate on a plain lump sum", () => {
    const result = tvm({
      solveFor: "rate",
      presentValue: -100_000_000,
      futureValue: 200_000_000,
      payment: 0,
      periods: 120,
    });
    // Doubling over 120 periods: 2^(1/120) − 1 = 0,5792941…% per period.
    expect(result.ratePercentPerPeriod).toBeCloseTo(0.579_294_1, 5);
  });

  it("allows a negative rate above −100% per period", () => {
    const result = tvm({
      solveFor: "futureValue",
      presentValue: -100_000_000,
      payment: 0,
      periods: 12,
      ratePercentPerPeriod: -1,
    });
    expect(result.futureValue).toBeLessThan(100_000_000);
    expect(result.futureValue).toBeCloseTo(100_000_000 * 0.99 ** 12, 2);
  });
});

describe("solveTvm — unanswerable problems", () => {
  it("returns null when the cash flows never reach the target", () => {
    // Paying nothing in, hoping to reach a positive balance from nothing.
    expect(
      solveTvm({
        solveFor: "periods",
        presentValue: 0,
        futureValue: 100_000_000,
        payment: 0,
        ratePercentPerPeriod: 1,
      }),
    ).toBeNull();
  });

  it("returns null when the payment cannot service the balance", () => {
    // A payment below the first period's interest never repays anything, so
    // no finite number of periods clears it.
    expect(
      solveTvm({
        solveFor: "periods",
        presentValue: 2_000_000_000,
        futureValue: 0,
        payment: -1_000_000,
        ratePercentPerPeriod: 1,
      }),
    ).toBeNull();
  });

  it("returns null when the rate cannot be bracketed", () => {
    // All cash flows the same sign: nothing to solve.
    expect(
      solveTvm({
        solveFor: "rate",
        presentValue: -100,
        futureValue: -100,
        payment: -100,
        periods: 10,
      }),
    ).toBeNull();
  });

  it("does not round a fractional period count", () => {
    // 47,3 periods is the honest answer; rounding down would say the goal is
    // met a period early.
    const result = tvm({
      solveFor: "periods",
      presentValue: -100_000_000,
      futureValue: 500_000_000,
      payment: -6_000_000,
      ratePercentPerPeriod: 0.5,
    });
    expect(Number.isInteger(result.periods)).toBe(false);
  });
});

describe("solveTvm — rejected inputs", () => {
  it("requires all four of the other quantities", () => {
    expect(
      solveTvm({ solveFor: "payment", presentValue: 1, periods: 12 }),
    ).toBeNull();
    expect(
      solveTvm({
        solveFor: "rate",
        presentValue: 1,
        futureValue: 0,
        periods: 12,
      }),
    ).toBeNull();
    expect(
      solveTvm({
        solveFor: "presentValue",
        futureValue: 0,
        payment: -1,
        ratePercentPerPeriod: 1,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(solveTvm({ ...LOAN, periods: 0 })).toBeNull();
    expect(solveTvm({ ...LOAN, periods: -1 })).toBeNull();
    expect(solveTvm({ ...LOAN, ratePercentPerPeriod: -100 })).toBeNull();
    expect(solveTvm({ ...LOAN, ratePercentPerPeriod: -150 })).toBeNull();
    expect(solveTvm({ ...LOAN, presentValue: Number.NaN })).toBeNull();
    expect(solveTvm({ ...LOAN, periods: Number.NaN })).toBeNull();
    expect(
      solveTvm({ ...LOAN, ratePercentPerPeriod: Number.NaN }),
    ).toBeNull();
  });
});
