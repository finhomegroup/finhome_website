"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * A button that copies one line of text, on an explicit click and never
 * otherwise.
 *
 * ORIGINAL ROW 71 asks for a copyable result. Two things this component is
 * careful about, both because the clipboard is the reader's, not ours:
 *
 * - **Nothing is written without a click.** There is no effect, no focus
 *   handler and no auto-copy on render. The only call to
 *   `navigator.clipboard.writeText` is inside `onClick`.
 * - **The text is VISIBLE before it is copied.** The caller renders the same
 *   string on the page, so a reader can also select it by hand — and knows
 *   exactly what the button would put on their clipboard.
 *
 * The clipboard API needs a secure context and can be refused by the browser,
 * so a failure says so rather than claiming a copy that did not happen. The
 * status line is `aria-live="polite"` because the outcome is otherwise
 * invisible to a screen reader.
 *
 * THE FEEDBACK IS BOUND TO THE TEXT IT WAS ABOUT. The first version kept a
 * bare "copied" flag, so after a successful copy the reader could edit the
 * inputs, watch the equation change, and still be told it was on their
 * clipboard — it was not. The state now carries the attempted string and is
 * shown only while that string is still what the button would copy. The same
 * check covers a late `writeText` resolution: by then the visible text may
 * have moved on, and the stale result cannot claim it.
 */
export function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  className,
}: {
  /** Exactly what goes on the clipboard. */
  text: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  className?: string;
}) {
  /** The outcome AND the string it was about. */
  const [result, setResult] = useState<{
    text: string;
    state: "copied" | "failed";
  } | null>(null);

  const copy = async () => {
    // Captured now: `text` can change while `writeText` is in flight, and the
    // result belongs to the string the reader actually clicked on.
    const attempted = text;
    try {
      // Optional chaining, not a try/catch alone: a browser with no clipboard
      // API at all would throw a TypeError that reads like a bug.
      const clipboard = navigator.clipboard;
      if (!clipboard) {
        setResult({ text: attempted, state: "failed" });
        return;
      }
      await clipboard.writeText(attempted);
      setResult({ text: attempted, state: "copied" });
    } catch {
      setResult({ text: attempted, state: "failed" });
    }
  };

  // Stale the moment the equation changes, so an edited figure is never
  // reported as being on the clipboard.
  const state = result !== null && result.text === text ? result.state : "idle";

  return (
    <div className={cn("mt-3", className)}>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "min-h-11 rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 font-display text-sm font-medium text-ink transition",
          "hover:border-brand-green focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30",
          FH_POINTER,
        )}
      >
        {label}
      </button>
      <p aria-live="polite" className="mt-2 text-sm leading-relaxed text-ink-3">
        {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : ""}
      </p>
    </div>
  );
}
