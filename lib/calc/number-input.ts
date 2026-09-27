/**
 * Live formatting of a calculator input WHILE the reader types.
 *
 * Pure module: no React, no DOM. Unit-tested in `number-input.test.ts`.
 *
 * This is the display side of two of the four input grammars in `number.ts`
 * — money and rate — and nothing else. It belongs to the form, not to the
 * money engine: no formula reads it, and no canonical counterpart exists in
 * the mobile app. Three rules it has to keep, each pinned by a test:
 *
 * 1. **Parity.** Whatever this returns parses, through `parseMoney` or
 *    `parseDecimal`, to exactly the figure the raw string parsed to. A
 *    grouping dot is inserted or moved, a rate's "." becomes ",", and nothing
 *    else changes. No `Number`, no `Intl`, no rounding — a typed "500000,50"
 *    keeps its trailing zero because it was never a float.
 * 2. **No silent repair.** A string the grammar does not recognise — two
 *    decimal marks, a letter, a space — is returned untouched, so the field
 *    goes invalid and the reader sees what they typed. Turning "1,2,3" into
 *    "123" would be a formatter deciding what the reader meant.
 * 3. **The caret follows the reader.** Dots are the only characters this
 *    adds or removes, so the caret is placed after the same number of
 *    non-dot characters it was after in the raw string. Backspace and Delete
 *    on a dot are the one case that rule cannot see: the browser has already
 *    removed the dot and nothing else, so the field would re-group to the same
 *    string and the keystroke would do nothing. `reformatInput` detects that
 *    from the previous value plus `InputEvent.inputType` and removes the digit
 *    on the side the key pointed at.
 */

export type InputFormat = "money" | "rate";

/**
 * The money grammar `parseMoney` accepts, split into sign, integer part (with
 * whatever dots the reader typed) and an optional ","-led fraction. The
 * fraction may be empty — "500," is a reader mid-decimal, not an error.
 */
const MONEY_INPUT = /^(-?)([\d.]*)(,\d*)?$/;

/** The decimal grammar `parseDecimal` accepts: one optional "." or "," mark. */
const RATE_INPUT = /^-?\d*[.,]?\d*$/;

/**
 * Group the integer digits of a money string with dots, keeping the sign and
 * the fraction exactly as typed. Idempotent, and a no-op on anything outside
 * the money grammar.
 */
export function formatMoneyInput(raw: string): string {
  const match = MONEY_INPUT.exec(raw);
  if (!match) return raw;
  const [, sign, integer, fraction = ""] = match;
  const digits = integer.replace(/\./g, "");
  // The same right-to-left grouping `formatMoney` uses, on the STRING the
  // reader typed rather than on a number, so "0000" stays four zeros.
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped}${fraction}`;
}

/**
 * Show a rate's decimal mark as the comma Vietnamese writes. `parseDecimal`
 * reads "." and "," alike, so this changes no figure; it never groups,
 * because `parseDecimal("1.000")` is 1 and a dot there would lie.
 */
export function formatRateInput(raw: string): string {
  if (!RATE_INPUT.test(raw)) return raw;
  return raw.replace(".", ",");
}

function formatFor(format: InputFormat, raw: string): string {
  return format === "money" ? formatMoneyInput(raw) : formatRateInput(raw);
}

/** Only money inserts characters the reader did not type. */
const GROUPING = ".";

/** Index in `formatted` just after its `count`-th non-grouping character. */
function caretAfter(formatted: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== GROUPING && ++seen === count) return i + 1;
  }
  return formatted.length;
}

/**
 * Detect a single-character deletion of a grouping dot — Backspace with the
 * caret after it, or Delete with the caret before it — and widen it to the
 * digit the key was aimed at. Returns the raw string and caret to format, or
 * null when this was any other edit.
 */
function widenDotDeletion(
  previous: string,
  raw: string,
  caret: number,
  inputType: string | undefined,
): { raw: string; caret: number } | null {
  const backward = inputType === "deleteContentBackward";
  const forward = inputType === "deleteContentForward";
  if (!backward && !forward) return null;
  // Exactly one character gone, at the caret, and it was a dot.
  if (
    previous.length !== raw.length + 1 ||
    previous[caret] !== GROUPING ||
    previous.slice(0, caret) + previous.slice(caret + 1) !== raw
  ) {
    return null;
  }
  if (backward) {
    if (caret === 0 || !/\d/.test(raw[caret - 1])) return null;
    return { raw: raw.slice(0, caret - 1) + raw.slice(caret), caret: caret - 1 };
  }
  if (caret >= raw.length || !/\d/.test(raw[caret])) return null;
  return { raw: raw.slice(0, caret) + raw.slice(caret + 1), caret };
}

/**
 * Format the field's new raw value and say where the caret goes.
 *
 * `previous` is the value the field showed before this edit, `raw` and
 * `caret` are what the browser holds after it, and `inputType` is the
 * `InputEvent.inputType` of the edit when the caller has one.
 */
export function reformatInput({
  previous,
  raw,
  caret,
  format,
  inputType,
  hadSelection = false,
}: {
  previous: string;
  raw: string;
  caret: number;
  format: InputFormat;
  inputType?: string;
  /** Never delete an extra digit outside a range the reader selected. */
  hadSelection?: boolean;
}): { value: string; caret: number } {
  const at = Math.max(0, Math.min(caret, raw.length));

  if (format === "rate") {
    // A one-for-one character swap; the caret does not move.
    return { value: formatRateInput(raw), caret: at };
  }

  const canWiden = !hadSelection && MONEY_INPUT.test(previous) &&
    formatMoneyInput(previous) === previous;
  const edit = (canWiden ? widenDotDeletion(previous, raw, at, inputType) : null) ??
    { raw, caret: at };
  const value = formatFor(format, edit.raw);
  if (value === edit.raw) return { value, caret: edit.caret };

  const significant = edit.raw.slice(0, edit.caret).replace(/\./g, "").length;
  return { value, caret: caretAfter(value, significant) };
}
