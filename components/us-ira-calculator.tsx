"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsIra, type IraVerdict, type UsIraInput } from "@/lib/calc/us-ira";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_IRA as C } from "@/content/calculators/us-ira";

const F = C.form;
const T = F.table;

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** Statutory bracket rates, which is what a retirement rate will be. */
const TABLE_RATES = [0, 10, 12, 22, 24, 32, 35, 37];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

function verdictLabel(verdict: IraVerdict): string {
  switch (verdict) {
    case "roth":
      return F.verdictRoth;
    case "traditional":
      return F.verdictTraditional;
    default:
      return F.verdictEqual;
  }
}

export function UsIraCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const age = parseCount(v.age);
  const years = parseCount(v.years);
  const contribution = parseMoney(v.contribution);
  const currentRate = parseDecimal(v.currentRate);
  const retirementRate = parseDecimal(v.retirementRate);
  const capitalGains = parseDecimal(v.capitalGains);
  const returnPercent = parseDecimal(v.returnPercent);

  const badPercent = (value: number | null) =>
    value === null || value < 0 || value > 100;

  const invalid = {
    age: age === null || age > 120,
    years: years === null || years > 70,
    contribution: contribution === null || contribution < 0,
    currentRate: badPercent(currentRate),
    retirementRate: badPercent(retirementRate),
    capitalGains: badPercent(capitalGains),
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: UsIraInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualContribution: contribution!,
        currentRatePercent: currentRate!,
        retirementRatePercent: retirementRate!,
        returnPercent: returnPercent!,
        years: years!,
        capitalGainsRatePercent: capitalGains!,
      };

  const result = input === null ? null : computeUsIra(input);

  // The reader's own retirement rate joins the statutory list, so their case
  // is always a row they can find next to the alternatives.
  const rows =
    result === null || input === null
      ? []
      : Array.from(
          new Set(
            [...TABLE_RATES, input.retirementRatePercent].filter(
              (rate) => rate >= 0 && rate <= 100,
            ),
          ),
        )
          .sort((a, b) => a - b)
          .map((rate) => {
            const at = computeUsIra({ ...input, retirementRatePercent: rate });
            return [
              formatPercent(rate, rate % 1 === 0 ? 0 : 2),
              at === null ? null : usd(at.traditionalTotalEqualCost),
              at === null ? null : usd(at.rothAfterTax),
              at === null ? null : usd(at.rothAdvantageEqualCost),
              at === null ? null : verdictLabel(at.verdict),
            ];
          });

  return (
    <CalculatorCard>
      <FieldGroup title={F.contributionGroup}>
        <SelectField
          {...fields.bind("year")}
          label={F.yearLabel}
          help={F.yearHelp}
          options={YEAR_OPTIONS}
        />
        <NumberField
          {...fields.bind("age")}
          label={F.ageLabel}
          unit={F.ageUnit}
          help={F.ageHelp}
          error={F.ageInvalid}
          invalid={invalid.age}
        />
        <NumberField
          {...fields.bind("contribution")}
          label={F.contributionLabel}
          unit={F.contributionUnit}
          help={F.contributionHelp}
          error={F.moneyInvalid}
          invalid={invalid.contribution}
        />
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={invalid.years}
        />
      </FieldGroup>

      <FieldGroup title={F.taxGroup} className="mt-8">
        <NumberField
          {...fields.bind("currentRate")}
          label={F.currentRateLabel}
          unit={F.currentRateUnit}
          help={F.currentRateHelp}
          error={F.percentInvalid}
          invalid={invalid.currentRate}
        />
        <NumberField
          {...fields.bind("retirementRate")}
          label={F.retirementRateLabel}
          unit={F.retirementRateUnit}
          help={F.retirementRateHelp}
          error={F.percentInvalid}
          invalid={invalid.retirementRate}
        />
        <NumberField
          {...fields.bind("capitalGains")}
          label={F.capitalGainsLabel}
          unit={F.capitalGainsUnit}
          help={F.capitalGainsHelp}
          error={F.percentInvalid}
          invalid={invalid.capitalGains}
        />
      </FieldGroup>

      <FieldGroup title={F.returnGroup} className="mt-8">
        <NumberField
          {...fields.bind("returnPercent")}
          label={F.returnLabel}
          unit={F.returnUnit}
          help={F.returnHelp}
          error={F.rateInvalid}
          invalid={invalid.returnPercent}
        />
      </FieldGroup>

      {/* The verdict, the size of the gap, and the rate that closes it. The
          third row is what stops the first from being read as advice. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.verdictLabel}
          value={result === null ? null : verdictLabel(result.verdict)}
        />
        <ResultRow
          label={F.differenceLabel}
          value={result === null ? null : usd(result.rothAdvantageEqualCost)}
        />
        <ResultRow
          label={F.breakEvenLabel}
          value={
            result === null || result.breakEvenRetirementRatePercent === null
              ? null
              : formatPercent(result.breakEvenRetirementRatePercent, 2)
          }
        />
        <ResultRow
          label={F.balanceLabel}
          value={result === null ? null : usd(result.balanceAtHorizon)}
        />
      </ResultGroup>

      <ResultGroup title={F.equalCostTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.rothAfterTaxLabel}
          value={result === null ? null : usd(result.rothAfterTax)}
        />
        <ResultRow
          label={F.traditionalAfterTaxLabel}
          value={result === null ? null : usd(result.traditionalAfterTax)}
        />
        <ResultRow
          label={F.sideAccountLabel}
          value={result === null ? null : usd(result.sideAccountAfterTax)}
        />
        <ResultRow
          label={F.traditionalTotalLabel}
          value={result === null ? null : usd(result.traditionalTotalEqualCost)}
        />
        <ResultRow
          label={F.netCostLabel}
          value={result === null ? null : usdCents(result.netCostRoth)}
        />
      </ResultGroup>

      <ResultGroup title={F.sameContribTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.sameContribAdvantageLabel}
          value={
            result === null ? null : usd(result.rothAdvantageSameContribution)
          }
        />
        <ResultRow
          label={F.withdrawalTaxLabel}
          value={result === null ? null : usd(result.withdrawalTax)}
        />
        <ResultRow
          label={F.extraCostLabel}
          value={result === null ? null : usdCents(result.extraCostOfRoth)}
        />
        <ResultRow
          label={F.preTaxEquivalentLabel}
          value={
            result === null || result.rothAsPreTaxContribution === null
              ? null
              : usdCents(result.rothAsPreTaxContribution)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.limitLabel}
          value={result === null ? null : usd(result.contributionLimit)}
        />
        <ResultRow
          label={F.catchUpLabel}
          value={result === null ? null : usd(result.catchUpAvailable)}
        />
        <ResultRow
          label={F.excessLabel}
          value={result === null ? null : usd(result.excessContribution)}
        />
        <ResultRow
          label={F.totalContributedLabel}
          value={result === null ? null : usd(result.totalContributed)}
        />
        <ResultRow
          label={F.sideContributedLabel}
          value={result === null ? null : usd(result.sideAccountContribution)}
        />
        <ResultRow
          label={F.sideTaxLabel}
          value={result === null ? null : usd(result.sideAccountTax)}
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.rateColumn },
              { label: T.traditionalColumn, numeric: true },
              { label: T.rothColumn, numeric: true },
              { label: T.differenceColumn, numeric: true },
              { label: T.verdictColumn },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-ink-3">
        {F.deductibilityNotice}
      </p>

      {result !== null && result.excessContribution > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.excessNotice}
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
