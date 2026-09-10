"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
  buildPhases,
  compareFixedFloating,
} from "@/lib/calc/floating-loan";
import { FIXED_VS_FLOATING as C } from "@/content/calculators/fixed-vs-floating";

export function FixedVsFloatingCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    term: C.form.defaultTerm,
    fixedRate: C.form.defaultFixedRate,
    promoMonths: C.form.defaultPromoMonths,
    promoRate: C.form.defaultPromoRate,
    postRate: C.form.defaultPostRate,
    adjustEvery: C.form.defaultAdjustEvery,
    adjustStep: C.form.defaultAdjustStep,
  });

  const amount = parseMoney(fields.values.amount);
  const term = parseDecimal(fields.values.term);
  const fixedRate = parseDecimal(fields.values.fixedRate);
  const promoMonths = parseDecimal(fields.values.promoMonths);
  const promoRate = parseDecimal(fields.values.promoRate);
  const postRate = parseDecimal(fields.values.postRate);
  const adjustEvery = parseDecimal(fields.values.adjustEvery);
  const adjustStep = parseDecimal(fields.values.adjustStep);

  const amountInvalid = amount === null || amount <= 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const fixedRateInvalid = fixedRate === null || fixedRate < 0;
  const promoMonthsInvalid =
    promoMonths === null ||
    promoMonths < 0 ||
    !Number.isInteger(promoMonths) ||
    (term !== null && promoMonths >= term);
  const promoRateInvalid = promoRate === null || promoRate < 0;
  const postRateInvalid = postRate === null || postRate < 0;
  const adjustEveryInvalid =
    adjustEvery === null || adjustEvery <= 0 || !Number.isInteger(adjustEvery);
  const adjustStepInvalid = adjustStep === null || adjustStep < 0;

  const fieldsUsable =
    !amountInvalid &&
    !termInvalid &&
    !fixedRateInvalid &&
    !promoMonthsInvalid &&
    !promoRateInvalid &&
    !postRateInvalid &&
    !adjustEveryInvalid &&
    !adjustStepInvalid;

  const phases = fieldsUsable
    ? buildPhases({
        termMonths: term,
        promoMonths,
        promoRatePercent: promoRate,
        postRatePercent: postRate,
        adjustEveryMonths: adjustEvery,
        adjustStepPoints: adjustStep,
      })
    : null;

  const result =
    phases === null || amount === null || fixedRate === null
      ? null
      : compareFixedFloating({
          amount,
          phases,
          fixedRatePercent: fixedRate,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
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

      <FieldGroup title={C.form.fixedGroup} className="mt-8">
        <NumberField
          {...fields.bind("fixedRate")}
          label={C.form.fixedRateLabel}
          unit={C.form.fixedRateUnit}
          help={C.form.fixedRateHelp}
          error={C.form.fixedRateInvalid}
          invalid={fixedRateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.floatingGroup} className="mt-8">
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
        <NumberField
          {...fields.bind("postRate")}
          label={C.form.postRateLabel}
          unit={C.form.postRateUnit}
          help={C.form.postRateHelp}
          error={C.form.postRateInvalid}
          invalid={postRateInvalid}
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
          {...fields.bind("adjustStep")}
          label={C.form.adjustStepLabel}
          unit={C.form.adjustStepUnit}
          help={C.form.adjustStepHelp}
          error={C.form.adjustStepInvalid}
          invalid={adjustStepInvalid}
        />
      </FieldGroup>

      {/* The break-even rate comes FIRST, above the verdict. The verdict is
          only true for the scenario the user typed; the break-even rate is
          the transferable number. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.breakEvenLabel}
          value={
            result?.breakEvenFixedRatePercent == null
              ? null
              : formatPercent(result.breakEvenFixedRatePercent, 4)
          }
        />
        <ResultRow
          label={C.form.verdictLabel}
          value={
            result === null
              ? null
              : result.floatingWins
                ? C.form.verdictFloating
                : C.form.verdictFixed
          }
        />
        <ResultRow
          label={C.form.savingLabel}
          value={money(
            result === null ? undefined : Math.abs(result.interestSaving),
          )}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.fixedPaymentLabel}
          value={money(result?.fixedPayment)}
        />
        <ResultRow
          label={C.form.fixedInterestLabel}
          value={money(result?.fixedTotalInterest)}
        />
        <ResultRow
          label={C.form.floatingFirstLabel}
          value={money(result?.floating.firstPayment)}
        />
        <ResultRow
          label={C.form.floatingHighestLabel}
          value={money(result?.floating.highestPayment)}
        />
        <ResultRow
          label={C.form.floatingInterestLabel}
          value={money(result?.floating.totalInterest)}
        />
        <ResultRow
          label={C.form.shockLabel}
          value={money(result?.floating.paymentShock)}
        />
      </ResultGroup>

      {result !== null && result.breakEvenFixedRatePercent === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noBreakEvenNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
