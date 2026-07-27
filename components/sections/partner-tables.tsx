import {
  BUYER_JOURNEY,
  PARTNER_TOUCHPOINTS,
} from "@/content/partners-team";

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

/** Partner dashboard image — rendered inside the shared `#doitac` viewport. */
export function PartnerTables() {
  return (
    <div>
      <img
        src="/images/partners-team/partner-dashboard.png"
        alt=""
        width={7281}
        height={4025}
        decoding="async"
        className="mx-auto block h-auto max-h-[min(480px,calc(100dvh-22rem))] w-full max-w-[1104px] object-contain"
      />
      <AccessibleDashboardTables />
    </div>
  );
}
