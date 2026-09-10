"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatDecimal, formatPercent, parseDecimal } from "@/lib/calc/number";
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

export function ExpectedReturnCalculator() {
  const fields = useCalcFields({
    count: C.form.defaultCount,
    ...Object.fromEntries(
      INDEXES.flatMap((index) => [
        [`probability${index}`, C.form.defaultProbabilities[index]],
        [`return${index}`, C.form.defaultReturns[index]],
      ]),
    ),
  } as Record<string, string>);

  const count = parseDecimal(fields.values.count);
  const countInvalid =
    count === null || count < 2 || count > MAX_SCENARIOS || !Number.isInteger(count);
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

  return (
    <CalculatorCard>
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
          <div key={row.index} className="space-y-4">
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
              label={C.form.returnLabel.replace("{n}", String(row.index + 1))}
              unit={C.form.returnUnit}
              help={C.form.returnHelp}
              error={C.form.returnInvalid}
              invalid={row.valueInvalid}
            />
          </div>
        ))}
      </FieldGroup>

      {/* The expected return with the two spread measures beside it, so the
          average is never read on its own. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.expectedLabel}
          value={
            result ? formatPercent(result.expectedReturnPercent, 4) : null
          }
        />
        <ResultRow
          label={C.form.stdDevLabel}
          value={
            result
              ? formatPercent(result.standardDeviationPercent, 4)
              : null
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
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.downsideLabel}
          value={
            result ? formatPercent(result.downsideRiskPercent, 4) : null
          }
        />
        <ResultRow
          label={C.form.lossProbabilityLabel}
          value={
            result
              ? formatPercent(result.probabilityOfLossPercent, 2)
              : null
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
        {/* Always shown, valid or not: it is the diagnostic for the one
            rejection the module makes on otherwise-good input. */}
        <ResultRow
          label={C.form.probabilitySumLabel}
          value={
            probabilitySum === null
              ? null
              : formatPercent(probabilitySum, 2)
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
    </CalculatorCard>
  );
}
