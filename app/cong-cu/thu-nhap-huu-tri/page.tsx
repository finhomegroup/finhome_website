import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LongTermViews } from "@/components/calc/long-term-views";
import { RetirementIncomeCalculator } from "@/components/retirement-income-calculator";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

const SLUG = "thu-nhap-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementIncomePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The draw is calibrated to run the capital out AT the end age. A reader
      // who mistakes it for a permanently safe rate has the wrong number, so
      // the one sentence that says so goes above the tool and the arithmetic
      // behind it collapses — a long notice pushed the form off a phone's
      // first screens, which is what `noticeDetail` exists for.
      notice={C.notice}
      noticeDetailTitle={C.noticeDetailTitle}
      noticeDetail={C.noticeDetail}
      // `prose.emphasis` is threaded by the shell through `ProseText`, so the
      // paragraph stays one plain string and the phrases stay data beside it.
      prose={C.formula}
      faq={C.faq}
      // The other three views of the SAME plan, above the method and the FAQ:
      // a reader who has their answer should find the next question without
      // scrolling past two explanatory sections. Rendered from the page rather
      // than from inside the calculator so it ships no client JavaScript.
      afterCalculator={<LongTermViews current="withdrawal" />}
      // The shared default is false here and says so in its own comment: this
      // model uses a different return before and after the retirement date, so
      // "giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" is
      // wrong on a page that has rate fields. The override keeps the opening
      // clause `check:markup` counts.
      disclaimer={L.scope.disclaimer}
    >
      <RetirementIncomeCalculator />
    </CalculatorPage>
  );
}
