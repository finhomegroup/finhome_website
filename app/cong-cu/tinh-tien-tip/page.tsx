import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { TipCalculator } from "@/components/tip-calculator";
import { TIP as C } from "@/content/calculators/tip";

const SLUG = "tinh-tien-tip";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TipPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Why the tip default is 0 and not the 15–20% an American calculator
      // would suggest. A tool that taught a foreign norm as local would be
      // getting something more important than arithmetic wrong.
      notice={C.tippingNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <TipCalculator />
    </CalculatorPage>
  );
}
