/**
 * The "Thử một thay đổi" pilot on /cong-cu/kha-nang-mua-nha/ — the pure half:
 * what a press writes, when it may, how a try is held and retired, and what
 * the panel says it did.
 *
 * Every impact asserted here is the PRODUCTION engine's: both sides are
 * `computeAffordability` on inputs read back from the raw strings a press
 * writes, through the page's own parsers. Appearance is not checked.
 */
import { describe, expect, it } from "vitest";
import {
  heldTrials,
  affordabilityLimit,
  affordabilityScene,
  INITIAL_LEARNING,
  learningReducer,
  makeTrial,
  MAX_TRIAL_DECIMALS,
  nextTrialValue,
  trialBars,
  onlyTried,
  RESERVE_STEP,
  sharedBlock,
  trialAvailability,
  trialImpactView,
  trialWhy,
  valuesKey,
  type AffordabilityTrial,
  type FormValues,
  type LearningState,
  type TrialFacts,
  type TrialKey,
} from "@/components/affordability-learning";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import { AFFORDABILITY_LEARNING as L } from "@/content/calculators/affordability-learning";
import {
  computeAffordability,
  type AffordabilityInput,
  type AffordabilityResult,
} from "@/lib/calc/affordability";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";

const F = C.form;
const money = (value: number) => `${formatMoney(value)} ₫`;
const rounded = (value: number) => compactMoney(value, CHART_UI.money);

/** The shipped example, as raw strings — what `useCalcFields` holds. */
const SHIPPED_VALUES: FormValues = {
  mode: F.defaultMode,
  netIncome: F.defaultNetIncome,
  essentials: F.defaultEssentials,
  buffer: F.defaultBuffer,
  income: F.defaultIncome,
  debts: F.defaultDebts,
  down: F.defaultDown,
  reserve: F.defaultReserve,
  purchaseCost: F.defaultPurchaseCost,
  ltv: F.defaultLtv,
  rate: F.defaultRate,
  term: F.defaultTerm,
  housingCosts: F.defaultHousingCosts,
  housingRatio: F.defaultHousingRatio,
  totalRatio: F.defaultTotalRatio,
  targetPrice: F.defaultTargetPrice,
};

/**
 * The form read the way the page reads it, for the fields these fixtures
 * use. A test helper, not a second page: every value goes through the same
 * `parseMoney` / `parseDecimal` the calculator calls.
 */
function read(values: FormValues): AffordabilityInput {
  const m = (key: string) => {
    const value = parseMoney(values[key]);
    if (value === null) throw new Error(`fixture: ${key} does not parse`);
    return value;
  };
  const d = (key: string) => {
    const value = parseDecimal(values[key]);
    if (value === null) throw new Error(`fixture: ${key} does not parse`);
    return value;
  };
  const household = values.mode === "household";
  return {
    mode: household ? "household" : "ceiling",
    monthlyIncome: m("income"),
    monthlyNetIncome: household ? m("netIncome") : undefined,
    essentialExpenses: values.essentials.trim() === "" ? undefined : m("essentials"),
    monthlyBuffer: m("buffer"),
    monthlyDebts: m("debts"),
    downPayment: m("down"),
    cashReserve: m("reserve"),
    purchaseCostPercent: d("purchaseCost"),
    assumedMaxLtvPercent: d("ltv"),
    annualRatePercent: d("rate"),
    termMonths: d("term"),
    monthlyHousingCosts: m("housingCosts"),
    housingRatioPercent: d("housingRatio"),
    totalDebtRatioPercent: d("totalRatio"),
  };
}

function engine(values: FormValues): AffordabilityResult {
  const result = computeAffordability(read(values));
  if (result === null) throw new Error("fixture does not compute");
  return result;
}

function factsOf(values: FormValues, patch: Partial<TrialFacts> = {}): TrialFacts {
  return {
    usable: true,
    targetInvalid: false,
    limited: false,
    down: parseMoney(values.down),
    reserve: parseMoney(values.reserve),
    ...patch,
  };
}

/** One press on `values`, at `state`'s revision, through the real engine. */
function press(
  key: TrialKey,
  values: FormValues,
  state: LearningState = INITIAL_LEARNING,
  label = "Cần lưu ý",
): AffordabilityTrial {
  const trial = makeTrial({
    key,
    values,
    facts: factsOf(values),
    revision: state.revision,
    result: engine(values),
    label,
  });
  if (trial === null) throw new Error(`press ${key} unavailable`);
  return trial;
}

describe("what a press writes", () => {
  it("adds 50 triệu to the reserve, grouped the way the money control shows it", () => {
    expect(nextTrialValue("reserve", "0")).toBe("50.000.000");
    expect(nextTrialValue("reserve", "150.000.000")).toBe("200.000.000");
    // A fraction the reader typed keeps its precision.
    expect(nextTrialValue("reserve", "1.000,5")).toBe("50.001.000,5");
  });

  it("adds one percentage point to the rate, with a comma, at the typed precision", () => {
    expect(nextTrialValue("rate", "8,5")).toBe("9,5");
    expect(nextTrialValue("rate", "8")).toBe("9");
    expect(nextTrialValue("rate", "7.25")).toBe("8,25");
    expect(nextTrialValue("rate", "0")).toBe("1");
  });

  it("parses back to exactly the step through the page's own parsers", () => {
    for (const raw of ["0", "600.000.000", "123.456.789"]) {
      expect(parseMoney(nextTrialValue("reserve", raw)!)! - parseMoney(raw)!).toBe(RESERVE_STEP);
    }
    for (const raw of ["8,5", "10,35", "0", "12"]) {
      expect(parseDecimal(nextTrialValue("rate", raw)!)! - parseDecimal(raw)!).toBeCloseTo(1, 9);
    }
  });

  it("writes nothing for a value that does not parse", () => {
    expect(nextTrialValue("reserve", "abc")).toBeNull();
    expect(nextTrialValue("reserve", "")).toBeNull();
    expect(nextTrialValue("rate", "8,5,1")).toBeNull();
  });
});

describe("when a press may run", () => {
  it("is open on the shipped example", () => {
    const facts = factsOf(SHIPPED_VALUES);
    expect(sharedBlock(facts)).toBeNull();
    expect(trialAvailability("reserve", facts)).toEqual({ enabled: true });
    expect(trialAvailability("rate", facts)).toEqual({ enabled: true });
  });

  it("is off for both, with one reason, while the form is invalid, the target malformed or essentials blank", () => {
    const base = factsOf(SHIPPED_VALUES);
    const cases: [Partial<TrialFacts>, string][] = [
      [{ usable: false }, L.blocked.invalid],
      [{ usable: false, targetInvalid: true, limited: true }, L.blocked.invalid],
      [{ targetInvalid: true, limited: true }, L.blocked.targetInvalid],
      [{ limited: true }, L.blocked.limited],
    ];
    for (const [patch, reason] of cases) {
      const facts = { ...base, ...patch };
      expect(sharedBlock(facts)).toBe(reason);
      for (const key of ["reserve", "rate"] as const) {
        expect(trialAvailability(key, facts)).toEqual({ enabled: false, reason });
      }
    }
  });

  it("never lets the reserve silently exceed the cash", () => {
    const short = factsOf({ ...SHIPPED_VALUES, down: "30.000.000" });
    expect(trialAvailability("reserve", short)).toEqual({
      enabled: false,
      reason: fill(L.blocked.reserveOverCash, { left: "30.000.000 ₫" }),
    });
    const allKept = factsOf({ ...SHIPPED_VALUES, down: "80.000.000", reserve: "80.000.000" });
    expect(trialAvailability("reserve", allKept)).toEqual({
      enabled: false,
      reason: L.blocked.reserveAllKept,
    });
    // Exactly 50 triệu left is allowed: the reserve then equals the cash.
    const exact = factsOf({ ...SHIPPED_VALUES, down: "100.000.000", reserve: "50.000.000" });
    expect(trialAvailability("reserve", exact)).toEqual({ enabled: true });
    // The rate try does not depend on the cash.
    expect(trialAvailability("rate", short)).toEqual({ enabled: true });
  });

  it("makes no try when blocked, without a result, or on a malformed field", () => {
    const common = { revision: 0, label: "x" };
    expect(
      makeTrial({ ...common, key: "rate", values: SHIPPED_VALUES, facts: factsOf(SHIPPED_VALUES, { limited: true }), result: engine(SHIPPED_VALUES) }),
    ).toBeNull();
    expect(
      makeTrial({ ...common, key: "rate", values: SHIPPED_VALUES, facts: factsOf(SHIPPED_VALUES), result: null }),
    ).toBeNull();
    const broken = { ...SHIPPED_VALUES, rate: "tám" };
    expect(
      makeTrial({ ...common, key: "rate", values: broken, facts: factsOf(broken), result: engine(SHIPPED_VALUES) }),
    ).toBeNull();
  });
});

describe("holding, retiring and taking back a try", () => {
  const apply = (state: LearningState, trial: AffordabilityTrial) =>
    learningReducer(state, { type: "apply", trial });

  it("holds while the form reads exactly its after-values at the same revision", () => {
    const trial = press("reserve", SHIPPED_VALUES);
    const state = apply(INITIAL_LEARNING, trial);
    expect(trial.after.reserve).toBe("50.000.000");
    expect(heldTrials(state, trial.after)).toEqual([trial]);
    // The form as it was before the press is not the tried form.
    expect(heldTrials(state, SHIPPED_VALUES)).toEqual([]);
  });

  it("is retired by EVERY manual edit — even one that types the tried figure back", () => {
    const trial = press("reserve", SHIPPED_VALUES);
    let state = apply(INITIAL_LEARNING, trial);
    state = learningReducer(state, { type: "edit" });
    expect(state.trials).toEqual([]);
    // The reader types the same value back: nothing resurrects.
    expect(heldTrials(state, trial.after)).toEqual([]);
    expect(heldTrials({ ...state, trials: [trial] }, trial.after)).toEqual([]);
  });

  it("is retired by a mode switch and by reset, which are edits of the form", () => {
    const trial = press("rate", SHIPPED_VALUES);
    const held = apply(INITIAL_LEARNING, trial);
    const switched = learningReducer(held, { type: "edit" });
    expect(heldTrials(switched, { ...trial.after, mode: "ceiling" })).toEqual([]);
    const reset = learningReducer(held, { type: "reset" });
    expect(reset.trials).toEqual([]);
    expect(reset.revision).toBe(held.revision + 1);
  });

  it("ignores a press recorded at an older revision", () => {
    const stale = press("rate", SHIPPED_VALUES);
    const edited = learningReducer(INITIAL_LEARNING, { type: "edit" });
    expect(apply(edited, stale)).toBe(edited);
  });

  it("stacks repeated and crossed presses, and undo walks back one at a time", () => {
    const first = press("reserve", SHIPPED_VALUES);
    let state = apply(INITIAL_LEARNING, first);
    const second = press("reserve", first.after, state);
    state = apply(state, second);
    const third = press("rate", second.after, state);
    state = apply(state, third);
    expect(second.after.reserve).toBe("100.000.000");
    expect(third.after).toEqual({ ...SHIPPED_VALUES, reserve: "100.000.000", rate: "9,5" });
    expect(heldTrials(state, third.after)).toHaveLength(3);

    state = learningReducer(state, { type: "undo" });
    // The page writes `third.before[rate]` back, which is `second.after`.
    expect(heldTrials(state, third.before)).toEqual([first, second]);
    state = learningReducer(state, { type: "undo" });
    state = learningReducer(state, { type: "undo" });
    expect(heldTrials(state, SHIPPED_VALUES)).toEqual([]);
    // Undo with nothing left changes nothing.
    expect(learningReducer(state, { type: "undo" })).toBe(state);
  });

  it("starts a fresh chain rather than stacking onto a record the form has left", () => {
    const first = press("reserve", SHIPPED_VALUES);
    const state = apply(INITIAL_LEARNING, first);
    // A press made from some other form at the same revision.
    const elsewhere = press("rate", { ...SHIPPED_VALUES, down: "700.000.000" }, state);
    expect(apply(state, elsewhere).trials).toEqual([elsewhere]);
  });

  it("keeps the example labelled as one while only presses have changed it", () => {
    const first = press("reserve", SHIPPED_VALUES);
    expect(onlyTried([first], SHIPPED_VALUES)).toBe(true);
    expect(onlyTried([], SHIPPED_VALUES)).toBe(false);
    const own = press("reserve", { ...SHIPPED_VALUES, income: "60.000.000" });
    expect(onlyTried([own], SHIPPED_VALUES)).toBe(false);
  });

  it("keys values independently of key order", () => {
    expect(valuesKey({ a: "1", b: "2" })).toBe(valuesKey({ b: "2", a: "1" }));
    expect(valuesKey({ a: "1" })).not.toBe(valuesKey({ a: "2" }));
  });
});

describe("what the panel says a press did, against the engine", () => {
  it("reserve on the shipped example: the exact price change, payment-bound cause", () => {
    const trial = press("reserve", SHIPPED_VALUES);
    const before = engine(SHIPPED_VALUES);
    const after = engine(trial.after);
    const view = trialImpactView(trial, after, "Cần lưu ý");
    expect(before.priceBinding).toBe("payment");
    expect(view.fieldLine).toBe(`${L.trials.reserve.field}: 0 ₫ → 50.000.000 ₫`);
    // Rounded headline; the exact đồng only in the disclosure's rows.
    expect(view.change).toBe(fill(L.impact.changeDown, { amount: rounded(before.maxPrice - after.maxPrice) }));
    expect(view.exact.rows[1]).toEqual({
      label: L.impact.exactPrice,
      before: money(before.maxPrice),
      after: money(after.maxPrice),
    });
    expect(view.exact.change).toBe(money(after.maxPrice - before.maxPrice));
    expect(view.change).not.toContain(money(before.maxPrice));
    expect(view.bars.map((bar) => bar.value)).toEqual([before.maxPrice, after.maxPrice]);
    // No purchase cost: the price falls by exactly the cash kept back.
    expect(before.maxPrice - after.maxPrice).toBeCloseTo(RESERVE_STEP, 3);
    // Within the suite's half-đồng ledger tolerance: float residue only.
    expect(Math.abs(after.maxLoan - before.maxLoan)).toBeLessThan(0.5);
    expect(view.why).toBe(L.why.reservePayment);
    expect(view.statusLine).toBeNull();
    expect(view.bindingLine).toBeNull();
    expect(view.said).toContain("0 ₫");
    expect(view.said).toContain("50.000.000 ₫");
    expect(view.said).toContain(view.change);
  });

  it("rate on the shipped example: a smaller loan from the same budget", () => {
    const trial = press("rate", SHIPPED_VALUES);
    const before = engine(SHIPPED_VALUES);
    const after = engine(trial.after);
    const view = trialImpactView(trial, after, "Cần lưu ý");
    expect(view.fieldLine).toBe(`${L.trials.rate.field}: 8,5${F.rateUnit} → 9,5${F.rateUnit}`);
    expect(view.change).toBe(fill(L.impact.changeDown, { amount: rounded(before.maxPrice - after.maxPrice) }));
    const [capacityBefore, capacityAfter] = compactMoneyPair(before.paymentSupportedLoan, after.paymentSupportedLoan, CHART_UI.money);
    const [loanBefore, loanAfter] = compactMoneyPair(before.maxLoan, after.maxLoan, CHART_UI.money);
    expect(view.why).toBe(
      fill(L.why.ratePayment, {
        budget: rounded(after.affordablePrincipalInterest),
        capacityBefore,
        capacityAfter,
        loanBefore,
        loanAfter,
      }),
    );
  });

  it("rate that moves the limit from cash to payment: same BUDGET, smaller capacity, loan named apart", () => {
    // Budget 18 − 11,8 = 6,2 triệu: at 8,5% it carries ~714 triệu, more than
    // the 700 triệu the 70% assumption lets 300 triệu of cash reach — so cash
    // binds and the actual payment is BELOW the budget. At 9,5% it carries
    // ~665 triệu and the payment binds.
    const values = { ...SHIPPED_VALUES, down: "300.000.000", ltv: "70", housingCosts: "11.800.000" };
    const trial = press("rate", values);
    const before = engine(values);
    const after = engine(trial.after);
    expect(before.priceBinding).toBe("financing");
    expect(after.priceBinding).toBe("payment");
    expect(before.expectedPrincipalInterest).toBeLessThan(before.affordablePrincipalInterest);
    const view = trialImpactView(trial, after, "x");
    const [capacityBefore, capacityAfter] = compactMoneyPair(before.paymentSupportedLoan, after.paymentSupportedLoan, CHART_UI.money);
    const [loanBefore, loanAfter] = compactMoneyPair(before.maxLoan, after.maxLoan, CHART_UI.money);
    expect(view.why).toBe(
      fill(L.why.ratePayment, {
        budget: rounded(before.affordablePrincipalInterest),
        capacityBefore,
        capacityAfter,
        loanBefore,
        loanAfter,
      }),
    );
    expect(view.why).not.toMatch(/khoản trả (mỗi tháng )?không đổi/);
    expect(view.bindingLine).toBe(
      fill(L.impact.bindingLine, { before: F.priceBindingFinancing, after: F.priceBindingPayment }),
    );
  });

  it("rate while cash binds: the price is UNCHANGED, and the higher payment is named", () => {
    const values = { ...SHIPPED_VALUES, down: "300.000.000", ltv: "70", income: "200.000.000", netIncome: "180.000.000" };
    const trial = press("rate", values);
    const before = engine(values);
    const after = engine(trial.after);
    expect(before.priceBinding).toBe("financing");
    expect(after.priceBinding).toBe("financing");
    expect(after.maxPrice).toBe(before.maxPrice);
    const view = trialImpactView(trial, after, "x");
    expect(view.change).toBe(L.impact.changeNone);
    expect(view.why).toBe(
      fill(L.why.rateFinancing, {
        before: rounded(before.expectedPrincipalInterest),
        after: rounded(after.expectedPrincipalInterest),
      }),
    );
    expect(after.expectedPrincipalInterest).toBeGreaterThan(before.expectedPrincipalInterest);
  });

  it("reserve while cash binds: the loan falls with the cash, by the engine's amount", () => {
    const values = { ...SHIPPED_VALUES, down: "300.000.000", ltv: "70", income: "200.000.000", netIncome: "180.000.000" };
    const trial = press("reserve", values);
    const before = engine(values);
    const after = engine(trial.after);
    const view = trialImpactView(trial, after, "x");
    expect(view.why).toBe(fill(L.why.reserveFinancing, { loan: rounded(before.maxLoan - after.maxLoan) }));
    expect(before.maxPrice - after.maxPrice).toBeGreaterThan(RESERVE_STEP);
  });

  it("rate with no room for a loan: unchanged, and says the price is cash only", () => {
    // 44 − 36 − 5 − 3 = 0: no monthly headroom, so no loan at any rate.
    const values = { ...SHIPPED_VALUES, essentials: "36.000.000" };
    const trial = press("rate", values);
    const after = engine(trial.after);
    const view = trialImpactView(trial, after, "x");
    expect(after.paymentSupportedLoan).toBe(0);
    expect(view.change).toBe(L.impact.changeNone);
    expect(view.why).toBe(L.why.rateNoLoan);
  });

  it("reserve that leaves too little cash for the fees: no feasible price, said truthfully", () => {
    const values = { ...SHIPPED_VALUES, down: "50.000.000", purchaseCost: "5" };
    const trial = press("reserve", values);
    const after = engine(trial.after);
    expect(after.financingBlocked).toBe(true);
    const view = trialImpactView(trial, after, "Chưa đủ");
    expect(view.why).toBe(fill(L.why.reserveCashShort, { usable: rounded(0) }));
    expect(view.statusLine).toBe(fill(L.impact.statusLine, { before: "Cần lưu ý", after: "Chưa đủ" }));
  });

  it("names a change of the binding ceiling only when both sides have a price", () => {
    const before = engine(SHIPPED_VALUES);
    const after = { ...before, priceBinding: "financing" as const };
    const trial = press("reserve", SHIPPED_VALUES);
    expect(trialImpactView(trial, after, "Cần lưu ý").bindingLine).toBe(
      fill(L.impact.bindingLine, { before: F.priceBindingPayment, after: F.priceBindingFinancing }),
    );
    expect(trialImpactView(trial, { ...after, maxPrice: 0 }, "Cần lưu ý").bindingLine).toBeNull();
  });

  it("falls back without inventing a cause — and never claims 'unchanged' for a real move", () => {
    const before = engine(SHIPPED_VALUES);
    expect(trialWhy("reserve", before, before)).toBe(L.why.unchanged);
    // A price that ROSE after a reserve press fits no named cause.
    const up = { ...before, maxPrice: before.maxPrice + 1_000_000 };
    expect(trialWhy("reserve", before, up)).toBe(L.why.changedOther);
    // A rate press whose price moved while no loan exists on either side.
    const cashOnly = { ...before, paymentSupportedLoan: 0 };
    expect(trialWhy("rate", cashOnly, { ...cashOnly, maxPrice: before.maxPrice - 5 })).toBe(
      L.why.changedOther,
    );
    expect(trialWhy("rate", cashOnly, cashOnly)).toBe(L.why.rateNoLoan);
  });

  it("does not promise a lower price in the reserve lesson", () => {
    expect(L.trials.reserve.lesson).toContain("có thể");
  });
});

describe("the before/after bars", () => {
  it("share one axis from 0 to the larger price, carrying the engine's figures", () => {
    const [before, after] = trialBars(2_000_000_000, 1_500_000_000);
    expect(before).toMatchObject({ side: "before", value: 2_000_000_000, percent: 100, label: L.impact.barBefore });
    expect(after).toMatchObject({ side: "after", value: 1_500_000_000, percent: 75, label: L.impact.barAfter });
    expect(before.text).toBe(compactMoney(2_000_000_000, CHART_UI.money));
    expect(after.text).toBe(compactMoney(1_500_000_000, CHART_UI.money));
    // A rise scales the other way: the after bar is the full width.
    expect(trialBars(1, 4).map((bar) => bar.percent)).toEqual([25, 100]);
  });

  it("draws nothing at zero and never a negative width", () => {
    expect(trialBars(0, 0).map((bar) => bar.percent)).toEqual([0, 0]);
    expect(trialBars(-5, 10).map((bar) => bar.percent)).toEqual([0, 100]);
  });

  it("shows exact đồng when rounding would make two different prices read the same", () => {
    const [before, after] = trialBars(2_674_155_117, 2_674_100_000);
    expect(before.text).not.toBe(after.text);
    expect(before.text).toBe(money(2_674_155_117));
  });

  it("matches the view's exact rows for the same press", () => {
    const trial = press("rate", SHIPPED_VALUES);
    const after = engine(trial.after);
    const view = trialImpactView(trial, after, "x");
    expect(view.bars.map((bar) => money(bar.value))).toEqual([
      view.exact.rows[1].before,
      view.exact.rows[1].after,
    ]);
  });
});

describe("overflow-safe increments", () => {
  it("rejects more decimals than a press can keep, without throwing", () => {
    const long = `1,${"1".repeat(150)}`;
    expect(parseDecimal(long)).not.toBeNull();
    expect(() => nextTrialValue("rate", long)).not.toThrow();
    expect(nextTrialValue("rate", long)).toBeNull();
    expect(nextTrialValue("rate", `8,${"5".repeat(MAX_TRIAL_DECIMALS)}`)).not.toBeNull();
    expect(nextTrialValue("reserve", `1,${"0".repeat(120)}`)).toBeNull();
  });

  it("rejects an increment a huge figure cannot show or absorb", () => {
    // 1e30 + 1 === 1e30 in floating point: a press would change nothing.
    expect(nextTrialValue("rate", `1${"0".repeat(30)}`)).toBeNull();
    // Past the money formatter's range, which prints a placeholder.
    expect(nextTrialValue("reserve", "9.999.999.999.999.999.999")).toBeNull();
  });

  it("says why such a press is off instead of doing nothing", () => {
    const values = { ...SHIPPED_VALUES, rate: `1,${"1".repeat(150)}` };
    expect(
      trialAvailability("rate", factsOf(values, { raw: { rate: values.rate } })),
    ).toEqual({ enabled: false, reason: L.blocked.unrepresentable });
  });
});

describe("the scene's two readings, each on a named whole (F1)", () => {
  const sceneOf = (values: FormValues) => {
    const input = read(values);
    const scene = affordabilityScene(computeAffordability(input), input.cashReserve ?? null, input.downPayment ?? null);
    if (scene.kind !== "ready") throw new Error(scene.kind);
    return scene;
  };
  const sum = (...parts: number[]) => parts.reduce((a, b) => a + b, 0);

  it("reading 1: 100% is the price = own money into it + the loan, and nothing else", () => {
    const values = { ...SHIPPED_VALUES, reserve: "50.000.000", purchaseCost: "3" };
    const result = engine(values);
    const { price, exact } = sceneOf(values);
    expect(price.wholeText).toBe(rounded(result.maxPrice));
    expect(price.ownText).toBe(rounded(result.cashToPrice));
    expect(price.loanText).toBe(rounded(result.maxLoan));
    expect(price.ownPercent).toBeCloseTo((result.cashToPrice / result.maxPrice) * 100, 9);
    expect(price.loanPercent).toBeCloseTo((result.maxLoan / result.maxPrice) * 100, 9);
    expect(price.ownPercent + price.loanPercent).toBeCloseTo(100, 6);
    // The reserve and the fees are not in the price reading at all.
    expect(Object.keys(price).join()).not.toMatch(/reserve|fee/i);
    expect(exact.find((e) => e.key === "price")!.value).toBe(money(result.maxPrice));
  });

  it("reading 2: 100% is the savings = into the price + fees + unused + the reserve kept", () => {
    const values = { ...SHIPPED_VALUES, reserve: "50.000.000", purchaseCost: "3" };
    const result = engine(values);
    const { savings } = sceneOf(values);
    expect(savings).not.toBeNull();
    const s = savings!;
    expect(result.purchaseCosts).toBeGreaterThan(0);
    // The whole is the savings TYPED: usable (600 − 50) + the 50 kept back.
    expect(s.wholeText).toBe(rounded(600_000_000));
    expect(s.toPricePercent).toBeCloseTo((result.cashToPrice / 600_000_000) * 100, 9);
    expect(s.feesPercent).toBeCloseTo((result.purchaseCosts / 600_000_000) * 100, 9);
    expect(s.reservePercent).toBeCloseTo((50_000_000 / 600_000_000) * 100, 9);
    expect(sum(s.toPricePercent, s.feesPercent, s.unusedPercent, s.reservePercent)).toBeCloseTo(100, 6);
    expect(s.reserveText).toBe(rounded(50_000_000));
    expect(s.reserveOverSavings).toBe(false);
  });

  it("+50 triệu reserve: the savings whole holds, the kept part grows, the price whole shrinks", () => {
    const after = { ...SHIPPED_VALUES, reserve: "50.000.000" };
    const before = sceneOf(SHIPPED_VALUES);
    const now = sceneOf(after);
    expect(engine(after).maxPrice).toBeLessThan(engine(SHIPPED_VALUES).maxPrice);
    expect(now.savings!.wholeText).toBe(before.savings!.wholeText);
    expect(before.savings!.reservePercent).toBe(0);
    expect(now.savings!.reservePercent).toBeCloseTo((50 / 600) * 100, 9);
    expect(now.savings!.toPricePercent).toBeLessThan(before.savings!.toPricePercent);
    expect(now.price.wholeText).not.toBe(before.price.wholeText);
  });

  it("a higher rate while cash binds leaves both readings where they were", () => {
    const cashBound = { ...SHIPPED_VALUES, down: "100.000.000", reserve: "0", ltv: "80", rate: "9,5" };
    const higher = { ...cashBound, rate: "10,5" };
    expect(engine(higher).priceBinding).toBe("financing");
    const a = sceneOf(cashBound);
    const b = sceneOf(higher);
    expect(b.price.ownPercent).toBeCloseTo(a.price.ownPercent, 9);
    expect(b.price.wholeText).toBe(a.price.wholeText);
    expect(b.savings!.toPricePercent).toBeCloseTo(a.savings!.toPricePercent, 9);
  });

  it("the reserve all kept: the whole savings bar is the reserve; the price is the loan", () => {
    const values = { ...SHIPPED_VALUES, reserve: "600.000.000" };
    const result = engine(values);
    expect(result.usableCash).toBe(0);
    const scene = sceneOf(values);
    expect(scene.price.loanPercent).toBeCloseTo(100, 9);
    expect(scene.savings!.reservePercent).toBeCloseTo(100, 9);
    expect(scene.savings!.toPricePercent).toBe(0);
    expect(scene.savings!.reserveOverSavings).toBe(false);
    // A reserve typed ABOVE the savings keeps all of them, and says so.
    const over = sceneOf({ ...SHIPPED_VALUES, reserve: "700.000.000" });
    expect(over.savings!.reserveOverSavings).toBe(true);
    expect(over.savings!.reservePercent).toBeCloseTo(100, 9);
    expect(over.savings!.wholeText).toBe(rounded(600_000_000));
  });

  it("a reserve above the savings: the component is what is kept, the typed figure apart", () => {
    // Cash 600M, reserve 700M, fees 0, LTV 100: the loan still sets a price.
    const values = { ...SHIPPED_VALUES, reserve: "700.000.000", purchaseCost: "0", ltv: "100" };
    const result = engine(values);
    expect(result.maxPrice).toBeGreaterThan(0);
    const { savings, exact } = sceneOf(values);
    const s = savings!;
    expect(s.reserveText).toBe(rounded(600_000_000));
    expect(s.reserveTypedText).toBe(rounded(700_000_000));
    expect(s.wholeText).toBe(rounded(600_000_000));
    // The parts reconcile to the whole in đồng: nothing usable, all kept.
    const row = (key: string) => exact.find((e) => e.key === key)?.value;
    expect(row("reserve")).toBe(money(600_000_000));
    expect(row("reserveTyped")).toBe(money(700_000_000));
    expect(result.usableCash).toBe(0);
    expect(result.cashToPrice + result.purchaseCosts).toBeCloseTo(0, 6);
    expect(s.toPricePercent + s.feesPercent + s.unusedPercent + s.reservePercent).toBeCloseTo(100, 9);
    // No typed-reserve row when the reserve fits inside the savings.
    expect(sceneOf({ ...SHIPPED_VALUES, reserve: "50.000.000" }).exact.some((e) => e.key === "reserveTyped")).toBe(false);
  });

  it("no savings at all: no second bar to divide", () => {
    expect(sceneOf({ ...SHIPPED_VALUES, down: "0" }).savings).toBeNull();
  });

  it("the credit-ceiling mode reads the same two wholes", () => {
    const values = { ...SHIPPED_VALUES, mode: "ceiling", essentials: "" };
    const result = engine(values);
    expect(result.conclusionLimited).toBe(false);
    const scene = sceneOf(values);
    expect(scene.price.wholeText).toBe(rounded(result.maxPrice));
    expect(scene.price.ownPercent + scene.price.loanPercent).toBeCloseTo(100, 6);
  });

  it("draws no figure without a readable price: unknown, limited or none", () => {
    const limited = engine({ ...SHIPPED_VALUES, essentials: "" });
    expect(limited.conclusionLimited).toBe(true);
    expect(affordabilityScene(null, 0, 0)).toEqual({ kind: "unknown" });
    expect(affordabilityScene(engine(SHIPPED_VALUES), null, 600_000_000)).toEqual({ kind: "unknown" });
    expect(affordabilityScene(limited, 0, 600_000_000)).toEqual({ kind: "limited" });
    expect(affordabilityScene({ ...limited, conclusionLimited: false, maxPrice: 0 }, 0, 600_000_000)).toEqual({
      kind: "none",
    });
  });

  it("draws nothing past the display limit: a price, a typed reserve or the savings ≥ 10^18 ₫", () => {
    const shipped = engine(SHIPPED_VALUES);
    expect(affordabilityScene({ ...shipped, maxPrice: 1e19 }, 0, 600_000_000)).toEqual({ kind: "display" });
    expect(affordabilityScene(shipped, 1e19, 600_000_000)).toEqual({ kind: "display" });
    expect(affordabilityScene({ ...shipped, usableCash: 1e19 }, 0, 1e19)).toEqual({ kind: "display" });
    // Through the real engine and parsers: a typed reserve of 10^19 ₫ is a
    // valid field, a real loan-only price, and no drawable figure.
    const values = { ...SHIPPED_VALUES, reserve: "10.000.000.000.000.000.000" };
    const huge = engine(values);
    expect(huge.maxPrice).toBeGreaterThan(0);
    expect(affordabilityScene(huge, read(values).cashReserve ?? null, read(values).downPayment ?? null)).toEqual({
      kind: "display",
    });
    // Just under the limit still draws.
    expect(affordabilityScene(shipped, 9e17, 1e18).kind).toBe("ready");
  });

  it("cash only: a real price with no loan is named — a 0% maximum, or no month left to repay", () => {
    const ltv = sceneOf({ ...SHIPPED_VALUES, ltv: "0" });
    expect(ltv.noLoan).toBe("ltv");
    expect(ltv.price.ownPercent).toBeCloseTo(100, 9);
    expect(ltv.price.loanPercent).toBe(0);
    // Net 44 − essentials 36 − debts 5 − buffer 3 = 0 triệu a month.
    const noMonth = { ...SHIPPED_VALUES, essentials: "36.000.000" };
    expect(engine(noMonth).maxLoan).toBeLessThan(0.5);
    expect(engine(noMonth).maxPrice).toBeGreaterThan(0);
    expect(sceneOf(noMonth).noLoan).toBe("capacity");
    // With a loan, nothing is said.
    expect(sceneOf(SHIPPED_VALUES).noLoan).toBeNull();
  });
});

describe("the commercial-only impact (release extraction)", () => {
  it("carries no instalment line and no instalment exact row", () => {
    const trial = press("rate", SHIPPED_VALUES);
    const after = engine({ ...SHIPPED_VALUES, ...trial.after });
    const impact = trialImpactView(trial, after, "Cần lưu ý");
    expect(Object.keys(impact)).not.toContain("paymentLine");
    expect(impact.trialLabel).toBe(L.trials.rate.label);
    expect(impact.exact.rows.map((row) => row.label)).not.toContain("Trả gốc và lãi mỗi tháng");
  });

  it("blocks on the commercial reasons only", () => {
    expect(sharedBlock(factsOf(SHIPPED_VALUES, { usable: false }))).toBe(L.blocked.invalid);
    expect(sharedBlock(factsOf(SHIPPED_VALUES, { targetInvalid: true }))).toBe(L.blocked.targetInvalid);
    expect(sharedBlock(factsOf(SHIPPED_VALUES, { limited: true }))).toBe(L.blocked.limited);
    expect(sharedBlock(factsOf(SHIPPED_VALUES))).toBeNull();
  });
});

describe("the whole-tool limit (commercial, 2026-09-30)", () => {
  const HUGE = "10.000.000.000.000.000.000"; // 10^19 ₫
  const limitOf = (values: FormValues, targetPrice: number | null = null) => {
    const input = read(values);
    return affordabilityLimit({ input, result: computeAffordability(input), targetPrice });
  };

  it("is null for the example and for every ordinary state the status adapter owns", () => {
    expect(limitOf(SHIPPED_VALUES)).toBeNull();
    // Missing essentials: an upper bound, said by the status card.
    expect(limitOf({ ...SHIPPED_VALUES, essentials: "" })).toBeNull();
    // No feasible price: 0 is a real, printable answer.
    const none = { ...SHIPPED_VALUES, down: "0", debts: "25.000.000" };
    expect(engine(none).maxPrice).toBe(0);
    expect(limitOf(none)).toBeNull();
    // Syntactically invalid input never reaches it.
    expect(affordabilityLimit({ input: null, result: null, targetPrice: null })).toBeNull();
  });

  it("names the typed value that cannot be printed: savings, reserve, target, housing costs", () => {
    expect(limitOf({ ...SHIPPED_VALUES, down: HUGE })).toEqual({ kind: "display", fields: ["down"] });
    expect(limitOf({ ...SHIPPED_VALUES, reserve: HUGE })).toEqual({ kind: "display", fields: ["reserve"] });
    expect(limitOf({ ...SHIPPED_VALUES, housingCosts: HUGE })).toEqual({
      kind: "display",
      fields: ["housingCosts"],
    });
    expect(limitOf(SHIPPED_VALUES, 1e19)).toEqual({ kind: "display", fields: ["targetPrice"] });
  });

  it("a price derived past 10^18 from printable inputs names the fields the price is built from", () => {
    const values = { ...SHIPPED_VALUES, down: "999.999.999.000.000.000" };
    const result = engine(values);
    expect(result.maxPrice).toBeGreaterThanOrEqual(1e18);
    expect(limitOf(values)).toEqual({ kind: "display", fields: ["netIncome", "down", "term"] });
    // The credit-ceiling mode builds its budget from the gross income.
    expect(limitOf({ ...values, mode: "ceiling" })).toEqual({
      kind: "display",
      fields: ["income", "down", "term"],
    });
  });

  it("a finite input the engine returns no result for is a model limit, not an input error", () => {
    const values = { ...SHIPPED_VALUES, mode: "ceiling", income: `1${"0".repeat(308)}` };
    const input = read(values);
    expect(Number.isFinite(input.monthlyIncome)).toBe(true);
    expect(computeAffordability(input)).toBeNull();
    expect(limitOf(values)).toEqual({ kind: "model", fields: ["income"] });
  });

  it("does not name a household field the credit-ceiling mode neither shows nor uses", () => {
    const values = { ...SHIPPED_VALUES, mode: "ceiling", essentials: HUGE, buffer: HUGE };
    expect(limitOf(values)).toBeNull();
    expect(limitOf({ ...values, mode: "household" })?.fields).toEqual(["essentials", "buffer"]);
  });

  it("blocks both tries with its own reason, before the input-error reason", () => {
    const facts = factsOf(SHIPPED_VALUES, { usable: false, unsupported: L.limits.blocked });
    expect(sharedBlock(facts)).toBe(L.limits.blocked);
    for (const key of ["reserve", "rate"] as const) {
      expect(trialAvailability(key, facts)).toEqual({ enabled: false, reason: L.limits.blocked });
      expect(
        makeTrial({ key, values: SHIPPED_VALUES, facts, revision: 0, result: engine(SHIPPED_VALUES), label: "x" }),
      ).toBeNull();
    }
  });

  it("a press never writes a value the page could not print", () => {
    // 999.999.999.950.000.000 + 50 triệu = 10^18: past the money formatter.
    const values: FormValues = { ...SHIPPED_VALUES, down: HUGE, reserve: "999.999.999.950.000.000" };
    const facts = factsOf(values, { raw: { reserve: values.reserve, rate: values.rate } });
    expect(trialAvailability("reserve", facts)).toEqual({ enabled: false, reason: L.blocked.unrepresentable });
    // The ordinary example stays pressable.
    const open = factsOf(SHIPPED_VALUES, { raw: { reserve: SHIPPED_VALUES.reserve, rate: SHIPPED_VALUES.rate } });
    expect(trialAvailability("reserve", open)).toEqual({ enabled: true });
    expect(trialAvailability("rate", open)).toEqual({ enabled: true });
  });

  it("a valid press from a printable state stays printable (price and payment only fall)", () => {
    const values = { ...SHIPPED_VALUES, down: "900.000.000.000.000.000" };
    expect(limitOf(values)).toBeNull();
    for (const key of ["reserve", "rate"] as const) {
      const trial = press(key, values);
      expect(limitOf({ ...values, ...trial.after })).toBeNull();
    }
  });
});
