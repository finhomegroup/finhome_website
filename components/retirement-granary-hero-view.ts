import type { LeverButton } from "@/components/calc/lever-stepper";
import type { StatusView } from "@/components/calc/result-status";
import { longTermMoney } from "@/components/calc/retirement-fields";
import type { RetirementPlanValue } from "@/components/retirement-plan-state";
import {
  assumptionsUsed,
  growthWords,
  inputAmount,
  sampleLine,
} from "@/components/retirement-plan-input-lines";
import { targetView, type TargetView } from "@/components/retirement-plan-target-view";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import {
  retirementGranaryModel,
  type GranaryModel,
} from "@/lib/calc/charts/retirement-granary-chart";
import { PLACEHOLDER } from "@/lib/calc/number";
import { projectRetirement } from "@/lib/calc/retirement";
import {
  annualEquivalent,
  contributionDelta,
  leverFacts,
  monthlyEquivalent,
  withSavingStep,
  type LeverFacts,
} from "@/lib/calc/retirement-lever-facts";
import {
  LEVER_STEP_PER_MONTH,
  LEVER_STEP_PER_YEAR,
  retirementLevers,
  type LeverKey,
  type LeverStep,
} from "@/lib/calc/retirement-levers";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const H = C.hero;

/** One lever, fully worded for `LeverStepper`. */
export type LeverView = {
  key: LeverKey;
  label: string;
  value: string;
  hint: string;
  down: LeverButton & { next: string | null };
  up: LeverButton & { next: string | null };
};

/** Everything the hero shows, resolved; the component only lays it out. */
export type HeroView = {
  /** The card's tone, word, title and fact — `retirementStatusView`'s own. */
  card: StatusView;
  /** The card's closing line: the limitation and the example inputs — or, with no plan, why. */
  closing: string;
  model: GranaryModel;
  levers: LeverView[];
  /** "Mục tiêu hưu trí": the capital to have at retirement, and one change that reaches it. */
  target: TargetView;
  /** What one saving step is worth by retirement, in today's money; null when there is no step. */
  stepTotal: string | null;
  /** The card's other reasons and what to try, in the reading disclosure. */
  reasons: string[];
  estimate: string;
  assumptions: string;
};

/** A lever's value as the hero shows it, from its own field's parse. */
export function leverValueText(key: LeverKey, facts: LeverFacts): string {
  if (key === "retirementAge") {
    return facts.retirementAge === null
      ? PLACEHOLDER
      : fill(H.levers.age, { age: facts.retirementAge });
  }
  const value = facts[key];
  if (value === null) return PLACEHOLDER;
  // The pension is asked per month on this route, and shown the same way.
  return key === "desiredMonthlySpending"
    ? fill(H.levers.perMonth, { amount: longTermMoney(value) })
    : longTermMoney(value);
}

/** Each money lever's step, in its field's own unit. */
const STEP: Record<Exclude<LeverKey, "retirementAge">, number> = {
  annualContribution: LEVER_STEP_PER_YEAR,
  desiredMonthlySpending: LEVER_STEP_PER_MONTH,
};

/**
 * The hero, worded. Pure — no hooks, no DOM — so the component can guard the
 * whole build with one try/catch: React's server renderer ignores error
 * boundaries, and the hero is optional where the form and the result are not.
 *
 * It computes no finance of its own: the one extra engine call is the saving
 * step's projection, whose difference from the plan's is the step's total.
 */
export function buildHeroView(state: RetirementPlanValue): HeroView {
  const { fields, plan, status, statusView, untouchedDefaults } = state;
  const values = fields.values;
  const facts = leverFacts(values);
  const growth = growthWords(facts.contributionGrowthPercent);

  const monthly = (value: number | null) =>
    value === null ? PLACEHOLDER : inputAmount(monthlyEquivalent(value));
  const hintOf: Record<LeverKey, string> = {
    annualContribution: fill(H.levers.annualContribution.hint, {
      monthly: monthly(facts.annualContribution),
      growthPhrase: growth.phrase,
    }),
    retirementAge:
      facts.savingYears === null || facts.retiredYears === null
        ? H.levers.blocks.unreadable
        : fill(H.levers.retirementAge.hint, {
            saving: facts.savingYears,
            span: facts.retiredYears,
          }),
    desiredMonthlySpending: fill(H.levers.desiredMonthlySpending.hint, {
      annual:
        facts.desiredMonthlySpending === null
          ? PLACEHOLDER
          : inputAmount(annualEquivalent(facts.desiredMonthlySpending)),
    }),
  };

  const levers = retirementLevers(values).map((lever): LeverView => {
    const copy = H.levers[lever.key];
    const label = C.form.statusActions[lever.key];
    const button = (step: LeverStep, text: string, name: string) => ({
      text,
      name: fill(name, { growthEach: growth.each }),
      enabled: step.next !== null,
      next: step.next,
    });
    // A "−" that can only reach 0 ₫ says so, in its text and its name.
    const current = lever.key === "retirementAge" ? null : facts[lever.key];
    const toZero =
      lever.key !== "retirementAge" &&
      lever.down.next === "0" &&
      current !== null &&
      current < STEP[lever.key];
    // A limit replaces the hint rather than adding a line, so the row below
    // cannot move when a press reaches it.
    const block = lever.down.block ?? lever.up.block;
    return {
      key: lever.key,
      label,
      value: leverValueText(lever.key, facts),
      hint: block === null ? hintOf[lever.key] : H.levers.blocks[block],
      down: toZero
        ? button(lever.down, H.levers.toZero, fill(H.levers.toZeroName, { label: label.toLowerCase() }))
        : button(lever.down, copy.down, copy.downName),
      up: button(lever.up, copy.up, copy.upName),
    };
  });

  const delta =
    plan === null || !levers[0].up.enabled
      ? null
      : contributionDelta(plan.asEntered, projectRetirement(withSavingStep(plan.input)));

  // With no plan, the card's own reason — which field, which rule — takes the
  // card's closing line, VISIBLE, rather than waiting in the disclosure.
  const unknown = statusView.tone === "unknown";
  return {
    card: statusView,
    closing: unknown
      ? C.form.invalidNotice
      : [H.limitation, sampleLine(untouchedDefaults)]
          .filter((text): text is string => text !== null)
          .join(" "),
    model: retirementGranaryModel(plan, H.figure),
    levers,
    target: targetView(plan, status),
    stepTotal:
      delta === null
        ? null
        : fill(H.stepTotal, {
            total: compactMoney(delta.realTotal, L.money),
            age: delta.lastContributionAge,
          }),
    reasons: [...(unknown ? [] : (statusView.reasons ?? [])), statusView.next ?? null].filter(
      (text): text is string => Boolean(text),
    ),
    estimate: C.form.estimateNote,
    assumptions: assumptionsUsed(values),
  };
}
