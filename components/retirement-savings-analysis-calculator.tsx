"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import {
  readRetirement,
  RetirementFields,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import {
  projectRetirement,
  solveRequiredContribution,
  type RetirementInput,
} from "@/lib/calc/retirement";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const F = C.form;
const T = F.table;

/**
 * Retirement ages the sensitivity table offers, relative to the one entered.
 * Asymmetric on purpose: retiring later is the lever this page is trying to
 * put in front of the reader, so it gets four rows and retiring earlier gets
 * two.
 */
const AGE_OFFSETS = [-5, -3, 0, 2, 5, 7];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

/** Contribution rows carry cents; see retirement-target-calculator.tsx. */
function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/**
 * Lowest retirement age from `from` up that funds the plan on the CURRENT
 * contribution, or null if none does before the projection ends.
 *
 * A search rather than a formula: "funded" is the projection's own verdict,
 * including its floor on withdrawals, and this page must not offer a
 * retirement age whose table row would then show the money running out.
 */
function firstFundedRetirementAge(input: RetirementInput): number | null {
  for (let age = input.retirementAge; age < input.endAge; age += 1) {
    const projection = projectRetirement({ ...input, retirementAge: age });
    if (projection !== null && projection.depletionAge === null) return age;
  }
  return null;
}

export function RetirementSavingsAnalysisCalculator() {
  const fields = useCalcFields(C.fields.defaults);
  const read = readRetirement(fields.values);
  const result = read.input === null ? null : projectRetirement(read.input);
  const solved = read.input === null ? null : solveRequiredContribution(read.input);

  const funded = result !== null && result.depletionAge === null;
  const extraAnnual =
    solved === null || read.input === null
      ? null
      : Math.max(0, solved.annualContribution - read.input.annualContribution);

  const fixRetirementAge =
    read.input === null || funded ? null : firstFundedRetirementAge(read.input);

  const rows =
    read.input === null
      ? []
      : AGE_OFFSETS.map((offset) => read.input!.retirementAge + offset)
          // An age the reader has already passed, or one at or after the end
          // of the projection, is not an option — offering it as a row with
          // dashes in it would suggest the tool had failed.
          .filter(
            (age) => age >= read.input!.currentAge && age < read.input!.endAge,
          )
          .map((age) => {
            const at = projectRetirement({ ...read.input!, retirementAge: age });
            const need = solveRequiredContribution({
              ...read.input!,
              retirementAge: age,
            });
            return [
              String(age),
              at === null ? null : usd(at.realBalanceAtRetirement),
              at === null ? null : usd(at.requiredRealBalanceAtRetirement),
              at === null || at.capitalCoveragePercent === null
                ? null
                : formatPercent(at.capitalCoveragePercent, 1),
              at === null
                ? null
                : at.depletionAge === null
                  ? T.never
                  : String(at.depletionAge),
              need === null ? null : usdCents(need.annualContribution),
            ];
          });

  return (
    <CalculatorCard>
      <RetirementFields
        copy={C.fields}
        invalid={read.invalid}
        bind={fields.bind}
      />

      {/* The verdict, the coverage and the age the money runs out sit
          together on purpose: the third is what stops the second from being
          read as a comfort level. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.verdictLabel}
          value={result === null ? null : funded ? F.verdictYes : F.verdictNo}
        />
        <ResultRow
          label={F.coverageLabel}
          value={
            result === null || result.capitalCoveragePercent === null
              ? null
              : formatPercent(result.capitalCoveragePercent, 1)
          }
        />
        <ResultRow
          label={F.depletionLabel}
          value={
            result === null || result.depletionAge === null
              ? null
              : String(result.depletionAge)
          }
        />
        <ResultRow
          label={F.extraMonthlyLabel}
          value={extraAnnual === null ? null : usdCents(extraAnnual / 12)}
        />
      </ResultGroup>

      <ResultGroup title={F.capitalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.reachedRealLabel}
          value={result === null ? null : usd(result.realBalanceAtRetirement)}
        />
        <ResultRow
          label={F.requiredRealLabel}
          value={
            result === null
              ? null
              : usd(result.requiredRealBalanceAtRetirement)
          }
        />
        <ResultRow
          label={F.gapRealLabel}
          value={
            result === null
              ? null
              : usd(result.realBalanceShortfallAtRetirement)
          }
        />
        <ResultRow
          label={F.reachedNominalLabel}
          value={result === null ? null : usd(result.balanceAtRetirement)}
        />
        <ResultRow
          label={F.requiredNominalLabel}
          value={
            result === null ? null : usd(result.requiredBalanceAtRetirement)
          }
        />
        <ResultRow
          label={F.yearsShortLabel}
          value={
            result === null
              ? null
              : `${result.yearsShort} ${F.yearsUnit}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.fixesTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.fixContributeLabel}
          value={solved === null ? null : usdCents(solved.annualContribution)}
        />
        <ResultRow
          label={F.fixRetireLabel}
          value={fixRetirementAge === null ? null : String(fixRetirementAge)}
        />
        <ResultRow
          label={F.fixSpendLabel}
          value={
            result === null || result.sustainableSpending === null
              ? null
              : usdCents(result.sustainableSpending)
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
              { label: T.ageColumn },
              { label: T.reachedColumn, numeric: true },
              { label: T.requiredColumn, numeric: true },
              { label: T.coverageColumn, numeric: true },
              { label: T.depletionColumn, numeric: true },
              { label: T.neededColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {funded ? F.fundedNotice : F.gapNotice}
        </p>
      ) : null}

      {result !== null && !funded && solved === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.unsolvableNotice}
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
