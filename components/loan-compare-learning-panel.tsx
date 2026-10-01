"use client";

import { useId } from "react";
import { formJumpTarget, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import { InfographicArt } from "@/components/calc/living-infographic";
import { focusAndScroll } from "@/components/calc/result-cta";
import { horizonStep, type CompareLane, type CompareLanesView } from "@/components/loan-compare-learning";
import { LOAN_COMPARE_LEARNING as L } from "@/content/calculators/loan-compare-learning";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/calc/charts/labels";
import { FH_POINTER } from "@/lib/interaction-styles";

/** Context art: the text-free 3D scene (townhouse, wallet, blank contract paper). */
export const COMPARE_ART = "/images/tools/mortgage-living-scene-v1";

/** A 44 px pill. Labels may wrap inside it; never past its edge. */
const STEP =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-center text-sm font-medium leading-tight text-brand-green-ink [overflow-wrap:anywhere] hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2";

/**
 * Colour AND pattern for every mark. Interest solid green, upfront fee a
 * green hatch, exit fee a dotted sand, the debt still owed plain neutral,
 * the reset payment a hatch of the first one's colour.
 */
const FILL = {
  first: "bg-brand-green-ink",
  reset: "bg-[repeating-linear-gradient(135deg,#117f36_0_3px,#7fb893_3px_6px)]",
  interest: "bg-brand-green-ink",
  upfront: "bg-[repeating-linear-gradient(90deg,#117f36_0_2px,#aac391_2px_5px)]",
  exit: "bg-[radial-gradient(#8a7650_1px,#c9b58c_1px)] bg-[length:5px_5px]",
  balance: "bg-ink-3/60",
} as const;

/** The verdict's tone, with words. Blocked is caution, never green. */
const TONE: Record<CompareLanesView["verdict"]["tone"], string> = {
  best: "bg-status-met-bg text-status-met ring-1 ring-status-met/30",
  tie: "bg-white text-ink ring-1 ring-ink-4/40",
  blocked: "bg-status-caution-bg text-status-caution ring-1 ring-status-caution/30",
};

/**
 * "Đặt các báo giá cạnh nhau" on /cong-cu/so-sanh-khoan-vay/ and
 * /cong-cu/lai-co-dinh-hay-tha-noi/, in `CalculatorLayout`'s `learning` slot:
 * after the answer, before the actions and the charts, same DOM order at
 * every width.
 *
 * F5: the 3D scene is context only; the mechanism is three 2D lanes, each on
 * its OWN named common scale — the monthly payments, the cost up to the
 * horizon (interest + upfront fee + exit fee) and the debt still owed — with
 * the horizon control beside them writing the page's own field. The verdict
 * names a cheapest option only when the guard allows. NOTHING HERE IS LIVE.
 */
export function LoanCompareLearningPanel({
  sample,
  view,
  emptyText,
  onHorizon,
  formId,
  emptyState = "unknown",
  fixLabel = L.fix,
}: {
  sample: boolean;
  view: CompareLanesView | null;
  /** Why there is no figure: the page's own reason, never a guessed one. */
  emptyText: string;
  onHorizon: (months: number) => void;
  formId: string;
  /**
   * Which empty state: an input error ("unknown", the default) or a
   * whole-tool limit, which blames no box — so its jump is worded neutrally.
   */
  emptyState?: "unknown" | "model" | "display";
  fixLabel?: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      data-compare-learning="true"
      className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4"
    >
      <h2 id={titleId} className="font-display text-base font-medium text-ink">
        {L.title}
      </h2>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? L.basisSample : L.basisOwn}
      </p>
      {view === null ? (
        <figure
          data-learning-illustration="true"
          data-scene-state={emptyState}
          className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
        >
          <figcaption className="text-sm font-medium leading-snug text-ink">{emptyText}</figcaption>
          <button
            type="button"
            data-scene-fix="true"
            onClick={() => {
              const target = formJumpTarget(document.getElementById(formId));
              if (target instanceof HTMLElement) focusAndScroll(target);
            }}
            className={cn(STEP, "mt-2", FH_POINTER)}
          >
            {fixLabel}
          </button>
        </figure>
      ) : (
        <Lanes idBase={id} view={view} onHorizon={onHorizon} />
      )}
    </section>
  );
}

function Bar({ marker, percent, className }: { marker: string; percent: number; className: string }) {
  return (
    <div aria-hidden="true" className="mt-1 h-3 w-full rounded-full bg-white ring-1 ring-ink-4/30">
      <div
        data-bar={marker}
        data-percent={clampPercent(percent).toFixed(2)}
        className={cn("h-3 rounded-full", MARK_MOTION, className)}
        style={{ width: `${clampPercent(percent)}%` }}
      />
    </div>
  );
}

function LaneName({ lane }: { lane: CompareLane }) {
  return (
    <p className={cn("text-sm font-medium text-ink", WRAP)}>
      {lane.label}
      {lane.structure === null ? null : <span className="font-normal text-ink-2"> · {lane.structure}</span>}
    </p>
  );
}

function Lanes({
  idBase,
  view,
  onHorizon,
}: {
  idBase: string;
  view: CompareLanesView;
  onHorizon: (months: number) => void;
}) {
  const rangeId = `${idBase}-horizon`;
  const { horizon, sliderMax, longestTerm } = view;
  const go = (target: number) => onHorizon(horizonStep(target, 0, sliderMax));
  const steps = [
    ["zero", 0, horizon === 0],
    ["back", horizonStep(horizon, -12, sliderMax), horizon === 0],
    ["forward", horizonStep(horizon, 12, sliderMax), horizon >= sliderMax],
    ["end", longestTerm, horizon === longestTerm],
  ] as const;
  const position = fill(L.horizonPosition, { horizon });

  return (
    <figure
      data-learning-illustration="true"
      data-scene-state="ready"
      className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
    >
      {/* Context: a text-free 3D miniature. No figure is drawn on it. */}
      <InfographicArt base={COMPARE_ART} alt={L.artAlt} />
      <figcaption className="mt-1 text-center text-sm font-medium leading-snug text-ink">{view.caption}</figcaption>

      <p
        data-compare-verdict={view.verdict.tone}
        className={cn("mt-2 rounded-lg px-3 py-2 text-sm font-medium leading-snug", TONE[view.verdict.tone])}
      >
        {view.verdict.text}
      </p>

      {/* The horizon, next to what it moves. It writes the form's own field. */}
      <div data-compare-horizon={horizon} className="mt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <label htmlFor={rangeId} className="text-sm text-ink-2">
            {L.horizonLabel}
          </label>
          <span data-compare-horizon-position="true" className="text-sm font-medium tabular-nums text-ink">
            {position}
          </span>
        </div>
        <input
          id={rangeId}
          type="range"
          min={0}
          max={sliderMax}
          step={1}
          value={horizon}
          aria-valuetext={position}
          onChange={(event) => go(Number(event.target.value))}
          className={cn("h-11 w-full accent-brand-green-ink", FH_POINTER)}
        />
        <div data-horizon-steps="true" className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-4">
          {steps.map(([key, target, off]) => (
            <button
              key={key}
              type="button"
              data-horizon-step={key}
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
        <p className="mt-1 text-sm leading-snug text-ink-2">{L.horizonHelp}</p>
      </div>

      {/* Lane 1 — cash flow, on the largest instalment. */}
      <div data-compare-lane="payments" className="mt-4">
        <p className="text-sm font-medium text-ink">{L.paymentsTitle}</p>
        <p className="text-sm leading-snug text-ink-2">{view.paymentsScale}</p>
        <ul className="mt-1.5 space-y-2.5">
          {view.lanes.map((lane) => (
            <li key={lane.index} data-lane-option={lane.index} data-lane-state={lane.state}>
              <LaneName lane={lane} />
              {lane.firstText === null ? (
                <p className="text-sm text-ink-2">{L.costInvalid}</p>
              ) : (
                <>
                  <div className="mt-0.5 flex flex-wrap justify-between gap-x-3 text-sm">
                    <span className="text-ink-2">{L.paymentFirst}</span>
                    <span className="font-medium tabular-nums text-ink">{lane.firstText}</span>
                  </div>
                  <Bar marker={`first-${lane.index}`} percent={lane.firstPercent} className={FILL.first} />
                  {lane.reset === null ? null : (
                    <>
                      <div className="mt-1 flex flex-wrap justify-between gap-x-3 text-sm">
                        <span className="text-ink-2">{fill(L.paymentReset, { month: lane.reset.month })}</span>
                        <span className="font-medium tabular-nums text-ink">{lane.reset.text}</span>
                      </div>
                      <Bar marker={`reset-${lane.index}`} percent={lane.reset.percent} className={FILL.reset} />
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-sm leading-snug text-ink">{L.paymentLesson}</p>
      </div>

      {/* Lane 2 — interest + fees up to the horizon, on the largest known cost. */}
      <div data-compare-lane="cost" className="mt-4">
        <p className="text-sm font-medium text-ink">{view.costTitle}</p>
        <p className="text-sm leading-snug text-ink-2">{view.costScale}</p>
        <ul className="mt-1.5 space-y-2.5">
          {view.lanes.map((lane) => (
            <li key={lane.index} data-lane-option={lane.index} data-lane-state={lane.state}>
              <LaneName lane={lane} />
              {lane.cost === null ? (
                <p className="text-sm text-ink-2">{L.costInvalid}</p>
              ) : lane.cost.known ? (
                <>
                  <p data-lane-cost="known" className="text-sm font-medium tabular-nums text-ink">
                    {lane.cost.total}
                  </p>
                  <div aria-hidden="true" className="mt-1 flex h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-ink-4/30">
                    {lane.cost.parts.map((part) => (
                      <div
                        key={part.key}
                        data-segment={part.key}
                        data-percent={clampPercent(part.percent).toFixed(2)}
                        className={cn("h-full shrink-0", MARK_MOTION, FILL[part.key])}
                        style={{ width: `${clampPercent(part.percent)}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-ink-2">
                    {lane.cost.parts
                      .filter((part) => part.key === "interest" || part.percent > 0)
                      .map((part) => `${part.key === "interest" ? L.costInterest : part.key === "upfront" ? L.costUpfront : L.costExit} ${part.text}`)
                      .join(" · ")}
                  </p>
                </>
              ) : (
                <>
                  <p data-lane-cost="unknown" className="text-sm font-medium text-status-caution">
                    {fill(L.costUnknown, { interest: lane.cost.interestText })}
                  </p>
                  <Bar marker={`cost-${lane.index}`} percent={lane.cost.interestPercent} className={FILL.interest} />
                </>
              )}
            </li>
          ))}
        </ul>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
          {(["interest", "upfront", "exit"] as const).map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", FILL[key])} />
              {key === "interest" ? L.costInterest : key === "upfront" ? L.costUpfront : L.costExit}
            </li>
          ))}
        </ul>
      </div>

      {/* Lane 3 — the debt still owed: an obligation, never interest. */}
      <div data-compare-lane="balance" className="mt-4">
        <p className="text-sm font-medium text-ink">{view.balanceTitle}</p>
        <p className="text-sm leading-snug text-ink-2">{view.balanceScale}</p>
        <ul className="mt-1.5 space-y-2.5">
          {view.lanes.map((lane) => (
            <li key={lane.index} data-lane-option={lane.index} data-lane-state={lane.state}>
              <LaneName lane={lane} />
              {lane.balanceText === null ? (
                <p className="text-sm text-ink-2">{L.costInvalid}</p>
              ) : (
                <>
                  <p className="text-sm font-medium tabular-nums text-ink">
                    {lane.paidOffMonth === null ? lane.balanceText : fill(L.balancePaidOff, { month: lane.paidOffMonth })}
                  </p>
                  <Bar marker={`balance-${lane.index}`} percent={lane.balancePercent} className={FILL.balance} />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-sm leading-snug text-ink">{L.horizonVsFull}</p>
      <p className="mt-1 text-sm leading-snug text-ink-2">{L.roundedNote}</p>

      <details data-compare-more="true" className="mt-2 text-sm">
        <summary className={cn("inline-flex min-h-11 cursor-pointer items-center font-medium text-brand-green-ink", FH_POINTER)}>
          {L.moreTitle}
        </summary>
        <div className="space-y-2 pb-2 leading-relaxed text-ink-2">
          <p className="font-medium text-ink">{L.fullTermTitle}</p>
          <dl data-compare-full-term="true" className="space-y-1">
            {view.lanes
              .filter((lane) => lane.state !== "invalid")
              .map((lane) => (
                <div key={lane.index} className="flex flex-wrap justify-between gap-x-3">
                  <dt>{lane.label}</dt>
                  <dd className="font-medium tabular-nums text-ink">{lane.fullTermText ?? L.fullTermUnknown}</dd>
                </div>
              ))}
          </dl>
          <p>{L.scenarioNote}</p>
        </div>
      </details>
    </figure>
  );
}
