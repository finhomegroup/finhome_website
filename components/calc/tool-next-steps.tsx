import Link from "next/link";
import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import { nextStepsFor } from "@/content/calculators/next-steps";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * The route from one buying question to the next, plus an honest statement
 * about what this page does with the reader's figures.
 *
 * TWO FINDINGS THIS ANSWERS.
 *
 * 1. On all 75 pages the only link inside the main content went back to the
 *    directory. A reader who had just worked out a price had nowhere to go
 *    with it. Each step here names the QUESTION the reader now has, not the
 *    tool that answers it — the tool's title already says that.
 * 2. The header's "Thử ngay" control had `href="#"` and did nothing
 *    observable. There is no verified app destination anywhere in this
 *    codebase, so this component offers none: instead of a save button that
 *    cannot save, it states that the page stores nothing and tells the reader
 *    what to do about it. A button that looked like it worked would be the
 *    same defect with better styling.
 *
 * Renders NOTHING for a tool with no entry in `next-steps.ts`, which is 70 of
 * the 75 today. A tip calculator does not get a home-buying funnel, and a
 * United States payroll tool does not get an acquisition CTA. `next-steps.test.ts`
 * asserts that shelved tools have no entry.
 *
 * A server component: only links and text, no state.
 */
export function ToolNextSteps({
  slug,
  className,
}: {
  /** Registry slug of the tool the reader is on. */
  slug: string;
  className?: string;
}) {
  const steps = nextStepsFor(slug);

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {C.nextSteps.title}
      </h2>

      {steps ? (
        <div>
          <p className="text-base leading-relaxed text-ink-2">{steps.intro}</p>

          <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-3">
            {C.nextSteps.toolsTitle}
          </h3>
          <ul className="mt-2 grid gap-3 md:grid-cols-2">
            {steps.tools.map((step) => {
              const entry = getCalculator(step.slug);
              if (!entry) {
                // A dead next step is worse than none: the reader got there
                // because we told them to. Failing the build is the cheap end.
                throw new Error(
                  `components/calc/tool-next-steps.tsx: "${slug}" links to ` +
                    `"${step.slug}", which is not in the registry.`,
                );
              }
              return (
                <li key={step.slug}>
                  <Link
                    href={`${calculatorPath(step.slug)}/`}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-4 transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                      FH_POINTER,
                    )}
                  >
                    <span className="text-sm leading-relaxed text-ink">
                      {step.why}
                    </span>
                    <span className="mt-2 text-sm font-medium text-brand-green-ink">
                      {entry.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* The education seam. Undefined for every tool today: the articles
              do not exist yet, and `next-steps.test.ts` fails on an href with
              no route behind it. */}
          {steps.education ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              <Link
                href={steps.education.href}
                className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
              >
                {steps.education.label}
              </Link>{" "}
              — {steps.education.why}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl bg-bg-soft p-5">
        <h3 className="font-display text-base font-medium text-ink">
          {C.nextSteps.saveTitle}
        </h3>
        {/* A route may correct this paragraph for itself — see
            `next-steps.ts`. The unit converter has a working copy button, so
            the shared "nhập lại là cách duy nhất" clause is false there. */}
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {steps?.saveBody ?? C.nextSteps.saveBody}
        </p>
      </div>
    </section>
  );
}
