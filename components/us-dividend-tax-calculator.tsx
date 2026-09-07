"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeUsDividendTax,
  type NiitStatus,
} from "@/lib/calc/us-dividend-tax";
import { US_DIVIDEND_TAX as C } from "@/content/calculators/us-dividend-tax";

const F = C.form;

const RATE_OPTIONS = [
  { value: "0", label: F.qualifiedRateOptions.zero },
  { value: "15", label: F.qualifiedRateOptions.fifteen },
  { value: "20", label: F.qualifiedRateOptions.twenty },
];

const STATUS_OPTIONS: readonly { value: NiitStatus; label: string }[] = [
  { value: "single", label: F.statusOptions.single },
  { value: "married", label: F.statusOptions.married },
  { value: "marriedSeparate", label: F.statusOptions.marriedSeparate },
  { value: "head", label: F.statusOptions.head },
];

const NIIT_OPTIONS = [
  { value: "yes", label: F.niitOptions.yes },
  { value: "no", label: F.niitOptions.no },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsDividendTaxCalculator() {
  const fields = useCalcFields(F.defaults);

  const qualified = parseMoney(fields.values.qualified);
  const ordinary = parseMoney(fields.values.ordinary);
  const ordinaryRate = parseDecimal(fields.values.ordinaryRate);
  const magi = parseMoney(fields.values.magi);

  const qualifiedInvalid = qualified === null || qualified < 0;
  const ordinaryInvalid = ordinary === null || ordinary < 0;
  const ordinaryRateInvalid =
    ordinaryRate === null || ordinaryRate < 0 || ordinaryRate > 100;
  const magiInvalid = magi === null || magi < 0;

  const anyInvalid =
    qualifiedInvalid || ordinaryInvalid || ordinaryRateInvalid || magiInvalid;

  const result = anyInvalid
    ? null
    : computeUsDividendTax({
        qualifiedDividends: qualified,
        ordinaryDividends: ordinary,
        qualifiedRatePercent: Number(fields.values.qualifiedRate),
        ordinaryRatePercent: ordinaryRate,
        modifiedAgi: magi,
        status: fields.values.status as NiitStatus,
        applyNiit: fields.values.niit === "yes",
      });

  return (
    <CalculatorCard>
      <FieldGroup title={F.incomeGroup}>
        <NumberField
          {...fields.bind("qualified")}
          label={F.qualifiedLabel}
          unit={F.qualifiedUnit}
          help={F.qualifiedHelp}
          error={F.qualifiedInvalid}
          invalid={qualifiedInvalid}
        />
        <NumberField
          {...fields.bind("ordinary")}
          label={F.ordinaryLabel}
          unit={F.ordinaryUnit}
          help={F.ordinaryHelp}
          error={F.ordinaryInvalid}
          invalid={ordinaryInvalid}
        />
      </FieldGroup>

      <FieldGroup title={F.rateGroup} className="mt-8">
        <SelectField
          {...fields.bind("qualifiedRate")}
          label={F.qualifiedRateLabel}
          help={F.qualifiedRateHelp}
          options={RATE_OPTIONS}
        />
        <NumberField
          {...fields.bind("ordinaryRate")}
          label={F.ordinaryRateLabel}
          unit={F.ordinaryRateUnit}
          help={F.ordinaryRateHelp}
          error={F.ordinaryRateInvalid}
          invalid={ordinaryRateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={F.niitGroup} className="mt-8">
        <NumberField
          {...fields.bind("magi")}
          label={F.magiLabel}
          unit={F.magiUnit}
          help={F.magiHelp}
          error={F.magiInvalid}
          invalid={magiInvalid}
        />
        <SelectField
          {...fields.bind("status")}
          label={F.statusLabel}
          help={F.statusHelp}
          options={STATUS_OPTIONS}
        />
        <RadioGroupField
          {...fields.bind("niit")}
          legend={F.niitLabel}
          help={F.niitHelp}
          options={NIIT_OPTIONS}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.totalTaxLabel}
          value={result === null ? null : usd(result.totalTax)}
        />
        <ResultRow
          label={F.effectiveRateLabel}
          value={
            result === null || result.effectiveRatePercent === null
              ? null
              : formatPercent(result.effectiveRatePercent, 2)
          }
        />
        <ResultRow
          label={F.afterTaxLabel}
          value={result === null ? null : usd(result.afterTaxIncome)}
        />
      </ResultGroup>

      <ResultGroup title={F.breakdownTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.qualifiedTaxLabel}
          value={result === null ? null : usd(result.qualifiedTax)}
        />
        <ResultRow
          label={F.ordinaryTaxLabel}
          value={result === null ? null : usd(result.ordinaryTax)}
        />
        <ResultRow
          label={F.thresholdLabel}
          value={
            result === null
              ? null
              : `${formatMoney(result.niitThreshold)} USD`
          }
        />
        <ResultRow
          label={F.magiExcessLabel}
          value={result === null ? null : usd(result.magiExcess)}
        />
        <ResultRow
          label={F.niitBaseLabel}
          value={result === null ? null : usd(result.niitBase)}
        />
        <ResultRow
          label={F.niitTaxLabel}
          value={result === null ? null : usd(result.niitTax)}
        />
        <ResultRow
          label={F.allOrdinaryLabel}
          value={result === null ? null : usd(result.taxIfAllOrdinary)}
        />
        <ResultRow
          label={F.savingLabel}
          value={result === null ? null : usd(result.qualifiedSaving)}
        />
      </ResultGroup>

      <p className="mt-6 text-sm leading-relaxed text-ink-3">
        {F.thresholdGuide}
      </p>

      {result?.aboveNiitThreshold ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.aboveThresholdNotice}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
