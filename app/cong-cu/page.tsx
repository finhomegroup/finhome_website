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
                  {group.items.map((calc) => {
                    const isLive = calc.status === "live";
                    return (
                      <li key={calc.slug}>
                        {/* Every tool is a link, so no click is a dead end —
                            but an unbuilt one is visually quieter and says so,
                            rather than looking identical to a working tool. */}
                        <Link
                          href={`${calculatorPath(calc.slug)}/`}
                          className={cn(
                            "block rounded-2xl border p-5 transition-colors",
                            isLive
                              ? "border-ink-4/15 bg-white shadow-sm hover:border-brand-green/50"
                              : "border-ink-4/15 bg-bg-soft hover:border-ink-4/40",
                            FH_POINTER,
                          )}
                        >
                          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span
                              className={cn(
                                "font-display text-base font-medium",
                                isLive ? "text-ink" : "text-ink-2",
                              )}
                            >
                              {calc.title}
                            </span>
                            {isLive ? null : (
                              <span className="rounded-full bg-ink-4/20 px-2 py-0.5 text-xs font-medium text-ink-3">
                                {C.plannedBadge}
                              </span>
                            )}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block text-sm leading-relaxed",
                              isLive ? "text-ink-2" : "text-ink-3",
                            )}
                          >
                            {calc.summary}
                          </span>
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
