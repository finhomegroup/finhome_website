import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { CompoundCalculator } from "@/components/compound-calculator";
import { COMPOUND as C } from "@/content/calculators/compound";

const SLUG = "lai-kep";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * Migrated onto `CalculatorPage` with original row 16, which rewrote this
 * page's example, added its three-band visual and gave it a next step — so
 * its rendered markup was moving anyway. See docs §3 on why the pre-shell
 * pages are otherwise left alone.
 */
export default function CompoundInterestPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
      wide
    >
      {/* The next step moves inside the tool, beside the answer, instead of
          below the method prose. */}
      <CompoundCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
