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
import { computeApr } from "@/lib/calc/apr";
import { APR_ADVANCED as C } from "@/content/calculators/apr-advanced";

/** The five itemised cash-fee boxes, summed into one figure for the module. */
const FEE_FIELDS = [
  {
    key: "arrangement",
    label: C.form.arrangementLabel,
    help: C.form.arrangementHelp,
  },
  { key: "appraisal", label: C.form.appraisalLabel, help: C.form.appraisalHelp },
  { key: "notary", label: C.form.notaryLabel, help: C.form.notaryHelp },
  { key: "insurance", label: C.form.insuranceLabel, help: C.form.insuranceHelp },
  { key: "other", label: C.form.otherLabel, help: C.form.otherHelp },
] as const;

export function AprAdvancedCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    arrangement: C.form.defaultArrangement,
    appraisal: C.form.defaultAppraisal,
    notary: C.form.defaultNotary,
    insurance: C.form.defaultInsurance,
    other: C.form.defaultOther,
    points: C.form.defaultPoints,
    financed: C.form.defaultFinanced,
    payoff: C.form.defaultPayoff,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const points = parseDecimal(fields.values.points);
  const financed = parseMoney(fields.values.financed);

  // Itemisation is presentation: the module takes one upfront total. Each box
  // is validated on its own so the user is told which line is wrong.
  const feeValues = FEE_FIELDS.map((field) =>
    parseMoney(fields.values[field.key]),
  );
  const feeInvalid = feeValues.map(
    (value) => value === null || value < 0,
  );
  // Reached only when every box parsed, so the `?? 0` is unreachable — it is
  // there because the array's element type still admits null.
  const upfrontTotal = feeInvalid.some(Boolean)
    ? null
    : feeValues.reduce<number>((sum, value) => sum + (value ?? 0), 0);

  // Optional: empty means "I'll hold it to term", not a bad entry.
  const payoffRaw = fields.values.payoff.trim();
  const payoff = payoffRaw === "" ? null : parseDecimal(payoffRaw);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const pointsInvalid = points === null || points < 0 || points >= 100;
  const financedInvalid = financed === null || financed < 0;
  const payoffInvalid =
    payoffRaw !== "" &&
    (payoff === null ||
      payoff <= 0 ||
      !Number.isInteger(payoff) ||
      (term !== null && payoff > term));

  const fieldsUsable =
    !amountInvalid &&
    !rateInvalid &&
    !termInvalid &&
    !pointsInvalid &&
    !financedInvalid &&
    !payoffInvalid &&
    upfrontTotal !== null;

  const result = fieldsUsable
    ? computeApr({
        amount,
        annualRatePercent: rate,
        termMonths: term,
        upfrontFees: upfrontTotal,
        financedFees: financed,
        pointsPercent: points,
        payoffMonths: payoff ?? undefined,
      })
    : null;

  // Every box parses but the fees swallow the loan — a note about the
  // combination, not a fault in any single field.
  const feesTooLarge = fieldsUsable && result === null;
  const unsolvable = result !== null && result.aprPercent === null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.loanGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
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
      </FieldGroup>

      <FieldGroup title={C.form.upfrontGroup} className="mt-8">
        {FEE_FIELDS.map((field, index) => (
          <NumberField
            key={field.key}
            {...fields.bind(field.key)}
            label={field.label}
            unit={C.form.feeUnit}
            help={field.help}
            error={C.form.feeInvalid}
            invalid={feeInvalid[index]}
          />
        ))}
        <NumberField
          {...fields.bind("points")}
          label={C.form.pointsLabel}
          unit={C.form.pointsUnit}
          help={C.form.pointsHelp}
          error={C.form.pointsInvalid}
          invalid={pointsInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.financedGroup} className="mt-8">
        <NumberField
          {...fields.bind("financed")}
          label={C.form.financedLabel}
          unit={C.form.financedUnit}
          help={C.form.financedHelp}
          error={C.form.financedInvalid}
          invalid={financedInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.payoffGroup} className="mt-8">
        <NumberField
          {...fields.bind("payoff")}
          label={C.form.payoffLabel}
          help={C.form.payoffHelp}
          error={C.form.payoffInvalid}
          invalid={payoffInvalid}
        />
      </FieldGroup>

      {/* Both APRs together: the to-term figure and the one that applies if
          the borrower does what most borrowers do. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.aprLabel}
          value={
            result?.aprPercent == null
              ? null
              : formatPercent(result.aprPercent, 4)
          }
        />
        <ResultRow
          label={C.form.payoffAprLabel}
          value={
            result?.payoffAprPercent == null
              ? null
              : formatPercent(result.payoffAprPercent, 4)
          }
        />
        <ResultRow
          label={C.form.spreadLabel}
          value={
            result?.aprSpreadPoints == null
              ? null
              : `${formatDecimal(result.aprSpreadPoints, 4)} ${C.form.pointsSuffix}`
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.effectiveLabel}
          value={
            result?.aprEffectivePercent == null
              ? null
              : formatPercent(result.aprEffectivePercent, 4)
          }
        />
        <ResultRow
          label={C.form.paymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.principalLabel}
          value={money(result?.principal)}
        />
        <ResultRow
          label={C.form.netProceedsLabel}
          value={money(result?.netProceeds)}
        />
        <ResultRow
          label={C.form.upfrontTotalLabel}
          value={money(upfrontTotal)}
        />
        <ResultRow
          label={C.form.pointsCostLabel}
          value={money(result?.pointsCost)}
        />
        <ResultRow
          label={C.form.totalFeesLabel}
          value={money(result?.totalFees)}
        />
        <ResultRow
          label={C.form.payoffBalanceLabel}
          value={money(result?.payoffBalance)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.totalCostLabel}
          value={money(result?.totalCost)}
        />
      </ResultGroup>

      {feesTooLarge ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.feesTooLargeNotice}
        </p>
      ) : null}

      {unsolvable ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.unsolvableNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
