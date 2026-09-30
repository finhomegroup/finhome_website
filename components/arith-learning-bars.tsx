"use client";

import { focusAndScroll } from "@/components/calc/result-cta";
import { jumpToField, WRAP } from "@/components/calc/learning-controls";
import { MARK_MOTION, clampPercent } from "@/components/calc/learning-scene";
import type { AxisBar } from "@/components/arith-learning-display";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { fill } from "@/lib/calc/charts/labels";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink-4/60 bg-white px-3 text-sm font-medium text-brand-green-ink hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink";

/**
 * "Nhập số của bạn" for these three tools: the first INVALID field, else the
 * first NUMBER field (`data-calc-field`). The shared generic jump takes the
 * first input of any kind, which on these forms is a mode radio.
 */
export function OpenFormButton({ formId }: { formId: string }) {
  return (
    <button
      type="button"
      data-arith-open-form="true"
      onClick={() => {
        const form = document.getElementById(formId);
        const target =
          form?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
          form?.querySelector<HTMLElement>("[data-calc-field]") ??
          null;
        if (target) focusAndScroll(target);
      }}
      className={cn(BUTTON, "mt-2", FH_POINTER)}
    >
      {W.openForm}
    </button>
  );
}

/** A real corrective jump to one named field. Focus only; nothing is written. */
export function FixFieldButton({ formId, field, label }: { formId: string; field: string; label: string }) {
  return (
    <button
      type="button"
      data-arith-fix={field}
      onClick={() => jumpToField(formId, field)}
      className={cn(BUTTON, FH_POINTER)}
    >
      {fill(W.fixField, { field: label })}
    </button>
  );
}

/** The computation-limit state: named, with a jump to each field that decides it. */
export function LimitState({ marker, formId, fields }: { marker: string; formId: string; fields: readonly { key: string; label: string }[] }) {
  return (
    <div data-arith-state="limit" data-arith-limit={marker} className="mt-3 rounded-xl bg-bg-soft p-3">
      <p className="text-sm font-medium text-ink">{W.computeLimit}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {fields.map((f) => (
          <FixFieldButton key={f.key} formId={formId} field={f.key} label={f.label} />
        ))}
      </div>
    </div>
  );
}

/** Fills: colour AND pattern, never colour alone. */
export const ARITH_FILL = {
  solid: "bg-brand-green-ink",
  hatch: "bg-[repeating-linear-gradient(135deg,#575757_0_2px,#ffffff_2px_5px)] ring-1 ring-inset ring-ink-3",
  light: "bg-brand-green-ink/35 ring-1 ring-inset ring-brand-green-ink",
} as const;

/**
 * One labelled bar on a signed axis: a zero tick and the bar from 0 to the
 * value. Decorative (`aria-hidden`); the label and text carry the meaning.
 */
export function SignedBar({
  marker,
  label,
  text,
  bar,
  zero,
  fill,
  focused = false,
}: {
  marker: string;
  label: string;
  text: string;
  bar: AxisBar | null;
  zero: number;
  fill: keyof typeof ARITH_FILL;
  focused?: boolean;
}) {
  return (
    <li data-arith-bar={marker} data-arith-negative={bar?.negative ? "true" : undefined} className={cn(focused && "rounded-md ring-2 ring-brand-green-ink ring-offset-2 ring-offset-bg-soft")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className={cn("text-ink-2", WRAP)}>{label}</span>
        <span className={cn("font-medium tabular-nums text-ink", WRAP)}>{text}</span>
      </div>
      {bar === null ? null : (
        <div aria-hidden="true" className="relative mt-1 h-3 w-full rounded-full bg-white ring-1 ring-ink-4/30">
          <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink" style={{ left: `${clampPercent(zero)}%` }} />
          <span
            data-from={clampPercent(bar.from).toFixed(2)}
            data-to={clampPercent(bar.to).toFixed(2)}
            className={cn("absolute inset-y-0 rounded-full", MARK_MOTION, ARITH_FILL[fill])}
            style={{ left: `${clampPercent(bar.from)}%`, width: `${clampPercent(bar.to) - clampPercent(bar.from)}%` }}
          />
        </div>
      )}
    </li>
  );
}
