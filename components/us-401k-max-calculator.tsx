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
import { computeUs401kMax, type Us401kMaxInput } from "@/lib/calc/us-401k-max";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";

const F = C.form;
const T = F.table;

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** The four payroll frequencies, labelled in the content file. */
const PERIOD_OPTIONS = [
  { value: "26", label: F.periodOptions.biweekly },
  { value: "24", label: F.periodOptions.semimonthly },
  { value: "12", label: F.periodOptions.monthly },
  { value: "52", label: F.periodOptions.weekly },
];

/** Keeps the per-period table readable when payroll is weekly. */
const MAX_TABLE_ROWS = 26;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "toi-da-401k-nhap";
const RESULT_ID = "toi-da-401k-ket-qua";

export function Us401kMaxCalculator({
  /**
   * The near-answer action slot — the reciprocal `gop-401k` link, moved out of
   * the route's `afterCalculator`. An independent review measured that link
   * 426 px (mobile) and 1288,5 px (desktop) below the end of the full result
   * region, behind the comparison table. Same link, same context, placed where
   * the near-answer requirement puts it; see `us-401k-calculator.tsx` for why
   * it cannot go through `ResultActions`.
   */
  actions,
}: {
  actions?: React.ReactNode;
} = {}) {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const periodsPerYear = Number(v.periods);
  const age = parseCount(v.age);
  const elapsed = parseCount(v.elapsed);
  const salary = parseMoney(v.salary);
  const contributed = parseMoney(v.contributed);
  const matchPercent = parseDecimal(v.matchPercent);
  const matchLimit = parseDecimal(v.matchLimit);
  const frontLoad = parseDecimal(v.frontLoad);

  const invalid = {
    age: age === null || age > 120,
    elapsed: elapsed === null || elapsed > periodsPerYear,
    salary: salary === null || salary < 0,
    contributed: contributed === null || contributed < 0,
    matchPercent:
      matchPercent === null || matchPercent < 0 || matchPercent > 200,
    matchLimit: matchLimit === null || matchLimit < 0 || matchLimit > 100,
    frontLoad: frontLoad === null || frontLoad < 0 || frontLoad > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: Us401kMaxInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualSalary: salary!,
        payPeriodsPerYear: periodsPerYear,
        periodsElapsed: elapsed!,
        contributedSoFar: contributed!,
        employerMatchPercent: matchPercent!,
        employerMatchLimitPercent: matchLimit!,
        frontLoadPercent: frontLoad!,
      };

  const result = input === null ? null : computeUs401kMax(input);

  const step =
    result === null
      ? 1
      : Math.ceil(result.planned.deferrals.length / MAX_TABLE_ROWS);

  const rows =
    result === null
      ? []
      : result.planned.deferrals
          .map((amount, index) => ({ amount, index }))
          .filter(({ index }) => index % step === 0)
          .map(({ amount, index }) => [
            String(index + 1),
            usd(amount),
            usd(result.planned.matches[index]),
            usd(result.frontLoaded.deferrals[index]),
            usd(result.frontLoaded.matches[index]),
          ]);

  /*
   * CSV row 49 is "Theo nhóm + kết quả", so `columns="split"` with the page's
   * `wide`. Its clauses: lead with the per-paycheck amount, treat the
   * match/front-load table as an expanded comparison, and explain the missing
   * per-paycheck values SEPARATELY by cause.
   *
   * The causes are genuinely different, and the engine is what says so —
   * `lib/calc/us-401k-max.ts` lines 237-238 and 302-305:
   *
   *   - `perPeriodAmount` is null ONLY when `periodsRemaining <= 0`. With
   *     paychecks left and no room, it is 0 — a real answer.
   *   - `perPeriodPercent` is additionally null when `payPerPeriod <= 0`,
   *     which is the zero-salary case and leaves the amount above intact.
   *   - `alreadyAtLimit` and `overLimit` are separate states again, and
   *     neither of them blanks a row.
   *
   * So four notices, each mounted beside what it explains, instead of one
   * sentence covering a dash whose cause it cannot know.
   *
   * `maxStillPossible` moved UP into the answer group: `unreachableNotice`
   * calls it "dòng … ở trên", and when the ceiling is out of reach it is the
   * real answer rather than reference material.
   *
   * `sticky`: nine controls in three groups. The measured precedent is a
   * split, `wide`, six-control form at 1143,75 px
   * (`components/black-scholes-calculator.tsx`), where the result region sat
   * at y −382..−140 with the last field focused; `lg:items-start` keeps the
   * result column at the top of the grid, so the split alone does not hold the
   * answer on screen. This form's own height has NOT been measured.
   *
   * The pinned answer is the per-paycheck amount, which is `null` whenever the
   * ceiling is out of reach — `ResultCta` renders the same placeholder the row
   * does, so the pin repeats the row's state rather than inventing a figure.
   *
   * `computeUs401kMax` is untouched, and so is the table's measured
   * `mobileCards` decision.
   */
  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  const answerValue =
    result === null || result.perPeriodAmount === null
      ? null
      : usdCents(result.perPeriodAmount);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.payGroup}>
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
              <SelectField
                {...fields.bind("periods")}
                label={F.periodsLabel}
                help={F.periodsHelp}
                options={PERIOD_OPTIONS}
              />
            </FieldGroup>

            <FieldGroup title={F.progressGroup} className="mt-8">
              <NumberField
                {...fields.bind("elapsed")}
                label={F.elapsedLabel}
                unit={F.elapsedUnit}
                help={F.elapsedHelp}
                error={F.elapsedInvalid}
                invalid={invalid.elapsed}
              />
              <NumberField
                {...fields.bind("contributed")}
                label={F.contributedLabel}
                unit={F.contributedUnit}
                help={F.contributedHelp}
                error={F.moneyInvalid}
                invalid={invalid.contributed}
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
                {...fields.bind("frontLoad")}
                label={F.frontLoadLabel}
                unit={F.frontLoadUnit}
                help={F.frontLoadHelp}
                error={F.percentInvalid}
                invalid={invalid.frontLoad}
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
            answer={{ label: F.perPeriodLabel, value: answerValue }}
          />
        }
        primary={
          <>
            {/* The per-paycheck amount leads, because it is the only figure
                on the page the reader types into a payroll system. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.perPeriodLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.perPeriodPercentLabel}
                value={
                  result === null || result.perPeriodPercent === null
                    ? null
                    : formatPercent(result.perPeriodPercent, 2)
                }
              />
              <ResultRow
                label={F.roomLabel}
                value={result === null ? null : usd(result.remainingRoom)}
              />
              <ResultRow
                label={F.periodsLeftLabel}
                value={result === null ? null : String(result.periodsRemaining)}
              />
              <ResultRow
                label={F.maxPossibleLabel}
                value={result === null ? null : usd(result.maxStillPossible)}
              />
            </ResultGroup>

            {/* FOUR CAUSES, FOUR SENTENCES, beside the rows they explain. */}
            {result !== null && result.perPeriodAmount === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noPeriodsNotice}
              </p>
            ) : null}

            {result !== null &&
            result.perPeriodAmount !== null &&
            result.perPeriodPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noPayPercentNotice}
              </p>
            ) : null}

            {result !== null && result.exceedsPay ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.unreachableNotice}
              </p>
            ) : null}

            {result !== null && result.overLimit > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.overLimitNotice}
              </p>
            ) : result !== null && result.alreadyAtLimit ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.atLimitNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* The reader's OWN schedule, and what a per-period plan costs
                it. This is their money under the answer above, so it is not
                the disclosed half of the comparison. */}
            <ResultGroup title={F.yourPlanTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.yourMatchPeriodLabel}
                value={
                  result === null
                    ? null
                    : usdCents(result.planned.matchPerPeriodPlan)
                }
              />
              <ResultRow
                label={F.yourMatchTrueUpLabel}
                value={
                  result === null ? null : usdCents(result.planned.matchTrueUpPlan)
                }
              />
              <ResultRow
                label={F.yourLostLabel}
                value={
                  result === null
                    ? null
                    : usdCents(result.planned.matchLostWithoutTrueUp)
                }
              />
              <ResultRow
                label={F.yourUnderLabel}
                value={
                  result === null
                    ? null
                    : String(result.planned.underThresholdPeriods)
                }
              />
            </ResultGroup>

            {/* Which of the two true-up worlds the reader is in — a reading
                of the group above, so it stays with it.

                FOUR STATES, NOT TWO. A notice here may not assert a cause the
                rows above report as zero, and may not judge a division that
                does not exist:

                - no period left (`perPeriodAmount === null`): there is no
                  schedule to call safe, which `evenNotice` was doing;
                - a loss WITH under-threshold periods: the original sentence,
                  whose named cause is the reported one;
                - a loss with `underThresholdPeriods === 0`: the loss is the
                  gap between the two matching methods, and that is all this
                  calculation supports saying;
                - no loss: the division really does earn the whole match.

                Copy only. No engine or matching-rule change. */}
            {result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {result.perPeriodAmount === null
                  ? F.noDivisionMatchNotice
                  : result.planned.matchLostWithoutTrueUp <= 0
                    ? F.evenNotice
                    : result.planned.underThresholdPeriods > 0
                      ? F.lostMatchNotice
                      : F.lostMatchNoUnderPeriodsNotice}
              </p>
            ) : null}
          </>
        }
        actions={actions}
        detail={
          <>
            {/* The other scenario, and the paycheck-by-paycheck table that
                proves it: an expanded comparison, per the row. */}
            <DetailDisclosure title={F.comparisonDisclosureTitle}>
              <ResultGroup title={F.frontTitle} live={false}>
                <ResultRow
                  label={F.frontEmptyLabel}
                  value={
                    result === null
                      ? null
                      : String(result.frontLoaded.emptyPeriods)
                  }
                />
                <ResultRow
                  label={F.frontMatchPeriodLabel}
                  value={
                    result === null
                      ? null
                      : usdCents(result.frontLoaded.matchPerPeriodPlan)
                  }
                />
                <ResultRow
                  label={F.frontMatchTrueUpLabel}
                  value={
                    result === null
                      ? null
                      : usdCents(result.frontLoaded.matchTrueUpPlan)
                  }
                />
                <ResultRow
                  label={F.frontLostLabel}
                  value={
                    result === null
                      ? null
                      : usdCents(result.frontLoaded.matchLostWithoutTrueUp)
                  }
                />
              </ResultGroup>

              {rows.length > 0 ? (
                <>
                  {/* The table's assumption stays WITH the table: it is what
                      makes the two match columns legible. */}
                  <p className="mt-6 text-sm leading-relaxed text-ink-3">
                    {T.intro}
                  </p>
                  <ResultTable
                    className="mt-4"
                    caption={T.caption}
                    columns={[
                      { label: T.periodColumn },
                      { label: T.yourColumn, numeric: true },
                      { label: T.yourMatchColumn, numeric: true },
                      { label: T.frontColumn, numeric: true },
                      { label: T.frontMatchColumn, numeric: true },
                    ]}
                    rows={rows}
                    // Five columns, so `mobileCards` per docs §3. Measured at a
                    // verified 390 px viewport on 2026-09-16: 463 px inside a 300 px
                    // frame. This page carried the highest COUNT of over-wide
                    // elements in the suite (31) despite the narrowest table of the
                    // seven, because the table repeats per pay period.
                    mobileCards
                  />
                </>
              ) : null}
            </DetailDisclosure>

            {/* Reference material: the year's ceiling and the match
                threshold it is measured against. */}
            <DetailDisclosure
              title={F.limitsDisclosureTitle}
              className="mt-4"
            >
              <ResultGroup title={F.limitTitle} live={false}>
                <ResultRow
                  label={F.limitLabel}
                  value={result === null ? null : usd(result.limit)}
                />
                <ResultRow
                  label={F.catchUpLabel}
                  value={result === null ? null : usd(result.catchUpAvailable)}
                />
                <ResultRow
                  label={F.payPerPeriodLabel}
                  value={result === null ? null : usdCents(result.payPerPeriod)}
                />
                <ResultRow
                  label={F.thresholdLabel}
                  value={
                    result === null
                      ? null
                      : usdCents(result.matchThresholdPerPeriod)
                  }
                />
                <ResultRow
                  label={F.thresholdAnnualLabel}
                  value={
                    result === null ? null : usdCents(result.matchThresholdAnnual)
                  }
                />
              </ResultGroup>
            </DetailDisclosure>
          </>
        }
      />
    </CalculatorCard>
  );
}
