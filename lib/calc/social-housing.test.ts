/**
 * The NOXH statutory parameters, asserted against the DECREES.
 *
 * Every figure below was transcribed from a government source on 2026-09-17
 * and is checked here against that source, not against the implementation —
 * §2 of the suite doc's recipe ("verify against a published closed form or a
 * hand-computed reference, not against your own implementation"), which for a
 * statutory table means the instrument.
 *
 * The assertion that matters most is `does not serve a superseded ceiling`.
 * That is the actual failure mode: not a crash, but a confidently wrong
 * number, told to precisely the households that sit near the line.
 */
import { describe, expect, it } from "vitest";
import {
  NOXH_EARLIEST_KNOWN,
  NOXH_FLOOR_AREA,
  NOXH_INCOME_CEILINGS,
  NOXH_LOAN,
  assessNoxhIncome,
  noxhCeilingsAt,
  type NoxhHousehold,
} from "@/lib/calc/social-housing";

const HOUSEHOLDS: NoxhHousehold[] = [
  "single",
  "couple",
  "singleParentMinorChildren",
];

describe("the dated chain", () => {
  it("holds the two verified rows, oldest first", () => {
    expect(NOXH_INCOME_CEILINGS).toHaveLength(2);
    const dates = NOXH_INCOME_CEILINGS.map((r) => r.effectiveFrom);
    expect(dates).toEqual([...dates].sort());
    expect(NOXH_EARLIEST_KNOWN).toBe("2025-10-10");
  });

  it("matches Nghị định 261/2025/NĐ-CP from 10/10/2025", () => {
    const row = noxhCeilingsAt("2025-10-10");
    expect(row?.instrument).toBe("Nghị định 261/2025/NĐ-CP");
    expect(row?.ceilings).toEqual({
      single: 20_000_000,
      couple: 40_000_000,
      singleParentMinorChildren: 30_000_000,
    });
    // Điều 2 and khoản 2 Điều 3 run until 31/5/2030. An instrument that states
    // an end date has one recorded; NĐ 136/2026 states none and carries null.
    expect(row?.expiresAfter).toBe("2030-05-31");
  });

  it("matches Nghị định 136/2026/NĐ-CP from 07/04/2026", () => {
    const row = noxhCeilingsAt("2026-04-07");
    expect(row?.instrument).toBe("Nghị định 136/2026/NĐ-CP");
    expect(row?.ceilings).toEqual({
      single: 25_000_000,
      couple: 50_000_000,
      singleParentMinorChildren: 35_000_000,
    });
    expect(row?.expiresAfter).toBeNull();
  });

  it("keeps the 261/2025 row in force right up to the day before", () => {
    // The boundary is the whole point of a dated table, so it is asserted on
    // both sides rather than at one convenient date in the middle.
    expect(noxhCeilingsAt("2026-04-06")?.instrument).toBe(
      "Nghị định 261/2025/NĐ-CP",
    );
    expect(noxhCeilingsAt("2026-04-07")?.instrument).toBe(
      "Nghị định 136/2026/NĐ-CP",
    );
  });

  it("returns undefined before the earliest VERIFIED row", () => {
    // NĐ 100/2024's original figures were not verified from a primary source.
    // Borrowing the 261/2025 row backwards would answer a 2024 application
    // with a ceiling that did not exist yet.
    expect(noxhCeilingsAt("2025-10-09")).toBeUndefined();
    expect(noxhCeilingsAt("2024-07-26")).toBeUndefined();
  });

  it("never lowers a ceiling as the chain advances", () => {
    // These have only been raised, and a row that lowered one would be a
    // transcription error far more likely than a real reversal.
    for (const household of HOUSEHOLDS) {
      const series = NOXH_INCOME_CEILINGS.map((r) => r.ceilings[household]);
      for (let i = 1; i < series.length; i += 1) {
        expect(series[i], `${household} row ${i}`).toBeGreaterThanOrEqual(
          series[i - 1],
        );
      }
    }
  });

  it("orders the three household shapes the way the statute does", () => {
    // A couple's combined ceiling exceeds a single applicant's, and a single
    // parent with minor children sits between them. Getting this order wrong
    // is the shape a mis-keyed Record would take.
    for (const row of NOXH_INCOME_CEILINGS) {
      expect(row.ceilings.couple).toBeGreaterThan(row.ceilings.single);
      expect(row.ceilings.singleParentMinorChildren).toBeGreaterThan(
        row.ceilings.single,
      );
      expect(row.ceilings.couple).toBeGreaterThan(
        row.ceilings.singleParentMinorChildren,
      );
    }
  });
});

describe("does not serve a superseded ceiling", () => {
  it("is unreachable for the 20/40/30 figures on or after 07/04/2026", () => {
    // THE REGRESSION. Verified to fail with the 136/2026 row removed from the
    // chain: every one of these assertions goes red, because `noxhCeilingsAt`
    // then falls back to 261/2025 for a 2026 date.
    const superseded = { single: 20_000_000, couple: 40_000_000, singleParentMinorChildren: 30_000_000 };
    for (const asOf of ["2026-04-07", "2026-09-17", "2027-01-01"]) {
      for (const household of HOUSEHOLDS) {
        const got = assessNoxhIncome({
          household,
          monthlyNetIncome: 1,
          asOf,
        });
        expect(got, asOf).not.toBeNull();
        expect(got?.ceiling, `${household} on ${asOf}`).not.toBe(
          superseded[household],
        );
      }
    }
  });

  it("puts a 44 triệu couple INSIDE the current ceiling and outside the old one", () => {
    // The collection's own flagship household (`co-600-trieu`) has 44 triệu
    // take-home. It fails the 261/2025 ceiling of 40 triệu and passes the
    // 136/2026 ceiling of 50 triệu — so serving the stale row would tell this
    // exact household, the one every other article is about, that it does not
    // qualify.
    const input = { household: "couple" as const, monthlyNetIncome: 44_000_000 };
    expect(assessNoxhIncome({ ...input, asOf: "2026-04-07" })?.withinCeiling).toBe(true);
    expect(assessNoxhIncome({ ...input, asOf: "2026-04-06" })?.withinCeiling).toBe(false);
  });
});

describe("the income assessment", () => {
  it("passes a household exactly at the ceiling", () => {
    // The statute says "không quá", so the boundary is inclusive. An exclusive
    // test would fail a household reporting a round 50 triệu.
    const got = assessNoxhIncome({
      household: "couple",
      monthlyNetIncome: 50_000_000,
      asOf: "2026-09-17",
    });
    expect(got?.withinCeiling).toBe(true);
    expect(got?.marginToCeiling).toBe(0);
  });

  it("signs the margin so a household above the ceiling learns the size of the gap", () => {
    const got = assessNoxhIncome({
      household: "single",
      monthlyNetIncome: 31_000_000,
      asOf: "2026-09-17",
    });
    expect(got?.withinCeiling).toBe(false);
    // Not an absolute value: 6 triệu over is different information from
    // 6 triệu of headroom, and the ceiling has twice moved up by 5–10 triệu.
    expect(got?.marginToCeiling).toBe(-6_000_000);
  });

  it("carries the instrument with every answer", () => {
    const got = assessNoxhIncome({
      household: "couple",
      monthlyNetIncome: 30_000_000,
      asOf: "2026-09-17",
    });
    expect(got?.instrument).toBe("Nghị định 136/2026/NĐ-CP");
    expect(got?.effectiveFrom).toBe("2026-04-07");
  });

  it("returns null rather than guessing, for an unknown date or a bad figure", () => {
    expect(
      assessNoxhIncome({ household: "single", monthlyNetIncome: 10_000_000, asOf: "2025-01-01" }),
    ).toBeNull();
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(
        assessNoxhIncome({ household: "single", monthlyNetIncome: bad, asOf: "2026-09-17" }),
        String(bad),
      ).toBeNull();
    }
  });

  it("does not expose a field called `eligible`", () => {
    // Two of the three statutory conditions are documentary and invisible to
    // this module, so a verdict-shaped field would be false at the type level.
    // Asserted on the VALUE because a type-level absence is not something a
    // future edit has to notice.
    const got = assessNoxhIncome({
      household: "single",
      monthlyNetIncome: 10_000_000,
      asOf: "2026-09-17",
    });
    expect(got).not.toBeNull();
    expect(Object.keys(got ?? {})).not.toContain("eligible");
    expect(Object.keys(got ?? {})).toContain("withinCeiling");
  });
});

describe("the loan terms", () => {
  it("carries the subsidised rate and both statutory caps", () => {
    expect(NOXH_LOAN.annualRatePercent).toBe(5.4);
    expect(NOXH_LOAN.maxLtvPercent).toBe(80);
    // 25 năm from first disbursement.
    expect(NOXH_LOAN.maxTermMonths).toBe(300);
    expect(NOXH_LOAN.overdueRateMultiplier).toBe(1.3);
  });

  it("sits well below the commercial rate the collection assumes", () => {
    // The collection's base case is 8,5%/năm. If this ever stopped being a
    // discount the whole premise of the route would be gone, and that should
    // be a red test rather than a quiet change of meaning.
    expect(NOXH_LOAN.annualRatePercent).toBeLessThan(8.5);
  });

  it("names the instrument for every prefilled figure", () => {
    for (const field of ["rateInstrument", "rateAppliedBy", "termsInstrument"] as const) {
      expect(NOXH_LOAN[field], field).toMatch(/\S/);
    }
    expect(NOXH_FLOOR_AREA.perPersonSqm).toBe(15);
    // Cited WITHOUT a date: NĐ 54/2026's effective date is unverified, and
    // asserting one would be inventing it.
    expect(NOXH_FLOOR_AREA.instrument).toContain("54/2026");
    expect(NOXH_FLOOR_AREA.instrument).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
