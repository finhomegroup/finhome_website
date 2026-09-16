"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
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
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
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

export function SavingsGoalCalculator() {
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
  const fields = useCalcFields(initialValues);

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
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

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
        {/* Only the two inputs the mode needs are rendered: showing the box
            the tool is solving for would invite the user to fill it in. The
            typed target also disappears in home mode, where it is derived. */}
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

      {/* The calendar and the extra-saving comparison. Both are original row
          19 requirements: "46 tháng" is not a plan and "July 2030" is. */}
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

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {mode === "contribution" ? (
          <ResultRow
            label={C.form.contributionResultLabel}
            value={money(result?.contribution)}
          />
        ) : null}
        {mode === "months" ? (
          <ResultRow
            label={C.form.monthsResultLabel}
            // The first WHOLE contribution cycle that covers the goal, not the
            // fractional solve: 0,367 of a contribution is not a payment a
            // standing order makes. The estimate is in the details, named.
            value={monthsOrdinal(schedule?.fundedMonth)}
          />
        ) : null}
        {mode === "target" ? (
          <ResultRow
            label={C.form.targetResultLabel}
            value={money(result?.target)}
          />
        ) : null}
        {/* The calendar answer, beside the number of months. Null — a dash —
            whenever there is no attainment cycle or no readable start date;
            never a date derived from a plan that does not fund. */}
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

      {/* One notice, and it names the actual state rather than listing three
          possible causes whenever the solver returns nothing. */}
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
      {/* A schedule that could not be built is a FAILURE state, not a plan
          with a zero balance. */}
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
      {/* The months answer survives an unreadable date; the CALENDAR answer
          does not, and the page says which. */}
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

      {/* The extra-saving comparison: the same projection, run at a figure the
          reader entered. Never invented, and never a zero difference when the
          comparison could not be made. */}
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
      {/* DERIVED FROM THE FIGURES ABOVE, not asserted. A higher contribution
          usually means more of the saver's own money and less interest — but
          at a 0% rate both plans put in exactly the target and both earn
          nothing, so the strict version of that sentence is false there. */}
      {higherLeg !== null && plan !== null && plan.monthsEarlier !== null ? (
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

      {/* The chart right after the answer, and outside every ResultGroup. When
          there is no answer the model comes back `unavailable` and the figure
          explains itself rather than drawing a curve extended to touch the
          target line. */}
      <ChartFigure model={chart}>
        <LineChart model={chart} />
      </ChartFigure>

      {pathsChart !== null ? (
        <ChartFigure model={pathsChart}>
          <LineChart model={pathsChart} />
        </ChartFigure>
      ) : null}

      <DetailDisclosure
        title={C.form.detailDisclosureTitle}
        hint={C.form.detailDisclosureHint}
        className="mt-8"
      >
        {/* Every figure here is the SCHEDULE's, at the cycle the headline
            names. Using the solver's continuous totals would put a different
            horizon in the details than on the answer. */}
        <DetailFigures
          title={C.form.detailTitle}
          figures={[
            {
              label: C.form.scheduleBalanceLabel,
              value: schedule ? moneyCell(schedule.balance) : null,
            },
            // The three parts of the closing balance, separated: what the
            // reader already had, what they put in afterwards, and what the
            // assumed rate added.
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
      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />

    </CalculatorCard>
  );
}
