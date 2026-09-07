import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { MarginCalculator } from "@/components/margin-calculator";
import { MARGIN as C } from "@/content/calculators/margin";

const SLUG = "margin-va-markup";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function MarginPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The mistake the page exists for. It belongs above the tool, because a
      // shop owner who picks the wrong mode gets a plausible wrong price.
      notice={C.trapNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <MarginCalculator />
    </CalculatorPage>
  );
}
