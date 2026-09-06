import { cn } from "@/lib/cn";

/**
 * The white card every calculator's form and results sit in. Matches the card
 * styling already established in `app/delete-account/page.tsx`.
 *
 * Server component: no interactivity of its own.
 */
export function CalculatorCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
