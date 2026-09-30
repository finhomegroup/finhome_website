import { cn } from "@/lib/cn";

/**
 * The white card every calculator's form and results sit in. Matches the card
 * styling already established in `app/delete-account/page.tsx`.
 *
 * `compact` (opt-in, the two living-infographic pilots only): 12 px padding
 * below `sm`, the usual 24/32 px from `sm`. A 320 px browser pass found the
 * card + learning panel + figure padding leaving 171 px for the figure.
 * Every other calculator keeps the default.
 *
 * Server component: no interactivity of its own.
 */
export function CalculatorCard({
  className,
  compact = false,
  children,
}: {
  className?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-4/15 bg-white shadow-sm",
        compact ? "p-3 sm:p-6 md:p-8" : "p-6 md:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
