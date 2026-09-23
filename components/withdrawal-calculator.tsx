"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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

/*
 * CSV row 28 ("Hai cột"): "nhấn khoản rút, thời điểm cạn và sức mua; không
 * được lẫn danh nghĩa với thực". Docs §8.
 *
 * WHERE THE HEADLINE GOES, AND WHY NOT ON THE DEPLETION DATE. The row names
 * three things to emphasise and `ResultRow` allows one headline per group, so
 * the emphasis the row asks for is carried by the region — all three sit in
 * the one live group, unchanged in order — and `emphasis` picks the single
 * figure that can be read as a headline. That is the purchasing-power
 * withdrawal: `lasted()` returns a two-part phrase, "245 tháng (20,4 năm)",
 * which in display type is a line of prose rather than an answer, and the
 * page's own argument is the GAP between what the reader typed and what the
 * portfolio can actually sustain. The sustainable figure is the side of that
 * gap the reader did not already know.
 *
 * NOMINAL VERSUS REAL is handled in copy rather than in arithmetic, because
 * nothing here is computed wrongly — the two rows that mix the two scales are
 * "khoản rút của năm cuối" and "tổng số tiền đã rút", and both are correct
 * nominal figures presented with no scale named. The label now names it and
 * `nominalVsRealNote` sits with those rows in `detail`. That note makes no
 * comparison between two figures at all: a browser pass falsified both a
 * fixed direction and a direction picked from the inflation SIGN — a plan can
 * deplete before its first annual adjustment, leaving the final planned
 * withdrawal equal to the first at any inflation. See the content file.
 */
const FORM_ID = "thu-nhap-dau-tu-nhap";
const RESULT_ID = "thu-nhap-dau-tu-ket-qua";

export function WithdrawalCalculator({
  actions,
  nextSteps,
}: {
  /** `ResultActions` for this slug; the route owns the wiring. */
  actions?: React.ReactNode;
  /** `ToolNextSteps promoted` for this slug. */
  nextSteps?: React.ReactNode;
}) {
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

  /** One flag for the four fields, so the CTA and the result agree. */
  const anyInvalid =
    balanceInvalid || withdrawalInvalid || returnInvalid || inflationInvalid;

  const result = anyInvalid
    ? null
    : computeWithdrawal({
        balance: balance!,
        monthlyWithdrawal: withdrawal!,
        annualReturnPercent: returnRate!,
        inflationPercent: inflation!,
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
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
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
          </>
        }
        cta={
          /* Not `sticky`: four fields cannot push the answer off a desktop
             screen, and the pinned block is only allowed where it can. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
          />
        }
        primary={
          <>
            {/* All three of row 28's subjects in one region: the withdrawal
                the portfolio can sustain, when the plan as typed runs out,
                and the real return that funds the first of those. The
                perpetual figure sits beside how long the plan actually
                lasts, because the gap between them is the page's argument. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={C.form.lastsLabel} value={lasted()} />
              <ResultRow
                label={C.form.perpetualLabel}
                value={money(result?.perpetualMonthlyWithdrawal)}
                emphasis
              />
              <ResultRow
                label={C.form.realReturnLabel}
                value={result ? formatPercent(result.realReturnPercent, 4) : null}
              />
            </ResultGroup>

            {/* The qualification travels WITH the figure, directly under its
                row. "Mức rút duy trì được mãi" beside a number reads as a
                guarantee, and original row 26's own lesson is that no draw is
                guaranteed — see the content file for the two things this
                caveat has to say. */}
            {result !== null && result.perpetualMonthlyWithdrawal !== null ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {C.form.perpetualCaveat} {conventionClause()}{" "}
                {C.form.perpetualMarketCaveat}
              </p>
            ) : null}

            {result?.drawingDownPrincipal ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.drawingDownNotice}
              </p>
            ) : null}

            {/* Why the perpetual row is a dash, beside that dash. */}
            {result !== null && result.perpetualMonthlyWithdrawal === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noPerpetualNotice}
              </p>
            ) : null}

            {/* And why "Danh mục cạn sau" says 100 năm instead of a date. */}
            {result !== null && result.monthsLasted === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.survivesNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        chart={
          /* Original row 26's visual: the same balance counted two ways.
             Both paths come from the engine's own simulation. */
          <ChartFigure model={chart}>
            <LineChart model={chart} />
          </ChartFigure>
        }
        nextSteps={nextSteps}
        detail={
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
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
              {/* Mounted only when the money actually ran out: with no end
                  there is no partial payment, and four dashes would imply
                  there was one. */}
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

            {/* Both notes stay with the rows they are about: the nominal
                scale is only confusing where the two nominal rows are. */}
            {result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.nominalVsRealNote}
              </p>
            ) : null}

            {/* Why the month count is not the number of full withdrawals. */}
            {result !== null &&
            result.lastWithdrawalShortfall !== null &&
            result.lastWithdrawalShortfall > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.partialLastNotice}
              </p>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
