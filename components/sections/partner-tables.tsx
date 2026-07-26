"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import {
  BUYER_JOURNEY,
  PARTNER_TOUCHPOINTS,
} from "@/content/partners-team";
import { Container } from "@/components/ui/container";
import { useMinWidthMd } from "@/lib/use-min-width-md";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Framer source: `Img container` on https://finhomegroup.framer.website/
 * — `perspective(1200px) rotateX(30deg → 0)` while scrolling.
 */
function TiltFlatOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isMd = useMinWidthMd();
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableTilt = isMd && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: ref,
    // Measured against Framer: max tilt while still below/mid view, flatten
    // as the block approaches the top of the viewport.
    offset: ["start end", "start 15%"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg)`;

  return (
    <div
      ref={ref}
      className="[perspective:1200px]"
      style={{ overflow: "visible" }}
    >
      <motion.div
        style={{
          transform: enableTilt ? transform : "none",
          transformOrigin: "center center",
          willChange: enableTilt ? "transform" : "auto",
        }}
        className="origin-center"
      >
        {children}
      </motion.div>
    </div>
  );
}

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

export function PartnerTables() {
  return (
    <section className="pb-12 pt-0 md:pb-16">
      <Container>
        <TiltFlatOnScroll>
          {/* Visual match to Framer's single dashboard image (1104×616 @1440). */}
          <img
            src="/images/partners-team/partner-dashboard.png"
            alt=""
            width={7281}
            height={4025}
            decoding="async"
            className="mx-auto block h-auto w-full max-w-[1104px]"
          />
        </TiltFlatOnScroll>
        <AccessibleDashboardTables />
      </Container>
    </section>
  );
}
