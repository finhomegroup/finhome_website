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
import { computeFundFees } from "@/lib/calc/fund-fees";
import { fundFeesChartModel } from "@/lib/calc/charts/fund-fees-chart";
import { FUND_FEES as C } from "@/content/calculators/fund-fees";

/*
 * CSV row 29 ("Hai cột"): "nhấn số tiền phí lấy đi ở kỳ hạn đã chọn; hai dòng
 * giá trị nằm cạnh ô nhập phí". Docs §8.
 *
 * WHAT "CẠNH Ô NHẬP PHÍ" BUYS, AND WHY IT NEEDED THE SPLIT. The fee schedule
 * is the bottom group of a seven-field form, and the two figures that answer
 * it — the đồng the fees take and the đồng left over — were below all seven,
 * under two further groups of secondary rows. Changing "2" to "1,5" therefore
 * moved a number the reader could not see. In the split grid the result column
 * starts level with the form, so the pair sits beside the boxes that drive it
 * and the edit and its consequence are on screen together.
 *
 * WHY THREE ROWS AND NOT TWO. The row asks for two VALUE lines, and those two
 * lead. The third row is not a value — it is the share of forgone profit, and
 * original row 27 already settled that it stays with them because it is the
 * figure that makes "2% một năm" feel like something. Two money rows then a
 * percentage satisfies both rows; dropping the percentage into `detail` would
 * satisfy neither.
 *
 * The two SECONDARY groups both move to `detail`: "So với không có phí" and
 * "Chi tiết phí" answer follow-up questions, and eight rows between the form
 * and the chart is what pushed the answer off the screen in the first place.
 */
const FORM_ID = "phi-quy-nhap";
const RESULT_ID = "phi-quy-ket-qua";

export function FundFeesCalculator({
  actions,
  nextSteps,
}: {
  /** `ResultActions` for this slug; the route owns the wiring. */
  actions?: React.ReactNode;
  /** `ToolNextSteps promoted` for this slug. */
  nextSteps?: React.ReactNode;
}) {
  const fields = useCalcFields({
    initial: C.form.defaultInitial,
    contribution: C.form.defaultContribution,
    months: C.form.defaultMonths,
    grossReturn: C.form.defaultGrossReturn,
    entryFee: C.form.defaultEntryFee,
    managementFee: C.form.defaultManagementFee,
    exitFee: C.form.defaultExitFee,
  });

  const initial = parseMoney(fields.values.initial);
  const contribution = parseMoney(fields.values.contribution);
  const months = parseDecimal(fields.values.months);
  const grossReturn = parseDecimal(fields.values.grossReturn);
  const entryFee = parseDecimal(fields.values.entryFee);
  const managementFee = parseDecimal(fields.values.managementFee);
  const exitFee = parseDecimal(fields.values.exitFee);

  const initialInvalid = initial === null || initial < 0;
  const contributionInvalid = contribution === null || contribution < 0;
  const monthsInvalid =
    months === null || months <= 0 || !Number.isInteger(months);
  const grossReturnInvalid = grossReturn === null || grossReturn <= -100;
  const entryFeeInvalid = entryFee === null || entryFee < 0 || entryFee > 100;
  const managementFeeInvalid =
    managementFee === null || managementFee < 0 || managementFee > 100;
  const exitFeeInvalid = exitFee === null || exitFee < 0 || exitFee > 100;

  const fieldsUsable =
    !initialInvalid &&
    !contributionInvalid &&
    !monthsInvalid &&
    !grossReturnInvalid &&
    !entryFeeInvalid &&
    !managementFeeInvalid &&
    !exitFeeInvalid;

  const result = fieldsUsable
    ? computeFundFees({
        initial,
        monthlyContribution: contribution,
        months,
        grossReturnPercent: grossReturn,
        entryFeePercent: entryFee,
        managementFeePercent: managementFee,
        exitFeePercent: exitFee,
      })
    : null;

  // Every field parses but nothing was paid in at all — the module's only
  // rejection on otherwise-valid input.
  const nothingInvested = fieldsUsable && result === null;

  const chart = fundFeesChartModel(result, C.chart);

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** Formatted once, for the headline row and the pinned restatement. */
  const valueLostValue = money(result?.valueLost);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.planGroup}>
              <NumberField
                {...fields.bind("initial")}
                label={C.form.initialLabel}
                unit={C.form.initialUnit}
                help={C.form.initialHelp}
                error={C.form.initialInvalid}
                invalid={initialInvalid}
              />
              <NumberField
                {...fields.bind("contribution")}
                label={C.form.contributionLabel}
                unit={C.form.contributionUnit}
                help={C.form.contributionHelp}
                error={C.form.contributionInvalid}
                invalid={contributionInvalid}
              />
              <NumberField
                {...fields.bind("months")}
                label={C.form.monthsLabel}
                help={C.form.monthsHelp}
                error={C.form.monthsInvalid}
                invalid={monthsInvalid}
              />
              <NumberField
                {...fields.bind("grossReturn")}
                label={C.form.grossReturnLabel}
                unit={C.form.grossReturnUnit}
                help={C.form.grossReturnHelp}
                error={C.form.grossReturnInvalid}
                invalid={grossReturnInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.feeGroup} className="mt-8">
              <NumberField
                {...fields.bind("entryFee")}
                label={C.form.entryFeeLabel}
                unit={C.form.entryFeeUnit}
                help={C.form.entryFeeHelp}
                error={C.form.entryFeeInvalid}
                invalid={entryFeeInvalid}
              />
              <NumberField
                {...fields.bind("managementFee")}
                label={C.form.managementFeeLabel}
                unit={C.form.managementFeeUnit}
                help={C.form.managementFeeHelp}
                error={C.form.managementFeeInvalid}
                invalid={managementFeeInvalid}
              />
              <NumberField
                {...fields.bind("exitFee")}
                label={C.form.exitFeeLabel}
                unit={C.form.exitFeeUnit}
                help={C.form.exitFeeHelp}
                error={C.form.exitFeeInvalid}
                invalid={exitFeeInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: seven boxes, and the two fee percentages that move the
             answer most sit at the bottom of the form. The pinned line
             carries the đồng the fees take, which is what the page is for. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={!fieldsUsable}
            sticky
            answer={{ label: C.form.valueLostLabel, value: valueLostValue }}
          />
        }
        primary={
          <>
            {/* MONEY FIRST, then the percentage. Original row 27's words are
                "đặt chênh lệch sau phí trước thuật ngữ": this group used to
                open with the share of forgone PROFIT, which is the more
                dramatic figure and the harder one to act on. The đồng lost
                and the đồng received now come first, and the percentage keeps
                its place as the third row — it is still the number that makes
                "2% một năm" feel real. Row 29 adds the emphasis: the đồng the
                fees take is what the page is for. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.valueLostLabel}
                value={valueLostValue}
                emphasis
              />
              <ResultRow
                label={C.form.netValueLabel}
                value={money(result?.netValue)}
              />
              <ResultRow
                label={C.form.profitLostLabel}
                value={
                  result?.profitLostPercent == null
                    ? null
                    : formatPercent(result.profitLostPercent, 2)
                }
              />
            </ResultGroup>

            {/* Why the third row is a dash, beside that dash. */}
            {result !== null && result.profitLostPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noProfitNotice}
              </p>
            ) : null}

            {/* And why every row is a dash while nothing is marked invalid. */}
            {nothingInvested ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.nothingInvestedNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        chart={
          /* Original row 27's visual. Both paths come from the engine's own
             monthly series, so the picture cannot disagree with the rows
             above it. The drawn line stops at the balance BEFORE the exit fee
             and the marker names that charge — see `fund-fees-chart.ts`. */
          <ChartFigure model={chart}>
            <LineChart model={chart} />
          </ChartFigure>
        }
        nextSteps={nextSteps}
        detail={
          <>
            <ResultGroup title={C.form.compareTitle} live={false}>
              <ResultRow
                label={C.form.grossValueLabel}
                value={money(result?.grossValue)}
              />
              <ResultRow
                label={C.form.contributedLabel}
                value={money(result?.totalContributed)}
              />
              <ResultRow
                label={C.form.netProfitLabel}
                value={money(result?.netProfit)}
              />
              <ResultRow
                label={C.form.grossProfitLabel}
                value={money(result?.grossProfit)}
              />
              <ResultRow
                label={C.form.valueLostPercentLabel}
                value={result ? formatPercent(result.valueLostPercent, 2) : null}
              />
            </ResultGroup>

            <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
              <ResultRow
                label={C.form.managementFeesLabel}
                value={money(result?.totalManagementFees)}
              />
              <ResultRow
                label={C.form.entryFeesLabel}
                value={money(result?.totalEntryFees)}
              />
              <ResultRow
                label={C.form.exitFeeResultLabel}
                value={money(result?.exitFee)}
              />
              <ResultRow
                label={C.form.totalFeesLabel}
                value={money(result?.totalFees)}
              />
              {/* These three rows blank when the money-weighted rate has no
                  root in the module's monthly bracket. That is reachable well
                  short of a wipe-out, so do not assume it is a dead state: on
                  the default plan the cutoff is a final value below twice the
                  monthly contribution — 10.000.000 ₫ — which a 99,7% exit fee
                  reaches at 9.591.565,90 ₫ left, and a 100%/năm management fee
                  at 4.950.000 ₫ left. Both are inside the 0–100 the fields
                  accept. Separately, months 984–985 blank the fee-free row and
                  the drag ALONE, leaving a net rate beside them, and 986
                  upward blanks all three (see `moneyWeightedAnnual` — that
                  cutoff moves with the plan size). Deliberately no notice of
                  its own: every one of those inputs is orders of magnitude
                  outside a real fee schedule or a human holding period, unlike
                  the no-profit case above, which a plausible gross return
                  reaches and which therefore does get copy. ResultRow renders
                  the placeholder in all of them. */}
              <ResultRow
                label={C.form.netAnnualLabel}
                value={
                  result?.netAnnualReturnPercent == null
                    ? null
                    : formatPercent(result.netAnnualReturnPercent, 3)
                }
              />
              <ResultRow
                label={C.form.grossAnnualLabel}
                value={
                  result?.grossAnnualReturnPercent == null
                    ? null
                    : formatPercent(result.grossAnnualReturnPercent, 3)
                }
              />
              <ResultRow
                label={C.form.dragLabel}
                value={
                  result?.annualDragPoints == null
                    ? null
                    : `${formatDecimal(result.annualDragPoints, 3)} ${C.form.pointsUnit}`
                }
              />
            </ResultGroup>
          </>
        }
      />
    </CalculatorCard>
  );
}
