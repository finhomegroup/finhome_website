import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsDividendTaxCalculator } from "@/components/us-dividend-tax-calculator";
import { US_DIVIDEND_TAX as C } from "@/content/calculators/us-dividend-tax";

const SLUG = "thue-co-tuc";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsDividendTaxPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // What the classification is worth on the prefilled numbers, and the
      // 23,80% against 40,80% gap at the top.
      notice={C.classificationNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsDividendTaxCalculator />
    </CalculatorPage>
  );
}
