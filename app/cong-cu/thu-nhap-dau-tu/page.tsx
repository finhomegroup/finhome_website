import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { WithdrawalCalculator } from "@/components/withdrawal-calculator";
import { WITHDRAWAL as C } from "@/content/calculators/withdrawal";

const SLUG = "thu-nhap-dau-tu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function WithdrawalPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A rising withdrawal is funded by the REAL return. And the defaults
      // show that being inside month one's return proves nothing.
      notice={C.realReturnNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <WithdrawalCalculator />
    </CalculatorPage>
  );
}
