import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FixedVsFloatingCalculator } from "@/components/fixed-vs-floating-calculator";
import { FIXED_VS_FLOATING as C } from "@/content/calculators/fixed-vs-floating";

const SLUG = "lai-co-dinh-hay-tha-noi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FixedVsFloatingPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The verdict is only true for the scenario the reader typed. The
      // break-even rate is the number that transfers.
      notice={C.reframeNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <FixedVsFloatingCalculator />
    </CalculatorPage>
  );
}
