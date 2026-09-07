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
      // The tax shield applies to debt only. Getting that wrong moves a
      // discount rate by half a point, on every year of a DCF.
      notice={C.shieldNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <WaccCalculator />
    </CalculatorPage>
  );
}
