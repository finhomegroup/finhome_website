import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { FundFeesCalculator } from "@/components/fund-fees-calculator";
import { FUND_FEES as C } from "@/content/calculators/fund-fees";

const SLUG = "phi-quy-dau-tu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FundFeesPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // CSV row 29 is "Hai cột": the calculator renders `columns="split"`,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // 2% a year takes 36% of the gain over twenty years. That reframing is
      // the page, and it belongs above the tool.
      notice={C.compoundNotice}
      // The 1.066.857.503 ₫ / 35,99% worked total. The mechanism that makes
      // it happen is the rule and stays above the form.
      noticeDetailTitle={C.compoundNoticeDetailTitle}
      noticeDetail={C.compoundNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      {/* Original row 27's next step: "quay về mục tiêu tiết kiệm" — now
          beside the answer rather than under the page, because the reader
          who has just seen the fee bite is deciding what to contribute. */}
      <FundFeesCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
