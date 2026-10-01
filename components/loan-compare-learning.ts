import { displayable } from "@/components/calc/accumulation";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { LOAN_COMPARE_LEARNING as L } from "@/content/calculators/loan-compare-learning";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import {
  MAX_COMPARE_MONTHS,
  type LoanComparison,
  type LoanComparisonRow,
} from "@/lib/calc/loan-compare";
import { formatMoney } from "@/lib/calc/number";
import { atLedgerZero } from "@/lib/calc/result-status";

/*
 * The comparison pair's living-infographic adapter (F5): /cong-cu/so-sanh-
 * khoan-vay/ and /cong-cu/lai-co-dinh-hay-tha-noi/.
 *
 * Pure: no React, no DOM. NO NEW ARITHMETIC ON MONEY beyond differences and
 * shares of figures `compareLoans` returned. It decides two things:
 *
 * 1. THE GUARD — whether the page may name a cheapest option at all. Only
 *    when every offer IN USE priced, none is marked "Chưa biết đủ phí", and
 *    at least two are complete. A sole option is not a winner; exact ties are
 *    ties, never "the first one".
 * 2. THE LANES — three readings, each on its own NAMED common scale:
 *    payments (largest instalment), horizon cost = interest + upfront fee +
 *    exit fee (largest such cost), and the debt still owed (the amount lent).
 */

const MONTHLY = (figure: number) =>
  Math.abs(figure) < 1e6 ? `${formatMoney(figure)} ₫` : `${formatMoney(figure / 1e6, 2)} triệu`;
/** The amount lent, as a scale name only: "2 tỷ". */
const ROUNDED = (figure: number) => compactMoney(figure, CHART_UI.money);
/**
 * A comparison figure: triệu with ONE decimal and a grouped whole part
 * ("1.816,3 triệu"), đồng below a million. A one-decimal tỷ made the two
 * shipped debts both read "1,8 tỷ" (2026-09-29 review).
 */
const COMPARE = (figure: number) =>
  Math.abs(figure) < 1e6 ? `${formatMoney(figure)} ₫` : `${formatMoney(figure / 1e6, 1)} triệu`;
/**
 * The same for a GROUP read side by side: if two unequal figures would still
 * print alike, the whole group goes to full đồng rather than hide the
 * difference. Equal figures may read alike.
 */
export function compareTexts(values: readonly number[]): string[] {
  const texts = values.map(COMPARE);
  const clash = texts.some((text, i) =>
    texts.some((other, j) => j !== i && other === text && !atLedgerZero(values[i] - values[j])),
  );
  return clash ? values.map((value) => `${formatMoney(value)} ₫`) : texts;
}
const share = (part: number, whole: number) => (whole > 0 ? (Math.max(0, part) / whole) * 100 : 0);

/** What the page knows about each column, positionally A/B/C. */
export type CompareColumnFacts = {
  /** Any box of the column holds text. An empty third column is not in use. */
  inUse: readonly boolean[];
  /** A non-empty box cannot be read (or half a promotion). */
  malformed: readonly boolean[];
  /** The reader ticked "Chưa biết đủ phí" for that offer. */
  unknownFees: readonly boolean[];
};

export type CompareGuard = {
  /** A cheapest option, spread and winner change may be stated. */
  ranked: boolean;
  /** Why not, when not. */
  reason: "invalid" | "unknownFees" | "tooFew" | "limit" | null;
  /** Positions that block the ranking, for the sentence that names them. */
  blocking: readonly number[];
  /** Per position: in use AND marked unknown — its fee totals are not shown. */
  feesUnknown: readonly boolean[];
  /** Positions tied for the lowest horizon cost (≥ 1 when ranked). */
  best: readonly number[];
  /** The same over the full term. */
  bestFullTerm: readonly number[];
  /** Every priced option costs the same at the horizon. */
  allTied: boolean;
  /** The horizon and full-term winners are each unique and differ. */
  winnerChanges: boolean;
};

function tiedLowest(rows: readonly LoanComparisonRow[], pick: (row: LoanComparisonRow) => number): number[] {
  if (rows.length === 0) return [];
  // A non-finite figure has no rank: no lowest, rather than a NaN-derived one.
  if (rows.some((row) => !Number.isFinite(pick(row)))) return [];
  const low = Math.min(...rows.map(pick));
  return rows.filter((row) => atLedgerZero(pick(row) - low)).map((row) => row.index);
}

export function compareGuard(result: LoanComparison | null, facts: CompareColumnFacts): CompareGuard {
  const active = facts.inUse.map((used, index) => (used ? index : -1)).filter((index) => index >= 0);
  const invalid = active.filter(
    (index) => facts.malformed[index] || (result !== null && result.rows[index] == null),
  );
  const feesUnknown = facts.inUse.map((used, index) => used && Boolean(facts.unknownFees[index]));
  const unknown = active.filter((index) => feesUnknown[index] && !invalid.includes(index));
  const complete = (result?.rows ?? []).filter(
    (row): row is LoanComparisonRow =>
      row !== null && active.includes(row.index) && !invalid.includes(row.index) && !feesUnknown[row.index],
  );

  let reason: CompareGuard["reason"] =
    invalid.length > 0 ? "invalid" : unknown.length > 0 ? "unknownFees" : complete.length < 2 || result === null ? "tooFew" : null;
  const lowest = reason === null ? tiedLowest(complete, (row) => row.horizonCost) : [];
  const lowestFullTerm = reason === null ? tiedLowest(complete, (row) => row.costOfBorrowing) : [];
  // Nothing to index: never `best[0]` of an empty list, never a NaN winner.
  if (reason === null && (lowest.length === 0 || lowestFullTerm.length === 0)) reason = "limit";
  const ranked = reason === null;
  const best = ranked ? lowest : [];
  const bestFullTerm = ranked ? lowestFullTerm : [];
  return {
    ranked,
    reason,
    blocking: reason === "invalid" ? invalid : reason === "unknownFees" ? unknown : [],
    feesUnknown,
    best,
    bestFullTerm,
    allTied: ranked && best.length === complete.length,
    winnerChanges: ranked && best.length === 1 && bestFullTerm.length === 1 && best[0] !== bestFullTerm[0],
  };
}

/** Names joined positionally: "Phương án B và Phương án C". */
export const namesOf = (indexes: readonly number[], labels: readonly string[]) =>
  indexes.map((index) => labels[index] ?? `#${index + 1}`).join(L.and);

/**
 * Positions tied for the LOWEST FIRST instalment among the priced offers in
 * use — so the payment chart never names the first of two equal payments as
 * "the lowest". Fee-independent: an unknown-fee offer counts.
 */
export function lowestFirstPayment(
  result: LoanComparison | null,
  inUse: readonly boolean[],
): { indexes: number[]; value: number } | null {
  const rows = (result?.rows ?? []).filter((row): row is LoanComparisonRow => row !== null && inUse[row.index]);
  if (rows.length === 0) return null;
  const value = Math.min(...rows.map((row) => row.monthlyPayment));
  return { indexes: rows.filter((row) => atLedgerZero(row.monthlyPayment - value)).map((row) => row.index), value };
}

/** One offer's three readings. */
export type CompareLane = {
  index: number;
  label: string;
  state: "ok" | "feesUnknown" | "invalid";
  structure: string | null;
  firstText: string | null;
  firstPercent: number;
  /** Null without a promotional reset. */
  reset: { month: number; text: string; percent: number } | null;
  cost:
    | { known: true; total: string; parts: readonly { key: "interest" | "upfront" | "exit"; percent: number; text: string }[] }
    | { known: false; interestText: string; interestPercent: number }
    | null;
  balanceText: string | null;
  balancePercent: number;
  /** The loan matured before the horizon: the month it did. */
  paidOffMonth: number | null;
  fullTermText: string | null;
};

export type CompareLanesView = {
  horizon: number;
  caption: string;
  verdict: { tone: "best" | "tie" | "blocked"; text: string };
  paymentsScale: string;
  costTitle: string;
  costScale: string;
  balanceTitle: string;
  balanceScale: string;
  lanes: readonly CompareLane[];
  /** The horizon control's range: 0 → the longest term plus two years. */
  sliderMax: number;
  longestTerm: number;
};

/** The slider's upper end: past the longest maturity, so "after payoff" is reachable. */
export function horizonMax(result: LoanComparison, current: number): number {
  const longest = Math.max(0, ...result.rows.map((row) => row?.months ?? 0));
  return Math.min(MAX_COMPARE_MONTHS, Math.max(longest + 24, current));
}

/** A step of the horizon control, clamped. Pressing it twice moves twice. */
export function horizonStep(current: number, delta: number, max: number): number {
  return Math.min(Math.max(0, Math.round(current + delta)), max);
}

export function compareLanesView(
  result: LoanComparison | null,
  guard: CompareGuard,
  facts: CompareColumnFacts,
  optionLabels: readonly string[],
): CompareLanesView | null {
  if (result === null) return null;
  const horizon = result.horizonMonths;
  const priced = result.rows.filter((row): row is LoanComparisonRow => row !== null && facts.inUse[row.index]);

  const payMax = Math.max(0, ...priced.map((row) => Math.max(row.monthlyPayment, row.resetPayment)));
  // Only KNOWN costs set the cost scale; an unknown offer shows its interest.
  const costMax = Math.max(
    0,
    ...priced.map((row) => (guard.feesUnknown[row.index] ? row.horizonInterest : row.horizonCost)),
  );

  const lanes: CompareLane[] = [];
  // Side-by-side groups, each distinguishable (see `compareTexts`).
  const inUseRows = facts.inUse.map((used, index) => (used ? result.rows[index] : null));
  const groupText = (pick: (row: LoanComparisonRow) => number, include: (index: number) => boolean) => {
    const indexes = inUseRows.map((row, index) => (row != null && include(index) ? index : -1)).filter((i) => i >= 0);
    const texts = compareTexts(indexes.map((index) => pick(inUseRows[index] as LoanComparisonRow)));
    return (index: number) => texts[indexes.indexOf(index)] ?? "";
  };
  const known = (index: number) => !guard.feesUnknown[index];
  const balanceText = groupText((row) => row.horizonBalance, () => true);
  const costText = groupText((row) => row.horizonCost, known);
  const fullText = groupText((row) => row.costOfBorrowing, known);
  const interestText = groupText((row) => row.horizonInterest, () => true);
  facts.inUse.forEach((used, index) => {
    if (!used) return;
    const label = optionLabels[index] ?? `#${index + 1}`;
    const row = result.rows[index];
    if (row == null || facts.malformed[index]) {
      lanes.push({
        index,
        label,
        state: "invalid",
        structure: null,
        firstText: null,
        firstPercent: 0,
        reset: null,
        cost: null,
        balanceText: null,
        balancePercent: 0,
        paidOffMonth: null,
        fullTermText: null,
      });
      return;
    }
    const unknown = guard.feesUnknown[index];
    lanes.push({
      index,
      label,
      state: unknown ? "feesUnknown" : "ok",
      structure:
        row.resetMonth === null ? L.structureConstant : fill(L.structurePhased, { month: row.resetMonth }),
      firstText: MONTHLY(row.monthlyPayment),
      firstPercent: share(row.monthlyPayment, payMax),
      reset:
        row.resetMonth === null
          ? null
          : { month: row.resetMonth, text: MONTHLY(row.resetPayment), percent: share(row.resetPayment, payMax) },
      cost: unknown
        ? { known: false, interestText: interestText(index), interestPercent: share(row.horizonInterest, costMax) }
        : {
            known: true,
            total: costText(index),
            parts: [
              { key: "interest", percent: share(row.horizonInterest, costMax), text: interestText(index) },
              { key: "upfront", percent: share(row.upfrontFee, costMax), text: COMPARE(row.upfrontFee) },
              { key: "exit", percent: share(row.exitFeeAtHorizon, costMax), text: COMPARE(row.exitFeeAtHorizon) },
            ],
          },
      balanceText: balanceText(index),
      balancePercent: share(row.horizonBalance, result.amount),
      // `horizonMonths` is clamped to the row's own maturity by the engine.
      paidOffMonth: row.horizonMonths === row.months ? row.months : null,
      fullTermText: unknown ? null : fullText(index),
    });
  });

  const rowOf = (index: number) => result.rows[index] as LoanComparisonRow;
  let verdict: CompareLanesView["verdict"];
  if (!guard.ranked) {
    const key =
      guard.reason === "invalid"
        ? L.verdictInvalid
        : guard.reason === "unknownFees"
          ? L.verdictUnknown
          : guard.reason === "limit"
            ? L.limits.verdict
            : L.verdictTooFew;
    verdict = { tone: "blocked", text: fill(key, { options: namesOf(guard.blocking, optionLabels) }) };
  } else {
    const complete = priced.filter((row) => !guard.feesUnknown[row.index]);
    const cost = COMPARE(rowOf(guard.best[0]).horizonCost);
    const spread = COMPARE(Math.max(...complete.map((row) => row.horizonCost)) - rowOf(guard.best[0]).horizonCost);
    verdict = guard.allTied
      ? { tone: "tie", text: fill(L.verdictTiedAll, { horizon, cost }) }
      : guard.best.length > 1
        ? { tone: "tie", text: fill(L.verdictTiedSome, { horizon, options: namesOf(guard.best, optionLabels), cost, spread }) }
        : { tone: "best", text: fill(L.verdictBest, { horizon, option: optionLabels[guard.best[0]] ?? "", cost, spread }) };
  }

  return {
    horizon,
    caption: fill(L.caption, { horizon }),
    verdict,
    paymentsScale: fill(L.paymentsScale, { max: MONTHLY(payMax) }),
    costTitle: fill(L.costTitle, { horizon }),
    // The DRAWING scale, named as such. With any fee unknown it is not the
    // largest actual cost, and says so.
    costScale: fill(priced.some((row) => guard.feesUnknown[row.index]) ? L.costScaleUnknown : L.costScale, {
      max: COMPARE(costMax),
    }),
    balanceTitle: fill(L.balanceTitle, { horizon }),
    balanceScale: fill(L.balanceScale, { amount: ROUNDED(result.amount) }),
    lanes,
    sliderMax: horizonMax(result, horizon),
    longestTerm: Math.max(0, ...result.rows.map((row) => row?.months ?? 0)),
  };
}

/** The boxes a whole-tool limit can name. `amount` is shared by every column. */
export type CompareLimitKey = "amount" | "rate" | "term" | "fee" | "flatFee" | "exitFee" | "promoRate";

/** What the page knows about one column when it asks for a limit. */
export type CompareLimitColumn = {
  /** In use, no unreadable box, and both a rate and a term: the engine should price it. */
  complete: boolean;
  /** Its row from the engine — the comparison's, or a probe's when that was refused. */
  row: LoanComparisonRow | null;
  /** The parsed values typed into it, for naming the cause. */
  typed: {
    rate: number | null;
    termMonths: number | null;
    fee: number | null;
    flatFee: number | null;
    exitFee: number | null;
    promoRate: number | null;
  };
};

/**
 * Valid boxes, and still no comparison the page can print (release repair,
 * 2026-10-01): the engine priced a complete offer as nothing or as a
 * non-finite figure ("model"), or a figure it would print is ≥ 10^18
 * ("display").
 */
export type CompareLimit = {
  kind: "model" | "display";
  /** The offers affected, positionally. */
  columns: readonly number[];
  /** Boxes whose own value is the cause, in form order; empty = review neutrally. */
  fields: readonly { column: number | null; key: CompareLimitKey }[];
};

const rowFigures = (row: LoanComparisonRow) => [
  row.monthlyPayment,
  row.resetPayment,
  row.totalInterest,
  row.upfrontFee,
  row.exitFeeAtHorizon,
  row.costOfBorrowing,
  row.totalOutlay,
  row.horizonPaid,
  row.horizonInterest,
  row.horizonPrincipal,
  row.horizonBalance,
  row.horizonCost,
  row.extraVsBest,
  row.extraVsBestFullTerm,
];
const rowRates = (row: LoanComparisonRow) =>
  [row.aprPercent, row.aprEffectivePercent, row.horizonAprPercent].filter((rate): rate is number => rate !== null);

/**
 * ONE LIMIT FOR THE WHOLE COMPARISON. Null when the amount is unreadable (the
 * field says so) and whenever every figure is printable — including the
 * ordinary incomplete, too-few, invalid and unknown-fee states, which stay
 * the guard's. Reads only `compareLoans`' own output; no ceiling, no formula.
 *
 * An inactive or incomplete column is never read, so it cannot block.
 */
export function compareLimit({
  amount,
  columns,
  spreads = [],
}: {
  amount: number | null;
  columns: readonly CompareLimitColumn[];
  /** The comparison's own spreads, when it produced one. */
  spreads?: readonly number[];
}): CompareLimit | null {
  if (amount === null) return null;
  const amountTooLarge = !displayable([amount]);
  let model = false;
  const affected: number[] = [];
  columns.forEach((column, index) => {
    if (!column.complete) return;
    if (column.row === null) {
      model = true;
      affected.push(index);
      return;
    }
    const figures = [...rowFigures(column.row), ...rowRates(column.row)];
    if (figures.some((figure) => !Number.isFinite(figure))) {
      model = true;
      affected.push(index);
    } else if (!displayable(figures)) {
      affected.push(index);
    }
  });
  const spreadBad = !displayable(spreads);
  if (!amountTooLarge && affected.length === 0 && !spreadBad) return null;
  if (affected.length === 0) {
    columns.forEach((column, index) => {
      if (column.complete) affected.push(index);
    });
  }

  const fields: { column: number | null; key: CompareLimitKey }[] = [];
  if (amountTooLarge) fields.push({ column: null, key: "amount" });
  for (const index of affected) {
    const typed = columns[index].typed;
    const own = (key: CompareLimitKey, value: number | null) => {
      if (value !== null && !displayable([value])) fields.push({ column: index, key });
    };
    own("rate", typed.rate);
    // A term the engine cannot schedule (outside 1 … 1.200 months) is its own cause.
    if (typed.termMonths !== null && (typed.termMonths < 1 || typed.termMonths > MAX_COMPARE_MONTHS)) {
      fields.push({ column: index, key: "term" });
    }
    own("fee", typed.fee);
    own("flatFee", typed.flatFee);
    own("exitFee", typed.exitFee);
    own("promoRate", typed.promoRate);
  }
  return { kind: model ? "model" : "display", columns: affected, fields };
}
