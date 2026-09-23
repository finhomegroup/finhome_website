import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { HoldingPeriodCalculator } from "@/components/holding-period-calculator";
import { HOLDING_PERIOD as C } from "@/content/calculators/holding-period";

const SLUG = "loi-nhuan-ky-nam-giu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function HoldingPeriodPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The split is the point, not the total. Same 30% can be money in hand
      // or money on paper.
      notice={C.splitNotice}
      // The 18%/12% worked split and the no-dividend counterpart. The rule —
      // read the two component rows, not the total — stays visible.
      noticeDetailTitle={C.splitNoticeDetailTitle}
      noticeDetail={C.splitNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      <HoldingPeriodCalculator />
    </CalculatorPage>
  );
}
