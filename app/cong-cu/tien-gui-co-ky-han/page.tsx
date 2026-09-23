import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { TermDepositCalculator } from "@/components/term-deposit-calculator";
import { TERM_DEPOSIT as C } from "@/content/calculators/term-deposit";

const SLUG = "tien-gui-co-ky-han";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function TermDepositPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
      // The early-withdrawal term is the expensive part of this product and
      // is not on the leaflet. It goes above the tool, not in the FAQ — the
      // rule visible, the worked loss one click away.
      notice={C.earlyWithdrawalNotice}
      noticeDetail={C.earlyWithdrawalDetail}
      noticeDetailTitle={C.earlyWithdrawalDetailTitle}
      prose={C.formula}
      faq={C.faq}
      // Added once the circular's fulltext was actually read (2026-09-16); see
      // the provenance note in `content/calculators/term-deposit.ts`, which
      // records that the source is a commercial database rather than Công báo.
      sources={C.sources}
      wide
    >
      {/* The next steps move INSIDE the tool, beside the answer. Still
          rendered from the page, so they ship no client JavaScript. */}
      <TermDepositCalculator
        actions={<ResultActions slug={SLUG} />}
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
