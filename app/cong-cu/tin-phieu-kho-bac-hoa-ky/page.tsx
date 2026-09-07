import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsTbillCalculator } from "@/components/us-tbill-calculator";
import { US_TBILL as C } from "@/content/calculators/us-tbill";

const SLUG = "tin-phieu-kho-bac-hoa-ky";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsTbillPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The two conventions that make the quote understate the return, each
      // priced on its own so the reader can see they compound.
      notice={C.quoteNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsTbillCalculator />
    </CalculatorPage>
  );
}
