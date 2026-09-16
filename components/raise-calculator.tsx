"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { readDateFields } from "@/lib/calc/date-input";
import type { CalendarDate } from "@/lib/calc/dates";
import { computeRaise, type RaiseMode } from "@/lib/calc/raise";
import { planRaiseSaving } from "@/lib/calc/raise-savings";
import { RAISE as C } from "@/content/calculators/raise";

/**
 * The second input differs per mode in unit, parser and default, so each mode
 * owns its own box. A percentage left over in a box that now means đồng would
 * compute a wrong answer without looking wrong.
 */
const MODES = {
  percent: {
    key: "percent",
    label: C.form.percentLabel,
    unit: C.form.percentUnit,
    help: C.form.percentHelp,
    error: C.form.percentInvalid,
    isPercent: true,
  },
  amount: {
    key: "amount",
    label: C.form.amountLabel,
    unit: C.form.amountUnit,
    help: C.form.amountHelp,
    error: C.form.amountInvalid,
    isPercent: false,
  },
  target: {
    key: "target",
    label: C.form.targetLabel,
    unit: C.form.targetUnit,
    help: C.form.targetHelp,
    error: C.form.targetInvalid,
    isPercent: false,
  },
} as const satisfies Record<
  RaiseMode,
  {
    key: string;
    label: string;
    unit: string;
    help: string;
    error: string;
    isPercent: boolean;
  }
>;

export function RaiseCalculator() {
  const initial0 = {
    mode: "percent",
    current: C.form.defaultCurrent,
    percent: C.form.defaultPercent,
    amount: C.form.defaultAmount,
    target: C.form.defaultTarget,
    perYear: C.form.defaultPerYear,
    // Original row 63: the savings goal the rise is measured against.
    netIncrease: C.form.defaultNetIncrease,
    share: C.form.defaultShare,
    baseline: C.form.defaultBaseline,
    initial: C.form.defaultInitial,
    goalTarget: C.form.defaultGoalTarget,
    goalRate: C.form.defaultGoalRate,
    startDay: C.form.defaultStartDay,
    startMonth: C.form.defaultStartMonth,
    startYear: C.form.defaultStartYear,
  };
  const fields = useCalcFields(initial0);

  // The prefilled salary, the prefilled NET rise and the prefilled goal are
  // all a worked example. The NET field in particular must never look derived
  // from the gross one — a review flagged the two defaults being numerically
  // equal — so the state is badged rather than left to the reader to infer.
  const pristine = (Object.keys(initial0) as (keyof typeof initial0)[]).every(
    (key) => fields.values[key] === initial0[key],
  );

  const mode = fields.values.mode as RaiseMode;
  const active = MODES[mode];

  const current = parseMoney(fields.values.current);
  const value = active.isPercent
    ? parseDecimal(fields.values[active.key])
    : parseMoney(fields.values[active.key]);
  const perYear = parseDecimal(fields.values.perYear);

  const currentInvalid = current === null || current <= 0;
  const perYearInvalid = perYear === null || perYear <= 0;
  const parsed = !currentInvalid && !perYearInvalid && value !== null;

  const result = parsed
    ? computeRaise({ mode, current, value, perYear })
    : null;

  // A negative rise is legitimate; pay below zero is not. The module owns that
  // rule for all three modes, so the field is flagged from its verdict rather
  // than re-deriving it here — otherwise a cut past zero would blank the rows
  // with no message. Order matters: `result` is computed above.
  const valueInvalid = value === null || (parsed && result === null);

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  // --- original row 63: the savings goal -----------------------------------
  // A BLANK net-increase box is "not supplied", which the model turns into
  // `unknownNet`. It is not zero, and it is never derived from the gross rise
  // above: this tool has no model of payroll deductions, so it asks.
  const netRaw = fields.values.netIncrease.trim();
  const netKnown = netRaw !== "";
  // `parseMoney` handles a leading minus, so a pay cut is enterable.
  const netIncrease = netKnown ? parseMoney(netRaw) : null;
  const netIncreaseInvalid = netKnown && netIncrease === null;

  const share = parseDecimal(fields.values.share);
  const baseline = parseMoney(fields.values.baseline);
  const initial = parseMoney(fields.values.initial);
  const goalTarget = parseMoney(fields.values.goalTarget);
  const goalRate = parseDecimal(fields.values.goalRate);

  const shareInvalid = share === null || share < 0 || share > 100;
  const baselineInvalid = baseline === null || baseline < 0;
  const initialInvalid = initial === null || initial < 0;
  const goalTargetInvalid = goalTarget === null || goalTarget <= 0;
  const goalRateInvalid = goalRate === null || goalRate < 0;

  const startFields = readDateFields(
    fields.values.startYear,
    fields.values.startMonth,
    fields.values.startDay,
  );
  const startInvalid = startFields.date === null;

  const goalUsable =
    !netIncreaseInvalid &&
    !shareInvalid &&
    !baselineInvalid &&
    !initialInvalid &&
    !goalTargetInvalid &&
    !goalRateInvalid &&
    !startInvalid;

  const goal = goalUsable
    ? planRaiseSaving({
        netIncrease,
        sharePercent: share,
        baselineContribution: baseline,
        initial,
        target: goalTarget,
        annualRatePercent: goalRate,
        start: startFields.date!,
      })
    : null;

  /** "15/4/2030", hand-formatted like every other figure in the suite. */
  const showDate = (date: CalendarDate | null) =>
    date === null
      ? null
      : `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  const months = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${formatDecimal(value, 0)} ${C.form.monthsUnit}`;

  /**
   * Reads the clock — the one place in this feature that may.
   *
   * `lib/calc/` stays pure so the prerendered HTML and the hydrated HTML
   * agree; this runs only on a click, well after mount. Same pattern as
   * `dates-calculator.tsx`.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("startYear").onValueChange(String(now.getFullYear()));
    fields.bind("startMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("startDay").onValueChange(String(now.getDate()));
  };

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
            { value: "percent", label: C.form.modePercent },
            { value: "amount", label: C.form.modeAmount },
            { value: "target", label: C.form.modeTarget },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("current")}
          label={C.form.currentLabel}
          unit={C.form.currentUnit}
          help={C.form.currentHelp}
          error={C.form.currentInvalid}
          invalid={currentInvalid}
        />
        {/* Keyed on the mode: the box changes meaning, so it changes identity. */}
        <NumberField
          key={mode}
          {...fields.bind(active.key)}
          label={active.label}
          unit={active.unit}
          help={active.help}
          error={active.error}
          invalid={valueInvalid}
        />
        <NumberField
          {...fields.bind("perYear")}
          label={C.form.perYearLabel}
          help={C.form.perYearHelp}
          error={C.form.perYearInvalid}
          invalid={perYearInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.nextLabel} value={money(result?.next)} />
        <ResultRow
          label={C.form.increasePercentLabel}
          value={result ? formatPercent(result.increasePercent) : null}
        />
        <ResultRow
          label={C.form.increaseLabel}
          value={money(result?.increase)}
        />
        <ResultRow
          label={C.form.increasePerYearLabel}
          value={money(result?.increasePerYear)}
        />
        <ResultRow
          label={C.form.nextPerYearLabel}
          value={money(result?.nextPerYear)}
        />
      </ResultGroup>

      {/* Original row 63's own question. The salary block above is untouched
          and still works on its own — this section is additive. */}
      <FieldGroup title={C.form.goalGroup} className="mt-10">
        <p className="text-sm leading-relaxed text-ink-3">
          {C.form.goalIntro}
        </p>
        <NumberField
          {...fields.bind("netIncrease")}
          label={C.form.netIncreaseLabel}
          unit={C.form.netIncreaseUnit}
          help={C.form.netIncreaseHelp}
          error={C.form.netIncreaseInvalid}
          invalid={netIncreaseInvalid}
        />
        <NumberField
          {...fields.bind("share")}
          label={C.form.shareLabel}
          unit={C.form.shareUnit}
          help={C.form.shareHelp}
          error={C.form.shareInvalid}
          invalid={shareInvalid}
        />
        <NumberField
          {...fields.bind("baseline")}
          label={C.form.baselineLabel}
          unit={C.form.baselineUnit}
          help={C.form.baselineHelp}
          error={C.form.baselineInvalid}
          invalid={baselineInvalid}
        />
        <NumberField
          {...fields.bind("initial")}
          label={C.form.initialLabel}
          unit={C.form.initialUnit}
          help={C.form.initialHelp}
          error={C.form.initialInvalid}
          invalid={initialInvalid}
        />
        <NumberField
          {...fields.bind("goalTarget")}
          label={C.form.goalTargetLabel}
          unit={C.form.goalTargetUnit}
          help={C.form.goalTargetHelp}
          error={C.form.goalTargetInvalid}
          invalid={goalTargetInvalid}
        />
        <NumberField
          {...fields.bind("goalRate")}
          label={C.form.goalRateLabel}
          unit={C.form.goalRateUnit}
          help={C.form.goalRateHelp}
          error={C.form.goalRateInvalid}
          invalid={goalRateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.startGroup} className="mt-8">
        <NumberField
          {...fields.bind("startDay")}
          label={C.form.startDayLabel}
          help={C.form.startDayHelp}
          error={C.form.startInvalid}
          invalid={startFields.dayBad}
        />
        <NumberField
          {...fields.bind("startMonth")}
          label={C.form.startMonthLabel}
          help={C.form.startMonthHelp}
          error={C.form.startInvalid}
          invalid={startFields.monthBad}
        />
        <NumberField
          {...fields.bind("startYear")}
          label={C.form.startYearLabel}
          help={C.form.startYearHelp}
          error={C.form.startInvalid}
          invalid={startFields.yearBad}
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

      {/* Not live: the salary group above owns the page's one live region. */}
      <ResultGroup
        title={C.form.goalResultTitle}
        className="mt-6"
        live={false}
      >
        <ResultRow
          label={C.form.extraLabel}
          value={money(goal?.extraContribution)}
        />
        <ResultRow
          label={C.form.raisedLabel}
          value={money(goal?.raisedContribution)}
        />
        <ResultRow
          label={C.form.currentMonthsLabel}
          value={months(goal?.plan?.current.schedule.fundedMonth)}
        />
        <ResultRow
          label={C.form.currentDateLabel}
          value={showDate(goal?.plan?.current.fundedDate ?? null)}
        />
        {/* Mounted only when there IS a comparison leg: docs §6 — an optional
            row is not mounted, not nulled. */}
        {goal?.plan?.higher ? (
          <>
            <ResultRow
              label={C.form.raisedMonthsLabel}
              value={months(goal.plan.higher.schedule.fundedMonth)}
            />
            <ResultRow
              label={C.form.raisedDateLabel}
              value={showDate(goal.plan.higher.fundedDate)}
            />
          </>
        ) : null}
        {goal?.monthsEarlier != null ? (
          <ResultRow
            label={C.form.earlierLabel}
            value={months(goal.monthsEarlier)}
          />
        ) : null}
      </ResultGroup>

      {/* One sentence per state, and the states are distinguishable: an
          unknown net rise is not a pay cut and neither is a 0% share. */}
      {goal === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.goalInvalidNotice}
        </p>
      ) : goal.state === "unknownNet" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unknownNetNotice}
        </p>
      ) : goal.state === "payCut" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.payCutNotice}
        </p>
      ) : goal.state === "baselineOnly" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.zeroShareNotice}
        </p>
      ) : null}

      {goal?.plan?.current.schedule.fundedMonth === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unreachableNotice}
        </p>
      ) : null}

      {/* After the result, never before it. */}
      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
