"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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
import {
  computeCommercialLoan,
  type CommercialLoanInput,
} from "@/lib/calc/commercial-loan";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { yearlySummary } from "@/lib/calc/loan";
import { COMMERCIAL_LOAN as C } from "@/content/calculators/commercial-loan";

/**
 * Read the five form strings, each with the parser its FIELD KIND needs.
 *
 * Extracted and exported so the parser CHOICE is unit-testable, exactly as
 * `readShareFields` is on the financial-ratios page. No module test can reach
 * this step: `lib/calc/commercial-loan.test.ts` passes numbers straight in and
 * never crosses a parse.
 *
 * The four grammars of docs §4, applied here:
 *
 * - `amount` is money, so `parseMoney` — "5.000.000.000" has to survive.
 * - `rate` and `balloon` are rates, so `parseDecimal` — `parseMoney("7,5")`
 *   would be fine but `parseMoney("7.5")` is 75.
 * - `term` and `grace` are WHOLE COUNTS OF MONTHS, so `parseCount`. Both used
 *   `parseDecimal` behind a `Number.isInteger` guard, which is unreachable:
 *   `parseDecimal("1.000")` is `1`, and `1` IS an integer. So a reader who
 *   typed a grouped "1.000" got a silently accepted ONE-MONTH loan with no
 *   error shown, and the field's own "nhập số nguyên tháng" message could
 *   never fire. `parseCount` takes digits only, so the grouped spelling is
 *   rejected and the message becomes reachable.
 */
export function readCommercialLoanFields(values: {
  amount: string;
  rate: string;
  term: string;
  grace: string;
  balloon: string;
}): {
  /**
   * The resolved model input, or `null` when any field is rejected.
   *
   * Same shape as `readStatement` in `components/calc/financials-fields.tsx`,
   * and for the same two reasons: the page can still mark the ONE offending
   * field rather than blanking the form, and the caller gets a narrowed type
   * instead of five `number | null`s it has to re-narrow. The first draft of
   * this helper returned the five values loose, `vitest` was green, and
   * `tsc` was not — which is the whole reason the gate runs both.
   */
  input: CommercialLoanInput | null;
  amount: number | null;
  rate: number | null;
  term: number | null;
  grace: number | null;
  balloon: number | null;
  amountInvalid: boolean;
  rateInvalid: boolean;
  termInvalid: boolean;
  graceInvalid: boolean;
  balloonInvalid: boolean;
} {
  const amount = parseMoney(values.amount);
  const rate = parseDecimal(values.rate);
  const term = parseCount(values.term);
  const grace = parseCount(values.grace);
  const balloon = parseDecimal(values.balloon);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  // `parseCount` already refuses a non-integer and a negative, so what is
  // left here is the range check it always was.
  const termInvalid = term === null || term <= 0;
  // A grace period as long as the term is an interest-only loan, which the
  // module rejects rather than reinterpreting — so it is flagged here.
  const graceInvalid =
    grace === null || grace < 0 || (term !== null && grace >= term);
  const balloonInvalid = balloon === null || balloon < 0 || balloon >= 100;

  const anyInvalid =
    amountInvalid || rateInvalid || termInvalid || graceInvalid || balloonInvalid;

  return {
    input: anyInvalid
      ? null
      : {
          amount: amount!,
          annualRatePercent: rate!,
          termMonths: term!,
          graceMonths: grace!,
          balloonPercent: balloon!,
        },
    amount,
    rate,
    term,
    grace,
    balloon,
    amountInvalid,
    rateInvalid,
    termInvalid,
    graceInvalid,
    balloonInvalid,
  };
}

/**
 * CSV row 10 ("Hai cột"): the three payments in one block — already true, and
 * asserted so it stays true — with the emphasis on the BALLOON rather than on
 * an ordinary amortising month, because the end-of-term principal is the figure
 * this structure can surprise a borrower with. Docs §8.
 */
const FORM_ID = "vay-thuong-mai-nhap";
const RESULT_ID = "vay-thuong-mai-ket-qua";

export function CommercialLoanCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Term and grace are month counts and
  // format nothing.
  const fields = useCalcFields(
    {
      amount: C.form.defaultAmount,
      rate: C.form.defaultRate,
      term: C.form.defaultTerm,
      grace: C.form.defaultGrace,
      balloon: C.form.defaultBalloon,
    },
    { amount: "money", rate: "rate", balloon: "rate" },
  );

  const {
    input,
    amountInvalid,
    rateInvalid,
    termInvalid,
    graceInvalid,
    balloonInvalid,
  } = readCommercialLoanFields({
    amount: fields.values.amount,
    rate: fields.values.rate,
    term: fields.values.term,
    grace: fields.values.grace,
    balloon: fields.values.balloon,
  });

  const result = input === null ? null : computeCommercialLoan(input);

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /*
   * TYPED CELLS, which is what makes this table readable on a phone.
   *
   * It used to pass pre-formatted strings — `formatMoney(...)` — and that
   * opted it out of everything `ResultTable` does with money: no unit line, no
   * compact reading, and no precision control, because all three are derived
   * from `hasMoneyCell(rows)`. The exact đồng figure is `whitespace-nowrap` by
   * design (a wrapped "5.000.000.000" is unreadable), so each amount column
   * was pinned at the width of its widest number.
   *
   * Measured at a verified 390 px viewport on 2026-09-16: the table was 485 px
   * inside its 300 px scroll frame, with "5.000.000.000" alone taking 125 px.
   * The four-column mortgage year table two doors down — same shape, typed
   * cells — is 300 px and fits exactly, which is the evidence this change
   * copies rather than a guess.
   */
  const tableRows = result
    ? yearlySummary(result.schedule).map((year) => [
        countCell(year.year),
        moneyCell(year.interest),
        moneyCell(year.principal),
        moneyCell(year.balance),
      ])
    : [];

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
                {...fields.bind("rate")}
                label={C.form.rateLabel}
                unit={C.form.rateUnit}
                help={C.form.rateHelp}
                error={C.form.rateInvalid}
                invalid={rateInvalid}
              />
              <NumberField
                {...fields.bind("term")}
                label={C.form.termLabel}
                help={C.form.termHelp}
                error={C.form.termInvalid}
                invalid={termInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.structureGroup} className="mt-8">
              <NumberField
                {...fields.bind("grace")}
                label={C.form.graceLabel}
                unit={C.form.graceUnit}
                help={C.form.graceHelp}
                error={C.form.graceInvalid}
                invalid={graceInvalid}
              />
              <NumberField
                {...fields.bind("balloon")}
                label={C.form.balloonLabel}
                unit={C.form.balloonUnit}
                help={C.form.balloonHelp}
                error={C.form.balloonInvalid}
                invalid={balloonInvalid}
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
              rateInvalid ||
              termInvalid ||
              graceInvalid ||
              balloonInvalid
            }
            // Measured at 1440×1000: with the last field focused at y 528,75
            // the first result row sat at y −103,75, i.e. off the top of the
            // viewport while the structure fields are being edited. The
            // restated figure is the EMPHASISED row — the end-of-term
            // principal, which is what this structure can surprise a borrower
            // with — through `money()`, the same formatter that row uses.
            sticky
            answer={{
              label: C.form.balloonResultLabel,
              value: money(result?.balloonAmount),
            }}
          />
        }
        primary={
          /* Three rows because there are three payments. A single "monthly
             payment" would be true for neither stretch of the loan. */
          <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
            <ResultRow
              label={C.form.balloonResultLabel}
              value={money(result?.balloonAmount)}
              emphasis
            />
            <ResultRow
              label={C.form.gracePaymentLabel}
              value={money(result?.gracePayment)}
            />
            <ResultRow
              label={C.form.amortizingPaymentLabel}
              value={money(result?.amortizingPayment)}
            />
          </ResultGroup>
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
              <ResultRow
                label={C.form.totalInterestLabel}
                value={money(result?.totalInterest)}
              />
              <ResultRow
                label={C.form.ratioLabel}
                value={
                  result
                    ? formatPercent(result.interestToPrincipalPercent, 2)
                    : null
                }
              />
              <ResultRow
                label={C.form.structureCostLabel}
                value={money(result?.structureCost)}
              />
              {/* The yardstick: the same money with no grace and no balloon. */}
              <ResultRow
                label={C.form.plainPaymentLabel}
                value={money(result?.plainPayment)}
              />
              <ResultRow
                label={C.form.plainInterestLabel}
                value={money(result?.plainTotalInterest)}
              />
              <ResultRow
                label={C.form.graceInterestLabel}
                value={money(result?.graceInterest)}
              />
              <ResultRow
                label={C.form.amortizingMonthsLabel}
                value={
                  result
                    ? `${formatDecimal(result.amortizingMonths, 0)} ${C.form.monthsUnit}`
                    : null
                }
              />
              <ResultRow
                label={C.form.totalPaidLabel}
                value={money(result?.totalPaid)}
              />
            </ResultGroup>

            {tableRows.length > 0 ? (
              <ResultTable
                className="mt-8"
                caption={C.form.table.caption}
                columns={[
                  // `numeric` + `nowrap` on the period column, which is what
                  // keeps the 8,5rem PROSE floor off it. That floor exists so a
                  // metric label cannot be squeezed to one word per line by wide
                  // figures; on a column holding "1", "2", "3" it was pure waste
                  // — measured at 136 px for content needing 32, a third of the
                  // table's budget. `result-table-render.test.ts` already asserts
                  // a period column gets no floor; this table simply never
                  // declared itself as one.
                  { label: C.form.table.yearColumn, numeric: true, nowrap: true },
                  { label: C.form.table.interestColumn, numeric: true },
                  { label: C.form.table.principalColumn, numeric: true },
                  { label: C.form.table.balanceColumn, numeric: true },
                ]}
                rows={tableRows}
              />
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
