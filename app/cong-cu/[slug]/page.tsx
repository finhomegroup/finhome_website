import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import {
  CATEGORY_LABELS,
  calculatorPath,
  getCalculator,
  plannedCalculators,
} from "@/content/calculators/registry";
import { CALCULATOR_PLACEHOLDER as C } from "@/content/calculators/placeholder";

/**
 * The shared page for calculators that are listed but not yet built.
 *
 * Only `planned` slugs are generated here. A `live` calculator has its own
 * static route at `app/cong-cu/<slug>/page.tsx`, and Next gives a static
 * segment precedence over this dynamic one — so adding a real calculator is
 * just creating its folder, with no change needed here.
 *
 * Every page is `noindex`. Seventy-odd near-empty pages in a search index is
 * the textbook thin-content pattern and would drag down the pages that do
 * work; they exist so the menu is complete and every click lands somewhere
 * honest, not to be found in search.
 */
export function generateStaticParams() {
  return plannedCalculators().map((calc) => ({ slug: calc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) return {};
  return {
    title: `${calc.title} — ${C.metaTitleSuffix}`,
    description: calc.summary,
    // Deliberately excluded from search. See the docstring above.
    robots: { index: false, follow: true },
  };
}

export default async function PlannedCalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc || calc.status !== "planned") notFound();

  // Other tools in the same category, so the page is a useful dead end rather
  // than a plain one.
  const siblings = plannedCalculators()
    .filter((item) => item.category === calc.category && item.slug !== calc.slug)
    .slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <p className="font-display text-sm font-medium text-brand-green">
              {CATEGORY_LABELS[calc.category]}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
              {calc.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-2">
              {calc.summary}
            </p>

            <div className="mt-8 rounded-2xl border border-ink-4/15 bg-bg-soft p-6">
              <h2 className="font-display text-base font-medium text-ink">
                {C.statusTitle}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-ink-2">
                {C.statusBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/cong-cu/"
                  className={cn(
                    "rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cta-hover",
                    FH_POINTER,
                  )}
                >
                  {C.backToHub}
                </Link>
              </div>
            </div>

            {calc.usRules ? (
              <div className="mt-6">
                <CalculatorDisclaimer variant="us-rules" />
              </div>
            ) : null}

            {siblings.length > 0 ? (
              <section className="mt-12">
                <h2 className="font-display text-xl font-medium text-ink">
                  {C.siblingsTitle}
                </h2>
                <ul className="mt-4 space-y-3">
                  {siblings.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`${calculatorPath(item.slug)}/`}
                        className={cn(
                          "block rounded-2xl border border-ink-4/15 bg-white p-5 shadow-sm transition-colors hover:border-brand-green/50",
                          FH_POINTER,
                        )}
                      >
                        <span className="block font-display text-base font-medium text-ink">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                          {item.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </Reveal>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
