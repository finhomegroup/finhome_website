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
 *
 * `anchorId` makes the group the destination of `ResultCta`, and it is what
 * turns "scroll somewhere near the answer" into "land on the answer, with the
 * answer announced". Three things arrive together and all three are needed:
 *
 * - the `id`, so the CTA can find it;
 * - `tabIndex={-1}`, so it can take programmatic focus without becoming a tab
 *   stop for a reader who is simply moving through the page;
 * - `aria-labelledby` on its own `h2`, because focusing an unlabelled `div`
 *   announces nothing. With it, arriving reads "Kết quả kế hoạch" and then the
 *   rows, which is the point of moving focus rather than only scrolling.
 *
 * The heading id is DERIVED from `anchorId` rather than generated. `useId`
 * would make this a client component for no reason, and a derived id cannot
 * drift from the `id` the CTA was given.
 */
export function ResultGroup({
  title,
  className,
  live = true,
  anchorId,
  children,
}: {
  title: string;
  className?: string;
  /** Set false for a group with many rows; see the note above. */
  live?: boolean;
  /** Set on the ONE group `ResultCta` points at. See the note above. */
  anchorId?: string;
  children: React.ReactNode;
}) {
  const titleId = anchorId ? `${anchorId}-title` : undefined;

  return (
    <div
      id={anchorId}
      tabIndex={anchorId ? -1 : undefined}
      aria-labelledby={titleId}
      className={cn(
        "rounded-2xl bg-bg-soft p-5",
        // `scroll-mt-*` keeps the heading clear of the viewport edge when the
        // CTA scrolls here; the focus ring is visible because this element
        // does take focus, even though it is never tabbed to.
        anchorId &&
          "scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
        className,
      )}
    >
      <h2 id={titleId} className="font-display text-base font-medium text-ink">
        {title}
      </h2>
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
