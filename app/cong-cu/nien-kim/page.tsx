import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AnnuityCalculator } from "@/components/annuity-calculator";
import { ANNUITY as C } from "@/content/calculators/annuity";

const SLUG = "nien-kim";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AnnuityPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A payout rate reads as a yield and is not one. That is the mistake
      // annuity marketing depends on, so it belongs above the tool.
      notice={C.payoutRateNotice}
      prose={C.formula}
      faq={C.faq}
      // The exclusion ratio is United States tax law, not arithmetic, and the
      // page stated it with no link a reader could open.
      sources={C.sources}
    >
      <AnnuityCalculator />
    </CalculatorPage>
  );
}
