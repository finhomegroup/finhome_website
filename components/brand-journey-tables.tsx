import { BUYER_JOURNEY, PARTNER_TOUCHPOINTS } from "@/content/partners-team";
import { cn } from "@/lib/cn";

const TOUCHPOINT_ICONS: Record<string, string> = {
  "Dữ liệu tự nhập": "/images/partners-team/partner-person.svg",
  "Nguồn công khai": "/images/partners-team/partner-shield.svg",
  "Mô hình tính toán": "/images/partners-team/partner-settings.svg",
  "AI Research": "/images/partners-team/partner-chat.svg",
};

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_1px_20px_rgba(0,0,0,0.03)]">
      {children}
    </div>
  );
}

export function BuyerJourneyTable() {
  return (
    <figure>
      <figcaption className="fh-h3 px-1 pb-4 text-center">
        {BUYER_JOURNEY.title}
      </figcaption>
      <TableShell>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="bg-bg-soft">
              <th scope="col" className="w-[160px] px-5 py-4" />
              {BUYER_JOURNEY.stages.map((stage) => (
                <th key={stage.label} scope="col" className="px-5 py-4 align-bottom">
                  <div className="flex items-center gap-2.5">
                    <img src={stage.icon} alt="" aria-hidden="true" className="size-8 shrink-0" />
                    <span className="font-display text-[15px] font-medium text-ink">
                      {stage.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUYER_JOURNEY.rows.map((row) => (
              <tr key={row.label} className="border-t border-black/5">
                <th
                  scope="row"
                  className="px-5 py-4 align-top font-display text-[15px] font-medium text-ink"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, i) => (
                  <td
                    key={i}
                    className="px-5 py-4 align-top text-sm leading-relaxed text-ink-2"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </figure>
  );
}

function TouchpointToggle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full",
        checked ? "bg-gradient-to-r from-[#3ea84e] to-[#90d77b]" : "bg-ink-4/25",
      )}
    >
      <span
        className={cn(
          "absolute size-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[19px]" : "translate-x-1",
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{checked ? "Có điểm chạm" : "Không có điểm chạm"}</span>
    </span>
  );
}

export function PartnerTouchpointsTable() {
  return (
    <figure>
      <figcaption className="fh-h3 px-1 pb-4 text-center">
        {PARTNER_TOUCHPOINTS.title}
      </figcaption>
      <TableShell>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-bg-soft">
              <th scope="col" className="w-[200px] px-5 py-4" />
              {PARTNER_TOUCHPOINTS.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-4 font-display text-[15px] font-medium text-ink"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARTNER_TOUCHPOINTS.rows.map((row) => (
              <tr key={row.label} className="border-t border-black/5">
                <th scope="row" className="px-5 py-4 text-sm text-ink">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={TOUCHPOINT_ICONS[row.label]}
                      alt=""
                      aria-hidden="true"
                      className="size-6 shrink-0"
                    />
                    {row.label}
                  </div>
                </th>
                {row.states.map((checked, i) => (
                  <td key={i} className="px-5 py-4">
                    <TouchpointToggle checked={checked} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </figure>
  );
}
