import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { Us401kMaxCalculator } from "@/components/us-401k-max-calculator";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "toi-da-401k";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// The cross-link to `gop-401k` is resolved through the registry rather than
// written out, so a slug that stops being a live route fails the build
// instead of shipping a dead link the page told the reader to follow. Same
// contract as `components/calc/tool-next-steps.tsx`, which cannot be used
// here: its content file forbids an entry on a library-shelved row.
const RELATED = getCalculator(C.relatedTool.slug);
if (!RELATED) {
  throw new Error(
    `app/cong-cu/${SLUG}/page.tsx: relatedTool "${C.relatedTool.slug}" is ` +
      `not in the registry.`,
  );
}
const RELATED_TITLE = RELATED.title;
const RELATED_HREF = `${calculatorPath(C.relatedTool.slug)}/`;

export default function Us401kMaxPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Front-loading is the mistake a reader arrives ready to make, and
      // whether it costs anything turns on a line in their plan document.
      notice={C.frontLoadNotice}
      afterCalculator={
        <section>
          <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
            {C.relatedTool.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {C.relatedTool.why}
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            <Link
              href={RELATED_HREF}
              className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
            >
              {RELATED_TITLE}
            </Link>
          </p>
        </section>
      }
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
    >
      <Us401kMaxCalculator />
    </CalculatorPage>
  );
}
