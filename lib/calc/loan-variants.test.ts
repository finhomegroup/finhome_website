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

  // ---------------------------------------------------------------- the split
  //
  // The page's own question is "does paying more OFTEN reduce interest?", and
  // the combined `interestSaving` cannot answer it: a fortnightly schedule
  // changes two things at once. `split` separates them through ONE intermediate
  // schedule that changes exactly one variable at a time.
  //
  // The oracle is the DECOMPOSITION IDENTITY — the two legs must sum to the
  // combined saving. That is what makes this a decomposition rather than a
  // second estimate, and it holds by telescoping: (a−b) + (b−c) = a−c.
  //
  // Tolerance is a named absolute bound, not `toBeCloseTo(…, n)`: the three
  // endpoints are ~2e9 đồng, so each subtraction carries ~1e-7 of float
  // residue. A ten-thousandth of a đồng is meaningless as money and orders of
  // magnitude above that residue.
  const IDENTITY_TOLERANCE_DONG = 1e-4;

  it("splits the saving into two legs that sum to the combined figure", () => {
    const result = biweekly(BIWEEKLY);
    const split = result.split;
    expect(split).not.toBeNull();
    expect(
      Math.abs(
        split!.frequencySaving +
          split!.extraPaymentSaving -
          result.interestSaving,
      ),
    ).toBeLessThan(IDENTITY_TOLERANCE_DONG);
  });

  it("pins both legs against a hand-computed reference", () => {
    // Hand computation, independent of this module: a 2 tỷ / 8,5% / 240-month
    // loan has a level instalment of 17.356.464,67 ₫. Running three
    // fixed-payment schedules by hand gives
    //   monthly   @ 17.356.464,67 / month    → 2.165.551.520 ₫ interest
    //   same-money@  8.010.676,00 / fortnight→ 2.157.649.380 ₫ interest
    //   biweekly  @  8.678.232,33 / fortnight→ 1.722.714.007 ₫ interest
    // and the same-money leg's period count agrees with the closed form
    // n = −ln(1 − r·B/P)/ln(1+r) = 519,01 → 520 fortnights.
    const split = biweekly(BIWEEKLY).split!;
    expect(split.samePayment).toBeCloseTo(8_010_676, -1);
    expect(split.sameTotalInterest).toBeCloseTo(2_157_649_380, -3);
    expect(split.frequencySaving).toBeCloseTo(7_902_140, -3);
    expect(split.extraPaymentSaving).toBeCloseTo(434_935_373, -3);
  });

  it("leaves the annual outlay unchanged on the same-money leg", () => {
    // This is what makes the frequency leg an isolate: 26 instalments of
    // 12M/26 is exactly the 12M a year the monthly schedule pays. If this
    // drifts, `frequencySaving` is measuring money as well as timing.
    const result = biweekly(BIWEEKLY);
    expect(result.split!.samePayment * 26).toBeCloseTo(
      result.monthlyPayment * 12,
      6,
    );
    // And the shipped schedule pays one more instalment a year than that.
    expect(result.biweeklyPayment * 26).toBeCloseTo(
      result.monthlyPayment * 13,
      6,
    );
  });

  it("attributes almost all of the saving to paying MORE, not more often", () => {
    // The reframe this row exists for. Scoped to a positive rate on purpose:
    // at 0% both legs are zero and the inequality below is false, which is a
    // fact about the loan and not about the split — see the zero-rate case.
    const split = biweekly(BIWEEKLY).split!;
    expect(split.extraPaymentSaving).toBeGreaterThan(
      split.frequencySaving * 20,
    );
  });

  it("withholds both legs rather than reporting zeros when the same-money schedule does not exist", () => {
    // NOT a hypothetical. On a very long term the level instalment converges
    // down onto the interest charge, so 12M/26 lands at or below the
    // fortnightly interest and no same-money schedule exists — while the M/2
    // schedule still clears in 786 fortnights. Two zeros here would read as
    // "neither cause contributes", the opposite of the truth.
    const result = biweekly({ ...BIWEEKLY, termMonths: 6000 });
    expect(result.interestSaving).toBeGreaterThan(0);
    expect(result.split).toBeNull();
  });

  it("splits nothing at a zero rate, because there is nothing to split", () => {
    const split = biweekly({ ...BIWEEKLY, annualRatePercent: 0 }).split!;
    expect(split.frequencySaving).toBeCloseTo(0, 6);
    expect(split.extraPaymentSaving).toBeCloseTo(0, 6);
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
