import { displayable } from "@/components/calc/accumulation";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import { AFFORDABILITY_LEARNING as L } from "@/content/calculators/affordability-learning";
import type { AffordabilityInput, AffordabilityResult } from "@/lib/calc/affordability";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import { formatMoney, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";
import { atLedgerZero } from "@/lib/calc/result-status";

/*
 * /cong-cu/kha-nang-mua-nha/'s "Thử một thay đổi" — the 2026-09-28
 * interactive-education pilot, after the retirement hero's try → impact →
 * why → undo.
 *
 * Pure: no React, no DOM. The panel and the calculator hold the state; this
 * decides what a press writes, whether it may, and what it did.
 *
 * NO NEW ARITHMETIC. A press writes ONE field's next raw string through the
 * same binding a keystroke uses, and the page recomputes with
 * `computeAffordability` as ever. The impact is the difference of two real
 * results — the one on screen when the button was pressed, and the one on
 * screen now — so it cannot disagree with the rows. Nothing here predicts.
 *
 * A TRY IS TIED TO ONE REVISION OF THE FORM. It records every raw value
 * before and after, and the manual-edit revision it was made at. It holds
 * only while the form still reads exactly its `after` AND no manual edit has
 * happened since — so a keystroke, a mode switch or a reset retires it, and
 * typing back the same figure later cannot resurrect it or let its undo
 * overwrite what was typed in between.
 */

/** The raw strings of the form, as `useCalcFields` holds them. */
export type FormValues = Readonly<Record<string, string>>;

/** The two one-field tries, by the form key each writes. */
export type TrialKey = "reserve" | "rate";
export const TRIAL_KEYS: readonly TrialKey[] = ["reserve", "rate"];

/** +50 triệu to the reserve kept back. */
export const RESERVE_STEP = 50_000_000;
/** +1 percentage point to the annual rate. */
export const RATE_STEP = 1;

/** A stable key for a set of field values. */
export const valuesKey = (values: FormValues) =>
  JSON.stringify(Object.keys(values).sort().map((key) => [key, values[key]]));

/** Decimal places the reader typed after the decimal mark. */
function typedDecimals(raw: string, mark: RegExp): number {
  const match = raw.trim().match(mark);
  return match ? match[1].length : 0;
}

/**
 * The most decimal places a press keeps. `parseDecimal` accepts any number
 * of them, but `toFixed` throws above 100 and a float carries ~15 significant
 * digits, so beyond this a press could not add its step exactly.
 */
export const MAX_TRIAL_DECIMALS = 10;

/**
 * The field's next raw string, formatted the way the control shows it:
 * money grouped with dots ("50.000.000"), a rate with a comma ("9,5") at
 * the precision the reader typed.
 *
 * NULL rather than a wrong figure when: the value does not parse; it has more
 * than `MAX_TRIAL_DECIMALS` decimals; the sum is not finite; or the written
 * string does not parse back to a value that actually moved — a figure so
 * large that adding the step leaves it unchanged, or past what the money
 * formatter will print.
 */
export function nextTrialValue(key: TrialKey, raw: string): string | null {
  const reserve = key === "reserve";
  const value = reserve ? parseMoney(raw) : parseDecimal(raw);
  if (value === null || !Number.isFinite(value)) return null;
  const dp = typedDecimals(raw, reserve ? /,(\d*)$/ : /[.,](\d*)$/);
  if (dp > MAX_TRIAL_DECIMALS) return null;
  const sum = value + (reserve ? RESERVE_STEP : RATE_STEP);
  if (!Number.isFinite(sum) || sum === value) return null;
  const next = reserve ? formatMoney(sum, dp) : sum.toFixed(dp).replace(".", ",");
  const back = reserve ? parseMoney(next) : parseDecimal(next);
  return back === null || back === value ? null : next;
}

/** What the page knows when it asks whether a press is possible. */
export type TrialFacts = {
  /** Every field reads as a number the engine accepts. */
  usable: boolean;
  /** A non-blank target price that is not a positive price. */
  targetInvalid: boolean;
  /** Household mode with the essentials left blank. */
  limited: boolean;
  /** The parsed cash and reserve, when they parse. */
  down: number | null;
  reserve: number | null;
  /** The raw strings a press would add to, so an unrepresentable one says why. */
  raw?: Partial<Record<TrialKey, string>>;
  /**
   * The whole-tool limit's reason (`affordabilityLimit`): every field is
   * valid but the figures cannot be shown or computed, so no press can be
   * read. Null or absent otherwise — and always on `nha-o-xa-hoi`.
   */
  unsupported?: string | null;
};

/** Whether a press may run, and the plain reason when it may not. */
export type TrialAvailability = { enabled: true } | { enabled: false; reason: string };

/** The reason EVERY press is off, if there is one — said once for both. */
export function sharedBlock(facts: TrialFacts): string | null {
  // First: a limit is not an input error, so "có ô lỗi" would blame nothing.
  if (facts.unsupported) return facts.unsupported;
  if (!facts.usable) return L.blocked.invalid;
  if (facts.targetInvalid) return L.blocked.targetInvalid;
  if (facts.limited) return L.blocked.limited;
  return null;
}

export function trialAvailability(key: TrialKey, facts: TrialFacts): TrialAvailability {
  const shared = sharedBlock(facts);
  if (shared !== null) return { enabled: false, reason: shared };
  if (key === "reserve") {
    // The reserve never silently exceeds the cash: the engine would floor
    // the usable cash at 0 and the reader would see a reserve they do not have.
    const left = (facts.down ?? 0) - (facts.reserve ?? 0);
    if (left <= 0) return { enabled: false, reason: L.blocked.reserveAllKept };
    if (left < RESERVE_STEP) {
      return {
        enabled: false,
        reason: fill(L.blocked.reserveOverCash, { left: money(left) }),
      };
    }
  }
  const raw = facts.raw?.[key];
  if (raw !== undefined) {
    // A press may never write a value the page could not print: the rate
    // has no money formatter of its own to refuse it, so check it here.
    const next = nextTrialValue(key, raw);
    const written = next === null ? null : key === "reserve" ? parseMoney(next) : parseDecimal(next);
    if (written === null || !displayable([written])) {
      return { enabled: false, reason: L.blocked.unrepresentable };
    }
  }
  return { enabled: true };
}

/** One press, and everything needed to show and take it back. */
export type AffordabilityTrial = {
  key: TrialKey;
  /** The manual-edit revision the press was made at. */
  revision: number;
  before: FormValues;
  after: FormValues;
  /** The result on screen when the button was pressed. */
  beforeResult: AffordabilityResult;
  /** The card's word then, so a change of verdict can be named. */
  beforeLabel: string;
};

/** The tries in force, oldest first, and the form's manual-edit revision. */
export type LearningState = {
  revision: number;
  trials: readonly AffordabilityTrial[];
};

export const INITIAL_LEARNING: LearningState = { revision: 0, trials: [] };

export type LearningAction =
  /** A keystroke, a mode switch — anything the reader typed. */
  | { type: "edit" }
  /** "Về ví dụ mẫu". */
  | { type: "reset" }
  | { type: "apply"; trial: AffordabilityTrial }
  | { type: "undo" };

/**
 * A manual edit or reset retires EVERY try, even one that types the same
 * figure back: the revision moves, so nothing made before it can hold again.
 * A press stacks on the tries still in force; an undo takes back the latest.
 */
export function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case "edit":
    case "reset":
      return { revision: state.revision + 1, trials: [] };
    case "apply": {
      if (action.trial.revision !== state.revision) return state;
      // Stack only onto a chain this press continues; anything else is a
      // stale record whose undo must never run.
      const latest = state.trials.at(-1);
      const continues =
        latest !== undefined && valuesKey(latest.after) === valuesKey(action.trial.before);
      return { ...state, trials: [...(continues ? state.trials : []), action.trial] };
    }
    case "undo":
      return state.trials.length === 0
        ? state
        : { ...state, trials: state.trials.slice(0, -1) };
  }
}

/**
 * The tries that still describe the form on screen: all of them while the
 * latest was made at this revision and the form reads exactly its `after`,
 * none otherwise. Each try's `before` is the previous one's `after`, so the
 * latest holding means the whole chain does.
 */
export function heldTrials(
  state: LearningState,
  values: FormValues,
): readonly AffordabilityTrial[] {
  const latest = state.trials.at(-1);
  if (latest === undefined) return [];
  return latest.revision === state.revision &&
    valuesKey(latest.after) === valuesKey(values)
    ? state.trials
    : [];
}

/**
 * The press itself: the form values after it, and the record of it. Null
 * when the press is not available or the field does not parse.
 */
export function makeTrial({
  key,
  values,
  facts,
  revision,
  result,
  label,
}: {
  key: TrialKey;
  values: FormValues;
  facts: TrialFacts;
  revision: number;
  result: AffordabilityResult | null;
  label: string;
}): AffordabilityTrial | null {
  if (result === null || !trialAvailability(key, facts).enabled) return null;
  const raw = values[key];
  if (raw === undefined) return null;
  const next = nextTrialValue(key, raw);
  if (next === null) return null;
  return {
    key,
    revision,
    before: { ...values },
    after: { ...values, [key]: next },
    beforeResult: result,
    beforeLabel: label,
  };
}

/** Full đồng with the currency mark, as the result rows show it. */
const money = (figure: number) => `${formatMoney(figure)} ₫`;
/** Rounded to triệu/tỷ, as the suite's charts and sentences read. */
const rounded = (figure: number) => compactMoney(figure, CHART_UI.money);

/** A field's raw string as its control shows it, with the control's unit. */
function fieldText(key: TrialKey, raw: string): string {
  return key === "reserve" ? `${raw} ${C.form.reserveUnit}` : `${raw}${C.form.rateUnit}`;
}

const bindingWord = (result: AffordabilityResult) =>
  result.priceBinding === "financing" ? C.form.priceBindingFinancing : C.form.priceBindingPayment;

/**
 * The cause of what the press did, from the two results' own flags and
 * figures. Every branch states only what those numbers show.
 */
export function trialWhy(
  key: TrialKey,
  before: AffordabilityResult,
  after: AffordabilityResult,
): string {
  const priceDelta = after.maxPrice - before.maxPrice;
  const loanDelta = after.maxLoan - before.maxLoan;
  const unchanged = atLedgerZero(priceDelta);
  const W = L.why;
  // Never "không đổi" for a price that moved, never a cause the flags do not show.
  const fallback = unchanged ? W.unchanged : W.changedOther;
  if (key === "reserve") {
    if (after.financingBlocked) {
      return fill(W.reserveCashShort, { usable: rounded(after.usableCash) });
    }
    if (unchanged || priceDelta > 0) return fallback;
    if (atLedgerZero(loanDelta)) return W.reservePayment;
    if (loanDelta < 0 && after.priceBinding === "financing") {
      return fill(W.reserveFinancing, { loan: rounded(-loanDelta) });
    }
    return fallback;
  }
  if (after.financingBlocked && unchanged) return W.rateCashShort;
  if (atLedgerZero(after.paymentSupportedLoan) && atLedgerZero(before.paymentSupportedLoan)) {
    return unchanged ? W.rateNoLoan : fallback;
  }
  if (unchanged) {
    return after.priceBinding === "financing" && !atLedgerZero(after.maxLoan)
      ? fill(W.rateFinancing, {
          before: rounded(before.expectedPrincipalInterest),
          after: rounded(after.expectedPrincipalInterest),
        })
      : fallback;
  }
  // The BUDGET is the same at both rates; what it can carry shrinks. The loan
  // actually used is named on its own — it equals the capacity only when the
  // payment binds, so no sentence here equates the two.
  const budgetSame = atLedgerZero(
    after.affordablePrincipalInterest - before.affordablePrincipalInterest,
  );
  if (priceDelta < 0 && budgetSame && after.paymentSupportedLoan < before.paymentSupportedLoan) {
    const [capacityBefore, capacityAfter] = compactMoneyPair(
      before.paymentSupportedLoan,
      after.paymentSupportedLoan,
      CHART_UI.money,
    );
    const [loanBefore, loanAfter] = compactMoneyPair(before.maxLoan, after.maxLoan, CHART_UI.money);
    return fill(W.ratePayment, {
      budget: rounded(after.affordablePrincipalInterest),
      capacityBefore,
      capacityAfter,
      loanBefore,
      loanAfter,
    });
  }
  return fallback;
}

/** What the panel shows for the latest press. */
export type TrialImpactView = {
  key: TrialKey;
  trialLabel: string;
  /** "Quỹ dự phòng giữ lại: 0 ₫ → 50.000.000 ₫". */
  fieldLine: string;
  /** Rounded headline: "Tầm giá giảm khoảng 50,0 triệu." */
  change: string;
  /** The before/after price bars, one axis from 0. */
  bars: readonly TrialBar[];
  /** The exact đồng, for the disclosure — not repeated in prose. */
  exact: {
    rows: readonly { label: string; before: string; after: string }[];
    change: string;
  };
  statusLine: string | null;
  bindingLine: string | null;
  why: string;
  lesson: string;
  question: string;
  /** The head of the ONE live sentence. */
  said: string;
};

/**
 * The latest press against the result on screen now. `after` is the page's
 * own current result, which — because the try holds — is the result for
 * exactly `trial.after`.
 */
export function trialImpactView(
  trial: AffordabilityTrial,
  after: AffordabilityResult,
  afterLabel: string,
): TrialImpactView {
  const T = L.trials[trial.key];
  const I = L.impact;
  const before = trial.beforeResult;
  const beforeField = fieldText(trial.key, trial.before[trial.key] ?? "");
  const afterField = fieldText(trial.key, trial.after[trial.key] ?? "");
  const delta = after.maxPrice - before.maxPrice;
  const change = atLedgerZero(delta)
    ? I.changeNone
    : fill(delta < 0 ? I.changeDown : I.changeUp, { amount: rounded(Math.abs(delta)) });
  const row = (label: string, pick: (result: AffordabilityResult) => number) => ({
    label,
    before: money(pick(before)),
    after: money(pick(after)),
  });
  return {
    key: trial.key,
    trialLabel: T.label,
    fieldLine: fill(I.fieldLine, { field: T.field, before: beforeField, after: afterField }),
    change,
    bars: trialBars(before.maxPrice, after.maxPrice),
    exact: {
      rows: [
        { label: T.field, before: beforeField, after: afterField },
        row(I.exactPrice, (result) => result.maxPrice),
        row(I.exactLoan, (result) => result.maxLoan),
        row(I.exactCapacity, (result) => result.paymentSupportedLoan),
      ],
      change: atLedgerZero(delta) ? money(0) : money(delta),
    },
    statusLine:
      trial.beforeLabel === afterLabel
        ? null
        : fill(I.statusLine, { before: trial.beforeLabel, after: afterLabel }),
    bindingLine:
      before.priceBinding === after.priceBinding || after.maxPrice <= 0 || before.maxPrice <= 0
        ? null
        : fill(I.bindingLine, { before: bindingWord(before), after: bindingWord(after) }),
    why: trialWhy(trial.key, before, after),
    lesson: T.lesson,
    question: T.question,
    said: fill(I.said, {
      trial: T.label,
      field: T.field,
      before: beforeField,
      after: afterField,
      change,
    }),
  };
}

/** One bar of the before/after figure. */
export type TrialBar = {
  side: "before" | "after";
  label: string;
  /** The engine's `maxPrice`, exactly. */
  value: number;
  /** Rounded label, triệu/tỷ; exact đồng when rounding would hide a difference. */
  text: string;
  /** Width on the shared 0 → larger-price axis, 0–100. */
  percent: number;
};

/**
 * The two prices on ONE axis from 0 to the larger of them, so the lengths
 * compare honestly. Nothing but the two `maxPrice` figures goes in.
 */
export function trialBars(beforePrice: number, afterPrice: number): TrialBar[] {
  const clean = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const max = Math.max(clean(beforePrice), clean(afterPrice));
  const [beforeText, afterText] = compactMoneyPair(
    clean(beforePrice),
    clean(afterPrice),
    CHART_UI.money,
  );
  const bar = (side: TrialBar["side"], value: number, text: string, label: string) => ({
    side,
    label,
    value,
    text,
    percent: max > 0 ? (clean(value) / max) * 100 : 0,
  });
  return [
    bar("before", beforePrice, beforeText, L.impact.barBefore),
    bar("after", afterPrice, afterText, L.impact.barAfter),
  ];
}

/**
 * What the scene draws (living infographic F1, 2026-09-29): the 3D trays as
 * unlabelled CONTEXT, then two code-drawn readings, each a bar whose 100% is
 * NAMED —
 *
 *   1. the reference price = own money into the price + the loan;
 *   2. the savings = into the price + fees outside it + unused + the reserve
 *      kept apart. The reserve is never summed into the price.
 *
 * Five truthful non-numeric states: no result or no parsed reserve
 * ("unknown"), essentials blank so the price is only an upper bound
 * ("limited"), no feasible price ("none"), and a figure too large to print
 * exactly ("display"). "model" and "display" are also what the calculator
 * passes for a whole-tool `affordabilityLimit`. None is drawn as zeros or as
 * "— ₫".
 */
export type AffordabilitySceneView =
  | { kind: "unknown" | "limited" | "none" | "display" | "model" }
  | {
      kind: "ready";
      price: PriceReading;
      /** Null when there are no savings at all: nothing to divide. */
      savings: SavingsReading | null;
      /**
       * A real price with no loan in it, and why: the typed maximum is 0%
       * ("ltv"), or the month leaves nothing to repay with ("capacity").
       * Null when there is a loan.
       */
      noLoan: "ltv" | "capacity" | null;
      /** Every figure in full đồng, for the collapsed disclosure. */
      exact: readonly { key: string; label: string; value: string }[];
    };

/** Reading 1. 100% = `maxPrice`. */
export type PriceReading = {
  wholeText: string;
  ownText: string;
  loanText: string;
  ownPercent: number;
  loanPercent: number;
  ownShareText: string;
  loanShareText: string;
};

/** Reading 2. 100% = the savings: usable cash + the reserve kept from them. */
export type SavingsReading = {
  wholeText: string;
  toPriceText: string;
  feesText: string;
  /** Usable own money the price and its costs did not need; null at ~0. */
  unusedText: string | null;
  /** The reserve KEPT from the savings — at most the savings themselves. */
  reserveText: string;
  /** The reserve as typed; differs from `reserveText` only when over. */
  reserveTypedText: string;
  toPricePercent: number;
  feesPercent: number;
  unusedPercent: number;
  reservePercent: number;
  /** The typed reserve is larger than the savings: all of them are kept. */
  reserveOverSavings: boolean;
};

const shareText = (percent: number) => formatPercent(percent, 1);

/**
 * The scene from the result on screen. Own money into the price is
 * `cashToPrice`, the loan `maxLoan`, the fees `purchaseCosts` (own money,
 * outside the price), the unused part what `usableCash` did not need, the
 * reserve the `cashReserve` the engine was given. The engine's `usableCash`
 * is `downPayment − cashReserve` floored at 0, so usable + the reserve kept
 * (`min(reserve, savings)`) IS the savings typed. Nothing is recomputed.
 *
 * NO GHOST MARK. Each bar is 100% of its own named whole, so a mark "where it
 * stood before" would sit on a different whole. What a press did is the
 * impact block's before/after bars, on one axis from 0.
 */
export function affordabilityScene(
  result: AffordabilityResult | null,
  cashReserve: number | null,
  downPayment: number | null,
): AffordabilitySceneView {
  if (result === null || cashReserve === null) return { kind: "unknown" };
  if (result.conclusionLimited) return { kind: "limited" };
  if (!(result.maxPrice > 0)) return { kind: "none" };
  const savingsTyped = Math.max(0, downPayment ?? 0);
  const reserveKept = Math.min(Math.max(0, cashReserve), savingsTyped);
  const whole = result.usableCash + reserveKept;
  // Every figure the readings or the disclosure print, in full đồng.
  if (
    !displayable([
      result.maxPrice,
      result.cashToPrice,
      result.maxLoan,
      result.purchaseCosts,
      result.usableCash,
      cashReserve,
      whole,
    ])
  ) {
    return { kind: "display" };
  }

  const S = L.scene;
  const of = (value: number, whole: number) => (whole > 0 ? (Math.max(0, value) / whole) * 100 : 0);
  const ownPercent = of(result.cashToPrice, result.maxPrice);
  const loanPercent = of(result.maxLoan, result.maxPrice);
  const price: PriceReading = {
    wholeText: rounded(result.maxPrice),
    ownText: rounded(result.cashToPrice),
    loanText: rounded(result.maxLoan),
    ownPercent,
    loanPercent,
    ownShareText: shareText(ownPercent),
    loanShareText: shareText(loanPercent),
  };

  const unused = Math.max(0, result.usableCash - result.cashToPrice - result.purchaseCosts);
  const hasUnused = unused >= 0.5;
  const savings: SavingsReading | null =
    whole > 0
      ? {
          wholeText: rounded(whole),
          toPriceText: rounded(result.cashToPrice),
          feesText: rounded(result.purchaseCosts),
          unusedText: hasUnused ? rounded(unused) : null,
          // The component is what is actually held back, so the parts
          // reconcile to the whole; the typed figure is disclosed apart.
          reserveText: rounded(reserveKept),
          reserveTypedText: rounded(cashReserve),
          toPricePercent: of(result.cashToPrice, whole),
          feesPercent: of(result.purchaseCosts, whole),
          unusedPercent: hasUnused ? of(unused, whole) : 0,
          reservePercent: of(reserveKept, whole),
          reserveOverSavings: cashReserve > savingsTyped,
        }
      : null;

  return {
    kind: "ready",
    price,
    savings,
    noLoan:
      result.maxLoan >= 0.5
        ? null
        : result.assumedMaxLtvPercent === 0
          ? "ltv"
          : "capacity",
    exact: [
      { key: "price", label: S.exactPrice, value: money(result.maxPrice) },
      { key: "own", label: S.priceOwn, value: money(result.cashToPrice) },
      { key: "loan", label: S.priceLoan, value: money(result.maxLoan) },
      { key: "fees", label: S.savingsFees, value: money(result.purchaseCosts) },
      ...(hasUnused ? [{ key: "unused", label: S.savingsUnused, value: money(unused) }] : []),
      { key: "reserve", label: S.savingsReserve, value: money(reserveKept) },
      ...(cashReserve > savingsTyped
        ? [{ key: "reserveTyped", label: S.reserveTyped, value: money(cashReserve) }]
        : []),
    ],
  };
}

/**
 * True while the form holds the shipped example plus presses only — no
 * figure the reader typed. The example stays labelled as one until they type.
 */
export function onlyTried(
  trials: readonly AffordabilityTrial[],
  initial: FormValues,
): boolean {
  const first = trials[0];
  return first !== undefined && valuesKey(first.before) === valuesKey(initial);
}

/** The editable fields a whole-tool limit can name, by their `fieldKey`. */
export type LimitField =
  | "income"
  | "netIncome"
  | "essentials"
  | "buffer"
  | "debts"
  | "down"
  | "reserve"
  | "housingCosts"
  | "targetPrice"
  | "rate"
  | "term";

/**
 * Every field is valid, and still the page cannot answer: the engine
 * returned no result ("model"), or a figure it would print — or a value it
 * echoes back — is past what the formatters show ("display", 10^18).
 */
export type AffordabilityLimit = {
  kind: "model" | "display";
  /** The fields to go and change, in form order; never empty. */
  fields: readonly LimitField[];
};

/**
 * ONE LIMIT FOR THE WHOLE COMMERCIAL TOOL (release repair, 2026-09-30).
 *
 * Null when the input is syntactically invalid (the fields say so
 * themselves) or when every printed figure is showable — including the
 * ordinary "limited" and "no feasible price" states, which stay the status
 * adapter's. No ceiling is imposed on the engine and nothing is recomputed:
 * this only reads the engine's own output and the values the page echoes.
 *
 * THE FIELDS NAMED: every value in use that is itself too large to print.
 * When none is, the figure grew from ordinary-looking inputs, so the fields
 * the price is built from are named instead — the monthly income the budget
 * comes from, the savings, and the term.
 */
export function affordabilityLimit({
  input,
  result,
  targetPrice,
}: {
  input: AffordabilityInput | null;
  result: AffordabilityResult | null;
  /** The parsed target, null when blank or invalid. */
  targetPrice: number | null;
}): AffordabilityLimit | null {
  if (input === null) return null;
  const household = input.mode === "household";
  // Only the values the engine reads in this mode: the household fields are
  // not rendered, and not used, in the credit-ceiling mode.
  const inUse: [LimitField, number | null | undefined][] = [
    ["income", input.monthlyIncome],
    ["debts", input.monthlyDebts],
    ["netIncome", household ? input.monthlyNetIncome : undefined],
    ["essentials", household ? input.essentialExpenses : undefined],
    ["buffer", household ? input.monthlyBuffer : undefined],
    ["down", input.downPayment],
    ["reserve", input.cashReserve],
    ["rate", input.annualRatePercent],
    ["term", input.termMonths],
    ["targetPrice", targetPrice],
    ["housingCosts", input.monthlyHousingCosts],
  ];
  const oversized = inUse
    .filter(([, value]) => value !== null && value !== undefined && !displayable([value]))
    .map(([field]) => field);
  const drivers: LimitField[] = [household ? "netIncome" : "income", "down", "term"];
  const fields = oversized.length > 0 ? oversized : drivers;

  if (result === null) return { kind: "model", fields };
  const printed = [
    result.maxPrice,
    result.maxLoan,
    result.affordablePrincipalInterest,
    result.expectedPrincipalInterest,
    result.paymentSupportedLoan,
    result.usableCash,
    result.purchaseCosts,
    result.cashToPrice,
    result.assumedRatioCeiling,
    result.housingLimit,
    result.totalDebtLimit,
    result.affordableHousingPayment,
    ...(result.householdResidual === null ? [] : [result.householdResidual]),
    // The gap the status card and the target row print.
    ...(targetPrice === null ? [] : [targetPrice - result.maxPrice]),
  ];
  if (oversized.length > 0 || !displayable(printed)) return { kind: "display", fields };
  return null;
}
