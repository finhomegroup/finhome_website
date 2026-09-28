"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/** One direction of a lever: its visible text, its accessible name, whether it moves. */
export type LeverButton = {
  /** What the button shows, e.g. "+12 triệu/năm". */
  text: string;
  /** The accessible name. MUST start with `text` (WCAG 2.5.3, label in name). */
  name: string;
  enabled: boolean;
};

/**
 * A −/+ stepper over one calculator field, for a route whose first input is
 * a lever rather than a text box.
 *
 * IT TYPES FOR THE READER. A press calls `onStep`, which writes the field's
 * next raw string through the same binding a keystroke uses; the value shown
 * here is the page's own formatting of that field. Nothing is stored and
 * nothing is computed in this component.
 *
 * NOT A LIVE REGION. No `<output>` (its implicit role is `status`), no
 * `aria-live`, no `role="status"`: the page's ONE live region announces the
 * settled conclusion, and a second one here would report one press twice.
 * The value is the buttons' description, read on focus.
 *
 * A PRESS NEVER MOVES FOCUS, and a blocked direction stays focusable —
 * `aria-disabled` rather than `disabled`, which would drop the focus of a
 * reader who just pressed their way to the limit. The reason it is blocked
 * replaces the hint in the same line, and from `lg`, where three levers share
 * a row and a column is narrow, that line keeps room for two — so a longer
 * reason or a long figure cannot move what is below.
 */
export function LeverStepper({
  leverKey,
  label,
  value,
  hint,
  down,
  up,
  onStep,
  className,
}: {
  /** The field this lever writes, emitted as `data-lever`. */
  leverKey: string;
  label: string;
  value: string;
  hint: string;
  down: LeverButton;
  up: LeverButton;
  onStep: (direction: 1 | -1) => void;
  className?: string;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const hintId = `${id}-hint`;

  const button = (spec: LeverButton, direction: 1 | -1) => (
    <button
      type="button"
      aria-label={spec.name}
      aria-describedby={`${valueId} ${hintId}`}
      aria-disabled={spec.enabled ? undefined : true}
      data-lever-step={direction === 1 ? "up" : "down"}
      onClick={() => {
        if (spec.enabled) onStep(direction);
      }}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-full border border-ink-4/60 bg-white px-3 text-sm font-medium text-brand-green-ink transition-colors lg:px-2 lg:text-[13px]",
        "hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
        "aria-disabled:cursor-not-allowed aria-disabled:border-ink-4/40 aria-disabled:text-ink-3 aria-disabled:hover:border-ink-4/40",
        FH_POINTER,
      )}
    >
      {spec.text}
    </button>
  );

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-lever={leverKey}
      className={cn("min-w-0", className)}
    >
      {/* Label and value side by side, or stacked where a long value would
          wrap them only sometimes: below 360 px, and from `lg`, three to a row. */}
      <div className="flex items-baseline justify-between gap-3 max-[360px]:flex-col max-[360px]:items-start max-[360px]:gap-0.5 lg:flex-col lg:items-start lg:gap-0.5">
        <span id={labelId} className="text-sm font-medium text-ink-2">
          {label}
        </span>
        <span
          id={valueId}
          className="shrink-0 font-display text-base font-medium tabular-nums text-ink"
        >
          {value}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {button(down, -1)}
        {button(up, 1)}
      </div>
      <p id={hintId} className="mt-1.5 text-xs leading-4 text-ink-3 lg:min-h-[2lh]">
        {hint}
      </p>
    </div>
  );
}
