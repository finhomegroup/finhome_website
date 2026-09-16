import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { CommercialLoanCalculator } from "@/components/commercial-loan-calculator";
import { COMMERCIAL_LOAN as C } from "@/content/calculators/commercial-loan";

const SLUG = "vay-thuong-mai";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function CommercialLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Neither structure makes the loan cheaper — they move when you pay,
      // and both cost more in total. Say it before the small figure is read.
      notice={C.structureNotice}
      // Where the balloon principal is repaid from — the row's own
      // requirement, promoted out of the collapsed FAQ. `intro` is the only
      // always-visible prose slot near the figure: `noticeDetail` and
      // `ledeDetail` are both `<details>`, so moving a buried sentence into
      // either would have been the same burial with a different lid.
      intro={C.balloonSourceNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <CommercialLoanCalculator />
    </CalculatorPage>
  );
}
