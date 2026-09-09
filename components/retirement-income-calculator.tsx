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
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

const F = C.form;
const T = F.table;

/** The spend is solved, so the field is not rendered. */
const OMIT = ["desiredAnnualSpending"] as const;

const TABLE_STEP = 5;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

/** Monthly figures carry cents; see retirement-target-calculator.tsx. */
function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function RetirementIncomeCalculator() {
  const fields = useCalcFields(RETIREMENT_DEFAULTS);
  const read = readRetirement(fields.values, OMIT);

  // Two passes, and the first one's spending figure is deliberately zero.
  // `sustainableSpending` is a property of the accumulation phase and the
  // real return — it does not depend on what was spent — so probing at zero
  // asks the engine what the pot supports without putting an assumed spend
  // into the answer. The second pass then RUNS that spend, which is what
  // makes the table and the depletion check honest rather than decorative.
  const probe = read.input === null ? null : projectRetirement(read.input);
  const sustainable = probe?.sustainableSpending ?? null;
  const plan =
    read.input === null || sustainable === null
      ? null
      : projectRetirement({
          ...read.input,
          desiredAnnualSpending: sustainable,
        });

  const other = read.input?.otherAnnualIncome ?? 0;
  const fromPortfolio = sustainable === null ? null : sustainable - other;

  const drawing = plan?.years.filter((row) => !row.accumulating) ?? [];
  const firstDraw = drawing[0];
  const lastDraw = drawing.at(-1);

  const rows = drawing
    .filter(
      (row, index) => index % TABLE_STEP === 0 || index === drawing.length - 1,
    )
    .map((row) => [
      String(row.age),
      usd(row.withdrawal),
      usd(row.realWithdrawal),
      usd(row.balance),
      usd(row.realBalance),
    ]);

  return (
    <CalculatorCard>
      <RetirementFields
        copy={C.fields}
        invalid={read.invalid}
        bind={fields.bind}
        omit={OMIT}
      />

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.monthlyLabel}
          value={sustainable === null ? null : usdCents(sustainable / 12)}
        />
        <ResultRow
          label={F.portfolioMonthlyLabel}
          value={fromPortfolio === null ? null : usdCents(fromPortfolio / 12)}
        />
        <ResultRow
          label={F.firstNominalLabel}
          value={firstDraw === undefined ? null : usdCents(firstDraw.withdrawal)}
        />
        <ResultRow
          label={F.initialRateLabel}
          value={
            plan === null || plan.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(plan.initialWithdrawalRatePercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.annualLabel}
          value={sustainable === null ? null : usdCents(sustainable)}
        />
        <ResultRow
          label={F.portfolioAnnualLabel}
          value={fromPortfolio === null ? null : usdCents(fromPortfolio)}
        />
        <ResultRow
          label={F.lastNominalLabel}
          value={lastDraw === undefined ? null : usdCents(lastDraw.withdrawal)}
        />
        <ResultRow
          label={F.realBalanceLabel}
          value={probe === null ? null : usd(probe.realBalanceAtRetirement)}
        />
        <ResultRow
          label={F.nominalBalanceLabel}
          value={probe === null ? null : usd(probe.balanceAtRetirement)}
        />
        <ResultRow
          label={F.totalWithdrawnLabel}
          value={plan === null ? null : usd(plan.totalWithdrawn)}
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
              { label: T.nominalColumn, numeric: true },
              { label: T.realColumn, numeric: true },
              { label: T.balanceColumn, numeric: true },
              { label: T.realBalanceColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {probe !== null && probe.realBalanceAtRetirement <= 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.noBalanceNotice}
        </p>
      ) : null}

      {read.input === null || probe === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
