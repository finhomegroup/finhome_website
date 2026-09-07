import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { DdmMultiCalculator } from "@/components/ddm-multi-calculator";
import { DDM_MULTI as C } from "@/content/calculators/ddm-multi";

const SLUG = "co-phieu-tang-truong-khong-deu";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function DdmMultiPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Three quarters of the value comes from the perpetuity nobody can
      // check. Say so before the reader takes the number as an answer.
      notice={C.terminalNotice}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
    >
      <DdmMultiCalculator />
    </CalculatorPage>
  );
}
