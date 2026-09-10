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
import { canonicalPath, calculatorSchema, faqSchema, pageMetadata } from "@/lib/seo";

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
 *
 * The `openGraph` AND `twitter` objects below are both deliberately COMPLETE
 * rather than the two or three per-page fields they look like they need, and
 * both must exist. The two failure modes are different sides of the same
 * behaviour:
 *
 * - **`openGraph` is REPLACED, not merged.** The moment a route sets any
 *   `openGraph` key it stops inheriting all of the root layout's — including
 *   the share image. See `node_modules/next/dist/docs/01-app/03-api-reference/
 *   04-functions/generate-metadata.md` ("Inheriting fields"): "All `openGraph`
 *   fields from `app/layout.js` are inherited ... because `app/about/page.js`
 *   doesn't set `openGraph` metadata." Without `images`/`siteName`/`locale`
 *   repeated here, every calculator page shipped a card with no picture.
 *   `title` alone is the documented exception: it IS replaced, not merged.
 * - **`twitter` must be set, not left to be back-filled from `openGraph`.**
 *   Next does copy `title`/`description`/`images` from `openGraph` into
 *   `twitter` (`postProcessMetadata` in
 *   `node_modules/next/dist/lib/metadata/resolve-metadata.js`), but ONLY for
 *   the fields `twitter` does not already have — and it runs once, on the
 *   fully accumulated metadata. `app/layout.tsx` sets a complete `twitter`
 *   object, so that inherited object already has all three and the back-fill
 *   is suppressed. A route that sets `openGraph` and no `twitter` therefore
 *   ships a per-page `og:title` next to the HOMEPAGE's `twitter:title`:
 *   out/cong-cu/quy-tac-72/index.html shipped `og:title` "Quy tắc 72 — …"
 *   beside `twitter:title` "FinHome — Mua nhà an toàn, sống an yên".
 *   Because a route-level `twitter` also replaces the root's wholesale,
 *   `card` and `images` are restated here too.
 *
 * The completeness rule itself now lives once, in `pageMetadata` (`lib/seo.ts`);
 * this function only knows how to turn a slug into a canonical path.
 */
export function calculatorMetadata(input: {
  slug: string;
  metaTitle: string;
  metaDescription: string;
}): Metadata {
  // The openGraph/twitter completeness rule is `pageMetadata`'s, not this
  // function's — see its docstring. This one only knows how to turn a slug
  // into a canonical path.
  return pageMetadata({
    path: canonicalPath(calculatorPath(input.slug)),
    title: input.metaTitle,
    description: input.metaDescription,
  });
}
