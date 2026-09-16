/**
 * The two ân-hạn-gốc pictures, and the rule the chart layer exists to keep:
 * an adapter resolves a model completely and the components draw it without
 * computing anything, so a chart that disagreed with its own table would be a
 * bug where a test can see it.
 *
 * Every figure asserted here comes from `computeGraceLoan` — the adapters do
 * no amortisation of their own, which is the property several of these tests
 * are really checking.
 */
import { describe, expect, it } from "vitest";
import { computeGraceLoan } from "@/lib/calc/grace-loan";
import {
  GRACE_BALANCE_MAX_POINTS,
  graceBalanceLineModel,
  gracePaymentBarsModel,
} from "@/lib/calc/charts/grace-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { INTEREST_ONLY } from "@/content/calculators/interest-only";

const BAR_LABELS = { ...CHART_UI.money, ...INTEREST_ONLY.paymentChart };
const LINE_LABELS = { ...CHART_UI.money, ...INTEREST_ONLY.balanceChart };

const BASE = {
  amount: 2_000_000_000,
  termMonths: 240,
  promoRatePercent: 7.5,
  postRatePercent: 11,
};

const loanOf = (graceMonths: number, promoMonths: number) => {
  const result = computeGraceLoan({ ...BASE, graceMonths, promoMonths });
  if (result === null) throw new Error("fixture does not compute");
  return result;
};

describe("the payment bars", () => {
  const result = loanOf(24, 12);
  const model = gracePaymentBarsModel(result, BAR_LABELS);

  it("draws one bar per payment level, in month order", () => {
    expect(model.kind).toBe("bars");
    expect(model.bars.map((bar) => bar.key)).toEqual([
      "phase-1",
      "phase-13",
      "phase-25",
    ]);
    expect(model.bars[0].label).toContain("1–12");
    expect(model.bars[0].label).toContain(BAR_LABELS.graceSuffix);
    expect(model.bars[2].label).not.toContain(BAR_LABELS.graceSuffix);
  });

  it("makes a grace bar all interest, by construction", () => {
    // Not by a flag: the segments come from the schedule row, whose principal
    // really is 0 during the grace period.
    for (const index of [0, 1]) {
      expect(
        model.bars[index].segments.map((segment) => segment.key),
        `bar ${index}`,
      ).toEqual(["interest"]);
    }
    expect(model.bars[2].segments.map((segment) => segment.key)).toEqual([
      "interest",
      "principal",
    ]);
  });

  it("uses the monthly instalment as the bar total, not the phase interest", () => {
    // A 216-month phase's whole interest would dwarf a 12-month one and answer
    // a question nobody asked.
    // Absolute bounds, stated: 2e9 × 0,075 ÷ 12 is 12.499.999,999999998 in
    // float64, so an exact equality here would be a test about IEEE 754.
    expect(Math.abs(model.bars[0].total - 12_500_000)).toBeLessThan(1e-6);
    expect(Math.abs(model.bars[1].total - 18_333_333.333333)).toBeLessThan(1e-5);
    expect(Math.abs(model.bars[2].total - 21_300_992.863284)).toBeLessThan(1e-5);
    for (const bar of model.bars) {
      expect(bar.total).toBeLessThanOrEqual(model.max);
    }
  });

  it("emphasises the first bar that repays principal", () => {
    expect(model.bars.map((bar) => bar.emphasis === true)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("agrees with its own table, cell for cell", () => {
    expect(model.table.rows.length).toBe(result.phases.length);
    for (let index = 0; index < result.phases.length; index += 1) {
      const phase = result.phases[index];
      const [range, rate, payment] = model.table.rows[index];
      expect(range).toBe(`${phase.fromMonth}–${phase.toMonth}`);
      // A rate is a percentCell, never divided into a money unit.
      expect(rate).toEqual({
        kind: "percent",
        value: phase.annualRatePercent,
        dp: 2,
      });
      expect(payment).toEqual({ kind: "money", value: phase.payment });
    }
  });

  it("says the jump in its own summary, and calls it a scenario", () => {
    expect(model.summary).toContain(BAR_LABELS.scenarioNote);
    // Compact money, the month the jump happens.
    expect(model.summary).toContain("25");
    expect(model.summary).not.toContain("{");
    expect(model.unavailable).toBeNull();
  });

  it("uses the no-grace sentence when there is no grace period", () => {
    const model = gracePaymentBarsModel(loanOf(0, 12), BAR_LABELS);
    expect(model.summary).toContain(BAR_LABELS.scenarioNote);
    expect(model.summary).not.toContain("{");
    expect(model.bars.every((bar) => bar.emphasis !== true)).toBe(false);
    // Both phases repay principal, so neither is a grace bar.
    expect(
      model.bars.every((bar) => !bar.label.includes(BAR_LABELS.graceSuffix)),
    ).toBe(true);
  });

  it("has nothing to draw, with a reason, for a null result", () => {
    const model = gracePaymentBarsModel(null, BAR_LABELS);
    expect(model.bars).toEqual([]);
    expect(model.max).toBe(0);
    expect(model.unavailable?.reason).toBe(BAR_LABELS.unavailableReason);
    expect(model.unavailable?.recovery).toBe(BAR_LABELS.unavailableRecovery);
  });
});

describe("the balance line", () => {
  const result = loanOf(24, 12);
  const model = graceBalanceLineModel(result, LINE_LABELS);

  it("starts at the original loan, before any payment", () => {
    expect(model.series[0].points[0]).toEqual({
      period: 0,
      value: 2_000_000_000,
    });
  });

  it("is flat for the whole grace period", () => {
    const upToGrace = model.series[0].points.filter(
      (point) => point.period <= 24,
    );
    expect(upToGrace.length).toBeGreaterThan(2);
    for (const point of upToGrace) {
      expect(point.value, `month ${point.period}`).toBe(2_000_000_000);
    }
    // And it really does fall afterwards.
    const after = model.series[0].points.filter((point) => point.period > 24);
    expect(after[0].value).toBeLessThan(2_000_000_000);
    expect(model.series[0].points[model.series[0].points.length - 1]).toEqual({
      period: 240,
      value: 0,
    });
  });

  it("marks the two dates as separate events", () => {
    expect(model.markers.map((marker) => marker.period)).toEqual([24, 12]);
    expect(model.markers[0].label).toContain("24");
    expect(model.markers[1].label).toContain("12");
    expect(model.markers[0].label).not.toBe(model.markers[1].label);
    for (const marker of model.markers) {
      expect(marker.label).not.toContain("{");
    }
  });

  it("marks only the grace date when there is no promotion", () => {
    const model = graceBalanceLineModel(loanOf(24, 0), LINE_LABELS);
    expect(model.markers.map((marker) => marker.period)).toEqual([24]);
  });

  it("marks only the reset when there is no grace period", () => {
    const model = graceBalanceLineModel(loanOf(0, 12), LINE_LABELS);
    expect(model.markers.map((marker) => marker.period)).toEqual([12]);
    expect(model.summary).toContain(LINE_LABELS.scenarioNote);
    expect(model.summary).not.toContain("{");
  });

  it("stays within its sampling bound on the longest supported term", () => {
    const long = computeGraceLoan({
      ...BASE,
      termMonths: 1200,
      graceMonths: 24,
      promoMonths: 12,
    });
    expect(long).not.toBeNull();
    if (long === null) return;
    const model = graceBalanceLineModel(long, LINE_LABELS);
    // A few boundary points may be added on top of the even stride, so the
    // bound is the stride's count plus the boundaries, not an exact equality.
    expect(model.series[0].points.length).toBeLessThanOrEqual(
      GRACE_BALANCE_MAX_POINTS + 6,
    );
    expect(model.xMax).toBe(1200);
    // The grace period is still visibly flat, because the boundaries are
    // always sampled.
    expect(
      model.series[0].points.find((point) => point.period === 24)?.value,
    ).toBe(2_000_000_000);
  });

  it("tabulates the balance at each phase boundary", () => {
    expect(model.table.rows.length).toBe(result.phases.length);
    for (let index = 0; index < result.phases.length; index += 1) {
      const [month, balance] = model.table.rows[index];
      expect(month).toBe(String(result.phases[index].toMonth));
      expect(balance).toEqual({
        kind: "money",
        value: result.phases[index].balance,
      });
    }
  });

  it("draws a falling balance, never a rising one", () => {
    // No interest capitalisation in this model.
    let previous = Number.POSITIVE_INFINITY;
    for (const point of model.series[0].points) {
      expect(point.value, `month ${point.period}`).toBeLessThanOrEqual(previous);
      previous = point.value;
    }
    // A balance is not a step function, unlike a payment level.
    expect(model.step).toBe(false);
  });

  it("has nothing to draw, with a reason, for a null result", () => {
    const model = graceBalanceLineModel(null, LINE_LABELS);
    expect(model.series).toEqual([]);
    expect(model.unavailable?.reason).toBe(LINE_LABELS.unavailableReason);
  });
});
