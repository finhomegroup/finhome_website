import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { paginationWindow } from "@/content/blog-pagination";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

const STEP_BUTTON = cn(
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ink-4/40 px-4 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green-ink disabled:pointer-events-none disabled:opacity-40",
  FOCUS,
  FH_POINTER,
);

/**
 * Page controls for the news feed. Two layouts from the same state:
 *
 * - Below `sm`: "Trước", "3 / 21", "Sau" — three items that fit a 320px
 *   screen with every target at least 44px.
 * - From `sm`: the bounded list from `paginationWindow` (first, last, current
 *   and its neighbours, at most seven slots) between the same two buttons.
 *
 * Every control goes through the caller's `onGo`, so topic, URL, history and
 * the loading/failure behaviour stay in `BlogPostGrid`. Prev/next are disabled
 * at the first/last page and while a page is loading.
 *
 * Deliberately NOT a "use client" entry: it is rendered only inside
 * `BlogPostGrid`, which is, so `onGo` never crosses a server boundary.
 */
export function BlogPagination({
  page,
  pageCount,
  loading,
  onGo,
}: {
  page: number;
  pageCount: number;
  loading: boolean;
  onGo: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Điều hướng trang"
      data-blog-pagination="true"
      className="mt-12 flex w-full items-center justify-between gap-2 sm:justify-center"
    >
      <button
        type="button"
        onClick={() => onGo(page - 1)}
        disabled={page <= 1 || loading}
        aria-label="Trang trước"
        className={STEP_BUTTON}
      >
        Trước
      </button>

      <p className="min-w-0 text-center text-sm text-ink-2 tabular-nums sm:hidden" aria-live="polite">
        <span className="sr-only">Trang </span>
        <span className="font-medium text-ink">{page}</span>
        <span aria-hidden="true"> / </span>
        <span className="sr-only"> trên </span>
        {pageCount}
      </p>

      <ol className="hidden items-center gap-1 sm:flex">
        {paginationWindow(page, pageCount).map((slot, index) =>
          slot === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="inline-flex min-w-8 justify-center text-sm text-ink-3">
              …
            </li>
          ) : (
            <li key={slot}>
              <button
                type="button"
                onClick={() => onGo(slot)}
                disabled={loading}
                aria-label={`Trang ${slot}`}
                aria-current={slot === page ? "page" : undefined}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none",
                  FOCUS,
                  FH_POINTER,
                  slot === page
                    ? "bg-brand-green-ink text-white"
                    : "text-ink-2 hover:bg-brand-green/10",
                )}
              >
                {slot}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => onGo(page + 1)}
        disabled={page >= pageCount || loading}
        aria-label="Trang sau"
        className={STEP_BUTTON}
      >
        Sau
      </button>
    </nav>
  );
}
