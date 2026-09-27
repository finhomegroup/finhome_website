"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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

/*
 * CSV row 35 ("Hai cột"): "nhấn lợi nhuận ròng sau phí/thuế; đưa phần giải
 * thích thuế dài ra khỏi đường nhập→kết quả". Docs §8.
 *
 * WHERE THE LONG TAX EXPLANATION WENT. Two places, and only one of them is in
 * this file. The page-level notice above the tool kept the rule and moved its
 * two worked examples into `noticeDetail`'s disclosure — that edit is in
 * `content/calculators/stock-return.ts` and the route. Here, the twelve-row
 * breakdown of every fee and tax component moves into the layout's `detail`
 * region: it is the itemisation a reader checks AFTER deciding whether the
 * trade made money, and twelve rows between the form and the answer is the
 * literal input→result path the row is about.
 *
 * `emphasis` goes on "Lãi hoặc lỗ thực" rather than on the percentage beneath
 * it. The percentage is the more comparable figure and the đồng is the one
 * being asked about: the page's whole argument is that the friction is real
 * money on a real trade, and −61.050.000 ₫ makes that case in a way −20,320%
 * does not. The percentage keeps the row directly under it.
 */
const FORM_ID = "loi-nhuan-co-phieu-nhap";
const RESULT_ID = "loi-nhuan-co-phieu-ket-qua";

export function StockReturnCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Shares go through `parseMoney` here, so
  // they group like an amount.
  const fields = useCalcFields(
    {
      shares: C.form.defaultShares,
      buy: C.form.defaultBuy,
      sell: C.form.defaultSell,
      dividend: C.form.defaultDividend,
      years: C.form.defaultYears,
      fee: C.form.defaultFee,
      transferTax: C.form.defaultTransferTax,
      dividendTax: C.form.defaultDividendTax,
    },
    {
      shares: "money",
      buy: "money",
      sell: "money",
      dividend: "money",
      years: "rate",
      fee: "rate",
      transferTax: "rate",
      dividendTax: "rate",
    },
  );

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

  /** One flag for the eight fields, so the CTA and the result agree. */
  const anyInvalid =
    sharesInvalid ||
    buyInvalid ||
    sellInvalid ||
    dividendInvalid ||
    yearsInvalid ||
    feeInvalid ||
    transferTaxInvalid ||
    dividendTaxInvalid;

  const result = anyInvalid
    ? null
    : computeStockReturn({
        shares: shares!,
        buyPricePerShare: buy!,
        sellPricePerShare: sell!,
        dividendPerShare: dividend!,
        years: years!,
        brokerageFeePercent: fee!,
        transferTaxPercent: transferTax!,
        dividendTaxPercent: dividendTax!,
      });

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  /** Formatted once, for the headline row and the pinned restatement. */
  const netProfitValue = money(result?.netProfit);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
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
          </>
        }
        cta={
          /* Sticky: an independent pass measured this form at 1895 px against
             a 303 px answer panel at 1440×1000, and after tabbing from the
             last tax field the answer sat at y −963. Eight boxes is the
             longest form of the split routes here. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={{ label: C.form.netProfitLabel, value: netProfitValue }}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.netProfitLabel}
                value={netProfitValue}
                emphasis
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

            {/* All three notices explain a figure in the group above them, so
                all three stay in the answer's own region. The first sends the
                reader to a comparison whose second row is in `detail`; that
                is the right direction of travel, and the row it names is
                still the headline's own companion. */}
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

            {result?.alreadyBreakEven ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.alreadyBreakEvenNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          /* The itemisation, off the input→result path. Twelve rows of fee
             and tax components answer "where did it go", which is a question
             a reader only has after seeing whether the trade made money. */
          <ResultGroup title={C.form.detailTitle} live={false}>
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
            <ResultRow label={C.form.sellFeeLabel} value={money(result?.sellFee)} />
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
        }
      />
    </CalculatorCard>
  );
}
