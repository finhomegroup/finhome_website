import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";
import { furtherSteps, isAppJourneyTool, nextStepsFor } from "@/content/calculators/next-steps";
import { APP_INTRO } from "@/content/site";
import { EducationLink } from "./education-link";
import { NextStepCard } from "./next-step-card";
import { cn } from "@/lib/cn";

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
 * Renders NOTHING for a tool with no entry in `next-steps.ts`, which is most
 * of the suite — derive the count from the registry, not from this line. A tip calculator does not get a home-buying funnel, and a
 * United States payroll tool does not get an acquisition CTA. `next-steps.test.ts`
 * asserts that shelved tools have no entry.
 *
 * A server component: only links and text, no state.
 */
export function ToolNextSteps({
  slug,
  promoted = false,
  className,
}: {
  /** Registry slug of the tool the reader is on. */
  slug: string;
  /**
   * The first one or two actions already render beside the answer, in the
   * layout's `actions` slot (`ResultActions`). So this block drops the intro
   * that block now carries and lists only `furtherSteps` under
   * `furtherTitle` — nothing is deleted, it is the same list split by
   * `NEAR_ANSWER_ACTIONS`. The education link and the retention panel stay
   * here either way: both are longer guidance, not an action.
   */
  promoted?: boolean;
  className?: string;
}) {
  const steps = nextStepsFor(slug);
  const tools = promoted ? furtherSteps(slug) : (steps?.tools ?? []);

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {C.nextSteps.title}
      </h2>

      {steps && (tools.length > 0 || steps.education || !promoted) ? (
        <div>
          {promoted ? null : (
            <p className="text-base leading-relaxed text-ink-2">{steps.intro}</p>
          )}

          {tools.length > 0 ? (
            <>
              <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-3">
                {promoted ? C.nextSteps.furtherTitle : C.nextSteps.toolsTitle}
              </h3>
              <ul className="mt-2 grid gap-3 md:grid-cols-2">
                {tools.map((step) => (
                  <NextStepCard key={step.slug} step={step} from={slug} />
                ))}
              </ul>
            </>
          ) : null}

          {/* The education seam, in a new tab so the form survives (map T03).
              `next-steps.test.ts` fails on an href with no article behind it. */}
          {steps.education ? (
            <EducationLink
              href={steps.education.href}
              label={steps.education.label}
              why={steps.education.why}
            />
          ) : null}
        </div>
      ) : null}

      {/* The app introduction, home-buying journeys ONLY (map T06), after the
          answer and never in place of "Xem kết quả". The site-chrome marker
          hides it inside the app's own web view. */}
      {isAppJourneyTool(slug) ? (
        <div
          data-finhome-site-chrome="app-intro"
          className="rounded-2xl border border-ink-4/15 bg-white p-5"
        >
          <h3 className="font-display text-base font-medium text-ink">{C.nextSteps.appTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{C.nextSteps.appBody}</p>
          <a
            href={APP_INTRO.href}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            {APP_INTRO.label}
          </a>
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
