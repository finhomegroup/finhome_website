import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LongTermViews } from "@/components/calc/long-term-views";
import { RetirementTargetCalculator } from "@/components/retirement-target-calculator";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

const SLUG = "tinh-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementTargetPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The headline is the FIRST year's figure, and the plan assumes it
      // grows: 70.007.403 ₫ at 35 is 225.780.872 ₫ at 59 on the shared
      // scenario. A reader who takes it as a level amount has the wrong
      // number, so this belongs above the tool — two sentences, because a long
      // notice pushes the form off the first screens on a phone.
      notice={C.growingNotice}
      // What a level contribution costs instead. Long enough to go behind the
      // disclosure rather than into the notice itself.
      noticeDetail={C.growingNoticeDetail}
      noticeDetailTitle={C.growingNoticeDetailTitle}
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      prose={C.formula}
      faq={C.faq}
      // The other three views of the SAME plan, above the method and the FAQ:
      // a reader who has their answer should find the next question without
      // scrolling past two explanatory sections. Rendered from the page rather
      // than from inside the calculator so it ships no client JavaScript.
      afterCalculator={<LongTermViews current="contribution" />}
      // The shared default is false here and says so in its own comment: this
      // model uses a different return before and after the retirement date, so
      // "giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" is
      // wrong on a page that has rate fields. The override keeps the opening
      // clause `check:markup` counts.
      disclaimer={L.scope.disclaimer}
    >
      <RetirementTargetCalculator />
    </CalculatorPage>
  );
}
