/**
 * The F3 compound adapter against `computeCompound`: credited snapshots only,
 * the deposit PER COMPOUNDING PERIOD, partial final years at their real
 * elapsed time, and start + added + interest = the balance.
 */
import { describe, expect, it } from "vitest";
import { moneyText } from "@/components/calc/accumulation";
import {
  compoundDisplayable,
  compoundImpactView,
  compoundTimelineView,
  compoundTrialAvailability,
  compoundTrialLabel,
  makeCompoundTrial,
  yearsText,
  yearsLabel,
} from "@/components/compound-learning";
import { COMPOUND_LEARNING as L } from "@/content/calculators/compound-learning";
import { fill } from "@/lib/calc/charts/labels";
import { computeCompound, type CompoundInput } from "@/lib/calc/compound";

const BASE: CompoundInput = {
  principal: 100_000_000,
  annualRatePercent: 6,
  years: 10,
  compounding: "monthly",
  contributionPerPeriod: 8_000_000,
};
const run = (patch: Partial<CompoundInput> = {}, picked: number | null = null) => {
  const input = { ...BASE, ...patch };
  const result = computeCompound(input);
  return {
    result,
    view: compoundTimelineView(result, input.principal, input.contributionPerPeriod ?? 0, input.compounding, picked),
  };
};

describe("the shipped deposit", () => {
  it("ends on the engine's future value, split into start + added + interest", () => {
    const { result, view } = run();
    expect(view!.lastIndex).toBe(10);
    expect(view!.balanceText).toBe(fill(L.balance, { balance: moneyText(result!.futureValue) }));
    const [initial, added, interest] = view!.segments;
    const fv = result!.futureValue;
    expect(initial.percent).toBeCloseTo((100_000_000 / fv) * 100, 9);
    expect(added.percent).toBeCloseTo(((result!.totalContributed - 100_000_000) / fv) * 100, 9);
    expect(initial.percent + added.percent + interest.percent).toBeCloseTo(100, 9);
    expect(view!.notes).toContain(fill(L.perPeriod, { amount: moneyText(8_000_000), period: "tháng" }));
  });

  it("opens with a row before any credit: the start alone", () => {
    const { view } = run({}, 0);
    expect(view!.caption).toBe(L.captionStart);
    expect(view!.segments.map((s) => s.percent).slice(1)).toEqual([0, 0]);
  });
});

describe("the compounding period decides the labels", () => {
  it("1,5 năm ghép nửa năm: 3 credited periods, the last row at 1,5 years", () => {
    const { result, view } = run({ years: 1.5, compounding: "semiannually" });
    expect(result!.periods).toBe(3);
    expect(result!.uncreditedPeriods).toBe(0);
    const last = result!.yearlyBalances.at(-1)!;
    expect(last.elapsedYears).toBe(1.5);
    expect(view!.caption).toBe(
      `${fill(L.caption, { years: "1,5", periods: "3", period: "nửa năm" })} — ${L.partial}`,
    );
    expect(view!.caption).not.toMatch(/2 năm/);
    expect(view!.notes.some((note) => note.startsWith("Chỉ tính"))).toBe(false);
  });

  it("2,5 năm ghép hằng năm credits 2 periods and says the half-period is uncredited", () => {
    const { result, view } = run({ years: 2.5, compounding: "annually" });
    expect(result!.periods).toBe(2);
    expect(view!.lastIndex).toBe(2);
    expect(view!.caption).toBe(fill(L.caption, { years: "2", periods: "2", period: "năm" }));
    expect(view!.notes).toContain(fill(L.credited, { periods: "2", years: "2", uncredited: "0,5" }));
  });

  it("the deposit and the trial are named per period, not per month", () => {
    expect(compoundTrialLabel("quarterly")).toBe("Gửi thêm 1 triệu mỗi quý");
    expect(compoundTrialLabel("daily")).toBe("Gửi thêm 1 triệu mỗi ngày");
    const { view } = run({ compounding: "quarterly", contributionPerPeriod: 2_000_000 });
    expect(view!.notes).toContain(fill(L.perPeriod, { amount: moneyText(2_000_000), period: "quý" }));
    // Daily over ten years: thousands of periods, grouped.
    expect(run({ compounding: "daily" }).view!.caption).toContain("3.650 kỳ");
  });

  it("formats elapsed years without inventing a whole year", () => {
    expect(yearsText(1.5)).toBe("1,5");
    expect(yearsText(2)).toBe("2");
    expect(yearsText(0.25)).toBe("0,25");
  });
});

describe("zero, empty and extreme inputs", () => {
  it("0% rate: no interest, and the page says so", () => {
    const { view } = run({ annualRatePercent: 0 });
    expect(view!.segments[2].percent).toBe(0);
    expect(view!.notes).toContain(L.zeroRate);
  });

  it("starting from nothing with a deposit: no starting segment", () => {
    const { view } = run({ principal: 0 });
    expect(view!.segments[0].percent).toBe(0);
    expect(view!.segments[1].percent).toBeGreaterThan(0);
  });

  it("no money at all, and a growth that overflows, draw nothing", () => {
    expect(run({ principal: 0, contributionPerPeriod: 0 }).view).toBeNull();
    expect(run({ annualRatePercent: 1e300, compounding: "daily", years: 100 }).view).toBeNull();
  });

  it("very large finite balances keep finite shares", () => {
    const { view } = run({ principal: 1e15, contributionPerPeriod: 0 });
    for (const segment of view!.segments) expect(Number.isFinite(segment.percent)).toBe(true);
  });
});

describe("the +1 triệu per period trial", () => {
  const values = { principal: "100.000.000", rate: "6", years: "10", compounding: "monthly", contribution: "8.000.000" };

  it("writes the typed deposit only, and reports the engine's own change", () => {
    const before = computeCompound(BASE)!;
    const trial = makeCompoundTrial({ values, revision: 0, result: before })!;
    expect(trial.after).toEqual({ ...values, contribution: "9.000.000" });
    const after = computeCompound({ ...BASE, contributionPerPeriod: 9_000_000 })!;
    const impact = compoundImpactView(trial, after, "monthly");
    // Added money is exactly 1 triệu × the credited periods.
    expect(after.totalContributed - before.totalContributed).toBe(120_000_000);
    expect(impact.lines[0]).toContain(moneyText(120_000_000));
    expect(impact.lines[0]).toContain("120 kỳ");
    expect(impact.bars).toHaveLength(2);
  });

  it("is blocked without a result", () => {
    expect(compoundTrialAvailability(L.blocked.invalid, values)).toEqual({ enabled: false, reason: L.blocked.invalid });
    // A valid form with no whole period is blocked for THAT reason, not a bad field.
    expect(compoundTrialAvailability(L.blocked.noPeriod, values)).toEqual({ enabled: false, reason: L.blocked.noPeriod });
    expect(makeCompoundTrial({ values, revision: 0, result: null })).toBeNull();
  });
});

describe("independent review repairs (2026-09-29)", () => {
  it("item 3: 1e24 at 0% for one year is past the display boundary — no vessel", () => {
    const { result, view } = run({ principal: 1e24, annualRatePercent: 0, years: 1, compounding: "annually" });
    expect(result).not.toBeNull();
    expect(compoundDisplayable(result, 1e24)).toBe(false);
    expect(view).toBeNull();
    // 1e15 still draws, every amount printable.
    const large = run({ principal: 1e15, contributionPerPeriod: 0 });
    expect(compoundDisplayable(large.result, 1e15)).toBe(true);
    expect(large.view!.segments.every((s) => !s.text.includes("—"))).toBe(true);
  });

  it("finding 2 pinned: 0 interest at a POSITIVE rate is not called a 0% rate", () => {
    // One annual period, the deposit arriving at its end: nothing to earn yet.
    const { result, view } = run({ principal: 0, contributionPerPeriod: 1_000_000, compounding: "annually", years: 1, annualRatePercent: 25 });
    expect(result!.totalInterest).toBe(0);
    expect(view!.notes).not.toContain(L.zeroRate);
    // At an actual 0% it is.
    expect(run({ annualRatePercent: 0 }).view!.notes).toContain(L.zeroRate);
  });

  it("finding 4: one daily period is never '0 năm', and 366 days is not '1 năm'", () => {
    const one = run({ years: 1 / 365, compounding: "daily" });
    expect(one.result!.periods).toBe(1);
    expect(one.view!.caption).toContain("1 kỳ");
    expect(one.view!.caption).toContain("khoảng 0,003 năm");
    expect(one.view!.caption).not.toMatch(/\(0 năm\)/);
    const over = run({ years: 1.003, compounding: "daily" });
    expect(over.result!.periods).toBe(366);
    expect(over.view!.caption).toContain("366 kỳ");
    expect(over.view!.caption).toContain("khoảng 1,003 năm");
    expect(yearsLabel(1.5)).toBe("1,5");
    expect(yearsLabel(2)).toBe("2");
    expect(yearsLabel(1 / 365)).toBe("khoảng 0,003");
    expect(yearsLabel(0.0001)).toBe("khoảng dưới 0,001");
  });

  it("finding 6: the view says it walks yearly anchors, not every period", () => {
    expect(L.title).not.toMatch(/từng kỳ/);
    expect(run().view!.notes).toContain(L.anchors);
    expect(L.steps.prev.name).toContain("mốc");
    expect(L.steps.next.name).toContain("mốc");
  });
});
