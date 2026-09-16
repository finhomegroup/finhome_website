import Link from "next/link";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

const SWAP_MS = "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Matches Button `leading-5` — one line box for scroll clip */
const LINE_H = "h-5";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  /** Hover label swap (Framer header CTA: Thử ngay → Tải xuống). */
  hoverLabel?: string;
  variant?: "primary" | "ghost";
  /** "lg" = 17px (header/hero CTA), default = 15px. */
  size?: "default" | "lg";
  className?: string;
};

function SwapLabel({
  label,
  hoverLabel,
}: {
  label: React.ReactNode;
  hoverLabel: string;
}) {
  const labelText = typeof label === "string" ? label : String(label);
  const sizeText =
    hoverLabel.length > labelText.length ? hoverLabel : labelText;

  const lineClass = cn(
    LINE_H,
    "flex shrink-0 items-center justify-center whitespace-nowrap leading-5",
  );

  return (
    <span className="relative inline-block leading-5">
      {/* Width anchor */}
      <span className="invisible block whitespace-nowrap leading-5" aria-hidden>
        {sizeText}
      </span>
      <span
        className={cn(
          "absolute inset-x-0 top-0 overflow-hidden",
          LINE_H,
        )}
      >
        <span
          className={cn(
            "flex flex-col",
            "transition-transform motion-reduce:transition-none",
            SWAP_MS,
            "group-hover/btn:-translate-y-5",
          )}
        >
          <span className={lineClass}>{label}</span>
          <span className={lineClass} aria-hidden>
            {hoverLabel}
          </span>
        </span>
      </span>
    </span>
  );
}

/** Pill CTA button matching the Framer "Thử ngay" style. */
export function Button({
  href,
  children,
  hoverLabel,
  variant = "primary",
  size = "default",
  className,
}: ButtonProps) {
  const hasSwap = Boolean(hoverLabel);

  return (
    <Link
      href={href}
      className={cn(
        "group/btn inline-flex items-center justify-center rounded-full px-5 py-2.5 font-display font-medium leading-5 tracking-tight",
        FH_POINTER,
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
        hasSwap && "relative overflow-hidden",
        size === "lg" ? "text-[17px]" : "text-[15px]",
        variant === "primary" &&
          cn(
            // WHITE TEXT IS THE FIXED POINT HERE; the surface moved to earn it.
            //
            // White on the originally sampled gloss (#79ca87 -> #3cb14f ->
            // #84d86e) measured 2.01:1 in a browser on 2026-09-16 where these
            // glyphs actually fall, and 1.75:1 for the hover label, against the
            // 4.5:1 this 17px type needs — it failed even the 3:1 that large
            // text is allowed, and the gloss's own darkest stop only reached
            // 2.76:1, so no part of that surface could carry white.
            //
            // Dark ink on the unchanged gloss was the other way to comply. It
            // was rendered side by side and rejected: white-on-green is the
            // logo's idiom and worth keeping. So `btn-cta-surface` was darkened
            // instead — see `app/globals.css`, where every stop now sits at or
            // under a relative luminance of 0.167, putting the surface between
            // 4.84:1 and 7.84:1.
            //
            // THE PAIRING IS WHAT MATTERS, not either half alone. `text-white`
            // is only correct here as long as that class stays dark, and
            // re-sampling the gloss from the mirror would quietly return it to
            // ~2:1 — which is why `components/ui/brand-contrast.test.ts`
            // recomputes white against every one of its stops on each run.
            "btn-cta-surface text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
            !hasSwap &&
              "transition-[filter,background-color] hover:brightness-[0.97]",
            hasSwap &&
              "transition-[box-shadow,background-color] hover:shadow-[0_4px_16px_rgba(64,179,84,0.35)]",
          ),
        variant === "ghost" &&
          "border border-ink-4/40 text-ink transition-[background-color] hover:bg-ink/5",
        className,
      )}
    >
      {hoverLabel ? (
        <SwapLabel label={children} hoverLabel={hoverLabel} />
      ) : (
        children
      )}
    </Link>
  );
}
