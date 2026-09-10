"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export type SelectOption = {
  /** Stored value. */
  value: string;
  /** Visible Vietnamese label. */
  label: string;
};

/**
 * A labelled `<select>`.
 *
 * Mirrors `NumberField`'s accessibility contract so the two compose without a
 * calculator author having to remember which one wires what: `useId` derives
 * the `id`/`htmlFor` pair and the help paragraph's id, and `aria-describedby`
 * points at it. There is no validation state — a select cannot hold an invalid
 * value, so it needs neither `aria-invalid` nor a live region.
 *
 * A native `<select>` rather than a custom listbox: it is keyboard-accessible,
 * screen-reader-correct and uses the platform picker on mobile for free.
 */
export function SelectField({
  label,
  help,
  options,
  value,
  onValueChange,
}: {
  label: string;
  help?: string;
  options: readonly SelectOption[];
  value: string;
  onValueChange: (next: string) => void;
}) {
  const id = useId();
  const helpId = `${id}-help`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-base font-medium text-ink"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-describedby={help ? helpId : undefined}
        className={cn(
          "mt-3 w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
          "focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {help ? (
        <p id={helpId} className="mt-2 text-sm leading-relaxed text-ink-3">
          {help}
        </p>
      ) : null}
    </div>
  );
}
