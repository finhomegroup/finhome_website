/*
 * The "Thử một thay đổi" trial stack, shared by the 2026-09-28 learning
 * panels on /cong-cu/vay-mua-nha/ (A2) and /cong-cu/vay-mua-xe/ (A3).
 *
 * Pure: no DOM, and no arithmetic about money beyond adding one step to one
 * typed figure. The page recomputes with its own engine exactly as it does
 * for a keystroke; a trial only records which raw strings it wrote, the
 * revision it was made at, and the result on screen when it was pressed.
 *
 * The contract is A1's (`components/affordability-learning.ts`), generalised
 * rather than moved — the deployed A1 pilot is left untouched:
 *
 * - A TRIAL IS TIED TO ONE REVISION of the form. Any manual edit — even one
 *   that types the same figure back — or a reset moves the revision and
 *   retires every trial, so no trial can come back to life and no undo can
 *   overwrite a figure the reader typed.
 * - Trials STACK while each one's `before` is the previous one's `after`;
 *   undo takes back only the latest.
 * - A trial HOLDS only while the form reads exactly its `after`.
 */
import { useReducer } from "react";
import { compactMoneyPair, type MoneyWords } from "@/lib/calc/charts/labels";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";

/** The raw strings of the form, as `useCalcFields` holds them. */
export type FormValues = Readonly<Record<string, string>>;

/** A stable key for a set of field values. */
export const valuesKey = (values: FormValues) =>
  JSON.stringify(Object.keys(values).sort().map((key) => [key, values[key]]));

/** One press, and everything needed to show and take it back. */
export type Trial<K extends string, R> = {
  key: K;
  /** The manual-edit revision the press was made at. */
  revision: number;
  before: FormValues;
  after: FormValues;
  /** What was on screen when the button was pressed. */
  beforeResult: R;
  /** The status word then, when the page has one; "" otherwise. */
  beforeLabel: string;
};

export type TrialState<K extends string, R> = {
  revision: number;
  trials: readonly Trial<K, R>[];
};

export type TrialAction<K extends string, R> =
  /** A keystroke, a select — anything the reader did to a field. */
  | { type: "edit" }
  /** "Về ví dụ mẫu". */
  | { type: "reset" }
  | { type: "apply"; trial: Trial<K, R> }
  | { type: "undo" };

export function initialTrialState<K extends string, R>(): TrialState<K, R> {
  return { revision: 0, trials: [] };
}

export function trialReducer<K extends string, R>(
  state: TrialState<K, R>,
  action: TrialAction<K, R>,
): TrialState<K, R> {
  switch (action.type) {
    case "edit":
    case "reset":
      return { revision: state.revision + 1, trials: [] };
    case "apply": {
      if (action.trial.revision !== state.revision) return state;
      const latest = state.trials.at(-1);
      const continues =
        latest !== undefined && valuesKey(latest.after) === valuesKey(action.trial.before);
      return { ...state, trials: [...(continues ? state.trials : []), action.trial] };
    }
    case "undo":
      return state.trials.length === 0 ? state : { ...state, trials: state.trials.slice(0, -1) };
  }
}

/**
 * The trials that still describe the form on screen: all of them while the
 * latest was made at this revision and the form reads exactly its `after`,
 * none otherwise.
 */
export function heldTrials<K extends string, R>(
  state: TrialState<K, R>,
  values: FormValues,
): readonly Trial<K, R>[] {
  const latest = state.trials.at(-1);
  if (latest === undefined) return [];
  return latest.revision === state.revision && valuesKey(latest.after) === valuesKey(values)
    ? state.trials
    : [];
}

/** True while the form holds the shipped example plus presses only. */
export function onlyTried<K extends string, R>(
  trials: readonly Trial<K, R>[],
  initial: FormValues,
): boolean {
  const first = trials[0];
  return first !== undefined && valuesKey(first.before) === valuesKey(initial);
}

/** The state, the trials in force and the dispatcher, for one form. */
export function useTrialStack<K extends string, R>(values: FormValues) {
  const [state, dispatch] = useReducer(
    trialReducer<K, R>,
    undefined,
    initialTrialState<K, R>,
  );
  return { state, trials: heldTrials(state, values), dispatch };
}

/** Whether a press may run, and the plain reason when it may not. */
export type TrialAvailability = { enabled: true } | { enabled: false; reason: string };

/** Most decimal places a press keeps; see A1's `MAX_TRIAL_DECIMALS`. */
export const MAX_STEP_DECIMALS = 10;

function typedDecimals(raw: string, mark: RegExp): number {
  const match = raw.trim().match(mark);
  return match ? match[1].length : 0;
}

/**
 * A decimal field (`parseDecimal`) plus `step`, written with a comma at the
 * precision typed: "20" + 5 → "25", "5,5" + 2 → "7,5". Null when it does not
 * parse, is not finite, carries too many decimals, or would not move.
 */
export function stepDecimal(raw: string, step: number): string | null {
  const value = parseDecimal(raw);
  if (value === null || !Number.isFinite(value)) return null;
  const dp = typedDecimals(raw, /[.,](\d*)$/);
  if (dp > MAX_STEP_DECIMALS) return null;
  const sum = value + step;
  if (!Number.isFinite(sum) || sum === value) return null;
  const next = sum.toFixed(dp).replace(".", ",");
  const back = parseDecimal(next);
  return back === null || back === value ? null : next;
}

/**
 * A money field (`parseMoney`) plus `step`, grouped with dots as the control
 * shows it: "0" + 1.000.000 → "1.000.000". Null on the same conditions. A
 * blank or malformed field is null, never read as 0.
 */
export function stepMoney(raw: string, step: number): string | null {
  const value = parseMoney(raw);
  if (value === null || !Number.isFinite(value)) return null;
  const dp = typedDecimals(raw, /,(\d*)$/);
  if (dp > MAX_STEP_DECIMALS) return null;
  const sum = value + step;
  if (!Number.isFinite(sum) || sum === value) return null;
  const next = formatMoney(sum, dp);
  const back = parseMoney(next);
  return back === null || back === value ? null : next;
}

/** One bar of a before/after pair. */
export type PairBar = {
  side: "before" | "after";
  label: string;
  /** The engine's figure, exactly. */
  value: number;
  /** Rounded triệu/tỷ; exact đồng when rounding would hide the difference. */
  text: string;
  /** Width on the shared 0 → larger-value axis, 0–100. */
  percent: number;
};

/** Two figures on ONE axis from 0 to the larger, so lengths compare honestly. */
export function pairBars(
  before: number,
  after: number,
  labels: { before: string; after: string },
  words: MoneyWords,
): PairBar[] {
  const clean = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const max = Math.max(clean(before), clean(after));
  const [beforeText, afterText] = compactMoneyPair(clean(before), clean(after), words);
  const bar = (side: PairBar["side"], value: number, text: string, label: string): PairBar => ({
    side,
    label,
    value,
    text,
    percent: max > 0 ? (clean(value) / max) * 100 : 0,
  });
  return [
    bar("before", before, beforeText, labels.before),
    bar("after", after, afterText, labels.after),
  ];
}
