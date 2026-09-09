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
  isValidDate,
  type CalendarDate,
} from "@/lib/calc/dates";
import { DATES as C } from "@/content/calculators/dates";

/**
 * Parse a year/month/day trio out of the raw field strings.
 *
 * Exported for `dates-calculator.test.ts`: the per-field blame below is the
 * whole point of the function and a future refactor would naturally re-couple
 * it to the trio, so it needs a test, and a pure helper is the only thing this
 * repo's runner can test out of a client component (no jsdom).
 */
export function readDate(
  year: string,
  month: string,
  day: string,
): { date: CalendarDate | null; yearBad: boolean; monthBad: boolean; dayBad: boolean } {
  const y = parseDecimal(year);
  const m = parseDecimal(month);
  const dd = parseDecimal(day);

  const yearBad = y === null || !Number.isInteger(y);
  const monthBad = m === null || !Number.isInteger(m) || m < 1 || m > 12;
  // The day's OWN validity splits in two, and only one half needs the trio.
  //
  // The number itself: a value that is not an integer in 1..31 exists in NO
  // month at all, so blaming the day is truthful even while Năm or Tháng is
  // blank. (31 is the narrowest day that does exist somewhere — measured
  // valid in 7 of the 12 months; every day 1..28 is valid in all 12. So the
  // 1..31 window is exactly the set worth keeping in the box.)
  //
  // The calendar: whether an integer in 1..31 exists depends on the month
  // (31 tháng 4) and, for 29 February, on the year — so that half waits for
  // a candidate. `dayBad` drives `invalid` on the DAY input, whose message
  // reads "Ngày không tồn tại trong tháng đã chọn."; announcing that about a
  // legitimate 1..31 day merely because Năm is mid-edit reddened two fields
  // and gave a reason that was not true.
  const dayNumberBad =
    dd === null || !Number.isInteger(dd) || dd < 1 || dd > 31;
  const trioUsable =
    y !== null && !yearBad && m !== null && !monthBad && !dayNumberBad;
  const candidate = trioUsable ? { year: y, month: m, day: dd } : null;
  const dayBad =
    dayNumberBad || (candidate !== null && !isValidDate(candidate));

  return {
    // The result still blanks whenever ANY of the trio is bad — only the
    // per-field blame changed.
    date: candidate !== null && !dayBad ? candidate : null,
    yearBad,
    monthBad,
    dayBad,
  };
}

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
          help={C.form.dayInvalid}
          error={C.form.dayInvalid}
          invalid={from.dayBad}
        />
        <NumberField
          {...fields.bind("fromMonth")}
          label={C.form.fromMonthLabel}
          help={C.form.monthInvalid}
          error={C.form.monthInvalid}
          invalid={from.monthBad}
        />
        <NumberField
          {...fields.bind("fromYear")}
          label={C.form.fromYearLabel}
          help={C.form.yearInvalid}
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
            help={C.form.dayInvalid}
            error={C.form.dayInvalid}
            invalid={to.dayBad}
          />
          <NumberField
            {...fields.bind("toMonth")}
            label={C.form.toMonthLabel}
            help={C.form.monthInvalid}
            error={C.form.monthInvalid}
            invalid={to.monthBad}
          />
          <NumberField
            {...fields.bind("toYear")}
            label={C.form.toYearLabel}
            help={C.form.yearInvalid}
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
