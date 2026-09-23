import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { EducationSavingsCalculator } from "@/components/education-savings-calculator";
import { EDUCATION_SAVINGS as C } from "@/content/calculators/education-savings";

const SLUG = "tiet-kiem-hoc-phi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function EducationSavingsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // CSV row 27 is "Hai cột": the calculator renders `columns="split"`,
      // and `wide` is what gives that grid room to be worth splitting.
      wide
      // Tuition is a stream, not one number — and leaving the inflation box
      // at zero is the much bigger error of the two.
      notice={C.streamNotice}
      // The longest entry block in this group at 888 characters, all of it
      // above the form. The two rules stay in the notice; every worked figure
      // moves here unchanged.
      noticeDetailTitle={C.streamNoticeDetailTitle}
      noticeDetail={C.streamNoticeDetail}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      {/* Original row 25 frames this as a goal PARALLEL to buying a home, so
          its next steps are the two home tools — with the contribution typed
          in again, because nothing travels with a link. They move from
          `afterCalculator` into the tool, beside the answer. */}
      <EducationSavingsCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
