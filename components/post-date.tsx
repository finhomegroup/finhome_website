import { postDate } from "@/content/post-date";

/**
 * A post's publication date as a semantic `<time>`, or nothing at all when the
 * post has no valid date — no placeholder, no stray separator. Callers that
 * put a "·" beside it check `postDate()` themselves.
 */
export function PostDate({ date, className }: { date: string | undefined; className?: string }) {
  const value = postDate(date);
  if (!value) return null;
  return (
    <time dateTime={value.iso} className={className}>
      <span className="sr-only">Ngày đăng </span>
      {value.label}
    </time>
  );
}
