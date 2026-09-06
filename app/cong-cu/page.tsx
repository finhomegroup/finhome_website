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
  // Only categories that actually have a built calculator are rendered, so
  // the page grows as the registry does without ever showing an empty section.
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: CALCULATORS.filter((calc) => calc.category === category),
  })).filter((group) => group.items.length > 0);

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
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                  {CATEGORY_LABELS[group.category]}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.items.map((calc) => (
                    <li key={calc.slug}>
                      <Link
                        href={`${calculatorPath(calc.slug)}/`}
                        className={cn(
                          "block rounded-2xl border border-ink-4/15 bg-white p-5 shadow-sm transition-colors hover:border-brand-green/50",
                          FH_POINTER,
                        )}
                      >
                        <span className="block font-display text-base font-medium text-ink">
                          {calc.title}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                          {calc.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
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
