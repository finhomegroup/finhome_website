import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { TaxEquivalentCalculator } from "@/components/tax-equivalent-calculator";
import { TAX_EQUIVALENT as C } from "@/content/calculators/tax-equivalent";

const SLUG = "loi-suat-tuong-duong-thue";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TaxEquivalentPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A 5,5% deposit and a 5,8% bond are a dead heat, not 0,3 points
      // apart — and the bond carries credit risk the deposit does not.
      notice={C.vietnamNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <TaxEquivalentCalculator />
    </CalculatorPage>
  );
}
