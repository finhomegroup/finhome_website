import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ExpectedReturnCalculator } from "@/components/expected-return-calculator";
import { EXPECTED_RETURN as C } from "@/content/calculators/expected-return";

const SLUG = "loi-nhuan-ky-vong";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function ExpectedReturnPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // CSV row 39 is "Hai cột": eight scenarios of two fields each need the
      // width, and `wide` is what the calculator's split grid gets it from.
      wide
      // Nobody receives the expected return. Read the spread, and read the
      // coefficient of variation if you are comparing two investments.
      notice={C.spreadNotice}
      // The 7,5% walk-through and the worked coefficient comparison. The two
      // reading instructions stay above the form.
      noticeDetailTitle={C.spreadNoticeDetailTitle}
      noticeDetail={C.spreadNoticeDetail}
      prose={C.formula}
      faq={C.faq}
    >
      <ExpectedReturnCalculator />
    </CalculatorPage>
  );
}
