"use client";

import { focusAndScroll } from "@/components/calc/result-cta";
import { RiceBasket } from "@/components/calc/rice-basket";
import { RETIREMENT_FORM_ID } from "@/components/retirement-plan-state";
import type { TargetView } from "@/components/retirement-plan-target-view";
import { cn } from "@/lib/cn";
import type { LeverKey } from "@/lib/calc/retirement-levers";
import { FH_POINTER } from "@/lib/interaction-styles";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const T = C.hero.target;

/**
 * A sentence whose figures change with the plan, reserved at its longest
 * state: three lines on a phone, four below 360 px, two from `sm`, and three
 * again from `lg`, where the panel's two columns are 355 px each. Measured
 * across twenty states, extreme figures among them, at 320–1280 px.
 */
const SENTENCE =
  "min-h-[3lh] text-sm leading-relaxed max-[360px]:min-h-[4lh] sm:min-h-[2lh] lg:min-h-[3lh]";

/**
 * A 44 px pill that fills its half of the row on a phone, with room for a
 * label of two tight lines, and takes its own width from `sm`.
 */
const BUTTON =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border bg-white px-3 py-1 text-center text-sm font-medium leading-tight sm:w-auto sm:whitespace-nowrap sm:px-4";

/**
 * "Mục tiêu hưu trí", after the levers: what the capital pays for, then three
 * rows — the capital to have at retirement, the capital the plan reaches, and
 * what is missing or spare — what "theo giá hôm nay" means by one bowl of
 * phở, the share reached as rice in a basket (bồ thóc), the store every bowl
 * is scooped from, and one change that closes the gap.
 *
 * THE SUGGESTION TYPES FOR THE READER, like a lever: "Thử mức này" writes
 * the field's next raw string through the same press a lever makes, so the
 * bowls move, the echo says what changed and the ONE live sentence announces
 * it. Nothing here is live, and nothing is computed — `targetView` resolved
 * every word.
 *
 * A TRY CAN BE TAKEN BACK. After "Thử mức này" the same button reads "Hoàn
 * tác lần thử" and puts the field back to what the reader had — only while
 * that field still holds the tried value (`undo` is null otherwise).
 *
 * FIXED HEIGHT. Every figure sits in a row whose label and figure hold one
 * line; each sentence is reserved at its longest state — three lines on a
 * phone, four below 360 px, two from `sm` — the share sentence never
 * outgrows the basket beside it, the basket keeps its place when there is
 * none to draw, and the button stays — `aria-disabled` when there is nothing
 * to try or take back — so a press neither moves the form below nor drops
 * focus.
 */
export function RetirementTargetPanel({
  target,
  onApply,
  undo,
}: {
  target: TargetView;
  onApply: (key: LeverKey, next: string) => void;
  /** Take back the last "Thử mức này", while it still holds. */
  undo: (() => void) | null;
}) {
  const { apply } = target;
  const action = undo ? "undo" : apply ? "apply" : "settled";
  return (
    <div
      data-hero-target={target.kind}
      className="mt-5 rounded-2xl border border-grain-ink/25 bg-grain-soft/60 p-4 md:col-span-2 md:row-start-3 md:mt-1"
    >
      {/* One basis for every figure below, said once. */}
      <p className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-grain-ink">
          {T.title}
        </span>
        {/* `ink-2`: 12 px on the panel's tint needs 4,5:1, which `ink-3` misses. */}
        <span className="text-xs text-ink-2">{T.basisTag}</span>
      </p>
      {/* From `lg`, two columns: what the plan comes to on the left, what it
          means and what to do on the right — the same order in one column on
          a phone. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-6">
        <div>
          <p className={cn("mt-1 text-ink-2", SENTENCE)}>{target.basis}</p>
          <dl data-hero-target-rows="true" className="mt-2 space-y-1">
            {target.rows.map((row, index) => (
              <div key={index} className="flex items-baseline justify-between gap-3">
                <dt className="min-w-0 text-sm font-medium text-ink-2">{row.label}</dt>
                <dd
                  className={cn(
                    "shrink-0 whitespace-nowrap tabular-nums text-ink",
                    index === 0 ? "font-display text-lg font-semibold" : "text-base font-medium",
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {/* The share, drawn as rice in the basket; the sentence beside it
              says the same in words, in two lines at most — the basket's height. */}
          <div className="mt-2 flex items-center gap-3">
            <RiceBasket share={target.share} heaped={target.heaped} />
            <p className="flex-1 text-sm leading-relaxed text-ink-2">{target.progress}</p>
          </div>
        </div>
        <div>
          {/* "Theo giá hôm nay", by one bowl of phở — the engine's own price rise. */}
          <p data-hero-pho="true" className={cn("mt-1 flex items-start gap-2 text-ink-2", SENTENCE)}>
            {target.pho ? (
              <>
                <PhoBowl />
                <span>{target.pho}</span>
              </>
            ) : null}
          </p>
          <p className={cn("mt-1 text-ink", SENTENCE)}>{undo ? T.tried : target.suggestion}</p>
          <TargetButtons
            action={action}
            apply={apply}
            settledLabel={target.settledLabel}
            onApply={onApply}
            undo={undo}
          />
          {/* How the saving is counted, always: a monthly figure is a budget
              equivalence, not the schedule the engine assumes. */}
          <p className="mt-2 text-xs leading-5 text-ink-2">{T.timing}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The try (or its undo, or its settled label) and the way to the form. Two
 * halves of one row on a phone, whose labels may take two lines inside the
 * 44 px — "Hoàn tác lần thử" beside "Nhập số của bạn" is wider than a 360 px
 * panel — then side by side at their own width.
 */
function TargetButtons({
  action,
  apply,
  settledLabel,
  onApply,
  undo,
}: {
  action: "undo" | "apply" | "settled";
  apply: TargetView["apply"];
  settledLabel: string;
  onApply: (key: LeverKey, next: string) => void;
  undo: (() => void) | null;
}) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <button
        type="button"
        data-hero-target-apply="true"
        aria-label={action === "apply" ? apply?.name : undefined}
        aria-disabled={action === "settled" ? true : undefined}
        onClick={(event) => {
          // The second click of a double-click lands on the undo the first
          // one just made; a press is one click (a key press has detail 0).
          if (event.detail > 1) return;
          if (undo) undo();
          else if (apply !== null) onApply(apply.key, apply.next);
        }}
        className={cn(
          BUTTON,
          "border-brand-green-ink text-brand-green-ink transition-colors",
          "hover:bg-brand-green-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
          "aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:bg-transparent aria-disabled:text-ink-2 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-2",
          FH_POINTER,
        )}
      >
        {action === "undo" ? T.undo : action === "apply" ? T.apply : settledLabel}
      </button>
      {/* The way to the reader's own numbers, beside the suggestion. */}
      <button
        type="button"
        data-hero-open-form="true"
        onClick={() => {
          const first = document
            .getElementById(RETIREMENT_FORM_ID)
            ?.querySelector<HTMLElement>("input");
          if (first) focusAndScroll(first);
        }}
        className={cn(
          BUTTON,
          "border-ink-4/60 text-brand-green-ink",
          "hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
          FH_POINTER,
        )}
      >
        {C.hero.openForm}
      </button>
    </div>
  );
}

/** A bowl of phở, steaming — a small picture beside the price example. */
function PhoBowl() {
  return (
    <svg
      viewBox="0 0 28 22"
      aria-hidden="true"
      focusable="false"
      className="mt-0.5 h-5 w-auto shrink-0"
    >
      <path
        d="M9 7 q-2 -3 0 -6 M14 7 q-2 -3 0 -6 M19 7 q-2 -3 0 -6"
        fill="none"
        className="stroke-grain-ink"
        strokeWidth={1.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M3 10 H25 A11 8.5 0 0 1 3 10 Z"
        className="fill-grain-soft stroke-bowl"
        strokeWidth={1.4}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M11 20.5 H17"
        className="stroke-bowl"
        strokeWidth={1.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
