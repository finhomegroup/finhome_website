import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { DdmMultiCalculator } from "@/components/ddm-multi-calculator";
import { DDM_MULTI as C } from "@/content/calculators/ddm-multi";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "co-phieu-tang-truong-khong-deu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// Resolved through the registry, not written out — see the twin comment on
// `app/cong-cu/co-phieu-tang-truong-deu/page.tsx`.
const RELATED = getCalculator(C.relatedTool.slug);
if (!RELATED) {
  throw new Error(
    `app/cong-cu/${SLUG}/page.tsx: relatedTool "${C.relatedTool.slug}" is ` +
      `not in the registry.`,
  );
}
const RELATED_TITLE = RELATED.title;
const RELATED_HREF = `${calculatorPath(C.relatedTool.slug)}/`;

export default function DdmMultiPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Three quarters of the value comes from the perpetuity nobody can
      // check. Say so before the reader takes the number as an answer.
      notice={C.terminalNotice}
      intro={C.form.table.intro}
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
      <DdmMultiCalculator />
    </CalculatorPage>
  );
}
