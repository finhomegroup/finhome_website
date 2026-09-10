import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LoanAnalysisCalculator } from "@/components/loan-analysis-calculator";
import { LOAN_ANALYSIS as C } from "@/content/calculators/loan-analysis";

const SLUG = "phan-tich-khoan-vay";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function LoanAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The front-loading this page measures reads like a trick unless the
      // borrower is told first why it happens.
      notice={C.frontLoadNotice}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <LoanAnalysisCalculator />
    </CalculatorPage>
  );
}
