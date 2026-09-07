import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FloatingLoanCalculator } from "@/components/floating-loan-calculator";
import { FLOATING_LOAN as C } from "@/content/calculators/floating-loan";

const SLUG = "lai-suat-tha-noi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FloatingLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The number to judge affordability on is the post-promo instalment,
      // and it is 27% higher on the defaults. Say it before the tool is read.
      notice={C.shockNotice}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <FloatingLoanCalculator />
    </CalculatorPage>
  );
}
