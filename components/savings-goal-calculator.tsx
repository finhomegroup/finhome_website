"use client";

import { useState } from "react";
import { AccumulationLearningPanel } from "@/components/accumulation-learning-panel";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { onlyTried, useTrialStack } from "@/components/calc/learning-trials";
import {
  makeSavingsTrial,
  savingsDisplayable,
  savingsImpactView,
  savingsTimelineView,
  savingsTrialAvailability,
  savingsTrialField,
  savingsTrialKeys,
  type SavingsSnapshot,
  type SavingsTrialKey,
} from "@/components/savings-learning";
import { SAVINGS_LEARNING } from "@/content/calculators/savings-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { readDateFields } from "@/lib/calc/date-input";
import { addMonths, type CalendarDate } from "@/lib/calc/dates";
import {
  houseFundTarget,
  planHouseFund,
  type HouseFundPlan,
} from "@/lib/calc/house-fund";
import {
  computeSavingsGoal,
  type SavingsGoalMode,
} from "@/lib/calc/savings-goal";
import {
  MAX_PROJECTION_MONTHS,
  projectSavings,
  savingsScheduleFor,
  type SavingsSchedule,
} from "@/lib/calc/savings-schedule";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import {
  savingsChartModel,
  savingsPathsModel,
} from "@/lib/calc/charts/savings-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { SAVINGS_GOAL as C } from "@/content/calculators/savings-goal";

/** Which of the three figures each mode asks for, and which it solves. */
const MODES = {
  contribution: { needsTarget: true, needsContribution: false, needsMonths: true },
  months: { needsTarget: true, needsContribution: true, needsMonths: false },
  target: { needsTarget: false, needsContribution: true, needsMonths: true },
} as const satisfies Record<
  SavingsGoalMode,
  { needsTarget: boolean; needsContribution: boolean; needsMonths: boolean }
>;

const FORM_ID = "muc-tieu-tiet-kiem-nhap";
const RESULT_ID = "muc-tieu-tiet-kiem-ket-qua";

/*
 * CSV row 5, "Hai cột": "Cho chọn mục tiêu trước; đưa số cần góp mỗi tháng và
 * ngày đạt mục tiêu lên đầu kết quả."
 *
 * The first clause was ALREADY SATISFIED and is left as it stands, not
 * reimplemented: the two radio groups — which figure to solve for, and whether
 * the goal is an amount or a house composition — are the first thing in the
 * form, and the boxes that follow are only the ones the chosen question needs.
 * The §8 test asserts that ordering rather than assuming it.
 *
 * The second clause is the change. The contribution and the attainment date
 * both existed, but the date sat third behind a composition row and the
 * headline group was followed by eight notices, three of which are about a
 * comparison the reader has not asked for yet. Now the group leads with the
 * solved figure — emphasised, the one emphasised row on the page — and the
 * calendar date is the row directly under it; everything conditional follows.
 * In the two modes where the monthly contribution is TYPED rather than solved
 * it stays an input beside the answer instead of being restated as a result.
 */
export function SavingsGoalCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  const initialValues = {
    mode: C.form.defaultMode,
    goalSource: C.form.defaultGoalSource,
    initial: C.form.defaultInitial,
    target: C.form.defaultTarget,
    price: C.form.defaultPrice,
    downPercent: C.form.defaultDownPercent,
    costPercent: C.form.defaultCostPercent,
    reserve: C.form.defaultReserve,
    contribution: C.form.defaultContribution,
    months: C.form.defaultMonths,
    rate: C.form.defaultRate,
    startDay: C.form.defaultStartDay,
    startMonth: C.form.defaultStartMonth,
    startYear: C.form.defaultStartYear,
    higherContribution: C.form.defaultHigherContribution,
  };
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. The month count, the date parts and the two selects
  // format nothing.
  const raw = useCalcFields(initialValues, {
    initial: "money",
    target: "money",
    price: "money",
    downPercent: "rate",
    costPercent: "rate",
    reserve: "money",
    contribution: "money",
    rate: "rate",
    higherContribution: "money",
  });

  /*
   * THE F3 TRIAL STACK (2026-09-29). A press writes one TYPED field through
   * the RAW binding; everything the reader does — a keystroke, a mode switch,
   * "Hôm nay", "Về ví dụ mẫu" — goes through `fields`, which retires every
   * trial first. The solved figure is never written by a trial.
   */
  const learning = useTrialStack<SavingsTrialKey, SavingsSnapshot>(raw.values);
  /** The schedule row the panel's cursor is on; null = the last row. */
  const [pickedPoint, setPickedPoint] = useState<number | null>(null);
  const fields = {
    values: raw.values,
    bind: (key: keyof typeof initialValues) => {
      const binding = raw.bind(key);
      return {
        ...binding,
        onValueChange: (next: string) => {
          learning.dispatch({ type: "edit" });
          binding.onValueChange(next);
        },
      };
    },
    reset: () => {
      learning.dispatch({ type: "reset" });
      setPickedPoint(null);
      raw.reset();
    },
  };

  const pristine = (
    Object.keys(initialValues) as (keyof typeof initialValues)[]
  ).every((key) => fields.values[key] === initialValues[key]);

  const mode = fields.values.mode as SavingsGoalMode;
  const needs = MODES[mode];
  // The home-purchase composition only applies where there IS a goal to
  // compose: "cuối kỳ có bao nhiêu" solves the balance and has no target, so
  // offering the price fields there would render four inputs that change
  // nothing.
  const fromHouse = needs.needsTarget && fields.values.goalSource === "house";

  const initial = parseMoney(fields.values.initial);
  const typedTarget = parseMoney(fields.values.target);
  const contribution = parseMoney(fields.values.contribution);
  // `parseCount`, not `parseDecimal`: this is a count of contributions, and
  // docs §4's grammar table is explicit — `parseDecimal("1.200")` is 1,2, so a
  // typed 1.200 months silently became one and a bit.
  const months = parseCount(fields.values.months);
  const rate = parseDecimal(fields.values.rate);

  // The house composition. Money fields with `parseMoney`, the two shares with
  // `parseDecimal` — a share typed "30.5" is 30,5 and not 305.
  const price = parseMoney(fields.values.price);
  const downPercent = parseDecimal(fields.values.downPercent);
  const costPercent = parseDecimal(fields.values.costPercent);
  const reserve = parseMoney(fields.values.reserve);

  const priceInvalid = fromHouse && (price === null || price <= 0);
  const downPercentInvalid =
    fromHouse && (downPercent === null || downPercent < 0 || downPercent > 100);
  const costPercentInvalid =
    fromHouse && (costPercent === null || costPercent < 0 || costPercent > 100);
  const reserveInvalid = fromHouse && (reserve === null || reserve < 0);

  const composition =
    fromHouse &&
    !priceInvalid &&
    !downPercentInvalid &&
    !costPercentInvalid &&
    !reserveInvalid
      ? houseFundTarget({
          price: price as number,
          downPaymentPercent: downPercent as number,
          purchaseCostPercent: costPercent as number,
          reserve: reserve as number,
        })
      : null;

  // ONE target, whichever way it was arrived at. The rest of the tool is
  // unchanged by the composition: it is a different way to fill this box, not
  // a second savings engine.
  const target = fromHouse ? (composition?.target ?? null) : typedTarget;

  const initialInvalid = initial === null || initial < 0;
  const targetInvalid = needs.needsTarget && (target === null || target < 0);
  const contributionInvalid =
    needs.needsContribution && (contribution === null || contribution < 0);
  // Bounded on the TYPED value, so the field shows its own error rather than
  // the tool silently clamping a horizon nobody asked for.
  const monthsInvalid =
    needs.needsMonths &&
    (months === null || months < 1 || months > MAX_PROJECTION_MONTHS);
  const rateInvalid = rate === null || rate < 0;

  // The comparison is optional: an empty box is "no comparison", not an error.
  const higherRaw = fields.values.higherContribution.trim();
  const higherContribution = higherRaw === "" ? null : parseMoney(higherRaw);
  const higherInvalid =
    higherRaw !== "" && (higherContribution === null || higherContribution < 0);

  const start = readDateFields(
    fields.values.startYear,
    fields.values.startMonth,
    fields.values.startDay,
  );

  const fieldsUsable =
    !initialInvalid &&
    !targetInvalid &&
    !contributionInvalid &&
    !monthsInvalid &&
    !rateInvalid &&
    !priceInvalid &&
    !downPercentInvalid &&
    !costPercentInvalid &&
    !reserveInvalid &&
    !higherInvalid;

  const result = fieldsUsable
    ? computeSavingsGoal({
        mode,
        initial,
        annualRatePercent: rate,
        // Each mode passes only the two figures it needs; the third is what
        // the module solves for and must not be handed in.
        target: needs.needsTarget ? (target ?? undefined) : undefined,
        contribution: needs.needsContribution
          ? (contribution ?? undefined)
          : undefined,
        months: needs.needsMonths ? (months ?? undefined) : undefined,
      })
    : null;

  /**
   * The DISCRETE schedule — the one the headline, the chart and the details
   * all read, so they cannot sit at three different horizons.
   *
   * When the solver has an answer the schedule is derived from it. When it
   * does not, "how long" is still a question the schedule can answer honestly
   * — already funded, frozen, or not fundable inside the supported horizon —
   * so it is built from the typed inputs instead of falling through to the
   * generic three-cause notice.
   */
  const schedule: SavingsSchedule | null =
    result !== null
      ? savingsScheduleFor(result, rate ?? 0, mode)
      : fieldsUsable && mode === "months" && target !== null
        ? projectSavings({
            initial: initial ?? 0,
            contribution: contribution ?? 0,
            monthlyRate: (rate ?? 0) / 100 / 12,
            target,
          })
        : null;

  // Every field parses, but the combination has no answer — already at the
  // target, a negative required contribution, or a balance that never moves.
  // The schedule status names which, where it can.
  const status = schedule?.status ?? null;
  const noResult =
    fieldsUsable &&
    result === null &&
    status !== "alreadyFunded" &&
    status !== "unattainable" &&
    status !== "beyondLimit";

  /**
   * The contribution the plan actually runs on.
   *
   * In "months" mode the reader typed it; in "contribution" mode the solver
   * produced it. Either way the DATED plan and the comparison are driven by
   * the same figure the headline reports, so the two cannot disagree.
   */
  const planContribution =
    mode === "contribution" ? (result?.contribution ?? null) : contribution;

  /**
   * The dated plan, from `house-fund.ts`.
   *
   * Only in the two goal-seeking modes: "cuối kỳ có bao nhiêu" has no goal to
   * reach, so it has no attainment date — its calendar figure is the end of
   * the horizon, computed below.
   */
  const plan: HouseFundPlan | null =
    needs.needsTarget &&
    fieldsUsable &&
    start.date !== null &&
    target !== null &&
    planContribution !== null &&
    initial !== null &&
    rate !== null
      ? planHouseFund({
          target,
          start: start.date,
          initial,
          contribution: planContribution,
          annualRatePercent: rate,
          comparisonContribution: higherContribution ?? undefined,
        })
      : null;

  /** The end of a fixed horizon — the only date "target" mode has. */
  const horizonEndDate =
    !needs.needsTarget && start.date !== null && months !== null
      ? addMonths(start.date, months)
      : null;

  const comparisonAsked = higherRaw !== "" && !higherInvalid;
  const comparisonNotHigher =
    comparisonAsked &&
    higherContribution !== null &&
    planContribution !== null &&
    higherContribution <= planContribution;
  const higherLeg = plan?.higher ?? null;
  const comparisonOneLeg =
    higherLeg !== null && plan !== null && plan.monthsEarlier === null;

  // --- the F3 panel: every figure from `schedule` or a trial's record ---
  const snapshot: SavingsSnapshot = {
    mode,
    contribution: planContribution,
    fundedMonth: schedule?.fundedMonth ?? null,
    balance: schedule && schedule.status !== "invalid" ? schedule.balance : null,
    totalContributed: schedule && schedule.status !== "invalid" ? schedule.totalContributed : null,
    interest: schedule && schedule.status !== "invalid" ? schedule.interest : null,
  };
  // Past the formatter's display boundary there is nothing printable to try on.
  const printable = savingsDisplayable(schedule, needs.needsTarget ? target : null);
  const trialUsable = fieldsUsable && schedule !== null && schedule.status !== "invalid" && printable;
  const trialKeys = savingsTrialKeys(mode);
  const latestTrial = learning.trials.at(-1) ?? null;
  const trialImpact = latestTrial !== null && trialUsable ? savingsImpactView(latestTrial, snapshot) : null;
  const tryKey = (key: SavingsTrialKey) => {
    const trial = makeSavingsTrial({
      key,
      values: raw.values,
      revision: learning.state.revision,
      snapshot,
      usable: trialUsable,
    });
    if (trial === null) return;
    const field = savingsTrialField(key);
    learning.dispatch({ type: "apply", trial });
    raw.bind(field).onValueChange(trial.after[field]);
  };
  const undoTrial = () => {
    if (latestTrial === null) return;
    const field = savingsTrialField(latestTrial.key);
    learning.dispatch({ type: "undo" });
    raw.bind(field).onValueChange(latestTrial.before[field]);
  };
  const timeline = savingsTimelineView(schedule, mode, needs.needsTarget ? target : null, pickedPoint);
  const L = SAVINGS_LEARNING;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** "15/7/2030" — hand-formatted, like every other figure in the suite. */
  const showDate = (date: CalendarDate | null) =>
    date === null
      ? null
      : `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  const monthsOrdinal = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${C.form.monthsOrdinalUnit} ${formatDecimal(value, 0)}`;

  /**
   * THE one answer, by mode — computed once so the emphasised row and the
   * pinned CTA restate the same formatted string rather than formatting the
   * same quantity twice.
   */
  const answerLabel =
    mode === "contribution"
      ? C.form.contributionResultLabel
      : mode === "months"
        ? C.form.monthsResultLabel
        : C.form.targetResultLabel;
  const answerValue =
    mode === "contribution"
      ? money(result?.contribution)
      : mode === "months"
        ? monthsOrdinal(schedule?.fundedMonth)
        : money(result?.target);

  /**
   * Reads the clock — the ONE place in this tool that may, and only on a
   * click. `lib/calc/` stays pure so the prerendered HTML and the hydrated
   * HTML agree.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("startYear").onValueChange(String(now.getFullYear()));
    fields.bind("startMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("startDay").onValueChange(String(now.getDate()));
  };

  // The series is generated from the same annuity relationship the solver
  // used, so the goal line and the crossing point are the solver's own answer
  // rather than an approximation of it.
  const chart = savingsChartModel(
    result,
    rate ?? 0,
    { ...CHART_UI.money, ...C.chart },
    mode,
    // A malformed field gets its own recovery sentence: telling a reader to
    // raise their contribution when the real problem is a stray comma sends
    // them after the wrong thing.
    !fieldsUsable,
  );

  /**
   * The comparison figure: two accumulation paths and both attainment
   * markers, from the two schedules the rows above report.
   */
  const pathsChart =
    plan !== null && higherLeg !== null && target !== null && rate !== null
      ? savingsPathsModel(
          [
            {
              key: "current",
              label: C.form.contributionLabel,
              schedule: plan.current.schedule,
              initial: initial ?? 0,
              contribution: plan.current.contribution,
              monthlyRate: rate / 100 / 12,
            },
            {
              key: "higher",
              label: C.form.higherContributionLabel,
              schedule: higherLeg.schedule,
              initial: initial ?? 0,
              contribution: higherLeg.contribution,
              monthlyRate: rate / 100 / 12,
            },
          ],
          target,
          { ...CHART_UI.money, ...C.pathsChart },
          {
            // The tool's table HAS a row per month, so the clause about what
            // those rows do past an attainment month belongs here. C09's
            // endpoint table has no month rows and omits it.
            assumptions: [
              ...C.pathsChart.assumptions,
              C.pathsChart.assumptionTableStops,
            ],
          },
        )
      : null;

  return (
    <CalculatorCard compact>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "contribution", label: C.form.modeContribution },
                  { value: "months", label: C.form.modeMonths },
                  { value: "target", label: C.form.modeTarget },
                ]}
              />
              {/* Only where there is a goal to compose. */}
              {needs.needsTarget ? (
                <RadioGroupField
                  {...fields.bind("goalSource")}
                  legend={C.form.goalSourceLegend}
                  help={C.form.goalSourceHelp}
                  options={[
                    { value: "amount", label: C.form.goalSourceAmount },
                    { value: "house", label: C.form.goalSourceHouse },
                  ]}
                />
              ) : null}
            </FieldGroup>

            {fromHouse ? (
              <FieldGroup title={C.form.houseGroup} className="mt-8">
                <NumberField
                  {...fields.bind("price")}
                  label={C.form.priceLabel}
                  unit={C.form.priceUnit}
                  help={C.form.priceHelp}
                  error={C.form.priceInvalid}
                  invalid={priceInvalid}
                />
                <NumberField
                  {...fields.bind("downPercent")}
                  label={C.form.downPercentLabel}
                  unit={C.form.downPercentUnit}
                  help={C.form.downPercentHelp}
                  error={C.form.downPercentInvalid}
                  invalid={downPercentInvalid}
                />
                <NumberField
                  {...fields.bind("costPercent")}
                  label={C.form.costPercentLabel}
                  unit={C.form.costPercentUnit}
                  help={C.form.costPercentHelp}
                  error={C.form.costPercentInvalid}
                  invalid={costPercentInvalid}
                />
                <NumberField
                  {...fields.bind("reserve")}
                  label={C.form.reserveLabel}
                  unit={C.form.reserveUnit}
                  help={C.form.reserveHelp}
                  error={C.form.reserveInvalid}
                  invalid={reserveInvalid}
                />
              </FieldGroup>
            ) : null}

            <FieldGroup title={C.form.group} className="mt-8">
              <NumberField
                {...fields.bind("initial")}
                label={C.form.initialLabel}
                unit={C.form.initialUnit}
                help={C.form.initialHelp}
                error={C.form.initialInvalid}
                invalid={initialInvalid}
              />
              {/* Only the two inputs the mode needs are rendered: showing the
                  box the tool is solving for would invite the user to fill it
                  in. The typed target also disappears in home mode, where it
                  is derived. */}
              {needs.needsTarget && !fromHouse ? (
                <NumberField
                  {...fields.bind("target")}
                  label={C.form.targetLabel}
                  unit={C.form.targetUnit}
                  help={C.form.targetHelp}
                  error={C.form.targetInvalid}
                  invalid={targetInvalid}
                />
              ) : null}
              {needs.needsContribution ? (
                <NumberField
                  {...fields.bind("contribution")}
                  label={C.form.contributionLabel}
                  unit={C.form.contributionUnit}
                  help={C.form.contributionHelp}
                  error={C.form.contributionInvalid}
                  invalid={contributionInvalid}
                />
              ) : null}
              {needs.needsMonths ? (
                <NumberField
                  {...fields.bind("months")}
                  label={C.form.monthsLabel}
                  help={C.form.monthsHelp}
                  error={C.form.monthsInvalid}
                  invalid={monthsInvalid}
                />
              ) : null}
              <NumberField
                {...fields.bind("rate")}
                label={C.form.rateLabel}
                unit={C.form.rateUnit}
                help={C.form.rateHelp}
                error={C.form.rateInvalid}
                invalid={rateInvalid}
              />
            </FieldGroup>

            {/* The calendar and the extra-saving comparison. Both are original
                row 19 requirements: "46 tháng" is not a plan and "July 2030"
                is. */}
            <FieldGroup title={C.form.dateGroup} className="mt-8">
              <NumberField
                {...fields.bind("startDay")}
                label={C.form.startDayLabel}
                help={C.form.startDayHelp}
                error={C.form.startDayInvalid}
                invalid={start.dayBad}
              />
              <NumberField
                {...fields.bind("startMonth")}
                label={C.form.startMonthLabel}
                help={C.form.startMonthHelp}
                error={C.form.startMonthInvalid}
                invalid={start.monthBad}
              />
              <NumberField
                {...fields.bind("startYear")}
                label={C.form.startYearLabel}
                help={C.form.startYearHelp}
                error={C.form.startYearInvalid}
                invalid={start.yearBad}
              />
              <div>
                <button
                  type="button"
                  onClick={fillToday}
                  className={cn(
                    "rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 font-display text-base font-medium text-ink transition",
                    "hover:border-brand-green focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30",
                    FH_POINTER,
                  )}
                >
                  {C.form.todayLabel}
                </button>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">
                  {C.form.todayHelp}
                </p>
              </div>
              {needs.needsTarget ? (
                <NumberField
                  {...fields.bind("higherContribution")}
                  label={C.form.higherContributionLabel}
                  unit={C.form.higherContributionUnit}
                  help={C.form.higherContributionHelp}
                  error={C.form.higherContributionInvalid}
                  invalid={higherInvalid}
                />
              ) : null}
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: eleven controls before the last one in the widest mode —
             three radios' worth of options, four house fields, the horizon,
             the rate, three date boxes and the comparison — so on a desktop
             viewport the answer leaves the screen while the lower half of the
             form is being edited. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={!fieldsUsable}
            answer={{ label: answerLabel, value: answerValue }}
            sticky
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              {/* THE ANSWER, and the only emphasised row in the tool: the
                  contribution the plan needs, the cycle it funds at, or the
                  closing balance, depending on which of the three the reader
                  asked for. In "months" mode that is the first WHOLE
                  contribution cycle covering the goal, not the fractional
                  solve: 0,367 of a contribution is not a payment a standing
                  order makes. The estimate is in the details, named. */}
              <ResultRow label={answerLabel} value={answerValue} emphasis />
              {/* ROW 5: the calendar date directly under the figure, not third
                  behind a composition row. Null — a dash — whenever there is
                  no attainment cycle or no readable start date; never a date
                  derived from a plan that does not fund. */}
              {needs.needsTarget ? (
                <ResultRow
                  label={C.form.fundedDateLabel}
                  value={showDate(plan?.current.fundedDate ?? null)}
                />
              ) : (
                <ResultRow
                  label={C.form.horizonEndDateLabel}
                  value={showDate(horizonEndDate)}
                />
              )}
              {fromHouse ? (
                <ResultRow
                  label={C.form.composedTargetLabel}
                  value={money(composition?.target)}
                />
              ) : null}
            </ResultGroup>

            {/* One notice, and it names the actual state rather than listing
                three possible causes whenever the solver returns nothing. */}
            {noResult ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {C.form.noResultNotice}
              </p>
            ) : null}
            {status === "alreadyFunded" && result === null ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.alreadyFundedNotice}
              </p>
            ) : null}
            {status === "unattainable" ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.unattainableNotice}
              </p>
            ) : null}
            {status === "beyondLimit" ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.beyondLimitNotice}
              </p>
            ) : null}
            {status === "shortOfTarget" ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.shortOfTargetNotice}
              </p>
            ) : null}
            {/* A schedule that could not be built is a FAILURE state, not a
                plan with a zero balance. */}
            {status === "invalid" ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.invalidScheduleNotice}
              </p>
            ) : null}
            {fromHouse && composition === null ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.houseInvalidNotice}
              </p>
            ) : null}
            {/* The months answer survives an unreadable date; the CALENDAR
                answer does not, and the page says which. */}
            {start.date === null ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.startDateInvalidNotice}
              </p>
            ) : null}

            {fromHouse && composition !== null ? (
              <ResultGroup
                title={C.form.compositionTitle}
                className="mt-4"
                live={false}
              >
                <ResultRow
                  label={C.form.downPaymentRowLabel}
                  value={money(composition.downPayment)}
                />
                <ResultRow
                  label={C.form.purchaseCostsRowLabel}
                  value={money(composition.purchaseCosts)}
                />
                <ResultRow
                  label={C.form.reserveRowLabel}
                  value={money(composition.reserve)}
                />
                <ResultRow
                  label={C.form.composedTargetLabel}
                  value={money(composition.target)}
                />
              </ResultGroup>
            ) : null}
            {fromHouse ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {C.form.reserveAssumptionNotice}
              </p>
            ) : null}

            {/* The extra-saving comparison: the same projection, run at a
                figure the reader entered. Never invented, and never a zero
                difference when the comparison could not be made. */}
            {higherLeg !== null && plan !== null ? (
              <ResultGroup
                title={C.form.comparisonTitle}
                className="mt-4"
                live={false}
              >
                <ResultRow
                  label={C.form.comparisonContributionLabel}
                  value={money(higherLeg.contribution)}
                />
                <ResultRow
                  label={C.form.comparisonMonthsLabel}
                  value={monthsOrdinal(higherLeg.schedule.fundedMonth)}
                />
                <ResultRow
                  label={C.form.comparisonDateLabel}
                  value={showDate(higherLeg.fundedDate)}
                />
                <ResultRow
                  label={C.form.monthsEarlierLabel}
                  value={
                    plan.monthsEarlier === null
                      ? null
                      : `${formatDecimal(plan.monthsEarlier, 0)} ${C.form.monthsUnit}`
                  }
                />
                <ResultRow
                  label={C.form.comparisonOwnFundsLabel}
                  value={money(higherLeg.ownFunds)}
                />
                <ResultRow
                  label={C.form.comparisonInterestLabel}
                  value={money(higherLeg.interest)}
                />
              </ResultGroup>
            ) : null}
            {/* DERIVED FROM THE FIGURES ABOVE, not asserted. A higher
                contribution usually means more of the saver's own money and
                less interest — but at a 0% rate both plans put in exactly the
                target and both earn nothing, so the strict version of that
                sentence is false there. */}
            {higherLeg !== null &&
            plan !== null &&
            plan.monthsEarlier !== null ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {higherLeg.interest < plan.current.interest &&
                higherLeg.ownFunds > plan.current.ownFunds
                  ? C.form.comparisonTradeOffNotice
                  : C.form.comparisonNoInterestTradeOffNotice}
              </p>
            ) : null}
            {comparisonNotHigher ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.comparisonNotHigherNotice}
              </p>
            ) : null}
            {comparisonOneLeg ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.comparisonOneLegNotice}
              </p>
            ) : null}
          </>
        }
        learning={
          <AccumulationLearningPanel
            marker="savings"
            copy={L}
            sample={pristine || onlyTried(learning.trials, initialValues)}
            view={timeline}
            // A bad field gets the fix; a valid form with no schedule gets its
            // reason and no false "sửa ô đang báo lỗi".
            emptyText={!fieldsUsable ? L.unknown : printable ? L.noAnswer : L.tooLarge}
            emptyFix={!fieldsUsable}
            onIndex={setPickedPoint}
            formId={FORM_ID}
            trial={{
              keys: trialKeys,
              labels: { contribution: L.trials.contribution.label, horizon: L.trials.horizon.label },
              availability: {
                contribution: savingsTrialAvailability("contribution", {
                  usable: trialUsable,
                  mode,
                  values: raw.values,
                  reason: !fieldsUsable ? L.blocked.invalid : printable ? L.blocked.noAnswer : L.blocked.tooLarge,
                }),
                horizon: savingsTrialAvailability("horizon", {
                  usable: trialUsable,
                  mode,
                  values: raw.values,
                  reason: !fieldsUsable ? L.blocked.invalid : printable ? L.blocked.noAnswer : L.blocked.tooLarge,
                }),
              },
              canUndo: latestTrial !== null,
              onTry: tryKey,
              onUndo: undoTrial,
            }}
            impact={trialImpact}
          />
        }
        chart={
          /* Both figures, outside every ResultGroup. When there is no answer
             the model comes back `unavailable` and the figure explains itself
             rather than drawing a curve extended to touch the target line. */
          <>
            <ChartFigure model={chart}>
              <LineChart model={chart} />
            </ChartFigure>

            {pathsChart !== null ? (
              <ChartFigure model={pathsChart}>
                <LineChart model={pathsChart} />
              </ChartFigure>
            ) : null}
          </>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <DetailDisclosure
            title={C.form.detailDisclosureTitle}
            hint={C.form.detailDisclosureHint}
          >
            {/* Every figure here is the SCHEDULE's, at the cycle the headline
                names. Using the solver's continuous totals would put a
                different horizon in the details than on the answer. */}
            <DetailFigures
              title={C.form.detailTitle}
              figures={[
                {
                  label: C.form.scheduleBalanceLabel,
                  value: schedule ? moneyCell(schedule.balance) : null,
                },
                // The three parts of the closing balance, separated: what the
                // reader already had, what they put in afterwards, and what
                // the assumed rate added.
                {
                  label: C.form.initialFundsLabel,
                  value: initial === null ? null : moneyCell(initial),
                },
                {
                  label: C.form.laterContributionsLabel,
                  value:
                    schedule && initial !== null
                      ? moneyCell(schedule.totalContributed - initial)
                      : null,
                },
                {
                  label: C.form.totalContributedLabel,
                  value: schedule ? moneyCell(schedule.totalContributed) : null,
                },
                {
                  label: C.form.interestLabel,
                  value: schedule ? moneyCell(schedule.interest) : null,
                },
                {
                  // A share, not an amount: never scaled to the block's unit.
                  label: C.form.interestShareLabel,
                  value: schedule
                    ? formatPercent(schedule.interestSharePercent, 1)
                    : null,
                },
              ]}
            />

            <DetailFigures
              title={C.form.scheduleTitle}
              className="mt-4"
              figures={[
                {
                  // A cycle number, not an amount: never scaled.
                  label: C.form.fundedMonthLabel,
                  value:
                    schedule?.fundedMonth == null
                      ? null
                      : countCell(schedule.fundedMonth),
                },
                {
                  label: C.form.startDateLabel,
                  value: showDate(start.date),
                },
                {
                  label: C.form.firstContributionDateLabel,
                  value: showDate(plan?.firstContributionDate ?? null),
                },
                {
                  label: C.form.continuousEstimateLabel,
                  value: result
                    ? `${formatDecimal(result.months, 3)} ${C.form.monthsUnit}`
                    : null,
                },
              ]}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-3">
              {C.form.continuousEstimateNote}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-3">
              {C.form.calendarNotice}
            </p>
          </DetailDisclosure>
        }
      />

      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
