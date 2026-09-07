import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { RentalPropertyCalculator } from "@/components/rental-property-calculator";
import { RENTAL_PROPERTY as C } from "@/content/calculators/rental-property";

const SLUG = "bat-dong-san-cho-thue";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RentalPropertyPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A 6% gross yield and a −4,77% return on the same flat. Which of the
      // four numbers to read, before any of them is read.
      notice={C.fourNumbersNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <RentalPropertyCalculator />
    </CalculatorPage>
  );
}
