"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A numeric input with its label, unit, help text and validation message.
 *
 * This component owns the whole accessibility contract for calculator input,
 * so that no calculator author has to remember it and none can get it wrong:
 *
 * - `useId` generates the id, so `htmlFor`/`id` cannot drift apart and two
 *   fields on one page cannot collide.
 * - `aria-describedby` points at the help paragraph.
 * - `aria-invalid` reflects the validity flag.
 * - The help paragraph carries `aria-live="polite"`, because
 *   `aria-describedby` content is announced on FOCUS only. Without the live
 *   region a screen-reader user who types an invalid value is never told
 *   why the results disappeared. (Found by review on the first calculator.)
 * - `unit` is appended to the visible LABEL, not just rendered as a
 *   decorative suffix, so a non-visual user gets the unit at all. The suffix
 *   span is `aria-hidden` precisely because the label already carries it.
 *
 * `type="text"` rather than `type="number"`: number inputs reject the comma
 * decimal separator Vietnamese keyboards produce, which is exactly what
 * `parseDecimal`/`parseMoney` are built to accept. `inputMode="decimal"`
 * still gives mobile the numeric keypad.
 */
export function NumberField({
  label,
  unit,
  help,
  error,
  value,
  onValueChange,
  invalid = false,
  placeholder,
}: {
  label: string;
  /** e.g. "%" or "₫" — appended to the accessible label. */
  unit?: string;
  help: string;
  /** Shown in place of `help` while `invalid`. */
  error?: string;
  value: string;
  onValueChange: (next: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const showError = invalid && Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-base font-medium text-ink"
      >
        {unit ? `${label} (${unit})` : label}
      </label>

      <div className="mt-3 flex items-center gap-3">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={helpId}
          aria-invalid={invalid}
          className={cn(
            "w-full rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 text-base text-ink outline-none transition",
            "placeholder:text-ink-4 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30",
            invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        {unit ? (
          <span aria-hidden className="shrink-0 text-base text-ink-2">
            {unit}
          </span>
        ) : null}
      </div>

      <p
        id={helpId}
        aria-live="polite"
        className={cn(
          "mt-2 text-sm leading-relaxed",
          showError ? "text-red-600" : "text-ink-3",
        )}
      >
        {showError ? error : help}
      </p>
    </div>
  );
}
