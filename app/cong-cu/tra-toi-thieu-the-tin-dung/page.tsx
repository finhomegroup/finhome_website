import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { CardPayoffCalculator } from "@/components/card-payoff-calculator";
import { CARD_MINIMUM as C } from "@/content/calculators/card-minimum";

const SLUG = "tra-toi-thieu-the-tin-dung";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * ORIGINAL ROW 30: "Gộp thành chế độ so sánh của công cụ trả hết nợ."
 *
 * This route keeps its URL, its title, its own prose and its own FAQ, and
 * renders the SAME workspace the payoff route does — opened on the `minimum`
 * strategy. The old page was a second form with its own balance and rate
 * fields, no dates, no chart and no household budget, so a reader who had
 * typed their figures into the other card tool had to retype them here to ask
 * this question.
 *
 * What comes with the consolidation: both debt paths drawn from the same
 * schedules, both payoff dates under one stated start-date convention, the
 * household allocation that frees up after payoff, and the fixed-payment and
 * target-date modes reachable without leaving the page.
 */
export default function CardMinimumPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // 90 months vs 28 months on the same first payment. This is the whole
      // page, and it belongs above the tool rather than under it — §5 keeps
      // the comparison and the illustrative-rates warning visible and puts
      // the seven figures behind the disclosure.
      notice={C.trapNotice}
      noticeDetail={C.trapNoticeDetail}
      noticeDetailTitle={C.trapNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // ROW 32: "giữ cùng cấu trúc với trang trả hết thẻ" — so this page
      // takes the same `wide` split the payoff route does. Two pages that
      // differ in card width would be two structures.
      wide
    >
      <CardPayoffCalculator
        strategy="minimum"
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
