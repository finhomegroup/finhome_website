import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { WageCalculator } from "@/components/wage-calculator";
import { WAGE as C } from "@/content/calculators/wage";

const SLUG = "luong-gio-sang-luong-thang";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function WagePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The four-weeks-is-a-month error is the reason people get a different
      // answer from this tool than from their own arithmetic. Say it first.
      notice={C.monthNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <WageCalculator />
    </CalculatorPage>
  );
}
