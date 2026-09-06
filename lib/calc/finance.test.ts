import { describe, it, expect } from "vitest";
import {
  pmt,
  pv,
  fv,
  nper,
  solveRate,
  periodsPerYear,
  toEffective,
  toNominal,
  amortize,
} from "@/lib/calc/finance";

// A 100 million đồng loan over 12 months at 12%/năm nominal, compounded
// monthly -> 1%/period. Used across several tests below.
const RATE = 0.01;
const N = 12;
const PRINCIPAL = 100_000_000;
const PAYMENT = -8_884_878.8678; // Excel convention: an outflow, so negative.

describe("pmt", () => {
  it("matches the reference payment for the standard loan", () => {
    expect(pmt(RATE, N, PRINCIPAL)).toBeCloseTo(PAYMENT, 4);
  });

  it("returns a plain division when the rate is zero", () => {
    expect(pmt(0, 10, 1000)).toBeCloseTo(-100, 10);
  });

  it("is smaller in magnitude for an annuity due (type 1)", () => {
    const due = pmt(RATE, N, PRINCIPAL, 0, 1);
    expect(Math.abs(due)).toBeLessThan(Math.abs(pmt(RATE, N, PRINCIPAL)));
    // Paying at the period start earns one period of interest: pmt / (1 + r).
    expect(due).toBeCloseTo(pmt(RATE, N, PRINCIPAL) / (1 + RATE), 6);
  });
});

describe("pv / fv / nper round-trip", () => {
  it("pv recovers the principal from the payment", () => {
    expect(pv(RATE, N, pmt(RATE, N, PRINCIPAL))).toBeCloseTo(PRINCIPAL, 4);
  });

  it("fv of a fully amortizing loan is zero", () => {
    expect(fv(RATE, N, pmt(RATE, N, PRINCIPAL), PRINCIPAL)).toBeCloseTo(0, 4);
  });

  it("nper recovers the term from the payment", () => {
    expect(nper(RATE, pmt(RATE, N, PRINCIPAL), PRINCIPAL)).toBeCloseTo(N, 6);
  });

  it("handles a zero rate in each direction", () => {
    expect(pv(0, 10, -100)).toBeCloseTo(1000, 10);
    expect(fv(0, 10, -100)).toBeCloseTo(1000, 10);
    expect(nper(0, -100, 1000)).toBeCloseTo(10, 10);
  });
});

describe("solveRate", () => {
  it("recovers the period rate from the reference loan", () => {
    const solved = solveRate(N, pmt(RATE, N, PRINCIPAL), PRINCIPAL);
    expect(solved).not.toBeNull();
    expect(solved as number).toBeCloseTo(RATE, 8);
  });

  it("returns null when no rate can satisfy the cash flows", () => {
    // Both the principal and the payment are inflows — you receive 100 million
    // AND receive 1000 every period. No interest rate makes that balance, and
    // the solver must say so rather than return a plausible number.
    //
    // Note for whoever maintains this: a merely *unfavourable* loan is NOT an
    // unsolvable one. `solveRate(12, -1, 100_000_000)` — repaying 1 đồng a
    // month on a 100 million loan — resolves to about -78%/period, because a
    // steep enough negative rate does balance it. Verified numerically while
    // writing this plan.
    expect(solveRate(12, 1000, 100_000_000)).toBeNull();
  });
});

describe("periodsPerYear", () => {
  it("maps every compounding frequency", () => {
    expect(periodsPerYear("annually")).toBe(1);
    expect(periodsPerYear("semiannually")).toBe(2);
    expect(periodsPerYear("quarterly")).toBe(4);
    expect(periodsPerYear("monthly")).toBe(12);
    expect(periodsPerYear("semimonthly")).toBe(24);
    expect(periodsPerYear("biweekly")).toBe(26);
    expect(periodsPerYear("weekly")).toBe(52);
    expect(periodsPerYear("daily")).toBe(365);
  });
});

describe("toEffective / toNominal", () => {
  it("converts 12% nominal compounded monthly to 12,6825% effective", () => {
    expect(toEffective(0.12, 12)).toBeCloseTo(0.126825, 6);
  });

  it("round-trips", () => {
    expect(toNominal(toEffective(0.12, 12), 12)).toBeCloseTo(0.12, 10);
  });

  it("is the identity for annual compounding", () => {
    expect(toEffective(0.12, 1)).toBeCloseTo(0.12, 10);
    expect(toNominal(0.12, 1)).toBeCloseTo(0.12, 10);
  });
});

describe("amortize", () => {
  const schedule = amortize({
    principal: PRINCIPAL,
    ratePerPeriod: RATE,
    periods: N,
  });

  it("produces one row per period", () => {
    expect(schedule).not.toBeNull();
    expect((schedule as []).length).toBe(N);
  });

  it("presents the payment as a positive figure", () => {
    expect((schedule as { payment: number }[])[0].payment).toBeGreaterThan(0);
  });

  // The two invariants that catch a sign-convention error before it reaches
  // 17 loan calculators. These matter more than any single spot value.
  it("repays exactly the principal, no more and no less", () => {
    const rows = schedule as { principal: number }[];
    const repaid = rows.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  it("ends at a zero balance", () => {
    const rows = schedule as { balance: number }[];
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("splits every row into interest plus principal", () => {
    const rows = schedule as
      { payment: number; interest: number; principal: number }[];
    for (const row of rows) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("charges interest on the opening balance in period 1", () => {
    const rows = schedule as { interest: number }[];
    expect(rows[0].interest).toBeCloseTo(PRINCIPAL * RATE, 6);
  });

  it("handles a zero rate as pure principal repayment", () => {
    const flat = amortize({ principal: 1200, ratePerPeriod: 0, periods: 12 });
    const rows = flat as { payment: number; interest: number }[];
    expect(rows.length).toBe(12);
    expect(rows[0].payment).toBeCloseTo(100, 10);
    expect(rows[0].interest).toBeCloseTo(0, 10);
  });

  it("shortens the schedule when extra principal is paid each period", () => {
    const withExtra = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
      extraPerPeriod: 2_000_000,
    });
    const rows = withExtra as { balance: number }[];
    expect(rows.length).toBeLessThan(N);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("still repays exactly the principal with extra payments", () => {
    const withExtra = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
      extraPerPeriod: 2_000_000,
    }) as { principal: number }[];
    const repaid = withExtra.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  it("returns null on inputs that cannot produce a schedule", () => {
    expect(amortize({ principal: 0, ratePerPeriod: RATE, periods: N })).toBeNull();
    expect(amortize({ principal: -1, ratePerPeriod: RATE, periods: N })).toBeNull();
    expect(amortize({ principal: PRINCIPAL, ratePerPeriod: RATE, periods: 0 })).toBeNull();
    expect(amortize({ principal: PRINCIPAL, ratePerPeriod: -0.01, periods: N })).toBeNull();
    expect(
      amortize({ principal: PRINCIPAL, ratePerPeriod: Number.NaN, periods: N }),
    ).toBeNull();
  });
});
