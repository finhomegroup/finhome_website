"use client";

import { focusAndScroll } from "@/components/calc/result-cta";
import type { PairBar, TrialAvailability } from "@/components/calc/learning-trials";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/*
 * The controls the A2/A3 learning panels share. A1's panel owns its own
 * copies; these are the same classes and the same behaviour, so the three
 * tools look and act alike without touching the deployed pilot.
 *
 * A PRESS NEVER MOVES FOCUS OR THE BUTTONS. They stay mounted, and a blocked
 * one is `aria-disabled` rather than `disabled`, so it keeps focus and reads
 * its visible reason through `aria-describedby`.
 */

/** A 44 px pill that fills its half of the row on a phone. */
const BUTTON =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border bg-white px-3 py-1 text-center text-sm font-medium leading-tight";

/**
 * No `transition-*`: these panels sit AFTER a chart, on pages whose chart
 * contract is "animates nothing at all" — the way this suite honours
 * `prefers-reduced-motion`. The hover colour changes instantly instead.
 */
const PRIMARY =
  "border-brand-green-ink text-brand-green-ink hover:bg-brand-green-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-not-allowed aria-disabled:border-ink-4/40 aria-disabled:bg-transparent aria-disabled:text-ink-2 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-2";

const SECONDARY =
  "border-ink-4/60 text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink aria-disabled:cursor-default aria-disabled:border-ink-4/40 aria-disabled:text-ink-2 aria-disabled:hover:border-ink-4/40";

/** Long figures wrap inside their cell rather than widen the panel. */
export const WRAP = "min-w-0 [overflow-wrap:anywhere]";

/** The part of a DOM element `formJumpTarget` needs — so a test can pass a fake. */
type Queryable<T> = { querySelector: (selector: string) => T | null };

/**
 * Where "Nhập số của bạn" lands: the first field marked invalid, else the
 * first control in the form. The same rule as A1's; it moves focus only.
 */
export function formJumpTarget<T>(form: Queryable<T> | null): T | null {
  if (form === null) return null;
  return (
    form.querySelector('[aria-invalid="true"]') ??
    form.querySelector("input, select, textarea")
  );
}

/** Focus the `NumberField` marked with `fieldKey`, inside the form. */
export function jumpToField(formId: string, field: string): void {
  const target = document
    .getElementById(formId)
    ?.querySelector<HTMLElement>(`[data-calc-field="${CSS.escape(field)}"]`);
  if (target) focusAndScroll(target);
}

export type TrialControlsProps<K extends string> = {
  /** Prefix for the ids this row creates; unique per page. */
  idBase: string;
  keys: readonly K[];
  labels: Record<K, string>;
  availability: Record<K, TrialAvailability>;
  canUndo: boolean;
  undoLabel: string;
  undoNone: string;
  openFormLabel: string;
  formId: string;
  onTry: (key: K) => void;
  onUndo: () => void;
  /** One more plain button, after "Nhập số của bạn" — e.g. a field jump. */
  extra?: { label: string; onPress: () => void; marker: string };
  /**
   * Render the row's own "Nhập số của bạn". Default true for every page; a
   * page that already shows that exact action at the top of its panel passes
   * false so the reader never meets two identical entry controls.
   */
  showOpenForm?: boolean;
};

/** The try buttons, undo, "Nhập số của bạn" and every blocked reason. */
export function TrialControls<K extends string>({
  idBase,
  keys,
  labels,
  availability,
  canUndo,
  undoLabel,
  undoNone,
  openFormLabel,
  formId,
  onTry,
  onUndo,
  extra,
  showOpenForm = true,
}: TrialControlsProps<K>) {
  const reasonId = (key: K) => `${idBase}-${key}-blocked`;
  const undoNoneId = `${idBase}-undo-none`;
  // One shared reason is said once, not once per button.
  const reasons = keys.flatMap((key) => {
    const state = availability[key];
    return state.enabled ? [] : [{ key, reason: state.reason }];
  });
  const shared =
    reasons.length === keys.length && reasons.every((r) => r.reason === reasons[0].reason)
      ? reasons[0].reason
      : null;
  const sharedId = `${idBase}-blocked`;

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {keys.map((key) => {
          const state = availability[key];
          const described = state.enabled ? undefined : shared !== null ? sharedId : reasonId(key);
          return (
            <button
              key={key}
              type="button"
              data-learning-try={key}
              aria-disabled={state.enabled ? undefined : true}
              aria-describedby={described}
              onClick={(event) => {
                // A double-click is one press; a key press has detail 0.
                if (event.detail > 1 || !state.enabled) return;
                onTry(key);
              }}
              className={cn(BUTTON, PRIMARY, FH_POINTER)}
            >
              {labels[key]}
            </button>
          );
        })}
        <button
          type="button"
          data-learning-undo="true"
          aria-disabled={canUndo ? undefined : true}
          aria-describedby={canUndo ? undefined : undoNoneId}
          onClick={(event) => {
            if (event.detail > 1 || !canUndo) return;
            onUndo();
          }}
          className={cn(BUTTON, SECONDARY, FH_POINTER)}
        >
          {undoLabel}
        </button>
        {/* To the reader's own figures: the first field with an error, else
            the first field. Focus only; no value is written. */}
        {showOpenForm ? (
          <button
            type="button"
            data-learning-open-form="true"
            onClick={() => {
              const target = formJumpTarget(document.getElementById(formId));
              if (target instanceof HTMLElement) focusAndScroll(target);
            }}
            className={cn(BUTTON, SECONDARY, FH_POINTER)}
          >
            {openFormLabel}
          </button>
        ) : null}
        {extra ? (
          <button
            type="button"
            data-learning-jump={extra.marker}
            onClick={extra.onPress}
            className={cn(BUTTON, SECONDARY, FH_POINTER, "col-span-2")}
          >
            {extra.label}
          </button>
        ) : null}
      </div>
      {canUndo ? null : (
        <span id={undoNoneId} className="sr-only">
          {undoNone}
        </span>
      )}
      {shared !== null ? (
        <p id={sharedId} data-learning-blocked="all" className="mt-2 text-sm leading-relaxed text-ink-2">
          {shared}
        </p>
      ) : (
        reasons.map(({ key, reason }) => (
          <p
            key={key}
            id={reasonId(key)}
            data-learning-blocked={key}
            className="mt-2 text-sm leading-relaxed text-ink-2"
          >
            {reason}
          </p>
        ))
      )}
    </>
  );
}

/**
 * Two bars on ONE axis from 0. Before is neutral grey, after is brand ink:
 * neither colour means good or bad, and each bar carries its label and
 * rounded figure in text. A labelled group, not a `<figure>`: the page's
 * charts are its figures.
 */
export function PairBars({
  title,
  note,
  bars,
}: {
  title: string;
  note: string;
  bars: readonly PairBar[];
}) {
  return (
    <div data-learning-bars="true" role="group" aria-label={title} className="mt-3">
      <p className="text-sm font-medium text-ink">{title}</p>
      <ul className="mt-2 space-y-2">
        {bars.map((bar) => (
          <li key={bar.side} data-learning-bar={bar.side}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span className="text-ink-2">{bar.label}</span>
              <span className={cn("font-medium tabular-nums text-ink", WRAP)}>{bar.text}</span>
            </div>
            <div aria-hidden="true" className="mt-1 h-3 w-full rounded-full bg-white">
              <div
                data-bar-percent={bar.percent.toFixed(2)}
                className={cn(
                  "h-3 rounded-full",
                  bar.side === "before" ? "bg-ink-3" : "bg-brand-green-ink",
                )}
                style={{ width: `${bar.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs leading-5 text-ink-2">{note}</p>
    </div>
  );
}
