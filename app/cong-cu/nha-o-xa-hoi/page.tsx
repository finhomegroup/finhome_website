import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { AffordabilityCalculator } from "@/components/affordability-calculator";
import { SocialHousingConditions } from "@/components/social-housing-conditions";
import { SOCIAL_HOUSING as C } from "@/content/calculators/social-housing";

const SLUG = "nha-o-xa-hoi";

export const metadata: Metadata = calculatorMetadata({
  slug: SLUG,
  metaTitle: C.metaTitle,
  metaDescription: C.metaDescription,
});

/**
 * A SECOND ROUTE onto the affordability tool, not a second form.
 *
 * `nhà ở xã hội` was the widest gap in the product for the audience the
 * education collection names in its own subtitle: it appears in 34 news posts
 * under `content/posts/` and, before this route, in zero calculators and zero
 * articles. A reader who learned from a news post that a 1,1 tỷ project had
 * opened nearby had nowhere on the site to find out what it would cost them
 * under the subsidised programme.
 *
 * The financial model is unchanged — `computeAffordability`, the same engine
 * the commercial route uses. What this route changes is three opening values
 * and the three help strings that describe them, per the thirteenth unit's
 * convention: the second route keeps its own URL, title, notice, prose and FAQ,
 * and its content file holds NO form strings, so the two cannot drift.
 *
 * The rate gap is the whole point: 5,4%/năm here against the 8,5%/năm the
 * education collection assumes throughout. Over 20 years that is a different
 * answer, not a nearby one.
 *
 * WHAT THIS ROUTE DELIBERATELY DOES NOT DO. Three conditions govern
 * eligibility and only the income test is arithmetic; `SocialHousingConditions`
 * renders the other two as a checklist the reader confirms. The notice above
 * the calculator says so before any figure is visible, because a reader who
 * takes a computed tầm giá as an eligibility verdict has been misled by this
 * page rather than by their own optimism.
 */
export default function SocialHousingPage() {
  return (
    <CalculatorPage
      slug={SLUG}
      metaTitle={C.metaTitle}
      metaDescription={C.metaDescription}
      title={C.pageTitle}
      lede={C.lede}
      // One of three conditions is computable here. That belongs ABOVE the
      // tool, not under it.
      notice={C.notice}
      prose={C.formula}
      faq={C.faq}
      sources={C.sources}
      afterCalculator={
        <>
          <SocialHousingConditions />
          <ToolNextSteps slug={SLUG} />
        </>
      }
    >
      <AffordabilityCalculator programme="social-housing" />
    </CalculatorPage>
  );
}
