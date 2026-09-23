import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
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
      // No `intro`: `C.table.intro` explained the quarter table, and it now
      // sits above that table inside the tool instead of ahead of the form and
      // the chart. Row 11's "giảm phần giải thích trước biểu đồ".
      prose={C.formula}
      faq={C.faq}
      wide
    >
      <LoanAnalysisCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
