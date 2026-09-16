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
      // 10.902.417.350 ₫ nominal against 4.089.679.933 ₫ in today's money —
      // 37,5% of it. Planning against the nominal figure is the most common
      // error in a long-horizon projection, so the page leads with it.
      notice={C.realNotice}
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      prose={C.formula}
      faq={C.faq}
      // The other three views of the SAME plan, above the method and the FAQ:
      // a reader who has their answer should find the next question without
      // scrolling past two explanatory sections. Rendered from the page rather
      // than from inside the calculator so it ships no client JavaScript.
      afterCalculator={<LongTermViews current="trajectory" />}
      // The shared default is false here and says so in its own comment: this
      // model uses a different return before and after the retirement date, so
      // "giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" is
      // wrong on a page that has rate fields. The override keeps the opening
      // clause `check:markup` counts.
      disclaimer={L.scope.disclaimer}
    >
      <RetirementPlanCalculator />
    </CalculatorPage>
  );
}
