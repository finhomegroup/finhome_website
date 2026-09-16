import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { BlackScholesCalculator } from "@/components/black-scholes-calculator";
import { BLACK_SCHOLES as C } from "@/content/calculators/black-scholes";

const SLUG = "quyen-chon-black-scholes";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function BlackScholesPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // What the tool is actually for in a market with no listed equity
      // options, and that N(d₂) is risk-neutral rather than a forecast.
      // A model price is not a traded price — the half of this row's lesson
      // that no sentence on the page used to state plainly. The Vietnamese
      // market context moves one disclosure down.
      notice={C.modelPriceNotice}
      noticeDetail={C.contextNotice}
      noticeDetailTitle={C.contextNoticeTitle}
      intro={C.form.greeksIntro}
      prose={C.formula}
      faq={C.faq}
    >
      <BlackScholesCalculator />
    </CalculatorPage>
  );
}
