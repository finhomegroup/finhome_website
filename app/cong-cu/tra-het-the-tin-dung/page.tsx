import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { CardPayoffCalculator } from "@/components/card-payoff-calculator";
import { CARD_PAYOFF as C } from "@/content/calculators/card-payoff";

const SLUG = "tra-het-the-tin-dung";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function CardPayoffPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Daily accrual, and the fact that the interest-free window disappears
      // the first time a statement is not cleared in full.
      notice={C.dailyInterestNotice}
      // §5: the monthly-equivalent arithmetic and the contract terms that
      // move it, one click under the model warning itself.
      noticeDetail={C.dailyInterestNoticeDetail}
      noticeDetailTitle={C.dailyInterestNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // ROW 31 is a "Hai cột" row and this tool carries a chart plus a
      // comparison group, so the card is widened: a 40/60 split inside
      // max-w-3xl leaves the result column too narrow for "22 tháng
      // (1,8 năm)". The widening is unverified visually — see the recap.
      wide
    >
      {/* ORIGINAL ROWS 29/30: one workspace, two routes. This one opens on
          the fixed-payment strategy; `/cong-cu/tra-toi-thieu-the-tin-dung/`
          opens the same calculator on the minimum. */}
      <CardPayoffCalculator
        strategy="fixed"
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
