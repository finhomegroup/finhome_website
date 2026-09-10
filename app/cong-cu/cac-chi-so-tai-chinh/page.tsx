import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FinancialRatiosCalculator } from "@/components/financial-ratios-calculator";
import { FINANCIAL_RATIOS as C } from "@/content/calculators/financial-ratios";

const SLUG = "cac-chi-so-tai-chinh";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FinancialRatiosPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Which balance the ratios divide by. A reader comparing against a
      // published figure needs to know it is closing, not average.
      notice={C.closingBalanceNotice}
      intro={C.form.ratioTable.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <FinancialRatiosCalculator />
    </CalculatorPage>
  );
}
