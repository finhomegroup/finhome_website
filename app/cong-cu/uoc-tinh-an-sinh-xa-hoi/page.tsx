import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsSocialSecurityEstimateCalculator } from "@/components/us-social-security-estimate-calculator";
import { US_SOCIAL_SECURITY_ESTIMATE as C } from "@/content/calculators/us-social-security-estimate";

const SLUG = "uoc-tinh-an-sinh-xa-hoi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsSocialSecurityEstimatePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The formula is regressive by design, and a reader who assumes it is
      // proportional will misread every figure on the page.
      notice={C.regressiveNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsSocialSecurityEstimateCalculator />
    </CalculatorPage>
  );
}
