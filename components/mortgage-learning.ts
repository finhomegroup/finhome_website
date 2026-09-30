/*
 * /cong-cu/vay-mua-nha/'s learning panel (A2, 2026-09-28) — the pure half.
 *
 * NO NEW ARITHMETIC. The month split is one row of `computeLoan`'s own
 * `schedule`; the impact of a press is the difference of two real results —
 * the one on screen when the button was pressed and the one on screen now.
 * `lib/calc/loan.ts` is not touched and nothing here predicts.
 *
 * WHAT A SCHEDULE ROW IS. `payment = interest + principal`, and `principal`
 * ALREADY INCLUDES any extra payment (see `amortize`). So the split never adds
 * `monthlyExtra` again, and it never includes escrow or PMI — those are not
 * in the row, and the copy says so beside the split.
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
import { MORTGAGE_LEARNING as L } from "@/content/calculators/mortgage-learning";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import type { LoanResult } from "@/lib/calc/loan";
import { formatDecimal, formatMoney, parseDecimal } from "@/lib/calc/number";

export type MortgageTrialKey = "term" | "extra";
export const MORTGAGE_TRIAL_KEYS: readonly MortgageTrialKey[] = ["term", "extra"];
export type MortgageTrial = Trial<MortgageTrialKey, LoanResult>;

/** +1 triệu to the monthly extra payment. */
export const EXTRA_STEP = 1_000_000;

/**
 * The term step IN THE UNIT THE READER CHOSE: +5 when the term is in years,
 * +60 when it is in months. Anything but "years" is months, exactly as the
 * page reads `termUnit`.
 */
export function termStep(termUnit: string): number {
  return termUnit === "years" ? 5 : 60;
}

/** The button's label, naming the step in the reader's unit. */
export function termTrialLabel(termUnit: string): string {
  return fill(L.trials.term.label, {
    step: termUnit === "years" ? L.termStepYears : L.termStepMonths,
  });
}

/** The field's next raw string, or null when a press cannot write one. */
export function nextMortgageValue(key: MortgageTrialKey, values: FormValues): string | null {
  const raw = values[key];
  if (raw === undefined) return null;
  return key === "term" ? stepDecimal(raw, termStep(values.termUnit ?? "")) : stepMoney(raw, EXTRA_STEP);
}

/**
 * A term press must land inside the site's 1 … 1.200-month support range —
 * the same bound the page's own validation applies — or it is not offered.
 */
export function termStepSupported(values: FormValues): boolean {
  const next = nextMortgageValue("term", values);
  return next !== null && termMonthsSupported(derivedTermMonths(parseDecimal(next), values.termUnit ?? ""));
}

/**
 * Whether a press may run. Every press is off while the page has no result —
 * any field invalid, a blank extra included: a blank is not read as 0.
 */
export function mortgageAvailability(
  key: MortgageTrialKey,
  values: FormValues,
  result: LoanResult | null,
): TrialAvailability {
  if (result === null) return { enabled: false, reason: L.blocked.invalid };
  if (nextMortgageValue(key, values) === null) {
    return { enabled: false, reason: L.blocked.unrepresentable };
  }
  if (key === "term" && !termStepSupported(values)) {
    return { enabled: false, reason: L.blocked.termMax };
  }
  return { enabled: true };
}

/** The press itself, or null when it is not available. */
export function makeMortgageTrial({
  key,
  values,
  revision,
  result,
}: {
  key: MortgageTrialKey;
  values: FormValues;
  revision: number;
  result: LoanResult | null;
}): MortgageTrial | null {
  if (result === null || !mortgageAvailability(key, values, result).enabled) return null;
  const next = nextMortgageValue(key, values);
  if (next === null) return null;
  return {
    key,
    revision,
    before: { ...values },
    after: { ...values, [key]: next },
    beforeResult: result,
    beforeLabel: "",
  };
}

/** A month the schedule actually has: 1 … `months`, whatever was selected. */
export function clampMonth(selected: number, months: number): number {
  if (!Number.isFinite(selected) || months < 1) return 1;
  return Math.min(Math.max(1, Math.round(selected)), months);
}

/** One month of the ACTUAL schedule, as the panel reads it. */
export type MonthSplitView = {
  month: number;
  months: number;
  payment: string;
  principal: string;
  interest: string;
  balance: string;
  /** Principal's share of the row's payment, 0–100. */
  principalPercent: number;
  interestPercent: number;
  /** True when the row's principal includes the borrower's extra payment. */
  extraIncluded: boolean;
  reading: string;
};

const money = (figure: number) => `${formatMoney(figure)} ₫`;

export function monthSplit(result: LoanResult | null, selected: number): MonthSplitView | null {
  if (result === null || result.schedule.length === 0) return null;
  const months = result.schedule.length;
  const month = clampMonth(selected, months);
  const row = result.schedule[month - 1];
  const principalPercent = row.payment > 0 ? (row.principal / row.payment) * 100 : 0;
  const interestPercent = row.payment > 0 ? (row.interest / row.payment) * 100 : 0;
  return {
    month,
    months,
    payment: money(row.payment),
    principal: money(row.principal),
    interest: money(row.interest),
    balance: money(row.balance),
    principalPercent,
    interestPercent,
    extraIncluded: result.monthlyExtra > 0,
    reading:
      row.interest === 0
        ? fill(L.month.readingNoInterest, { month })
        : fill(L.month.reading, {
            month,
            principalShare: formatDecimal(principalPercent, 0),
          }),
  };
}

/** The first ACTUAL payment: the schedule's first row, never a "full month". */
export const firstPayment = (result: LoanResult) => result.schedule[0]?.payment ?? 0;

/** One month of the schedule, with the axes the ruler draws it on. Every figure is a schedule row's. */
export type MortgageSceneView = {
  split: MonthSplitView;
  /** Year of the loan (1-based) the selected month falls in. */
  year: number;
  /** Opening principal: the named axis of the debt mark. */
  opening: number;
  openingText: string;
  balanceText: string;
  /**
   * The debt BEFORE this month's payment, exact đồng: the row's closing
   * balance plus the principal it repaid. That principal already includes
   * any extra payment, so extra is never added a second time. With
   * `split.principal` and `split.balance` it makes the month's equation:
   * debt before − principal = debt after. Interest is not in it.
   */
  debtBefore: string;
  /** Balance after the month, as a share of the opening principal. */
  balancePercent: number;
  /** Where the balance stood at the same month before the latest press. */
  ghostBalancePercent: number | null;
  /**
   * Set when the selected month is PAST the reference loan's own payoff —
   * e.g. month 300 after a 240 → 300 extension. Then the reference had no
   * payment and no debt that month: no ghost is drawn, and the copy says the
   * earlier loan was already paid off in this month number.
   */
  referencePaidOffMonth: number | null;
  /** Months elapsed as a share of the actual payoff length. */
  elapsedPercent: number;
  /** The largest payment in this or the reference schedule: the payment axis. */
  scale: number;
  scaleText: string;
  paymentText: string;
  principalText: string;
  interestText: string;
  /** This month's principal and interest on the payment axis. */
  principalOfScale: number;
  interestOfScale: number;
  /** The same month's payment before the latest press, on the same axis. */
  ghostPaymentPercent: number | null;
};

const maxPayment = (result: LoanResult) =>
  result.schedule.reduce((max, row) => Math.max(max, row.payment), 0);

/**
 * The scene for `selected` on `result`, and — while a press holds — the
 * reference result from before it, so the marks move on a STABLE axis rather
 * than re-normalising to 100%. After the reference has paid off, its old
 * payment is not recycled; the scene names that payoff instead. Null without
 * a result: no numeric scene is drawn then.
 */
export function mortgageScene(
  result: LoanResult | null,
  selected: number,
  reference: LoanResult | null,
): MortgageSceneView | null {
  const split = monthSplit(result, selected);
  if (result === null || split === null) return null;
  const row = result.schedule[split.month - 1];
  // Opening principal: the first closing balance plus the principal it repaid.
  const opening = result.schedule[0].balance + result.schedule[0].principal;
  const scale = Math.max(maxPayment(result), reference ? maxPayment(reference) : 0);
  const of = (value: number, axis: number) => (axis > 0 ? (value / axis) * 100 : 0);
  // The SAME month of the reference schedule, never a clamped one: past its
  // payoff there is no row, and recycling its last payment would compare two
  // different months.
  const refPaidOff = reference !== null && split.month > reference.schedule.length;
  const refRow =
    reference === null || refPaidOff
      ? null
      : reference.schedule[split.month - 1] ?? null;
  const refOpening =
    reference === null ? null : reference.schedule[0].balance + reference.schedule[0].principal;
  return {
    split,
    year: Math.floor((split.month - 1) / 12) + 1,
    opening,
    openingText: compactMoney(opening, AMOUNT_WORDS),
    balanceText: compactMoney(row.balance, AMOUNT_WORDS),
    debtBefore: money(row.balance + row.principal),
    balancePercent: of(row.balance, opening),
    // Same opening principal before and after a term or extra press; if a
    // reference ever had another, its ghost would mislead, so none is drawn.
    ghostBalancePercent:
      refRow !== null && refOpening !== null && same(refOpening, opening)
        ? of(refRow.balance, opening)
        : null,
    referencePaidOffMonth: refPaidOff ? reference!.schedule.length : null,
    elapsedPercent: of(split.month, split.months),
    scale,
    scaleText: compactMoney(scale, AMOUNT_WORDS),
    paymentText: compactMoney(row.payment, AMOUNT_WORDS),
    principalText: compactMoney(row.principal, AMOUNT_WORDS),
    interestText: compactMoney(row.interest, AMOUNT_WORDS),
    principalOfScale: of(row.principal, scale),
    interestOfScale: of(row.interest, scale),
    ghostPaymentPercent: refRow === null ? null : of(refRow.payment, scale),
  };
}

export type MortgageImpactView = {
  key: MortgageTrialKey;
  fieldLine: string;
  paymentLine: string;
  interestLine: string;
  monthsLine: string;
  bars: readonly PairBar[];
  exact: readonly { label: string; before: string; after: string }[];
  why: string;
  lesson: string;
  question: string;
  /**
   * Board 03: the two payoff lengths on ONE month axis (0 → the longer), and
   * the difference named. Months are the engine's `months`, never estimated.
   */
  timeline: {
    before: number;
    after: number;
    axisMax: number;
    beforeText: string;
    afterText: string;
    delta: string;
  };
  /** Board 03: the rounded before/after the reader compares; exact đồng stay in `exact`. */
  compare: readonly { key: "payment" | "interest"; label: string; before: string; after: string }[];
};

/** Two figures equal for the reader: within half a đồng. */
const same = (a: number, b: number) => Math.abs(a - b) < 0.5;

function fieldText(key: MortgageTrialKey, values: FormValues, unitWords: { years: string; months: string }) {
  return key === "term"
    ? `${values.term} ${values.termUnit === "years" ? unitWords.years : unitWords.months}`
    : `${values.extra} ₫`;
}

/** Why the press did what it did, from the two results' own figures. */
export function mortgageWhy(key: MortgageTrialKey, before: LoanResult, after: LoanResult): string {
  const payBefore = firstPayment(before);
  const payAfter = firstPayment(after);
  const noInterest = before.totalInterest === 0 && after.totalInterest === 0;
  if (
    same(payBefore, payAfter) &&
    same(before.totalInterest, after.totalInterest) &&
    before.months === after.months
  ) {
    return L.why.unchanged;
  }
  if (key === "term") {
    if (noInterest && payAfter < payBefore) return L.why.termNoInterest;
    if (payAfter < payBefore && after.totalInterest > before.totalInterest) {
      return fill(L.why.termLonger, {
        payment: compactMoney(payBefore - payAfter, AMOUNT_WORDS),
        interest: compactMoney(after.totalInterest - before.totalInterest, AMOUNT_WORDS),
      });
    }
    return L.why.changedOther;
  }
  const monthsSooner = before.months - after.months;
  if (noInterest && monthsSooner > 0) {
    return fill(L.why.extraNoInterest, { months: formatDecimal(monthsSooner, 0) });
  }
  if (monthsSooner > 0 && after.totalInterest < before.totalInterest && payAfter > payBefore) {
    return fill(L.why.extraSooner, {
      months: formatDecimal(monthsSooner, 0),
      interest: compactMoney(before.totalInterest - after.totalInterest, AMOUNT_WORDS),
      payment: compactMoney(payAfter - payBefore, AMOUNT_WORDS),
    });
  }
  return L.why.changedOther;
}

/**
 * The latest press against the result on screen now. Because the press
 * holds, `after` IS the result for `trial.after`.
 */
export function mortgageImpactView(
  trial: MortgageTrial,
  after: LoanResult,
  unitWords: { years: string; months: string },
): MortgageImpactView {
  const before = trial.beforeResult;
  const I = L.impact;
  const [payB, payA] = compactMoneyPair(firstPayment(before), firstPayment(after), AMOUNT_WORDS);
  const [intB, intA] = compactMoneyPair(before.totalInterest, after.totalInterest, AMOUNT_WORDS);
  const months = (n: number) => `${formatDecimal(n, 0)} ${I.monthsUnit}`;
  return {
    key: trial.key,
    fieldLine: fill(I.fieldLine, {
      field: L.trials[trial.key].field,
      before: fieldText(trial.key, trial.before, unitWords),
      after: fieldText(trial.key, trial.after, unitWords),
    }),
    paymentLine: fill(I.paymentLine, { before: payB, after: payA }),
    interestLine: fill(I.interestLine, { before: intB, after: intA }),
    monthsLine: fill(I.monthsLine, {
      before: formatDecimal(before.months, 0),
      after: formatDecimal(after.months, 0),
    }),
    bars: pairBars(
      before.totalInterest,
      after.totalInterest,
      { before: I.barBefore, after: I.barAfter },
      AMOUNT_WORDS,
    ),
    exact: [
      {
        label: L.trials[trial.key].field,
        before: fieldText(trial.key, trial.before, unitWords),
        after: fieldText(trial.key, trial.after, unitWords),
      },
      { label: I.exactPayment, before: money(firstPayment(before)), after: money(firstPayment(after)) },
      { label: I.exactInterest, before: money(before.totalInterest), after: money(after.totalInterest) },
      { label: I.exactMonths, before: months(before.months), after: months(after.months) },
    ],
    why: mortgageWhy(trial.key, before, after),
    lesson: L.trials[trial.key].lesson,
    question: L.trials[trial.key].question,
    timeline: {
      before: before.months,
      after: after.months,
      axisMax: Math.max(before.months, after.months),
      beforeText: months(before.months),
      afterText: months(after.months),
      delta:
        after.months < before.months
          ? fill(I.deltaSooner, { months: formatDecimal(before.months - after.months, 0) })
          : after.months > before.months
            ? fill(I.deltaLater, { months: formatDecimal(after.months - before.months, 0) })
            : I.deltaSame,
    },
    compare: [
      { key: "payment", label: I.compareFirst, before: payB, after: payA },
      { key: "interest", label: I.compareInterest, before: intB, after: intA },
    ],
  };
}

/*
 * "Thước tháng" — the monthly payment ruler (2026-09-28). It shows ONE
 * month's loop, read off ONE schedule row:
 *
 *   debt before → interest measured on it → payment − interest = principal
 *   → debt after → the next row's interest, measured on that.
 *
 * Every figure is a schedule row's (or the next row's). The monthly rate is
 * READ BACK from the row — interest ÷ debt before — and shown as an
 * approximation; no rate is recomputed and no formula is added.
 */

/** Millions with a grouped whole part: 1996810202 → "1.996,8 triệu". */
const millions = (figure: number, dp: number) => `${formatMoney(figure / 1e6, dp)} triệu`;
/** A small amount stays in đồng rather than rounding to 0,00 triệu. */
const small = (figure: number) =>
  Math.abs(figure) < 1e6 ? `${formatMoney(figure)} ₫` : millions(figure, 2);

/** An interest compared with the reference's same row: which way, by how much. */
export type InterestComparison = { kind: "same" | "lower" | "higher"; amount: string };

export type MortgageRulerView = {
  /** The existing scene view: the split, the ghost, the reference payoff. */
  scene: MortgageSceneView;
  method: LoanResult["method"];
  month: number;
  months: number;
  /** The schedule's last row: the payment may be smaller, no next month. */
  isFinal: boolean;
  /** Debt stock, before and after this month, on the opening principal. */
  debtBeforeText: string;
  debtAfterText: string;
  debtAfterPercent: number;
  /** The true-scale cut this month's principal makes in the debt rail. */
  principalCutPercent: number;
  /** Interest ÷ debt before, in percent: an approximation of the row's rate. */
  monthlyRateText: string;
  /** This month's flow, on the payment axis (`scene.scale`). */
  paymentText: string;
  interestText: string;
  principalText: string;
  /** Principal without the extra part, and the extra part (0 without extra). */
  regularPrincipalText: string;
  extraPrincipalText: string | null;
  interestOfScale: number;
  regularOfScale: number;
  extraOfScale: number;
  /**
   * Board 02: the SAME three parts as shares of THIS month's payment (the
   * bar's named whole), summing to 100. Labelled "%" and rounded to one
   * decimal; the đồng behind them are the texts above.
   */
  shares: { principal: number; extra: number; interest: number };
  shareTexts: { principal: string; extra: string | null; interest: string };
  /** The next row's interest, measured on this month's debt after. */
  nextInterestText: string | null;
  /** While a press holds: this month's and next month's interest vs before. */
  interestVsReference: { now: InterestComparison | null; next: InterestComparison | null } | null;
  /** Exact đồng for the collapsed detail: the month's equation holds here. */
  exact: {
    debtBefore: string;
    interest: string;
    principal: string;
    extraPrincipal: string | null;
    payment: string;
    debtAfter: string;
  };
};

/**
 * The ruler for `selected` on `result`, against the result before the latest
 * press (or null). Null without a result: no stale figure is drawn then.
 */
export function mortgageRuler(
  result: LoanResult | null,
  selected: number,
  reference: LoanResult | null,
): MortgageRulerView | null {
  const scene = mortgageScene(result, selected, reference);
  if (result === null || scene === null) return null;
  const { split } = scene;
  const row = result.schedule[split.month - 1];
  const next = result.schedule[split.month] ?? null;
  const before = row.balance + row.principal;
  // SCHEDULED principal first, extra only as the residual. The scheduled part
  // is read off engine data, never re-amortized:
  // - annuity: the level instalment (`monthlyPrincipalInterest`) less THIS
  //   row's interest;
  // - flat principal: the constant slice = the first scheduled payment
  //   (`monthlyPrincipalInterest`) less the first row's interest, which is on
  //   the opening balance with or without extra.
  // Capped at the row's principal: a final row the scheduled instalment
  // already covers shows NO extra, and regular + extra is the principal.
  const scheduledPrincipal = Math.max(
    0,
    result.method === "flatPrincipal"
      ? result.monthlyPrincipalInterest - result.schedule[0].interest
      : result.monthlyPrincipalInterest - row.interest,
  );
  const regular = Math.min(scheduledPrincipal, row.principal);
  const residual = Math.max(0, row.principal - regular);
  // Bounded by the extra actually chosen; any float remainder stays regular.
  const extra = same(residual, 0) ? 0 : Math.min(residual, result.monthlyExtra);
  const regularShown = row.principal - extra;
  const of = (value: number, axis: number) => (axis > 0 ? (value / axis) * 100 : 0);

  const delta = (now: number | undefined, then: number | undefined) =>
    now === undefined || then === undefined ? null : then - now;
  const describe = (d: number | null): InterestComparison | null =>
    d === null
      ? null
      : same(d, 0)
        ? { kind: "same", amount: small(0) }
        : { kind: d > 0 ? "lower" : "higher", amount: small(Math.abs(d)) };
  const refRow =
    reference === null || scene.referencePaidOffMonth !== null
      ? null
      : reference.schedule[split.month - 1] ?? null;
  const refNext = reference === null ? null : reference.schedule[split.month] ?? null;

  return {
    scene,
    method: result.method,
    month: split.month,
    months: split.months,
    isFinal: next === null,
    debtBeforeText: millions(before, 1),
    debtAfterText: millions(row.balance, 1),
    debtAfterPercent: of(row.balance, scene.opening),
    principalCutPercent: of(row.principal, scene.opening),
    monthlyRateText: before > 0 ? `${formatDecimal((row.interest / before) * 100, 3)}%` : "0%",
    paymentText: small(row.payment),
    interestText: small(row.interest),
    principalText: small(row.principal),
    regularPrincipalText: small(regularShown),
    extraPrincipalText: extra > 0 ? small(extra) : null,
    interestOfScale: of(row.interest, scene.scale),
    regularOfScale: of(regularShown, scene.scale),
    extraOfScale: of(extra, scene.scale),
    shares: {
      principal: of(regularShown, row.payment),
      extra: of(extra, row.payment),
      interest: of(row.interest, row.payment),
    },
    shareTexts: {
      principal: `${formatDecimal(of(regularShown, row.payment), 1)}%`,
      extra: extra > 0 ? `${formatDecimal(of(extra, row.payment), 1)}%` : null,
      interest: `${formatDecimal(of(row.interest, row.payment), 1)}%`,
    },
    nextInterestText: next === null ? null : small(next.interest),
    interestVsReference:
      reference === null
        ? null
        : {
            now: refRow === null ? null : describe(delta(row.interest, refRow.interest)),
            next: next === null || refNext === null ? null : describe(delta(next.interest, refNext.interest)),
          },
    exact: {
      debtBefore: money(before),
      interest: money(row.interest),
      principal: money(row.principal),
      extraPrincipal: extra > 0 ? money(extra) : null,
      payment: money(row.payment),
      debtAfter: money(row.balance),
    },
  };
}
