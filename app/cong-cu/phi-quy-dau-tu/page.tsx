import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FundFeesCalculator } from "@/components/fund-fees-calculator";
import { FUND_FEES as C } from "@/content/calculators/fund-fees";

const SLUG = "phi-quy-dau-tu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FundFeesPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // 2% a year takes 36% of the gain over twenty years. That reframing is
      // the page, and it belongs above the tool.
      notice={C.compoundNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <FundFeesCalculator />
    </CalculatorPage>
  );
}
