"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { fill } from "@/lib/calc/charts/labels";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computePoints } from "@/lib/calc/points";
import { POINTS as C } from "@/content/calculators/points";

/**
 * CSV row 14 ("Hai cột"): the verdict at the reader's own exit month, the
 * amount it turns on, and the month it was taken at — one answer with two
 * supporting figures. The fee, the monthly reduction and the simple break-even
 * are the measures behind it and read as the detail group's first three rows;
 * they are not repeated above. Docs §8.
 */
const FORM_ID = "diem-chiet-khau-nhap";
const RESULT_ID = "diem-chiet-khau-ket-qua";

export function PointsCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Term and hold are counts and format nothing.
  const fields = useCalcFields(
    {
      amount: C.form.defaultAmount,
      term: C.form.defaultTerm,
      baseRate: C.form.defaultBaseRate,
      points: C.form.defaultPoints,
      reduction: C.form.defaultReduction,
      hold: C.form.defaultHold,
    },
    { amount: "money", baseRate: "rate", points: "rate", reduction: "rate" },
  );

  const amount = parseMoney(fields.values.amount);
  // Two whole counts of months, neither with a unit toggle, so `parseCount` —
  // docs §4. Both were `parseDecimal` with the `Number.isInteger` guards
  // below them, which is exactly the arrangement `parseCount`'s docstring
  // calls unreachable: `parseDecimal` reads a grouped "1.000" as 1, and 1 IS
  // an integer, so the guard passed. On this page that matters more than
  // most — `hold` is the field the copy calls "ô quyết định kết luận".
  const term = parseCount(fields.values.term);
  const baseRate = parseDecimal(fields.values.baseRate);
  const pointsPercent = parseDecimal(fields.values.points);
  const reduction = parseDecimal(fields.values.reduction);
  const hold = parseCount(fields.values.hold);

  const amountInvalid = amount === null || amount <= 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const baseRateInvalid = baseRate === null || baseRate < 0;
  const pointsInvalid = pointsPercent === null || pointsPercent < 0;
  // A reduction that takes the rate below zero is not a product on offer.
  const reductionInvalid =
    reduction === null ||
    reduction < 0 ||
    (baseRate !== null && reduction > baseRate);
  const holdInvalid = hold === null || hold <= 0 || !Number.isInteger(hold);

  const result =
    amountInvalid ||
    termInvalid ||
    baseRateInvalid ||
    pointsInvalid ||
    reductionInvalid ||
    holdInvalid
      ? null
      : computePoints({
          amount,
          termMonths: term,
          baseRatePercent: baseRate,
          pointsPercent,
          rateReductionPoints: reduction,
          holdMonths: hold,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const breakEven =
    result?.breakEvenMonths == null
      ? null
      : `${formatDecimal(result.breakEvenMonths, 0)} ${C.form.monthsUnit}`;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.loanGroup}>
              <NumberField
                {...fields.bind("amount")}
                label={C.form.amountLabel}
                unit={C.form.amountUnit}
                help={C.form.amountHelp}
                error={C.form.amountInvalid}
                invalid={amountInvalid}
              />
              <NumberField
                {...fields.bind("term")}
                label={C.form.termLabel}
                help={C.form.termHelp}
                error={C.form.termInvalid}
                invalid={termInvalid}
              />
              <NumberField
                {...fields.bind("baseRate")}
                label={C.form.baseRateLabel}
                unit={C.form.baseRateUnit}
                help={C.form.baseRateHelp}
                error={C.form.baseRateInvalid}
                invalid={baseRateInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.offerGroup} className="mt-8">
              <NumberField
                {...fields.bind("points")}
                label={C.form.pointsLabel}
                unit={C.form.pointsUnit}
                help={C.form.pointsHelp}
                error={C.form.pointsInvalid}
                invalid={pointsInvalid}
              />
              <NumberField
                {...fields.bind("reduction")}
                label={C.form.reductionLabel}
                unit={C.form.reductionUnit}
                help={C.form.reductionHelp}
                error={C.form.reductionInvalid}
                invalid={reductionInvalid}
              />
              <NumberField
                {...fields.bind("hold")}
                label={C.form.holdLabel}
                help={C.form.holdHelp}
                error={C.form.holdInvalid}
                invalid={holdInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={
              amountInvalid ||
              termInvalid ||
              baseRateInvalid ||
              pointsInvalid ||
              reductionInvalid ||
              holdInvalid
            }
            // Measured at 1440×1000 with the last offer field focused at
            // y 529: the first result row sat at y −232,5. The restatement is
            // the EMPHASISED row — the gain or loss at settlement — through the
            // same `money()` the row uses, carrying the horizon month the
            // second row states, because the figure changes sign with it.
            sticky
            answer={{
              label: fill(C.form.pinnedPositionLabel, {
                month: result ? formatDecimal(result.holdMonths, 0) : "—",
              }),
              value: money(result?.holdPosition),
            }}
          />
        }
        primary={
          <>
            {/* THE DECISION AND THE AMOUNT IT TURNS ON, and nothing else.
                A browser pass at 390 px read six rows here, which put the fee,
                the monthly reduction and the simple break-even beside the
                verdict as if they were co-equal answers. They are the measures
                behind it, so they are in the detail group below, with the
                break-even still labelled "kiểu đơn giản" and `methodNotice`
                above the tool still explaining why 64 and a gain at 60 are both
                true. The horizon row stays: the verdict is only meaningful with
                the month it was taken at. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.verdictLabel}
                value={
                  result === null
                    ? null
                    : result.worthIt
                      ? C.form.verdictYes
                      : C.form.verdictNo
                }
                prose
              />
              <ResultRow
                label={C.form.holdPositionLabel}
                value={money(result?.holdPosition)}
                emphasis
              />
              <ResultRow
                label={C.form.holdMonthsLabel}
                value={
                  result
                    ? `${formatDecimal(result.holdMonths, 0)} ${C.form.monthsUnit}`
                    : null
                }
              />
            </ResultGroup>

            {result !== null && result.breakEvenMonths === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noBreakEvenNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <ResultGroup title={C.form.detailTitle} live={false}>
            {/* The three measures the verdict is built from, in the order a
                reader checks them: what was paid, what it buys each month, and
                when the naive arithmetic says it pays back. */}
            <ResultRow label={C.form.costLabel} value={money(result?.cost)} />
            <ResultRow
              label={C.form.monthlySavingLabel}
              value={money(result?.monthlySaving)}
            />
            <ResultRow label={C.form.breakEvenLabel} value={breakEven} />
            <ResultRow
              label={C.form.buydownRateLabel}
              value={result ? formatPercent(result.buydownRatePercent) : null}
            />
            <ResultRow
              label={C.form.basePaymentLabel}
              value={money(result?.basePayment)}
            />
            <ResultRow
              label={C.form.buydownPaymentLabel}
              value={money(result?.buydownPayment)}
            />
            <ResultRow
              label={C.form.baseHoldLabel}
              value={money(result?.baseHoldCost)}
            />
            <ResultRow
              label={C.form.buydownHoldLabel}
              value={money(result?.buydownHoldCost)}
            />
            <ResultRow
              label={C.form.lifetimeLabel}
              value={money(result?.lifetimeSaving)}
            />
          </ResultGroup>
        }
      />
    </CalculatorCard>
  );
}
