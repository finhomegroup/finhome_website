"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { convertWage, type WageUnit } from "@/lib/calc/wage";
import { WAGE as C } from "@/content/calculators/wage";

const FORM_ID = "luong-gio-nhap";
const RESULT_ID = "luong-gio-ket-qua";

/**
 * The five units, in time order, paired with the `convertWage` field each
 * reads and the label it carries. ONE list, so the select, the headline and
 * the table cannot drift apart — the defect a second hardcoded ordering
 * would introduce is a table that omits the unit the headline shows, or shows
 * it twice.
 */
const UNITS = [
  ["hourly", C.form.hourlyLabel],
  ["daily", C.form.dailyLabel],
  ["weekly", C.form.weeklyLabel],
  ["monthly", C.form.monthlyLabel],
  ["yearly", C.form.yearlyLabel],
] as const satisfies readonly (readonly [WageUnit, string])[];

/** The INPUT select's labels: the unit of the figure being typed in. */
const INPUT_LABELS: Record<WageUnit, string> = {
  hourly: C.form.unitHourly,
  daily: C.form.unitDaily,
  weekly: C.form.unitWeekly,
  monthly: C.form.unitMonthly,
  yearly: C.form.unitYearly,
};

/**
 * ROW 64: "Ưu tiên đơn vị lương người dùng muốn biết; các đơn vị còn lại để
 * trong bảng gọn."
 *
 * The tool used to answer five questions at once, in five rows of equal
 * weight, and the reader had to find theirs. It now asks which one they came
 * for — defaulting to "tháng", the unit the route is named after — and gives
 * that one the headline, with the other four in a two-column table below.
 *
 * WHAT DID NOT CHANGE, deliberately: the input unit and its default
 * (`hourly`), the default amount, the whole schedule group and its
 * validation, and the `convertWage` call. This row is a presentation choice
 * on top of the same five figures; every one of them is still rendered, so a
 * reader who wanted a different unit reads the table rather than re-entering
 * anything. The schedule echo stays beside the headline, because "17,3 triệu
 * mỗi tháng" is meaningless without the 40 hours a week it assumed.
 */
export function WageCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The longer guidance below — `<ToolNextSteps promoted>`. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Hours, days and weeks go through
  // `parseDecimal`; unit and output are lists.
  const fields = useCalcFields(
    {
      amount: C.form.defaultAmount,
      unit: C.form.defaultUnit,
      output: C.form.defaultOutput,
      hours: C.form.defaultHours,
      days: C.form.defaultDays,
      weeks: C.form.defaultWeeks,
    },
    { amount: "money", hours: "rate", days: "rate", weeks: "rate" },
  );

  const amount = parseMoney(fields.values.amount);
  const hours = parseDecimal(fields.values.hours);
  const days = parseDecimal(fields.values.days);
  const weeks = parseDecimal(fields.values.weeks);

  const amountInvalid = amount === null || amount < 0;
  const hoursInvalid = hours === null || hours <= 0;
  const daysInvalid = days === null || days <= 0 || days > 7;
  const weeksInvalid = weeks === null || weeks <= 0;

  const result =
    amountInvalid || hoursInvalid || daysInvalid || weeksInvalid
      ? null
      : convertWage({
          amount,
          unit: fields.values.unit as WageUnit,
          hoursPerWeek: hours,
          daysPerWeek: days,
          weeksPerYear: weeks,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const output = fields.values.output as WageUnit;
  const outputLabel =
    UNITS.find(([unit]) => unit === output)?.[1] ?? C.form.monthlyLabel;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
            <FieldGroup title={C.form.payGroup}>
              <NumberField
                {...fields.bind("amount")}
                label={C.form.amountLabel}
                unit={C.form.amountUnit}
                help={C.form.amountHelp}
                error={C.form.amountInvalid}
                invalid={amountInvalid}
              />
              <SelectField
                {...fields.bind("unit")}
                label={C.form.unitLabel}
                help={C.form.unitHelp}
                options={UNITS.map(([unit]) => ({
                  value: unit,
                  label: INPUT_LABELS[unit],
                }))}
              />
              {/* The OUT unit, next to the IN unit rather than in a group of
                  its own: the two are a pair of opposite questions, and
                  separating them invites reading the second as a repeat. */}
              <SelectField
                {...fields.bind("output")}
                label={C.form.outputLabel}
                help={C.form.outputHelp}
                options={UNITS.map(([unit]) => ({
                  value: unit,
                  label: INPUT_LABELS[unit],
                }))}
              />
            </FieldGroup>

            <FieldGroup title={C.form.scheduleGroup} className="mt-8">
              <NumberField
                {...fields.bind("hours")}
                label={C.form.hoursLabel}
                help={C.form.hoursHelp}
                error={C.form.hoursInvalid}
                invalid={hoursInvalid}
              />
              <NumberField
                {...fields.bind("days")}
                label={C.form.daysLabel}
                help={C.form.daysHelp}
                error={C.form.daysInvalid}
                invalid={daysInvalid}
              />
              <NumberField
                {...fields.bind("weeks")}
                label={C.form.weeksLabel}
                help={C.form.weeksHelp}
                error={C.form.weeksInvalid}
                invalid={weeksInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={
              amountInvalid || hoursInvalid || daysInvalid || weeksInvalid
            }
          />
        }
        primary={
          <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
            <ResultRow
              label={outputLabel}
              value={money(result?.[output])}
              emphasis
            />
            {/* The schedule the conversion rests on, beside the figure it
                produced, and still inside the announced region. */}
            <ResultRow
              label={C.form.scheduleEchoLabel}
              value={
                result === null ||
                hours === null ||
                days === null ||
                weeks === null
                  ? null
                  : C.form.scheduleEchoFormat
                      .replace("{hours}", formatDecimal(hours))
                      .replace("{days}", formatDecimal(days))
                      .replace("{weeks}", formatDecimal(weeks))
              }
              prose
            />
          </ResultGroup>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          result === null ? null : (
            <>
              <ResultTable
                caption={C.table.caption}
                columns={[
                  { label: C.table.unitColumn },
                  { label: C.table.amountColumn, numeric: true },
                ]}
                rows={UNITS.filter(([unit]) => unit !== output).map(
                  ([unit, label]) => [label, money(result[unit]) ?? ""],
                )}
              />
              {/* Not a wage, so not a row in the table above — but it is the
                  figure every conversion went through, and the FAQ quotes it
                  ("40 giờ và 52 tuần, đó là 2.080 giờ"). */}
              <ResultGroup
                title={C.table.basisTitle}
                className="mt-8"
                live={false}
              >
                <ResultRow
                  label={C.form.hoursPerYearLabel}
                  value={`${formatDecimal(result.hoursPerYear, 0)} ${C.form.hoursUnit}`}
                />
              </ResultGroup>
            </>
          )
        }
      />
    </CalculatorCard>
  );
}
