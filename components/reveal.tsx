"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

/**
 * Fade + slide-up when the element scrolls into view (once).
 * Skips the translate distance/duration/delay for `prefers-reduced-motion`.
 *
 * THE OPACITY HALF OF `initial` IS DELIBERATELY NOT HERE, and that is the whole
 * point of the `fh-reveal` class. `initial={{ opacity: 0 }}` server-renders
 * `style="opacity:0"`, which meant the content was invisible until JavaScript
 * ran — 93% of the homepage's visible text, measured on the built export. The
 * hidden state now lives in `app/globals.css` under `html.js`, set by an inline
 * script before this content is parsed, so:
 *
 *   - no JavaScript            -> the class is never added, content shows
 *   - the bundle fails to load -> same
 *   - JS runs then throws      -> the failsafe class appears on a watchdog
 *   - JavaScript works         -> identical to before, including the stagger
 *
 * `initial` KEEPS the y offset. That still server-renders a transform, and it
 * has to stay here because `delay` staggers siblings and that logic belongs
 * with the animation. A block rendered 24px low is readable; a block at zero
 * opacity is not. Only the invisibility needed to move.
 */
export function Reveal({ delay = 0, children, className, ...rest }: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={cn("fh-reveal", className)}
      initial={{ y: prefersReducedMotion ? 0 : 24 }}
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
