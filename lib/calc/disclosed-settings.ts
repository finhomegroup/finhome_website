/**
 * Summarising the advanced settings a collapsed panel is hiding.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `disclosed-settings.test.ts`.
 *
 * THE PROBLEM THIS SOLVES. Progressive disclosure shortens the route to a
 * first answer — the audit measured the first input field 801–966 px down the
 * page on a phone — but a collapsed panel introduces a worse failure: a
 * setting inside it can change the headline while the reader has no idea it
 * exists. The mortgage page's PMI fields were exactly that, on a page whose
 * own copy says PMI does not apply to Vietnamese loans.
 *
 * So the rule is: a panel may be collapsed, but it must state what is ACTIVE
 * inside it, on its own summary line, always visible. Collapsed and silent is
 * not allowed.
 *
 * `active` is decided by the CALLER, not here. The caller holds the field's
 * parser — and picking the wrong parser is the single most repeated defect in
 * this suite (docs §4) — so this module never looks at a raw string and
 * guesses whether "0" means zero.
 */

/** One setting inside a disclosure panel. */
export type DisclosedSetting = {
  key: string;
  /** The field's own label, e.g. "Thuế nhà đất mỗi năm". */
  label: string;
  /** The value as the page would display it, e.g. "12.000.000 ₫". */
  value: string;
  /**
   * True when this setting is currently changing the result.
   *
   * The caller decides, using the same parsed value it feeds the calculator.
   * A money field left at 0, or a mode left at its neutral option, is not
   * active.
   */
  active: boolean;
};

/** The settings that are currently affecting the result, in the given order. */
export function activeSettings(
  settings: readonly DisclosedSetting[],
): DisclosedSetting[] {
  return settings.filter((setting) => setting.active);
}

export type SettingsSummaryWords = {
  /** Shown when nothing inside the panel is active. */
  none: string;
  /** Between two listed settings, e.g. " · ". */
  separator: string;
  /**
   * How many settings to name before falling back to a count.
   *
   * A summary line that lists eleven settings is as unreadable as one that
   * lists none, and it wraps to three lines on a phone.
   */
  limit: number;
  /** `{count}` substituted: "và {count} thiết lập khác". */
  more: string;
};

/**
 * The one-line summary a collapsed panel shows.
 *
 * "Thuế nhà đất mỗi năm 12.000.000 ₫ · Tỷ lệ PMI 0,5%" — or the `none` string
 * when the panel is genuinely not doing anything, which is the common case and
 * the one that lets a reader skip it with confidence.
 */
export function settingsSummary(
  settings: readonly DisclosedSetting[],
  words: SettingsSummaryWords,
): string {
  const active = activeSettings(settings);
  if (active.length === 0) return words.none;

  const named = active.slice(0, Math.max(1, words.limit));
  const parts = named.map((setting) => `${setting.label} ${setting.value}`);
  const remaining = active.length - named.length;
  if (remaining > 0) {
    parts.push(words.more.replace("{count}", String(remaining)));
  }
  return parts.join(words.separator);
}

/**
 * Whether the panel should be OPEN on first render.
 *
 * True when anything inside it is active. A panel holding a setting that is
 * changing the answer starts open, so the reader sees the cause of a figure
 * they did not expect without having to hunt for it. Otherwise it starts
 * closed, which is the whole point of the disclosure.
 *
 * Deterministic from the props, so the server's rendered `open` attribute and
 * the client's first render agree — a `useState` default here would risk a
 * hydration mismatch on a prefilled form.
 */
export function shouldOpen(settings: readonly DisclosedSetting[]): boolean {
  return activeSettings(settings).length > 0;
}
