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
import { payFixed, paymentForMonths } from "@/lib/calc/card-debt";
import { CARD_PAYOFF as C } from "@/content/calculators/card-payoff";

export function CardPayoffCalculator() {
  const fields = useCalcFields({
    mode: "months",
    balance: C.form.defaultBalance,
    rate: C.form.defaultRate,
    payment: C.form.defaultPayment,
    months: C.form.defaultMonths,
  });

  const byMonths = fields.values.mode === "months";

  const balance = parseMoney(fields.values.balance);
  const rate = parseDecimal(fields.values.rate);
  const payment = parseMoney(fields.values.payment);
  const months = parseDecimal(fields.values.months);

  const balanceInvalid = balance === null || balance <= 0;
  const rateInvalid = rate === null || rate < 0;
  const paymentInvalid = byMonths && (payment === null || payment < 0);
  const monthsInvalid =
    !byMonths && (months === null || months <= 0 || !Number.isInteger(months));

  const fieldsUsable =
    !balanceInvalid && !rateInvalid && !paymentInvalid && !monthsInvalid;

  // Both modes end up running the same simulation: the second one solves for
  // the payment first, then simulates it, so the two agree on every figure.
  const solvedPayment = !fieldsUsable
    ? null
    : byMonths
      ? payment
      : paymentForMonths({
          balance,
          annualRatePercent: rate,
          months: months!,
        });

  const result =
    !fieldsUsable || solvedPayment === null
      ? null
      : payFixed({
          balance,
          annualRatePercent: rate,
          monthlyPayment: solvedPayment,
        });

  // Every field is valid, but the payment cannot cover the first month's
  // interest — the debt genuinely never clears.
  const noPayoff = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "months", label: C.form.modeMonths },
            { value: "payment", label: C.form.modePayment },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.group} className="mt-8">
        <NumberField
          {...fields.bind("balance")}
          label={C.form.balanceLabel}
          unit={C.form.balanceUnit}
          help={C.form.balanceHelp}
          error={C.form.balanceInvalid}
          invalid={balanceInvalid}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        {/* Only the input the active mode needs: the other is the answer. */}
        {byMonths ? (
          <NumberField
            {...fields.bind("payment")}
            label={C.form.paymentLabel}
            unit={C.form.paymentUnit}
            help={C.form.paymentHelp}
            error={C.form.paymentInvalid}
            invalid={paymentInvalid}
          />
        ) : (
          <NumberField
            {...fields.bind("months")}
            label={C.form.monthsLabel}
            help={C.form.monthsHelp}
            error={C.form.monthsInvalid}
            invalid={monthsInvalid}
          />
        )}
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {byMonths ? (
          <ResultRow
            label={C.form.monthsResultLabel}
            value={
              result
                ? `${formatDecimal(result.months, 0)} ${C.form.monthsUnit}`
                : null
            }
          />
        ) : (
          <ResultRow
            label={C.form.paymentResultLabel}
            value={money(solvedPayment ?? undefined)}
          />
        )}
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.interestShareLabel}
          value={result ? formatPercent(result.interestSharePercent, 1) : null}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
        <ResultRow
          label={C.form.firstInterestLabel}
          value={money(result?.schedule[0].interest)}
        />
        <ResultRow
          label={C.form.lastPaymentLabel}
          value={money(result?.lastPayment)}
        />
      </ResultGroup>

      {noPayoff ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noPayoffNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
