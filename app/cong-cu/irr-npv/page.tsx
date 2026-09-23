import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { IrrNpvCalculator } from "@/components/irr-npv-calculator";
import { IRR_NPV as C } from "@/content/calculators/irr-npv";

const SLUG = "irr-npv";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function IrrNpvPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The calculator renders `columns="split"` again after an independent
      // review restored the approved long-form desktop layout for CSV row 24,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // Read NPV first. IRR is the number people quote and the one that
      // overstates, because it assumes reinvestment at its own rate.
      notice={C.npvFirstNotice}
      // The two worked rates for the default project. The RULE stays visible
      // above the form; the figures that prove it collapse.
      noticeDetailTitle={C.npvFirstNoticeDetailTitle}
      noticeDetail={C.npvFirstNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      <IrrNpvCalculator />
    </CalculatorPage>
  );
}
