"use client";

import { useId, useState } from "react";
import {
  formJumpTarget,
  TrialControls,
  WRAP,
} from "@/components/calc/learning-controls";
import { SceneStrip } from "@/components/calc/learning-scene";
import {
  InfographicArt,
  SplitBar,
  SplitLegend,
  TimelineCompare,
} from "@/components/calc/living-infographic";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import { focusAndScroll } from "@/components/calc/result-cta";
import { ResultTable } from "@/components/calc/result-table";
import {
  MORTGAGE_TRIAL_KEYS,
  type InterestComparison,
  type MortgageImpactView,
  type MortgageRulerView,
  type MortgageTrialKey,
} from "@/components/mortgage-learning";
import { MORTGAGE_LEARNING as L } from "@/content/calculators/mortgage-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { fill } from "@/lib/calc/charts/labels";

/** A 44 px secondary pill for the month steps and the walk-through. */
const STEP =
  "inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-full border border-ink-4/60 bg-white px-2 text-sm font-medium text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2 aria-pressed:border-brand-green-ink aria-pressed:bg-bg-soft";

/**
 * The text-free 3D scene band (townhouse, wallet, blank loan paper), 2,5 : 1.
 * One constant, so replacement art is a one-line change.
 */
export const MORTGAGE_ART = "/images/tools/mortgage-living-scene-v1";

/** The highlight ring the optional walk-through puts on one part. */
const LIT = "rounded-md ring-2 ring-brand-green-ink ring-offset-2 ring-offset-bg-soft";

/**
 * The fills, colour AND pattern: principal solid green, the extra part green
 * with a diagonal stripe, interest a LIGHT neutral hatch (dark text reads on
 * it — the dense dark stripe fought the percentage label), the debt stock
 * plain neutral. Never red — interest is a cost, not a mistake.
 */
const FILL = {
  principal: "bg-brand-green-ink",
  extra: "bg-[repeating-linear-gradient(135deg,#117f36_0_3px,#7fb893_3px_6px)]",
  interest: "bg-[repeating-linear-gradient(90deg,#cfcfcf_0_2px,#ececec_2px_6px)] ring-1 ring-inset ring-ink-4/60",
  debt: "bg-ink-3/60",
} as const;

type WalkStep = keyof typeof L.scene.walk;
const WALK: readonly WalkStep[] = ["debt", "measure", "principal", "next"];

/**
 * "Hiểu khoản vay qua từng tháng" on /cong-cu/vay-mua-nha/. VISUAL FIRST,
 * INSIDE THE RESULT (2026-09-29, the user's latest correction, superseding
 * the after-answer `learning` slot): the `visual` of the primary
 * `ResultGroup`, so "Xem kết quả" lands on this picture at the top of the
 * result card, with the instalment rows after it and the actions, the
 * whole-term chart and the detail further down.
 *
 * NO CARD OF ITS OWN: the result group is the surface, so the section adds
 * no border, background or padding, and its heading is an `h3` under the
 * group's `h2`.
 *
 * BOARDS 02 AND 03 of the approved living infographic (2026-09-29). Board
 * 02, the figure: a text-free 3D miniature as context (nothing drawn on it)
 * → this month's payment as the headline → one bar splitting THAT payment
 * into principal (+ extra) and interest, labelled directly with amount and
 * meaning → interest measured on the debt → the debt after, on its own axis
 * (the original loan) → next month → the month control. Board 03, after a
 * press: the payoff on one month axis and the rounded before/after. The
 * tool takes the loan amount only, so there is no price/down-payment board.
 * Scale notes, the walk-through and the exact đồng stay in "Hiểu thêm",
 * BELOW the try buttons.
 *
 * DOM order, nothing reordered by CSS. NOTHING HERE IS LIVE: the page's ONE
 * live region stays the answer rows, and the group places this panel OUTSIDE
 * that region.
 */
export function MortgageLearningPanel({
  sample,
  ruler,
  onMonth,
  availability,
  termLabel,
  impact,
  canUndo,
  formId,
  onTry,
  onUndo,
}: {
  sample: boolean;
  ruler: MortgageRulerView | null;
  onMonth: (month: number) => void;
  availability: Record<MortgageTrialKey, TrialAvailability>;
  /** "Kéo dài kỳ hạn thêm 5 năm" or "… 60 tháng", per the unit selected. */
  termLabel: string;
  impact: MortgageImpactView | null;
  canUndo: boolean;
  formId: string;
  onTry: (key: MortgageTrialKey) => void;
  onUndo: () => void;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  // The optional walk-through: which step of the flow is highlighted. A view
  // state only — it never edits the form and nothing moves by itself.
  const [walk, setWalk] = useState<WalkStep | null>(null);
  return (
    <section
      aria-labelledby={titleId}
      data-mortgage-learning="true"
    >
      <h3 id={titleId} className="font-display text-base font-medium text-ink">
        {L.title}
      </h3>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? L.basisSample : L.basisOwn}
      </p>

      <MonthlyRuler idBase={id} ruler={ruler} onMonth={onMonth} formId={formId} walk={walk} />

      <TrialControls
        idBase={id}
        keys={MORTGAGE_TRIAL_KEYS}
        labels={{ term: termLabel, extra: L.trials.extra.label }}
        availability={availability}
        canUndo={canUndo}
        undoLabel={L.undo}
        undoNone={L.undoNone}
        openFormLabel={L.openForm}
        formId={formId}
        onTry={onTry}
        onUndo={onUndo}
      />

      {impact === null ? null : <MortgageImpact impact={impact} />}

      {ruler === null ? null : <RulerMore ruler={ruler} walk={walk} onWalk={setWalk} />}

      {/* The conditions every figure rests on stay VISIBLE. */}
      <p data-learning-limits="true" className="mt-3 text-sm leading-relaxed text-ink-2">
        {L.month.excludes} {L.limits}
      </p>
    </section>
  );
}

function compareText(which: "now" | "next", c: InterestComparison | null): string | null {
  if (c === null) return null;
  const S = L.scene;
  const key =
    which === "now"
      ? c.kind === "same"
        ? S.compareNowSame
        : c.kind === "lower"
          ? S.compareNowLower
          : S.compareNowHigher
      : c.kind === "same"
        ? S.compareNextSame
        : c.kind === "lower"
          ? S.compareNextLower
          : S.compareNextHigher;
  return fill(key, { amount: c.amount });
}

function MonthlyRuler({
  idBase,
  ruler,
  onMonth,
  formId,
  walk,
}: {
  idBase: string;
  ruler: MortgageRulerView | null;
  onMonth: (month: number) => void;
  formId: string;
  walk: WalkStep | null;
}) {
  const S = L.scene;
  const M = L.month;

  if (ruler === null) {
    // No figure from a refused input: every number goes, the repair stays.
    return (
      <figure
        data-learning-illustration="true"
        data-scene-state="unknown"
        className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
      >
        <figcaption className="text-sm font-medium leading-snug text-ink">
          {fill(S.title, { month: "—" })}
        </figcaption>
        <p data-learning-month="none" className="mt-2 text-sm leading-relaxed text-ink-2">
          {S.unknown}
        </p>
        <button
          type="button"
          data-scene-fix="true"
          onClick={() => {
            const target = formJumpTarget(document.getElementById(formId));
            if (target instanceof HTMLElement) focusAndScroll(target);
          }}
          className={cn(STEP, "mt-2 px-3", FH_POINTER)}
        >
          {S.fix}
        </button>
      </figure>
    );
  }

  const { scene, month, months } = ruler;
  const position = fill(M.position, { month, months });
  const rangeId = `${idBase}-month`;
  const go = (target: number) => onMonth(Math.min(Math.max(1, target), months));
  const atFirst = month <= 1;
  const atLast = month >= months;
  const steps = [
    ["first", 1, atFirst],
    ["prev", month - 1, atFirst],
    ["next", month + 1, atLast],
    ["last", months, atLast],
  ] as const;
  const headlineNote = ruler.isFinal
    ? S.headlineFinal
    : ruler.method === "flatPrincipal"
      ? S.headlineFlat
      : S.headlineAnnuity;
  const compareNow = compareText("now", ruler.interestVsReference?.now ?? null);
  const compareNext = ruler.isFinal ? null : compareText("next", ruler.interestVsReference?.next ?? null);
  const legend = [
    {
      key: "principal",
      swatch: FILL.principal,
      label: S.principalLabel,
      value: ruler.regularPrincipalText,
      meaning: S.principalMeaning,
    },
    ...(ruler.extraPrincipalText === null
      ? []
      : [
          {
            key: "extra",
            swatch: FILL.extra,
            label: S.extraLabel,
            value: ruler.extraPrincipalText,
            meaning: S.extraMeaning,
          },
        ]),
    {
      key: "interest",
      swatch: FILL.interest,
      label: S.interestLabel,
      value: ruler.interestText,
      meaning: S.interestMeaning,
    },
  ];

  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="ready"
      data-walk={walk ?? "none"}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: a text-free 3D miniature. No figure is drawn on it. */}
      <InfographicArt base={MORTGAGE_ART} alt={S.artAlt} />
      <figcaption className="mt-1 text-center text-sm font-medium leading-snug text-ink">
        {fill(S.title, { month })}
      </figcaption>

      {/* Board 02 — THIS month's payment, and where it goes. The bar's whole
          is this payment: principal (+ extra) + interest = 100%. */}
      <div data-ruler-part="payment" className={cn("mt-1", walk === "principal" && LIT)}>
        <p data-mortgage-headline="true" className="text-center font-display text-2xl font-medium tabular-nums text-brand-green-ink">
          {fill(S.headline, { payment: ruler.paymentText })}
        </p>
        <p className="text-center text-sm leading-snug text-ink-2">{headlineNote}</p>
        <SplitBar
          marker="payment"
          className="mt-2"
          segments={[
            {
              key: "principal",
              percent: ruler.shares.principal,
              className: FILL.principal,
              inside: ruler.shareTexts.principal,
              insideClassName: "text-white",
            },
            {
              key: "extra",
              percent: ruler.shares.extra,
              className: FILL.extra,
              inside: ruler.shareTexts.extra ?? undefined,
              insideClassName: "text-white",
            },
            {
              key: "interest",
              percent: ruler.shares.interest,
              className: FILL.interest,
              inside: ruler.shareTexts.interest,
              insideClassName: "text-ink",
            },
          ]}
        />
        <SplitLegend items={legend} />
      </div>

      {/* Why the split is what it is: interest is measured on the debt. */}
      <p data-ruler-part="measure" className={cn("mt-2 text-sm leading-snug text-ink-2", walk === "measure" && LIT)}>
        {fill(S.measureShort, { rate: ruler.monthlyRateText })}
      </p>

      {/* The debt STOCK after this month, on its own axis (the original loan). */}
      <div
        data-ruler-part="debt"
        className={cn("mt-2 rounded-lg bg-white px-3 py-2 ring-1 ring-ink-4/30", walk === "debt" && LIT)}
      >
        <p data-ruler-value="debt-after" className="text-base font-medium tabular-nums text-ink">
          {fill(S.debtAfterLine, { month, after: ruler.debtAfterText })}
        </p>
        <SceneStrip
          marker="debt"
          className="mt-1 h-2.5"
          segments={[
            { key: "after", percent: ruler.debtAfterPercent, className: FILL.debt },
            { key: "cut", percent: ruler.principalCutPercent, className: FILL.principal },
          ]}
          ghost={scene.ghostBalancePercent}
        />
        <ul data-debt-legend="true" className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", FILL.debt)} />
            {S.debtLegendAfter}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", FILL.principal)} />
            {S.debtLegendCut}
          </li>
        </ul>
      </div>

      <p data-ruler-part="next" className={cn("mt-2 text-sm leading-snug text-ink-2", walk === "next" && LIT)}>
        <span aria-hidden="true">↻ </span>
        {ruler.isFinal || ruler.nextInterestText === null
          ? S.finalShort
          : fill(S.nextShort, { nextMonth: month + 1, nextInterest: ruler.nextInterestText })}
      </p>

      {scene.referencePaidOffMonth !== null ? (
        <p data-scene-reference-paid-off={scene.referencePaidOffMonth} className="mt-2 text-sm leading-snug text-ink-2">
          {fill(S.referencePaidOff, { month: scene.referencePaidOffMonth })}
        </p>
      ) : compareNow !== null || compareNext !== null ? (
        <p data-ruler-compare="true" className="mt-2 text-sm leading-snug text-ink">
          {[compareNow, compareNext].filter(Boolean).join(" ")}
        </p>
      ) : null}
      <p className="mt-1 text-sm leading-snug text-ink-2">{S.roundedNote}</p>

      {/* The month control, right under the flow. Native range: arrows,
          Page Up/Down, Home/End. It changes which month is LOOKED AT; it never
          edits the form or makes a payment. */}
      {months > 1 ? (
        <div data-learning-month={month} data-learning-months={months} className="mt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <label htmlFor={rangeId} className="text-sm text-ink-2">
              {S.monthLabel}
            </label>
            <span data-learning-month-position="true" className={cn("text-sm font-medium tabular-nums text-ink", WRAP)}>
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
            aria-valuetext={position}
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
                aria-label={S.steps[key].name}
                aria-disabled={off ? true : undefined}
                aria-controls={rangeId}
                onClick={() => {
                  if (!off) go(target);
                }}
                className={cn(STEP, FH_POINTER)}
              >
                {S.steps[key].short}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p
          data-learning-month={month}
          data-learning-months={months}
          data-learning-month-single="true"
          className="mt-2 text-sm leading-relaxed text-ink-2"
        >
          {M.single}
        </p>
      )}
    </figure>
  );
}

/**
 * "Hiểu thêm": everything that explains the figure rather than being it —
 * the axes, the true-scale note, the method, the walk-through and the exact
 * đồng. Collapsed, BELOW the try buttons.
 */
function RulerMore({
  ruler,
  walk,
  onWalk,
}: {
  ruler: MortgageRulerView;
  walk: WalkStep | null;
  onWalk: (step: WalkStep | null) => void;
}) {
  const S = L.scene;
  const method = ruler.isFinal ? S.paymentFinal : ruler.method === "flatPrincipal" ? S.paymentFlat : S.paymentAnnuity;
  return (
    <details data-ruler-more="true" className="mt-3 rounded-xl border border-ink-4/20 bg-white px-3 text-sm">
      <summary className={cn("inline-flex min-h-11 cursor-pointer items-center font-medium text-brand-green-ink", FH_POINTER)}>
        {S.moreTitle}
      </summary>
      <div className="space-y-2 pb-3 leading-relaxed text-ink-2">
        <p>{fill(S.measure, { rate: ruler.monthlyRateText, interest: ruler.interestText })}</p>
        <p>{fill(method, { month: ruler.month, payment: ruler.paymentText })}</p>
        <p>
          {fill(S.effect, { principal: ruler.principalText, interest: ruler.interestText })}
          {ruler.extraPrincipalText === null
            ? ""
            : ` ${fill(S.effectExtra, { principal: ruler.principalText, extra: ruler.extraPrincipalText })}`}
        </p>
        <p>
          {fill(S.debtScale, { opening: ruler.scene.openingText })}
          {ruler.principalCutPercent < 1 ? ` ${S.debtTiny}` : ""}
          {` ${S.debtEarlier}`}
        </p>
        <p>
          {fill(S.paymentScale, { month: ruler.month, payment: ruler.paymentText })}
          {ruler.scene.ghostBalancePercent === null ? "" : ` ${S.ghostNote}`}
        </p>

        {/* Optional: highlight one step of the flow above. Nothing hides. */}
        <div role="group" aria-label={S.stepsLegend} data-ruler-walk="true">
          <p>{S.stepsLegend}</p>
          <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {WALK.map((step) => (
              <button
                key={step}
                type="button"
                data-walk-step={step}
                aria-pressed={walk === step}
                onClick={() => onWalk(walk === step ? null : step)}
                className={cn(STEP, "px-3", FH_POINTER)}
              >
                {S.walk[step]}
              </button>
            ))}
          </div>
        </div>

        {/* The exact đồng: here the month's equation holds, to the đồng. */}
        <div data-ruler-exact="true">
          <p className="font-medium text-ink">{S.exactTitle}</p>
          <dl className="mt-1 space-y-0.5">
            {(
              [
                ["debtBefore", S.exactDebtBefore, ruler.exact.debtBefore],
                ["interest", S.exactInterest, ruler.exact.interest],
                ["payment", S.exactPayment, ruler.exact.payment],
                ["principal", S.exactPrincipal, ruler.exact.principal],
                ...(ruler.exact.extraPrincipal === null
                  ? []
                  : ([["extra", S.exactExtra, ruler.exact.extraPrincipal]] as const)),
                ["debtAfter", S.exactDebtAfter, ruler.exact.debtAfter],
              ] as const
            ).map(([key, label, value]) => (
              <div key={key} data-exact-row={key} className="flex flex-wrap justify-between gap-x-3">
                <dt>{label}</dt>
                <dd className={cn("tabular-nums text-ink", WRAP)}>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1">{S.exactRounding}</p>
        </div>
      </div>
    </details>
  );
}

/**
 * Board 03 — what the latest press did: the payoff on one time axis, the
 * rounded before/after, the cause, then the exact figures (collapsed).
 */
function MortgageImpact({ impact }: { impact: MortgageImpactView }) {
  const I = L.impact;
  return (
    <div data-learning-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
      <p className="text-sm font-semibold text-ink-2">{I.heading}</p>
      <p className={cn("mt-1 text-sm leading-relaxed text-ink", WRAP)}>{impact.fieldLine}</p>
      <p className="mt-2 text-sm font-medium text-ink">{I.timelineTitle}</p>
      <div className="mt-1">
        <TimelineCompare
          marker="payoff"
          axisMax={impact.timeline.axisMax}
          delta={impact.timeline.delta}
          rows={[
            {
              key: "before",
              label: I.barBefore,
              value: impact.timeline.before,
              text: impact.timeline.beforeText,
              className: "bg-ink-3",
            },
            {
              key: "after",
              label: I.barAfter,
              value: impact.timeline.after,
              text: impact.timeline.afterText,
              className: "bg-brand-green-ink",
            },
          ]}
        />
      </div>
      {/* The rounded before/after, three short columns; exact đồng below. */}
      <dl data-impact-compare="true" className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 gap-y-1 text-sm">
        <dt className="text-ink-2">{I.compareTitle}</dt>
        <dd className="text-right text-ink-2">{I.compareBefore}</dd>
        <dd className="text-right font-medium text-brand-green-ink">{I.compareAfter}</dd>
        {impact.compare.map((row) => (
          <div key={row.key} data-impact-line={row.key} className="contents">
            <dt className="text-ink">{row.label}</dt>
            <dd className="text-right tabular-nums text-ink">{row.before}</dd>
            <dd className="text-right font-medium tabular-nums text-ink">{row.after}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">{impact.why}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{impact.lesson}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{impact.question}</p>
      <details data-learning-exact="true" className="mt-3 text-sm">
        <summary className={cn("cursor-pointer font-medium text-brand-green-ink", FH_POINTER)}>
          {I.exactTitle}
        </summary>
        <ResultTable
          className="mt-2"
          caption={I.exactCaption}
          mobileCards
          columns={[
            { label: I.exactItem },
            { label: I.exactBefore, numeric: true },
            { label: I.exactAfter, numeric: true },
          ]}
          rows={impact.exact.map((row) => [row.label, row.before, row.after])}
        />
      </details>
    </div>
  );
}
