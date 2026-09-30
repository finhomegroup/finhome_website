/*
 * Display helpers for the three arithmetic-first living panels only
 * (tinh-phan-tram, margin-va-markup, giam-gia-va-thue). Not a scene library:
 * safe signed text for money and rates, and positions on one signed axis.
 *
 * Never a false 0, never "—", "NaN" or "Infinity" for a valid figure; a sign
 * is never lost at a display limit.
 */
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { fill } from "@/lib/calc/charts/labels";
import { formatDecimal, formatMoney } from "@/lib/calc/number";

const PRINT_MONEY = 1e18;
const PRINT_RATE = 1e15;

export const printableMoney = (v: number) => Number.isFinite(v) && Math.abs(v) < PRINT_MONEY;
export const printableRate = (v: number) => Number.isFinite(v) && Math.abs(v) < PRINT_RATE;

/** Đồng, signed, in the page's own grammar ("-300.000 ₫"). */
export function moneyText(value: number): string {
  if (!Number.isFinite(value)) return W.unavailable;
  if (Math.abs(value) >= PRINT_MONEY) return value < 0 ? W.tooLargeNegative : W.tooLarge;
  if (value !== 0 && Math.abs(value) < 0.5) return value < 0 ? W.underOneNegative : W.underOne;
  return `${formatMoney(value)} ₫`;
}

/** A number with a unit suffix, e.g. "%" or " điểm phần trăm". */
export function numberText(value: number, dp: number, unit: string): string {
  if (!Number.isFinite(value)) return W.unavailable;
  if (Math.abs(value) >= PRINT_RATE) return value < 0 ? W.tooLargeNegative : W.tooLarge;
  if (value !== 0 && Math.abs(value) < 0.5 * 10 ** -dp) {
    return fill(value < 0 ? W.tinyNegative : W.tinyPositive, { bound: `${formatDecimal(10 ** -dp, dp)}${unit}` });
  }
  return `${formatDecimal(value, dp)}${unit}`;
}
export const percentText = (value: number, dp = 2) => numberText(value, dp, "%");

/** A signed change in đồng: "+3.000.000 ₫" / "-300.000 ₫". */
export function signedMoneyText(value: number): string {
  const text = moneyText(value);
  return value > 0 && printableMoney(value) && Math.abs(value) >= 0.5 ? `+${text}` : text;
}

/** Most decimals any equation term is shown with. */
export const EQ_MAX_DECIMALS = 10;

/**
 * For a COMPUTED equation result: the fewest decimals (≥ `min`, ≤ 10) at
 * which `toFixed(dp)` read back differs from the value by no more than
 * FLOATING-POINT DUST — a few units in the last place, `64 × ε` relative.
 *
 * That separates the two cases the page must not confuse:
 * - dust: 0,1 + 0,2 = 0.30000000000000004 is off by ~1e−16 relative and
 *   reads "0,30" as exact;
 * - truncation: 1 ÷ 3 × 100 at 10 decimals is off by ~1e−12 relative — far
 *   above dust — so it is `exact: false` and shown "≈ 33,3333333333%".
 *
 * The earlier 1e−12 tolerance was exactly the size of a 10-decimal
 * truncation, so repeating results slipped through as exact. A result whose
 * float carries cancellation error beyond dust is also declared "≈" — the
 * conservative side: it never claims exactness it cannot show.
 */
export function decimalsFor(value: number, min: number): { dp: number; exact: boolean } {
  const dust = Math.abs(value) * 64 * Number.EPSILON;
  for (let dp = min; dp <= EQ_MAX_DECIMALS; dp += 1) {
    if (Math.abs(Number(value.toFixed(dp)) - value) <= dust) return { dp, exact: true };
  }
  return { dp: EQ_MAX_DECIMALS, exact: false };
}

/**
 * For an OPERAND the reader typed: the fewest decimals (≥ `min`, ≤ 10) at
 * which `toFixed(dp)` reads back as EXACTLY the same number. No tolerance —
 * a relative one let 1.000.000 and 1.000.000,000001 print identically. Null
 * when ten decimals cannot hold it (e.g. 0,00000000001).
 */
function operandDecimals(value: number, min: number): number | null {
  for (let dp = min; dp <= EQ_MAX_DECIMALS; dp += 1) {
    if (Number(value.toFixed(dp)) === value) return dp;
  }
  return null;
}

export type EqTerms =
  | { kind: "ok"; texts: string[]; dp: number }
  /** A term is past the print limit: the caller names it. */
  | { kind: "unprintable" }
  /** Ten decimals cannot show the terms truthfully: the caller names the limit. */
  | { kind: "precision" };

/**
 * The OPERANDS of one equation at ONE shared precision, so near-equal terms
 * stay distinguishable: 7,001 and 7,002 print as "7,001" and "7,002", never
 * both as "7,00". Every term must read back EXACTLY at that precision, and
 * distinct values must print distinctly — otherwise `precision`, and the
 * page says so instead of showing fabricated arithmetic such as
 * "0,0000000000 − 0,0000000000".
 */
export function eqTerms(kind: "rate" | "money", values: readonly number[], min: number): EqTerms {
  const printable = kind === "money" ? printableMoney : printableRate;
  if (values.some((v) => !printable(v))) return { kind: "unprintable" };
  const dps = values.map((v) => operandDecimals(v, min));
  if (dps.some((d) => d === null)) return { kind: "precision" };
  const dp = Math.max(min, ...(dps as number[]));
  const texts = values.map((v) => (kind === "money" ? formatMoney(v, dp) : formatDecimal(v, dp)));
  for (let i = 0; i < values.length; i += 1) {
    for (let j = i + 1; j < values.length; j += 1) {
      if (values[i] !== values[j] && texts[i] === texts[j]) return { kind: "precision" };
    }
  }
  return { kind: "ok", texts, dp };
}

/**
 * An equation RESULT: exact when it can be, "≈ …" when ten decimals still
 * round it, named past the print limit, and never a rounded-away "0".
 */
export function eqResult(kind: "rate" | "money", value: number, min: number, unit: string): string {
  const printable = kind === "money" ? printableMoney : printableRate;
  if (!printable(value)) return kind === "money" ? moneyText(value) : numberText(value, 2, "");
  const { dp, exact } = decimalsFor(value, min);
  const text = kind === "money" ? formatMoney(value, dp) : formatDecimal(value, dp);
  if (value !== 0 && /^-?0(,0*)?$/.test(text)) return numberText(value, EQ_MAX_DECIMALS, unit);
  return `${exact ? "" : "≈ "}${text}${unit}`;
}

export type AxisBar = { from: number; to: number; negative: boolean };

/**
 * One signed axis from min(0, values) to max(0, values). Null when any value
 * cannot be drawn (non-finite or past the print limit): the caller says so.
 */
export function signedAxis(values: readonly number[], printable: (v: number) => boolean) {
  if (values.some((v) => !printable(v))) return null;
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  const span = hi - lo;
  const at = (v: number) => (span > 0 ? ((v - lo) / span) * 100 : 0);
  const bar = (v: number): AxisBar => {
    const a = at(0);
    const b = at(v);
    return { from: Math.min(a, b), to: Math.max(a, b), negative: v < 0 };
  };
  return { lo, hi, zero: at(0), bar, hasNegative: lo < 0 };
}
