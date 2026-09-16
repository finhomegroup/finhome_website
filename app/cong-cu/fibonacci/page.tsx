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
      // A level guarantees nothing — the statement row 42 owes, and which
      // used to sit in the collapsed FAQ while this slot explained the
      // direction input. Direction is still the input people get backwards
      // and the wrong answer still looks plausible, so the worked example
      // is one disclosure away rather than gone.
      notice={C.noSignalNotice}
      noticeDetail={C.directionDetail}
      noticeDetailTitle={C.directionDetailTitle}
      intro={C.form.retracementTable.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <FibonacciCalculator />
    </CalculatorPage>
  );
}
