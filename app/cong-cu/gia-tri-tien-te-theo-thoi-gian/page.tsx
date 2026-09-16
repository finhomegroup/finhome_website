import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
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
      // TRUE IN BOTH MODES. The full sign-convention notice used to sit here,
      // above a form that now opens on three everyday questions where the
      // reader types positive amounts and never sees a sign. It moved INTO
      // the advanced mode, beside the fields it governs; this line says which
      // mode needs it. See `tvm-calculator.tsx`.
      notice={C.question.pageNotice}
      prose={C.formula}
      faq={C.faq}
      // Original row 18's next step: "mục tiêu tiết kiệm hoặc khoản vay theo
      // câu hỏi". The entry existed and this route never rendered it.
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <TvmCalculator />
    </CalculatorPage>
  );
}
