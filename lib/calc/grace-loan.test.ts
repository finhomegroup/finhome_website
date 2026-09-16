/**
 * ORIGINAL ROW 14 — ân hạn gốc combined with a rate reset, in one schedule.
 *
 * The reference side is an INDEPENDENT month-by-month recurrence written in
 * this file: a closed-form annuity, then a loop that charges interest on the
 * balance, repays nothing during the grace period, and re-amortizes the
 * standing balance over the remaining months at the first amortizing month and
 * again at the reset. It imports nothing from `finance.ts`, `loan.ts` or
 * `grace-loan.ts` for the reference.
 *
 * The supervisor's fixtures — 2 tỷ over 240 months, 7,5%/năm promotional then
 * 11%/năm, no fees:
 *
 * grace 24 / promo 12
 *   months 1–12   12.500.000
 *   months 13–24  18.333.333,333333
 *   months 25+    21.300.992,863284
 *   balance after 24 = 2.000.000.000; month 25 principal 2.967.659,529951
 *   full interest 2.971.014.458,469424
 *
 * grace 24 / promo 36
 *   months 1–24   12.500.000
 *   months 25–36  16.899.466,640805
 *   months 37+    21.114.487,918423
 *   balance at month 36 = 1.945.353.275,375019
 *   full interest 2.810.149.135,047915
 *
 * grace 0 / promo 12
 *   months 1–12   16.111.863,871036
 *   months 13+    20.479.346,302540
 *   full interest 2.862.633.323,431613 — must match the accepted no-grace model
 *
 * Deterministic test inputs. Not market rates, not a bank quote, not a product
 * anyone offers, and not a forecast.
 *
 * Bounds are stated absolutely, per docs §8: `toBeCloseTo`'s second argument is
 * a digit count, not a delta.
 */
import { describe, expect, it } from "vitest";
import { computeGraceLoan, MAX_GRACE_LOAN_MONTHS } from "@/lib/calc/grace-loan";
import { buildPhases, computeFloatingLoan } from "@/lib/calc/floating-loan";

/** `|actual − expected| < tolerance`, with the bound stated at the call. */
function near(
  actual: number | null | undefined,
  expected: number,
  tolerance: number,
  label?: string,
) {
  expect(actual, label).not.toBeNull();
  expect(Math.abs((actual as number) - expected), label).toBeLessThan(
    tolerance,
  );
}

/** One micro-đồng: both sides evaluate the same closed form once. */
const PAYMENT = 1e-6;
/** A thousandth of a đồng on a total accumulated over 240 additions. */
const TOTAL = 1e-3;

/** Level payment on an annuity, from the closed form. Outflow positive. */
function annuity(monthlyRate: number, months: number, principal: number) {
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

type Row = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  rate: number;
};

/** An independent recurrence over grace, promotion and the reset. */
function reference(input: {
  amount: number;
  termMonths: number;
  graceMonths: number;
  promoMonths: number;
  promoRatePercent: number;
  postRatePercent: number;
}): Row[] {
  const rows: Row[] = [];
  let balance = input.amount;
  let payment = 0;
  let lastRate: number | null = null;

  for (let month = 1; month <= input.termMonths; month += 1) {
    const annual =
      month <= input.promoMonths
        ? input.promoRatePercent
        : input.postRatePercent;
    const rate = annual / 100 / 12;
    const amortizing = month > input.graceMonths;

    if (amortizing) {
      if (month === input.graceMonths + 1 || rate !== lastRate) {
        payment = annuity(rate, input.termMonths - month + 1, balance);
      }
    } else {
      payment = balance * rate;
    }
    lastRate = rate;

    const interest = balance * rate;
    let principal = amortizing ? payment - interest : 0;
    if (amortizing && (month === input.termMonths || principal > balance)) {
      principal = balance;
    }
    balance -= principal;
    rows.push({
      month,
      payment: interest + principal,
      interest,
      principal,
      balance,
      rate: annual,
    });
  }

  return rows;
}

const BASE = {
  amount: 2_000_000_000,
  termMonths: 240,
  promoRatePercent: 7.5,
  postRatePercent: 11,
};

const totalInterestOf = (rows: Row[]) =>
  rows.reduce((total, row) => total + row.interest, 0);

describe("grace 24 / promo 12 — the reset lands INSIDE the grace period", () => {
  const input = { ...BASE, graceMonths: 24, promoMonths: 12 };
  const ref = reference(input);
  const result = computeGraceLoan(input);

  it("computes at all", () => {
    expect(result).not.toBeNull();
  });

  it("charges interest only, at the promotional rate, for twelve months", () => {
    if (result === null) return;
    // 2 tỷ × 7,5% ÷ 12 = 12.500.000 ₫, and the balance has not moved.
    for (const month of [1, 6, 12]) {
      near(
        result.schedule[month - 1].payment,
        12_500_000,
        PAYMENT,
        `month ${month}`,
      );
      near(result.schedule[month - 1].payment, ref[month - 1].payment, PAYMENT);
      expect(result.schedule[month - 1].principal, `month ${month}`).toBe(0);
      expect(result.schedule[month - 1].balance, `month ${month}`).toBe(
        2_000_000_000,
      );
    }
  });

  it("raises the interest-only payment when the RATE resets mid-grace", () => {
    if (result === null) return;
    // Still no principal, but 2 tỷ × 11% ÷ 12 = 18.333.333,33 ₫.
    for (const month of [13, 18, 24]) {
      near(
        result.schedule[month - 1].payment,
        18_333_333.333333,
        PAYMENT,
        `month ${month}`,
      );
      expect(result.schedule[month - 1].principal, `month ${month}`).toBe(0);
    }
    // The reset is NOT the end of the grace period, and the result says so
    // with two different months.
    expect(result.promoEndMonth).toBe(12);
    expect(result.graceEndMonth).toBe(24);
    // The reset falls inside the grace period, so there is no separate
    // post-reset amortizing level to report.
    expect(result.postResetPayment).toBeNull();
    expect(result.postResetMonth).toBeNull();
  });

  it("keeps the whole debt standing when the grace period ends", () => {
    if (result === null) return;
    // The lesson of the page: chưa trả gốc nghĩa là nghĩa vụ vẫn còn.
    expect(result.balanceAtGraceEnd).toBe(2_000_000_000);
    expect(result.balanceAtPromoEnd).toBe(2_000_000_000);
    near(ref[23].balance, 2_000_000_000, 0.5, "reference balance at 24");
  });

  it("amortizes the full balance over the 216 months that remain", () => {
    if (result === null) return;
    near(
      result.firstAmortizingPayment,
      21_300_992.863284,
      PAYMENT,
      "month 25 payment vs fixture",
    );
    near(
      result.firstAmortizingPayment,
      ref[24].payment,
      PAYMENT,
      "month 25 payment vs recurrence",
    );
    expect(result.firstAmortizingMonth).toBe(25);
    // 21.300.992,863284 − 18.333.333,333333 of interest.
    near(
      result.schedule[24].principal,
      2_967_659.529951,
      PAYMENT,
      "month 25 principal",
    );
    // And the jump the page exists to name.
    near(
      result.graceJump,
      21_300_992.863284 - 18_333_333.333333,
      PAYMENT,
      "grace jump",
    );
  });

  it("reproduces the full interest", () => {
    if (result === null) return;
    near(
      result.totalInterest,
      2_971_014_458.469424,
      TOTAL,
      "full interest vs fixture",
    );
    near(
      result.totalInterest,
      totalInterestOf(ref),
      TOTAL,
      "full interest vs recurrence",
    );
  });

  it("collapses to three phases with the two dates visible", () => {
    if (result === null) return;
    expect(
      result.phases.map((phase) => [
        phase.fromMonth,
        phase.toMonth,
        phase.annualRatePercent,
        phase.interestOnly,
      ]),
    ).toEqual([
      [1, 12, 7.5, true],
      [13, 24, 11, true],
      [25, 240, 11, false],
    ]);
  });
});

describe("grace 24 / promo 36 — the reset lands AFTER the grace period", () => {
  const input = { ...BASE, graceMonths: 24, promoMonths: 36 };
  const ref = reference(input);
  const result = computeGraceLoan(input);

  it("charges 12,5 triệu of interest through the whole grace period", () => {
    expect(result).not.toBeNull();
    if (result === null) return;
    for (const month of [1, 12, 13, 24]) {
      near(
        result.schedule[month - 1].payment,
        12_500_000,
        PAYMENT,
        `month ${month}`,
      );
      expect(result.schedule[month - 1].balance, `month ${month}`).toBe(
        2_000_000_000,
      );
    }
  });

  it("amortizes at the PROMOTIONAL rate for the twelve months in between", () => {
    if (result === null) return;
    near(
      result.firstAmortizingPayment,
      16_899_466.640805,
      PAYMENT,
      "month 25 vs fixture",
    );
    near(
      result.firstAmortizingPayment,
      ref[24].payment,
      PAYMENT,
      "month 25 vs recurrence",
    );
    expect(result.firstAmortizingMonth).toBe(25);
  });

  it("re-amortizes the balance standing at the reset", () => {
    if (result === null) return;
    // Twelve months of principal HAVE been repaid by month 36, so this reset
    // works on a smaller balance than the grace-end one did.
    near(
      result.balanceAtPromoEnd,
      1_945_353_275.375019,
      TOTAL,
      "balance at month 36 vs fixture",
    );
    near(
      result.balanceAtPromoEnd,
      ref[35].balance,
      TOTAL,
      "balance at month 36 vs recurrence",
    );
    near(
      result.postResetPayment,
      21_114_487.918423,
      PAYMENT,
      "month 37 vs fixture",
    );
    near(
      result.postResetPayment,
      ref[36].payment,
      PAYMENT,
      "month 37 vs recurrence",
    );
    expect(result.postResetMonth).toBe(37);
    // Two INDEPENDENT dates, in the other order this time.
    expect(result.graceEndMonth).toBe(24);
    expect(result.promoEndMonth).toBe(36);
  });

  it("reproduces the full interest", () => {
    if (result === null) return;
    near(
      result.totalInterest,
      2_810_149_135.047915,
      TOTAL,
      "full interest vs fixture",
    );
    near(
      result.totalInterest,
      totalInterestOf(ref),
      TOTAL,
      "full interest vs recurrence",
    );
  });

  it("costs LESS in total than the shorter promotion, on these numbers", () => {
    // Worth pinning because it is the reader's real question: a longer
    // promotion with the same grace saves 160.865.323 ₫ of interest here.
    const shorter = computeGraceLoan({ ...BASE, graceMonths: 24, promoMonths: 12 });
    if (result === null || shorter === null) return;
    expect(result.totalInterest).toBeLessThan(shorter.totalInterest);
    near(
      shorter.totalInterest - result.totalInterest,
      2_971_014_458.469424 - 2_810_149_135.047915,
      TOTAL,
      "interest difference",
    );
  });
});

describe("grace 0 / promo 12 — no grace period at all", () => {
  const input = { ...BASE, graceMonths: 0, promoMonths: 12 };
  const ref = reference(input);
  const result = computeGraceLoan(input);

  it("matches the supervisor's no-grace fixture", () => {
    expect(result).not.toBeNull();
    if (result === null) return;
    near(result.firstPayment, 16_111_863.871036, PAYMENT, "month 1");
    near(result.firstPayment, ref[0].payment, PAYMENT, "month 1 vs recurrence");
    near(result.postResetPayment, 20_479_346.302540, PAYMENT, "month 13");
    near(
      result.totalInterest,
      2_862_633_323.431613,
      TOTAL,
      "full interest vs fixture",
    );
    near(
      result.totalInterest,
      totalInterestOf(ref),
      TOTAL,
      "full interest vs recurrence",
    );
  });

  it("agrees with the ACCEPTED no-grace model to the đồng", () => {
    // `computeFloatingLoan` is the model the floating-rate tool and the loan
    // comparison already use and that has been independently accepted. A
    // second engine that disagreed with it would be the defect, so this is the
    // assertion that matters most in this file.
    const phases = buildPhases({
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    });
    expect(phases).not.toBeNull();
    if (phases === null || result === null) return;
    const accepted = computeFloatingLoan({ amount: 2_000_000_000, phases });
    expect(accepted).not.toBeNull();
    if (accepted === null) return;

    near(result.firstPayment, accepted.firstPayment, PAYMENT, "first payment");
    near(
      result.totalInterest,
      accepted.totalInterest,
      TOTAL,
      "total interest",
    );
    near(result.totalPaid, accepted.totalPaid, TOTAL, "total paid");
    expect(result.months).toBe(accepted.months);
    // Every month, not just the summary.
    for (let index = 0; index < accepted.schedule.length; index += 1) {
      near(
        result.schedule[index].balance,
        accepted.schedule[index].balance,
        1e-3,
        `balance at month ${index + 1}`,
      );
    }
  });

  it("reports no grace figures rather than zeros", () => {
    if (result === null) return;
    expect(result.graceEndMonth).toBeNull();
    expect(result.balanceAtGraceEnd).toBeNull();
    expect(result.lastGracePayment).toBeNull();
    // There is no jump to report, which is not the same as a jump of zero.
    expect(result.graceJump).toBeNull();
    expect(result.firstAmortizingMonth).toBe(1);
    // And no grace period means no extra interest from one. Here 0 IS the
    // right answer, and it is exact rather than a fallback.
    expect(result.extraInterest).toBe(0);
    expect(result.comparableTotalInterest).toBe(result.totalInterest);
  });
});

describe("a comparison that cannot be built is reported as absent", () => {
  /**
   * The source finding: `comparable === null ? totalInterest : …` made
   * `extraInterest` exactly 0 when the comparator FAILED — indistinguishable
   * from a grace period that costs nothing.
   *
   * The synthetic extreme that reaches it: a 1.200-month term at 1.200%/năm.
   * The monthly rate is 1, so the interest-only path stays finite, but the
   * no-grace annuity's `(1 + rate) ** periods` is `2 ** 1200` — Infinity in
   * float64 — so `pmt` returns a non-finite payment and the comparable
   * schedule cannot be built. Deliberately extreme test input, not a rate
   * anybody is quoted.
   */
  const EXTREME = {
    amount: 2_000_000_000,
    termMonths: 1200,
    graceMonths: 1199,
    promoMonths: 0,
    promoRatePercent: 1200,
    postRatePercent: 1200,
  };

  it("still answers the loan it was asked about", () => {
    const result = computeGraceLoan(EXTREME);
    expect(result).not.toBeNull();
    if (result === null) return;
    // Interest only on 2 tỷ at a monthly rate of 1 is 2 tỷ a month, for 1.199
    // months, and every figure stays finite.
    near(result.firstPayment, 2_000_000_000, 1e-3, "grace payment");
    expect(Number.isFinite(result.totalInterest)).toBe(true);
    expect(Number.isFinite(result.totalPaid)).toBe(true);
    near(result.totalInterest, 2.4e12, 1e9, "grace-path interest");
  });

  it("says there is NO comparison rather than a zero difference", () => {
    const result = computeGraceLoan(EXTREME);
    if (result === null) return;
    expect(result.comparableTotalInterest).toBeNull();
    expect(result.extraInterest).toBeNull();
    // Specifically NOT 0, which is what the old fallback produced.
    expect(result.extraInterest).not.toBe(0);
  });

  it("keeps a real comparison wherever one exists", () => {
    // The guard must not swallow the ordinary case.
    const ordinary = computeGraceLoan({
      amount: 2_000_000_000,
      termMonths: 240,
      graceMonths: 24,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    });
    expect(ordinary?.comparableTotalInterest).not.toBeNull();
    expect(ordinary?.extraInterest).not.toBeNull();
    near(
      ordinary?.extraInterest,
      2_971_014_458.469424 - 2_862_633_323.431613,
      TOTAL,
      "extra interest",
    );
  });
});

describe("what ân hạn gốc costs, on the same rate path", () => {
  it("isolates the grace period rather than a constant-rate loan", () => {
    const withGrace = computeGraceLoan({
      ...BASE,
      graceMonths: 24,
      promoMonths: 12,
    });
    const without = computeGraceLoan({
      ...BASE,
      graceMonths: 0,
      promoMonths: 12,
    });
    expect(withGrace).not.toBeNull();
    expect(without).not.toBeNull();
    if (withGrace === null || without === null) return;

    // The comparison holds the promotional path fixed and removes only the
    // grace period.
    near(
      withGrace.comparableTotalInterest,
      without.totalInterest,
      TOTAL,
      "comparable interest",
    );
    near(
      withGrace.extraInterest,
      2_971_014_458.469424 - 2_862_633_323.431613,
      TOTAL,
      "extra interest",
    );
    expect(withGrace.extraInterest).toBeGreaterThan(0);
  });
});

describe("the ledger holds in every fixture", () => {
  const fixtures = [
    { graceMonths: 24, promoMonths: 12 },
    { graceMonths: 24, promoMonths: 36 },
    { graceMonths: 0, promoMonths: 12 },
    { graceMonths: 0, promoMonths: 0 },
    { graceMonths: 239, promoMonths: 12 },
    { graceMonths: 12, promoMonths: 12 },
  ];

  it.each(fixtures)(
    "grace %j repays exactly the principal and lands on zero",
    (fixture) => {
      const result = computeGraceLoan({ ...BASE, ...fixture });
      expect(result).not.toBeNull();
      if (result === null) return;
      // docs §4's invariants.
      near(
        result.totalPaid - result.totalInterest,
        BASE.amount,
        1e-3,
        "principal identity",
      );
      expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
      for (const row of result.schedule) {
        near(
          row.interest + row.principal,
          row.payment,
          PAYMENT,
          `row ${row.period}`,
        );
      }
      // The balance never rises: interest is never capitalised here.
      let previous = BASE.amount;
      for (const row of result.schedule) {
        expect(row.balance, `row ${row.period}`).toBeLessThanOrEqual(previous);
        previous = row.balance;
      }
      expect(result.months).toBe(BASE.termMonths);
    },
  );

  it("keeps the balance flat for the whole grace period, at any length", () => {
    for (const graceMonths of [1, 12, 24, 120, 239]) {
      const result = computeGraceLoan({ ...BASE, graceMonths, promoMonths: 12 });
      expect(result, `grace ${graceMonths}`).not.toBeNull();
      if (result === null) return;
      for (let month = 1; month <= graceMonths; month += 1) {
        expect(result.schedule[month - 1].balance, `${graceMonths}/${month}`).toBe(
          BASE.amount,
        );
      }
      expect(result.balanceAtGraceEnd).toBe(BASE.amount);
    }
  });
});

describe("boundaries, in both orders", () => {
  it("treats grace-end and promo-end as separate events when they coincide", () => {
    const result = computeGraceLoan({
      ...BASE,
      graceMonths: 12,
      promoMonths: 12,
    });
    expect(result).not.toBeNull();
    if (result === null) return;
    // They happen in the same month here, and they are still two facts.
    expect(result.graceEndMonth).toBe(12);
    expect(result.promoEndMonth).toBe(12);
    // Two phases: twelve interest-only months at 7,5%, then amortizing at 11%.
    expect(
      result.phases.map((phase) => [phase.fromMonth, phase.toMonth, phase.interestOnly]),
    ).toEqual([
      [1, 12, true],
      [13, 240, false],
    ]);
    // The jump is the whole change, and the reset is not reported separately,
    // because month 13 is the first amortizing month.
    near(result.lastGracePayment, 12_500_000, PAYMENT, "last grace payment");
    expect(result.postResetPayment).toBeNull();
    // 2 tỷ over 228 months at 11%.
    const rate = 0.11 / 12;
    const growth = (1 + rate) ** 228;
    near(
      result.firstAmortizingPayment,
      (2_000_000_000 * rate * growth) / (growth - 1),
      PAYMENT,
      "month 13 payment",
    );
  });

  it("handles a promotion that ends in the first amortizing month", () => {
    // grace 24, promo 24: the reset and the grace end are the same boundary,
    // so month 25 amortizes at the POST rate.
    const result = computeGraceLoan({
      ...BASE,
      graceMonths: 24,
      promoMonths: 24,
    });
    expect(result).not.toBeNull();
    if (result === null) return;
    near(result.lastGracePayment, 12_500_000, PAYMENT, "month 24");
    near(
      result.firstAmortizingPayment,
      21_300_992.863284,
      PAYMENT,
      "month 25 at the post rate over 216 months",
    );
    expect(result.postResetPayment).toBeNull();
  });

  it("handles a zero rate on both sides", () => {
    const result = computeGraceLoan({
      amount: 2_000_000_000,
      termMonths: 240,
      graceMonths: 24,
      promoMonths: 12,
      promoRatePercent: 0,
      postRatePercent: 0,
    });
    expect(result).not.toBeNull();
    if (result === null) return;
    // Nothing is owed during a 0% grace period, and nothing is repaid either.
    expect(result.firstPayment).toBe(0);
    expect(result.balanceAtGraceEnd).toBe(2_000_000_000);
    expect(result.totalInterest).toBe(0);
    // 2 tỷ over the 216 remaining months.
    near(
      result.firstAmortizingPayment,
      2_000_000_000 / 216,
      PAYMENT,
      "flat repayment",
    );
    near(result.totalPaid, 2_000_000_000, 1e-3, "total paid");
  });

  it("handles a promotional rate ABOVE the later one", () => {
    // Nothing in the model assumes the promotion is the cheaper rate.
    const result = computeGraceLoan({
      ...BASE,
      promoRatePercent: 11,
      postRatePercent: 7.5,
      graceMonths: 24,
      promoMonths: 12,
    });
    expect(result).not.toBeNull();
    if (result === null) return;
    near(result.firstPayment, 18_333_333.333333, PAYMENT, "month 1 at 11%");
    near(result.schedule[12].payment, 12_500_000, PAYMENT, "month 13 at 7,5%");
    // The payment FALLS at the reset, and the jump at the end of grace is
    // still positive because principal repayment starts.
    expect(result.graceJump ?? 0).toBeGreaterThan(0);
  });
});

describe("refusals", () => {
  it("refuses a grace period as long as the term", () => {
    expect(
      computeGraceLoan({ ...BASE, graceMonths: 240, promoMonths: 12 }),
    ).toBeNull();
    expect(
      computeGraceLoan({ ...BASE, graceMonths: 241, promoMonths: 12 }),
    ).toBeNull();
    // One month short is a real loan.
    expect(
      computeGraceLoan({ ...BASE, graceMonths: 239, promoMonths: 12 }),
    ).not.toBeNull();
  });

  it("refuses a promotion as long as the term", () => {
    expect(
      computeGraceLoan({ ...BASE, graceMonths: 24, promoMonths: 240 }),
    ).toBeNull();
    expect(
      computeGraceLoan({ ...BASE, graceMonths: 24, promoMonths: 239 }),
    ).not.toBeNull();
  });

  it("refuses inputs that cannot describe a loan", () => {
    const cases: Partial<Parameters<typeof computeGraceLoan>[0]>[] = [
      { amount: 0 },
      { amount: -1 },
      { amount: Number.NaN },
      { termMonths: 0 },
      { termMonths: 240.5 },
      { graceMonths: -1 },
      { graceMonths: 24.5 },
      { promoMonths: -1 },
      { promoRatePercent: -1 },
      { postRatePercent: -1 },
      { postRatePercent: Number.POSITIVE_INFINITY },
    ];
    for (const patch of cases) {
      expect(
        computeGraceLoan({ ...BASE, graceMonths: 24, promoMonths: 12, ...patch }),
        JSON.stringify(patch),
      ).toBeNull();
    }
  });

  it("bounds the term at the suite's disclosed horizon, before allocating", () => {
    expect(MAX_GRACE_LOAN_MONTHS).toBe(1200);
    expect(
      computeGraceLoan({
        ...BASE,
        termMonths: MAX_GRACE_LOAN_MONTHS,
        graceMonths: 24,
        promoMonths: 12,
      }),
    ).not.toBeNull();
    expect(
      computeGraceLoan({
        ...BASE,
        termMonths: MAX_GRACE_LOAN_MONTHS + 1,
        graceMonths: 24,
        promoMonths: 12,
      }),
    ).toBeNull();
  });

  it("refuses a rate that accrues its way to a non-finite figure", () => {
    expect(
      computeGraceLoan({
        ...BASE,
        postRatePercent: 1e308,
        graceMonths: 24,
        promoMonths: 12,
      }),
    ).toBeNull();
  });
});
