import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { PercentCalculator } from "@/components/percent-calculator";
import { PERCENT as C } from "@/content/calculators/percent";

const SLUG = "tinh-phan-tram";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PercentPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetailTitle={C.ledeDetailTitle}
      ledeDetail={C.ledeDetail}
      // The asymmetry trap belongs above the tool: it is the mistake people
      // arrive already making, not a footnote about the arithmetic. One line
      // visible, the worked example behind a summary that names its own
      // figures — the 2026-09-21 audit measured the first input 1.041 px down
      // a 390 px viewport with the full four-sentence version in that gap.
      notice={C.asymmetryNotice}
      noticeDetailTitle={C.asymmetryDetailTitle}
      noticeDetail={C.asymmetryDetail}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug="tinh-phan-tram" />}
    >
      <PercentCalculator />
    </CalculatorPage>
  );
}
