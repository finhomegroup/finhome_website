import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { EffectiveRateCalculator } from "@/components/effective-rate-calculator";
import { EFFECTIVE_RATE as C } from "@/content/calculators/effective-rate";

/**
 * The route is unchanged by original row 58's rename.
 *
 * The page is now titled "lãi suất hiệu dụng" throughout, because "lãi suất
 * thực tế" is also how a fee-inclusive APR is described in Vietnamese and the
 * old title invited the exact confusion the page exists to remove. Moving the
 * URL would break every existing link for a naming fix.
 */
const SLUG = "lai-suat-thuc-te";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function EffectiveRatePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // §5: the 8% → 8,30% → 8,33% worked example, which used to be the
      // second and third sentences above the first field.
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The APR distinction comes FIRST, because a reader who takes an
      // "effective" figure to a loan quote as though it included the fees has
      // been misled by the page. Which figure to compare on, and the flip of
      // benefit between saving and borrowing, is inside the disclosure and in
      // `whichNotice` below the tool.
      notice={C.aprNotice}
      noticeDetailTitle={C.aprNoticeDetailTitle}
      noticeDetail={C.aprNoticeDetail}
      // Still about the comparison table inside the calculator.
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={
        <>
          {/* Which of the two figures to compare on, and that the direction
              of benefit flips between saving and borrowing. It moved out of
              the top notice so the APR distinction could take that slot. */}
          <p className="text-base leading-relaxed text-ink-2">
            {C.whichNotice}
          </p>
        </>
      }
    >
      {/* The guidance list moved INTO the layout's `nextSteps` slot so it sits
          under the answer rather than under the whole card; `whichNotice`
          stays in `afterCalculator` because it qualifies the tool, not the
          next step. No `wide`: row 60 is a "Gọn" row. */}
      <EffectiveRateCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
