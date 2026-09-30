/**
 * The A3 learning panel and debt-balance chart on /cong-cu/vay-mua-xe/ — the
 * pure half. Every state is the page's own `autoLoanFormState` on the raw
 * strings a press writes, and every status word is the page's own
 * `autoLoanStatusView(vehicleBudgetStatus(...))`. Nothing checks appearance.
 */
import { describe, expect, it } from "vitest";
import {
  AUTO_TRIAL_KEYS,
  autoAvailability,
  autoBalanceModel,
  autoFlowView,
  autoImpactView,
  autoScene,
  autoTermLabel,
  autoTermStep,
  DOWN_STEP,
  makeAutoTrial,
  nextAutoValue,
  RUNNING_STEP,
  type AutoTrialKey,
} from "@/components/auto-learning";
import {
  autoLoanFormState,
  autoLoanStatusView,
  type AutoLoanFormState,
  type AutoLoanFormValues,
} from "@/components/auto-loan-calculator";
import {
  heldTrials,
  initialTrialState,
  onlyTried,
  trialReducer,
  type TrialState,
} from "@/components/calc/learning-trials";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";
import { AUTO_LEARNING as L } from "@/content/calculators/auto-learning";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { compactMoney } from "@/lib/calc/charts/labels";
import { yearlySummary } from "@/lib/calc/loan";
import { formatMoney } from "@/lib/calc/number";
import { vehicleBudgetStatus } from "@/lib/calc/vehicle-budget-status";

const F = AUTO_LOAN.form;
const rounded = (value: number) => compactMoney(value, CHART_UI.money);

const SHIPPED: AutoLoanFormValues = {
  price: F.defaultPrice,
  down: F.defaultDown,
  tradeIn: F.defaultTradeIn,
  rate: F.defaultRate,
  term: F.defaultTerm,
  termUnit: F.defaultTermUnit,
  netIncome: F.defaultNetIncome,
  essentials: F.defaultEssentials,
  otherDebts: F.defaultOtherDebts,
  reserve: F.defaultReserve,
  running: F.defaultRunning,
};

const stateOf = (values: AutoLoanFormValues) => autoLoanFormState(values);
const labelOf = (state: AutoLoanFormState) =>
  autoLoanStatusView(vehicleBudgetStatus(state.budget), state.budget).label ?? "";

function press(key: AutoTrialKey, values: AutoLoanFormValues, revision = 0) {
  const state = stateOf(values);
  const trial = makeAutoTrial({ key, values, revision, state, label: labelOf(state) });
  if (trial === null) throw new Error(`press ${key} was not available`);
  return trial;
}
const afterOf = (trial: ReturnType<typeof press>) => stateOf(trial.after as AutoLoanFormValues);

describe("what a press writes, in the unit the reader chose", () => {
  it("+50 triệu to the deposit; +2 years or +24 months to the term", () => {
    expect(DOWN_STEP).toBe(50_000_000);
    expect(nextAutoValue("down", SHIPPED)).toBe("350.000.000");
    expect(autoTermStep("years")).toBe(2);
    expect(autoTermStep("months")).toBe(24);
    expect(nextAutoValue("term", SHIPPED)).toBe("7");
    expect(nextAutoValue("term", { ...SHIPPED, termUnit: "months", term: "60" })).toBe("84");
    expect(autoTermLabel("years")).toBe("Kéo dài kỳ hạn thêm 2 năm");
    expect(autoTermLabel("months")).toBe("Kéo dài kỳ hạn thêm 24 tháng");
  });

  it("both units give the same 84-month loan", () => {
    const years = afterOf(press("term", SHIPPED));
    const months = afterOf(press("term", { ...SHIPPED, termUnit: "months", term: "60" }));
    expect(years.result!.loan.months).toBe(84);
    expect(months.result!.loan.months).toBe(84);
    expect(years.result!.loan.monthlyPrincipalInterest).toBeCloseTo(
      months.result!.loan.monthlyPrincipalInterest,
      6,
    );
  });
});

describe("when a press is off, and why", () => {
  it("any invalid vehicle or loan field turns both off — a bad trade-in is never 0", () => {
    // "0,01" năm is 0,12 tháng, which rounds to 0 — the page's own term gate.
    for (const patch of [{ tradeIn: "" }, { tradeIn: "abc" }, { rate: "-1" }, { price: "0" }, { term: "0,01" }]) {
      const values = { ...SHIPPED, ...patch };
      const state = stateOf(values);
      expect(state.vehiclePayment).toBeNull();
      for (const key of ["down", "term"] as const) {
        expect(autoAvailability(key, values, state)).toEqual({ enabled: false, reason: L.blocked.invalid });
      }
    }
  });

  it("the deposit may reach the price EXACTLY — a cash purchase — but never exceed it", () => {
    // 650 + 100 + 50 = 800: allowed.
    const exact = { ...SHIPPED, down: "650.000.000" };
    expect(autoAvailability("down", exact, stateOf(exact))).toEqual({ enabled: true });
    // 660 + 100 + 50 = 810 > 800: off, and the reason names what is left to borrow.
    const over = { ...SHIPPED, down: "660.000.000" };
    expect(autoAvailability("down", over, stateOf(over))).toEqual({
      enabled: false,
      reason: L.blocked.downOverPrice.replace("{left}", "40.000.000 ₫"),
    });
  });

  it("with the price already covered, there is no loan to lengthen or reduce", () => {
    const covered = { ...SHIPPED, down: "700.000.000" };
    const state = stateOf(covered);
    expect(state.nothingToFinance).toBe(true);
    expect(state.vehiclePayment).toBe(0);
    expect(autoAvailability("term", covered, state)).toEqual({ enabled: false, reason: L.blocked.noLoan });
    expect(autoAvailability("down", covered, state).enabled).toBe(false);
    expect(makeAutoTrial({ key: "term", values: covered, revision: 0, state, label: "" })).toBeNull();
  });
});

describe("what a press did, from two real states", () => {
  const before = stateOf(SHIPPED);

  it("+50 triệu deposit: 50 triệu less borrowed, a smaller payment, less interest", () => {
    const trial = press("down", SHIPPED);
    const after = afterOf(trial);
    const view = autoImpactView(trial, after, labelOf(after))!;
    const b = before.result!.loan;
    const a = after.result!.loan;
    expect(after.result!.amountFinanced).toBe(before.result!.amountFinanced - 50_000_000);
    expect(a.monthlyPrincipalInterest).toBeLessThan(b.monthlyPrincipalInterest);
    expect(a.totalInterest).toBeLessThan(b.totalInterest);
    expect(view.fieldLine).toBe("Tiền trả trước: 300.000.000 ₫ → 350.000.000 ₫");
    expect(view.why).toBe(
      L.why.downLess
        .replace("{payment}", rounded(b.monthlyPrincipalInterest - a.monthlyPrincipalInterest))
        .replace("{interest}", rounded(b.totalInterest - a.totalInterest)),
    );
    // Payment, interest and the household month are three separate lines.
    expect(view.paymentLine).toContain("Khoản trả nợ xe mỗi tháng");
    expect(view.interestLine).toContain("Tổng lãi");
    expect(view.budgetLine).toContain("Còn lại mỗi tháng khi có xe");
    // Running costs are 0 in the example, and the panel says the remainder excludes them.
    expect(view.budgetNote).toBe(L.impact.budgetRunningExcluded);
    expect(view.exact.find((r) => r.label === L.impact.exactWithCar)).toEqual({
      label: L.impact.exactWithCar,
      before: `${formatMoney(before.budget!.withCar!)} ₫`,
      after: `${formatMoney(after.budget!.withCar!)} ₫`,
    });
    expect(view.said).toContain("Trả trước thêm 50 triệu: Tiền trả trước từ 300.000.000 ₫ thành 350.000.000 ₫.");
  });

  it("the exact cash boundary: no loan, no invented instalment, no NaN", () => {
    const exact = { ...SHIPPED, down: "650.000.000" };
    const trial = press("down", exact);
    const after = afterOf(trial);
    expect(after.nothingToFinance).toBe(true);
    expect(after.result).toBeNull();
    expect(after.vehiclePayment).toBe(0);
    const view = autoImpactView(trial, after, labelOf(after))!;
    expect(view.why).toBe(L.why.downCovers);
    expect(view.paymentLine).toContain("không còn khoản vay");
    expect(view.monthsLine).toContain("không vay");
    const cells = view.exact.flatMap((r) => [r.before, r.after]).join(" ");
    expect(cells).not.toMatch(/NaN|undefined|null/);
    expect(view.exact.find((r) => r.label === L.impact.exactPayment)!.after).toBe(L.impact.noLoanCell);
    expect(view.bars![1].value).toBe(0);
    expect(view.bars![1].percent).toBe(0);
    expect(view.said).toContain(L.impact.changeNoLoan);
    // The household month without a loan is the month without the car's loan.
    expect(after.budget!.withCar).toBeCloseTo(after.budget!.withoutCar, 6);
  });

  it("+2 years: a smaller payment, 24 more months, more interest", () => {
    const trial = press("term", SHIPPED);
    const after = afterOf(trial);
    const view = autoImpactView(trial, after, labelOf(after))!;
    expect(view.fieldLine).toBe("Kỳ hạn: 5 năm → 7 năm");
    expect(view.monthsLine).toBe("Trả xong sau: 60 tháng → 84 tháng");
    expect(view.why).toContain("lâu hơn 24 tháng");
  });

  it("at 0%, neither press invents interest", () => {
    const zero = { ...SHIPPED, rate: "0" };
    const down = press("down", zero);
    expect(autoImpactView(down, afterOf(down), "")!.why).toBe(
      L.why.downNoInterest.replace(
        "{payment}",
        rounded(
          stateOf(zero).result!.loan.monthlyPrincipalInterest -
            afterOf(down).result!.loan.monthlyPrincipalInterest,
        ),
      ),
    );
    const term = press("term", zero);
    expect(autoImpactView(term, afterOf(term), "")!.why).toBe(L.why.termNoInterest);
  });

  it("with the essentials blank, no remainder is invented", () => {
    const blank = { ...SHIPPED, essentials: "" };
    const trial = press("down", blank);
    const after = afterOf(trial);
    expect(after.budget!.limited).toBe(true);
    const view = autoImpactView(trial, after, labelOf(after))!;
    expect(view.budgetLine).toBe(L.impact.budgetLimited);
    expect(view.budgetNote).toBeNull();
    expect(view.exact.some((r) => r.label === L.impact.exactWithCar)).toBe(false);
    // The loan side is still said, because it does not depend on the household.
    expect(view.paymentLine).toContain("Khoản trả nợ xe mỗi tháng");
  });

  it("names a change of the status word, using vehicleBudgetStatus as it is", () => {
    const short = { ...SHIPPED, running: "5.000.000" };
    expect(vehicleBudgetStatus(stateOf(short).budget).kind).toBe("short");
    const trial = press("term", short);
    const after = afterOf(trial);
    const view = autoImpactView(trial, after, labelOf(after))!;
    expect(labelOf(after)).not.toBe(labelOf(stateOf(short)));
    expect(view.statusLine).toBe(`Kết luận: ${labelOf(stateOf(short))} → ${labelOf(after)}`);
  });

  it("has nothing to say when the state now is unusable", () => {
    const trial = press("down", SHIPPED);
    expect(autoImpactView(trial, stateOf({ ...SHIPPED, rate: "abc" }), "")).toBeNull();
  });
});

describe("the trial stack on the car form", () => {
  type S = TrialState<AutoTrialKey, AutoLoanFormState>;
  const start: S = initialTrialState();

  it("repeats, crosses and undoes one press at a time", () => {
    const one = press("down", SHIPPED);
    const two = press("down", one.after as AutoLoanFormValues);
    const three = press("term", two.after as AutoLoanFormValues);
    let state = [one, two, three].reduce((s, trial) => trialReducer(s, { type: "apply", trial }), start);
    expect(three.after.down).toBe("400.000.000");
    expect(heldTrials(state, three.after).map((t) => t.key)).toEqual(["down", "down", "term"]);
    state = trialReducer(state, { type: "undo" });
    expect(heldTrials(state, two.after)).toHaveLength(2);
  });

  it("a manual edit of the same value retires the stack; recovery shows only the current result", () => {
    const one = press("term", SHIPPED);
    let state = trialReducer(start, { type: "apply", trial: one });
    state = trialReducer(state, { type: "edit" });
    expect(heldTrials(state, one.after)).toEqual([]);
    // Invalid, then fixed: two more edits, and the old press never returns.
    state = trialReducer(state, { type: "edit" });
    state = trialReducer(state, { type: "edit" });
    expect(heldTrials(state, one.after)).toEqual([]);
    expect(trialReducer(state, { type: "undo" })).toBe(state);
  });

  it("keeps the example labelled as one while only presses changed it", () => {
    expect(onlyTried([press("down", SHIPPED)], SHIPPED)).toBe(true);
    expect(onlyTried([press("down", { ...SHIPPED, price: "900.000.000" })], SHIPPED)).toBe(false);
  });
});

describe("the debt-balance chart, from the actual schedule", () => {
  const state = stateOf(SHIPPED);
  const model = autoBalanceModel(state.result);
  const schedule = state.result!.loan.schedule;

  it("starts at the amount financed, ends at 0 on the payoff month, and follows every row", () => {
    expect(model.unavailable).toBeNull();
    expect(model.series).toHaveLength(1);
    const points = model.series[0].points;
    expect(points[0]).toEqual({ period: 0, value: 400_000_000 });
    expect(points.at(-1)).toEqual({ period: 60, value: 0 });
    for (const point of points.slice(1)) {
      expect(point.value).toBe(schedule[point.period - 1].balance);
    }
    expect(model.markers).toEqual([{ period: 60, label: "Hết nợ ở tháng 60" }]);
    expect(model.xMax).toBe(60);
  });

  it("agrees with the year table at every year end", () => {
    const years = yearlySummary(schedule);
    const byMonth = new Map(model.series[0].points.map((p) => [p.period, p.value]));
    for (const year of years) {
      const month = Math.min(year.year * 12, schedule.length);
      if (byMonth.has(month)) expect(byMonth.get(month)).toBeCloseTo(year.balance, 6);
    }
  });

  it("says it is the debt, not the car's value, and draws nothing without a loan", () => {
    expect(model.assumptions.join(" ")).toContain("không phải giá trị chiếc xe");
    expect(model.table.rows.length).toBeGreaterThan(1);
    const none = autoBalanceModel(stateOf({ ...SHIPPED, down: "700.000.000" }).result);
    expect(none.unavailable).toEqual({
      reason: L.balanceChart.unavailableReason,
      recovery: L.balanceChart.unavailableRecovery,
    });
    expect(none.series).toEqual([]);
  });

  it("at 0% the balance falls in equal steps", () => {
    const zero = autoBalanceModel(stateOf({ ...SHIPPED, rate: "0" }).result);
    const [m0, m1] = zero.series[0].points;
    expect(m0.value).toBe(400_000_000);
    expect(m1.period).toBe(1);
    expect(m0.value - m1.value).toBeCloseTo(400_000_000 / 60, 4);
  });
});

it("stays a car tool: no home-purchase framing in the learning copy", () => {
  expect(JSON.stringify(L)).not.toMatch(/nhà|căn hộ|mua nhà/i);
});

describe("the integrated scene, from the page's own state", () => {
  it("draws the price as the 100% axis: deposit + trade-in + financed", () => {
    const scene = autoScene(SHIPPED, stateOf(SHIPPED), null);
    if (scene.kind !== "loan") throw new Error(scene.kind);
    expect(scene.downPercent).toBeCloseTo(37.5, 9);
    expect(scene.tradePercent).toBeCloseTo(12.5, 9);
    expect(scene.financedPercent).toBeCloseTo(50, 9);
    expect(scene.downPercent + scene.tradePercent + scene.financedPercent).toBeCloseTo(100, 9);
    expect(scene.priceText).toBe("800,0 triệu");
    expect(scene.months).toBe(60);
    // Without a press there is no ghost and the receipt fills its own axis.
    expect(scene.ghostUpfrontPercent).toBeNull();
    expect(scene.ghostPaymentPercent).toBeNull();
    expect(scene.paymentOfScale).toBe(100);
  });

  it("a +50 triệu press moves the marks on STABLE axes, with the before as a ghost", () => {
    const trial = press("down", SHIPPED);
    const after = afterOf(trial);
    const scene = autoScene(trial.after, after, { values: trial.before, state: trial.beforeResult });
    if (scene.kind !== "loan") throw new Error(scene.kind);
    expect(scene.downPercent).toBeCloseTo(43.75, 9);
    expect(scene.financedPercent).toBeCloseTo(43.75, 9);
    // Where the financed part began before: (300 + 100) / 800.
    expect(scene.ghostUpfrontPercent).toBeCloseTo(50, 9);
    // The receipt axis is the larger, BEFORE payment — the new one is shorter.
    expect(scene.ghostPaymentPercent).toBe(100);
    expect(scene.paymentOfScale).toBeCloseTo(
      (after.result!.loan.monthlyPrincipalInterest / stateOf(SHIPPED).result!.loan.monthlyPrincipalInterest) * 100,
      9,
    );
  });

  it("the exact cash purchase is a no-loan scene, not an invalid one", () => {
    const exact = { ...SHIPPED, down: "700.000.000" };
    const scene = autoScene(exact, stateOf(exact), null);
    expect(scene.kind).toBe("cash");
    if (scene.kind !== "cash") return;
    expect(scene.financedPercent).toBe(0);
    expect(scene.paymentText).toBeNull();
    expect(scene.months).toBeNull();
    expect(scene.downPercent + scene.tradePercent).toBeCloseTo(100, 9);
  });

  it("an excess deposit or an invalid field is never drawn as a zero balance", () => {
    const excess = { ...SHIPPED, down: "750.000.000" };
    expect(stateOf(excess).nothingToFinance).toBe(true);
    expect(autoScene(excess, stateOf(excess), null)).toEqual({ kind: "excess" });
    for (const patch of [{ tradeIn: "" }, { rate: "abc" }, { term: "0" }]) {
      const values = { ...SHIPPED, ...patch };
      expect(autoScene(values, stateOf(values), null)).toEqual({ kind: "unknown" });
    }
  });

  it("a trade-in of 0 has no trade-in segment or legend", () => {
    const none = { ...SHIPPED, tradeIn: "0" };
    const scene = autoScene(none, stateOf(none), null);
    if (scene.kind !== "loan") throw new Error(scene.kind);
    expect(scene.tradePercent).toBe(0);
    expect(scene.tradeText).toBeNull();
  });
});

describe("the running-cost trial: the month moves, the loan does not", () => {
  it("writes +1 triệu into the page's own running field, grouped", () => {
    expect(RUNNING_STEP).toBe(1_000_000);
    expect(nextAutoValue("running", SHIPPED)).toBe("1.000.000");
    expect(nextAutoValue("running", { ...SHIPPED, running: "2.500.000" })).toBe("3.500.000");
    expect(AUTO_TRIAL_KEYS).toEqual(["down", "term", "running"]);
  });

  it("lowers the remainder by exactly 1 triệu; payment, interest, deposit unchanged", () => {
    const before = stateOf(SHIPPED);
    const trial = press("running", SHIPPED);
    const after = afterOf(trial);
    expect(after.budget!.withCar).toBeCloseTo(before.budget!.withCar! - 1_000_000, 4);
    expect(after.result!.loan.monthlyPrincipalInterest).toBe(before.result!.loan.monthlyPrincipalInterest);
    expect(after.result!.loan.totalInterest).toBe(before.result!.loan.totalInterest);
    const view = autoImpactView(trial, after, labelOf(after))!;
    expect(view.bars).toBeNull();
    expect(view.why).toBe(L.why.runningMore.replace("{amount}", rounded(1_000_000)));
    expect(view.said).toContain(L.impact.changeRemainder.replace("{amount}", rounded(1_000_000)));
    expect(view.fieldLine).toBe("Chi phí vận hành xe: 0 ₫ → 1.000.000 ₫");
  });

  it("with the essentials blank the loan is said unchanged and no remainder is invented", () => {
    const blank = { ...SHIPPED, essentials: "" };
    const trial = press("running", blank);
    const view = autoImpactView(trial, afterOf(trial), "")!;
    expect(view.why).toBe(L.why.runningLimited);
    expect(view.said).toContain(L.impact.changeRemainderUnknown);
    expect(view.budgetLine).toBe(L.impact.budgetLimited);
  });

  it("is off without a computable month, with its own reason; a cash purchase still allows it", () => {
    for (const patch of [{ netIncome: "" }, { rate: "abc" }, { running: "abc" }]) {
      const values = { ...SHIPPED, ...patch };
      expect(autoAvailability("running", values, stateOf(values))).toEqual({
        enabled: false,
        reason: L.blocked.budget,
      });
    }
    const cash = { ...SHIPPED, down: "700.000.000" };
    expect(autoAvailability("running", cash, stateOf(cash))).toEqual({ enabled: true });
    expect(makeAutoTrial({ key: "running", values: cash, revision: 0, state: stateOf(cash), label: "" })).not.toBeNull();
  });

  it("a manual edit retires a running press like any other", () => {
    type S = TrialState<AutoTrialKey, AutoLoanFormState>;
    const one = press("running", SHIPPED);
    let state: S = trialReducer(initialTrialState(), { type: "apply", trial: one });
    expect(heldTrials(state, one.after)).toHaveLength(1);
    state = trialReducer(state, { type: "edit" });
    expect(heldTrials(state, one.after)).toEqual([]);
  });
});

describe("board 04: the household month as a subtraction, from the ledger", () => {
  it("tiles are the ledger's own figures, and they add up", () => {
    const state = stateOf({ ...SHIPPED, running: "2.000.000" });
    const b = state.budget!;
    const flow = autoFlowView(state);
    expect(flow.state).toBe("surplus");
    const byKey = Object.fromEntries(flow.items.map((i) => [i.key, i.value]));
    expect(byKey).toEqual({
      income: rounded(b.netIncome),
      essentials: rounded(b.essentialExpenses!),
      otherDebts: rounded(b.otherDebts),
      reserve: rounded(b.reserveSaving),
      payment: rounded(b.vehiclePayment!),
      running: rounded(2_000_000),
      result: rounded(b.withCar!),
    });
    expect(flow.items.map((i) => i.op)).toEqual(["base", "minus", "minus", "minus", "minus", "minus", "result"]);
    // No deposit tile: purchase money is not a monthly cost.
    expect(flow.items.some((i) => i.key === ("down" as never))).toBe(false);
  });

  it("follows the page's verdict: caution, zero, short, limited, unknown", () => {
    expect(autoFlowView(stateOf(SHIPPED)).state).toBe("caution");
    expect(autoFlowView(stateOf(SHIPPED)).note).toBe(L.flow.runningExcluded);
    const short = autoFlowView(stateOf({ ...SHIPPED, running: "5.000.000" }));
    expect(short.state).toBe("short");
    expect(short.items.at(-1)!.label).toBe(L.flow.resultShort);
    // Exactly zero: 40 − 22 − 3 − 3 − instalment − running = 0.
    const pay = stateOf(SHIPPED).budget!.vehiclePayment!;
    const zeroRunning = formatMoney(40_000_000 - 22_000_000 - 3_000_000 - 3_000_000 - pay, 6);
    const zero = autoFlowView(stateOf({ ...SHIPPED, running: zeroRunning }));
    expect(zero.state).toBe("zero");
    expect(zero.headline).toBe(L.flow.headlineZero);
    const limited = autoFlowView(stateOf({ ...SHIPPED, essentials: "" }));
    expect(limited.state).toBe("limited");
    expect(limited.items.find((i) => i.key === "essentials")!.value).toBeNull();
    expect(limited.items.find((i) => i.key === "result")!.value).toBeNull();
    const unknown = autoFlowView(stateOf({ ...SHIPPED, rate: "abc" }));
    expect(unknown.state).toBe("unknown");
    expect(unknown.items.find((i) => i.key === "payment")!.value).toBeNull();
    expect(autoFlowView(stateOf({ ...SHIPPED, netIncome: "" })).items).toEqual([]);
  });

  it("a cash purchase has a real 0 instalment — not unknown", () => {
    const flow = autoFlowView(stateOf({ ...SHIPPED, down: "700.000.000" }));
    expect(flow.items.find((i) => i.key === "payment")!.value).toBe(rounded(0));
  });
});
