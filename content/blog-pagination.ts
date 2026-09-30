export const BLOG_PAGE_SIZE = 9;

/** One slot in the desktop page list: a page number, or a gap ("…"). */
export type PageSlot = number | "gap";

/**
 * The bounded page list for the news feed on wider screens: always the first
 * and last page, the current page and one either side, with a gap wherever
 * pages are skipped. At most seven slots whatever `pageCount` is, so the row
 * cannot outgrow its container (it used to render every page: 21 buttons at
 * 390px pushed "Trước" to x=-88). A gap that would hide a single page shows
 * that page instead, since a "…" takes the same room.
 *
 * Pure and import-free: api/blog-posts.ts loads this module as native ESM.
 */
export function paginationWindow(page: number, pageCount: number): PageSlot[] {
  const last = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), last);
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  // Keep a run of five at either end so the list length stays constant.
  let start = Math.max(2, current - 1);
  let end = Math.min(last - 1, current + 1);
  if (current <= 4) {
    start = 2;
    end = 5;
  } else if (current >= last - 3) {
    start = last - 4;
    end = last - 1;
  }

  const slots: PageSlot[] = [1];
  if (start > 2) slots.push("gap");
  for (let n = start; n <= end; n++) slots.push(n);
  if (end < last - 1) slots.push("gap");
  slots.push(last);
  return slots;
}
