/**
 * The cash-event adapter against the real engines, on the slice's own
 * fixtures: `computeTermDeposit` (months/12) and `planDeposit` (days/365).
 */
import { describe, expect, it } from "vitest";
import {
  dateTarget,
  datesDepositView,
  datesTargetBlocked,
  depositTrialAvailability,
  dong,
  makeDepositTrial,
  planDisplayable,
  termDepositView,
  termDisplayable,
  termTarget,
  trialLabel,
  visibleTrialKeys,
  type TermInputs,
} from "@/components/deposit-learning";
import { heldTrials, trialReducer } from "@/components/calc/learning-trials";
import { DEPOSIT_LEARNING as L } from "@/content/calculators/deposit-learning";
import { fill } from "@/lib/calc/charts/labels";
import { planDeposit, type DepositPlanInput } from "@/lib/calc/deposit-plan";
import { computeTermDeposit, type TermDepositInput } from "@/lib/calc/term-deposit";

const TERM: TermDepositInput = {
  principal: 100_000_000,
  annualRatePercent: 6,
  termMonths: 6,
  cycles: 1,
  payout: "maturity",
  compoundOnRollover: true,
  demandRatePercent: 0.2,
  breakAfterMonths: 3,
};
const termOf = (patch: Partial<TermDepositInput> = {}) => {
  const input = { ...TERM, ...patch };
  const result = computeTermDeposit(input);
  const inputs: TermInputs = {
    principal: input.principal,
    termMonths: input.termMonths,
    cycles: input.cycles ?? 1,
    payout: input.payout ?? "maturity",
    breakAfter: input.breakAfterMonths ?? null,
  };
  return { result, view: termDepositView(result, inputs) };
};

const PLAN: DepositPlanInput = {
  principal: 100_000_000,
  annualRatePercent: 6,
  earlyRatePercent: 0.2,
  start: { year: 2026, month: 1, day: 31 },
  termMonths: 6,
  needDate: { year: 2026, month: 7, day: 30 },
  renew: false,
};
const planOf = (patch: Partial<DepositPlanInput> = {}) => {
  const input = { ...PLAN, ...patch };
  const plan = planDeposit(input);
  return { plan, view: datesDepositView(plan, input.renew) };
};

describe("months view (months/12)", () => {
  it("the shipped fixture: 3M at term; break at 3 earns 50k against 1,5M, a 1,45M gap", () => {
    const { result, view } = termOf();
    expect(result!.totalInterest).toBeCloseTo(3_000_000, 6);
    expect(result!.earlyInterest).toBeCloseTo(50_000, 6);
    expect(result!.earlyForegoneInterest).toBeCloseTo(1_500_000, 6);
    expect(result!.earlyLoss).toBeCloseTo(1_450_000, 6);
    expect(view!.lines).toContain(fill(L.termEarly, { m: "3", early: dong(result!.earlyInterest!) }));
    expect(view!.lines).toContain(fill(L.termSame, { same: dong(result!.earlyForegoneInterest!) }));
    expect(view!.lines).toContain(fill(L.termLossPositive, { amount: dong(1_450_000) }));
    expect(view!.state).toBe(fill(L.termBreakBefore, { m: "3" }));
    expect(view!.tone).toBe("caution");
    // With a break selected the end-of-plan total is named as the ALTERNATIVE.
    expect(view!.whole).toBe(fill(L.wholeTermIfHeld, { m: "6", total: dong(103_000_000) }));
    expect(view!.parts.map((p) => p.text)).toEqual([dong(100_000_000), dong(3_000_000)]);
    // The exit sits halfway along the six months, between start and maturity.
    expect(view!.events.map((e) => e.kind)).toEqual(["start", "exit", "end"]);
    expect(view!.events[1].percent).toBe(50);
  });

  it("a break ON a maturity loses nothing, and says so", () => {
    const { result, view } = termOf({ cycles: 2, breakAfterMonths: 6 });
    expect(result!.earlyLoss).toBe(0);
    expect(view!.state).toBe(fill(L.termBreakAtMaturity, { m: "6" }));
    expect(view!.lines).toContain(L.termLossZero);
    expect(view!.tone).toBe("neutral");
  });

  it("monthly payout: interest received along the way, never rolled; the break is not one payment", () => {
    const { result, view } = termOf({ payout: "monthly" });
    expect(result!.compounded).toBe(false);
    expect(view!.parts[1].label).toBe(fill(L.parts.interestPaidAlong, { n: "6" }));
    expect(view!.lines).toContain(L.termPaidAlong);
  });

  it("compounding over 3 cycles: the final principal is the OPENING of the final term", () => {
    const { result, view } = termOf({ cycles: 3, breakAfterMonths: undefined });
    expect(result!.finalPrincipal).toBeLessThan(result!.totalValue);
    expect(view!.lines).toContain(fill(L.finalPrincipal, { amount: dong(result!.finalPrincipal) }));
    expect(view!.state).toBe(L.termNoBreak);
  });

  it("an early rate above the term rate is a higher interest, not clamped into a loss", () => {
    const { result, view } = termOf({ demandRatePercent: 8 });
    expect(result!.earlyLoss).toBeLessThan(0);
    expect(view!.lines).toContain(fill(L.termLossNegative, { amount: dong(Math.abs(result!.earlyLoss!)) }));
  });

  it("0% is a real zero", () => {
    const { view } = termOf({ annualRatePercent: 0, demandRatePercent: 0 });
    expect(view!.parts[1].text).toBe("0 ₫");
    expect(view!.lines).toContain(L.termLossZero);
  });

  it("many cycles: at most six maturities drawn, the rest counted", () => {
    const { view } = termOf({ cycles: 10, breakAfterMonths: undefined });
    expect(view!.events.filter((e) => e.kind !== "start")).toHaveLength(6);
    expect(view!.moreNote).toBe(fill(L.events.more, { n: "4" }));
  });

  it("1e24 is past the display boundary: no view", () => {
    const { result, view } = termOf({ principal: 1e24 });
    expect(result).not.toBeNull();
    expect(termDisplayable(result, 1e24)).toBe(false);
    expect(view).toBeNull();
  });
});

describe("dates view (actual days / 365)", () => {
  it("30/7: breaks the 181-day term at day 180 — 98.630 ₫, rate gap and future days kept apart", () => {
    const { plan, view } = planOf();
    expect(plan!.firstTermDays).toBe(181);
    expect(plan!.firstTermInterest).toBeCloseTo(2_975_342.47, 2);
    expect(plan!.status).toBe("beforeMaturity");
    expect(plan!.brokenInterest).toBeCloseTo(98_630.14, 2);
    expect(view!.state).toBe(L.statusBefore);
    expect(view!.lines).toContain(fill(L.available, { amount: dong(plan!.availableAtNeedDate!) }));
    expect(view!.lines).toContain(fill(L.newPayment, { amount: dong(plan!.newPaymentAtNeedDate!) }));
    expect(view!.lines).toContain(fill(L.rateDiffPositive, { amount: dong(plan!.rateDifference!) }));
    expect(view!.lines).toContain(
      fill(L.foregone, { days: "1", amount: dong(plan!.foregoneFutureInterest!) }),
    );
    expect(view!.lines).toContain(L.notPenalty);
    expect(view!.events.map((e) => e.kind)).toEqual(["start", "need", "maturity"]);
  });

  it("31/7 on maturity: full term interest, paid that day", () => {
    const { plan, view } = planOf({ needDate: { year: 2026, month: 7, day: 31 } });
    expect(plan!.status).toBe("atMaturity");
    expect(view!.state).toBe(L.statusAt);
    expect(plan!.newPaymentAtNeedDate).toBeCloseTo(102_975_342.47, 2);
  });

  it("1/8 without renewal: 102.975.342 ₫ in hand, NOTHING paid that day, interest inside it", () => {
    const { plan, view } = planOf({ needDate: { year: 2026, month: 8, day: 1 } });
    expect(plan!.status).toBe("afterMaturity");
    expect(plan!.availableAtNeedDate).toBeCloseTo(102_975_342.47, 2);
    expect(plan!.newPaymentAtNeedDate).toBe(0);
    expect(view!.lines).toContain(fill(L.newPayment, { amount: "0 ₫" }));
    // The two parts ARE the available money: the interest is a component, not an addend.
    const [principal, already] = view!.parts;
    expect(already.key).toBe("interestAlready");
    expect(principal.percent + already.percent).toBeCloseTo(100, 9);
    expect(view!.state).toBe(fill(L.statusAfter, { date: "31/7/2026" }));
  });

  it("1/8 with renewal: a new term is broken after one day; prior interest is in the principal once", () => {
    const { plan, view } = planOf({ needDate: { year: 2026, month: 8, day: 1 }, renew: true });
    expect(plan!.status).toBe("beforeMaturity");
    expect(plan!.termsElapsed).toBe(2);
    expect(plan!.principalReturned).toBeCloseTo(102_975_342.47, 2);
    // Available = principal returned + that one day's early interest — not + 2,97M again.
    expect(plan!.availableAtNeedDate! - plan!.principalReturned!).toBeCloseTo(plan!.interestPaidAtNeedDate!, 6);
    expect(plan!.interestPaidAtNeedDate!).toBeLessThan(10_000);
    expect(view!.parts[0].label).toBe(L.parts.principalRenewed);
  });

  it("an early rate above the term rate reads as higher, not as a loss", () => {
    const { plan, view } = planOf({ earlyRatePercent: 8 });
    expect(plan!.rateDifference!).toBeLessThan(0);
    expect(view!.lines).toContain(fill(L.rateDiffNegative, { amount: dong(Math.abs(plan!.rateDifference!)) }));
  });

  it("beyond the supported terms: a state, and no cash split", () => {
    const { plan, view } = planOf({ termMonths: 1, renew: true, needDate: { year: 2140, month: 1, day: 1 } });
    expect(plan!.status).toBe("beyondLimit");
    expect(view!.whole).toBeNull();
    expect(view!.parts).toHaveLength(0);
    expect(view!.tone).toBe("caution");
  });

  it("many renewed terms: six maturities drawn, the rest counted", () => {
    const { view } = planOf({ termMonths: 1, renew: true, needDate: { year: 2027, month: 3, day: 15 } });
    expect(view!.events.filter((e) => e.kind === "maturity")).toHaveLength(6);
    expect(view!.moreNote).not.toBeNull();
  });

  it("1e24 is past the display boundary", () => {
    const { plan, view } = planOf({ principal: 1e24 });
    expect(plan).not.toBeNull();
    expect(planDisplayable(plan)).toBe(false);
    expect(view).toBeNull();
  });
});

describe("trials write fixed landmarks on the page's own fields", () => {
  const start = { year: 2026, month: 1, day: 31 };

  it("months: before / at / end of plan, each only when it exists and differs", () => {
    expect(termTarget("breakBefore", 6, 1)).toBe(5);
    expect(termTarget("breakAt", 6, 1)).toBeNull();
    expect(termTarget("breakEnd", 6, 1)).toBe(6);
    expect(termTarget("breakAt", 6, 3)).toBe(6);
    expect(termTarget("breakEnd", 6, 3)).toBe(18);
    expect(termTarget("breakBefore", 1, 1)).toBeNull();
  });

  it("dates: one day before, on and after the FIRST maturity, by the shared calendar", () => {
    expect(dateTarget("needBefore", start, 6)).toEqual({ year: 2026, month: 7, day: 30 });
    expect(dateTarget("needAt", start, 6)).toEqual({ year: 2026, month: 7, day: 31 });
    expect(dateTarget("needAfter", start, 6)).toEqual({ year: 2026, month: 8, day: 1 });
    // Month-end clamp in a leap year stays the shared helper's.
    expect(dateTarget("needAt", { year: 2027, month: 8, day: 31 }, 6)).toEqual({ year: 2028, month: 2, day: 29 });
  });

  it("a landmark already on screen is off, with its reason; a trial writes only its fields", () => {
    const values = { mode: "dates", needDay: "31", needMonth: "7", needYear: "2026", breakAfter: "9" };
    const ctx = { termMonths: 6, cycles: 1, start, blocked: null };
    expect(depositTrialAvailability("needAt", { ...ctx, values })).toEqual({ enabled: false, reason: L.blocked.here });
    const trial = makeDepositTrial({
      key: "needAfter",
      values,
      revision: 0,
      snapshot: { mode: "dates", whenText: "31/7/2026", available: 102_975_342 },
      ctx,
    })!;
    expect(trial.after).toEqual({ ...values, needDay: "1", needMonth: "8", needYear: "2026" });
    expect(trial.after.breakAfter).toBe("9");
    // A blocked page blocks every trial with the page's own reason.
    expect(depositTrialAvailability("needAfter", { ...ctx, values, blocked: L.blocked.invalid })).toEqual({
      enabled: false,
      reason: L.blocked.invalid,
    });
  });

  it("a manual edit or a mode switch retires the trial and its undo", () => {
    const values = { mode: "term", breakAfter: "9" };
    const trial = makeDepositTrial({
      key: "breakBefore",
      values,
      revision: 0,
      snapshot: { mode: "term", whenText: "tháng 9", available: null },
      ctx: { termMonths: 12, cycles: 1, start: null, blocked: null },
    })!;
    expect(trial.after.breakAfter).toBe("11");
    const state = trialReducer({ revision: 0, trials: [] }, { type: "apply", trial });
    expect(heldTrials(state, trial.after)).toHaveLength(1);
    expect(heldTrials(trialReducer(state, { type: "edit" }), trial.after)).toHaveLength(0);
    expect(heldTrials(state, { ...trial.after, mode: "dates" })).toHaveLength(0);
  });
});

describe("independent review repairs (2026-09-29)", () => {
  const base = {
    principal: 100_000_000,
    annualRatePercent: 6,
    earlyRatePercent: 0.2,
    start: { year: 2026, month: 1, day: 31 },
    termMonths: 6,
    renew: false,
  };

  it("finding 1: a selected exit never shows the end-of-plan total as cash it will pay", () => {
    const broken = termOf();
    expect(broken.view!.whole).toMatch(/^Phương án khác, nếu KHÔNG rút/);
    expect(broken.view!.whole).not.toBe(fill(L.wholeTermEnd, { m: "6", total: dong(103_000_000) }));
    // No break: the total is still conditional on holding the whole plan.
    const held = termOf({ breakAfterMonths: undefined });
    expect(held.view!.whole).toBe(fill(L.wholeTermEnd, { m: "6", total: dong(103_000_000) }));
    expect(held.view!.whole).toMatch(/^Nếu giữ đủ cả kế hoạch/);
    expect(held.view!.wholeNote).toBeNull();
    // Paid-out interest: a total, not cash held unless every payout was kept.
    const monthly = termOf({ payout: "monthly", breakAfterMonths: undefined });
    expect(monthly.view!.wholeNote).toBe(L.wholeNotePaidAlong);
  });

  it("finding 2: only real, distinct landmarks are shown", () => {
    expect(visibleTrialKeys("term", { termMonths: 12, cycles: 1 })).toEqual(["breakBefore", "breakEnd"]);
    expect(visibleTrialKeys("term", { termMonths: 1, cycles: 1 })).toEqual(["breakEnd"]);
    expect(visibleTrialKeys("term", { termMonths: 6, cycles: 3 })).toEqual(["breakBefore", "breakAt", "breakEnd"]);
    // Unreadable term: the generic pair, neutrally named — no "—", not nothing.
    expect(visibleTrialKeys("term", { termMonths: 0, cycles: 1 })).toEqual(["breakBefore", "breakEnd"]);
    const ctx = { termMonths: 0, cycles: 1, start: null };
    expect(trialLabel("breakBefore", ctx)).toBe(L.trialsNeutral.breakBefore);
    expect(trialLabel("needAt", ctx)).toBe(L.trialsNeutral.needAt);
    for (const key of ["breakBefore", "breakEnd", "needAt"] as const) expect(trialLabel(key, ctx)).not.toContain("—");
    expect(visibleTrialKeys("dates", { termMonths: 6, cycles: 1 })).toHaveLength(3);
  });

  it("finding 3: a preset is enabled only where the engine computes its own date", () => {
    expect(datesTargetBlocked("needAt", base)).toBeNull();
    // An overflowing rate or an unsupported term: no need date can repair it.
    const overflow = { ...base, annualRatePercent: 1e306 };
    for (const key of ["needBefore", "needAt", "needAfter"] as const) {
      expect(datesTargetBlocked(key, overflow)).toBe(L.blocked.targetUnusable);
      expect(datesTargetBlocked(key, { ...base, termMonths: 1300 })).toBe(L.blocked.targetUnusable);
    }
    // A need date far past the supported terms IS repairable by an earlier preset.
    const far = planDeposit({ ...base, termMonths: 1, renew: true, needDate: { year: 2140, month: 1, day: 1 } });
    expect(far!.status).toBe("beyondLimit");
    expect(datesTargetBlocked("needAt", { ...base, termMonths: 1, renew: true })).toBeNull();
    // Past the display boundary: off, with that reason.
    expect(datesTargetBlocked("needAt", { ...base, principal: 1e24 })).toBe(L.blocked.tooLarge);
  });
});
