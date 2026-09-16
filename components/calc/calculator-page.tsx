import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { ProseText } from "@/components/ui/prose-text";
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
 * THREE calculators built before this shell existed still render their own
 * page bodies: `quy-tac-72`, `tra-no-hai-tuan` and `vay-mua-nha`. (This said
 * "six" long after three of them had migrated. Derive it — strip comments,
 * then count routes with no `<CalculatorPage` element — because a plain grep
 * counts `vay-mua-nha`, whose own docstring discusses the element it does not
 * have. That mistake was made three times in one session before the comments
 * were stripped.)
 *
 * That is deliberate, not an oversight: the built HTML of those
 * routes is a regression gate, and rewriting them through the shell would
 * change rendered markup for no functional gain. New calculators use the
 * shell; those three can be migrated whenever their markup is next allowed to
 * move.
 */
export function CalculatorPage({
  slug,
  metaTitle,
  metaDescription,
  title,
  lede,
  ledeDetail,
  ledeDetailTitle,
  notice,
  noticeDetail,
  noticeDetailTitle,
  intro,
  prose,
  faq,
  sources,
  afterCalculator,
  disclaimer,
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
   * a user must know before they read a figure off the tool.
   *
   * Keep it to one or two sentences. A critical limitation has to stay
   * VISIBLE, but the browser check found long notices pushing the form off
   * the first screens on a phone; the full version goes in `noticeDetail`.
   */
  notice?: string;
  /** The longer version of `notice`, behind a disclosure. */
  noticeDetail?: string;
  noticeDetailTitle?: string;
  /** Short purpose line for the heading; the rest collapses. */
  ledeDetail?: string;
  ledeDetailTitle?: string;
  /** A paragraph directly below the calculator, usually about its table. */
  intro?: string;
  /**
   * The "how it is calculated" section.
   *
   * `emphasis` is the optional list of editor-selected phrases to mark inside
   * `body`, through the same `lib/prose-emphasis.ts` mechanism the education
   * articles use — a plain string plus a separate phrase list, never markup in
   * the content. It is OPTIONAL on purpose: a tip calculator's method needs a
   * direct answer and nothing else, and `content/calculators/plan-disposition.ts`
   * records which of the 75 tools are deliberately left plain.
   */
  prose: {
    title: string;
    body: readonly string[];
    emphasis?: readonly string[];
  };
  faq: { title: string; items: readonly { q: string; a: string }[] };
  /**
   * Primary references, as links the reader can actually open.
   *
   * SAME SHAPE AS AN EDUCATION ARTICLE'S `sources`, deliberately — field for
   * field — so the two surfaces cannot drift into two house styles for the
   * same thing. Optional, and it should stay optional: most of the 75 tools
   * compute arithmetic that has no source to cite, and a "Nguồn" heading over
   * a link to nothing is worse than no heading.
   *
   * A tool that PREFILLS a legal or tax parameter is the case this exists
   * for. Naming a decree and a date in prose is not a citation a reader can
   * check; an independent review of original row 24 found dates and the words
   * "hướng dẫn chính thức" on the page with no href anywhere. `intro` is
   * where the provenance limit goes, because a link list implies a
   * completeness no page here has earned.
   */
  sources?: {
    title: string;
    intro?: string;
    items: readonly { url: string; label: string; note?: string }[];
  };
  /**
   * Rendered between the calculator and the prose — where `<ToolNextSteps>`
   * goes on the tools that have next steps.
   *
   * A slot rather than something this shell derives from the slug, and
   * deliberately: seventy of the seventy-five tools have no next step, and a
   * shell that added one automatically would put a home-buying funnel under a
   * tip calculator. The pages that want it ask for it.
   *
   * Above the formula and the FAQ on purpose: a reader who has their answer
   * should find the next question without scrolling past two explanatory
   * sections first.
   */
  afterCalculator?: React.ReactNode;
  /** Accurate model-specific qualification, without removing the disclaimer. */
  disclaimer?: string;
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
          <CalculatorHeading
            title={title}
            lede={lede}
            ledeDetail={ledeDetail}
            ledeDetailTitle={ledeDetailTitle}
          />

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
              <div className="rounded-xl border border-red-400/40 bg-bg-soft p-4">
                <p className="text-sm leading-relaxed text-ink-2">{notice}</p>
                {noticeDetail && noticeDetailTitle ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green">
                      {noticeDetailTitle}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">
                      {noticeDetail}
                    </p>
                  </details>
                ) : null}
              </div>
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

            {afterCalculator}

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
                    <ProseText text={paragraph} emphasis={prose.emphasis} />
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

            {/* Primary references, where the tool prefills a figure that came
                from one. Same markup as an education article's source list. */}
            {sources ? (
              <section>
                <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                  {sources.title}
                </h2>
                {sources.intro ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {sources.intro}
                  </p>
                ) : null}
                <ul className="mt-3 space-y-3">
                  {sources.items.map((item) => (
                    <li
                      key={item.url}
                      className="text-sm leading-relaxed text-ink-2"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
                      >
                        {item.label}
                      </a>
                      {item.note ? (
                        <span className="mt-1 block text-ink-3">
                          {item.note}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Not a slot. Every calculator in the suite carries this. */}
            <CalculatorDisclaimer text={disclaimer} />
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
