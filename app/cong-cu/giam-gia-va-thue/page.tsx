import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { EducationLink } from "@/components/calc/education-link";
import { PriceAdjustCalculator } from "@/components/price-adjust-calculator";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";

const SLUG = "giam-gia-va-thue";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function PriceAdjustPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The SCOPE comes first. A reader who takes "giá cuối phải trả" for the
      // cost of a property transaction has been misled by the page, and
      // original row 60 asks for exactly that boundary to be explicit. The
      // tax-included default — which changes the answer by the tax rate and
      // is what makes this tool right for a Vietnamese price tag — is the
      // paragraph directly below the tool.
      notice={C.scopeNotice}
      noticeDetailTitle={C.scopeNoticeDetailTitle}
      noticeDetail={C.scopeNoticeDetail}
      intro={C.taxIncludedNotice}
      prose={C.formula}
      faq={C.faq}
      // The tax box prefills 8, which is a dated legal parameter rather than
      // an example, so the page owes the reader a link rather than a decree
      // named in prose. See the `sources` docstring in `calculator-page.tsx`.
      sources={C.sources}
      // Tool → explanation (2026-09-30 series), in a new tab.
      afterCalculator={
        <EducationLink href={C.guideLink.href} label={C.guideLink.label} why={C.guideLink.why} />
      }
      // MEASURED: the tool renders `columns="split"`, and without this the
      // shell was 702 px at 1440×1000 — a 261,59 px form column beside a
      // 408,41 px result column. `wide` is what the other split rows in this
      // batch already take; see the calculator's docstring for the numbers.
      wide
    >
      <PriceAdjustCalculator />
    </CalculatorPage>
  );
}
