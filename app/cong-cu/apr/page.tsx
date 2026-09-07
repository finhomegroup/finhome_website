import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AprCalculator } from "@/components/apr-calculator";
import { APR as C } from "@/content/calculators/apr";

const SLUG = "apr";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AprPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // APR is only useful as a comparison, and only if both sides were fed
      // the same fee list. Say that before the number is read.
      notice={C.compareNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <AprCalculator />
    </CalculatorPage>
  );
}
