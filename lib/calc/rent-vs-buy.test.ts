import { describe, it, expect } from "vitest";
import { compareRentVsBuy, type RentVsBuyInput } from "@/lib/calc/rent-vs-buy";
import { pmt } from "@/lib/calc/finance";

// Buy a 3 tỷ flat with 900 triệu down at 8,5% over 20 years, or rent the
// same flat for 15 triệu/tháng. Compared over 10 years.
const BASE: RentVsBuyInput = {
  price: 3_000_000_000,
  downPayment: 900_000_000,
  purchaseCosts: 100_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyOwnerCosts: 2_500_000,
  priceGrowthPercent: 5,
  sellingCostPercent: 3,
  monthlyRent: 15_000_000,
  rentGrowthPercent: 4,
  rentDeposit: 30_000_000,
  investmentReturnPercent: 6,
  horizonMonths: 120,
};

function compare(input: RentVsBuyInput) {
  const result = compareRentVsBuy(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("compareRentVsBuy — the buying side", () => {
  it("borrows the price less the deposit and agrees with pmt()", () => {
    const result = compare(BASE);
    expect(result.loanAmount).toBe(2_100_000_000);
    expect(result.monthlyPayment).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 240, 2_100_000_000)),
      6,
    );
  });

  it("counts the deposit and purchase costs as cash committed", () => {
    expect(compare(BASE).buyerUpfront).toBe(1_000_000_000);
  });

  it("splits the payments into interest and principal", () => {
    const result = compare(BASE);
    expect(result.totalInterest + result.totalPrincipal).toBeCloseTo(
      result.monthlyPayment * 120,
      2,
    );
    // Ten years into a twenty-year loan, interest still dominates.
    expect(result.totalInterest).toBeGreaterThan(result.totalPrincipal);
  });

  it("leaves a balance still owed at a horizon inside the term", () => {
    const result = compare(BASE);
    expect(result.loanBalance).toBeGreaterThan(0);
    expect(result.loanBalance).toBeCloseTo(
      2_100_000_000 - result.totalPrincipal,
      2,
    );
  });

  it("grows the house price and charges the exit cost on the grown price", () => {
    const result = compare(BASE);
    // 5%/năm compounded monthly-equivalent over 10 years.
    expect(result.houseValue).toBeCloseTo(3_000_000_000 * 1.05 ** 10, 0);
    expect(result.sellingCost).toBeCloseTo(result.houseValue * 0.03, 6);
    expect(result.sellingCost).toBeGreaterThan(3_000_000_000 * 0.03);
  });

  it("nets the buyer's worth as house less loan less exit cost", () => {
    const result = compare(BASE);
    expect(result.buy.netWorth).toBeCloseTo(
      result.houseValue - result.loanBalance - result.sellingCost,
      6,
    );
  });

  it("counts principal as worth, not as cost", () => {
    // The first thing the naive comparison gets wrong. Net cost must be well
    // below everything paid out, because the principal came back as equity.
    const result = compare(BASE);
    expect(result.buy.netCost).toBeLessThan(result.buy.totalPaid);
    expect(result.buy.netCost).toBeCloseTo(
      result.buy.totalPaid - result.buy.netWorth,
      6,
    );
  });

  it("needs no loan when paying cash", () => {
    const result = compare({ ...BASE, downPayment: 3_000_000_000 });
    expect(result.loanAmount).toBe(0);
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.loanBalance).toBe(0);
  });
});

describe("compareRentVsBuy — the renting side", () => {
  it("grows the rent once a year, not every month", () => {
    // Twelve months at the starting rent, then a step up.
    const oneYear = compare({ ...BASE, horizonMonths: 12 });
    expect(oneYear.totalRent).toBeCloseTo(15_000_000 * 12, 6);
    const thirteen = compare({ ...BASE, horizonMonths: 13 });
    expect(thirteen.totalRent).toBeCloseTo(
      15_000_000 * 12 + 15_000_000 * 1.04,
      6,
    );
  });

  it("invests exactly what the buyer committed up front", () => {
    const result = compare(BASE);
    expect(result.investmentValue).toBeCloseTo(1_000_000_000 * 1.06 ** 10, 0);
    expect(result.investmentGain).toBeCloseTo(
      result.investmentValue - 1_000_000_000,
      6,
    );
  });

  it("treats the rental deposit as worth, not cost — it comes back", () => {
    const result = compare(BASE);
    expect(result.rent.netWorth).toBeCloseTo(
      result.investmentValue + 30_000_000,
      6,
    );
    // Adding a bigger rental deposit does not change the renter's net cost.
    const bigger = compare({ ...BASE, rentDeposit: 90_000_000 });
    expect(bigger.rent.netCost).toBeCloseTo(result.rent.netCost, 6);
  });

  it("makes the renter's net cost the rent, less the investment gain", () => {
    const result = compare(BASE);
    expect(result.rent.netCost).toBeCloseTo(
      result.totalRent - result.investmentGain,
      6,
    );
  });

  it("swings the comparison on the investment return alone", () => {
    // The second thing the naive comparison gets wrong, and the biggest one.
    const idle = compare({ ...BASE, investmentReturnPercent: 0 });
    const invested = compare({ ...BASE, investmentReturnPercent: 9 });
    expect(invested.rent.netCost).toBeLessThan(idle.rent.netCost);
    expect(invested.advantageOfBuying).toBeLessThan(
      idle.advantageOfBuying,
    );
  });
});

describe("compareRentVsBuy — the verdict", () => {
  it("is the difference between the two net costs", () => {
    const result = compare(BASE);
    expect(result.advantageOfBuying).toBeCloseTo(
      result.rent.netCost - result.buy.netCost,
      6,
    );
    expect(result.buyingWins).toBe(result.advantageOfBuying > 0);
  });

  it("favours renting over a very short horizon", () => {
    // Purchase costs and the exit cost have not been outgrown yet.
    const result = compare({ ...BASE, horizonMonths: 12 });
    expect(result.buyingWins).toBe(false);
    expect(result.breakEvenMonth).toBeNull();
  });

  it("favours buying over a long horizon in a rising market", () => {
    const result = compare({ ...BASE, horizonMonths: 240 });
    expect(result.buyingWins).toBe(true);
    expect(result.breakEvenMonth).not.toBeNull();
  });

  it("finds a break-even month that is genuinely the crossing point", () => {
    const result = compare({ ...BASE, horizonMonths: 240 });
    const month = result.breakEvenMonth!;
    expect(
      compare({ ...BASE, horizonMonths: month }).buyingWins,
    ).toBe(true);
    expect(
      compare({ ...BASE, horizonMonths: month - 1 }).buyingWins,
    ).toBe(false);
  });

  it("turns against buying in a falling market", () => {
    const result = compare({
      ...BASE,
      priceGrowthPercent: -3,
      horizonMonths: 240,
    });
    expect(result.houseValue).toBeLessThan(3_000_000_000);
    expect(result.buyingWins).toBe(false);
  });

  it("favours buying more when rent rises faster", () => {
    const slow = compare({ ...BASE, rentGrowthPercent: 0 });
    const fast = compare({ ...BASE, rentGrowthPercent: 8 });
    expect(fast.advantageOfBuying).toBeGreaterThan(slow.advantageOfBuying);
  });

  it("favours buying less when the exit cost is higher", () => {
    const cheap = compare({ ...BASE, sellingCostPercent: 0 });
    const dear = compare({ ...BASE, sellingCostPercent: 8 });
    expect(dear.advantageOfBuying).toBeLessThan(cheap.advantageOfBuying);
  });

  it("favours buying less when ownership costs are higher", () => {
    const light = compare({ ...BASE, monthlyOwnerCosts: 0 });
    const heavy = compare({ ...BASE, monthlyOwnerCosts: 8_000_000 });
    expect(heavy.advantageOfBuying).toBeLessThan(light.advantageOfBuying);
  });
});

describe("compareRentVsBuy — rejected inputs", () => {
  it("rejects a deposit above the price", () => {
    expect(
      compareRentVsBuy({ ...BASE, downPayment: 3_000_000_001 }),
    ).toBeNull();
  });

  it("allows negative growth but not below −100%/năm", () => {
    expect(
      compareRentVsBuy({ ...BASE, priceGrowthPercent: -50 }),
    ).not.toBeNull();
    expect(compareRentVsBuy({ ...BASE, priceGrowthPercent: -100 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, rentGrowthPercent: -100 })).toBeNull();
    expect(
      compareRentVsBuy({ ...BASE, investmentReturnPercent: -100 }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(compareRentVsBuy({ ...BASE, price: 0 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, price: -1 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, downPayment: -1 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, termMonths: 0 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, horizonMonths: 0 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, horizonMonths: 120.5 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, monthlyRent: -1 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, sellingCostPercent: 101 })).toBeNull();
    expect(compareRentVsBuy({ ...BASE, price: Number.NaN })).toBeNull();
    expect(
      compareRentVsBuy({ ...BASE, priceGrowthPercent: Number.NaN }),
    ).toBeNull();
  });

  it("handles a horizon past the end of the loan", () => {
    // The loan is repaid; the buyer owns the house outright.
    const result = compare({ ...BASE, horizonMonths: 300 });
    expect(result.loanBalance).toBeCloseTo(0, 6);
    expect(result.totalPrincipal).toBeCloseTo(2_100_000_000, 2);
  });
});
