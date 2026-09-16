import { cn } from "@/lib/cn";

/**
 * Optional detail, collapsed.
 *
 * The browser check measured the mortgage page's first input 1067 px down a
 * 390 px-wide viewport and its chart at 4030 px — over a screen of prose
 * before the form, and many screens of result rows and tables before the
 * picture. The intended sequence is short purpose → core inputs → one clear
 * answer → chart → next step, with everything else available but not in the
 * way.
 *
 * This is the "everything else": detail ledgers, year tables, formulas, long
 * caveats. A native `<details>` so it needs no JavaScript, is keyboard
 * operable, and is reachable by find-in-page in browsers that expand on match.
 *
 * A server component — `<details>` has no state to own. Distinct from
 * `AdvancedFields`, which holds INPUTS and must announce what is active
 * inside it; this one holds output a reader may never need.
 */
export function DetailDisclosure({
  title,
  hint,
  className,
  children,
}: {
  /** What is inside, e.g. "Xem chi tiết khoản vay". */
  title: string;
  /** One short line under the title, when the contents need framing. */
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <details className={cn("rounded-2xl border border-ink-4/20 p-4", className)}>
      <summary className="cursor-pointer list-item">
        <span className="font-display text-base font-medium text-ink">
          {title}
        </span>
        {hint ? (
          <span className="mt-1 block text-sm font-normal leading-relaxed text-ink-3">
            {hint}
          </span>
        ) : null}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
