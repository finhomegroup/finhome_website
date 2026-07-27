"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BUYER_JOURNEY,
  PARTNER_TOUCHPOINTS,
} from "@/content/partners-team";
import { FH_POINTER, FH_CARD_IMAGE_ZOOM } from "@/lib/interaction-styles";

const DASHBOARD_SRC = "/images/partners-team/partner-dashboard.png";

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
 * Click to zoom: the raster is tiny at its default scale, so tapping it opens
 * a full-size lightbox instead of forcing users to squint. */
export function PartnerTables() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Xem bảng phóng to"
        className={`group mx-auto block w-full max-w-[1104px] ${FH_POINTER}`}
      >
        <img
          src={DASHBOARD_SRC}
          alt=""
          width={7281}
          height={4025}
          decoding="async"
          className={`mx-auto block h-auto max-h-[min(480px,calc(100dvh-22rem))] w-full object-contain ${FH_CARD_IMAGE_ZOOM}`}
        />
      </button>
      <AccessibleDashboardTables />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={BUYER_JOURNEY.title}
          >
            <motion.img
              src={DASHBOARD_SRC}
              alt=""
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[92vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
