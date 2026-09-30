/**
 * Containment contracts for a result figure longer than its row
 * (root observation 2026-09-29: `16.129.831.713.745.744 ₫` on
 * /cong-cu/thue-hay-mua/ at 320 px ran past the card and lost its last digits
 * while the page did not scroll).
 *
 * THESE ARE MARKUP CONTRACTS, NOT APPEARANCE. They prove the classes that let
 * a long figure wrap are present, that the text is byte-for-byte unchanged and
 * that the existing hierarchy tokens survive. Whether nothing is clipped at
 * 320 / 390 / 768 / 1440 px is a browser measurement of element boxes, which
 * this file cannot make.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultRow } from "@/components/calc/result-row";
import { ResultCta } from "@/components/calc/result-cta";

const HUGE = "16.129.831.713.745.744 ₫";
const tokensOf = (markup: string, pattern: RegExp) => (pattern.exec(markup)?.[1] ?? "").split(/\s+/);
const rowTokens = (markup: string) => tokensOf(markup, /<div[^>]*class="([^"]*)"/);
const valueTokens = (markup: string, start: string) => tokensOf(markup, new RegExp(`<span class="([^"]*)">${start}`));

const row = (props: Parameters<typeof ResultRow>[0]) => renderToStaticMarkup(createElement(ResultRow, props));

describe("ResultRow: a figure longer than its row wraps instead of being clipped", () => {
  it("keeps the exact text — no inserted break, no abbreviation, same type size", () => {
    const markup = row({ label: "Mua — chi phí ròng", value: HUGE });
    expect(markup).toContain(`>${HUGE}<`);
    expect(markup).not.toMatch(/<wbr|&shy;|​/);
    const value = valueTokens(markup, "16");
    expect(value).toContain("text-xl");
    expect(value).toContain("md:text-2xl");
  });

  it("caps the value at its row and lets it break inside itself only as a last resort", () => {
    for (const emphasis of [false, true]) {
      const value = valueTokens(row({ label: "Chênh lệch", value: HUGE, emphasis }), "16");
      expect(value).toContain("max-w-full");
      expect(value).toContain("[overflow-wrap:anywhere]");
      // Held whole from md while it fits; never the unprefixed squeeze.
      expect(value).toContain("md:shrink-0");
      expect(value).not.toContain("shrink-0");
      // No imposed minimum width that could force overflow.
      expect(value.some((token) => /^(md:)?min-w-(?!0$)/.test(token))).toBe(false);
    }
  });

  it("from md, a figure row may wrap and its label takes the remaining width", () => {
    const markup = row({ label: "Chênh lệch", value: HUGE });
    const tokens = rowTokens(markup);
    expect(tokens).toContain("md:flex");
    expect(tokens).toContain("md:flex-wrap");
    expect(tokens).not.toContain("flex");
    expect(tokensOf(markup, /<span class="([^"]*)">Chênh lệch</)).toContain("md:flex-1");
  });

  it("keeps one headline: emphasis still one step up, and normal figures unchanged", () => {
    const markup = row({ label: "Trả hằng tháng", value: "17.356.465 ₫", emphasis: true });
    expect(markup).toContain(">17.356.465 ₫<");
    expect(markup.split("md:text-3xl").length - 1).toBe(1);
  });

  it("leaves a prose verdict's desktop box as it was, and still readable", () => {
    const markup = row({ label: "Kết luận", value: "Hai phương án tốn ngang nhau", prose: true });
    const tokens = rowTokens(markup);
    expect(tokens).not.toContain("md:flex-wrap");
    expect(tokensOf(markup, /<span class="([^"]*)">Kết luận</)).not.toContain("md:flex-1");
    expect(markup).toContain("md:max-w-sm");
    expect(markup).not.toContain("tabular-nums");
  });

  it("keeps the unknown dash and a noted qualifier readable", () => {
    expect(row({ label: "Chưa tính được", value: null })).toContain(">—<");
    const noted = row({ label: "Trả hết sau", value: "38 tháng", note: "Tháng 11/2029" });
    expect(noted).toContain(">38 tháng<");
    expect(noted).toContain(">Tháng 11/2029<");
    expect(tokensOf(noted, /<span class="([^"]*)"><span/)).toContain("md:flex-1");
  });
});

describe("ResultCta: the pinned restatement is contained the same way", () => {
  it("the answer value caps at its block and may break inside itself", () => {
    const markup = renderToStaticMarkup(
      createElement(ResultCta, {
        formId: "f",
        targetId: "t",
        invalid: false,
        sticky: true,
        answer: { label: "Chênh lệch", value: HUGE },
      }),
    );
    expect(markup).toContain(`>${HUGE}<`);
    const value = valueTokens(markup, "16");
    expect(value).toContain("max-w-full");
    expect(value).toContain("[overflow-wrap:anywhere]");
    expect(value).toContain("text-lg");
  });
});
