import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { TaxEquivalentCalculator } from "@/components/tax-equivalent-calculator";
import { TAX_EQUIVALENT as C } from "@/content/calculators/tax-equivalent";

const SLUG = "loi-suat-tuong-duong-thue";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TaxEquivalentPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // A 5,5% deposit and a 5,8% bond are a dead heat, not 0,3 points
      // apart — and the bond carries credit risk the deposit does not.
      notice={C.vietnamNotice}
      // Which instruments the cited guidance lists as TAXABLE and which as
      // EXEMPT, with both dates and the page's own provenance limit. Behind a
      // disclosure because it is a paragraph of citation, and the notice
      // above it has to stay short enough to be read on a phone.
      noticeDetailTitle={C.vietnamNoticeDetailTitle}
      noticeDetail={C.vietnamNoticeDetail}
      prose={C.formula}
      faq={C.faq}
      // Original row 24 asks for a source and an effective date ON the tax
      // parameter. The dates were in the prose; these are the documents,
      // openable, with the provenance limit on the list itself.
      sources={C.sources}
      // Original row 24's next step: "mở tiền gửi hoặc kế hoạch tích lũy".
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <TaxEquivalentCalculator />
    </CalculatorPage>
  );
}
