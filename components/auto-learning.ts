/*
 * /cong-cu/vay-mua-xe/'s learning panel and debt-balance chart (A3,
 * 2026-09-28) — the pure half.
 *
 * NO NEW ARITHMETIC AND NO SECOND RESOLVER. The page's own
 * `autoLoanFormState` parses the form, classifies a covered price
 * (`nothingToFinance`, a real 0) apart from an invalid field (`null`, never
 * coalesced to 0) and builds the household month. This module is handed
 * that state — before a press and now — and only chooses which true sentence
 * to say. `lib/calc/*` is not touched; `vehicleBudgetStatus` keeps its
 * meaning because the status word arrives from the page.
 *
 * Type-only imports from the calculator, so there is no module cycle.
 */
import { AMOUNT_WORDS } from "@/components/calc/learning-words";
import { derivedTermMonths, termMonthsSupported } from "@/components/calc/term-months";
import {
  pairBars,
  stepDecimal,
  stepMoney,
  type FormValues,
  type PairBar,
  type Trial,
  type TrialAvailability,
} from "@/components/calc/learning-trials";
import type { AutoLoanFormState } from "@/components/auto-loan-calculator";
import { AUTO_LEARNING as L } from "@/content/calculators/auto-learning";
import type { AutoLoanResult } from "@/lib/calc/auto-loan";
import { debtPathsModel } from "@/lib/calc/charts/debt-path-chart";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import type { LineChartModel } from "@/lib/calc/charts/types";
import { formatDecimal, formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { vehicleBudgetStatus } from "@/lib/calc/vehicle-budget-status";

export type AutoTrialKey = "down" | "term" | "running";
export const AUTO_TRIAL_KEYS: readonly AutoTrialKey[] = ["down", "term", "running"];
export type AutoTrial = Trial<AutoTrialKey, AutoLoanFormState>;

/** +50 triệu to the cash deposit. */
export const DOWN_STEP = 50_000_000;

/** +1 triệu to the monthly running costs — the page's own `running` field. */
export const RUNNING_STEP = 1_000_000;

/** +2 when the term is in years, +24 when it is in months — the page's reading of `termUnit`. */
export function autoTermStep(termUnit: string): number {
  return termUnit === "years" ? 2 : 24;
}

export function autoTermLabel(termUnit: string): string {
  return fill(L.trials.term.label, {
    step: termUnit === "years" ? L.termStepYears : L.termStepMonths,
  });
}

export function nextAutoValue(key: AutoTrialKey, values: FormValues): string | null {
  const raw = values[key];
  if (raw === undefined) return null;
  return key === "term"
    ? stepDecimal(raw, autoTermStep(values.termUnit ?? ""))
    : stepMoney(raw, key === "running" ? RUNNING_STEP : DOWN_STEP);
}

/** A term press must land inside the site's 1 … 1.200-month support range. */
export function autoTermStepSupported(values: FormValues): boolean {
  const next = nextAutoValue("term", values);
  return next !== null && termMonthsSupported(derivedTermMonths(parseDecimal(next), values.termUnit ?? ""));
}

const money = (figure: number) => `${formatMoney(figure)} ₫`;

/**
 * Whether a press may run.
 *
 * - Any vehicle or loan field invalid: both off. A malformed trade-in is
 *   never read as 0.
 * - The deposit: off when deposit + trade-in + 50 triệu would EXCEED the
 *   price. Exactly equal is allowed — the page then reports nothing to
 *   finance, a real cash purchase.
 * - The term: off when there is no loan to lengthen.
 */
export function autoAvailability(
  key: AutoTrialKey,
  values: FormValues,
  state: AutoLoanFormState,
): TrialAvailability {
  // Running costs change the household month, not the loan: they need a
  // month the page can compute — the ledger and a known instalment.
  if (key === "running") {
    if (state.budget === null || state.vehiclePayment === null) {
      return { enabled: false, reason: L.blocked.budget };
    }
    if (nextAutoValue(key, values) === null) {
      return { enabled: false, reason: L.blocked.unrepresentable };
    }
    return { enabled: true };
  }
  const vehicleInvalid =
    state.priceInvalid ||
    state.downInvalid ||
    state.tradeInInvalid ||
    state.rateInvalid ||
    state.termInvalid;
  if (vehicleInvalid) return { enabled: false, reason: L.blocked.invalid };
  if (key === "down") {
    // Valid by the gate above, and parsed by the page's own parser.
    const price = parseMoney(values.price ?? "")!;
    const down = parseMoney(values.down ?? "")!;
    const tradeIn = parseMoney(values.tradeIn ?? "")!;
    if (down + tradeIn + DOWN_STEP > price) {
      return {
        enabled: false,
        reason: fill(L.blocked.downOverPrice, {
          left: money(Math.max(0, price - down - tradeIn)),
        }),
      };
    }
  } else if (state.nothingToFinance) {
    return { enabled: false, reason: L.blocked.noLoan };
  }
  if (state.result === null) return { enabled: false, reason: L.blocked.invalid };
  if (nextAutoValue(key, values) === null) {
    return { enabled: false, reason: L.blocked.unrepresentable };
  }
  if (key === "term" && !autoTermStepSupported(values)) {
    return { enabled: false, reason: L.blocked.termMax };
  }
  return { enabled: true };
}

export function makeAutoTrial({
  key,
  values,
  revision,
  state,
  label,
}: {
  key: AutoTrialKey;
  values: FormValues;
  revision: number;
  state: AutoLoanFormState;
  label: string;
}): AutoTrial | null {
  // A running-cost press needs a computable month, not a loan: a cash
  // purchase still has running costs.
  const base = key === "running" ? state.budget : state.result;
  if (base === null || !autoAvailability(key, values, state).enabled) return null;
  const next = nextAutoValue(key, values);
  if (next === null) return null;
  return {
    key,
    revision,
    before: { ...values },
    after: { ...values, [key]: next },
    beforeResult: state,
    beforeLabel: label,
  };
}

export type AutoImpactView = {
  key: AutoTrialKey;
  fieldLine: string;
  paymentLine: string;
  interestLine: string;
  monthsLine: string;
  /** The household month, said on its own — or why it cannot be. */
  budgetLine: string;
  budgetNote: string | null;
  statusLine: string | null;
  /** Payment bars; null for a running-cost press, which does not move the payment. */
  bars: readonly PairBar[] | null;
  exact: readonly { label: string; before: string; after: string }[];
  why: string;
  lesson: string;
  question: string;
  /** The head of the ONE live sentence. */
  said: string;
};

const same = (a: number, b: number) => Math.abs(a - b) < 0.5;

function fieldText(key: AutoTrialKey, values: FormValues): string {
  if (key === "term") {
    return `${values.term} ${values.termUnit === "years" ? L.unitWords.years : L.unitWords.months}`;
  }
  return `${key === "running" ? values.running : values.down} ₫`;
}

/** Both months a real budget (essentials known, instalment known), or null. */
function knownRemainders(before: AutoLoanFormState, after: AutoLoanFormState) {
  const bb = before.budget;
  const ab = after.budget;
  if (bb === null || ab === null || bb.limited || ab.limited) return null;
  if (bb.withCar === null || ab.withCar === null) return null;
  return { before: bb.withCar, after: ab.withCar };
}

/** The loan figures a state stands for: a priced loan, a real "no loan", or unknown. */
function loanFigures(state: AutoLoanFormState) {
  if (state.result !== null) {
    return {
      payment: state.result.loan.monthlyPrincipalInterest,
      interest: state.result.loan.totalInterest,
      months: state.result.loan.months as number | null,
      financed: state.result.amountFinanced,
    };
  }
  return state.nothingToFinance ? { payment: 0, interest: 0, months: null, financed: 0 } : null;
}

export function autoWhy(key: AutoTrialKey, before: AutoLoanFormState, after: AutoLoanFormState): string {
  if (key === "running") {
    const r = knownRemainders(before, after);
    return r === null
      ? L.why.runningLimited
      : fill(L.why.runningMore, { amount: compactMoney(Math.abs(r.before - r.after), AMOUNT_WORDS) });
  }
  const b = loanFigures(before);
  const a = loanFigures(after);
  if (b === null || a === null) return L.why.changedOther;
  if (same(b.payment, a.payment) && same(b.interest, a.interest) && b.months === a.months) {
    return L.why.unchanged;
  }
  const noInterest = b.interest === 0 && a.interest === 0;
  if (key === "down") {
    if (after.nothingToFinance) return L.why.downCovers;
    if (noInterest && a.payment < b.payment) {
      return fill(L.why.downNoInterest, { payment: compactMoney(b.payment - a.payment, AMOUNT_WORDS) });
    }
    if (a.payment < b.payment && a.interest < b.interest) {
      return fill(L.why.downLess, {
        payment: compactMoney(b.payment - a.payment, AMOUNT_WORDS),
        interest: compactMoney(b.interest - a.interest, AMOUNT_WORDS),
      });
    }
    return L.why.changedOther;
  }
  if (noInterest && a.payment < b.payment) return L.why.termNoInterest;
  if (a.payment < b.payment && a.interest > b.interest && a.months !== null && b.months !== null) {
    return fill(L.why.termLonger, {
      payment: compactMoney(b.payment - a.payment, AMOUNT_WORDS),
      months: formatDecimal(a.months - b.months, 0),
      interest: compactMoney(a.interest - b.interest, AMOUNT_WORDS),
    });
  }
  return L.why.changedOther;
}

/**
 * The latest press against the state on screen now. Null when the state now
 * has neither a loan nor a real "no loan" — then there is nothing true to say.
 */
export function autoImpactView(
  trial: AutoTrial,
  after: AutoLoanFormState,
  afterLabel: string,
): AutoImpactView | null {
  const before = trial.beforeResult;
  const b = loanFigures(before);
  const a = loanFigures(after);
  if (b === null || a === null) return null;
  const I = L.impact;
  const noLoan = after.result === null;

  const [payB, payA] = compactMoneyPair(b.payment, a.payment, AMOUNT_WORDS);
  const [intB, intA] = compactMoneyPair(b.interest, a.interest, AMOUNT_WORDS);
  const months = (n: number | null) =>
    n === null ? I.noLoanCell : `${formatDecimal(n, 0)} ${I.monthsUnit}`;

  // The household month, only where both sides are a real budget: never a
  // remainder invented while the essentials are blank.
  const bb = before.budget;
  const ab = after.budget;
  const remainders = knownRemainders(before, after);
  const budgetKnown = remainders !== null;
  let budgetLine: string;
  let budgetNote: string | null = null;
  if (remainders !== null) {
    const [wB, wA] = compactMoneyPair(remainders.before, remainders.after, AMOUNT_WORDS);
    budgetLine = fill(I.budgetLine, { before: wB, after: wA });
    if (ab?.runningCostsExcluded) budgetNote = I.budgetRunningExcluded;
  } else if (bb?.limited || ab?.limited) {
    budgetLine = I.budgetLimited;
  } else {
    budgetLine = I.budgetUnknown;
  }

  const field = L.trials[trial.key].field;
  const change =
    trial.key === "running"
      ? remainders === null
        ? I.changeRemainderUnknown
        : fill(I.changeRemainder, {
            amount: compactMoney(Math.abs(remainders.before - remainders.after), AMOUNT_WORDS),
          })
      : noLoan
        ? I.changeNoLoan
        : same(a.payment, b.payment)
          ? I.changeNone
          : fill(a.payment < b.payment ? I.changeDown : I.changeUp, {
              amount: compactMoney(Math.abs(b.payment - a.payment), AMOUNT_WORDS),
            });
  const trialLabel =
    trial.key === "term" ? autoTermLabel(trial.before.termUnit ?? "") : L.trials[trial.key].label;

  return {
    key: trial.key,
    fieldLine: fill(I.fieldLine, {
      field,
      before: fieldText(trial.key, trial.before),
      after: fieldText(trial.key, trial.after),
    }),
    paymentLine: noLoan
      ? fill(I.paymentNone, { before: payB })
      : fill(I.paymentLine, { before: payB, after: payA }),
    interestLine: fill(I.interestLine, { before: intB, after: intA }),
    monthsLine:
      a.months === null
        ? fill(I.monthsNone, { before: formatDecimal(b.months ?? 0, 0) })
        : fill(I.monthsLine, {
            before: formatDecimal(b.months ?? 0, 0),
            after: formatDecimal(a.months, 0),
          }),
    budgetLine,
    budgetNote,
    statusLine:
      trial.beforeLabel !== "" && afterLabel !== "" && trial.beforeLabel !== afterLabel
        ? fill(I.statusLine, { before: trial.beforeLabel, after: afterLabel })
        : null,
    bars:
      trial.key === "running"
        ? null
        : pairBars(b.payment, a.payment, { before: I.barBefore, after: I.barAfter }, AMOUNT_WORDS),
    exact: [
      { label: field, before: fieldText(trial.key, trial.before), after: fieldText(trial.key, trial.after) },
      { label: I.exactFinanced, before: money(b.financed), after: noLoan ? I.noLoanCell : money(a.financed) },
      { label: I.exactPayment, before: money(b.payment), after: noLoan ? I.noLoanCell : money(a.payment) },
      { label: I.exactInterest, before: money(b.interest), after: money(a.interest) },
      { label: I.exactMonths, before: months(b.months), after: months(a.months) },
      ...(budgetKnown
        ? [{ label: I.exactWithCar, before: money(bb!.withCar!), after: money(ab!.withCar!) }]
        : []),
    ],
    why: autoWhy(trial.key, before, after),
    lesson: L.trials[trial.key].lesson,
    question: L.trials[trial.key].question,
    said: fill(I.said, {
      trial: trialLabel,
      field,
      before: fieldText(trial.key, trial.before),
      after: fieldText(trial.key, trial.after),
      change,
    }),
  };
}

/**
 * The debt still OWED, month by month, read off the actual schedule — one
 * path, starting from the amount financed at month 0 and ending at 0 on the
 * payoff month. Not a vehicle value: nothing about depreciation is drawn.
 */
export function autoBalanceModel(result: AutoLoanResult | null): LineChartModel {
  const { pathLabel, ...labels } = L.balanceChart;
  if (result === null) return debtPathsModel([], 0, labels);
  return debtPathsModel(
    [
      {
        key: "current",
        label: pathLabel,
        balances: result.loan.schedule.map((row) => row.balance),
        totalInterest: result.loan.totalInterest,
      },
    ],
    result.amountFinanced,
    labels,
  );
}

/**
 * What the integrated scene draws. Three truthful non-numeric states come
 * first: an invalid or unpriceable form ("unknown"), and a deposit plus
 * trade-in ABOVE the price ("excess") — neither is drawn as a zero balance.
 * An exact cash purchase is a real scene ("cash"), with no loan.
 */
export type AutoSceneView =
  | { kind: "unknown" }
  | { kind: "excess" }
  | {
      kind: "loan" | "cash";
      priceText: string;
      downText: string;
      tradeText: string | null;
      financedText: string;
      /** Shares of the PRICE, the named 100% axis. */
      downPercent: number;
      tradePercent: number;
      financedPercent: number;
      /** Where the financed part began before the latest press, same axis. */
      ghostUpfrontPercent: number | null;
      paymentText: string | null;
      months: number | null;
      interestText: string | null;
      /** The larger of the payment now and before the press: the receipt axis. */
      scaleText: string | null;
      paymentOfScale: number;
      ghostPaymentPercent: number | null;
    };

export function autoScene(
  values: FormValues,
  state: AutoLoanFormState,
  reference: { values: FormValues; state: AutoLoanFormState } | null,
): AutoSceneView {
  const vehicleInvalid =
    state.priceInvalid || state.downInvalid || state.tradeInInvalid || state.rateInvalid || state.termInvalid;
  if (vehicleInvalid || (state.result === null && !state.nothingToFinance)) return { kind: "unknown" };
  // Valid by the gate above, read by the page's own parser.
  const price = parseMoney(values.price ?? "")!;
  const down = parseMoney(values.down ?? "")!;
  const tradeIn = parseMoney(values.tradeIn ?? "")!;
  if (down + tradeIn > price) return { kind: "excess" };

  const of = (value: number, axis: number) => (axis > 0 ? (value / axis) * 100 : 0);
  const loan = state.result?.loan ?? null;
  const financed = state.result?.amountFinanced ?? 0;
  const payment = loan?.monthlyPrincipalInterest ?? 0;

  const refLoan = reference?.state.result?.loan ?? null;
  const refPrice = reference ? parseMoney(reference.values.price ?? "") : null;
  const refDown = reference ? parseMoney(reference.values.down ?? "") : null;
  const refTrade = reference ? parseMoney(reference.values.tradeIn ?? "") : null;
  // The same price axis before and after, or no ghost at all.
  const ghostUpfrontPercent =
    refPrice !== null && refDown !== null && refTrade !== null && same(refPrice, price)
      ? of(refDown + refTrade, price)
      : null;
  const refPayment = reference === null ? null : (refLoan?.monthlyPrincipalInterest ?? 0);
  const scale = Math.max(payment, refPayment ?? 0);

  return {
    kind: loan === null ? "cash" : "loan",
    priceText: compactMoney(price, AMOUNT_WORDS),
    downText: compactMoney(down, AMOUNT_WORDS),
    tradeText: tradeIn > 0 ? compactMoney(tradeIn, AMOUNT_WORDS) : null,
    financedText: compactMoney(financed, AMOUNT_WORDS),
    downPercent: of(down, price),
    tradePercent: of(tradeIn, price),
    financedPercent: of(financed, price),
    ghostUpfrontPercent,
    paymentText: loan === null ? null : compactMoney(payment, AMOUNT_WORDS),
    months: loan?.months ?? null,
    interestText: loan === null ? null : compactMoney(loan.totalInterest, AMOUNT_WORDS),
    scaleText: scale > 0 ? compactMoney(scale, AMOUNT_WORDS) : null,
    paymentOfScale: of(payment, scale),
    ghostPaymentPercent: refPayment === null || scale <= 0 ? null : of(refPayment, scale),
  };
}

/** One term of the household month, resolved for `FlowEquation`. */
export type AutoFlowItem = {
  key: "income" | "essentials" | "otherDebts" | "reserve" | "payment" | "running" | "result";
  op: "base" | "minus" | "result";
  label: string;
  /** Rounded; null when NOT KNOWN — shown as `missing`, never as 0. */
  value: string | null;
  missing?: string;
};

/**
 * Board 04: the household month as a subtraction, from the page's OWN ledger
 * (`compareVehicleBudget`) and its OWN verdict (`vehicleBudgetStatus`,
 * unchanged). The car instalment is the engine's; a covered price is a real
 * 0, an unknown instalment is "chưa tính được". Blank essentials are "chưa
 * nhập" and there is then NO remainder. The deposit is not in here: it is
 * purchase money, not a monthly cost.
 */
export type AutoFlowView = {
  /**
   * The page's own verdict, never a new threshold: `caution` is the adapter's
   * `runningExcluded` — a remainder that does not yet include running costs —
   * so green is reserved for a remainder that does.
   */
  state: "surplus" | "caution" | "zero" | "short" | "limited" | "unknown";
  headline: string;
  note: string;
  /** True when running costs are 0: the remainder does not include them. */
  runningExcluded: boolean;
  items: readonly AutoFlowItem[];
};

export function autoFlowView(state: AutoLoanFormState): AutoFlowView {
  const F = L.flow;
  const b = state.budget;
  if (b === null) {
    return { state: "unknown", headline: F.headlineLimited, note: L.blocked.budget, runningExcluded: false, items: [] };
  }
  const r = (value: number) => compactMoney(value, AMOUNT_WORDS);
  const kind = vehicleBudgetStatus(b).kind;
  const view: AutoFlowView["state"] =
    kind === "limited"
      ? "limited"
      : kind === "paymentUnknown" || kind === "unknown"
        ? "unknown"
        : kind === "short" || kind === "shortBefore"
          ? "short"
          : kind === "exactZero"
            ? "zero"
            : kind === "runningExcluded"
              ? "caution"
              : "surplus";
  const withCar = b.withCar;
  const resultValue =
    withCar === null || view === "limited" || view === "unknown"
      ? null
      : view === "zero"
        ? r(0)
        : r(Math.abs(withCar));
  const headline =
    (view === "surplus" || view === "caution") && withCar !== null
      ? fill(F.headlineSurplus, { amount: r(withCar) })
      : view === "zero"
        ? F.headlineZero
        : view === "short" && withCar !== null
          ? fill(F.headlineShort, { amount: r(Math.abs(withCar)) })
          : view === "limited"
            ? F.headlineLimited
            : F.headlineUnknown;
  const note =
    view === "caution"
      ? F.runningExcluded
      : view === "surplus" || view === "zero"
        ? F.noteSurplus
      : view === "short"
        ? F.noteShort
        : view === "limited"
          ? F.noteLimited
          : F.noteUnknown;
  return {
    state: view,
    headline,
    note,
    runningExcluded: b.runningCostsExcluded,
    items: [
      { key: "income", op: "base", label: F.income, value: r(b.netIncome) },
      {
        key: "essentials",
        op: "minus",
        label: F.essentials,
        value: b.essentialExpenses === null ? null : r(b.essentialExpenses),
        missing: F.missingEssentials,
      },
      { key: "otherDebts", op: "minus", label: F.otherDebts, value: r(b.otherDebts) },
      { key: "reserve", op: "minus", label: F.reserve, value: r(b.reserveSaving) },
      {
        key: "payment",
        op: "minus",
        label: F.payment,
        value: b.vehiclePayment === null ? null : r(b.vehiclePayment),
        missing: F.missingPayment,
      },
      { key: "running", op: "minus", label: F.running, value: r(b.vehicleRunningCosts) },
      {
        key: "result",
        op: "result",
        label: view === "short" ? F.resultShort : F.result,
        value: resultValue,
        missing: "—",
      },
    ],
  };
}
