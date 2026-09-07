import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { CALCULATOR_HUB as C } from "@/content/calculators/hub";
import {
  CALCULATORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  calculatorPath,
  liveCalculators,
} from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath } from "@/lib/seo";

export const metadata: Metadata = {
  title: C.metaTitle,
  description: C.metaDescription,
  alternates: { canonical: canonicalPath(C.slug) },
  openGraph: {
    type: "website",
    url: canonicalPath(C.slug),
    title: `${C.metaTitle} — FinHome`,
    description: C.metaDescription,
  },
};

export default function CalculatorHubPage() {
  // Only categories that hold at least one tool are rendered, so the page
  // grows with the registry without ever showing an empty heading.
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: CALCULATORS.filter((calc) => calc.category === category),
  })).filter((group) => group.items.length > 0);

  const liveCount = liveCalculators().length;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {C.lede}
            </p>
            <p className="mx-auto mt-4 text-sm leading-relaxed text-ink-3">
              {C.legend
                .replace("{live}", String(liveCount))
                .replace("{total}", String(CALCULATORS.length))}
            </p>
          </Reveal>

          {/*
            A dense multi-column index rather than a column of cards. Seventy-five
            summary cards is a ~7,000px scroll and you cannot see the shape of the
            suite; names alone in three columns fit almost the whole menu on one
            screen. The summary still appears on each tool's own page.

            `columns` rather than a grid: category blocks have very different
            heights (16 tools vs 2), and CSS columns flow them without leaving the
            ragged gaps a grid row would.
          */}
          <div className="mt-12 gap-x-10 md:columns-2 xl:columns-3">
            {groups.map((group) => (
              <section
                key={group.category}
                // Keeps a heading from being orphaned at the foot of a column.
                className="mb-8 break-inside-avoid"
              >
                <h2 className="flex items-baseline gap-2 border-b border-ink-4/25 pb-2 font-display text-base font-medium text-ink">
                  {CATEGORY_LABELS[group.category]}
                  <span className="text-sm font-normal text-ink-3">
                    {group.items.length}
                  </span>
                </h2>

                <ul className="mt-2">
                  {group.items.map((calc) => {
                    const isLive = calc.status === "live";
                    return (
                      <li key={calc.slug}>
                        {/* Every tool is a link, so no click is a dead end. A
                            tool that does not compute yet is muted and marked
                            with a dot rather than a full badge — at this
                            density a badge on 72 rows is just noise. */}
                        <Link
                          href={`${calculatorPath(calc.slug)}/`}
                          aria-label={
                            isLive
                              ? calc.title
                              : `${calc.title} — ${C.plannedBadge}`
                          }
                          className={cn(
                            "flex items-baseline gap-2 rounded-md px-1.5 py-1 text-sm leading-snug transition-colors",
                            isLive
                              ? "text-ink hover:bg-bg-soft hover:text-brand-green"
                              : "text-ink-3 hover:bg-bg-soft hover:text-ink-2",
                            FH_POINTER,
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "mt-1.5 size-1.5 shrink-0 rounded-full",
                              isLive ? "bg-brand-green" : "bg-ink-4/60",
                            )}
                          />
                          <span className="min-w-0">{calc.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
