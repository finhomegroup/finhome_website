import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { EffectiveRateCalculator } from "@/components/effective-rate-calculator";
import { EFFECTIVE_RATE as C } from "@/content/calculators/effective-rate";

const SLUG = "lai-suat-thuc-te";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function EffectiveRatePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Which of the two figures to compare on, and that the direction of
      // benefit flips between saving and borrowing.
      notice={C.whichNotice}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <EffectiveRateCalculator />
    </CalculatorPage>
  );
}
