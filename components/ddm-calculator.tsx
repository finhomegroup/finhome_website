"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
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

/*
 * CSV row 36 ("Gọn"): "giữ giá mô hình và chênh lệch với giá thị trường cạnh
 * nhau; không biến kết quả thành lệnh mua". Docs §8.
 *
 * WHY `emphasis` SITS ON THE MODEL VALUE even though this page's own notice
 * argues the value is not a conclusion: `emphasis` marks the figure the tool
 * was asked for, and the title promises a valuation. The guardrail against
 * reading it as a buy order is words — `modelOnlyNote` beside the answer, and
 * a verdict phrased as a comparison rather than an instruction — not a
 * smaller type size that would only make the answer harder to find.
 */
const FORM_ID = "co-phieu-deu-nhap";
const RESULT_ID = "co-phieu-deu-ket-qua";

export function DdmCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. Mode is a list.
  const fields = useCalcFields(
    {
      dividend: C.form.defaultDividend,
      mode: C.form.defaultMode,
      growth: C.form.defaultGrowth,
      required: C.form.defaultRequired,
      price: C.form.defaultPrice,
    },
    { dividend: "money", growth: "rate", required: "rate", price: "money" },
  );

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
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            // An EMPTY market price is not in this list: the model value is
            // still correct without it, and `priceInvalid` is already false
            // while the box is blank.
            invalid={
              dividendInvalid ||
              growthInvalid ||
              requiredInvalid ||
              priceInvalid
            }
          />
        }
        primary={
          <>
            {/* The row's "cạnh nhau": the model value and the gap against the
                market price are the first two rows, so the figure is never
                read without the distance to the traded price. The verdict is
                a comparison sentence, so it takes `prose`. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.valueLabel}
                value={money(result?.intrinsicValue)}
                emphasis
              />
              <ResultRow
                label={C.form.premiumLabel}
                value={
                  result?.premiumDiscountPercent == null
                    ? null
                    : formatPercent(result.premiumDiscountPercent, 3)
                }
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
                prose
              />
            </ResultGroup>

            {/* Explains three dashes at once, so it stays beside them. */}
            {growthInvalid && growth !== null && required !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.unpriceableNotice}
              </p>
            ) : null}

            {/* Row 36's "không biến kết quả thành lệnh mua". OUTSIDE the live
                region: the sentence never changes, and repeating it after
                every keystroke would bury the figures that did. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {C.form.modelOnlyNote}
            </p>

            {/* The inversions, which the page argues are the useful output.
                They stay beside the answer rather than moving to the detail
                region for exactly that reason. Not live: the group above
                already announces every recomputation. */}
            <ResultGroup
              title={C.form.impliedTitle}
              className="mt-6"
              live={false}
            >
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
          </>
        }
        detail={
          // How the required return splits into yield plus growth — a check
          // on the model, not part of the answer.
          <ResultGroup title={C.form.detailTitle} live={false}>
            <ResultRow
              label={C.form.nextDividendLabel}
              value={money(result?.nextDividend)}
            />
            <ResultRow
              label={C.form.dividendYieldLabel}
              value={result ? formatPercent(result.dividendYieldPercent, 3) : null}
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
        }
      />
    </CalculatorCard>
  );
}
