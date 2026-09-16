/**
 * The cash-flow rate solver, against the supervisor's independent fixtures.
 *
 * `levelPayment` and `balanceAt` below are written here from the annuity
 * formula and a balance recurrence, importing nothing from `finance.ts`,
 * `apr.ts` or `loan-compare.ts`. So the flows fed to the solver are built
 * independently of every production engine, and the five rates asserted are
 * the supervisor's own figures rather than this repo's output.
 *
 * The fixtures are hypothetical mathematical references. None of them is a
 * statutory APR disclosure or a bank quotation.
 */
import { describe, expect, it } from "vitest";
import {
  nominalAnnualPercent,
  solveMonthlyFlowRate,
} from "@/lib/calc/cash-flow-rate";

/** Level end-of-month annuity payment on `principal`. */
function levelPayment(
  principal: number,
  monthlyRate: number,
  months: number,
): number {
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

/** Balance after `months` payments, by recurrence. */
function balanceAt(
  principal: number,
  monthlyRate: number,
  payment: number,
  months: number,
): number {
  let balance = principal;
  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + monthlyRate) - payment;
  }
  return balance;
}

const AMOUNT = 2_000_000_000;
const RATE = 0.085 / 12;
const TERM = 240;
const FEE = 30_000_000;

/** Flows: proceeds at month 0, then `months` payments, then any balloon. */
function flowsFor(
  proceeds: number,
  payment: number,
  months: number,
  balloon = 0,
): number[] {
  const flows = [proceeds];
  for (let month = 1; month <= months; month += 1) flows.push(-payment);
  if (balloon !== 0) flows[flows.length - 1] -= balloon;
  return flows;
}

/** A tenth of a basis point, in percentage points. */
const RATE_SLACK = 1e-5;

describe("the handoff APR fixtures", () => {
  const payment = levelPayment(AMOUNT, RATE, TERM);
  const financedPayment = levelPayment(AMOUNT + FEE, RATE, TERM);

  it("reproduces the payments the fixtures quote", () => {
    expect(Math.abs(payment - 17_356_464.66731)).toBeLessThan(0.01);
    expect(Math.abs(financedPayment - 17_616_811.63732)).toBeLessThan(0.01);
  });

  it("returns the contract rate when there are no fees", () => {
    const rate = solveMonthlyFlowRate(flowsFor(AMOUNT, payment, TERM));
    expect(nominalAnnualPercent(rate)!).toBeCloseTo(8.5, 6);
  });

  it("prices a 30 triệu fee paid in cash at 8,7081%", () => {
    const rate = solveMonthlyFlowRate(flowsFor(AMOUNT - FEE, payment, TERM));
    expect(Math.abs(nominalAnnualPercent(rate)! - 8.7080971464)).toBeLessThan(
      RATE_SLACK,
    );
  });

  it("prices a 30 triệu fee financed at 8,7050% — slightly LOWER", () => {
    // A financed fee is borrowed, so the proceeds are untouched and the
    // payment rises. Its IRR is lower than paying cash, and it is NOT
    // therefore the better deal: the total nominal interest is higher and so
    // is every instalment.
    const rate = solveMonthlyFlowRate(flowsFor(AMOUNT, financedPayment, TERM));
    expect(Math.abs(nominalAnnualPercent(rate)! - 8.7049860308)).toBeLessThan(
      RATE_SLACK,
    );
    expect(nominalAnnualPercent(rate)!).toBeLessThan(8.7080971464);
    // The total nominal interest goes the other way, as the fixtures record.
    const cashInterest = payment * TERM - AMOUNT;
    // Interest is charged on the GROWN principal, so the fee comes off here
    // too — counting it as interest as well as a fee is the double-count
    // `apr.ts`'s docstring records as a shipped defect.
    const financedInterest = financedPayment * TERM - (AMOUNT + FEE);
    expect(Math.abs(cashInterest - 2_165_551_520.15456)).toBeLessThan(1);
    expect(Math.abs(financedInterest - 2_198_034_792.95688)).toBeLessThan(1);
    expect(financedInterest).toBeGreaterThan(cashInterest);
  });

  it("prices settlement at month 60 with the balance as a balloon", () => {
    const cashBalloon = balanceAt(AMOUNT, RATE, payment, 60);
    expect(Math.abs(cashBalloon - 1_762_543_662.19156)).toBeLessThan(0.01);
    const cashRate = solveMonthlyFlowRate(
      flowsFor(AMOUNT - FEE, payment, 60, cashBalloon),
    );
    expect(Math.abs(nominalAnnualPercent(cashRate)! - 8.8922737652)).toBeLessThan(
      RATE_SLACK,
    );

    const financedBalloon = balanceAt(AMOUNT + FEE, RATE, financedPayment, 60);
    expect(Math.abs(financedBalloon - 1_788_981_817.12443)).toBeLessThan(0.01);
    const financedRate = solveMonthlyFlowRate(
      flowsFor(AMOUNT, financedPayment, 60, financedBalloon),
    );
    expect(
      Math.abs(nominalAnnualPercent(financedRate)! - 8.8864248559),
    ).toBeLessThan(RATE_SLACK);
  });

  it("costs MORE when settled early, because the fee is spread over less", () => {
    const full = nominalAnnualPercent(
      solveMonthlyFlowRate(flowsFor(AMOUNT - FEE, payment, TERM)),
    )!;
    const early = nominalAnnualPercent(
      solveMonthlyFlowRate(
        flowsFor(AMOUNT - FEE, payment, 60, balanceAt(AMOUNT, RATE, payment, 60)),
      ),
    )!;
    expect(early).toBeGreaterThan(full);
  });

  it("returns 0 on a 0% loan with no fees, at a short horizon", () => {
    const zeroPayment = levelPayment(AMOUNT, 0, TERM);
    expect(Math.abs(zeroPayment - 8_333_333.33333)).toBeLessThan(0.01);
    const balloon = AMOUNT - zeroPayment * 60;
    expect(Math.abs(balloon - 1_500_000_000)).toBeLessThan(0.01);
    const rate = solveMonthlyFlowRate(
      flowsFor(AMOUNT, zeroPayment, 60, balloon),
    );
    expect(nominalAnnualPercent(rate)!).toBeCloseTo(0, 6);
  });
});

describe("a payment path that changes", () => {
  it("prices a promotional rate that resets, which solveRate cannot", () => {
    // The reason this module exists. Two payment levels in one vector: 12
    // months at the promotional instalment, then the recalculated one.
    const promoRate = 0.075 / 12;
    const postRate = 0.14 / 12;
    const promoPayment = levelPayment(AMOUNT, promoRate, TERM);
    let balance = AMOUNT;
    const flows = [AMOUNT];
    for (let month = 1; month <= 12; month += 1) {
      balance = balance * (1 + promoRate) - promoPayment;
      flows.push(-promoPayment);
    }
    const postPayment = levelPayment(balance, postRate, TERM - 12);
    for (let month = 13; month <= TERM; month += 1) flows.push(-postPayment);

    const rate = nominalAnnualPercent(solveMonthlyFlowRate(flows))!;
    // Between the two rates, and nearer the one that governs 228 months.
    expect(rate).toBeGreaterThan(7.5);
    expect(rate).toBeLessThan(14);
    expect(rate).toBeGreaterThan(13);
  });
});

describe("refusals", () => {
  it("returns null rather than a guess for flows that never change sign", () => {
    expect(solveMonthlyFlowRate([100, 100, 100])).toBeNull();
    expect(solveMonthlyFlowRate([-100, -100, -100])).toBeNull();
  });

  it("returns null for a vector too short or not finite", () => {
    expect(solveMonthlyFlowRate([])).toBeNull();
    expect(solveMonthlyFlowRate([100])).toBeNull();
    expect(solveMonthlyFlowRate([100, Number.NaN])).toBeNull();
    expect(solveMonthlyFlowRate([100, Number.POSITIVE_INFINITY])).toBeNull();
  });

  it("solves a 40-year loan, where a per-period bracket underflows", () => {
    // docs §8's recurring defect: at 480 periods a bracket just above −100%
    // per PERIOD underflows and every long-dated contract returns null. This
    // solver brackets the ANNUAL rate for exactly that reason.
    const months = 480;
    const payment = levelPayment(AMOUNT, RATE, months);
    const rate = nominalAnnualPercent(
      solveMonthlyFlowRate(flowsFor(AMOUNT, payment, months)),
    );
    expect(rate).not.toBeNull();
    expect(rate!).toBeCloseTo(8.5, 5);
  });

  it("passes null through rather than inventing an annual figure", () => {
    expect(nominalAnnualPercent(null)).toBeNull();
    expect(nominalAnnualPercent(0.005)).toBeCloseTo(6, 10);
  });
});
