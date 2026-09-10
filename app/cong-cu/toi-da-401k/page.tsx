import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { Us401kMaxCalculator } from "@/components/us-401k-max-calculator";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";

const SLUG = "toi-da-401k";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function Us401kMaxPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Front-loading is the mistake a reader arrives ready to make, and
      // whether it costs anything turns on a line in their plan document.
      notice={C.frontLoadNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <Us401kMaxCalculator />
    </CalculatorPage>
  );
}
