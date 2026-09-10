import type { Metadata } from "next";
import {
  CalculatorPage,
  calculatorMetadata,
} from "@/components/calc/calculator-page";
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
      // The risk figure rests entirely on one uncertain input, and a reader
      // should know that before they read the risk figure.
      notice={C.correlationNotice}
      prose={C.formula}
      faq={C.faq}
    >
      <AssetAllocationCalculator />
    </CalculatorPage>
  );
}
