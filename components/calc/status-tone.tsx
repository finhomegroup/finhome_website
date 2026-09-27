import type { ResultTone } from "@/lib/calc/result-status";
import { cn } from "@/lib/cn";

/**
 * The one place a result TONE becomes a colour and a shape.
 *
 * Every presenter — the result card, the pinned CTA's chip, a chart's
 * annotation list — reads these maps, so "shortfall" cannot be red in one
 * place and orange in another. The tokens are in `app/globals.css` and their
 * contrast ratios are pinned by `result-status-contrast.test.ts`.
 *
 * COLOUR IS NEVER THE ONLY CHANNEL. Each tone has its own icon SHAPE
 * (triangle, check, circle-bang, circle-i), and every caller renders the
 * tone's WORD beside it; the icon is decorative to assistive technology
 * because the word already says what it means.
 */

/** Ink for the tone's label, title and icon. Neutral is the existing ink-2. */
export const TONE_INK: Record<ResultTone, string> = {
  shortfall: "text-status-shortfall",
  met: "text-status-met",
  caution: "text-status-caution",
  unknown: "text-ink-2",
};

/** The card surface. The border is decoration; the icon and word carry it. */
export const TONE_SURFACE: Record<ResultTone, string> = {
  shortfall: "border-status-shortfall/30 bg-status-shortfall-bg",
  met: "border-status-met/30 bg-status-met-bg",
  caution: "border-status-caution/30 bg-status-caution-bg",
  unknown: "border-ink-4/40 bg-white",
};

/** An 18px-grid glyph per tone. `currentColor`, so it takes the tone's ink. */
export function StatusIcon({
  tone,
  className,
}: {
  tone: ResultTone;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      className={cn("size-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tone === "shortfall" ? (
        <>
          <path d="M10 2.5 18.5 17h-17z" />
          <path d="M10 8v4" />
          <path d="M10 14.6v.1" />
        </>
      ) : tone === "met" ? (
        <>
          <circle cx={10} cy={10} r={8} />
          <path d="m6.2 10.3 2.6 2.6 5-5.4" />
        </>
      ) : tone === "caution" ? (
        <>
          <circle cx={10} cy={10} r={8} />
          <path d="M10 5.8v5" />
          <path d="M10 13.9v.1" />
        </>
      ) : (
        <>
          <circle cx={10} cy={10} r={8} />
          <path d="M10 9.2v5" />
          <path d="M10 6.1v.1" />
        </>
      )}
    </svg>
  );
}
