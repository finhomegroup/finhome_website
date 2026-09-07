import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RefinanceCalculator } from "@/components/refinance-calculator";
import { REFINANCE as C } from "@/content/calculators/refinance";

const SLUG = "tai-cap-von";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RefinancePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Break-even and lifetime saving can point opposite ways. A borrower
      // who reads the short break-even and stops has been misled by the tool.
      notice={C.trapNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RefinanceCalculator />
    </CalculatorPage>
  );
}
