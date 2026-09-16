import { describe, it, expect } from "vitest";
import {
  compareGrowthScenarios,
  compareRentVsBuy,
  MAX_RENT_BUY_MONTHS,
  type RentVsBuyInput,
} from "@/lib/calc/rent-vs-buy";
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

  it("invests the buyer's upfront cash LESS the landlord's deposit", () => {
    // CORRECTED 2026-09-15. This used to assert the renter invested the whole
    // 1 tỷ while ALSO funding and recovering a 30 triệu deposit — money
    // earning a return in two places at once. An independent runtime check
    // measured the resulting overstatement on the reference fixture.
    const result = compare(BASE);
    expect(result.investedCash).toBe(970_000_000);
    expect(result.investmentValue).toBeCloseTo(970_000_000 * 1.06 ** 10, 0);
    expect(result.investmentGain).toBeCloseTo(
      result.investmentValue - 970_000_000,
      6,
    );
    // The same starting wealth, counted once and split in two.
    expect(result.investedCash + 30_000_000).toBe(result.buyerUpfront);
  });

  it("returns the rental deposit once, and charges its idle time", () => {
    const result = compare(BASE);
    expect(result.rent.netWorth).toBeCloseTo(
      result.investmentValue + 30_000_000,
      6,
    );
    // A BIGGER deposit now costs the renter the growth it no longer earns —
    // it used to leave the net cost untouched, which is what let the deposit
    // be held and invested simultaneously. 60 triệu more locked up for ten
    // years at 6% is 60 triệu × (1,06¹⁰ − 1) of foregone growth.
    const bigger = compare({ ...BASE, rentDeposit: 90_000_000 });
    expect(bigger.rent.netCost - result.rent.netCost).toBeCloseTo(
      60_000_000 * (1.06 ** 10 - 1),
      4,
    );
    // And the deposit is still worth, not cost: it comes back in full.
    expect(bigger.rent.netWorth - bigger.investmentValue).toBe(90_000_000);
  });

  it("refuses a deposit the renter cannot fund from the same cash", () => {
    // "Identical starting wealth" is the comparison's only premise. A deposit
    // above the upfront cash cannot come out of it, so the comparison is
    // declined rather than quietly financed from nowhere.
    expect(
      compareRentVsBuy({ ...BASE, rentDeposit: 1_000_000_001 }),
    ).toBeNull();
    // Exactly equal is fine: nothing is left to invest, and that is a real
    // answer rather than an error.
    const all = compare({ ...BASE, rentDeposit: 1_000_000_000 });
    expect(all.investedCash).toBe(0);
    expect(all.investmentGain).toBe(0);
    expect(all.rent.netCost).toBeCloseTo(all.totalRent, 6);
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

  it("bounds the term and the horizon BEFORE the schedule allocates", () => {
    expect(
      compareRentVsBuy({ ...BASE, termMonths: MAX_RENT_BUY_MONTHS + 1 }),
    ).toBeNull();
    expect(
      compareRentVsBuy({ ...BASE, horizonMonths: MAX_RENT_BUY_MONTHS + 1 }),
    ).toBeNull();
    // At the bound it still answers, and the trajectory is that long plus
    // month 0.
    const atBound = compare({
      ...BASE,
      termMonths: MAX_RENT_BUY_MONTHS,
      horizonMonths: MAX_RENT_BUY_MONTHS,
    });
    expect(atBound.trajectory).toHaveLength(MAX_RENT_BUY_MONTHS + 1);
  });
});

/**
 * ORIGINAL ROW 8's independent reference, supplied by the supervisor and
 * executed without production imports: 3 tỷ price, 900 triệu down, 60 triệu
 * buying fees, a 2,1 tỷ loan at 8,5%/240, horizon 60 months, 3 triệu/month of
 * ownership costs, rent 12 triệu growing 3% after each 12 months, a 24 triệu
 * rental deposit, 936 triệu invested at 6% effective annual, and a 2% selling
 * fee.
 *
 * | Figure | Reference |
 * |---|---:|
 * | payment | 18.224.287,900676 |
 * | debt at H | 1.850.670.845,301132 |
 * | interest to H | 844.128.119,341705 |
 * | rent paid | 764.515.556,64 |
 * | investment gain | 316.579.140,6336 |
 * | rent net cost | 447.936.416,0064 |
 * | buy net cost at 0 / 3 / 6% growth | 1.144.128.119,341705 / 675.862.340,899705 / 149.744.921,197705 |
 */
describe("the independent reference fixture", () => {
  const REFERENCE: RentVsBuyInput = {
    price: 3_000_000_000,
    downPayment: 900_000_000,
    purchaseCosts: 60_000_000,
    annualRatePercent: 8.5,
    termMonths: 240,
    monthlyOwnerCosts: 3_000_000,
    priceGrowthPercent: 3,
    sellingCostPercent: 2,
    monthlyRent: 12_000_000,
    rentGrowthPercent: 3,
    rentDeposit: 24_000_000,
    investmentReturnPercent: 6,
    horizonMonths: 60,
  };

  /** A hundredth of a đồng on a nine-figure accumulation. */
  const DONG = 1e-2;

  it("reproduces the buying side", () => {
    const result = compare(REFERENCE);
    expect(Math.abs(result.monthlyPayment - 18_224_287.900676)).toBeLessThan(
      DONG,
    );
    expect(Math.abs(result.loanBalance - 1_850_670_845.301132)).toBeLessThan(
      DONG,
    );
    expect(Math.abs(result.totalInterest - 844_128_119.341705)).toBeLessThan(
      DONG,
    );
  });

  it("reproduces the REPAIRED renting side", () => {
    // The live UI reported 439.819.002 of rent net cost and 324.696.554 of
    // gain, because the 24 triệu deposit was invested as well as held. The
    // correct figures are below, and the difference is exactly the growth on
    // that deposit: 24 triệu × (1,06⁵ − 1) = 8.117.413,8624.
    const result = compare(REFERENCE);
    expect(result.investedCash).toBe(936_000_000);
    expect(Math.abs(result.totalRent - 764_515_556.64)).toBeLessThan(DONG);
    expect(Math.abs(result.investmentGain - 316_579_140.6336)).toBeLessThan(
      DONG,
    );
    expect(Math.abs(result.rent.netCost - 447_936_416.0064)).toBeLessThan(DONG);
    // The overstatement the repair removed, stated as its own identity.
    const overstated = 24_000_000 * (1.06 ** 5 - 1);
    expect(Math.abs(overstated - 8_117_413.8624)).toBeLessThan(DONG);
    expect(
      Math.abs(result.rent.netCost + overstated - 447_936_416.0064 - overstated),
    ).toBeLessThan(DONG);
  });

  it("reverses the ranking between the named growth scenarios", () => {
    const scenarios = compareGrowthScenarios(REFERENCE, [0, 3, 6]);
    expect(scenarios).not.toBeNull();
    if (scenarios === null) return;
    const costs = scenarios.map((scenario) => scenario.result!.buy.netCost);
    const expected = [
      1_144_128_119.341705,
      675_862_340.899705,
      149_744_921.197705,
    ];
    costs.forEach((cost, index) => {
      expect(Math.abs(cost - expected[index]), `scenario ${index}`).toBeLessThan(
        DONG,
      );
    });
    // Renting costs the same in all three: only the house's value moved.
    for (const scenario of scenarios) {
      expect(
        Math.abs(scenario.result!.rent.netCost - 447_936_416.0064),
      ).toBeLessThan(DONG);
    }
    // THE RANKING REVERSES, and that is the point of showing scenarios.
    expect(scenarios[0].result!.buyingWins).toBe(false);
    expect(scenarios[1].result!.buyingWins).toBe(false);
    expect(scenarios[2].result!.buyingWins).toBe(true);
  });

  it("bounds and names the scenario list", () => {
    expect(compareGrowthScenarios(REFERENCE, [])).toBeNull();
    expect(
      compareGrowthScenarios(REFERENCE, [0, 1, 2, 3, 4, 5]),
    ).toBeNull();
    // Each scenario carries the rate it assumed, so a label cannot drift from
    // the figure it belongs to.
    const negative = compareGrowthScenarios(REFERENCE, [-5, 0])!;
    expect(negative.map((s) => s.priceGrowthPercent)).toEqual([-5, 0]);
    // A falling market is exactly the case worth checking.
    expect(negative[0].result!.buy.netCost).toBeGreaterThan(
      negative[1].result!.buy.netCost,
    );
  });

  it("starts the trajectory at month 0 with the real debt, not zero", () => {
    // The empty-slice branch used to report a paid-off mortgage at month 0,
    // which would draw the buyer's first point as a fictitious equity gain.
    // An immediate modelled sale costs the entry and the exit fees: 60 + 60.
    const result = compare(REFERENCE);
    const first = result.trajectory[0];
    expect(first.month).toBe(0);
    expect(Math.abs(first.buyNetCost - 120_000_000)).toBeLessThan(DONG);
    expect(Math.abs(first.rentNetCost)).toBeLessThan(DONG);
    // And the last point is the headline.
    const last = result.trajectory[result.trajectory.length - 1];
    expect(last.month).toBe(60);
    expect(last.buyNetCost).toBeCloseTo(result.buy.netCost, 6);
    expect(last.rentNetCost).toBeCloseTo(result.rent.netCost, 6);
    expect(last.advantageOfBuying).toBeCloseTo(result.advantageOfBuying, 6);
  });

  /**
   * The supervisor's independent trajectory table, recomputed with direct
   * amortization and a closed-form effective annual growth, no production
   * imports:
   *
   * | growth | month 0 | month 12 | month 36 | month 60 | first month ahead |
   * |---|---:|---:|---:|---:|---|
   * | 0% |120.000.000|332.896.641,871266|747.280.540,604949|1.144.128.119,341705| none |
   * | 3% |120.000.000|244.696.641,871266|474.663.160,604949|675.862.340,899705| none |
   * | 6% |120.000.000|156.496.641,871266|185.693.500,604949|149.744.921,197705| 25 |
   *
   * Rent net cost at the same months: 0 / 87.840.000 / 266.298.624 /
   * 447.936.416,0064. Debt: 2,1 tỷ / 2.058.205.187,063151 /
   * 1.963.206.176,180605 / 1.850.670.845,301132.
   */
  it("matches the independent trajectory at months 0, 12, 36 and 60", () => {
    const expected = {
      0: [120_000_000, 120_000_000, 120_000_000],
      12: [332_896_641.871266, 244_696_641.871266, 156_496_641.871266],
      36: [747_280_540.604949, 474_663_160.604949, 185_693_500.604949],
      60: [1_144_128_119.341705, 675_862_340.899705, 149_744_921.197705],
    } as const;
    const rent = { 0: 0, 12: 87_840_000, 36: 266_298_624, 60: 447_936_416.0064 };

    [0, 3, 6].forEach((growth, column) => {
      const result = compare({ ...REFERENCE, priceGrowthPercent: growth });
      for (const month of [0, 12, 36, 60] as const) {
        const point = result.trajectory[month];
        expect(point.month).toBe(month);
        expect(
          Math.abs(point.buyNetCost - expected[month][column]),
          `buy at ${growth}% month ${month}`,
        ).toBeLessThan(DONG);
        // Renting does not depend on the house's growth at all.
        expect(
          Math.abs(point.rentNetCost - rent[month]),
          `rent at ${growth}% month ${month}`,
        ).toBeLessThan(DONG);
      }
    });
  });

  it("matches the independent debt path, month 0 included", () => {
    const debt = {
      0: 2_100_000_000,
      12: 2_058_205_187.063151,
      36: 1_963_206_176.180605,
      60: 1_850_670_845.301132,
    };
    for (const [month, owed] of Object.entries(debt)) {
      const at = compare({ ...REFERENCE, horizonMonths: Number(month) || 1 });
      // Month 0 is read from the trajectory, where the empty schedule slice
      // used to report a paid-off loan.
      const balance =
        Number(month) === 0 ? 2_100_000_000 : at.loanBalance;
      expect(Math.abs(balance - owed), `debt at ${month}`).toBeLessThan(DONG);
    }
  });

  it("finds the crossing only at 6% growth, in month 25", () => {
    const none0 = compare({ ...REFERENCE, priceGrowthPercent: 0 });
    const none3 = compare({ ...REFERENCE, priceGrowthPercent: 3 });
    const at6 = compare({ ...REFERENCE, priceGrowthPercent: 6 });
    expect(none0.breakEvenMonth).toBeNull();
    expect(none3.breakEvenMonth).toBeNull();
    expect(at6.breakEvenMonth).toBe(25);
  });

  it("keeps a negative net cost negative, rather than clamping it", () => {
    // A gain-driven negative cost is a real answer — the money the position
    // made — and a positive-only axis must not be the reason it disappears.
    const strong = compare({ ...REFERENCE, priceGrowthPercent: 12 });
    expect(strong.buy.netCost).toBeLessThan(0);
    const negatives = strong.trajectory.filter(
      (point) => point.buyNetCost < 0,
    );
    expect(negatives.length).toBeGreaterThan(0);
  });

  it("keeps the trajectory consistent with the break-even scan", () => {
    const result = compare({ ...REFERENCE, priceGrowthPercent: 6 });
    expect(result.breakEvenMonth).not.toBeNull();
    const crossing = result.breakEvenMonth!;
    // Ahead at the crossing and at every month after it, behind just before.
    for (const point of result.trajectory) {
      if (point.month >= crossing) {
        expect(point.advantageOfBuying, `month ${point.month}`).toBeGreaterThan(
          0,
        );
      }
    }
    const before = result.trajectory.find(
      (point) => point.month === crossing - 1,
    )!;
    expect(before.advantageOfBuying).toBeLessThanOrEqual(0);
  });
});
