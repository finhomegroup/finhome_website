import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsPayrollTaxCalculator } from "@/components/us-payroll-tax-calculator";
import { US_PAYROLL_TAX as C } from "@/content/calculators/us-payroll-tax";

const SLUG = "thue-luong-hoa-ky";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsPayrollTaxPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The rule itself — a cap makes the marginal rate FALL — plus the year
      // table's scope. Both are limits on reading the result, so both stay
      // above the first input.
      notice={C.regressiveNotice}
      // The two wage levels that demonstrate it, and why the 0,9% threshold
      // catches more people every year without any law changing. Teaching,
      // not a limit, so it is a click away.
      noticeDetailTitle={C.regressiveNoticeDetailTitle}
      noticeDetail={C.regressiveNoticeDetail}
      prose={C.formula}
      faq={C.faq}
      // The rates are applied with no field to hold them, so the citation is
      // the reader's only way to check them. A declared block that no route
      // passes renders nothing — content/calculators/sources-wiring.test.ts.
      sources={C.sources}
    >
      <UsPayrollTaxCalculator />
    </CalculatorPage>
  );
}
