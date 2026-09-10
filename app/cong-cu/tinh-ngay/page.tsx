import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { DatesCalculator } from "@/components/dates-calculator";
import { DATES as C } from "@/content/calculators/dates";

const SLUG = "tinh-ngay";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function DatesPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Why the fields are not prefilled with today, and why that is the
      // right call for a statically prerendered page.
      notice={C.noClockNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <DatesCalculator />
    </CalculatorPage>
  );
}
