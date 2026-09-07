import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { getCalculator } from "@/content/calculators/registry";
import { calculatorPath } from "@/content/calculators/registry";
import { canonicalPath, calculatorSchema, faqSchema } from "@/lib/seo";

/**
 * The page shell every calculator route renders inside.
 *
 * This exists to own the two contracts a hand-written page can silently drop:
 *
 * 1. **The disclaimer.** `<CalculatorDisclaimer />` is rendered here, always,
 *    below the prose. It is not a slot a page can leave empty. Before this
 *    shell, a calculator shipped with no disclaimer by simple omission, which
 *    the SP-0 review called the highest-consequence gap in the suite.
 * 2. **The `usRules` notice.** The registry flag is read HERE and turned into
 *    `<CalculatorDisclaimer variant="us-rules">` above the calculator. Nothing
 *    used to wire that flag to anything, despite a comment claiming it did.
 *
 * It also folds in the JSON-LD, the header and footer, and the page furniture,
 * so a new calculator's route file is a metadata export and one element.
 *
 * `slug` is looked up in the registry and an unknown one throws during
 * `next build` rather than shipping a page that is missing from the hub and
 * the sitemap.
 *
 * The six calculators built before this shell existed still render their own
 * page bodies. That is deliberate, not an oversight: the built HTML of those
 * routes is a regression gate, and rewriting them through the shell would
 * change rendered markup for no functional gain. New calculators use the
 * shell; those six can be migrated whenever their markup is next allowed to
 * move.
 */
export function CalculatorPage({
  slug,
  metaTitle,
  metaDescription,
  title,
  lede,
  notice,
  intro,
  prose,
  faq,
  children,
}: {
  /** Registry slug, without the `/cong-cu/` prefix. */
  slug: string;
  /** Used for the WebApplication schema's name. */
  metaTitle: string;
  metaDescription: string;
  /** The page `h1`. */
  title: string;
  /** The paragraph under the `h1`. */
  lede: string;
  /**
   * A caveat shown ABOVE the calculator, styled to be noticed — for the thing
   * a user must know before they read a figure off the tool. Optional.
   */
  notice?: string;
  /** A paragraph directly below the calculator, usually about its table. */
  intro?: string;
  /** The "how it is calculated" section. */
  prose: { title: string; body: readonly string[] };
  faq: { title: string; items: readonly { q: string; a: string }[] };
  /** The client island: the calculator itself. */
  children: React.ReactNode;
}) {
  const entry = getCalculator(slug);
  if (!entry) {
    throw new Error(
      `components/calc/calculator-page.tsx: no registry entry for "${slug}". ` +
        "Add it to content/calculators/registry.ts, or fix the slug — an " +
        "unregistered calculator is missing from the hub and the sitemap.",
    );
  }

  const path = calculatorPath(slug);

  return (
    <>
      <JsonLd
        data={calculatorSchema({
          name: metaTitle,
          description: metaDescription,
          path,
        })}
      />
      <JsonLd data={faqSchema(faq.items)} />
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {lede}
            </p>
          </Reveal>

          {/* Both notices sit ABOVE the calculator. A user should learn that a
              tool models United States law, or that it assumes a fixed rate,
              BEFORE they spend five minutes filling it in — not afterwards. */}
          {entry.usRules ? (
            <div className="mx-auto mt-8 max-w-3xl">
              <CalculatorDisclaimer variant="us-rules" />
            </div>
          ) : null}

          {notice ? (
            <div
              className={
                entry.usRules
                  ? "mx-auto mt-4 max-w-3xl"
                  : "mx-auto mt-8 max-w-3xl"
              }
            >
              <p className="rounded-xl border border-red-400/40 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
                {notice}
              </p>
            </div>
          ) : null}

          <div
            className={
              notice || entry.usRules
                ? "mx-auto mt-6 max-w-3xl"
                : "mx-auto mt-8 max-w-3xl"
            }
          >
            {children}
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            {intro ? (
              <p className="text-base leading-relaxed text-ink-2">{intro}</p>
            ) : null}

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {prose.title}
              </h2>
              <div className="mt-3 space-y-3">
                {prose.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-relaxed text-ink-2"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {faq.title}
              </h2>
              <div className="mt-4">
                <Accordion items={[...faq.items]} />
              </div>
            </section>

            {/* Not a slot. Every calculator in the suite carries this. */}
            <CalculatorDisclaimer />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

/**
 * The `Metadata` export a calculator route needs.
 *
 * Next requires `metadata` to be a static module export, so this cannot live
 * in the shell component — but the shape can still be written once.
 */
export function calculatorMetadata(input: {
  slug: string;
  metaTitle: string;
  metaDescription: string;
}): Metadata {
  // `trailingSlash: true` is on, so the canonical must carry the slash or it
  // advertises a URL that redirects.
  const path = canonicalPath(calculatorPath(input.slug));
  return {
    title: input.metaTitle,
    description: input.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${input.metaTitle} — FinHome`,
      description: input.metaDescription,
    },
  };
}
