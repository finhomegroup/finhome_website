import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { RaiseCalculator } from "@/components/raise-calculator";
import { RAISE as C } from "@/content/calculators/raise";

const SLUG = "tang-luong";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RaisePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Gross, not net. Above the tool, because a user who reads "lương mới
      // 23.000.000" and plans around it has already been misled.
      notice={C.grossNotice}
      prose={C.formula}
      faq={C.faq}
    >
      {/* The guidance list moved INSIDE the card, below the savings-goal
          stage — this tool answers two questions, and the second one's answer
          is the last figure on the page. No `wide`: row 65 is a "Gọn" row. */}
      <RaiseCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
