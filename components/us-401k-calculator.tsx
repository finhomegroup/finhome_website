"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUs401k, type Us401kInput } from "@/lib/calc/us-401k";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_401K as C } from "@/content/calculators/us-401k";

const F = C.form;
const T = F.table;

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** Deferral percents the sensitivity table always shows. */
const TABLE_PERCENTS = [0, 2, 4, 6, 8, 10, 15];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "gop-401k-nhap";
const RESULT_ID = "gop-401k-ket-qua";

export function Us401kCalculator({
  /**
   * The near-answer action slot. This page's one relevant next step is the
   * reciprocal `toi-da-401k` link, which the route used to render in
   * `afterCalculator` — below the full-width detail band, an independently
   * measured 2611,5 px (mobile) and 2286,5 px (desktop) past the answer. It is
   * the same link with the same destination and context, moved to where the
   * audit's "1–2 hành động ngay sau câu trả lời" requirement puts it.
   *
   * NOT `ResultActions`: `next-steps.ts` forbids an entry on a library-shelved
   * row, which is the guard that keeps a housing funnel off the US tools.
   */
  actions,
}: {
  actions?: React.ReactNode;
} = {}) {
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. Age and years are counts; the year is a list.
  const fields = useCalcFields(F.defaults, {
    salary: "money",
    priorYearWages: "money",
    deferral: "rate",
    matchPercent: "rate",
    matchLimit: "rate",
    extra: "rate",
    marginal: "rate",
    returnPercent: "rate",
  });
  const v = fields.values;

  const age = parseCount(v.age);
  const years = parseCount(v.years);
  const salary = parseMoney(v.salary);
  const priorYearWages = parseMoney(v.priorYearWages);
  const deferral = parseDecimal(v.deferral);
  const matchPercent = parseDecimal(v.matchPercent);
  const matchLimit = parseDecimal(v.matchLimit);
  const extra = parseDecimal(v.extra);
  const marginal = parseDecimal(v.marginal);
  const returnPercent = parseDecimal(v.returnPercent);

  const invalid = {
    age: age === null || age > 120,
    years: years === null || years > 70,
    salary: salary === null || salary < 0,
    priorYearWages: priorYearWages === null || priorYearWages < 0,
    deferral: deferral === null || deferral < 0 || deferral > 100,
    matchPercent:
      matchPercent === null || matchPercent < 0 || matchPercent > 200,
    matchLimit: matchLimit === null || matchLimit < 0 || matchLimit > 100,
    extra: extra === null || extra < 0 || extra > 100,
    marginal: marginal === null || marginal < 0 || marginal > 100,
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: Us401kInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualSalary: salary!,
        priorYearWages: priorYearWages!,
        deferralPercent: deferral!,
        employerMatchPercent: matchPercent!,
        employerMatchLimitPercent: matchLimit!,
        employerExtraPercent: extra!,
        marginalRatePercent: marginal!,
        returnPercent: returnPercent!,
        years: years!,
      };

  const result = input === null ? null : computeUs401k(input);

  // The elected percent joins the fixed list so the reader's own choice is
  // always a row they can find, and the match threshold joins it so the row
  // where the forfeited column reaches zero is always visible.
  const rows =
    result === null || input === null
      ? []
      : Array.from(
          new Set(
            [
              ...TABLE_PERCENTS,
              input.deferralPercent,
              input.employerMatchLimitPercent,
            ]
              .filter((percent) => percent >= 0 && percent <= 100)
              .map((percent) => Math.round(percent * 100) / 100),
          ),
        )
          .sort((a, b) => a - b)
          .map((percent) => {
            const at = computeUs401k({ ...input, deferralPercent: percent });
            return [
              formatPercent(percent, percent % 1 === 0 ? 0 : 2),
              at === null ? null : usd(at.deferral),
              at === null ? null : usd(at.employerMatch),
              at === null ? null : usd(at.unclaimedMatch),
              at === null ? null : usd(at.totalContribution),
              at === null ? null : usd(at.netCostOfDeferral),
              at === null ? null : usd(at.projectedBalance),
            ];
          });

  /*
   * CSV row 48 is "Theo nhóm + kết quả", so `columns="split"` with the page's
   * `wide`. Its two clauses: emphasise the forfeited match, and keep the
   * conditions ahead of the projection.
   *
   * The first clause was already half-satisfied — the group has led with the
   * forfeited match since the page shipped — so this pass adds only the
   * `emphasis` that makes it the answer rather than the first of four equal
   * rows. Per the evaluated review: apply the missing change, not the whole
   * row again.
   *
   * The second clause is the real move. All five notices used to sit BELOW
   * the statutory ladder, the horizon group and a seven-column table, so a
   * capped deferral or a capped plan compensation — each of which changes
   * whether the figure above is the reader's real number — was read after the
   * projection it invalidates. They are now directly under the answer, and
   * the ladder is disclosed.
   *
   * `sticky`: eleven controls in three groups. The measured precedent is a
   * split, `wide`, six-control form at 1143,75 px
   * (`components/black-scholes-calculator.tsx`), where focusing the last field
   * left the result region at y −382..−140 — `lg:items-start` holds the result
   * column at the top of the grid, so a split layout does not keep the answer
   * on screen by itself. This form's own height has NOT been measured.
   *
   * `computeUs401k` is untouched. The sensitivity table keeps its measured
   * `mobileCards` decision and its assumption line stays with it.
   */
  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  const answerValue =
    result === null ? null : usdCents(result.unclaimedMatch);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.incomeGroup}>
              <SelectField
                {...fields.bind("year")}
                label={F.yearLabel}
                help={F.yearHelp}
                options={YEAR_OPTIONS}
              />
              <NumberField
                {...fields.bind("age")}
                label={F.ageLabel}
                unit={F.ageUnit}
                help={F.ageHelp}
                error={F.ageInvalid}
                invalid={invalid.age}
              />
              <NumberField
                {...fields.bind("salary")}
                label={F.salaryLabel}
                unit={F.salaryUnit}
                help={F.salaryHelp}
                error={F.moneyInvalid}
                invalid={invalid.salary}
              />
              <NumberField
                {...fields.bind("priorYearWages")}
                label={F.priorYearWagesLabel}
                unit={F.priorYearWagesUnit}
                help={F.priorYearWagesHelp}
                error={F.moneyInvalid}
                invalid={invalid.priorYearWages}
              />
              <NumberField
                {...fields.bind("deferral")}
                label={F.deferralLabel}
                unit={F.deferralUnit}
                help={F.deferralHelp}
                error={F.percentInvalid}
                invalid={invalid.deferral}
              />
            </FieldGroup>

            <FieldGroup title={F.matchGroup} className="mt-8">
              <NumberField
                {...fields.bind("matchPercent")}
                label={F.matchPercentLabel}
                unit={F.matchPercentUnit}
                help={F.matchPercentHelp}
                error={F.matchPercentInvalid}
                invalid={invalid.matchPercent}
              />
              <NumberField
                {...fields.bind("matchLimit")}
                label={F.matchLimitLabel}
                unit={F.matchLimitUnit}
                help={F.matchLimitHelp}
                error={F.percentInvalid}
                invalid={invalid.matchLimit}
              />
              <NumberField
                {...fields.bind("extra")}
                label={F.extraLabel}
                unit={F.extraUnit}
                help={F.extraHelp}
                error={F.percentInvalid}
                invalid={invalid.extra}
              />
            </FieldGroup>

            <FieldGroup title={F.planGroup} className="mt-8">
              <NumberField
                {...fields.bind("marginal")}
                label={F.marginalLabel}
                unit={F.marginalUnit}
                help={F.marginalHelp}
                error={F.percentInvalid}
                invalid={invalid.marginal}
              />
              <NumberField
                {...fields.bind("returnPercent")}
                label={F.returnLabel}
                unit={F.returnUnit}
                help={F.returnHelp}
                error={F.rateInvalid}
                invalid={invalid.returnPercent}
              />
              <NumberField
                {...fields.bind("years")}
                label={F.yearsLabel}
                unit={F.yearsUnit}
                help={F.yearsHelp}
                error={F.yearsInvalid}
                invalid={invalid.years}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={{ label: F.unclaimedLabel, value: answerValue }}
          />
        }
        primary={
          <>
            {/* The forfeited match leads and is now the emphasised figure;
                its value at the horizon sits under it, because the annual
                number is small enough to shrug at and that one is not. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.unclaimedLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.unclaimedHorizonLabel}
                value={result === null ? null : usd(result.unclaimedMatchAtHorizon)}
              />
              <ResultRow
                label={F.matchLabel}
                value={result === null ? null : usdCents(result.employerMatch)}
              />
              <ResultRow
                label={F.totalLabel}
                value={
                  result === null ? null : usdCents(result.totalContribution)
                }
              />
            </ResultGroup>

            {/* THE CONDITIONS, ahead of the projection rather than after it.
                Each one decides whether the figure above is this reader's
                real number. */}
            {result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {result.unclaimedMatch > 0
                  ? F.unclaimedNotice
                  : F.fullMatchNotice}
              </p>
            ) : null}

            {result?.deferralCapped ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.cappedNotice}
              </p>
            ) : null}

            {result?.compensationCapped ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.compCappedNotice}
              </p>
            ) : null}

            {result !== null && result.excessAdditions > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.excessNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* What it costs the reader to claim the match, and the percent
                they must reach to claim all of it. Actionable this year, so
                not disclosed. */}
            <ResultGroup title={F.yourMoneyTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.deferralLabelResult}
                value={result === null ? null : usdCents(result.deferral)}
              />
              <ResultRow
                label={F.taxSavedLabel}
                value={result === null ? null : usdCents(result.incomeTaxSaved)}
              />
              <ResultRow
                label={F.netCostLabel}
                value={
                  result === null ? null : usdCents(result.netCostOfDeferral)
                }
              />
              <ResultRow
                label={F.matchReturnLabel}
                value={
                  result === null || result.matchReturnPercent === null
                    ? null
                    : formatPercent(result.matchReturnPercent, 0)
                }
              />
              <ResultRow
                label={F.thresholdLabel}
                value={
                  result === null
                    ? null
                    : `${formatPercent(
                        result.matchThresholdPercent,
                        0,
                      )} = ${usdCents(result.matchThresholdAmount)}`
                }
              />
            </ResultGroup>
          </>
        }
        actions={actions}
        detail={
          <>
            {/* Reference material: which of the four ceilings blocks what.
                Nothing here changes what to do about the forfeited match —
                the notices above already say that — so it is disclosed. */}
            <DetailDisclosure title={F.limitsDisclosureTitle}>
              <ResultGroup title={F.limitTitle} live={false}>
                <ResultRow
                  label={F.deferralLimitLabel}
                  value={result === null ? null : usd(result.deferralLimit)}
                />
                <ResultRow
                  label={F.catchUpLabel}
                  value={result === null ? null : usd(result.catchUpAvailable)}
                />
                <ResultRow
                  label={F.planCompLabel}
                  value={result === null ? null : usd(result.planCompensation)}
                />
                <ResultRow
                  label={F.additionsLimitLabel}
                  value={
                    result === null ? null : usd(result.params.annualAdditions)
                  }
                />
                <ResultRow
                  label={F.excessLabel}
                  value={result === null ? null : usd(result.excessAdditions)}
                />
              </ResultGroup>
            </DetailDisclosure>

            <ResultGroup title={F.horizonTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.projectedLabel}
                value={result === null ? null : usd(result.projectedBalance)}
              />
              <ResultRow
                label={F.withoutMatchLabel}
                value={result === null ? null : usd(result.projectedWithoutMatch)}
              />
              <ResultRow
                label={F.matchValueLabel}
                value={result === null ? null : usd(result.matchValueAtHorizon)}
              />
              <ResultRow
                label={F.contributedLabel}
                value={result === null ? null : usd(result.totalContributed)}
              />
            </ResultGroup>

            {rows.length > 0 ? (
              <>
                {/* The table's assumption stays WITH the table, visible: it
                    is what makes the "bỏ lại" column legible. */}
                <p className="mt-8 text-sm leading-relaxed text-ink-3">
                  {T.intro}
                </p>
                <ResultTable
                  className="mt-4"
                  caption={T.caption}
                  columns={[
                    { label: T.percentColumn },
                    { label: T.yoursColumn, numeric: true },
                    { label: T.matchColumn, numeric: true },
                    { label: T.unclaimedColumn, numeric: true },
                    { label: T.totalColumn, numeric: true },
                    { label: T.netColumn, numeric: true },
                    { label: T.projectedColumn, numeric: true },
                  ]}
                  rows={rows}
                  // Seven columns, so `mobileCards` per docs §3. Measured at a
                  // verified 390 px viewport on 2026-09-16: 750 px inside a 300 px
                  // frame — a ratio of 2,50, the worst in the suite. Rows are
                  // contribution percentages, so a card per row is one rate's whole
                  // outcome, which is how this page is read.
                  mobileCards
                />
              </>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
