import { describe, it, expect } from "vitest";
import { computeFundFees, type FundFeesInput } from "@/lib/calc/fund-fees";

// 100 triệu in, 5 triệu a month for 20 years, 10%/năm gross, with the fee
// schedule a Vietnamese open-ended fund typically charges.
const BASE: FundFeesInput = {
  initial: 100_000_000,
  monthlyContribution: 5_000_000,
  months: 240,
  grossReturnPercent: 10,
  entryFeePercent: 1,
  managementFeePercent: 2,
  exitFeePercent: 0,
};

function fund(input: FundFeesInput) {
  const result = computeFundFees(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeFundFees — the fee-free baseline", () => {
  it("charges nothing when every rate is zero", () => {
    const result = fund({
      ...BASE,
      entryFeePercent: 0,
      managementFeePercent: 0,
      exitFeePercent: 0,
    });
    expect(result.totalFees).toBeCloseTo(0, 6);
    expect(result.netValue).toBeCloseTo(result.grossValue, 4);
    expect(result.valueLost).toBeCloseTo(0, 4);
    expect(result.profitLostPercent).toBeCloseTo(0, 6);
  });

  it("converts the annual return geometrically, not by dividing by 12", () => {
    // A lump sum with no contributions must grow by exactly the annual rate
    // over twelve months.
    const result = fund({
      initial: 100_000_000,
      monthlyContribution: 0,
      months: 12,
      grossReturnPercent: 10,
      entryFeePercent: 0,
      managementFeePercent: 0,
    });
    expect(result.grossValue).toBeCloseTo(110_000_000, 2);
  });

  it("counts every contribution, before entry fees", () => {
    const result = fund(BASE);
    expect(result.totalContributed).toBe(
      100_000_000 + 5_000_000 * 240,
    );
  });
});

describe("computeFundFees — how each charge behaves", () => {
  it("takes the entry fee off every amount paid in", () => {
    const result = fund({ ...BASE, managementFeePercent: 0 });
    expect(result.totalEntryFees).toBeCloseTo(
      (100_000_000 + 5_000_000 * 240) * 0.01,
      4,
    );
  });

  it("accrues a full year of management fee to the stated annual rate", () => {
    // (1 − f)^(1/12) each month, so twelve months costs exactly f. Using
    // f/12 monthly would undercharge.
    const result = fund({
      initial: 100_000_000,
      monthlyContribution: 0,
      months: 12,
      grossReturnPercent: 0,
      entryFeePercent: 0,
      managementFeePercent: 2,
    });
    expect(result.netValue).toBeCloseTo(98_000_000, 2);
    expect(result.totalManagementFees).toBeCloseTo(2_000_000, 2);
  });

  it("charges the exit fee once, on the final balance", () => {
    const withExit = fund({ ...BASE, exitFeePercent: 1.5 });
    const withoutExit = fund(BASE);
    expect(withExit.exitFee).toBeCloseTo(
      withoutExit.netValue * 0.015,
      0,
    );
    expect(withExit.netValue).toBeLessThan(withoutExit.netValue);
  });

  it("keeps the fee total consistent with its parts", () => {
    const result = fund({ ...BASE, exitFeePercent: 1.5 });
    expect(result.totalFees).toBeCloseTo(
      result.totalEntryFees +
        result.totalManagementFees +
        result.exitFee,
      4,
    );
  });
});

describe("computeFundFees — the compounding cost", () => {
  it("costs far more than the fee rate suggests", () => {
    // The page's whole claim: a 2%/năm fee over 20 years takes roughly a
    // third of the gain, not 2% of it.
    const result = fund(BASE);
    expect(result.profitLostPercent!).toBeGreaterThan(25);
    expect(result.profitLostPercent!).toBeLessThan(50);
  });

  it("loses less of the balance than of the profit", () => {
    // Fees look small measured against assets and large against the gain,
    // which is exactly why both are reported.
    const result = fund(BASE);
    expect(result.valueLostPercent).toBeLessThan(result.profitLostPercent!);
  });

  it("grows with the holding period at the same fee rate", () => {
    let previous = 0;
    for (const months of [60, 120, 240, 360]) {
      const value = fund({ ...BASE, months }).profitLostPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("grows with the management fee", () => {
    let previous = 0;
    for (const managementFeePercent of [0.5, 1, 2, 3]) {
      const value = fund({ ...BASE, managementFeePercent })
        .profitLostPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("reports the drag in percentage points of annual return", () => {
    const result = fund(BASE);
    expect(result.annualDragPoints).toBeCloseTo(
      result.grossAnnualReturnPercent - result.netAnnualReturnPercent,
      10,
    );
    expect(result.annualDragPoints).toBeGreaterThan(0);
    // The drag on the achieved annual return is roughly the fee itself.
    expect(result.annualDragPoints).toBeGreaterThan(1.5);
    expect(result.annualDragPoints).toBeLessThan(3.5);
  });

  it("keeps the value identity", () => {
    const result = fund({ ...BASE, exitFeePercent: 1.5 });
    expect(result.valueLost).toBeCloseTo(
      result.grossValue - result.netValue,
      4,
    );
    expect(result.netProfit).toBeCloseTo(
      result.netValue - result.totalContributed,
      4,
    );
    expect(result.grossProfit).toBeCloseTo(
      result.grossValue - result.totalContributed,
      4,
    );
  });
});

describe("computeFundFees — edges and rejection", () => {
  it("has no profit share to report when the gross return is zero", () => {
    const result = fund({ ...BASE, grossReturnPercent: 0 });
    expect(result.grossProfit).toBeCloseTo(0, 2);
    expect(result.profitLostPercent).toBeNull();
    // The fees are still real money.
    expect(result.totalFees).toBeGreaterThan(0);
    expect(result.netValue).toBeLessThan(result.totalContributed);
  });

  it("handles a lump sum with no contributions", () => {
    const result = fund({ ...BASE, monthlyContribution: 0 });
    expect(result.totalContributed).toBe(100_000_000);
    expect(result.netValue).toBeGreaterThan(0);
  });

  it("handles contributions with no lump sum", () => {
    const result = fund({ ...BASE, initial: 0 });
    expect(result.totalContributed).toBe(5_000_000 * 240);
    expect(result.netValue).toBeGreaterThan(0);
  });

  it("returns null rather than a guess", () => {
    expect(
      computeFundFees({ ...BASE, initial: 0, monthlyContribution: 0 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, months: 0 })).toBeNull();
    expect(computeFundFees({ ...BASE, months: 240.5 })).toBeNull();
    expect(computeFundFees({ ...BASE, initial: -1 })).toBeNull();
    expect(computeFundFees({ ...BASE, entryFeePercent: -1 })).toBeNull();
    expect(computeFundFees({ ...BASE, entryFeePercent: 101 })).toBeNull();
    expect(
      computeFundFees({ ...BASE, managementFeePercent: 101 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, exitFeePercent: 101 })).toBeNull();
    expect(
      computeFundFees({ ...BASE, grossReturnPercent: -100 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, initial: Number.NaN })).toBeNull();
  });

  it("allows a negative gross return above −100%", () => {
    const result = fund({ ...BASE, grossReturnPercent: -5 });
    expect(result.netValue).toBeLessThan(result.totalContributed);
    expect(result.profitLostPercent).toBeNull();
  });
});
