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
      // CSV row 42 is "Hai cột": the calculator renders `columns="split"`, and
      // `wide` is what gives that grid room to be worth splitting. Six inputs
      // in three boxes on the left, the two prices on the right.
      wide
      // What the tool is actually for in a market with no listed equity
      // options, and that N(d₂) is risk-neutral rather than a forecast.
      // A model price is not a traded price — the half of this row's lesson
      // that no sentence on the page used to state plainly. The Vietnamese
      // market context moves one disclosure down.
      notice={C.modelPriceNotice}
      noticeDetail={C.contextNotice}
      noticeDetailTitle={C.contextNoticeTitle}
      // `greeksIntro` is no longer passed here. `intro` renders BELOW the
      // tool box (see `calculator-page.tsx`), so 817 characters of Greeks
      // teaching arrived a full screen away from the table it explains; the
      // calculator now renders it immediately above that table instead.
      prose={C.formula}
      faq={C.faq}
    >
      <BlackScholesCalculator />
    </CalculatorPage>
  );
}
