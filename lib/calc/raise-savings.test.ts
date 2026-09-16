// Original row 63: a chosen share of a real take-home rise, through the
// suite's one savings projection.
//
// The fixture is the independent one from the P3 handoff: NET 30 → 33 triệu a
// month, 50% of the 3 triệu rise set aside, so the monthly contribution goes
// 8 → 9,5 triệu. Starting fund 100 triệu, target 500 triệu, 6%/năm nominal
// compounded monthly, end-of-month contributions, starting 15/09/2026.
//
// A NOTE ON THE LAST DIGITS. The handoff quotes 506.636.365,7418972 for the
// baseline's funded balance. `balanceAfter` evaluates the annuity CLOSED FORM
// and returns 506.636.365,7418892 — the handoff's figure comes from iterating
// `balance * (1 + r) + c` 43 times. The gap is 8e-9 ₫, pure float
// associativity, and both round to 506.636.366 ₫. The assertions below use
// the production figure with a tolerance that spans the difference rather
// than pinning either spelling.
import { describe, expect, it } from "vitest";
import { planRaiseSaving, type RaiseSavingInput } from "./raise-savings";

const START = { year: 2026, month: 9, day: 15 };

const BASE: RaiseSavingInput = {
  netIncrease: 3_000_000,
  sharePercent: 50,
  baselineContribution: 8_000_000,
  initial: 100_000_000,
  target: 500_000_000,
  annualRatePercent: 6,
  start: START,
};

describe("planRaiseSaving on the handoff fixture", () => {
  const result = planRaiseSaving(BASE);

  it("frees half the net rise and nothing more", () => {
    expect(result.state).toBe("compared");
    expect(result.extraContribution).toBe(1_500_000);
    expect(result.raisedContribution).toBe(9_500_000);
  });

  it("funds the baseline plan in month 43, on 15/04/2030", () => {
    const current = result.plan!.current;
    expect(current.schedule.fundedMonth).toBe(43);
    expect(current.fundedDate).toEqual({ year: 2030, month: 4, day: 15 });
  });

  it("funds the raised plan in month 37, on 15/10/2029", () => {
    const higher = result.plan!.higher!;
    expect(higher.contribution).toBe(9_500_000);
    expect(higher.schedule.fundedMonth).toBe(37);
    expect(higher.fundedDate).toEqual({ year: 2029, month: 10, day: 15 });
  });

  it("saves six whole months", () => {
    expect(result.monthsEarlier).toBe(6);
  });

  it("reports the ACTUAL closing balance, not the target", () => {
    // 4 dp of tolerance spans the 8e-9 ₫ closed-form/iterative gap and is
    // still far below one đồng.
    expect(result.plan!.current.balance).toBeCloseTo(506_636_365.7418972, 4);
    expect(result.plan!.higher!.balance).toBeCloseTo(505_327_854.8950716, 4);
    // Both overshoot: the money arrives at the END of a whole month or it has
    // not arrived, so neither balance is exactly 500 triệu.
    expect(result.plan!.current.balance).toBeGreaterThan(500_000_000);
    expect(result.plan!.higher!.balance).toBeGreaterThan(500_000_000);
  });

  it("proves each month is the FIRST that funds, not merely one that does", () => {
    // The month before is short of the target on both legs — which is what
    // makes 43 and 37 first attainments rather than arbitrary months.
    const previous = (
      months: number,
      contribution: number,
    ): number => {
      const r = 6 / 100 / 12;
      const growth = (1 + r) ** months;
      return 100_000_000 * growth + contribution * ((growth - 1) / r);
    };
    expect(previous(42, 8_000_000)).toBeCloseTo(496_155_587.80288285, 4);
    expect(previous(36, 9_500_000)).toBeCloseTo(493_361_049.6468375, 4);
    expect(previous(42, 8_000_000)).toBeLessThan(500_000_000);
    expect(previous(36, 9_500_000)).toBeLessThan(500_000_000);
  });
});

describe("planRaiseSaving at a zero assumed return", () => {
  it("takes 50 months on the baseline and 43 with the rise", () => {
    // Hand-checked: 100 + 8 × 50 = 500 exactly, and 100 + 9,5 × 43 = 508,5.
    const result = planRaiseSaving({ ...BASE, annualRatePercent: 0 });
    expect(result.plan!.current.schedule.fundedMonth).toBe(50);
    expect(result.plan!.higher!.schedule.fundedMonth).toBe(43);
    expect(result.monthsEarlier).toBe(7);
  });

  it("lands exactly on the target from the baseline, and over it from the rise", () => {
    const result = planRaiseSaving({ ...BASE, annualRatePercent: 0 });
    expect(result.plan!.current.balance).toBe(500_000_000);
    expect(result.plan!.higher!.balance).toBe(508_500_000);
  });
});

describe("planRaiseSaving — the share is the saver's choice", () => {
  it("preserves the baseline EXACTLY at a 0% share", () => {
    const zero = planRaiseSaving({ ...BASE, sharePercent: 0 });
    expect(zero.state).toBe("baselineOnly");
    expect(zero.extraContribution).toBe(0);
    expect(zero.raisedContribution).toBe(8_000_000);
    // No comparison leg at all: a plan identical to the baseline is not a
    // comparison, and `planHouseFund` refuses to make one.
    expect(zero.plan!.higher).toBeNull();
    expect(zero.monthsEarlier).toBeNull();
    // ...and the baseline is untouched.
    expect(zero.plan!.current.schedule.fundedMonth).toBe(43);
  });

  it("scales with the share, and never assumes 100%", () => {
    for (const [share, extra] of [
      [0, 0],
      [25, 750_000],
      [50, 1_500_000],
      [100, 3_000_000],
    ] as const) {
      expect(planRaiseSaving({ ...BASE, sharePercent: share }).extraContribution)
        .toBe(extra);
    }
  });

  it("funds sooner the larger the share is", () => {
    const months = ([25, 50, 100] as const).map(
      (sharePercent) =>
        planRaiseSaving({ ...BASE, sharePercent }).plan!.higher!.schedule
          .fundedMonth!,
    );
    expect(months[0]).toBeGreaterThan(months[1]);
    expect(months[1]).toBeGreaterThan(months[2]);
  });

  it("rejects a share above 100", () => {
    expect(planRaiseSaving({ ...BASE, sharePercent: 101 }).state).toBe("invalid");
    expect(planRaiseSaving({ ...BASE, sharePercent: -1 }).state).toBe("invalid");
  });
});

describe("planRaiseSaving — an unknown net increase", () => {
  const unknown = planRaiseSaving({ ...BASE, netIncrease: null });

  it("refuses to derive freed money from the gross rise", () => {
    // Deriving it would mean inventing a tax and insurance model.
    expect(unknown.state).toBe("unknownNet");
    expect(unknown.extraContribution).toBeNull();
    expect(unknown.raisedContribution).toBeNull();
  });

  it("still gives the baseline plan, which does not depend on the rise", () => {
    expect(unknown.plan!.current.schedule.fundedMonth).toBe(43);
    expect(unknown.plan!.current.fundedDate).toEqual({
      year: 2030,
      month: 4,
      day: 15,
    });
  });

  it("offers no comparison", () => {
    expect(unknown.plan!.higher).toBeNull();
    expect(unknown.monthsEarlier).toBeNull();
  });
});

describe("planRaiseSaving — a pay cut", () => {
  const cut = planRaiseSaving({ ...BASE, netIncrease: -2_000_000 });

  it("frees nothing, and does not invent a negative contribution", () => {
    expect(cut.state).toBe("payCut");
    expect(cut.extraContribution).toBe(0);
    expect(cut.raisedContribution).toBe(8_000_000);
  });

  it("leaves the baseline plan standing rather than worsening it", () => {
    // Modelling a reduced contribution would require knowing what the saver
    // would cut, and only they know that.
    expect(cut.plan!.current.schedule.fundedMonth).toBe(43);
    expect(cut.plan!.higher).toBeNull();
    expect(cut.monthsEarlier).toBeNull();
  });

  it("is a different state from a zero share, even though both free nothing", () => {
    const zero = planRaiseSaving({ ...BASE, sharePercent: 0 });
    expect(cut.state).not.toBe(zero.state);
    // Same arithmetic, different cause — and a page must say which.
    expect(cut.extraContribution).toBe(zero.extraContribution);
  });
});

describe("planRaiseSaving — a rise of exactly zero", () => {
  it("is baselineOnly, not a pay cut", () => {
    const flat = planRaiseSaving({ ...BASE, netIncrease: 0 });
    expect(flat.state).toBe("baselineOnly");
    expect(flat.extraContribution).toBe(0);
  });
});

describe("planRaiseSaving — refusals and real non-answers", () => {
  it("refuses figures that cannot describe a plan", () => {
    for (const over of [
      { baselineContribution: -1 },
      { initial: -1 },
      { target: -1 },
      { annualRatePercent: -1 },
      { target: Number.NaN },
      { netIncrease: Number.POSITIVE_INFINITY },
    ]) {
      const result = planRaiseSaving({ ...BASE, ...over });
      expect(result.state, JSON.stringify(over)).toBe("invalid");
      expect(result.plan, JSON.stringify(over)).toBeNull();
    }
  });

  it("refuses a start date that does not exist", () => {
    expect(
      planRaiseSaving({ ...BASE, start: { year: 2026, month: 2, day: 30 } })
        .state,
    ).toBe("invalid");
  });

  it("reports an unreachable plan as a STATUS, not as invalid", () => {
    // Nothing coming in and nothing accruing: a real answer the page states.
    const stuck = planRaiseSaving({
      ...BASE,
      baselineContribution: 0,
      annualRatePercent: 0,
      netIncrease: 0,
    });
    expect(stuck.state).toBe("baselineOnly");
    expect(stuck.plan!.current.schedule.status).toBe("unattainable");
    expect(stuck.plan!.current.schedule.fundedMonth).toBeNull();
  });

  it("gives no monthsEarlier when only one leg funds", () => {
    // The raised leg funds inside the horizon and the baseline does not, so
    // there is no whole-month difference to state.
    const partial = planRaiseSaving({
      ...BASE,
      baselineContribution: 0,
      annualRatePercent: 0,
      netIncrease: 10_000_000,
      sharePercent: 100,
      limitMonths: 60,
    });
    expect(partial.plan!.current.schedule.fundedMonth).toBeNull();
    expect(partial.plan!.higher!.schedule.fundedMonth).toBe(40);
    expect(partial.monthsEarlier).toBeNull();
  });

  it("already funded needs no contribution at all", () => {
    const done = planRaiseSaving({ ...BASE, initial: 600_000_000 });
    expect(done.plan!.current.schedule.status).toBe("alreadyFunded");
    expect(done.plan!.current.schedule.fundedMonth).toBe(0);
    // Month 0 maps to the START date, not a month later.
    expect(done.plan!.current.fundedDate).toEqual(START);
  });
});
