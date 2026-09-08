"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import {
  readRetirement,
  RetirementFields,
  RETIREMENT_DEFAULTS,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { projectRetirement } from "@/lib/calc/retirement";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const F = C.form;
const T = F.table;

/** Every fifth year plus the two years that bracket retirement. */
const TABLE_STEP = 5;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

export function RetirementPlanCalculator() {
  const fields = useCalcFields(RETIREMENT_DEFAULTS);
  const read = readRetirement(fields.values);
  const result = read.input === null ? null : projectRetirement(read.input);

  const firstWithdrawal = result?.years.find((row) => !row.accumulating);

  // Sixty rows is unreadable, so the table shows every fifth year plus the
  // pair that straddles retirement — the transition is the row a reader
  // most wants to see and a modulus alone would often drop it.
  const rows = result
    ? result.years
        .filter(
          (row, index) =>
            index % TABLE_STEP === 0 ||
            row.age === read.input!.retirementAge ||
            row.age === read.input!.retirementAge - 1 ||
            index === result.years.length - 1,
        )
        .map((row) => [
          String(row.age),
          row.accumulating ? T.accumulating : T.drawing,
          usd(row.contribution),
          usd(row.withdrawal),
          usd(row.investmentReturn),
          usd(row.balance),
          usd(row.realBalance),
        ])
    : [];

  return (
    <CalculatorCard>
      <RetirementFields
        copy={C.fields}
        invalid={read.invalid}
        bind={fields.bind}
      />

      {/* The verdict and the real balance lead, because the nominal figure
          is the one a reader will misuse. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.verdictLabel}
          value={
            result === null
              ? null
              : result.depletionAge === null
                ? F.verdictYes
                : F.verdictNo
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
          label={F.yearsShortLabel}
          value={
            result === null || result.yearsShort === 0
              ? null
              : `${result.yearsShort} ${F.yearsUnit}`
          }
        />
        <ResultRow
          label={F.realBalanceAtRetirementLabel}
          value={result === null ? null : usd(result.realBalanceAtRetirement)}
        />
      </ResultGroup>

      <ResultGroup title={F.nominalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.balanceAtRetirementLabel}
          value={result === null ? null : usd(result.balanceAtRetirement)}
        />
        <ResultRow
          label={F.finalBalanceLabel}
          value={result === null ? null : usd(result.finalBalance)}
        />
        <ResultRow
          label={F.realFinalBalanceLabel}
          value={result === null ? null : usd(result.realFinalBalance)}
        />
      </ResultGroup>

      <ResultGroup title={F.flowTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalContributedLabel}
          value={result === null ? null : usd(result.totalContributed)}
        />
        <ResultRow
          label={F.totalGrowthLabel}
          value={result === null ? null : usd(result.totalGrowth)}
        />
        <ResultRow
          label={F.totalWithdrawnLabel}
          value={result === null ? null : usd(result.totalWithdrawn)}
        />
        <ResultRow
          label={F.firstWithdrawalLabel}
          value={
            firstWithdrawal === undefined
              ? null
              : usd(firstWithdrawal.withdrawal)
          }
        />
        <ResultRow
          label={F.initialRateLabel}
          value={
            result === null || result.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(result.initialWithdrawalRatePercent, 2)
          }
        />
        <ResultRow
          label={F.sustainableLabel}
          value={
            result === null || result.sustainableSpending === null
              ? null
              : usd(result.sustainableSpending)
          }
        />
        <ResultRow
          label={F.shortfallLabel}
          value={result === null ? null : usd(result.spendingShortfall)}
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
              { label: T.phaseColumn },
              { label: T.contributionColumn, numeric: true },
              { label: T.withdrawalColumn, numeric: true },
              { label: T.returnColumn, numeric: true },
              { label: T.balanceColumn, numeric: true },
              { label: T.realBalanceColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.depletionAge === null
            ? F.fundedNotice
            : F.depletionNotice}
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
