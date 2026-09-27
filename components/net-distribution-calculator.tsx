"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  netProceedsModel,
  type NamedCharge,
} from "@/lib/calc/charts/net-proceeds-chart";
import {
  computeNetDistribution,
  type DistributionDirection,
} from "@/lib/calc/net-distribution";
import { NET_DISTRIBUTION as C } from "@/content/calculators/net-distribution";

/**
 * ROW 69 — "Đưa số thực về tay cạnh số vay; biểu đồ trừ phí trước giải thích
 * dài, không gọi đây là đề nghị giải ngân", at "Hai cột".
 *
 * THREE CHANGES, and the row names all three.
 *
 * "CẠNH SỐ VAY" is the split: the four input groups are eighteen fields tall,
 * so the two figures the page exists to contrast — số thực về tay against nợ
 * gốc trên hợp đồng — were below the fold of the form that produces them. They
 * were already the first two rows of the announced group and stay in that
 * order; "số tiền thực về tay" now takes `emphasis` and is the string the
 * sticky CTA pins, because it is the question in the page title.
 *
 * "BIỂU ĐỒ TRƯỚC GIẢI THÍCH DÀI" moves the deduction bridge from the bottom of
 * the card into the `chart` slot, i.e. directly under the answer. It used to
 * sit after the six-row Chi tiết group and both refusal paragraphs, which is
 * the ordering `CalculatorLayout`'s docstring measured the cost of elsewhere.
 * The Chi tiết rows are the full-width band now.
 *
 * "KHÔNG GỌI ĐÂY LÀ ĐỀ NGHỊ GIẢI NGÂN" is `notCommitmentLine`, rendered inside
 * the result region so a promoted đồng headline cannot be read as a quote. Its
 * two claims are `disclaimer`'s and `transactionNotice`'s already; see the
 * content file.
 *
 * WHAT DID NOT CHANGE: the engine call, both directions, every bound, and the
 * CROSS-FIELD percentage rule — `tooMuch` still marks all three rate fields
 * `aria-invalid` with `totalRateInvalid` in place of their help text, still
 * blanks every figure, and still renders `tooMuchNotice` beside them. The CTA's
 * `invalid` is that same condition, so it focuses the first offending rate
 * rather than scrolling to a placeholder.
 */
const FORM_ID = "phan-phoi-rong-nhap";
const RESULT_ID = "phan-phoi-rong-ket-qua";

export function NetDistributionCalculator({
  actions,
  nextSteps,
}: {
  /**
   * The one or two near-answer destinations — `<ResultActions>`, between the
   * answer and the deduction bridge. The APR question is the one a reader has
   * the moment they see how much the fees took, and it used to be reachable
   * only after the chart, the six-row band and both refusal paragraphs.
   */
  actions?: React.ReactNode;
  /** The further questions and the retention panel — `<ToolNextSteps promoted>`. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Direction is a list.
  const fields = useCalcFields(
    {
      direction: C.form.defaultDirection,
      amount: C.form.defaultAmount,
      percent1: C.form.defaultPercent1,
      percent2: C.form.defaultPercent2,
      percent3: C.form.defaultPercent3,
      fixed1: C.form.defaultFixed1,
      fixed2: C.form.defaultFixed2,
    },
    {
      amount: "money",
      percent1: "rate",
      percent2: "rate",
      percent3: "rate",
      fixed1: "money",
      fixed2: "money",
    },
  );

  const amount = parseMoney(fields.values.amount);
  const percents = [
    parseDecimal(fields.values.percent1),
    parseDecimal(fields.values.percent2),
    parseDecimal(fields.values.percent3),
  ];
  const fixeds = [
    parseMoney(fields.values.fixed1),
    parseMoney(fields.values.fixed2),
  ];

  const amountInvalid = amount === null || amount <= 0;
  const percentInvalid = percents.map(
    (value) => value === null || value < 0,
  );
  const fixedInvalid = fixeds.map((value) => value === null || value < 0);

  const fieldsUsable =
    !amountInvalid &&
    !percentInvalid.some(Boolean) &&
    !fixedInvalid.some(Boolean);

  const result = fieldsUsable
    ? computeNetDistribution({
        direction: fields.values.direction as DistributionDirection,
        amount,
        percentDeductions: percents.map((value) => value ?? 0),
        fixedDeductions: fixeds.map((value) => value ?? 0),
      })
    : null;

  // Every field parses but the percentages reach 100 — nothing survives, and
  // the reverse direction divides by zero.
  const tooMuch = fieldsUsable && result === null;

  /**
   * Whether each percentage field is marked invalid.
   *
   * A CROSS-FIELD failure is attached to the fields that caused it. When the
   * rates SUM to 100 or more, each one is individually legal — so the
   * paragraph below used to be the only signal, and an independent review
   * found the group carrying no `aria-invalid` and no described error for it.
   * A screen-reader user got blank results with no announced reason.
   *
   * Every percentage field carries the flag, because the sum is the fault and
   * no single field is more to blame than another; `NumberField` then shows
   * the total-rate error in place of its own help text and sets
   * `aria-invalid`.
   */
  const percentFieldInvalid = percents.map(
    (value, index) => percentInvalid[index] || tooMuch,
  );

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /**
   * Each charge, named, with the BASE its percentage applied to.
   *
   * Built from the same parsed figures the engine used, and from the
   * engine's own gross — so a percentage line's đồng amount is always
   * `percent% × gross` and never a share of some other number. The declared
   * base is what makes a charge checkable against a contract.
   */
  const namedCharges: NamedCharge[] =
    result === null
      ? []
      : [
          ...[
            { key: "percent1", label: C.form.percent1Label, percent: percents[0] },
            { key: "percent2", label: C.form.percent2Label, percent: percents[1] },
            { key: "percent3", label: C.form.percent3Label, percent: percents[2] },
          ].map(({ key, label, percent }) => ({
            key,
            label,
            percent: percent ?? 0,
            amount: result.gross * ((percent ?? 0) / 100),
          })),
          ...[
            { key: "fixed1", label: C.form.fixed1Label, amount: fixeds[0] ?? 0 },
            { key: "fixed2", label: C.form.fixed2Label, amount: fixeds[1] ?? 0 },
          ].map(({ key, label, amount }) => ({
            key,
            label,
            // Null percent means "a flat amount", which the table labels
            // differently from a share of the gross.
            percent: null,
            amount,
          })),
        ];

  const chart = netProceedsModel(result, namedCharges, C.chart);

  /** The promoted figure, formatted once for the row and the CTA. */
  const netAnswer = money(result?.net);

  const form = (
    <>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("direction")}
          legend={C.form.directionLegend}
          help={C.form.directionHelp}
          options={[
            { value: "toNet", label: C.form.directionToNet },
            { value: "toGross", label: C.form.directionToGross },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.amountGroup} className="mt-8">
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.percentGroup} className="mt-8">
        <NumberField
          {...fields.bind("percent1")}
          label={C.form.percent1Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[0]}
        />
        <NumberField
          {...fields.bind("percent2")}
          label={C.form.percent2Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[1]}
        />
        <NumberField
          {...fields.bind("percent3")}
          label={C.form.percent3Label}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={tooMuch ? C.form.totalRateInvalid : C.form.percentInvalid}
          invalid={percentFieldInvalid[2]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.fixedGroup} className="mt-8">
        <NumberField
          {...fields.bind("fixed1")}
          label={C.form.fixed1Label}
          unit={C.form.fixedUnit}
          help={C.form.fixedHelp}
          error={C.form.fixedInvalid}
          invalid={fixedInvalid[0]}
        />
        <NumberField
          {...fields.bind("fixed2")}
          label={C.form.fixed2Label}
          unit={C.form.fixedUnit}
          help={C.form.fixedHelp}
          error={C.form.fixedInvalid}
          invalid={fixedInvalid[1]}
        />
      </FieldGroup>
    </>
  );

  const primary = (
    <>
      {/* Both ends of the conversion in the headline, plus the gross-up —
          which is the figure the page exists to correct. */}
      {/* Original row 67: the gross obligation stays VISIBLE beside the
          smaller figure that arrives, and is named as still owed. */}
      <ResultGroup
        title={C.form.resultTitle}
        className="mt-8"
        anchorId={RESULT_ID}
      >
        <ResultRow label={C.form.netLabel} value={netAnswer} emphasis />
        {/* §6 repair: the gross was announced TWICE — once as nợ gốc trên hợp
            đồng and once as "vẫn phải trả lãi và gốc trên", the same đồng
            figure in two peer rows. The obligation was never a second
            quantity; it is what is true OF this one, so it is said on the row
            it qualifies. `obligationNote` below still spells out why the two
            figures differ. */}
        <ResultRow
          label={C.form.grossLabel}
          value={money(result?.gross)}
          // Not on a placeholder: the cross-field total-rate failure blanks
          // every figure, and a qualifier on a dash asserts something about a
          // number nobody can see.
          note={result === null ? undefined : C.form.obligationLabel}
        />
        <ResultRow
          label={C.form.grossUpLabel}
          value={
            result && result.grossUpPercent !== null
              ? formatPercent(result.grossUpPercent, 4)
              : null
          }
        />
      </ResultGroup>

      {/* Conditional on there BEING two figures. The sentence explains why
          the first two rows differ, and a review found it still asserting
          that while both rows were the placeholder — the cross-field
          total-rate failure blanks them. */}
      {result !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.obligationNote}
        </p>
      ) : null}

      {/* ROW 69: the headline is an estimate of the reader's own charges, and
          says so in the same region rather than at the foot of the page. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.notCommitmentLine}
      </p>

      {result !== null && result.net < 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.negativeNetNotice}
        </p>
      ) : null}

      {tooMuch ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.tooMuchNotice}
        </p>
      ) : null}
    </>
  );

  const detail = (
    <>
      <ResultGroup title={C.form.detailTitle} live={false}>
        <ResultRow
          label={C.form.percentAmountLabel}
          value={money(result?.percentAmount)}
        />
        <ResultRow
          label={C.form.fixedAmountLabel}
          value={money(result?.fixedAmount)}
        />
        <ResultRow
          label={C.form.totalDeductedLabel}
          value={money(result?.totalDeducted)}
        />
        <ResultRow
          label={C.form.totalRateLabel}
          value={result ? formatPercent(result.totalPercentRate, 4) : null}
        />
        <ResultRow
          label={C.form.effectiveRateLabel}
          value={
            result ? formatPercent(result.effectiveRatePercent, 4) : null
          }
        />
        <ResultRow
          label={C.form.retentionLabel}
          value={result ? formatPercent(result.retentionPercent, 4) : null}
        />
      </ResultGroup>
    </>
  );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={form}
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={result === null}
            sticky
            answer={{ label: C.form.netLabel, value: netAnswer }}
          />
        }
        primary={primary}
        actions={actions}
        chart={
          <ChartFigure model={chart}>
            <BarChart model={chart} />
          </ChartFigure>
        }
        nextSteps={nextSteps}
        detail={detail}
      />
    </CalculatorCard>
  );
}
