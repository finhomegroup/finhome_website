import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { AssetAllocationCalculator } from "@/components/asset-allocation-calculator";
import { ASSET_ALLOCATION as C } from "@/content/calculators/asset-allocation";

const SLUG = "phan-bo-tai-san";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function AssetAllocationPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // WHAT THE TOOL DOES AND DOES NOT DO comes first. Original row 56's
      // failure mode is a reader taking a generic portfolio mix as advice for
      // money they need in twelve months, so the boundary — allocates money
      // you have, recommends no product — is the top notice. The
      // correlation caveat belongs to the advanced study and is stated
      // inside it and in the prose.
      notice={C.scopeNotice}
      noticeDetailTitle={C.scopeNoticeDetailTitle}
      noticeDetail={C.scopeNoticeDetail}
      // NO `intro` ON THIS ROUTE. The page-level slot is server-rendered and
      // cannot see which mode the reader selected, and both modes have now
      // been caught borrowing the other's explanation through it. First this
      // slot carried the portfolio study's volatility note under the purpose
      // form; then the replacement purpose paragraph ("phần đã phân bổ, phần
      // chưa phân bổ và phần còn thiếu") stayed visible in advanced mode,
      // where no allocation bar or shortfall table exists. Mode-local
      // guidance now lives INSIDE the mode, in the client component.
      prose={C.formula}
      faq={C.faq}
      // The shared disclaimer assumes an interest rate and a return; the
      // default mode here has neither. See the content file.
      disclaimer={C.disclaimer}
      afterCalculator={<ToolNextSteps slug={SLUG} />}
    >
      <AssetAllocationCalculator />
    </CalculatorPage>
  );
}
