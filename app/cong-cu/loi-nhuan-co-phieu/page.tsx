import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { StockReturnCalculator } from "@/components/stock-return-calculator";
import { STOCK_RETURN as C } from "@/content/calculators/stock-return";

const SLUG = "loi-nhuan-co-phieu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function StockReturnPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Transfer tax is on the sale value, not the profit — so a losing
      // trade still pays it, and the break-even price is above the buy.
      notice={C.taxOnLossNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <StockReturnCalculator />
    </CalculatorPage>
  );
}
