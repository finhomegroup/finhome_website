import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { BondCalculator } from "@/components/bond-calculator";
import { BOND as C } from "@/content/calculators/bond";

const SLUG = "trai-phieu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function BondPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Three numbers are all called "lợi suất" and a seller will quote the
      // flattering one. Which is which, before any of them is read.
      // Every yield on this page assumes the issuer pays. That is the thing
      // a reader must know before reading a figure off the tool, so it is
      // the notice; the three-yield distinction is one disclosure below it
      // and also in the method section and the FAQ.
      notice={C.creditRiskNotice}
      noticeDetail={C.threeYieldsNotice}
      noticeDetailTitle={C.threeYieldsNoticeTitle}
      prose={C.formula}
      faq={C.faq}
    >
      <BondCalculator />
    </CalculatorPage>
  );
}
