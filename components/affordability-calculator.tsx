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
import { computeAffordability } from "@/lib/calc/affordability";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";

export function AffordabilityCalculator() {
  const fields = useCalcFields({
    income: C.form.defaultIncome,
    debts: C.form.defaultDebts,
    down: C.form.defaultDown,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    housingCosts: C.form.defaultHousingCosts,
    housingRatio: C.form.defaultHousingRatio,
    totalRatio: C.form.defaultTotalRatio,
  });

  const income = parseMoney(fields.values.income);
  const debts = parseMoney(fields.values.debts);
  const down = parseMoney(fields.values.down);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const housingCosts = parseMoney(fields.values.housingCosts);
  const housingRatio = parseDecimal(fields.values.housingRatio);
  const totalRatio = parseDecimal(fields.values.totalRatio);

  const incomeInvalid = income === null || income <= 0;
  const debtsInvalid = debts === null || debts < 0;
  const downInvalid = down === null || down < 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const housingCostsInvalid = housingCosts === null || housingCosts < 0;
  const housingRatioInvalid =
    housingRatio === null || housingRatio < 0 || housingRatio > 100;
  const totalRatioInvalid =
    totalRatio === null || totalRatio < 0 || totalRatio > 100;

  const result =
    incomeInvalid ||
    debtsInvalid ||
    downInvalid ||
    rateInvalid ||
    termInvalid ||
    housingCostsInvalid ||
    housingRatioInvalid ||
    totalRatioInvalid
      ? null
      : computeAffordability({
          monthlyIncome: income,
          monthlyDebts: debts,
          downPayment: down,
          annualRatePercent: rate,
          termMonths: term,
          monthlyHousingCosts: housingCosts,
          housingRatioPercent: housingRatio,
          totalDebtRatioPercent: totalRatio,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.incomeGroup}>
        <NumberField
          {...fields.bind("income")}
          label={C.form.incomeLabel}
          unit={C.form.incomeUnit}
          help={C.form.incomeHelp}
          error={C.form.incomeInvalid}
          invalid={incomeInvalid}
        />
        <NumberField
          {...fields.bind("debts")}
          label={C.form.debtsLabel}
          unit={C.form.debtsUnit}
          help={C.form.debtsHelp}
          error={C.form.debtsInvalid}
          invalid={debtsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.purchaseGroup} className="mt-8">
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={downInvalid}
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
        <NumberField
          {...fields.bind("housingCosts")}
          label={C.form.housingCostsLabel}
          unit={C.form.housingCostsUnit}
          help={C.form.housingCostsHelp}
          error={C.form.housingCostsInvalid}
          invalid={housingCostsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.ratioGroup} className="mt-8">
        <NumberField
          {...fields.bind("housingRatio")}
          label={C.form.housingRatioLabel}
          unit={C.form.housingRatioUnit}
          help={C.form.housingRatioHelp}
          error={C.form.housingRatioInvalid}
          invalid={housingRatioInvalid}
        />
        <NumberField
          {...fields.bind("totalRatio")}
          label={C.form.totalRatioLabel}
          unit={C.form.totalRatioUnit}
          help={C.form.totalRatioHelp}
          error={C.form.totalRatioInvalid}
          invalid={totalRatioInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.maxPriceLabel} value={money(result?.maxPrice)} />
        <ResultRow label={C.form.maxLoanLabel} value={money(result?.maxLoan)} />
        <ResultRow
          label={C.form.paymentLabel}
          value={money(result?.affordablePrincipalInterest)}
        />
      </ResultGroup>

      {/* Which limit bound is the diagnostic a rejected borrower needs, but
          it is a second view of the same computation — not live. */}
      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.bindingLabel}
          value={
            result === null
              ? null
              : result.bindingLimit === "housing"
                ? C.form.bindingHousing
                : C.form.bindingTotal
          }
        />
        <ResultRow
          label={C.form.housingLimitLabel}
          value={money(result?.housingLimit)}
        />
        <ResultRow
          label={C.form.totalLimitLabel}
          value={money(result?.totalDebtLimit)}
        />
        <ResultRow
          label={C.form.budgetLabel}
          value={money(result?.affordableHousingPayment)}
        />
        <ResultRow
          label={C.form.downPercentLabel}
          value={
            result?.downPaymentPercent == null
              ? null
              : formatPercent(result.downPaymentPercent, 1)
          }
        />
      </ResultGroup>

      {result?.noRoom ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noRoomNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
