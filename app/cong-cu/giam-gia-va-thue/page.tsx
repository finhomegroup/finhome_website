import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { PriceAdjustCalculator } from "@/components/price-adjust-calculator";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";

const SLUG = "giam-gia-va-thue";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PriceAdjustPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The tax-included default is the one thing that makes this tool right
      // for a Vietnamese price tag, and it changes the answer by the tax rate.
      notice={C.taxIncludedNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <PriceAdjustCalculator />
    </CalculatorPage>
  );
}
