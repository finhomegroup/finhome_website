import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

/** Pill CTA button matching the Framer "Thử ngay" style. */
export function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
        variant === "primary" &&
          "bg-primary text-white hover:bg-primary/90",
        variant === "ghost" &&
          "border border-ink-4/40 text-ink hover:bg-ink/5",
        className
      )}
    >
      {children}
    </Link>
  );
}
