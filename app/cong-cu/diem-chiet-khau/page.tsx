import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { PointsCalculator } from "@/components/points-calculator";
import { POINTS as C } from "@/content/calculators/points";

const SLUG = "diem-chiet-khau";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PointsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Why this page's verdict differs from the break-even every other
      // calculator prints, and which of the two to believe.
      notice={C.methodNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <PointsCalculator />
    </CalculatorPage>
  );
}
