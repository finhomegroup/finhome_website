"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
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

export function WageCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    unit: C.form.defaultUnit,
    hours: C.form.defaultHours,
    days: C.form.defaultDays,
    weeks: C.form.defaultWeeks,
  });

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

  return (
    <CalculatorCard>
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
          options={[
            { value: "hourly", label: C.form.unitHourly },
            { value: "daily", label: C.form.unitDaily },
            { value: "weekly", label: C.form.unitWeekly },
            { value: "monthly", label: C.form.unitMonthly },
            { value: "yearly", label: C.form.unitYearly },
          ]}
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

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.hourlyLabel} value={money(result?.hourly)} />
        <ResultRow label={C.form.dailyLabel} value={money(result?.daily)} />
        <ResultRow label={C.form.weeklyLabel} value={money(result?.weekly)} />
        <ResultRow label={C.form.monthlyLabel} value={money(result?.monthly)} />
        <ResultRow label={C.form.yearlyLabel} value={money(result?.yearly)} />
        <ResultRow
          label={C.form.hoursPerYearLabel}
          value={
            result
              ? `${formatDecimal(result.hoursPerYear, 0)} ${C.form.hoursUnit}`
              : null
          }
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
