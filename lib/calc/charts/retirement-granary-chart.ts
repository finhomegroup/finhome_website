/**
 * The retirement granary: one bowl per year of retirement, filled by the
 * share of that year's SPEND that was paid — in two layers: the lower one is
 * the part other income pays (BHXH, rent…), the upper one the part the
 * savings paid of what they had to.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese. Unit-tested in
 * `retirement-granary-chart.test.ts`. The geometry is `granary-geometry.ts`;
 * the words are `retirement-granary-words.ts`.
 *
 * IT COMPUTES NOTHING. The same rule as `long-term-chart.ts`: every fill is
 * read off the engine's own ledger, and every string arrives from the page's
 * content file. What this adapter owns is the mapping from that ledger to
 * bowls: the savings' layer is 1 before `depletionAge`,
 * `lastWithdrawalPaid / lastWithdrawalPlanned` in that year, 0 after it; the
 * other-income layer is `otherAnnualIncome / desiredAnnualSpending` in every
 * year — both are today's money, indexed by the same inflation in the engine,
 * so the share never moves.
 *
 * THE VERDICT IS `retirementStatus`, which reads `fundedAtBoundary`: a
 * forgiven residue in the final year draws every bowl full even though the
 * projection reports a depletion there, exactly as the verdict row does.
 * A plan that needs no draw at all — other income covers the spend, or the
 * spend is zero — draws every bowl COVERED, never full: its savings paid
 * nothing, and a full bowl would credit them with what the pension did.
 */

import type { LongTermPlan } from "@/lib/calc/long-term-plan";
import { retirementStatus } from "@/lib/calc/retirement-status";
import { GROUP_SIZE } from "./granary-geometry";
import {
  granarySummary,
  type BowlState,
  type GranaryKind,
  type GranaryLabels,
  type ZeroNeedReason,
} from "./retirement-granary-words";

export {
  BOWL_STATES,
  shareText,
  type BowlState,
  type GranaryKind,
  type GranaryLabels,
  type ZeroNeedReason,
} from "./retirement-granary-words";

/**
 * `fill` is the share of the year's spend paid, 0–1: `other` (the lower,
 * other-income layer) plus `(1 − other) × savings`, where `savings` is the
 * share of the savings' own part they paid.
 */
export type Bowl = {
  age: number;
  fill: number;
  other: number;
  savings: number;
  state: BowlState;
};

export type GranaryModel =
  | { kind: "unavailable" }
  | {
      kind: GranaryKind;
      zeroNeedReason: ZeroNeedReason | null;
      /** Ages `retirementAge` … `endAge − 1`, one bowl each. */
      bowls: Bowl[];
      /** The bowls in groups of `GROUP_SIZE`. */
      groups: Bowl[][];
      /** The age of each group's first bowl. */
      ticks: { group: number; age: number }[];
      counts: Record<BowlState, number>;
      /** The first year not paid in full — the engine's `depletionAge`. */
      firstShortAge: number | null;
      /** Paid ÷ planned in the depletion year; null when it paid nothing. */
      partialShare: number | null;
      unit: string;
      /** The run-length text: every bowl, in words. */
      summary: string[];
    };

function stateOf(savings: number, other: number): BowlState {
  if (savings >= 1) return "full";
  if (savings > 0) return "partial";
  return other > 0 ? "otherOnly" : "empty";
}

export function retirementGranaryModel(
  plan: LongTermPlan | null,
  labels: GranaryLabels,
): GranaryModel {
  const status = retirementStatus(plan);
  if (plan === null || status.kind === "unknown") return { kind: "unavailable" };

  const { input, asEntered: result } = plan;
  const kind: GranaryKind =
    status.kind === "depleted"
      ? "short"
      : status.kind === "exactBoundary"
        ? "boundary"
        : status.kind === "fundedByOtherIncome" ||
            result.requiredRealBalanceAtRetirement === 0
          ? "zeroNeed"
          : "funded";
  const zeroNeedReason: ZeroNeedReason | null =
    kind !== "zeroNeed"
      ? null
      : status.kind === "fundedByOtherIncome"
        ? "otherIncome"
        : "noSpending";

  const depletion = kind === "short" ? result.depletionAge : null;
  const planned = result.lastWithdrawalPlanned;
  const paid = result.lastWithdrawalPaid;
  // Planned is positive whenever a depletion exists: a year that needed
  // nothing cannot fall short of it.
  const share =
    depletion !== null && planned !== null && paid !== null && planned > 0
      ? paid / planned
      : 0;

  // The share of every year's spend other income pays. A zero need is its
  // own kind: all of it (other income covers the spend) or none (no spend).
  const other =
    kind === "zeroNeed"
      ? zeroNeedReason === "otherIncome"
        ? 1
        : 0
      : input.desiredAnnualSpending > 0
        ? Math.min(1, input.otherAnnualIncome / input.desiredAnnualSpending)
        : 0;

  const bowls: Bowl[] = result.years
    .filter((row) => !row.accumulating)
    .map((row): Bowl => {
      if (kind === "zeroNeed") {
        return { age: row.age, fill: 1, other, savings: 0, state: "covered" };
      }
      const savings =
        depletion === null ? 1 : row.age < depletion ? 1 : row.age === depletion ? share : 0;
      // A paid year is exactly full: no float residue of `other + (1 − other)`.
      const fill = savings >= 1 ? 1 : other + (1 - other) * savings;
      return { age: row.age, fill, other, savings, state: stateOf(savings, other) };
    });

  const groups: Bowl[][] = [];
  for (let i = 0; i < bowls.length; i += GROUP_SIZE) {
    groups.push(bowls.slice(i, i + GROUP_SIZE));
  }

  const counts: Record<BowlState, number> = {
    full: 0,
    partial: 0,
    otherOnly: 0,
    empty: 0,
    covered: 0,
  };
  for (const bowl of bowls) counts[bowl.state] += 1;

  const facts = {
    kind,
    zeroNeedReason,
    counts,
    first: input.retirementAge,
    last: input.endAge - 1,
    depletion,
    partialShare: counts.partial > 0 ? share : null,
    otherShare: other,
  };

  return {
    kind,
    zeroNeedReason,
    bowls,
    groups,
    ticks: groups.map((group, index) => ({ group: index, age: group[0].age })),
    counts,
    firstShortAge: depletion,
    partialShare: facts.partialShare,
    unit:
      input.otherAnnualIncome > 0
        ? labels.unit.withOtherIncome
        : labels.unit.withoutOtherIncome,
    summary: granarySummary(facts, labels),
  };
}

/**
 * Years whose spend is NOT met in full — the plan's `yearsShort`, read off
 * the bowls: a covered year (other income, or nothing to spend) is met, so it
 * counts like a full one; a year other income only partly pays is short.
 * Null with no drawing.
 */
export function shortYears(model: GranaryModel): number | null {
  if (model.kind === "unavailable") return null;
  return model.bowls.length - model.counts.full - model.counts.covered;
}

/**
 * What one change did to the granary, for the hero's "vừa thay đổi" echo:
 * the short years before and after, the span after, and the ages whose bowl
 * looks different now (a new year included). Null unless both are drawn.
 */
export function granaryChange(
  before: GranaryModel,
  after: GranaryModel,
): { shortBefore: number; shortAfter: number; span: number; changedAges: number[] } | null {
  const shortBefore = shortYears(before);
  const shortAfter = shortYears(after);
  if (before.kind === "unavailable" || after.kind === "unavailable") return null;
  if (shortBefore === null || shortAfter === null) return null;
  const previous = new Map(before.bowls.map((bowl) => [bowl.age, bowl]));
  const changedAges = after.bowls
    .filter((bowl) => {
      const old = previous.get(bowl.age);
      return (
        old === undefined ||
        old.state !== bowl.state ||
        old.fill !== bowl.fill ||
        old.other !== bowl.other
      );
    })
    .map((bowl) => bowl.age);
  return { shortBefore, shortAfter, span: after.bowls.length, changedAges };
}
