import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { AutoLoanCalculator } from "@/components/auto-loan-calculator";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";

const SLUG = "vay-mua-xe";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * Migrated onto `CalculatorPage` in the P3 buyer-support unit.
 *
 * Original row 31 rewrote this page's question, its results and its form, so
 * its rendered markup was moving anyway — which is the condition
 * `docs/calculator-suite-status.md` §3 sets for migrating one of the
 * pre-shell pages. The shell brings the disclaimer and the `usRules` wiring
 * under one owner and removes the hand-written header/footer/JSON-LD copy.
 */
export default function AutoLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Above the calculator: a buyer should learn that the debt does not
      // depreciate with the car BEFORE they read a 60-month instalment off it.
      notice={C.depreciationNotice}
      noticeDetailTitle={C.scopeNoticeTitle}
      noticeDetail={C.scopeNotice}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <AutoLoanCalculator />
    </CalculatorPage>
  );
}
