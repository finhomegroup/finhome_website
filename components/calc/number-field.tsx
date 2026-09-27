"use client";

import { useId, useRef, type ChangeEvent, type CompositionEvent } from "react";
import { cn } from "@/lib/cn";
import { reformatInput, type InputFormat } from "@/lib/calc/number-input";

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
 *
 * `format` is an OPT-IN: without it the field hands the raw string up
 * unchanged, as every calculator has always received it. With `"money"` the
 * digits are grouped with dots as they arrive, with `"rate"` a typed "." is
 * shown as ","; a count field never opts in, because `parseCount` takes
 * digits only. The rules — parity with the parser, no silent repair of an
 * invalid string, and where the caret lands — live in `lib/calc/number-input.ts`
 * so a module test can see them. This component only:
 *
 * - writes the formatted string and caret back to the DOM INSIDE the change
 *   handler, before React reconciles, so the controlled value it then
 *   renders is already what the input holds and the caret is not reset to
 *   the end;
 * - leaves an IME composition alone until `compositionend`, because
 *   rewriting the value mid-composition breaks the composition;
 * - passes `InputEvent.inputType` through, which is how Backspace and Delete
 *   on a grouping dot are told apart.
 *
 * The stored value is never formatted on render. The defaults are already in
 * Vietnamese grammar, and a value that moved under the reader on hydration
 * would be a server/client mismatch.
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
  format,
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
  /** Format while typing: `"money"` groups thousands, `"rate"` shows a comma decimal mark. */
  format?: InputFormat;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const showError = invalid && Boolean(error);
  const composing = useRef(false);
  const hadSelection = useRef(false);

  function rememberSelection(input: HTMLInputElement) {
    hadSelection.current = input.selectionStart !== input.selectionEnd;
  }

  function commit(input: HTMLInputElement, inputType?: string) {
    const raw = input.value;
    if (!format || composing.current) {
      onValueChange(raw);
      return;
    }
    const caret = input.selectionStart ?? raw.length;
    const next = reformatInput({
      previous: value, raw, caret, format, inputType,
      hadSelection: hadSelection.current,
    });
    if (next.value !== raw || next.caret !== caret) {
      input.value = next.value;
      input.setSelectionRange(next.caret, next.caret);
    }
    onValueChange(next.value);
    rememberSelection(input);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    // `inputType` is on the native `InputEvent`; the synthetic event types it
    // as a plain `Event`, and an old engine may not set it at all.
    const native = event.nativeEvent as Partial<InputEvent>;
    commit(
      event.currentTarget,
      typeof native.inputType === "string" ? native.inputType : undefined,
    );
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    composing.current = false;
    commit(event.currentTarget);
  }

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
          onChange={handleChange}
          onSelect={(event) => rememberSelection(event.currentTarget)}
          onKeyDown={(event) => rememberSelection(event.currentTarget)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={handleCompositionEnd}
          data-format={format}
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
