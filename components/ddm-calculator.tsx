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
import { computeDdm } from "@/lib/calc/ddm";
import { DDM as C } from "@/content/calculators/ddm";

export function DdmCalculator() {
  const fields = useCalcFields({
    dividend: C.form.defaultDividend,
    mode: C.form.defaultMode,
    growth: C.form.defaultGrowth,
    required: C.form.defaultRequired,
    price: C.form.defaultPrice,
  });

  const dividend = parseMoney(fields.values.dividend);
  const growth = parseDecimal(fields.values.growth);
  const required = parseDecimal(fields.values.required);

  // Optional: without a price the implied block is simply absent.
  const priceRaw = fields.values.price.trim();
  const price = priceRaw === "" ? null : parseMoney(priceRaw);

  const dividendInvalid = dividend === null || dividend <= 0;
  const requiredInvalid = required === null;
  // The denominator: at or above the required return the model has no finite
  // value, so this is flagged on the field rather than left to fail silently.
  const growthInvalid =
    growth === null || (required !== null && growth >= required);
  const priceInvalid = priceRaw !== "" && (price === null || price <= 0);

  const result =
    dividendInvalid || growthInvalid || requiredInvalid || priceInvalid
      ? null
      : computeDdm({
          dividend,
          dividendIsNext: fields.values.mode === "next",
          growthPercent: growth,
          requiredReturnPercent: required,
          price: price ?? undefined,
        });

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.dividendGroup}>
        <NumberField
          {...fields.bind("dividend")}
          label={C.form.dividendLabel}
          unit={C.form.dividendUnit}
          help={C.form.dividendHelp}
          error={C.form.dividendInvalid}
          invalid={dividendInvalid}
        />
        {/* A radio, because the two conventions differ by a factor of
            (1 + g) and picking the wrong one is a silent 5% error. */}
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "current", label: C.form.modeCurrent },
            { value: "next", label: C.form.modeNext },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.assumptionGroup} className="mt-8">
        <NumberField
          {...fields.bind("growth")}
          label={C.form.growthLabel}
          unit={C.form.growthUnit}
          help={C.form.growthHelp}
          error={C.form.growthInvalid}
          invalid={growthInvalid}
        />
        <NumberField
          {...fields.bind("required")}
          label={C.form.requiredLabel}
          unit={C.form.requiredUnit}
          help={C.form.requiredHelp}
          error={C.form.requiredInvalid}
          invalid={requiredInvalid}
        />
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.valueLabel}
          value={money(result?.intrinsicValue)}
        />
        <ResultRow
          label={C.form.verdictLabel}
          value={
            result?.verdict == null
              ? null
              : result.verdict === "undervalued"
                ? C.form.verdictUnder
                : result.verdict === "overvalued"
                  ? C.form.verdictOver
                  : C.form.verdictFair
          }
        />
        <ResultRow
          label={C.form.premiumLabel}
          value={
            result?.premiumDiscountPercent == null
              ? null
              : formatPercent(result.premiumDiscountPercent, 3)
          }
        />
      </ResultGroup>

      {/* The inversions, which the page argues are the useful output. Not
          live: the group above already announces every recomputation. */}
      <ResultGroup title={C.form.impliedTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.impliedGrowthLabel}
          value={
            result?.impliedGrowthPercent == null
              ? null
              : formatPercent(result.impliedGrowthPercent, 3)
          }
        />
        <ResultRow
          label={C.form.impliedReturnLabel}
          value={
            result?.impliedReturnPercent == null
              ? null
              : formatPercent(result.impliedReturnPercent, 3)
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.nextDividendLabel}
          value={money(result?.nextDividend)}
        />
        <ResultRow
          label={C.form.dividendYieldLabel}
          value={
            result ? formatPercent(result.dividendYieldPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.capitalGainsLabel}
          value={
            result ? formatPercent(result.capitalGainsYieldPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.totalReturnLabel}
          value={result ? formatPercent(result.totalReturnPercent, 3) : null}
        />
      </ResultGroup>

      {growthInvalid && growth !== null && required !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unpriceableNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
