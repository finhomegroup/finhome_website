import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RetirementPlanCalculator } from "@/components/retirement-plan-calculator";
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
      // Nominal 3,24 triệu against 1,55 triệu in today's money. Planning
      // against the nominal figure is the most common error in long-horizon
      // retirement projections, so the page leads with it.
      notice={C.realNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RetirementPlanCalculator />
    </CalculatorPage>
  );
}
