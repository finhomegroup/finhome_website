import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { LongTermViews } from "@/components/calc/long-term-views";
import { RenderBoundary } from "@/components/calc/render-boundary";
import { RetirementGranaryHero } from "@/components/retirement-granary-hero";
import { RetirementPlanCalculator } from "@/components/retirement-plan-calculator";
import { RetirementPlanState } from "@/components/retirement-plan-state";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const SLUG = "ke-hoach-huu-tri";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

export default function RetirementPlanPage() {
  // ONE plan behind two islands: the hero under the `h1` and the calculator
  // in the page body. The provider holds the field state for both and adds
  // no DOM; the shell and its prose stay server-rendered inside it.
  return (
    <RetirementPlanState>
      <CalculatorPage
        slug={SLUG}
        metaTitle={C.metaTitle}
        metaDescription={C.metaDescription}
        title={C.pageTitle}
        lede={C.lede}
        ledeDetailTitle={C.ledeDetailTitle}
        ledeDetail={C.ledeDetail}
        // A nominal balance is not purchasing power — the most common error in
        // a long-horizon projection — so the LIMITATION stays visible above the
        // form, in words. The demonstration with the reader's own figures now
        // sits under the result, where the 2026-09-26 review asked for it, and
        // is filled by the calculator from the live plan rather than quoted
        // from the default scenario. See the docstring on `realNotice`.
        notice={C.realNotice}
        // It teaches how to read the numbers; it does not warn. Neutral, so it
        // cannot be read as a second error beside the red "Chưa đủ" card.
        noticeTone="info"
        // The eleven-field form and the trajectory figure need the 40/60 split,
        // which `max-w-3xl` cannot hold. Widens the TOOL only; the prose, the
        // FAQ and both notices keep their reading measure.
        wide
        // `prose.emphasis` is threaded by the shell through `ProseText`, so the
        // paragraph stays one plain string and the phrases stay data beside it.
        // `prose.detail` is the full method behind a labelled disclosure — the
        // third layer of the 2026-09-26 rewrite, rendered plain.
        // The other three views of the plan, AFTER the tool: between the result
        // and its chart they invited the reader away before any choice was
        // made — and those pages open on other defaults, some fields per year.
        afterCalculator={
          <LongTermViews current="trajectory" compact={C.otherTools} className="mt-10" />
        }
        prose={C.formula}
        faq={C.faq}
        // This route's own defaults are the latest Vietnamese figures; the
        // sources section names each one with its date (content: `sources`).
        sources={C.sources}
        // The other three views of the SAME plan. It MOVED 2026-09-21 out of
        // `afterCalculator` and into the tool's own result column, and then into
        // the `actions` slot — directly under the verdict and BEFORE the figure,
        // which is what P2 asks for. Passed whole: four views is the property
        // `LongTermViews` calls load-bearing, and it is a short nav, not prose.
        // Still rendered from the page, so it still ships no client JavaScript.
        //
        // Not duplicated: `afterCalculator` is now unused on this route, so the
        // control appears exactly once.
        // This page's own: it opens on its own dated assumptions and asks the
        // two incomes per month, so the plan-wide "dùng chung một bộ giả định"
        // is not true of it. It keeps the opening clause `check:markup` counts.
        disclaimer={C.disclaimer}
        // The tool-first hero (docs §1c): the verdict card, the granary and the
        // three levers, straight after the `h1`. Optional by construction — if
        // it fails, it renders nothing and the calculator below is unchanged.
        hero={
          <RenderBoundary>
            <RetirementGranaryHero />
          </RenderBoundary>
        }
      >
        <RetirementPlanCalculator />
      </CalculatorPage>
    </RetirementPlanState>
  );
}
