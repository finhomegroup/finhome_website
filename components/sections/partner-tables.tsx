import Link from "next/link";
import {
  BUYER_JOURNEY,
  PARTNER_TOUCHPOINTS,
} from "@/content/partners-team";
import { FH_POINTER, FH_CARD_IMAGE_ZOOM } from "@/lib/interaction-styles";

const DASHBOARD_SRC = "/images/partners-team/partner-dashboard.png";
const DASHBOARD_HREF = "/tam-nhin-su-menh";

/** Screen-reader copy of the dashboard data (visual UI is the Framer raster). */
function AccessibleDashboardTables() {
  return (
    <div className="sr-only">
      <h2>{BUYER_JOURNEY.title}</h2>
      <table>
        <caption>{BUYER_JOURNEY.title}</caption>
        <thead>
          <tr>
            <th scope="col">Giai đoạn</th>
            {BUYER_JOURNEY.stages.map((stage) => (
              <th key={stage.label} scope="col">
                {stage.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BUYER_JOURNEY.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{PARTNER_TOUCHPOINTS.title}</h2>
      <table>
        <caption>{PARTNER_TOUCHPOINTS.title}</caption>
        <thead>
          <tr>
            <th scope="col">Đối tác</th>
            {PARTNER_TOUCHPOINTS.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PARTNER_TOUCHPOINTS.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.states.map((checked, i) => (
                <td key={i}>
                  {checked ? "Có điểm chạm" : "Không có điểm chạm"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Partner dashboard image — rendered inside the shared `#doitac` viewport.
 * Links through to the full "Tầm nhìn & Sứ mệnh" page, which renders this
 * same data as real, readable tables instead of a raster the user has to
 * zoom into. */
export function PartnerTables() {
  return (
    <div>
      <Link
        href={DASHBOARD_HREF}
        aria-label="Xem chi tiết hành trình và điểm chạm đối tác"
        className={`group mx-auto block w-full ${FH_POINTER}`}
      >
        <img
          src={DASHBOARD_SRC}
          alt=""
          width={7281}
          height={4025}
          decoding="async"
          className={`mx-auto block h-auto w-full object-contain ${FH_CARD_IMAGE_ZOOM}`}
        />
      </Link>
      <AccessibleDashboardTables />
    </div>
  );
}
