import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LongTermViews } from "@/components/calc/long-term-views";
import { RetirementSavingsAnalysisCalculator } from "@/components/retirement-savings-analysis-calculator";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const SLUG = "phan-tich-tiet-kiem-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementSavingsAnalysisPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A coverage percentage reads as a comfort level and is not one: 89,7%
      // of the capital still runs the money out at 82 against a horizon of 85.
      // The reader needs that before the number, not after it.
      notice={C.coverageNotice}
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      prose={C.formula}
      faq={C.faq}
      // The other three views of the SAME plan, above the method and the FAQ:
      // a reader who has their answer should find the next question without
      // scrolling past two explanatory sections. Rendered from the page rather
      // than from inside the calculator so it ships no client JavaScript.
      afterCalculator={<LongTermViews current="gap" />}
      // The shared default is false here and says so in its own comment: this
      // model uses a different return before and after the retirement date, so
      // "giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" is
      // wrong on a page that has rate fields. The override keeps the opening
      // clause `check:markup` counts.
      disclaimer={L.scope.disclaimer}
    >
      <RetirementSavingsAnalysisCalculator />
    </CalculatorPage>
  );
}
