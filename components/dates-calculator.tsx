"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { formatDecimal, parseDecimal } from "@/lib/calc/number";
import {
  computeDateDifference,
  computeDateOffset,
  type CalendarDate,
} from "@/lib/calc/dates";
import { readDateFields } from "@/lib/calc/date-input";
import { DATES as C } from "@/content/calculators/dates";

/**
 * Parse a year/month/day trio out of the raw field strings.
 *
 * The implementation moved to `lib/calc/date-input.ts` when the home-fund and
 * term-deposit tools needed the same step; the per-field blame it keeps is
 * documented there. Re-exported under this name because
 * `dates-calculator.test.ts` pins the blame through this page's own entry
 * point.
 */
export const readDate = readDateFields;

export function DatesCalculator() {
  const fields = useCalcFields({
    mode: C.form.defaultMode,
    fromYear: C.form.defaultFromYear,
    fromMonth: C.form.defaultFromMonth,
    fromDay: C.form.defaultFromDay,
    toYear: C.form.defaultToYear,
    toMonth: C.form.defaultToMonth,
    toDay: C.form.defaultToDay,
    offset: C.form.defaultOffset,
    skipWeekends: C.form.defaultSkipWeekends,
  });

  const byDifference = fields.values.mode === "difference";
  const skipWeekends = fields.values.skipWeekends === "yes";

  const from = readDate(
    fields.values.fromYear,
    fields.values.fromMonth,
    fields.values.fromDay,
  );
  const to = readDate(
    fields.values.toYear,
    fields.values.toMonth,
    fields.values.toDay,
  );

  const offset = parseDecimal(fields.values.offset);
  const offsetInvalid =
    !byDifference && (offset === null || !Number.isInteger(offset));

  const difference =
    byDifference && from.date && to.date
      ? computeDateDifference({ from: from.date, to: to.date })
      : null;

  const shifted =
    !byDifference && from.date && offset !== null && !offsetInvalid
      ? computeDateOffset({ from: from.date, days: offset, skipWeekends })
      : null;

  const weekday = (index: number) => C.form.weekdayNames[index];

  /** "1/1/2026" in Vietnamese order, hand-formatted like every other figure. */
  const showDate = (date: CalendarDate) =>
    `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  /**
   * Reads the clock — the ONE place in this feature that may. `lib/calc/`
   * stays pure so the prerendered HTML and the hydrated HTML agree; this
   * runs only on a click, well after mount.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("fromYear").onValueChange(String(now.getFullYear()));
    fields.bind("fromMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("fromDay").onValueChange(String(now.getDate()));
  };

  const dateInvalid =
    from.yearBad ||
    from.monthBad ||
    from.dayBad ||
    (byDifference && (to.yearBad || to.monthBad || to.dayBad));

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "difference", label: C.form.modeDifference },
            { value: "offset", label: C.form.modeOffset },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.fromGroup} className="mt-8">
        <NumberField
          {...fields.bind("fromDay")}
          label={C.form.fromDayLabel}
          help={C.form.dayHelp}
          error={C.form.dayInvalid}
          invalid={from.dayBad}
        />
        <NumberField
          {...fields.bind("fromMonth")}
          label={C.form.fromMonthLabel}
          help={C.form.monthHelp}
          error={C.form.monthInvalid}
          invalid={from.monthBad}
        />
        <NumberField
          {...fields.bind("fromYear")}
          label={C.form.fromYearLabel}
          help={C.form.yearHelp}
          error={C.form.yearInvalid}
          invalid={from.yearBad}
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

      {byDifference ? (
        <FieldGroup title={C.form.toGroup} className="mt-8">
          <NumberField
            {...fields.bind("toDay")}
            label={C.form.toDayLabel}
            help={C.form.dayHelp}
            error={C.form.dayInvalid}
            invalid={to.dayBad}
          />
          <NumberField
            {...fields.bind("toMonth")}
            label={C.form.toMonthLabel}
            help={C.form.monthHelp}
            error={C.form.monthInvalid}
            invalid={to.monthBad}
          />
          <NumberField
            {...fields.bind("toYear")}
            label={C.form.toYearLabel}
            help={C.form.yearHelp}
            error={C.form.yearInvalid}
            invalid={to.yearBad}
          />
        </FieldGroup>
      ) : (
        <FieldGroup title={C.form.offsetGroup} className="mt-8">
          <NumberField
            {...fields.bind("offset")}
            label={C.form.offsetLabel}
            help={C.form.offsetHelp}
            error={C.form.offsetInvalid}
            invalid={offsetInvalid}
          />
          <RadioGroupField
            {...fields.bind("skipWeekends")}
            legend={C.form.skipWeekendsLegend}
            help={C.form.skipWeekendsHelp}
            options={[
              { value: "no", label: C.form.skipWeekendsNo },
              { value: "yes", label: C.form.skipWeekendsYes },
            ]}
          />
        </FieldGroup>
      )}

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {byDifference ? (
          <>
            <ResultRow
              label={C.form.daysLabel}
              value={
                difference
                  ? `${formatDecimal(difference.absoluteDays, 0)} ${C.form.daysUnit}`
                  : null
              }
            />
            <ResultRow
              label={C.form.workdaysLabel}
              value={
                difference
                  ? `${formatDecimal(difference.workdays, 0)} ${C.form.daysUnit}`
                  : null
              }
            />
            <ResultRow
              label={C.form.componentsLabel}
              value={
                difference
                  ? `${formatDecimal(difference.years, 0)} ${C.form.yearsUnit} ${formatDecimal(difference.months, 0)} ${C.form.monthsUnit} ${formatDecimal(difference.dayComponent, 0)} ${C.form.daysUnit}`
                  : null
              }
            />
          </>
        ) : (
          <>
            <ResultRow
              label={C.form.resultDateLabel}
              value={shifted ? showDate(shifted.date) : null}
            />
            <ResultRow
              label={C.form.resultWeekdayLabel}
              value={shifted ? weekday(shifted.weekday) : null}
            />
          </>
        )}
        {/* The counting convention sits WITH the figures. A reader who counts
            by hand and gets one more than the tool needs the rule here, not
            three sections down — and it is also where the "no holidays, no
            legal deadline" boundary belongs. */}
        <ResultRow
          label={C.form.countingRuleLabel}
          value={
            byDifference
              ? C.form.countingRuleDifference
              : C.form.countingRuleOffset
          }
          prose
        />
      </ResultGroup>

      {byDifference ? (
        <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
          <ResultRow
            label={C.form.weeksLabel}
            value={
              difference
                ? `${formatDecimal(difference.weeks, 0)} ${C.form.weeksUnit} ${formatDecimal(difference.remainderDays, 0)} ${C.form.daysUnit}`
                : null
            }
          />
          <ResultRow
            label={C.form.totalMonthsLabel}
            value={
              difference
                ? `${formatDecimal(difference.totalMonths, 0)} ${C.form.monthsUnit}`
                : null
            }
          />
          <ResultRow
            label={C.form.weekendDaysLabel}
            value={
              difference
                ? `${formatDecimal(difference.weekendDays, 0)} ${C.form.daysUnit}`
                : null
            }
          />
          <ResultRow
            label={C.form.fromWeekdayLabel}
            value={difference ? weekday(difference.fromWeekday) : null}
          />
          <ResultRow
            label={C.form.toWeekdayLabel}
            value={difference ? weekday(difference.toWeekday) : null}
          />
        </ResultGroup>
      ) : null}

      {dateInvalid ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
