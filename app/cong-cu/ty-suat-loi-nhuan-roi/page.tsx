import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RoiCalculator } from "@/components/roi-calculator";
import { ROI as C } from "@/content/calculators/roi";

const SLUG = "ty-suat-loi-nhuan-roi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RoiPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Which row to read first, and why. Below the tool this would arrive
      // after the reader has already anchored on the wrong number.
      notice={C.leadNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RoiCalculator />
    </CalculatorPage>
  );
}
