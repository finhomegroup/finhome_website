import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
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
      // §5: the purpose and the unchanged obligation are the visible half;
      // which deductions the tool accepts, in what order, and the reverse
      // direction are one click away instead of standing between the reader
      // and the first field.
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
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
      // ROW 69 is "Hai cột": the tool now renders `columns="split"` with the
      // deduction bridge directly under the answer and the Chi tiết rows in
      // the full-width band below.
      wide
    >
      {/* P2 placement, on the pattern `lai-suat-thuc-te` already ships: the
          APR question a reader has the moment they see how much the fees took
          now sits under the net figure, and the remaining guidance stays after
          it. Nothing is added or dropped — `next-steps.ts` holds the same three
          tools, the first two travel into `ResultActions` with the intro, and
          `promoted` leaves the third plus the education link below. It used to
          arrive in `afterCalculator`, under the chart and the detail band. */}
      <NetDistributionCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
