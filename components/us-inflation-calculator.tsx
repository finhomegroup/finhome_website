"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
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
import {
  computeUsInflation,
  type InflationMode,
} from "@/lib/calc/us-inflation";
import { US_INFLATION as C } from "@/content/calculators/us-inflation";

const F = C.form;

const MODE_OPTIONS = [
  { value: "cpi", label: F.modeOptions.cpi },
  { value: "rate", label: F.modeOptions.rate },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsInflationCalculator() {
  const fields = useCalcFields(F.defaults);

  const mode = fields.values.mode as InflationMode;
  const cpiMode = mode === "cpi";

  const amount = parseMoney(fields.values.amount);
  const startCpi = parseDecimal(fields.values.startCpi);
  const endCpi = parseDecimal(fields.values.endCpi);
  const rate = parseDecimal(fields.values.rate);
  const years = parseDecimal(fields.values.years);

  const amountInvalid = amount === null || amount < 0;
  const yearsInvalid = years === null || years <= 0;
  // The CPI fields are only capable of being wrong in CPI mode. Marking them
  // invalid in rate mode would flag a field the answer does not read.
  const startCpiInvalid = cpiMode && (startCpi === null || startCpi <= 0);
  const endCpiInvalid = cpiMode && (endCpi === null || endCpi <= 0);
  const rateInvalid = !cpiMode && (rate === null || rate <= -100);

  const anyInvalid =
    amountInvalid ||
    yearsInvalid ||
    startCpiInvalid ||
    endCpiInvalid ||
    rateInvalid;

  const result = anyInvalid
    ? null
    : computeUsInflation({
        mode,
        amount: amount!,
        // The unused branch's fields still have to be numbers for the call.
        // The module ignores whichever pair the mode does not read, and a
        // test pins that it truly ignores them.
        startCpi: startCpi ?? 100,
        endCpi: endCpi ?? 100,
        years: years!,
        ratePercent: rate ?? 0,
      });

  return (
    <CalculatorCard>
      <FieldGroup title={F.modeGroup}>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={F.modeLabel}
          help={F.modeHelp}
          options={MODE_OPTIONS}
        />
      </FieldGroup>

      <FieldGroup title={F.amountGroup} className="mt-8">
        <NumberField
          {...fields.bind("amount")}
          label={F.amountLabel}
          unit={F.amountUnit}
          help={F.amountHelp}
          error={F.amountInvalid}
          invalid={amountInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      {cpiMode ? (
        <FieldGroup title={F.cpiGroup} className="mt-8">
          <NumberField
            {...fields.bind("startCpi")}
            label={F.startCpiLabel}
            help={F.startCpiHelp}
            error={F.startCpiInvalid}
            invalid={startCpiInvalid}
          />
          <NumberField
            {...fields.bind("endCpi")}
            label={F.endCpiLabel}
            help={F.endCpiHelp}
            error={F.endCpiInvalid}
            invalid={endCpiInvalid}
          />
        </FieldGroup>
      ) : (
        <FieldGroup title={F.rateGroup} className="mt-8">
          <NumberField
            {...fields.bind("rate")}
            label={F.rateLabel}
            unit={F.rateUnit}
            help={F.rateHelp}
            error={F.rateInvalid}
            invalid={rateInvalid}
          />
        </FieldGroup>
      )}

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.equivalentLabel}
          value={result === null ? null : usd(result.equivalentAmount)}
        />
        <ResultRow
          label={F.cumulativeLabel}
          value={
            result === null
              ? null
              : formatPercent(result.cumulativeInflationPercent, 2)
          }
        />
        <ResultRow
          label={F.annualLabel}
          value={
            result === null || result.annualRatePercent === null
              ? null
              : formatPercent(result.annualRatePercent, 4)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.powerTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.powerOfOneLabel}
          value={
            result === null
              ? null
              : `${formatDecimal(result.purchasingPowerOfOne, 4)} USD`
          }
        />
        <ResultRow
          label={F.powerLostLabel}
          value={
            result === null
              ? null
              : formatPercent(result.purchasingPowerLostPercent, 2)
          }
        />
        <ResultRow
          label={F.halvingLabel}
          value={
            result === null
              ? null
              : result.yearsToHalvePower === null
                ? F.neverHalves
                : `${formatDecimal(result.yearsToHalvePower, 2)} ${F.halvingUnit}`
          }
        />
      </ResultGroup>

      {cpiMode ? (
        <p className="mt-6 text-sm leading-relaxed text-ink-3">
          {F.cpiSourceNotice}
        </p>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-ink-3">
          {F.rateModeNotice}
        </p>
      )}

      {result?.deflation ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.deflationNotice}
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
