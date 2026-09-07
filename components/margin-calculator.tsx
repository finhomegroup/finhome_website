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
import { computeMargin, type MarginMode } from "@/lib/calc/margin";
import { MARGIN as C } from "@/content/calculators/margin";

/** The second box: a price in one mode, a percentage in the other two. */
const MODES = {
  price: {
    key: "price",
    label: C.form.priceLabel,
    unit: C.form.priceUnit,
    help: C.form.priceHelp,
    error: C.form.priceInvalid,
    isPercent: false,
  },
  margin: {
    key: "margin",
    label: C.form.marginLabel,
    unit: C.form.marginUnit,
    help: C.form.marginHelp,
    error: C.form.marginInvalid,
    isPercent: true,
  },
  markup: {
    key: "markup",
    label: C.form.markupLabel,
    unit: C.form.markupUnit,
    help: C.form.markupHelp,
    error: C.form.markupInvalid,
    isPercent: true,
  },
} as const satisfies Record<
  MarginMode,
  {
    key: string;
    label: string;
    unit: string;
    help: string;
    error: string;
    isPercent: boolean;
  }
>;

export function MarginCalculator() {
  const fields = useCalcFields({
    mode: "price",
    cost: C.form.defaultCost,
    price: C.form.defaultPrice,
    margin: C.form.defaultMargin,
    markup: C.form.defaultMarkup,
  });

  const mode = fields.values.mode as MarginMode;
  const active = MODES[mode];

  const cost = parseMoney(fields.values.cost);
  const value = active.isPercent
    ? parseDecimal(fields.values[active.key])
    : parseMoney(fields.values[active.key]);

  const costInvalid = cost === null || cost <= 0;
  // Each mode has its own impossible value: a free sale has no margin, a
  // margin of 100% implies a cost of zero, and a −100% markup zeroes the price.
  const valueInvalid =
    value === null ||
    (mode === "price" && value === 0) ||
    (mode === "margin" && value >= 100) ||
    (mode === "markup" && value <= -100);

  const result =
    costInvalid || valueInvalid ? null : computeMargin({ mode, cost, value });

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
            { value: "price", label: C.form.modePrice },
            { value: "margin", label: C.form.modeMargin },
            { value: "markup", label: C.form.modeMarkup },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("cost")}
          label={C.form.costLabel}
          unit={C.form.costUnit}
          help={C.form.costHelp}
          error={C.form.costInvalid}
          invalid={costInvalid}
        />
        <NumberField
          key={mode}
          {...fields.bind(active.key)}
          label={active.label}
          unit={active.unit}
          help={active.help}
          error={active.error}
          invalid={valueInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.priceResultLabel}
          value={money(result?.price)}
        />
        <ResultRow label={C.form.profitLabel} value={money(result?.profit)} />
        <ResultRow
          label={C.form.marginResultLabel}
          value={result ? formatPercent(result.marginPercent) : null}
        />
        <ResultRow
          label={C.form.markupResultLabel}
          value={result ? formatPercent(result.markupPercent) : null}
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
