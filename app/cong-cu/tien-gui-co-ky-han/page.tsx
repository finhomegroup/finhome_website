import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { TermDepositCalculator } from "@/components/term-deposit-calculator";
import { TERM_DEPOSIT as C } from "@/content/calculators/term-deposit";

const SLUG = "tien-gui-co-ky-han";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TermDepositPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The early-withdrawal term is the expensive part of this product and
      // is not on the leaflet. It goes above the tool, not in the FAQ.
      notice={C.earlyWithdrawalNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <TermDepositCalculator />
    </CalculatorPage>
  );
}
