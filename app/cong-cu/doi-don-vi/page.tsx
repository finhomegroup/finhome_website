import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UnitsCalculator } from "@/components/units-calculator";
import { UNITS_CONTENT as C } from "@/content/calculators/units";

const SLUG = "doi-don-vi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UnitsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Sào and mẫu differ by region by nearly 39%. On a plot of a few mẫu
      // that is thousands of square metres.
      notice={C.regionNotice}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <UnitsCalculator />
    </CalculatorPage>
  );
}
