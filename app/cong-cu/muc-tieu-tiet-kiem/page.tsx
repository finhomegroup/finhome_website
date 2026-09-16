import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { SavingsGoalCalculator } from "@/components/savings-goal-calculator";
import { SAVINGS_GOAL as C } from "@/content/calculators/savings-goal";

const SLUG = "muc-tieu-tiet-kiem";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function SavingsGoalPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // End-of-month contributions. Small effect, but it is the reason this
      // tool disagrees slightly with one that assumes the start of the month.
      notice={C.endOfMonthNotice}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <SavingsGoalCalculator />
    </CalculatorPage>
  );
}
