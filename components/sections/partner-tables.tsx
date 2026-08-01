import Link from "next/link";
import {
  BuyerJourneyTable,
  PartnerTouchpointsTable,
} from "@/components/brand-journey-tables";
import { PARTNER_CTA } from "@/content/partners-team";
import { cn } from "@/lib/cn";
import { FH_LINK_ARROW, FH_LINK_OPACITY } from "@/lib/interaction-styles";

function ViewOnVisionLink() {
  return (
    <Link
      href="/vision"
      className={cn(
        "group/link inline-flex items-center gap-2 font-display text-[15px] font-medium text-ink",
        FH_LINK_OPACITY,
      )}
    >
      {PARTNER_CTA.tablesCta}
      <svg
        viewBox="0 0 256 256"
        aria-hidden="true"
        className={cn("size-4 shrink-0 fill-current", FH_LINK_ARROW)}
      >
        <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
      </svg>
    </Link>
  );
}

/** Buyer-journey and partner-touchpoint tables, rendered inside the shared
 * `#doitac` viewport — the same live, readable tables used on the
 * "Tầm nhìn & Sứ mệnh" page, instead of a raster screenshot. */
export function PartnerTables() {
  return (
    <div className="space-y-10">
      <BuyerJourneyTable />
      <PartnerTouchpointsTable />
      <div className="text-center">
        <ViewOnVisionLink />
      </div>
    </div>
  );
}
