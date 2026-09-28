// The hero's teaching moment: what a lever press did, in the card's years.
import { describe, expect, it } from "vitest";
import { announcementOf } from "@/components/calc/result-status";
import { changeEcho, pressAnnouncement } from "@/components/retirement-granary-echo";
import { readRoutePlan } from "@/components/retirement-plan-read";
import type { RetirementPlanValue } from "@/components/retirement-plan-state";
import { fill } from "@/lib/calc/charts/labels";
import { retirementGranaryModel } from "@/lib/calc/charts/retirement-granary-chart";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

/** Just what `changeEcho` reads: the values, and the model they draw. */
function at(values: Record<string, string>) {
  const read = readRoutePlan(values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  const state = { fields: { values } } as unknown as RetirementPlanValue;
  return { state, model: retirementGranaryModel(plan, C.hero.figure) };
}

describe("changeEcho", () => {
  // This route's own scenario: short from 75 at the defaults (15 triệu/năm).
  const defaults = { ...C.defaults } as Record<string, string>;

  it("says a press that closes the gap closes it, and which bowls moved", () => {
    // One press from 27 triệu/năm funds it; the bowls that move are exactly
    // the ones that were short.
    const near = at({ ...defaults, annualContribution: "27.000.000" });
    const echo = changeEcho(near.state, near.model, "annualContribution", "39.000.000", 1)!;
    expect(echo.text).toBe(fill(C.hero.change.nowMet, { count: 25 }));
    const shortBefore =
      near.model.kind === "unavailable"
        ? []
        : near.model.bowls.filter((b) => b.state !== "full").map((b) => b.age);
    expect(shortBefore.length).toBeGreaterThan(0);
    expect([...echo.ages]).toEqual(shortBefore);
    expect(echo.said).toBe(
      fill(C.hero.pressSaid, {
        label: C.form.statusActions.annualContribution,
        value: "39.000.000 ₫",
        change: echo.text,
      }),
    );
  });

  it("counts the years a press adds or removes", () => {
    const { state, model } = at(defaults);
    const down = changeEcho(state, model, "annualContribution", "3.000.000", 2)!;
    expect(down.text).toMatch(/^Thêm \d+ năm thiếu$/);
    const later = changeEcho(state, model, "retirementAge", "61", 3)!;
    expect(later.text).toBe(fill(C.hero.change.fewerShort, { count: 1 }));
  });

  it("says the monthly pension lever in its own unit", () => {
    const { state, model } = at(defaults);
    const less = changeEcho(state, model, "desiredMonthlySpending", "7.000.000", 6)!;
    expect(less.text).toMatch(/^Bớt \d+ năm thiếu$/);
    expect(less.said).toContain(`${C.form.statusActions.desiredMonthlySpending}: 7.000.000 ₫/tháng.`);
  });

  it("says the plan still holds when it already did", () => {
    const funded = { ...defaults, annualContribution: "39.000.000" };
    const { state, model } = at(funded);
    const echo = changeEcho(state, model, "annualContribution", "51.000.000", 4)!;
    expect(echo.text).toBe(fill(C.hero.change.stillMet, { count: 25 }));
  });

  it("stays silent when either side cannot be drawn", () => {
    const { state, model } = at({ ...defaults, currentAge: "" });
    expect(changeEcho(state, model, "annualContribution", "72.000.000", 5)).toBeNull();
  });
});

describe("pressAnnouncement", () => {
  it("makes two presses that leave the verdict alone two different sentences", () => {
    const funded = { ...C.defaults, annualContribution: "51.000.000" };
    const { state, model } = at(funded);
    const view = { tone: "met" as const, label: "Đủ theo giả định", title: "Kế hoạch đủ" };
    const first = changeEcho(state, model, "annualContribution", "63.000.000", 1);
    const second = changeEcho(state, model, "annualContribution", "39.000.000", 2);
    const a = pressAnnouncement(first, view);
    const b = pressAnnouncement(second, view);
    expect(a).not.toBe(b);
    expect(a.endsWith(announcementOf(view))).toBe(true);
    expect(pressAnnouncement(null, view)).toBe(announcementOf(view));
  });
});
