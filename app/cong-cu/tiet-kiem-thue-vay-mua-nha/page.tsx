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
      // The rule the page exists for — the common method overstates, twelve
      // fold on the prefilled numbers — above the form.
      notice={C.marginalNotice}
      // The itemised ladder that proves it, one click away.
      noticeDetailTitle={C.marginalNoticeDetailTitle}
      noticeDetail={C.marginalNoticeDetail}
      wide
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
    >
      <UsMortgageDeductionCalculator />
    </CalculatorPage>
  );
}
