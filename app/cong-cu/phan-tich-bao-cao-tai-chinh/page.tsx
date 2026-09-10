import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { StatementAnalysisCalculator } from "@/components/statement-analysis-calculator";
import { STATEMENT_ANALYSIS as C } from "@/content/calculators/statement-analysis";

const SLUG = "phan-tich-bao-cao-tai-chinh";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function StatementAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Reads the prefilled example and says which driver moved ROE. It is
      // the argument for decomposing rather than printing two ROEs.
      notice={C.duPontNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <StatementAnalysisCalculator />
    </CalculatorPage>
  );
}
