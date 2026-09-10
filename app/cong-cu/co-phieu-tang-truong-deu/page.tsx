import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { DdmCalculator } from "@/components/ddm-calculator";
import { DDM as C } from "@/content/calculators/ddm";

const SLUG = "co-phieu-tang-truong-deu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function DdmPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The value is hypersensitive to the denominator. Read the inversions
      // instead — those are the claims a reader can actually check.
      notice={C.denominatorNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <DdmCalculator />
    </CalculatorPage>
  );
}
