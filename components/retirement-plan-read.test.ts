// The one place /cong-cu/ke-hoach-huu-tri/ changes a unit: the two monthly
// incomes become the engine's year, exactly, under the shared money rule.
import { describe, expect, it } from "vitest";
import { readRoutePlan } from "@/components/retirement-plan-read";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

describe("readRoutePlan", () => {
  it("turns both monthly incomes into the engine's year, exactly", () => {
    const { input, invalid } = readRoutePlan(C.defaults);
    expect(Object.values(invalid).some(Boolean)).toBe(false);
    expect(input?.desiredAnnualSpending).toBe(96_000_000);
    expect(input?.otherAnnualIncome).toBe(48_000_000);
    // A typed fraction survives the change of unit.
    expect(readRoutePlan({ ...C.defaults, desiredMonthlySpending: "8.000.000,5" }).input?.desiredAnnualSpending).toBe(96_000_006);
  });

  it("flags a monthly field the shared money rule refuses, and computes nothing", () => {
    for (const raw of ["", "-1", "-1.000.000", "abc"]) {
      for (const key of ["desiredMonthlySpending", "otherMonthlyIncome"] as const) {
        const { input, invalid } = readRoutePlan({ ...C.defaults, [key]: raw });
        expect(input, `${key}=${raw}`).toBeNull();
        expect(invalid[key], `${key}=${raw}`).toBe(true);
        const others = Object.entries(invalid).filter(([k]) => k !== key);
        expect(others.some(([, bad]) => bad), `${key}=${raw}`).toBe(false);
      }
    }
  });

  it("never falls back to the yearly keys", () => {
    // The shared scenario has only the yearly keys: both monthly fields are missing.
    const shared = readRoutePlan(L.defaults);
    expect(shared.input).toBeNull();
    expect(shared.invalid.desiredMonthlySpending).toBe(true);
    expect(shared.invalid.otherMonthlyIncome).toBe(true);
    // And a stale yearly key beside the monthly ones is ignored.
    const stale = readRoutePlan({ ...C.defaults, desiredAnnualSpending: "1" });
    expect(stale.input?.desiredAnnualSpending).toBe(96_000_000);
  });
});
