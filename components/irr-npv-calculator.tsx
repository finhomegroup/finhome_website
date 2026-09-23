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
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeIrrNpv } from "@/lib/calc/irr-npv";
import { IRR_NPV as C } from "@/content/calculators/irr-npv";

/**
 * The suite has no repeating-field primitive yet, so the cash flows are a
 * fixed set of twelve boxes with a count that decides how many render. All
 * twelve keys exist in state from the start, which keeps `useCalcFields`
 * simple and means shrinking the count then growing it again does not lose
 * what was typed.
 *
 * CSV row 24 ("Theo nhóm + kết quả"): "tách ô dòng tiền khỏi kết quả
 * NPV/IRR; ghi rõ kỳ và điều kiện khi không tìm được IRR". Docs §8.
 *
 * The separation is the layout's two regions plus the CTA between them: with
 * up to thirteen money boxes, the old single flow of card children put the
 * answer an unpredictable distance below the last thing the reader typed.
 *
 * `columns="split"`, CORRECTED. This route shipped `columns="single"` on the
 * argument that thirteen boxes read better full-width than in a two-fifths
 * column. An independent review restored the approved requirement instead: the
 * global desktop layout for a LONG tool is the 40/60 split — form left,
 * summary right, detail tables full width below — and CSV row 24 ("Theo nhóm +
 * kết quả") describes a grouped form beside a result, not a compact utility.
 * The single-column exception was an implementation preference, not an
 * approved change to that requirement, and it is not needed: grouped cash-flow
 * inputs and a three-row answer are compatible with the split, the detail
 * region spans all five columns either way (`CalculatorLayout`), and the
 * pinned short answer below keeps the figure on screen while the form scrolls.
 * Tablet and phone stay single-column, because the grid starts at `lg`.
 *
 * Every refusal this page makes stays attached to the blank it explains: the
 * no-IRR sentences and `noMirr` sit in the answer region beside the rows they
 * empty, and `noPayback` sits in the detail region beside the payback row.
 * Both are cases where a figure is legitimately absent, so nothing is marked
 * invalid and the CTA must not claim there is a bad field.
 */
const MAX_PERIODS = 12;
const FLOW_KEYS = Array.from(
  { length: MAX_PERIODS },
  (_, index) => `flow${index + 1}` as const,
);

const FORM_ID = "irr-npv-nhap";
const RESULT_ID = "irr-npv-ket-qua";

export function IrrNpvCalculator() {
  const fields = useCalcFields({
    periods: C.form.defaultPeriods,
    discount: C.form.defaultDiscount,
    reinvest: C.form.defaultReinvest,
    flow0: C.form.defaultPeriod0,
    ...Object.fromEntries(
      FLOW_KEYS.map((key) => [key, C.form.defaultFlow]),
    ),
  } as Record<string, string>);

  // A whole count of periods, so `parseCount` — docs §4. This was
  // `parseDecimal` with the `Number.isInteger` guard below it, which is the
  // arrangement `parseCount`'s docstring calls unreachable: `parseDecimal`
  // reads a grouped "1.000" as 1, and 1 IS an integer inside [1, 12], so
  // the guard passed and the page priced a one-period project with no
  // field marked invalid.
  const periods = parseCount(fields.values.periods);
  const discount = parseDecimal(fields.values.discount);

  // The reinvestment rate is optional: empty means "same as the discount
  // rate", which is a different thing from a bad entry.
  const reinvestRaw = fields.values.reinvest.trim();
  const reinvest = reinvestRaw === "" ? null : parseDecimal(reinvestRaw);

  // `parseCount` returns only safe integers, so the range is the whole
  // check; an `Number.isInteger` line here would now be unreachable in the
  // other direction.
  const periodsInvalid = periods === null || periods < 1 || periods > MAX_PERIODS;
  const discountInvalid = discount === null || discount <= -100;
  const reinvestInvalid =
    reinvestRaw !== "" && (reinvest === null || reinvest <= -100);

  const shown = periodsInvalid ? 0 : periods;

  // Flows can be negative — period 0 always is — so `parseMoney` is right
  // here and its leading-minus handling is what makes it work.
  const flow0 = parseMoney(fields.values.flow0);
  const flow0Invalid = flow0 === null;

  const flowValues = FLOW_KEYS.slice(0, shown).map((key) =>
    parseMoney(fields.values[key]),
  );
  const flowInvalid = flowValues.map((value) => value === null);

  const fieldsUsable =
    !periodsInvalid &&
    !discountInvalid &&
    !reinvestInvalid &&
    !flow0Invalid &&
    !flowInvalid.some(Boolean);

  const result = fieldsUsable
    ? computeIrrNpv({
        flows: [flow0, ...flowValues.map((value) => value ?? 0)],
        discountRatePercent: discount,
        reinvestRatePercent: reinvest ?? undefined,
      })
    : null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  // The period travels with every rate this page reports — row 24's "ghi rõ
  // kỳ". A kỳ is whatever unit the discount rate was entered in.
  const rate = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatPercent(figure, 4)}${C.form.perPeriodSuffix}`;

  /** Formatted once, for the headline row and the pinned restatement. */
  const npvValue = money(result?.npv);

  const periodsValue = (count: number | null) =>
    count === null
      ? null
      : `${formatDecimal(count, 2)} ${C.form.periodsUnit}`;

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.setupGroup}>
              <NumberField
                {...fields.bind("periods")}
                label={C.form.periodsLabel}
                help={C.form.periodsHelp}
                error={C.form.periodsInvalid}
                invalid={periodsInvalid}
              />
              <NumberField
                {...fields.bind("discount")}
                label={C.form.discountLabel}
                unit={C.form.discountUnit}
                help={C.form.discountHelp}
                error={C.form.discountInvalid}
                invalid={discountInvalid}
              />
              <NumberField
                {...fields.bind("reinvest")}
                label={C.form.reinvestLabel}
                unit={C.form.reinvestUnit}
                help={C.form.reinvestHelp}
                error={C.form.reinvestInvalid}
                invalid={reinvestInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.flowsGroup} className="mt-8">
              <NumberField
                {...fields.bind("flow0")}
                label={C.form.period0Label}
                unit={C.form.period0Unit}
                help={C.form.period0Help}
                error={C.form.period0Invalid}
                invalid={flow0Invalid}
              />
              {FLOW_KEYS.slice(0, shown).map((key, index) => (
                <NumberField
                  key={key}
                  {...fields.bind(key)}
                  label={C.form.periodLabel.replace("{n}", String(index + 1))}
                  unit={C.form.periodUnit}
                  help={C.form.periodHelp}
                  error={C.form.periodInvalid}
                  invalid={flowInvalid[index]}
                />
              ))}
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: thirteen money boxes is the longest form in this batch,
             and editing period 9 puts the answer well off a desktop screen.
             The pinned line carries NPV because NPV is the decision rule and
             already the group's headline. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={!fieldsUsable}
            sticky
            answer={{ label: C.form.npvLabel, value: npvValue }}
          />
        }
        primary={
          <>
            {/* NPV first, deliberately: it is the decision rule. IRR sits
                below it and MIRR beside it, so the misleading number is
                never alone.

                `emphasis` goes on NPV for the same reason, which is the one
                place this route departs from "emphasise the answer people
                came for": people come for the IRR, the page's own notice
                says to read NPV first, and a headline that contradicted the
                notice would make the notice decoration. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={C.form.npvLabel} value={npvValue} emphasis />
              <ResultRow label={C.form.irrLabel} value={rate(result?.irrPercent)} />
              <ResultRow
                label={C.form.mirrLabel}
                value={rate(result?.modifiedIrrPercent)}
              />
            </ResultGroup>

            {/* Each absent figure gets its own explanation, beside the blank
                it explains: "no IRR" has two very different causes and the
                user needs to know which one they hit. Neither state marks a
                field invalid — the flows are all legal numbers. */}
            {result !== null && result.irrPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {result.signChanges > 1
                  ? C.form.noIrrManySigns
                  : C.form.noIrrSameSign}
              </p>
            ) : null}

            {/* MIRR has its own blank and its own cause. With every cash
                flow the same sign there is no discounted outflow to divide
                by, so the engine returns null here as well — the state the
                page used to leave unexplained while `formula` claimed MIRR
                always exists. */}
            {result !== null && result.modifiedIrrPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noMirr}
              </p>
            ) : null}

            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {C.form.periodBasisNote}
            </p>
          </>
        }
        detail={
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
              <ResultRow
                label={C.form.piLabel}
                value={
                  result?.profitabilityIndex == null
                    ? null
                    : formatDecimal(result.profitabilityIndex, 4)
                }
              />
              <ResultRow
                label={C.form.paybackLabel}
                value={periodsValue(result?.paybackPeriod ?? null)}
              />
              <ResultRow
                label={C.form.discountedPaybackLabel}
                value={periodsValue(result?.discountedPaybackPeriod ?? null)}
              />
              <ResultRow
                label={C.form.totalInflowsLabel}
                value={money(result?.totalInflows)}
              />
              <ResultRow
                label={C.form.totalOutflowsLabel}
                value={money(result?.totalOutflows)}
              />
              <ResultRow
                label={C.form.totalFlowsLabel}
                value={money(result?.totalFlows)}
              />
              <ResultRow
                label={C.form.signChangesLabel}
                value={
                  result
                    ? `${formatDecimal(result.signChanges, 0)} ${C.form.timesUnit}`
                    : null
                }
              />
            </ResultGroup>

            {result !== null && result.paybackPeriod === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noPayback}
              </p>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
