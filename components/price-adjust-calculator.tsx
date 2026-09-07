"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { adjustPrice } from "@/lib/calc/price-adjust";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";

export function PriceAdjustCalculator() {
  const fields = useCalcFields({
    price: C.form.defaultPrice,
    tax: C.form.defaultTax,
    taxIncluded: C.form.defaultTaxIncluded,
    discountPercent: C.form.defaultDiscountPercent,
    discountAmount: C.form.defaultDiscountAmount,
  });

  const price = parseMoney(fields.values.price);
  const tax = parseDecimal(fields.values.tax);
  const discountPercent = parseDecimal(fields.values.discountPercent);
  const discountAmount = parseMoney(fields.values.discountAmount);

  const priceInvalid = price === null || price <= 0;
  const taxInvalid = tax === null || tax < 0;
  const discountPercentInvalid =
    discountPercent === null || discountPercent < 0 || discountPercent > 100;
  const discountAmountInvalid = discountAmount === null || discountAmount < 0;

  const fieldsUsable =
    !priceInvalid &&
    !taxInvalid &&
    !discountPercentInvalid &&
    !discountAmountInvalid;

  const result = fieldsUsable
    ? adjustPrice({
        listPrice: price,
        discountPercent,
        discountAmount,
        taxPercent: tax,
        taxIncluded: fields.values.taxIncluded === "yes",
      })
    : null;

  // Every field is valid on its own, but the discounts together exceed the
  // price. That is a note about the combination, not a fault in one box.
  const tooMuch = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.priceGroup}>
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
        <NumberField
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.taxInvalid}
          invalid={taxInvalid}
        />
        {/* A radio, not a checkbox: the two readings of a label price are
            different calculations, not an option added to one. */}
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

      <FieldGroup title={C.form.discountGroup} className="mt-8">
        <NumberField
          {...fields.bind("discountPercent")}
          label={C.form.discountPercentLabel}
          unit={C.form.discountPercentUnit}
          help={C.form.discountPercentHelp}
          error={C.form.discountPercentInvalid}
          invalid={discountPercentInvalid}
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

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.finalLabel} value={money(result?.finalPrice)} />
        <ResultRow label={C.form.savingLabel} value={money(result?.saving)} />
        <ResultRow
          label={C.form.savingPercentLabel}
          value={result ? formatPercent(result.savingPercent) : null}
        />
        <ResultRow
          label={C.form.discountLabel}
          value={money(result?.discount)}
        />
        <ResultRow label={C.form.netLabel} value={money(result?.netPrice)} />
        <ResultRow label={C.form.taxAmountLabel} value={money(result?.tax)} />
        <ResultRow
          label={C.form.withoutDiscountLabel}
          value={money(result?.priceWithoutDiscount)}
        />
      </ResultGroup>

      {tooMuch ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.tooMuchNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
