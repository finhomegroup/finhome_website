import { describe, it, expect } from "vitest";
import { compareRefinance, type RefinanceInput } from "@/lib/calc/refinance";

const BASE: RefinanceInput = { balance: 2e9, currentRatePercent: 11, remainingMonths: 216,
  newRatePercent: 8.5, newTermMonths: 300, closingCosts: 40e6, horizonMonths: 60 };

// Independent direct recurrence: no production finance or loan imports.
function reference(principal: number, annual: number, term: number, horizon: number) {
  const rate = annual / 1200;
  const payment = rate === 0 ? principal / term : principal * rate / (1 - (1 + rate) ** -term);
  let balance = principal, paid = 0, interest = 0;
  const rows = [{ balance, paid, interest }];
  for (let month = 1; month <= horizon; month++) {
    const charge = month <= term ? balance * rate : 0;
    const principalPaid = month <= term ? (month === term ? balance : Math.min(balance, payment - charge)) : 0;
    paid += principalPaid + charge;
    interest += charge;
    balance = month >= term ? 0 : balance - principalPaid;
    rows.push({ balance, paid, interest });
  }
  return { payment, rows };
}
function refi(input: RefinanceInput) {
  const result = compareRefinance(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("refinance: debt-aware horizon, not monthly cash-flow recoup", () => {
  it("fixture A: lower payment from doubled term saves cash but LOSES cost at month60", () => {
    const r = refi({ ...BASE, currentRatePercent: 8.5, remainingMonths: 120, newTermMonths: 240 });
    expect(r.currentPayment).toBeCloseTo(24_797_137.774902, 2);
    expect(r.newPayment).toBeCloseTo(17_356_464.667311, 2);
    expect(r.horizon.currentPaid).toBeCloseTo(1_487_828_266.4941, 2);
    expect(r.horizon.currentInterest).toBeCloseTo(696_470_087.0638, 2);
    expect(r.horizon.currentBalance).toBeCloseTo(1_208_641_820.5697, 2);
    expect(r.horizon.newPaid).toBeCloseTo(1_041_387_880.0386, 2);
    expect(r.horizon.newInterest).toBeCloseTo(803_931_542.2302, 2);
    expect(r.horizon.newBalance).toBeCloseTo(1_762_543_662.1916, 2);
    expect(r.horizonCashFlowSaving).toBeCloseTo(406_440_386.4555, 2);
    expect(r.horizonCostSaving).toBeCloseTo(-147_461_455.1664, 2);
    expect(r.breakEvenMonths).toBeNull();
    expect(r.cashFlowBreakEvenMonths).not.toBeNull();
  });
  it("fixture B: both figures positive but unequal at month60", () => {
    const r = refi(BASE);
    expect(r.currentPayment).toBeCloseTo(21_300_992.863284, 2);
    expect(r.newPayment).toBeCloseTo(16_104_541.669243, 2);
    expect(r.horizon.currentPaid).toBeCloseTo(1_278_059_571.7970, 2);
    expect(r.horizon.currentInterest).toBeCloseTo(1_042_076_984.8140, 2);
    expect(r.horizon.currentBalance).toBeCloseTo(1_764_017_413.0170, 2);
    expect(r.horizon.newPaid).toBeCloseTo(966_272_500.1546, 2);
    expect(r.horizon.newInterest).toBeCloseTo(822_012_361.6915, 2);
    expect(r.horizon.newBalance).toBeCloseTo(1_855_739_861.5369, 2);
    expect(r.horizonCashFlowSaving).toBeCloseTo(271_787_071.6425, 2);
    expect(r.horizonCostSaving).toBeCloseTo(180_064_623.1226, 2);
  });
  it("independent monthly ledgers and both saving identities, including both maturities", () => {
    for (const oldTerm of [1, 120, 216, 360]) for (const newTerm of [1, 60, 240, 300]) {
      for (const newRate of [0, 8.5, 13]) {
        const input = { ...BASE, remainingMonths: oldTerm, newTermMonths: newTerm, newRatePercent: newRate, horizonMonths: 400 };
        const r = refi(input);
        const a = reference(input.balance, input.currentRatePercent, oldTerm, 400);
        const b = reference(input.balance, newRate, newTerm, 400);
        r.timeline.forEach((row, m) => {
          // Absolute 0.02 đồng tolerance: independent annuity implementations
          // accumulate slightly different floating point residues over 400 rows.
          const expected = a.rows[m].interest - b.rows[m].interest - 40e6;
          expect(Math.abs(row.costSaving - expected)).toBeLessThan(0.02);
          expect(Math.abs(row.currentPaid - a.rows[m].paid)).toBeLessThan(0.02);
          expect(Math.abs(row.newBalance - b.rows[m].balance)).toBeLessThan(0.02);
          const ledger = row.currentPaid + row.currentBalance - row.newPaid - row.newBalance - r.closingCosts;
          expect(Math.abs(row.costSaving - ledger)).toBeLessThan(0.02);
          expect(row.costSaving).toBe(row.currentInterest - row.newInterest - r.closingCosts);
          expect(row.cashFlowSaving).toBe(row.currentPaid - row.newPaid - r.closingCosts);
        });
        expect(r.horizon.currentBalance).toBe(0);
        expect(r.horizon.newBalance).toBe(0);
        expect(r.horizonCostSaving).toBeCloseTo(r.lifetimeSaving, 2);
        expect(r.horizonCashFlowSaving).toBeCloseTo(r.lifetimeSaving, 2);
      }
    }
  });
  it("charges both fee inputs once at period zero and preserves legacy closingCosts", () => {
    const legacy = refi(BASE), split = refi({ ...BASE, closingCosts: 20e6, earlySettlementFee: 20e6 });
    expect(split.horizon).toEqual(legacy.horizon);
    expect(split.closingCosts).toBe(40e6);
    const zero = refi({ ...BASE, horizonMonths: 0 });
    expect(zero.timeline).toHaveLength(1);
    expect(zero.horizonCostSaving).toBe(-40e6);
    expect(zero.horizonCashFlowSaving).toBe(-40e6);
    expect(zero.horizon.currentBalance).toBe(2e9);
    expect(zero.horizon.newBalance).toBe(2e9);
  });
  it("equal loans, zero fees: zero throughout is equality, not guaranteed profit", () => {
    const r = refi({ ...BASE, newRatePercent: 11, newTermMonths: 216, closingCosts: 0 });
    expect(r.timeline.every((row) => row.costSaving === 0 && row.cashFlowSaving === 0)).toBe(true);
    expect(r.breakEvenMonths).toBe(0);
    expect(r.costTurnsNegativeAgain).toBe(false);
  });
  it("equal loans with fees stay negative and never break even", () => {
    const r = refi({ ...BASE, newRatePercent: 11, newTermMonths: 216 });
    expect(r.timeline.every((row) => row.costSaving === -40e6)).toBe(true);
    expect(r.breakEvenMonths).toBeNull();
  });
  it("zero rates and different terms have zero interest, but distinct cash flow", () => {
    const r = refi({ ...BASE, currentRatePercent: 0, newRatePercent: 0, closingCosts: 0 });
    expect(r.horizonCostSaving).toBe(0);
    expect(r.horizonCashFlowSaving).not.toBe(0);
  });
  it("huge fees never recovered within the horizon", () => {
    const r = refi({ ...BASE, closingCosts: 1e12, horizonMonths: 400 });
    expect(r.breakEvenMonths).toBeNull();
    expect(r.cashFlowBreakEvenMonths).toBeNull();
  });
  it("does not suppress later CASH crossings when the first new payment rises", () => {
    const r = refi({ ...BASE, newRatePercent: 11, newTermMonths: 120, horizonMonths: 216 });
    expect(r.monthlySaving).toBeLessThan(0);
    expect(r.horizonCashFlowSaving).toBeGreaterThan(0);
    expect(r.cashFlowBreakEvenMonths).toBeGreaterThan(120);
    expect(r.breakEvenMonths).not.toBeNull();
  });
  it("a first cost crossing can reverse; result at H is the conclusion", () => {
    const r = refi({ ...BASE, horizonMonths: 300 });
    expect(r.breakEvenMonths).not.toBeNull();
    expect(r.costTurnsNegativeAgain).toBe(true);
    expect(r.horizonCostSaving).toBeLessThan(0);
  });
  it("cost break-even is the first covered month, not fees/monthlySaving", () => {
    const r = refi(BASE), crossing = r.breakEvenMonths!;
    expect(r.timeline[crossing].costSaving).toBeGreaterThanOrEqual(-0.5);
    expect(r.timeline[crossing - 1].costSaving).toBeLessThan(-0.5);
    expect(crossing).not.toBe(r.cashFlowBreakEvenMonths);
    expect(refi({ ...BASE, horizonMonths: crossing - 1 }).breakEvenMonths).toBeNull();
  });
  it("zero fees may immediately become a loss", () => {
    const r = refi({ ...BASE, closingCosts: 0, newRatePercent: 15 });
    expect(r.breakEvenMonths).toBe(0);
    expect(r.costTurnsNegativeAgain).toBe(true);
    expect(r.horizonCostSaving).toBeLessThan(0);
  });
  it("defaults an omitted horizon to both maturities for legacy consumers", () => {
    expect(refi({ ...BASE, horizonMonths: undefined }).horizonMonths).toBe(300);
  });
  it.each([
    { balance: 0 }, { balance: -1 }, { balance: NaN }, { balance: Infinity },
    { currentRatePercent: -1 }, { newRatePercent: Infinity }, { remainingMonths: 0 },
    { remainingMonths: 2.5 }, { newTermMonths: 1201 }, { closingCosts: -1 },
    { earlySettlementFee: NaN }, { earlySettlementFee: -1 },
    { horizonMonths: -1 }, { horizonMonths: 1.5 }, { horizonMonths: 1201 }, { horizonMonths: NaN },
  ])("rejects invalid inputs: %o", (patch) => { expect(compareRefinance({ ...BASE, ...patch })).toBeNull(); });
});
