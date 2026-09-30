/*
 * /cong-cu/giam-gia-va-thue/'s living price-tag path — the pure half.
 *
 * `priceAdjustFormState` is the page's own parse and guards, moved here
 * unchanged. NO NEW FINANCE: the steps ARE `result.ledger`, in order, with
 * their signed `delta` and running `balance`; a step's base is the previous
 * line's balance. `taxInside` (delta 0) is drawn as a COMPOSITION of the
 * final price (net + tax), never as a further addition or subtraction. The
 * scale is fixed over this bill's own balances.
 */
import { moneyText, percentText, printableMoney, signedMoneyText } from "@/components/arith-learning-display";
import { PLACEHOLDER } from "@/lib/calc/number";
import { moneyCell, type TableCell } from "@/lib/calc/table-cell";
import { stepDecimal, stepMoney, type FormValues, type Trial, type TrialAvailability } from "@/components/calc/learning-trials";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";
import { PRICE_ADJUST_LEARNING as L } from "@/content/calculators/price-adjust-learning";
import { fill } from "@/lib/calc/charts/labels";
import { parseDecimal, parseMoney } from "@/lib/calc/number";
import { adjustPrice, type PriceAdjustResult, type PriceLedgerStep } from "@/lib/calc/price-adjust";

export function priceAdjustFormState(values: FormValues) {
  const price = parseMoney(values.price ?? "");
  const tax = parseDecimal(values.tax ?? "");
  const discountPercent = parseDecimal(values.discountPercent ?? "");
  const secondDiscountPercent = parseDecimal(values.secondDiscountPercent ?? "");
  const discountAmount = parseMoney(values.discountAmount ?? "");
  const taxIncluded = values.taxIncluded === "yes";
  const priceInvalid = price === null || price <= 0;
  const taxInvalid = tax === null || tax < 0 || tax > 100;
  const discountPercentInvalid = discountPercent === null || discountPercent < 0 || discountPercent > 100;
  const secondDiscountPercentInvalid = secondDiscountPercent === null || secondDiscountPercent < 0 || secondDiscountPercent > 100;
  const discountAmountInvalid = discountAmount === null || discountAmount < 0;
  const fieldsUsable = !priceInvalid && !taxInvalid && !discountPercentInvalid && !secondDiscountPercentInvalid && !discountAmountInvalid;
  const result: PriceAdjustResult | null = fieldsUsable
    ? adjustPrice({
        listPrice: price!,
        discountPercent: discountPercent!,
        secondDiscountPercent: secondDiscountPercent!,
        discountAmount: discountAmount!,
        taxPercent: tax!,
        taxIncluded,
      })
    : null;
  return {
    price,
    tax,
    discountPercent,
    secondDiscountPercent,
    discountAmount,
    taxIncluded,
    priceInvalid,
    taxInvalid,
    discountPercentInvalid,
    secondDiscountPercentInvalid,
    discountAmountInvalid,
    fieldsUsable,
    result,
    // Every field valid, the COMBINATION refused (discounts exceed the price).
    tooMuch: fieldsUsable && result === null,
  };
}
export type PriceAdjustFormState = ReturnType<typeof priceAdjustFormState>;

/** Every money figure of the result is a finite number (a computation limit otherwise). */
export const priceFinite = (r: PriceAdjustResult) =>
  [r.finalPrice, r.netPrice, r.tax, r.saving, r.savingPercent, ...r.ledger.map((s) => s.balance)].every(Number.isFinite);
/** Every figure can be printed, so before/after can be compared. */
export const pricePrintable = (r: PriceAdjustResult) =>
  [r.finalPrice, r.netPrice, r.tax, r.saving, ...r.ledger.map((s) => s.balance)].every(printableMoney);

/**
 * The detail ledger's rows, BOTH money columns typed (`moneyCell`), so the
 * table's one chosen unit — compact triệu or exact đồng — applies to the
 * change AND the running balance alike. A string delta beside compact
 * balances read "+1.000.000" under "Số tiền: triệu đồng".
 *
 * A zero delta (the tax-inside line, which moves nothing) stays the
 * placeholder, not a money figure; an amount past the print limit is named
 * as a string rather than rendered "—". The sign of a reduction is the
 * figure's own "-"; an addition has none, as everywhere in the table.
 */
export function ledgerTableRows(result: PriceAdjustResult | null): TableCell[][] {
  return (result?.ledger ?? []).map((step) => [
    C.form.ledgerSteps[step.key],
    step.delta === 0 ? PLACEHOLDER : printableMoney(step.delta) ? moneyCell(step.delta) : moneyText(step.delta),
    printableMoney(step.balance) ? moneyCell(step.balance) : moneyText(step.balance),
  ]);
}

export type PriceStepView = {
  index: number;
  key: PriceLedgerStep["key"];
  label: string;
  delta: string;
  balance: string;
  /** Width on the fixed bill scale, or null when it cannot be drawn. */
  percent: number | null;
  /** taxInside only: the final price split into net + tax, same scale. */
  composition: { net: number; tax: number } | null;
  reading: string;
};

export type PriceLesson =
  // One member per state, so each `kind` check narrows (a single
  // `"empty" | "refused" | "limit"` member did not narrow to `ready`).
  | { kind: "empty" }
  | { kind: "refused" }
  | { kind: "limit" }
  | {
      kind: "ready";
      steps: readonly PriceStepView[];
      scaleText: string;
      withheld: boolean;
      modeText: string;
      compositionText: string | null;
      successive: string | null;
    };

export function priceLesson(state: PriceAdjustFormState): PriceLesson {
  if (state.tooMuch) return { kind: "refused" };
  const r = state.result;
  if (r === null) return { kind: "empty" };
  if (!priceFinite(r)) return { kind: "limit" };
  const balances = r.ledger.map((s) => s.balance);
  const drawable = balances.every(printableMoney) && printableMoney(r.netPrice) && printableMoney(r.tax);
  const max = drawable ? Math.max(0, ...balances) : 0;
  const pct = (v: number) => (drawable && max > 0 ? Math.min(100, (Math.max(0, v) / max) * 100) : drawable ? 0 : null);
  const rate = (v: number | null) => percentText(v ?? 0);
  const steps = r.ledger.map((step, index): PriceStepView => {
    const base = index > 0 ? r.ledger[index - 1].balance : step.balance;
    const words = {
      base: moneyText(base),
      delta: signedMoneyText(step.delta),
      balance: moneyText(step.balance),
      tax: moneyText(r.tax),
      net: moneyText(r.netPrice),
      percent:
        step.key === "firstPercent"
          ? rate(state.discountPercent)
          : step.key === "secondPercent"
            ? rate(state.secondDiscountPercent)
            : rate(state.tax),
    };
    const composition =
      step.key === "taxInside" && drawable && max > 0
        ? { net: (r.netPrice / max) * 100, tax: (r.tax / max) * 100 }
        : null;
    return {
      index,
      key: step.key,
      label: C.form.ledgerSteps[step.key],
      delta: step.delta === 0 ? "0 ₫" : signedMoneyText(step.delta),
      balance: moneyText(step.balance),
      percent: step.key === "taxInside" ? null : pct(step.balance),
      composition,
      reading: fill(L.steps[step.key], words),
    };
  });
  const bothPercents = (state.discountPercent ?? 0) > 0 && (state.secondDiscountPercent ?? 0) > 0;
  return {
    kind: "ready",
    steps,
    scaleText: drawable ? fill(L.scale, { max: moneyText(max) }) : W.drawWithheld,
    withheld: !drawable,
    modeText: state.taxIncluded ? L.modeIncluded : L.modeExcluded,
    compositionText:
      r.tax > 0 ? fill(L.composition, { final: moneyText(r.finalPrice), net: moneyText(r.netPrice), tax: moneyText(r.tax) }) : null,
    successive: bothPercents
      ? fill(L.successive, {
          first: rate(state.discountPercent),
          second: rate(state.secondDiscountPercent),
          naive: percentText(r.naiveSumPercent),
          combined: percentText(r.combinedDiscountPercent),
        })
      : null,
  };
}

/* ------------------------------------------------------------- trials */

export type PriceTrialKey = "secondDiscountPercent" | "discountAmount" | "taxIncluded";
export const PRICE_TRIAL_KEYS: readonly PriceTrialKey[] = ["secondDiscountPercent", "discountAmount", "taxIncluded"];

export type PriceSnapshot = { final: number; finalText: string; saving: string; tax: string };
export type PriceTrial = Trial<PriceTrialKey, PriceSnapshot>;

export function priceSnapshot(state: PriceAdjustFormState): PriceSnapshot | null {
  const r = state.result;
  if (r === null) return null;
  return { final: r.finalPrice, finalText: moneyText(r.finalPrice), saving: moneyText(r.saving), tax: moneyText(r.tax) };
}

export function nextPriceValue(key: PriceTrialKey, values: FormValues): string | null {
  switch (key) {
    case "secondDiscountPercent":
      return stepDecimal(values.secondDiscountPercent ?? "", 5);
    case "discountAmount":
      return stepMoney(values.discountAmount ?? "", 50_000);
    case "taxIncluded":
      return values.taxIncluded === "yes" ? "no" : "yes";
  }
}

export function priceAvailability(key: PriceTrialKey, values: FormValues, state: PriceAdjustFormState): TrialAvailability {
  if (state.result === null) return { enabled: false, reason: state.tooMuch ? L.refused : W.blockedInvalid };
  if (!pricePrintable(state.result)) return { enabled: false, reason: W.blockedLimit };
  const next = nextPriceValue(key, values);
  if (next === null) return { enabled: false, reason: W.blockedStep };
  if (key === "secondDiscountPercent" && (parseDecimal(next) ?? 101) > 100) return { enabled: false, reason: L.blockedSecond };
  const after = priceAdjustFormState({ ...values, [key]: next }).result;
  if (after === null || !pricePrintable(after)) return { enabled: false, reason: W.blockedAfter };
  return { enabled: true };
}

export function makePriceTrial(key: PriceTrialKey, values: FormValues, revision: number, state: PriceAdjustFormState): PriceTrial | null {
  if (!priceAvailability(key, values, state).enabled) return null;
  const next = nextPriceValue(key, values);
  const snap = priceSnapshot(state);
  if (next === null || snap === null) return null;
  return { key, revision, before: { ...values }, after: { ...values, [key]: next }, beforeResult: snap, beforeLabel: "" };
}

export type PriceImpact = { key: PriceTrialKey; fieldLine: string; lines: readonly string[]; tradeoff: string };

export function priceImpact(trial: PriceTrial, after: PriceSnapshot): PriceImpact {
  const I = L.impact;
  const b = trial.beforeResult;
  const shown = (v: FormValues) =>
    trial.key === "taxIncluded"
      ? L.included[(v.taxIncluded === "yes" ? "yes" : "no") as "yes" | "no"]
      : trial.key === "discountAmount"
        ? `${v.discountAmount ?? ""} ₫`
        : `${v.secondDiscountPercent ?? ""}%`;
  return {
    key: trial.key,
    fieldLine: fill(W.field, { field: L.trials[trial.key].field, before: shown(trial.before), after: shown(trial.after) }),
    lines: [
      fill(I.final, { before: b.finalText, after: after.finalText, delta: signedMoneyText(after.final - b.final) }),
      fill(I.saving, { before: b.saving, after: after.saving }),
      fill(I.tax, { before: b.tax, after: after.tax }),
    ],
    tradeoff: I.tradeoff[trial.key],
  };
}
