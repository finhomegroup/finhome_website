import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RentVsBuyCalculator } from "@/components/rent-vs-buy-calculator";
import { RENT_VS_BUY as C } from "@/content/calculators/rent-vs-buy";

const SLUG = "thue-hay-mua";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RentVsBuyPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The most assumption-heavy tool in the suite. The verdict turns on a
      // price-growth rate nobody knows, so the notice tells the reader to run
      // it at a negative rate before believing any of it.
      notice={C.assumptionNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RentVsBuyCalculator />
    </CalculatorPage>
  );
}
