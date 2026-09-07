import { describe, it, expect } from "vitest";
import {
  buildPhases,
  compareFixedFloating,
  computeFloatingLoan,
  type LoanPhase,
} from "@/lib/calc/floating-loan";
import { computeLoan } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

const AMOUNT = 2_000_000_000;

// 12 months at a 7,5% promo rate, then 228 months at 11%.
const PHASES: LoanPhase[] = [
  { months: 12, annualRatePercent: 7.5 },
  { months: 228, annualRatePercent: 11 },
];

function floating(phases: readonly LoanPhase[], amount = AMOUNT) {
  const result = computeFloatingLoan({ amount, phases });
  expect(result).not.toBeNull();
  return result!;
}

describe("computeFloatingLoan — a single phase is a plain loan", () => {
  it("matches computeLoan exactly", () => {
    const single = floating([{ months: 240, annualRatePercent: 8.5 }]);
    const plain = computeLoan({
      amount: AMOUNT,
      annualRatePercent: 8.5,
      termMonths: 240,
    })!;
    expect(single.firstPayment).toBeCloseTo(
      plain.monthlyPrincipalInterest,
      6,
    );
    expect(single.totalInterest).toBeCloseTo(plain.totalInterest, 2);
    expect(single.months).toBe(240);
  });

  it("has no payment shock", () => {
    const single = floating([{ months: 240, annualRatePercent: 8.5 }]);
    expect(single.paymentShock).toBeCloseTo(0, 8);
    expect(single.paymentShockPercent).toBeCloseTo(0, 8);
  });
});

describe("computeFloatingLoan — the schedule", () => {
  it("clears the balance to exactly zero", () => {
    const result = floating(PHASES);
    expect(result.months).toBe(240);
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
  });

  it("keeps interest + principal === payment on every row", () => {
    for (const row of floating(PHASES).schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("keeps the loan identity", () => {
    const result = floating(PHASES);
    expect(result.totalPaid - result.totalInterest).toBeCloseTo(AMOUNT, 2);
  });

  it("prices the first phase on the full amount over the full term", () => {
    const result = floating(PHASES);
    expect(result.firstPayment).toBeCloseTo(
      Math.abs(pmt(7.5 / 100 / 12, 240, AMOUNT)),
      6,
    );
  });

  it("recalculates the instalment on the REMAINING balance and term", () => {
    // The mechanic the whole module exists for.
    const result = floating(PHASES);
    const balanceAtReset = result.phases[0].balance;
    expect(result.phases[1].payment).toBeCloseTo(
      Math.abs(pmt(11 / 100 / 12, 228, balanceAtReset)),
      6,
    );
    // Not the naive version — the full amount over the full term.
    expect(result.phases[1].payment).not.toBeCloseTo(
      Math.abs(pmt(11 / 100 / 12, 240, AMOUNT)),
      0,
    );
  });

  it("summarises each phase over the right month range", () => {
    const result = floating(PHASES);
    expect(result.phases).toHaveLength(2);
    expect(result.phases[0].fromMonth).toBe(1);
    expect(result.phases[0].toMonth).toBe(12);
    expect(result.phases[1].fromMonth).toBe(13);
    expect(result.phases[1].toMonth).toBe(240);
    for (const phase of result.phases) {
      const rows = result.schedule.slice(phase.fromMonth - 1, phase.toMonth);
      expect(phase.interest).toBeCloseTo(
        rows.reduce((sum, row) => sum + row.interest, 0),
        6,
      );
      expect(phase.principal).toBeCloseTo(
        rows.reduce((sum, row) => sum + row.principal, 0),
        6,
      );
    }
  });
});

describe("computeFloatingLoan — the payment shock", () => {
  it("measures the jump from the promotional instalment", () => {
    const result = floating(PHASES);
    expect(result.paymentShock).toBeCloseTo(
      result.highestPayment - result.firstPayment,
      8,
    );
    expect(result.paymentShock).toBeGreaterThan(0);
    expect(result.paymentShockPercent).toBeGreaterThan(15);
  });

  it("grows with the size of the rate step", () => {
    const small = floating([
      { months: 12, annualRatePercent: 7.5 },
      { months: 228, annualRatePercent: 9 },
    ]).paymentShockPercent;
    const large = floating([
      { months: 12, annualRatePercent: 7.5 },
      { months: 228, annualRatePercent: 14 },
    ]).paymentShockPercent;
    expect(large).toBeGreaterThan(small);
  });

  it("is smaller for a reset that happens later in the term", () => {
    // Less balance left, but also less time to spread it over — the second
    // effect wins early and the first wins late.
    const early = floating([
      { months: 12, annualRatePercent: 7.5 },
      { months: 228, annualRatePercent: 11 },
    ]).paymentShockPercent;
    const late = floating([
      { months: 180, annualRatePercent: 7.5 },
      { months: 60, annualRatePercent: 11 },
    ]).paymentShockPercent;
    expect(late).toBeLessThan(early);
  });

  it("handles a rate that falls", () => {
    const result = floating([
      { months: 12, annualRatePercent: 11 },
      { months: 228, annualRatePercent: 7.5 },
    ]);
    expect(result.paymentShock).toBeCloseTo(0, 8);
    expect(result.lowestPayment).toBeLessThan(result.firstPayment);
  });
});

describe("buildPhases", () => {
  it("builds a promo phase and a flat tail", () => {
    const phases = buildPhases({
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    })!;
    expect(phases).toEqual([
      { months: 12, annualRatePercent: 7.5 },
      { months: 228, annualRatePercent: 11 },
    ]);
  });

  it("omits the promo phase when it is zero months", () => {
    const phases = buildPhases({
      termMonths: 240,
      promoMonths: 0,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    })!;
    expect(phases).toEqual([{ months: 240, annualRatePercent: 11 }]);
  });

  it("steps the rate up on the review cycle", () => {
    const phases = buildPhases({
      termMonths: 60,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      adjustEveryMonths: 12,
      adjustStepPoints: 0.5,
    })!;
    expect(phases.map((phase) => phase.annualRatePercent)).toEqual([
      7.5, 11, 11.5, 12, 12.5,
    ]);
    expect(phases.map((phase) => phase.months)).toEqual([12, 12, 12, 12, 12]);
  });

  it("caps the rate and holds it there", () => {
    const phases = buildPhases({
      termMonths: 84,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      adjustEveryMonths: 12,
      adjustStepPoints: 1,
      rateCapPercent: 12.5,
    })!;
    expect(phases.map((phase) => phase.annualRatePercent)).toEqual([
      7.5, 11, 12, 12.5, 12.5, 12.5, 12.5,
    ]);
  });

  it("lets the last window absorb the leftover months", () => {
    const phases = buildPhases({
      termMonths: 40,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      adjustEveryMonths: 12,
      adjustStepPoints: 0.5,
    })!;
    expect(phases.map((phase) => phase.months)).toEqual([12, 12, 12, 4]);
    // And the months still sum to the term.
    expect(
      phases.reduce((sum, phase) => sum + phase.months, 0),
    ).toBe(40);
  });

  it("always produces phases that sum to the term", () => {
    for (const termMonths of [24, 60, 121, 240, 361]) {
      for (const promoMonths of [0, 6, 18]) {
        const phases = buildPhases({
          termMonths,
          promoMonths,
          promoRatePercent: 7.5,
          postRatePercent: 11,
          adjustEveryMonths: 12,
          adjustStepPoints: 0.5,
        })!;
        expect(
          phases.reduce((sum, phase) => sum + phase.months, 0),
        ).toBe(termMonths);
      }
    }
  });

  it("returns null rather than a guess", () => {
    const good = {
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
    };
    expect(buildPhases({ ...good, termMonths: 0 })).toBeNull();
    expect(buildPhases({ ...good, termMonths: 240.5 })).toBeNull();
    expect(buildPhases({ ...good, promoMonths: 240 })).toBeNull();
    expect(buildPhases({ ...good, promoMonths: 300 })).toBeNull();
    expect(buildPhases({ ...good, promoMonths: 12.5 })).toBeNull();
    expect(buildPhases({ ...good, postRatePercent: -1 })).toBeNull();
    expect(buildPhases({ ...good, adjustEveryMonths: 0 })).toBeNull();
    expect(buildPhases({ ...good, adjustStepPoints: -1 })).toBeNull();
    expect(buildPhases({ ...good, rateCapPercent: -1 })).toBeNull();
  });
});

describe("compareFixedFloating", () => {
  function compare(fixedRatePercent: number) {
    const result = compareFixedFloating({
      amount: AMOUNT,
      phases: PHASES,
      fixedRatePercent,
    });
    expect(result).not.toBeNull();
    return result!;
  }

  it("prices the fixed side with computeLoan", () => {
    const result = compare(9.5);
    const plain = computeLoan({
      amount: AMOUNT,
      annualRatePercent: 9.5,
      termMonths: 240,
    })!;
    expect(result.fixedPayment).toBeCloseTo(
      plain.monthlyPrincipalInterest,
      6,
    );
    expect(result.fixedTotalInterest).toBeCloseTo(plain.totalInterest, 2);
  });

  it("favours the fixed rate when it is well below the floating path", () => {
    const result = compare(8);
    expect(result.floatingWins).toBe(false);
    expect(result.interestSaving).toBeLessThan(0);
  });

  it("favours the floating path when the fixed rate is high", () => {
    const result = compare(13);
    expect(result.floatingWins).toBe(true);
    expect(result.interestSaving).toBeGreaterThan(0);
  });

  it("finds a break-even fixed rate that really is level", () => {
    const result = compare(9.5);
    const breakEven = result.breakEvenFixedRatePercent!;
    const atBreakEven = compare(breakEven);
    expect(atBreakEven.interestSaving).toBeCloseTo(0, 2);
    // …and it sits between the promo rate and the post-promo rate.
    expect(breakEven).toBeGreaterThan(7.5);
    expect(breakEven).toBeLessThan(11);
  });

  it("flips the verdict exactly at the break-even rate", () => {
    const breakEven = compare(9.5).breakEvenFixedRatePercent!;
    expect(compare(breakEven - 0.2).floatingWins).toBe(false);
    expect(compare(breakEven + 0.2).floatingWins).toBe(true);
  });

  it("returns null rather than a guess", () => {
    expect(
      compareFixedFloating({
        amount: AMOUNT,
        phases: PHASES,
        fixedRatePercent: -1,
      }),
    ).toBeNull();
    expect(
      compareFixedFloating({
        amount: 0,
        phases: PHASES,
        fixedRatePercent: 9.5,
      }),
    ).toBeNull();
    expect(
      compareFixedFloating({
        amount: AMOUNT,
        phases: [],
        fixedRatePercent: 9.5,
      }),
    ).toBeNull();
  });
});

describe("computeFloatingLoan — realistic terms and rejection", () => {
  it("survives 240, 300 and 360-month terms", () => {
    for (const tail of [228, 288, 348]) {
      const result = floating([
        { months: 12, annualRatePercent: 7.5 },
        { months: tail, annualRatePercent: 11 },
      ]);
      expect(result.months).toBe(12 + tail);
      expect(result.schedule[result.months - 1].balance).toBe(0);
    }
  });

  it("returns null rather than a guess", () => {
    expect(computeFloatingLoan({ amount: 0, phases: PHASES })).toBeNull();
    expect(computeFloatingLoan({ amount: -1, phases: PHASES })).toBeNull();
    expect(computeFloatingLoan({ amount: AMOUNT, phases: [] })).toBeNull();
    expect(
      computeFloatingLoan({
        amount: AMOUNT,
        phases: [{ months: 0, annualRatePercent: 9 }],
      }),
    ).toBeNull();
    expect(
      computeFloatingLoan({
        amount: AMOUNT,
        phases: [{ months: 12.5, annualRatePercent: 9 }],
      }),
    ).toBeNull();
    expect(
      computeFloatingLoan({
        amount: AMOUNT,
        phases: [{ months: 12, annualRatePercent: -1 }],
      }),
    ).toBeNull();
    expect(
      computeFloatingLoan({ amount: Number.NaN, phases: PHASES }),
    ).toBeNull();
  });
});
