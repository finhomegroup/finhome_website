/*
 * /cong-cu/margin-va-markup/'s two-frame picture — the pure half.
 *
 * `marginFormState` is the page's own parse and guards, moved here unchanged
 * (including the UI's markup > −100 rule, narrower than the engine's). NO NEW
 * FINANCE: cost, price, profit, marginPercent and markupPercent come from
 * `computeMargin`. Each frame is a signed axis over ITS OWN denominator and
 * the profit — two different scales, never one common base.
 */
import { moneyText, percentText, signedAxis, signedMoneyText, printableMoney, printableRate, type AxisBar } from "@/components/arith-learning-display";
import { stepDecimal, stepMoney, type FormValues, type Trial, type TrialAvailability } from "@/components/calc/learning-trials";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { MARGIN_LEARNING as L } from "@/content/calculators/margin-learning";
import { fill } from "@/lib/calc/charts/labels";
import { parseDecimal, parseMoney } from "@/lib/calc/number";
import { computeMargin, type MarginMode, type MarginResult } from "@/lib/calc/margin";

/** The second box per mode — its key and whether it is a rate. */
export const MARGIN_VALUE_KEY = {
  price: { key: "price", isPercent: false },
  margin: { key: "margin", isPercent: true },
  markup: { key: "markup", isPercent: true },
} as const satisfies Record<MarginMode, { key: string; isPercent: boolean }>;

export function marginFormState(values: FormValues) {
  const mode = (values.mode ?? "price") as MarginMode;
  const active = MARGIN_VALUE_KEY[mode];
  const cost = parseMoney(values.cost ?? "");
  const raw = values[active.key] ?? "";
  const value = active.isPercent ? parseDecimal(raw) : parseMoney(raw);
  const costInvalid = cost === null || cost <= 0;
  const valueInvalid =
    value === null ||
    (mode === "price" && value === 0) ||
    (mode === "margin" && value >= 100) ||
    (mode === "markup" && value <= -100);
  const result: MarginResult | null = costInvalid || valueInvalid ? null : computeMargin({ mode, cost: cost!, value: value! });
  return { mode, activeKey: active.key, cost, value, costInvalid, valueInvalid, result };
}
export type MarginFormState = ReturnType<typeof marginFormState>;

export type MarginFrame = {
  side: "price" | "cost";
  title: string;
  denominator: { text: string; bar: AxisBar | null };
  profit: { text: string; bar: AxisBar | null };
  zero: number;
  ratio: string;
};

export type MarginLesson =
  | { kind: "empty" | "limit" }
  | { kind: "ready"; state: "gain" | "even" | "loss" | "negativePrice"; frames: readonly MarginFrame[]; notes: readonly string[]; profitLabel: string; withheld: boolean };

const numbers = (r: MarginResult) => [r.price, r.profit, r.marginPercent, r.markupPercent];

/**
 * FINITE: a verdict (gain / loss / break-even) needs a computed profit. A
 * finite huge cost with a large markup overflows the price to Infinity —
 * then nothing is known, and nothing is claimed.
 */
export const marginFinite = (r: MarginResult) => numbers(r).every(Number.isFinite);

/** PRINTABLE: every figure can be shown, so a before/after comparison is honest. */
export const marginPrintable = (r: MarginResult) =>
  printableMoney(r.price) && printableMoney(r.profit) && printableRate(r.marginPercent) && printableRate(r.markupPercent);

export function marginLesson(state: MarginFormState): MarginLesson {
  const r = state.result;
  if (r === null) return { kind: "empty" };
  if (!marginFinite(r)) return { kind: "limit" };
  const kind = r.price < 0 ? "negativePrice" : r.profit > 0 ? "gain" : r.profit < 0 ? "loss" : "even";
  const frame = (side: "price" | "cost"): MarginFrame => {
    const F = L.frames[side];
    const denom = side === "price" ? r.price : r.cost;
    const axis = signedAxis([denom, r.profit], printableMoney);
    return {
      side,
      title: F.title,
      denominator: { text: moneyText(denom), bar: axis?.bar(denom) ?? null },
      profit: { text: moneyText(r.profit), bar: axis?.bar(r.profit) ?? null },
      zero: axis?.zero ?? 0,
      ratio: fill(F.ratio, {
        profit: moneyText(r.profit),
        denominator: moneyText(denom),
        percent: percentText(side === "price" ? r.marginPercent : r.markupPercent, 4),
      }),
    };
  };
  const frames = [frame("price"), frame("cost")];
  const notes: string[] = [L.states[kind]];
  if (kind === "gain" && r.marginPercent >= 99) notes.push(L.states.nearFull);
  const withheld = frames.some((f) => f.denominator.bar === null);
  if (withheld) notes.push(W.drawWithheld);
  return { kind: "ready", state: kind, frames, notes, profitLabel: r.profit < 0 ? L.loss : L.profit, withheld };
}

/* ------------------------------------------------------------- trials */

export type MarginTrialKey = "price" | "cost" | "margin" | "markup";
export const marginTrialKeys = (mode: MarginMode): MarginTrialKey[] =>
  mode === "price" ? ["price", "cost"] : [mode];

export type MarginSnapshot = { price: string; profit: number; profitText: string; margin: string; markup: string };
export type MarginTrial = Trial<MarginTrialKey, MarginSnapshot>;

export function marginSnapshot(state: MarginFormState): MarginSnapshot | null {
  const r = state.result;
  if (r === null) return null;
  return {
    price: moneyText(r.price),
    profit: r.profit,
    profitText: moneyText(r.profit),
    margin: percentText(r.marginPercent, 4),
    markup: percentText(r.markupPercent, 4),
  };
}

export function nextMarginValue(key: MarginTrialKey, values: FormValues): string | null {
  switch (key) {
    case "price": {
      const p = parseMoney(values.price ?? "");
      const step = p === null ? 0 : Math.round(Math.abs(p) / 10);
      return step > 0 ? stepMoney(values.price ?? "", -step) : null;
    }
    case "cost": {
      const c = parseMoney(values.cost ?? "");
      const step = c === null ? 0 : Math.round(Math.abs(c) / 10);
      return step > 0 ? stepMoney(values.cost ?? "", step) : null;
    }
    case "margin":
      return stepDecimal(values.margin ?? "", 5);
    case "markup":
      return stepDecimal(values.markup ?? "", 5);
  }
}

export function marginAvailability(key: MarginTrialKey, values: FormValues, state: MarginFormState): TrialAvailability {
  if (state.result === null) return { enabled: false, reason: W.blockedInvalid };
  if (!marginPrintable(state.result)) return { enabled: false, reason: W.blockedLimit };
  const next = nextMarginValue(key, values);
  if (next === null) return { enabled: false, reason: W.blockedStep };
  if (key === "margin" && (parseDecimal(next) ?? 100) >= 100) return { enabled: false, reason: L.blockedMargin };
  const after = marginFormState({ ...values, [key]: next }).result;
  if (after === null || !marginPrintable(after)) return { enabled: false, reason: W.blockedAfter };
  return { enabled: true };
}

export function makeMarginTrial(key: MarginTrialKey, values: FormValues, revision: number, state: MarginFormState): MarginTrial | null {
  if (!marginTrialKeys(state.mode).includes(key) || !marginAvailability(key, values, state).enabled) return null;
  const next = nextMarginValue(key, values);
  const snap = marginSnapshot(state);
  if (next === null || snap === null) return null;
  return { key, revision, before: { ...values }, after: { ...values, [key]: next }, beforeResult: snap, beforeLabel: "" };
}

export type MarginImpact = { key: MarginTrialKey; fieldLine: string; lines: readonly string[]; tradeoff: string };

export function marginImpact(trial: MarginTrial, after: MarginSnapshot): MarginImpact {
  const I = L.impact;
  const b = trial.beforeResult;
  const unit = trial.key === "margin" || trial.key === "markup" ? "%" : " ₫";
  return {
    key: trial.key,
    fieldLine: fill(W.field, {
      field: L.trials[trial.key].field,
      before: `${trial.before[trial.key] ?? ""}${unit}`,
      after: `${trial.after[trial.key] ?? ""}${unit}`,
    }),
    lines: [
      fill(I.price, { before: b.price, after: after.price }),
      fill(I.profit, { before: b.profitText, after: after.profitText, delta: signedMoneyText(after.profit - b.profit) }),
      fill(I.margin, { before: b.margin, after: after.margin }),
      fill(I.markup, { before: b.markup, after: after.markup }),
    ],
    tradeoff: I.tradeoff[trial.key],
  };
}
