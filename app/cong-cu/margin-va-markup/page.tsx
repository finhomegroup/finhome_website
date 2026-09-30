import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { EducationLink } from "@/components/calc/education-link";
import { MarginCalculator } from "@/components/margin-calculator";
import { MARGIN as C } from "@/content/calculators/margin";

const SLUG = "margin-va-markup";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function MarginPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The mistake the page exists for. It belongs above the tool, because a
      // shop owner who picks the wrong mode gets a plausible wrong price.
      notice={C.trapNotice}
      // §5: what the mistake costs, in figures, one click under the rule.
      noticeDetail={C.trapNoticeDetail}
      noticeDetailTitle={C.trapNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // Tool → explanation (2026-09-30 series), in a new tab.
      afterCalculator={
        <EducationLink href={C.guideLink.href} label={C.guideLink.label} why={C.guideLink.why} />
      }
    >
      <MarginCalculator />
    </CalculatorPage>
  );
}
