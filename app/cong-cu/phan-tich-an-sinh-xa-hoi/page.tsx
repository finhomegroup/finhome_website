import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsSocialSecurityAnalysisCalculator } from "@/components/us-social-security-analysis-calculator";
import { US_SOCIAL_SECURITY_ANALYSIS as C } from "@/content/calculators/us-social-security-analysis";

const SLUG = "phan-tich-an-sinh-xa-hoi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsSocialSecurityAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The page returns two answers that routinely disagree. A reader
      // expecting one number needs to know that before they read either.
      notice={C.twoAnswersNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsSocialSecurityAnalysisCalculator />
    </CalculatorPage>
  );
}
