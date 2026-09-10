import { describe, it, expect } from "vitest";
import {
  computeTermDeposit,
  type TermDepositInput,
} from "@/lib/calc/term-deposit";

// 500 triệu on a 12-month term at 5,5%/năm — a typical Vietnamese deposit.
const BASE: TermDepositInput = {
  principal: 500_000_000,
  annualRatePercent: 5.5,
  termMonths: 12,
};

function deposit(input: TermDepositInput) {
  const result = computeTermDeposit(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeTermDeposit — simple interest within a term", () => {
  it("earns the quoted rate over exactly 12 months", () => {
    const result = deposit(BASE);
    expect(result.totalInterest).toBeCloseTo(27_500_000, 6);
    expect(result.totalValue).toBeCloseTo(527_500_000, 6);
    expect(result.effectiveAnnualPercent).toBeCloseTo(5.5, 8);
  });

  it("pro-rates a shorter term rather than compounding it", () => {
    // 6 months at 5,5% is 2,75% of the principal — NOT (1,004583)^6 − 1.
    const result = deposit({ ...BASE, termMonths: 6 });
    expect(result.totalInterest).toBeCloseTo(13_750_000, 6);
    // The compound reading would give more; check we are not doing that.
    const compoundReading = 500_000_000 * ((1 + 0.055 / 12) ** 6 - 1);
    expect(result.totalInterest).toBeLessThan(compoundReading);
  });

  it("pro-rates a longer single term the same way", () => {
    // 24 months at 5,5% simple is 11% of the principal.
    const result = deposit({ ...BASE, termMonths: 24 });
    expect(result.totalInterest).toBeCloseTo(55_000_000, 6);
    // And its effective annual rate is BELOW the quoted rate, because simple
    // interest over two years earns less than compounding would.
    expect(result.effectiveAnnualPercent).toBeLessThan(5.5);
  });

  it("earns nothing at a 0% rate", () => {
    const result = deposit({ ...BASE, annualRatePercent: 0 });
    expect(result.totalInterest).toBe(0);
    expect(result.totalValue).toBe(500_000_000);
    expect(result.effectiveAnnualPercent).toBeCloseTo(0, 10);
  });
});

describe("computeTermDeposit — how interest is paid out", () => {
  it("splits the same total into monthly instalments", () => {
    const atMaturity = deposit(BASE);
    const monthly = deposit({ ...BASE, payout: "monthly" });
    // Same money, different timing.
    expect(monthly.totalInterest).toBeCloseTo(atMaturity.totalInterest, 6);
    expect(monthly.payoutCount).toBe(12);
    expect(monthly.interestPerPayout).toBeCloseTo(27_500_000 / 12, 6);
  });

  it("splits it into quarters", () => {
    const quarterly = deposit({ ...BASE, payout: "quarterly" });
    expect(quarterly.payoutCount).toBe(4);
    expect(quarterly.interestPerPayout).toBeCloseTo(27_500_000 / 4, 6);
    expect(quarterly.totalInterest).toBeCloseTo(27_500_000, 6);
  });

  it("pays the whole lot once at maturity", () => {
    const result = deposit(BASE);
    expect(result.payoutCount).toBe(1);
    expect(result.interestPerPayout).toBeCloseTo(result.totalInterest, 6);
  });

  it("rejects a term that is not whole payout periods", () => {
    // A 5-month deposit paying quarterly is not a product.
    expect(
      computeTermDeposit({ ...BASE, termMonths: 5, payout: "quarterly" }),
    ).toBeNull();
    // Monthly always divides.
    expect(
      computeTermDeposit({ ...BASE, termMonths: 5, payout: "monthly" }),
    ).not.toBeNull();
  });
});

describe("computeTermDeposit — rolling over", () => {
  it("earns the same each cycle when interest is withdrawn", () => {
    const result = deposit({ ...BASE, cycles: 3 });
    expect(result.totalMonths).toBe(36);
    expect(result.totalInterest).toBeCloseTo(27_500_000 * 3, 6);
    expect(result.finalPrincipal).toBe(500_000_000);
    expect(result.compounded).toBe(false);
    // Simple interest over three years: the effective annual rate falls.
    expect(result.effectiveAnnualPercent).toBeLessThan(5.5);
  });

  it("compounds when interest is rolled into the principal", () => {
    const rolled = deposit({
      ...BASE,
      cycles: 3,
      compoundOnRollover: true,
    });
    expect(rolled.compounded).toBe(true);
    // 500.000.000 × 1,055³ = 587.120.687,50
    expect(rolled.totalValue).toBeCloseTo(587_120_687.5, 2);
    // "Gốc ở kỳ cuối" is the balance the LAST term OPENS with — 500.000.000 ×
    // 1,055² — not the balance after it, so it excludes the third term's own
    // interest and must stay below the maturity value.
    expect(rolled.finalPrincipal).toBeCloseTo(556_512_500, 2);
    expect(rolled.finalPrincipal).toBeLessThan(rolled.totalValue);
    expect(rolled.effectiveAnnualPercent).toBeCloseTo(5.5, 8);
  });

  it("beats withdrawing the interest, over the same months", () => {
    const withdrawn = deposit({ ...BASE, cycles: 3 });
    const rolled = deposit({ ...BASE, cycles: 3, compoundOnRollover: true });
    expect(rolled.totalInterest).toBeGreaterThan(withdrawn.totalInterest);
    expect(rolled.effectiveAnnualPercent).toBeGreaterThan(
      withdrawn.effectiveAnnualPercent,
    );
  });

  it("ignores the rollover flag when interest is paid out monthly", () => {
    // There is nothing left to roll in: the saver already has the money.
    const result = deposit({
      ...BASE,
      cycles: 3,
      payout: "monthly",
      compoundOnRollover: true,
    });
    expect(result.compounded).toBe(false);
    expect(result.totalInterest).toBeCloseTo(27_500_000 * 3, 6);
    expect(result.finalPrincipal).toBe(500_000_000);
  });

  it("makes no difference on a single cycle", () => {
    const plain = deposit(BASE);
    const rolled = deposit({ ...BASE, compoundOnRollover: true });
    expect(rolled.totalValue).toBeCloseTo(plain.totalValue, 6);
    // There is no rollover to compound at, so the only term still opens with
    // the untouched principal.
    expect(rolled.finalPrincipal).toBe(500_000_000);
    expect(plain.finalPrincipal).toBe(500_000_000);
  });

  it("reports each term's opening balance as it grows", () => {
    // Openings of a 12-month 5,5% deposit rolled up: 500 triệu, then ×1,055,
    // then ×1,055². Each is the principal at work IN that term.
    expect(
      deposit({ ...BASE, cycles: 1, compoundOnRollover: true }).finalPrincipal,
    ).toBe(500_000_000);
    expect(
      deposit({ ...BASE, cycles: 2, compoundOnRollover: true }).finalPrincipal,
    ).toBeCloseTo(527_500_000, 2);
    expect(
      deposit({ ...BASE, cycles: 3, compoundOnRollover: true }).finalPrincipal,
    ).toBeCloseTo(556_512_500, 2);
  });

  it("reports the first term's payout even when compounding", () => {
    const result = deposit({ ...BASE, cycles: 3, compoundOnRollover: true });
    expect(result.interestPerPayout).toBeCloseTo(27_500_000, 6);
  });
});

describe("computeTermDeposit — breaking the deposit early", () => {
  const EARLY: TermDepositInput = {
    ...BASE,
    demandRatePercent: 0.2,
    breakAfterMonths: 9,
  };

  it("pays the demand rate on the whole unfinished term, not a reduced term rate", () => {
    const result = deposit(EARLY);
    // 500 triệu × 0,2% × 9/12 = 750.000 ₫.
    expect(result.earlyInterest).toBeCloseTo(750_000, 6);
  });

  it("states what the term rate would have earned over the same months", () => {
    const result = deposit(EARLY);
    // 500 triệu × 5,5% × 9/12 = 20.625.000 ₫.
    expect(result.earlyForegoneInterest).toBeCloseTo(20_625_000, 6);
    expect(result.earlyLoss).toBeCloseTo(19_875_000, 6);
  });

  it("costs more the longer you held INSIDE the unfinished term", () => {
    // Deliberately not monotonic across a term boundary: the loss resets to 0
    // at every maturity date, so the comparison only holds within one term.
    const early = deposit({ ...EARLY, breakAfterMonths: 3 }).earlyLoss!;
    const late = deposit({ ...EARLY, breakAfterMonths: 11 }).earlyLoss!;
    expect(late).toBeGreaterThan(early);
  });

  it("loses nothing when the break lands on a maturity date", () => {
    // SBV Thông tư 04/2022/TT-NHNN Art. 5: a term that has reached maturity is
    // settled money. Nothing is broken, so the demand rate applies to nothing
    // and the subtraction cancels exactly — `toBe(0)`, not a tolerance.
    const oneTerm = deposit({ ...EARLY, breakAfterMonths: 12 });
    expect(oneTerm.earlyInterest).toBeCloseTo(27_500_000, 6);
    expect(oneTerm.earlyForegoneInterest).toBeCloseTo(27_500_000, 6);
    expect(oneTerm.earlyLoss).toBe(0);

    // 500 triệu × (1,055² − 1) = 56.512.500 ₫ credited over two matured terms.
    const twoTerms = deposit({
      ...EARLY,
      cycles: 3,
      compoundOnRollover: true,
      breakAfterMonths: 24,
    });
    expect(twoTerms.earlyInterest).toBeCloseTo(56_512_500, 2);
    expect(twoTerms.earlyLoss).toBe(0);

    // The deposit's own last day: every term matured, nothing is running.
    const rolled = deposit({
      ...EARLY,
      cycles: 3,
      compoundOnRollover: true,
      breakAfterMonths: 36,
    });
    expect(rolled.earlyInterest).toBeCloseTo(87_120_687.5, 2);
    expect(rolled.earlyLoss).toBe(0);

    const withdrawn = deposit({
      ...EARLY,
      cycles: 3,
      breakAfterMonths: 36,
    });
    expect(withdrawn.earlyInterest).toBeCloseTo(82_500_000, 2);
    expect(withdrawn.earlyLoss).toBe(0);
  });

  it("penalises only the unfinished term of a rolled-over deposit", () => {
    // 3 kỳ × 12 tháng, break at month 30: terms 1 and 2 matured (56.512.500 ₫
    // credited), and 6 months of term 3 ran on its opening 556.512.500 ₫.
    // Received: 56.512.500 + 556.512.500 × 0,2% × 0,5 = 57.069.012,50 ₫.
    // Foregone: 56.512.500 + 556.512.500 × 5,5% × 0,5 = 71.816.593,75 ₫.
    // Loss: 556.512.500 × 5,3% × 0,5 = 14.747.581,25 ₫.
    const rolled = deposit({
      ...EARLY,
      cycles: 3,
      compoundOnRollover: true,
      breakAfterMonths: 30,
    });
    expect(rolled.earlyInterest).toBeCloseTo(57_069_012.5, 2);
    expect(rolled.earlyForegoneInterest).toBeCloseTo(71_816_593.75, 2);
    expect(rolled.earlyLoss).toBeCloseTo(14_747_581.25, 2);

    // Withdrawing the interest each cycle: every term opens at 500 triệu, so
    // 55.000.000 credited + 500.000.000 × 0,2% × 0,5 = 55.500.000 ₫ received,
    // 55.000.000 + 500.000.000 × 5,5% × 0,5 = 68.750.000 ₫ foregone.
    const withdrawn = deposit({
      ...EARLY,
      cycles: 3,
      breakAfterMonths: 30,
    });
    expect(withdrawn.earlyInterest).toBeCloseTo(55_500_000, 6);
    expect(withdrawn.earlyForegoneInterest).toBeCloseTo(68_750_000, 6);
    expect(withdrawn.earlyLoss).toBeCloseTo(13_250_000, 6);

    // The loss is bounded by ONE term's worth of foregone interest, however
    // many terms were held — the bug this replaces scaled it with the total.
    expect(withdrawn.earlyLoss!).toBeLessThan(27_500_000);
  });

  it("keeps the loss below the whole-period reading it used to report", () => {
    // The old model charged the demand rate over every month held: at 3 kỳ /
    // tháng 30 that was 500 triệu × 5,3% × 30/12 = 66.250.000 ₫.
    const result = deposit({ ...EARLY, cycles: 3, breakAfterMonths: 30 });
    expect(result.earlyLoss!).toBeLessThan(66_250_000);
  });

  it("treats an absent demand rate as zero interest", () => {
    const result = deposit({ ...BASE, breakAfterMonths: 9 });
    expect(result.earlyInterest).toBe(0);
    expect(result.earlyLoss).toBeCloseTo(20_625_000, 6);
  });

  it("leaves the block null when no break is asked about", () => {
    const result = deposit(BASE);
    expect(result.earlyInterest).toBeNull();
    expect(result.earlyForegoneInterest).toBeNull();
    expect(result.earlyLoss).toBeNull();
  });

  it("allows a break at the very last month, but not past the end", () => {
    expect(
      computeTermDeposit({ ...EARLY, breakAfterMonths: 12 }),
    ).not.toBeNull();
    expect(computeTermDeposit({ ...EARLY, breakAfterMonths: 13 })).toBeNull();
    // …and past the end of a MULTI-cycle deposit, not just one term.
    expect(
      computeTermDeposit({ ...EARLY, cycles: 3, breakAfterMonths: 36 }),
    ).not.toBeNull();
    expect(
      computeTermDeposit({ ...EARLY, cycles: 3, breakAfterMonths: 37 }),
    ).toBeNull();
  });

  it("still accepts a fractional month, splitting it at the boundary", () => {
    // 12,5 months of a 2 × 12 deposit is one matured term plus half a month:
    // 27.500.000 + 527.500.000 × 0,2% ÷ 24 = 27.543.958,33 ₫.
    const result = deposit({
      ...EARLY,
      cycles: 2,
      compoundOnRollover: true,
      breakAfterMonths: 12.5,
    });
    expect(result.earlyInterest).toBeCloseTo(27_543_958.33, 2);
    expect(result.earlyForegoneInterest).toBeCloseTo(28_708_854.17, 2);
    expect(result.earlyLoss).toBeCloseTo(1_164_895.83, 2);
  });

  it("rejects a break at zero months or a negative demand rate", () => {
    expect(computeTermDeposit({ ...EARLY, breakAfterMonths: 0 })).toBeNull();
    expect(computeTermDeposit({ ...EARLY, breakAfterMonths: -1 })).toBeNull();
    expect(computeTermDeposit({ ...EARLY, demandRatePercent: -1 })).toBeNull();
  });
});

describe("computeTermDeposit — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeTermDeposit({ ...BASE, principal: 0 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, principal: -1 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, termMonths: 12.5 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, cycles: 0 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, cycles: 2.5 })).toBeNull();
    expect(computeTermDeposit({ ...BASE, principal: Number.NaN })).toBeNull();
    expect(
      computeTermDeposit({ ...BASE, annualRatePercent: Number.NaN }),
    ).toBeNull();
  });
});
