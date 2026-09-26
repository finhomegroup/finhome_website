"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  PLACEHOLDER,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { adjustPrice } from "@/lib/calc/price-adjust";
import { moneyCell } from "@/lib/calc/table-cell";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";

const FORM_ID = "giam-gia-va-thue-nhap";
const RESULT_ID = "giam-gia-va-thue-ket-qua";

/**
 * ROW 62: "Chia Giá / Giảm / Thuế; ưu tiên số cuối phải trả, chi tiết từng
 * bước mở thêm."
 *
 * Three groups, not two. The tax pair used to sit under "Giá và thuế", so the
 * question that changes the answer by the whole tax rate — "giá niêm yết đã
 * gồm thuế chưa?" — was the third control in a group named after the price.
 *
 * ONE OF THE SEVEN RESULT ROWS IS THE ANSWER. "Giá cuối phải trả" now leads
 * and is emphasised, "Tiết kiệm được" and its percentage stay with it because
 * they are the two figures a shopper compares offers on, and the remaining
 * four — tổng mức giảm, giá trước thuế, tiền thuế, giá nếu không giảm — are
 * components of that answer rather than answers, so they move into `detail`
 * with the combined-percentage lesson and the step ledger.
 *
 * THE "TOO MUCH" EXPLANATION STAYS BESIDE THE ANSWER. Every field is valid on
 * its own when a voucher exceeds the discounted price; the result is withheld
 * for a reason that belongs to the COMBINATION, so it cannot be attached to a
 * field and must not be pushed below the detail tables.
 *
 * MEASURED REPAIR on export 2026-09-22T20:56:03Z, at 1440×1000: the split
 * columns were 261,59 px and 408,41 px inside a 702 px shell because the route
 * used `columns="split"` WITHOUT `CalculatorPage wide`, and the open tax
 * passage made the form column 2386,25 px tall. Focusing the last tax field
 * (528,75–574,75) left the result region entirely above the viewport (-321,5
 * to -75,5), the CTA at 1940,5–2064,75, and no current answer anywhere on
 * screen. Three changes, all through existing contracts: the route takes
 * `wide`, the tax passage moves into a `DetailDisclosure` behind
 * `taxHelpShort`, and the CTA pins the final payable figure. No default,
 * bound, tax basis, signed input or engine refusal changed.
 */
export function PriceAdjustCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. The tax-included switch is a list.
  const fields = useCalcFields(
    {
      price: C.form.defaultPrice,
      tax: C.form.defaultTax,
      taxIncluded: C.form.defaultTaxIncluded,
      discountPercent: C.form.defaultDiscountPercent,
      secondDiscountPercent: C.form.defaultSecondDiscountPercent,
      discountAmount: C.form.defaultDiscountAmount,
    },
    {
      price: "money",
      tax: "rate",
      discountPercent: "rate",
      secondDiscountPercent: "rate",
      discountAmount: "money",
    },
  );

  const price = parseMoney(fields.values.price);
  const tax = parseDecimal(fields.values.tax);
  const discountPercent = parseDecimal(fields.values.discountPercent);
  const secondDiscountPercent = parseDecimal(
    fields.values.secondDiscountPercent,
  );
  const discountAmount = parseMoney(fields.values.discountAmount);

  const priceInvalid = price === null || price <= 0;
  // BOUNDED AT 100, like the two discount percentages below. This field used
  // to accept 500 while `discountPercent` in the same component rejected 101 —
  // an inconsistency inside one file, not a deliberate asymmetry. A VAT rate
  // or a surcharge above 100% is not a figure anyone can be invoiced.
  const taxInvalid = tax === null || tax < 0 || tax > 100;
  // Written inline rather than through a shared predicate: TypeScript narrows
  // `number | null` from a visible `=== null` comparison and cannot see
  // through a helper, so a tidier `badPercent(...)` would leave both values
  // nullable at the `adjustPrice` call.
  const discountPercentInvalid =
    discountPercent === null || discountPercent < 0 || discountPercent > 100;
  const secondDiscountPercentInvalid =
    secondDiscountPercent === null ||
    secondDiscountPercent < 0 ||
    secondDiscountPercent > 100;
  const discountAmountInvalid = discountAmount === null || discountAmount < 0;

  const fieldsUsable =
    !priceInvalid &&
    !taxInvalid &&
    !discountPercentInvalid &&
    !secondDiscountPercentInvalid &&
    !discountAmountInvalid;

  const result = fieldsUsable
    ? adjustPrice({
        listPrice: price,
        discountPercent,
        secondDiscountPercent,
        discountAmount,
        taxPercent: tax,
        taxIncluded: fields.values.taxIncluded === "yes",
      })
    : null;

  // Both percentages are doing something, so the non-additivity is live and
  // worth naming. With one or none there is no gap to teach.
  const successive =
    result !== null &&
    (discountPercent ?? 0) > 0 &&
    (secondDiscountPercent ?? 0) > 0;

  // The ledger, straight from the model: keys mapped to labels, signs kept.
  // Nothing is recomputed here, so the running balance on screen is the
  // model's own and cannot drift from `finalPrice`.
  const ledgerRows = (result?.ledger ?? []).map((step) => [
    C.form.ledgerSteps[step.key],
    step.delta === 0
      ? PLACEHOLDER
      : `${step.delta < 0 ? "−" : "+"}${formatMoney(Math.abs(step.delta))}`,
    moneyCell(step.balance),
  ]);

  // Every field is valid on its own, but the discounts together exceed the
  // price. That is a note about the combination, not a fault in one box.
  const tooMuch = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.priceGroup}>
              <NumberField
                {...fields.bind("price")}
                label={C.form.priceLabel}
                unit={C.form.priceUnit}
                help={C.form.priceHelp}
                error={C.form.priceInvalid}
                invalid={priceInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.discountGroup} className="mt-8">
              <NumberField
                {...fields.bind("discountPercent")}
                label={C.form.discountPercentLabel}
                unit={C.form.discountPercentUnit}
                help={C.form.discountPercentHelp}
                error={C.form.discountPercentInvalid}
                invalid={discountPercentInvalid}
              />
              {/* The second percentage is the page's whole lesson, so it is a
                  field and not an instruction to run the tool twice. */}
              <NumberField
                {...fields.bind("secondDiscountPercent")}
                label={C.form.secondDiscountPercentLabel}
                unit={C.form.discountPercentUnit}
                help={C.form.secondDiscountPercentHelp}
                error={C.form.discountPercentInvalid}
                invalid={secondDiscountPercentInvalid}
              />
              <NumberField
                {...fields.bind("discountAmount")}
                label={C.form.discountAmountLabel}
                unit={C.form.discountAmountUnit}
                help={C.form.discountAmountHelp}
                error={C.form.discountAmountInvalid}
                invalid={discountAmountInvalid}
              />
            </FieldGroup>

            {/* ROW 62: the tax question is its own group. It is last because
                it qualifies the price rather than changing what the reader is
                shopping for, and because its help text is the longest on the
                page — a dated legal parameter with its own citations. */}
            <FieldGroup title={C.form.taxGroup} className="mt-8">
              {/* MEASURED REPAIR: the short warning stays ON the field — which
                  invoice you are holding decides the rate you type — and the
                  full passage is the disclosure below the group, verbatim.
                  Same mechanism as `auto-lease-calculator.tsx`. */}
              <NumberField
                {...fields.bind("tax")}
                label={C.form.taxLabel}
                unit={C.form.taxUnit}
                help={C.form.taxHelpShort}
                error={C.form.taxInvalid}
                invalid={taxInvalid}
              />
              {/* A radio, not a checkbox: the two readings of a label price
                  are different calculations, not an option added to one. */}
              <RadioGroupField
                {...fields.bind("taxIncluded")}
                legend={C.form.taxIncludedLegend}
                help={C.form.taxIncludedHelp}
                options={[
                  { value: "yes", label: C.form.taxIncludedYes },
                  { value: "no", label: C.form.taxIncludedNo },
                ]}
              />
            </FieldGroup>

            <DetailDisclosure title={C.form.taxDetailTitle} className="mt-4">
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
            // Six inputs across three groups plus the tax disclosure: the last
            // field sits below the result column even on a wide desktop, so
            // the pinned block keeps the ONE figure in view. Same formatted
            // string as the emphasised row above, and nothing else.
            sticky
            answer={{
              label: C.form.finalLabel,
              value: money(result?.finalPrice),
            }}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.finalLabel}
                value={money(result?.finalPrice)}
                emphasis
              />
              <ResultRow
                label={C.form.savingLabel}
                value={money(result?.saving)}
              />
              <ResultRow
                label={C.form.savingPercentLabel}
                value={result ? formatPercent(result.savingPercent) : null}
              />
            </ResultGroup>

            {/* Beside the answer, because the missing answer is what it
                explains. No field is at fault: each value is legal and the
                combination is not. */}
            {tooMuch ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.tooMuchNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
              <ResultRow
                label={C.form.discountLabel}
                value={money(result?.discount)}
              />
              <ResultRow
                label={C.form.netLabel}
                value={money(result?.netPrice)}
              />
              <ResultRow
                label={C.form.taxAmountLabel}
                value={money(result?.tax)}
              />
              <ResultRow
                label={C.form.withoutDiscountLabel}
                value={money(result?.priceWithoutDiscount)}
              />
            </ResultGroup>

            {/* Not live: a second view of the same numbers, and docs §4 allows
                one live results region per page. The two figures are side by
                side so the reader sees the gap rather than being told about
                it. */}
            {successive ? (
              <>
                <ResultGroup
                  title={C.form.combinedLabel}
                  className="mt-8"
                  live={false}
                >
                  <ResultRow
                    label={C.form.combinedLabel}
                    value={
                      result
                        ? formatPercent(result.combinedDiscountPercent)
                        : null
                    }
                  />
                  <ResultRow
                    label={C.form.naiveLabel}
                    value={
                      result ? formatPercent(result.naiveSumPercent) : null
                    }
                  />
                </ResultGroup>
                <p className="mt-3 text-sm leading-relaxed text-ink-3">
                  {C.form.combinedNote}
                </p>
              </>
            ) : null}

            {/* The direct ledger original row 60 asks for. Built from the
                model's own ordered steps, so the running balance cannot drift
                from the headline figure above. */}
            {ledgerRows.length > 0 ? (
              <div className="mt-8">
                <h3 className="font-display text-base font-medium text-ink">
                  {C.form.ledgerTitle}
                </h3>
                <ResultTable
                  className="mt-3"
                  caption={C.form.ledgerTitle}
                  columns={[
                    { label: C.form.ledgerStepColumn },
                    { label: C.form.ledgerDeltaColumn, numeric: true },
                    { label: C.form.ledgerBalanceColumn, numeric: true },
                  ]}
                  rows={ledgerRows}
                />
              </div>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
