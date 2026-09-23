import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { BusinessForecastCalculator } from "@/components/business-forecast-calculator";
import { BUSINESS_FORECAST as C } from "@/content/calculators/business-forecast";

const SLUG = "du-bao-kinh-doanh";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function BusinessForecastPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The requalification — assumptions, not data; arithmetic, not forecast
      // — is the visible notice. The prefilled scenario it reads, where the
      // margin widening comes from and how to make it disappear are the
      // disclosure under it (§5).
      notice={C.leverageNotice}
      noticeDetail={C.leverageNoticeDetail}
      noticeDetailTitle={C.leverageNoticeDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // Primary documents behind the prefilled statutory tax rate.
      sources={C.sources}
      // ROW 66 is "Theo nhóm + kết quả": the tool now renders `columns="split"`
      // with an eight-column per-year table in the full-width band below.
      wide
    >
      <BusinessForecastCalculator />
    </CalculatorPage>
  );
}
