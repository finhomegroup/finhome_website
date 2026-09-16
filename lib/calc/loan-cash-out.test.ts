import { describe, it, expect } from "vitest";
import { computeLoan, type LoanInput } from "@/lib/calc/loan";
import { amortizeFlatPrincipal } from "@/lib/calc/finance";

/**
 * The truthful-cash-out contract for /cong-cu/vay-mua-nha/, and the
 * flat-principal repayment method.
 *
 * The defect this file exists for: the page reported "Tổng trả hằng tháng
 * 17.356.465 ₫" while the borrower was also paying a 2.000.000 ₫ monthly extra
 * that had already shortened the schedule from 240 months to 187. Both figures
 * were individually correct and the sentence they formed was false.
 *
 * Every reference value below is computed independently — from a closed form
 * or from first principles — never read back off `computeLoan`. Where a figure
 * is quoted from the module it is because the test's job is to pin it.
 */

const AMOUNT = 2_000_000_000;
const BASE: LoanInput = {
  amount: AMOUNT,
  annualRatePercent: 8.5,
  termMonths: 240,
};

const loan = (input: LoanInput) => {
  const result = computeLoan(input);
  if (result === null) throw new Error("computeLoan returned null");
  return result;
};

/** Sum a column of a schedule, for the ledger identities. */
const sum = (
  rows: { payment: number; interest: number; principal: number }[],
  key: "payment" | "interest" | "principal",
) => rows.reduce((total, row) => total + row[key], 0);

describe("the zero-rate acceptance case", () => {
  // Acceptance scenario 1: the one figure that needs no finance at all, so a
  // sign or accumulation error has nowhere to hide.
  const result = loan({ ...BASE, annualRatePercent: 0 });

  it("divides the principal by the term and charges no interest", () => {
    expect(result.monthlyPrincipalInterest).toBeCloseTo(2_000_000_000 / 240, 6);
    expect(result.monthlyPrincipalInterest).toBeCloseTo(8_333_333.333_333_3, 4);
    expect(result.totalInterest).toBe(0);
  });

  it("repays exactly the principal, to the đồng", () => {
    expect(sum(result.schedule, "principal")).toBeCloseTo(AMOUNT, 6);
    expect(result.totalPrincipalInterest).toBeCloseTo(AMOUNT, 6);
  });

  it("reports no extra and so plans exactly the scheduled outflow", () => {
    expect(result.monthlyExtra).toBe(0);
    expect(result.monthlyPlannedOutflow).toBeCloseTo(result.monthlyPayment, 6);
  });
});

describe("the extra-payment acceptance case", () => {
  // Acceptance scenario 2: 2 tỷ, 8,5%, 240 months, 2 triệu extra each month.
  const EXTRA = 2_000_000;
  const result = loan({ ...BASE, extraPerMonth: EXTRA });
  const baseline = loan(BASE);

  it("keeps the scheduled instalment as the figure the bank asks for", () => {
    // Unchanged by the extra payment, and independently derived: the annuity
    // formula A = P·r / (1 − (1+r)^−n).
    const r = 8.5 / 100 / 12;
    const reference = (AMOUNT * r) / (1 - (1 + r) ** -240);
    expect(result.monthlyPayment).toBeCloseTo(reference, 6);
    expect(result.monthlyPayment).toBeCloseTo(17_356_465, 0);
    expect(result.monthlyPayment).toBeCloseTo(baseline.monthlyPayment, 6);
  });

  it("reports the planned full-month outflow as instalment PLUS extra", () => {
    // The correction. These two lines must be able to disagree, and the sum
    // must be exactly what leaves the account.
    expect(result.monthlyExtra).toBe(EXTRA);
    expect(result.monthlyPlannedOutflow).toBeCloseTo(
      result.monthlyPayment + EXTRA,
      6,
    );
    expect(result.monthlyPlannedOutflow).toBeCloseTo(19_356_465, 0);
    // Annualised, and named as such — see `firstYearOutflow` for the figure a
    // "money paid in the first year" label may use.
    expect(result.annualisedPlannedOutflow).toBeCloseTo(
      result.monthlyPlannedOutflow * 12,
      6,
    );
  });

  it("shortens the schedule, and says which month is the last one", () => {
    expect(result.months).toBe(187);
    expect(result.finalMonthPeriod).toBe(187);
    expect(result.finalMonthPeriod).toBe(result.schedule.length);
    expect(result.monthsSaved).toBe(240 - 187);
    expect(result.hasFullMonths).toBe(true);
  });

  it("charges the final month the real remainder, not a full instalment", () => {
    // The month the old copy got most wrong: it is neither 17,36m nor 19,36m.
    const finalRow = result.schedule[result.schedule.length - 1];
    expect(result.finalMonthOutflow).toBeCloseTo(finalRow.payment, 6);
    expect(result.finalMonthOutflow).toBeLessThan(result.monthlyPlannedOutflow);
    expect(finalRow.balance).toBe(0);
  });

  it("reconciles the schedule against the headline, to the đồng", () => {
    // The ledger identity docs §4 demands of every loan-shaped test: total
    // paid minus total interest is the principal, and no month's payment is
    // anything other than its own interest plus its own principal.
    //
    // TOLERANCE. An absolute bound, not `toBeCloseTo(AMOUNT, 6)`, which is the
    // mistake docs §8 records twice: summing 187 rows of a 2e9 balance
    // accumulates float64 residue. Each of the ~187 balance subtractions
    // carries at most ~2e-7 ₫ of representation error at this magnitude, so the
    // worst case is on the order of 4e-5 ₫. A bound of one thousandth of a xu
    // is five orders below the smallest unit VND has and still an order above
    // the observed residue, so it would catch a real accumulation defect while
    // a correct implementation passes.
    expect(
      Math.abs(
        sum(result.schedule, "payment") -
          sum(result.schedule, "interest") -
          AMOUNT,
      ),
    ).toBeLessThan(0.001);
    for (const row of result.schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
    expect(result.totalPrincipalInterest).toBeCloseTo(
      sum(result.schedule, "payment"),
      6,
    );
  });

  it("is made of full planned months plus one remainder", () => {
    // Every month but the last is the planned outflow exactly. That is the
    // claim the UI now makes in words, so it is asserted rather than assumed.
    for (const row of result.schedule.slice(0, -1)) {
      expect(row.payment).toBeCloseTo(result.monthlyPayment + EXTRA, 6);
    }
  });

  it("saves interest against the same loan with no extra", () => {
    expect(result.interestSaving).toBeCloseTo(
      baseline.totalInterest - result.totalInterest,
      6,
    );
    expect(result.interestSaving!).toBeGreaterThan(0);
  });
});

describe("first-year outflow versus an annualised month", () => {
  it("agrees with the annualised figure for a level annuity", () => {
    // The only case where multiplying one month by twelve is right.
    const result = loan(BASE);
    expect(result.firstYearMonths).toBe(12);
    expect(result.firstYearOutflow).toBeCloseTo(
      result.annualisedPlannedOutflow,
      4,
    );
  });

  it("disagrees under flat principal, where the instalment falls", () => {
    // `annualisedPlannedOutflow` multiplies the FIRST month — the dearest one
    // — by twelve, so it overstates a declining schedule. Labelling that as
    // money paid in the first year would be wrong by this margin.
    const flat = loan({ ...BASE, method: "flatPrincipal" });
    expect(flat.firstYearOutflow).toBeLessThan(flat.annualisedPlannedOutflow);

    // Independent reference: twelve months of a constant principal slice plus
    // interest on a balance falling by that slice each month.
    const r = 8.5 / 100 / 12;
    const slice = AMOUNT / 240;
    let reference = 0;
    for (let month = 0; month < 12; month += 1) {
      reference += slice + r * (AMOUNT - month * slice);
    }
    expect(flat.firstYearOutflow).toBeCloseTo(reference, 4);
  });

  it("covers only the months that exist when the loan ends inside the year", () => {
    // A large extra clears this loan in month 5, so there is no twelfth month
    // to pay. An annualised figure would invent seven.
    const short = loan({
      amount: 100_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      extraPerMonth: 20_000_000,
    });
    expect(short.months).toBeLessThan(12);
    expect(short.firstYearMonths).toBe(short.months);
    // Over a loan that short, the first "year" is the whole loan.
    expect(short.firstYearOutflow).toBeCloseTo(short.totalPayment, 4);
    expect(short.firstYearOutflow).toBeLessThan(short.annualisedPlannedOutflow);
  });

  it("charges PMI only for the months it applies to", () => {
    // PMI running 61 months is charged for all twelve of the first year...
    const long = loan({
      ...BASE,
      pmiPercent: 0.5,
      pmiMode: "until80",
      propertyPrice: 2_200_000_000,
    });
    expect(long.pmiMonths).toBe(61);
    const pi = long.schedule
      .slice(0, 12)
      .reduce((sum, row) => sum + row.payment, 0);
    expect(long.firstYearOutflow).toBeCloseTo(pi + long.monthlyPmi * 12, 4);

    // ...but a PMI that stops in month 5 is charged five times, not twelve.
    const early = loan({
      ...BASE,
      pmiPercent: 0.5,
      pmiMode: "until80",
      propertyPrice: 2_490_000_000,
    });
    expect(early.pmiMonths).toBeGreaterThan(0);
    expect(early.pmiMonths).toBeLessThan(12);
    const earlyPi = early.schedule
      .slice(0, 12)
      .reduce((sum, row) => sum + row.payment, 0);
    expect(early.firstYearOutflow).toBeCloseTo(
      earlyPi + early.monthlyPmi * early.pmiMonths,
      4,
    );
  });

  it("includes escrow for each of the months it covers", () => {
    const withEscrow = loan({ ...BASE, propertyTaxPerYear: 12_000_000 });
    const bare = loan(BASE);
    expect(withEscrow.firstYearOutflow).toBeCloseTo(
      bare.firstYearOutflow + 12_000_000,
      4,
    );
  });
});

describe("reference versus actual final instalment", () => {
  it("keeps the two apart when an extra payment ends the loan early", () => {
    // The contradiction the browser check found: a "tháng cuối" of 9.549.208 ₫
    // sitting next to a 17.356.465 ₫ figure looked like a component larger
    // than its total. They are different things and are now named separately.
    const result = loan({ ...BASE, extraPerMonth: 2_000_000 });
    expect(result.referenceFinalInstalment).toBeCloseTo(17_356_465, 0);
    expect(result.actualFinalPrincipalInterest).toBeCloseTo(9_549_208, 0);
    expect(result.actualFinalPrincipalInterest).toBeLessThan(
      result.referenceFinalInstalment,
    );
    // The actual final month is what leaves the account; with no escrow or
    // PMI the two coincide.
    expect(result.finalMonthOutflow).toBeCloseTo(
      result.actualFinalPrincipalInterest,
      6,
    );
  });

  it("describes the original schedule, not the shortened one", () => {
    // `referenceFinalInstalment` must not move when an extra payment is added:
    // it is the endpoint of the schedule the bank quoted.
    const plain = loan(BASE);
    const withExtra = loan({ ...BASE, extraPerMonth: 2_000_000 });
    expect(withExtra.referenceFinalInstalment).toBeCloseTo(
      plain.referenceFinalInstalment,
      6,
    );
  });

  it("is the cheapest scheduled month under flat principal", () => {
    const flat = loan({ ...BASE, method: "flatPrincipal" });
    expect(flat.referenceFinalInstalment).toBeLessThan(
      flat.monthlyPrincipalInterest,
    );
    expect(flat.actualFinalPrincipalInterest).toBeCloseTo(
      flat.referenceFinalInstalment,
      3,
    );
  });

  it("adds escrow and applicable PMI to reach the actual outflow", () => {
    const result = loan({
      ...BASE,
      propertyTaxPerYear: 12_000_000,
      pmiPercent: 0.5,
      pmiMode: "life",
      propertyPrice: 2_200_000_000,
    });
    expect(result.finalMonthOutflow).toBeCloseTo(
      result.actualFinalPrincipalInterest +
        result.monthlyEscrow +
        result.monthlyPmi,
      6,
    );
  });
});

describe("capping the final month", () => {
  it("never repays more than is outstanding, however large the extra", () => {
    // An extra that dwarfs the loan: the schedule must end immediately with a
    // payment of exactly the balance plus its one month of interest.
    const result = loan({
      amount: 10_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      extraPerMonth: 500_000_000,
    });
    expect(result.months).toBe(1);
    expect(result.hasFullMonths).toBe(false);
    const interest = 10_000_000 * (8.5 / 100 / 12);
    expect(result.finalMonthOutflow).toBeCloseTo(10_000_000 + interest, 6);
    // The planned figure is arithmetically fine but describes no real month,
    // which is exactly what `hasFullMonths` is for.
    expect(result.finalMonthOutflow).toBeLessThan(result.monthlyPlannedOutflow);
    expect(result.schedule[0].balance).toBe(0);
  });

  it("caps a tiny loan on its own final scheduled month", () => {
    const result = loan({
      amount: 1_000,
      annualRatePercent: 8.5,
      termMonths: 3,
    });
    expect(result.months).toBe(3);
    expect(sum(result.schedule, "principal")).toBeCloseTo(1_000, 9);
    expect(result.schedule[2].balance).toBe(0);
  });
});

describe("the final month with escrow and PMI", () => {
  it("adds escrow to the final month, because escrow does not stop", () => {
    const result = loan({ ...BASE, propertyTaxPerYear: 12_000_000 });
    const finalRow = result.schedule[result.schedule.length - 1];
    expect(result.monthlyEscrow).toBeCloseTo(1_000_000, 6);
    expect(result.finalMonthOutflow).toBeCloseTo(finalRow.payment + 1_000_000, 6);
  });

  it("omits PMI from the final month once PMI has already stopped", () => {
    // PMI runs 61 months here, and the schedule runs 240. Billing it on the
    // final month would contradict `pmiMonths` and `totalPayment`.
    const result = loan({
      ...BASE,
      pmiPercent: 0.5,
      pmiMode: "until80",
      propertyPrice: 2_200_000_000,
    });
    expect(result.pmiMonths).toBe(61);
    expect(result.monthlyPmi).toBeGreaterThan(0);
    const finalRow = result.schedule[result.schedule.length - 1];
    expect(result.finalMonthOutflow).toBeCloseTo(
      finalRow.payment + result.monthlyEscrow,
      6,
    );
  });

  it("includes PMI in the final month when it is charged for life", () => {
    const result = loan({
      ...BASE,
      pmiPercent: 0.5,
      pmiMode: "life",
      propertyPrice: 2_200_000_000,
    });
    expect(result.pmiMonths).toBe(240);
    const finalRow = result.schedule[result.schedule.length - 1];
    expect(result.finalMonthOutflow).toBeCloseTo(
      finalRow.payment + result.monthlyPmi,
      6,
    );
  });
});

describe("flat-principal repayment", () => {
  // Reference values from the closed forms, not from the module.
  //
  // With a constant principal slice s = P/n, the balance entering month k is
  // P − (k−1)s, so:
  //   first instalment = s + rP
  //   last instalment  = s + rs
  //   total interest   = r · Σ(P − (k−1)s) = r·P·(n+1)/2
  const r = 8.5 / 100 / 12;
  const slice = AMOUNT / 240;
  const flat = loan({ ...BASE, method: "flatPrincipal" });
  const annuity = loan(BASE);

  it("reports the method it actually used", () => {
    expect(flat.method).toBe("flatPrincipal");
    expect(annuity.method).toBe("annuity");
  });

  it("starts at the principal slice plus a full month of interest", () => {
    expect(flat.monthlyPrincipalInterest).toBeCloseTo(slice + r * AMOUNT, 6);
    // 8.333.333,33 + 14.166.666,67 — a round 22,5 triệu on these inputs.
    expect(flat.monthlyPrincipalInterest).toBeCloseTo(22_500_000, 6);
  });

  it("ends at the slice plus interest on the slice alone", () => {
    // TOLERANCE: dp 3, not dp 6. The final row's principal is deliberately
    // FORCED to whatever balance is left rather than being the nominal slice
    // (that is how the schedule lands on exactly zero), and after 239
    // subtractions the balance carries ~7e-6 ₫ of accumulated float residue.
    // The closed form cannot match that to dp 6, and demanding it would fail a
    // correct implementation.
    expect(flat.referenceFinalInstalment).toBeCloseTo(slice + r * slice, 3);
  });

  it("charges r·P·(n+1)/2 in total interest", () => {
    const reference = (r * AMOUNT * (240 + 1)) / 2;
    expect(flat.totalInterest).toBeCloseTo(reference, 4);
    expect(flat.totalInterest).toBeCloseTo(1_707_083_333.33, 2);
  });

  it("costs more in month one and less over the term than the annuity", () => {
    // The trade the borrower is being shown. Both directions matter: quoting
    // only the cheaper lifetime interest would sell a first instalment nearly
    // 30% higher without saying so.
    expect(flat.monthlyPrincipalInterest).toBeGreaterThan(
      annuity.monthlyPrincipalInterest,
    );
    expect(flat.totalInterest).toBeLessThan(annuity.totalInterest);
    const uplift =
      flat.monthlyPrincipalInterest / annuity.monthlyPrincipalInterest - 1;
    expect(uplift).toBeGreaterThan(0.25);
    expect(uplift).toBeLessThan(0.35);
  });

  it("falls every single month, and never rises", () => {
    // The defining property. A monotonicity worth asserting rather than
    // assuming — docs §8 records a case where exactly that assumption was
    // wrong and nobody noticed.
    const rows = flat.schedule;
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].payment).toBeLessThan(rows[i - 1].payment);
      // The principal slice is constant to dp 3 — see the tolerance note on
      // the final instalment above for why the last row cannot be exact.
      expect(rows[i].principal).toBeCloseTo(rows[i - 1].principal, 3);
    }
  });

  it("keeps the same ledger identities as the annuity", () => {
    expect(sum(flat.schedule, "payment") - sum(flat.schedule, "interest"))
      .toBeCloseTo(AMOUNT, 4);
    expect(flat.schedule[flat.schedule.length - 1].balance).toBe(0);
    for (const row of flat.schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("does not fold the borrower's extra into the bank's instalment", () => {
    // The flat-principal instalment is read off a schedule built without the
    // extra payment. If it were read off the real schedule, adding an extra
    // would silently inflate "what the bank asks for".
    const withExtra = loan({
      ...BASE,
      method: "flatPrincipal",
      extraPerMonth: 2_000_000,
    });
    expect(withExtra.monthlyPrincipalInterest).toBeCloseTo(
      flat.monthlyPrincipalInterest,
      6,
    );
    expect(withExtra.monthlyPlannedOutflow).toBeCloseTo(
      flat.monthlyPrincipalInterest + 2_000_000,
      6,
    );
    expect(withExtra.months).toBeLessThan(flat.months);
  });

  it("saves interest against the flat-principal baseline, not the annuity one", () => {
    // `interestSaving` compares like with like. Comparing a flat-principal
    // schedule against an annuity baseline would report a saving that came
    // from changing the method, not from paying extra.
    const withExtra = loan({
      ...BASE,
      method: "flatPrincipal",
      extraPerMonth: 2_000_000,
    });
    expect(withExtra.interestSaving).toBeCloseTo(
      flat.totalInterest - withExtra.totalInterest,
      4,
    );
    expect(withExtra.interestSaving!).toBeGreaterThan(0);
  });

  it("is the same schedule the primitive builds", () => {
    const direct = amortizeFlatPrincipal({
      principal: AMOUNT,
      ratePerPeriod: r,
      periods: 240,
    });
    expect(direct).not.toBeNull();
    expect(direct!.length).toBe(flat.schedule.length);
    for (const [i, row] of direct!.entries()) {
      expect(row.payment).toBeCloseTo(flat.schedule[i].payment, 6);
    }
  });

  it("handles a zero rate as a pure division", () => {
    const zero = loan({ ...BASE, annualRatePercent: 0, method: "flatPrincipal" });
    expect(zero.totalInterest).toBe(0);
    expect(zero.monthlyPrincipalInterest).toBeCloseTo(slice, 6);
    // dp 3 on the final row only: same forced-payoff residue as above.
    expect(zero.referenceFinalInstalment).toBeCloseTo(slice, 3);
  });

  it("survives a realistic long term", () => {
    // docs §8, defect 1: pin a 240/300/360-period case in anything touching
    // loans. Three of this suite's worst defects were long-term-only.
    for (const termMonths of [240, 300, 360]) {
      const long = loan({ ...BASE, termMonths, method: "flatPrincipal" });
      expect(long.months).toBe(termMonths);
      expect(long.totalInterest).toBeCloseTo(
        (r * AMOUNT * (termMonths + 1)) / 2,
        3,
      );
    }
  });
});

describe("amortizeFlatPrincipal — rejections", () => {
  it("refuses inputs that cannot describe a loan", () => {
    const base = { principal: AMOUNT, ratePerPeriod: 0.007, periods: 240 };
    expect(amortizeFlatPrincipal({ ...base, principal: 0 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, principal: -1 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, ratePerPeriod: -0.01 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, periods: 0 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, periods: 12.5 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, extraPerPeriod: -1 })).toBeNull();
    expect(amortizeFlatPrincipal({ ...base, principal: NaN })).toBeNull();
    expect(
      amortizeFlatPrincipal({ ...base, ratePerPeriod: Infinity }),
    ).toBeNull();
  });
});
