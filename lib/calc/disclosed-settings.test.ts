import { describe, it, expect } from "vitest";
import {
  activeSettings,
  settingsSummary,
  shouldOpen,
  type DisclosedSetting,
  type SettingsSummaryWords,
} from "@/lib/calc/disclosed-settings";

const WORDS: SettingsSummaryWords = {
  none: "Không có thiết lập nào đang ảnh hưởng kết quả.",
  separator: " · ",
  limit: 2,
  more: "và {count} thiết lập khác",
};

const setting = (
  key: string,
  label: string,
  value: string,
  active: boolean,
): DisclosedSetting => ({ key, label, value, active });

describe("activeSettings", () => {
  it("keeps only the settings that are changing the result", () => {
    const settings = [
      setting("tax", "Thuế nhà đất", "12.000.000 ₫", true),
      setting("insurance", "Bảo hiểm", "0 ₫", false),
      setting("pmi", "Tỷ lệ PMI", "0,5%", true),
    ];
    expect(activeSettings(settings).map((s) => s.key)).toEqual(["tax", "pmi"]);
  });

  it("preserves the order the page declared", () => {
    // The summary reads in form order, so a reader scanning the panel finds
    // the named setting where the sentence said it would be.
    const settings = [
      setting("c", "C", "3", true),
      setting("a", "A", "1", true),
      setting("b", "B", "2", true),
    ];
    expect(activeSettings(settings).map((s) => s.key)).toEqual(["c", "a", "b"]);
  });

  it("returns nothing for an empty or fully neutral panel", () => {
    expect(activeSettings([])).toEqual([]);
    expect(activeSettings([setting("a", "A", "0", false)])).toEqual([]);
  });
});

describe("settingsSummary", () => {
  it("says plainly when the panel is not doing anything", () => {
    // The common case, and the one that lets a reader skip the panel.
    expect(settingsSummary([], WORDS)).toBe(WORDS.none);
    expect(settingsSummary([setting("a", "A", "0 ₫", false)], WORDS)).toBe(
      WORDS.none,
    );
  });

  it("names an active setting with its value", () => {
    // The contract: a collapsed panel may never hide a setting that is
    // changing the headline. This is how it does not.
    expect(
      settingsSummary(
        [setting("tax", "Thuế nhà đất", "12.000.000 ₫", true)],
        WORDS,
      ),
    ).toBe("Thuế nhà đất 12.000.000 ₫");
  });

  it("joins two with the separator", () => {
    expect(
      settingsSummary(
        [
          setting("tax", "Thuế nhà đất", "12.000.000 ₫", true),
          setting("pmi", "Tỷ lệ PMI", "0,5%", true),
        ],
        WORDS,
      ),
    ).toBe("Thuế nhà đất 12.000.000 ₫ · Tỷ lệ PMI 0,5%");
  });

  it("counts the rest rather than wrapping to three lines", () => {
    const settings = [
      setting("a", "A", "1", true),
      setting("b", "B", "2", true),
      setting("c", "C", "3", true),
      setting("d", "D", "4", true),
    ];
    expect(settingsSummary(settings, WORDS)).toBe(
      "A 1 · B 2 · và 2 thiết lập khác",
    );
  });

  it("never names zero settings when something is active", () => {
    // A limit of 0 would produce a summary that says nothing while a setting
    // is silently changing the answer — the exact defect. At least one is
    // always named.
    const settings = [setting("a", "A", "1", true), setting("b", "B", "2", true)];
    const summary = settingsSummary(settings, { ...WORDS, limit: 0 });
    expect(summary).toContain("A 1");
    expect(summary).toContain("và 1 thiết lập khác");
  });

  it("ignores neutral settings when counting the remainder", () => {
    const settings = [
      setting("a", "A", "1", true),
      setting("b", "B", "2", true),
      setting("c", "C", "0", false),
    ];
    expect(settingsSummary(settings, WORDS)).toBe("A 1 · B 2");
  });
});

describe("shouldOpen", () => {
  it("opens the panel when a hidden setting is changing the result", () => {
    expect(shouldOpen([setting("a", "A", "1", true)])).toBe(true);
  });

  it("leaves the panel closed when it is neutral", () => {
    expect(shouldOpen([])).toBe(false);
    expect(shouldOpen([setting("a", "A", "0", false)])).toBe(false);
  });

  it("is a pure function of its input, so server and client agree", () => {
    // Not a useState default: a prefilled form renders on the server first,
    // and an `open` attribute decided in an effect would flip after hydration.
    const settings = [setting("a", "A", "1", true)];
    expect(shouldOpen(settings)).toBe(shouldOpen(settings));
  });
});
