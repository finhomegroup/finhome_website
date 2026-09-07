"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  buildPhases,
  computeFloatingLoan,
} from "@/lib/calc/floating-loan";
import { FLOATING_LOAN as C } from "@/content/calculators/floating-loan";

export function FloatingLoanCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    term: C.form.defaultTerm,
    promoMonths: C.form.defaultPromoMonths,
    promoRate: C.form.defaultPromoRate,
    postRate: C.form.defaultPostRate,
    adjustEvery: C.form.defaultAdjustEvery,
    adjustStep: C.form.defaultAdjustStep,
    rateCap: C.form.defaultRateCap,
  });

  const amount = parseMoney(fields.values.amount);
  const term = parseDecimal(fields.values.term);
  const promoMonths = parseDecimal(fields.values.promoMonths);
  const promoRate = parseDecimal(fields.values.promoRate);
  const postRate = parseDecimal(fields.values.postRate);
  const adjustEvery = parseDecimal(fields.values.adjustEvery);
  const adjustStep = parseDecimal(fields.values.adjustStep);

  // Optional: most Vietnamese contracts have no cap, so empty is the norm.
  const rateCapRaw = fields.values.rateCap.trim();
  const rateCap = rateCapRaw === "" ? null : parseDecimal(rateCapRaw);

  const amountInvalid = amount === null || amount <= 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
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
  const rateCapInvalid =
    rateCapRaw !== "" && (rateCap === null || rateCap < 0);

  const fieldsUsable =
    !amountInvalid &&
    !termInvalid &&
    !promoMonthsInvalid &&
    !promoRateInvalid &&
    !postRateInvalid &&
    !adjustEveryInvalid &&
    !adjustStepInvalid &&
    !rateCapInvalid;

  // Two steps, both tested in the module: build the phase list from the
  // inputs a borrower has, then amortize through it.
  const phases = fieldsUsable
    ? buildPhases({
        termMonths: term,
        promoMonths,
        promoRatePercent: promoRate,
        postRatePercent: postRate,
        adjustEveryMonths: adjustEvery,
        adjustStepPoints: adjustStep,
        rateCapPercent: rateCap ?? undefined,
      })
    : null;

  const result =
    phases === null || amount === null
      ? null
      : computeFloatingLoan({ amount, phases });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const tableRows =
    result?.phases.map((phase) => [
      `${formatDecimal(phase.fromMonth, 0)}–${formatDecimal(phase.toMonth, 0)}`,
      formatPercent(phase.annualRatePercent, 2),
      formatMoney(phase.payment),
      formatMoney(phase.interest),
      formatMoney(phase.principal),
      formatMoney(phase.balance),
    ]) ?? [];

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
        <NumberField
          {...fields.bind("rateCap")}
          label={C.form.rateCapLabel}
          unit={C.form.rateCapUnit}
          help={C.form.rateCapHelp}
          error={C.form.rateCapInvalid}
          invalid={rateCapInvalid}
        />
      </FieldGroup>

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

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
        <ResultRow
          label={C.form.lowestPaymentLabel}
          value={money(result?.lowestPayment)}
        />
        <ResultRow
          label={C.form.monthsLabel}
          value={
            result
              ? `${formatDecimal(result.months, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.phaseColumn },
            { label: C.form.table.rateColumn, numeric: true },
            { label: C.form.table.paymentColumn, numeric: true },
            { label: C.form.table.interestColumn, numeric: true },
            { label: C.form.table.principalColumn, numeric: true },
            { label: C.form.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
