"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeTermDeposit,
  type DepositPayout,
} from "@/lib/calc/term-deposit";
import { TERM_DEPOSIT as C } from "@/content/calculators/term-deposit";

export function TermDepositCalculator() {
  const fields = useCalcFields({
    principal: C.form.defaultPrincipal,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    payout: C.form.defaultPayout,
    cycles: C.form.defaultCycles,
    compound: C.form.defaultCompound,
    demandRate: C.form.defaultDemandRate,
    breakAfter: C.form.defaultBreak,
  });

  const principal = parseMoney(fields.values.principal);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const cycles = parseDecimal(fields.values.cycles);
  const demandRate = parseDecimal(fields.values.demandRate);

  // The break horizon is optional: empty means "don't show that block".
  const breakRaw = fields.values.breakAfter.trim();
  const breakAfter = breakRaw === "" ? null : parseDecimal(breakRaw);

  const payout = fields.values.payout as DepositPayout;
  const totalMonths = term !== null && cycles !== null ? term * cycles : null;

  const principalInvalid = principal === null || principal <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const cyclesInvalid =
    cycles === null || cycles < 1 || !Number.isInteger(cycles);
  const demandRateInvalid = demandRate === null || demandRate < 0;
  const breakInvalid =
    breakRaw !== "" &&
    (breakAfter === null ||
      breakAfter <= 0 ||
      (totalMonths !== null && breakAfter > totalMonths));

  const fieldsUsable =
    !principalInvalid &&
    !rateInvalid &&
    !termInvalid &&
    !cyclesInvalid &&
    !demandRateInvalid &&
    !breakInvalid;

  const result = fieldsUsable
    ? computeTermDeposit({
        principal,
        annualRatePercent: rate,
        termMonths: term,
        payout,
        cycles,
        compoundOnRollover: fields.values.compound === "yes",
        demandRatePercent: demandRate,
        breakAfterMonths: breakAfter ?? undefined,
      })
    : null;

  // Every field is valid, but the term does not divide into whole payout
  // periods — a product that does not exist rather than a bad entry.
  const payoutMismatch = fieldsUsable && result === null;

  // The rollover choice is inert when interest has already been paid out.
  const compoundIgnored =
    fields.values.compound === "yes" &&
    payout !== "maturity" &&
    cycles !== null &&
    cycles > 1;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.depositGroup}>
        <NumberField
          {...fields.bind("principal")}
          label={C.form.principalLabel}
          unit={C.form.principalUnit}
          help={C.form.principalHelp}
          error={C.form.principalInvalid}
          invalid={principalInvalid}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
        <SelectField
          {...fields.bind("payout")}
          label={C.form.payoutLabel}
          help={C.form.payoutHelp}
          options={[
            { value: "maturity", label: C.form.payoutMaturity },
            { value: "monthly", label: C.form.payoutMonthly },
            { value: "quarterly", label: C.form.payoutQuarterly },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.rolloverGroup} className="mt-8">
        <NumberField
          {...fields.bind("cycles")}
          label={C.form.cyclesLabel}
          help={C.form.cyclesHelp}
          error={C.form.cyclesInvalid}
          invalid={cyclesInvalid}
        />
        <RadioGroupField
          {...fields.bind("compound")}
          legend={C.form.compoundLegend}
          help={C.form.compoundHelp}
          options={[
            { value: "yes", label: C.form.compoundYes },
            { value: "no", label: C.form.compoundNo },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.earlyGroup} className="mt-8">
        <NumberField
          {...fields.bind("demandRate")}
          label={C.form.demandRateLabel}
          unit={C.form.demandRateUnit}
          help={C.form.demandRateHelp}
          error={C.form.demandRateInvalid}
          invalid={demandRateInvalid}
        />
        <NumberField
          {...fields.bind("breakAfter")}
          label={C.form.breakLabel}
          help={C.form.breakHelp}
          error={C.form.breakInvalid}
          invalid={breakInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.totalValueLabel}
          value={money(result?.totalValue)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.effectiveLabel}
          value={
            result ? formatPercent(result.effectiveAnnualPercent, 3) : null
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.perPayoutLabel}
          value={money(result?.interestPerPayout)}
        />
        <ResultRow
          label={C.form.payoutCountLabel}
          value={
            result
              ? `${formatDecimal(result.payoutCount, 0)} ${C.form.timesUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.totalMonthsLabel}
          value={
            result
              ? `${formatDecimal(result.totalMonths, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.finalPrincipalLabel}
          value={money(result?.finalPrincipal)}
        />
        <ResultRow
          label={C.form.compoundedLabel}
          value={
            result === null ? null : result.compounded ? C.form.yes : C.form.no
          }
        />
      </ResultGroup>

      {/* Only rendered when the user asked about breaking early. */}
      {result !== null && result.earlyLoss !== null ? (
        <ResultGroup title={C.form.earlyTitle} className="mt-4" live={false}>
          <ResultRow
            label={C.form.earlyInterestLabel}
            value={money(result.earlyInterest)}
          />
          <ResultRow
            label={C.form.earlyForegoneLabel}
            value={money(result.earlyForegoneInterest)}
          />
          <ResultRow
            label={C.form.earlyLossLabel}
            value={money(result.earlyLoss)}
          />
        </ResultGroup>
      ) : null}

      {payoutMismatch ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.payoutMismatchNotice}
        </p>
      ) : null}

      {compoundIgnored ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.compoundIgnoredNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
