import { describe, it, expect } from "vitest";
import { computeApr, type AprInput } from "@/lib/calc/apr";
import { pmt } from "@/lib/calc/finance";

// 2 tỷ over 20 years at 8,5%, with 30 triệu of fees paid at drawdown.
const BASE: AprInput = {
  amount: 2_000_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
  upfrontFees: 30_000_000,
};

function apr(input: AprInput) {
  const result = computeApr(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeApr — the loan itself", () => {
  it("charges interest on the principal, and agrees with pmt()", () => {
    const result = apr(BASE);
    expect(result.principal).toBe(2_000_000_000);
    expect(result.monthlyPayment).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 240, 2_000_000_000)),
      6,
    );
  });

  it("keeps the loan identity", () => {
    const result = apr(BASE);
    expect(result.totalPaid - result.totalInterest).toBeCloseTo(
      result.principal,
      2,
    );
    expect(result.totalCost).toBeCloseTo(
      result.totalInterest + result.totalFees,
      6,
    );
  });

  it("reduces the net proceeds by the fees paid up front", () => {
    const result = apr(BASE);
    expect(result.netProceeds).toBe(1_970_000_000);
    expect(result.totalFees).toBe(30_000_000);
  });
});

describe("computeApr — no fees means APR equals the contract rate", () => {
  it("returns the nominal rate back when nothing is charged", () => {
    const result = apr({ ...BASE, upfrontFees: 0 });
    expect(result.aprPercent).toBeCloseTo(8.5, 6);
    expect(result.aprSpreadPoints).toBeCloseTo(0, 6);
    expect(result.netProceeds).toBe(2_000_000_000);
  });

  it("holds at a 0% rate too", () => {
    const result = apr({ ...BASE, annualRatePercent: 0, upfrontFees: 0 });
    // Six places, not more: `bisect` stops at a 1e-10 bracket on the MONTHLY
    // rate, which is ±1,2e-7 once scaled to an annual percentage. That is the
    // solver's precision, not an error in the cash flows.
    expect(result.aprPercent).toBeCloseTo(0, 6);
    expect(result.totalInterest).toBeCloseTo(0, 4);
  });
});

describe("computeApr — fees paid up front", () => {
  it("pushes the APR above the contract rate", () => {
    const result = apr(BASE);
    expect(result.aprPercent!).toBeGreaterThan(8.5);
    expect(result.aprSpreadPoints!).toBeGreaterThan(0);
  });

  it("does not change the payment", () => {
    // The whole mechanism: fees change what you receive, not what you pay.
    const withFees = apr(BASE);
    const without = apr({ ...BASE, upfrontFees: 0 });
    expect(withFees.monthlyPayment).toBeCloseTo(without.monthlyPayment, 6);
    expect(withFees.netProceeds).toBeLessThan(without.netProceeds);
  });

  it("rises with the size of the fee", () => {
    let previous = 8.5;
    for (const upfrontFees of [10_000_000, 30_000_000, 80_000_000]) {
      const value = apr({ ...BASE, upfrontFees }).aprPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("round-trips: the solved rate reproduces the proceeds", () => {
    // Independent check of solveRate's answer, by a formula it does not use:
    // discount the payments at the solved monthly rate and the present value
    // must be the net proceeds. Checked to within 100 ₫ on 1,97 tỷ — a
    // relative error of 5e-8, set by `bisect`'s 1e-10 bracket on the rate.
    const result = apr(BASE);
    const r = result.periodicRate!;
    const presentValue = result.monthlyPayment * ((1 - (1 + r) ** -240) / r);
    expect(Math.abs(presentValue - result.netProceeds)).toBeLessThan(100);
  });

  it("treats points as an upfront fee on the principal", () => {
    const byPoints = apr({ ...BASE, upfrontFees: 0, pointsPercent: 1.5 });
    expect(byPoints.pointsCost).toBeCloseTo(30_000_000, 6);
    // 1,5% of 2 tỷ is the same 30 triệu, so the APR must match.
    expect(byPoints.aprPercent).toBeCloseTo(apr(BASE).aprPercent!, 8);
  });

  it("adds points and cash fees together", () => {
    const result = apr({ ...BASE, pointsPercent: 1 });
    expect(result.netProceeds).toBe(2_000_000_000 - 30_000_000 - 20_000_000);
    expect(result.totalFees).toBeCloseTo(50_000_000, 6);
  });
});

describe("computeApr — fees rolled into the loan", () => {
  it("raises the principal and the payment, not the proceeds", () => {
    const financed = apr({
      ...BASE,
      upfrontFees: 0,
      financedFees: 30_000_000,
    });
    expect(financed.principal).toBe(2_030_000_000);
    expect(financed.netProceeds).toBe(2_030_000_000);
    expect(financed.monthlyPayment).toBeGreaterThan(
      apr({ ...BASE, upfrontFees: 0 }).monthlyPayment,
    );
  });

  it("leaves the APR at the contract rate when nothing is paid up front", () => {
    // Borrowing the fee is still borrowing at the contract rate: the cash
    // flows are a bigger loan on the same terms, so the rate is unchanged.
    const financed = apr({
      ...BASE,
      upfrontFees: 0,
      financedFees: 30_000_000,
    });
    expect(financed.aprPercent).toBeCloseTo(8.5, 6);
  });

  it("still counts the financed fee in the total cost", () => {
    const financed = apr({
      ...BASE,
      upfrontFees: 0,
      financedFees: 30_000_000,
    });
    expect(financed.totalFees).toBe(30_000_000);
    expect(financed.totalCost).toBeCloseTo(
      financed.totalInterest + 30_000_000,
      6,
    );
  });

  it("costs more in interest than paying the same fee up front", () => {
    const upfront = apr(BASE);
    const financed = apr({
      ...BASE,
      upfrontFees: 0,
      financedFees: 30_000_000,
    });
    expect(financed.totalInterest).toBeGreaterThan(upfront.totalInterest);
  });

  it("charges points on the grown principal when fees are financed", () => {
    const result = apr({
      ...BASE,
      upfrontFees: 0,
      financedFees: 30_000_000,
      pointsPercent: 1,
    });
    expect(result.pointsCost).toBeCloseTo(20_300_000, 6);
  });
});

describe("computeApr — the effective rate alongside", () => {
  it("exceeds the nominal APR, because APR is not compounded", () => {
    const result = apr(BASE);
    expect(result.aprEffectivePercent!).toBeGreaterThan(result.aprPercent!);
  });

  it("widens as the rate rises", () => {
    const low = apr({ ...BASE, annualRatePercent: 5 });
    const high = apr({ ...BASE, annualRatePercent: 20 });
    expect(
      high.aprEffectivePercent! - high.aprPercent!,
    ).toBeGreaterThan(low.aprEffectivePercent! - low.aprPercent!);
  });
});

describe("computeApr — repaying early", () => {
  it("spreads the fees over fewer months, so the APR is higher", () => {
    const toTerm = apr(BASE);
    const early = apr({ ...BASE, payoffMonths: 36 });
    expect(early.payoffAprPercent!).toBeGreaterThan(toTerm.aprPercent!);
  });

  it("gets worse the sooner you repay", () => {
    let previous = 0;
    for (const payoffMonths of [120, 60, 36, 12]) {
      const value = apr({ ...BASE, payoffMonths }).payoffAprPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("reports the balance actually outstanding at that month", () => {
    const result = apr({ ...BASE, payoffMonths: 36 });
    expect(result.payoffMonths).toBe(36);
    expect(result.payoffBalance!).toBeLessThan(2_000_000_000);
    expect(result.payoffBalance!).toBeGreaterThan(0);
  });

  it("matches the full-term APR when the payoff is the term", () => {
    const result = apr({ ...BASE, payoffMonths: 240 });
    expect(result.payoffBalance).toBe(0);
    expect(result.payoffAprPercent).toBeCloseTo(result.aprPercent!, 6);
  });

  it("clamps a payoff past the term", () => {
    const result = apr({ ...BASE, payoffMonths: 600 });
    expect(result.payoffMonths).toBe(240);
    expect(result.payoffAprPercent).toBeCloseTo(apr(BASE).aprPercent!, 6);
  });

  it("leaves the block null when no early payoff was asked about", () => {
    const result = apr(BASE);
    expect(result.payoffMonths).toBeNull();
    expect(result.payoffBalance).toBeNull();
    expect(result.payoffAprPercent).toBeNull();
  });

  it("equals the contract rate on an early payoff with no fees", () => {
    const result = apr({ ...BASE, upfrontFees: 0, payoffMonths: 36 });
    expect(result.payoffAprPercent).toBeCloseTo(8.5, 6);
  });
});

describe("computeApr — realistic terms and rejection", () => {
  it("solves at 240, 300 and 360 monthly periods", () => {
    // Pinned: solveRate's bracket once overflowed past ~24 years and every
    // long mortgage came back unsolvable. See docs §8.
    for (const termMonths of [240, 300, 360]) {
      const result = apr({ ...BASE, termMonths });
      expect(result.aprPercent).not.toBeNull();
      expect(result.aprPercent!).toBeGreaterThan(8.5);
    }
  });

  it("rejects fees that swallow the whole loan", () => {
    expect(
      computeApr({ ...BASE, upfrontFees: 2_000_000_000 }),
    ).toBeNull();
    expect(computeApr({ ...BASE, pointsPercent: 100 })).toBeNull();
    expect(
      computeApr({ ...BASE, upfrontFees: 0, pointsPercent: 99.9 }),
    ).not.toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeApr({ ...BASE, amount: 0 })).toBeNull();
    expect(computeApr({ ...BASE, amount: -1 })).toBeNull();
    expect(computeApr({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeApr({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeApr({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(computeApr({ ...BASE, upfrontFees: -1 })).toBeNull();
    expect(computeApr({ ...BASE, financedFees: -1 })).toBeNull();
    expect(computeApr({ ...BASE, pointsPercent: -1 })).toBeNull();
    expect(computeApr({ ...BASE, payoffMonths: 0 })).toBeNull();
    expect(computeApr({ ...BASE, payoffMonths: 36.5 })).toBeNull();
    expect(computeApr({ ...BASE, amount: Number.NaN })).toBeNull();
  });
});
