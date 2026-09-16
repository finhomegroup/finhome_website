import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { RentVsBuyCalculator } from "@/components/rent-vs-buy-calculator";
import { RENT_VS_BUY as C } from "@/content/calculators/rent-vs-buy";

const SLUG = "thue-hay-mua";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RentVsBuyPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The most assumption-heavy tool in the suite. The verdict turns on a
      // price-growth rate nobody knows, so the notice tells the reader to run
      // it at a negative rate before believing any of it.
      notice={C.assumptionNotice}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
      // The shared disclaimer says results do not subtract fees or taxes.
      // Three fee fields ARE in this tool's result, so this route states
      // which costs are counted and which are not — keeping the mandatory
      // opening clause the markup gate counts.
      disclaimer={C.disclaimer}
    >
      <RentVsBuyCalculator />
    </CalculatorPage>
  );
}
