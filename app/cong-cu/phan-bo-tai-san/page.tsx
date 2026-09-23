import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ResultActions } from "@/components/calc/result-actions";
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
      // §5: the three questions the form asks are the form's own labels; they
      // sit in the disclosure rather than above the first field.
      ledeDetail={C.ledeDetail}
      ledeDetailTitle={C.ledeDetailTitle}
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
      // ROW 58 is "Hai cột", and the tool now renders `columns="split"` with
      // the allocation bar in the result column and a six-column study table
      // in the full-width band. Both need the wider shell: the narrow one gave
      // the form column about 260 px on the other split routes in this batch.
      wide
    >
      {/* P2 placement, on the pattern `lai-suat-thuc-te` already ships: the
          first two destinations move beside the active mode's answer and the
          rest of the guidance stays after the figure. Unlike `intro` above,
          this slot is safe in both modes precisely because it is mode-neutral
          — the same two tools answer "what next" whichever question is on
          screen. Nothing is added or dropped: `next-steps.ts` holds the same
          three tools plus the education link, and `promoted` leaves the third
          and the link below. It used to arrive in `afterCalculator`, under the
          allocation bar and the detail band. */}
      {/* The one sentence that is NOT mode-neutral is the intro above the two
          tools. A browser round found the advanced study — which computes a
          drift in percentage points and no home-purchase figure — telling the
          reader that "hai câu hỏi tiếp theo dùng chính con số phân bổ cho tiền
          mua nhà". Both nodes are built here, because this page is a server
          component and cannot see the selected mode; the client component picks
          one for the same slot. Same two destinations, same labels, same
          position, and no data crosses between the modes. */}
      <AssetAllocationCalculator
        actions={<ResultActions slug={SLUG} />}
        studyActions={
          <ResultActions slug={SLUG} intro={C.purpose.studyStepsIntro} />
        }
        nextSteps={<ToolNextSteps slug={SLUG} promoted />}
      />
    </CalculatorPage>
  );
}
