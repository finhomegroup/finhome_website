import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
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
      // The ratios are a convention, not a rule — and passing the formula is
      // not the same as being able to live with the payment.
      notice={C.ratioNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <AffordabilityCalculator />
    </CalculatorPage>
  );
}
