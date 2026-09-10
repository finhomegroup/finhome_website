import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RetirementIncomeAnalysisCalculator } from "@/components/retirement-income-analysis-calculator";
import { RETIREMENT_INCOME_ANALYSIS as C } from "@/content/calculators/retirement-income-analysis";

const SLUG = "phan-tich-thu-nhap-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementIncomeAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The decay is the whole subject, and a reader who checks only the
      // first year will not find it. It belongs above the tool.
      notice={C.decayNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RetirementIncomeAnalysisCalculator />
    </CalculatorPage>
  );
}
