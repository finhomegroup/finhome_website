import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AprAdvancedCalculator } from "@/components/apr-advanced-calculator";
import { APR_ADVANCED as C } from "@/content/calculators/apr-advanced";

const SLUG = "apr-nang-cao";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AprAdvancedPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // APR assumes the loan runs to term, and Vietnamese mortgages usually
      // do not. Which of the two APR rows applies to the reader.
      notice={C.payoffNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <AprAdvancedCalculator />
    </CalculatorPage>
  );
}
