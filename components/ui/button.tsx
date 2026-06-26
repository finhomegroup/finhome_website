import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  /** "lg" = 17px (header/hero CTA), default = 15px. */
  size?: "default" | "lg";
  className?: string;
};

/** Pill CTA button matching the Framer "Thử ngay" style. */
export function Button({
  href,
  children,
  variant = "primary",
  size = "default",
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 font-display font-medium leading-5 tracking-tight transition-[filter,background-color]",
        size === "lg" ? "text-[17px]" : "text-[15px]",
        variant === "primary" &&
          "btn-cta-surface text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-[0.97]",
        variant === "ghost" &&
          "border border-ink-4/40 text-ink hover:bg-ink/5",
        className
      )}
    >
      {children}
    </Link>
  );
}
