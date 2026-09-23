import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { CapmCalculator } from "@/components/capm-calculator";
import { CAPM as C } from "@/content/calculators/capm";

const SLUG = "capm";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function CapmPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Four significant figures out of three estimates. Say that before the
      // reader treats the output as a forecast.
      notice={C.precisionNotice}
      // Which of the three inputs moves with what, and the three-premium
      // sensitivity check. The warning not to read it as a forecast stays up.
      noticeDetailTitle={C.precisionNoticeDetailTitle}
      noticeDetail={C.precisionNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      <CapmCalculator />
    </CalculatorPage>
  );
}
