/**
 * The F3 savings adapter against the real engines: `computeSavingsGoal`,
 * `savingsScheduleFor` and `projectSavings`. Every row asserted is a schedule
 * point; nothing is interpolated.
 */
import { describe, expect, it } from "vitest";
import { moneyText } from "@/components/calc/accumulation";
import { heldTrials, trialReducer, type TrialState } from "@/components/calc/learning-trials";
import {
  makeSavingsTrial,
  nextSavingsValue,
  savingsDisplayable,
  savingsImpactView,
  savingsTimelineView,
  savingsTrialAvailability,
  savingsTrialKeys,
  type SavingsSnapshot,
  type SavingsTrialKey,
} from "@/components/savings-learning";
import { SAVINGS_LEARNING as L } from "@/content/calculators/savings-learning";
import { fill } from "@/lib/calc/charts/labels";
import { computeSavingsGoal, type SavingsGoalMode } from "@/lib/calc/savings-goal";
import { projectSavings, savingsScheduleFor, type SavingsSchedule } from "@/lib/calc/savings-schedule";

const RATE = 6;
const solve = (mode: SavingsGoalMode, patch: { initial?: number; target?: number; contribution?: number; months?: number } = {}) => {
  const input = { initial: 100_000_000, target: 500_000_000, contribution: 6_000_000, months: 60, ...patch };
  const result = computeSavingsGoal({
    mode,
    initial: input.initial,
    annualRatePercent: RATE,
    target: mode === "target" ? undefined : input.target,
    contribution: mode === "contribution" ? undefined : input.contribution,
    months: mode === "months" ? undefined : input.months,
  });
  return { result, schedule: savingsScheduleFor(result, RATE, mode), target: input.target };
};
const snapshotOf = (mode: SavingsGoalMode, s: SavingsSchedule, contribution: number): SavingsSnapshot => ({
  mode,
  contribution,
  fundedMonth: s.fundedMonth,
  balance: s.balance,
  totalContributed: s.totalContributed,
  interest: s.interest,
});

describe("the three modes, read off the schedule", () => {
  it("contribution mode: the target line, and the three parts at the last month", () => {
    const { schedule, target } = solve("contribution");
    const view = savingsTimelineView(schedule, "contribution", target, null)!;
    const last = schedule!.points.at(-1)!;
    expect(last.period).toBe(60);
    expect(view.index).toBe(view.lastIndex);
    expect(view.caption).toBe(fill(L.caption, { period: "60" }));
    const [initial, added, interest] = view.segments;
    const scale = Math.max(target, ...schedule!.points.map((p) => p.balance));
    expect(initial.percent).toBeCloseTo((100_000_000 / scale) * 100, 9);
    // Added money is contributions since the start — the start is not counted twice.
    expect(added.percent).toBeCloseTo(((last.contributed - 100_000_000) / scale) * 100, 9);
    expect(initial.percent + added.percent + interest.percent).toBeCloseTo((last.balance / scale) * 100, 9);
    expect(view.targetPercent).toBeCloseTo((target / scale) * 100, 9);
    expect(view.targetLine).toContain(moneyText(target));
    expect(view.notes).toContain(L.solvedContribution);
    expect(view.balanceText).toBe(fill(L.balance, { balance: moneyText(schedule!.balance) }));
  });

  it("month 0 is the start alone: no contribution and no interest yet", () => {
    const { schedule, target } = solve("contribution");
    const view = savingsTimelineView(schedule, "contribution", target, 0)!;
    expect(view.caption).toBe(L.captionStart);
    expect(view.segments[1].percent).toBe(0);
    expect(view.segments[2].percent).toBe(0);
    expect(view.sentence).toBe(fill(L.momentStart, { initial: moneyText(100_000_000) }));
  });

  it("months mode: short of the target before the funded month, reached at it", () => {
    const { schedule, target } = solve("months");
    const funded = schedule!.fundedMonth!;
    expect(schedule!.months).toBe(funded);
    const end = savingsTimelineView(schedule, "months", target, null)!;
    expect(end.targetLine).toBe(fill(L.targetReached, { target: moneyText(target), month: String(funded) }));
    const before = savingsTimelineView(schedule, "months", target, funded - 1)!;
    expect(before.targetLine).toMatch(/^Còn thiếu khoảng/);
    expect(end.notes).toContain(L.solvedMonths);
  });

  it("target mode: no target mark and no target sentence, on a balance scale", () => {
    const { schedule } = solve("target");
    const view = savingsTimelineView(schedule, "target", null, null)!;
    expect(view.targetPercent).toBeNull();
    expect(view.targetLine).toBeNull();
    expect(view.scaleText).toBe(fill(L.scaleBalance, { scale: moneyText(schedule!.balance) }));
    // A stray target passed in target mode is ignored, never drawn.
    expect(savingsTimelineView(schedule, "target", 500_000_000, null)!.targetPercent).toBeNull();
  });
});

describe("the engine's states", () => {
  const core = { monthlyRate: RATE / 100 / 12 };
  it("already funded: one row, and it says so", () => {
    const s = projectSavings({ ...core, initial: 600_000_000, contribution: 1_000_000, target: 500_000_000 });
    expect(s.status).toBe("alreadyFunded");
    const view = savingsTimelineView(s, "months", 500_000_000, null)!;
    expect(view.lastIndex).toBe(0);
    expect(view.notes).toContain(L.alreadyFunded);
    expect(view.targetLine).toBe(fill(L.targetReachedStart, { target: moneyText(500_000_000) }));
  });

  it("unattainable: no contribution and no rate", () => {
    const s = projectSavings({ monthlyRate: 0, initial: 1_000_000, contribution: 0, target: 500_000_000 });
    expect(s.status).toBe("unattainable");
    expect(savingsTimelineView(s, "months", 500_000_000, null)!.notes).toContain(L.unattainable);
  });

  it("beyond the limit: sampled rows, each a real whole month, and both notes", () => {
    const s = projectSavings({ monthlyRate: 0, initial: 0, contribution: 1, target: 500_000_000 });
    expect(s.status).toBe("beyondLimit");
    expect(s.sampled).toBe(true);
    const view = savingsTimelineView(s, "months", 500_000_000, 1)!;
    expect(view.notes).toContain(fill(L.beyondLimit, { limit: "1.200" }));
    expect(view.notes).toContain(L.sampled);
    for (const point of s.points) expect(Number.isInteger(point.period)).toBe(true);
    // Index 1 is the schedule's own second point, labelled with ITS month.
    expect(view.caption).toBe(fill(L.caption, { period: String(s.points[1].period) }));
    expect(view.lastIndex).toBe(s.points.length - 1);
  });

  it("no schedule or an invalid one draws nothing", () => {
    expect(savingsTimelineView(null, "contribution", 1, null)).toBeNull();
    const bad = projectSavings({ monthlyRate: 1e308, initial: 1, contribution: 1, months: 1200 });
    expect(bad.status).toBe("invalid");
    expect(savingsTimelineView(bad, "target", null, null)).toBeNull();
  });

  it("a cursor past the rows is clamped to the last one", () => {
    const { schedule, target } = solve("contribution");
    expect(savingsTimelineView(schedule, "contribution", target, 999)!.index).toBe(schedule!.points.length - 1);
  });
});

describe("the trial never writes the solved figure", () => {
  const values = { mode: "contribution", contribution: "6.000.000", months: "60" };

  it("contribution mode offers +12 months on the TYPED horizon only", () => {
    expect(savingsTrialKeys("contribution")).toEqual(["horizon"]);
    expect(savingsTrialKeys("months")).toEqual(["contribution"]);
    expect(savingsTrialKeys("target")).toEqual(["contribution"]);
    const { schedule, result } = solve("contribution");
    const trial = makeSavingsTrial({
      key: "horizon",
      values,
      revision: 0,
      snapshot: snapshotOf("contribution", schedule!, result!.contribution),
      usable: true,
    })!;
    expect(trial.after).toEqual({ ...values, months: "72" });
    expect(trial.after.contribution).toBe(values.contribution);
    // The contribution trial is not offered where the contribution is solved.
    expect(savingsTrialAvailability("contribution", { usable: true, mode: "contribution", values }).enabled).toBe(false);
    expect(savingsTrialAvailability("horizon", { usable: true, mode: "contribution", values: { ...values, months: "1195" } })).toEqual({
      enabled: false,
      reason: L.blocked.horizonLimit,
    });
  });

  it("+12 months: the required contribution before and after, from the engine", () => {
    const before = solve("contribution");
    const after = solve("contribution", { months: 72 });
    const trial = makeSavingsTrial({
      key: "horizon",
      values,
      revision: 0,
      snapshot: snapshotOf("contribution", before.schedule!, before.result!.contribution),
      usable: true,
    })!;
    const impact = savingsImpactView(trial, snapshotOf("contribution", after.schedule!, after.result!.contribution));
    expect(after.result!.contribution).toBeLessThan(before.result!.contribution);
    expect(impact.lines[0]).toBe(
      fill(L.impact.contribution, {
        before: moneyText(before.result!.contribution),
        after: moneyText(after.result!.contribution),
      }),
    );
    expect(impact.bars).toHaveLength(2);
  });

  it("+1 triệu in months mode reaches the target earlier, by the engine's own months", () => {
    const before = solve("months");
    const after = solve("months", { contribution: 7_000_000 });
    const trial = makeSavingsTrial({
      key: "contribution",
      values: { ...values, mode: "months" },
      revision: 0,
      snapshot: snapshotOf("months", before.schedule!, 6_000_000),
      usable: true,
    })!;
    expect(trial.after.contribution).toBe("7.000.000");
    const impact = savingsImpactView(trial, snapshotOf("months", after.schedule!, 7_000_000));
    const [b, a] = [before.schedule!.fundedMonth!, after.schedule!.fundedMonth!];
    expect(a).toBeLessThan(b);
    expect(impact.lines[0]).toBe(fill(L.impact.monthsEarlier, { after: String(a), before: String(b), n: String(b - a) }));
  });

  it("+1 triệu in target mode: the added money is exactly 1 triệu × months", () => {
    const before = solve("target");
    const after = solve("target", { contribution: 7_000_000 });
    const trial = makeSavingsTrial({
      key: "contribution",
      values: { ...values, mode: "target" },
      revision: 0,
      snapshot: snapshotOf("target", before.schedule!, 6_000_000),
      usable: true,
    })!;
    const impact = savingsImpactView(trial, snapshotOf("target", after.schedule!, 7_000_000));
    expect(after.schedule!.totalContributed - before.schedule!.totalContributed).toBe(60_000_000);
    expect(impact.lines[0]).toContain(moneyText(60_000_000));
  });

  it("a manual edit, a mode switch or a reset retires the trial and its undo", () => {
    const { schedule } = solve("target");
    const trial = makeSavingsTrial({
      key: "contribution",
      values: { ...values, mode: "target" },
      revision: 0,
      snapshot: snapshotOf("target", schedule!, 6_000_000),
      usable: true,
    })!;
    let state: TrialState<SavingsTrialKey, SavingsSnapshot> = { revision: 0, trials: [] };
    state = trialReducer(state, { type: "apply", trial });
    expect(heldTrials(state, trial.after)).toHaveLength(1);
    for (const action of [{ type: "edit" }, { type: "reset" }] as const) {
      const next = trialReducer(state, action);
      expect(heldTrials(next, trial.after)).toHaveLength(0);
    }
    // A mode switch is a different form: the trial no longer holds.
    expect(heldTrials(state, { ...trial.after, mode: "months" })).toHaveLength(0);
  });
});

describe("independent review repairs (2026-09-29)", () => {
  it("item 1 pinned: the horizon trial keeps digits-only month counts", () => {
    expect(nextSavingsValue("horizon", "1000")).toBe("1012");
    // A grouped count is not a count here: the parser rejects it, and so does the trial.
    expect(nextSavingsValue("horizon", "1.000")).toBeNull();
  });

  it("item 3: figures past the formatter's display boundary draw nothing", () => {
    const huge = projectSavings({ monthlyRate: 0, initial: 1e24, contribution: 8_000_000, months: 12 });
    expect(huge.status).toBe("horizon");
    expect(savingsDisplayable(huge, null)).toBe(false);
    expect(savingsTimelineView(huge, "target", null, null)).toBeNull();
    const large = projectSavings({ monthlyRate: 0, initial: 1e15, contribution: 8_000_000, months: 12 });
    expect(savingsDisplayable(large, null)).toBe(true);
    const view = savingsTimelineView(large, "target", null, null)!;
    expect(view.segments.every((s) => !s.text.includes("—"))).toBe(true);
    expect(view.segments[1].percent).toBeGreaterThan(0);
  });

  it("finding 1: the scale is named apart from the actual target", () => {
    // 8 triệu a month: the funded cycle's balance passes the 500 triệu goal.
    const { schedule, target } = solve("months", { contribution: 8_000_000 });
    const scale = Math.max(target, ...schedule!.points.map((p) => p.balance));
    expect(scale).toBeGreaterThan(target);
    const view = savingsTimelineView(schedule, "months", target, null)!;
    expect(view.scaleText).toBe(fill(L.scaleTarget, { scale: moneyText(scale), target: moneyText(target) }));
    expect(view.scaleText).toContain(moneyText(target));
    expect(view.scaleText).not.toContain(`mục tiêu ${moneyText(scale)}`);
    // The drawn mark is the goal's own height, below 100%.
    expect(view.targetPercent).toBeCloseTo((target / scale) * 100, 9);
    expect(view.targetPercent).toBeLessThan(100);
  });

  it("finding 5: a valid form with no schedule is blocked for that reason, not a bad field", () => {
    const values = { mode: "months", contribution: "6.000.000", months: "60" };
    expect(
      savingsTrialAvailability("contribution", { usable: false, mode: "months", values, reason: L.blocked.noAnswer }),
    ).toEqual({ enabled: false, reason: L.blocked.noAnswer });
    expect(savingsTrialAvailability("contribution", { usable: false, mode: "months", values })).toEqual({
      enabled: false,
      reason: L.blocked.invalid,
    });
  });
});
