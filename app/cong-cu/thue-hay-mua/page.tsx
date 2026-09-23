import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
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
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The most assumption-heavy tool in the suite. The verdict turns on a
      // price-growth rate nobody knows, so the visible notice says exactly
      // that; the disclosure tells the reader to run it at a negative rate
      // before believing any of it.
      notice={C.assumptionNotice}
      noticeDetail={C.assumptionDetail}
      noticeDetailTitle={C.assumptionDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // The shared disclaimer says results do not subtract fees or taxes.
      // Three fee fields ARE in this tool's result, so this route states
      // which costs are counted and which are not — keeping the mandatory
      // opening clause the markup gate counts.
      disclaimer={C.disclaimer}
      wide
    >
      {/* The next steps move INSIDE the tool, beside the answer. Still
          rendered from the page, so they ship no client JavaScript. */}
      <RentVsBuyCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
