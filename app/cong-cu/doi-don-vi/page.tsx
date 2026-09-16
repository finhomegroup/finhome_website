import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
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
      // The shared disclaimer talks about interest rates and returns; this
      // page has none. Its real caveats are rounding, the named land
      // conventions, and that it settles no legal area.
      disclaimer={C.disclaimer}
      // No property-search step: there is no verified area-aware destination,
      // so the next questions are the money ones. See next-steps.ts.
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <UnitsCalculator />
    </CalculatorPage>
  );
}
