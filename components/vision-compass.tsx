"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const LABELS: { text: string; className: string }[] = [
  { text: "Sứ mệnh", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
  { text: "Mục đích", className: "right-0 top-[20%] translate-x-1/4" },
  { text: "Nguyên tắc vận hành", className: "right-0 bottom-[8%] translate-x-1/4" },
  { text: "Giá trị cốt lõi", className: "left-[4%] bottom-0 -translate-x-1/4 translate-y-1/2" },
  { text: "Tầm nhìn", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

export function VisionCompass() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[380px] sm:max-w-[440px]"
    >
      <div className="absolute inset-[18%] rounded-full bg-brand-lime/25 blur-3xl" />

      <motion.div
        className="absolute inset-[6%] rounded-full border border-dashed border-black/10"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#95e678] to-[#46c670]" />
      </motion.div>

      <motion.div
        className="absolute inset-[20%] rounded-full border border-dashed border-black/10"
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute bottom-3 left-3 size-2 rounded-full bg-ink-4" />
      </motion.div>

      <div className="fh-badge-gradient absolute left-1/2 top-1/2 flex size-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white">
        <span className="font-display text-3xl font-medium">F</span>
      </div>

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
