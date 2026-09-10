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
      // The regressive-at-the-top result, with the two wage levels that
      // demonstrate it. Also why the 0,9% threshold catches more people
      // every year without any law changing.
      notice={C.regressiveNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsPayrollTaxCalculator />
    </CalculatorPage>
  );
}
