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
      // CSV row 35 is "Hai cột": the calculator renders `columns="split"`,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // Transfer tax is on the sale value, not the profit — so a losing
      // trade still pays it, and the break-even price is above the buy.
      //
      // Row 35's "đưa phần giải thích thuế dài ra khỏi đường nhập→kết quả":
      // the rule stays visible above the tool, the two worked examples move
      // behind the disclosure. This notice was the longest in the group and
      // it sits between the lede and the first input.
      notice={C.taxOnLossNotice}
      noticeDetail={C.taxOnLossDetail}
      noticeDetailTitle={C.taxOnLossDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // Both prefilled rates are statutory, so the page owes the reader links
      // rather than a decree named in prose. Without this prop the block in
      // the content module renders nothing at all.
      sources={C.sources}
    >
      <StockReturnCalculator />
    </CalculatorPage>
  );
}
