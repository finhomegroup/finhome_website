import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { LoanCompareCalculator } from "@/components/loan-compare-calculator";
import { FIXED_VS_FLOATING as C } from "@/content/calculators/fixed-vs-floating";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";

const SLUG = "lai-co-dinh-hay-tha-noi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * ORIGINAL ROW 12: "Gộp thành góc nhìn của so sánh khoản vay."
 *
 * This route keeps its URL, its title, its own prose and its own FAQ, and
 * renders the SAME comparison component the offers route does — at
 * `perspective="fixedFloating"`. That is what the row asked for and a
 * cross-link is not it: the old page was a second form with its own inputs,
 * its own full-term-only verdict, no common holding horizon, no payment
 * trajectories and no fee handling, so a reader who had typed their quotes
 * into the comparison had to retype them here to ask this question.
 *
 * What comes with the consolidation: one principal for both sides, one chosen
 * horizon, both payment paths drawn, the debt still owed at the horizon,
 * origination fees separated from a settlement fee charged at the horizon,
 * the modelled APR, and the invalid-offer exclusion — none of which the old
 * form had.
 */
export default function FixedVsFloatingPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The verdict is only true for the rate scenario the reader typed, at
      // the horizon they chose. Said above the tool, not under it.
      notice={C.reframeNotice}
      noticeDetail={C.reframeDetail}
      noticeDetailTitle={C.reframeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
      // Shared with the comparison route, for the same reason: the shared
      // notice says fees are excluded, and here entered fees are modelled.
      disclaimer={LOAN_COMPARE.disclaimer}
    >
      <LoanCompareCalculator perspective="fixedFloating" />
    </CalculatorPage>
  );
}
