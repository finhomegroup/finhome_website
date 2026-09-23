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
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The decay is the whole subject, and a reader who checks only the
      // first year will not find it. It belongs above the tool — but §5 asks
      // for the claim visible and the four-figure worked example one click
      // away, not standing between the reader and the first field.
      notice={C.decayNotice}
      noticeDetail={C.decayNoticeDetail}
      noticeDetailTitle={C.decayNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
      // ROW 51 is "Hai cột", and the tool now renders `columns="split"` with
      // two six- and seven-column tables in the full-width band below. Both
      // need the wider shell; the narrow one gave the form column about
      // 260 px on the other split route in this batch.
      wide
    >
      <RetirementIncomeAnalysisCalculator />
    </CalculatorPage>
  );
}
