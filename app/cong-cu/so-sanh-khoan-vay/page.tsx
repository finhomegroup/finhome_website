import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LoanCompareCalculator } from "@/components/loan-compare-calculator";
import { LOAN_COMPARE as C } from "@/content/calculators/loan-compare";

const SLUG = "so-sanh-khoan-vay";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function LoanComparePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A borrower needs to know what "rẻ nhất" is measured on BEFORE they
      // read a ranking off the tool, because their instinct is to rank on the
      // monthly instalment — which rewards the most expensive option.
      notice={C.rankingNotice}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <LoanCompareCalculator />
    </CalculatorPage>
  );
}
