import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { DdmCalculator } from "@/components/ddm-calculator";
import { DDM as C } from "@/content/calculators/ddm";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "co-phieu-tang-truong-deu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// The cross-link to the two-stage tool is resolved through the registry
// rather than written out, so a slug that stops being a live route fails the
// build instead of shipping a dead link the page told the reader to follow.
// Same contract as `components/calc/tool-next-steps.tsx`, which cannot be
// used here: its content file forbids an entry on a library-shelved row, and
// both of these are shelved `dau-tu`.
const RELATED = getCalculator(C.relatedTool.slug);
if (!RELATED) {
  throw new Error(
    `app/cong-cu/${SLUG}/page.tsx: relatedTool "${C.relatedTool.slug}" is ` +
      `not in the registry.`,
  );
}
const RELATED_TITLE = RELATED.title;
const RELATED_HREF = `${calculatorPath(C.relatedTool.slug)}/`;

export default function DdmPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The value is hypersensitive to the denominator. Read the inversions
      // instead — those are the claims a reader can actually check.
      notice={C.denominatorNotice}
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
    >
      <DdmCalculator />
    </CalculatorPage>
  );
}
