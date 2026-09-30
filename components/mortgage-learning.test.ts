/**
 * The A2 learning panel on /cong-cu/vay-mua-nha/ — the pure half.
 *
 * Every figure asserted is the PRODUCTION engine's: `computeLoan` on the
 * inputs the page would build from the raw strings a press writes. Nothing
 * here checks appearance.
 */
import { describe, expect, it } from "vitest";
import {
  heldTrials,
  initialTrialState,
  onlyTried,
  trialReducer,
  type FormValues,
  type TrialState,
} from "@/components/calc/learning-trials";
import {
  clampMonth,
  EXTRA_STEP,
  firstPayment,
  makeMortgageTrial,
  monthSplit,
  mortgageAvailability,
  mortgageImpactView,
  mortgageRuler,
  mortgageScene,
  nextMortgageValue,
  termStep,
  termTrialLabel,
  type MortgageTrialKey,
} from "@/components/mortgage-learning";
import { LOAN as C } from "@/content/calculators/loan";
import { MORTGAGE_LEARNING as L } from "@/content/calculators/mortgage-learning";
import { compactMoney } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { computeLoan, yearlySummary, type LoanResult, type RepaymentMethod } from "@/lib/calc/loan";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";

const F = C.form;
const W = L.unitWords;
const rounded = (value: number) => compactMoney(value, CHART_UI.money);

/** The shipped example, as raw strings — what `useCalcFields` holds. */
const SHIPPED: FormValues = {
  amount: F.defaultAmount,
  rate: F.defaultRate,
  term: F.defaultTerm,
  termUnit: F.defaultTermUnit,
  extra: F.defaultExtra,
  method: F.defaultMethod,
  tax: "0",
  insurance: "0",
  otherFee: "0",
  pmi: "0",
  price: "",
  pmiMode: F.defaultPmiMode,
};

/**
 * The page's own reading of the raw strings, for the fields a press touches:
 * `parseMoney` for money, `parseDecimal` for the rate and term, the term
 * unit exactly as `loan-calculator.tsx` applies it. Null when the page would
 * show no result.
 */
function resultOf(values: FormValues): LoanResult | null {
  const amount = parseMoney(values.amount);
  const rate = parseDecimal(values.rate);
  const term = parseDecimal(values.term);
  const extra = parseMoney(values.extra);
  if (amount === null || amount <= 0 || rate === null || rate < 0) return null;
  if (term === null || term <= 0 || extra === null || extra < 0) return null;
  const termMonths = values.termUnit === "years" ? Math.round(term * 12) : Math.round(term);
  return computeLoan({
    amount,
    annualRatePercent: rate,
    termMonths,
    extraPerMonth: extra,
    method: values.method as RepaymentMethod,
  });
}

function press(key: MortgageTrialKey, values: FormValues, revision = 0) {
  const trial = makeMortgageTrial({ key, values, revision, result: resultOf(values) });
  if (trial === null) throw new Error(`press ${key} was not available`);
  return trial;
}

describe("what a press writes, in the unit the reader chose", () => {
  it("adds 5 years when the term is in years, 60 months when it is in months", () => {
    expect(termStep("years")).toBe(5);
    expect(termStep("months")).toBe(60);
    // Anything but "years" is months, exactly as the page reads `termUnit`.
    expect(termStep("")).toBe(60);
    expect(nextMortgageValue("term", SHIPPED)).toBe("25");
    expect(nextMortgageValue("term", { ...SHIPPED, termUnit: "months", term: "240" })).toBe("300");
    expect(nextMortgageValue("term", { ...SHIPPED, term: "5,5" })).toBe("10,5");
    expect(termTrialLabel("years")).toBe("Kéo dài kỳ hạn thêm 5 năm");
    expect(termTrialLabel("months")).toBe("Kéo dài kỳ hạn thêm 60 tháng");
  });

  it("the two units give the same loan: 20 năm → 25 năm is 240 → 300 tháng", () => {
    const years = resultOf({ ...SHIPPED, term: nextMortgageValue("term", SHIPPED)! })!;
    const monthsValues = { ...SHIPPED, termUnit: "months", term: "240" };
    const months = resultOf({ ...monthsValues, term: nextMortgageValue("term", monthsValues)! })!;
    expect(years.months).toBe(300);
    expect(months.months).toBe(300);
    expect(firstPayment(years)).toBeCloseTo(firstPayment(months), 6);
  });

  it("adds 1 triệu to the extra payment, grouped as the field shows it", () => {
    expect(EXTRA_STEP).toBe(1_000_000);
    expect(nextMortgageValue("extra", SHIPPED)).toBe("1.000.000");
    expect(nextMortgageValue("extra", { ...SHIPPED, extra: "2.500.000" })).toBe("3.500.000");
  });

  it("never reads a blank or malformed field as 0", () => {
    for (const extra of ["", "abc", "-1"]) {
      const values = { ...SHIPPED, extra };
      // The page has no result, so every press is off with the shared reason.
      expect(mortgageAvailability("extra", values, resultOf(values))).toEqual({
        enabled: false,
        reason: L.blocked.invalid,
      });
      expect(mortgageAvailability("term", values, resultOf(values)).enabled).toBe(false);
      expect(makeMortgageTrial({ key: "extra", values, revision: 0, result: resultOf(values) })).toBeNull();
    }
    expect(nextMortgageValue("extra", { ...SHIPPED, extra: "" })).toBeNull();
  });

  it("says why when the typed figure cannot take the step exactly", () => {
    const values = { ...SHIPPED, term: `20,${"1".repeat(20)}` };
    expect(mortgageAvailability("term", values, resultOf(SHIPPED))).toEqual({
      enabled: false,
      reason: L.blocked.unrepresentable,
    });
  });
});

describe("one month of the ACTUAL schedule", () => {
  const shipped = resultOf(SHIPPED)!;

  it("is the schedule row itself: payment = principal + interest", () => {
    const split = monthSplit(shipped, 1)!;
    const row = shipped.schedule[0];
    expect(split.month).toBe(1);
    expect(split.months).toBe(240);
    expect(split.payment).toBe(`${formatMoney(row.payment)} ₫`);
    expect(split.principal).toBe(`${formatMoney(row.principal)} ₫`);
    expect(split.interest).toBe(`${formatMoney(row.interest)} ₫`);
    expect(split.balance).toBe(`${formatMoney(row.balance)} ₫`);
    expect(split.principalPercent + split.interestPercent).toBeCloseTo(100, 9);
    expect(row.principal + row.interest).toBeCloseTo(row.payment, 6);
    expect(split.extraIncluded).toBe(false);
  });

  it("counts the extra payment ONCE — it is already inside the row's principal", () => {
    const withExtra = resultOf({ ...SHIPPED, extra: "2.000.000" })!;
    const row = withExtra.schedule[0];
    const split = monthSplit(withExtra, 1)!;
    // Principal = the bank's instalment less interest, PLUS the extra — and
    // the payment is still principal + interest, not + extra again.
    expect(row.principal).toBeCloseTo(withExtra.monthlyPrincipalInterest - row.interest + 2_000_000, 4);
    expect(row.payment).toBeCloseTo(withExtra.monthlyPrincipalInterest + 2_000_000, 4);
    expect(split.principal).toBe(`${formatMoney(row.principal)} ₫`);
    expect(split.extraIncluded).toBe(true);
  });

  it("keeps the selected month inside the payoff length as it changes", () => {
    expect(clampMonth(400, 240)).toBe(240);
    expect(clampMonth(0, 240)).toBe(1);
    expect(clampMonth(Number.NaN, 240)).toBe(1);
    const shorter = resultOf({ ...SHIPPED, extra: "5.000.000" })!;
    expect(shorter.months).toBeLessThan(240);
    const split = monthSplit(shorter, 240)!;
    expect(split.month).toBe(shorter.months);
    expect(split.months).toBe(shorter.months);
    // The last row of an actual schedule clears the debt.
    expect(split.balance).toBe("0 ₫");
  });

  it("agrees with the year table: months 1–12 sum to year 1", () => {
    const year1 = yearlySummary(shipped.schedule)[0];
    const rows = Array.from({ length: 12 }, (_, i) => shipped.schedule[i]);
    const principal = rows.reduce((sum, row) => sum + row.principal, 0);
    const interest = rows.reduce((sum, row) => sum + row.interest, 0);
    expect(principal).toBeCloseTo(year1.principal, 6);
    expect(interest).toBeCloseTo(year1.interest, 6);
    expect(monthSplit(shipped, 12)!.balance).toBe(`${formatMoney(year1.balance)} ₫`);
  });

  it("at a 0% rate, every đồng goes to principal and the sentence says so", () => {
    const zero = resultOf({ ...SHIPPED, rate: "0" })!;
    const split = monthSplit(zero, 1)!;
    expect(split.interest).toBe("0 ₫");
    expect(split.principalPercent).toBe(100);
    expect(split.interestPercent).toBe(0);
    expect(split.reading).toBe(L.month.readingNoInterest.replace("{month}", "1"));
  });

  it("a loan that clears in one month has one month, and its first payment is that one", () => {
    const one = resultOf({ ...SHIPPED, amount: "1.000.000", extra: "5.000.000" })!;
    expect(one.months).toBe(1);
    expect(one.hasFullMonths).toBe(false);
    const split = monthSplit(one, 7)!;
    expect(split.month).toBe(1);
    expect(split.months).toBe(1);
    // Not the "full month" figure, which describes nothing here.
    expect(firstPayment(one)).toBeCloseTo(one.actualFinalPrincipalInterest, 6);
    expect(firstPayment(one)).toBeLessThan(one.monthlyPrincipalInterest + one.monthlyExtra);
  });

  it("has nothing to read without a result", () => {
    expect(monthSplit(null, 1)).toBeNull();
  });
});

describe("what a press did, from two real results", () => {
  it("REGRESSION: past the earlier loan's payoff there is no ghost, and it says paid off", () => {
    // 240 → 300 months, reading month 300. The earlier schedule has no month
    // 300: its payment then was nothing, and its debt was gone.
    const before = resultOf(SHIPPED)!;
    const trial = press("term", SHIPPED);
    const after = resultOf(trial.after)!;
    expect(before.months).toBe(240);
    expect(after.months).toBe(300);
    const late = mortgageScene(after, 300, before)!;
    expect(late.split.month).toBe(300);
    expect(late.ghostPaymentPercent).toBeNull();
    expect(late.ghostBalancePercent).toBeNull();
    expect(late.referencePaidOffMonth).toBe(240);
    // Never month 240's payment dressed up as month 300's.
    const recycled = (before.schedule[239].payment / late.scale) * 100;
    expect(late.ghostPaymentPercent).not.toBe(recycled);
    // At a month both schedules have, the ghost IS the same month's row.
    const mid = mortgageScene(after, 100, before)!;
    expect(mid.referencePaidOffMonth).toBeNull();
    expect(mid.ghostPaymentPercent).toBeCloseTo((before.schedule[99].payment / mid.scale) * 100, 9);
    expect(mid.ghostBalancePercent).toBeCloseTo((before.schedule[99].balance / 2e9) * 100, 9);
    // The boundary: month 240 still exists in the earlier schedule.
    expect(mortgageScene(after, 240, before)!.referencePaidOffMonth).toBeNull();
    expect(mortgageScene(after, 241, before)!.referencePaidOffMonth).toBe(240);
  });

  const before = resultOf(SHIPPED)!;

  it("a longer term: a smaller first payment, more total interest", () => {
    const trial = press("term", SHIPPED);
    const after = resultOf(trial.after)!;
    const view = mortgageImpactView(trial, after, W);
    expect(after.months).toBe(300);
    expect(firstPayment(after)).toBeLessThan(firstPayment(before));
    expect(after.totalInterest).toBeGreaterThan(before.totalInterest);
    expect(view.fieldLine).toBe("Kỳ hạn: 20 năm → 25 năm");
    expect(view.monthsLine).toBe("Trả xong sau: 240 tháng → 300 tháng");
    expect(view.why).toBe(
      L.why.termLonger
        .replace("{payment}", rounded(firstPayment(before) - firstPayment(after)))
        .replace("{interest}", rounded(after.totalInterest - before.totalInterest)),
    );
    // The exact đồng, behind the disclosure.
    expect(view.exact.map((r) => r.label)).toEqual([
      L.trials.term.field,
      L.impact.exactPayment,
      L.impact.exactInterest,
      L.impact.exactMonths,
    ]);
    expect(view.exact[2]).toEqual({
      label: L.impact.exactInterest,
      before: `${formatMoney(before.totalInterest)} ₫`,
      after: `${formatMoney(after.totalInterest)} ₫`,
    });
    // One axis from 0: the larger total is the full bar.
    expect(view.bars.map((b) => b.side)).toEqual(["before", "after"]);
    expect(view.bars[1].percent).toBe(100);
    expect(view.bars[0].percent).toBeCloseTo((before.totalInterest / after.totalInterest) * 100, 9);
  });

  it("paying 1 triệu extra: paid off sooner, less interest, a larger first payment", () => {
    const trial = press("extra", SHIPPED);
    const after = resultOf(trial.after)!;
    const view = mortgageImpactView(trial, after, W);
    expect(after.months).toBeLessThan(before.months);
    expect(after.totalInterest).toBeLessThan(before.totalInterest);
    expect(firstPayment(after) - firstPayment(before)).toBeCloseTo(1_000_000, 4);
    expect(view.fieldLine).toBe("Trả thêm mỗi tháng: 0 ₫ → 1.000.000 ₫");
    expect(view.why).toContain(`sớm hơn ${before.months - after.months} tháng`);
    expect(view.why).toContain(rounded(before.totalInterest - after.totalInterest));
  });

  it("the term press in MONTHS names the month unit", () => {
    const values = { ...SHIPPED, termUnit: "months", term: "240" };
    const trial = press("term", values);
    const view = mortgageImpactView(trial, resultOf(trial.after)!, W);
    expect(view.fieldLine).toBe("Kỳ hạn: 240 tháng → 300 tháng");
  });

  it("at 0%, neither press invents interest", () => {
    const zero = { ...SHIPPED, rate: "0" };
    const term = press("term", zero);
    expect(mortgageImpactView(term, resultOf(term.after)!, W).why).toBe(L.why.termNoInterest);
    const extra = press("extra", zero);
    const after = resultOf(extra.after)!;
    expect(after.totalInterest).toBe(0);
    expect(mortgageImpactView(extra, after, W).why).toBe(
      L.why.extraNoInterest.replace("{months}", String(resultOf(zero)!.months - after.months)),
    );
  });

  it("a one-month loan that more extra cannot shorten says nothing moved", () => {
    const one = { ...SHIPPED, amount: "1.000.000", extra: "5.000.000" };
    const trial = press("extra", one);
    const after = resultOf(trial.after)!;
    expect(after.months).toBe(1);
    expect(mortgageImpactView(trial, after, W).why).toBe(L.why.unchanged);
  });

  it("flat-principal repayment: a longer term still lowers the first payment", () => {
    const flat = { ...SHIPPED, method: "flatPrincipal" };
    const trial = press("term", flat);
    expect(firstPayment(resultOf(trial.after)!)).toBeLessThan(firstPayment(resultOf(flat)!));
  });
});

describe("the trial stack: repeat, undo, manual edit, invalid and recovery", () => {
  type S = TrialState<MortgageTrialKey, LoanResult>;
  const start: S = initialTrialState();

  it("stacks repeated and crossed presses; undo takes back only the latest", () => {
    const one = press("term", SHIPPED);
    let state = trialReducer(start, { type: "apply", trial: one });
    const two = press("extra", one.after);
    state = trialReducer(state, { type: "apply", trial: two });
    const three = press("term", two.after);
    state = trialReducer(state, { type: "apply", trial: three });
    expect(heldTrials(state, three.after).map((t) => t.key)).toEqual(["term", "extra", "term"]);
    expect(three.after.term).toBe("30");
    expect(three.after.extra).toBe("1.000.000");
    state = trialReducer(state, { type: "undo" });
    // Undo writes the latest press's `before` back, so the form reads two.after.
    expect(heldTrials(state, two.after).map((t) => t.key)).toEqual(["term", "extra"]);
    state = trialReducer(state, { type: "undo" });
    state = trialReducer(state, { type: "undo" });
    expect(heldTrials(state, SHIPPED)).toEqual([]);
    expect(trialReducer(state, { type: "undo" })).toBe(state);
  });

  it("a manual edit retires every trial — even typing the SAME value back", () => {
    const one = press("extra", SHIPPED);
    let state = trialReducer(start, { type: "apply", trial: one });
    expect(heldTrials(state, one.after)).toHaveLength(1);
    // The reader re-types "1.000.000": same raw values, new revision.
    state = trialReducer(state, { type: "edit" });
    expect(heldTrials(state, one.after)).toEqual([]);
    // A press made before the edit can never be applied after it.
    expect(trialReducer(state, { type: "apply", trial: one })).toBe(state);
    // Nothing is left to undo, so an undo cannot overwrite the typed value.
    expect(trialReducer(state, { type: "undo" })).toBe(state);
  });

  it("invalid input removes the impact; recovery restores only the current result", () => {
    const one = press("term", SHIPPED);
    let state = trialReducer(start, { type: "apply", trial: one });
    // Typing a bad rate is an edit, and the page has no result.
    state = trialReducer(state, { type: "edit" });
    const invalid = { ...one.after, rate: "abc" };
    expect(resultOf(invalid)).toBeNull();
    expect(heldTrials(state, invalid)).toEqual([]);
    // Typing the rate back is another edit: the earlier press stays retired,
    // and what shows is the result for the current form only.
    state = trialReducer(state, { type: "edit" });
    expect(heldTrials(state, one.after)).toEqual([]);
    expect(resultOf(one.after)!.months).toBe(300);
  });

  it("'Về ví dụ mẫu' retires every trial", () => {
    const state = trialReducer(trialReducer(start, { type: "apply", trial: press("term", SHIPPED) }), {
      type: "reset",
    });
    expect(state.trials).toEqual([]);
    expect(state.revision).toBe(1);
  });

  it("keeps the example labelled as one while only presses changed it", () => {
    const one = press("extra", SHIPPED);
    expect(onlyTried([one], SHIPPED)).toBe(true);
    const typed = { ...SHIPPED, amount: "1.500.000.000" };
    expect(onlyTried([press("extra", typed)], SHIPPED)).toBe(false);
    expect(onlyTried([], SHIPPED)).toBe(false);
  });
});

describe("Thước tháng: the monthly ruler, read off the schedule", () => {
  const base = resultOf(SHIPPED)!;
  const extra = resultOf({ ...SHIPPED, extra: "1.000.000" })!;

  it("matches the engine fixture for month 1 of 2 tỷ, 8,5%, 240 months, annuity", () => {
    const row = base.schedule[0];
    expect(row.payment).toBeCloseTo(17_356_464.6673, 3);
    expect(row.principal).toBeCloseTo(3_189_798.00064, 4);
    expect(row.interest).toBeCloseTo(14_166_666.66667, 4);
    const ruler = mortgageRuler(base, 1, null)!;
    expect(ruler.method).toBe("annuity");
    expect(ruler.paymentText).toBe("17,36 triệu");
    expect(ruler.interestText).toBe("14,17 triệu");
    expect(ruler.principalText).toBe("3,19 triệu");
    expect(ruler.extraPrincipalText).toBeNull();
    expect(ruler.debtBeforeText).toBe("2.000,0 triệu");
    expect(ruler.debtAfterText).toBe("1.996,8 triệu");
    // The rate is READ BACK from the row, and shown as an approximation.
    expect(ruler.monthlyRateText).toBe("0,708%");
    expect(ruler.exact.debtBefore).toBe("2.000.000.000 ₫");
    expect(ruler.exact.interest).toBe("14.166.667 ₫");
    expect(ruler.exact.principal).toBe("3.189.798 ₫");
    // Next month is the NEXT row's interest, measured on this month's debt after.
    expect(ruler.nextInterestText).toBe(`${formatMoney(base.schedule[1].interest / 1e6, 2)} triệu`);
    expect(base.schedule[1].interest).toBeCloseTo(row.balance * (0.085 / 12), 4);
    expect(ruler.isFinal).toBe(false);
  });

  it("extra 1 triệu from month 1: same interest, principal 4.189.798 counted once, payoff 210", () => {
    const row = extra.schedule[0];
    expect(row.interest).toBeCloseTo(base.schedule[0].interest, 6);
    expect(row.principal).toBeCloseTo(4_189_798.00064, 4);
    const ruler = mortgageRuler(extra, 1, base)!;
    expect(ruler.regularPrincipalText).toBe("3,19 triệu");
    expect(ruler.extraPrincipalText).toBe("1,00 triệu");
    expect(ruler.exact.principal).toBe("4.189.798 ₫");
    expect(ruler.exact.extraPrincipal).toBe("1.000.000 ₫");
    // Regular + extra is the row's principal: nothing added twice.
    expect(ruler.regularOfScale + ruler.extraOfScale).toBeCloseTo((row.principal / ruler.scene.scale) * 100, 9);
    expect(ruler.interestOfScale + ruler.regularOfScale + ruler.extraOfScale).toBeCloseTo(
      (row.payment / ruler.scene.scale) * 100,
      9,
    );
    expect(ruler.interestVsReference?.now).toEqual({ kind: "same", amount: "0 ₫" });
    expect(base.schedule[1].interest - extra.schedule[1].interest).toBeCloseTo(7_083.3333, 3);
    expect(ruler.interestVsReference?.next).toEqual({ kind: "lower", amount: "7.083 ₫" });
    expect(base.months).toBe(240);
    expect(extra.months).toBe(210);
  });

  it("the final row: may be smaller, capped extra never exceeds its principal, no next month", () => {
    const last = mortgageRuler(extra, extra.months, base)!;
    const row = extra.schedule.at(-1)!;
    expect(last.isFinal).toBe(true);
    expect(last.nextInterestText).toBeNull();
    expect(last.interestVsReference?.next).toBeNull();
    expect(row.payment).toBeLessThan(extra.schedule[0].payment);
    expect(last.regularOfScale).toBeGreaterThanOrEqual(0);
    expect(last.regularOfScale + last.extraOfScale).toBeCloseTo((row.principal / last.scene.scale) * 100, 9);
    expect(last.exact.debtAfter).toBe("0 ₫");
  });

  it("flat principal is named as such: principal fixed, payment falling", () => {
    const flat = resultOf({ ...SHIPPED, method: "flatPrincipal" })!;
    const one = mortgageRuler(flat, 1, null)!;
    const two = mortgageRuler(flat, 2, null)!;
    expect(one.method).toBe("flatPrincipal");
    expect(one.principalText).toBe(two.principalText);
    expect(flat.schedule[1].payment).toBeLessThan(flat.schedule[0].payment);
  });

  it("nothing without a result, and past the reference payoff no comparison", () => {
    expect(mortgageRuler(null, 1, null)).toBeNull();
    const longer = resultOf({ ...SHIPPED, term: "25" })!;
    const past = mortgageRuler(longer, 300, base)!;
    expect(past.scene.referencePaidOffMonth).toBe(240);
    expect(past.interestVsReference).toEqual({ now: null, next: null });
  });
});

describe("Thước tháng: scheduled principal first, extra only as the residual", () => {
  const extra = resultOf({ ...SHIPPED, extra: "1.000.000" })!;
  const flat = resultOf({ ...SHIPPED, extra: "1.000.000", method: "flatPrincipal" })!;

  it("annuity final row (210): 5,556 triệu is below the 17,356 triệu instalment — NO extra", () => {
    expect(extra.months).toBe(210);
    const row = extra.schedule[209];
    expect(row.payment).toBeCloseTo(5_556_035.16, 1);
    expect(row.payment).toBeLessThan(extra.monthlyPrincipalInterest);
    const last = mortgageRuler(extra, 210, null)!;
    expect(last.extraPrincipalText).toBeNull();
    expect(last.exact.extraPrincipal).toBeNull();
    expect(last.extraOfScale).toBe(0);
    expect(last.regularOfScale).toBeCloseTo((row.principal / last.scene.scale) * 100, 9);
  });

  it("flat principal final row (215): 2,667 triệu is below the 8,333 triệu slice — NO extra", () => {
    expect(flat.months).toBe(215);
    const row = flat.schedule[214];
    expect(row.principal).toBeCloseTo(2_666_666.67, 1);
    const last = mortgageRuler(flat, 215, null)!;
    expect(last.extraPrincipalText).toBeNull();
    expect(last.extraOfScale).toBe(0);
  });

  it("flat principal month 1: the 8,333 triệu slice from engine data, plus the 1 triệu extra", () => {
    const one = mortgageRuler(flat, 1, null)!;
    // Slice = first scheduled payment − first interest: 23,5 − 14,17 ≈ 8,333 triệu (= 2 tỷ / 240).
    expect(flat.monthlyPrincipalInterest - flat.schedule[0].interest).toBeCloseTo(2e9 / 240, 4);
    expect(one.regularPrincipalText).toBe("8,33 triệu");
    expect(one.extraPrincipalText).toBe("1,00 triệu");
    expect(one.exact.principal).toBe("9.333.333 ₫");
  });

  it("a one-month payoff the scheduled instalment already covers shows NO extra", () => {
    // A 1-MONTH term: the scheduled instalment is the whole loan plus interest.
    const tiny = resultOf({ ...SHIPPED, amount: "10.000.000", extra: "1.000.000", term: "1", termUnit: "months" })!;
    expect(tiny.months).toBe(1);
    expect(mortgageRuler(tiny, 1, null)!.extraPrincipalText).toBeNull();
  });

  it("a partly capped final row: extra is the residual above the scheduled principal, counted once", () => {
    // Search real engine schedules for a final row that needs SOME, but not
    // all, of the monthly extra — and read its allocation back.
    let found = false;
    for (let step = 1; step <= 60 && !found; step += 1) {
      const e = step * 250_000;
      const r = resultOf({ ...SHIPPED, extra: formatMoney(e) })!;
      const row = r.schedule.at(-1)!;
      const scheduled = r.monthlyPrincipalInterest - row.interest;
      if (row.principal > scheduled + 1 && row.principal < scheduled + e - 1) {
        found = true;
        const last = mortgageRuler(r, r.months, null)!;
        const extraOnRow = row.principal - scheduled;
        expect(last.exact.extraPrincipal).toBe(`${formatMoney(extraOnRow)} ₫`);
        expect(last.regularOfScale + last.extraOfScale).toBeCloseTo((row.principal / last.scene.scale) * 100, 9);
        expect(last.extraOfScale).toBeCloseTo((extraOnRow / last.scene.scale) * 100, 9);
      }
    }
    expect(found).toBe(true);
  });

  it("without an extra payment, no row ever shows extra", () => {
    const base = resultOf(SHIPPED)!;
    for (const month of [1, 120, 239, 240]) {
      expect(mortgageRuler(base, month, null)!.extraPrincipalText).toBeNull();
    }
  });
});
