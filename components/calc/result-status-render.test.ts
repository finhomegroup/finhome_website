/**
 * Rendered contracts for the shared semantic-result presentation.
 *
 * `renderToStaticMarkup` in plain `node`, like every render test here. What
 * this CANNOT check is appearance: colour, contrast on screen, layout and
 * what a screen reader actually says are unverified by it. The token
 * contrast ratios are arithmetic, in `result-status-contrast.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialSettled,
  ResultStatusCard,
  settledText,
  STATUS_SETTLE_MS,
} from "@/components/calc/result-status";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultCta } from "@/components/calc/result-cta";
import { NumberField } from "@/components/calc/number-field";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { markupRegion } from "@/lib/markup-region";
import { RESULT_TONES } from "@/lib/calc/result-status";

const card = (props: Parameters<typeof ResultStatusCard>[0]) =>
  renderToStaticMarkup(createElement(ResultStatusCard, props));

describe("ResultStatusCard", () => {
  it("says its state in WORDS for every tone, beside an icon hidden from AT", () => {
    for (const tone of RESULT_TONES) {
      const html = card({ status: { tone, title: "Tiêu đề" }, formId: "f" });
      expect(html).toContain(`data-result-status="${tone}"`);
      // Colour is never the only channel: the tone's label is visible text.
      expect(html).toContain(TOOL_SHELL.status.labels[tone]);
      for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
        expect(svg).toContain('aria-hidden="true"');
        expect(svg).toContain('focusable="false"');
      }
      expect(html.match(/<svg/g)?.length).toBe(1);
    }
  });

  it("defaults to NEUTRAL when no tone is given", () => {
    const html = card({ status: { title: "Chưa có kết luận" }, formId: "f" });
    expect(html).toContain('data-result-status="unknown"');
    expect(html).toContain(TOOL_SHELL.status.labels.unknown);
  });

  it("never interrupts: no alert role, no live region of its own", () => {
    const html = card({
      status: { tone: "shortfall", title: "Thiếu", fact: "Thiếu 1 triệu" },
      formId: "f",
    });
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain("aria-live");
  });

  it("renders the hierarchy in order: label, title, fact, reasons, next, actions", () => {
    const html = card({
      status: {
        tone: "shortfall",
        label: "Nhãn riêng",
        title: "TIÊU-ĐỀ",
        fact: "MỐC-CHÍNH",
        reasons: ["LÝ-DO"],
        next: "BƯỚC-TIẾP",
        actions: [{ field: "price", label: "Thử giá xe thấp hơn" }],
      },
      formId: "vay-mua-xe-nhap",
    });
    const order = ["Nhãn riêng", "TIÊU-ĐỀ", "MỐC-CHÍNH", "LÝ-DO", "BƯỚC-TIẾP", "Thử giá xe thấp hơn"];
    const at = order.map((needle) => html.indexOf(needle));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    // An action is a real button that names the field it goes to.
    expect(html).toContain('type="button"');
    expect(html).toContain('data-calc-jump="price"');
  });
});

describe("the one live region carries the settled status, and only once", () => {
  const html = renderToStaticMarkup(
    createElement(
      ResultGroup,
      {
        title: "Kết quả",
        anchorId: "x-ket-qua",
        status: createElement(ResultStatusCard, {
          status: { tone: "shortfall", title: "THẺ-TRẠNG-THÁI" },
          formId: "x-nhap",
        }),
        announcement: "Chưa đủ. THÔNG-BÁO",
      } as ComponentProps<typeof ResultGroup>,
      createElement(ResultRow, { label: "Dòng", value: "1 ₫" }),
    ),
  );

  it("puts the card AND the rows outside the live region; only the sentence is live", () => {
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live).not.toContain("THẺ-TRẠNG-THÁI");
    expect(live).toContain("THÔNG-BÁO");
    // Rows no longer announce per keystroke in this mode: they are visible,
    // outside the region, and the settled sentence is the only thing heard.
    expect(live).not.toContain("Dòng");
    expect(live).not.toContain("aria-atomic=\"true\" class=\"border-t");
    expect(html).toContain('data-calc-rows="true"');
    expect(html.indexOf("THẺ-TRẠNG-THÁI")).toBeLessThan(html.indexOf("Dòng"));
    // Screen-reader text, atomic, with its label and its figure together,
    // in a visually hidden region.
    expect(html).toMatch(/class="sr-only" aria-live="polite" data-results-live="true"/);
    expect(live).toMatch(/<p aria-atomic="true"[^>]*>Chưa đủ\. THÔNG-BÁO<\/p>/);
  });

  it("keeps the focus destination and exactly one live region", () => {
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(html).toContain('id="x-ket-qua"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-labelledby="x-ket-qua-title"');
  });

  it("leaves a group WITHOUT an announcement exactly as before: its rows are live", () => {
    const plain = renderToStaticMarkup(
      createElement(
        ResultGroup,
        { title: "Kết quả", anchorId: "y" } as ComponentProps<typeof ResultGroup>,
        createElement(ResultRow, { label: "Dòng", value: "1 ₫" }),
      ),
    );
    expect(markupRegion(plain, 'data-results-live="true"')).toContain("Dòng");
    expect(plain).not.toContain("data-calc-rows");
    expect(plain).not.toContain("sr-only");
  });
});

describe("settledText — the 400 ms announcement rule", () => {
  it("waits about 400 ms", () => {
    expect(STATUS_SETTLE_MS).toBe(400);
  });

  it("announces the settled text, and NOTHING while a newer one settles", () => {
    // No stale success is ever held: the moment the text changes, the old
    // conclusion is withdrawn; the new one arrives once typing pauses.
    expect(settledText({ text: "Đạt", for: "Đạt" }, "Đạt")).toBe("Đạt");
    expect(settledText({ text: "Đạt", for: "Đạt" }, "Chưa kết luận")).toBe("");
  });

  it("starts EMPTY, so a page load announces nothing and nothing is read twice", () => {
    // The first render holds no sentence: the card above the rows already
    // says it, and a populated hidden copy would be read a second time by a
    // reader moving through the page. It fills only after an edit settles.
    expect(settledText(initialSettled("Chưa đủ. Kế hoạch chưa đủ"), "Chưa đủ. Kế hoạch chưa đủ")).toBe("");
  });
});

describe("the pinned CTA carries the same status as the card", () => {
  it("renders the tone's word and icon inside the aria-hidden restatement", () => {
    const html = renderToStaticMarkup(
      createElement(ResultCta, {
        formId: "f",
        targetId: "t",
        invalid: false,
        sticky: true,
        answer: {
          label: "Còn lại",
          value: "−1.498.818 ₫",
          status: { tone: "shortfall", label: "Thiếu ngân sách" },
        },
      }),
    );
    const hidden = html.slice(html.indexOf('data-calc-answer="true"') - 60);
    expect(hidden).toContain('aria-hidden="true"');
    expect(html).toContain('data-result-status="shortfall"');
    expect(html).toContain("Thiếu ngân sách");
    // The button stays the brand navigation control, never a red one.
    expect(html).toContain("bg-brand-green-ink");
    expect(html).not.toMatch(/<button[^>]*status-shortfall/);
  });
});

describe("NumberField's jump hook", () => {
  it("marks an input with the key a status action jumps to", () => {
    const html = renderToStaticMarkup(
      createElement(NumberField, {
        label: "Giá xe",
        help: "h",
        value: "1",
        onValueChange: () => {},
        fieldKey: "price",
      }),
    );
    expect(html).toMatch(/<input[^>]*data-calc-field="price"/);
  });

  it("adds nothing to a field that has no key", () => {
    const html = renderToStaticMarkup(
      createElement(NumberField, {
        label: "Giá xe",
        help: "h",
        value: "1",
        onValueChange: () => {},
      }),
    );
    expect(html).not.toContain("data-calc-field");
  });
});
