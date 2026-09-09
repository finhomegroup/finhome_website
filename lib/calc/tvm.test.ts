import { describe, it, expect } from "vitest";
import { solveTvm, type TvmInput } from "@/lib/calc/tvm";
import { pmt } from "@/lib/calc/finance";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { TVM } from "@/content/calculators/tvm";

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

describe("solveTvm — the page's shipped defaults", () => {
  // content/calculators/tvm.ts quotes −17.356.465 ₫/kỳ and −2.165.551.520 ₫
  // net interest for its own defaults, and sets defaultPayment to the same
  // instalment. Those figures come from 8,5 ÷ 12; the four-decimal 0,7083 the
  // rate help used to teach lands 506,33 ₫/kỳ and 121.519 ₫ away, which is why
  // defaultRate now carries ten decimals. This pins the content default
  // against the module so the two cannot drift apart again.
  const rate = parseDecimal(TVM.form.defaultRate);

  it("parses the default rate as 8,5 ÷ 12 to the đồng", () => {
    expect(rate).not.toBeNull();
    // Ten decimals of 0,708333… — within 5e-11 of the exact eighth.
    expect(Math.abs(rate! - 8.5 / 12)).toBeLessThan(5e-11);
  });

  it("reproduces the page's quoted instalment and net interest", () => {
    const result = tvm({
      solveFor: "payment",
      presentValue: parseMoney(TVM.form.defaultPresent)!,
      futureValue: parseMoney(TVM.form.defaultFuture)!,
      periods: parseDecimal(TVM.form.defaultPeriods)!,
      ratePercentPerPeriod: rate!,
    });
    expect(Math.round(result.payment)).toBe(-17_356_465);
    expect(Math.round(result.netInterest)).toBe(-2_165_551_520);
    // defaultPayment is the same instalment, so the payment mode and the
    // "solve for rate" mode describe one loan.
    expect(Math.round(result.payment)).toBe(
      parseMoney(TVM.form.defaultPayment),
    );
  });

  it("restates the default rate as the 8,5%/năm the copy teaches", () => {
    // At the old 0,7083 this row rendered 8,4996%, contradicting rateHelp.
    const result = tvm({
      solveFor: "payment",
      presentValue: 2_000_000_000,
      futureValue: 0,
      periods: 240,
      ratePercentPerPeriod: rate!,
    });
    expect(result.annualRateIfMonthlyPercent).toBeCloseTo(8.5, 8);
  });
});

describe("solveTvm — the rounding loss rateHelp quotes", () => {
  // rateHelp tells the reader that truncating 8,5 ÷ 12 to 0,7083 costs
  // "506,33 ₫ mỗi kỳ và 121.519 ₫ lãi ròng trên 240 kỳ". Those two are one
  // multiplication apart, so a reader can check them: 240 × 506,33 = 121.519.
  // The copy used to say 507 ₫/kỳ — the difference of the two instalments
  // AFTER each is rounded to the đồng (17.356.465 − 17.355.958) — and 240 ×
  // 507 = 121.680, which is 161 ₫ off the net-interest figure in the same
  // sentence. This pins both figures so neither can drift from the module.
  const FULL_RATE = parseDecimal(TVM.form.defaultRate)!;
  const ROUNDED_RATE = 0.7083;

  /**
   * The per-period loss is a difference of two instalments near 1,74e7, where
   * one double ulp is ~3,7e-9 ₫. Re-deriving it through the textbook annuity
   * form instead of `pmt`'s growth-factor form therefore disagrees in the last
   * 1–2 ulp (measured: 3,7e-9 ₫). 1e-6 ₫ is five orders of magnitude below the
   * 0,01 ₫ the copy quotes, so it separates a real regression from float noise.
   */
  const ULP_BAND_DONG = 1e-6;

  function instalment(ratePercent: number) {
    return tvm({
      solveFor: "payment",
      presentValue: 2_000_000_000,
      futureValue: 0,
      periods: 240,
      ratePercentPerPeriod: ratePercent,
    });
  }

  it("loses 506,33 ₫ per period, matching the closed form and the copy", () => {
    const loss =
      instalment(ROUNDED_RATE).payment - instalment(FULL_RATE).payment;
    // Textbook annuity payment A = P·r / (1 − (1 + r)^−n), a different float
    // route to the same quantity than `pmt`'s (1 + r)^n form.
    const closedForm = (ratePercent: number) => {
      const r = ratePercent / 100;
      return (2_000_000_000 * r) / (1 - (1 + r) ** -240);
    };
    expect(
      Math.abs(loss - (closedForm(FULL_RATE) - closedForm(ROUNDED_RATE))),
    ).toBeLessThan(ULP_BAND_DONG);
    expect(formatDecimal(loss, 2)).toBe("506,33");
    expect(TVM.form.rateHelp).toContain("506,33 ₫ mỗi kỳ");
  });

  it("loses 121.519 ₫ of net interest, which is 240 × the per-period loss", () => {
    const loss =
      instalment(ROUNDED_RATE).netInterest - instalment(FULL_RATE).netInterest;
    expect(formatMoney(loss)).toBe("121.519");
    expect(TVM.form.rateHelp).toContain("121.519 ₫ lãi ròng trên 240 kỳ");
    // The multiplication the sentence invites has to close: 240 periods of the
    // per-period loss is the net-interest loss, to the đồng after rounding.
    const perPeriod =
      instalment(ROUNDED_RATE).payment - instalment(FULL_RATE).payment;
    expect(Math.abs(loss - 240 * perPeriod)).toBeLessThan(ULP_BAND_DONG);
    expect(formatMoney(240 * 506.33)).toBe("121.519");
    // And the figure the copy must NOT quote: 507 is the gap between the two
    // instalments as RENDERED, and 240 × 507 misses 121.519 by 161 ₫.
    expect(
      Math.round(instalment(ROUNDED_RATE).payment) -
        Math.round(instalment(FULL_RATE).payment),
    ).toBe(507);
    expect(formatMoney(240 * 507)).toBe("121.680");
    expect(TVM.form.rateHelp).not.toContain("507");
  });
});
