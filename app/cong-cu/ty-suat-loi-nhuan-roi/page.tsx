import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { RoiCalculator } from "@/components/roi-calculator";
import { ROI as C } from "@/content/calculators/roi";

const SLUG = "ty-suat-loi-nhuan-roi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RoiPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The prefilled example and the eight-months-versus-eight-years
      // arithmetic. They taught the point but they were above the form, so
      // they collapse — one disclosure, because each open summary line costs
      // the same vertical space the entry contract is trying to reclaim.
      ledeDetailTitle={C.ledeDetailTitle}
      ledeDetail={C.ledeDetail}
      // Which row to read first, and why. Below the tool this would arrive
      // after the reader has already anchored on the wrong number.
      notice={C.leadNotice}
      prose={C.formula}
      faq={C.faq}
    >
      {/* Original row 21's next step: "quay về kế hoạch vốn tự có". It moves
          inside the tool — the first two destinations beside the answer, the
          rest below it — instead of arriving after the method prose. */}
      <RoiCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
