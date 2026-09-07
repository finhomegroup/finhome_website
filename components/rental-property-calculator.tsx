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
import { computeRentalProperty } from "@/lib/calc/rental-property";
import { RENTAL_PROPERTY as C } from "@/content/calculators/rental-property";

export function RentalPropertyCalculator() {
  const fields = useCalcFields({
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    purchaseCosts: C.form.defaultPurchaseCosts,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    rent: C.form.defaultRent,
    vacancy: C.form.defaultVacancy,
    expenses: C.form.defaultExpenses,
    taxRate: C.form.defaultTaxRate,
    threshold: C.form.defaultThreshold,
  });

  const price = parseMoney(fields.values.price);
  const down = parseMoney(fields.values.down);
  const purchaseCosts = parseMoney(fields.values.purchaseCosts);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const rent = parseMoney(fields.values.rent);
  const vacancy = parseDecimal(fields.values.vacancy);
  const expenses = parseMoney(fields.values.expenses);
  const taxRate = parseDecimal(fields.values.taxRate);
  const threshold = parseMoney(fields.values.threshold);

  const priceInvalid = price === null || price <= 0;
  const downInvalid =
    down === null || down < 0 || (price !== null && down > price);
  const purchaseCostsInvalid = purchaseCosts === null || purchaseCosts < 0;
  const rateInvalid = rate === null || rate < 0;
  const rentInvalid = rent === null || rent < 0;
  const vacancyInvalid = vacancy === null || vacancy < 0 || vacancy > 100;
  const expensesInvalid = expenses === null || expenses < 0;
  const taxRateInvalid = taxRate === null || taxRate < 0 || taxRate > 100;
  const thresholdInvalid = threshold === null || threshold < 0;

  // A cash purchase needs no term, so the term is only required when there
  // is something to borrow.
  const borrowing = !priceInvalid && !downInvalid && price > down;
  const termInvalid =
    borrowing && (term === null || term <= 0 || !Number.isInteger(term));

  const result =
    priceInvalid ||
    downInvalid ||
    purchaseCostsInvalid ||
    rateInvalid ||
    termInvalid ||
    rentInvalid ||
    vacancyInvalid ||
    expensesInvalid ||
    taxRateInvalid ||
    thresholdInvalid
      ? null
      : computeRentalProperty({
          price,
          downPayment: down,
          purchaseCosts,
          annualRatePercent: rate,
          termMonths: term ?? 0,
          monthlyRent: rent,
          vacancyPercent: vacancy,
          monthlyExpenses: expenses,
          rentalTaxPercent: taxRate,
          taxThresholdPerYear: threshold,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.purchaseGroup}>
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
          {...fields.bind("purchaseCosts")}
          label={C.form.purchaseCostsLabel}
          unit={C.form.purchaseCostsUnit}
          help={C.form.purchaseCostsHelp}
          error={C.form.purchaseCostsInvalid}
          invalid={purchaseCostsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.loanGroup} className="mt-8">
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

      <FieldGroup title={C.form.rentGroup} className="mt-8">
        <NumberField
          {...fields.bind("rent")}
          label={C.form.rentLabel}
          unit={C.form.rentUnit}
          help={C.form.rentHelp}
          error={C.form.rentInvalid}
          invalid={rentInvalid}
        />
        <NumberField
          {...fields.bind("vacancy")}
          label={C.form.vacancyLabel}
          unit={C.form.vacancyUnit}
          help={C.form.vacancyHelp}
          error={C.form.vacancyInvalid}
          invalid={vacancyInvalid}
        />
        <NumberField
          {...fields.bind("expenses")}
          label={C.form.expensesLabel}
          unit={C.form.expensesUnit}
          help={C.form.expensesHelp}
          error={C.form.expensesInvalid}
          invalid={expensesInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.taxGroup} className="mt-8">
        <NumberField
          {...fields.bind("taxRate")}
          label={C.form.taxRateLabel}
          unit={C.form.taxRateUnit}
          help={C.form.taxRateHelp}
          error={C.form.taxRateInvalid}
          invalid={taxRateInvalid}
        />
        <NumberField
          {...fields.bind("threshold")}
          label={C.form.thresholdLabel}
          unit={C.form.thresholdUnit}
          help={C.form.thresholdHelp}
          error={C.form.thresholdInvalid}
          invalid={thresholdInvalid}
        />
      </FieldGroup>

      {/* The owner's own position, live. The four yields and the year's
          income statement are further views of the same figures. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.cashFlowMonthLabel}
          value={money(result?.cashFlowPerMonth)}
        />
        <ResultRow
          label={C.form.cashFlowYearLabel}
          value={money(result?.cashFlowPerYear)}
        />
        <ResultRow
          label={C.form.cashOnCashLabel}
          value={
            result?.cashOnCashPercent == null
              ? null
              : formatPercent(result.cashOnCashPercent)
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.yieldTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.grossYieldLabel}
          value={result ? formatPercent(result.grossYieldPercent) : null}
        />
        <ResultRow
          label={C.form.capRateLabel}
          value={result ? formatPercent(result.capRatePercent) : null}
        />
        <ResultRow
          label={C.form.cashOnCashRepeatLabel}
          value={
            result?.cashOnCashPercent == null
              ? null
              : formatPercent(result.cashOnCashPercent)
          }
        />
        <ResultRow
          label={C.form.dscrLabel}
          value={result?.dscr == null ? null : formatDecimal(result.dscr)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.grossRentLabel}
          value={money(result?.grossRentPerYear)}
        />
        <ResultRow
          label={C.form.vacancyLossLabel}
          value={money(result?.vacancyLossPerYear)}
        />
        <ResultRow
          label={C.form.effectiveRentLabel}
          value={money(result?.effectiveRentPerYear)}
        />
        <ResultRow
          label={C.form.taxLabel}
          value={money(result?.rentalTaxPerYear)}
        />
        <ResultRow
          label={C.form.taxableLabel}
          value={
            result === null ? null : result.taxable ? C.form.yes : C.form.no
          }
        />
        <ResultRow
          label={C.form.expensesResultLabel}
          value={money(result?.expensesPerYear)}
        />
        <ResultRow label={C.form.noiLabel} value={money(result?.netOperatingIncomePerYear)} />
        <ResultRow
          label={C.form.debtServiceLabel}
          value={money(result?.debtServicePerYear)}
        />
        <ResultRow
          label={C.form.monthlyPaymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.loanAmountLabel}
          value={money(result?.loanAmount)}
        />
        <ResultRow
          label={C.form.cashInvestedLabel}
          value={money(result?.cashInvested)}
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
