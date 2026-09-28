/**
 * The words of the retirement granary: its vocabulary, the labels the page
 * supplies, and the sentences that say every bowl.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese — every word arrives
 * from the page's content file. Tested through `retirement-granary-chart.test.ts`,
 * the model that calls it.
 *
 * WHY A RUN-LENGTH TEXT IS LOSSLESS. `projectRetirement` pays each retirement
 * year's need in full until the first year it cannot (`depletionAge`); that
 * year pays `lastWithdrawalPaid` of `lastWithdrawalPlanned`; after it the
 * balance is exactly zero and every year pays nothing from savings. Other
 * income pays the same share of every year's spend (both are indexed by the
 * same inflation). So the bowls always read full… → at most one partial →
 * other-income-only… (or empty… with no other income), and three sentences
 * carry every bowl. No range is ever printed backwards, and no run of zero
 * years is ever printed at all.
 */

import { fill } from "@/lib/calc/charts/labels";
import { formatDecimal } from "@/lib/calc/number";

/**
 * `otherOnly`: the savings paid nothing that year, but other income still
 * paid its share — the bowl keeps its lower layer, it is not empty.
 */
export type BowlState = "full" | "partial" | "otherOnly" | "empty" | "covered";

/** The order the key lists the states in. */
export const BOWL_STATES: readonly BowlState[] = [
  "full",
  "partial",
  "otherOnly",
  "empty",
  "covered",
];

export type GranaryKind = "short" | "funded" | "boundary" | "zeroNeed";
export type ZeroNeedReason = "otherIncome" | "noSpending";

/** Every word the granary needs, supplied by the page's content file. */
export type GranaryLabels = {
  /** The figure's one-sentence caption: what one bowl is. */
  unit: { withOtherIncome: string; withoutOtherIncome: string };
  legend: {
    full: string;
    partial: string;
    otherOnly: string;
    empty: string;
    coveredOtherIncome: string;
    coveredNoSpending: string;
  };
  /** A run of ages: one age (`{age}`), or a span (`{from}`, `{to}`). */
  range: { one: string; span: string };
  summary: {
    /** `{count}` full years, over `{range}`. */
    fullRun: string;
    /** The first retirement year, `{age}`, is already not paid in full. */
    zeroFull: string;
    /** The depletion year `{age}` paid `{share}` of its need. */
    partial: string;
    /** `{count}` years at the end paid only by other income (`{share}` each), over `{range}`. */
    otherOnlyRun: string;
    /** Every one of `{count}` years paid only by other income (`{share}`), over `{range}`. */
    allOtherOnly: string;
    /** `{count}` empty years at the end, over `{range}`. */
    emptyRun: string;
    /** Every one of `{count}` years empty, over `{range}`. */
    allEmpty: string;
    /** Every one of `{count}` years paid in full, over `{range}`. */
    funded: string;
    /** Other income covers the spend in every one of `{count}` years. */
    otherIncome: string;
    /** The reader asked to spend nothing. */
    noSpending: string;
  };
  /** A share as a whole percent, and the two guards around 0 and 100. */
  share: { percent: string; below: string; above: string };
};

/**
 * A share as words: "14%", or a guard where rounding would say empty or full.
 *
 * Only ever called for a share strictly inside (0, 1) — a partial bowl — so
 * "dưới 1%" can never describe a year that paid nothing.
 */
export function shareText(share: number, labels: GranaryLabels["share"]): string {
  const rounded = formatDecimal(share * 100, 0);
  if (rounded === "0") return labels.below;
  if (rounded === "100") return labels.above;
  return fill(labels.percent, { value: rounded });
}

function rangeText(from: number, to: number, labels: GranaryLabels["range"]): string {
  return from === to ? fill(labels.one, { age: from }) : fill(labels.span, { from, to });
}

/** What the sentences need to know, all of it read off the model's bowls. */
export type GranaryFacts = {
  kind: GranaryKind;
  zeroNeedReason: ZeroNeedReason | null;
  counts: Record<BowlState, number>;
  /** First and last retirement ages: `retirementAge`, `endAge − 1`. */
  first: number;
  last: number;
  depletion: number | null;
  partialShare: number | null;
  /** The share of every year's spend other income pays, 0–1. */
  otherShare: number;
};

/** Every bowl, in words. */
export function granarySummary(facts: GranaryFacts, labels: GranaryLabels): string[] {
  const S = labels.summary;
  const { counts, first, last, depletion, partialShare, otherShare } = facts;
  const span = last - first + 1;
  const range = (from: number, to: number) => rangeText(from, to, labels.range);

  if (facts.kind === "zeroNeed") {
    return [
      facts.zeroNeedReason === "noSpending"
        ? S.noSpending
        : fill(S.otherIncome, { count: span }),
    ];
  }
  if (depletion === null) return [fill(S.funded, { count: span, range: range(first, last) })];
  if (counts.empty === span) {
    return [fill(S.allEmpty, { count: span, range: range(first, last) })];
  }
  // Other income is below the whole spend here (a zero need returned above),
  // so its share is strictly inside (0, 1) and `shareText` applies.
  const other = () => shareText(otherShare, labels.share);
  if (counts.otherOnly === span) {
    return [fill(S.allOtherOnly, { count: span, range: range(first, last), share: other() })];
  }

  const summary = [
    counts.full > 0
      ? fill(S.fullRun, { count: counts.full, range: range(first, depletion - 1) })
      : fill(S.zeroFull, { age: first }),
  ];
  if (partialShare !== null) {
    summary.push(
      fill(S.partial, { age: depletion, share: shareText(partialShare, labels.share) }),
    );
  }
  if (counts.otherOnly > 0) {
    summary.push(
      fill(S.otherOnlyRun, {
        count: counts.otherOnly,
        range: range(last - counts.otherOnly + 1, last),
        share: other(),
      }),
    );
  }
  if (counts.empty > 0) {
    summary.push(
      fill(S.emptyRun, { count: counts.empty, range: range(last - counts.empty + 1, last) }),
    );
  }
  return summary;
}
