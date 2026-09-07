import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { BondCalculator } from "@/components/bond-calculator";
import { BOND as C } from "@/content/calculators/bond";

const SLUG = "trai-phieu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function BondPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Three numbers are all called "lợi suất" and a seller will quote the
      // flattering one. Which is which, before any of them is read.
      notice={C.threeYieldsNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <BondCalculator />
    </CalculatorPage>
  );
}
