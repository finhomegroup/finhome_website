import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { BusinessForecastCalculator } from "@/components/business-forecast-calculator";
import { BUSINESS_FORECAST as C } from "@/content/calculators/business-forecast";

const SLUG = "du-bao-kinh-doanh";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function BusinessForecastPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Reads the prefilled scenario and names where the margin widening
      // comes from, plus how to make it disappear.
      notice={C.leverageNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <BusinessForecastCalculator />
    </CalculatorPage>
  );
}
