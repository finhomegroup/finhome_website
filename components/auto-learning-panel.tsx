"use client";

import { useId } from "react";
import {
  AUTO_TRIAL_KEYS,
  type AutoFlowView,
  type AutoImpactView,
  type AutoSceneView,
  type AutoTrialKey,
} from "@/components/auto-learning";
import {
  formJumpTarget,
  jumpToField,
  PairBars,
  TrialControls,
  WRAP,
} from "@/components/calc/learning-controls";
import {
  FlowEquation,
  InfographicArt,
  SplitBar,
  SplitLegend,
  type FlowItem,
} from "@/components/calc/living-infographic";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import { focusAndScroll } from "@/components/calc/result-cta";
import { ResultTable } from "@/components/calc/result-table";
import { AUTO_LEARNING as L } from "@/content/calculators/auto-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * The text-free 3D scene band (white hatchback, wallet, blank desk calendar),
 * 2,5 : 1. One constant, so replacement art is a one-line change.
 */
export const AUTO_ART = "/images/tools/auto-living-scene-v1";

/** Purchase-money fills: colour AND pattern, never colour alone. */
const FILL = {
  down: "bg-brand-green-ink",
  trade: "bg-[repeating-linear-gradient(90deg,#117f36_0_2px,#aac391_2px_5px)]",
  financed: "bg-[repeating-linear-gradient(135deg,#6d6d6d_0_2px,#bcbcbc_2px_5px)]",
} as const;

/**
 * The month's verdict colour, ALWAYS with its words: green only for a real
 * remainder under the entered figures, red only for a modelled shortfall,
 * amber for exactly zero, neutral when the month cannot be computed.
 */
const TONE: Record<AutoFlowView["state"], string> = {
  surplus: "bg-status-met-bg text-status-met ring-1 ring-status-met/30",
  caution: "bg-status-caution-bg text-status-caution ring-1 ring-status-caution/30",
  short: "bg-status-shortfall-bg text-status-shortfall ring-1 ring-status-shortfall/30",
  zero: "bg-status-caution-bg text-status-caution ring-1 ring-status-caution/30",
  limited: "bg-white text-ink-2 ring-1 ring-ink-4/40",
  unknown: "bg-white text-ink-2 ring-1 ring-ink-4/40",
};

const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink-4/60 bg-white px-3 text-sm font-medium text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink";

/**
 * "Mua xe rồi, mỗi tháng còn bao nhiêu?" on /cong-cu/vay-mua-xe/ — board 04
 * of the approved living infographic. VISUAL FIRST, INSIDE THE RESULT
 * (2026-09-29, the user's latest correction, superseding the full-width hook
 * above the form): the page renders this panel ONCE, as the `visual` of the
 * budget `ResultGroup` — form left, result card right, this picture at the
 * top of that card and the numeric summary after it. On the example figures
 * (labelled as such) until the reader types their own. A standalone car
 * tool: no home framing.
 *
 * NO CARD OF ITS OWN: the result group is the surface, so the section adds
 * no border, background or padding, and its heading is an `h3` under the
 * group's `h2`.
 *
 * "Nhập số của bạn" sits at the TOP, beside the intro, so the reader does not
 * have to walk the whole ledger to reach the form; the trial row therefore
 * omits its own copy of that button. It focuses the first invalid field, else
 * the first input — the car price.
 *
 * THE MONTH as a readable subtraction from the page's own ledger — income −
 * essentials − other debts − savings − car instalment (from the engine) −
 * running costs = what is left — with the running-cost term one press from
 * its real form field. PURCHASE money is shown APART: a deposit is not a
 * monthly cost. Then the try buttons, what a press did, and the conditions.
 *
 * DOM order, nothing reordered by CSS. NOTHING HERE IS LIVE: the page's one
 * live sentence gains the press's head, as A1. The group places this OUTSIDE
 * its live region.
 */
export function AutoLearningPanel({
  sample,
  flow,
  scene,
  availability,
  termLabel,
  impact,
  canUndo,
  formId,
  onTry,
  onUndo,
}: {
  sample: boolean;
  flow: AutoFlowView;
  scene: AutoSceneView;
  availability: Record<AutoTrialKey, TrialAvailability>;
  termLabel: string;
  impact: AutoImpactView | null;
  canUndo: boolean;
  formId: string;
  onTry: (key: AutoTrialKey) => void;
  onUndo: () => void;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      data-auto-learning="true"
    >
      <h3 id={titleId} className="font-display text-base font-medium text-ink">
        {L.title}
      </h3>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? L.basisSample : L.basisOwn}
      </p>
      {/* The way into the form, near the top: the first field with an error,
          else the first field. Focus and scroll only; nothing is written. */}
      <button
        type="button"
        data-learning-open-form="top"
        onClick={() => {
          const target = formJumpTarget(document.getElementById(formId));
          if (target instanceof HTMLElement) focusAndScroll(target);
        }}
        className={cn(BUTTON, "mt-2", FH_POINTER)}
      >
        {L.openForm}
      </button>

      <MonthFlow flow={flow} scene={scene} formId={formId} />

      <TrialControls
        idBase={id}
        keys={AUTO_TRIAL_KEYS}
        labels={{ down: L.trials.down.label, term: termLabel, running: L.trials.running.label }}
        availability={availability}
        canUndo={canUndo}
        undoLabel={L.undo}
        undoNone={L.undoNone}
        openFormLabel={L.openForm}
        formId={formId}
        onTry={onTry}
        onUndo={onUndo}
        showOpenForm={false}
      />

      {impact === null ? null : <AutoImpact impact={impact} />}

      {/* The conditions stay VISIBLE: the debt is not the car's value. */}
      <p data-learning-limits="true" className="mt-3 text-sm leading-relaxed text-ink-2">
        {L.flow.debtNotValue} {L.limits}
      </p>
    </section>
  );
}

function MonthFlow({ flow, scene, formId }: { flow: AutoFlowView; scene: AutoSceneView; formId: string }) {
  const F = L.flow;
  const items: FlowItem[] = flow.items.map((item) => ({
    ...item,
    className: item.op === "result" ? TONE[flow.state] : undefined,
    action:
      item.key === "running" ? (
        <button
          type="button"
          data-learning-jump="running"
          onClick={() => jumpToField(formId, "running")}
          className="mt-0.5 inline-flex min-h-11 items-center text-sm font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink"
        >
          {F.editRunning}
        </button>
      ) : undefined,
  }));

  return (
    <figure
      data-learning-illustration="true"
      data-scene-state={flow.state}
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: a text-free 3D miniature. No figure is drawn on it. */}
      <InfographicArt base={AUTO_ART} alt={F.artAlt} />
      <figcaption className="mt-1 text-center text-sm font-medium leading-snug text-ink">{F.title}</figcaption>

      <div data-auto-headline={flow.state} className={cn("mt-2 rounded-lg px-3 py-2 text-center", TONE[flow.state])}>
        <p className="font-display text-2xl font-medium tabular-nums">{flow.headline}</p>
        <p className="text-sm leading-snug">{flow.note}</p>
      </div>

      {flow.items.length === 0 ? (
        <button
          type="button"
          data-scene-fix="true"
          onClick={() => {
            const target = formJumpTarget(document.getElementById(formId));
            if (target instanceof HTMLElement) focusAndScroll(target);
          }}
          className={cn(BUTTON, "mt-2", FH_POINTER)}
        >
          {L.scene.fix}
        </button>
      ) : (
        <div className="mt-2">
          <FlowEquation marker="month" items={items} />
        </div>
      )}
      <Upfront scene={scene} formId={formId} />
      <p className="mt-2 text-sm leading-snug text-ink-2">{F.roundedNote}</p>
    </figure>
  );
}

/** Purchase money, APART from the month: shares of the car price. */
function Upfront({ scene, formId }: { scene: AutoSceneView; formId: string }) {
  const F = L.flow;
  const S = L.scene;
  if (scene.kind === "unknown" || scene.kind === "excess") {
    return (
      <div data-auto-upfront={scene.kind} className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-ink-4/30">
        <p className="text-sm font-medium text-ink">{F.upfrontTitle}</p>
        <p data-scene-message={scene.kind} className="mt-1 text-sm leading-snug text-ink-2">
          {scene.kind === "unknown" ? S.unknown : S.excess}
        </p>
        <button
          type="button"
          data-scene-fix="true"
          onClick={() => {
            const target = formJumpTarget(document.getElementById(formId));
            if (target instanceof HTMLElement) focusAndScroll(target);
          }}
          className={cn(BUTTON, "mt-2", FH_POINTER)}
        >
          {S.fix}
        </button>
      </div>
    );
  }
  return (
    <div data-auto-upfront={scene.kind} className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-ink-4/30">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-sm font-medium text-ink">{F.upfrontTitle}</p>
        <p className="text-sm text-ink-2">
          {S.priceTitle}: <span className="font-medium tabular-nums text-ink">{scene.priceText}</span>
        </p>
      </div>
      <SplitBar
        marker="upfront"
        className="mt-1.5 h-5"
        segments={[
          { key: "down", percent: scene.downPercent, className: FILL.down },
          { key: "trade", percent: scene.tradePercent, className: FILL.trade },
          { key: "financed", percent: scene.financedPercent, className: FILL.financed },
        ]}
      />
      <SplitLegend
        items={[
          { key: "down", swatch: FILL.down, label: S.downLegend, value: scene.downText },
          ...(scene.tradeText === null
            ? []
            : [{ key: "trade", swatch: FILL.trade, label: S.tradeLegend, value: scene.tradeText }]),
          {
            key: "financed",
            swatch: FILL.financed,
            label: S.financedLegend,
            value: scene.kind === "cash" ? S.noLoan : scene.financedText,
          },
        ]}
      />
    </div>
  );
}

function AutoImpact({ impact }: { impact: AutoImpactView }) {
  const I = L.impact;
  return (
    <div data-learning-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
      <p className="text-sm font-semibold text-ink-2">{I.heading}</p>
      <p className={cn("mt-1 text-sm leading-relaxed text-ink", WRAP)}>{impact.fieldLine}</p>
      <ul className="mt-1 space-y-0.5 text-sm leading-relaxed text-ink">
        <li data-impact-line="payment">{impact.paymentLine}</li>
        <li data-impact-line="interest">{impact.interestLine}</li>
        <li data-impact-line="months">{impact.monthsLine}</li>
        <li data-impact-line="budget">{impact.budgetLine}</li>
      </ul>
      {impact.budgetNote ? (
        <p className="mt-1 text-sm leading-snug text-ink-2">{impact.budgetNote}</p>
      ) : null}
      {impact.statusLine ? (
        <p className="mt-1 text-sm leading-relaxed text-ink">{impact.statusLine}</p>
      ) : null}
      {impact.bars === null ? null : <PairBars title={I.barsTitle} note={I.barsNote} bars={impact.bars} />}
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
