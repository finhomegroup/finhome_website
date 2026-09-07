"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
import { splitBill } from "@/lib/calc/tip";
import { TIP as C } from "@/content/calculators/tip";

export function TipCalculator() {
  const fields = useCalcFields({
    bill: C.form.defaultBill,
    service: C.form.defaultService,
    tax: C.form.defaultTax,
    tip: C.form.defaultTip,
    people: C.form.defaultPeople,
    roundTo: C.form.defaultRound,
  });

  const bill = parseMoney(fields.values.bill);
  const service = parseDecimal(fields.values.service);
  const tax = parseDecimal(fields.values.tax);
  const tip = parseDecimal(fields.values.tip);
  const people = parseDecimal(fields.values.people);

  const billInvalid = bill === null || bill <= 0;
  const serviceInvalid = service === null || service < 0;
  const taxInvalid = tax === null || tax < 0;
  const tipInvalid = tip === null || tip < 0;
  const peopleInvalid =
    people === null || people < 1 || !Number.isInteger(people);

  const result =
    billInvalid || serviceInvalid || taxInvalid || tipInvalid || peopleInvalid
      ? null
      : splitBill({
          bill,
          servicePercent: service,
          taxPercent: tax,
          tipPercent: tip,
          people,
          // The select only ever holds one of the values below, so a failed
          // parse can only mean "không làm tròn".
          roundTo: Number(fields.values.roundTo) || 0,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.billGroup}>
        <NumberField
          {...fields.bind("bill")}
          label={C.form.billLabel}
          unit={C.form.billUnit}
          help={C.form.billHelp}
          error={C.form.billInvalid}
          invalid={billInvalid}
        />
        <NumberField
          {...fields.bind("service")}
          label={C.form.serviceLabel}
          unit={C.form.serviceUnit}
          help={C.form.serviceHelp}
          error={C.form.serviceInvalid}
          invalid={serviceInvalid}
        />
        <NumberField
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.taxInvalid}
          invalid={taxInvalid}
        />
        <NumberField
          {...fields.bind("tip")}
          label={C.form.tipLabel}
          unit={C.form.tipUnit}
          help={C.form.tipHelp}
          error={C.form.tipInvalid}
          invalid={tipInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.splitGroup} className="mt-8">
        <NumberField
          {...fields.bind("people")}
          label={C.form.peopleLabel}
          help={C.form.peopleHelp}
          error={C.form.peopleInvalid}
          invalid={peopleInvalid}
        />
        <SelectField
          {...fields.bind("roundTo")}
          label={C.form.roundLabel}
          help={C.form.roundHelp}
          options={[
            { value: "0", label: C.form.roundNone },
            { value: "1000", label: C.form.round1k },
            { value: "5000", label: C.form.round5k },
            { value: "10000", label: C.form.round10k },
            { value: "50000", label: C.form.round50k },
          ]}
        />
      </FieldGroup>

      {/* Two rows, live: the numbers someone reads out loud at the table.
          The seven-row breakdown below is deliberately NOT live — nine rows
          re-announced on every keystroke is the failure mode `live={false}`
          exists to prevent, and only these two are what the user came for. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.perPersonRoundedLabel}
          value={money(result?.perPersonRounded)}
        />
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.breakdownTitle} className="mt-4" live={false}>
        <ResultRow label={C.form.totalLabel} value={money(result?.total)} />
        <ResultRow
          label={C.form.perPersonLabel}
          value={money(result?.perPerson)}
        />
        <ResultRow
          label={C.form.serviceResultLabel}
          value={money(result?.service)}
        />
        <ResultRow label={C.form.taxResultLabel} value={money(result?.tax)} />
        <ResultRow label={C.form.tipResultLabel} value={money(result?.tip)} />
        <ResultRow
          label={C.form.roundingExtraLabel}
          value={money(result?.roundingExtra)}
        />
        <ResultRow
          label={C.form.extraPercentLabel}
          value={result ? formatPercent(result.effectiveExtraPercent) : null}
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
