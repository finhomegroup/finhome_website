"use client";

import { useState } from "react";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
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
import { moneyCell, percentCell } from "@/lib/calc/table-cell";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  MAX_FLOATING_MONTHS,
  RATE_STRESS_POINTS,
  compareRateStress,
} from "@/lib/calc/floating-loan";
import { floatingChartModel } from "@/lib/calc/charts/floating-chart";
import { fill } from "@/lib/calc/charts/labels";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { FLOATING_LOAN as C } from "@/content/calculators/floating-loan";

// No `= {}` default on the parameter: an optional PARAMETER makes the
// component fail `createElement`'s typed overload, so nothing could pass this
// from a test. React always supplies a props object.
export function FloatingLoanCalculator({
  /**
   * Which named scenario the page opens on. The route renders the baseline.
   *
   * It is a prop for the same reason `AprCalculator` takes `initialMode`:
   * every calculator here is server-rendered at its defaults and the only way
   * to assert a non-default state's real markup is to render it. Nothing
   * outside a test passes anything but 0, and no scenario is ever read from a
   * URL — financial inputs do not go into query strings.
   */
  initialStressPoints = 0,
}: {
  initialStressPoints?: number;
}) {
  const initial = {
    amount: C.form.defaultAmount,
    term: C.form.defaultTerm,
    promoMonths: C.form.defaultPromoMonths,
    promoRate: C.form.defaultPromoRate,
    postRate: C.form.defaultPostRate,
    adjustEvery: C.form.defaultAdjustEvery,
    adjustStep: C.form.defaultAdjustStep,
    rateCap: C.form.defaultRateCap,
    budget: C.form.defaultBudget,
  };
  const fields = useCalcFields(initial);

  /**
   * ORIGINAL ROW 11 — the named hypothetical shift, as a SELECTION.
   *
   * A selection and not an increment: the audit is explicit that "repeated
   * clicks do not accumulate shifts", and a "+1" button that adds to a running
   * total gives a different answer the second time it is pressed. Held outside
   * `useCalcFields` because it is not a typed figure — there is nothing to
   * parse and nothing to reject — and it is deliberately NOT part of
   * `pristine`: choosing a scenario is exploring the example, not replacing it
   * with the reader's own loan.
   */
  const [stressPoints, setStressPoints] = useState<number>(initialStressPoints);

  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const amount = parseMoney(fields.values.amount);
  // WHOLE MONTHS USE `parseCount`. docs §4: `parseDecimal("1.200")` is 1,2, so
  // a term typed with a thousands separator silently became one and a bit
  // months and the field's own integer message was unreachable. Three fields
  // here are counts — the term, the promotional stretch and the review cycle —
  // and all three are now rejected on the TYPED value rather than clamped.
  const term = parseCount(fields.values.term);
  const promoMonths = parseCount(fields.values.promoMonths);
  const promoRate = parseDecimal(fields.values.promoRate);
  const postRate = parseDecimal(fields.values.postRate);
  const adjustEvery = parseCount(fields.values.adjustEvery);
  const adjustStep = parseDecimal(fields.values.adjustStep);

  // Optional: most Vietnamese contracts have no cap, so empty is the norm.
  const rateCapRaw = fields.values.rateCap.trim();
  const rateCap = rateCapRaw === "" ? null : parseDecimal(rateCapRaw);

  // Also optional, and deliberately so: the budget line is drawn only from a
  // figure the reader supplied. Substituting a ratio here would put a
  // horizontal rule labelled "your budget" on the chart that the tool made
  // up — advice disguised as a measurement.
  const budgetRaw = fields.values.budget.trim();
  const budget = budgetRaw === "" ? null : parseMoney(budgetRaw);

  const amountInvalid = amount === null || amount <= 0;
  // The supported horizon is enforced here as well as in the module, so the
  // field explains itself instead of the whole result quietly clearing.
  const termInvalid = term === null || term < 1 || term > MAX_FLOATING_MONTHS;
  const promoMonthsInvalid =
    promoMonths === null ||
    promoMonths > MAX_FLOATING_MONTHS ||
    (term !== null && promoMonths >= term);
  const promoRateInvalid = promoRate === null || promoRate < 0;
  const postRateInvalid = postRate === null || postRate < 0;
  const adjustEveryInvalid =
    adjustEvery === null ||
    adjustEvery < 1 ||
    adjustEvery > MAX_FLOATING_MONTHS;
  const adjustStepInvalid = adjustStep === null || adjustStep < 0;
  const rateCapInvalid =
    rateCapRaw !== "" && (rateCap === null || rateCap < 0);
  const budgetInvalid = budgetRaw !== "" && (budget === null || budget < 0);

  const fieldsUsable =
    !amountInvalid &&
    !termInvalid &&
    !promoMonthsInvalid &&
    !promoRateInvalid &&
    !postRateInvalid &&
    !adjustEveryInvalid &&
    !adjustStepInvalid &&
    !rateCapInvalid &&
    !budgetInvalid;

  /**
   * ONE call, BOTH sides.
   *
   * `compareRateStress` builds the reader's own schedule and the selected
   * scenario's from the same inputs — phases, amortisation, the post-promo
   * instalment and the differences all live in `lib/calc/floating-loan.ts`.
   * Nothing on this page computes a payment, a rate or a difference: the
   * headline, the chart, the phase table and the detail figures all read the
   * SELECTED scenario, so they cannot describe three different assumptions.
   */
  const stress =
    fieldsUsable && amount !== null
      ? compareRateStress({
          amount,
          termMonths: term,
          promoMonths,
          promoRatePercent: promoRate,
          postRatePercent: postRate,
          adjustEveryMonths: adjustEvery,
          adjustStepPoints: adjustStep,
          rateCapPercent: rateCap ?? undefined,
          // The budget line and the budget gap come from this field or from
          // nowhere. `null` here is not 0 đồng of budget.
          monthlyBudget: budget ?? undefined,
          shiftPoints: stressPoints,
        })
      : null;

  const result = stress?.selected.loan ?? null;
  const stressed = stressPoints > 0;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  // Six columns of full đồng was the widest table in this unit's screenshot.
  // Typed cells put every amount into one stated unit and keep the rate out of
  // it — `percentCell` is never rescaled, so 14,00% cannot become 0,0.
  const tableRows =
    result?.phases.map((phase) => [
      `${formatDecimal(phase.fromMonth, 0)}–${formatDecimal(phase.toMonth, 0)}`,
      percentCell(phase.annualRatePercent, 2),
      moneyCell(phase.payment),
      moneyCell(phase.interest),
      moneyCell(phase.principal),
      moneyCell(phase.balance),
    ]) ?? [];

  const chart = floatingChartModel(result, budget, {
    ...CHART_UI.money,
    ...C.chart,
  });

  const scenarioSettings: DisclosedSetting[] = [
    {
      key: "adjustStep",
      label: C.form.scenarioStepActive,
      value: `${formatDecimal(adjustStep ?? 0, 2)}%`,
      active: (adjustStep ?? 0) > 0,
    },
    {
      key: "adjustEvery",
      label: C.form.scenarioEveryActive,
      value: `${formatDecimal(adjustEvery ?? 12, 0)} ${C.form.adjustEveryUnit}`,
      // Only matters once there is a step to apply at each review.
      active: (adjustStep ?? 0) > 0,
    },
    {
      key: "rateCap",
      label: C.form.scenarioCapActive,
      value: `${formatDecimal(rateCap ?? 0, 2)}%`,
      active: rateCapRaw !== "" && rateCap !== null,
    },
  ];

  return (
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

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
      </FieldGroup>

      <FieldGroup title={C.form.promoGroup} className="mt-8">
        <NumberField
          {...fields.bind("promoMonths")}
          label={C.form.promoMonthsLabel}
          help={C.form.promoMonthsHelp}
          error={C.form.promoMonthsInvalid}
          invalid={promoMonthsInvalid}
        />
        <NumberField
          {...fields.bind("promoRate")}
          label={C.form.promoRateLabel}
          unit={C.form.promoRateUnit}
          help={C.form.promoRateHelp}
          error={C.form.promoRateInvalid}
          invalid={promoRateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.postGroup} className="mt-8">
        <NumberField
          {...fields.bind("postRate")}
          label={C.form.postRateLabel}
          unit={C.form.postRateUnit}
          help={C.form.postRateHelp}
          error={C.form.postRateInvalid}
          invalid={postRateInvalid}
        />
        {/* Optional, and blank by default — see the parse above for why the
            tool never guesses this. Kept in the core group because a budget
            line is the point of the chart for most readers. */}
        <NumberField
          {...fields.bind("budget")}
          label={C.form.budgetLabel}
          unit={C.form.budgetUnit}
          help={C.form.budgetHelp}
          error={C.form.budgetInvalid}
          invalid={budgetInvalid}
        />
      </FieldGroup>

      {/*
        ORIGINAL ROW 11, in the primary flow and not behind a disclosure:
        "nút thử tăng 1/2/3 điểm phần trăm với nhãn kịch bản". It sits directly
        under the post-promotional rate it shifts, because that is the field it
        is about.

        A radio group, so the presets are NAMED SCENARIOS and selecting one
        twice cannot compound — the reproduced requirement is that repeated
        clicks do not accumulate. The baseline is one of the options, so
        getting back to the reader's own figure is a selection rather than a
        reset they have to find.
      */}
      <RadioGroupField
        value={String(stressPoints)}
        onValueChange={(next) => setStressPoints(Number(next))}
        legend={C.form.stressLegend}
        help={C.form.stressHelp}
        className="mt-8"
        options={RATE_STRESS_POINTS.map((points) => ({
          value: String(points),
          label:
            points === 0
              ? C.form.stressBaselineOption
              : points === 1
                ? C.form.stressPlusOne
                : points === 2
                  ? C.form.stressPlusTwo
                  : C.form.stressPlusThree,
        }))}
      />

      {/* The step-up scenario is a second-order what-if. Collapsed, but its
          summary line names any setting that is moving the result. */}
      <AdvancedFields
        title={C.form.scenarioGroupTitle}
        settings={scenarioSettings}
        className="mt-8"
      >
        <NumberField
          {...fields.bind("adjustStep")}
          label={C.form.adjustStepLabel}
          unit={C.form.adjustStepUnit}
          help={C.form.adjustStepHelp}
          error={C.form.adjustStepInvalid}
          invalid={adjustStepInvalid}
        />
        <NumberField
          {...fields.bind("adjustEvery")}
          label={C.form.adjustEveryLabel}
          unit={C.form.adjustEveryUnit}
          help={C.form.adjustEveryHelp}
          error={C.form.adjustEveryInvalid}
          invalid={adjustEveryInvalid}
        />
        <NumberField
          {...fields.bind("rateCap")}
          label={C.form.rateCapLabel}
          unit={C.form.rateCapUnit}
          help={C.form.rateCapHelp}
          error={C.form.rateCapInvalid}
          invalid={rateCapInvalid}
        />
      </AdvancedFields>

      {/* The promo instalment and the one after it, side by side, plus the
          gap — which is the whole point of the page. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.firstPaymentLabel}
          value={money(result?.firstPayment)}
        />
        <ResultRow
          label={C.form.highestPaymentLabel}
          value={money(result?.highestPayment)}
        />
        <ResultRow
          label={C.form.shockLabel}
          value={money(result?.paymentShock)}
        />
        <ResultRow
          label={C.form.shockPercentLabel}
          value={
            result ? formatPercent(result.paymentShockPercent, 2) : null
          }
        />
      </ResultGroup>

      {/*
        THE BASELINE, KEPT. A scenario that replaced the reader's own figures
        would leave them with nothing to compare against — so the rate being
        used, the reader's own instalment and the difference are all stated,
        and `live={false}` because this is a comparison the reader asked for by
        choosing a scenario, not a per-keystroke announcement. docs §4: exactly
        one live region per page, and it is the headline above.
      */}
      <ResultGroup
        title={C.form.stressComparisonTitle}
        className="mt-4"
        live={false}
      >
        <ResultRow
          label={C.form.stressAppliedLabel}
          value={
            stress ? formatPercent(stress.selected.postRatePercent, 2) : null
          }
        />
        {stress?.selected.cappedByRateCap ? (
          <ResultRow
            label={C.form.stressRequestedLabel}
            value={formatPercent(stress.selected.requestedPostRatePercent, 2)}
          />
        ) : null}
        {stressed ? (
          <>
            <ResultRow
              label={C.form.stressBaselineRateLabel}
              value={
                stress ? formatPercent(stress.baseline.postRatePercent, 2) : null
              }
            />
            <ResultRow
              label={C.form.stressBaselinePaymentLabel}
              value={money(stress?.baseline.postPromoPayment)}
            />
            <ResultRow
              label={fill(C.form.stressPaymentIncreaseLabel, {
                n: stress?.selected.postPromoMonth ?? "—",
              })}
              value={money(stress?.paymentIncrease)}
            />
            <ResultRow
              label={C.form.stressInterestIncreaseLabel}
              value={money(stress?.interestIncrease)}
            />
          </>
        ) : null}
        {/* Mounted only when the reader typed a budget. No budget, no line and
            no gap — the tool does not invent one.

            TWO ROWS, because one gap cannot answer both questions. The first
            is the reset month; the second is the highest instalment anywhere
            in the schedule, which a recurring step pushes years later. The
            peak row is mounted only when it IS a different month. */}
        {stress?.selected.budgetGap != null ? (
          <ResultRow
            label={fill(C.form.stressBudgetGapLabel, {
              n: stress.selected.postPromoMonth ?? "—",
            })}
            value={money(stress.selected.budgetGap)}
          />
        ) : null}
        {stress?.selected.budgetGapAtPeak != null &&
        stress.selected.peakMonth !== stress.selected.postPromoMonth ? (
          <ResultRow
            label={fill(C.form.stressBudgetGapPeakLabel, {
              n: stress.selected.peakMonth,
            })}
            value={money(stress.selected.budgetGapAtPeak)}
          />
        ) : null}
      </ResultGroup>

      {/* `stress !== null` as well as `!stressed`: with a malformed field there
          is no computed result, and "đang tính đúng mức lãi bạn nhập" would be
          a success note over a row of dashes. */}
      {stress !== null && !stressed ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.stressBaselineNotice}
        </p>
      ) : null}
      {stress?.selected.cappedByRateCap ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.stressCapNotice}
        </p>
      ) : null}
      {stressed && (adjustStep ?? 0) > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.stressStepNotice}
        </p>
      ) : null}
      {stress?.selected.budgetGap != null && stress.selected.budgetGap < 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.stressBudgetOverNotice}
        </p>
      ) : null}
      {/* The case a single gap hides: the reset fits, a later step does not. */}
      {stress?.selected.budgetGap != null &&
      stress.selected.budgetGap >= 0 &&
      stress.selected.budgetGapAtPeak != null &&
      stress.selected.budgetGapAtPeak < 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {fill(C.form.stressBudgetOverLaterNotice, {
            n: stress.selected.peakMonth,
            amount: money(-stress.selected.budgetGapAtPeak) ?? "",
          })}
        </p>
      ) : null}

      {/* The chart comes straight after the answer. Outside every
          ResultGroup: it must not be re-announced on each keystroke, for the
          same reason a table must not. */}
      <ChartFigure model={chart}>
        <LineChart model={chart} />
      </ChartFigure>

      <DetailDisclosure
        title={C.form.detailDisclosureTitle}
        hint={C.form.detailDisclosureHint}
        className="mt-8"
      >
        {/* The observed defect was here: 2.862.633.323 ₫ and 4.862.633.323 ₫
            beside their labels in a 266 px panel, each label squeezed into a
            one-word column. Compact figures under one stated unit, label above
            value on a phone, and the full đồng reading one checkbox away. */}
        <DetailFigures
          title={C.form.detailTitle}
          figures={[
            {
              label: C.form.totalInterestLabel,
              value: result ? moneyCell(result.totalInterest) : null,
            },
            {
              label: C.form.totalPaidLabel,
              value: result ? moneyCell(result.totalPaid) : null,
            },
            {
              label: C.form.lowestPaymentLabel,
              value: result ? moneyCell(result.lowestPayment) : null,
            },
            {
              // A month count, not an amount: it keeps its own unit word and
              // is never scaled.
              label: C.form.monthsLabel,
              value: result
                ? `${formatDecimal(result.months, 0)} ${C.form.monthsUnit}`
                : null,
            },
          ]}
        />

        {tableRows.length > 0 ? (
          <ResultTable
            className="mt-6"
            caption={C.form.table.caption}
            // Six columns are 390 px wide inside a 266 px panel even compacted,
            // so a phone gets one block per rate phase instead: the month range
            // as the block's heading, then rate, instalment, interest,
            // principal and closing balance as label/value pairs.
            mobileCards
            columns={[
              { label: C.form.table.phaseColumn, nowrap: true },
              { label: C.form.table.rateColumn, numeric: true },
              { label: C.form.table.paymentColumn, numeric: true },
              { label: C.form.table.interestColumn, numeric: true },
              { label: C.form.table.principalColumn, numeric: true },
              { label: C.form.table.balanceColumn, numeric: true },
            ]}
            rows={tableRows}
          />
        ) : null}
      </DetailDisclosure>
      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />

    </CalculatorCard>
  );
}
