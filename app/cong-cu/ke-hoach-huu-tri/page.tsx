import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LongTermViews } from "@/components/calc/long-term-views";
import { RetirementPlanCalculator } from "@/components/retirement-plan-calculator";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const SLUG = "ke-hoach-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementPlanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetailTitle={C.ledeDetailTitle}
      ledeDetail={C.ledeDetail}
      // 10.902.417.350 ₫ nominal against 4.089.679.933 ₫ in today's money —
      // 37,5% of it. Planning against the nominal figure is the most common
      // error in a long-horizon projection, so the page leads with it.
      //
      // The LIMITATION stays visible and only the worked arithmetic behind it
      // collapses, with the two headline figures named on the summary line.
      // See the docstring on `realNotice`.
      notice={C.realNotice}
      noticeDetailTitle={C.realNoticeDetailTitle}
      noticeDetail={C.realNoticeDetail}
      // The eleven-field form and the trajectory figure need the 40/60 split,
      // which `max-w-3xl` cannot hold. Widens the TOOL only; the prose, the
      // FAQ and both notices keep their reading measure.
      wide
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      prose={C.formula}
      faq={C.faq}
      // The other three views of the SAME plan. It MOVED 2026-09-21 out of
      // `afterCalculator` and into the tool's own result column, and then into
      // the `actions` slot — directly under the verdict and BEFORE the figure,
      // which is what P2 asks for. Passed whole: four views is the property
      // `LongTermViews` calls load-bearing, and it is a short nav, not prose.
      // Still rendered from the page, so it still ships no client JavaScript.
      //
      // Not duplicated: `afterCalculator` is now unused on this route, so the
      // control appears exactly once.
      // The shared default is false here and says so in its own comment: this
      // model uses a different return before and after the retirement date, so
      // "giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" is
      // wrong on a page that has rate fields. The override keeps the opening
      // clause `check:markup` counts.
      disclaimer={L.scope.disclaimer}
    >
      <RetirementPlanCalculator
        actions={<LongTermViews current="trajectory" />}
      />
    </CalculatorPage>
  );
}
