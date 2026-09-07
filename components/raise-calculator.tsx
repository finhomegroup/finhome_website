"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRaise, type RaiseMode } from "@/lib/calc/raise";
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
  const fields = useCalcFields({
    mode: "percent",
    current: C.form.defaultCurrent,
    percent: C.form.defaultPercent,
    amount: C.form.defaultAmount,
    target: C.form.defaultTarget,
    perYear: C.form.defaultPerYear,
  });

  const mode = fields.values.mode as RaiseMode;
  const active = MODES[mode];

  const current = parseMoney(fields.values.current);
  const value = active.isPercent
    ? parseDecimal(fields.values[active.key])
    : parseMoney(fields.values[active.key]);
  const perYear = parseDecimal(fields.values.perYear);

  const currentInvalid = current === null || current <= 0;
  // A negative rise is legitimate; a negative TARGET salary is not.
  const valueInvalid = value === null || (mode === "target" && value < 0);
  const perYearInvalid = perYear === null || perYear <= 0;

  const result =
    currentInvalid || valueInvalid || perYearInvalid
      ? null
      : computeRaise({ mode, current, value, perYear });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
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
    </CalculatorCard>
  );
}
