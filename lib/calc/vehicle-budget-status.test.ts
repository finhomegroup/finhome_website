import { describe, expect, it } from "vitest";
import { compareVehicleBudget } from "@/lib/calc/vehicle-budget";
import { vehicleBudgetStatus } from "@/lib/calc/vehicle-budget-status";

/**
 * The shipped car-loan household, with the instalment the shipped loan
 * charges (8.498.818 ₫, rounded here to a whole đồng so the fixture is
 * readable; the engine's own float is exercised in the render test).
 * 40 − 22 − 3 − 3 = 12 triệu before the car.
 */
const HOUSEHOLD = {
  netIncome: 40_000_000,
  essentialExpenses: 22_000_000,
  otherDebts: 3_000_000,
  reserveSaving: 3_000_000,
  vehiclePayment: 8_498_818,
};

const budget = (overrides: Partial<Parameters<typeof compareVehicleBudget>[0]>) =>
  compareVehicleBudget({ ...HOUSEHOLD, vehicleRunningCosts: 0, ...overrides });

describe("vehicleBudgetStatus", () => {
  it("is a SHORTFALL when running costs push the month below zero", () => {
    // The plan's own observation: running 5 triệu leaves −1.498.818 ₫.
    const status = vehicleBudgetStatus(budget({ vehicleRunningCosts: 5_000_000 }));
    expect(status.tone).toBe("shortfall");
    expect(status.kind).toBe("short");
    expect(status.shortfall).toBe(1_498_818);
  });

  it("is MET when a surplus remains and running costs are counted", () => {
    // Running 2 triệu leaves +1.501.182 ₫ — the other half of the pair.
    const status = vehicleBudgetStatus(budget({ vehicleRunningCosts: 2_000_000 }));
    expect(status.tone).toBe("met");
    expect(status.kind).toBe("surplus");
    expect(status.surplus).toBe(1_501_182);
  });

  it("is CAUTION, not met, while running costs are excluded", () => {
    // The shipped default: running 0 and a positive remainder. A remainder
    // that omits fuel and insurance cannot be reported as met.
    const status = vehicleBudgetStatus(budget({}));
    expect(status.tone).toBe("caution");
    expect(status.kind).toBe("runningExcluded");
    expect(status.surplus).toBe(3_501_182);
  });

  it("stays a SHORTFALL when running costs are excluded, because they only lower it", () => {
    // A proven deficit is not softened to amber by an omitted cost: adding the
    // omitted cost could only make it deeper.
    const status = vehicleBudgetStatus(budget({ vehiclePayment: 14_000_000 }));
    expect(status.tone).toBe("shortfall");
    expect(status.kind).toBe("short");
    expect(status.runningExcluded).toBe(true);
  });

  it("is CAUTION at an exact zero remainder", () => {
    const status = vehicleBudgetStatus(
      budget({ vehiclePayment: 10_000_000, vehicleRunningCosts: 2_000_000 }),
    );
    expect(status.tone).toBe("caution");
    expect(status.kind).toBe("exactZero");
  });

  it("names a month that was ALREADY short before the car", () => {
    const status = vehicleBudgetStatus(
      budget({ essentialExpenses: 36_000_000, vehicleRunningCosts: 1_000_000 }),
    );
    expect(status.tone).toBe("shortfall");
    expect(status.kind).toBe("shortBefore");
    // Both figures, so the page can say how much was short BEFORE the car.
    expect(status.shortfallBefore).toBe(2_000_000);
  });

  it("does not conclude a surplus while essential costs are unknown", () => {
    const status = vehicleBudgetStatus(
      budget({ essentialExpenses: undefined, vehicleRunningCosts: 2_000_000 }),
    );
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("limited");
  });

  it("does NOT conclude a shortfall with essentials unknown — they are essential, not optional", () => {
    // The approved plan: missing essential living costs → unknown, even when
    // the partial figures alone already go negative. The lower-bound argument
    // is authorised only for OPTIONAL omitted costs (running costs).
    const status = vehicleBudgetStatus(
      budget({
        essentialExpenses: undefined,
        vehiclePayment: 45_000_000,
        vehicleRunningCosts: 1_000_000,
      }),
    );
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("limited");
    expect(status.limited).toBe(true);
  });

  it("does not call a month short BEFORE the car while essentials are unknown", () => {
    const status = vehicleBudgetStatus(
      budget({ essentialExpenses: undefined, otherDebts: 45_000_000 }),
    );
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("limited");
  });

  it("is UNKNOWN when the instalment cannot be priced, never a free car", () => {
    const status = vehicleBudgetStatus(budget({ vehiclePayment: null }));
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("paymentUnknown");
  });

  it("is UNKNOWN with no usable household month", () => {
    const status = vehicleBudgetStatus(null);
    expect(status.tone).toBe("unknown");
    expect(status.kind).toBe("unknown");
  });
});
