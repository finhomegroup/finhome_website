"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRoi } from "@/lib/calc/roi";
import { ROI as C } from "@/content/calculators/roi";

export function RoiCalculator() {
  const fields = useCalcFields({
    cost: C.form.defaultCost,
    final: C.form.defaultFinal,
    years: C.form.defaultYears,
  });

  const cost = parseMoney(fields.values.cost);
  const final = parseMoney(fields.values.final);

  // The holding period is optional: empty means "I don't know", which is a
  // different thing from a bad entry and must not read as an error.
  const yearsRaw = fields.values.years.trim();
  const years = yearsRaw === "" ? 0 : parseDecimal(yearsRaw);

  const costInvalid = cost === null || cost <= 0;
  const finalInvalid = final === null || final < 0;
  const yearsInvalid = years === null || years < 0;

  const result =
    costInvalid || finalInvalid || yearsInvalid
      ? null
      : computeRoi({ cost, finalValue: final, years });

  const money = (value: number) => `${formatMoney(value)} ₫`;

  // Two states worth naming rather than leaving as an empty row: no holding
  // period given, and a total loss. Both have a real ROI but no annual rate.
  const noAnnual =
    result !== null && result.annualisedPercent === null && result.years === null;
  const totalLoss =
    result !== null && result.annualisedPercent === null && result.years !== null;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.group}>
        <NumberField
          {...fields.bind("cost")}
          label={C.form.costLabel}
          unit={C.form.costUnit}
          help={C.form.costHelp}
          error={C.form.costInvalid}
          invalid={costInvalid}
        />
        <NumberField
          {...fields.bind("final")}
          label={C.form.finalLabel}
          unit={C.form.finalUnit}
          help={C.form.finalHelp}
          error={C.form.finalInvalid}
          invalid={finalInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={C.form.yearsLabel}
          unit={C.form.yearsUnit}
          help={C.form.yearsHelp}
          error={C.form.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      {/* The annual figure is first because it is the one that compares. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.annualisedLabel}
          value={
            result?.annualisedPercent == null
              ? null
              : formatPercent(result.annualisedPercent)
          }
        />
        <ResultRow
          label={C.form.roiLabel}
          value={result === null ? null : formatPercent(result.roiPercent)}
        />
        <ResultRow
          label={C.form.gainLabel}
          value={result === null ? null : money(result.gain)}
        />
        <ResultRow
          label={C.form.multipleLabel}
          value={
            result === null
              ? null
              : `${formatDecimal(result.multiple)} ${C.form.multipleSuffix}`
          }
        />
      </ResultGroup>

      {noAnnual ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noAnnualNotice}
        </p>
      ) : null}

      {totalLoss ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.totalLossNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
