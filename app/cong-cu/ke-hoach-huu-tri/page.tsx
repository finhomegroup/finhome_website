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
      // A nominal balance is not purchasing power — the most common error in
      // a long-horizon projection — so the LIMITATION stays visible above the
      // form, in words. The demonstration with the reader's own figures now
      // sits under the result, where the 2026-09-26 review asked for it, and
      // is filled by the calculator from the live plan rather than quoted
      // from the default scenario. See the docstring on `realNotice`.
      notice={C.realNotice}
      // The eleven-field form and the trajectory figure need the 40/60 split,
      // which `max-w-3xl` cannot hold. Widens the TOOL only; the prose, the
      // FAQ and both notices keep their reading measure.
      wide
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      // `prose.detail` is the full method behind a labelled disclosure — the
      // third layer of the 2026-09-26 rewrite, rendered plain.
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
