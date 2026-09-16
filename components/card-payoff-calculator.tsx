"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { moneyCell, percentCell } from "@/lib/calc/table-cell";
import { readDateFields } from "@/lib/calc/date-input";
import type { CalendarDate } from "@/lib/calc/dates";
import {
  cardRefusalReason,
  planCardPayoff,
  type CardStrategy,
} from "@/lib/calc/card-plan";
import { MAX_CARD_MONTHS } from "@/lib/calc/card-debt";
import { cardPathsModel, strategyName } from "@/lib/calc/charts/card-chart";
import { fill } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { CARD_PAYOFF as C } from "@/content/calculators/card-payoff";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * ONE card-payoff workspace, behind two routes — original rows 29 and 30.
 *
 * `/cong-cu/tra-het-the-tin-dung/` opens on `fixed` and
 * `/cong-cu/tra-toi-thieu-the-tin-dung/` on `minimum`; both URLs are
 * unchanged and each page keeps its own title, notice, prose and FAQ. What
 * they no longer keep is a second form: a reader who typed their balance to
 * ask "how long" can switch to "what if I only pay the minimum" without
 * retyping anything.
 *
 * What the consolidation adds over either old page:
 *
 * - **Two debt paths, always.** The chosen plan and the other rule, at the
 *   same balance and the same rate, drawn from the same schedules.
 * - **Two dates.** The reader enters the day the plan starts; the first
 *   payment is one month later and each path's payoff date is that many
 *   months after the start. `card-plan.ts` owns the convention.
 * - **A household allocation, stated rather than inferred.** The monthly
 *   money that frees up after payoff is the amount the household said it had
 *   set aside — never the first minimum payment, which was already falling.
 *
 * One live results region, four rows.
 */
export function CardPayoffCalculator({
  strategy: openingStrategy = "fixed",
}: {
  /** Which route this is: the strategy the form opens on. */
  strategy?: CardStrategy;
}) {
  const initial = {
    strategy: openingStrategy as string,
    balance: C.form.defaultBalance,
    rate: C.form.defaultRate,
    payment: C.form.defaultPayment,
    months: C.form.defaultMonths,
    percent: C.form.defaultPercent,
    floor: C.form.defaultFloor,
    extra: C.form.defaultExtra,
    budget: C.form.defaultBudget,
    startDay: C.form.defaultStartDay,
    startMonth: C.form.defaultStartMonth,
    startYear: C.form.defaultStartYear,
  };
  const fields = useCalcFields(initial);
  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const strategy = fields.values.strategy as CardStrategy;
  const isFixed = strategy === "fixed";
  const isTarget = strategy === "target";
  const isMinimum = strategy === "minimum";

  const balance = parseMoney(fields.values.balance);
  const rate = parseDecimal(fields.values.rate);
  const payment = parseMoney(fields.values.payment);
  // A whole count of months: `parseMoney("3.0")` is 30 and eats the dot
  // before any integer guard can run (docs §4).
  const months = parseCount(fields.values.months);
  const percent = parseDecimal(fields.values.percent);
  const floor = parseMoney(fields.values.floor);
  const extra = parseMoney(fields.values.extra);
  const budget = parseMoney(fields.values.budget);

  const invalid = {
    balance: balance === null || balance <= 0,
    rate: rate === null || rate < 0,
    payment: isFixed && (payment === null || payment < 0),
    months: isTarget && (months === null || months <= 0),
    percent: percent === null || percent < 0 || percent > 100,
    floor: floor === null || floor < 0,
    extra: isMinimum && (extra === null || extra < 0),
    budget: budget === null || budget < 0,
  };

  const start = readDateFields(
    fields.values.startYear,
    fields.values.startMonth,
    fields.values.startDay,
  );

  const fieldsUsable = !Object.values(invalid).some(Boolean);
  const request =
    fieldsUsable && start.date !== null
      ? {
          balance: balance!,
          annualRatePercent: rate!,
          strategy,
          monthlyPayment: isFixed ? payment! : undefined,
          targetMonths: isTarget ? months! : undefined,
          minimumPercent: percent!,
          minimumFloor: floor!,
          extraPerMonth: isMinimum ? extra! : 0,
          start: start.date,
          householdBudget: budget!,
        }
      : null;
  const plan = request === null ? null : planCardPayoff(request);

  /**
   * WHY there is no plan, when every field reads.
   *
   * A payment that can never clear the debt and a plan that runs past the
   * model's 100-year horizon both come back as `null`, and they are different
   * answers with different fixes. `cardRefusalReason` classifies them using
   * the card module's own rate and minimum expressions.
   */
  const refusal =
    request !== null && plan === null ? cardRefusalReason(request) : null;
  const dateUnreadable = fieldsUsable && start.date === null;

  const chart = cardPathsModel(plan, { ...CHART_UI.money, ...C.chart });

  const money = (figure: number | undefined | null) =>
    figure === undefined || figure === null
      ? null
      : `${formatMoney(figure)} ₫`;
  /** "22 tháng (1,8 năm)" — months are the unit, years are the shock. */
  const monthsWithYears = (count: number | undefined | null) =>
    count === undefined || count === null
      ? null
      : `${formatDecimal(count, 0)} ${C.form.monthsUnit} (${formatDecimal(count / 12, 1)} ${C.form.yearsUnit})`;
  /** A date as the page writes it: 15/7/2028. */
  const showDate = (date: CalendarDate | undefined | null) =>
    date === undefined || date === null
      ? null
      : `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  /**
   * Reads the clock — the ONE place in this tool that may, and only on a
   * click, well after mount, so the prerendered and hydrated HTML agree.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("startYear").onValueChange(String(now.getFullYear()));
    fields.bind("startMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("startDay").onValueChange(String(now.getDate()));
  };

  const chartLabels = { ...CHART_UI.money, ...C.chart };

  return (
    <CalculatorCard>
      <ExampleNotice pristine={pristine} onReset={fields.reset} />

      <FieldGroup className="mt-6">
        <RadioGroupField
          {...fields.bind("strategy")}
          legend={C.form.strategyLegend}
          help={C.form.strategyHelp}
          options={[
            { value: "fixed", label: C.form.strategyFixedOption },
            { value: "target", label: C.form.strategyTargetOption },
            { value: "minimum", label: C.form.strategyMinimumOption },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("balance")}
          label={C.form.balanceLabel}
          unit={C.form.balanceUnit}
          help={C.form.balanceHelp}
          error={C.form.balanceInvalid}
          invalid={invalid.balance}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={invalid.rate}
        />
        {/* Only the input the chosen strategy needs: the others are either
            the answer or another rule's setting. */}
        {isFixed ? (
          <NumberField
            {...fields.bind("payment")}
            label={C.form.paymentLabel}
            unit={C.form.paymentUnit}
            help={C.form.paymentHelp}
            error={C.form.paymentInvalid}
            invalid={invalid.payment}
          />
        ) : null}
        {isTarget ? (
          <NumberField
            {...fields.bind("months")}
            label={C.form.monthsLabel}
            unit={C.form.monthsUnitField}
            help={C.form.monthsHelp}
            error={C.form.monthsInvalid}
            invalid={invalid.months}
          />
        ) : null}
        {isMinimum ? (
          <NumberField
            {...fields.bind("extra")}
            label={C.form.extraLabel}
            unit={C.form.extraUnit}
            help={C.form.extraHelp}
            error={C.form.extraInvalid}
            invalid={invalid.extra}
          />
        ) : null}
      </FieldGroup>

      <FieldGroup title={C.form.planGroup} className="mt-8">
        <NumberField
          {...fields.bind("budget")}
          label={C.form.budgetLabel}
          unit={C.form.budgetUnit}
          help={C.form.budgetHelp}
          error={C.form.budgetInvalid}
          invalid={invalid.budget}
        />
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
      </FieldGroup>

      {/* The card's own minimum rule. It always shapes one of the two paths,
          so it is disclosed with its current values on the summary line
          rather than hidden. */}
      <AdvancedFields
        title={C.form.minimumTitle}
        emptySummary={C.form.minimumNone}
        className="mt-8"
        settings={[
          {
            key: "percent",
            label: C.form.percentLabel,
            value:
              invalid.percent || percent === null
                ? C.form.percentInvalid
                : formatPercent(percent, Number.isInteger(percent) ? 0 : 2),
            active: invalid.percent || percent !== 0,
          },
          {
            key: "floor",
            label: C.form.floorLabel,
            value: invalid.floor ? C.form.floorInvalid : money(floor)!,
            active: invalid.floor || floor !== 0,
          },
        ]}
      >
        <FieldGroup title={C.form.minimumGroup}>
          <NumberField
            {...fields.bind("percent")}
            label={C.form.percentLabel}
            unit={C.form.percentUnit}
            help={C.form.percentHelp}
            error={C.form.percentInvalid}
            invalid={invalid.percent}
          />
          <NumberField
            {...fields.bind("floor")}
            label={C.form.floorLabel}
            unit={C.form.floorUnit}
            help={C.form.floorHelp}
            error={C.form.floorInvalid}
            invalid={invalid.floor}
          />
        </FieldGroup>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.minimumHint}
        </p>
      </AdvancedFields>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {/* In the target-month strategy the months are the INPUT, so the
            headline is the payment the target needs. Repeating the number the
            reader just typed is not a result. */}
        {isTarget ? (
          <ResultRow
            label={C.form.paymentResultLabel}
            value={money(plan?.plan.levelPayment)}
          />
        ) : (
          <ResultRow
            label={C.form.monthsResultLabel}
            value={monthsWithYears(plan?.plan.months)}
          />
        )}
        <ResultRow
          label={C.form.payoffDateLabel}
          value={showDate(plan?.plan.payoffDate)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(plan?.plan.result.totalInterest)}
        />
        <ResultRow
          label={C.form.freedLabel}
          value={money(plan?.budget?.freedMonthly)}
        />
      </ResultGroup>

      {/* THE PAYOFF MONTH IS NOT A FREE MONTH: the last payment lands in it,
          so only the remainder of that month's allocation is released and the
          whole amount is free from the next cycle. Two different dates. */}
      {plan?.budget != null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {fill(
            plan.budget.finalMonthSurplus > 0
              ? C.form.freedTimingNotice
              : C.form.freedTimingNoneNotice,
            {
              lastPayment: money(plan.budget.finalPayment)!,
              surplus: money(Math.max(0, plan.budget.finalMonthSurplus))!,
              payoffDate: showDate(plan.budget.freedFromDate)!,
              fullMonth: formatDecimal(plan.budget.fullBudgetFromMonth, 0),
              fullDate: showDate(plan.budget.fullBudgetFromDate)!,
            },
          )}
        </p>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        {C.form.budgetNotProofNotice}
      </p>

      {plan?.budget?.coversPlan === false ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.budgetShortfallNotice}
        </p>
      ) : null}

      {refusal === "neverClears" ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.noPayoffNotice}
        </p>
      ) : null}

      {refusal === "beyondHorizon" ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {fill(C.form.beyondHorizonNotice, {
            limit: formatMoney(MAX_CARD_MONTHS, 0),
          })}
        </p>
      ) : null}

      {dateUnreadable ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.dateInvalidNotice}
        </p>
      ) : null}

      {/* The other rule, on the same balance. Not live: it is the same
          computation seen a second way, and the group above already
          announces every change. */}
      <ResultGroup title={C.form.compareTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.compareStrategyLabel}
          value={
            plan?.comparison == null
              ? null
              : strategyName(plan.comparison, chartLabels)
          }
          prose
        />
        <ResultRow
          label={C.form.compareMonthsLabel}
          value={monthsWithYears(plan?.comparison?.months)}
        />
        <ResultRow
          label={C.form.compareDateLabel}
          value={showDate(plan?.comparison?.payoffDate)}
        />
        <ResultRow
          label={C.form.compareInterestLabel}
          value={money(plan?.comparison?.result.totalInterest)}
        />
        {/* THE LABEL FOLLOWS THE SIGN. On the minimum strategy the chosen
            plan is slower and dearer than the flat comparison, and "nhanh
            hơn: −97 tháng" is a claim the figures contradict. */}
        <ResultRow
          label={
            plan?.monthsDifference == null || plan.monthsDifference === 0
              ? C.form.compareMonthsEqualLabel
              : plan.monthsDifference > 0
                ? C.form.compareMonthsFasterLabel
                : C.form.compareMonthsSlowerLabel
          }
          value={
            plan?.monthsDifference == null
              ? null
              : plan.monthsDifference === 0
                ? C.form.compareMonthsEqualValue
                : `${formatDecimal(Math.abs(plan.monthsDifference), 0)} ${C.form.monthsUnit}`
          }
          prose={plan?.monthsDifference === 0}
        />
        <ResultRow
          label={
            plan?.interestDifference == null ||
            plan.interestDifference === 0
              ? C.form.compareInterestEqualLabel
              : plan.interestDifference > 0
                ? C.form.compareInterestSavedLabel
                : C.form.compareInterestExtraLabel
          }
          value={
            plan?.interestDifference == null
              ? null
              : plan.interestDifference === 0
                ? C.form.compareInterestEqualValue
                : money(Math.abs(plan.interestDifference))
          }
          prose={plan?.interestDifference === 0}
        />
      </ResultGroup>

      {plan !== null && plan.comparison === null ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.noComparisonNotice}
        </p>
      ) : null}

      <ChartFigure model={chart}>
        <LineChart model={chart} />
      </ChartFigure>

      {plan !== null ? (
        <DetailDisclosure title={C.form.detailToggle} className="mt-6">
          <DetailFigures
            title={C.form.detailTitle}
            figures={[
              {
                label:
                  plan.plan.levelPayment === null
                    ? C.form.decliningPaymentLabel
                    : C.form.levelPaymentLabel,
                value: moneyCell(
                  plan.plan.levelPayment ?? plan.plan.result.firstPayment,
                ),
              },
              {
                label: C.form.highestPaymentLabel,
                value: moneyCell(plan.plan.highestPayment),
              },
              // Mounted only when an allocation was stated: a dash beside
              // "ngân sách hộ đã dành riêng" reads like a figure we lost.
              ...(plan.budget === null
                ? []
                : [
                    {
                      label: C.form.budgetLabelDetail,
                      value: moneyCell(plan.budget.amount),
                    },
                  ]),
              {
                label: C.form.firstPaymentLabel,
                value: showDate(plan.firstPaymentDate)!,
                prose: true,
              },
              {
                label: C.form.firstInterestLabel,
                value: moneyCell(plan.plan.result.schedule[0].interest),
              },
              {
                label: C.form.lastPaymentLabel,
                value: moneyCell(plan.plan.result.lastPayment),
              },
              {
                label: C.form.totalPaidLabel,
                value: moneyCell(plan.plan.result.totalPaid),
              },
              {
                label: C.form.interestShareLabel,
                value: percentCell(plan.plan.result.interestSharePercent, 1),
              },
            ]}
          />
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            {C.form.dateConvention}
          </p>
        </DetailDisclosure>
      ) : null}

      <ExampleNoticeDetail className="mt-4" />
    </CalculatorCard>
  );
}
