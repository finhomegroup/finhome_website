import { describe, it, expect } from "vitest";
import { computeCompound, type CompoundInput } from "@/lib/calc/compound";

const PRINCIPAL = 100_000_000;
const BASE: CompoundInput = {
  principal: PRINCIPAL,
  annualRatePercent: 6,
  years: 10,
  compounding: "monthly",
};

function compound(input: CompoundInput) {
  const result = computeCompound(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeCompound — against the closed form", () => {
  it("matches P(1 + r/m)^(mt) for a lump sum", () => {
    // 100 triệu at 6%/năm compounded monthly for 10 years.
    expect(compound(BASE).futureValue).toBeCloseTo(
      PRINCIPAL * 1.005 ** 120,
      2,
    );
  });

  it("matches P(1 + r)^t for annual compounding", () => {
    expect(
      compound({ ...BASE, compounding: "annually" }).futureValue,
    ).toBeCloseTo(PRINCIPAL * 1.06 ** 10, 2);
  });

  it("matches the ordinary-annuity closed form for contributions alone", () => {
    const rate = 0.06 / 12;
    const periods = 120;
    const result = compound({
      ...BASE,
      principal: 0,
      contributionPerPeriod: 5_000_000,
    });
    expect(result.futureValue).toBeCloseTo(
      5_000_000 * ((1 + rate) ** periods - 1) / rate,
      2,
    );
  });

  it("is the sum of its parts — a lump sum and an annuity superpose", () => {
    // Not a restatement of the two tests above: it checks the implementation
    // composes the two components linearly, which a sign or ordering error in
    // the fv() call would break.
    const lump = compound(BASE).futureValue;
    const annuity = compound({
      ...BASE,
      principal: 0,
      contributionPerPeriod: 5_000_000,
    }).futureValue;
    const both = compound({ ...BASE, contributionPerPeriod: 5_000_000 })
      .futureValue;
    expect(both).toBeCloseTo(lump + annuity, 2);
  });

  it("adds up contributions and nothing else at a zero rate", () => {
    const flat = compound({
      ...BASE,
      annualRatePercent: 0,
      contributionPerPeriod: 1_000_000,
    });
    expect(flat.futureValue).toBeCloseTo(PRINCIPAL + 1_000_000 * 120, 6);
    expect(flat.totalInterest).toBeCloseTo(0, 6);
  });
});

describe("computeCompound — bookkeeping", () => {
  it("splits the balance into what was put in and what was earned", () => {
    const result = compound({ ...BASE, contributionPerPeriod: 5_000_000 });
    expect(result.totalContributed + result.totalInterest).toBeCloseTo(
      result.futureValue,
      6,
    );
  });

  it("counts the money put in as principal plus every contribution", () => {
    const result = compound({ ...BASE, contributionPerPeriod: 5_000_000 });
    expect(result.totalContributed).toBeCloseTo(
      PRINCIPAL + 5_000_000 * 120,
      6,
    );
  });

  it("reports the effective rate above the nominal one when compounding monthly", () => {
    expect(compound(BASE).effectiveAnnualRatePercent).toBeCloseTo(6.1678, 4);
  });

  it("reports the effective rate equal to the nominal one when compounding annually", () => {
    expect(
      compound({ ...BASE, compounding: "annually" })
        .effectiveAnnualRatePercent,
    ).toBeCloseTo(6, 8);
  });

  it("converts years into whole compounding periods", () => {
    expect(compound(BASE).periods).toBe(120);
    expect(compound({ ...BASE, compounding: "annually" }).periods).toBe(10);
    expect(compound({ ...BASE, compounding: "quarterly" }).periods).toBe(40);
    // A saver cannot be paid a fraction of an interest run.
    expect(
      compound({ ...BASE, years: 2.5, compounding: "annually" }).periods,
    ).toBe(3);
  });
});

describe("computeCompound — the yearly schedule", () => {
  it("produces one row per year, ending at the final balance", () => {
    const result = compound({ ...BASE, contributionPerPeriod: 5_000_000 });
    expect(result.yearlyBalances.length).toBe(10);
    expect(result.yearlyBalances[9].balance).toBeCloseTo(result.futureValue, 6);
  });

  it("grows monotonically", () => {
    const rows = compound({ ...BASE, contributionPerPeriod: 5_000_000 })
      .yearlyBalances;
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].balance).toBeGreaterThan(rows[i - 1].balance);
    }
  });

  it("splits each year's balance into contributed and earned", () => {
    for (const row of compound({ ...BASE, contributionPerPeriod: 5_000_000 })
      .yearlyBalances) {
      expect(row.contributed + row.interest).toBeCloseTo(row.balance, 6);
    }
  });

  it("earns nothing in year one when the rate is zero", () => {
    const rows = compound({ ...BASE, annualRatePercent: 0 }).yearlyBalances;
    expect(rows[0].interest).toBeCloseTo(0, 6);
  });
});

describe("computeCompound — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeCompound({ ...BASE, principal: -1 })).toBeNull();
    expect(computeCompound({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeCompound({ ...BASE, years: 0 })).toBeNull();
    expect(computeCompound({ ...BASE, years: -5 })).toBeNull();
    expect(computeCompound({ ...BASE, annualRatePercent: Number.NaN })).toBeNull();
    expect(
      computeCompound({ ...BASE, contributionPerPeriod: -1 }),
    ).toBeNull();
  });

  it("rejects nothing-in-nothing-out", () => {
    // No starting balance and no contributions is not a deposit.
    expect(
      computeCompound({ ...BASE, principal: 0, contributionPerPeriod: 0 }),
    ).toBeNull();
  });

  it("accepts a saver starting from zero with regular contributions", () => {
    expect(
      computeCompound({ ...BASE, principal: 0, contributionPerPeriod: 1_000_000 }),
    ).not.toBeNull();
  });
});
