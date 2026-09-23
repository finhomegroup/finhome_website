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
      // The rule: a quoted discount rate is not a yield, so it cannot be
      // compared with a deposit's APY. That is a limit on reading the result.
      notice={C.quoteNotice}
      // The two conventions priced on their own and together, so the reader
      // can see they compound.
      noticeDetailTitle={C.quoteNoticeDetailTitle}
      noticeDetail={C.quoteNoticeDetail}
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
    >
      <UsTbillCalculator />
    </CalculatorPage>
  );
}
