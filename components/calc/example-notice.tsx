"use client";

import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * The badge that separates a worked example from the reader's own figures.
 *
 * WHY THIS EXISTS. Every calculator here ships prefilled, which is good — a
 * blank form teaches nothing. But a page that renders a complete, confident
 * result on arrival looks like it has answered a question nobody asked, so the
 * state is stated.
 *
 * WHY IT IS ONE LINE. The first version was a bordered box with an eight-line
 * paragraph, and the browser check found it eating most of a 390 px entry
 * screen with the first input at 887,5 px. It is now a single inline row —
 * badge, separator, one short sentence — with the full explanation behind a
 * disclosure that sits AFTER the form rather than before it. Nothing was
 * deleted; it moved out of the way.
 *
 * `pristine` is computed by the calculator against its own initial values.
 */
export function ExampleNotice({
  pristine,
  onReset,
  className,
}: {
  /** True while every field is still at its example value. */
  pristine: boolean;
  /** Puts every field back to the example. */
  onReset: () => void;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug text-ink-2",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
          pristine
            ? "bg-ink-4/25 text-ink-2"
            : "bg-brand-green/15 text-brand-green",
        )}
      >
        {pristine ? C.example.badge : C.example.personalBadge}
      </span>
      <span aria-hidden className="text-ink-4">
        ·
      </span>
      <span>{pristine ? C.example.note : C.example.personalNote}</span>
      {!pristine ? (
        <button
          type="button"
          onClick={onReset}
          title={C.example.resetHelp}
          className={cn(
            "font-medium text-ink-2 underline decoration-ink-4 underline-offset-2 transition-colors hover:text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
            FH_POINTER,
          )}
        >
          {C.example.resetLabel}
        </button>
      ) : null}
    </p>
  );
}

/**
 * The full explanation of the example state, collapsed.
 *
 * Rendered by each calculator AFTER its result, so the sentence a reader might
 * want ("is this my data? is it stored?") is available without standing
 * between them and the form.
 */
export function ExampleNoticeDetail({ className }: { className?: string }) {
  return (
    <details className={cn("text-sm", className)}>
      <summary className="cursor-pointer font-medium text-ink-2 hover:text-brand-green">
        {C.example.detailTitle}
      </summary>
      <p className="mt-2 leading-relaxed text-ink-2">{C.example.detail}</p>
    </details>
  );
}
