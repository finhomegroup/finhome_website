import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsRmdCalculator } from "@/components/us-rmd-calculator";
import { US_RMD as C } from "@/content/calculators/us-rmd";

const SLUG = "rut-toi-thieu-bat-buoc";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsRmdPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Readers arrive expecting the account to drain. It does not, for the
      // first decade or so, and that changes what the tool is for.
      notice={C.risingNotice}
      // The rule stays above; the worked default case behind this summary.
      noticeDetailTitle={C.risingNoticeDetailTitle}
      noticeDetail={C.risingNoticeDetail}
      // Row 54's two-column result side needs the wider tool box.
      wide
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
    >
      <UsRmdCalculator />
    </CalculatorPage>
  );
}
