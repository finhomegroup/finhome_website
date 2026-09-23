import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { Us401kCalculator } from "@/components/us-401k-calculator";
import { US_401K as C } from "@/content/calculators/us-401k";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "gop-401k";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// The cross-link to `toi-da-401k` is resolved through the registry rather
// than written out, so a slug that stops being a live route fails the build
// instead of shipping a dead link the page told the reader to follow. Same
// contract as `components/calc/tool-next-steps.tsx`, which cannot be used
// here: its content file forbids an entry on a library-shelved row.
const RELATED = getCalculator(C.relatedTool.slug);
if (!RELATED) {
  throw new Error(
    `app/cong-cu/${SLUG}/page.tsx: relatedTool "${C.relatedTool.slug}" is ` +
      `not in the registry.`,
  );
}
const RELATED_TITLE = RELATED.title;
const RELATED_HREF = `${calculatorPath(C.relatedTool.slug)}/`;

export default function Us401kPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // The forfeited match, and what it costs to stop forfeiting it. This
      // is the one thing a reader should take away even if they read nothing
      // else on the page.
      notice={C.forfeitNotice}
      // The rule stays above; the worked default case behind this summary.
      noticeDetailTitle={C.forfeitNoticeDetailTitle}
      noticeDetail={C.forfeitNoticeDetail}
      // Row 48's split result side needs the wider tool box.
      wide
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
    >
      {/* THE LINK MOVED, NOTHING ELSE. It was `afterCalculator`, which renders
          below the full-width detail band: an independent review measured the
          gap from the end of the result region at 2611,5 px on mobile and
          2286,5 px on desktop. Same destination, same title and context copy,
          now in the calculator's near-answer `actions` slot — the audit's
          "1–2 hành động ngay sau câu trả lời". The surface matches
          `ResultActions` so the two idioms read as one, and it carries the
          same `data-calc-actions` hook. */}
      <Us401kCalculator
        actions={
          <section
            data-calc-actions="near-answer"
            className="mt-6 rounded-2xl bg-bg-soft p-5"
          >
            <h2 className="font-display text-base font-medium text-ink">
              {C.relatedTool.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {C.relatedTool.why}
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              <Link
                href={RELATED_HREF}
                className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
              >
                {RELATED_TITLE}
              </Link>
            </p>
          </section>
        }
      />
    </CalculatorPage>
  );
}
