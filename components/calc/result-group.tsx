import { cn } from "@/lib/cn";

/**
 * The results panel of a calculator, and the single `aria-live` region for
 * everything inside it.
 *
 * One region per group, never one per row: a screen reader should announce a
 * recomputation once, not once per output. The per-row `aria-atomic` on
 * `ResultRow` is what makes each announcement carry its own label.
 *
 * `title` renders as an `h2`, which suits every current page — the calculator
 * sits under the page `h1` alongside the prose sections.
 */
export function ResultGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl bg-bg-soft p-5", className)}>
      <h2 className="font-display text-base font-medium text-ink">{title}</h2>
      <div className="mt-2" aria-live="polite">
        {children}
      </div>
    </div>
  );
}
