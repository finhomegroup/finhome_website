import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ExpectedReturnCalculator } from "@/components/expected-return-calculator";
import { EXPECTED_RETURN as C } from "@/content/calculators/expected-return";

const SLUG = "loi-nhuan-ky-vong";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function ExpectedReturnPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Nobody receives the expected return. Read the spread, and read the
      // coefficient of variation if you are comparing two investments.
      notice={C.spreadNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <ExpectedReturnCalculator />
    </CalculatorPage>
  );
}
