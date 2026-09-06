import { describe, it, expect } from "vitest";
import { faqSchema, calculatorSchema } from "@/lib/seo";

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
