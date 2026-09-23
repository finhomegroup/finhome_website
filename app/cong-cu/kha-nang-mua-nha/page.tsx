import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { AffordabilityCalculator } from "@/components/affordability-calculator";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";

const SLUG = "kha-nang-mua-nha";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AffordabilityPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The ratios are a convention, not a rule — and passing the formula is
      // not the same as being able to live with the payment.
      notice={C.ratioNotice}
      prose={C.formula}
      faq={C.faq}
      // The shared notice says fees are excluded; the entered purchase-cost
      // percentage is modelled here. Tool-owned text, mandatory opening kept.
      disclaimer={C.disclaimer}
      wide
    >
      {/* Handed to the calculator so the split layout can put it beside the
          answer rather than below the whole tool; still rendered from the page,
          so it ships no client JavaScript. */}
      <AffordabilityCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
