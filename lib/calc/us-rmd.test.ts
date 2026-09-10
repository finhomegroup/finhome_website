import { describe, expect, it } from "vitest";
import {
  computeRmd,
  CORRECTED_PENALTY_PERCENT,
  lifetimeDivisor,
  rmdStartAge,
  SHORTFALL_PENALTY_PERCENT,
  TABLE_FIRST_AGE,
  TABLE_LAST_AGE,
  UNIFORM_LIFETIME,
  type RmdInput,
} from "@/lib/calc/us-rmd";

const BASE: RmdInput = {
  birthYear: 1953,
  currentAge: 73,
  balance: 800_000,
  returnPercent: 7,
  endAge: 95,
  marginalRatePercent: 22,
  plannedWithdrawal: 30_000,
};

const run = (over: Partial<RmdInput> = {}) => {
  const result = computeRmd({ ...BASE, ...over });
  if (!result) throw new Error("computeRmd returned null");
  return result;
};

const AGES = Object.keys(UNIFORM_LIFETIME)
  .map(Number)
  .sort((a, b) => a - b);

describe("the Uniform Lifetime Table", () => {
  it("covers every age from 72 to 120 with no gap", () => {
    // A missing row would make `lifetimeDivisor` return null mid-projection
    // and the required amount silently zero for that year.
    expect(AGES[0]).toBe(TABLE_FIRST_AGE);
    expect(AGES.at(-1)).toBe(TABLE_LAST_AGE);
    expect(AGES).toHaveLength(TABLE_LAST_AGE - TABLE_FIRST_AGE + 1);
    for (let i = 1; i < AGES.length; i += 1) {
      expect(AGES[i]).toBe(AGES[i - 1] + 1);
    }
  });

  it("keeps every divisor positive and strictly falling with age", () => {
    // The shape check that catches a mistyped digit even when the value
    // looks plausible: 12,2 typed as 21,2 at age 90 breaks this and nothing
    // else would notice.
    for (let i = 1; i < AGES.length; i += 1) {
      const older = UNIFORM_LIFETIME[AGES[i]];
      const younger = UNIFORM_LIFETIME[AGES[i - 1]];
      expect(older, `age ${AGES[i]}`).toBeGreaterThan(0);
      expect(older, `age ${AGES[i]} vs ${AGES[i - 1]}`).toBeLessThan(younger);
    }
  });

  it("therefore makes the required percentage strictly rise with age", () => {
    // The consequence that matters to a reader, asserted as a property
    // rather than left implicit in the divisors.
    for (let i = 1; i < AGES.length; i += 1) {
      expect(100 / UNIFORM_LIFETIME[AGES[i]]).toBeGreaterThan(
        100 / UNIFORM_LIFETIME[AGES[i - 1]],
      );
    }
    // And the range it spans, which is the page's headline.
    expect(100 / UNIFORM_LIFETIME[73]).toBeCloseTo(3.7736, 3);
    expect(100 / UNIFORM_LIFETIME[100]).toBeCloseTo(15.625, 3);
    expect(100 / UNIFORM_LIFETIME[120]).toBe(50);
  });

  it("pins the published divisors at the decade rows", () => {
    // The transcription itself is what needs asserting. If one of these
    // fails, check Treas. Reg. 1.401(a)(9)-9 before changing the test.
    expect(UNIFORM_LIFETIME[72]).toBe(27.4);
    expect(UNIFORM_LIFETIME[73]).toBe(26.5);
    expect(UNIFORM_LIFETIME[75]).toBe(24.6);
    expect(UNIFORM_LIFETIME[80]).toBe(20.2);
    expect(UNIFORM_LIFETIME[85]).toBe(16.0);
    expect(UNIFORM_LIFETIME[90]).toBe(12.2);
    expect(UNIFORM_LIFETIME[95]).toBe(8.9);
    expect(UNIFORM_LIFETIME[100]).toBe(6.4);
    expect(UNIFORM_LIFETIME[110]).toBe(3.5);
    expect(UNIFORM_LIFETIME[120]).toBe(2.0);
  });

  it("gives no divisor below the table and the last row above it", () => {
    expect(lifetimeDivisor(71)).toBe(null);
    expect(lifetimeDivisor(0)).toBe(null);
    expect(lifetimeDivisor(72)).toBe(27.4);
    // 120 is the last row and applies from there up.
    expect(lifetimeDivisor(120)).toBe(2.0);
    expect(lifetimeDivisor(130)).toBe(2.0);
    expect(lifetimeDivisor(Number.NaN)).toBe(null);
  });
});

describe("rmdStartAge", () => {
  it("follows SECURE 2.0's two steps, at the boundary years", () => {
    expect(rmdStartAge(1949)).toBe(72);
    expect(rmdStartAge(1950)).toBe(72);
    expect(rmdStartAge(1951)).toBe(73);
    expect(rmdStartAge(1958)).toBe(73);
    // The drafting ambiguity: resolved at 73 by the proposed regulations.
    expect(rmdStartAge(1959)).toBe(73);
    expect(rmdStartAge(1960)).toBe(75);
    expect(rmdStartAge(1985)).toBe(75);
  });
});

describe("computeRmd — this year", () => {
  it("divides the balance by the age's divisor", () => {
    const r = run();
    expect(r.divisor).toBe(26.5);
    expect(r.required).toBeCloseTo(800_000 / 26.5, 6);
    expect(r.requiredPercent).toBeCloseTo(100 / 26.5, 10);
    expect(r.taxOnRequired).toBeCloseTo((800_000 / 26.5) * 0.22, 6);
  });

  it("requires nothing before the start age, even though a divisor exists", () => {
    // Someone born in 1960 has a table row at 73 and no obligation until
    // 75. Reading the table instead of the statute would charge them two
    // years early.
    const r = run({ birthYear: 1960, currentAge: 73 });
    expect(r.startAge).toBe(75);
    expect(r.alreadyRequired).toBe(false);
    expect(r.yearsUntilRequired).toBe(2);
    expect(r.divisor).toBe(null);
    expect(r.required).toBe(0);
    expect(r.requiredPercent).toBe(null);
    // But the table row itself is still there, which is the distinction.
    expect(lifetimeDivisor(73)).toBe(26.5);
  });

  it("starts exactly AT the start age, not after it", () => {
    expect(run({ birthYear: 1960, currentAge: 74 }).required).toBe(0);
    const at = run({ birthYear: 1960, currentAge: 75 });
    expect(at.alreadyRequired).toBe(true);
    expect(at.yearsUntilRequired).toBe(0);
    expect(at.divisor).toBe(24.6);
    expect(at.required).toBeCloseTo(800_000 / 24.6, 6);
  });
});

describe("computeRmd — the shortfall penalty", () => {
  it("charges 25% of what was not taken, and 10% if corrected", () => {
    const r = run({ plannedWithdrawal: 10_000 });
    const required = 800_000 / 26.5;
    expect(r.shortfall).toBeCloseTo(required - 10_000, 6);
    expect(r.penalty).toBeCloseTo(
      r.shortfall * (SHORTFALL_PENALTY_PERCENT / 100),
      6,
    );
    expect(r.penaltyIfCorrected).toBeCloseTo(
      r.shortfall * (CORRECTED_PENALTY_PERCENT / 100),
      6,
    );
    expect(r.planMeetsRequirement).toBe(false);
  });

  it("charges nothing when the plan meets or beats the requirement", () => {
    const exact = run({ plannedWithdrawal: 800_000 / 26.5 });
    expect(exact.shortfall).toBeCloseTo(0, 6);
    expect(exact.penalty).toBeCloseTo(0, 6);
    expect(exact.planMeetsRequirement).toBe(true);

    const more = run({ plannedWithdrawal: 100_000 });
    expect(more.shortfall).toBe(0);
    expect(more.penalty).toBe(0);
    expect(more.planMeetsRequirement).toBe(true);
  });

  it("charges nothing before the start age, however little is planned", () => {
    const r = run({ birthYear: 1960, currentAge: 70, plannedWithdrawal: 0 });
    expect(r.required).toBe(0);
    expect(r.shortfall).toBe(0);
    expect(r.penalty).toBe(0);
    expect(r.planMeetsRequirement).toBe(true);
  });
});

describe("computeRmd — the projection", () => {
  it("runs from the current age to the year before the end age", () => {
    const r = run();
    expect(r.years).toHaveLength(22);
    expect(r.years[0].age).toBe(73);
    expect(r.years.at(-1)!.age).toBe(94);
  });

  it("takes the distribution before crediting the return", () => {
    const r = run();
    const first = r.years[0];
    expect(first.closingBalance).toBeCloseTo(
      (800_000 - first.required) * 1.07,
      6,
    );
    // Crediting the return first would leave more in the account, which is
    // the error this ordering avoids.
    expect(first.closingBalance).toBeLessThan(800_000 * 1.07 - first.required);
  });

  it("carries each year's closing balance into the next year's divisor", () => {
    const r = run();
    for (let i = 1; i < r.years.length; i += 1) {
      expect(r.years[i].openingBalance).toBeCloseTo(
        r.years[i - 1].closingBalance,
        6,
      );
    }
  });

  it("keeps GROWING while the required percentage is below the return", () => {
    // The finding the page is built on. At a 7% return the required draw
    // starts at 3,77% and the account keeps growing for years.
    const r = run();
    expect(r.years[0].stillGrowing).toBe(true);
    expect(r.peakAge).not.toBe(null);
    expect(r.peakBalance).toBeGreaterThan(800_000);
    // It turns over when the required percentage passes r / (1 + r), NOT r:
    // the distribution comes out before the return is credited, so the draw
    // only has to beat the return on what is left. At 7% that threshold is
    // 6,54%, and the account therefore stops growing a year earlier than a
    // reader comparing the draw with the raw 7% would predict.
    const threshold = (0.07 / 1.07) * 100;
    expect(threshold).toBeCloseTo(6.5421, 4);
    const crossing = r.years.find((row) => !row.stillGrowing)!;
    expect(crossing.requiredPercent!).toBeGreaterThan(threshold);
    expect(crossing.requiredPercent!).toBeLessThan(7);
    const lastGrowing = r.years[r.years.indexOf(crossing) - 1];
    expect(lastGrowing.requiredPercent!).toBeLessThan(threshold);
    expect(r.peakAge).toBe(lastGrowing.age);
  });

  it("puts the crossover exactly where the algebra says", () => {
    // closing = opening x (1 - 1/d) x (1 + r), so growth needs
    // 1/d < r / (1 + r). Swept across returns to pin the whole relation
    // rather than one crossing.
    for (const returnPercent of [1, 3, 5, 7, 10, 15]) {
      const r = run({ returnPercent, currentAge: 73, endAge: 120 });
      const rate = returnPercent / 100;
      const threshold = (rate / (1 + rate)) * 100;
      for (const row of r.years) {
        if (row.requiredPercent === null) continue;
        expect(
          row.stillGrowing,
          `${returnPercent}% at age ${row.age}`,
        ).toBe(row.requiredPercent < threshold);
      }
    }
  });

  it("never grows at a return of zero", () => {
    const r = run({ returnPercent: 0 });
    for (const row of r.years) expect(row.stillGrowing).toBe(false);
    expect(r.peakAge).toBe(null);
    expect(r.peakBalance).toBe(800_000);
    expect(r.finalBalance).toBeLessThan(800_000);
  });

  it("moves the crossing when the return moves", () => {
    const low = run({ returnPercent: 4 });
    const high = run({ returnPercent: 10 });
    expect(low.peakAge!).toBeLessThan(high.peakAge!);
  });

  it("adds the yearly figures up to the totals", () => {
    const r = run();
    const sumRequired = r.years.reduce((total, row) => total + row.required, 0);
    const sumTax = r.years.reduce((total, row) => total + row.tax, 0);
    expect(r.totalRequired).toBeCloseTo(sumRequired, 4);
    expect(r.totalTax).toBeCloseTo(sumTax, 4);
    // The tax is a flat rate on the distributions, so the ratio is exact.
    expect(r.totalTax).toBeCloseTo(r.totalRequired * 0.22, 4);
    expect(r.finalBalance).toBeCloseTo(r.years.at(-1)!.closingBalance, 10);
  });

  it("never empties the account, because the divisor never reaches one", () => {
    // A distribution is always a fraction of the balance, so the balance
    // approaches zero without arriving there. Worth pinning: a reader might
    // expect the table to run the account down to nothing by 120.
    const r = run({ currentAge: 90, endAge: 120, returnPercent: 0 });
    expect(r.finalBalance).toBeGreaterThan(0);
    for (const row of r.years) expect(row.closingBalance).toBeGreaterThan(0);
  });

  it("reads the oldest table rows a projection can reach", () => {
    // `endAge` is exclusive and capped at 120, so age 120 itself never
    // appears in a projection; `lifetimeDivisor` covers it and everything
    // above it directly.
    const r = run({ currentAge: 117, endAge: 120, birthYear: 1905 });
    expect(r.years.map((row) => row.divisor)).toEqual([2.7, 2.5, 2.3]);
  });

  it("floors the balance at zero on a total loss", () => {
    const r = run({ returnPercent: -100 });
    for (const row of r.years) {
      expect(row.closingBalance).toBeGreaterThanOrEqual(0);
    }
    expect(r.finalBalance).toBe(0);
  });
});

describe("computeRmd — rejections and edges", () => {
  it("rejects impossible inputs", () => {
    expect(computeRmd({ ...BASE, balance: -1 })).toBe(null);
    expect(computeRmd({ ...BASE, plannedWithdrawal: -1 })).toBe(null);
    expect(computeRmd({ ...BASE, currentAge: 121 })).toBe(null);
    expect(computeRmd({ ...BASE, currentAge: 73.5 })).toBe(null);
    expect(computeRmd({ ...BASE, endAge: 73 })).toBe(null);
    expect(computeRmd({ ...BASE, endAge: 72 })).toBe(null);
    expect(computeRmd({ ...BASE, currentAge: 30, endAge: 95 })).toBe(null);
    expect(computeRmd({ ...BASE, birthYear: 1899 })).toBe(null);
    expect(computeRmd({ ...BASE, birthYear: 1953.5 })).toBe(null);
    expect(computeRmd({ ...BASE, returnPercent: -101 })).toBe(null);
    expect(computeRmd({ ...BASE, marginalRatePercent: 101 })).toBe(null);
  });

  it("handles a zero balance without dividing by it", () => {
    const r = run({ balance: 0 });
    expect(r.required).toBe(0);
    expect(r.requiredPercent).toBe(null);
    expect(r.totalRequired).toBe(0);
    expect(r.finalBalance).toBe(0);
  });

  it("handles a one-year projection", () => {
    const r = run({ endAge: 74 });
    expect(r.years).toHaveLength(1);
    expect(r.totalRequired).toBeCloseTo(r.required, 10);
  });
});
