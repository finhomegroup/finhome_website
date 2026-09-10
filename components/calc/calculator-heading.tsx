import Link from "next/link";
import { CALCULATOR_HUB } from "@/content/calculators/hub";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

/**
 * Visible, shared heading for every calculator detail page.
 *
 * This deliberately does not use `Reveal`: the tool name and the route back
 * to the calculator index are primary navigation, so they must be present
 * and visible in the first static HTML even before hydration or animation.
 */
export function CalculatorHeading({
  title,
  lede,
}: {
  title: string;
  lede: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <nav
        aria-label={CALCULATOR_HUB.detailNavigationLabel}
        className="flex min-w-0 items-center gap-3"
      >
        <Link
          href="/cong-cu/"
          aria-label={CALCULATOR_HUB.backAriaLabel}
          data-calculator-back="true"
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink-4/35 bg-white px-4 text-sm font-medium text-ink-2 shadow-[0_1px_10px_rgba(0,0,0,0.03)] transition-colors hover:border-brand-green/40 hover:text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
            FH_POINTER,
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {CALCULATOR_HUB.backLabel}
        </Link>

        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-ink-4/40" />
        <span
          aria-current="page"
          data-calculator-title="true"
          className="min-w-0 truncate font-display text-sm font-medium text-ink-2 md:text-base"
        >
          {title}
        </span>
      </nav>

      <div className="mt-8 text-center">
        <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
          {lede}
        </p>
      </div>
    </div>
  );
}
