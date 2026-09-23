import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RefinanceCalculator } from "@/components/refinance-calculator";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { REFINANCE as C } from "@/content/calculators/refinance";

const SLUG = "tai-cap-von";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RefinancePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      notice={C.trapNotice}
      prose={C.formula}
      faq={C.faq}
      disclaimer={C.disclaimer}
      wide
    >
      <RefinanceCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
