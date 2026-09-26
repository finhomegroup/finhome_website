"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { ResultCta } from "@/components/calc/result-cta";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { readDateFields } from "@/lib/calc/date-input";
import type { CalendarDate } from "@/lib/calc/dates";
import {
  computeTermDeposit,
  MAX_DEPOSIT_CYCLES,
  type DepositPayout,
} from "@/lib/calc/term-deposit";
import { planDeposit } from "@/lib/calc/deposit-plan";
import {
  depositChartModel,
  depositTimelineModel,
} from "@/lib/calc/charts/deposit-chart";
import { DepositTimeline } from "@/components/calc/chart/deposit-timeline";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { TERM_DEPOSIT as C } from "@/content/calculators/term-deposit";

const FORM_ID = "tien-gui-co-ky-han-nhap";
const RESULT_ID = "tien-gui-co-ky-han-ket-qua";

/*
 * CSV row 22, "Hai cột": "Đưa tiền thực nhận và thời điểm cần tiền lên đầu;
 * phí/rút sớm vào nhóm riêng."
 *
 * The second clause was ALREADY SATISFIED and is recorded rather than rebuilt:
 * the demand rate and the break month are their own `FieldGroup`, and the
 * early-exit figures are their own `ResultGroup`, rendered only when the
 * reader asked. Both are left exactly as they stand.
 *
 * The first clause is the change, and it is an ordering one in both views. The
 * money the saver actually ends up with was the LAST of four rows in the date
 * view, under two dates and an interest figure; and the date that money is
 * needed — the input the whole view exists to answer against — was a row
 * inside the collapsed day ledger. Both now lead the group, the cash as the
 * page's one emphasised figure. The months view gets the same treatment with
 * the figures it has: the value at maturity, then the horizon it is committed
 * for, which was the third row of the detail group.
 *
 * No engine change and no new arithmetic: every figure moved is the same call
 * on the same `plan`/`result` object, and none of them is now shown twice.
 */
/**
 * The term-deposit calculator, in two views of ONE product.
 *
 * ORIGINAL ROW 20 added the second one. The difference is not cosmetic:
 *
 * - **Theo kỳ hạn** is `computeTermDeposit`, simple interest pro-rated by
 *   `termMonths / 12`. Right for comparing products, and an approximation of
 *   any particular contract.
 * - **Theo ngày** is `planDeposit`, actual days ÷ 365 with the deposit date,
 *   the maturity and the date the money is NEEDED. Right for asking whether
 *   the cash will be there on the day, which is the question a home buyer has.
 *
 * Both views are labelled on the page, because the same "6 tháng" is 181 days
 * from 31/1/2026 and 182 in a leap year — the two views legitimately disagree
 * and a reader must not have to guess which figure they are reading.
 *
 * One live results region, whichever view is showing.
 */
export function TermDepositCalculator({
  actions,
  nextSteps,
}: {
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. The selects and the date parts format
  // nothing.
  const fields = useCalcFields(
    {
      mode: C.form.defaultMode,
      principal: C.form.defaultPrincipal,
      rate: C.form.defaultRate,
      term: C.form.defaultTerm,
      payout: C.form.defaultPayout,
      cycles: C.form.defaultCycles,
      compound: C.form.defaultCompound,
      demandRate: C.form.defaultDemandRate,
      breakAfter: C.form.defaultBreak,
      startDay: C.form.defaultStartDay,
      startMonth: C.form.defaultStartMonth,
      startYear: C.form.defaultStartYear,
      needDay: C.form.defaultNeedDay,
      needMonth: C.form.defaultNeedMonth,
      needYear: C.form.defaultNeedYear,
      renew: C.form.defaultRenew,
    },
    {
      principal: "money",
      rate: "rate",
      term: "rate",
      cycles: "rate",
      demandRate: "rate",
      breakAfter: "rate",
    },
  );

  const byDates = fields.values.mode === "dates";

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
  // Bounded on the TYPED value, so the field shows its own error rather than
  // the module refusing a cycle count the page never mentioned.
  const cyclesInvalid =
    cycles === null ||
    cycles < 1 ||
    !Number.isInteger(cycles) ||
    cycles > MAX_DEPOSIT_CYCLES;
  const demandRateInvalid = demandRate === null || demandRate < 0;
  const breakInvalid =
    breakRaw !== "" &&
    (breakAfter === null ||
      breakAfter <= 0 ||
      (totalMonths !== null && breakAfter > totalMonths));

  const coreUsable =
    !principalInvalid && !rateInvalid && !termInvalid && !demandRateInvalid;

  const fieldsUsable =
    coreUsable && !cyclesInvalid && !breakInvalid;

  const result =
    !byDates && fieldsUsable
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
  const payoutMismatch = !byDates && fieldsUsable && result === null;

  // The rollover choice is inert when interest has already been paid out.
  const compoundIgnored =
    !byDates &&
    fields.values.compound === "yes" &&
    payout !== "maturity" &&
    cycles !== null &&
    cycles > 1;

  // ------------------------------------------------ the date view
  const start = readDateFields(
    fields.values.startYear,
    fields.values.startMonth,
    fields.values.startDay,
  );
  const need = readDateFields(
    fields.values.needYear,
    fields.values.needMonth,
    fields.values.needDay,
  );
  const datesUsable = byDates && start.date !== null && need.date !== null;

  const plan =
    datesUsable && coreUsable
      ? planDeposit({
          principal: principal as number,
          annualRatePercent: rate as number,
          earlyRatePercent: demandRate as number,
          start: start.date as CalendarDate,
          termMonths: term as number,
          needDate: need.date as CalendarDate,
          renew: fields.values.renew === "yes",
        })
      : null;

  /**
   * A need date before the deposit date is the one refusal the reader cannot
   * be blamed for by field: either date could be the mistyped one. The module
   * returns null, so the page names the pair.
   */
  const needBeforeStart =
    datesUsable &&
    coreUsable &&
    plan === null &&
    start.date !== null &&
    need.date !== null &&
    (need.date.year < start.date.year ||
      (need.date.year === start.date.year &&
        (need.date.month < start.date.month ||
          (need.date.month === start.date.month &&
            need.date.day < start.date.day))));

  const chart = depositChartModel(plan, {
    ...CHART_UI.money,
    ...C.dateChart,
  });

  // The other half of original row 20's visual: where the needed date sits
  // between the deposit and the relevant maturity.
  const timeline = depositTimelineModel(plan, C.dateTimeline);

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  const days = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatDecimal(figure, 0)} ${C.form.daysUnit}`;

  /** "31/7/2026" — hand-formatted, like every other figure in the suite. */
  const showDate = (date: CalendarDate | null | undefined) =>
    date === null || date === undefined
      ? null
      : `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  const availability =
    plan === null
      ? null
      : plan.status === "beforeMaturity"
        ? C.form.availabilityBefore
        : plan.status === "atMaturity"
          ? C.form.availabilityAt
          : plan.status === "afterMaturity"
            ? C.form.availabilityAfter
            : null;

  /**
   * THE answer, by view — formatted once, so the emphasised row and the
   * pinned CTA restate the same string rather than formatting it twice.
   */
  const answerLabel = byDates ? C.form.availableLabel : C.form.totalValueLabel;
  const answerValue = byDates
    ? money(plan?.availableAtNeedDate)
    : money(result?.totalValue);

  /**
   * Reads the clock — the ONE place in this tool that may, and only on a
   * click, well after mount, so the prerendered and hydrated HTML agree.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("startYear").onValueChange(String(now.getFullYear()));
    fields.bind("startMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("startDay").onValueChange(String(now.getDate()));
  };

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "term", label: C.form.modeTerm },
                  { value: "dates", label: C.form.modeDates },
                ]}
              />
            </FieldGroup>

            <FieldGroup title={C.form.depositGroup} className="mt-8">
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
              {/* The payout choice belongs to the months view: the date view
                  models interest at maturity or at the exit, and offering a
                  monthly payout there would imply a schedule it does not
                  compute. */}
              {!byDates ? (
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
              ) : null}
            </FieldGroup>

            {byDates ? (
              <FieldGroup title={C.form.dateGroup} className="mt-8">
                <NumberField
                  {...fields.bind("startDay")}
                  label={C.form.startDayLabel}
                  help={C.form.startDayHelp}
                  error={C.form.startDayInvalid}
                  invalid={start.dayBad}
                />
                <NumberField
                  {...fields.bind("startMonth")}
                  label={C.form.startMonthLabel}
                  help={C.form.startMonthHelp}
                  error={C.form.startMonthInvalid}
                  invalid={start.monthBad}
                />
                <NumberField
                  {...fields.bind("startYear")}
                  label={C.form.startYearLabel}
                  help={C.form.startYearHelp}
                  error={C.form.startYearInvalid}
                  invalid={start.yearBad}
                />
                <div>
                  <button
                    type="button"
                    onClick={fillToday}
                    className={cn(
                      "rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 font-display text-base font-medium text-ink transition",
                      "hover:border-brand-green focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30",
                      FH_POINTER,
                    )}
                  >
                    {C.form.todayLabel}
                  </button>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {C.form.todayHelp}
                  </p>
                </div>
                <NumberField
                  {...fields.bind("needDay")}
                  label={C.form.needDayLabel}
                  help={C.form.needDayHelp}
                  error={C.form.needDayInvalid}
                  invalid={need.dayBad}
                />
                <NumberField
                  {...fields.bind("needMonth")}
                  label={C.form.needMonthLabel}
                  help={C.form.needMonthHelp}
                  error={C.form.needMonthInvalid}
                  invalid={need.monthBad}
                />
                <NumberField
                  {...fields.bind("needYear")}
                  label={C.form.needYearLabel}
                  help={C.form.needYearHelp}
                  error={C.form.needYearInvalid}
                  invalid={need.yearBad}
                />
                <RadioGroupField
                  {...fields.bind("renew")}
                  legend={C.form.renewLegend}
                  help={C.form.renewHelp}
                  options={[
                    { value: "no", label: C.form.renewNo },
                    { value: "yes", label: C.form.renewYes },
                  ]}
                />
                <NumberField
                  {...fields.bind("demandRate")}
                  label={C.form.demandRateLabel}
                  unit={C.form.demandRateUnit}
                  help={C.form.demandRateHelp}
                  error={C.form.demandRateInvalid}
                  invalid={demandRateInvalid}
                />
              </FieldGroup>
            ) : (
              <>
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

                {/* ROW 22's "phí/rút sớm vào nhóm riêng", ALREADY SATISFIED
                    and left as it stands: the demand rate and the month the
                    saver would break the deposit are their own group, apart
                    from the deposit itself. */}
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
              </>
            )}
          </>
        }
        cta={
          /* Sticky: the date view puts six date boxes, a renewal choice and
             the demand rate between the principal and the answer. The pinned
             line repeats the money in hand, not "xem kết quả". */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={byDates ? !coreUsable || !datesUsable : !fieldsUsable}
            sticky
            answer={{ label: answerLabel, value: answerValue }}
          />
        }

        primary={
          <>
            {/* ONE live region, with the rows of whichever view is showing.
                Two ResultGroups — one per mode — would read as two live
                regions to the source-level and built-markup checks even
                though only one ever renders.

                ROW 22's "tiền thực nhận và thời điểm cần tiền lên đầu": each
                view now LEADS with the money the saver ends up with, as the
                one emphasised figure, and puts the date that money is needed
                — or, in the months view, the horizon it comes back over —
                directly under it. Both figures existed; the cash was the
                fourth row of four and the need date was inside the collapsed
                ledger. */}
            <ResultGroup
              title={byDates ? C.form.dateResultTitle : C.form.resultTitle}
              anchorId={RESULT_ID}
            >
              {byDates ? (
                <>
                  {/* What the saver HAS on the day, which after maturity is
                      not a payment made that day. The split is in the cash
                      group inside the ledger. */}
                  <ResultRow
                    label={C.form.availableLabel}
                    value={money(plan?.availableAtNeedDate)}
                    emphasis
                  />
                  {/* MOVED UP out of the day ledger: the date the money is
                      needed is half of this view's question, not a detail of
                      it. It is not repeated below. */}
                  <ResultRow
                    label={C.form.needDateLabel}
                    value={showDate(plan?.needDate)}
                  />
                  <ResultRow
                    label={C.form.availabilityLabel}
                    value={availability}
                    prose
                  />
                  {/* The CURRENT term's maturity — after a renewal that is not
                      the first one, and the first is a separate detail row.
                      Suppressed entirely for `beyondLimit`, whose horizon was
                      never reached. */}
                  <ResultRow
                    label={C.form.maturityDateLabel}
                    value={
                      plan === null || plan.status === "beyondLimit"
                        ? null
                        : showDate(plan.pendingMaturity ?? plan.currentMaturity)
                    }
                  />
                  <ResultRow
                    label={C.form.interestAtExitLabel}
                    value={money(plan?.interestAtExit)}
                  />
                </>
              ) : (
                <>
                  <ResultRow
                    label={C.form.totalValueLabel}
                    value={money(result?.totalValue)}
                    emphasis
                  />
                  {/* MOVED UP out of the detail group: how long the money is
                      committed for is this view's "when". */}
                  <ResultRow
                    label={C.form.totalMonthsLabel}
                    value={
                      result
                        ? `${formatDecimal(result.totalMonths, 0)} ${C.form.monthsUnit}`
                        : null
                    }
                  />
                  <ResultRow
                    label={C.form.totalInterestLabel}
                    value={money(result?.totalInterest)}
                  />
                  <ResultRow
                    label={C.form.effectiveLabel}
                    value={
                      result
                        ? formatPercent(result.effectiveAnnualPercent, 3)
                        : null
                    }
                  />
                </>
              )}
            </ResultGroup>

            {byDates ? (
              <>
                {/* Each status is a real answer with its own consequence, so
                    each has its own sentence rather than a shared "no
                    result". */}
                {plan?.status === "beforeMaturity" ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.beforeMaturityNotice}
                  </p>
                ) : null}
                {plan?.status === "atMaturity" ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.atMaturityNotice}
                  </p>
                ) : null}
                {plan?.status === "afterMaturity" ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.afterMaturityNotice}
                  </p>
                ) : null}
                {plan?.status === "beyondLimit" ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.beyondLimitNotice.replace(
                      "{limit}",
                      formatDecimal(MAX_DEPOSIT_CYCLES, 0),
                    )}
                  </p>
                ) : null}
                {needBeforeStart ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.needBeforeStartNotice}
                  </p>
                ) : null}
                {byDates && !datesUsable ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.dateInvalidNotice}
                  </p>
                ) : null}

                {/* Which of the two cash questions this plan answers. Short,
                    and it stays WITH the primary result — the full ledger is
                    below the visuals. */}
                {plan?.proceedsHeldSinceMaturity ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.heldSinceMaturityNotice}
                  </p>
                ) : null}
                {plan !== null &&
                plan.status !== "beyondLimit" &&
                plan.termsElapsed > 1 ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-3">
                    {C.form.renewedPrincipalNotice}
                  </p>
                ) : null}

                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {C.form.dateModeScopeNotice}
                </p>
              </>
            ) : (
              <>
                {/* With interest paid out during the term, the early-exit
                    figures are interest EARNED, not a single payout — and this
                    tool does not model the bank's reconciliation of what it
                    already paid. */}
                {result !== null &&
                result.earlyLoss !== null &&
                payout !== "maturity" ? (
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    {C.form.earlyPayoutScopeNotice}
                  </p>
                ) : null}

                {/* ROW 22's separate early-exit group on the answer side, and
                    already its own group before this batch. It stays beside
                    the answer rather than moving into the disclosure: it is
                    only rendered when the reader asked what breaking the
                    deposit costs. */}
                {result !== null && result.earlyLoss !== null ? (
                  <ResultGroup
                    title={C.form.earlyTitle}
                    className="mt-4"
                    live={false}
                  >
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

                {/* The months/12 view says so, beside its own figures. */}
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {C.form.approximationNotice}
                </p>
              </>
            )}
          </>
        }
        chart={
          byDates ? (
            <>
              {/* Original row 20 asks for BOTH halves: the timeline and the
                  bars. They sit directly after the answer — the day ledger and
                  the cash breakdown used to push the timeline to 5.371 px on a
                  phone, which is not the answer → visual → optional detail
                  sequence the flow contract asks for. */}
              <DepositTimeline model={timeline} />

              <ChartFigure model={chart}>
                <BarChart model={chart} />
              </ChartFigure>
            </>
          ) : null
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          byDates ? (
            /* Everything a reader may never need, collapsed — and every
               figure still here, at both precisions, in the same shared
               rows. Full width below the answer now, rather than the tail of
               one column. */
            plan !== null && plan.status !== "beyondLimit" ? (
              <DetailDisclosure
                title={C.form.dateLedgerTitle}
                hint={C.form.dateLedgerHint}
              >
                <ResultGroup title={C.form.dateDetailTitle} live={false}>
                  <ResultRow
                    label={C.form.firstMaturityLabel}
                    value={showDate(plan.firstMaturity)}
                  />
                  <ResultRow
                    label={C.form.termsElapsedLabel}
                    value={`${formatDecimal(plan.termsElapsed, 0)} ${C.form.termsUnit}`}
                  />
                  <ResultRow
                    label={C.form.currentTermDaysLabel}
                    value={days(plan.currentTermDays)}
                  />
                  <ResultRow
                    label={C.form.daysHeldLabel}
                    value={days(plan.daysFromStart)}
                  />
                  <ResultRow
                    label={C.form.daysIntoTermLabel}
                    value={days(plan.daysIntoBrokenTerm)}
                  />
                  <ResultRow
                    label={C.form.daysToMaturityLabel}
                    value={days(plan.daysToPendingMaturity)}
                  />
                  <ResultRow
                    label={C.form.maturedInterestLabel}
                    value={money(plan.maturedInterest)}
                  />
                  <ResultRow
                    label={C.form.heldToMaturityLabel}
                    value={money(plan.interestIfHeldToMaturity)}
                  />
                </ResultGroup>

                <ResultGroup
                  title={C.form.cashTitle}
                  className="mt-4"
                  live={false}
                >
                  <ResultRow
                    label={C.form.newPaymentLabel}
                    value={money(plan.newPaymentAtNeedDate)}
                  />
                  <ResultRow
                    label={C.form.cashPrincipalLabel}
                    value={money(plan.principalReturned)}
                  />
                  <ResultRow
                    label={C.form.cashInterestLabel}
                    value={money(plan.interestPaidAtNeedDate)}
                  />
                  {/* Interest handed over earlier is NOT new cash at the
                      exit. */}
                  <ResultRow
                    label={C.form.alreadyPaidLabel}
                    value={money(plan.interestAlreadyPaid)}
                  />
                  <ResultRow
                    label={C.form.sameHorizonLabel}
                    value={money(plan.termRateSameHorizon)}
                  />
                  <ResultRow
                    label={C.form.rateDifferenceLabel}
                    value={money(plan.rateDifference)}
                  />
                  {/* Future earning time, named as such — never folded into
                      the rate difference and never called a penalty. */}
                  <ResultRow
                    label={C.form.foregoneLabel}
                    value={money(plan.foregoneFutureInterest)}
                  />
                </ResultGroup>

                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {C.form.dayCountNotice}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-3">
                  {C.form.monthEndNotice}
                </p>
              </DetailDisclosure>
            ) : null
          ) : (
            <ResultGroup title={C.form.detailTitle} live={false}>
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
                label={C.form.finalPrincipalLabel}
                value={money(result?.finalPrincipal)}
              />
              <ResultRow
                label={C.form.compoundedLabel}
                value={
                  result === null
                    ? null
                    : result.compounded
                      ? C.form.yes
                      : C.form.no
                }
              />
            </ResultGroup>
          )
        }
      />
    </CalculatorCard>
  );
}
