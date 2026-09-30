/*
 * /cong-cu/tinh-phan-tram/'s living ruler — the pure half.
 *
 * `percentFormState` is the page's own per-mode parse and guards, moved here
 * unchanged (each mode owns its boxes and their grammar). NO NEW FINANCE:
 * every drawn figure is a box of the active mode or a field of
 * `computePercent`'s result. Values over 100% or negative are NOT clamped
 * into a 0–100 gauge: they go on one signed axis, and the ruler reading is
 * used only for an ordinary positive part of a positive base.
 */
import { eqResult, eqTerms, signedAxis, moneyText, numberText, percentText, printableMoney, printableRate, type AxisBar } from "@/components/arith-learning-display";
import { stepDecimal, stepMoney, type FormValues, type Trial, type TrialAvailability } from "@/components/calc/learning-trials";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { PERCENT as C } from "@/content/calculators/percent";
import { PERCENT_LEARNING as L } from "@/content/calculators/percent-learning";
import { fill } from "@/lib/calc/charts/labels";
import { formatDecimal, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computePercent, type PercentComputation, type PercentMode } from "@/lib/calc/percent";

/**
 * Which field keys and which parser each mode uses — moved from the page
 * unchanged. Every mode owns its OWN pair of boxes; `aIsPercent` /
 * `bIsPercent` pick rate grammar ("7,5") or money grammar ("2.000.000").
 */
export const PERCENT_MODES = {
  of: { a: "ofPercent", b: "ofTotal", aIsPercent: true, bIsPercent: false },
  share: { a: "sharePart", b: "shareWhole", aIsPercent: false, bIsPercent: false },
  change: { a: "changeFrom", b: "changeTo", aIsPercent: false, bIsPercent: false },
  points: { a: "pointsFrom", b: "pointsTo", aIsPercent: true, bIsPercent: true },
} as const satisfies Record<PercentMode, { a: string; b: string; aIsPercent: boolean; bIsPercent: boolean }>;

export function percentFormState(values: FormValues) {
  const mode = (values.mode ?? "of") as PercentMode;
  const keys = PERCENT_MODES[mode];
  const a = keys.aIsPercent ? parseDecimal(values[keys.a] ?? "") : parseMoney(values[keys.a] ?? "");
  const b = keys.bIsPercent ? parseDecimal(values[keys.b] ?? "") : parseMoney(values[keys.b] ?? "");
  // "share" divides by b and "change" by a; "points" accepts a 0 old rate.
  const aInvalid = a === null || (mode === "change" && a === 0);
  const bInvalid = b === null || (mode === "share" && b === 0);
  const result: PercentComputation | null = aInvalid || bInvalid ? null : computePercent({ mode, a: a!, b: b! });
  return { mode, keys, a, b, aInvalid, bInvalid, result };
}
export type PercentFormState = ReturnType<typeof percentFormState>;

/** The mode's one answer, as the page shows it (safe at every limit). */
export function percentAnswer(r: PercentComputation): string {
  switch (r.mode) {
    case "of":
      return moneyText(r.amount);
    case "share":
      return percentText(r.sharePercent);
    case "change":
      return percentText(r.changePercent);
    case "points":
      return numberText(r.differencePoints, 2, ` ${C.form.modes.points.pointsUnit}`);
  }
}

/**
 * The one-line worked arithmetic, from the SAME parsed numbers as the result.
 *
 * Terms that are compared or subtracted share ONE precision (`eqTerms`), so
 * "7,002 − 7,001 = 0,001" and "(1.000,2 − 1.000,1) ÷ 1.000,1" stay readable
 * where two decimals would print equal operands beside a non-zero answer.
 * The points difference is shown at the operands' own precision, so the
 * subtraction adds up on screen. When ten decimals cannot hold an operand
 * (0 → 0,00000000001) the WHOLE equation is replaced by a named limitation —
 * never "0,0000000000 − 0,0000000000". A computed ratio that ten decimals
 * still round is marked "≈"; a term past the print limit is named. Null when
 * there is no result.
 */
export function percentEquation(state: PercentFormState): string | null {
  const r = state.result;
  const a = state.a;
  const b = state.b;
  if (r === null || a === null || b === null) return null;
  const named = (v: number, money: boolean) => (money ? moneyText(v) : numberText(v, 2, ""));
  const terms = (kind: "rate" | "money", values: number[], min: number): string[] | null => {
    const t = eqTerms(kind, values, min);
    return t.kind === "ok" ? t.texts : t.kind === "unprintable" ? values.map((v) => named(v, kind === "money")) : null;
  };
  switch (r.mode) {
    case "of": {
      const pa = terms("rate", [a], 2);
      const pb = terms("money", [b], 0);
      if (pa === null || pb === null) return L.equationLimit;
      return `${pa[0]}% × ${pb[0]} = ${eqResult("money", r.amount, 0, " ₫")}`;
    }
    case "share": {
      const t = terms("money", [a, b], 0);
      if (t === null) return L.equationLimit;
      return `${t[0]} ÷ ${t[1]} = ${eqResult("rate", r.sharePercent, 2, "%")}`;
    }
    case "change": {
      const t = terms("money", [b, a, Math.abs(a)], 0);
      if (t === null) return L.equationLimit;
      return `(${t[0]} − ${t[1]}) ÷ ${t[2]} = ${eqResult("rate", r.changePercent, 2, "%")}`;
    }
    case "points": {
      const unit = ` ${C.form.modes.points.pointsUnit}`;
      const t = eqTerms("rate", [b, a], 2);
      if (t.kind === "unprintable") return `${named(b, false)} − ${named(a, false)} = ${eqResult("rate", r.differencePoints, 2, unit)}`;
      if (t.kind === "precision") return L.equationLimit;
      // Two exact decimals at `dp` have an exact difference at `dp`: the
      // subtraction adds up on screen, and equal operands give a true 0.
      return `${t.texts[0]} − ${t.texts[1]} = ${formatDecimal(r.differencePoints, t.dp)}${unit}`;
    }
  }
}

const rate = (v: number) => numberText(v, 2, "%");
const pointsText = (v: number) => numberText(v, 2, ` ${C.form.modes.points.pointsUnit}`);

/** Every number the result carries, whatever the mode. */
function resultNumbers(r: PercentComputation): number[] {
  switch (r.mode) {
    case "of":
      return [r.amount];
    case "share":
      return [r.sharePercent];
    case "change":
      return [r.changePercent, r.difference];
    case "points":
      return r.relativePercent === null ? [r.differencePoints] : [r.differencePoints, r.relativePercent];
  }
}

/**
 * FINITE: the computation produced numbers. Finite but huge inputs can still
 * overflow a derived figure (1.000% × 10^308 = Infinity) — that is a
 * computation limit, named, with no verdict and no drawing.
 */
export const percentFinite = (r: PercentComputation) => resultNumbers(r).every(Number.isFinite);

/** PRINTABLE: every figure can be shown as a number, so before/after can be compared. */
export function percentPrintable(r: PercentComputation): boolean {
  if (r.mode === "of") return printableMoney(r.amount);
  if (r.mode === "change") return printableRate(r.changePercent) && printableMoney(r.difference);
  return resultNumbers(r).every(printableRate);
}

export type PercentFocus = "a" | "b";

export type PercentLessonBar = { marker: string; label: string; text: string; fill: "solid" | "hatch" | "light"; key: PercentFocus | "gap" };

export type PercentLesson =
  | { kind: "empty" | "limit" }
  | {
      kind: "ready";
      mode: PercentMode;
      bars: readonly (PercentLessonBar & { bar: AxisBar | null })[];
      zero: number;
      signed: boolean;
      withheld: boolean;
      notes: readonly string[];
      reading: string;
    };

export function percentLesson(state: PercentFormState, focus: PercentFocus): PercentLesson {
  const r = state.result;
  if (r === null || state.a === null || state.b === null) return { kind: "empty" };
  if (!percentFinite(r)) return { kind: "limit" };
  const a = state.a;
  const b = state.b;
  const notes: string[] = [];
  // Claims about the DRAWING (ruler / signed / over 100%) are made only when
  // the bars are actually drawn — see the axis check below.
  let shapeNote: string | null = null;
  let items: (PercentLessonBar & { value: number })[];
  let printable: (v: number) => boolean = printableMoney;
  let reading: string;

  switch (r.mode) {
    case "of": {
      const P = L.of;
      items = [
        { marker: "base", key: "b", label: P.base, text: moneyText(b), fill: "hatch", value: b },
        { marker: "part", key: "a", label: fill(P.part, { percent: rate(a) }), text: moneyText(r.amount), fill: "solid", value: r.amount },
      ];
      if (b === 0) notes.push(P.zeroBase);
      else if (a >= 0 && a <= 100 && b > 0) shapeNote = fill(P.ruler, { percent: rate(a) });
      else shapeNote = P.signed;
      reading = focus === "a" ? fill(P.readA, { value: rate(a) }) : fill(P.readB, { value: moneyText(b), percent: rate(a) });
      break;
    }
    case "share": {
      const P = L.share;
      items = [
        { marker: "whole", key: "b", label: P.whole, text: moneyText(b), fill: "hatch", value: b },
        { marker: "part", key: "a", label: P.part, text: moneyText(a), fill: "solid", value: a },
      ];
      if (a < 0 || b < 0) shapeNote = P.signed;
      else if (a > b) shapeNote = P.over;
      else shapeNote = fill(P.ruler, { percent: percentText(r.sharePercent) });
      reading = focus === "a" ? fill(P.readA, { value: moneyText(a) }) : fill(P.readB, { value: moneyText(b) });
      break;
    }
    case "change": {
      const P = L.change;
      items = [
        { marker: "before", key: "a", label: P.before, text: moneyText(a), fill: "hatch", value: a },
        { marker: "after", key: "b", label: P.after, text: moneyText(b), fill: "solid", value: b },
      ];
      notes.push(fill(P.difference, { difference: moneyText(r.difference), denominator: moneyText(Math.abs(a)), percent: percentText(r.changePercent) }));
      reading = focus === "a" ? fill(P.readA, { value: moneyText(a) }) : fill(P.readB, { value: moneyText(b) });
      break;
    }
    case "points": {
      const P = L.points;
      printable = printableRate;
      items = [
        { marker: "old", key: "a", label: P.old, text: rate(a), fill: "hatch", value: a },
        { marker: "new", key: "b", label: P.new, text: rate(b), fill: "solid", value: b },
      ];
      notes.push(fill(P.gap, { points: pointsText(r.differencePoints) }));
      notes.push(
        r.relativePercent === null
          ? P.relativeNone
          : fill(P.relative, { denominator: rate(Math.abs(a)), relative: percentText(r.relativePercent) }),
      );
      reading = focus === "a" ? fill(P.readA, { value: rate(a) }) : fill(P.readB, { value: rate(b) });
      break;
    }
  }

  const axis = signedAxis(items.map((i) => i.value), printable);
  if (axis === null) {
    notes.push(W.drawWithheld);
  } else {
    if (shapeNote !== null) notes.unshift(shapeNote);
    if (axis.hasNegative && shapeNote !== L.of.signed && shapeNote !== L.share.signed) notes.push(W.signedAxis);
  }
  return {
    kind: "ready",
    mode: r.mode,
    bars: items.map(({ value, ...rest }) => ({ ...rest, bar: axis === null ? null : axis.bar(value) })),
    zero: axis?.zero ?? 0,
    signed: axis?.hasNegative ?? false,
    withheld: axis === null,
    notes,
    reading,
  };
}

/* ------------------------------------------------------------- trials */

export type PercentTrialKey = "ofPercent" | "sharePart" | "changeTo" | "pointsTo";
export const PERCENT_TRIAL_KEY: Record<PercentMode, PercentTrialKey> = {
  of: "ofPercent",
  share: "sharePart",
  change: "changeTo",
  points: "pointsTo",
};

export type PercentSnapshot = { answer: string; second: string | null };
export type PercentTrial = Trial<PercentTrialKey, PercentSnapshot>;

function second(r: PercentComputation): string | null {
  if (r.mode === "change") return moneyText(r.difference);
  if (r.mode === "points") return r.relativePercent === null ? C.form.modes.points.relativeUndefined : percentText(r.relativePercent);
  return null;
}

export function percentSnapshot(state: PercentFormState): PercentSnapshot | null {
  return state.result === null ? null : { answer: percentAnswer(state.result), second: second(state.result) };
}

export function nextPercentValue(key: PercentTrialKey, values: FormValues): string | null {
  switch (key) {
    case "ofPercent":
      return stepDecimal(values.ofPercent ?? "", 10);
    case "pointsTo":
      return stepDecimal(values.pointsTo ?? "", 1);
    case "sharePart": {
      const whole = parseMoney(values.shareWhole ?? "");
      const step = whole === null ? 0 : Math.round(Math.abs(whole) / 10);
      return step > 0 ? stepMoney(values.sharePart ?? "", step) : null;
    }
    case "changeTo": {
      const from = parseMoney(values.changeFrom ?? "");
      const step = from === null ? 0 : Math.round(Math.abs(from) / 10);
      return step > 0 ? stepMoney(values.changeTo ?? "", step) : null;
    }
  }
}

export function percentAvailability(key: PercentTrialKey, values: FormValues, state: PercentFormState): TrialAvailability {
  if (state.result === null) return { enabled: false, reason: W.blockedInvalid };
  // No comparison of figures that cannot be shown or were not computed.
  if (!percentPrintable(state.result)) return { enabled: false, reason: W.blockedLimit };
  const next = nextPercentValue(key, values);
  if (next === null) return { enabled: false, reason: W.blockedStep };
  const after = percentFormState({ ...values, [key]: next }).result;
  if (after === null || !percentPrintable(after)) return { enabled: false, reason: W.blockedAfter };
  return { enabled: true };
}

export function makePercentTrial(key: PercentTrialKey, values: FormValues, revision: number, state: PercentFormState): PercentTrial | null {
  if (PERCENT_TRIAL_KEY[state.mode] !== key || !percentAvailability(key, values, state).enabled) return null;
  const next = nextPercentValue(key, values);
  const snap = percentSnapshot(state);
  if (next === null || snap === null) return null;
  return { key, revision, before: { ...values }, after: { ...values, [key]: next }, beforeResult: snap, beforeLabel: "" };
}

export type PercentImpact = { key: PercentTrialKey; fieldLine: string; lines: readonly string[]; tradeoff: string };

export function percentImpact(trial: PercentTrial, after: PercentSnapshot, mode: PercentMode): PercentImpact {
  const M = C.form.modes[mode];
  const unit = mode === "of" || mode === "points" ? "%" : " ₫";
  const lines = [fill(L.impact.answer, { label: M.resultLabel, before: trial.beforeResult.answer, after: after.answer })];
  if (trial.beforeResult.second !== null && after.second !== null) {
    const label = mode === "change" ? C.form.modes.change.differenceLabel : C.form.modes.points.relativeLabel;
    lines.push(fill(L.impact.second, { label, before: trial.beforeResult.second, after: after.second }));
  }
  return {
    key: trial.key,
    fieldLine: fill(W.field, {
      field: L.trials[trial.key].field,
      before: `${trial.before[trial.key] ?? ""}${unit}`,
      after: `${trial.after[trial.key] ?? ""}${unit}`,
    }),
    lines,
    tradeoff: L.impact.tradeoff[trial.key],
  };
}
