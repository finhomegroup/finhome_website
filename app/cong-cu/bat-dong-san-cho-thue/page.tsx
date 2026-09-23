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
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // A 6% gross yield and a negative return on the same flat. Which of the
      // four numbers to read, before any of them is read — with the worked
      // walk-through one click away rather than ahead of the form.
      notice={C.fourNumbersNotice}
      noticeDetail={C.fourNumbersDetail}
      noticeDetailTitle={C.fourNumbersDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // The documents behind the prefilled tax parameters, openable. This
      // does NOT close the tax review docs §6 records as a release gate — it
      // gives the reader and that reviewer the sources the figures came from.
      sources={C.sources}
      wide
    >
      {/* No next-step entry exists for this slug in the library, and one is not
          invented here. */}
      <RentalPropertyCalculator />
    </CalculatorPage>
  );
}
