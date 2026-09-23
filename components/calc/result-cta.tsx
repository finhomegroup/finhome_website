"use client";

import { useId } from "react";
import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import { PLACEHOLDER } from "@/lib/calc/number";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * The primary action that closes the gap between the last input and the answer.
 *
 * WHAT THE 2026-09-21 AUDIT ACTUALLY FOUND, because it decides the shape of
 * this component: on all 76 live routes the calculation already worked and
 * already recomputed on every edit, and on all 76 there was no primary control
 * leading from the form to the result. 58 of the 76 put the first numeric input
 * below a 390×844 viewport's first screen, and the result heading sat between
 * 613 px and 4.820 px down. The defect was never the arithmetic; it was that a
 * reader who filled a form had nothing telling them the answer existed or where
 * it was.
 *
 * SO THIS BUTTON DOES NOT CALCULATE, AND MUST NOT PRETEND TO.
 *
 * - Automatic recalculation is UNCHANGED. Every calculator still parses its
 *   fields on render, so the answer on screen is already current when the
 *   button is pressed. The visible note says so, because a button labelled
 *   "Xem kết quả" over a live result invites exactly the wrong inference.
 * - There is no pending state, no spinner and no disabled state. A disabled
 *   button is the worst available answer to an invalid form: it removes the one
 *   control that could explain what is wrong. Pressed with a bad field, this
 *   takes the reader TO that field instead.
 * - Nothing here writes to a field. `useCalcFields` keeps raw strings and this
 *   component only reads the DOM, so a half-typed "7," survives being sent
 *   back to.
 *
 * WHY THE INVALID BRANCH READS THE DOM RATHER THAN A PROP. `NumberField` owns
 * `aria-invalid` for every input in the suite (docs §4: accessibility lives in
 * the primitives), so `[aria-invalid="true"]` inside the form region IS the set
 * of invalid fields, in document order, with no page having to enumerate its
 * own keys. A page that forgets to thread the `invalid` prop gets a wrong HELP
 * SENTENCE; it still cannot get the wrong DESTINATION. The prop is deliberately
 * not the authority on where to jump.
 *
 * WHY IT OPENS ANCESTOR `<details>`. `AdvancedFields` force-opens itself while
 * a setting inside it is moving the result, and it counts a malformed entry as
 * active — but only for settings the page declared. A field that is invalid
 * inside any collapsed disclosure would otherwise be focused while hidden,
 * which is a focus trap in the only place a reader cannot see. Walking the
 * ancestor chain and setting `open` is the recovery, and it reveals the field
 * rather than scrolling to a summary line.
 *
 * REDUCED MOTION is respected by choosing the scroll behaviour at click time
 * from `prefers-reduced-motion`, not by animating and hoping. `focus` is called
 * with `preventScroll` so its own instant jump does not cancel the smooth
 * scroll that was just requested.
 *
 * IN FLOW ON MOBILE. The audit allows a bottom bar on a long mobile form; the
 * approved contract makes it optional and forbids covering content or the
 * keyboard. An in-flow button cannot do either, so the phone layout stays in
 * flow.
 *
 * `sticky` + `answer` are the DESKTOP affordance, and only that. A browser pass
 * measured the retirement primary panel at y 636 with the CTA at y 2465: on a
 * long form, editing a lower field puts the answer off screen. This pins the
 * CTA block — one short row, the last child of the form column — to the bottom
 * of the viewport, carrying the current main answer. It is deliberately NOT the
 * result panel: pinning that would paint it over its own chart as the chart
 * scrolls under it, and the contract forbids pinning a result column taller
 * than the screen.
 *
 * WHETHER IT PINS AT ALL IS A CSS DECISION, not a prop, and it is not `lg`.
 * A sticky element paints over the siblings it scrolled past, so a 204 px block
 * pinned on a 768 px-tall desktop covered the next input a Tab press moved to —
 * the one failure of the browser acceptance pass. The height threshold, the
 * pinned surface and the scroll padding that keeps a focused field clear of it
 * all have to agree, so all three live together in `app/globals.css` under
 * `.fh-cta-pin`; below the threshold this block simply stays in flow, where it
 * cannot cover anything.
 */
export function ResultCta({
  formId,
  targetId,
  invalid,
  label,
  answer,
  sticky = false,
  className,
}: {
  /**
   * `id` of the element containing the inputs — `CalculatorLayout` puts it on
   * the form region. The invalid search is scoped to it, so a stray
   * `aria-invalid` anywhere else on the page cannot capture the button.
   */
  formId: string;
  /** `id` of the primary result region. `ResultGroup`'s `anchorId`. */
  targetId: string;
  /** Any shown field unusable. Drives the HELP TEXT only — see the docstring. */
  invalid: boolean;
  /** Overrides the shared label where a tool's answer has a better name. */
  label?: string;
  /**
   * The ONE main answer, restated on the pinned block from `lg` up.
   *
   * Pass the SAME formatted string the primary `ResultRow` renders, never a
   * second formatting of the same number — two roundings of one quantity is
   * the defect this shape could otherwise introduce. `null` renders the
   * placeholder, exactly as the row does.
   *
   * Only rendered when `sticky` is set: an in-flow restatement directly above
   * a result the reader can already see is noise.
   */
  answer?: { label: string; value: string | null };
  /** Pin the block to the viewport bottom from `lg` up. Long forms only. */
  sticky?: boolean;
  className?: string;
}) {
  const noteId = useId();

  return (
    <div
      className={cn(
        "mt-8",
        // `fh-cta-pin` owns the pinning and the viewport-height threshold it
        // is allowed under; the surface is a card from `lg` either way,
        // because a block that may float has to be opaque and bounded.
        sticky &&
          "fh-cta-pin lg:rounded-2xl lg:border lg:border-ink-4/20 lg:bg-white lg:p-4 lg:shadow-sm",
        className,
      )}
      data-calc-cta="true"
    >
      {/*
        A VISUAL restatement, hidden from assistive technology on purpose.
        The authoritative copy is inside the one live results region this
        button points at, and announcing a duplicate would report a single
        recomputation twice. A screen-reader user reaches the real row with the
        button; a sighted user reading a long form gets the figure kept on
        screen. `data-calc-answer` is the hook the render tests use.
      */}
      {sticky && answer ? (
        <p
          aria-hidden="true"
          data-calc-answer="true"
          className="mb-3 hidden items-baseline justify-between gap-3 lg:flex"
        >
          <span className="text-sm leading-snug text-ink-2">
            {answer.label}
          </span>
          <span className="font-display text-lg font-medium tabular-nums text-ink">
            {answer.value ?? PLACEHOLDER}
          </span>
        </p>
      ) : null}

      <button
        type="button"
        // Names the region this moves the reader to, which is the whole
        // function of the control.
        aria-controls={targetId}
        aria-describedby={noteId}
        onClick={() => jumpToAnswer(formId, targetId)}
        className={cn(
          // `brand-green-ink`, not `brand-green`: white on the raw brand green
          // measures 3.02:1 and this label needs 4.5:1. Same hue, darkened
          // until it clears AA — see components/ui/brand-contrast.test.ts,
          // which reads this file.
          "inline-flex w-full items-center justify-center rounded-full bg-brand-green-ink px-5 py-3 font-display text-base font-medium text-white transition",
          "hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
          FH_POINTER,
        )}
      >
        {label ?? C.cta.label}
      </button>

      {/*
        Not a live region. `NumberField` already announces its own validity
        change on the field itself, and a second announcement of the same event
        from a different place reads as a second problem. This is the button's
        description, reached through `aria-describedby` on focus.
      */}
      <p id={noteId} className="mt-2 text-sm leading-relaxed text-ink-3">
        {invalid ? C.cta.invalidNote : C.cta.autoNote}
      </p>
    </div>
  );
}

/** True only when the reader has asked for less motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Open every collapsed `<details>` above `el`.
 *
 * Focusing an element inside a closed disclosure moves focus somewhere the
 * reader cannot see. Opening the ancestors first is what makes "go to the first
 * invalid field" a recovery rather than a trap.
 */
function revealAncestors(el: Element): void {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node instanceof HTMLDetailsElement && !node.open) node.open = true;
  }
}

function focusAndScroll(el: HTMLElement): void {
  revealAncestors(el);
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
  });
  el.focus({ preventScroll: true });
}

/**
 * The whole contract, in one place: first invalid field if there is one,
 * otherwise the answer. Never both, and never nothing.
 */
function jumpToAnswer(formId: string, targetId: string): void {
  const form = document.getElementById(formId);
  // Document order inside the form region, which is reading order — the layout
  // never reorders the form's own children.
  const firstInvalid =
    form?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? null;

  if (firstInvalid) {
    focusAndScroll(firstInvalid);
    return;
  }

  const target = document.getElementById(targetId);
  if (target) focusAndScroll(target);
}
