import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RetirementTargetCalculator } from "@/components/retirement-target-calculator";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

const SLUG = "tinh-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementTargetPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The headline is the FIRST year's contribution, and the plan assumes
      // it grows. A reader who takes it as a level figure has the wrong
      // number, so this belongs above the tool.
      notice={C.growingNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RetirementTargetCalculator />
    </CalculatorPage>
  );
}
