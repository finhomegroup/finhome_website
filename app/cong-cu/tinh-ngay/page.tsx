import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { DatesCalculator } from "@/components/dates-calculator";
import { DATES as C } from "@/content/calculators/dates";

const SLUG = "tinh-ngay";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function DatesPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // What the tool does NOT know comes first — no holidays, no legal
      // deadline, nothing saved — because original row 70's failure mode is a
      // reader treating a counted day as a deadline. Why the fields are not
      // prefilled with today is the paragraph below the tool; it explains a
      // design choice rather than guarding against a wrong conclusion.
      notice={C.scopeNotice}
      noticeDetailTitle={C.scopeNoticeDetailTitle}
      noticeDetail={C.scopeNoticeDetail}
      intro={C.noClockNotice}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <DatesCalculator />
    </CalculatorPage>
  );
}
