"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRmd, type RmdInput } from "@/lib/calc/us-rmd";
import { US_RMD as C } from "@/content/calculators/us-rmd";

const F = C.form;
const T = F.table;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsRmdCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  // Every one of these is a whole count, and `parseMoney` would read a
  // birth year typed "1.953" as 1953 but also "19.53" as 1953 — a count
  // parser rejects both spellings that are not a year.
  const birthYear = parseCount(v.birthYear);
  const currentAge = parseCount(v.currentAge);
  const endAge = parseCount(v.endAge);
  const balance = parseMoney(v.balance);
  const planned = parseMoney(v.planned);
  const returnPercent = parseDecimal(v.returnPercent);
  const marginal = parseDecimal(v.marginal);

  const invalid = {
    birthYear: birthYear === null || birthYear < 1900 || birthYear > 2100,
    currentAge: currentAge === null || currentAge > 120,
    endAge: endAge === null || endAge > 120,
    balance: balance === null || balance < 0,
    planned: planned === null || planned < 0,
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
    marginal: marginal === null || marginal < 0 || marginal > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: RmdInput | null = anyInvalid
    ? null
    : {
        birthYear: birthYear!,
        currentAge: currentAge!,
        balance: balance!,
        returnPercent: returnPercent!,
        endAge: endAge!,
        marginalRatePercent: marginal!,
        plannedWithdrawal: planned!,
      };

  const result = input === null ? null : computeRmd(input);

  const rows =
    result === null
      ? []
      : result.years.map((row) => [
          String(row.age),
          row.divisor === null ? T.notRequired : formatDecimal(row.divisor, 1),
          usd(row.required),
          row.requiredPercent === null
            ? null
            : formatPercent(row.requiredPercent, 2),
          usd(row.openingBalance),
          usd(row.closingBalance),
        ]);

  return (
    <CalculatorCard>
      <FieldGroup title={F.whoGroup}>
        <NumberField
          {...fields.bind("birthYear")}
          label={F.birthYearLabel}
          help={F.birthYearHelp}
          error={F.yearInvalid}
          invalid={invalid.birthYear}
        />
        <NumberField
          {...fields.bind("currentAge")}
          label={F.currentAgeLabel}
          unit={F.currentAgeUnit}
          help={F.currentAgeHelp}
          error={F.ageInvalid}
          invalid={invalid.currentAge}
        />
        <NumberField
          {...fields.bind("balance")}
          label={F.balanceLabel}
          unit={F.balanceUnit}
          help={F.balanceHelp}
          error={F.moneyInvalid}
          invalid={invalid.balance}
        />
        <NumberField
          {...fields.bind("planned")}
          label={F.plannedLabel}
          unit={F.plannedUnit}
          help={F.plannedHelp}
          error={F.moneyInvalid}
          invalid={invalid.planned}
        />
      </FieldGroup>

      <FieldGroup title={F.assumptionGroup} className="mt-8">
        <NumberField
          {...fields.bind("returnPercent")}
          label={F.returnLabel}
          unit={F.returnUnit}
          help={F.returnHelp}
          error={F.rateInvalid}
          invalid={invalid.returnPercent}
        />
        <NumberField
          {...fields.bind("endAge")}
          label={F.endAgeLabel}
          unit={F.endAgeUnit}
          help={F.endAgeHelp}
          error={F.ageInvalid}
          invalid={invalid.endAge}
        />
        <NumberField
          {...fields.bind("marginal")}
          label={F.marginalLabel}
          unit={F.marginalUnit}
          help={F.marginalHelp}
          error={F.percentInvalid}
          invalid={invalid.marginal}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.requiredLabel}
          value={result === null ? null : usdCents(result.required)}
        />
        <ResultRow
          label={F.requiredPercentLabel}
          value={
            result === null || result.requiredPercent === null
              ? null
              : formatPercent(result.requiredPercent, 2)
          }
        />
        <ResultRow
          label={F.taxLabel}
          value={result === null ? null : usdCents(result.taxOnRequired)}
        />
        <ResultRow
          label={F.shortfallLabel}
          value={result === null ? null : usdCents(result.shortfall)}
        />
      </ResultGroup>

      <ResultGroup title={F.penaltyTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.penaltyLabel}
          value={result === null ? null : usdCents(result.penalty)}
        />
        <ResultRow
          label={F.correctedLabel}
          value={result === null ? null : usdCents(result.penaltyIfCorrected)}
        />
        <ResultRow
          label={F.divisorLabel}
          value={
            result === null || result.divisor === null
              ? null
              : formatDecimal(result.divisor, 1)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.timingTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.startAgeLabel}
          value={result === null ? null : String(result.startAge)}
        />
        <ResultRow
          label={F.yearsUntilLabel}
          value={
            result === null
              ? null
              : `${result.yearsUntilRequired} ${F.yearsUnit}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.horizonTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalRequiredLabel}
          value={result === null ? null : usd(result.totalRequired)}
        />
        <ResultRow
          label={F.totalTaxLabel}
          value={result === null ? null : usd(result.totalTax)}
        />
        <ResultRow
          label={F.peakAgeLabel}
          value={
            result === null || result.peakAge === null
              ? null
              : String(result.peakAge)
          }
        />
        <ResultRow
          label={F.peakBalanceLabel}
          value={result === null ? null : usd(result.peakBalance)}
        />
        <ResultRow
          label={F.finalBalanceLabel}
          value={result === null ? null : usd(result.finalBalance)}
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.ageColumn },
              { label: T.divisorColumn, numeric: true },
              { label: T.requiredColumn, numeric: true },
              { label: T.percentColumn, numeric: true },
              { label: T.openingColumn, numeric: true },
              { label: T.closingColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null && !result.alreadyRequired ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.notRequiredNotice}
        </p>
      ) : result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.planMeetsRequirement ? F.metNotice : F.shortfallNotice}
        </p>
      ) : null}

      {result !== null && result.peakAge !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.growingNotice}
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
