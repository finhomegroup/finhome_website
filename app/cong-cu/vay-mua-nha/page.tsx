import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { LoanCalculator } from "@/components/loan-calculator";
import { LOAN as C } from "@/content/calculators/loan";
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

function Prose({ title, body }: { title: string; body: readonly string[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-ink-2">
            {paragraph}
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
          <CalculatorHeading title={C.pageTitle} lede={C.lede} />

          {/* Above the calculator, not below: a borrower should learn that the
              tool assumes a fixed rate BEFORE they read a 20-year instalment
              off it, because their real loan almost certainly floats. */}
          <div className="mx-auto mt-8 max-w-3xl">
            <p className="rounded-xl border border-red-400/40 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
              {C.floatingRateNotice}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-3xl">
            <LoanCalculator />
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            <p className="text-base leading-relaxed text-ink-2">
              {C.table.intro}
            </p>

            <Prose title={C.formula.title} body={C.formula.body} />

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
