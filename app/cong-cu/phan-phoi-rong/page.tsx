import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { NetDistributionCalculator } from "@/components/net-distribution-calculator";
import { NET_DISTRIBUTION as C } from "@/content/calculators/net-distribution";

const SLUG = "phan-phoi-rong";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function NetDistributionPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Recovering a 10% deduction needs 11,11% more gross, not 10%. This is
      // why freelancers and contractors under-quote.
      notice={C.reverseNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <NetDistributionCalculator />
    </CalculatorPage>
  );
}
