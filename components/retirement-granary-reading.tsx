"use client";

import { BowlSwatch } from "@/components/calc/granary-bowl";
import { BOWL_STATES } from "@/lib/calc/charts/retirement-granary-chart";
import type { HeroView } from "@/components/retirement-granary-hero-view";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const H = C.hero;

/**
 * The retirement hero's reading, after the target: the key to the bowls, the
 * sentences behind the picture (what one saving step is worth among them),
 * and the conditions the conclusion rests on. The way into the full form is
 * the target panel's second button.
 */
export function HeroReading({ view, summaryId }: { view: HeroView; summaryId: string }) {
  const drawn = view.model.kind === "unavailable" ? null : view.model;
  // EVERYTHING HERE KEEPS ITS HEIGHT, because the form sits below it: a reader
  // clearing a field to retype it must not see the form jump. The key lists
  // every state, the conditions are fixed-length and visible, and only the
  // sentences whose length follows the answer sit in a collapsed disclosure.
  return (
    <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-2 md:col-span-2 md:row-start-4 md:mt-1">
      {/* The two layers, said once before the key that shows them. */}
      <p className="text-ink-2">{H.legendLayers}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label={H.legendTitle}>
        {BOWL_STATES.map((state) => (
          <li key={state} className="flex items-center gap-1.5 text-ink-2">
            <BowlSwatch state={state} zeroNeed={drawn?.zeroNeedReason ?? null} />
            <span>
              {state === "covered"
                ? drawn?.zeroNeedReason === "noSpending"
                  ? H.figure.legend.coveredNoSpending
                  : H.figure.legend.coveredOtherIncome
                : H.figure.legend[state]}
            </span>
          </li>
        ))}
      </ul>
      <details data-hero-reading="true" className="group">
        <summary className="cursor-pointer py-3 text-sm font-medium text-ink-2 hover:text-brand-green-ink">
          {H.readingTitle}
        </summary>
        <div className="mt-1 space-y-2">
          {/* What one saving step is worth — detail, now that the target
              panel carries the suggestion itself. */}
          {view.stepTotal ? <p>{view.stepTotal}</p> : null}
          {drawn ? (
            <>
              {/* The whole definition of a bowl, for the gable's short label. */}
              <p>{drawn.unit}</p>
              <p id={summaryId} data-granary-summary="true">
                {drawn.summary.join(" ")}
              </p>
            </>
          ) : null}
          {view.reasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      </details>
      {/* The conditions that can change the conclusion stay VISIBLE beside
          it — the approved contract's never-collapse rule, docs §5. Both keep
          their height while the reader types: the note is fixed, and the
          rates line is reserved at its longest — four rates like −10,25% —
          at each width: five lines below 390 px, four to `sm`, then three
          and two. */}
      <p className="text-ink-3">{view.estimate}</p>
      <p className="min-h-[4lh] text-ink-3 max-[390px]:min-h-[5lh] sm:min-h-[3lh] md:min-h-[2lh]">
        {view.assumptions}
      </p>
    </div>
  );
}
