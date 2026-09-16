// Original row 31's household allocation. The fixtures are the independent
// ones from `p3-p4-scope-audit.md` §31, recomputed here from `computeAutoLoan`
// rather than transcribed, so the instalment the test subtracts is the one the
// page actually shows.
import { describe, expect, it } from "vitest";
import { computeAutoLoan } from "./auto-loan";
import { compareVehicleBudget } from "./vehicle-budget";

/**
 * The audit's vehicle: 800 triệu, 300 triệu cash, 100 triệu trade-in, so
 * 400 triệu financed at 10%/năm nominal over 60 months.
 */
const LOAN = computeAutoLoan({
  price: 800_000_000,
  downPayment: 300_000_000,
  tradeIn: 100_000_000,
  annualRatePercent: 10,
  termMonths: 60,
});

describe("the audit's vehicle loan", () => {
  it("finances 400 triệu and charges the independently computed instalment", () => {
    expect(LOAN?.amountFinanced).toBe(400_000_000);
    expect(LOAN?.loan.monthlyPrincipalInterest).toBeCloseTo(
      8_498_817.884507332,
      6,
    );
    expect(LOAN?.loan.totalInterest).toBeCloseTo(109_929_073.07043993, 4);
  });
});

const PAYMENT = LOAN!.loan.monthlyPrincipalInterest;

describe("compareVehicleBudget on the audit's household", () => {
  const result = compareVehicleBudget({
    netIncome: 40_000_000,
    essentialExpenses: 22_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: PAYMENT,
  })!;

  it("has 12 triệu a month before the car", () => {
    expect(result.withoutCar).toBe(12_000_000);
  });

  it("has the audit's residual after the car", () => {
    expect(result.withCar).toBeCloseTo(3_501_182.115492668, 6);
  });

  it("differs between the two legs by the instalment, exactly once", () => {
    // The defect this asserts against: a reader who enters the car payment in
    // "other debts" as well would see twice the instalment taken out.
    expect(result.difference).toBe(PAYMENT);
    expect(result.difference).toBe(result.vehicleMonthlyCost);
    // The subtraction agrees to float residue, which is why `difference` is
    // not computed that way — see the field's note.
    expect(result.withoutCar - result.withCar!).toBeCloseTo(PAYMENT, 6);
  });

  it("is not in shortfall, and says so in both directions", () => {
    expect(result.shortfall).toBe(false);
    expect(result.shortfallAmount).toBeNull();
    expect(result.shortfallWithoutVehicle).toBe(false);
  });

  it("discloses that running costs are not in the figures", () => {
    expect(result.runningCostsExcluded).toBe(true);
    expect(result.vehicleRunningCosts).toBe(0);
  });
});

describe("the same outflows on 30 triệu of net income", () => {
  const result = compareVehicleBudget({
    netIncome: 30_000_000,
    essentialExpenses: 22_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: PAYMENT,
  })!;

  it("has 2 triệu before the car and a NEGATIVE residual after it", () => {
    expect(result.withoutCar).toBe(2_000_000);
    expect(result.withCar).toBeCloseTo(-6_498_817.884507332, 6);
  });

  it("reports the shortfall rather than flooring the month at zero", () => {
    // Clamping would turn "6,5 triệu short every month" into "nothing spare",
    // which reads like a tight budget rather than an impossible one.
    expect(result.shortfall).toBe(true);
    expect(result.shortfallAmount).toBeCloseTo(6_498_817.884507332, 6);
    expect(result.shortfallWithoutVehicle).toBe(false);
  });
});

describe("a zero-rate vehicle loan", () => {
  it("still allocates the month, on a straight-line instalment", () => {
    const loan = computeAutoLoan({
      price: 800_000_000,
      downPayment: 300_000_000,
      tradeIn: 100_000_000,
      annualRatePercent: 0,
      termMonths: 60,
    })!;
    expect(loan.loan.monthlyPrincipalInterest).toBeCloseTo(400_000_000 / 60, 6);

    const result = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      otherDebts: 3_000_000,
      reserveSaving: 3_000_000,
      vehiclePayment: loan.loan.monthlyPrincipalInterest,
    })!;
    expect(result.withCar).toBeCloseTo(12_000_000 - 400_000_000 / 60, 6);
    expect(result.difference).toBe(loan.loan.monthlyPrincipalInterest);
  });
});

describe("unknown essential costs", () => {
  const result = compareVehicleBudget({
    netIncome: 40_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: PAYMENT,
  })!;

  it("is limited, and does not treat the blank as a zero it knows", () => {
    expect(result.limited).toBe(true);
    expect(result.essentialExpenses).toBeNull();
  });

  it("still differs by the instalment, so the comparison itself holds", () => {
    expect(result.difference).toBe(PAYMENT);
  });

  it("is NOT limited when zero was stated explicitly", () => {
    const stated = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 0,
      vehiclePayment: PAYMENT,
    })!;
    expect(stated.limited).toBe(false);
    expect(stated.essentialExpenses).toBe(0);
    expect(stated.withoutCar).toBe(40_000_000);
  });
});

describe("running costs, when the reader enters them", () => {
  const result = compareVehicleBudget({
    netIncome: 40_000_000,
    essentialExpenses: 22_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: PAYMENT,
    vehicleRunningCosts: 2_500_000,
  })!;

  it("adds them to the vehicle's own monthly cost, not to the other debts", () => {
    expect(result.vehicleMonthlyCost).toBeCloseTo(PAYMENT + 2_500_000, 6);
    expect(result.otherDebts).toBe(3_000_000);
    expect(result.withoutCar).toBe(12_000_000);
    expect(result.withCar).toBeCloseTo(12_000_000 - PAYMENT - 2_500_000, 6);
  });

  it("no longer discloses them as excluded", () => {
    expect(result.runningCostsExcluded).toBe(false);
  });
});

/**
 * `vehiclePayment: null` is the absence of an answer, `0` is an answer.
 *
 * The page used to coalesce the two with `?? 0`, and an independent review
 * reproduced the consequence live: an invalid interest rate turned the car
 * free and the comparison announced a gap of 0 ₫.
 */
describe("an unknown instalment", () => {
  const unknown = compareVehicleBudget({
    netIncome: 40_000_000,
    essentialExpenses: 22_000_000,
    otherDebts: 3_000_000,
    reserveSaving: 3_000_000,
    vehiclePayment: null,
  })!;

  it("is still a usable month, not a refusal", () => {
    // Returning null for the whole ledger would take away the without-car
    // figure, which does not depend on the instalment at all.
    expect(unknown).not.toBeNull();
    expect(unknown.withoutCar).toBe(12_000_000);
    expect(unknown.committedWithoutVehicle).toBe(28_000_000);
  });

  it("withholds every figure that depends on the instalment", () => {
    expect(unknown.vehicleCostUnknown).toBe(true);
    expect(unknown.vehiclePayment).toBeNull();
    expect(unknown.vehicleMonthlyCost).toBeNull();
    expect(unknown.withCar).toBeNull();
    expect(unknown.difference).toBeNull();
  });

  it("does not report a shortfall it cannot know about", () => {
    expect(unknown.shortfall).toBe(false);
    expect(unknown.shortfallAmount).toBeNull();
    // ...which is why the flag above exists beside it: `shortfall: false` here
    // means "no answer", not "the month is fine".
    expect(unknown.vehicleCostUnknown).toBe(true);
  });

  it("does not name running costs as the vehicle's cost on their own", () => {
    // Reporting 2,5 triệu as "chi phí xe mỗi tháng" while the instalment is
    // unknown understates the total and reads as though it were complete.
    const withRunning = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      vehiclePayment: null,
      vehicleRunningCosts: 2_500_000,
    })!;
    expect(withRunning.vehicleMonthlyCost).toBeNull();
    expect(withRunning.vehicleRunningCosts).toBe(2_500_000);
    expect(withRunning.runningCostsExcluded).toBe(false);
  });

  it("is a different state from a KNOWN zero instalment", () => {
    const cash = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      otherDebts: 3_000_000,
      reserveSaving: 3_000_000,
      vehiclePayment: 0,
    })!;
    expect(cash.vehicleCostUnknown).toBe(false);
    expect(cash.vehicleMonthlyCost).toBe(0);
    expect(cash.difference).toBe(0);
    expect(cash.withCar).toBe(cash.withoutCar);
    // The defect in one line: these two states must not produce the same rows.
    expect(unknown.withCar).not.toBe(cash.withCar);
  });

  it("still refuses a negative instalment, which is neither", () => {
    expect(
      compareVehicleBudget({ netIncome: 40_000_000, vehiclePayment: -1 }),
    ).toBeNull();
    expect(
      compareVehicleBudget({
        netIncome: 40_000_000,
        vehiclePayment: Number.NaN,
      }),
    ).toBeNull();
  });
});

describe("a month that does not balance before the car", () => {
  it("names that separately from the shortfall the car causes", () => {
    const result = compareVehicleBudget({
      netIncome: 20_000_000,
      essentialExpenses: 22_000_000,
      vehiclePayment: PAYMENT,
    })!;
    expect(result.withoutCar).toBe(-2_000_000);
    expect(result.shortfallWithoutVehicle).toBe(true);
    expect(result.shortfall).toBe(true);
  });
});

describe("refusals", () => {
  it("refuses a non-positive net income", () => {
    expect(
      compareVehicleBudget({ netIncome: 0, vehiclePayment: 1_000_000 }),
    ).toBeNull();
    expect(
      compareVehicleBudget({ netIncome: -1, vehiclePayment: 1_000_000 }),
    ).toBeNull();
  });

  it("refuses a negative outgoing", () => {
    expect(
      compareVehicleBudget({
        netIncome: 40_000_000,
        essentialExpenses: -1,
        vehiclePayment: 0,
      }),
    ).toBeNull();
    expect(
      compareVehicleBudget({
        netIncome: 40_000_000,
        otherDebts: -1,
        vehiclePayment: 0,
      }),
    ).toBeNull();
    expect(
      compareVehicleBudget({ netIncome: 40_000_000, vehiclePayment: -1 }),
    ).toBeNull();
  });

  it("refuses a non-finite figure", () => {
    expect(
      compareVehicleBudget({
        netIncome: Number.POSITIVE_INFINITY,
        vehiclePayment: 0,
      }),
    ).toBeNull();
    expect(
      compareVehicleBudget({
        netIncome: 40_000_000,
        vehiclePayment: Number.NaN,
      }),
    ).toBeNull();
    expect(
      compareVehicleBudget({
        netIncome: 40_000_000,
        essentialExpenses: Number.NaN,
        vehiclePayment: 0,
      }),
    ).toBeNull();
  });

  it("allocates a month with no vehicle at all", () => {
    // A zero instalment is a legitimate state: the reader has not yet said
    // what the car costs, and the two legs coincide.
    const result = compareVehicleBudget({
      netIncome: 40_000_000,
      essentialExpenses: 22_000_000,
      vehiclePayment: 0,
    })!;
    expect(result.withCar).toBe(result.withoutCar);
    expect(result.difference).toBe(0);
  });
});
