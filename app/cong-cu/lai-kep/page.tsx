import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { CompoundCalculator } from "@/components/compound-calculator";
import { COMPOUND as C } from "@/content/calculators/compound";
import { calculatorMetadata } from "@/components/calc/calculator-page";
import { calculatorSchema, faqSchema } from "@/lib/seo";

// Built by the shared helper rather than by hand: Next REPLACES openGraph
// wholesale, so a hand-written block silently dropped the share image,
// og:site_name and og:locale that app/layout.tsx supplies.
export const metadata: Metadata = calculatorMetadata({
  slug: "lai-kep",
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

export default function CompoundInterestPage() {
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


          <div className="mx-auto mt-10 max-w-3xl">
            <CompoundCalculator />
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
