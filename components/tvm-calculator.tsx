"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { solveTvm, type TvmSolveFor } from "@/lib/calc/tvm";
import {
  answerTvmQuestion,
  MAX_QUESTION_MONTHS,
  type TvmQuestion,
} from "@/lib/calc/tvm-questions";
import { tvmTimelineModel } from "@/lib/calc/charts/tvm-timeline-chart";
import { TVM as C } from "@/content/calculators/tvm";

/**
 * QUESTION FIRST, ADVANCED PRESERVED — original row 18.
 *
 * The page used to open on "chọn đại lượng cần tìm: PV / FV / PMT / N / r",
 * which is the right interface for somebody who already thinks in those
 * letters and the wrong one for somebody asking how long until they have
 * enough for a deposit. The three questions come first; the five-quantity
 * solver is the fourth mode, unchanged, because it is the only tool in the
 * suite that takes a loan with a non-zero closing balance or a payment at the
 * start of a period.
 *
 * ONE LIVE RESULTS REGION, ACROSS BOTH MODES. docs §4 allows exactly one per
 * page, so there is exactly one live ResultGroup and its ROWS change with the
 * mode. (Written without the angle bracket on purpose: `live-region.test.ts`
 * splits the source on the opening tag, so a mention in a comment counts as a
 * group.) The alternative — a second live group for the advanced solver — would
 * breach the convention; making the advanced one `live={false}` would drop the
 * announcement for the readers who most need it.
 */

/** The four modes. The first three are questions; the fourth is the solver. */
const MODES = [
  { value: "balanceAfter", label: C.question.modeBalance },
  { value: "contributionNeeded", label: C.question.modeContribution },
  { value: "monthsNeeded", label: C.question.modeMonths },
  { value: "advanced", label: C.question.modeAdvanced },
] as const;

/** Which field each advanced mode solves for — that field is hidden. */
const SOLVE_OPTIONS = [
  { value: "payment", label: C.form.solvePayment },
  { value: "presentValue", label: C.form.solvePresent },
  { value: "futureValue", label: C.form.solveFuture },
  { value: "periods", label: C.form.solvePeriods },
  { value: "rate", label: C.form.solveRate },
] as const;

export function TvmCalculator() {
  const fields = useCalcFields({
    mode: C.question.defaultMode,

    // The guided question's own fields. Everything positive.
    savings: C.question.defaultSavings,
    contribution: C.question.defaultContribution,
    goal: C.question.defaultGoal,
    months: C.question.defaultMonths,
    annualRate: C.question.defaultRate,

    // The advanced solver, unchanged.
    solveFor: C.form.defaultSolveFor,
    present: C.form.defaultPresent,
    future: C.form.defaultFuture,
    payment: C.form.defaultPayment,
    periods: C.form.defaultPeriods,
    rate: C.form.defaultRate,
    timing: C.form.defaultTiming,
  });

  const mode = fields.values.mode as TvmQuestion | "advanced";
  const advanced = mode === "advanced";
  const question: TvmQuestion | null = advanced ? null : mode;

  // ---------------------------------------------------------------- guided
  // `parseCount` for the month count, not `parseMoney` or `parseDecimal`:
  // docs §4. `parseMoney("3.0")` is 30 and eats the dot before any integer
  // guard can run, and `parseDecimal("1.000")` is 1.
  const savings = parseMoney(fields.values.savings);
  const contribution = parseMoney(fields.values.contribution);
  const goal = parseMoney(fields.values.goal);
  const months = parseCount(fields.values.months);
  const annualRate = parseDecimal(fields.values.annualRate);

  const needsGoal = question !== null && question !== "balanceAfter";
  const needsContribution = question !== "contributionNeeded";
  const needsMonths = question !== null && question !== "monthsNeeded";

  const savingsInvalid = savings === null || savings < 0;
  const contributionInvalid =
    needsContribution && (contribution === null || contribution < 0);
  const goalInvalid = needsGoal && (goal === null || goal <= 0);
  const monthsInvalid =
    needsMonths &&
    (months === null || months < 1 || months > MAX_QUESTION_MONTHS);
  const annualRateInvalid = annualRate === null || annualRate < 0;

  const questionUsable =
    question !== null &&
    !savingsInvalid &&
    !contributionInvalid &&
    !goalInvalid &&
    !monthsInvalid &&
    !annualRateInvalid;

  const answer = questionUsable
    ? answerTvmQuestion({
        question,
        currentSavings: savings!,
        monthlyContribution: needsContribution ? contribution! : 0,
        goal: needsGoal ? goal! : undefined,
        months: needsMonths ? months! : undefined,
        annualRatePercent: annualRate!,
      })
    : null;

  const chart = tvmTimelineModel(answer, C.chart);

  // -------------------------------------------------------------- advanced
  const solveFor = fields.values.solveFor as TvmSolveFor;
  const present = parseMoney(fields.values.present);
  const future = parseMoney(fields.values.future);
  const payment = parseMoney(fields.values.payment);
  const periods = parseDecimal(fields.values.periods);
  const rate = parseDecimal(fields.values.rate);

  const presentInvalid = solveFor !== "presentValue" && present === null;
  const futureInvalid = solveFor !== "futureValue" && future === null;
  const paymentInvalid = solveFor !== "payment" && payment === null;
  const periodsInvalid =
    solveFor !== "periods" && (periods === null || periods <= 0);
  const rateInvalid = solveFor !== "rate" && (rate === null || rate <= -100);

  const advancedUsable =
    advanced &&
    !presentInvalid &&
    !futureInvalid &&
    !paymentInvalid &&
    !periodsInvalid &&
    !rateInvalid;

  const result = advancedUsable
    ? solveTvm({
        solveFor,
        presentValue:
          solveFor === "presentValue" ? undefined : (present ?? undefined),
        futureValue:
          solveFor === "futureValue" ? undefined : (future ?? undefined),
        payment: solveFor === "payment" ? undefined : (payment ?? undefined),
        periods: solveFor === "periods" ? undefined : (periods ?? undefined),
        ratePercentPerPeriod:
          solveFor === "rate" ? undefined : (rate ?? undefined),
        paymentAtBeginning: fields.values.timing === "beginning",
      })
    : null;

  const noSolution = advancedUsable && result === null;
  const noAnswer = questionUsable && answer === null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  /** The one row that answers the question the reader asked. */
  const solvedValue = () => {
    if (result === null) return null;
    switch (result.solvedFor) {
      case "presentValue":
        return money(result.presentValue);
      case "futureValue":
        return money(result.futureValue);
      case "payment":
        return money(result.payment);
      case "periods":
        return formatDecimal(result.periods, 4);
      case "rate":
        return formatPercent(result.ratePercentPerPeriod, 6);
    }
  };

  const solvedLabel =
    SOLVE_OPTIONS.find((option) => option.value === solveFor)?.label ?? "";

  /** The guided answer's own label and value, per question. */
  const guidedLabel = () => {
    switch (question) {
      case "contributionNeeded":
        return C.question.contributionAnswerLabel;
      case "monthsNeeded":
        return C.question.monthsAnswerLabel;
      default:
        return C.question.balanceAnswerLabel;
    }
  };

  /** True when the money already there covers the goal at this horizon. */
  const noContributionNeeded =
    answer?.question === "contributionNeeded" &&
    answer.requiredMonthlyContribution !== null &&
    answer.requiredMonthlyContribution <= 0;

  const guidedValue = () => {
    if (answer === null) return null;
    switch (answer.question) {
      case "contributionNeeded":
        // THE PLAN, not the algebra. A negative solve means no contribution
        // is needed, and that is what the chart draws; the signed figure is
        // a different question and lives in the detail block.
        return noContributionNeeded
          ? `${money(0)} — ${C.question.alreadyEnoughLabel}`
          : money(answer.monthlyContribution);
      case "monthsNeeded":
        return answer.fundedMonth === null
          ? null
          : `${formatDecimal(answer.fundedMonth, 0)} ${C.question.monthsUnit}`;
      default:
        return money(answer.balanceAtHorizon);
    }
  };

  return (
    <CalculatorCard>
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.question.modeLegend}
          help={C.question.modeHelp}
          options={MODES.map((option) => ({ ...option }))}
        />
      </FieldGroup>

      {question !== null ? (
        <FieldGroup title={C.question.group} className="mt-8">
          <NumberField
            {...fields.bind("savings")}
            label={C.question.savingsLabel}
            unit={C.question.savingsUnit}
            help={C.question.savingsHelp}
            error={C.question.savingsInvalid}
            invalid={savingsInvalid}
          />
          {/* Hidden in the mode that SOLVES for it, exactly as the advanced
              solver hides the quantity it is finding. */}
          {needsContribution ? (
            <NumberField
              {...fields.bind("contribution")}
              label={C.question.contributionLabel}
              unit={C.question.contributionUnit}
              help={C.question.contributionHelp}
              error={C.question.contributionInvalid}
              invalid={contributionInvalid}
            />
          ) : null}
          {needsGoal ? (
            <NumberField
              {...fields.bind("goal")}
              label={C.question.goalLabel}
              unit={C.question.goalUnit}
              help={C.question.goalHelp}
              error={C.question.goalInvalid}
              invalid={goalInvalid}
            />
          ) : null}
          {needsMonths ? (
            <NumberField
              {...fields.bind("months")}
              label={C.question.monthsLabel}
              help={C.question.monthsHelp}
              error={C.question.monthsInvalid}
              invalid={monthsInvalid}
            />
          ) : null}
          <NumberField
            {...fields.bind("annualRate")}
            label={C.question.rateLabel}
            unit={C.question.rateUnit}
            help={C.question.rateHelp}
            error={C.question.rateInvalid}
            invalid={annualRateInvalid}
          />
        </FieldGroup>
      ) : (
        <>
          {/* The sign convention lives HERE, with the only mode it governs. */}
          <p className="mt-6 text-sm leading-relaxed text-ink-3">
            {C.signNotice}
          </p>

          <FieldGroup className="mt-6">
            <RadioGroupField
              {...fields.bind("solveFor")}
              legend={C.form.solveLegend}
              help={C.form.solveHelp}
              options={SOLVE_OPTIONS.map((option) => ({ ...option }))}
            />
          </FieldGroup>

          <FieldGroup title={C.form.group} className="mt-8">
            {solveFor !== "presentValue" ? (
              <NumberField
                {...fields.bind("present")}
                label={C.form.presentLabel}
                unit={C.form.presentUnit}
                help={C.form.presentHelp}
                error={C.form.presentInvalid}
                invalid={presentInvalid}
              />
            ) : null}
            {solveFor !== "futureValue" ? (
              <NumberField
                {...fields.bind("future")}
                label={C.form.futureLabel}
                unit={C.form.futureUnit}
                help={C.form.futureHelp}
                error={C.form.futureInvalid}
                invalid={futureInvalid}
              />
            ) : null}
            {solveFor !== "payment" ? (
              <NumberField
                {...fields.bind("payment")}
                label={C.form.paymentLabel}
                unit={C.form.paymentUnit}
                help={C.form.paymentHelp}
                error={C.form.paymentInvalid}
                invalid={paymentInvalid}
              />
            ) : null}
            {solveFor !== "periods" ? (
              <NumberField
                {...fields.bind("periods")}
                label={C.form.periodsLabel}
                help={C.form.periodsHelp}
                error={C.form.periodsInvalid}
                invalid={periodsInvalid}
              />
            ) : null}
            {solveFor !== "rate" ? (
              <NumberField
                {...fields.bind("rate")}
                label={C.form.rateLabel}
                unit={C.form.rateUnit}
                help={C.form.rateHelp}
                error={C.form.rateInvalid}
                invalid={rateInvalid}
              />
            ) : null}
            <RadioGroupField
              {...fields.bind("timing")}
              legend={C.form.timingLegend}
              help={C.form.timingHelp}
              options={[
                { value: "end", label: C.form.timingEnd },
                { value: "beginning", label: C.form.timingBeginning },
              ]}
            />
          </FieldGroup>
        </>
      )}

      {/* EXACTLY ONE live results region on this page (docs §4). Its rows are
          the active mode's, so both modes are announced. */}
      <ResultGroup
        title={advanced ? C.form.resultTitle : C.question.resultTitle}
        className="mt-8"
      >
        {advanced ? (
          <>
            <ResultRow label={solvedLabel} value={solvedValue()} />
            <ResultRow
              label={C.form.netInterestLabel}
              value={money(result?.netInterest)}
            />
            <ResultRow
              label={C.form.totalPaymentsLabel}
              value={money(result?.totalPayments)}
            />
          </>
        ) : (
          <>
            <ResultRow label={guidedLabel()} value={guidedValue()} />
            <ResultRow
              label={C.question.paidLabel}
              value={money(answer?.totalContributed)}
            />
            <ResultRow
              label={C.question.interestLabel}
              value={money(answer?.interest)}
            />
          </>
        )}
      </ResultGroup>

      {/* The guided detail: the monthly rate actually used, and — in the "how
          long" question — the algebraic period count BESIDE the funded month,
          never instead of it. */}
      {question !== null ? (
        <ResultGroup
          // The friendly mode's own heading: "Cả năm đại lượng" is the
          // advanced mode's, where there are five.
          title={C.question.detailTitle}
          className="mt-4"
          live={false}
        >
          <ResultRow
            label={C.question.monthlyRateLabel}
            value={answer ? formatPercent(answer.monthlyRatePercent, 6) : null}
          />
          {question === "monthsNeeded" ? (
            <ResultRow
              label={C.question.exactPeriodsLabel}
              value={
                answer?.exactPeriods == null
                  ? null
                  : `${formatDecimal(answer.exactPeriods, 2)} ${C.question.periodsUnit}`
              }
            />
          ) : null}
          {/* The signed algebraic solve, mounted only where it says
              something the headline does not: a plan already funded. */}
          {noContributionNeeded ? (
            <ResultRow
              label={C.question.algebraicContributionLabel}
              value={money(answer?.requiredMonthlyContribution)}
            />
          ) : null}
        </ResultGroup>
      ) : (
        /* All five quantities, so a reader can check the sign of what they
           entered against what the solver used. */
        <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
          <ResultRow
            label={C.form.presentResultLabel}
            value={money(result?.presentValue)}
          />
          <ResultRow
            label={C.form.futureResultLabel}
            value={money(result?.futureValue)}
          />
          <ResultRow
            label={C.form.paymentResultLabel}
            value={money(result?.payment)}
          />
          <ResultRow
            label={C.form.periodsResultLabel}
            value={result ? formatDecimal(result.periods, 4) : null}
          />
          <ResultRow
            label={C.form.rateResultLabel}
            value={result ? formatPercent(result.ratePercentPerPeriod, 6) : null}
          />
          <ResultRow
            label={C.form.annualRateLabel}
            value={
              result ? formatPercent(result.annualRateIfMonthlyPercent, 4) : null
            }
          />
          <ResultRow
            label={C.form.timingResultLabel}
            value={
              result === null
                ? null
                : result.paymentAtBeginning
                  ? C.form.timingBeginning
                  : C.form.timingEnd
            }
          />
        </ResultGroup>
      )}

      {/* The distinction original row 18 turns on: an algebraic period is not
          a month a standing order can be made in. */}
      {question === "monthsNeeded" && answer?.fundedMonth != null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.exactPeriodsNotice}
        </p>
      ) : null}

      {answer?.schedule.status === "alreadyFunded" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.alreadyFundedNotice}
        </p>
      ) : null}

      {answer?.schedule.status === "unattainable" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.unattainableNotice}
        </p>
      ) : null}

      {answer?.schedule.status === "beyondLimit" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.notReachedNotice}
        </p>
      ) : null}

      {/* A solved contribution can come out negative: the money already there
          covers the goal. That is not a contribution, and the page says so
          rather than rendering a negative standing order. */}
      {noContributionNeeded ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.negativeContributionNotice}
        </p>
      ) : null}

      {noAnswer ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.question.noAnswerNotice}
        </p>
      ) : null}

      {noSolution ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noSolutionNotice}
        </p>
      ) : null}

      {/* Original row 18's timeline. Guided mode only: the advanced solver
          allows a payment at the start of a period and a negative rate, and
          `projectSavings` — the one discrete engine behind every schedule in
          this suite — models neither. Drawing one of those from a different
          convention would put the picture and the answer on two models. */}
      {question !== null ? (
        <ChartFigure model={chart}>
          <LineChart model={chart} />
        </ChartFigure>
      ) : null}
    </CalculatorCard>
  );
}
