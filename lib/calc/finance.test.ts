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
import type { ScheduleRow } from "@/lib/calc/finance";

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

  it("resolves a 30-year monthly mortgage", () => {
    const solved = solveRate(360, pmt(0.009, 360, 2_000_000_000), 2_000_000_000);
    expect(solved).not.toBeNull();
    expect(solved as number).toBeCloseTo(0.009, 6);
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

describe("nonzero future value and annuity due", () => {
  const R2 = 0.01;
  const N2 = 12;
  const PV2 = 100_000_000;
  const FV2 = 5_000_000;

  it("pins pmt for both annuity types", () => {
    expect(pmt(R2, N2, PV2, FV2, 0)).toBeCloseTo(-9_279_122.811226, 4);
    expect(pmt(R2, N2, PV2, FV2, 1)).toBeCloseTo(-9_187_250.308144, 4);
  });

  it("pv inverts pmt with a future value, both types", () => {
    expect(pv(R2, N2, pmt(R2, N2, PV2, FV2, 0), FV2, 0)).toBeCloseTo(PV2, 4);
    expect(pv(R2, N2, pmt(R2, N2, PV2, FV2, 1), FV2, 1)).toBeCloseTo(PV2, 4);
  });

  it("fv returns the target future value, both types", () => {
    expect(fv(R2, N2, pmt(R2, N2, PV2, FV2, 0), PV2, 0)).toBeCloseTo(FV2, 4);
    expect(fv(R2, N2, pmt(R2, N2, PV2, FV2, 1), PV2, 1)).toBeCloseTo(FV2, 4);
  });

  it("nper recovers the term with a future value, both types", () => {
    expect(nper(R2, pmt(R2, N2, PV2, FV2, 0), PV2, FV2, 0)).toBeCloseTo(N2, 6);
    expect(nper(R2, pmt(R2, N2, PV2, FV2, 1), PV2, FV2, 1)).toBeCloseTo(N2, 6);
  });
});

describe("amortize", () => {
  it("produces one row per period", () => {
    const schedule = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    });
    expect(schedule).not.toBeNull();
    expect((schedule as ScheduleRow[]).length).toBe(N);
  });

  it("presents the payment as a positive figure", () => {
    const schedule = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    }) as ScheduleRow[];
    expect(schedule[0].payment).toBeGreaterThan(0);
  });

  // The two invariants that catch a sign-convention error before it reaches
  // 17 loan calculators. These matter more than any single spot value.
  it("repays exactly the principal, no more and no less", () => {
    const rows = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    }) as ScheduleRow[];
    const repaid = rows.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  it("ends at a zero balance", () => {
    const rows = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    }) as ScheduleRow[];
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("splits every row into interest plus principal", () => {
    const rows = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    }) as ScheduleRow[];
    for (const row of rows) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("charges interest on the opening balance in period 1", () => {
    const rows = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
    }) as ScheduleRow[];
    expect(rows[0].interest).toBeCloseTo(PRINCIPAL * RATE, 6);
  });

  it("handles a zero rate as pure principal repayment", () => {
    const flat = amortize({ principal: 1200, ratePerPeriod: 0, periods: 12 });
    const rows = flat as ScheduleRow[];
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
    const rows = withExtra as ScheduleRow[];
    expect(rows.length).toBeLessThan(N);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 2);
  });

  it("still repays exactly the principal with extra payments", () => {
    const withExtra = amortize({
      principal: PRINCIPAL,
      ratePerPeriod: RATE,
      periods: N,
      extraPerPeriod: 2_000_000,
    }) as ScheduleRow[];
    const repaid = withExtra.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(PRINCIPAL, 2);
  });

  // toBeCloseTo(0, 2) above passes on a residue of a few thousandths of a
  // đồng, which is exactly what shipped in round 1. This asserts strict
  // equality on a long, large schedule so a returning residue fails loudly.
  it("ends at exactly zero on a long, large schedule", () => {
    const rows = amortize({
      principal: 100_000_000_000,
      ratePerPeriod: 0.0075,
      periods: 360,
    }) as ScheduleRow[];
    expect(rows.length).toBe(360);
    expect(rows[rows.length - 1].balance).toBe(0);
  });

  it("amortizes a realistic 20-year monthly loan", () => {
    const rows = amortize({
      principal: 1_000_000_000,
      ratePerPeriod: 0.008,
      periods: 240,
    }) as ScheduleRow[];
    expect(rows.length).toBe(240);
    expect(rows.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(
      1_000_000_000,
      2,
    );
    expect(rows[rows.length - 1].balance).toBe(0);
  });

  it("rejects a negative or non-finite extra payment", () => {
    expect(
      amortize({
        principal: PRINCIPAL,
        ratePerPeriod: RATE,
        periods: N,
        extraPerPeriod: -1,
      }),
    ).toBeNull();
    expect(
      amortize({
        principal: PRINCIPAL,
        ratePerPeriod: RATE,
        periods: N,
        extraPerPeriod: Number.NaN,
      }),
    ).toBeNull();
  });

  it("rejects a non-integer term", () => {
    expect(
      amortize({ principal: PRINCIPAL, ratePerPeriod: RATE, periods: 12.5 }),
    ).toBeNull();
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

  it("returns null instead of a schedule of NaN when pmt overflows", () => {
    expect(
      amortize({ principal: 1e8, ratePerPeriod: 0.5, periods: 2000 }),
    ).toBeNull();
  });

  it("presents the same payment pmt() returns, with the sign flipped", () => {
    // amortize is the one deliberate presentation-shaped exception to the
    // Excel sign convention. Pinning the relationship stops a caller mixing
    // the two and rendering a negative "Tổng lãi phải trả".
    const rows = amortize({ principal: PRINCIPAL, ratePerPeriod: RATE, periods: N }) as ScheduleRow[];
    expect(rows[0].payment).toBeCloseTo(-pmt(RATE, N, PRINCIPAL), 6);
  });
});
