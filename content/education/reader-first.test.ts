import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { EducationArticleBody } from "@/components/education/education-article";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_COLLECTION } from "@/content/education/collection";
import { EDUCATION_GROUPS } from "@/content/education/groups";
import { getCalculator } from "@/content/calculators/registry";
import { POSTS } from "@/content/posts";

const revisedNews = [
  "lai-suat-vay-mua-nha-neo-cao", "goi-tin-dung-uu-dai-nguoi-tre-duoi-35",
  "gioi-tre-mua-nha-thoi-bao-gia", "gia-nha-phu-hop-thu-nhap-trung-binh",
  "kha-nang-mua-nha-viet-nam-numbeo", "hon-30-nam-thu-nhap-de-mua-nha",
  "ma-dinh-danh-dien-tu-bat-dong-san", "chinh-sach-nha-o-thu-nhap-trung-binh",
  "uu-tien-mua-nha-gia-phu-hop-tren-20-trieu", "vay-von-mua-nha-o-xa-hoi-dieu-kien",
];

describe("reviewed reader-first publication contracts", () => {
  it("C22 distinguishes savings capacity from loan capacity and compares like-for-like", () => {
    const c22 = EDUCATION_ARTICLES.find((a) => a.planId === "C22")!;
    const text = JSON.stringify(c22.sections);
    expect(text).toContain("tích lũy thêm vẫn nâng tầm giá");
    expect(text).toContain("cùng giá căn nhà và tiền tự có");
    expect(text).toContain("khoảng 97 triệu");
    expect(text).not.toContain("tích lũy thêm không nâng tầm giá");
    expect(text).not.toContain("khoản trả gấp khoảng hai lần");
  });
  it("introduces reader decisions and an experiment, not a taxonomy defence", () => {
    expect(EDUCATION_COLLECTION.lede).toContain("vừa túi tiền");
    expect(EDUCATION_COLLECTION.scopeBody).toContain("thay bằng số của mình");
    expect(JSON.stringify(EDUCATION_COLLECTION)).not.toContain("Đây không phải tin tức");
    expect(JSON.stringify(EDUCATION_COLLECTION)).not.toContain("không cũ đi theo ngày");
  });

  it("keeps internal classification available without showing it as reader copy", () => {
    for (const group of EDUCATION_GROUPS) {
      expect(group.boundary.length).toBeGreaterThan(50);
      expect(group.description.length).toBeGreaterThan(50);
      const article = EDUCATION_ARTICLES.find((a) => a.group === group.id)!;
      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article }));
      expect(html).toContain(group.description);
      expect(html).not.toContain(group.boundary);
    }
  });

  it.each(revisedNews)("%s retains its source and offers a relevant next step", (slug) => {
    const post = POSTS.find((p) => p.slug === slug)!;
    const body = readFileSync(new URL(`../posts/${slug}.md`, import.meta.url), "utf8");
    expect(post.source?.url).toMatch(/^https:/);
    expect(body).toContain(post.source!.url);
    expect(body).not.toContain("FinHome chỉ tổng hợp góc nhìn");
    // A legal-information item needs a verification question, not a forced calculator CTA.
    if (slug === "ma-dinh-danh-dien-tu-bat-dong-san") {
      expect(body).toContain("nơi tra cứu chính thức");
    } else {
      const tools = [...body.matchAll(/\]\(\/cong-cu\/([^/]+)\/\)/g)];
      expect(tools.length).toBeGreaterThan(0);
      for (const [, tool] of tools) expect(getCalculator(tool)?.status).toBe("live");
    }
  });

  it("C21 uses programme-specific assumptions without changing other loan charts", () => {
    const c21 = EDUCATION_ARTICLES.find((a) => a.planId === "C21")!;
    expect(c21.visualAssumptions?.length).toBeGreaterThanOrEqual(3);
    const html = renderToStaticMarkup(createElement(EducationArticleBody, { article: c21 }));
    expect(html).not.toContain("6–24 tháng");
    expect(html).toContain("5,4%");
    expect(html).toContain("phí");
    const c02 = EDUCATION_ARTICLES.find((a) => a.planId === "C02")!;
    const ordinary = renderToStaticMarkup(createElement(EducationArticleBody, { article: c02 }));
    expect(ordinary).toContain("6–24 tháng");
  });

  it("C19 avoids double-counting existing fees or dropping rent before it ends", () => {
    const c19 = EDUCATION_ARTICLES.find((a) => a.planId === "C19")!;
    expect(c19.shortAnswer.join(" ")).toContain("Nếu đã tính phí này, đừng cộng lại");
    expect(c19.exercise.check).toContain("vừa thuê vừa trả vay");
    expect(c19.exercise.check).toContain("chỉ thay bằng mức mới");
  });

  it("C16 distinguishes current renting from a permanent past-rental exclusion", () => {
    const c16 = EDUCATION_ARTICLES.find((a) => a.planId === "C16")!;
    expect(JSON.stringify(c16.sections)).toContain("không đang thuê tại thời điểm đăng ký mua");
    expect(c16.sources.items.some((s) => s.url.includes("102260714151135488"))).toBe(true);
  });

  it("C21 qualifies the interest comparison as a model, not a realised programme benefit", () => {
    const c21 = EDUCATION_ARTICLES.find((a) => a.planId === "C21")!;
    expect(c21.visualReading).not.toContain("gần như toàn lãi");
    expect(JSON.stringify(c21.sections)).toContain("3,1 điểm phần trăm");
    expect(c21.exercise.change).toContain("chưa phải lợi ích thực nhận");
  });
});
