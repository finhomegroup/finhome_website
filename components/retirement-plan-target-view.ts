import { longTermMoney } from "@/components/calc/retirement-fields";
import { growthWords, inputAmount } from "@/components/retirement-plan-input-lines";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import { remedyFor, type LongTermPlan } from "@/lib/calc/long-term-plan";
import { formatMoney, PLACEHOLDER } from "@/lib/calc/number";
import type { RetirementResult } from "@/lib/calc/retirement";
import type { LeverKey } from "@/lib/calc/retirement-levers";
import type { RetirementStatus } from "@/lib/calc/retirement-status";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const T = C.hero.target;

const MILLION = 1_000_000;
const BILLION = 1_000_000_000;
/** From 100 tỷ a figure is read in tỷ; from 100.000 tỷ it is no household's. */
const TY_FROM = 100 * BILLION;
const SHOWN_BELOW = 100_000 * BILLION;

/** The unit and decimals that figures read together share; null for whole đồng. */
type Precision = { unit: number; word: string; dp: number } | null;

function precisionFor(values: readonly number[]): Precision {
  const largest = Math.max(
    0,
    ...values.filter((value) => Math.abs(value) < SHOWN_BELOW).map(Math.abs),
  );
  if (largest >= TY_FROM) return { unit: BILLION, word: L.money.billion, dp: 1 };
  if (largest >= BILLION) return { unit: MILLION, word: L.money.million, dp: 0 };
  if (largest >= MILLION) return { unit: MILLION, word: L.money.million, dp: 1 };
  return null;
}

/**
 * Figures a reader sets side by side — the target's three rows, the month's
 * split — at ONE precision, set by the largest, so they add up as read.
 * `compactMoney` rounds each at its own magnitude: "1,2 tỷ" (to 50 triệu)
 * beside "766,1 triệu" (to 50.000 ₫). From 1 tỷ, whole triệu ("1.152 triệu");
 * from 1 triệu, triệu to 0,1 with a trailing ",0" dropped; below, whole đồng;
 * from 100 tỷ, tỷ to 0,1. An exact 0 is "0 ₫"; a figure too small for the
 * shared precision keeps its own reading rather than rounding to nothing;
 * one no household holds, or not a number, is the placeholder alone.
 */
export function sharedMoney(values: readonly number[]): string[] {
  const at = precisionFor(values);
  return values.map((value) => {
    if (!(Math.abs(value) < SHOWN_BELOW)) return PLACEHOLDER;
    if (value === 0) return T.zero;
    if (at === null) return `${formatMoney(value)} ${L.money.currency}`;
    const scaled = value / at.unit;
    if (Number(scaled.toFixed(at.dp)) === 0) return compactMoney(value, L.money);
    return `${formatMoney(scaled, at.dp).replace(/,0$/, "")} ${at.word}`;
  });
}

/** A figure as a shared precision shows it, back in whole đồng. */
const shownAt = (value: number, at: Precision) =>
  at === null ? Math.round(value) : Math.round(Number((value / at.unit).toFixed(at.dp)) * at.unit);

/**
 * The month's split at one precision, the savings' part the difference of
 * the two figures SHOWN — so "8,4 triệu (4,2 … 4,2 …)" adds up as read, where
 * rounding each part alone could print 4,2 and 4,3.
 */
function monthSplit(spend: number, other: number) {
  const at = precisionFor([spend]);
  const [spendText, otherText, fromSavings] = sharedMoney([
    shownAt(spend, at),
    shownAt(other, at),
    shownAt(spend, at) - shownAt(other, at),
  ]);
  return { spend: spendText, other: otherText, fromSavings };
}

/** The last "Thử mức này": the field, what the reader had, what was tried. */
export type TargetTrial = { key: LeverKey; before: string; after: string };

/**
 * A try holds while its field still reads the tried value. Once the reader
 * moves the field off it, the try is spent — the hero drops it — so moving
 * back to the same figure later brings no undo that would skip what the
 * reader typed in between.
 */
export function heldTrial(
  trial: TargetTrial | null,
  values: Readonly<Record<string, string>>,
): TargetTrial | null {
  return trial !== null && values[trial.key] === trial.after ? trial : null;
}

/*
 * The retirement hero's answer to "how much should I have": the capital the
 * plan needs at retirement, how much of it the plan reaches, and ONE change
 * that closes the gap — which the reader can apply in one press.
 *
 * NO NEW ARITHMETIC. Every figure is the engine's, in today's money: the
 * required and the reached capital and the shortfall (`gap`, read off
 * `requiredRealBalanceAtRetirement`, `realBalanceAtRetirement`,
 * `realBalanceShortfallAtRetirement`), the reached share
 * (`capitalCoveragePercent`), and the three remedies `resolveLongTermPlan`
 * already solves — the contribution that funds the plan, the first funded
 * retirement age, the spend the capital supports. This module only picks
 * one, rounds it to a figure a reader can type, and words it. Two display
 * steps touch no projection: the phở price is an example price times the
 * engine's own deflator (a ratio of two of its figures), and the month's
 * split subtracts the two amounts the reader typed.
 */

/** A one-press suggestion: the field it writes, the raw string, the button's name. */
export type TargetApply = { key: LeverKey; next: string; name: string };

/** One row of the target: a short label, and its figure on the same line. */
export type TargetRow = { label: string; value: string };

export type TargetView = {
  /** Drives the bar and the button; `short` is the only state with a suggestion. */
  kind: "short" | "funded" | "noNeed" | "unavailable";
  /** What the capital pays for, leading into the rows — or, with none, why. */
  basis: string;
  /**
   * Cần có · Dự kiến có · Còn thiếu (or Dư ra): always three, in that order,
   * placeholders with no plan — so the panel keeps its height in every state.
   */
  rows: readonly [TargetRow, TargetRow, TargetRow];
  /** The basket's rice, 0–100; null draws no rice, because nothing is required or known. */
  share: number | null;
  /** More than required: the basket is heaped over its rim. */
  heaped: boolean;
  /** "Theo giá hôm nay", by one bowl of phở; null with no plan. */
  pho: string | null;
  /** How far the plan gets: "đạt 60% mức này — còn thiếu khoảng …". */
  progress: string | null;
  suggestion: string | null;
  /** Null leaves the button inert, labelled `settledLabel`. */
  apply: TargetApply | null;
  settledLabel: string;
};

/**
 * A suggested amount a reader can type and remember: whole 100.000 ₫, rounded
 * UP for what goes in (a contribution) and DOWN for what comes out (a
 * pension), so applying a suggestion can only land on the funded side of the
 * engine's exact answer — never on the boundary, never a hair short.
 */
const SUGGESTION_STEP = 100_000;
export const suggestUp = (value: number) =>
  Math.ceil(value / SUGGESTION_STEP) * SUGGESTION_STEP;
export const suggestDown = (value: number) =>
  Math.floor(value / SUGGESTION_STEP) * SUGGESTION_STEP;

/**
 * The engine's own price rise from today to retirement: the ratio of one
 * requirement (or one balance) in its two readings — the SAME deflator
 * `retirement.ts` uses, never a second one computed here. Null when both
 * readings are zero, so there is nothing to read it off.
 */
function priceFactor(result: RetirementResult): number | null {
  if (result.requiredRealBalanceAtRetirement > 0) {
    return result.requiredBalanceAtRetirement / result.requiredRealBalanceAtRetirement;
  }
  if (result.realBalanceAtRetirement > 0) {
    return result.balanceAtRetirement / result.realBalanceAtRetirement;
  }
  return null;
}

/** A bowl of phở dearer than this is no price a reader can picture. */
const PHO_SHOWN_BELOW = 100_000_000;

/**
 * One bowl of phở today, and the same bowl at retirement. The inflation field
 * may be zero or below it, so the sentence follows the two prices as shown:
 * up, the same, or down — and says nothing when the price is none a reader
 * could picture (under 1.000 ₫, or 100 triệu and up).
 */
function phoLine(plan: LongTermPlan): string | null {
  const today = longTermMoney(T.phoPrice);
  if (plan.input.retirementAge <= plan.input.currentAge) return fill(T.phoToday, { today });
  const factor = priceFactor(plan.asEntered);
  if (factor === null) return null;
  // To the nearest 1.000 ₫: a price, not a ledger figure.
  const price = Math.round((T.phoPrice * factor) / 1000) * 1000;
  if (!(price >= 1000 && price < PHO_SHOWN_BELOW)) return null;
  const words =
    plan.input.inflationPercent === 0
      ? T.phoSame
      : price > T.phoPrice
        ? T.pho
        : price < T.phoPrice
          ? T.phoDown
          : T.phoFlat;
  return fill(words, { today, then: longTermMoney(price), age: plan.input.retirementAge });
}

/**
 * "khoảng 730 triệu": what the plan reaches or misses is an estimate — but
 * "0 ₫" is exactly nothing, and the placeholder is nothing to estimate.
 */
const about = (shown: string) =>
  shown === T.zero || shown === PLACEHOLDER ? shown : fill(T.about, { amount: shown });

/** "khoảng 295%" up to 999%, then "hơn 10 lần" — never a nine-digit percent. */
const progressWords = (percent: number) =>
  Number.isFinite(percent) && percent <= 999 ? fill(T.progress, { percent }) : T.progressMany;

/**
 * Cần có · Dự kiến có · and what is left between them — missing, spare, or
 * nothing — at one shared precision. The last row is read as the difference
 * of the two above, so it IS the difference of the two figures shown: rounded
 * on its own, one state in five with rates other than the defaults read 1
 * triệu off ("1.989 − 143 = 1.847"). It stays within one step of the engine's
 * own shortfall (or of its two figures' difference, when spare), which is why
 * it says "khoảng" — and when rounding would hide a real gap, the gap keeps
 * its own, finer reading instead of "0". On the engine's exact boundary
 * nothing is left either way; with nothing required, all of it is spare.
 */
function rowsFor(
  plan: LongTermPlan,
  { boundary = false, noNeed = false } = {},
): readonly [TargetRow, TargetRow, TargetRow] {
  const { gap, input } = plan;
  const required = noNeed ? 0 : gap.realBalanceRequired;
  const reachedValue = gap.realBalanceReached;
  const surplus = Math.max(0, reachedValue - required);
  const short = !boundary && !noNeed && gap.realShortfall > 0;
  const spare = !boundary && !short && surplus > 0;
  const exact = short ? gap.realShortfall : spare ? surplus : 0;
  const at = precisionFor([required, reachedValue, exact]);
  const shownGap = Math.abs(shownAt(required, at) - shownAt(reachedValue, at));
  const rest = !short && !spare ? 0 : shownGap > 0 ? shownGap : exact;
  const [need, reached, restText] = sharedMoney([required, reachedValue, rest]);
  return [
    { label: fill(T.rows.required, { age: input.retirementAge }), value: need },
    { label: T.rows.reached, value: about(reached) },
    { label: spare ? T.rows.surplus : T.rows.short, value: about(restText) },
  ];
}

/**
 * The first of the engine's three remedies that is available, in its own
 * order — save more, retire later, spend less — as one press.
 */
function suggestionFor(plan: LongTermPlan): { text: string; apply: TargetApply } | null {
  const contribute = remedyFor(plan.gap, "contribute");
  if (
    contribute.key === "contribute" &&
    contribute.available &&
    contribute.annualContribution !== null
  ) {
    // Suggested per MONTH, the way a salaried reader budgets: the engine's
    // first-year contribution ÷ 12, rounded up to 100.000 ₫, then × 12 for
    // the yearly field — so "2,3 triệu/tháng" is exactly what gets typed.
    const monthly = suggestUp(contribute.annualContribution / 12);
    const yearly = monthly * 12;
    const growth = plan.input.contributionGrowthPercent;
    return {
      // The engine's contribution is the FIRST year's, growing as entered.
      text: fill(growth === 0 ? T.suggest.contributeFlat : T.suggest.contribute, {
        amount: inputAmount(yearly),
        monthly: inputAmount(monthly),
        growthEach: growthWords(growth).each,
      }),
      apply: {
        key: "annualContribution",
        next: formatMoney(yearly, 0),
        name: fill(T.applyName.contribute, { amount: longTermMoney(yearly) }),
      },
    };
  }

  const later = remedyFor(plan.gap, "retireLater");
  if (
    later.key === "retireLater" &&
    later.available &&
    later.retirementAge !== null &&
    later.retirementAge > plan.input.retirementAge
  ) {
    return {
      text: fill(T.suggest.retireLater, { age: later.retirementAge }),
      apply: {
        key: "retirementAge",
        next: String(later.retirementAge),
        name: fill(T.applyName.retireLater, { age: later.retirementAge }),
      },
    };
  }

  const less = remedyFor(plan.gap, "spendLess");
  if (less.key === "spendLess" && less.available && less.annualSpending !== null) {
    // The engine's spend is per year and includes other income; the field is
    // the pension per month, so the suggestion is too.
    const monthly = suggestDown(less.annualSpending / 12);
    if (monthly > 0) {
      return {
        text: fill(T.suggest.spendLess, { amount: inputAmount(monthly) }),
        apply: {
          key: "desiredMonthlySpending",
          next: formatMoney(monthly, 0),
          name: fill(T.applyName.spendLess, { amount: longTermMoney(monthly) }),
        },
      };
    }
  }
  return null;
}

export function targetView(plan: LongTermPlan | null, status: RetirementStatus): TargetView {
  if (plan === null || status.kind === "unknown") {
    return {
      kind: "unavailable",
      basis: T.unavailable,
      rows: [
        { label: T.rows.requiredUnknown, value: PLACEHOLDER },
        { label: T.rows.reached, value: PLACEHOLDER },
        { label: T.rows.short, value: PLACEHOLDER },
      ],
      share: null,
      heaped: false,
      pho: null,
      progress: null,
      suggestion: null,
      apply: null,
      settledLabel: T.settled.none,
    };
  }

  const { input, gap } = plan;
  const spend = inputAmount(input.desiredAnnualSpending / 12);
  const other = inputAmount(input.otherAnnualIncome / 12);

  // Nothing is required: other income covers the spend, or nothing is spent.
  // The engine's coverage is null then, which is not 100% and is not drawn.
  if (gap.coveragePercent === null) {
    return {
      kind: "noNeed",
      basis:
        input.desiredAnnualSpending > 0
          ? fill(T.noNeedOther, { other, spend })
          : T.noNeedSpend,
      rows: rowsFor(plan, { noNeed: true }),
      share: null,
      heaped: false,
      pho: phoLine(plan),
      progress: null,
      suggestion: null,
      apply: null,
      settledLabel: T.settled.funded,
    };
  }

  const boundary = status.kind === "exactBoundary";
  const rows = rowsFor(plan, { boundary });
  // What this capital pays each month: the spend other income leaves.
  const month = monthSplit(input.desiredAnnualSpending / 12, input.otherAnnualIncome / 12);
  const basis = fill(input.otherAnnualIncome > 0 ? T.basisWithOther : T.basis, {
    ...month,
    endAge: input.endAge,
  });

  if (status.kind === "depleted") {
    // Floored, and never 100%: a short plan must not read as a full one.
    const percent = Math.min(99, Math.floor(gap.coveragePercent));
    const found = suggestionFor(plan);
    return {
      kind: "short",
      basis,
      rows,
      share: percent,
      heaped: false,
      pho: phoLine(plan),
      progress: progressWords(percent),
      suggestion: found?.text ?? T.suggest.none,
      apply: found?.apply ?? null,
      settledLabel: T.settled.none,
    };
  }

  // Funded — with room to spare, or exactly at the boundary.
  const percent = Math.max(100, Math.floor(gap.coveragePercent));
  return {
    kind: "funded",
    basis,
    rows,
    share: 100,
    heaped: !boundary && percent > 100,
    pho: phoLine(plan),
    progress: boundary ? T.progressBoundary : progressWords(percent),
    suggestion: boundary ? T.boundaryNote : T.fundedNote,
    apply: null,
    settledLabel: T.settled.funded,
  };
}
