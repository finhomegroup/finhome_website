import Link from "next/link";
import type { NextStepTool } from "@/content/calculators/next-steps";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * One next-step link: the QUESTION the reader now has, then the tool's title.
 *
 * Shared by the compact block beside the answer (`ResultActions`) and the
 * fuller block below the figure (`ToolNextSteps`), so the dead-link check below
 * cannot exist in one of them and not the other.
 */
export function NextStepCard({ step, from }: { step: NextStepTool; from: string }) {
  const entry = getCalculator(step.slug);
  if (!entry) {
    // A dead next step is worse than none: the reader got there because we
    // told them to. Failing the build is the cheap end.
    throw new Error(
      `components/calc/next-step-card.tsx: "${from}" links to ` +
        `"${step.slug}", which is not in the registry.`,
    );
  }
  return (
    <li>
      <Link
        href={`${calculatorPath(step.slug)}/`}
        className={cn(
          "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-4 transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
          FH_POINTER,
        )}
      >
        <span className="text-sm leading-relaxed text-ink">{step.why}</span>
        <span className="mt-2 text-sm font-medium text-brand-green-ink">
          {entry.title}
        </span>
      </Link>
    </li>
  );
}
