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
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { computeWithdrawal } from "@/lib/calc/withdrawal";
import { withdrawalChartModel } from "@/lib/calc/charts/withdrawal-chart";
import { WITHDRAWAL as C } from "@/content/calculators/withdrawal";

export function WithdrawalCalculator() {
  const fields = useCalcFields({
    balance: C.form.defaultBalance,
    withdrawal: C.form.defaultWithdrawal,
    returnRate: C.form.defaultReturn,
    inflation: C.form.defaultInflation,
  });

  const balance = parseMoney(fields.values.balance);
  const withdrawal = parseMoney(fields.values.withdrawal);
  const returnRate = parseDecimal(fields.values.returnRate);
  const inflation = parseDecimal(fields.values.inflation);

  const balanceInvalid = balance === null || balance <= 0;
  const withdrawalInvalid = withdrawal === null || withdrawal < 0;
  const returnInvalid = returnRate === null || returnRate <= -100;
  const inflationInvalid = inflation === null || inflation <= -100;

  const result =
    balanceInvalid || withdrawalInvalid || returnInvalid || inflationInvalid
      ? null
      : computeWithdrawal({
          balance,
          monthlyWithdrawal: withdrawal,
          annualReturnPercent: returnRate,
          inflationPercent: inflation,
        });

  const chart = withdrawalChartModel(result, C.chart);

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  /**
   * The convention clause that is TRUE for the rate actually entered.
   *
   * The perpetual figure converts the REAL return to a monthly rate while the
   * simulated withdrawal steps up once a year, so it does not coincide with
   * the amount that exactly preserves purchasing power at each year end. The
   * DIRECTION of that difference follows the inflation sign — lower with
   * rising prices, identical at zero, higher with falling prices — so the old
   * unconditional "thấp hơn … phía thận trọng" sentence was wrong on a
   * negative entry, in the reader's favour. See the content file.
   */
  const conventionClause = () => {
    if (inflation === null) return null;
    if (inflation > 0) return C.form.perpetualConventionLower;
    if (inflation < 0) return C.form.perpetualConventionHigher;
    return C.form.perpetualConventionEqual;
  };

  /** "245 tháng (20,4 năm)", or the never-runs-out wording. */
  const lasted = () => {
    if (result === null) return null;
    if (result.monthsLasted === null) return C.form.neverRunsOut;
    return `${formatDecimal(result.monthsLasted, 0)} ${C.form.monthsUnit} (${formatDecimal(result.yearsLasted!, 1)} ${C.form.yearsUnit})`;
  };

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.portfolioGroup}>
        <NumberField
          {...fields.bind("balance")}
          label={C.form.balanceLabel}
          unit={C.form.balanceUnit}
          help={C.form.balanceHelp}
          error={C.form.balanceInvalid}
          invalid={balanceInvalid}
        />
        <NumberField
          {...fields.bind("withdrawal")}
          label={C.form.withdrawalLabel}
          unit={C.form.withdrawalUnit}
          help={C.form.withdrawalHelp}
          error={C.form.withdrawalInvalid}
          invalid={withdrawalInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.assumptionGroup} className="mt-8">
        <NumberField
          {...fields.bind("returnRate")}
          label={C.form.returnLabel}
          unit={C.form.returnUnit}
          help={C.form.returnHelp}
          error={C.form.returnInvalid}
          invalid={returnInvalid}
        />
        <NumberField
          {...fields.bind("inflation")}
          label={C.form.inflationLabel}
          unit={C.form.inflationUnit}
          help={C.form.inflationHelp}
          error={C.form.inflationInvalid}
          invalid={inflationInvalid}
        />
      </FieldGroup>

      {/* The perpetual figure sits beside how long the plan actually lasts,
          because the gap between them is the page's argument. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.lastsLabel} value={lasted()} />
        <ResultRow
          label={C.form.perpetualLabel}
          value={money(result?.perpetualMonthlyWithdrawal)}
        />
        <ResultRow
          label={C.form.realReturnLabel}
          value={result ? formatPercent(result.realReturnPercent, 4) : null}
        />
      </ResultGroup>

      {/* The qualification travels WITH the figure, directly under its row.
          "Mức rút duy trì được mãi" beside a number reads as a guarantee,
          and original row 26's own lesson is that no draw is guaranteed —
          see the content file for the two things this caveat has to say. */}
      {result !== null && result.perpetualMonthlyWithdrawal !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.perpetualCaveat} {conventionClause()}{" "}
          {C.form.perpetualMarketCaveat}
        </p>
      ) : null}

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.rateLabel}
          value={
            result ? formatPercent(result.withdrawalRatePercent, 2) : null
          }
        />
        <ResultRow
          label={C.form.firstReturnLabel}
          value={money(result?.firstMonthReturn)}
        />
        <ResultRow
          label={C.form.lastWithdrawalLabel}
          value={money(result?.finalMonthlyWithdrawal)}
        />
        <ResultRow
          label={C.form.totalWithdrawnLabel}
          value={money(result?.totalWithdrawn)}
        />
        <ResultRow
          label={C.form.finalBalanceLabel}
          value={money(result?.finalBalance)}
        />
        {/* Mounted only when the money actually ran out: with no end there is
            no partial payment, and four dashes would imply there was one. */}
        {result !== null && result.fullWithdrawals !== null ? (
          <>
            <ResultRow
              label={C.form.fullWithdrawalsLabel}
              value={`${formatDecimal(result.fullWithdrawals, 0)} ${C.form.monthsUnit}`}
            />
            <ResultRow
              label={C.form.lastPlannedLabel}
              value={money(result.lastWithdrawalPlanned ?? undefined)}
            />
            <ResultRow
              label={C.form.lastPaidLabel}
              value={money(result.lastWithdrawalPaid ?? undefined)}
            />
            <ResultRow
              label={C.form.lastShortfallLabel}
              value={money(result.lastWithdrawalShortfall ?? undefined)}
            />
          </>
        ) : null}
      </ResultGroup>

      {/* Why the month count is not the number of full withdrawals. */}
      {result !== null &&
      result.lastWithdrawalShortfall !== null &&
      result.lastWithdrawalShortfall > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.partialLastNotice}
        </p>
      ) : null}

      {result?.drawingDownPrincipal ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.drawingDownNotice}
        </p>
      ) : null}

      {result !== null && result.perpetualMonthlyWithdrawal === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noPerpetualNotice}
        </p>
      ) : null}

      {result !== null && result.monthsLasted === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.survivesNotice}
        </p>
      ) : null}

      {/* Original row 26's visual: the same balance counted two ways. Both
          paths come from the engine's own simulation. */}
      <ChartFigure model={chart}>
        <LineChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
