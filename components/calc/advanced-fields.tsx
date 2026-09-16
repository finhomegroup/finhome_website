"use client";

import { useState } from "react";
import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import {
  settingsSummary,
  shouldOpen,
  type DisclosedSetting,
} from "@/lib/calc/disclosed-settings";
import { cn } from "@/lib/cn";

/**
 * A collapsed panel of advanced inputs that cannot hide what it is doing.
 *
 * The disclosure shortens the route to a first answer — on a phone the audit
 * measured the first input field 801–966 px down the page, most of that
 * introductory copy and settings nobody had asked for. Collapsing them is the
 * fix. But a collapsed panel creates a worse problem than the one it solves if
 * a setting inside it can move the headline silently, so:
 *
 * - the `<summary>` line always names what is ACTIVE inside, with its value,
 *   and it says so whether the panel is open or closed;
 * - the panel starts OPEN whenever anything inside it is active.
 *
 * Both come from `lib/calc/disclosed-settings.ts`, where they are tested.
 *
 * The active-settings sentence is a child of `<summary>` rather than a
 * sibling: `<summary>` is a flow container, so everything in it renders on the
 * collapsed line — which is exactly when the reader needs to be told that a
 * hidden PMI rate is moving their instalment. A sibling paragraph would be
 * invisible in precisely that case.
 *
 * THE PANEL IS PUSHED OPEN, NEVER PULLED CLOSED. `open` used to be a pure
 * function of `settings`, which meant React re-applied it on every render —
 * so zeroing the LAST active field inside the panel closed it mid-edit and
 * took away the field the reader was working in. An independent review
 * reproduced that on the advanced APR page: clear the last cash fee and the
 * financed-fee box below it disappears.
 *
 * The latch below fixes it with one piece of state and no effect:
 *
 * - the first render is still a pure function of the props, so the server's
 *   attribute matches the client's first render on a prefilled form;
 * - once open — because something was active, or because the reader opened it
 *   — it stays open while values change;
 * - the reader can always close it, and it stays closed;
 * - a setting becoming active again re-opens it, because a collapsed panel
 *   that is moving the headline is the thing this component exists to prevent.
 *
 * A native `<details>`: keyboard-operable and functional with no JavaScript,
 * where a hand-rolled toggle would need `aria-expanded`, focus management and
 * a click handler to reach the same place.
 */
export function AdvancedFields({
  title,
  settings,
  emptySummary,
  className,
  children,
}: {
  /** e.g. "Chi phí kèm theo và thiết lập nâng cao". */
  title: string;
  /** Everything inside, with `active` decided by the calculator. */
  settings: readonly DisclosedSetting[];
  /**
   * Replaces the shared "nothing here is affecting the result" line.
   *
   * For a panel where that sentence is the wrong description — the loan
   * comparison's third offer is not a "setting", it is a column that is
   * either in the comparison or not.
   */
  emptySummary?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const summary = settingsSummary(settings, {
    none: emptySummary ?? C.advanced.summaryNone,
    separator: C.advanced.summarySeparator,
    limit: C.advanced.summaryLimit,
    more: C.advanced.summaryMore,
  });

  const forcedOpen = shouldOpen(settings);
  // Seeded from the props, so the first client render matches the server's.
  // Afterwards it only records what the READER did with the panel.
  const [readerOpen, setReaderOpen] = useState(forcedOpen);

  return (
    <details
      // `||`, not `=`: an active setting forces the panel open, and nothing
      // forces it closed except the reader.
      open={forcedOpen || readerOpen}
      onToggle={(event) => setReaderOpen(event.currentTarget.open)}
      className={cn("rounded-2xl border border-ink-4/20 p-4", className)}
    >
      <summary
        title={C.advanced.toggleHint}
        className="cursor-pointer list-item"
      >
        <span className="font-display text-base font-medium text-ink">
          {title}
        </span>
        <span className="mt-1 block text-sm font-normal leading-relaxed text-ink-3">
          {summary}
        </span>
      </summary>

      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}
