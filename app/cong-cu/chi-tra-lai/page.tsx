import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { InterestOnlyCalculator } from "@/components/interest-only-calculator";
import { INTEREST_ONLY as C } from "@/content/calculators/interest-only";

const SLUG = "chi-tra-lai";

// Built by the shared helper rather than by hand: Next REPLACES openGraph
// wholesale, so a hand-written block silently dropped the share image,
// og:site_name and og:locale that app/layout.tsx supplies.
export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * MIGRATED to the shared shell in this unit.
 *
 * docs §3: the six pre-shell pages keep their hand-written bodies because
 * their built HTML is a regression gate, and they should move "whenever their
 * markup is next allowed to change". Original row 14 rewrites this page's
 * model, framing, form and charts, so this is that moment — and the shell owns
 * the two contracts a hand-written page can silently drop: the disclaimer and
 * the registry's `usRules` wiring.
 */
export default function GraceLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // What a borrower has to know before reading an instalment off this
      // tool: ân hạn gốc defers principal, it does not reduce it.
      notice={C.jumpNotice}
      noticeDetail={C.jumpDetail}
      noticeDetailTitle={C.jumpDetailTitle}
      intro={C.form.table.intro}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
      // The shared notice says the rate is assumed constant; this page models
      // a reset. Tool-owned text, mandatory opening sentence kept.
      disclaimer={C.disclaimer}
    >
      <InterestOnlyCalculator />
    </CalculatorPage>
  );
}
