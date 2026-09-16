"use client";

import { AprCalculator } from "@/components/apr-calculator";

/**
 * /cong-cu/apr-nang-cao/ — the SAME tool, opened at its detailed mode.
 *
 * Not a second calculator. The original plan row asked for the advanced view
 * to be consolidated into the APR tool while keeping this URL, and an
 * independent review was right that two separate pages joined by a cross-link
 * were not that: a reader who had typed their loan into the basic page had to
 * retype it here.
 *
 * So this route renders `AprCalculator` at `initialMode="advanced"` and the
 * mode is a control on the page. The URL, its metadata, its prose and its FAQ
 * are still this route's own — see `app/cong-cu/apr-nang-cao/page.tsx` — and
 * arriving here from the other route still starts from this page's defaults,
 * which the copy states rather than implying the figures travel.
 */
export function AprAdvancedCalculator() {
  return <AprCalculator initialMode="advanced" />;
}
