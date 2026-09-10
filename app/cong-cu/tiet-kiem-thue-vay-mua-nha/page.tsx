import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsMortgageDeductionCalculator } from "@/components/us-mortgage-deduction-calculator";
import { US_MORTGAGE_DEDUCTION as C } from "@/content/calculators/us-mortgage-deduction";

const SLUG = "tiet-kiem-thue-vay-mua-nha";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsMortgageDeductionPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The twelve-fold overstatement on the prefilled numbers, and what it
      // does to the effective rate. This is the page's whole reason to
      // exist, so it goes above the form rather than below it.
      notice={C.marginalNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsMortgageDeductionCalculator />
    </CalculatorPage>
  );
}
