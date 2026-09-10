import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { CardPayoffCalculator } from "@/components/card-payoff-calculator";
import { CARD_PAYOFF as C } from "@/content/calculators/card-payoff";

const SLUG = "tra-het-the-tin-dung";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function CardPayoffPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Daily accrual, and the fact that the interest-free window disappears
      // the first time a statement is not cleared in full.
      notice={C.dailyInterestNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <CardPayoffCalculator />
    </CalculatorPage>
  );
}
