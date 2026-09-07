"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
import { computeIrrNpv } from "@/lib/calc/irr-npv";
import { IRR_NPV as C } from "@/content/calculators/irr-npv";

/**
 * The suite has no repeating-field primitive yet, so the cash flows are a
 * fixed set of twelve boxes with a count that decides how many render. All
 * twelve keys exist in state from the start, which keeps `useCalcFields`
 * simple and means shrinking the count then growing it again does not lose
 * what was typed.
 */
const MAX_PERIODS = 12;
const FLOW_KEYS = Array.from(
  { length: MAX_PERIODS },
  (_, index) => `flow${index + 1}` as const,
);

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

  const periods = parseDecimal(fields.values.periods);
  const discount = parseDecimal(fields.values.discount);

  // The reinvestment rate is optional: empty means "same as the discount
  // rate", which is a different thing from a bad entry.
  const reinvestRaw = fields.values.reinvest.trim();
  const reinvest = reinvestRaw === "" ? null : parseDecimal(reinvestRaw);

  const periodsInvalid =
    periods === null ||
    periods < 1 ||
    periods > MAX_PERIODS ||
    !Number.isInteger(periods);
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

  const periodsValue = (count: number | null) =>
    count === null
      ? null
      : `${formatDecimal(count, 2)} ${C.form.periodsUnit}`;

  return (
    <CalculatorCard>
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

      {/* NPV first, deliberately: it is the decision rule. IRR sits below it
          and MIRR beside it, so the misleading number is never alone. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.npvLabel} value={money(result?.npv)} />
        <ResultRow
          label={C.form.irrLabel}
          value={
            result?.irrPercent == null
              ? null
              : formatPercent(result.irrPercent, 4)
          }
        />
        <ResultRow
          label={C.form.mirrLabel}
          value={
            result?.modifiedIrrPercent == null
              ? null
              : formatPercent(result.modifiedIrrPercent, 4)
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
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

      {/* Each absent figure gets its own explanation: "no IRR" has two very
          different causes and the user needs to know which one they hit. */}
      {result !== null && result.irrPercent === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.signChanges > 1
            ? C.form.noIrrManySigns
            : C.form.noIrrSameSign}
        </p>
      ) : null}

      {result !== null && result.paybackPeriod === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noPayback}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
