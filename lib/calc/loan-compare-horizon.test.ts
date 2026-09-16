/**
 * The loan comparison over a COMMON HOLDING HORIZON, with per-offer
 * promotional paths and fees.
 *
 * The original plan row this closes: the old model priced every offer as one
 * constant rate held to maturity, which is not what a Vietnamese mortgage
 * offer is and not how long a buyer holds one. Cross-linking to the
 * floating-rate tool and disclosing the exclusion did not answer it.
 *
 * `recurrence()` below amortizes a phased loan month by month from the annuity
 * formula, importing nothing from `finance.ts`, `loan.ts`, `floating-loan.ts`
 * or the module under test — so the horizon figures are checked against an
 * independent engine rather than against themselves.
 *
 * Rate paths here are hypotheses. Nothing in this file is a bank offer, a
 * forecast or a statutory APR disclosure.
 */
import { describe, expect, it } from "vitest";
import {
  MAX_COMPARE_MONTHS,
  compareLoans,
  type LoanOption,
} from "@/lib/calc/loan-compare";

/** Level end-of-month annuity payment. */
function payment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

/**
 * Amortize `amount` through a promotional stretch and then the post rate,
 * recalculating the instalment at the reset on what is left over what is left.
 */
function recurrence(
  amount: number,
  promoMonths: number,
  promoPercent: number,
  postPercent: number,
  termMonths: number,
): { interest: number; paid: number; principal: number; balance: number }[] {
  const rows: {
    interest: number;
    paid: number;
    principal: number;
    balance: number;
  }[] = [];
  let balance = amount;
  let instalment = payment(
    amount,
    (promoMonths > 0 ? promoPercent : postPercent) / 100 / 12,
    termMonths,
  );
  for (let month = 1; month <= termMonths; month += 1) {
    if (month === promoMonths + 1 && promoMonths > 0) {
      instalment = payment(balance, postPercent / 100 / 12, termMonths - promoMonths);
    }
    const monthlyRate =
      (month <= promoMonths ? promoPercent : postPercent) / 100 / 12;
    const interest = balance * monthlyRate;
    let principal = instalment - interest;
    if (month === termMonths || principal > balance) principal = balance;
    balance -= principal;
    rows.push({ interest, paid: interest + principal, principal, balance });
  }
  return rows;
}

const AMOUNT = 2_000_000_000;

/** A promo offer and a flat offer that disagree depending on the horizon. */
const PROMO: LoanOption = {
  annualRatePercent: 11,
  termMonths: 240,
  promoMonths: 24,
  promoRatePercent: 6.5,
};
const FLAT: LoanOption = { annualRatePercent: 9, termMonths: 240 };

/** A đồng is the smallest circulating unit; a hundredth of one is slack. */
const DONG_SLACK = 0.01;

describe("the horizon default keeps existing callers' figures", () => {
  it("defaults to the longest term, where horizon measures equal full-term ones", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 9.2, termMonths: 300 },
      ],
    })!;
    expect(result.horizonIsDefault).toBe(true);
    expect(result.horizonMonths).toBe(300);
    for (const row of result.rows) {
      expect(row!.horizonCost).toBeCloseTo(row!.costOfBorrowing, 6);
      expect(row!.horizonBalance).toBe(0);
      expect(row!.horizonInterest).toBeCloseTo(row!.totalInterest, 6);
      expect(row!.extraVsBest).toBeCloseTo(row!.extraVsBestFullTerm, 6);
    }
    expect(result.bestIndex).toBe(result.bestFullTermIndex);
    expect(result.horizonChangesWinner).toBe(false);
    expect(result.spread).toBeCloseTo(result.fullTermSpread, 6);
  });

  it("leaves an option with no promotional fields on the plain engine", () => {
    // Not the phased engine with a single phase: the two round the final
    // instalment differently and existing figures must not move.
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 9.2, termMonths: 240 },
      ],
    })!;
    expect(result.rows[0]!.phases).toBeNull();
    expect(result.rows[0]!.resetMonth).toBeNull();
    expect(result.rows[0]!.resetPayment).toBeCloseTo(
      result.rows[0]!.monthlyPayment,
      6,
    );
  });
});

describe("the ledger identity at every horizon", () => {
  it("holds for both offers at horizons before, at and after the reset", () => {
    for (const horizonMonths of [0, 1, 12, 24, 25, 60, 120, 240]) {
      const result = compareLoans({
        amount: AMOUNT,
        options: [PROMO, FLAT],
        horizonMonths,
      })!;
      for (const row of result.rows) {
        const label = `H=${horizonMonths} #${row!.index}`;
        // horizonCost = horizonInterest + fees, and equivalently
        // horizonPaid + horizonBalance − amount + fees. An offer that merely
        // defers principal cannot look cheap under either form.
        expect(row!.horizonCost, label).toBeCloseTo(
          row!.horizonInterest + row!.upfrontFee,
          6,
        );
        expect(
          Math.abs(
            row!.horizonCost -
              (row!.horizonPaid + row!.horizonBalance - AMOUNT + row!.upfrontFee),
          ),
          label,
        ).toBeLessThan(DONG_SLACK);
        expect(
          Math.abs(row!.horizonPaid - row!.horizonInterest - row!.horizonPrincipal),
          label,
        ).toBeLessThan(DONG_SLACK);
        expect(
          Math.abs(row!.horizonPrincipal - (AMOUNT - row!.horizonBalance)),
          label,
        ).toBeLessThan(DONG_SLACK);
      }
    }
  });

  it("owes the whole principal and only the fees at H=0", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { ...PROMO, feePercent: 1 },
        { ...FLAT, upfrontFee: 5_000_000 },
      ],
      horizonMonths: 0,
    })!;
    expect(result.rows[0]!.horizonPaid).toBe(0);
    expect(result.rows[0]!.horizonBalance).toBe(AMOUNT);
    expect(result.rows[0]!.horizonCost).toBeCloseTo(20_000_000, 6);
    expect(result.rows[1]!.horizonCost).toBeCloseTo(5_000_000, 6);
    // Zero fees at H=0 mean equality, not a promise of later savings.
    const free = compareLoans({
      amount: AMOUNT,
      options: [PROMO, FLAT],
      horizonMonths: 0,
    })!;
    expect(free.rows[0]!.horizonCost).toBe(0);
    expect(free.rows[1]!.horizonCost).toBe(0);
    expect(free.spread).toBe(0);
  });
});

describe("a promotional path, against the independent recurrence", () => {
  const rows = recurrence(AMOUNT, 24, 6.5, 11, 240);

  it("matches the first instalment and the reset instalment", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [PROMO, FLAT],
      horizonMonths: 60,
    })!;
    const promo = result.rows[0]!;
    expect(promo.phases).not.toBeNull();
    expect(promo.resetMonth).toBe(25);
    expect(Math.abs(promo.monthlyPayment - rows[0].paid)).toBeLessThan(1);
    expect(Math.abs(promo.resetPayment - rows[24].paid)).toBeLessThan(1);
    // The instalment RISES at the reset, which is the point of the offer.
    expect(promo.resetPayment).toBeGreaterThan(promo.monthlyPayment);
  });

  it("matches the horizon interest and balance at each horizon", () => {
    for (const horizonMonths of [12, 24, 25, 36, 60, 240]) {
      const result = compareLoans({
        amount: AMOUNT,
        options: [PROMO, FLAT],
        horizonMonths,
      })!;
      const promo = result.rows[0]!;
      const expectedInterest = rows
        .slice(0, horizonMonths)
        .reduce((sum, row) => sum + row.interest, 0);
      const expectedBalance = rows[horizonMonths - 1].balance;
      expect(
        Math.abs(promo.horizonInterest - expectedInterest),
        String(horizonMonths),
      ).toBeLessThan(1);
      expect(
        Math.abs(promo.horizonBalance - expectedBalance),
        String(horizonMonths),
      ).toBeLessThan(1);
    }
  });

  it("REJECTS a promo as long as the term rather than downgrading it", () => {
    // The review's primary finding. This used to fall back to a constant
    // post-promotional loan and rank it — pricing a contract the reader never
    // described. Fewer than two priceable offers now means no comparison at
    // all, which is the honest outcome.
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [
          { annualRatePercent: 9, termMonths: 240, promoMonths: 240, promoRatePercent: 6 },
          FLAT,
        ],
      }),
    ).toBeNull();

    // With a third valid offer the comparison survives, and the malformed
    // one is NAMED rather than silently repaired.
    const withThird = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 9, termMonths: 240, promoMonths: 240, promoRatePercent: 6 },
        FLAT,
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
    })!;
    expect(withThird.rows[0]).toBeNull();
    expect(withThird.unusableIndexes).toEqual([0]);
    expect([1, 2]).toContain(withThird.bestIndex);
  });

  it("rejects a promotional duration with no rate, and a rate with no duration", () => {
    for (const option of [
      { annualRatePercent: 11, termMonths: 240, promoMonths: 12 },
      { annualRatePercent: 11, termMonths: 240, promoRatePercent: 6.5 },
    ] as LoanOption[]) {
      const result = compareLoans({
        amount: AMOUNT,
        options: [option, FLAT, { annualRatePercent: 8.5, termMonths: 240 }],
      })!;
      expect(result.rows[0], JSON.stringify(option)).toBeNull();
      expect(result.unusableIndexes, JSON.stringify(option)).toEqual([0]);
    }
  });

  it("still prices an offer with no promotional fields at all", () => {
    // `promoMonths: 0` and no rate is the ABSENCE of a promotion, not half of
    // one, and stays a plain constant-rate loan.
    const result = compareLoans({
      amount: AMOUNT,
      options: [{ annualRatePercent: 9, termMonths: 240, promoMonths: 0 }, FLAT],
    })!;
    expect(result.rows[0]).not.toBeNull();
    expect(result.rows[0]!.phases).toBeNull();
    expect(result.rows[0]!.costOfBorrowing).toBeCloseTo(
      result.rows[1]!.costOfBorrowing,
      6,
    );
  });
});

describe("an early-settlement penalty is charged at the horizon", () => {
  it("adds it to the horizon cost, and only when a balance remains", () => {
    const withFee = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, exitFee: 40_000_000 },
        FLAT,
      ],
      horizonMonths: 60,
    })!;
    expect(withFee.rows[0]!.exitFeeAtHorizon).toBe(40_000_000);
    expect(withFee.rows[0]!.horizonCost).toBeCloseTo(
      withFee.rows[0]!.horizonInterest + 40_000_000,
      6,
    );
    // Not in the full-term measure: a loan held to maturity is never settled
    // early, so `costOfBorrowing` cannot carry it.
    expect(withFee.rows[0]!.costOfBorrowing).toBeCloseTo(
      withFee.rows[0]!.totalInterest,
      6,
    );

    const atMaturity = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, exitFee: 40_000_000 },
        FLAT,
      ],
      horizonMonths: 240,
    })!;
    expect(atMaturity.rows[0]!.horizonBalance).toBe(0);
    expect(atMaturity.rows[0]!.exitFeeAtHorizon).toBe(0);
    expect(atMaturity.rows[0]!.horizonCost).toBeCloseTo(
      atMaturity.rows[0]!.costOfBorrowing,
      6,
    );
  });

  it("prices it at the horizon, NOT at origination", () => {
    // The fee-timing repair. The same 40 triệu as an upfront fee costs more
    // in APR terms than as a month-60 settlement fee, because money paid on
    // day one is surrendered for the whole horizon.
    const asExit = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, exitFee: 40_000_000 },
        FLAT,
      ],
      horizonMonths: 60,
    })!;
    const asUpfront = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, upfrontFee: 40_000_000 },
        FLAT,
      ],
      horizonMonths: 60,
    })!;
    // Same đồng of cost at the horizon...
    expect(asExit.rows[0]!.horizonCost).toBeCloseTo(
      asUpfront.rows[0]!.horizonCost,
      6,
    );
    // ...and a DIFFERENT rate, because the dates differ. Treating the exit
    // fee as an origination fee overstated the APR.
    expect(asExit.rows[0]!.horizonAprPercent!).toBeLessThan(
      asUpfront.rows[0]!.horizonAprPercent!,
    );
    // The upfront fee also moves the full-term APR; the exit fee cannot.
    expect(asExit.rows[0]!.aprPercent!).toBeCloseTo(8.5, 5);
    expect(asUpfront.rows[0]!.aprPercent!).toBeGreaterThan(8.5);
  });

  it("refuses a negative settlement fee", () => {
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [
          { annualRatePercent: 8.5, termMonths: 240, exitFee: -1 },
          FLAT,
        ],
      }),
    ).toBeNull();
  });
});

describe("the horizon can change the winner", () => {
  it("ranks the promotional offer first early and the flat one later", () => {
    // The lesson the tool exists for: a cheap 24-month promotional stretch
    // wins at a short horizon and loses over the term.
    const early = compareLoans({
      amount: AMOUNT,
      options: [PROMO, FLAT],
      horizonMonths: 24,
    })!;
    expect(early.bestIndex).toBe(0);

    const full = compareLoans({
      amount: AMOUNT,
      options: [PROMO, FLAT],
      horizonMonths: 240,
    })!;
    expect(full.bestIndex).toBe(1);
    expect(full.bestFullTermIndex).toBe(1);

    // And at a horizon where they disagree, the model says so rather than
    // quietly reporting one winner.
    let flagged = false;
    for (let horizon = 1; horizon <= 240; horizon += 1) {
      const result = compareLoans({
        amount: AMOUNT,
        options: [PROMO, FLAT],
        horizonMonths: horizon,
      })!;
      if (result.horizonChangesWinner) {
        expect(result.bestIndex).not.toBe(result.bestFullTermIndex);
        flagged = true;
        break;
      }
    }
    expect(flagged).toBe(true);
  });

  it("does not rank on the instalment", () => {
    // A longer term has a smaller instalment and costs more. Ranking on cash
    // flow would call it the winner.
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 8.5, termMonths: 300 },
      ],
      horizonMonths: 300,
    })!;
    expect(result.rows[1]!.monthlyPayment).toBeLessThan(
      result.rows[0]!.monthlyPayment,
    );
    expect(result.bestIndex).toBe(0);
  });

  it("separates a fee from a rate on equal offers", () => {
    // Acceptance scenario 5: same principal, rate and term, 1% fee vs none —
    // equal instalment, 20 triệu of difference.
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, feePercent: 1 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
    })!;
    expect(result.rows[0]!.monthlyPayment).toBeCloseTo(
      result.rows[1]!.monthlyPayment,
      6,
    );
    expect(result.rows[0]!.upfrontFee).toBe(20_000_000);
    expect(result.spread).toBeCloseTo(20_000_000, 6);
    expect(result.bestIndex).toBe(1);
  });

  it("adds a percent fee and a one-off fee without double counting", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, feePercent: 1, upfrontFee: 5_000_000 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
    })!;
    expect(result.rows[0]!.upfrontFee).toBe(25_000_000);
    expect(result.rows[0]!.costOfBorrowing).toBeCloseTo(
      result.rows[0]!.totalInterest + 25_000_000,
      6,
    );
  });
});

describe("the modelled APR", () => {
  it("returns the contract rate with no fees and lifts it with one", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: 8.5, termMonths: 240, upfrontFee: 30_000_000 },
      ],
    })!;
    expect(result.rows[0]!.aprPercent!).toBeCloseTo(8.5, 5);
    // The supervisor's fixture for 30 triệu paid in cash.
    expect(Math.abs(result.rows[1]!.aprPercent! - 8.7080971464)).toBeLessThan(1e-5);
    // Effective annual is a DIFFERENT number and is reported as its own field.
    expect(Math.abs(result.rows[0]!.aprEffectivePercent! - 8.8390905893)).toBeLessThan(
      1e-5,
    );
    expect(result.rows[0]!.aprEffectivePercent!).toBeGreaterThan(
      result.rows[0]!.aprPercent!,
    );
  });

  it("prices settlement at the horizon higher than running to term", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, upfrontFee: 30_000_000 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
      horizonMonths: 60,
    })!;
    expect(Math.abs(result.rows[0]!.horizonAprPercent! - 8.8922737652)).toBeLessThan(
      1e-5,
    );
    expect(result.rows[0]!.horizonAprPercent!).toBeGreaterThan(
      result.rows[0]!.aprPercent!,
    );
    // With no fee the horizon makes no difference to the rate.
    expect(result.rows[1]!.horizonAprPercent!).toBeCloseTo(8.5, 5);
  });

  it("returns 0 for a 0% offer and stays finite", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 0, termMonths: 240 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
      horizonMonths: 60,
    })!;
    expect(result.rows[0]!.aprPercent!).toBeCloseTo(0, 6);
    expect(result.rows[0]!.horizonAprPercent!).toBeCloseTo(0, 6);
    expect(result.rows[0]!.horizonBalance).toBeCloseTo(1_500_000_000, 4);
    expect(result.rows[0]!.totalInterest).toBeCloseTo(0, 6);
  });

  it("declines an APR rather than guessing when the fee eats the proceeds", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, upfrontFee: AMOUNT },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
    })!;
    expect(result.rows[0]!.aprPercent).toBeNull();
    expect(result.rows[0]!.aprEffectivePercent).toBeNull();
    expect(result.rows[0]!.horizonAprPercent).toBeNull();
    // The rest of the row is still real and still shown.
    expect(result.rows[0]!.upfrontFee).toBe(AMOUNT);
    expect(result.rows[0]!.costOfBorrowing).toBeGreaterThan(AMOUNT);
  });
});

describe("alignment, refusal and recovery", () => {
  it("names the positions it could not price instead of compacting", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 240 },
        { annualRatePercent: -1, termMonths: 240 },
        { annualRatePercent: 9.2, termMonths: 240 },
      ],
      horizonMonths: 60,
    })!;
    expect(result.rows[1]).toBeNull();
    expect(result.unusableIndexes).toEqual([1]);
    // Positions are preserved, so a winner is never reported against a
    // different set of columns than the one on screen.
    expect(result.rows[0]!.index).toBe(0);
    expect(result.rows[2]!.index).toBe(2);
    expect([0, 2]).toContain(result.bestIndex);
  });

  it("refuses an out-of-range horizon or term", () => {
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [PROMO, FLAT],
        horizonMonths: MAX_COMPARE_MONTHS + 1,
      }),
    ).toBeNull();
    expect(
      compareLoans({ amount: AMOUNT, options: [PROMO, FLAT], horizonMonths: -1 }),
    ).toBeNull();
    expect(
      compareLoans({ amount: AMOUNT, options: [PROMO, FLAT], horizonMonths: 3.5 }),
    ).toBeNull();
    const overLong = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: MAX_COMPARE_MONTHS + 1 },
        FLAT,
      ],
    });
    expect(overLong).toBeNull();
  });

  it("refuses a fractional term or promo stretch", () => {
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [{ annualRatePercent: 8.5, termMonths: 240.5 }, FLAT],
      }),
    ).toBeNull();
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [
          { annualRatePercent: 9, termMonths: 240, promoMonths: 12.5, promoRatePercent: 6 },
          FLAT,
        ],
      }),
    ).toBeNull();
  });

  it("recovers on the next valid call", () => {
    expect(compareLoans({ amount: 0, options: [PROMO, FLAT] })).toBeNull();
    const good = compareLoans({
      amount: AMOUNT,
      options: [PROMO, FLAT],
      horizonMonths: 60,
    });
    expect(good).not.toBeNull();
    expect(good!.horizonMonths).toBe(60);
  });

  it("caps the horizon at a shorter option's own maturity", () => {
    const result = compareLoans({
      amount: AMOUNT,
      options: [
        { annualRatePercent: 8.5, termMonths: 120 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
      horizonMonths: 240,
    })!;
    expect(result.rows[0]!.horizonMonths).toBe(120);
    expect(result.rows[0]!.horizonBalance).toBe(0);
    expect(result.rows[1]!.horizonMonths).toBe(240);
    // The shorter loan is compared on what it actually cost, with no debt
    // left, against the longer one's whole term.
    expect(result.rows[0]!.horizonCost).toBeCloseTo(
      result.rows[0]!.costOfBorrowing,
      6,
    );
  });
});
