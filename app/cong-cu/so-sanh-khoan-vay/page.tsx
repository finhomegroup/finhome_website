import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { LoanCompareCalculator } from "@/components/loan-compare-calculator";
import { LOAN_COMPARE as C } from "@/content/calculators/loan-compare";

const SLUG = "so-sanh-khoan-vay";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function LoanComparePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // A borrower needs to know what "rẻ nhất" is measured on BEFORE they
      // read a ranking off the tool, because their instinct is to rank on the
      // monthly instalment — which rewards the most expensive option.
      notice={C.rankingNotice}
      // The fees the reader enters ARE in these figures, at the date each is
      // paid, so the shared "fees excluded" disclaimer would be false here.
      disclaimer={C.disclaimer}
      // No `intro`: `C.table.intro` explains the comparison table's two row
      // groups, and it now sits directly above that table inside the tool
      // rather than ahead of the amount box, the horizon and the answer.
      prose={C.formula}
      faq={C.faq}
      wide
    >
      {/* The next steps move INSIDE the tool, beside the answer. Still
          rendered from the page, so they ship no client JavaScript. */}
      <LoanCompareCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
