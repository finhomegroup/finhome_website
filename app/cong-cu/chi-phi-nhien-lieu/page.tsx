import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FuelCalculator } from "@/components/fuel-calculator";
import { FUEL as C } from "@/content/calculators/fuel";

const SLUG = "chi-phi-nhien-lieu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FuelPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // What the tool does NOT cost. A reader who takes "chi phí mỗi km" for
      // the cost of driving will understate it by a factor of two or three.
      notice={C.scopeNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <FuelCalculator />
    </CalculatorPage>
  );
}
