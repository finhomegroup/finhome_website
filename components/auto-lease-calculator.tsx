"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { ResultCta } from "@/components/calc/result-cta";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeAutoLease } from "@/lib/calc/auto-lease";
import { AUTO_LEASE as C } from "@/content/calculators/auto-lease";

const FORM_ID = "thue-mua-xe-nhap";
const RESULT_ID = "thue-mua-xe-ket-qua";

/**
 * ROW 34 — "Đưa khoản trả hàng tháng lên trước đoạn thuế dài; giữ cảnh báo
 * loại thuế áp dụng nhưng mở thêm chi tiết."
 *
 * The long passage is the tax field's own `taxHelp`: about 1.100 characters of
 * VAT law, open, inside the form, and therefore between the last input and the
 * monthly payment. Two changes, not one:
 *
 * - The field now carries `taxHelpShort`, which keeps the warning that decides
 *   what the reader types — which contract they have, and so which rate — and
 *   the full passage is rendered VERBATIM in a `DetailDisclosure` directly
 *   under the same field. Nothing is deleted or paraphrased away.
 * - `CalculatorLayout columns="split"` puts the payment beside the form from
 *   `lg` up, and the collapsed passage keeps it near the inputs on a phone,
 *   where DOM order is the reading order.
 *
 * AND THE REFUSAL NO LONGER LIES. `computeAutoLease` returns null on two
 * conditions this form cannot rule out — a residual above the capitalised cost
 * AND a capitalised cost that is not positive — and both were reported as
 * "giá trị còn lại đang lớn hơn số tiền vốn hóa". The second case is a
 * trả-trước problem with a perfectly sensible residual, so it gets its own
 * notice and the residual keeps its own.
 */
export function AutoLeaseCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. The term is a month count and formats
  // nothing.
  const fields = useCalcFields(
    {
      price: C.form.defaultPrice,
      down: C.form.defaultDown,
      tradeIn: C.form.defaultTradeIn,
      fees: C.form.defaultFees,
      residual: C.form.defaultResidual,
      term: C.form.defaultTerm,
      rate: C.form.defaultRate,
      tax: C.form.defaultTax,
    },
    {
      price: "money",
      down: "money",
      tradeIn: "money",
      fees: "money",
      residual: "money",
      rate: "rate",
      tax: "rate",
    },
  );

  const price = parseMoney(fields.values.price);
  const down = parseMoney(fields.values.down);
  const tradeIn = parseMoney(fields.values.tradeIn);
  const fees = parseMoney(fields.values.fees);
  const residual = parseMoney(fields.values.residual);
  // A whole count of months, so `parseCount` — docs §4. This was
  // `parseDecimal` with the `Number.isInteger` guard below it, which is the
  // arrangement `parseCount`'s docstring calls unreachable: `parseDecimal`
  // reads a grouped "1.000" as 1, and 1 IS an integer, so the guard passed
  // and the page priced a one-month lease with no field marked invalid.
  const term = parseCount(fields.values.term);
  const rate = parseDecimal(fields.values.rate);
  const tax = parseDecimal(fields.values.tax);

  const priceInvalid = price === null || price <= 0;
  const downInvalid = down === null || down < 0;
  const tradeInInvalid = tradeIn === null || tradeIn < 0;
  const feesInvalid = fees === null || fees < 0;
  const residualInvalid = residual === null || residual < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const rateInvalid = rate === null || rate < 0;
  // Bounded above as well as below, the way `business-forecast-calculator.tsx`
  // bounds its own tax field. Without the ceiling a typed 800 was a valid
  // "thuế suất" and the page priced a rental at nine times the rent with no
  // field marked invalid — and the field's own error text promises a range.
  const taxInvalid = tax === null || tax < 0 || tax > 100;

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

  // The two refusals `computeAutoLease` can still reach once every field is
  // valid on its own. The engine's order is the one to mirror: it rejects a
  // nonpositive capitalised cost BEFORE it looks at the residual, so that
  // branch is asked first here too and the residual notice keeps only the case
  // it names — a vehicle that would have to appreciate.
  const capitalised =
    fieldsUsable && price !== null && down !== null && tradeIn !== null && fees !== null
      ? price - down - tradeIn + fees
      : null;
  const capitalisedNotPositive =
    fieldsUsable && result === null && capitalised !== null && capitalised <= 0;
  const residualTooHigh =
    fieldsUsable && result === null && !capitalisedNotPositive;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
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
              {/* ROW 34: the short warning stays ON the field — which contract
                  you have decides the rate you type — and the long passage is
                  the disclosure immediately under it, verbatim. */}
              <NumberField
                {...fields.bind("tax")}
                label={C.form.taxLabel}
                unit={C.form.taxUnit}
                help={C.form.taxHelpShort}
                error={C.form.taxInvalid}
                invalid={taxInvalid}
              />
            </FieldGroup>

            <DetailDisclosure
              title={C.form.taxDetailTitle}
              className="mt-4"
            >
              <p className="text-sm leading-relaxed text-ink-2">
                {C.form.taxHelp}
              </p>
            </DetailDisclosure>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={!fieldsUsable}
            // Eight inputs plus the tax disclosure: the last field is well
            // below the payment on a desktop screen, so the pinned block keeps
            // the ONE figure in view — the same formatted string the announced
            // row renders, and nothing else from the result column.
            sticky
            answer={{
              label: C.form.monthlyLabel,
              value: money(result?.monthlyPayment),
            }}
          />
        }
        primary={
          <>
            {/* The payment and the two halves it is made of — the split is the
                whole point of the lease formula, so it belongs in the live
                group, with the payment itself as the announced answer. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.monthlyLabel}
                value={money(result?.monthlyPayment)}
                emphasis
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

            {/* Both refusals sit where the missing answer is, not in the
                detail band: the reader is looking at the placeholder. */}
            {capitalisedNotPositive ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.capitalisedNotPositiveNotice}
              </p>
            ) : null}
            {residualTooHigh ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.residualTooHighNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          <ResultGroup title={C.form.detailTitle} live={false}>
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
        }
      />
    </CalculatorCard>
  );
}
