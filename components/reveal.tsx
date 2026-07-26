"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

/** Fade + slide-up when the element scrolls into view (once).
 * Skips the translate distance/duration/delay for `prefers-reduced-motion`. */
export function Reveal({ delay = 0, children, ...rest }: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: "easeOut",
        delay: prefersReducedMotion ? 0 : delay,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
