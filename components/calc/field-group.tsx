import { cn } from "@/lib/cn";

/**
 * A titled group of related fields — "Khoản vay", "Chi phí nhà" and so on.
 *
 * Renders a real `fieldset`/`legend`, which is what actually associates the
 * group's name with its fields for assistive technology. A styled `div` with
 * a heading would look identical and convey nothing.
 *
 * Untitled groups are allowed: single-field calculators need the spacing
 * without inventing a heading.
 */
export function FieldGroup({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      {title ? (
        <legend className="mb-3 font-display text-base font-medium text-ink">
          {title}
        </legend>
      ) : null}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
