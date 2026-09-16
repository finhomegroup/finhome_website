import { describe, expect, it } from "vitest";
import {
  emphasise,
  emphasisShare,
  missingPhrases,
  type ProseSpan,
} from "./prose-emphasis";

/** The invariant the whole mechanism rests on. */
function rejoin(spans: ProseSpan[]): string {
  return spans.map((span) => span.text).join("");
}

const PARAGRAPH =
  "Khoản trả hàng tháng thấp hơn không có nghĩa là tổng chi phí thấp hơn: " +
  "kỳ hạn dài hơn trả ít hơn mỗi tháng nhưng trả lãi nhiều hơn.";

describe("emphasise — the text is never altered", () => {
  it("reproduces the paragraph exactly, with no phrases", () => {
    const spans = emphasise(PARAGRAPH);
    expect(rejoin(spans)).toBe(PARAGRAPH);
    expect(spans).toHaveLength(1);
    expect(spans[0].emphasis).toBe(false);
  });

  it("reproduces the paragraph exactly, with phrases", () => {
    const spans = emphasise(PARAGRAPH, [
      "không có nghĩa là",
      "trả lãi nhiều hơn",
    ]);
    expect(rejoin(spans)).toBe(PARAGRAPH);
  });

  it("marks exactly the declared phrases and nothing else", () => {
    const spans = emphasise(PARAGRAPH, ["không có nghĩa là"]);
    const marked = spans.filter((span) => span.emphasis).map((s) => s.text);
    expect(marked).toEqual(["không có nghĩa là"]);
  });

  it("keeps the spans in reading order", () => {
    const spans = emphasise(PARAGRAPH, [
      "trả lãi nhiều hơn",
      "không có nghĩa là",
    ]);
    const marked = spans.filter((span) => span.emphasis).map((s) => s.text);
    // Declared in one order, rendered in the paragraph's order.
    expect(marked).toEqual(["không có nghĩa là", "trả lãi nhiều hơn"]);
  });

  it("returns nothing for an empty paragraph", () => {
    expect(emphasise("", ["gì cũng được"])).toEqual([]);
  });

  it("ignores an empty phrase rather than splitting every character", () => {
    const spans = emphasise(PARAGRAPH, [""]);
    expect(spans).toHaveLength(1);
    expect(spans[0].emphasis).toBe(false);
  });
});

describe("emphasise — the four rules", () => {
  it("is case-sensitive and diacritic-sensitive", () => {
    // "Khoản" is not "khoản", and in Vietnamese a missing diacritic is a
    // different word. An editor writes the phrase they mean.
    expect(
      emphasise(PARAGRAPH, ["khoản trả hàng tháng"]).some((s) => s.emphasis),
    ).toBe(false);
    expect(
      emphasise(PARAGRAPH, ["Khoản trả hàng tháng"]).some((s) => s.emphasis),
    ).toBe(true);
    expect(
      emphasise("tổng chi phí", ["tong chi phi"]).some((s) => s.emphasis),
    ).toBe(false);
  });

  it("claims the LONGEST phrase first, so no span nests", () => {
    const text = "Đây là chi phí ròng theo tháng, không phải dòng tiền.";
    const spans = emphasise(text, ["chi phí ròng", "chi phí ròng theo tháng"]);
    const marked = spans.filter((s) => s.emphasis).map((s) => s.text);
    // The more specific selection wins; the shorter one sits inside it and is
    // therefore already emphasised.
    expect(marked).toEqual(["chi phí ròng theo tháng"]);
    expect(rejoin(spans)).toBe(text);
  });

  it("emphasises a phrase ONCE, at its first occurrence", () => {
    const text = "Không phải rẻ hơn. Không phải đắt hơn. Nó phụ thuộc.";
    const spans = emphasise(text, ["Không phải"]);
    const marked = spans.filter((s) => s.emphasis);
    expect(marked).toHaveLength(1);
    // The FIRST one, not the last.
    expect(spans[0]).toEqual({ text: "Không phải", emphasis: true });
    expect(rejoin(spans)).toBe(text);
  });

  it("lets an editor mark a later occurrence by declaring more words", () => {
    const text = "Không phải rẻ hơn. Không phải đắt hơn. Nó phụ thuộc.";
    const spans = emphasise(text, ["Không phải đắt hơn"]);
    const marked = spans.filter((s) => s.emphasis).map((s) => s.text);
    expect(marked).toEqual(["Không phải đắt hơn"]);
  });

  it("skips a phrase whose only occurrence is inside another emphasis", () => {
    const text = "Chỉ có chi phí ròng theo tháng ở đây.";
    const spans = emphasise(text, ["chi phí ròng theo tháng", "theo tháng"]);
    expect(spans.filter((s) => s.emphasis).map((s) => s.text)).toEqual([
      "chi phí ròng theo tháng",
    ]);
    expect(rejoin(spans)).toBe(text);
  });

  it("finds a later, non-overlapping occurrence when the first is claimed", () => {
    const text = "theo tháng: chi phí ròng theo tháng là con số khác.";
    const spans = emphasise(text, ["chi phí ròng theo tháng", "theo tháng"]);
    const marked = spans.filter((s) => s.emphasis).map((s) => s.text);
    // The leading "theo tháng" is free, so both selections are honoured.
    expect(marked).toEqual(["theo tháng", "chi phí ròng theo tháng"]);
    expect(rejoin(spans)).toBe(text);
  });

  it("skips a phrase that is not in the paragraph at all", () => {
    const spans = emphasise(PARAGRAPH, ["một câu không tồn tại"]);
    expect(spans).toEqual([{ text: PARAGRAPH, emphasis: false }]);
  });

  it("de-duplicates a phrase declared twice", () => {
    const spans = emphasise(PARAGRAPH, [
      "không có nghĩa là",
      "không có nghĩa là",
    ]);
    expect(spans.filter((s) => s.emphasis)).toHaveLength(1);
  });

  it("does not mutate the caller's phrase array", () => {
    const phrases = ["trả lãi nhiều hơn", "không có nghĩa là"];
    const before = [...phrases];
    emphasise(PARAGRAPH, phrases);
    expect(phrases).toEqual(before);
  });
});

describe("emphasise — markup-like text is text", () => {
  // The module returns spans of plain text and the renderer emits React
  // elements, so there is no path from content to markup. These pin that the
  // characters survive untouched rather than being stripped or escaped here —
  // escaping is React's job, and `education-article.test.ts` proves it on the
  // rendered page.
  it("treats a tag as characters, not structure", () => {
    const nasty = 'Chú ý <script>alert("x")</script> và <b>đậm</b>.';
    const spans = emphasise(nasty, ["<script>"]);
    expect(rejoin(spans)).toBe(nasty);
    expect(spans.filter((s) => s.emphasis).map((s) => s.text)).toEqual([
      "<script>",
    ]);
  });

  it("treats an entity as characters", () => {
    const text = "5 &lt; 10 &amp; 10 &gt; 5";
    expect(rejoin(emphasise(text, ["&amp;"]))).toBe(text);
  });
});

describe("missingPhrases", () => {
  it("names a phrase no paragraph contains", () => {
    expect(
      missingPhrases([PARAGRAPH], ["không có nghĩa là", "sai chính tả"]),
    ).toEqual(["sai chính tả"]);
  });

  it("is empty when every phrase is found somewhere in the block", () => {
    expect(
      missingPhrases(
        ["Câu một nói về kỳ hạn.", "Câu hai nói về lãi."],
        ["kỳ hạn", "lãi"],
      ),
    ).toEqual([]);
  });
});

describe("emphasisShare", () => {
  it("is 0 for a block with no emphasis", () => {
    expect(emphasisShare([PARAGRAPH], [])).toBe(0);
  });

  it("is 0 for an empty block rather than dividing by zero", () => {
    expect(emphasisShare([], ["gì đó"])).toBe(0);
    expect(emphasisShare([""], ["gì đó"])).toBe(0);
  });

  it("measures the marked share across the whole block", () => {
    const share = emphasisShare(["abcdefghij", "klmnopqrst"], ["abcde"]);
    expect(share).toBeCloseTo(5 / 20, 10);
  });

  it("counts a phrase once per paragraph, as the renderer does", () => {
    // Two paragraphs each containing it once: two emphases, not one.
    const share = emphasisShare(["ab ab", "ab ab"], ["ab"]);
    expect(share).toBeCloseTo(4 / 10, 10);
  });
});
