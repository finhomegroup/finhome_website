"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A whole form behind one native `<details>`, for a route whose first input
 * is somewhere else — the tool-first hero's levers.
 *
 * COLLAPSED IN THE SERVER HTML, and a native disclosure: it opens with no
 * JavaScript at all, so a page whose hydration failed still reaches every
 * field. Only the levers need scripting.
 *
 * NOTHING ACTIVE IS HIDDEN SILENTLY (docs §5). Every hidden value that moves
 * the result is named on the `<summary>` line itself — `lines`, supplied by
 * the page — which is on screen whether the panel is open or closed. It is
 * not forced open on the defaults: every default is active, and forcing it
 * would make the collapse vacuous.
 *
 * FORCED OPEN WHILE THE PLAN CANNOT BE COMPUTED: a field the reader cannot
 * see is a field they cannot fix. The first render is a pure function of the
 * props, so the server's attribute matches hydration; the effect then pushes
 * the panel open again if the reader closes it while `forcedOpen` holds.
 * Like `AdvancedFields`, it is pushed open and never pulled closed:
 * `forcedOpen` turning false leaves it as the reader has it.
 *
 * `ResultCta`'s invalid branch and every `focusAndScroll` open it too, by
 * setting `open` on ancestor `<details>` — no wiring needed here.
 */
export function FormDisclosure({
  title,
  lines,
  forcedOpen,
  className,
  children,
}: {
  title: string;
  /** Every hidden value that moves the result, in words. */
  lines: readonly string[];
  forcedOpen: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [readerOpen, setReaderOpen] = useState(forcedOpen);

  useEffect(() => {
    if (forcedOpen && ref.current !== null && !ref.current.open) {
      ref.current.open = true;
    }
  });

  return (
    <details
      ref={ref}
      data-form-disclosure="true"
      open={forcedOpen || readerOpen}
      onToggle={(event) => setReaderOpen(event.currentTarget.open)}
      className={cn("rounded-2xl border border-ink-4/40 bg-white", className)}
    >
      <summary className="cursor-pointer list-item rounded-2xl px-4 py-3.5 marker:text-ink-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green">
        <span className="font-display text-base font-medium text-ink">{title}</span>
        {lines.map((line) => (
          <span
            key={line}
            className="mt-1 block text-sm font-normal leading-relaxed text-ink-3"
          >
            {line}
          </span>
        ))}
      </summary>
      <div className="border-t border-ink-4/30 px-4 pb-5 pt-5">{children}</div>
    </details>
  );
}
