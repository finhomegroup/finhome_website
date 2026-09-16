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
  ledeDetail,
  ledeDetailTitle,
}: {
  title: string;
  /**
   * ONE short line saying what the tool answers.
   *
   * Kept short deliberately: the browser check measured the first input 1067 px
   * down a 390 px viewport, most of it heading and introductory prose. Longer
   * explanation goes in `ledeDetail`, behind a disclosure.
   */
  lede: string;
  /** The rest of the explanation, collapsed. */
  ledeDetail?: string;
  ledeDetailTitle?: string;
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
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink-4/35 bg-white px-4 text-sm font-medium text-ink-2 shadow-[0_1px_10px_rgba(0,0,0,0.03)] transition-colors hover:border-brand-green/40 hover:text-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
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

      {/* Tighter on mobile than on desktop: the vertical rhythm that reads
          well at 1280 px pushed the first input off the first two screens at
          390 px. */}
      <div className="mt-5 text-center md:mt-8">
        <h1 className="font-display text-2xl leading-tight text-ink md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-2 md:mt-5">
          {lede}
        </p>
        {ledeDetail && ledeDetailTitle ? (
          <details className="mx-auto mt-2 max-w-2xl text-left">
            <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
              {ledeDetailTitle}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {ledeDetail}
            </p>
          </details>
        ) : null}
      </div>
    </div>
  );
}
