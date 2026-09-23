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
      // §5: the warning stays visible; the two counterfactuals that prove it
      // are one click away instead of five sentences above the first field.
      noticeDetail={C.duPontNoticeDetail}
      noticeDetailTitle={C.duPontNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // ROW 68 is "Theo nhóm + kết quả": the tool now renders `columns="split"`
      // with the two periods interleaved by group in the form column and both
      // wide tables in the full-width band below.
      wide
    >
      <StatementAnalysisCalculator />
    </CalculatorPage>
  );
}
