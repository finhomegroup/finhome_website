import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { PivotCalculator } from "@/components/pivot-calculator";
import { PIVOT as C } from "@/content/calculators/pivot";

const SLUG = "diem-pivot";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PivotPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // These levels predict nothing. Four conventions from one data set,
      // disagreeing — which is itself the argument.
      notice={C.notAPredictionNotice}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <PivotCalculator />
    </CalculatorPage>
  );
}
