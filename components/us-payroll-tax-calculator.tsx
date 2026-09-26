"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import {
  computeUsPayroll,
  PAYROLL_YEAR_ORDER,
  type FilingStatus,
} from "@/lib/calc/us-payroll";
import { US_PAYROLL_TAX as C } from "@/content/calculators/us-payroll-tax";

const F = C.form;

const STATUS_OPTIONS: readonly { value: FilingStatus; label: string }[] = [
  { value: "single", label: F.statusOptions.single },
  { value: "married", label: F.statusOptions.married },
  { value: "marriedSeparate", label: F.statusOptions.marriedSeparate },
  { value: "head", label: F.statusOptions.head },
];

const YEAR_OPTIONS = PAYROLL_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

const EMPLOYMENT_OPTIONS = [
  { value: "employee", label: F.employmentOptions.employee },
  { value: "selfEmployed", label: F.employmentOptions.selfEmployed },
];

/** USD carries cents, unlike every other page in the suite. */
function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so the prerender and hydration agree. */
const FORM_ID = "thue-luong-hoa-ky-nhap";
const RESULT_ID = "thue-luong-hoa-ky-ket-qua";

export function UsPayrollTaxCalculator() {
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. The one amount groups; status, employment and year are lists.
  const fields = useCalcFields(F.defaults, { wages: "money" });
  const selfEmployed = fields.values.employment === "selfEmployed";

  const wages = parseMoney(fields.values.wages);
  const wagesInvalid = wages === null || wages < 0;

  const result = wagesInvalid
    ? null
    : computeUsPayroll({
        wages,
        filingStatus: fields.values.status as FilingStatus,
        year: Number(fields.values.year),
        selfEmployed,
      });

  // The ONE main answer, formatted once and reused by the pinned CTA block so
  // the two cannot round the same number differently.
  const employeeTotal = result === null ? null : usd(result.employeeTotal);

  /*
   * CSV row 76 is "Gọn", so `columns="single"`: four controls split 40/60
   * would be two stub columns. Its action is "làm rõ người lao động/chủ lao
   * động/tự làm chủ, kết quả tách theo vai trò" — `employerLabel` and
   * `combinedLabel` used to be rows 7 and 8 of an eleven-row breakdown, where
   * who pays what was only readable by counting. They now have their own
   * group directly under the answer, and the eleven-row table stays below as
   * detail. No arithmetic changed: `computeUsPayroll` is untouched, the
   * employment select still has its two real modes, and every figure is still
   * `formatMoney(value, 2)` in USD.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <FieldGroup title={F.wageGroup}>
            <NumberField
              {...fields.bind("wages")}
              label={selfEmployed ? F.selfEmploymentIncomeLabel : F.wagesLabel}
              unit={F.wagesUnit}
              help={selfEmployed ? F.selfEmploymentIncomeHelp : F.wagesHelp}
              error={F.wagesInvalid}
              invalid={wagesInvalid}
            />
            <SelectField
              {...fields.bind("status")}
              label={F.statusLabel}
              help={F.statusHelp}
              options={STATUS_OPTIONS}
            />
            <SelectField
              {...fields.bind("employment")}
              label={F.employmentLabel}
              help={F.employmentHelp}
              options={EMPLOYMENT_OPTIONS}
            />
            <SelectField
              {...fields.bind("year")}
              label={F.yearLabel}
              help={F.yearHelp}
              options={YEAR_OPTIONS}
            />
          </FieldGroup>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={wagesInvalid}
          />
        }
        primary={
          <>
            <ResultGroup
              title={selfEmployed ? F.selfEmployedResultTitle : F.resultTitle}
              anchorId={RESULT_ID}
            >
              <ResultRow
                label={F.employeeTotalLabel}
                value={employeeTotal}
                emphasis
              />
              <ResultRow
                label={F.effectiveRateLabel}
                value={
                  result === null || result.effectiveRatePercent === null
                    ? null
                    : formatPercent(result.effectiveRatePercent, 2)
                }
              />
              <ResultRow
                label={F.marginalRateLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.marginalRatePercent, 2)
                }
              />
            </ResultGroup>

            {/* Beside the dash it explains. A wage of 0 is a valid entry, so
                the field is NOT marked invalid and the reader would otherwise
                see one unexplained gap in an otherwise complete group. */}
            {result !== null && result.effectiveRatePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.zeroWageNotice}
              </p>
            ) : null}

            {/* Why the marginal rate above is LOWER than the one below it. */}
            {result?.aboveWageBase ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.aboveBaseNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* The role split. `live={false}`: the page is allowed exactly one
                live region and it is the group above — see
                scripts/check-built-markup.mjs. */}
            <ResultGroup
              title={F.roleGroupTitle}
              className="mt-4"
              live={false}
            >
              <ResultRow
                label={
                  selfEmployed ? F.selfEmployedRoleLabel : F.employeeRoleLabel
                }
                value={employeeTotal}
              />
              <ResultRow
                label={F.employerLabel}
                value={result === null ? null : usd(result.employerTotal)}
              />
              <ResultRow
                label={F.combinedLabel}
                value={result === null ? null : usd(result.combinedTotal)}
              />
            </ResultGroup>

            {/* Why the employer row is 0 rather than missing. */}
            {selfEmployed ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.employerNoneNotice}
              </p>
            ) : null}

            {/* The 92,35% base and the half-of-SE-tax deduction this tool does
                not model: a model limit, so it stays visible rather than
                moving into a disclosure. */}
            {selfEmployed ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.selfEmployedNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          <ResultGroup title={F.breakdownTitle} live={false}>
            <ResultRow
              label={F.taxBaseLabel}
              value={result === null ? null : usd(result.taxBase)}
            />
            <ResultRow
              label={F.socialSecurityWagesLabel}
              value={result === null ? null : usd(result.socialSecurityWages)}
            />
            {/* The rate in the label follows the MODE, because the amount
                beside it does: in `Tự làm chủ` these two rows are both halves
                (12,4% and 2,9% of the 92,35% base, Schedule SE lines 10–11),
                and the employee mode's 6,2% / 1,45% would misname them. No
                amount, rate table or calculation changes with this. */}
            <ResultRow
              label={
                selfEmployed
                  ? F.selfEmployedSocialSecurityLabel
                  : F.socialSecurityLabel
              }
              value={result === null ? null : usd(result.socialSecurityTax)}
            />
            <ResultRow
              label={
                selfEmployed ? F.selfEmployedMedicareLabel : F.medicareLabel
              }
              value={result === null ? null : usd(result.medicareTax)}
            />
            <ResultRow
              label={F.additionalWagesLabel}
              value={
                result === null ? null : usd(result.additionalMedicareWages)
              }
            />
            <ResultRow
              label={F.additionalLabel}
              value={result === null ? null : usd(result.additionalMedicareTax)}
            />
            <ResultRow
              label={F.wageBaseLabel}
              value={
                result === null
                  ? null
                  : `${formatMoney(result.params.socialSecurityWageBase)} USD`
              }
            />
            <ResultRow
              label={F.thresholdLabel}
              value={
                result === null
                  ? null
                  : `${formatMoney(
                      result.params.additionalMedicareThreshold[
                        fields.values.status as FilingStatus
                      ],
                    )} USD`
              }
            />
            <ResultRow
              label={F.cappedSavingLabel}
              value={result === null ? null : usd(result.cappedSaving)}
            />
          </ResultGroup>
        }
      />
    </CalculatorCard>
  );
}
