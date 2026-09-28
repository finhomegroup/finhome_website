import { announcementOf, type StatusView } from "@/components/calc/result-status";
import { leverValueText } from "@/components/retirement-granary-hero-view";
import { readRoutePlan } from "@/components/retirement-plan-read";
import type { RetirementPlanValue } from "@/components/retirement-plan-state";
import { fill } from "@/lib/calc/charts/labels";
import {
  granaryChange,
  retirementGranaryModel,
  type GranaryModel,
} from "@/lib/calc/charts/retirement-granary-chart";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { leverFacts } from "@/lib/calc/retirement-lever-facts";
import type { LeverKey } from "@/lib/calc/retirement-levers";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const H = C.hero;

/*
 * The retirement hero's teaching moment: after a lever press, the picture
 * says what that press did — "Bớt 2 năm thiếu", "Giờ đủ cả 25 năm" — and the
 * bowls it changed move once. Cause and effect, in the years the card counts.
 * The same words, with the lever and its new value, lead the ONE live
 * sentence, so a screen-reader user hears every press — including one that
 * leaves the verdict as it was (WCAG 4.1.3).
 *
 * Pure, and computed in the press handler, not in an effect: the next
 * values are known there, so the echo is exact and cannot lag a render.
 */

/** The echo of one lever press. */
export type ChangeEcho = {
  /** What the press did, in the card's years: "Bớt 2 năm thiếu". */
  text: string;
  /** The same, with the lever and its new value, for the live sentence. */
  said: string;
  /** Ages whose bowl the press changed. */
  ages: ReadonlySet<number>;
  /** Bumped on every press, so the same ages animate again. */
  serial: number;
};

/** A stable key for a set of field values. */
export const valuesKey = (values: Readonly<Record<string, string>>) =>
  JSON.stringify(values);

/**
 * What pressing `key` to `next` does to the granary, before it is pressed:
 * the plan is resolved for the next values — the same engine call the
 * provider makes on the next render — and the two drawings are compared in
 * the short years the card counts. Null when either side cannot be drawn.
 */
export function changeEcho(
  state: RetirementPlanValue,
  before: GranaryModel,
  key: LeverKey,
  next: string,
  serial: number,
): ChangeEcho | null {
  const values = { ...state.fields.values, [key]: next };
  const read = readRoutePlan(values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  const change = granaryChange(before, retirementGranaryModel(plan, H.figure));
  if (change === null) return null;
  const { shortBefore, shortAfter, span } = change;
  const E = H.change;
  const text =
    shortAfter === 0
      ? fill(shortBefore > 0 ? E.nowMet : E.stillMet, { count: span })
      : shortAfter < shortBefore
        ? fill(E.fewerShort, { count: shortBefore - shortAfter })
        : shortAfter > shortBefore
          ? fill(E.moreShort, { count: shortAfter - shortBefore })
          : E.sameShort;
  const said = fill(H.pressSaid, {
    label: C.form.statusActions[key],
    value: leverValueText(key, leverFacts(values)),
    change: text,
  });
  return { text, said, ages: new Set(change.changedAges), serial };
}

/**
 * The ONE live sentence: the last press, when there is one, then the settled
 * conclusion — so two presses that leave the verdict alone still read as two
 * different sentences, and each is announced once it settles.
 */
export function pressAnnouncement(press: ChangeEcho | null, view: StatusView): string {
  const conclusion = announcementOf(view);
  return press === null ? conclusion : `${press.said} ${conclusion}`;
}
