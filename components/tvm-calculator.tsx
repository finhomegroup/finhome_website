"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
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
import { solveTvm, type TvmSolveFor } from "@/lib/calc/tvm";
import { TVM as C } from "@/content/calculators/tvm";

/** Which field each mode solves for — that field is hidden, not disabled. */
const SOLVE_OPTIONS = [
  { value: "payment", label: C.form.solvePayment },
  { value: "presentValue", label: C.form.solvePresent },
  { value: "futureValue", label: C.form.solveFuture },
  { value: "periods", label: C.form.solvePeriods },
  { value: "rate", label: C.form.solveRate },
] as const;

export function TvmCalculator() {
  const fields = useCalcFields({
    solveFor: C.form.defaultSolveFor,
    present: C.form.defaultPresent,
    future: C.form.defaultFuture,
    payment: C.form.defaultPayment,
    periods: C.form.defaultPeriods,
    rate: C.form.defaultRate,
    timing: C.form.defaultTiming,
  });

  const solveFor = fields.values.solveFor as TvmSolveFor;

  // Money fields here take a leading minus: the sign IS the input, and
  // `parseMoney` handles it.
  const present = parseMoney(fields.values.present);
  const future = parseMoney(fields.values.future);
  const payment = parseMoney(fields.values.payment);
  const periods = parseDecimal(fields.values.periods);
  const rate = parseDecimal(fields.values.rate);

  // Only the fields the mode needs are validated; the solved one is absent.
  const presentInvalid = solveFor !== "presentValue" && present === null;
  const futureInvalid = solveFor !== "futureValue" && future === null;
  const paymentInvalid = solveFor !== "payment" && payment === null;
  const periodsInvalid =
    solveFor !== "periods" && (periods === null || periods <= 0);
  const rateInvalid = solveFor !== "rate" && (rate === null || rate <= -100);

  const fieldsUsable =
    !presentInvalid &&
    !futureInvalid &&
    !paymentInvalid &&
    !periodsInvalid &&
    !rateInvalid;

  const result = fieldsUsable
    ? solveTvm({
        solveFor,
        presentValue:
          solveFor === "presentValue" ? undefined : (present ?? undefined),
        futureValue:
          solveFor === "futureValue" ? undefined : (future ?? undefined),
        payment: solveFor === "payment" ? undefined : (payment ?? undefined),
        periods: solveFor === "periods" ? undefined : (periods ?? undefined),
        ratePercentPerPeriod:
          solveFor === "rate" ? undefined : (rate ?? undefined),
        paymentAtBeginning: fields.values.timing === "beginning",
      })
    : null;

  // Every field parses but the cash flows have no solution — usually a sign
  // problem, which the notice names first.
  const noSolution = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** The one row that answers the question the user asked. */
  const solvedValue = () => {
    if (result === null) return null;
    switch (result.solvedFor) {
      case "presentValue":
        return money(result.presentValue);
      case "futureValue":
        return money(result.futureValue);
      case "payment":
        return money(result.payment);
      case "periods":
        return formatDecimal(result.periods, 4);
      case "rate":
        return formatPercent(result.ratePercentPerPeriod, 6);
    }
  };

  const solvedLabel =
    SOLVE_OPTIONS.find((option) => option.value === solveFor)?.label ?? "";

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("solveFor")}
          legend={C.form.solveLegend}
          help={C.form.solveHelp}
          options={SOLVE_OPTIONS.map((option) => ({ ...option }))}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        {solveFor !== "presentValue" ? (
          <NumberField
            {...fields.bind("present")}
            label={C.form.presentLabel}
            unit={C.form.presentUnit}
            help={C.form.presentHelp}
            error={C.form.presentInvalid}
            invalid={presentInvalid}
          />
        ) : null}
        {solveFor !== "futureValue" ? (
          <NumberField
            {...fields.bind("future")}
            label={C.form.futureLabel}
            unit={C.form.futureUnit}
            help={C.form.futureHelp}
            error={C.form.futureInvalid}
            invalid={futureInvalid}
          />
        ) : null}
        {solveFor !== "payment" ? (
          <NumberField
            {...fields.bind("payment")}
            label={C.form.paymentLabel}
            unit={C.form.paymentUnit}
            help={C.form.paymentHelp}
            error={C.form.paymentInvalid}
            invalid={paymentInvalid}
          />
        ) : null}
        {solveFor !== "periods" ? (
          <NumberField
            {...fields.bind("periods")}
            label={C.form.periodsLabel}
            help={C.form.periodsHelp}
            error={C.form.periodsInvalid}
            invalid={periodsInvalid}
          />
        ) : null}
        {solveFor !== "rate" ? (
          <NumberField
            {...fields.bind("rate")}
            label={C.form.rateLabel}
            unit={C.form.rateUnit}
            help={C.form.rateHelp}
            error={C.form.rateInvalid}
            invalid={rateInvalid}
          />
        ) : null}
        <RadioGroupField
          {...fields.bind("timing")}
          legend={C.form.timingLegend}
          help={C.form.timingHelp}
          options={[
            { value: "end", label: C.form.timingEnd },
            { value: "beginning", label: C.form.timingBeginning },
          ]}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={solvedLabel} value={solvedValue()} />
        <ResultRow
          label={C.form.netInterestLabel}
          value={money(result?.netInterest)}
        />
        <ResultRow
          label={C.form.totalPaymentsLabel}
          value={money(result?.totalPayments)}
        />
      </ResultGroup>

      {/* All five, so the user can check the sign of what they entered
          against what the solver used. */}
      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.presentResultLabel}
          value={money(result?.presentValue)}
        />
        <ResultRow
          label={C.form.futureResultLabel}
          value={money(result?.futureValue)}
        />
        <ResultRow
          label={C.form.paymentResultLabel}
          value={money(result?.payment)}
        />
        <ResultRow
          label={C.form.periodsResultLabel}
          value={result ? formatDecimal(result.periods, 4) : null}
        />
        <ResultRow
          label={C.form.rateResultLabel}
          value={
            result ? formatPercent(result.ratePercentPerPeriod, 6) : null
          }
        />
        <ResultRow
          label={C.form.annualRateLabel}
          value={
            result
              ? formatPercent(result.annualRateIfMonthlyPercent, 4)
              : null
          }
        />
        <ResultRow
          label={C.form.timingResultLabel}
          value={
            result === null
              ? null
              : result.paymentAtBeginning
                ? C.form.timingBeginning
                : C.form.timingEnd
          }
        />
      </ResultGroup>

      {noSolution ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noSolutionNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
