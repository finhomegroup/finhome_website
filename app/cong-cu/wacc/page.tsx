import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { WaccCalculator } from "@/components/wacc-calculator";
import { WACC as C } from "@/content/calculators/wacc";

const SLUG = "wacc";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function WaccPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The calculator renders `columns="split"` again after an independent
      // review restored the approved long-form desktop layout for CSV row 41,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // The tax shield applies to debt only. Getting that wrong moves a
      // discount rate by half a point, on every year of a DCF.
      notice={C.shieldNotice}
      // The 11,96%-versus-12,5% demonstration of getting the shield wrong.
      // Which sources the shield applies to stays visible above the form.
      noticeDetailTitle={C.shieldNoticeDetailTitle}
      noticeDetail={C.shieldNoticeDetail}
      prose={C.formula}
      faq={C.faq}
      // Primary documents behind the prefilled statutory tax rate.
      sources={C.sources}
    >
      <WaccCalculator />
    </CalculatorPage>
  );
}
