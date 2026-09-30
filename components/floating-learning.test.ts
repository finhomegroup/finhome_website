/**
 * The F2 view on /cong-cu/lai-suat-tha-noi/, against the engine.
 *
 * Every figure the view carries must be a row or a phase of the comparison
 * `compareRateStress` built — no second payment formula. Fixtures: the
 * shipped loan (2 tỷ, 240 tháng, 12 tháng 7,5% rồi 11%), no promotion, a post
 * rate BELOW the promotion, a capped recurring step, an optional budget and
 * a stress preset chosen more than once.
 */
import { describe, expect, it } from "vitest";
import { debtText, displayedRateFields, floatingDefaultMonth, floatingLesson, floatingMonthView, monthlyText } from "@/components/floating-learning";
import { FLOATING_LEARNING as L } from "@/content/calculators/floating-learning";
import { fill } from "@/lib/calc/charts/labels";
import { compareRateStress } from "@/lib/calc/floating-loan";
import { formatMoney } from "@/lib/calc/number";

const rounded = monthlyText;
const money = (figure: number) => `${formatMoney(figure)} ₫`;

type Input = Parameters<typeof compareRateStress>[0];
const SHIPPED: Input = {
  amount: 2e9,
  termMonths: 240,
  promoMonths: 12,
  promoRatePercent: 7.5,
  postRatePercent: 11,
  adjustEveryMonths: 12,
  adjustStepPoints: 0,
  shiftPoints: 0,
};
const stressOf = (patch: Partial<Input> = {}) => compareRateStress({ ...SHIPPED, ...patch })!;
const viewOf = (patch: Partial<Input> = {}, month: number | null = null, budget: number | null = null) =>
  floatingMonthView(stressOf(patch), month, budget)!;

describe("the shipped loan, at the boundary it opens on", () => {
  const stress = stressOf();
  const view = viewOf();
  const row = stress.selected.loan.schedule[12];

  it("opens on month 13, the first month after the promotion, at 11%", () => {
    expect(view.month).toBe(13);
    expect(view.months).toBe(240);
    expect(view.boundaryMonth).toBe(13);
    expect(view.inPromo).toBe(false);
    expect(view.caption).toBe(`${fill(L.caption, { month: 13, rate: "11,00%/năm" })} (${L.afterPromo})`);
  });

  it("reads that month's row: the payment, its split and the debt after", () => {
    expect(row.payment).toBeCloseTo(20_479_346, 0);
    expect(view.headline).toBe(fill(L.headline, { payment: "20,48 triệu" }));
    expect(view.shares.principal).toBeCloseTo((row.principal / row.payment) * 100, 9);
    expect(view.shares.interest).toBeCloseTo((row.interest / row.payment) * 100, 9);
    expect(view.shares.principal + view.shares.interest).toBeCloseTo(100, 9);
    expect(view.debtLine).toBe(fill(L.debtLine, { month: 13, after: debtText(row.balance) }));
    expect(debtText(row.balance)).toMatch(/^1\.95\d,\d triệu$/);
    // The exact đồng ARE the row's, and the balance before is the one after month 12.
    const exact = Object.fromEntries(view.exact.map((e) => [e.key, e.value]));
    expect(exact.payment).toBe(money(row.payment));
    expect(exact.interest).toBe(money(row.interest));
    expect(exact.principal).toBe(money(row.principal));
    expect(exact.after).toBe(money(row.balance));
    expect(exact.before).toBe(money(stress.selected.loan.schedule[11].balance));
    expect(exact.before).toBe("1.955.136.259 ₫");
  });

  it("draws the term as two phases with the boundary at month 13", () => {
    expect(view.phases.map((p) => [p.promo, p.fromMonth, p.toMonth])).toEqual([
      [true, 1, 12],
      [false, 13, 240],
    ]);
    expect(view.phases[0].percent).toBeCloseTo(5, 9);
    expect(view.phases[1].percent).toBeCloseTo(95, 9);
    expect(view.boundaryPercent).toBeCloseTo(5, 9);
    expect(view.monthPercent).toBeCloseTo((12.5 / 240) * 100, 9);
    expect(view.ratesLine).toBe(
      fill(L.ratesPromo, { last: 12, promoRate: "7,50%/năm", first: 13, postRate: "11,00%/năm" }),
    );
  });

  it("puts the payment on each side of the boundary on one axis, and no separate peak", () => {
    expect(view.levels.map((l) => l.key)).toEqual(["promo", "post"]);
    expect(view.levels[0].value).toBe(stress.selected.loan.phases[0].payment);
    expect(view.levels[1].value).toBe(stress.selected.postPromoPayment);
    expect(view.levels[1].percent).toBe(100);
    expect(view.levels[0].percent).toBeCloseTo((16_111_864.4 / 20_479_346.2) * 100, 3);
    expect(view.changeLine).toBe(
      fill(L.changeUp, { month: 13, amount: rounded(stress.selected.postPromoPayment! - stress.selected.loan.phases[0].payment) }),
    );
  });

  it("says nothing about a budget it was not given, and compares nothing at the baseline", () => {
    expect(view.budget).toEqual({ state: "none", text: L.budgetNone });
    expect(view.budgetPercent).toBeNull();
    expect(view.compare).toBeNull();
    expect(view.scenarioLine).toBe(L.scenarioBaseline);
  });
});

describe("any month can be looked at, before or after the promotion", () => {
  it("month 12 is still the promotion, at 7,5%", () => {
    const view = viewOf({}, 12);
    const row = stressOf().selected.loan.schedule[11];
    expect(view.inPromo).toBe(true);
    expect(view.caption).toContain("7,50%/năm");
    expect(view.caption).toContain(L.inPromo);
    expect(view.exact[0].value).toBe(money(row.payment));
  });

  it("the final month pays the loan off to 0", () => {
    const view = viewOf({}, 240);
    const last = stressOf().selected.loan.schedule[239];
    expect(last.balance).toBe(0);
    expect(view.debtLine).toBe(fill(L.paidOff, { month: 240 }));
    expect(view.exact.find((e) => e.key === "after")!.value).toBe("0 ₫");
  });

  it("clamps a pick to the term the schedule has", () => {
    const stress = stressOf();
    expect(floatingDefaultMonth(stress, 999)).toBe(240);
    expect(floatingDefaultMonth(stress, 0)).toBe(1);
    expect(floatingDefaultMonth(stress, -5)).toBe(1);
    expect(floatingDefaultMonth(stress, 7.4)).toBe(7);
    // A shorter term after an edit keeps the pick inside it.
    expect(viewOf({ termMonths: 60 }, 200).month).toBe(60);
  });
});

describe("the shapes a floating loan can take", () => {
  it("no promotion: no boundary, month 1, one level, no change line", () => {
    const view = viewOf({ promoMonths: 0 });
    expect(view.boundaryMonth).toBeNull();
    expect(view.month).toBe(1);
    expect(view.caption).toContain(L.noPromo);
    expect(view.boundaryPercent).toBeNull();
    expect(view.phases).toHaveLength(1);
    expect(view.phases[0].promo).toBe(false);
    expect(view.levels.map((l) => [l.key, l.label])).toEqual([["post", L.levelOnly]]);
    expect(view.changeLine).toBeNull();
    expect(view.ratesLine).toBe(fill(L.ratesNoPromo, { postRate: "11,00%/năm" }));
  });

  it("a post rate BELOW the promotion says the payment falls, and draws no false peak", () => {
    const stress = stressOf({ promoRatePercent: 9, postRatePercent: 7 });
    const view = floatingMonthView(stress, null, null)!;
    const drop = stress.selected.loan.phases[0].payment - stress.selected.postPromoPayment!;
    expect(drop).toBeGreaterThan(0);
    expect(view.changeLine).toBe(fill(L.changeDown, { month: 13, amount: rounded(drop) }));
    // The highest payment is the promotion itself: already a level, not a "peak".
    expect(view.levels.map((l) => l.key)).toEqual(["promo", "post"]);
    expect(view.levels[0].percent).toBe(100);
  });

  it("a capped recurring step: the peak is a later month, and only real changes are counted", () => {
    // 11 → 11,5 → 12 → 12,5 → 13, then the cap holds 13: four changes after the first.
    const stress = stressOf({ adjustStepPoints: 0.5, rateCapPercent: 13 });
    const view = floatingMonthView(stress, null, null)!;
    expect(stress.selected.peakMonth).toBeGreaterThan(13);
    expect(view.levels.map((l) => l.key)).toEqual(["promo", "post", "peak"]);
    const peak = view.levels[2];
    expect(peak.label).toBe(fill(L.levelPeak, { month: stress.selected.peakMonth }));
    expect(peak.value).toBe(stress.selected.loan.highestPayment);
    expect(peak.percent).toBe(100);
    expect(view.ratesLine).toContain(fill(L.ratesStepped, { count: 4, topRate: "13,00%/năm" }));
    // Never "từ tháng <peak>": the peak is the highest, not the first over anything.
    expect(peak.label).not.toMatch(/từ tháng/);
  });

  it("a cap that absorbs the preset says so, with the rate actually used", () => {
    const view = viewOf({ rateCapPercent: 11.5, shiftPoints: 3 });
    expect(view.scenarioLine).toContain(fill(L.scenarioShift, { points: 3, rate: "14,00%/năm" }));
    expect(view.scenarioLine).toContain(fill(L.scenarioCapped, { rate: "11,50%/năm" }));
    expect(view.caption).toContain("11,50%/năm");
  });
});

describe("the budget comes from the reader or not at all", () => {
  it("rounds like the first pair: two decimals of triệu, đồng below a million", () => {
    expect(monthlyText(1_327_963)).toBe("1,33 triệu");
    expect(monthlyText(520_654)).toBe("520.654 ₫");
    expect(debtText(1_996_810_202)).toBe("1.996,8 triệu");
  });

  it("over at the reset, inside it during the promotion, on the levels' axis", () => {
    const stress = stressOf();
    const at13 = floatingMonthView(stress, 13, 18_000_000)!;
    const row13 = stress.selected.loan.schedule[12];
    expect(at13.budget).toEqual({
      state: "over",
      text: fill(L.budgetOver, { month: 13, amount: rounded(row13.payment - 18_000_000) }),
    });
    const at12 = floatingMonthView(stress, 12, 18_000_000)!;
    const row12 = stress.selected.loan.schedule[11];
    expect(at12.budget).toEqual({
      state: "fits",
      text: fill(L.budgetFits, { month: 12, amount: rounded(18_000_000 - row12.payment) }),
    });
    expect(at13.budgetPercent).toBeCloseTo((18_000_000 / stress.selected.postPromoPayment!) * 100, 9);
    expect(at13.budgetText).toBe(rounded(18_000_000));
  });

  it("a budget above every payment widens the axis instead of overflowing it", () => {
    const view = viewOf({}, 13, 40_000_000);
    expect(view.budgetPercent).toBe(100);
    expect(view.levels.every((l) => l.percent < 100)).toBe(true);
    expect(view.budget.state).toBe("fits");
  });

  it("a budget of exactly 0 is a statement, and every payment is over it", () => {
    expect(viewOf({}, 1, 0).budget.state).toBe("over");
  });
});

describe("a stress preset is a choice, not a running total", () => {
  it("compares the SAME month with the reader's own schedule", () => {
    const stress = stressOf({ shiftPoints: 1 });
    const view = floatingMonthView(stress, 13, null)!;
    const base = stress.baseline.loan.schedule[12].payment;
    const now = stress.selected.loan.schedule[12].payment;
    expect(now - base).toBeCloseTo(1_327_963, 0);
    expect(view.compare).toBe(fill(L.compareHigher, { baseline: rounded(base), amount: rounded(now - base) }));
    // In the promotion the preset changes nothing, and says so.
    expect(floatingMonthView(stress, 12, null)!.compare).toBe(fill(L.compareSamePromo, { baseline: rounded(stress.baseline.loan.schedule[11].payment) }));
  });

  it("an unchanged month AFTER the promotion is explained by the cap, never by the promotion", () => {
    // Post 11%, cap 11%, +1 point: month 13 is past the promotion and the cap
    // holds both schedules at 11%, so the payment is the same.
    const stress = stressOf({ rateCapPercent: 11, shiftPoints: 1 });
    expect(stress.selected.cappedByRateCap).toBe(true);
    const view = floatingMonthView(stress, 13, null)!;
    expect(view.inPromo).toBe(false);
    const base = stress.baseline.loan.schedule[12].payment;
    expect(view.compare).toBe(fill(L.compareSameCapped, { baseline: rounded(base) }));
    expect(view.compare).not.toContain("ưu đãi");
  });
});

describe("independent review repairs", () => {
  it("names the POST-promotional maximum, not a promotion above the later path", () => {
    // 15% promotion, then 5% stepping +1 a year to a 7% cap.
    const view = viewOf({ promoRatePercent: 15, postRatePercent: 5, adjustStepPoints: 1, rateCapPercent: 7 });
    expect(view.ratesLine).toContain(fill(L.ratesStepped, { count: 2, topRate: "7,00%/năm" }));
    const stepped = view.ratesLine.slice(view.ratesLine.indexOf("Sau đó"));
    expect(stepped).not.toContain("15,00%");
    expect(L.ratesStepped).toContain("sau ưu đãi");
  });

  it("scopes every budget sentence to the looked-at month", () => {
    for (const [month, budget] of [
      [13, 18_000_000],
      [12, 18_000_000],
      [13, 40_000_000],
    ] as const) {
      const text = viewOf({}, month, budget).budget.text;
      expect(text).toContain(`Tháng ${month}`);
      expect(text).toContain("tháng khác có thể khác");
    }
    // The reviewer's fixture: 20 triệu at month 13 is over by ~479.346 ₫.
    const over = viewOf({}, 13, 20_000_000).budget;
    expect(over).toEqual({ state: "over", text: fill(L.budgetOver, { month: 13, amount: "479.346 ₫" }) });
  });

  it("choosing +1 twice gives +1, and 0 gives back the reader's figures", () => {
    const once = viewOf({ shiftPoints: 1 }, 13);
    const twice = viewOf({ shiftPoints: 1 }, 13);
    expect(twice).toEqual(once);
    expect(viewOf({ shiftPoints: 0 }, 13)).toEqual(viewOf({}, 13));
    expect(viewOf({ shiftPoints: 2 }, 13).caption).toContain("13,00%/năm");
  });
});

describe("no result, no figure", () => {
  it("is null while the page has no comparison, and recovers with it", () => {
    expect(floatingMonthView(null, 13, 20_000_000)).toBeNull();
    expect(floatingMonthView(stressOf(), 13, null)).not.toBeNull();
  });
});

describe("invalid input, calculation limit and display limit are three states (FL1/FL2)", () => {
  it("the ordinary 2 tỷ loan with a 20 triệu budget is ready: month 12 fits, month 13 is over", () => {
    const at12 = floatingLesson(stressOf(), 12, 20_000_000, true);
    if (at12.kind !== "ready") throw new Error(at12.kind);
    expect(at12.view.budget.state).toBe("fits");
    const at13 = floatingLesson(stressOf(), 13, 20_000_000, true);
    if (at13.kind !== "ready") throw new Error(at13.kind);
    expect(at13.view.budget.state).toBe("over");
  });

  it("a field that fails its check is `invalid`, whatever the engine did", () => {
    expect(floatingLesson(null, null, null, false)).toEqual({ kind: "invalid" });
    expect(floatingLesson(stressOf(), null, null, false)).toEqual({ kind: "invalid" });
  });

  it("FL2: every field accepted but no schedule is a `modelLimit`, not an invalid field", () => {
    const huge = stressOf({ amount: 1e308 });
    expect(floatingLesson(huge, null, null, true).kind).toBe("modelLimit");
    expect(floatingLesson(null, null, null, true)).toEqual({ kind: "modelLimit" });
  });

  it("FL1: a finite schedule whose amounts cannot be printed is a `displayLimit`, with no view", () => {
    const big = stressOf({ amount: 1e24 });
    expect(big).not.toBeNull();
    const row = big.selected.loan.schedule[12];
    expect(Number.isFinite(row.payment)).toBe(true);
    expect(formatMoney(row.payment)).toBe("—");
    expect(floatingLesson(big, null, null, true)).toEqual({ kind: "displayLimit", fields: ["amount"] });
  });

  it("a budget past the print limit alone is a display limit whose recovery is the BUDGET, never the amount", () => {
    expect(floatingLesson(stressOf(), 13, 1e19, true)).toEqual({ kind: "displayLimit", fields: ["budget"] });
  });

  it("loan and budget both past the print limit offer both real fields", () => {
    expect(floatingLesson(stressOf({ amount: 1e24 }), null, 1e19, true)).toEqual({ kind: "displayLimit", fields: ["amount", "budget"] });
  });

  it("an ordinary budget does not trigger the limit", () => {
    expect(floatingLesson(stressOf(), 13, 20_000_000, true).kind).toBe("ready");
  });
});

describe("a displayed RATE past the percent formatter is its own named limit (round 3)", () => {
  // The root's fixture: finite model, printable money, unprintable rate.
  const RATE_FIXTURE: Partial<Input> = { amount: 1, termMonths: 2, promoMonths: 0, promoRatePercent: 0, postRatePercent: 1e19, adjustEveryMonths: 12, adjustStepPoints: 0, shiftPoints: 0 };

  it("1 ₫ at 10^19 %/năm: money printable, yet the lesson refuses and points to the post rate", () => {
    const stress = stressOf(RATE_FIXTURE);
    const row = stress.selected.loan.schedule[0];
    expect(Number.isFinite(row.payment)).toBe(true);
    expect(Math.abs(row.payment)).toBeLessThan(1e18);
    expect(floatingLesson(stress, null, null, true)).toEqual({ kind: "rateLimit", fields: ["postRate"] });
  });

  it("an unprintable PROMOTIONAL rate points to the promotional rate only", () => {
    // Two months, like the root fixture, so the engine's powers stay finite.
    const stress = stressOf({ ...RATE_FIXTURE, termMonths: 2, promoMonths: 1, promoRatePercent: 1e19, postRatePercent: 11 });
    expect(stress).not.toBeNull();
    expect(displayedRateFields(stress)).toEqual(["promoRate"]);
  });

  it("a later phase made unprintable by the step points to the step", () => {
    const stress = stressOf({ ...RATE_FIXTURE, termMonths: 24, postRatePercent: 11, adjustStepPoints: 1e19 });
    expect(displayedRateFields(stress)).toEqual(["adjustStep"]);
  });

  it("a cap that brings every printed rate in range is honoured, not reported", () => {
    const stress = stressOf({ ...RATE_FIXTURE, rateCapPercent: 5 });
    expect(displayedRateFields(stress)).toEqual([]);
    const lesson = floatingLesson(stress, null, null, true);
    if (lesson.kind !== "ready") throw new Error(lesson.kind);
    expect(lesson.view.ratesLine).toContain("5,00%/năm");
    expect(lesson.view.caption).not.toContain("—");
  });

  it("with a preset over a holding cap, the REQUESTED rate is what cannot print: the post rate", () => {
    const stress = stressOf({ ...RATE_FIXTURE, rateCapPercent: 5, shiftPoints: 2 });
    expect(stress.selected.cappedByRateCap).toBe(true);
    expect(displayedRateFields(stress)).toEqual(["postRate"]);
  });

  it("the ordinary 2 tỷ loan prints every rate", () => {
    expect(displayedRateFields(stressOf())).toEqual([]);
    expect(floatingLesson(stressOf(), 13, 20_000_000, true).kind).toBe("ready");
  });
});
