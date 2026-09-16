import { describe, it, expect } from "vitest";
import { countTicks, linearTicks, niceMax } from "@/lib/calc/charts/types";

describe("countTicks — an axis of whole periods", () => {
  const label = (value: number) => String(value);

  it("labels each count at ITS OWN position", () => {
    // What `linearTicks` does to the same axis, for contrast: five equal
    // intervals on a 3-period axis land at 0, 0,75, 1,5, 2,25, 3 and a
    // rounding formatter prints 0, 1, 2, 2, 3.
    expect(
      linearTicks(3, 4, (value) => String(Math.round(value))).map((t) => t.label),
    ).toEqual(["0", "1", "2", "2", "3"]);
    expect(countTicks(3, 5, label)).toEqual([
      { at: 0, label: "0" },
      { at: 1 / 3, label: "1" },
      { at: 2 / 3, label: "2" },
      { at: 1, label: "3" },
    ]);
  });

  it("strides to stay under the ceiling, and always keeps the end", () => {
    expect(countTicks(37, 5, label).map((t) => t.label)).toEqual([
      "0",
      "10",
      "20",
      "30",
      "37",
    ]);
    expect(countTicks(1200, 5, label).map((t) => t.label)).toEqual([
      "0",
      "300",
      "600",
      "900",
      "1200",
    ]);
    expect(countTicks(37, 5, label).at(-1)!.at).toBe(1);
  });

  it("never emits a repeated value, at any small horizon", () => {
    for (const max of [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 179]) {
      const ticks = countTicks(max, 5, label);
      const labels = ticks.map((t) => t.label);
      expect(new Set(labels).size, `max ${max}`).toBe(labels.length);
      expect(labels.length, `max ${max}`).toBeLessThanOrEqual(5);
      expect(ticks[0].at, `max ${max}`).toBe(0);
      expect(ticks.at(-1)!.at, `max ${max}`).toBe(1);
    }
  });

  it("keeps a fractional end as its own tick instead of flooring it", () => {
    const ticks = countTicks(3.5, 5, (value) =>
      Number.isInteger(value) ? String(value) : value.toFixed(1),
    );
    expect(ticks.map((t) => t.label)).toEqual(["0", "1", "2", "3", "3.5"]);
    expect(ticks.at(-1)!.at).toBe(1);
  });

  it("survives a float residue on a whole period", () => {
    // 36,999999999999996 must not floor to 36 and lose the endpoint.
    expect(countTicks(37 - 4e-15, 5, label).at(-1)!.label).toBe("37");
  });

  it("refuses an axis it cannot tick", () => {
    expect(countTicks(0, 5, label)).toEqual([]);
    expect(countTicks(-3, 5, label)).toEqual([]);
    expect(countTicks(Number.NaN, 5, label)).toEqual([]);
    expect(countTicks(10, 1, label)).toEqual([]);
  });
});

describe("niceMax", () => {
  it("lifts a maximum to a bound a tick label can say", () => {
    // The real case: an axis whose top tick would otherwise read 17.356.465.
    expect(niceMax(17_356_465)).toBe(20_000_000);
    expect(niceMax(2_304_616_796)).toBe(2_500_000_000);
    expect(niceMax(18_000_000)).toBe(20_000_000);
    expect(niceMax(4_000_000)).toBe(4_000_000);
    // Yearly payments on a 2 tỷ / 8,5% / 240-month loan. On a coarse
    // 1/2/5 ladder this became 5e8 and the chart used 42% of its height.
    expect(niceMax(208_277_580)).toBe(250_000_000);
  });

  it("lands exactly on a bound that is already nice", () => {
    // A value already on a rung must not be inflated to the next one, or a
    // chart at exactly 20 triệu would draw to 25.
    expect(niceMax(1_000)).toBe(1_000);
    expect(niceMax(2_000)).toBe(2_000);
    expect(niceMax(5_000)).toBe(5_000);
    expect(niceMax(10_000)).toBe(10_000);
    expect(niceMax(2_500)).toBe(2_500);
    expect(niceMax(1_500)).toBe(1_500);
  });

  it("always returns a bound at or above its input", () => {
    // The property that matters: a bar can never overflow its own axis.
    for (const value of [
      1, 3, 7, 99, 101, 999, 1_001, 12_345, 999_999, 1_234_567_890,
      8_333_333.33, 0.5, 0.02,
    ]) {
      expect(niceMax(value), `niceMax(${value})`).toBeGreaterThanOrEqual(value);
    }
  });

  it("never wastes more than a third of the plot", () => {
    // The reason for the finer ladder, asserted as a property across three
    // decades rather than on the one case that motivated it.
    for (let value = 1; value < 1_000; value += 1) {
      const bound = niceMax(value);
      expect(value / bound, `fill ratio at ${value}`).toBeGreaterThan(0.66);
    }
  });

  it("returns 0 for anything that cannot bound an axis", () => {
    // Callers divide by this, so the refusal has to be explicit rather than a
    // small positive number that would produce an Infinity-tall bar.
    expect(niceMax(0)).toBe(0);
    expect(niceMax(-5)).toBe(0);
    expect(niceMax(NaN)).toBe(0);
    expect(niceMax(Infinity)).toBe(0);
  });
});

describe("linearTicks", () => {
  it("returns count + 1 ticks, spanning 0 to max inclusive", () => {
    const ticks = linearTicks(20_000_000, 4, (v) => String(v));
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toEqual({ at: 0, label: "0" });
    expect(ticks[4]).toEqual({ at: 1, label: "20000000" });
  });

  it("spaces the ticks evenly as fractions of the axis", () => {
    const ticks = linearTicks(100, 4, (v) => String(v));
    expect(ticks.map((t) => t.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(ticks.map((t) => t.label)).toEqual(["0", "25", "50", "75", "100"]);
  });

  it("returns nothing when there is no axis to tick", () => {
    expect(linearTicks(0, 4, String)).toEqual([]);
    expect(linearTicks(-1, 4, String)).toEqual([]);
    expect(linearTicks(NaN, 4, String)).toEqual([]);
    expect(linearTicks(100, 0, String)).toEqual([]);
  });
});
