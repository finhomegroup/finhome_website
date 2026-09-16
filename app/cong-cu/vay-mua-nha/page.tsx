import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import { ProseText } from "@/components/ui/prose-text";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { LoanCalculator } from "@/components/loan-calculator";
import { LOAN as C } from "@/content/calculators/loan";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { calculatorMetadata } from "@/components/calc/calculator-page";
import { calculatorSchema, faqSchema } from "@/lib/seo";

// Built by the shared helper rather than by hand: Next REPLACES openGraph
// wholesale, so a hand-written block silently dropped the share image,
// og:site_name and og:locale that app/layout.tsx supplies.
export const metadata: Metadata = calculatorMetadata({
  slug: "vay-mua-nha",
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * This route predates `CalculatorPage` and still renders its own body, so it
 * does not inherit the shell's prose rendering — which is why `emphasis` has
 * to be threaded through here explicitly. An independent review found exactly
 * this: three routes (`vay-mua-nha`, `quy-tac-72`, `tra-no-hai-tuan`) have no
 * `<CalculatorPage>` call, and a reading disposition of `emphasis` on this
 * one would otherwise have been a claim about markup that never rendered.
 */
function Prose({
  title,
  body,
  emphasis,
}: {
  title: string;
  body: readonly string[];
  emphasis?: readonly string[];
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-ink-2">
            <ProseText text={paragraph} emphasis={emphasis} />
          </p>
        ))}
      </div>
    </section>
  );
}

export default function LoanCalculatorPage() {
  return (
    <>
      <JsonLd
        data={calculatorSchema({
          name: C.metaTitle,
          description: C.metaDescription,
          path: C.slug,
        })}
      />
      <JsonLd data={faqSchema(C.faq.items)} />
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <CalculatorHeading
            title={C.pageTitle}
            lede={C.lede}
            ledeDetail={C.ledeDetail}
            ledeDetailTitle={C.ledeDetailTitle}
          />

          {/* Above the calculator, not below: a borrower should learn that the
              tool assumes a fixed rate BEFORE they read a 20-year instalment
              off it. Kept to one sentence — the reasoning is behind the
              disclosure, so the form stays on the first screens at 390 px. */}
          <div className="mx-auto mt-5 max-w-3xl md:mt-8">
            <div className="rounded-xl border border-red-400/40 bg-bg-soft p-4">
              <p className="text-sm leading-relaxed text-ink-2">
                {C.floatingRateNotice}
              </p>
              {/* The route to the after-promotion mode, IN the notice that
                  raises the question — not only in the next-steps block below
                  the answer. `Link` normalises the trailing slash away. */}
              <p className="mt-2 text-sm leading-relaxed">
                <Link
                  href={FLOATING_LOAN.slug}
                  className="font-medium text-brand-green underline-offset-4 hover:underline"
                >
                  {C.floatingRateLinkLabel}
                </Link>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-3">
                {C.floatingRateLinkNote}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green">
                  {C.floatingRateDetailTitle}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {C.floatingRateDetail}
                </p>
              </details>
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-3xl md:mt-6">
            <LoanCalculator />
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-10 md:mt-12">
            {/* The next question comes before the explanatory prose: a reader
                who has their answer should not scroll past two teaching
                sections to find where to go. */}
            <ToolNextSteps slug="vay-mua-nha" />

            <p className="text-base leading-relaxed text-ink-2">
              {C.table.intro}
            </p>

            <Prose
              title={C.formula.title}
              body={C.formula.body}
              emphasis={C.formula.emphasis}
            />

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {C.faq.title}
              </h2>
              <div className="mt-4">
                <Accordion items={[...C.faq.items]} />
              </div>
            </section>

            {/* Mandatory: this page outputs loan figures on a finance domain. */}
            <CalculatorDisclaimer />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
