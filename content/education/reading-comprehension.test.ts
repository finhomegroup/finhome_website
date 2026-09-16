// The founder's reading-comprehension requirement, asserted per article.
//
// WHAT THIS FILE IS FOR. A typography change that passes a snapshot proves
// nothing about whether an article is easier to understand. So these tests
// assert the EDITORIAL contract instead: every article emphasises something,
// every emphasised phrase actually occurs in the block it was declared for,
// the emphasis stays a small share of the text, the conclusion's conditions
// are never emphasised away from the conclusion, and the text itself is
// unchanged by the mechanism.
//
// What they deliberately do NOT assert is an exact highlight count. A quota
// would be satisfied by bolding anything, which is the failure mode the whole
// mechanism exists to avoid.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { ProseText } from "@/components/ui/prose-text";
import {
  emphasise,
  emphasisShare,
  missingPhrases,
} from "@/lib/prose-emphasis";

/** Every block of prose in an article, with the phrases declared for it. */
function blocks(article: (typeof EDUCATION_ARTICLES)[number]) {
  return [
    {
      name: "shortAnswer",
      paragraphs: article.shortAnswer,
      phrases: article.shortAnswerEmphasis ?? [],
    },
    ...article.sections.map((section) => ({
      name: `section "${section.heading}"`,
      paragraphs: section.paragraphs,
      phrases: section.emphasis ?? [],
    })),
  ];
}

const cases = EDUCATION_ARTICLES.map((a) => [a.planId, a] as const);

describe("every declared phrase is really in the text it belongs to", () => {
  it.each(cases)("%s has no emphasis phrase that matches nothing", (_id, article) => {
    for (const block of blocks(article)) {
      const missing = missingPhrases(block.paragraphs, block.phrases);
      expect(
        missing,
        `${article.planId} ${block.name} declares phrases that do not occur: ${missing.join(" / ")}`,
      ).toEqual([]);
    }
  });

  it.each(cases)("%s actually renders every declared phrase", (_id, article) => {
    // `missingPhrases` proves the phrase is in the block; this proves the
    // renderer claims it. A phrase can be present and still not be marked —
    // if its only occurrence sits inside a longer emphasised phrase, which is
    // a real rule and not a defect, so that case is allowed and named.
    for (const block of blocks(article)) {
      const marked = new Set(
        block.paragraphs.flatMap((paragraph) =>
          emphasise(paragraph, block.phrases)
            .filter((span) => span.emphasis)
            .map((span) => span.text),
        ),
      );
      for (const phrase of block.phrases) {
        const claimed =
          marked.has(phrase) ||
          [...marked].some((text) => text.includes(phrase));
        expect(
          claimed,
          `${article.planId} ${block.name}: "${phrase}" is never emphasised`,
        ).toBe(true);
      }
    }
  });
});

describe("every article emphasises the distinction, not everything", () => {
  it.each(cases)("%s emphasises its short answer", (_id, article) => {
    // The conclusion-first block is the one paragraph every reader reads.
    expect(
      article.shortAnswerEmphasis?.length ?? 0,
      `${article.planId} has no emphasis in its short answer`,
    ).toBeGreaterThan(0);
  });

  it.each(cases)("%s emphasises something in every section", (_id, article) => {
    for (const section of article.sections) {
      expect(
        section.emphasis?.length ?? 0,
        `${article.planId} section "${section.heading}" has no emphasis`,
      ).toBeGreaterThan(0);
    }
  });

  it.each(cases)("%s keeps emphasis a small share of each block", (_id, article) => {
    // Bolding a whole paragraph is the same as bolding none of it.
    //
    // A RATCHET AT TODAY'S MAXIMUM, in the style of `live-region.test.ts`'s
    // MAX_LIVE_ROWS. The first pass of this reading unit emphasised 31–51% of
    // several short answers — three phrases in a two-paragraph block — and
    // this assertion is what caught it; each of those was cut back to the
    // distinction plus its condition. The densest block now sits just under
    // 30%. The bound stops a future edit from making it worse and is
    // deliberately not lowered further, because where the right line sits is
    // an editorial judgement per article.
    const MAX_EMPHASIS_SHARE = 0.3;
    for (const block of blocks(article)) {
      const share = emphasisShare(block.paragraphs, block.phrases);
      expect(
        share,
        `${article.planId} ${block.name} emphasises ${(share * 100).toFixed(1)}% of its text`,
      ).toBeLessThan(MAX_EMPHASIS_SHARE);
    }
  });

  it.each(cases)("%s never emphasises a whole paragraph", (_id, article) => {
    for (const block of blocks(article)) {
      for (const paragraph of block.paragraphs) {
        const spans = emphasise(paragraph, block.phrases);
        const plain = spans
          .filter((span) => !span.emphasis)
          .reduce((sum, span) => sum + span.text.trim().length, 0);
        expect(
          plain,
          `${article.planId} ${block.name}: a paragraph is entirely emphasised`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("the emphasis never separates a conclusion from its condition", () => {
  // The rule from the plan: emphasising "mua rẻ hơn" while leaving "trong
  // khoảng thời gian đã chọn" in plain text would turn a scoped calculation
  // into a claim. So no emphasised phrase may be a bare verdict, and the
  // qualifying vocabulary has to survive in the visible text.
  const VERDICT_ONLY = [
    "mua rẻ hơn",
    "nên mua",
    "nên thuê",
    "rẻ hơn",
    "tốt hơn",
    "đắt hơn",
  ];

  it.each(cases)("%s emphasises no bare verdict", (_id, article) => {
    for (const block of blocks(article)) {
      for (const phrase of block.phrases) {
        expect(
          VERDICT_ONLY.includes(phrase.trim().toLowerCase()),
          `${article.planId} ${block.name} emphasises the bare verdict "${phrase}"`,
        ).toBe(false);
      }
    }
  });

  it.each(cases)("%s keeps its hypothetical and limit vocabulary", (_id, article) => {
    // These words are what make the article's figures readable as a worked
    // example rather than as advice. The reading pass must not have quietly
    // dropped them while splitting paragraphs.
    const prose = [
      ...article.shortAnswer,
      article.household.note,
      ...article.sections.flatMap((s) => s.paragraphs),
      article.visualReading,
    ].join(" ");
    expect(
      /giả định|giả lập|kịch bản/i.test(prose),
      `${article.planId} no longer declares its figures hypothetical`,
    ).toBe(true);
    expect(article.limits.items.length).toBeGreaterThanOrEqual(3);
  });
});

describe("every chart has a sentence saying how to read it", () => {
  it.each(cases)("%s has a substantive visual reading", (_id, article) => {
    expect(
      article.visualReading.length,
      `${article.planId} visualReading is too short to be a reading`,
    ).toBeGreaterThan(120);
    // It has to be about the picture, not a restatement of the answer.
    expect(
      /đường|thanh|cột|biểu đồ|hình|trục|bảng/i.test(article.visualReading),
      `${article.planId} visualReading does not refer to the figure`,
    ).toBe(true);
  });

  it("C08's reading names the scenarios as scenarios, not a forecast", () => {
    const c08 = EDUCATION_ARTICLES.find((a) => a.planId === "C08")!;
    expect(c08.visualReading).toContain("KỊCH BẢN");
    expect(c08.visualReading).toContain("không phải khoảng tin cậy");
  });

  it("C12's reading keeps the two break-evens apart", () => {
    const c12 = EDUCATION_ARTICLES.find((a) => a.planId === "C12")!;
    expect(c12.visualReading).toContain("tháng 14");
    expect(c12.visualReading).toContain("tháng 18");
    expect(c12.visualReading).toContain("Đừng đọc mốc này thay cho mốc kia");
  });

  it("C10's reading says the saving is before the prepayment fee", () => {
    const c10 = EDUCATION_ARTICLES.find((a) => a.planId === "C10")!;
    expect(c10.visualReading).toContain("phí trả nợ trước hạn");
  });

  // A reading sentence has to agree with the ENDPOINTS the engine produced,
  // and this one was wrong in both directions before it was right: first it
  // told the reader to watch the balance line fall at a 0% rate on a visual
  // that solves for the contribution, then it said both lines end at the
  // target when at 6% only one does.
  it("C04's reading matches the two lines' actual endpoints", () => {
    const c04 = EDUCATION_ARTICLES.find((a) => a.planId === "C04")!;
    const visual = resolveEducationVisual(c04.visual, EDUCATION_VISUAL_LABELS);
    expect(visual.kind).toBe("chart");
    if (visual.kind !== "chart" || visual.model.kind !== "lines") return;

    const [balance, contributed] = visual.model.series;
    const endOf = (s: typeof balance) => s.points.at(-1)!.value;
    // The engine's own figures: the balance reaches the target, the
    // contributions do not.
    expect(endOf(balance)).toBeCloseTo(500_000_000, 0);
    expect(endOf(contributed)).toBeCloseTo(448_075_899, 0);
    expect(endOf(balance)).toBeGreaterThan(endOf(contributed));

    // So the sentence must NOT claim both lines end at the target, and must
    // name the contribution endpoint it really has.
    expect(c04.visualReading).toContain("448.075.899");
    expect(c04.visualReading).toContain("Chỉ ĐƯỜNG LIỀN kết thúc ở mục tiêu");
    expect(c04.visualReading).not.toContain("Cả hai đường đều kết thúc");
    // The 0% case is where they DO coincide, and the sentence says so with
    // the required contribution that makes it true.
    expect(c04.visualReading).toContain("11.111.111");
  });
});

describe("a heading never teaches the wrong unit", () => {
  it("C03's heading says ĐIỂM PHẦN TRĂM, not a bare percentage", () => {
    // The reviewed defect: the heading over the paragraph that distinguishes
    // points from percent said "Lãi tăng 3,5%", which is the confusion
    // itself. A reader who scans headings must not learn the wrong unit.
    const c03 = EDUCATION_ARTICLES.find((a) => a.planId === "C03")!;
    const headings = c03.sections.map((s) => s.heading).join(" | ");
    expect(headings).toContain("3,5 điểm phần trăm");
    expect(headings).not.toContain("Lãi tăng 3,5%");
    // And the paragraph's own two framings are still both there.
    const prose = c03.sections.flatMap((s) => s.paragraphs).join(" ");
    expect(prose).toContain("3,5 ĐIỂM PHẦN TRĂM");
    expect(prose).toContain("46,67%");
  });

  it("every heading is a claim or a question, not a bare label", () => {
    for (const article of EDUCATION_ARTICLES) {
      for (const section of article.sections) {
        // A label is short. This is a floor, not a style guide: it catches a
        // heading that has stopped carrying an argument.
        expect(
          section.heading.length,
          `${article.planId}: "${section.heading}" is too short to carry a claim`,
        ).toBeGreaterThan(20);
      }
    }
  });
});

describe("dense explanations are broken up rather than trimmed", () => {
  it("keeps every paragraph under the length a phone screen swallows", () => {
    // The independent reading review measured one C08 paragraph filling more
    // than a 390 px screen on its own. The bound is on CHARACTERS because
    // that is what this data has; it is deliberately loose enough that
    // ordinary long paragraphs pass and only a multi-idea wall fails.
    for (const article of EDUCATION_ARTICLES) {
      for (const section of article.sections) {
        for (const paragraph of section.paragraphs) {
          expect(
            paragraph.length,
            `${article.planId} "${section.heading}" has a ${paragraph.length}-character paragraph`,
          ).toBeLessThan(620);
        }
      }
    }
  });

  it("C08 split the bounded-crossing explanation without losing any of it", () => {
    const c08 = EDUCATION_ARTICLES.find((a) => a.planId === "C08")!;
    const section = c08.sections.find((s) =>
      s.heading.includes("Thời gian ở là biến quan trọng nhất"),
    )!;
    const prose = section.paragraphs.join(" ");
    // All three facts the old single paragraph carried are still here.
    expect(prose).toContain("giữ được lợi thế đó đến hết đúng khoảng thời gian bạn đã chọn");
    expect(prose).toContain("Công cụ dò từ cuối kỳ về đầu");
    expect(prose).toContain("có thể biến mất");
    expect(prose).toContain("rồi bị đảo lại trước cuối kỳ");
    // And the field-name confusion the split inherited is gone: the nullable
    // thing is the RESULT row, not the required horizon input — clearing
    // that input withholds every result and both charts.
    expect(prose).toContain("“Mua bắt đầu có lợi từ tháng” để trống");
    expect(prose).not.toContain("ô “So sánh trong” để trống");
    // And the heading now carries the scope, not just the claim.
    expect(section.heading).toContain("chỉ đúng trong khoảng bạn chọn");
  });
});

describe("the rendered article escapes markup instead of styling it", () => {
  it("renders an emphasised phrase as a real <strong>", () => {
    const html = renderToStaticMarkup(
      createElement(ProseText, {
        text: "Khoản trả thấp hơn không có nghĩa là tổng chi phí thấp hơn.",
        emphasis: ["không có nghĩa là"],
      }),
    );
    expect(html).toContain("<strong");
    expect(html).toContain("không có nghĩa là</strong>");
    // Weight and darkness, never an underline: on this site an underline
    // means a link.
    expect(html).toContain("font-semibold");
    expect(html).not.toContain("underline");
  });

  it("escapes markup-like content in the paragraph AND in the phrase", () => {
    const html = renderToStaticMarkup(
      createElement(ProseText, {
        text: 'Cẩn thận <script>alert("x")</script> và <b>đậm</b>.',
        emphasis: ["<b>đậm</b>"],
      }),
    );
    // No executable or styling markup survives from the content.
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;đậm&lt;/b&gt;");
    // The only tag in the output is the one the component chose.
    expect(html.match(/<[a-z]/g) ?? []).toHaveLength(1);
  });

  it("renders the paragraph unchanged when nothing is emphasised", () => {
    const text = "Một đoạn không có nhấn mạnh nào.";
    const html = renderToStaticMarkup(
      createElement(ProseText, { text, emphasis: ["không khớp"] }),
    );
    expect(html).toBe(text);
  });

  it("reproduces every article paragraph character for character", () => {
    // The invariant that makes the mechanism safe, checked on real content:
    // emphasis is an overlay, so the visible text, the copied text and the
    // string in the JSON-LD are all still the same string.
    for (const article of EDUCATION_ARTICLES) {
      for (const block of blocks(article)) {
        for (const paragraph of block.paragraphs) {
          const rejoined = emphasise(paragraph, block.phrases)
            .map((span) => span.text)
            .join("");
          expect(rejoined, `${article.planId} ${block.name}`).toBe(paragraph);
        }
      }
    }
  });
});
