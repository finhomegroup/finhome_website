import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { TvmCalculator } from "@/components/tvm-calculator";
import { TVM as C } from "@/content/calculators/tvm";

const SLUG = "gia-tri-tien-te-theo-thoi-gian";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TvmPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The sign convention. This is the one page that has to expose it, and
      // a wrong sign still produces a plausible-looking number.
      notice={C.signNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <TvmCalculator />
    </CalculatorPage>
  );
}
