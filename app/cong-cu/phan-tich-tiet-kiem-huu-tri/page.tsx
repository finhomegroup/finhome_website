import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RetirementSavingsAnalysisCalculator } from "@/components/retirement-savings-analysis-calculator";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const SLUG = "phan-tich-tiet-kiem-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementSavingsAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A coverage percentage reads as a comfort level and is not one. The
      // reader needs that before the number, not after it.
      notice={C.coverageNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RetirementSavingsAnalysisCalculator />
    </CalculatorPage>
  );
}
