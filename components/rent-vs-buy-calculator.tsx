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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { compareRentVsBuy } from "@/lib/calc/rent-vs-buy";
import { RENT_VS_BUY as C } from "@/content/calculators/rent-vs-buy";

export function RentVsBuyCalculator() {
  const fields = useCalcFields({
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    purchaseCosts: C.form.defaultPurchaseCosts,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    ownerCosts: C.form.defaultOwnerCosts,
    growth: C.form.defaultGrowth,
    sellingCost: C.form.defaultSellingCost,
    rent: C.form.defaultRent,
    rentGrowth: C.form.defaultRentGrowth,
    deposit: C.form.defaultDeposit,
    investment: C.form.defaultInvestment,
    horizon: C.form.defaultHorizon,
  });

  const price = parseMoney(fields.values.price);
  const down = parseMoney(fields.values.down);
  const purchaseCosts = parseMoney(fields.values.purchaseCosts);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const ownerCosts = parseMoney(fields.values.ownerCosts);
  const growth = parseDecimal(fields.values.growth);
  const sellingCost = parseDecimal(fields.values.sellingCost);
  const rent = parseMoney(fields.values.rent);
  const rentGrowth = parseDecimal(fields.values.rentGrowth);
  const deposit = parseMoney(fields.values.deposit);
  const investment = parseDecimal(fields.values.investment);
  const horizon = parseDecimal(fields.values.horizon);

  const priceInvalid = price === null || price <= 0;
  const downInvalid =
    down === null || down < 0 || (price !== null && down > price);
  const purchaseCostsInvalid = purchaseCosts === null || purchaseCosts < 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const ownerCostsInvalid = ownerCosts === null || ownerCosts < 0;
  // Growth rates may be negative — a falling market is the case worth
  // checking — but not at or below −100%/năm.
  const growthInvalid = growth === null || growth <= -100;
  const sellingCostInvalid =
    sellingCost === null || sellingCost < 0 || sellingCost > 100;
  const rentInvalid = rent === null || rent < 0;
  const rentGrowthInvalid = rentGrowth === null || rentGrowth <= -100;
  const depositInvalid = deposit === null || deposit < 0;
  const investmentInvalid = investment === null || investment <= -100;
  const horizonInvalid =
    horizon === null || horizon <= 0 || !Number.isInteger(horizon);

  const result =
    priceInvalid ||
    downInvalid ||
    purchaseCostsInvalid ||
    rateInvalid ||
    termInvalid ||
    ownerCostsInvalid ||
    growthInvalid ||
    sellingCostInvalid ||
    rentInvalid ||
    rentGrowthInvalid ||
    depositInvalid ||
    investmentInvalid ||
    horizonInvalid
      ? null
      : compareRentVsBuy({
          price,
          downPayment: down,
          purchaseCosts,
          annualRatePercent: rate,
          termMonths: term,
          monthlyOwnerCosts: ownerCosts,
          priceGrowthPercent: growth,
          sellingCostPercent: sellingCost,
          monthlyRent: rent,
          rentGrowthPercent: rentGrowth,
          rentDeposit: deposit,
          investmentReturnPercent: investment,
          horizonMonths: horizon,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.buyGroup}>
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
          {...fields.bind("ownerCosts")}
          label={C.form.ownerCostsLabel}
          unit={C.form.ownerCostsUnit}
          help={C.form.ownerCostsHelp}
          error={C.form.ownerCostsInvalid}
          invalid={ownerCostsInvalid}
        />
        <NumberField
          {...fields.bind("growth")}
          label={C.form.growthLabel}
          unit={C.form.growthUnit}
          help={C.form.growthHelp}
          error={C.form.growthInvalid}
          invalid={growthInvalid}
        />
        <NumberField
          {...fields.bind("sellingCost")}
          label={C.form.sellingCostLabel}
          unit={C.form.sellingCostUnit}
          help={C.form.sellingCostHelp}
          error={C.form.sellingCostInvalid}
          invalid={sellingCostInvalid}
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
          {...fields.bind("rentGrowth")}
          label={C.form.rentGrowthLabel}
          unit={C.form.rentGrowthUnit}
          help={C.form.rentGrowthHelp}
          error={C.form.rentGrowthInvalid}
          invalid={rentGrowthInvalid}
        />
        <NumberField
          {...fields.bind("deposit")}
          label={C.form.depositLabel}
          unit={C.form.depositUnit}
          help={C.form.depositHelp}
          error={C.form.depositInvalid}
          invalid={depositInvalid}
        />
        <NumberField
          {...fields.bind("investment")}
          label={C.form.investmentLabel}
          unit={C.form.investmentUnit}
          help={C.form.investmentHelp}
          error={C.form.investmentInvalid}
          invalid={investmentInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.horizonGroup} className="mt-8">
        <NumberField
          {...fields.bind("horizon")}
          label={C.form.horizonLabel}
          help={C.form.horizonHelp}
          error={C.form.horizonInvalid}
          invalid={horizonInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.verdictLabel}
          value={
            result === null
              ? null
              : result.buyingWins
                ? C.form.verdictBuy
                : C.form.verdictRent
          }
        />
        <ResultRow
          label={C.form.advantageLabel}
          value={money(
            result === null ? undefined : Math.abs(result.advantageOfBuying),
          )}
        />
        <ResultRow
          label={C.form.breakEvenLabel}
          value={
            result?.breakEvenMonth == null
              ? null
              : `${formatDecimal(result.breakEvenMonth, 0)} ${C.form.monthsUnit}`
          }
        />
      </ResultGroup>

      {/* The two sides, side by side. Not live: the verdict above already
          announces every recomputation, and these are its workings. */}
      <ResultGroup title={C.form.buyTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.buy.totalPaid)}
        />
        <ResultRow
          label={C.form.netWorthLabel}
          value={money(result?.buy.netWorth)}
        />
        <ResultRow
          label={C.form.netCostLabel}
          value={money(result?.buy.netCost)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.rentTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.rent.totalPaid)}
        />
        <ResultRow
          label={C.form.netWorthLabel}
          value={money(result?.rent.netWorth)}
        />
        <ResultRow
          label={C.form.netCostLabel}
          value={money(result?.rent.netCost)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.monthlyPaymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.loanAmountLabel}
          value={money(result?.loanAmount)}
        />
        <ResultRow
          label={C.form.upfrontLabel}
          value={money(result?.buyerUpfront)}
        />
        <ResultRow
          label={C.form.houseValueLabel}
          value={money(result?.houseValue)}
        />
        <ResultRow
          label={C.form.loanBalanceLabel}
          value={money(result?.loanBalance)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.totalPrincipalLabel}
          value={money(result?.totalPrincipal)}
        />
        <ResultRow
          label={C.form.ownerCostsResultLabel}
          value={money(result?.totalOwnerCosts)}
        />
        <ResultRow
          label={C.form.sellingCostResultLabel}
          value={money(result?.sellingCost)}
        />
        <ResultRow
          label={C.form.totalRentLabel}
          value={money(result?.totalRent)}
        />
        <ResultRow
          label={C.form.investmentValueLabel}
          value={money(result?.investmentValue)}
        />
        <ResultRow
          label={C.form.investmentGainLabel}
          value={money(result?.investmentGain)}
        />
      </ResultGroup>

      {result !== null && result.breakEvenMonth === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noBreakEvenNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
