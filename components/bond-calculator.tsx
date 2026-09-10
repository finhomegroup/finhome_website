"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeBond } from "@/lib/calc/bond";
import { BOND as C } from "@/content/calculators/bond";

export function BondCalculator() {
  const fields = useCalcFields({
    mode: "yield",
    face: C.form.defaultFace,
    coupon: C.form.defaultCoupon,
    years: C.form.defaultYears,
    frequency: C.form.defaultFrequency,
    yieldValue: C.form.defaultYield,
    price: C.form.defaultPrice,
  });

  const fromYield = fields.values.mode === "yield";

  const face = parseMoney(fields.values.face);
  const coupon = parseDecimal(fields.values.coupon);
  const years = parseDecimal(fields.values.years);
  const frequency = parseDecimal(fields.values.frequency);
  const requiredYield = parseDecimal(fields.values.yieldValue);
  const price = parseMoney(fields.values.price);

  const faceInvalid = face === null || face <= 0;
  const couponInvalid = coupon === null || coupon < 0;
  // The term must land on a whole number of coupon periods; pricing between
  // coupon dates needs accrued interest, which the module does not model.
  const yearsInvalid =
    years === null ||
    years <= 0 ||
    frequency === null ||
    !Number.isInteger(years * frequency);
  const yieldInvalid = fromYield && requiredYield === null;
  const priceInvalid = !fromYield && (price === null || price <= 0);

  const result =
    faceInvalid || couponInvalid || yearsInvalid || yieldInvalid || priceInvalid
      ? null
      : computeBond({
          faceValue: face,
          couponRatePercent: coupon,
          years,
          paymentsPerYear: frequency!,
          yieldPercent: fromYield ? (requiredYield ?? undefined) : undefined,
          price: fromYield ? undefined : (price ?? undefined),
        });

  // In price-to-yield mode the solver can fail while the rest is valid.
  const unsolvable = result !== null && result.yieldPercent === null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  const years4 = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${formatDecimal(value, 4)} ${C.form.yearsUnit}`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "yield", label: C.form.modeYield },
            { value: "price", label: C.form.modePrice },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.bondGroup} className="mt-8">
        <NumberField
          {...fields.bind("face")}
          label={C.form.faceLabel}
          unit={C.form.faceUnit}
          help={C.form.faceHelp}
          error={C.form.faceInvalid}
          invalid={faceInvalid}
        />
        <NumberField
          {...fields.bind("coupon")}
          label={C.form.couponLabel}
          unit={C.form.couponUnit}
          help={C.form.couponHelp}
          error={C.form.couponInvalid}
          invalid={couponInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={C.form.yearsLabel}
          help={C.form.yearsHelp}
          error={C.form.yearsInvalid}
          invalid={yearsInvalid}
        />
        <SelectField
          {...fields.bind("frequency")}
          label={C.form.frequencyLabel}
          help={C.form.frequencyHelp}
          options={[
            { value: "1", label: C.form.frequencyAnnual },
            { value: "2", label: C.form.frequencySemi },
            { value: "4", label: C.form.frequencyQuarterly },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.marketGroup} className="mt-8">
        {/* Only the input the mode needs; the other one is the answer. */}
        {fromYield ? (
          <NumberField
            {...fields.bind("yieldValue")}
            label={C.form.yieldLabel}
            unit={C.form.yieldUnit}
            help={C.form.yieldHelp}
            error={C.form.yieldInvalid}
            invalid={yieldInvalid}
          />
        ) : (
          <NumberField
            {...fields.bind("price")}
            label={C.form.priceLabel}
            unit={C.form.priceUnit}
            help={C.form.priceHelp}
            error={C.form.priceInvalid}
            invalid={priceInvalid}
          />
        )}
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        {fromYield ? (
          <ResultRow
            label={C.form.priceResultLabel}
            value={money(result?.price)}
          />
        ) : (
          <ResultRow
            label={C.form.yieldResultLabel}
            value={
              result?.yieldPercent == null
                ? null
                : formatPercent(result.yieldPercent, 4)
            }
          />
        )}
        <ResultRow
          label={C.form.pricePercentLabel}
          value={
            result ? formatPercent(result.pricePercentOfFace, 3) : null
          }
        />
        <ResultRow
          label={C.form.quoteLabel}
          value={
            result === null
              ? null
              : result.quote === "premium"
                ? C.form.quotePremium
                : result.quote === "discount"
                  ? C.form.quoteDiscount
                  : C.form.quotePar
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        {/* Both of the other "yields", side by side with YTM, so the three
            are never confused for one another. */}
        {fromYield ? (
          <ResultRow
            label={C.form.yieldResultLabel}
            value={
              result?.yieldPercent == null
                ? null
                : formatPercent(result.yieldPercent, 4)
            }
          />
        ) : (
          <ResultRow
            label={C.form.priceResultLabel}
            value={money(result?.price)}
          />
        )}
        <ResultRow
          label={C.form.currentYieldLabel}
          value={
            result?.currentYieldPercent == null
              ? null
              : formatPercent(result.currentYieldPercent, 4)
          }
        />
        <ResultRow
          label={C.form.effectiveYieldLabel}
          value={
            result?.effectiveYieldPercent == null
              ? null
              : formatPercent(result.effectiveYieldPercent, 4)
          }
        />
        <ResultRow
          label={C.form.couponPerPeriodLabel}
          value={money(result?.couponPerPeriod)}
        />
        <ResultRow
          label={C.form.couponPerYearLabel}
          value={money(result?.couponPerYear)}
        />
        <ResultRow
          label={C.form.periodsLabel}
          value={
            result
              ? `${formatDecimal(result.periods, 0)} ${C.form.periodsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.macaulayLabel}
          value={years4(result?.macaulayDurationYears)}
        />
        <ResultRow
          label={C.form.modifiedLabel}
          value={years4(result?.modifiedDurationYears)}
        />
        <ResultRow
          label={C.form.sensitivityLabel}
          value={money(result?.priceChangePerPointRise)}
        />
        <ResultRow
          label={C.form.totalCashLabel}
          value={money(result?.totalCashFlows)}
        />
      </ResultGroup>

      {unsolvable ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unsolvableNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
