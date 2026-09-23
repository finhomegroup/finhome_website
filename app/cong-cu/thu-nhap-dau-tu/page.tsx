import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { WithdrawalCalculator } from "@/components/withdrawal-calculator";
import { WITHDRAWAL as C } from "@/content/calculators/withdrawal";

const SLUG = "thu-nhap-dau-tu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function WithdrawalPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // CSV row 28 is "Hai cột": the calculator renders `columns="split"`,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // A rising withdrawal is funded by the REAL return. And the defaults
      // show that being inside month one's return proves nothing.
      notice={C.realReturnNotice}
      // The 8%-but-15.749.891-₫ walk-through, and the default that runs dry
      // after 245 months. The two claims stay visible; the arithmetic moves.
      noticeDetailTitle={C.realReturnNoticeDetailTitle}
      noticeDetail={C.realReturnNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      {/* Original row 26's next step: "kế hoạch ngân sách nếu phù hợp". The
          entry existed in `next-steps.ts` and this route never rendered it;
          it now renders beside the answer rather than under the page, which
          is where a reader deciding how much to draw is looking. */}
      <WithdrawalCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
