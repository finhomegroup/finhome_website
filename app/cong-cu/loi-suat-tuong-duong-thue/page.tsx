import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
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
      // The waiting-to-buy scenario and the worked pair — 5,5% against 5,8%
      // landing at 5,51% — which are what make the figures mean anything but
      // are not needed BEFORE the form. `noticeDetail` below is a different
      // question (legal provenance), so this one hangs off the heading.
      ledeDetailTitle={C.ledeDetailTitle}
      ledeDetail={C.ledeDetail}
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
    >
      {/* Original row 24's next step: "mở tiền gửi hoặc kế hoạch tích lũy" —
          the first two destinations beside the answer, the rest below it. */}
      <TaxEquivalentCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
