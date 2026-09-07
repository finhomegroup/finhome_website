import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FibonacciCalculator } from "@/components/fibonacci-calculator";
import { FIBONACCI as C } from "@/content/calculators/fibonacci";

const SLUG = "fibonacci";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FibonacciPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Direction is the input people get backwards, and the wrong answer
      // looks entirely plausible.
      notice={C.directionNotice}
      intro={C.form.retracementTable.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <FibonacciCalculator />
    </CalculatorPage>
  );
}
