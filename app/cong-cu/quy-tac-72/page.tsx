import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { RuleOf72Calculator } from "@/components/rule-of-72-calculator";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { RULE_OF_72 as C } from "@/content/calculators/rule-of-72";
import { calculatorMetadata } from "@/components/calc/calculator-page";
import { calculatorSchema, faqSchema } from "@/lib/seo";

// Built by the shared helper rather than by hand: Next REPLACES openGraph
// wholesale, so a hand-written block silently dropped the share image,
// og:site_name and og:locale that app/layout.tsx supplies. The root layout's
// "%s — FinHome" template still appends the brand to `title`.
export const metadata: Metadata = calculatorMetadata({
  slug: "quy-tac-72",
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

export default function RuleOf72Page() {
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
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {C.lede}
            </p>
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl">
            <RuleOf72Calculator />
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            <Prose title={C.formula.title} body={C.formula.body} />
            <Prose title={C.example.title} body={C.example.body} />

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {C.caveats.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {C.caveats.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    <span className="text-base leading-relaxed text-ink-2">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
                {C.faq.title}
              </h2>
              <div className="mt-4">
                <Accordion items={[...C.faq.items]} />
              </div>
            </section>

            {/* Mandatory: this page outputs return figures on a finance domain. */}
            <CalculatorDisclaimer />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
