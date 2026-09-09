import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { Us401kCalculator } from "@/components/us-401k-calculator";
import { US_401K as C } from "@/content/calculators/us-401k";

const SLUG = "gop-401k";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function Us401kPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The forfeited match, and what it costs to stop forfeiting it. This
      // is the one thing a reader should take away even if they read nothing
      // else on the page.
      notice={C.forfeitNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <Us401kCalculator />
    </CalculatorPage>
  );
}
