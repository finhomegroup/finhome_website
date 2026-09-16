import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { AutoLeaseCalculator } from "@/components/auto-lease-calculator";
import { AUTO_LEASE as C } from "@/content/calculators/auto-lease";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";

const SLUG = "thue-mua-xe";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

// The cross-link to `vay-mua-xe` is resolved through the registry rather than
// written out, so a slug that stops being a live route fails the build instead
// of shipping a dead link the page told the reader to follow. Same contract as
// `components/calc/tool-next-steps.tsx`, which cannot be used here: this row
// is shelved under `tien-ich`, and `next-steps.ts`'s test forbids an entry on
// a library-shelved row and requires a P1/P2 destination, while `vay-mua-xe`
// is P3. Both guards exist to keep a home-buying funnel off this page, so the
// link is built the way rows 46/47 build theirs.
const RELATED = getCalculator(C.relatedTool.slug);
if (!RELATED) {
  throw new Error(
    `app/cong-cu/${SLUG}/page.tsx: relatedTool "${C.relatedTool.slug}" is ` +
      `not in the registry.`,
  );
}
const RELATED_HREF = `${calculatorPath(C.relatedTool.slug)}/`;
const RELATED_TITLE = RELATED.title;

export default function AutoLeasePage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // Visible: who this product is actually available to in Vietnam, named
      // decree and all, and the two end-of-contract fees the tool does not
      // model — both of which change how `totalCost` should be read. The
      // ownership question and the loan comparison are the disclosure under
      // it, because ownership depends on the contract; see `auto-lease.ts`.
      notice={C.contextNotice}
      noticeDetail={C.contextDetail}
      noticeDetailTitle={C.contextDetailTitle}
      afterCalculator={
        <section>
          <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
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
      prose={C.formula}
      faq={C.faq}
      // The tax field prefills 0, which is a legal conclusion rather than an
      // arithmetic default — `không chịu thuế GTGT` for a genuine finance
      // lease — so the decrees behind it have to be openable rather than only
      // named in the help text. See the `sources` comment in `auto-lease.ts`.
      sources={C.sources}
    >
      <AutoLeaseCalculator />
    </CalculatorPage>
  );
}
