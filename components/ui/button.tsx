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
        hasSwap && "relative overflow-hidden",
        size === "lg" ? "text-[17px]" : "text-[15px]",
        variant === "primary" &&
          cn(
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
