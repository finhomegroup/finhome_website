"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

export type RadioOption = {
  value: string;
  label: string;
};

/**
 * A group of mutually exclusive choices.
 *
 * A real `<fieldset>`/`<legend>` wrapping native radios, not a styled button
 * group: the legend is what names the group for assistive technology, and
 * native radios give arrow-key navigation within the group and a single tab
 * stop for free. Both are things a div-and-onClick implementation silently
 * loses.
 *
 * All inputs share one generated `name` so the browser enforces exclusivity —
 * `useId` keeps that name unique when two groups sit on one page.
 *
 * Used where a choice changes how a figure is computed rather than what is
 * entered, e.g. how long mortgage insurance is charged for.
 */
export function RadioGroupField({
  legend,
  help,
  options,
  value,
  onValueChange,
}: {
  legend: string;
  help?: string;
  options: readonly RadioOption[];
  value: string;
  onValueChange: (next: string) => void;
}) {
  const id = useId();
  const helpId = `${id}-help`;

  return (
    <fieldset className="min-w-0" aria-describedby={help ? helpId : undefined}>
      <legend className="mb-3 font-display text-base font-medium text-ink">
        {legend}
      </legend>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-2.5 text-base leading-relaxed text-ink-2",
              FH_POINTER,
            )}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onValueChange(option.value)}
              className="mt-1 size-4 shrink-0 accent-brand-green"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {help ? (
        <p id={helpId} className="mt-2 text-sm leading-relaxed text-ink-3">
          {help}
        </p>
      ) : null}
    </fieldset>
  );
}
