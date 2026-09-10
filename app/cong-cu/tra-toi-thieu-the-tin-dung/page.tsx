import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { CardMinimumCalculator } from "@/components/card-minimum-calculator";
import { CARD_MINIMUM as C } from "@/content/calculators/card-minimum";

const SLUG = "tra-toi-thieu-the-tin-dung";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function CardMinimumPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // 90 months vs 28 months on the same first payment. This is the whole
      // page, and it belongs above the tool rather than under it.
      notice={C.trapNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <CardMinimumCalculator />
    </CalculatorPage>
  );
}
