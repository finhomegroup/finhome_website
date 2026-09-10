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
import {
  computeNetDistribution,
  type DistributionDirection,
} from "@/lib/calc/net-distribution";
import { NET_DISTRIBUTION as C } from "@/content/calculators/net-distribution";

export function NetDistributionCalculator() {
  const fields = useCalcFields({
    direction: C.form.defaultDirection,
    amount: C.form.defaultAmount,
    percent1: C.form.defaultPercent1,
    percent2: C.form.defaultPercent2,
    percent3: C.form.defaultPercent3,
    fixed1: C.form.defaultFixed1,
    fixed2: C.form.defaultFixed2,
  });

  const amount = parseMoney(fields.values.amount);
  const percents = [
    parseDecimal(fields.values.percent1),
    parseDecimal(fields.values.percent2),
    parseDecimal(fields.values.percent3),
  ];
  const fixeds = [
    parseMoney(fields.values.fixed1),
    parseMoney(fields.values.fixed2),
  ];

  const amountInvalid = amount === null || amount <= 0;
  const percentInvalid = percents.map(
    (value) => value === null || value < 0,
  );
  const fixedInvalid = fixeds.map((value) => value === null || value < 0);

  const fieldsUsable =
    !amountInvalid &&
    !percentInvalid.some(Boolean) &&
    !fixedInvalid.some(Boolean);

  const result = fieldsUsable
    ? computeNetDistribution({
        direction: fields.values.direction as DistributionDirection,
        amount,
        percentDeductions: percents.map((value) => value ?? 0),
        fixedDeductions: fixeds.map((value) => value ?? 0),
      })
    : null;

  // Every field parses but the percentages reach 100 — nothing survives, and
  // the reverse direction divides by zero.
  const tooMuch = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("direction")}
          legend={C.form.directionLegend}
          help={C.form.directionHelp}
          options={[
            { value: "toNet", label: C.form.directionToNet },
            { value: "toGross", label: C.form.directionToGross },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.amountGroup} className="mt-8">
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.percentGroup} className="mt-8">
        <NumberField
          {...fields.bind("percent1")}
          label={C.form.percent1Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={C.form.percentInvalid}
          invalid={percentInvalid[0]}
        />
        <NumberField
          {...fields.bind("percent2")}
          label={C.form.percent2Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={C.form.percentInvalid}
          invalid={percentInvalid[1]}
        />
        <NumberField
          {...fields.bind("percent3")}
          label={C.form.percent3Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={C.form.percentInvalid}
          invalid={percentInvalid[2]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.fixedGroup} className="mt-8">
        <NumberField
          {...fields.bind("fixed1")}
          label={C.form.fixed1Label}
          unit={C.form.fixedUnit}
          help={C.form.fixedHelp}
          error={C.form.fixedInvalid}
          invalid={fixedInvalid[0]}
        />
        <NumberField
          {...fields.bind("fixed2")}
          label={C.form.fixed2Label}
          unit={C.form.fixedUnit}
          help={C.form.fixedHelp}
          error={C.form.fixedInvalid}
          invalid={fixedInvalid[1]}
        />
      </FieldGroup>

      {/* Both ends of the conversion in the headline, plus the gross-up —
          which is the figure the page exists to correct. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.netLabel} value={money(result?.net)} />
        <ResultRow label={C.form.grossLabel} value={money(result?.gross)} />
        <ResultRow
          label={C.form.grossUpLabel}
          value={
            result && result.grossUpPercent !== null
              ? formatPercent(result.grossUpPercent, 4)
              : null
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.percentAmountLabel}
          value={money(result?.percentAmount)}
        />
        <ResultRow
          label={C.form.fixedAmountLabel}
          value={money(result?.fixedAmount)}
        />
        <ResultRow
          label={C.form.totalDeductedLabel}
          value={money(result?.totalDeducted)}
        />
        <ResultRow
          label={C.form.totalRateLabel}
          value={result ? formatPercent(result.totalPercentRate, 4) : null}
        />
        <ResultRow
          label={C.form.effectiveRateLabel}
          value={
            result ? formatPercent(result.effectiveRatePercent, 4) : null
          }
        />
        <ResultRow
          label={C.form.retentionLabel}
          value={result ? formatPercent(result.retentionPercent, 4) : null}
        />
      </ResultGroup>

      {result !== null && result.net < 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.negativeNetNotice}
        </p>
      ) : null}

      {tooMuch ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.tooMuchNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
