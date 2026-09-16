import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { AprCalculator } from "@/components/apr-calculator";
import { APR as C } from "@/content/calculators/apr";

const SLUG = "apr";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AprPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // APR is only useful as a comparison, and only if both sides were fed
      // the same fee list. Say that before the number is read.
      notice={C.compareNotice}
      // The shared disclaimer says fees are excluded; this tool includes
      // every fee the reader enters, so it carries an accurate one instead.
      disclaimer={C.disclaimer}
      prose={C.formula}
      faq={C.faq}
      // The seam was one-directional until now: C13's exercise opened this
      // tool, and nothing here pointed back. An entry in `TOOL_NEXT_STEPS`
      // alone would not have fixed it — this slot is what renders it, and
      // `next-steps.test.ts` fails an entry whose route never passes it.
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <AprCalculator />
    </CalculatorPage>
  );
}
