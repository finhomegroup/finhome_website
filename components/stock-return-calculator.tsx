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
import { computeStockReturn } from "@/lib/calc/stock-return";
import { STOCK_RETURN as C } from "@/content/calculators/stock-return";

export function StockReturnCalculator() {
  const fields = useCalcFields({
    shares: C.form.defaultShares,
    buy: C.form.defaultBuy,
    sell: C.form.defaultSell,
    dividend: C.form.defaultDividend,
    years: C.form.defaultYears,
    fee: C.form.defaultFee,
    transferTax: C.form.defaultTransferTax,
    dividendTax: C.form.defaultDividendTax,
  });

  const shares = parseMoney(fields.values.shares);
  const buy = parseMoney(fields.values.buy);
  const sell = parseMoney(fields.values.sell);
  const dividend = parseMoney(fields.values.dividend);
  const fee = parseDecimal(fields.values.fee);
  const transferTax = parseDecimal(fields.values.transferTax);
  const dividendTax = parseDecimal(fields.values.dividendTax);

  // Optional: empty means "no annual figure", not an error.
  const yearsRaw = fields.values.years.trim();
  const years = yearsRaw === "" ? 0 : parseDecimal(yearsRaw);

  const sharesInvalid = shares === null || shares <= 0;
  const buyInvalid = buy === null || buy <= 0;
  const sellInvalid = sell === null || sell < 0;
  const dividendInvalid = dividend === null || dividend < 0;
  const yearsInvalid = years === null || years < 0;
  const feeInvalid = fee === null || fee < 0 || fee >= 100;
  const transferTaxInvalid =
    transferTax === null || transferTax < 0 || transferTax >= 100;
  const dividendTaxInvalid =
    dividendTax === null || dividendTax < 0 || dividendTax >= 100;

  const result =
    sharesInvalid ||
    buyInvalid ||
    sellInvalid ||
    dividendInvalid ||
    yearsInvalid ||
    feeInvalid ||
    transferTaxInvalid ||
    dividendTaxInvalid
      ? null
      : computeStockReturn({
          shares,
          buyPricePerShare: buy,
          sellPricePerShare: sell,
          dividendPerShare: dividend,
          years,
          brokerageFeePercent: fee,
          transferTaxPercent: transferTax,
          dividendTaxPercent: dividendTax,
        });

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.tradeGroup}>
        <NumberField
          {...fields.bind("shares")}
          label={C.form.sharesLabel}
          help={C.form.sharesHelp}
          error={C.form.sharesInvalid}
          invalid={sharesInvalid}
        />
        <NumberField
          {...fields.bind("buy")}
          label={C.form.buyLabel}
          unit={C.form.buyUnit}
          help={C.form.buyHelp}
          error={C.form.buyInvalid}
          invalid={buyInvalid}
        />
        <NumberField
          {...fields.bind("sell")}
          label={C.form.sellLabel}
          unit={C.form.sellUnit}
          help={C.form.sellHelp}
          error={C.form.sellInvalid}
          invalid={sellInvalid}
        />
        <NumberField
          {...fields.bind("dividend")}
          label={C.form.dividendLabel}
          unit={C.form.dividendUnit}
          help={C.form.dividendHelp}
          error={C.form.dividendInvalid}
          invalid={dividendInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={C.form.yearsLabel}
          unit={C.form.yearsUnit}
          help={C.form.yearsHelp}
          error={C.form.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.costGroup} className="mt-8">
        <NumberField
          {...fields.bind("fee")}
          label={C.form.feeLabel}
          unit={C.form.feeUnit}
          help={C.form.feeHelp}
          error={C.form.feeInvalid}
          invalid={feeInvalid}
        />
        <NumberField
          {...fields.bind("transferTax")}
          label={C.form.transferTaxLabel}
          unit={C.form.transferTaxUnit}
          help={C.form.transferTaxHelp}
          error={C.form.transferTaxInvalid}
          invalid={transferTaxInvalid}
        />
        <NumberField
          {...fields.bind("dividendTax")}
          label={C.form.dividendTaxLabel}
          unit={C.form.dividendTaxUnit}
          help={C.form.dividendTaxHelp}
          error={C.form.dividendTaxInvalid}
          invalid={dividendTaxInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.netProfitLabel}
          value={money(result?.netProfit)}
        />
        <ResultRow
          label={C.form.returnLabel}
          value={result ? formatPercent(result.returnPercent, 3) : null}
        />
        <ResultRow
          label={C.form.annualisedLabel}
          value={
            result?.annualisedPercent == null
              ? null
              : formatPercent(result.annualisedPercent, 3)
          }
        />
        <ResultRow
          label={C.form.breakEvenLabel}
          value={money(result?.breakEvenPricePerShare)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.grossReturnLabel}
          value={result ? formatPercent(result.grossReturnPercent, 3) : null}
        />
        <ResultRow
          label={C.form.dragLabel}
          value={
            result
              ? `${formatDecimal(result.dragPoints, 3)} ${C.form.pointsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.totalCostLabel}
          value={money(result?.totalCost)}
        />
        <ResultRow
          label={C.form.grossProceedsLabel}
          value={money(result?.grossProceeds)}
        />
        <ResultRow
          label={C.form.sellFeeLabel}
          value={money(result?.sellFee)}
        />
        <ResultRow
          label={C.form.transferTaxResultLabel}
          value={money(result?.transferTax)}
        />
        <ResultRow
          label={C.form.netProceedsLabel}
          value={money(result?.netProceeds)}
        />
        <ResultRow
          label={C.form.grossDividendsLabel}
          value={money(result?.grossDividends)}
        />
        <ResultRow
          label={C.form.dividendTaxResultLabel}
          value={money(result?.dividendTax)}
        />
        <ResultRow
          label={C.form.netDividendsLabel}
          value={money(result?.netDividends)}
        />
        <ResultRow
          label={C.form.totalFeesLabel}
          value={money(result?.totalFees)}
        />
        <ResultRow
          label={C.form.totalTaxesLabel}
          value={money(result?.totalTaxes)}
        />
      </ResultGroup>

      {result?.taxedOnALoss ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.taxedOnLossNotice}
        </p>
      ) : null}

      {result !== null && result.breakEvenPricePerShare === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noBreakEvenNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
