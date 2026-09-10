import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { HoldingPeriodCalculator } from "@/components/holding-period-calculator";
import { HOLDING_PERIOD as C } from "@/content/calculators/holding-period";

const SLUG = "loi-nhuan-ky-nam-giu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function HoldingPeriodPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The split is the point, not the total. Same 30% can be money in hand
      // or money on paper.
      notice={C.splitNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <HoldingPeriodCalculator />
    </CalculatorPage>
  );
}
