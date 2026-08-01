import {
  BuyerJourneyTable,
  PartnerTouchpointsTable,
} from "@/components/brand-journey-tables";

/** Buyer-journey and partner-touchpoint tables, rendered inside the shared
 * `#doitac` viewport — the same live, readable tables used on the
 * "Tầm nhìn & Sứ mệnh" page, instead of a raster screenshot. */
export function PartnerTables() {
  return (
    <div className="space-y-10">
      <BuyerJourneyTable />
      <PartnerTouchpointsTable />
    </div>
  );
}
