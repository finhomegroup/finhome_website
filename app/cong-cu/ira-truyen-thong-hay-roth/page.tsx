import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsIraCalculator } from "@/components/us-ira-calculator";
import { US_IRA as C } from "@/content/calculators/us-ira";

const SLUG = "ira-truyen-thong-hay-roth";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsIraPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // "Lower than today's rate" is the rule of thumb readers arrive with,
      // and it is wrong by a measurable margin. That margin belongs above
      // the tool.
      notice={C.equalCostNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsIraCalculator />
    </CalculatorPage>
  );
}
