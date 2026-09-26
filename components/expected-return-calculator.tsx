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
  formatPercent,
  parseCount,
  parseDecimal,
} from "@/lib/calc/number";
import { computeExpectedReturn } from "@/lib/calc/expected-return";
import { EXPECTED_RETURN as C } from "@/content/calculators/expected-return";

/**
 * Eight fixed scenario rows with a count that decides how many render — the
 * same shape the IRR page uses, for the same reason: the suite has no
 * repeating-field primitive yet. All sixteen keys live in state from the
 * start, so shrinking the count and growing it again keeps what was typed.
 */
const MAX_SCENARIOS = 8;
const INDEXES = Array.from({ length: MAX_SCENARIOS }, (_, index) => index);

/*
 * CSV row 39 ("Hai cột"): "giữ bảng tình huống gọn, tổng xác suất nhìn thấy;
 * kết quả lợi nhuận và dao động đứng cạnh nhau". Docs §8.
 *
 * Three things follow from that. The probability pair of each scenario shares
 * one grid row where there is width for it, so eight scenarios are sixteen
 * fields in eight lines rather than sixteen. The probability total moves out
 * of the detail disclosure into the answer region, because it is the
 * diagnostic for the single rejection this module makes on input that
 * otherwise parses — a total the reader cannot see is a total they cannot
 * fix. And the standard deviation is the row immediately under the expected
 * return, which is the page's own argument: nobody receives the average.
 */
const FORM_ID = "loi-nhuan-ky-vong-nhap";
const RESULT_ID = "loi-nhuan-ky-vong-ket-qua";

export function ExpectedReturnCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`: every probability and return is
  // `parseDecimal`; the scenario count formats nothing.
  const fields = useCalcFields(
    {
      count: C.form.defaultCount,
      ...Object.fromEntries(
        INDEXES.flatMap((index) => [
          [`probability${index}`, C.form.defaultProbabilities[index]],
          [`return${index}`, C.form.defaultReturns[index]],
        ]),
      ),
    } as Record<string, string>,
    Object.fromEntries(
      INDEXES.flatMap((index) => [
        [`probability${index}`, "rate" as const],
        [`return${index}`, "rate" as const],
      ]),
    ),
  );

  // A whole count of scenarios, so `parseCount` — docs §4. `parseDecimal`
  // with the integer guard was unreachable for a grouped entry: "3.000"
  // read as 3, an integer inside [2, 8], so the page rendered three
  // scenarios rather than showing the error the field promises.
  const count = parseCount(fields.values.count);
  const countInvalid = count === null || count < 2 || count > MAX_SCENARIOS;
  const shown = countInvalid ? 0 : count;

  const rows = INDEXES.slice(0, shown).map((index) => {
    const probability = parseDecimal(fields.values[`probability${index}`]);
    const value = parseDecimal(fields.values[`return${index}`]);
    return {
      index,
      probability,
      value,
      probabilityInvalid: probability === null || probability < 0,
      valueInvalid: value === null,
    };
  });

  const rowsUsable =
    !countInvalid &&
    rows.every((row) => !row.probabilityInvalid && !row.valueInvalid);

  const probabilitySum = rowsUsable
    ? rows.reduce<number>((sum, row) => sum + (row.probability ?? 0), 0)
    : null;

  const result = rowsUsable
    ? computeExpectedReturn(
        rows.map((row) => ({
          probabilityPercent: row.probability ?? 0,
          returnPercent: row.value ?? 0,
        })),
      )
    : null;

  // Every field parses but the probabilities do not sum to 100 — the one
  // reason the module rejects an otherwise-valid set.
  const badSum = rowsUsable && result === null;

  // A wrong TOTAL is not a wrong FIELD: no control is marked invalid for it,
  // so the CTA must not promise the reader a bad box to jump to. The notice
  // beside the answer is what explains that state.
  const anyFieldInvalid =
    countInvalid ||
    rows.some((row) => row.probabilityInvalid || row.valueInvalid);

  /** Formatted once, for the headline row and the pinned restatement. */
  const expectedValue = result
    ? formatPercent(result.expectedReturnPercent, 4)
    : null;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.setupGroup}>
              <NumberField
                {...fields.bind("count")}
                label={C.form.countLabel}
                help={C.form.countHelp}
                error={C.form.countInvalid}
                invalid={countInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.scenarioGroup} className="mt-8">
              {rows.map((row) => (
                // The row's "bảng tình huống gọn": probability and return are
                // one scenario, so they share a line where there is room.
                // Back to one column at `lg`, where the split layout narrows
                // this side to two fifths and a pair would not fit.
                // RUNTIME-PENDING: the breakpoints themselves are unverified
                // in a browser.
                <div
                  key={row.index}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
                >
                  <NumberField
                    {...fields.bind(`probability${row.index}`)}
                    label={C.form.probabilityLabel.replace(
                      "{n}",
                      String(row.index + 1),
                    )}
                    unit={C.form.probabilityUnit}
                    help={C.form.probabilityHelp}
                    error={C.form.probabilityInvalid}
                    invalid={row.probabilityInvalid}
                  />
                  <NumberField
                    {...fields.bind(`return${row.index}`)}
                    label={C.form.returnLabel.replace(
                      "{n}",
                      String(row.index + 1),
                    )}
                    unit={C.form.returnUnit}
                    help={C.form.returnHelp}
                    error={C.form.returnInvalid}
                    invalid={row.valueInvalid}
                  />
                </div>
              ))}
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: at the maximum of eight scenarios this form is sixteen
             boxes plus the count, and the probabilities have to be balanced
             against a total the reader cannot see from the bottom of it. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyFieldInvalid}
            sticky
            answer={{ label: C.form.expectedLabel, value: expectedValue }}
          />
        }
        primary={
          <>
            {/* The expected return with the spread beside it, so the average
                is never read on its own, and the probability total in plain
                sight rather than behind a disclosure. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.expectedLabel}
                value={expectedValue}
                emphasis
              />
              <ResultRow
                label={C.form.stdDevLabel}
                value={
                  result ? formatPercent(result.standardDeviationPercent, 4) : null
                }
              />
              <ResultRow
                label={C.form.coefficientLabel}
                value={
                  result?.coefficientOfVariation == null
                    ? null
                    : formatDecimal(result.coefficientOfVariation, 4)
                }
              />
              {/* Rendered whether or not the set computes: it is the only
                  thing that tells the reader WHY it did not. */}
              <ResultRow
                label={C.form.probabilitySumLabel}
                value={
                  probabilitySum === null ? null : formatPercent(probabilitySum, 2)
                }
              />
            </ResultGroup>

            {badSum ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.badSumNotice}
              </p>
            ) : null}

            {result !== null && result.coefficientOfVariation === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noCoefficientNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          // The four measures that describe the shape of the distribution
          // rather than its centre. NOT live: the summary above is the one
          // announced region.
          <ResultGroup title={C.form.detailTitle} live={false}>
            <ResultRow
              label={C.form.downsideLabel}
              value={result ? formatPercent(result.downsideRiskPercent, 4) : null}
            />
            <ResultRow
              label={C.form.lossProbabilityLabel}
              value={
                result ? formatPercent(result.probabilityOfLossPercent, 2) : null
              }
            />
            <ResultRow
              label={C.form.bestLabel}
              value={result ? formatPercent(result.bestCasePercent, 2) : null}
            />
            <ResultRow
              label={C.form.worstLabel}
              value={result ? formatPercent(result.worstCasePercent, 2) : null}
            />
            <ResultRow
              label={C.form.varianceLabel}
              value={result ? formatDecimal(result.variance, 4) : null}
            />
          </ResultGroup>
        }
      />
    </CalculatorCard>
  );
}
