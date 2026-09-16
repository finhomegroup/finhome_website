"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
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
  netProceedsModel,
  type NamedCharge,
} from "@/lib/calc/charts/net-proceeds-chart";
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

  /**
   * Whether each percentage field is marked invalid.
   *
   * A CROSS-FIELD failure is attached to the fields that caused it. When the
   * rates SUM to 100 or more, each one is individually legal — so the
   * paragraph below used to be the only signal, and an independent review
   * found the group carrying no `aria-invalid` and no described error for it.
   * A screen-reader user got blank results with no announced reason.
   *
   * Every percentage field carries the flag, because the sum is the fault and
   * no single field is more to blame than another; `NumberField` then shows
   * the total-rate error in place of its own help text and sets
   * `aria-invalid`.
   */
  const percentFieldInvalid = percents.map(
    (value, index) => percentInvalid[index] || tooMuch,
  );

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /**
   * Each charge, named, with the BASE its percentage applied to.
   *
   * Built from the same parsed figures the engine used, and from the
   * engine's own gross — so a percentage line's đồng amount is always
   * `percent% × gross` and never a share of some other number. The declared
   * base is what makes a charge checkable against a contract.
   */
  const namedCharges: NamedCharge[] =
    result === null
      ? []
      : [
          ...[
            { key: "percent1", label: C.form.percent1Label, percent: percents[0] },
            { key: "percent2", label: C.form.percent2Label, percent: percents[1] },
            { key: "percent3", label: C.form.percent3Label, percent: percents[2] },
          ].map(({ key, label, percent }) => ({
            key,
            label,
            percent: percent ?? 0,
            amount: result.gross * ((percent ?? 0) / 100),
          })),
          ...[
            { key: "fixed1", label: C.form.fixed1Label, amount: fixeds[0] ?? 0 },
            { key: "fixed2", label: C.form.fixed2Label, amount: fixeds[1] ?? 0 },
          ].map(({ key, label, amount }) => ({
            key,
            label,
            // Null percent means "a flat amount", which the table labels
            // differently from a share of the gross.
            percent: null,
            amount,
          })),
        ];

  const chart = netProceedsModel(result, namedCharges, C.chart);

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
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[0]}
        />
        <NumberField
          {...fields.bind("percent2")}
          label={C.form.percent2Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[1]}
        />
        <NumberField
          {...fields.bind("percent3")}
          label={C.form.percent3Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[2]}
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
      {/* Original row 67: the gross obligation stays VISIBLE beside the
          smaller figure that arrives, and is named as still owed. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.netLabel} value={money(result?.net)} />
        <ResultRow label={C.form.grossLabel} value={money(result?.gross)} />
        <ResultRow
          label={C.form.obligationLabel}
          value={money(result?.gross)}
        />
        <ResultRow
          label={C.form.grossUpLabel}
          value={
            result && result.grossUpPercent !== null
              ? formatPercent(result.grossUpPercent, 4)
              : null
          }
        />
      </ResultGroup>

      {/* Conditional on there BEING two figures. The sentence explains why
          the first two rows differ, and a review found it still asserting
          that while both rows were the placeholder — the cross-field
          total-rate failure blanks them. */}
      {result !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.obligationNote}
        </p>
      ) : null}

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

      <ChartFigure model={chart}>
        <BarChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
