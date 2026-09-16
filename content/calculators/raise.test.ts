// Copy guards for /cong-cu/tang-luong/, all three from an independent review
// of original row 63's live UI.
//
// This file follows the "module at its shipped defaults" pattern docs §6
// recommends: parse the content file's own default strings with the same
// parsers the component uses, run the module, and pin what the page says.
import { describe, expect, it } from "vitest";
import { RAISE as C } from "@/content/calculators/raise";
import { computeRaise } from "@/lib/calc/raise";
import { planRaiseSaving } from "@/lib/calc/raise-savings";
import { parseDecimal, parseMoney } from "@/lib/calc/number";

const F = C.form;

describe("the date fields' help text", () => {
  it("never reuses the error string as ordinary help", () => {
    // At the valid default 15/9/2026 all three fields displayed "Ngày không
    // tồn tại." as their ordinary help, with no aria-invalid anywhere.
    for (const help of [F.startDayHelp, F.startMonthHelp, F.startYearHelp]) {
      expect(help).not.toBe(F.startInvalid);
      expect(help.length).toBeGreaterThan(0);
      expect(help).not.toContain("không tồn tại");
    }
  });

  it("still has a real error for the invalid state", () => {
    expect(F.startInvalid).toContain("không tồn tại");
    // 31 February does not exist, and the model refuses the whole plan.
    expect(
      planRaiseSaving({
        netIncrease: 3_000_000,
        sharePercent: 50,
        baselineContribution: 8_000_000,
        initial: 100_000_000,
        target: 500_000_000,
        annualRatePercent: 6,
        start: { year: 2026, month: 2, day: 31 },
      }).state,
    ).toBe("invalid");
  });
});

describe("the prefilled NET rise cannot look derived from the gross one", () => {
  const current = parseMoney(F.defaultCurrent)!;
  const percent = parseDecimal(F.defaultPercent)!;
  const grossRise = computeRaise({
    mode: "percent",
    current,
    value: percent,
    perYear: parseDecimal(F.defaultPerYear)!,
  })!.increase;
  const netRise = parseMoney(F.defaultNetIncrease)!;

  it("computes a gross rise of 3,6 triệu at the shipped defaults", () => {
    // 20.000.000 × 18% — chosen precisely so it is NOT the NET default.
    expect(current).toBe(20_000_000);
    expect(percent).toBe(18);
    expect(grossRise).toBe(3_600_000);
  });

  it("prefills a DIFFERENT net figure", () => {
    // Both defaults used to be 3.000.000 ₫. A review noted the equality reads
    // as though the net figure were computed from the gross one — which no
    // part of this tool does, because it models no payroll deductions.
    expect(netRise).toBe(3_000_000);
    expect(netRise).not.toBe(grossRise);
  });

  it("asks for the net figure instead of describing deduction rules", () => {
    // The help text used to say "sau thuế và bảo hiểm" and the page notice
    // described progressive brackets and the insurance cap. This tool models
    // neither, and nobody here has verified those rules.
    for (const text of [F.netIncreaseHelp, F.goalIntro, C.grossNotice]) {
      expect(text).not.toContain("lũy tiến");
      expect(text).not.toContain("trần");
    }
    expect(C.grossNotice).toContain("không tính thuế");
    expect(F.netIncreaseHelp).toContain("bảng lương");
    expect(F.netIncreaseHelp).toContain("RIÊNG");
  });

  it("does not claim a net rise is always smaller than a gross one", () => {
    // A categorical guarantee about every reader's payroll is a claim this
    // page cannot support.
    expect(C.grossNotice).not.toContain("ít hơn");
    expect(F.goalIntro).not.toContain("ít hơn");
  });
});

describe("the shipped goal defaults reach the documented fixture", () => {
  it("funds in 43 months on the baseline and 37 with half the rise", () => {
    const plan = planRaiseSaving({
      netIncrease: parseMoney(F.defaultNetIncrease)!,
      sharePercent: parseDecimal(F.defaultShare)!,
      baselineContribution: parseMoney(F.defaultBaseline)!,
      initial: parseMoney(F.defaultInitial)!,
      target: parseMoney(F.defaultGoalTarget)!,
      annualRatePercent: parseDecimal(F.defaultGoalRate)!,
      start: {
        year: Number(F.defaultStartYear),
        month: Number(F.defaultStartMonth),
        day: Number(F.defaultStartDay),
      },
    });
    expect(plan.state).toBe("compared");
    expect(plan.extraContribution).toBe(1_500_000);
    expect(plan.plan!.current.schedule.fundedMonth).toBe(43);
    expect(plan.plan!.higher!.schedule.fundedMonth).toBe(37);
    expect(plan.monthsEarlier).toBe(6);
    expect(plan.plan!.current.fundedDate).toEqual({
      year: 2030,
      month: 4,
      day: 15,
    });
    expect(plan.plan!.higher!.fundedDate).toEqual({
      year: 2029,
      month: 10,
      day: 15,
    });
  });

  it("uses a separate key for the goal target and the desired salary", () => {
    // Two different meanings under one `target` key is how a form shows the
    // wrong label beside the wrong box; they collided in one object literal.
    expect(F.defaultTarget).toBe("23.000.000");
    expect(F.defaultGoalTarget).toBe("500.000.000");
    expect(F.targetLabel).not.toBe(F.goalTargetLabel);
  });
});
