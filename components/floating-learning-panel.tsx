"use client";

import { useId } from "react";
import { formJumpTarget, jumpToField, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import { InfographicArt, SplitBar, SplitLegend } from "@/components/calc/living-infographic";
import { focusAndScroll } from "@/components/calc/result-cta";
import type { FloatingLesson, FloatingMonthView, FloatingRateField } from "@/components/floating-learning";
import { FLOATING_LEARNING as L } from "@/content/calculators/floating-learning";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/calc/charts/labels";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * Context art: the mortgage's text-free 3D scene (townhouse, wallet, blank
 * paper), reused as is — the mechanism here is the 2D calendar, not the art.
 */
export const FLOATING_ART = "/images/tools/mortgage-living-scene-v1";

/** A 44 px secondary pill for the month steps. */
const STEP =
  "inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-full border border-ink-4/60 bg-white px-2 text-sm font-medium text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2";

/**
 * The two boundary jumps: longer labels, so they MAY wrap — inside a padded
 * pill with centred text, never past its edge (a 320 px pass measured
 * "Tháng cuối ưu đãi" overrunning a nowrap pill by 3 px). Still ≥ 44 px.
 */
const JUMP =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-center text-sm font-medium leading-tight text-brand-green-ink [overflow-wrap:anywhere] hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2";

/**
 * Colour AND pattern. The promotion is a green diagonal hatch, the stretch
 * after it plain neutral; principal solid green, interest a light hatch —
 * the same pair the mortgage panel uses, so one site reads one way.
 */
const FILL = {
  promo: "bg-[repeating-linear-gradient(135deg,#117f36_0_3px,#7fb893_3px_6px)]",
  post: "bg-ink-3/60",
  principal: "bg-brand-green-ink",
  interest: "bg-[repeating-linear-gradient(90deg,#cfcfcf_0_2px,#ececec_2px_6px)] ring-1 ring-inset ring-ink-4/60",
} as const;

/** The budget sentence's tone. No budget is neutral, never green. */
const BUDGET_TONE: Record<FloatingMonthView["budget"]["state"], string> = {
  none: "bg-white text-ink-2 ring-1 ring-ink-4/30",
  fits: "bg-status-met-bg text-status-met ring-1 ring-status-met/30",
  equal: "bg-status-caution-bg text-status-caution ring-1 ring-status-caution/30",
  over: "bg-status-shortfall-bg text-status-shortfall ring-1 ring-status-shortfall/30",
};

/**
 * "Xem từng tháng quanh mốc hết ưu đãi" on /cong-cu/lai-suat-tha-noi/, in
 * `CalculatorLayout`'s `learning` slot: right after the answer, before the
 * actions and the whole-term chart, in the same DOM order at every width.
 *
 * F2 of the living infographic: the 3D scene is CONTEXT only; the mechanism
 * is a 2D calendar of the whole term with the promotional boundary marked,
 * the looked-at month on it, that month's payment split into principal and
 * interest (100% = that payment), the debt after it, and the payment on each
 * side of the boundary on one axis from 0.
 *
 * The month control changes which month is LOOKED AT; it never edits the
 * form. The stress preset is the form's own radio group — a choice, read
 * here, never a button that adds. NOTHING HERE IS LIVE.
 */
export function FloatingLearningPanel({
  sample,
  lesson,
  onMonth,
  formId,
}: {
  sample: boolean;
  /** Invalid input, model limit, display limit or the view — never conflated. */
  lesson: FloatingLesson;
  onMonth: (month: number) => void;
  formId: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      data-floating-learning="true"
      className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4"
    >
      <h2 id={titleId} className="font-display text-base font-medium text-ink">
        {L.title}
      </h2>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? L.basisSample : L.basisOwn}
      </p>
      {lesson.kind === "invalid" ? (
        <Unknown formId={formId} />
      ) : lesson.kind === "modelLimit" ? (
        <ModelLimit formId={formId} />
      ) : lesson.kind === "rateLimit" ? (
        <RateLimit fields={lesson.fields} formId={formId} />
      ) : lesson.kind === "displayLimit" ? (
        <DisplayLimit fields={lesson.fields} formId={formId} />
      ) : (
        <>
          <MonthFigure idBase={id} view={lesson.view} onMonth={onMonth} />
          <FloatingMore view={lesson.view} />
        </>
      )}
    </section>
  );
}

function Unknown({ formId }: { formId: string }) {
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="unknown"
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      <figcaption className="text-sm font-medium leading-snug text-ink">{L.unknown}</figcaption>
      <button
        type="button"
        data-scene-fix="true"
        onClick={() => {
          const target = formJumpTarget(document.getElementById(formId));
          if (target instanceof HTMLElement) focusAndScroll(target);
        }}
        className={cn(STEP, "mt-2 px-3", FH_POINTER)}
      >
        {L.fix}
      </button>
    </figure>
  );
}

/**
 * A calculation limit with every field accepted: named without blaming any
 * one field, no bar and no figure. The recovery opens the form at its first
 * field (an invalid one first, of which there is none here). Focus only.
 */
function ModelLimit({ formId }: { formId: string }) {
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="modelLimit"
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      <figcaption className="text-sm font-medium leading-snug text-ink">{L.modelLimit}</figcaption>
      <button
        type="button"
        data-scene-fix="inputs"
        onClick={() => {
          const target = formJumpTarget(document.getElementById(formId));
          if (target instanceof HTMLElement) focusAndScroll(target);
        }}
        className={cn(STEP, "mt-2 px-3", FH_POINTER)}
      >
        {L.fixInputs}
      </button>
    </figure>
  );
}

/**
 * A display limit: this illustration names which figures cannot be printed
 * and offers a jump to EACH field that sets them — the amount, the budget,
 * or both. Focus only; nothing is written.
 */
function DisplayLimit({ fields, formId }: { fields: readonly ("amount" | "budget")[]; formId: string }) {
  const what = fields.length > 1 ? L.displayWhat.both : L.displayWhat[fields[0]];
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="displayLimit"
      data-display-limit={fields.join(" ")}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      <figcaption className="text-sm font-medium leading-snug text-ink">{fill(L.displayLimit, { what })}</figcaption>
      <div className="mt-2 flex flex-wrap gap-2">
        {fields.map((field) => (
          <button
            key={field}
            type="button"
            data-scene-fix={field}
            onClick={() => jumpToField(formId, field)}
            className={cn(STEP, "px-3", FH_POINTER)}
          >
            {field === "amount" ? L.fixAmount : L.fixBudget}
          </button>
        ))}
      </div>
    </figure>
  );
}

/**
 * A rate this illustration would print is past the percent formatter's
 * limit: named, nothing drawn, and one real jump per responsible rate
 * control. Focus only; nothing is written or capped.
 */
function RateLimit({ fields, formId }: { fields: readonly FloatingRateField[]; formId: string }) {
  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="rateLimit"
      data-rate-limit={fields.join(" ")}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      <figcaption className="text-sm font-medium leading-snug text-ink">{L.rateLimit}</figcaption>
      <div className="mt-2 flex flex-wrap gap-2">
        {fields.map((field) => (
          <button
            key={field}
            type="button"
            data-scene-fix={field}
            onClick={() => jumpToField(formId, field)}
            className={cn(STEP, "px-3", FH_POINTER)}
          >
            {L.fixRate[field]}
          </button>
        ))}
      </div>
    </figure>
  );
}

function MonthFigure({
  idBase,
  view,
  onMonth,
}: {
  idBase: string;
  view: FloatingMonthView;
  onMonth: (month: number) => void;
}) {
  const { month, months, boundaryMonth } = view;
  const rangeId = `${idBase}-month`;
  const position = fill(L.position, { month, months });
  const go = (target: number) => onMonth(Math.min(Math.max(1, target), months));
  const atFirst = month <= 1;
  const atLast = month >= months;
  const steps = [
    ["first", 1, atFirst],
    ["prev", month - 1, atFirst],
    ["next", month + 1, atLast],
    ["last", months, atLast],
  ] as const;
  const jumps =
    boundaryMonth === null
      ? []
      : ([
          ["promoEnd", boundaryMonth - 1, month === boundaryMonth - 1],
          ["boundary", boundaryMonth, month === boundaryMonth],
        ] as const);

  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="ready"
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: a text-free 3D miniature. No figure is drawn on it. */}
      <InfographicArt base={FLOATING_ART} alt={L.artAlt} />
      <figcaption data-floating-caption="true" className="mt-1 text-center text-sm font-medium leading-snug text-ink">
        {view.caption}
      </figcaption>

      {/* The calendar: the whole term, the promotion, the boundary, this month. */}
      <div data-floating-part="timeline" className="mt-2">
        <p className="text-sm text-ink-2">{view.timelineTitle}</p>
        <div aria-hidden="true" data-floating-timeline="true" className="relative mt-1">
          <div className="flex h-4 w-full overflow-hidden rounded-md bg-ink-4/30">
            {view.phases.map((phase) => (
              <div
                key={phase.key}
                data-phase={phase.promo ? "promo" : "post"}
                data-phase-months={`${phase.fromMonth}-${phase.toMonth}`}
                data-percent={phase.percent.toFixed(2)}
                className={cn("h-full shrink-0 border-r border-white/70 last:border-r-0", phase.promo ? FILL.promo : FILL.post)}
                style={{ width: `${phase.percent}%` }}
              />
            ))}
          </div>
          {view.boundaryPercent === null ? null : (
            <span
              data-floating-boundary={view.boundaryMonth ?? ""}
              className="absolute -inset-y-1 block w-0.5 bg-ink"
              style={{ left: `calc(${clampPercent(view.boundaryPercent)}% - 1px)` }}
            />
          )}
          <span
            data-floating-month-mark={month}
            className={cn("absolute -top-1.5 block size-3 -translate-x-1/2 rotate-45 bg-brand-green-ink ring-2 ring-white", MARK_MOTION)}
            style={{ left: `${clampPercent(view.monthPercent)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-sm tabular-nums text-ink-2">
          <span>{L.timelineStart}</span>
          <span>{fill(L.timelineEnd, { months })}</span>
        </div>
        {/* The axis in words: which rate applies when. */}
        <p data-floating-rates="true" className={cn("mt-1 text-sm leading-snug text-ink", WRAP)}>
          {boundaryMonth === null ? null : (
            <span className="font-medium">{fill(L.boundaryMark, { month: boundaryMonth })}. </span>
          )}
          {view.ratesLine}
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
          {boundaryMonth === null ? null : (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", FILL.promo)} />
              {L.timelineLegendPromo}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", FILL.post)} />
            {L.timelineLegendPost}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 shrink-0 rotate-45 bg-brand-green-ink" />
            {L.timelineLegendMonth}
          </li>
        </ul>
        <p data-floating-scenario="true" className="mt-1 text-sm leading-snug text-ink-2">
          {view.scenarioLine}
        </p>
      </div>

      {/* THIS month: the payment, and where it goes. The bar's whole is it. */}
      <div data-floating-part="month" className="mt-3">
        <p data-floating-headline="true" className="text-center font-display text-2xl font-medium tabular-nums text-brand-green-ink">
          {view.headline}
        </p>
        <p className="text-center text-sm leading-snug text-ink-2">{fill(L.splitWhole, { month })}</p>
        <SplitBar
          marker="floating-payment"
          className="mt-2"
          segments={[
            {
              key: "principal",
              percent: view.shares.principal,
              className: FILL.principal,
              inside: view.shareTexts.principal,
              insideClassName: "text-white",
            },
            {
              key: "interest",
              percent: view.shares.interest,
              className: FILL.interest,
              inside: view.shareTexts.interest,
              insideClassName: "text-ink",
            },
          ]}
        />
        <SplitLegend
          items={[
            { key: "principal", swatch: FILL.principal, label: L.principalLabel, value: view.principalText, meaning: L.principalMeaning },
            { key: "interest", swatch: FILL.interest, label: L.interestLabel, value: view.interestText, meaning: L.interestMeaning },
          ]}
        />
        <p data-floating-debt="true" className="mt-2 rounded-lg bg-white px-3 py-2 text-base font-medium tabular-nums text-ink ring-1 ring-ink-4/30">
          {view.debtLine}
        </p>
        {view.compare === null ? null : (
          <p data-floating-compare="true" className="mt-2 text-sm leading-snug text-ink">
            {view.compare}
          </p>
        )}
        <p
          data-floating-budget={view.budget.state}
          className={cn("mt-2 rounded-lg px-3 py-2 text-sm font-medium leading-snug", BUDGET_TONE[view.budget.state])}
        >
          {view.budget.text}
        </p>
      </div>

      {/* The month control. Native range: arrows, Page Up/Down, Home/End. */}
      {months > 1 ? (
        <div data-learning-month={month} data-learning-months={months} className="mt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <label htmlFor={rangeId} className="text-sm text-ink-2">
              {L.monthLabel}
            </label>
            <span data-learning-month-position="true" className="text-sm font-medium tabular-nums text-ink">
              {position}
            </span>
          </div>
          <input
            id={rangeId}
            type="range"
            min={1}
            max={months}
            step={1}
            value={month}
            aria-valuetext={view.caption}
            onChange={(event) => go(Number(event.target.value))}
            className={cn("h-11 w-full accent-brand-green-ink", FH_POINTER)}
          />
          {/* 2 × 2 below 380 px so each step keeps ≥ 44 × 44 px and a whole label. */}
          <div data-month-steps="true" className="grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-4">
            {steps.map(([key, target, off]) => (
              <button
                key={key}
                type="button"
                data-month-step={key}
                aria-label={L.steps[key].name}
                aria-disabled={off ? true : undefined}
                aria-controls={rangeId}
                onClick={() => {
                  if (!off) go(target);
                }}
                className={cn(STEP, FH_POINTER)}
              >
                {L.steps[key].short}
              </button>
            ))}
          </div>
          {jumps.length === 0 ? null : (
            <div data-boundary-steps="true" className="mt-1.5 grid grid-cols-1 gap-1.5 min-[380px]:grid-cols-2">
              {jumps.map(([key, target, here]) => (
                <button
                  key={key}
                  type="button"
                  data-month-step={key}
                  aria-label={L.steps[key].name}
                  aria-disabled={here ? true : undefined}
                  aria-controls={rangeId}
                  onClick={() => {
                    if (!here) go(target);
                  }}
                  className={cn(JUMP, FH_POINTER)}
                >
                  {L.steps[key].short}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p data-learning-month={month} data-learning-months={months} className="mt-3 text-sm text-ink-2">
          {L.single}
        </p>
      )}

      {/* The payment on each side of the boundary, one axis from 0. */}
      <div data-floating-part="levels" className="mt-3">
        <p className="text-sm font-medium text-ink">{L.levelsTitle}</p>
        <ul className="mt-1.5 space-y-2">
          {view.levels.map((level) => (
            <li key={level.key} data-floating-level={level.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="text-ink-2">{level.label}</span>
                <span className="font-medium tabular-nums text-ink">{level.text}</span>
              </div>
              <div aria-hidden="true" className="relative mt-1 h-3 w-full rounded-full bg-white ring-1 ring-ink-4/30">
                <div
                  data-level-percent={level.percent.toFixed(2)}
                  className={cn("h-3 rounded-full", MARK_MOTION, level.key === "promo" ? FILL.promo : FILL.post)}
                  style={{ width: `${clampPercent(level.percent)}%` }}
                />
                {view.budgetPercent === null ? null : (
                  <span
                    data-floating-budget-line={view.budgetPercent.toFixed(2)}
                    className="absolute -inset-y-1 block w-0.5 bg-ink"
                    style={{ left: `calc(${clampPercent(view.budgetPercent)}% - 1px)` }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        {view.changeLine === null ? null : (
          <p data-floating-change="true" className="mt-1.5 text-sm font-medium text-ink">
            {view.changeLine}
          </p>
        )}
        <p className="mt-1 text-sm leading-snug text-ink-2">
          {L.levelsAxis}
          {view.budgetText === null ? "" : ` ${fill(L.levelsBudget, { budget: view.budgetText })}`}
        </p>
      </div>
      <p className="mt-2 text-sm leading-snug text-ink-2">{L.roundedNote}</p>
    </figure>
  );
}

/** "Hiểu thêm": the mechanism, the assumption and this month's exact đồng. */
function FloatingMore({ view }: { view: FloatingMonthView }) {
  return (
    <details data-floating-more="true" className="mt-3 text-sm">
      <summary className={cn("inline-flex min-h-11 cursor-pointer items-center font-medium text-brand-green-ink", FH_POINTER)}>
        {L.moreTitle}
      </summary>
      <div className="space-y-2 pb-3 leading-relaxed text-ink-2">
        <p>{L.mechanism}</p>
        <p>{L.assumption}</p>
        <p className="font-medium text-ink">{fill(L.exactTitle, { month: view.month })}</p>
        <dl data-floating-exact="true" className="grid grid-cols-1 gap-1 min-[420px]:grid-cols-2">
          {view.exact.map((row) => (
            <div key={row.key} data-exact-row={row.key} className="flex flex-wrap justify-between gap-x-3">
              <dt>{row.label}</dt>
              <dd className="font-medium tabular-nums text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}
