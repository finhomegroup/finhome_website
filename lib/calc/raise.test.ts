import { describe, it, expect } from "vitest";
import { computeRaise, type RaiseInput } from "@/lib/calc/raise";

const CURRENT = 20_000_000;

function raise(input: RaiseInput) {
  const result = computeRaise(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeRaise — from a percentage", () => {
  it("applies the percentage to current pay", () => {
    const result = raise({ mode: "percent", current: CURRENT, value: 15 });
    expect(result.next).toBeCloseTo(23_000_000, 6);
    expect(result.increase).toBeCloseTo(3_000_000, 6);
    expect(result.increasePercent).toBeCloseTo(15, 10);
  });

  it("handles a 0% rise", () => {
    const result = raise({ mode: "percent", current: CURRENT, value: 0 });
    expect(result.next).toBe(CURRENT);
    expect(result.increase).toBe(0);
    expect(result.increasePercent).toBe(0);
  });

  it("handles a pay cut", () => {
    const result = raise({ mode: "percent", current: CURRENT, value: -10 });
    expect(result.next).toBeCloseTo(18_000_000, 6);
    expect(result.increase).toBeCloseTo(-2_000_000, 6);
    expect(result.increasePerYear).toBeCloseTo(-24_000_000, 6);
  });
});

describe("computeRaise — from an amount", () => {
  it("adds the amount and derives the percentage", () => {
    const result = raise({
      mode: "amount",
      current: CURRENT,
      value: 3_000_000,
    });
    expect(result.next).toBe(23_000_000);
    expect(result.increasePercent).toBeCloseTo(15, 10);
  });

  it("agrees with the percentage mode on the same rise", () => {
    const byPercent = raise({ mode: "percent", current: CURRENT, value: 15 });
    const byAmount = raise({
      mode: "amount",
      current: CURRENT,
      value: 3_000_000,
    });
    expect(byAmount.next).toBeCloseTo(byPercent.next, 6);
    expect(byAmount.increasePercent).toBeCloseTo(byPercent.increasePercent, 10);
  });
});

describe("computeRaise — from a target", () => {
  it("solves the percentage from the new pay", () => {
    const result = raise({
      mode: "target",
      current: CURRENT,
      value: 23_000_000,
    });
    expect(result.increasePercent).toBeCloseTo(15, 10);
    expect(result.increase).toBe(3_000_000);
    expect(result.next).toBe(23_000_000);
  });

  it("round-trips against the percentage mode", () => {
    const target = 27_500_000;
    const solved = raise({ mode: "target", current: CURRENT, value: target });
    const applied = raise({
      mode: "percent",
      current: CURRENT,
      value: solved.increasePercent,
    });
    expect(applied.next).toBeCloseTo(target, 6);
  });

  it("reports a target below current pay as a cut", () => {
    const result = raise({
      mode: "target",
      current: CURRENT,
      value: 18_000_000,
    });
    expect(result.increase).toBe(-2_000_000);
    expect(result.increasePercent).toBeCloseTo(-10, 10);
  });

  it("allows a target of 0 — losing the whole salary is −100%", () => {
    const result = raise({ mode: "target", current: CURRENT, value: 0 });
    expect(result.increasePercent).toBe(-100);
  });

  it("returns null on a negative target", () => {
    expect(
      computeRaise({ mode: "target", current: CURRENT, value: -1 }),
    ).toBeNull();
  });
});

describe("computeRaise — the yearly view", () => {
  it("annualises over 12 periods by default", () => {
    const result = raise({ mode: "percent", current: CURRENT, value: 15 });
    expect(result.increasePerYear).toBeCloseTo(36_000_000, 6);
    expect(result.nextPerYear).toBeCloseTo(276_000_000, 6);
  });

  it("counts a 13th month when told to", () => {
    // The reason perYear is an input: a 2 triệu/tháng rise is 26 triệu/năm on
    // a 13-month contract, not 24.
    const result = raise({
      mode: "amount",
      current: CURRENT,
      value: 2_000_000,
      perYear: 13,
    });
    expect(result.increasePerYear).toBeCloseTo(26_000_000, 6);
    expect(result.nextPerYear).toBeCloseTo(286_000_000, 6);
  });

  it("leaves the per-period figures untouched by perYear", () => {
    const twelve = raise({ mode: "percent", current: CURRENT, value: 15 });
    const thirteen = raise({
      mode: "percent",
      current: CURRENT,
      value: 15,
      perYear: 13,
    });
    expect(thirteen.next).toBeCloseTo(twelve.next, 6);
    expect(thirteen.increasePercent).toBeCloseTo(twelve.increasePercent, 10);
  });
});

describe("computeRaise — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    const modes = ["percent", "amount", "target"] as const;
    for (const mode of modes) {
      expect(computeRaise({ mode, current: 0, value: 10 })).toBeNull();
      expect(computeRaise({ mode, current: -1, value: 10 })).toBeNull();
      expect(computeRaise({ mode, current: CURRENT, value: Number.NaN })).toBeNull();
      expect(
        computeRaise({ mode, current: Number.NaN, value: 10 }),
      ).toBeNull();
      expect(
        computeRaise({ mode, current: CURRENT, value: 10, perYear: 0 }),
      ).toBeNull();
      expect(
        computeRaise({ mode, current: CURRENT, value: 10, perYear: -1 }),
      ).toBeNull();
    }
  });
});
