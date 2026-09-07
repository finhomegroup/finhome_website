import { describe, it, expect } from "vitest";
import {
  amortizeFixedPayment,
  computeBiweekly,
  computeInterestOnly,
  type BiweeklyInput,
  type InterestOnlyInput,
} from "@/lib/calc/loan-variants";
import { pmt } from "@/lib/calc/finance";

const AMOUNT = 2_000_000_000;
const RATE = 8.5;
const TERM = 240;

describe("amortizeFixedPayment", () => {
  it("clears the balance and repays exactly the principal", () => {
    const rows = amortizeFixedPayment(AMOUNT, RATE / 100 / 12, 20_000_000);
    expect(rows).not.toBeNull();
    expect(rows![rows!.length - 1].balance).toBe(0);
    expect(rows!.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(
      AMOUNT,
      2,
    );
  });

  it("takes longer with a smaller payment", () => {
    const small = amortizeFixedPayment(AMOUNT, RATE / 100 / 12, 18_000_000)!;
    const large = amortizeFixedPayment(AMOUNT, RATE / 100 / 12, 25_000_000)!;
    expect(small.length).toBeGreaterThan(large.length);
  });

  it("splits every row into interest plus principal", () => {
    for (const row of amortizeFixedPayment(AMOUNT, RATE / 100 / 12, 20_000_000)!) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("returns null when the payment cannot cover the interest", () => {
    // 1 triệu against a ~14,2 triệu monthly interest charge never amortizes.
    expect(amortizeFixedPayment(AMOUNT, RATE / 100 / 12, 1_000_000)).toBeNull();
    // Exactly the interest charge is still not enough.
    expect(
      amortizeFixedPayment(AMOUNT, RATE / 100 / 12, AMOUNT * (RATE / 100 / 12)),
    ).toBeNull();
  });

  it("divides principal evenly at a zero rate", () => {
    const rows = amortizeFixedPayment(1200, 0, 100)!;
    expect(rows.length).toBe(12);
    expect(rows[0].interest).toBe(0);
  });

  it("returns null for rejected inputs", () => {
    expect(amortizeFixedPayment(0, 0.01, 100)).toBeNull();
    expect(amortizeFixedPayment(-1, 0.01, 100)).toBeNull();
    expect(amortizeFixedPayment(1000, -0.01, 100)).toBeNull();
    expect(amortizeFixedPayment(1000, 0.01, 0)).toBeNull();
    expect(amortizeFixedPayment(1000, Number.NaN, 100)).toBeNull();
  });

  it("returns null rather than a partial schedule when it cannot finish", () => {
    // A payment that barely beats the interest needs more than the backstop.
    const rate = RATE / 100 / 12;
    const barely = AMOUNT * rate + 1;
    expect(amortizeFixedPayment(AMOUNT, rate, barely, 10)).toBeNull();
  });
});

const BIWEEKLY: BiweeklyInput = {
  amount: AMOUNT,
  annualRatePercent: RATE,
  termMonths: TERM,
};

function biweekly(input: BiweeklyInput) {
  const result = computeBiweekly(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeBiweekly", () => {
  it("halves the monthly instalment", () => {
    const result = biweekly(BIWEEKLY);
    expect(result.monthlyPayment).toBeCloseTo(
      Math.abs(pmt(RATE / 100 / 12, TERM, AMOUNT)),
      6,
    );
    expect(result.biweeklyPayment).toBeCloseTo(result.monthlyPayment / 2, 6);
  });

  it("pins the reference outcome", () => {
    const result = biweekly(BIWEEKLY);
    expect(result.biweeklyPeriods).toBe(429);
    expect(result.biweeklyYears).toBeCloseTo(16.5, 1);
    expect(result.interestSaving).toBeCloseTo(442_837_513, -3);
  });

  it("pays off sooner and costs less interest", () => {
    const result = biweekly(BIWEEKLY);
    expect(result.biweeklyYears * 12).toBeLessThan(TERM);
    expect(result.biweeklyTotalInterest).toBeLessThan(
      result.monthlyTotalInterest,
    );
    expect(result.interestSaving).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it("repays exactly the principal and ends at zero", () => {
    const result = biweekly(BIWEEKLY);
    expect(
      result.biweeklySchedule.reduce((sum, row) => sum + row.principal, 0),
    ).toBeCloseTo(AMOUNT, 2);
    expect(
      result.biweeklySchedule[result.biweeklySchedule.length - 1].balance,
    ).toBe(0);
  });

  it("saves nothing at a zero rate — there is no interest to avoid", () => {
    const result = biweekly({ ...BIWEEKLY, annualRatePercent: 0 });
    expect(result.interestSaving).toBeCloseTo(0, 6);
  });

  it("returns null for rejected inputs", () => {
    expect(computeBiweekly({ ...BIWEEKLY, amount: 0 })).toBeNull();
    expect(computeBiweekly({ ...BIWEEKLY, annualRatePercent: -1 })).toBeNull();
    expect(computeBiweekly({ ...BIWEEKLY, termMonths: 0 })).toBeNull();
    expect(computeBiweekly({ ...BIWEEKLY, termMonths: 240.5 })).toBeNull();
    expect(
      computeBiweekly({ ...BIWEEKLY, annualRatePercent: Number.NaN }),
    ).toBeNull();
  });
});

const IO: InterestOnlyInput = {
  amount: AMOUNT,
  annualRatePercent: RATE,
  termMonths: TERM,
  interestOnlyMonths: 24,
};

function interestOnly(input: InterestOnlyInput) {
  const result = computeInterestOnly(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeInterestOnly", () => {
  it("charges the interest on the full balance during the opening phase", () => {
    expect(interestOnly(IO).interestOnlyPayment).toBeCloseTo(
      AMOUNT * (RATE / 100 / 12),
      6,
    );
  });

  it("amortizes the same principal over what is left of the term", () => {
    // 240 months less a 24-month interest-only phase is 216.
    expect(interestOnly(IO).amortizingPayment).toBeCloseTo(
      Math.abs(pmt(RATE / 100 / 12, 216, AMOUNT)),
      6,
    );
  });

  it("puts a number on the jump borrowers are surprised by", () => {
    const result = interestOnly(IO);
    expect(result.paymentIncrease).toBeGreaterThan(0);
    expect(result.paymentIncrease).toBeCloseTo(
      result.amortizingPayment - result.interestOnlyPayment,
      6,
    );
    expect(result.paymentIncrease).toBeCloseTo(3_942_482, -3);
  });

  it("costs more interest than amortizing from day one", () => {
    const result = interestOnly(IO);
    expect(result.totalInterest).toBeGreaterThan(result.comparableTotalInterest);
    expect(result.extraInterest).toBeGreaterThan(0);
    expect(result.extraInterest).toBeCloseTo(86_024_683, -3);
  });

  it("accounts for every đồng of interest in the opening phase", () => {
    const result = interestOnly(IO);
    expect(result.interestOnlyPhaseInterest).toBeCloseTo(
      result.interestOnlyPayment * 24,
      6,
    );
  });

  it("collapses to a plain loan when the phase is zero months", () => {
    // Not a restatement: it checks the two code paths agree at the boundary.
    const result = interestOnly({ ...IO, interestOnlyMonths: 0 });
    expect(result.totalInterest).toBeCloseTo(result.comparableTotalInterest, 2);
    expect(result.paymentIncrease).toBeCloseTo(
      result.amortizingPayment - result.interestOnlyPayment,
      6,
    );
  });

  it("repays exactly the principal in the amortizing phase", () => {
    const result = interestOnly(IO);
    expect(
      result.amortizingSchedule.reduce((sum, row) => sum + row.principal, 0),
    ).toBeCloseTo(AMOUNT, 2);
    expect(
      result.amortizingSchedule[result.amortizingSchedule.length - 1].balance,
    ).toBe(0);
  });

  it("returns null when nothing would ever be repaid", () => {
    // An interest-only phase as long as the term never touches the principal.
    expect(computeInterestOnly({ ...IO, interestOnlyMonths: TERM })).toBeNull();
    expect(computeInterestOnly({ ...IO, interestOnlyMonths: 300 })).toBeNull();
  });

  it("returns null for rejected inputs", () => {
    expect(computeInterestOnly({ ...IO, amount: 0 })).toBeNull();
    expect(computeInterestOnly({ ...IO, annualRatePercent: -1 })).toBeNull();
    expect(computeInterestOnly({ ...IO, termMonths: 0 })).toBeNull();
    expect(computeInterestOnly({ ...IO, termMonths: 240.5 })).toBeNull();
    expect(computeInterestOnly({ ...IO, interestOnlyMonths: -1 })).toBeNull();
    expect(computeInterestOnly({ ...IO, interestOnlyMonths: 12.5 })).toBeNull();
  });
});
