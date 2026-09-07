import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AutoLeaseCalculator } from "@/components/auto-lease-calculator";
import { AUTO_LEASE as C } from "@/content/calculators/auto-lease";

const SLUG = "thue-mua-xe";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AutoLeasePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Who this product is actually available to in Vietnam, and the fact
      // that the smaller monthly figure buys no ownership.
      notice={C.contextNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <AutoLeaseCalculator />
    </CalculatorPage>
  );
}
