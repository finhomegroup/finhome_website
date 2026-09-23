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
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeUsDividendTax,
  type NiitStatus,
} from "@/lib/calc/us-dividend-tax";
import { US_DIVIDEND_TAX as C } from "@/content/calculators/us-dividend-tax";

const F = C.form;

const RATE_OPTIONS = [
  { value: "0", label: F.qualifiedRateOptions.zero },
  { value: "15", label: F.qualifiedRateOptions.fifteen },
  { value: "20", label: F.qualifiedRateOptions.twenty },
];

const STATUS_OPTIONS: readonly { value: NiitStatus; label: string }[] = [
  { value: "single", label: F.statusOptions.single },
  { value: "married", label: F.statusOptions.married },
  { value: "marriedSeparate", label: F.statusOptions.marriedSeparate },
  { value: "head", label: F.statusOptions.head },
];

const NIIT_OPTIONS = [
  { value: "yes", label: F.niitOptions.yes },
  { value: "no", label: F.niitOptions.no },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "thue-co-tuc-nhap";
const RESULT_ID = "thue-co-tuc-ket-qua";

export function UsDividendTaxCalculator() {
  const fields = useCalcFields(F.defaults);

  const qualified = parseMoney(fields.values.qualified);
  const ordinary = parseMoney(fields.values.ordinary);
  const ordinaryRate = parseDecimal(fields.values.ordinaryRate);
  const magi = parseMoney(fields.values.magi);

  const qualifiedInvalid = qualified === null || qualified < 0;
  const ordinaryInvalid = ordinary === null || ordinary < 0;
  const ordinaryRateInvalid =
    ordinaryRate === null || ordinaryRate < 0 || ordinaryRate > 100;
  const magiInvalid = magi === null || magi < 0;

  const anyInvalid =
    qualifiedInvalid || ordinaryInvalid || ordinaryRateInvalid || magiInvalid;

  const result = anyInvalid
    ? null
    : computeUsDividendTax({
        qualifiedDividends: qualified,
        ordinaryDividends: ordinary,
        qualifiedRatePercent: Number(fields.values.qualifiedRate),
        ordinaryRatePercent: ordinaryRate,
        modifiedAgi: magi,
        status: fields.values.status as NiitStatus,
        applyNiit: fields.values.niit === "yes",
      });

  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  const answerValue = result === null ? null : usd(result.totalTax);

  /*
   * CSV row 45 is "Hai cột", so the default `columns="split"` plus the page's
   * `wide`. Its action: put the total tax and the net amount first, and move
   * the surcharge detail into a disclosure.
   *
   * The year limit on the qualified-rate brackets is deliberately NOT
   * disclosed together with its table: it decides whether the rate the reader
   * selected is the right one at all, so the short form stays visible beside
   * the answer and only the five bracket figures moved behind a summary.
   *
   * `sticky`: six controls in three groups, split and `wide` — the same shape
   * as the form a browser pass measured at 1143,75 px
   * (`components/black-scholes-calculator.tsx`), where the result region sat
   * at y −382..−140 with the last field focused. `lg:items-start` keeps the
   * result column at the top of the grid, so the split alone does not hold the
   * answer on screen. This form's own height has NOT been measured; it is the
   * shortest form on the shelf that pins, so it is the first row Codex should
   * check.
   *
   * `computeUsDividendTax` is untouched. USD keeps cents; the NIIT threshold
   * keeps its no-cents grammar, because it is a statutory round number rather
   * than a computed amount.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.incomeGroup}>
              <NumberField
                {...fields.bind("qualified")}
                label={F.qualifiedLabel}
                unit={F.qualifiedUnit}
                help={F.qualifiedHelp}
                error={F.qualifiedInvalid}
                invalid={qualifiedInvalid}
              />
              <NumberField
                {...fields.bind("ordinary")}
                label={F.ordinaryLabel}
                unit={F.ordinaryUnit}
                help={F.ordinaryHelp}
                error={F.ordinaryInvalid}
                invalid={ordinaryInvalid}
              />
            </FieldGroup>

            <FieldGroup title={F.rateGroup} className="mt-8">
              <SelectField
                {...fields.bind("qualifiedRate")}
                label={F.qualifiedRateLabel}
                help={F.qualifiedRateHelp}
                options={RATE_OPTIONS}
              />
              <NumberField
                {...fields.bind("ordinaryRate")}
                label={F.ordinaryRateLabel}
                unit={F.ordinaryRateUnit}
                help={F.ordinaryRateHelp}
                error={F.ordinaryRateInvalid}
                invalid={ordinaryRateInvalid}
              />
            </FieldGroup>

            <FieldGroup title={F.niitGroup} className="mt-8">
              <NumberField
                {...fields.bind("magi")}
                label={F.magiLabel}
                unit={F.magiUnit}
                help={F.magiHelp}
                error={F.magiInvalid}
                invalid={magiInvalid}
              />
              <SelectField
                {...fields.bind("status")}
                label={F.statusLabel}
                help={F.statusHelp}
                options={STATUS_OPTIONS}
              />
              <RadioGroupField
                {...fields.bind("niit")}
                legend={F.niitLabel}
                help={F.niitHelp}
                options={NIIT_OPTIONS}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={{ label: F.totalTaxLabel, value: answerValue }}
          />
        }
        primary={
          <>
            {/* Total tax and what is left, in that order: the row's first
                clause. The effective rate is the third row because it is a
                reading of the first two, not a separate answer. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.totalTaxLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.afterTaxLabel}
                value={result === null ? null : usd(result.afterTaxIncome)}
              />
              <ResultRow
                label={F.effectiveRateLabel}
                value={
                  result === null || result.effectiveRatePercent === null
                    ? null
                    : formatPercent(result.effectiveRatePercent, 2)
                }
              />
            </ResultGroup>

            {/* The surcharge changes the answer above, so the fact that it
                applied is stated beside the answer even though the rows that
                build it are disclosed. */}
            {result?.aboveNiitThreshold ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.aboveThresholdNotice}
              </p>
            ) : null}

            {result !== null && result.effectiveRatePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noDividendNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* What the classification is worth to THIS reader — the page's
                subject, kept in the primary column rather than disclosed. */}
            <ResultGroup title={F.breakdownTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.qualifiedTaxLabel}
                value={result === null ? null : usd(result.qualifiedTax)}
              />
              <ResultRow
                label={F.ordinaryTaxLabel}
                value={result === null ? null : usd(result.ordinaryTax)}
              />
              <ResultRow
                label={F.allOrdinaryLabel}
                value={result === null ? null : usd(result.taxIfAllOrdinary)}
              />
              <ResultRow
                label={F.savingLabel}
                value={result === null ? null : usd(result.qualifiedSaving)}
              />
            </ResultGroup>

            {/* THE YEAR LIMIT, before the reader relies on the rate they
                picked. Short form only; the bracket table is disclosed. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.thresholdGuide}
            </p>
          </>
        }
        detail={
          <>
            <DetailDisclosure title={F.niitDisclosureTitle}>
              <ResultGroup title={F.niitGroup} live={false}>
                <ResultRow
                  label={F.thresholdLabel}
                  value={
                    result === null
                      ? null
                      : `${formatMoney(result.niitThreshold)} USD`
                  }
                />
                <ResultRow
                  label={F.magiExcessLabel}
                  value={result === null ? null : usd(result.magiExcess)}
                />
                <ResultRow
                  label={F.niitBaseLabel}
                  value={result === null ? null : usd(result.niitBase)}
                />
                <ResultRow
                  label={F.niitTaxLabel}
                  value={result === null ? null : usd(result.niitTax)}
                />
              </ResultGroup>
            </DetailDisclosure>

            <DetailDisclosure
              title={F.thresholdGuideDetailTitle}
              className="mt-4"
            >
              <p className="text-sm leading-relaxed text-ink-3">
                {F.thresholdGuideDetail}
              </p>
            </DetailDisclosure>
          </>
        }
      />
    </CalculatorCard>
  );
}
