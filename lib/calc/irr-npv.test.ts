import { describe, it, expect } from "vitest";
import {
  computeIrrNpv,
  netPresentValue,
  type IrrNpvInput,
} from "@/lib/calc/irr-npv";

// A textbook project: 1 tỷ out, then 300 triệu a year for five years.
const FLOWS = [
  -1_000_000_000,
  300_000_000,
  300_000_000,
  300_000_000,
  300_000_000,
  300_000_000,
];
const BASE: IrrNpvInput = { flows: FLOWS, discountRatePercent: 10 };

function project(input: IrrNpvInput) {
  const result = computeIrrNpv(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("netPresentValue — the period-0 convention", () => {
  it("does not discount index 0", () => {
    expect(netPresentValue([100], 0.1)).toBe(100);
    expect(netPresentValue([-100, 110], 0.1)).toBeCloseTo(0, 10);
  });

  it("discounts index 1 exactly once", () => {
    expect(netPresentValue([0, 110], 0.1)).toBeCloseTo(100, 10);
    expect(netPresentValue([0, 0, 121], 0.1)).toBeCloseTo(100, 10);
  });

  it("is the plain sum at a 0% rate", () => {
    expect(netPresentValue(FLOWS, 0)).toBeCloseTo(500_000_000, 6);
  });
});

describe("computeIrrNpv — NPV", () => {
  it("matches a hand-computed reference", () => {
    // 300 triệu × annuity factor at 10% over 5 years (3,790786769…) minus 1 tỷ.
    const annuity = (1 - 1.1 ** -5) / 0.1;
    expect(project(BASE).npv).toBeCloseTo(300_000_000 * annuity - 1e9, 4);
    expect(project(BASE).npv).toBeCloseTo(137_236_031, 0);
  });

  it("falls as the discount rate rises, and crosses zero at the IRR", () => {
    const low = project({ ...BASE, discountRatePercent: 5 }).npv;
    const high = project({ ...BASE, discountRatePercent: 20 }).npv;
    expect(low).toBeGreaterThan(high);
    expect(low).toBeGreaterThan(0);
    expect(high).toBeLessThan(0);
    // At exactly the IRR, NPV is zero — the defining property. Checked to
    // within 1 ₫ on a 1 tỷ project: `bisect` stops at a 1e-10 bracket on the
    // rate, which is the precision of the answer, not an error in it.
    const irr = project(BASE).irrPercent!;
    expect(
      Math.abs(project({ ...BASE, discountRatePercent: irr }).npv),
    ).toBeLessThan(1);
  });

  it("sums the flows without discounting", () => {
    const result = project(BASE);
    expect(result.totalFlows).toBeCloseTo(500_000_000, 6);
    expect(result.totalInflows).toBeCloseTo(1_500_000_000, 6);
    expect(result.totalOutflows).toBeCloseTo(1_000_000_000, 6);
  });

  it("reports the profitability index against the present value of outflows", () => {
    const result = project(BASE);
    expect(result.profitabilityIndex).toBeCloseTo(
      (result.npv + 1_000_000_000) / 1_000_000_000,
      6,
    );
    // Above 1 exactly when NPV is positive.
    expect(result.profitabilityIndex! > 1).toBe(result.npv > 0);
  });
});

describe("computeIrrNpv — IRR", () => {
  it("finds the rate that zeroes NPV", () => {
    const result = project(BASE);
    expect(result.irrPercent).toBeCloseTo(15.238_2, 3);
    // Within 1 ₫ on a 1 tỷ project — see the tolerance note above.
    expect(
      Math.abs(netPresentValue(FLOWS, result.irrPercent! / 100)),
    ).toBeLessThan(1);
  });

  it("is unaffected by the discount rate", () => {
    // IRR is a property of the flows alone.
    const a = project({ ...BASE, discountRatePercent: 3 }).irrPercent;
    const b = project({ ...BASE, discountRatePercent: 30 }).irrPercent;
    expect(a).toBeCloseTo(b!, 8);
  });

  it("handles a simple doubling", () => {
    expect(
      project({ flows: [-100, 200], discountRatePercent: 10 }).irrPercent,
    ).toBeCloseTo(100, 6);
  });

  it("is 0% when the flows only return the outlay", () => {
    expect(
      project({ flows: [-100, 50, 50], discountRatePercent: 10 }).irrPercent,
    ).toBeCloseTo(0, 6);
  });

  it("is negative on a project that loses money", () => {
    const result = project({
      flows: [-1_000_000_000, 100_000_000, 100_000_000],
      discountRatePercent: 10,
    });
    expect(result.irrPercent!).toBeLessThan(0);
    expect(result.npv).toBeLessThan(0);
  });

  it("counts one sign change on a conventional project", () => {
    expect(project(BASE).signChanges).toBe(1);
  });

  it("declines to name an IRR when the flows change sign twice", () => {
    // Two sign changes admit more than one rate satisfying NPV = 0, so
    // reporting one of them as "the" IRR would be false.
    const result = project({
      flows: [-1_000, 3_000, -2_500],
      discountRatePercent: 10,
    });
    expect(result.signChanges).toBe(2);
    expect(result.irrPercent).toBeNull();
    // The rest of the result is still valid.
    expect(result.npv).not.toBeNull();
    expect(result.modifiedIrrPercent).not.toBeNull();
  });

  it("declines when every flow has the same sign", () => {
    const allPositive = project({
      flows: [100, 100, 100],
      discountRatePercent: 10,
    });
    expect(allPositive.signChanges).toBe(0);
    expect(allPositive.irrPercent).toBeNull();
    const allNegative = project({
      flows: [-100, -100, -100],
      discountRatePercent: 10,
    });
    expect(allNegative.irrPercent).toBeNull();
  });

  it("ignores zero flows when counting sign changes", () => {
    expect(
      project({ flows: [-100, 0, 0, 150], discountRatePercent: 10 })
        .signChanges,
    ).toBe(1);
  });
});

describe("computeIrrNpv — MIRR", () => {
  it("sits between the discount rate and the IRR on a good project", () => {
    const result = project(BASE);
    expect(result.modifiedIrrPercent!).toBeGreaterThan(10);
    expect(result.modifiedIrrPercent!).toBeLessThan(result.irrPercent!);
  });

  it("equals the IRR when reinvestment happens at the IRR", () => {
    // The assumption plain IRR makes silently.
    const irr = project(BASE).irrPercent!;
    const result = project({ ...BASE, reinvestRatePercent: irr });
    expect(result.modifiedIrrPercent).toBeCloseTo(irr, 4);
  });

  it("rises with the reinvestment rate", () => {
    const low = project({ ...BASE, reinvestRatePercent: 3 })
      .modifiedIrrPercent!;
    const high = project({ ...BASE, reinvestRatePercent: 20 })
      .modifiedIrrPercent!;
    expect(high).toBeGreaterThan(low);
  });

  it("is defined even when IRR is not", () => {
    // The reason MIRR is here at all.
    const result = project({
      flows: [-1_000, 3_000, -2_500],
      discountRatePercent: 10,
    });
    expect(result.irrPercent).toBeNull();
    expect(result.modifiedIrrPercent).not.toBeNull();
  });

  it("is null when there is nothing on one side", () => {
    expect(
      project({ flows: [100, 100], discountRatePercent: 10 })
        .modifiedIrrPercent,
    ).toBeNull();
    expect(
      project({ flows: [-100, -100], discountRatePercent: 10 })
        .modifiedIrrPercent,
    ).toBeNull();
  });
});

describe("computeIrrNpv — payback", () => {
  it("interpolates within the period that closes the gap", () => {
    // 1 tỷ recovered at 300 triệu a year: three full years leave 100 triệu,
    // which is a third of year four.
    expect(project(BASE).paybackPeriod).toBeCloseTo(3 + 100 / 300, 8);
  });

  it("takes longer on discounted flows", () => {
    const result = project(BASE);
    expect(result.discountedPaybackPeriod!).toBeGreaterThan(
      result.paybackPeriod!,
    );
  });

  it("returns 0 when the flows start out non-negative", () => {
    expect(
      project({ flows: [100, 100], discountRatePercent: 10 }).paybackPeriod,
    ).toBe(0);
  });

  it("is exact when a period closes the gap precisely", () => {
    expect(
      project({ flows: [-100, 50, 50], discountRatePercent: 10 })
        .paybackPeriod,
    ).toBeCloseTo(2, 10);
  });

  it("returns null when the outlay is never recovered", () => {
    const result = project({
      flows: [-1_000_000_000, 100_000_000, 100_000_000],
      discountRatePercent: 10,
    });
    expect(result.paybackPeriod).toBeNull();
    expect(result.discountedPaybackPeriod).toBeNull();
  });

  it("can recover undiscounted but not discounted", () => {
    // Payback ignores the cost of capital; discounted payback does not.
    const result = project({
      flows: [-1_000, 300, 300, 300, 200],
      discountRatePercent: 25,
    });
    expect(result.paybackPeriod).not.toBeNull();
    expect(result.discountedPaybackPeriod).toBeNull();
  });
});

describe("computeIrrNpv — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeIrrNpv({ flows: [], discountRatePercent: 10 })).toBeNull();
    expect(computeIrrNpv({ flows: [-100], discountRatePercent: 10 })).toBeNull();
    expect(
      computeIrrNpv({ flows: [-100, Number.NaN], discountRatePercent: 10 }),
    ).toBeNull();
    expect(
      computeIrrNpv({ flows: FLOWS, discountRatePercent: -100 }),
    ).toBeNull();
    expect(
      computeIrrNpv({ flows: FLOWS, discountRatePercent: Number.NaN }),
    ).toBeNull();
    expect(
      computeIrrNpv({
        flows: FLOWS,
        discountRatePercent: 10,
        reinvestRatePercent: Number.NaN,
      }),
    ).toBeNull();
  });

  it("allows a negative discount rate above −100%", () => {
    expect(
      computeIrrNpv({ flows: FLOWS, discountRatePercent: -5 }),
    ).not.toBeNull();
  });
});
