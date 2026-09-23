import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { FloatingLoanCalculator } from "@/components/floating-loan-calculator";
import { FLOATING_LOAN as C } from "@/content/calculators/floating-loan";

const SLUG = "lai-suat-tha-noi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function FloatingLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The number to judge affordability on is the post-promo instalment.
      // Two sentences visible; the percentage-point-versus-relative arithmetic
      // is behind the disclosure.
      notice={C.shockNotice}
      noticeDetail={C.shockDetail}
      noticeDetailTitle={C.shockDetailTitle}
      // No `intro`: `C.form.table.intro` is five sentences about the phase
      // table's balance column, and it now sits directly above that table
      // inside the tool rather than ahead of the form, the chart and the
      // answer.
      prose={C.formula}
      faq={C.faq}
      // The shared notice says the rate is assumed constant, which is false on
      // this page. Tool-owned text, mandatory opening sentence kept.
      disclaimer={C.disclaimer}
      wide
    >
      {/* The route the 1101,9 px measurement came from: the two actions now
          sit between the answer and the 805,2 px plot, and the third —
          `vay-mua-nha`, deleted in the previous round and restored — is the
          further question below it. */}
      <FloatingLoanCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
