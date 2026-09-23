import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { UnitsCalculator } from "@/components/units-calculator";
import { UNITS_CONTENT as C } from "@/content/calculators/units";

const SLUG = "doi-don-vi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UnitsPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Sào and mẫu differ by region by nearly 39%. On a plot of a few mẫu
      // that is thousands of square metres.
      notice={C.regionNotice}
      // §5: the regional values and the 39% gap between them. They were open
      // above the first field, which is a page of history before a reader can
      // convert one number.
      noticeDetail={C.regionNoticeDetail}
      noticeDetailTitle={C.regionNoticeDetailTitle}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
      // The shared disclaimer talks about interest rates and returns; this
      // page has none. Its real caveats are rounding, the named land
      // conventions, and that it settles no legal area.
      disclaimer={C.disclaimer}
      // No property-search step: there is no verified area-aware destination,
      // so the next questions are the money ones. See next-steps.ts.
    >
      {/* The guidance list moved under the answer. No `wide`: row 73 is a
          "Gọn" row — three selects, one number box, two narrow tables. */}
      <UnitsCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
