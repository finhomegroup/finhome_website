/**
 * ORIGINAL ROW 11 — the named +1/+2/+3 percentage-point scenarios.
 *
 * The references below are an INDEPENDENT monthly recurrence written in this
 * file, not a snapshot of `compareRateStress`'s own output: a closed-form
 * annuity payment, then a loop that accrues interest on the balance and
 * re-amortizes over the remaining term at the reset. Nothing here imports
 * `finance.ts`, `loan.ts` or `floating-loan.ts` for the reference side.
 *
 * The supervisor's fixture, which these reproduce: 2 tỷ over 240 months, 12
 * months at 7,5%/năm, then 11%/năm, no recurring step, no cap and no fees.
 *
 * | Shift | Post rate | Payment from month 13 | Full interest    |
 * |-------|-----------|-----------------------|------------------|
 * | 0     | 11%       | 20.479.346,30254005   | 2.862.633.323,43 |
 * | +1    | 12%       | 21.807.309,445297126  | 3.165.408.919,98 |
 * | +2    | 13%       | 23.166.369,535204627  | 3.475.274.620,48 |
 * | +3    | 14%       | 24.554.087,003233567  | 3.791.674.203,19 |
 *
 * These are deterministic test inputs. They are not market rates, a bank
 * quote, a forecast or a probability.
 *
 * TOLERANCES ARE STATED ABSOLUTE BOUNDS, per docs §8: `toBeCloseTo`'s second
 * argument is a DIGIT COUNT, so `toBeCloseTo(x, 1e-6)` is a half-đồng test
 * that reads like a millionth-of-a-đồng one. `near` below says what it means.
 */
import { describe, expect, it } from "vitest";
import {
  MAX_FLOATING_MONTHS,
  RATE_STRESS_POINTS,
  buildPhases,
  compareRateStress,
  computeFloatingLoan,
} from "@/lib/calc/floating-loan";

/** `|actual − expected| < tolerance`, with the bound stated at the call. */
function near(
  actual: number | null | undefined,
  expected: number,
  tolerance: number,
  label?: string,
) {
  expect(actual, label).not.toBeNull();
  expect(typeof actual, label).toBe("number");
  expect(Math.abs((actual as number) - expected), label).toBeLessThan(
    tolerance,
  );
}

/**
 * One micro-đồng, for a figure both sides compute from the same closed form.
 *
 * A payment is one annuity evaluation on each side, so anything beyond float
 * round-off would be a different formula.
 */
const PAYMENT_TOLERANCE = 1e-6;

/**
 * A thousandth of a đồng, for a total accumulated over 240 additions.
 *
 * The two loops add the same terms in the same order but through different
 * code, so the residue is float summation only — nine significant figures in,
 * so 1e-3 is still about 1e-12 relative.
 */
const TOTAL_TOLERANCE = 1e-3;

/** Level payment on an annuity, from the closed form. Outflow positive. */
function annuity(monthlyRate: number, months: number, principal: number) {
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

type Reference = {
  firstPayment: number;
  balanceAtReset: number;
  postPayment: number;
  totalInterest: number;
};

/**
 * An independent two-phase recurrence: promo months, then the rest.
 *
 * Re-amortizes the balance standing at the reset over the months that remain,
 * which is the mechanic the whole page is about.
 */
function reference(input: {
  amount: number;
  termMonths: number;
  promoMonths: number;
  promoRatePercent: number;
  postRatePercent: number;
}): Reference {
  const { amount, termMonths, promoMonths, promoRatePercent, postRatePercent } =
    input;

  let balance = amount;
  let totalInterest = 0;

  const promoRate = promoRatePercent / 100 / 12;
  const firstPayment = annuity(promoRate, termMonths, balance);
  for (let month = 1; month <= promoMonths; month += 1) {
    const interest = balance * promoRate;
    totalInterest += interest;
    balance -= firstPayment - interest;
  }
  const balanceAtReset = balance;

  const postRate = postRatePercent / 100 / 12;
  const remaining = termMonths - promoMonths;
  const postPayment = annuity(postRate, remaining, balance);
  for (let month = 1; month <= remaining; month += 1) {
    const interest = balance * postRate;
    totalInterest += interest;
    let principal = postPayment - interest;
    if (month === remaining || principal > balance) principal = balance;
    balance -= principal;
  }

  return { firstPayment, balanceAtReset, postPayment, totalInterest };
}

const FIXTURE = {
  amount: 2_000_000_000,
  termMonths: 240,
  promoMonths: 12,
  promoRatePercent: 7.5,
  postRatePercent: 11,
};

describe("compareRateStress — the supervisor's percentage-point fixture", () => {
  it("reproduces the baseline against an independent recurrence", () => {
    const ref = reference(FIXTURE);
    const stress = compareRateStress({ ...FIXTURE, shiftPoints: 0 });
    expect(stress).not.toBeNull();
    if (stress === null) return;

    near(
      stress.selected.loan.firstPayment,
      ref.firstPayment,
      PAYMENT_TOLERANCE,
      "first payment vs recurrence",
    );
    near(
      stress.selected.loan.firstPayment,
      16_111_863.871036042,
      PAYMENT_TOLERANCE,
      "first payment vs fixture",
    );
    // The debt standing at the first reset, which is what gets re-amortized.
    near(
      stress.selected.loan.phases[0].balance,
      ref.balanceAtReset,
      TOTAL_TOLERANCE,
      "balance at reset vs recurrence",
    );
    near(
      stress.selected.loan.phases[0].balance,
      1_955_136_259.3563652,
      TOTAL_TOLERANCE,
      "balance at reset vs fixture",
    );
    near(
      stress.selected.postPromoPayment,
      ref.postPayment,
      PAYMENT_TOLERANCE,
      "post-promo payment vs recurrence",
    );
    near(
      stress.selected.postPromoPayment,
      20_479_346.30254005,
      PAYMENT_TOLERANCE,
      "post-promo payment vs fixture",
    );
    near(
      stress.selected.loan.totalInterest,
      ref.totalInterest,
      TOTAL_TOLERANCE,
      "full interest vs recurrence",
    );
    near(
      stress.selected.loan.totalInterest,
      2_862_633_323.4315634,
      TOTAL_TOLERANCE,
      "full interest vs fixture",
    );
    // At the baseline there is nothing to compare against but itself.
    expect(stress.paymentIncrease).toBe(0);
    expect(stress.interestIncrease).toBe(0);
    expect(stress.selected).toBe(stress.baseline);
  });

  it.each([
    [1, 12, 21_807_309.445297126, 3_165_408_919.980177],
    [2, 13, 23_166_369.535204627, 3_475_274_620.479088],
    [3, 14, 24_554_087.003233567, 3_791_674_203.189686],
  ])(
    "+%i percentage point(s) runs at %i%% and pays %d from month 13",
    (points, postRate, payment, interest) => {
      const ref = reference({ ...FIXTURE, postRatePercent: postRate });
      const stress = compareRateStress({ ...FIXTURE, shiftPoints: points });
      expect(stress).not.toBeNull();
      if (stress === null) return;

      // A PERCENTAGE POINT, not a percentage: +1 on 11 is 12, never 11,11.
      expect(stress.selected.postRatePercent).toBe(postRate);
      expect(stress.selected.requestedPostRatePercent).toBe(postRate);
      expect(stress.selected.cappedByRateCap).toBe(false);

      near(
        stress.selected.postPromoPayment,
        ref.postPayment,
        PAYMENT_TOLERANCE,
        "payment vs recurrence",
      );
      near(
        stress.selected.postPromoPayment,
        payment,
        PAYMENT_TOLERANCE,
        "payment vs fixture",
      );
      near(
        stress.selected.loan.totalInterest,
        ref.totalInterest,
        TOTAL_TOLERANCE,
        "interest vs recurrence",
      );
      near(
        stress.selected.loan.totalInterest,
        interest,
        TOTAL_TOLERANCE,
        "interest vs fixture",
      );
    },
  );

  it("leaves the promotional stretch alone in every scenario", () => {
    // The audit's requirement in its own words: "Initialpromo unchanged in the
    // independent fixture." A stress on the post-promotional rate must not
    // move the instalment the borrower is paying today.
    const baseline = compareRateStress({ ...FIXTURE, shiftPoints: 0 });
    for (const points of RATE_STRESS_POINTS) {
      const stress = compareRateStress({ ...FIXTURE, shiftPoints: points });
      expect(stress).not.toBeNull();
      if (stress === null || baseline === null) return;
      expect(stress.selected.loan.firstPayment).toBe(
        baseline.selected.loan.firstPayment,
      );
      expect(stress.selected.loan.phases[0].annualRatePercent).toBe(7.5);
      expect(stress.selected.loan.phases[0].toMonth).toBe(12);
      expect(stress.selected.postPromoMonth).toBe(13);
    }
  });

  it("keeps the baseline available beside every scenario", () => {
    for (const points of RATE_STRESS_POINTS) {
      const stress = compareRateStress({ ...FIXTURE, shiftPoints: points });
      expect(stress).not.toBeNull();
      if (stress === null) return;
      // The reader's own post rate, on every selection.
      expect(stress.baseline.postRatePercent).toBe(11);
      near(
        stress.baseline.postPromoPayment,
        20_479_346.30254005,
        PAYMENT_TOLERANCE,
        `baseline payment at +${points}`,
      );
      expect(stress.baseline.shiftPoints).toBe(0);
    }
  });

  it("does not accumulate when the same preset is selected again", () => {
    // The mechanism that makes this true is that the baseline is rebuilt from
    // the inputs on every call, so there is no running total to grow. Calling
    // it repeatedly is the closest a pure test can get to clicking twice.
    const once = compareRateStress({ ...FIXTURE, shiftPoints: 2 });
    const twice = compareRateStress({ ...FIXTURE, shiftPoints: 2 });
    const thrice = compareRateStress({ ...FIXTURE, shiftPoints: 2 });
    for (const run of [twice, thrice]) {
      expect(run?.selected.postRatePercent).toBe(once?.selected.postRatePercent);
      expect(run?.selected.postPromoPayment).toBe(
        once?.selected.postPromoPayment,
      );
      expect(run?.interestIncrease).toBe(once?.interestIncrease);
    }
    // And returning to the baseline recovers the original figures exactly.
    const back = compareRateStress({ ...FIXTURE, shiftPoints: 0 });
    expect(back?.selected.postPromoPayment).toBe(
      once?.baseline.postPromoPayment,
    );
    expect(back?.selected.loan.totalInterest).toBe(
      once?.baseline.loan.totalInterest,
    );
  });

  it("reports the increase against the baseline, never against the last pick", () => {
    const zero = compareRateStress({ ...FIXTURE, shiftPoints: 0 });
    const one = compareRateStress({ ...FIXTURE, shiftPoints: 1 });
    const three = compareRateStress({ ...FIXTURE, shiftPoints: 3 });
    near(
      one?.paymentIncrease,
      21_807_309.445297126 - 20_479_346.30254005,
      PAYMENT_TOLERANCE,
      "+1 payment increase",
    );
    near(
      three?.paymentIncrease,
      24_554_087.003233567 - 20_479_346.30254005,
      PAYMENT_TOLERANCE,
      "+3 payment increase",
    );
    near(
      three?.interestIncrease,
      3_791_674_203.189686 - 2_862_633_323.4315634,
      TOTAL_TOLERANCE,
      "+3 interest increase",
    );
    expect(zero?.paymentIncrease).toBe(0);
    // Monotone in the shift, which is the property a reader relies on.
    expect(three?.paymentIncrease ?? 0).toBeGreaterThan(
      one?.paymentIncrease ?? 0,
    );
  });
});

describe("compareRateStress — the budget line comes from the reader only", () => {
  /**
   * The audit's fourth column, on a 21 triệu monthly budget the reader typed:
   *
   * | Shift | Budget minus payment |
   * |-------|----------------------|
   * | 0     | 520.653,697459951    |
   * | +1    | −807.309,445297126   |
   * | +2    | −2.166.369,535204627 |
   * | +3    | −3.554.087,003233567 |
   */
  const BUDGET = 21_000_000;

  it.each([
    [0, 520_653.697459951],
    [1, -807_309.445297126],
    [2, -2_166_369.535204627],
    [3, -3_554_087.003233567],
  ])("reports a signed gap at +%i point(s)", (points, gap) => {
    const stress = compareRateStress({
      ...FIXTURE,
      monthlyBudget: BUDGET,
      shiftPoints: points,
    });
    near(
      stress?.selected.budgetGap,
      gap,
      PAYMENT_TOLERANCE,
      `budget gap at +${points}`,
    );
    // Signed, not clamped: a negative gap IS the answer to whether the reader
    // can carry the scenario.
    expect((stress?.selected.budgetGap ?? 0) < 0).toBe(points > 0);
  });

  it("states no gap at all when no budget was supplied", () => {
    for (const points of RATE_STRESS_POINTS) {
      const stress = compareRateStress({ ...FIXTURE, shiftPoints: points });
      expect(stress?.selected.budgetGap, `+${points}`).toBeNull();
      expect(stress?.baseline.budgetGap, `+${points}`).toBeNull();
    }
  });

  it("does not treat an unusable budget as zero", () => {
    // `0` is a statement and stays a statement; NaN is not a budget.
    const zero = compareRateStress({
      ...FIXTURE,
      monthlyBudget: 0,
      shiftPoints: 0,
    });
    near(
      zero?.selected.budgetGap,
      -20_479_346.30254005,
      PAYMENT_TOLERANCE,
      "explicit zero budget",
    );
    const broken = compareRateStress({
      ...FIXTURE,
      monthlyBudget: Number.NaN,
      shiftPoints: 0,
    });
    expect(broken?.selected.budgetGap).toBeNull();
    const negative = compareRateStress({
      ...FIXTURE,
      monthlyBudget: -1,
      shiftPoints: 0,
    });
    expect(negative?.selected.budgetGap).toBeNull();
  });

  /**
   * The reset gap and the PEAK gap are different questions.
   *
   * The supervisor's stepped fixture: +1 point with a 0,5-point step every 12
   * months peaks at 29.707.822,440144584 ₫. At a 22 triệu budget the reset
   * fits by 192.690,554702874 ₫ and the peak misses by 7.707.822,440144584 ₫,
   * so a single "ngân sách trừ khoản trả" figure would have read as
   * scenario-wide headroom that does not exist.
   */
  it("separates the reset gap from the peak gap", () => {
    const stress = compareRateStress({
      ...FIXTURE,
      adjustEveryMonths: 12,
      adjustStepPoints: 0.5,
      monthlyBudget: 22_000_000,
      shiftPoints: 1,
    });
    expect(stress).not.toBeNull();
    if (stress === null) return;

    near(
      stress.selected.postPromoPayment,
      21_807_309.445297126,
      PAYMENT_TOLERANCE,
      "reset payment",
    );
    near(
      stress.selected.budgetGap,
      22_000_000 - 21_807_309.445297126,
      PAYMENT_TOLERANCE,
      "reset gap",
    );
    expect((stress.selected.budgetGap ?? -1) > 0).toBe(true);

    near(
      stress.selected.loan.highestPayment,
      29_707_822.440144584,
      PAYMENT_TOLERANCE,
      "peak payment",
    );
    near(
      stress.selected.budgetGapAtPeak,
      22_000_000 - 29_707_822.440144584,
      PAYMENT_TOLERANCE,
      "peak gap",
    );
    expect((stress.selected.budgetGapAtPeak ?? 1) < 0).toBe(true);

    // The peak is a LATER month than the reset, which is why one figure could
    // not answer both.
    expect(stress.selected.postPromoMonth).toBe(13);
    expect(stress.selected.peakMonth).toBeGreaterThan(13);
  });

  it("puts the peak at the reset when nothing steps afterwards", () => {
    // With no recurring step the post-promotional instalment IS the highest,
    // so the two gaps coincide and a page can drop the second row.
    const stress = compareRateStress({
      ...FIXTURE,
      monthlyBudget: 22_000_000,
      shiftPoints: 1,
    });
    expect(stress?.selected.peakMonth).toBe(13);
    expect(stress?.selected.peakMonth).toBe(stress?.selected.postPromoMonth);
    expect(stress?.selected.budgetGapAtPeak).toBe(stress?.selected.budgetGap);
  });

  it("states no peak gap without a budget", () => {
    const stress = compareRateStress({ ...FIXTURE, shiftPoints: 1 });
    expect(stress?.selected.budgetGapAtPeak).toBeNull();
    // The month is still reported: it does not depend on a budget.
    expect(stress?.selected.peakMonth).toBe(13);
  });

  it("keeps the baseline's own gap beside the scenario's", () => {
    const stress = compareRateStress({
      ...FIXTURE,
      monthlyBudget: BUDGET,
      shiftPoints: 3,
    });
    near(
      stress?.baseline.budgetGap,
      520_653.697459951,
      PAYMENT_TOLERANCE,
      "baseline gap under a +3 selection",
    );
  });
});

describe("compareRateStress — the reader's own settings are not dropped", () => {
  it("applies the recurring step on top of the shifted rate, once", () => {
    // The audit: "define interaction with existing recurringstep/cap; do not
    // drop active settings or doublecount." With a 0,5-point step every 12
    // months, a +2-point stress starts the post-promotional path at 13% and
    // the step still runs from there — it is not applied to the baseline rate
    // and it is not counted twice.
    const withStep = {
      ...FIXTURE,
      adjustEveryMonths: 12,
      adjustStepPoints: 0.5,
    };
    const baseline = compareRateStress({ ...withStep, shiftPoints: 0 });
    const stressed = compareRateStress({ ...withStep, shiftPoints: 2 });
    expect(baseline).not.toBeNull();
    expect(stressed).not.toBeNull();
    if (baseline === null || stressed === null) return;

    const rates = (comparison: typeof baseline) =>
      comparison.selected.loan.phases.map((phase) => phase.annualRatePercent);

    // The promo phase is untouched; every later phase is exactly 2 points up.
    const before = rates(baseline);
    const after = rates(stressed);
    expect(after.length).toBe(before.length);
    expect(after[0]).toBe(before[0]);
    for (let index = 1; index < before.length; index += 1) {
      near(after[index] - before[index], 2, 1e-9, `phase ${index} shift`);
    }
    // The step itself is still there, rising 0,5 a year from 13%.
    expect(after[1]).toBe(13);
    expect(after[2]).toBe(13.5);
    expect(stressed.selected.cappedByRateCap).toBe(false);
  });

  it("says when the reader's own cap absorbed the shift", () => {
    // A cap at 11,5% cannot be silently ignored, and it cannot silently make
    // the scenario look harmless either: the schedule runs at the cap and the
    // flag says the shift was cut short.
    const capped = compareRateStress({
      ...FIXTURE,
      rateCapPercent: 11.5,
      shiftPoints: 3,
    });
    expect(capped).not.toBeNull();
    if (capped === null) return;
    expect(capped.selected.requestedPostRatePercent).toBe(14);
    expect(capped.selected.postRatePercent).toBe(11.5);
    expect(capped.selected.cappedByRateCap).toBe(true);
    expect(capped.selected.loan.phases[1].annualRatePercent).toBe(11.5);

    // A cap above the shifted rate is not binding and does not claim to be.
    const loose = compareRateStress({
      ...FIXTURE,
      rateCapPercent: 20,
      shiftPoints: 3,
    });
    expect(loose?.selected.postRatePercent).toBe(14);
    expect(loose?.selected.cappedByRateCap).toBe(false);
  });

  it("stresses a loan with no promotional stretch from its first month", () => {
    const none = compareRateStress({
      ...FIXTURE,
      promoMonths: 0,
      shiftPoints: 2,
    });
    expect(none).not.toBeNull();
    if (none === null) return;
    // With no promo the post-promotional phase IS the first one.
    expect(none.selected.postPromoMonth).toBe(1);
    expect(none.selected.postRatePercent).toBe(13);
    expect(none.selected.postPromoPayment).toBe(none.selected.loan.firstPayment);
  });
});

describe("compareRateStress — refusals", () => {
  it("refuses a shift that is not a usable number", () => {
    for (const shiftPoints of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        compareRateStress({ ...FIXTURE, shiftPoints }),
        String(shiftPoints),
      ).toBeNull();
    }
  });

  it("refuses inputs that cannot describe a schedule, on either side", () => {
    expect(
      compareRateStress({ ...FIXTURE, amount: 0, shiftPoints: 1 }),
    ).toBeNull();
    expect(
      compareRateStress({ ...FIXTURE, termMonths: 12, shiftPoints: 1 }),
    ).toBeNull();
    expect(
      compareRateStress({ ...FIXTURE, promoMonths: 240, shiftPoints: 1 }),
    ).toBeNull();
    expect(
      compareRateStress({ ...FIXTURE, postRatePercent: -1, shiftPoints: 1 }),
    ).toBeNull();
  });

  it("handles a zero-rate loan without dividing by zero", () => {
    const zero = compareRateStress({
      amount: 2_000_000_000,
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 0,
      postRatePercent: 0,
      shiftPoints: 0,
    });
    expect(zero).not.toBeNull();
    if (zero === null) return;
    near(
      zero.selected.loan.firstPayment,
      2_000_000_000 / 240,
      PAYMENT_TOLERANCE,
      "zero-rate payment",
    );
    expect(zero.selected.loan.totalInterest).toBe(0);
    // And a shift off a zero rate is an ordinary scenario, not a special case.
    const shifted = compareRateStress({
      amount: 2_000_000_000,
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 0,
      postRatePercent: 0,
      shiftPoints: 3,
    });
    expect(shifted?.selected.postRatePercent).toBe(3);
    expect((shifted?.interestIncrease ?? 0) > 0).toBe(true);
  });

  it("keeps the ledger identity in every scenario", () => {
    // docs §4: total payments minus total interest is the principal, and the
    // final balance is exactly 0.
    for (const points of RATE_STRESS_POINTS) {
      const stress = compareRateStress({ ...FIXTURE, shiftPoints: points });
      expect(stress).not.toBeNull();
      if (stress === null) return;
      const loan = stress.selected.loan;
      near(
        loan.totalPaid - loan.totalInterest,
        FIXTURE.amount,
        1e-3,
        `principal identity at +${points}`,
      );
      expect(loan.schedule[loan.schedule.length - 1].balance).toBe(0);
      for (const row of loan.schedule) {
        near(
          row.interest + row.principal,
          row.payment,
          PAYMENT_TOLERANCE,
          `row ${row.period} at +${points}`,
        );
      }
    }
  });
});

/**
 * The supported horizon, enforced BEFORE a schedule is allocated.
 *
 * `buildPhases` used to accept any positive integer term and its step loop
 * pushed one phase per review cycle with no ceiling, while
 * `computeFloatingLoan` looped once per month with no bound on the summed
 * duration — so a typed ten-million-month term built ten million rows before
 * anything could sample them. `compareRateStress` calls both twice.
 *
 * These are PURE tests on purpose: the bound is a property of the module, a
 * refusal is cheap to assert here, and a huge-input browser experiment is
 * explicitly not to be run.
 */
describe("the phase engine is bounded before it allocates", () => {
  it("states one horizon, the same as the rest of the suite", () => {
    expect(MAX_FLOATING_MONTHS).toBe(1200);
  });

  it("builds a schedule at exactly the horizon and refuses one past it", () => {
    const at = buildPhases({
      termMonths: MAX_FLOATING_MONTHS,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    });
    expect(at).not.toBeNull();
    expect(at?.reduce((sum, phase) => sum + phase.months, 0)).toBe(
      MAX_FLOATING_MONTHS,
    );

    expect(
      buildPhases({
        termMonths: MAX_FLOATING_MONTHS + 1,
        promoMonths: 12,
        promoRatePercent: 7.5,
        postRatePercent: 11,
      }),
    ).toBeNull();
  });

  it("refuses a review cycle past the horizon", () => {
    expect(
      buildPhases({
        termMonths: 240,
        promoMonths: 12,
        promoRatePercent: 7.5,
        postRatePercent: 11,
        adjustEveryMonths: MAX_FLOATING_MONTHS + 1,
        adjustStepPoints: 0.5,
      }),
    ).toBeNull();
  });

  it("refuses a step large enough to overflow the rate", () => {
    expect(
      buildPhases({
        termMonths: 240,
        promoMonths: 12,
        promoRatePercent: 7.5,
        postRatePercent: 11,
        adjustEveryMonths: 12,
        adjustStepPoints: 1e308,
      }),
    ).toBeNull();
  });

  it("refuses a phase list whose duration exceeds the horizon", () => {
    // Reached directly, because the bound belongs to the ENGINE and not only
    // to `buildPhases`: the loan comparison and the education visuals build
    // phase lists of their own.
    expect(
      computeFloatingLoan({
        amount: 2_000_000_000,
        phases: [{ months: MAX_FLOATING_MONTHS, annualRatePercent: 8.5 }],
      }),
    ).not.toBeNull();
    expect(
      computeFloatingLoan({
        amount: 2_000_000_000,
        phases: [{ months: MAX_FLOATING_MONTHS + 1, annualRatePercent: 8.5 }],
      }),
    ).toBeNull();
    // And the SUM is what counts, not any single phase.
    expect(
      computeFloatingLoan({
        amount: 2_000_000_000,
        phases: [
          { months: 600, annualRatePercent: 7.5 },
          { months: 601, annualRatePercent: 11 },
        ],
      }),
    ).toBeNull();
  });

  it("refuses a rate that accrues its way to a non-finite total", () => {
    // Finite inputs do not prove finite outputs.
    expect(
      computeFloatingLoan({
        amount: 2_000_000_000,
        phases: [{ months: 240, annualRatePercent: 1e308 }],
      }),
    ).toBeNull();
  });

  it("bounds both sides of a stress comparison", () => {
    expect(
      compareRateStress({
        ...FIXTURE,
        termMonths: MAX_FLOATING_MONTHS + 1,
        shiftPoints: 0,
      }),
    ).toBeNull();
    // And still works at the boundary, with the promotion intact.
    const at = compareRateStress({
      ...FIXTURE,
      termMonths: MAX_FLOATING_MONTHS,
      shiftPoints: 2,
    });
    expect(at).not.toBeNull();
    expect(at?.selected.loan.months).toBe(MAX_FLOATING_MONTHS);
    expect(at?.selected.postPromoMonth).toBe(13);
    expect(at?.selected.postRatePercent).toBe(13);
  });

  it("keeps a zero-month promotion valid at the boundary", () => {
    // The audit is explicit that `promoMonths: 0` must stay legitimate.
    const none = compareRateStress({
      ...FIXTURE,
      promoMonths: 0,
      termMonths: MAX_FLOATING_MONTHS,
      shiftPoints: 0,
    });
    expect(none).not.toBeNull();
    expect(none?.selected.loan.phases.length).toBe(1);
    expect(none?.selected.postPromoMonth).toBe(1);
  });
});
