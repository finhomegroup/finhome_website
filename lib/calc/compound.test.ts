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
    // A saver cannot be paid a fraction of an interest run, so a partial
    // period is dropped, not rounded up: 2,5 năm compounded annually is two
    // completed years of interest, not three. `Math.round` used to credit the
    // third, overstating the balance by 6,7 triệu on this deposit.
    expect(
      compound({ ...BASE, years: 2.5, compounding: "annually" }).periods,
    ).toBe(2);
    expect(
      compound({ ...BASE, years: 2.5, compounding: "annually" }).futureValue,
    ).toBeCloseTo(PRINCIPAL * 1.06 ** 2, 2);
    // Above the halfway mark too, where rounding used to go up.
    expect(
      compound({ ...BASE, years: 2.6, compounding: "annually" }).periods,
    ).toBe(2);
    // 2,4 × 2 = 4,8 periods: four completed half-years, not five.
    expect(
      compound({ ...BASE, years: 2.4, compounding: "semiannually" }).periods,
    ).toBe(4);
    expect(
      compound({ ...BASE, years: 2.4, compounding: "semiannually" })
        .futureValue,
    ).toBeCloseTo(PRINCIPAL * 1.03 ** 4, 2);
    // The page default is a whole number of periods either way.
    expect(compound({ ...BASE, years: 2.5 }).periods).toBe(30);
  });

  it("does not let float error eat a whole period", () => {
    // `years * perYear` is a float product, so an exact integer can land just
    // below one — 1,4 × 365 is 510.99999999999994 — and a bare Math.floor
    // drops a completed compounding run. These are all exact integers
    // mathematically, so none of them may lose a period.
    // The trap, stated: both products are exactly 511 and 1022 in arithmetic,
    // but land below in float64.
    expect(1.4 * 365).toBeLessThan(511);
    expect(2.8 * 365).toBeLessThan(1022);
    expect(compound({ ...BASE, years: 1.4, compounding: "daily" }).periods).toBe(
      511,
    );
    expect(compound({ ...BASE, years: 2.8, compounding: "daily" }).periods).toBe(
      1022,
    );
    // …and a genuine fraction is still floored, never snapped up. 2,3 × 365 is
    // 839,5 and 0,7 × 12 is 8,4 — real partial periods, which pay nothing.
    expect(compound({ ...BASE, years: 2.3, compounding: "daily" }).periods).toBe(
      839,
    );
    expect(
      compound({ ...BASE, years: 0.7, compounding: "monthly" }).periods,
    ).toBe(8);
    expect(
      compound({ ...BASE, years: 2.9, compounding: "monthly" }).periods,
    ).toBe(34);
    expect(
      compound({ ...BASE, years: 1.5, compounding: "annually" }).periods,
    ).toBe(1);
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

  it("rejects a term shorter than one compounding period", () => {
    // Half a year compounded annually completes no interest run at all, so
    // there is no balance to report — not a full year's interest.
    // `form.emptyNotice` is the copy the page shows for this.
    expect(
      computeCompound({ ...BASE, years: 0.5, compounding: "annually" }),
    ).toBeNull();
    expect(
      computeCompound({ ...BASE, years: 0.4, compounding: "semiannually" }),
    ).toBeNull();
    // …but one whole period is enough.
    expect(
      computeCompound({ ...BASE, years: 1, compounding: "annually" }),
    ).not.toBeNull();
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
