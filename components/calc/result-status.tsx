"use client";

import { useEffect, useState } from "react";
import { focusAndScroll } from "@/components/calc/result-cta";
import {
  StatusIcon,
  TONE_INK,
  TONE_SURFACE,
} from "@/components/calc/status-tone";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { FH_POINTER } from "@/lib/interaction-styles";
import type { ResultTone } from "@/lib/calc/result-status";
import { cn } from "@/lib/cn";

const S = TOOL_SHELL.status;

/**
 * What a result card SAYS, fully resolved by the calculator from its status
 * adapter and its content file. Nothing here computes or formats a figure.
 */
export type StatusView = {
  /** Omitted means neutral: the card defaults to "chưa kết luận". */
  tone?: ResultTone;
  /** Overrides the shared word for this tone. */
  label?: string;
  /** The conclusion, in a sentence that names what it is compared with. */
  title: string;
  /** The ONE figure or milestone the conclusion turns on. */
  fact?: string | null;
  /** Why — the limitation, the binding constraint, the excluded cost. */
  reasons?: readonly (string | null)[];
  /** What to try. */
  next?: string | null;
  /** Fields on THIS page to go and change — by the key `NumberField` carries. */
  actions?: readonly { field: string; label: string }[];
};

/** The tone a view resolves to. */
export const toneOf = (view: StatusView | null): ResultTone =>
  view?.tone ?? "unknown";

/** The word a view resolves to. */
export const labelOf = (view: StatusView | null): string =>
  view?.label ?? S.labels[toneOf(view)];

/**
 * The one sentence the live region announces: label and conclusion together,
 * so the tone is heard in WORDS and the figure travels with it.
 */
export const announcementOf = (view: StatusView | null): string =>
  view === null
    ? S.labels.unknown
    : [labelOf(view), view.title, view.fact]
        .filter((part): part is string => Boolean(part))
        .join(S.announcementJoin);

/**
 * The semantic result card: tone word + icon → conclusion → the one figure →
 * why → what to try → where to try it.
 *
 * NEUTRAL BY DEFAULT. A card given no tone is "chưa kết luận" on white; the
 * three coloured tones are opt-in per route, and the plan's pilot opts in
 * exactly three. Nothing here decides a tone — the tool's status adapter
 * does, from the engine's own flags.
 *
 * NOT AN INTERRUPTION. No `role="alert"`, no live region of its own, no
 * focus movement: it sits in the result panel ABOVE the rows and is read in
 * order. The announcement is the ONE live region's job — see
 * `ResultGroup`'s `announcement` and `useSettledText`.
 *
 * THE ACTIONS CHANGE NOTHING. Each is a button that opens any closed
 * disclosure around the named field and focuses it, the same recovery
 * `ResultCta` uses for an invalid field. No value is written and nothing
 * travels to another page, which is the truthful behaviour for a site that
 * stores nothing.
 */
export function ResultStatusCard({
  status,
  formId,
  className,
}: {
  status: StatusView;
  /** The form region the actions search, so they cannot land elsewhere. */
  formId: string;
  className?: string;
}) {
  const tone = toneOf(status);
  const reasons = (status.reasons ?? []).filter(
    (reason): reason is string => Boolean(reason),
  );
  const actions = status.actions ?? [];

  return (
    <section
      data-result-status={tone}
      className={cn("mt-3 rounded-xl border p-4", TONE_SURFACE[tone], className)}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          TONE_INK[tone],
        )}
      >
        <StatusIcon tone={tone} />
        <span>{labelOf(status)}</span>
      </p>
      <p
        className={cn(
          "mt-1.5 font-display text-lg font-medium leading-snug",
          tone === "unknown" ? "text-ink" : TONE_INK[tone],
        )}
      >
        {status.title}
      </p>
      {status.fact ? (
        <p className="mt-1 text-base leading-relaxed text-ink">{status.fact}</p>
      ) : null}
      {reasons.map((reason) => (
        <p key={reason} className="mt-2 text-sm leading-relaxed text-ink-2">
          {reason}
        </p>
      ))}
      {status.next ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{status.next}</p>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-3">
          {/* `ink-2`, not `ink-3`: at 14 px `ink-3` measured 4,425:1 on the
              red tint and 4,423:1 on the green one. Every text ink in this
              file is checked against every tint by the contrast test. */}
          <p className="text-sm text-ink-2">{S.actionsLabel}</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {actions.map((action) => (
              <li key={action.field}>
                <button
                  type="button"
                  data-calc-jump={action.field}
                  onClick={() => jumpToField(formId, action.field)}
                  className={cn(
                    "rounded-full border border-ink-4/60 bg-white px-3 py-1.5 text-sm font-medium text-brand-green-ink",
                    "hover:border-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
                    FH_POINTER,
                  )}
                >
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Focus the field `NumberField` marked with `fieldKey`, inside the form. */
function jumpToField(formId: string, field: string): void {
  const form = document.getElementById(formId);
  const target = form?.querySelector<HTMLElement>(
    `[data-calc-field="${CSS.escape(field)}"]`,
  );
  if (target) focusAndScroll(target);
}

/**
 * How long a status must hold before it is ANNOUNCED — about 400 ms.
 *
 * The plan's proposal, to be confirmed by a real screen-reader session; none
 * has been run. The VISIBLE card and the rows update on every keystroke as
 * they always have; only the spoken sentence waits, so a reader typing
 * "1.500.000" hears one conclusion rather than seven.
 */
export const STATUS_SETTLE_MS = 400;

/** What the announcer holds: a text, and the input it was settled for. */
export type Settled = { text: string; for: string };

/**
 * The announced text, given what has settled and what is current.
 *
 * EMPTY while a newer text is still settling, so an old conclusion — a green
 * from the last valid keystroke — is never left standing in the live region
 * while the answer underneath it has already changed. Emptying a node is not
 * announced; the new sentence is, once, when it settles.
 */
export function settledText(settled: Settled, current: string): string {
  return settled.for === current ? settled.text : "";
}

/**
 * The announcer's first state: settled FOR the opening text, holding none.
 *
 * A page load is not a change and announces nothing; and the card above the
 * rows already says the opening conclusion, so a populated hidden copy would
 * be read twice by a reader moving through the page. The same value on the
 * server and the client, so hydration cannot disagree.
 */
export const initialSettled = (text: string): Settled => ({ text: "", for: text });

/**
 * `text`, once it has held for `STATUS_SETTLE_MS` after an EDIT; nothing in
 * between, and nothing at page load.
 *
 * The state is only set from the timer, never synchronously inside the
 * effect, and never for the opening text — so the server's prerender and the
 * client's hydration agree.
 */
export function useSettledText(text: string, delay = STATUS_SETTLE_MS): string {
  const [settled, setSettled] = useState<Settled>(() => initialSettled(text));
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setSettled((previous) =>
          previous.for === text ? previous : { text, for: text },
        ),
      delay,
    );
    return () => clearTimeout(timer);
  }, [text, delay]);
  return settledText(settled, text);
}
