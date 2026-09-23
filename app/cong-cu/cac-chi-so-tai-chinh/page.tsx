import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { FinancialRatiosCalculator } from "@/components/financial-ratios-calculator";
import { FINANCIAL_RATIOS as C } from "@/content/calculators/financial-ratios";

const SLUG = "cac-chi-so-tai-chinh";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FinancialRatiosPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // §5: the two-company worked example that argues `oneRatioNotice`. It
      // lands in the LEDE disclosure because `noticeDetail` on this route is
      // the closing-balance caveat and the shell has one slot each.
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The row's lesson, in the one slot above the calculator: a single
      // ratio does not conclude a company's health. It replaced the
      // closing-balance caveat here, which is five sentences of technical
      // qualification and now sits behind the disclosure instead — docs §3
      // asks a notice to be one or two sentences for exactly that reason.
      notice={C.oneRatioNotice}
      noticeDetailTitle={C.closingBalanceTitle}
      noticeDetail={C.closingBalanceNotice}
      intro={C.form.ratioTable.intro}
      prose={C.formula}
      faq={C.faq}
      // ROW 67 is "Theo nhóm + kết quả": the tool now renders `columns="split"`
      // with the derived statement and the twenty-row ratio table in the
      // full-width band below.
      wide
    >
      <FinancialRatiosCalculator />
    </CalculatorPage>
  );
}
