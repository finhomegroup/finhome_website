// A post's `date` as the reader sees it. No runtime imports, like posts.ts.

/**
 * `Post.date` (ISO `YYYY-MM-DD`) as a `<time>` value and a Vietnamese
 * `dd/mm/yyyy` label, or `null` when it is absent or not a real calendar day.
 *
 * The label is built from the string's own digits, never through `Date` in
 * the reader's timezone: `new Date("2026-09-30")` is UTC midnight, which a
 * browser west of UTC would print as 29/09. `Date.UTC` is used only to reject
 * impossible days such as 2026-02-30. Nothing here invents a date or an
 * "updated" timestamp; a post without a valid date shows none.
 */
export function postDate(date: string | undefined): { iso: string; label: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? "");
  if (!match) return null;
  const [, y, m, d] = match;
  const check = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (
    check.getUTCFullYear() !== Number(y) ||
    check.getUTCMonth() !== Number(m) - 1 ||
    check.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return { iso: `${y}-${m}-${d}`, label: `${d}/${m}/${y}` };
}
