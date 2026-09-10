import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsSocialSecurityPayoutCalculator } from "@/components/us-social-security-payout-calculator";
import { US_SOCIAL_SECURITY_PAYOUT as C } from "@/content/calculators/us-social-security-payout";

const SLUG = "chi-tra-an-sinh-xa-hoi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsSocialSecurityPayoutPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Two rules that pull in opposite directions, and a reader who knows
      // only one of them will draw the wrong conclusion from the table.
      notice={C.asymmetryNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsSocialSecurityPayoutCalculator />
    </CalculatorPage>
  );
}
