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
import { payFixed, payMinimum } from "@/lib/calc/card-debt";
import { CARD_MINIMUM as C } from "@/content/calculators/card-minimum";

export function CardMinimumCalculator() {
  const fields = useCalcFields({
    balance: C.form.defaultBalance,
    rate: C.form.defaultRate,
    percent: C.form.defaultPercent,
    floor: C.form.defaultFloor,
    extra: C.form.defaultExtra,
  });

  const balance = parseMoney(fields.values.balance);
  const rate = parseDecimal(fields.values.rate);
  const percent = parseDecimal(fields.values.percent);
  const floor = parseMoney(fields.values.floor);
  const extra = parseMoney(fields.values.extra);

  const balanceInvalid = balance === null || balance <= 0;
  const rateInvalid = rate === null || rate < 0;
  const percentInvalid = percent === null || percent < 0 || percent > 100;
  const floorInvalid = floor === null || floor < 0;
  const extraInvalid = extra === null || extra < 0;

  const fieldsUsable =
    !balanceInvalid &&
    !rateInvalid &&
    !percentInvalid &&
    !floorInvalid &&
    !extraInvalid;

  const result = fieldsUsable
    ? payMinimum({
        balance,
        annualRatePercent: rate,
        minimumPercent: percent,
        minimumFloor: floor,
        extraPerMonth: extra,
      })
    : null;

  // The comparison the page exists for: the SAME first payment, held flat.
  // Computed rather than described, so the two can never disagree.
  const asFixed =
    result === null || !fieldsUsable
      ? null
      : payFixed({
          balance,
          annualRatePercent: rate,
          monthlyPayment: result.firstPayment,
        });

  const noPayoff = fieldsUsable && result === null;

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  /** "90 tháng (7,5 năm)" — months are the unit, years are the shock. */
  const monthsWithYears = (count: number | undefined) =>
    count === undefined
      ? null
      : `${formatDecimal(count, 0)} ${C.form.monthsUnit} (${formatDecimal(count / 12, 1)} ${C.form.yearsUnit})`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.group}>
        <NumberField
          {...fields.bind("balance")}
          label={C.form.balanceLabel}
          unit={C.form.balanceUnit}
          help={C.form.balanceHelp}
          error={C.form.balanceInvalid}
          invalid={balanceInvalid}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.minimumGroup} className="mt-8">
        <NumberField
          {...fields.bind("percent")}
          label={C.form.percentLabel}
          unit={C.form.percentUnit}
          help={C.form.percentHelp}
          error={C.form.percentInvalid}
          invalid={percentInvalid}
        />
        <NumberField
          {...fields.bind("floor")}
          label={C.form.floorLabel}
          unit={C.form.floorUnit}
          help={C.form.floorHelp}
          error={C.form.floorInvalid}
          invalid={floorInvalid}
        />
        <NumberField
          {...fields.bind("extra")}
          label={C.form.extraLabel}
          unit={C.form.extraUnit}
          help={C.form.extraHelp}
          error={C.form.extraInvalid}
          invalid={extraInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthsLabel}
          value={monthsWithYears(result?.months)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.interestShareLabel}
          value={result ? formatPercent(result.interestSharePercent, 1) : null}
        />
      </ResultGroup>

      {/* The comparison block. Not live: it is the same computation seen a
          second way, and the group above already announces every change. */}
      <ResultGroup title={C.form.compareTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.compareIntro}
          value={money(result?.firstPayment)}
        />
        <ResultRow
          label={C.form.compareMonthsLabel}
          value={monthsWithYears(asFixed?.months)}
        />
        <ResultRow
          label={C.form.compareInterestLabel}
          value={money(asFixed?.totalInterest)}
        />
        <ResultRow
          label={C.form.compareSavedMonthsLabel}
          value={
            result && asFixed
              ? `${formatDecimal(result.months - asFixed.months, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.compareSavedInterestLabel}
          value={
            result && asFixed
              ? money(result.totalInterest - asFixed.totalInterest)
              : null
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.firstPaymentLabel}
          value={money(result?.firstPayment)}
        />
        <ResultRow
          label={C.form.firstInterestLabel}
          value={money(result?.schedule[0].interest)}
        />
        <ResultRow
          label={C.form.lastPaymentLabel}
          value={money(result?.lastPayment)}
        />
        <ResultRow
          label={C.form.totalPaidLabel}
          value={money(result?.totalPaid)}
        />
      </ResultGroup>

      {noPayoff ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noPayoffNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
