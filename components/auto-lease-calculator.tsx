"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
import { computeAutoLease } from "@/lib/calc/auto-lease";
import { AUTO_LEASE as C } from "@/content/calculators/auto-lease";

export function AutoLeaseCalculator() {
  const fields = useCalcFields({
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    tradeIn: C.form.defaultTradeIn,
    fees: C.form.defaultFees,
    residual: C.form.defaultResidual,
    term: C.form.defaultTerm,
    rate: C.form.defaultRate,
    tax: C.form.defaultTax,
  });

  const price = parseMoney(fields.values.price);
  const down = parseMoney(fields.values.down);
  const tradeIn = parseMoney(fields.values.tradeIn);
  const fees = parseMoney(fields.values.fees);
  const residual = parseMoney(fields.values.residual);
  const term = parseDecimal(fields.values.term);
  const rate = parseDecimal(fields.values.rate);
  const tax = parseDecimal(fields.values.tax);

  const priceInvalid = price === null || price <= 0;
  const downInvalid = down === null || down < 0;
  const tradeInInvalid = tradeIn === null || tradeIn < 0;
  const feesInvalid = fees === null || fees < 0;
  const residualInvalid = residual === null || residual < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const rateInvalid = rate === null || rate < 0;
  const taxInvalid = tax === null || tax < 0;

  const fieldsUsable =
    !priceInvalid &&
    !downInvalid &&
    !tradeInInvalid &&
    !feesInvalid &&
    !residualInvalid &&
    !termInvalid &&
    !rateInvalid &&
    !taxInvalid;

  const result = fieldsUsable
    ? computeAutoLease({
        price,
        downPayment: down,
        tradeIn,
        capitalisedFees: fees,
        residualValue: residual,
        termMonths: term,
        annualRatePercent: rate,
        taxPercent: tax,
      })
    : null;

  // Every field is valid on its own, but the residual exceeds what is being
  // capitalised — the vehicle would have to appreciate.
  const residualTooHigh = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.vehicleGroup}>
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={downInvalid}
        />
        <NumberField
          {...fields.bind("tradeIn")}
          label={C.form.tradeInLabel}
          unit={C.form.tradeInUnit}
          help={C.form.tradeInHelp}
          error={C.form.tradeInInvalid}
          invalid={tradeInInvalid}
        />
        <NumberField
          {...fields.bind("fees")}
          label={C.form.feesLabel}
          unit={C.form.feesUnit}
          help={C.form.feesHelp}
          error={C.form.feesInvalid}
          invalid={feesInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.leaseGroup} className="mt-8">
        <NumberField
          {...fields.bind("residual")}
          label={C.form.residualLabel}
          unit={C.form.residualUnit}
          help={C.form.residualHelp}
          error={C.form.residualInvalid}
          invalid={residualInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
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
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.taxInvalid}
          invalid={taxInvalid}
        />
      </FieldGroup>

      {/* The payment and the two halves it is made of — the split is the
          whole point of the lease formula, so it belongs in the live group. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.depreciationLabel}
          value={money(result?.depreciationCharge)}
        />
        <ResultRow
          label={C.form.financeLabel}
          value={money(result?.financeCharge)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.beforeTaxLabel}
          value={money(result?.monthlyPaymentBeforeTax)}
        />
        <ResultRow
          label={C.form.taxResultLabel}
          value={money(result?.monthlyTax)}
        />
        <ResultRow
          label={C.form.capitalisedLabel}
          value={money(result?.capitalisedCost)}
        />
        <ResultRow
          label={C.form.moneyFactorLabel}
          value={result ? formatDecimal(result.moneyFactor, 5) : null}
        />
        <ResultRow
          label={C.form.residualPercentLabel}
          value={result ? formatPercent(result.residualPercent, 1) : null}
        />
        <ResultRow
          label={C.form.totalDepreciationLabel}
          value={money(result?.totalDepreciation)}
        />
        <ResultRow
          label={C.form.totalFinanceLabel}
          value={money(result?.totalFinanceCharge)}
        />
        <ResultRow
          label={C.form.totalPaymentsLabel}
          value={money(result?.totalOfPayments)}
        />
        <ResultRow
          label={C.form.totalCostLabel}
          value={money(result?.totalCost)}
        />
      </ResultGroup>

      {residualTooHigh ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.residualTooHighNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
