import {
  accumulationSegments,
  cursorIndex,
  displayable,
  moneyText,
  type AccumulationImpact,
  type AccumulationView,
} from "@/components/calc/accumulation";
import {
  pairBars,
  stepMoney,
  type FormValues,
  type Trial,
  type TrialAvailability,
} from "@/components/calc/learning-trials";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { COMPOUND_LEARNING as L } from "@/content/calculators/compound-learning";
import { fill } from "@/lib/calc/charts/labels";
import type { CompoundResult } from "@/lib/calc/compound";
import type { Compounding } from "@/lib/calc/finance";
import { formatDecimal, formatMoney } from "@/lib/calc/number";

/*
 * /cong-cu/lai-kep/'s F3 panel — the pure half.
 *
 * THE ROWS ARE THE ENGINE'S CREDITED SNAPSHOTS: an opening row (nothing
 * credited yet) and then `yearlyBalances`, whose last row of a fractional term
 * sits at its REAL elapsed time — 1,5 năm, never "năm 2". The deposit is PER
 * COMPOUNDING PERIOD, and every label says which period that is.
 */

/** "1,5", "2", "0,25": up to two decimals, no trailing zeros. */
export function yearsText(years: number): string {
  if (Number.isInteger(years)) return formatDecimal(years, 0);
  return formatDecimal(years, 2).replace(/,?0+$/, "");
}

/**
 * Elapsed years for a label, to three decimals and marked "khoảng" when that
 * rounds: one daily period is "khoảng 0,003", 366 daily periods "khoảng
 * 1,003" — never "0 năm" and never a whole year that has not passed.
 */
export function yearsLabel(years: number): string {
  const rounded = Math.round(years * 1000) / 1000;
  const text =
    rounded === 0
      ? "dưới 0,001"
      : Number.isInteger(rounded)
        ? formatDecimal(rounded, 0)
        : formatDecimal(rounded, 3).replace(/0+$/, "");
  return Math.abs(rounded - years) < 1e-9 ? text : `khoảng ${text}`;
}

/** A period count, grouped ("3.650"); a fraction of a period keeps its decimals. */
const periodsText = (value: number) => (Number.isInteger(value) ? formatMoney(value, 0) : yearsText(value));

/** One compounding period in words: "tháng", "quý", "nửa năm", … */
export const periodWord = (compounding: Compounding) => L.periods[compounding] ?? L.periods.monthly;

/** Every figure the vessel would print is inside the formatter's display boundary. */
export function compoundDisplayable(result: CompoundResult | null, principal: number): boolean {
  if (result === null) return true;
  return displayable([
    principal,
    result.futureValue,
    result.totalContributed,
    ...result.yearlyBalances.flatMap((row) => [row.balance, row.contributed]),
  ]);
}

export function compoundTimelineView(
  result: CompoundResult | null,
  principal: number,
  contribution: number,
  compounding: Compounding,
  picked: number | null,
): AccumulationView | null {
  if (result === null || result.yearlyBalances.length === 0) return null;
  if (!compoundDisplayable(result, principal)) return null;
  const rows = [
    { elapsedPeriods: 0, elapsedYears: 0, partial: false, contributed: principal, balance: principal },
    ...result.yearlyBalances,
  ];
  const lastIndex = rows.length - 1;
  const index = cursorIndex(picked, lastIndex);
  const row = rows[index];
  // Balances never fall (rate ≥ 0, deposits ≥ 0), so the final one is the scale.
  const scale = Math.max(...rows.map((r) => r.balance));
  const segments = accumulationSegments(
    { initial: principal, contributed: row.contributed, balance: row.balance },
    scale,
    L.segments,
  );
  const [, added, interest] = segments;
  const period = periodWord(compounding);

  const notes: string[] = [L.anchors];
  if (contribution > 0) notes.push(fill(L.perPeriod, { amount: moneyText(contribution), period }));
  // Exact for a 0% rate: `toEffective(0, n)` is 0.
  if (result.effectiveAnnualRatePercent === 0) notes.push(L.zeroRate);
  if (result.uncreditedPeriods > 0) {
    notes.push(
      fill(L.credited, {
        periods: periodsText(result.periods),
        years: yearsLabel(result.creditedYears),
        uncredited: periodsText(result.uncreditedPeriods),
      }),
    );
  }

  const caption =
    index === 0
      ? L.captionStart
      : `${fill(L.caption, { years: yearsLabel(row.elapsedYears), periods: periodsText(row.elapsedPeriods), period })}${
          row.partial ? ` — ${L.partial}` : ""
        }`;

  return {
    index,
    lastIndex,
    caption,
    position: fill(L.position, { index: formatDecimal(index + 1, 0), count: formatDecimal(rows.length, 0) }),
    balanceText: fill(L.balance, { balance: moneyText(row.balance) }),
    segments,
    targetPercent: null,
    targetLine: null,
    scaleText: fill(L.scale, { scale: moneyText(scale) }),
    sentence:
      index === 0
        ? fill(L.momentStart, { initial: moneyText(principal) })
        : fill(L.moment, {
            years: yearsLabel(row.elapsedYears),
            periods: periodsText(row.elapsedPeriods),
            initial: moneyText(principal),
            added: added.text,
            interest: interest.text,
            balance: moneyText(row.balance),
          }),
    notes,
  };
}

export type CompoundTrialKey = "contribution";
export const COMPOUND_TRIAL_KEYS: readonly CompoundTrialKey[] = ["contribution"];

/** The engine's result on screen when a trial was pressed. */
export type CompoundSnapshot = {
  futureValue: number;
  totalContributed: number;
  totalInterest: number;
  periods: number;
};

export type CompoundTrial = Trial<CompoundTrialKey, CompoundSnapshot>;

/** +1 triệu PER COMPOUNDING PERIOD — the button names the period. */
export const compoundTrialLabel = (compounding: Compounding) =>
  fill(L.trials.contribution.label, { period: periodWord(compounding) });

/**
 * `blocked` is the page's own reason there is no result — a bad field, no
 * money, no whole period, or an unrepresentable growth — or null when there is
 * one. The button never blames a field that is not wrong.
 */
export function compoundTrialAvailability(blocked: string | null, values: FormValues): TrialAvailability {
  if (blocked !== null) return { enabled: false, reason: blocked };
  if (stepMoney(values.contribution ?? "", 1_000_000) === null) {
    return { enabled: false, reason: L.blocked.unrepresentable };
  }
  return { enabled: true };
}

export function makeCompoundTrial({
  values,
  revision,
  result,
}: {
  values: FormValues;
  revision: number;
  result: CompoundResult | null;
}): CompoundTrial | null {
  if (result === null || !compoundTrialAvailability(null, values).enabled) return null;
  const next = stepMoney(values.contribution ?? "", 1_000_000);
  if (next === null) return null;
  return {
    key: "contribution",
    revision,
    before: { ...values },
    after: { ...values, contribution: next },
    beforeResult: snapshotOf(result),
    beforeLabel: "",
  };
}

export const snapshotOf = (result: CompoundResult): CompoundSnapshot => ({
  futureValue: result.futureValue,
  totalContributed: result.totalContributed,
  totalInterest: result.totalInterest,
  periods: result.periods,
});

export function compoundImpactView(
  trial: CompoundTrial,
  now: CompoundResult,
  compounding: Compounding,
): AccumulationImpact {
  const before = trial.beforeResult;
  const I = L.impact;
  return {
    key: trial.key,
    heading: I.heading,
    barsTitle: I.barsTitle,
    barsNote: I.barsNote,
    bars: pairBars(before.futureValue, now.futureValue, { before: I.barsBefore, after: I.barsAfter }, CHART_UI.money),
    lines: [
      fill(I.change, {
        period: periodWord(compounding),
        delta: moneyText(now.futureValue - before.futureValue),
        contributed: moneyText(now.totalContributed - before.totalContributed),
        periods: periodsText(now.periods),
        interest: moneyText(now.totalInterest - before.totalInterest),
      }),
    ],
  };
}
