import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { WageCalculator } from "@/components/wage-calculator";
import { WAGE as C } from "@/content/calculators/wage";

const SLUG = "luong-gio-sang-luong-thang";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function WagePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // What the number IS comes before why it differs from the reader's own
      // arithmetic: original row 62's requirement is that nobody mistakes a
      // gross conversion for take-home, provable or stable income. The
      // four-weeks-is-a-month explanation is the paragraph below the tool.
      notice={C.grossNotice}
      noticeDetailTitle={C.grossNoticeDetailTitle}
      noticeDetail={C.grossNoticeDetail}
      intro={C.monthNotice}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <WageCalculator />
    </CalculatorPage>
  );
}
