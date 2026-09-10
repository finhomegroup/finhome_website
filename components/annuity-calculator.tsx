"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeAnnuity, type AnnuityInput, type AnnuityMode } from "@/lib/calc/annuity";
import { ANNUITY as C } from "@/content/calculators/annuity";

const F = C.form;
const T = F.table;

const MODE_OPTIONS: readonly { value: AnnuityMode; label: string }[] = [
  { value: "payment", label: F.modeOptions.payment },
  { value: "premium", label: F.modeOptions.premium },
];

const FREQUENCY_OPTIONS = [
  { value: "12", label: F.frequencyOptions.monthly },
  { value: "4", label: F.frequencyOptions.quarterly },
  { value: "2", label: F.frequencyOptions.semiannual },
  { value: "1", label: F.frequencyOptions.annual },
];

const TIMING_OPTIONS = [
  { value: "start", label: F.timingOptions.start },
  { value: "end", label: F.timingOptions.end },
];

/** Terms the sensitivity table always shows. */
const TABLE_YEARS = [10, 15, 20, 25, 30];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** Signed, because the quote comparison's sign is its whole answer. */
function signedUsdCents(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatMoney(Math.abs(value), 2)} USD`;
}

export function AnnuityCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const mode = v.mode as AnnuityMode;
  const premium = parseMoney(v.premium);
  const desiredPayment = parseMoney(v.desiredPayment);
  const years = parseCount(v.years);
  const deferral = parseCount(v.deferral);
  const rate = parseDecimal(v.rate);
  const tax = parseDecimal(v.tax);
  const quoted = parseMoney(v.quoted);
  const paymentsPerYear = Number(v.frequency);

  // Only the field this mode actually reads can be invalid. Flagging the
  // hidden one would blank the page with an error the reader cannot see.
  const invalid = {
    premium: mode === "payment" && (premium === null || premium < 0),
    desiredPayment:
      mode === "premium" && (desiredPayment === null || desiredPayment < 0),
    years: years === null || years < 1 || years > 70,
    deferral: deferral === null || deferral > 50,
    rate: rate === null || rate < -100 || rate > 100,
    tax: tax === null || tax < 0 || tax > 100,
    quoted: quoted === null || quoted < 0,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: AnnuityInput | null = anyInvalid
    ? null
    : {
        mode,
        // The field this mode does not read is fed zero, which the module
        // ignores for that mode.
        premium: mode === "payment" ? premium! : 0,
        desiredPayment: mode === "premium" ? desiredPayment! : 0,
        paymentsPerYear,
        years: years!,
        ratePercent: rate!,
        paymentAtStart: v.timing === "start",
        deferralYears: deferral!,
        taxRatePercent: tax!,
        quotedPayment: quoted!,
      };

  const result = input === null ? null : computeAnnuity(input);

  const rows =
    result === null || input === null
      ? []
      : Array.from(new Set([...TABLE_YEARS, input.years]))
          .filter((each) => each >= 1 && each <= 70)
          .sort((a, b) => a - b)
          .map((each) => {
            const at = computeAnnuity({ ...input, years: each });
            return [
              String(each),
              at === null ? null : usdCents(at.payment),
              at === null ? null : usd(at.annualPayment),
              at === null || at.payoutRatePercent === null
                ? null
                : formatPercent(at.payoutRatePercent, 2),
              at === null ? null : usd(at.totalPaid),
              at === null || at.payoutMultiple === null
                ? null
                : formatDecimal(at.payoutMultiple, 2),
              at === null || at.moneyBackYears === null
                ? null
                : formatDecimal(at.moneyBackYears, 1),
            ];
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
        {mode === "payment" ? (
          <NumberField
            {...fields.bind("premium")}
            label={F.premiumLabel}
            unit={F.premiumUnit}
            help={F.premiumHelp}
            error={F.moneyInvalid}
            invalid={invalid.premium}
          />
        ) : (
          <NumberField
            {...fields.bind("desiredPayment")}
            label={F.desiredPaymentLabel}
            unit={F.desiredPaymentUnit}
            help={F.desiredPaymentHelp}
            error={F.moneyInvalid}
            invalid={invalid.desiredPayment}
          />
        )}
      </FieldGroup>

      <FieldGroup title={F.contractGroup} className="mt-8">
        <SelectField
          {...fields.bind("frequency")}
          label={F.frequencyLabel}
          help={F.frequencyHelp}
          options={FREQUENCY_OPTIONS}
        />
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={invalid.years}
        />
        <NumberField
          {...fields.bind("rate")}
          label={F.rateLabel}
          unit={F.rateUnit}
          help={F.rateHelp}
          error={F.rateInvalid}
          invalid={invalid.rate}
        />
        <RadioGroupField
          {...fields.bind("timing")}
          legend={F.timingLabel}
          help={F.timingHelp}
          options={TIMING_OPTIONS}
        />
        <NumberField
          {...fields.bind("deferral")}
          label={F.deferralLabel}
          unit={F.deferralUnit}
          help={F.deferralHelp}
          error={F.deferralInvalid}
          invalid={invalid.deferral}
        />
      </FieldGroup>

      <FieldGroup title={F.taxGroup} className="mt-8">
        <NumberField
          {...fields.bind("tax")}
          label={F.taxLabel}
          unit={F.taxUnit}
          help={F.taxHelp}
          error={F.taxInvalid}
          invalid={invalid.tax}
        />
        <NumberField
          {...fields.bind("quoted")}
          label={F.quotedLabel}
          unit={F.quotedUnit}
          help={F.quotedHelp}
          error={F.moneyInvalid}
          invalid={invalid.quoted}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.paymentLabel}
          value={result === null ? null : usdCents(result.payment)}
        />
        <ResultRow
          label={F.annualLabel}
          value={result === null ? null : usdCents(result.annualPayment)}
        />
        <ResultRow
          label={F.netLabel}
          value={result === null ? null : usdCents(result.netPerPayment)}
        />
        <ResultRow
          label={F.payoutRateLabel}
          value={
            result === null || result.payoutRatePercent === null
              ? null
              : formatPercent(result.payoutRatePercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.breakdownTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.excludedLabel}
          value={result === null ? null : usdCents(result.excludedPerPayment)}
        />
        <ResultRow
          label={F.taxableLabel}
          value={result === null ? null : usdCents(result.taxablePerPayment)}
        />
        <ResultRow
          label={F.exclusionLabel}
          value={
            result === null || result.exclusionRatioPercent === null
              ? null
              : formatPercent(result.exclusionRatioPercent, 1)
          }
        />
        <ResultRow
          label={F.taxLabelResult}
          value={result === null ? null : usdCents(result.taxPerPayment)}
        />
        <ResultRow
          label={F.netLabelResult}
          value={result === null ? null : usdCents(result.netPerPayment)}
        />
        <ResultRow
          label={F.effectiveTaxLabel}
          value={
            result === null || result.effectiveTaxRatePercent === null
              ? null
              : formatPercent(result.effectiveTaxRatePercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.contractTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.premiumLabelResult}
          value={result === null ? null : usd(result.premium)}
        />
        <ResultRow
          label={F.valueAtStartLabel}
          value={result === null ? null : usd(result.valueAtAnnuitisation)}
        />
        <ResultRow
          label={F.totalPaidLabel}
          value={result === null ? null : usd(result.totalPaid)}
        />
        <ResultRow
          label={F.interestLabel}
          value={result === null ? null : usd(result.interestEarned)}
        />
        <ResultRow
          label={F.multipleLabel}
          value={
            result === null || result.payoutMultiple === null
              ? null
              : formatDecimal(result.payoutMultiple, 2)
          }
        />
        <ResultRow
          label={F.moneyBackLabel}
          value={
            result === null || result.moneyBackYears === null
              ? null
              : `${formatDecimal(result.moneyBackYears, 1)} ${F.yearsUnit}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.quoteTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.quotedLabelResult}
          value={
            result === null || result.quotedPayment <= 0
              ? null
              : usdCents(result.quotedPayment)
          }
        />
        <ResultRow
          label={F.impliedLabel}
          value={
            result === null || result.quotedImpliedRatePercent === null
              ? null
              : formatPercent(result.quotedImpliedRatePercent, 2)
          }
        />
        <ResultRow
          label={F.advantageLabel}
          value={
            result === null || result.quoteAdvantage === null
              ? null
              : signedUsdCents(result.quoteAdvantage)
          }
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.yearsColumn },
              { label: T.paymentColumn, numeric: true },
              { label: T.annualColumn, numeric: true },
              { label: T.payoutRateColumn, numeric: true },
              { label: T.totalColumn, numeric: true },
              { label: T.multipleColumn, numeric: true },
              { label: T.moneyBackColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.quoteAdvantage === null
            ? F.noQuoteNotice
            : result.quoteAdvantage < 0
              ? F.quoteWorseNotice
              : F.quoteBetterNotice}
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
