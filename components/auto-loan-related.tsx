import Link from "next/link";
import { EducationLink } from "@/components/calc/education-link";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";

export type AutoLoanRelatedTool = {
  slug: string;
  href: string;
  title: string;
  why: string;
  newTab: boolean;
};

const LINK =
  "font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2";

/**
 * What follows the car calculator: the guide that explains a result, then
 * the car tools. The route resolves `related` through the registry.
 *
 * Both links a reader is likely to come BACK from — the explanation and the
 * fuel estimate — open in a new tab and say so inside the link, so the form
 * in this tab keeps its figures. Nothing claims the form is saved.
 */
export function AutoLoanRelated({ related }: { related: readonly AutoLoanRelatedTool[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {C.relatedTools.title}
      </h2>
      <EducationLink
        href={C.explainer.href}
        label={C.explainer.label}
        why={C.explainer.why}
      />
      <p className="mt-4 text-sm leading-relaxed text-ink-2">
        {C.relatedTools.intro}
      </p>
      <ul className="mt-3 space-y-3">
        {related.map((tool) => (
          <li key={tool.slug} className="text-sm leading-relaxed">
            {tool.newTab ? (
              <a href={tool.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                {tool.title}
                <span className="ml-1 whitespace-nowrap font-normal">
                  {TOOL_SHELL.nextSteps.newTabNote}
                </span>
              </a>
            ) : (
              <Link href={tool.href} className={LINK}>
                {tool.title}
              </Link>
            )}
            <span className="text-ink-2"> — {tool.why}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
