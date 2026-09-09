import { describe, it, expect } from "vitest";
import { faqSchema, calculatorSchema, pageMetadata } from "@/lib/seo";
import { metadata as rootMetadata } from "@/app/layout";
import { SITE } from "@/content/site";

describe("faqSchema", () => {
  it("maps items to a FAQPage with Question/Answer pairs", () => {
    const schema = faqSchema([
      { q: "Câu hỏi 1?", a: "Trả lời 1." },
      { q: "Câu hỏi 2?", a: "Trả lời 2." },
    ]);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Câu hỏi 1?",
        acceptedAnswer: { "@type": "Answer", text: "Trả lời 1." },
      },
      {
        "@type": "Question",
        name: "Câu hỏi 2?",
        acceptedAnswer: { "@type": "Answer", text: "Trả lời 2." },
      },
    ]);
  });

  it("handles an empty list", () => {
    expect(faqSchema([]).mainEntity).toEqual([]);
  });
});

describe("calculatorSchema", () => {
  const schema = calculatorSchema({
    name: "Quy tắc 72",
    description: "Tính số năm để tiền nhân đôi.",
    path: "/cong-cu/quy-tac-72",
  });

  it("is a free Vietnamese finance WebApplication", () => {
    expect(schema["@type"]).toBe("WebApplication");
    expect(schema.applicationCategory).toBe("FinanceApplication");
    expect(schema.inLanguage).toBe("vi-VN");
    expect(schema.isAccessibleForFree).toBe(true);
  });

  it("builds an absolute, trailing-slash URL from the path", () => {
    expect(schema.url).toMatch(/\/cong-cu\/quy-tac-72\/$/);
    expect(String(schema.url).startsWith("http")).toBe(true);
  });

  it("carries the supplied name and description", () => {
    expect(schema.name).toBe("Quy tắc 72");
    expect(schema.description).toBe("Tính số năm để tiền nhân đôi.");
  });

  it("is serialisable (JsonLd stringifies it)", () => {
    expect(() => JSON.stringify(schema)).not.toThrow();
  });
});

/**
 * Every `openGraph` / `twitter` key the root layout sets. Next REPLACES both
 * objects wholesale rather than merging them field by field, so a route-level
 * object that omits any of these ships a page whose card is WORSE than one
 * with no object at all. Read off app/layout.tsx rather than hardcoded, so
 * the lists cannot drift.
 */
function rootKeys(which: "openGraph" | "twitter"): string[] {
  return Object.keys(
    (rootMetadata[which] ?? {}) as Record<string, unknown>,
  ).sort();
}

describe("pageMetadata", () => {
  const meta = pageMetadata({
    path: "/vision/",
    title: "Tầm nhìn & Sứ mệnh",
    description: "Mô tả trang.",
  });

  it("restates every openGraph key the root layout sets", () => {
    const og = meta.openGraph as Record<string, unknown>;
    for (const key of rootKeys("openGraph")) {
      expect(og, `openGraph.${key} is missing`).toHaveProperty(key);
    }
    expect(og.siteName).toBe(SITE.name);
    expect(og.locale).toBe(SITE.locale);
    expect(og.images).toEqual([
      { url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name },
    ]);
  });

  it("restates every twitter key too, so the card is the page's not the homepage's", () => {
    const tw = meta.twitter as Record<string, unknown>;
    for (const key of rootKeys("twitter")) {
      expect(tw, `twitter.${key} is missing`).toHaveProperty(key);
    }
    expect(tw.card).toBe("summary_large_image");
    // The shipped defect: twitter:title equal to the root layout's while
    // og:title was per-page.
    expect(tw.title).not.toBe(SITE.title);
    expect(tw.title).toBe((meta.openGraph as Record<string, unknown>).title);
    expect(tw.description).toBe(
      (meta.openGraph as Record<string, unknown>).description,
    );
  });

  it("appends the brand to the card title but not to the document title", () => {
    expect(meta.title).toBe("Tầm nhìn & Sứ mệnh");
    expect((meta.openGraph as Record<string, unknown>).title).toBe(
      "Tầm nhìn & Sứ mệnh — FinHome",
    );
  });

  it("is self-canonical, and og:url matches", () => {
    expect(meta.alternates?.canonical).toBe("/vision/");
    expect((meta.openGraph as Record<string, unknown>).url).toBe("/vision/");
  });

  it("takes a per-page image and an article type for blog posts", () => {
    const post = pageMetadata({
      path: "/blog/abc/",
      title: "Tiêu đề bài",
      description: "Trích dẫn.",
      ogType: "article",
      image: { url: "https://www.finhome.group/images/blog/abc.jpg", alt: "Tiêu đề bài" },
      publishedTime: "2026-01-02",
    });
    const og = post.openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-01-02");
    expect(og.images).toEqual([
      { url: "https://www.finhome.group/images/blog/abc.jpg", alt: "Tiêu đề bài" },
    ]);
    // twitter carries the same per-page image, as a bare URL list.
    expect((post.twitter as Record<string, unknown>).images).toEqual([
      "https://www.finhome.group/images/blog/abc.jpg",
    ]);
  });

  it("omits publishedTime when there is none, rather than emitting undefined", () => {
    const og = pageMetadata({ path: "/blog/", title: "T", description: "D" })
      .openGraph as Record<string, unknown>;
    expect("publishedTime" in og).toBe(false);
  });
});
