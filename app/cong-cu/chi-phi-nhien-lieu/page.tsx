import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { FuelCalculator } from "@/components/fuel-calculator";
import { FUEL as C } from "@/content/calculators/fuel";

const SLUG = "chi-phi-nhien-lieu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FuelPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // What the tool does NOT cost. A reader who takes "chi phí mỗi km" for
      // the cost of driving will understate it by a factor of two or three.
      // The limitation is the visible half; the exclusion list is one click
      // away rather than pushing the first field further down the phone.
      notice={C.scopeNotice}
      noticeDetail={C.scopeNoticeDetail}
      noticeDetailTitle={C.scopeNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // The shared disclaimer talks about interest rates and investment
      // returns, neither of which this page computes. See the content file.
      disclaimer={C.disclaimer}
      // ROW 70 is "Hai cột": the tool renders `columns="split"`, with only the
      // chosen purpose's fields on the left and its one result group — plus
      // the two-home chart, in that purpose only — on the right.
      wide
    >
      {/* P2 placement, on the pattern `lai-suat-thuc-te` already ships: the
          two destinations move beside the active purpose's answer and the
          further guidance stays after the figure. Nothing is added or dropped
          — `next-steps.ts` holds two tools for this slug either way, and the
          intro travels with them into `ResultActions`. It used to arrive in
          `afterCalculator`, under the comparison chart and the detail band. */}
      {/* The intro above those two tools is the one part that is not shared:
          the entry sentence talks about a monthly difference, which only the
          comparison purpose computes. The trip purpose gets its own sentence.
          Both nodes are built here because the page is a server component and
          cannot see the selected purpose; the client component picks one for
          the same slot. */}
      <FuelCalculator
        actions={<ResultActions slug={SLUG} />}
        tripActions={
          <ResultActions slug={SLUG} intro={C.form.tripStepsIntro} />
        }
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
