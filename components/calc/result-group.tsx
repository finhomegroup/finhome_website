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
 *
 * `live` defaults to true and exists to be turned OFF. A group holding many
 * rows — a side-by-side comparison of three loans, a per-year breakdown — is
 * table-shaped, and announcing every cell of it on each keystroke is the same
 * failure mode `ResultTable` avoids by not being live at all. When a page has
 * both, keep exactly one live group: the summary.
 */
export function ResultGroup({
  title,
  className,
  live = true,
  children,
}: {
  title: string;
  className?: string;
  /** Set false for a group with many rows; see the note above. */
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl bg-bg-soft p-5", className)}>
      <h2 className="font-display text-base font-medium text-ink">{title}</h2>
      <div
        className="mt-2"
        aria-live={live ? "polite" : undefined}
        // A stable hook for scripts/check-built-markup.mjs. The count of
        // `aria-live="polite"` in a page is not the thing the convention is
        // about — NumberField gives every help paragraph one — so counting
        // those cannot distinguish a legitimate page from a broken one. This
        // attribute marks exactly the live RESULTS region, and there must be
        // one per page.
        data-results-live={live ? "true" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
