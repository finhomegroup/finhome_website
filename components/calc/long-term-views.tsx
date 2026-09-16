import Link from "next/link";
import { LONG_TERM_PLAN as C } from "@/content/calculators/long-term-plan";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import type { LongTermView } from "@/lib/calc/long-term-plan";

/**
 * The four questions of one long-term plan, with the current one marked.
 *
 * Original plan rows 44, 45, 48 and 50 were consolidated as a merge of
 * ANSWERS, not of URLs: `lib/calc/long-term-plan.ts` resolves one
 * `RetirementInput` into all four views with one engine, and all four URLs are
 * retained. This control is what makes that visible to a reader — without it,
 * four pages computing the same plan look like four unrelated tools, which is
 * how a reader comes to run three of them and believe they disagree.
 *
 * WHY A NAV AND NOT A TAB SET. Tabs imply one document with hidden panels, and
 * these are four prerendered URLs under `output: "export"` — each has its own
 * title, its own `h1`, its own FAQ and its own entry in the sitemap. A tab
 * widget over four documents would need JavaScript to do worse than a link
 * does for free, and it would put three of the four out of reach of a reader
 * who arrived from search. So: real links, and the current view is rendered as
 * text rather than as a link to itself.
 *
 * ACCESSIBILITY IS THE PRIMITIVES', NOT THIS COMPONENT'S (§4). There is no
 * `aria-live`, no `role`, no `tabindex` and no focus management here, because
 * a list of links needs none: `<nav>` with an accessible name, an `<ol>` whose
 * order is the reader's own progression through the plan, and `aria-current`
 * on the page they are on. The one thing this file does own is that the
 * current entry is NOT a link, so a keyboard user cannot tab to a control that
 * reloads the page they are already reading.
 *
 * A server component: links and text, no state, so it ships no client
 * JavaScript. Titles come from the registry so a renamed tool cannot leave a
 * stale label here, and an unknown slug fails `next build` rather than
 * shipping a dead link — the same judgement `ToolNextSteps` makes, for the
 * same reason: the reader is only there because we sent them.
 */
export function LongTermViews({
  current,
  className,
}: {
  /** The view the reader's own page leads with. */
  current: LongTermView;
  className?: string;
}) {
  return (
    <nav aria-label={C.views.title} className={cn("space-y-4", className)}>
      <div>
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
          {C.views.title}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-ink-2">
          {C.views.intro}
        </p>
      </div>

      <ol className="grid gap-3 md:grid-cols-2">
        {C.views.items.map((item) => {
          const entry = getCalculator(item.slug);
          if (!entry) {
            // A dead view is worse than a missing one: these four are one
            // plan, so a broken link here says the plan has a hole in it.
            throw new Error(
              `components/calc/long-term-views.tsx: view "${item.view}" points ` +
                `at "${item.slug}", which is not in content/calculators/registry.ts.`,
            );
          }

          const isCurrent = item.view === current;

          // The page the reader is on is stated, not linked. `aria-current`
          // alone would still leave a focusable control that goes nowhere.
          if (isCurrent) {
            return (
              <li key={item.slug}>
                <div
                  aria-current="page"
                  className="flex h-full flex-col rounded-2xl border border-brand-green/40 bg-bg-soft p-4"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-3">
                    {C.views.currentLabel}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-ink">
                    {item.question}
                  </span>
                  <span className="mt-2 text-sm font-medium text-ink-2">
                    {item.label}
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={item.slug}>
              <Link
                href={`${calculatorPath(item.slug)}/`}
                className={cn(
                  "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-4 transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                  FH_POINTER,
                )}
              >
                <span className="text-sm leading-relaxed text-ink">
                  {item.question}
                </span>
                <span className="mt-2 text-sm font-medium text-brand-green-ink">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
