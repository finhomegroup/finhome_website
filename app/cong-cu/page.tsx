import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import {
  ToolCatalog,
  type CatalogTool,
} from "@/components/calc/tool-catalog";
import { CALCULATOR_HUB as C, HUB_JOURNEYS } from "@/content/calculators/hub";
import {
  CALCULATORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  calculatorPath,
  getCalculator,
} from "@/content/calculators/registry";
import { dispositionFor } from "@/content/calculators/plan-disposition";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: canonicalPath(C.slug),
  title: C.metaTitle,
  description: C.metaDescription,
});

/**
 * The tool hub.
 *
 * Nothing on this page is wrapped in `<Reveal>`, deliberately. `Reveal` starts
 * at `opacity: 0` and animates in on scroll, so its children are invisible
 * until JavaScript runs — fine for marketing sections, wrong for the only way
 * into seventy-five tools. `CalculatorHeading` already set this precedent for
 * calculator navigation; the flow contract (F01) states it for this page.
 *
 * The question cards are server-rendered and the catalogue's first render is
 * the unfiltered list, so the whole page works before hydration. Only the
 * search box needs the client.
 *
 * ORDER, since it is no longer the order of this file: search box, then the
 * five question cards, then the full index. The cards and the catalogue's
 * heading are handed to `ToolCatalog` as props, so the client island can
 * unmount the cards while a query is active — which is what keeps the results
 * directly beneath the box the reader is typing into.
 */
export default function CalculatorHubPage() {
  // Built on the server and handed over as plain data: the client island never
  // imports the registry or the disposition table, so neither is shipped twice.
  const tools: CatalogTool[] = CALCULATORS.map((calc) => {
    const disposition = dispositionFor(calc.slug);
    if (!disposition) {
      // Not defensive padding: a tool with no disposition is a tool nobody
      // decided about, and it would be unsearchable by question. Failing the
      // build is the cheap end of that mistake.
      throw new Error(
        `app/cong-cu/page.tsx: no plan disposition for "${calc.slug}". ` +
          "Add it to content/calculators/plan-disposition.ts.",
      );
    }
    const library = disposition.library;
    return {
      slug: calc.slug,
      title: calc.title,
      summary: calc.summary,
      question: disposition.question,
      category: calc.category,
      categoryLabel: CATEGORY_LABELS[calc.category],
      libraryLabel: library ? C.libraryLabels[library] : undefined,
      libraryDescription: library ? C.libraryDescriptions[library] : undefined,
      planned: calc.status !== "live",
    };
  });

  const categoryOrder = CATEGORY_ORDER.map((category) => ({
    category: category as string,
    label: CATEGORY_LABELS[category],
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {C.lede}
            </p>
          </div>

          {/*
            SEARCH FIRST, THEN THE FIVE QUESTIONS, THEN THE FULL INDEX.

            The search box used to sit beside the index at the foot of the page,
            which a browser review measured at 1.022 px below the fold on a
            390 px viewport and 258 px below it at 1280×900 — while the
            headline overhead asks "Bạn đang muốn biết điều gì?". Both of the
            page's ways in are now above the fold: type, or pick a card.

            The two blocks below are passed to `ToolCatalog` as props rather
            than rendered here, because the cards have to disappear the moment
            there is a query — otherwise typing at the top would filter a list
            far below with no visible effect. They are still SERVER-rendered:
            children of a client component are, so the no-JavaScript entry
            point survives. See the prop docs in `tool-catalog.tsx`.
          */}
          <div className="mt-12">
            <ToolCatalog
              tools={tools}
              categoryOrder={categoryOrder}
              questions={<HubQuestions />}
              catalogIntro={
                <div className="mx-auto mt-16 max-w-2xl text-center">
                  <h2
                    id="tat-ca-cong-cu"
                    className="font-display text-xl font-medium text-ink md:text-2xl"
                  >
                    {C.catalogTitle}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-ink-2">
                    {C.catalogLede}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {C.libraryLegend}
                  </p>
                </div>
              }
            />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

/** The five first-home-buyer question cards. Server-rendered; see above. */
function HubQuestions() {
  return (
    <>
      <section className="mt-14" aria-labelledby="cau-hoi-mua-nha">
        <h2
          id="cau-hoi-mua-nha"
          className="font-display text-xl font-medium text-ink md:text-2xl"
        >
          {C.journeysTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">
          {C.journeysNote}
        </p>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HUB_JOURNEYS.map((journey) => {
            const entry = getCalculator(journey.slug);
            if (!entry) {
              throw new Error(
                `app/cong-cu/page.tsx: question card points at "${journey.slug}", ` +
                  "which is not in the registry.",
              );
            }
            return (
              <li key={journey.slug}>
                <Link
                  href={`${calculatorPath(journey.slug)}/`}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-5 shadow-sm transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                    FH_POINTER,
                  )}
                >
                  <span className="text-xs font-medium text-ink-3">
                    {journey.step}
                  </span>
                  <span className="mt-1 font-display text-base font-medium leading-snug text-ink">
                    {journey.question}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">
                    {journey.answer}
                  </span>
                  <span className="mt-4 text-sm font-medium text-brand-green-ink">
                    {C.journeyCta} — {entry.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
