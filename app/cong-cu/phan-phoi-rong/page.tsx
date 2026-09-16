import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { NetDistributionCalculator } from "@/components/net-distribution-calculator";
import { NET_DISTRIBUTION as C } from "@/content/calculators/net-distribution";

const SLUG = "phan-phoi-rong";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function NetDistributionPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // WHAT the deductions are comes first: they are the reader's own
      // hypothetical figures, and this is not a tax or legal calculator.
      // Original row 67 asks for the transaction type to be explicit, and a
      // reader who takes these charges for a published schedule has been
      // misled. The reverse-direction lesson — 10% off needs 11,11% more
      // gross to recover — is the paragraph below the tool.
      notice={C.transactionNotice}
      noticeDetailTitle={C.transactionNoticeDetailTitle}
      noticeDetail={C.transactionNoticeDetail}
      intro={C.reverseNotice}
      prose={C.formula}
      faq={C.faq}
      // The shared disclaimer says results exclude fees and assume a fixed
      // interest rate. This tool subtracts the entered fees and computes no
      // rate at all. See the content file.
      disclaimer={C.disclaimer}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <NetDistributionCalculator />
    </CalculatorPage>
  );
}
