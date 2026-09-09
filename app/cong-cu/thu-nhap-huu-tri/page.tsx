import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RetirementIncomeCalculator } from "@/components/retirement-income-calculator";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

const SLUG = "thu-nhap-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementIncomePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The figure is calibrated to run the money out at the end age. A
      // reader who mistakes it for a permanently safe rate has the wrong
      // number, so this goes above the tool.
      notice={C.zeroNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RetirementIncomeCalculator />
    </CalculatorPage>
  );
}
