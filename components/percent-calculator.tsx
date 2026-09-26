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
  formatDecimal,
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
  of: { a: "ofPercent", b: "ofTotal", aIsPercent: true, bIsPercent: false },
  share: { a: "sharePart", b: "shareWhole", aIsPercent: false, bIsPercent: false },
  change: { a: "changeFrom", b: "changeTo", aIsPercent: false, bIsPercent: false },
  // BOTH boxes are rates here, which is what makes "điểm phần trăm" a
  // meaningful answer and money a meaningless one.
  points: { a: "pointsFrom", b: "pointsTo", aIsPercent: true, bIsPercent: true },
} as const satisfies Record<
  PercentMode,
  { a: string; b: string; aIsPercent: boolean; bIsPercent: boolean }
>;

/**
 * The two region ids the CTA contract runs on.
 *
 * Literals rather than `useId`, because they are a CONTRACT between two
 * components and a stable hook for the render test — and because they must be
 * byte-identical between the server's prerender and the client's hydration,
 * which is the one thing every calculator in this suite is required to be.
 */
const FORM_ID = "tinh-phan-tram-nhap";
const RESULT_ID = "tinh-phan-tram-ket-qua";

/** Each mode owns separate keys, so a money input never inherits a rate's grammar. */
export const PERCENT_FORMATS = {
  ofPercent: "rate", ofTotal: "money",
  sharePart: "money", shareWhole: "money",
  changeFrom: "money", changeTo: "money",
  pointsFrom: "rate", pointsTo: "rate",
} as const;

export function PercentCalculator() {
  const fields = useCalcFields({
    mode: "of",
    ofPercent: C.form.modes.of.defaultA,
    ofTotal: C.form.modes.of.defaultB,
    sharePart: C.form.modes.share.defaultA,
    shareWhole: C.form.modes.share.defaultB,
    changeFrom: C.form.modes.change.defaultA,
    changeTo: C.form.modes.change.defaultB,
    pointsFrom: C.form.modes.points.defaultA,
    pointsTo: C.form.modes.points.defaultB,
  }, PERCENT_FORMATS);

  const mode = fields.values.mode as PercentMode;
  const keys = MODES[mode];
  const copy = C.form.modes[mode];

  // The parser comes from the FIELD, per mode — docs §4. A rate box uses
  // `parseDecimal` (7,5 is seven and a half) and a money box uses
  // `parseMoney` (2.000.000 is two million); swapping them is a 1000× error.
  const a = keys.aIsPercent
    ? parseDecimal(fields.values[keys.a])
    : parseMoney(fields.values[keys.a]);
  const b = keys.bIsPercent
    ? parseDecimal(fields.values[keys.b])
    : parseMoney(fields.values[keys.b]);

  // "share" divides by b and "change" divides by a, so a zero in either
  // divisor is flagged on the field itself rather than silently blanking the
  // result.
  //
  // "points" is NOT in that list. A 0% old rate is a legitimate rate — an
  // introductory period — and the point difference from it is valid; only the
  // relative change is undefined, and the model returns that as null. Marking
  // the field invalid withheld both answers, which a review found on 0 → 7.
  const aInvalid = a === null || (mode === "change" && a === 0);
  const bInvalid = b === null || (mode === "share" && b === 0);

  const result =
    aInvalid || bInvalid ? null : computePercent({ mode, a, b });

  const money = (value: number) => `${formatMoney(value)} ₫`;

  /**
   * The one-line worked arithmetic original row 59 asks for.
   *
   * Built from the SAME parsed numbers the result came from, so the equation
   * and the answer cannot disagree — and formatted with the same formatters,
   * so the equation reads in the same grammar as the boxes above it.
   */
  const equation =
    result === null || a === null || b === null
      ? null
      : result.mode === "of"
        ? `${formatDecimal(a)}% × ${formatMoney(b)} = ${formatMoney(result.amount)} ₫`
        : result.mode === "share"
          ? `${formatMoney(a)} ÷ ${formatMoney(b)} = ${formatPercent(result.sharePercent)}`
          : result.mode === "change"
            ? `(${formatMoney(b)} − ${formatMoney(a)}) ÷ ${formatMoney(Math.abs(a))} = ${formatPercent(result.changePercent)}`
            : `${formatDecimal(b)} − ${formatDecimal(a)} = ${formatDecimal(result.differencePoints)} ${C.form.modes.points.pointsUnit}`;

  /*
   * A "Gọn" row in the audit's own classification (CSV row 61): its action is
   * "chọn phép tính trước, kết quả ngay dưới hai ô; không cần chart hoặc bảng
   * phụ". Both halves are already true of this tool and are PRESERVED here
   * rather than rebuilt — the mode radio is the first control, the result
   * follows the two boxes, and there is no figure and no secondary table.
   *
   * So `columns="single"` and no `chart`: splitting four short controls across
   * 40/60 would make two stub columns, and adding a plot to a percentage would
   * be chart chrome for consistency, which docs §3 forbids outright. What this
   * row was missing is the CTA and a shorter route to the first field, and
   * that is all that changes.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
            <FieldGroup>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "of", label: C.form.modes.of.label },
                  { value: "share", label: C.form.modes.share.label },
                  { value: "change", label: C.form.modes.change.label },
                  { value: "points", label: C.form.modes.points.label },
                ]}
              />
            </FieldGroup>

            {/* Keyed on the mode so React remounts the pair rather than reusing
                the previous mode's inputs — the two boxes mean different things
                and carry different `useId`-generated labels. */}
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={aInvalid || bInvalid}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={copy.resultLabel}
                // The one answer this page exists to give. Every mode has
                // exactly one, and its unit differs per mode — which is the
                // whole lesson of the tool.
                emphasis
                value={
                  result === null
                    ? null
                    : result.mode === "of"
                      ? money(result.amount)
                      : result.mode === "share"
                        ? formatPercent(result.sharePercent)
                        : result.mode === "change"
                          ? formatPercent(result.changePercent)
                          : // ĐIỂM phần trăm, with its unit spelled out: the
                            // whole point of the mode is that this is not a
                            // percentage.
                            `${formatDecimal(result.differencePoints)} ${C.form.modes.points.pointsUnit}`
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
              {/* The same move as a percentage of the old rate — the second
                  half of the lesson, beside the first rather than instead of
                  it. The DIRECTION is a word picked from the sign, and the
                  magnitude is rendered unsigned: the label used to say "tăng"
                  beside a negative figure on any rate cut. Null at a 0% old
                  rate, where this measure does not exist but the point
                  difference above still does. */}
              {mode === "points" ? (
                <ResultRow
                  label={C.form.modes.points.relativeLabel}
                  value={
                    result === null || result.mode !== "points"
                      ? null
                      : result.relativePercent === null
                        ? C.form.modes.points.relativeUndefined
                        : C.form.modes.points.relativeFormat
                            .replace(
                              "{direction}",
                              result.relativePercent > 0
                                ? C.form.modes.points.relativeIncrease
                                : result.relativePercent < 0
                                  ? C.form.modes.points.relativeDecrease
                                  : C.form.modes.points.relativeSame,
                            )
                            .replace(
                              "{percent}",
                              formatPercent(Math.abs(result.relativePercent)),
                            )
                  }
                  prose={
                    result !== null &&
                    result.mode === "points" &&
                    result.relativePercent === null
                  }
                />
              ) : null}
              <ResultRow
                label={C.form.equationLabel}
                value={equation}
                prose
              />
            </ResultGroup>

            {/* Why there is no đồng figure in this mode. */}
            {mode === "points" ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.pointsMoneyNote}
              </p>
            ) : null}

            {/* And why only ONE of the two figures is missing at a 0% old
                rate. Kept beside the answer rather than moved to a disclosure:
                it explains a visible dash, so a reader who cannot see it is
                looking at an unexplained gap. */}
            {mode === "points" &&
            result !== null &&
            result.mode === "points" &&
            result.relativePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.modes.points.relativeUndefinedNote}
              </p>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
