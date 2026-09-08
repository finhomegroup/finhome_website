import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { UsHsaCalculator } from "@/components/us-hsa-calculator";
import { US_HSA as C } from "@/content/calculators/us-hsa";

const SLUG = "tai-khoan-tiet-kiem-y-te-hoa-ky";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function UsHsaPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The fourth advantage — FICA — which 401(k) and IRA contributions do
      // not get, and which is forfeited entirely by contributing outside
      // payroll. Most write-ups omit it.
      notice={C.ficaNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <UsHsaCalculator />
    </CalculatorPage>
  );
}
