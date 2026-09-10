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
import { computePercent, type PercentMode } from "@/lib/calc/percent";
import { PERCENT as C } from "@/content/calculators/percent";

/**
 * Which field keys and which parser each mode uses.
 *
 * Every mode owns its OWN pair of boxes. Sharing one pair would carry a
 * percentage typed in "of" mode into a box that means đồng in the next mode,
 * and the result would be wrong without looking wrong.
 *
 * `aIsPercent` also decides the parser: Vietnamese money grammar makes
 * "2.000.000" two million, while rate grammar makes "7,5" seven and a half.
 * See lib/calc/number.ts — mixing the two silently turns 500.000 into 500.
 */
const MODES = {
  of: { a: "ofPercent", b: "ofTotal", aIsPercent: true },
  share: { a: "sharePart", b: "shareWhole", aIsPercent: false },
  change: { a: "changeFrom", b: "changeTo", aIsPercent: false },
} as const satisfies Record<
  PercentMode,
  { a: string; b: string; aIsPercent: boolean }
>;

export function PercentCalculator() {
  const fields = useCalcFields({
    mode: "of",
    ofPercent: C.form.modes.of.defaultA,
    ofTotal: C.form.modes.of.defaultB,
    sharePart: C.form.modes.share.defaultA,
    shareWhole: C.form.modes.share.defaultB,
    changeFrom: C.form.modes.change.defaultA,
    changeTo: C.form.modes.change.defaultB,
  });

  const mode = fields.values.mode as PercentMode;
  const keys = MODES[mode];
  const copy = C.form.modes[mode];

  // In "of" mode the first box is a percentage; everywhere else, and in the
  // second box always, the value is money.
  const a = keys.aIsPercent
    ? parseDecimal(fields.values[keys.a])
    : parseMoney(fields.values[keys.a]);
  const b = parseMoney(fields.values[keys.b]);

  // "share" divides by b and "change" divides by a, so a zero in the divisor
  // is flagged on the field itself rather than silently blanking the result.
  const aInvalid = a === null || (mode === "change" && a === 0);
  const bInvalid = b === null || (mode === "share" && b === 0);

  const result =
    aInvalid || bInvalid ? null : computePercent({ mode, a, b });

  const money = (value: number) => `${formatMoney(value)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "of", label: C.form.modes.of.label },
            { value: "share", label: C.form.modes.share.label },
            { value: "change", label: C.form.modes.change.label },
          ]}
        />
      </FieldGroup>

      {/* Keyed on the mode so React remounts the pair rather than reusing the
          previous mode's inputs — the two boxes mean different things and
          carry different `useId`-generated labels. */}
      <FieldGroup key={mode} className="mt-8">
        <NumberField
          {...fields.bind(keys.a)}
          label={copy.aLabel}
          unit={copy.aUnit}
          help={copy.aHelp}
          error={copy.aInvalid}
          invalid={aInvalid}
        />
        <NumberField
          {...fields.bind(keys.b)}
          label={copy.bLabel}
          unit={copy.bUnit}
          help={copy.bHelp}
          error={copy.bInvalid}
          invalid={bInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={copy.resultLabel}
          value={
            result === null
              ? null
              : result.mode === "of"
                ? money(result.amount)
                : result.mode === "share"
                  ? formatPercent(result.sharePercent)
                  : formatPercent(result.changePercent)
          }
        />
        {mode === "change" ? (
          <ResultRow
            label={C.form.modes.change.differenceLabel}
            value={
              result === null || result.mode !== "change"
                ? null
                : money(result.difference)
            }
          />
        ) : null}
      </ResultGroup>
    </CalculatorCard>
  );
}
