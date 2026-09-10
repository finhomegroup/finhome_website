import { describe, it, expect } from "vitest";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { computeLoan } from "@/lib/calc/loan";

// A household on 50 triệu/tháng gross, 5 triệu of existing debt service,
// 600 triệu saved, borrowing at 8,5% over 20 years.
const BASE: AffordabilityInput = {
  monthlyIncome: 50_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
};

function afford(input: AffordabilityInput) {
  const result = computeAffordability(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeAffordability — the two limits", () => {
  it("computes each limit from gross income", () => {
    const result = afford(BASE);
    expect(result.housingLimit).toBeCloseTo(20_000_000, 6);
    // 50% of 50 triệu is 25 triệu, less 5 triệu of existing debts.
    expect(result.totalDebtLimit).toBeCloseTo(20_000_000, 6);
  });

  it("takes the smaller of the two", () => {
    // Heavier existing debts make the total-debt limit bind.
    const result = afford({ ...BASE, monthlyDebts: 10_000_000 });
    expect(result.totalDebtLimit).toBeCloseTo(15_000_000, 6);
    expect(result.affordableHousingPayment).toBeCloseTo(15_000_000, 6);
    expect(result.bindingLimit).toBe("totalDebt");
  });

  it("lets the housing limit bind when there are no other debts", () => {
    const result = afford({ ...BASE, monthlyDebts: 0 });
    expect(result.housingLimit).toBeCloseTo(20_000_000, 6);
    expect(result.totalDebtLimit).toBeCloseTo(25_000_000, 6);
    expect(result.affordableHousingPayment).toBeCloseTo(20_000_000, 6);
    expect(result.bindingLimit).toBe("housing");
  });

  it("resolves a tie toward the housing limit", () => {
    // The defaults make the two limits equal at 5 triệu of debts.
    const result = afford(BASE);
    expect(result.housingLimit).toBeCloseTo(result.totalDebtLimit, 6);
    expect(result.bindingLimit).toBe("housing");
  });

  it("honours custom ratios", () => {
    const result = afford({
      ...BASE,
      housingRatioPercent: 30,
      totalDebtRatioPercent: 45,
    });
    expect(result.housingLimit).toBeCloseTo(15_000_000, 6);
    expect(result.totalDebtLimit).toBeCloseTo(17_500_000, 6);
    expect(result.affordableHousingPayment).toBeCloseTo(15_000_000, 6);
  });
});

describe("computeAffordability — inverting into a loan", () => {
  it("round-trips against computeLoan", () => {
    // The whole point: the loan it names must produce the instalment it used.
    const result = afford(BASE);
    const loan = computeLoan({
      amount: result.maxLoan,
      annualRatePercent: 8.5,
      termMonths: 240,
    })!;
    expect(loan.monthlyPrincipalInterest).toBeCloseTo(
      result.affordablePrincipalInterest,
      4,
    );
  });

  it("adds the deposit to reach a price", () => {
    const result = afford(BASE);
    expect(result.maxPrice).toBeCloseTo(result.maxLoan + 600_000_000, 6);
    expect(result.downPaymentPercent).toBeCloseTo(
      (600_000_000 / result.maxPrice) * 100,
      10,
    );
  });

  it("supports a bigger loan on a longer term", () => {
    const twenty = afford(BASE).maxLoan;
    const twentyFive = afford({ ...BASE, termMonths: 300 }).maxLoan;
    expect(twentyFive).toBeGreaterThan(twenty);
  });

  it("supports a smaller loan at a higher rate", () => {
    const cheap = afford({ ...BASE, annualRatePercent: 7 }).maxLoan;
    const dear = afford({ ...BASE, annualRatePercent: 12 }).maxLoan;
    expect(dear).toBeLessThan(cheap);
  });

  it("handles a 0% rate as a straight division", () => {
    const result = afford({ ...BASE, annualRatePercent: 0 });
    expect(result.maxLoan).toBeCloseTo(
      result.affordablePrincipalInterest * 240,
      4,
    );
  });
});

describe("computeAffordability — other housing costs", () => {
  it("takes them off the budget before inverting", () => {
    const withCosts = afford({ ...BASE, monthlyHousingCosts: 3_000_000 });
    expect(withCosts.affordableHousingPayment).toBeCloseTo(20_000_000, 6);
    expect(withCosts.affordablePrincipalInterest).toBeCloseTo(17_000_000, 6);
    expect(withCosts.maxLoan).toBeLessThan(afford(BASE).maxLoan);
  });

  it("scales the loan down in proportion to the instalment left", () => {
    const plain = afford(BASE);
    const withCosts = afford({ ...BASE, monthlyHousingCosts: 3_000_000 });
    expect(withCosts.maxLoan / plain.maxLoan).toBeCloseTo(17 / 20, 6);
  });
});

describe("computeAffordability — when the answer is nothing", () => {
  it("returns a zero loan rather than null when debts eat the limit", () => {
    // A real answer the borrower needs, not an error.
    const result = afford({ ...BASE, monthlyDebts: 30_000_000 });
    expect(result.totalDebtLimit).toBeLessThan(0);
    expect(result.affordableHousingPayment).toBe(0);
    expect(result.maxLoan).toBe(0);
    expect(result.noRoom).toBe(true);
    expect(result.bindingLimit).toBe("totalDebt");
  });

  it("returns a zero loan when housing costs alone use the budget", () => {
    const result = afford({ ...BASE, monthlyHousingCosts: 25_000_000 });
    expect(result.affordablePrincipalInterest).toBe(0);
    expect(result.maxLoan).toBe(0);
    expect(result.noRoom).toBe(true);
  });

  it("still reports the price as the deposit alone when no loan is possible", () => {
    const result = afford({ ...BASE, monthlyDebts: 30_000_000 });
    expect(result.maxPrice).toBe(600_000_000);
    expect(result.downPaymentPercent).toBeCloseTo(100, 10);
  });

  it("reports a null deposit share when there is no price at all", () => {
    const result = afford({
      ...BASE,
      monthlyDebts: 30_000_000,
      downPayment: 0,
    });
    expect(result.maxPrice).toBe(0);
    expect(result.downPaymentPercent).toBeNull();
  });

  it("is not noRoom in the ordinary case", () => {
    expect(afford(BASE).noRoom).toBe(false);
  });
});

describe("computeAffordability — realistic terms and rejection", () => {
  it("survives 240, 300 and 360 monthly periods", () => {
    for (const termMonths of [240, 300, 360]) {
      expect(afford({ ...BASE, termMonths }).maxLoan).toBeGreaterThan(0);
    }
  });

  it("returns null rather than a guess", () => {
    expect(computeAffordability({ ...BASE, monthlyIncome: 0 })).toBeNull();
    expect(computeAffordability({ ...BASE, monthlyIncome: -1 })).toBeNull();
    expect(computeAffordability({ ...BASE, monthlyDebts: -1 })).toBeNull();
    expect(computeAffordability({ ...BASE, downPayment: -1 })).toBeNull();
    expect(computeAffordability({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeAffordability({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeAffordability({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(
      computeAffordability({ ...BASE, monthlyHousingCosts: -1 }),
    ).toBeNull();
    expect(computeAffordability({ ...BASE, monthlyIncome: Number.NaN })).toBeNull();
  });

  it("rejects a ratio above 100%", () => {
    expect(
      computeAffordability({ ...BASE, housingRatioPercent: 101 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...BASE, totalDebtRatioPercent: 101 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...BASE, housingRatioPercent: -1 }),
    ).toBeNull();
  });
});
