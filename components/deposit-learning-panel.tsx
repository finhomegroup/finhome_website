"use client";

import { useId } from "react";
import { SAVINGS_ART } from "@/components/accumulation-learning-panel";
import { formJumpTarget, PairBars, TrialControls, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import type { TrialAvailability } from "@/components/calc/learning-trials";
import { InfographicArt, SplitBar } from "@/components/calc/living-infographic";
import { focusAndScroll } from "@/components/calc/result-cta";
import type { DepositImpact, DepositTrialKey, DepositView } from "@/components/deposit-learning";
import { DEPOSIT_LEARNING as L } from "@/content/calculators/deposit-learning";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/** White/grey/ink with texture: nothing here reads as a guaranteed gain. */
const PART_FILL: Record<string, string> = {
  principal: "bg-ink-3/70",
  interest: "bg-[repeating-linear-gradient(135deg,#1f2933_0_2px,#cfd4da_2px_6px)]",
  interestAtNeed: "bg-[repeating-linear-gradient(135deg,#1f2933_0_2px,#cfd4da_2px_6px)]",
  interestAlready: "bg-[radial-gradient(#1f2933_1px,#e5e7eb_1px)] bg-[length:5px_5px]",
};

const EVENT_MARK: Record<string, string> = {
  start: "size-3 rounded-full bg-ink",
  maturity: "size-3 rounded-full border-2 border-ink bg-white",
  end: "size-3 rounded-full bg-ink",
  exit: "size-3.5 rotate-45 bg-status-caution",
  need: "size-3.5 rotate-45 bg-brand-green-ink",
};

const STEP =
  "inline-flex min-h-11 items-center justify-center rounded-2xl border border-ink-4/60 bg-white px-3 py-1 text-center text-sm font-medium leading-tight text-brand-green-ink [overflow-wrap:anywhere] hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink";

/**
 * "Tiền có sẵn khi bạn cần không?" on /cong-cu/tien-gui-co-ky-han/, in
 * `CalculatorLayout`'s `learning` slot: after the answer, before the actions
 * and the existing timeline and bars, same DOM order at every width.
 *
 * A CASH-EVENT figure, not the savings vessel: a short 2D timeline of the
 * deposit, its real maturities and the exit / need date, then the named
 * whole of the money at that moment split into what it is made of. The
 * trials write the page's OWN fields (the break month, the need date) at
 * fixed landmarks, with undo. NOTHING HERE IS LIVE.
 */
export function DepositLearningPanel({
  sample,
  view,
  emptyText,
  emptyFix,
  formId,
  trial,
  impact,
}: {
  sample: boolean;
  view: DepositView | null;
  emptyText: string;
  /** True only when a field is actually invalid. */
  emptyFix: boolean;
  formId: string;
  trial: {
    keys: readonly DepositTrialKey[];
    labels: Record<DepositTrialKey, string>;
    availability: Record<DepositTrialKey, TrialAvailability>;
    canUndo: boolean;
    onTry: (key: DepositTrialKey) => void;
    onUndo: () => void;
  };
  impact: DepositImpact | null;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      data-deposit-learning={view?.mode ?? "none"}
      className="mt-6 sm:rounded-2xl sm:border sm:border-ink-4/20 sm:bg-white sm:p-4"
    >
      <h2 id={titleId} className="font-display text-base font-medium text-ink">
        {L.title}
      </h2>
      <p data-learning-basis={sample ? "sample" : "own"} className="mt-0.5 text-sm leading-5 text-ink-2">
        {sample ? L.basisSample : L.basisOwn}
      </p>

      <figure
        data-learning-illustration="true"
        data-scene-state={view === null ? "unknown" : "ready"}
        className="mt-3 rounded-xl border border-ink-4/15 bg-bg-soft p-3"
      >
        <InfographicArt base={SAVINGS_ART} alt={L.artAlt} />
        {view === null ? (
          <>
            <figcaption className="mt-1 text-sm font-medium leading-snug text-ink">{emptyText}</figcaption>
            {emptyFix ? (
              <button
                type="button"
                data-scene-fix="true"
                onClick={() => {
                  const target = formJumpTarget(document.getElementById(formId));
                  if (target instanceof HTMLElement) focusAndScroll(target);
                }}
                className={cn(STEP, "mt-2", FH_POINTER)}
              >
                {L.fix}
              </button>
            ) : null}
          </>
        ) : (
          <Events view={view} />
        )}
      </figure>

      <TrialControls
        idBase={id}
        keys={trial.keys}
        labels={trial.labels}
        availability={trial.availability}
        canUndo={trial.canUndo}
        undoLabel={L.undo}
        undoNone={L.undoNone}
        openFormLabel={L.openForm}
        formId={formId}
        onTry={trial.onTry}
        onUndo={trial.onUndo}
      />

      {impact === null ? null : (
        <div data-learning-impact={impact.key} className="mt-3 rounded-xl bg-bg-soft p-3">
          <p className="text-sm font-medium text-ink">{impact.heading}</p>
          {impact.lines.map((line) => (
            <p key={line} className={cn("mt-1 text-sm leading-relaxed text-ink", WRAP)}>
              {line}
            </p>
          ))}
          {impact.bars === null ? null : <PairBars title={impact.barsTitle} note={impact.barsNote} bars={impact.bars} />}
        </div>
      )}

      <p data-learning-limits="true" className="mt-3 text-sm leading-relaxed text-ink-2">
        {L.limits}
      </p>
    </section>
  );
}

function Events({ view }: { view: DepositView }) {
  return (
    <>
      <figcaption data-deposit-caption="true" className="mt-1 text-center text-sm font-medium leading-snug text-ink">
        {view.caption}
      </figcaption>

      {/* The track: positions only, the words are in the list below. */}
      <div aria-hidden="true" data-deposit-track="true" className="relative mx-2 mt-3 h-4">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink-4/40" />
        {view.events.map((event) => (
          <span
            key={event.key}
            data-event-mark={event.kind}
            data-percent={clampPercent(event.percent).toFixed(2)}
            className={cn("absolute top-1/2 block -translate-x-1/2 -translate-y-1/2", MARK_MOTION, EVENT_MARK[event.kind])}
            style={{ left: `${clampPercent(event.percent)}%` }}
          />
        ))}
      </div>
      <ol data-deposit-events="true" className="mt-2 space-y-1 text-sm leading-snug">
        {view.events.map((event) => (
          <li key={event.key} data-event={event.kind} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span aria-hidden="true" className={cn("inline-block shrink-0", EVENT_MARK[event.kind])} />
              {event.label}
            </span>
            <span className="whitespace-nowrap font-medium tabular-nums text-ink">{event.when}</span>
          </li>
        ))}
      </ol>
      {view.moreNote === null ? null : <p className="mt-1 text-sm text-ink-2">{view.moreNote}</p>}

      <p
        data-deposit-state={view.tone}
        className={cn(
          "mt-3 rounded-lg px-3 py-2 text-sm font-medium leading-snug",
          view.tone === "caution"
            ? "bg-status-caution-bg text-status-caution ring-1 ring-status-caution/30"
            : "bg-white text-ink ring-1 ring-ink-4/30",
        )}
      >
        {view.state}
      </p>

      {view.whole === null ? null : (
        <div data-deposit-split="true" className="mt-3">
          <p className={cn("text-base font-medium tabular-nums text-ink", WRAP)}>{view.whole}</p>
          {view.wholeNote === null ? null : (
            <p data-deposit-whole-note="true" className="mt-0.5 text-sm font-medium leading-snug text-status-caution">
              {view.wholeNote}
            </p>
          )}
          <SplitBar
            marker="deposit"
            className="mt-1.5"
            segments={view.parts.map((part) => ({
              key: part.key,
              percent: part.percent,
              className: PART_FILL[part.key] ?? PART_FILL.principal,
            }))}
          />
          <dl className="mt-1.5 space-y-1.5">
            {view.parts.map((part) => (
              <div key={part.key} data-split-label={part.key} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <dt className="flex items-center gap-1.5 text-sm leading-snug text-ink-2">
                  <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-sm", PART_FILL[part.key] ?? PART_FILL.principal)} />
                  {part.label}
                </dt>
                <dd className="whitespace-nowrap text-base font-medium tabular-nums text-ink">{part.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {view.lines.length === 0 ? null : (
        <ul data-deposit-lines="true" className="mt-2 space-y-1 text-sm leading-relaxed text-ink">
          {view.lines.map((line) => (
            <li key={line} className={WRAP}>
              {line}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
