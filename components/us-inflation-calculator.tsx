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
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeUsInflation,
  type InflationMode,
} from "@/lib/calc/us-inflation";
import { US_INFLATION as C } from "@/content/calculators/us-inflation";

const F = C.form;

const MODE_OPTIONS = [
  { value: "cpi", label: F.modeOptions.cpi },
  { value: "rate", label: F.modeOptions.rate },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "lam-phat-hoa-ky-nhap";
const RESULT_ID = "lam-phat-hoa-ky-ket-qua";

export function UsInflationCalculator() {
  const fields = useCalcFields(F.defaults);

  const mode = fields.values.mode as InflationMode;
  const cpiMode = mode === "cpi";

  const amount = parseMoney(fields.values.amount);
  const startCpi = parseDecimal(fields.values.startCpi);
  const endCpi = parseDecimal(fields.values.endCpi);
  const rate = parseDecimal(fields.values.rate);
  const years = parseDecimal(fields.values.years);

  const amountInvalid = amount === null || amount < 0;
  const yearsInvalid = years === null || years <= 0;
  // The CPI fields are only capable of being wrong in CPI mode. Marking them
  // invalid in rate mode would flag a field the answer does not read.
  const startCpiInvalid = cpiMode && (startCpi === null || startCpi <= 0);
  const endCpiInvalid = cpiMode && (endCpi === null || endCpi <= 0);
  const rateInvalid = !cpiMode && (rate === null || rate <= -100);

  const anyInvalid =
    amountInvalid ||
    yearsInvalid ||
    startCpiInvalid ||
    endCpiInvalid ||
    rateInvalid;

  const result = anyInvalid
    ? null
    : computeUsInflation({
        mode,
        amount: amount!,
        // The unused branch's fields still have to be numbers for the call.
        // The module ignores whichever pair the mode does not read, and a
        // test pins that it truly ignores them.
        startCpi: startCpi ?? 100,
        endCpi: endCpi ?? 100,
        years: years!,
        ratePercent: rate ?? 0,
      });

  // The one main answer, formatted once.
  const equivalent = result === null ? null : usd(result.equivalentAmount);

  /*
   * CSV row 74 is "Gọn", so `columns="single"`. Its action: keep the US label
   * and the CPI source, put the equivalent purchasing power first, disclose
   * the CPI-chain teaching, give the two modes DIFFERENT source/assumption
   * labels, and stop an inactive field from stealing the CTA's error focus.
   *
   * That last one was ALREADY true and is asserted rather than rebuilt: the
   * `cpiMode &&` / `!cpiMode &&` guards above mean the unread pair is never
   * marked invalid, and the unused `FieldGroup` is not rendered at all — so
   * `ResultCta`'s `[aria-invalid="true"]` search inside the form region cannot
   * reach a field the answer does not read.
   *
   * No arithmetic changed: `computeUsInflation` is untouched and every figure
   * keeps its existing precision, including the four decimals on the average
   * annual rate and on the purchasing power of one dollar.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
            <FieldGroup title={F.modeGroup}>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={F.modeLabel}
                help={F.modeHelp}
                options={MODE_OPTIONS}
              />
            </FieldGroup>

            <FieldGroup title={F.amountGroup} className="mt-8">
              <NumberField
                {...fields.bind("amount")}
                label={F.amountLabel}
                unit={F.amountUnit}
                help={F.amountHelp}
                error={F.amountInvalid}
                invalid={amountInvalid}
              />
              <NumberField
                {...fields.bind("years")}
                label={F.yearsLabel}
                unit={F.yearsUnit}
                help={F.yearsHelp}
                error={F.yearsInvalid}
                invalid={yearsInvalid}
              />
            </FieldGroup>

            {cpiMode ? (
              <FieldGroup title={F.cpiGroup} className="mt-8">
                <NumberField
                  {...fields.bind("startCpi")}
                  label={F.startCpiLabel}
                  help={F.startCpiHelp}
                  error={F.startCpiInvalid}
                  invalid={startCpiInvalid}
                />
                <NumberField
                  {...fields.bind("endCpi")}
                  label={F.endCpiLabel}
                  help={F.endCpiHelp}
                  error={F.endCpiInvalid}
                  invalid={endCpiInvalid}
                />
              </FieldGroup>
            ) : (
              <FieldGroup title={F.rateGroup} className="mt-8">
                <NumberField
                  {...fields.bind("rate")}
                  label={F.rateLabel}
                  unit={F.rateUnit}
                  help={F.rateHelp}
                  error={F.rateInvalid}
                  invalid={rateInvalid}
                />
              </FieldGroup>
            )}
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              {/* The question the page exists for: what the same money is
                  worth at the later date. */}
              <ResultRow
                label={F.equivalentLabel}
                value={equivalent}
                emphasis
              />
              <ResultRow
                label={F.cumulativeLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.cumulativeInflationPercent, 2)
                }
              />
              <ResultRow
                label={F.annualLabel}
                value={
                  result === null || result.annualRatePercent === null
                    ? null
                    : formatPercent(result.annualRatePercent, 4)
                }
              />
            </ResultGroup>

            {/* WHICH QUESTION THIS ANSWER BELONGS TO, and it is different per
                mode: a measurement cites its source, a forecast names its
                assumption. Directly under the figure, because it qualifies
                the figure. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {cpiMode ? F.cpiSourceNotice : F.rateModeNotice}
            </p>

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            <ResultGroup title={F.powerTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.powerOfOneLabel}
                value={
                  result === null
                    ? null
                    : `${formatDecimal(result.purchasingPowerOfOne, 4)} USD`
                }
              />
              <ResultRow
                label={F.powerLostLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.purchasingPowerLostPercent, 2)
                }
              />
              {/* Never a bare dash: at zero or negative inflation the halving
                  question has no answer, and the row says which. */}
              <ResultRow
                label={F.halvingLabel}
                value={
                  result === null
                    ? null
                    : result.yearsToHalvePower === null
                      ? F.neverHalves
                      : `${formatDecimal(result.yearsToHalvePower, 2)} ${F.halvingUnit}`
                }
                prose={result !== null && result.yearsToHalvePower === null}
              />
            </ResultGroup>

            {/* Why "sức mua đã mất" is negative and the halving row says
                never — beside the two rows it explains. */}
            {result?.deflation ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.deflationNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          // The CPI-chain teaching the row asked to disclose. Only in CPI
          // mode: in rate mode there is no series to explain.
          cpiMode ? (
            <DetailDisclosure title={F.cpiSourceDetailTitle}>
              <p className="text-sm leading-relaxed text-ink-3">
                {F.cpiSourceDetail}
              </p>
            </DetailDisclosure>
          ) : undefined
        }
      />
    </CalculatorCard>
  );
}
