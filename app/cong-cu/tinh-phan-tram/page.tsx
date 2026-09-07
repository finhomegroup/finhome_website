import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { PercentCalculator } from "@/components/percent-calculator";
import { PERCENT as C } from "@/content/calculators/percent";

const SLUG = "tinh-phan-tram";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PercentPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The asymmetry trap belongs above the tool: it is the mistake people
      // arrive already making, not a footnote about the arithmetic.
      notice={C.asymmetryNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <PercentCalculator />
    </CalculatorPage>
  );
}
