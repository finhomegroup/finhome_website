import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { PointsCalculator } from "@/components/points-calculator";
import { POINTS as C } from "@/content/calculators/points";

const SLUG = "diem-chiet-khau";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PointsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Visible: whether this offer structure exists for the reader at all,
      // which decides whether the tool applies. The methodology — why this
      // page's verdict differs from the break-even every other calculator
      // prints — is the disclosure under it; see `points.ts`.
      notice={C.scopeNotice}
      noticeDetail={C.methodNotice}
      noticeDetailTitle={C.methodNoticeTitle}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <PointsCalculator />
    </CalculatorPage>
  );
}
