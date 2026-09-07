import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsInflationCalculator } from "@/components/us-inflation-calculator";
import { US_INFLATION as C } from "@/content/calculators/us-inflation";

const SLUG = "lam-phat-hoa-ky";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsInflationPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Cumulative inflation and purchasing power lost are not the same
      // number, and the second is always smaller. The page shows both rows
      // separately, so it owes the reader the reason.
      notice={C.conflationNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsInflationCalculator />
    </CalculatorPage>
  );
}
