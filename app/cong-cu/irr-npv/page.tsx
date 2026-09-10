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
      // Read NPV first. IRR is the number people quote and the one that
      // overstates, because it assumes reinvestment at its own rate.
      notice={C.npvFirstNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <IrrNpvCalculator />
    </CalculatorPage>
  );
}
