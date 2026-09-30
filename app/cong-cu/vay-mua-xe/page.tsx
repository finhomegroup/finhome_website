import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AutoLoanCalculator } from "@/components/auto-loan-calculator";
import { AutoLoanRelated } from "@/components/auto-loan-related";
import { getPost } from "@/content/posts";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "vay-mua-xe";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// The car page's next actions are car tools, and both sit off the P1/P2
// home-buying path `next-steps.ts` is guarded to, so they cannot go through
// `ToolNextSteps`/`ResultActions`. Resolved through the registry, as
// `thue-mua-xe` does: a slug that stops being a live route fails the build
// instead of shipping a dead link the page told the reader to follow.
const RELATED = C.relatedTools.items.map((item) => {
  const entry = getCalculator(item.slug);
  if (!entry || entry.status !== "live") {
    throw new Error(
      `app/cong-cu/${SLUG}/page.tsx: relatedTools "${item.slug}" is not a ` +
        `live calculator in the registry.`,
    );
  }
  return { ...item, href: `${calculatorPath(item.slug)}/`, title: entry.title };
});

// The article links (explainer and every named example's source) are checked
// the same way: a guide that moves or is retitled fails the build rather than
// leaving the tool naming an article that is not there.
for (const { href, title } of [
  { href: C.explainer.href, title: null },
  ...Object.values(C.namedExamples).map((e) => ({ href: e.articleHref, title: e.articleTitle })),
]) {
  const post = getPost(href.replace(/^\/blog\/|\/$/g, ""));
  if (!post || (title !== null && post.title !== title)) {
    throw new Error(`app/cong-cu/${SLUG}/page.tsx: "${href}" is not the article it names.`);
  }
}

/**
 * Migrated onto `CalculatorPage` in the P3 buyer-support unit.
 *
 * Original row 31 rewrote this page's results and its form, so its rendered
 * markup was moving anyway — which is the condition
 * `docs/calculator-suite-status.md` §3 sets for migrating one of the
 * pre-shell pages. The shell brings the disclaimer and the `usRules` wiring
 * under one owner and removes the hand-written header/footer/JSON-LD copy.
 *
 * 2026-09-26: the page is a standalone car tool. The home-path next-step
 * blocks are gone; `relatedTools` below is what follows the answer.
 */
export default function AutoLoanPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Above the calculator: a buyer should learn that the debt does not
      // depreciate with the car BEFORE they read a 60-month instalment off it.
      notice={C.depreciationNotice}
      noticeDetailTitle={C.scopeNoticeTitle}
      noticeDetail={C.scopeNotice}
      intro={C.table.intro}
      prose={C.formula}
      faq={C.faq}
      afterCalculator={<AutoLoanRelated related={RELATED} />}
      // The catalogue link, named for what it opens (journey review step 6).
      backLabel={C.hubLinkLabel}
      // ROW 33 is a "Hai cột" row and this tool now has eleven inputs, a
      // chart and a yearly schedule, so the card is widened. Unverified
      // visually — see the recap.
      wide
    >
      <AutoLoanCalculator />
    </CalculatorPage>
  );
}
