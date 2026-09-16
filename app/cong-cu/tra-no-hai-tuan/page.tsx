import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { CalculatorDisclaimer } from "@/components/calc/disclaimer";
import { CalculatorHeading } from "@/components/calc/calculator-heading";
import { ProseText } from "@/components/ui/prose-text";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { BiweeklyCalculator } from "@/components/biweekly-calculator";
import { BIWEEKLY as C } from "@/content/calculators/biweekly";
import { calculatorMetadata } from "@/components/calc/calculator-page";
import { calculatorSchema, faqSchema } from "@/lib/seo";

// Built by the shared helper rather than by hand: Next REPLACES openGraph
// wholesale, so a hand-written block silently dropped the share image,
// og:site_name and og:locale that app/layout.tsx supplies.
export const metadata: Metadata = calculatorMetadata({
  slug: "tra-no-hai-tuan",
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * This route predates `CalculatorPage` and still renders its own body, so it
 * does not inherit the shell's prose rendering — which is why `emphasis` has
 * to be threaded through here explicitly. Same shape as
 * `app/cong-cu/vay-mua-nha/page.tsx`, deliberately: it is the other pre-shell
 * route filed `emphasis`, and one pattern for this is better than two.
 *
 * Before this, the helper rendered a plain `<p>{paragraph}</p>`. While the row
 * was filed `direct` that was correct and cost nothing. It stopped being
 * correct the moment the row became a lesson: an `emphasis` disposition here
 * would have been a claim about markup that never rendered, which is the
 * exact failure `components/calc/calculator-page.tsx:30-33` warns about and
 * `scripts/check-built-markup.mjs:147-162` is the only check that can see.
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

export default function BiweeklyPage() {
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
              {C.prepaymentNotice}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-3xl">
            <BiweeklyCalculator />
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">

            {/* Between the calculator and the prose, which is where the shell
                puts `afterCalculator` — a reader who has the answer should
                find the next question without scrolling past two explanatory
                sections. This route renders its own body, so the slot has to
                be placed by hand; `next-steps.test.ts` is what catches the
                omission, and two routes shipped with an entry and no slot
                before it existed. The step matters more here than on most
                pages: 98,2% of the saving is the extra principal, and
                `vay-mua-nha`'s extra-payment mode is where a reader whose
                bank has no fortnightly schedule can actually get it. */}
            <ToolNextSteps slug="tra-no-hai-tuan" />

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
