"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { img } from "@/lib/images";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const LABELS: { text: string; className: string }[] = [
  { text: "Sứ mệnh", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
  { text: "Mục đích", className: "right-0 top-[20%] translate-x-0 sm:translate-x-1/4" },
  { text: "Nguyên tắc vận hành", className: "right-0 bottom-[8%] translate-x-0 sm:translate-x-1/4" },
  { text: "Giá trị cốt lõi", className: "left-0 bottom-[8%] translate-x-0 sm:-translate-x-1/4" },
  { text: "Tầm nhìn", className: "left-0 top-1/2 -translate-y-1/2 translate-x-0 sm:-translate-x-1/2" },
];

export function VisionCompass() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[380px] sm:max-w-[440px]"
    >
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-black/15"
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-[9%] overflow-hidden rounded-full">
        <motion.img
          src={img("/images/coUmQKEfHIE9dStD2mYlHgGoLmQ.avif")}
          alt=""
          className="size-full object-cover"
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <img
        src={img("/images/vision-compass-center.png")}
        alt=""
        className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2"
      />

      {LABELS.map((label) => (
        <span
          key={label.text}
          className={cn(
            "fh-badge-gradient absolute whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_2px_10px_rgba(23,171,72,0.25)] sm:px-4 sm:py-2 sm:text-sm",
            label.className,
          )}
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
