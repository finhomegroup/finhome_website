import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
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
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
      // The shared notice says the rate is assumed constant, which is false on
      // this page. Tool-owned text, mandatory opening sentence kept.
      disclaimer={C.disclaimer}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <FloatingLoanCalculator />
    </CalculatorPage>
  );
}
