import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { EducationSavingsCalculator } from "@/components/education-savings-calculator";
import { EDUCATION_SAVINGS as C } from "@/content/calculators/education-savings";

const SLUG = "tiet-kiem-hoc-phi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function EducationSavingsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Tuition is a stream, not one number — and leaving the inflation box
      // at zero is the much bigger error of the two.
      notice={C.streamNotice}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <EducationSavingsCalculator />
    </CalculatorPage>
  );
}
