// A scoped factual-copy guard for the Eco Home 1 news body.
//
// WHY THIS FILE EXISTS. The upstream commit that added this article shipped a
// body that contradicted its own cited source and its own metadata. An
// independent review read the cited page (Báo điện tử Bộ Xây dựng, published
// 14/09/2026) and recorded, in
// `artifacts/finhome-tools-audit-2026-09-14/upstream-integration-2026-09-15.md`:
//
//   - the body said the registration window ended 15/10/2024, while the source
//     is a 2026 report quoting 14/9–15/10 and the post's own `date` is
//     2026-09-15;
//   - the body placed the project in huyện Hóc Môn, while the source names
//     đường Trường Chinh, phường Phú Mỹ;
//   - the body expanded HODECO as "Công ty Phát triển nhà ở Hóc Môn", while
//     the source names Công ty Cổ phần Phát triển Nhà Bà Rịa – Vũng Tàu;
//   - the body compared the price against a 40–70 triệu/m² commercial range
//     that the cited source does not contain.
//
// The repair corrects the first three from that recorded source reading and
// REMOVES the fourth rather than inventing research to support it. This test
// pins the corrections so a future edit cannot quietly restore them, and pins
// the metadata (slug, image, date, source URL) that the repair had to leave
// alone.
//
// PROVENANCE LIMIT, STATED ON PURPOSE: the corrected facts come from the
// review's recorded reading of the cited page, not from a fetch performed
// here. Anything beyond those four points is not asserted.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { POSTS, newsPosts } from "@/content/posts";

const SLUG = "tp-hcm-340-can-nha-o-xa-hoi-eco-home-1-dang-ky";

const entry = POSTS.find((post) => post.slug === SLUG);
const body = readFileSync(`content/posts/${SLUG}.md`, "utf8");

describe("the Eco Home 1 news entry", () => {
  it("is present exactly once, in the news feed", () => {
    expect(POSTS.filter((post) => post.slug === SLUG)).toHaveLength(1);
    expect(newsPosts().some((post) => post.slug === SLUG)).toBe(true);
  });

  it("keeps the upstream metadata the copy repair must not touch", () => {
    // The image, the slug, the date and the source citation are the parts of
    // this article that were correct and are the user's upstream artifact.
    expect(entry?.cover).toBe(`/images/blog/${SLUG}.jpg`);
    expect(entry?.date).toBe("2026-09-15");
    expect(entry?.source?.name).toBe("batdongsan.baoxaydung.vn");
    expect(entry?.source?.url).toContain("baoxaydung.vn");
  });
});

describe("the Eco Home 1 body, after the factual repair", () => {
  it("dates the registration window in 2026, not 2024", () => {
    // The post's own metadata says 2026-09-15 and the cited report is from
    // 14/09/2026, so a 2024 deadline contradicted both.
    expect(body).toContain("15/10/2026");
    expect(body).not.toContain("15/10/2024");
    expect(body).not.toContain("2024");
  });

  it("places the project where the cited source places it", () => {
    expect(body).toContain("đường Trường Chinh");
    expect(body).toContain("phường Phú Mỹ");
    expect(body).not.toContain("Hóc Môn");
  });

  it("expands HODECO as the company the source names", () => {
    expect(body).toContain("Công ty Cổ phần Phát triển Nhà Bà Rịa – Vũng Tàu");
    expect(body).toContain("HODECO");
    expect(body).not.toContain("Phát triển nhà ở Hóc Môn");
  });

  it("drops the commercial price comparison the source does not support", () => {
    // Removed, not re-sourced: no research was done here to back a range, so
    // the honest move is to stop asserting one.
    expect(body).not.toContain("40-70");
    expect(body).not.toContain("40–70");
    expect(body).toContain("không so sánh mức giá này với giá căn hộ thương mại");
  });

  it("states what the 19,8 triệu/m² figure does and does not include", () => {
    // From the cited source: the figure includes VAT and excludes the 2%
    // maintenance fund. A buyer multiplying it out needs both.
    expect(body).toContain("19,8 triệu đồng/m²");
    expect(body).toContain("đã gồm thuế giá trị gia tăng");
    expect(body).toContain("phí bảo trì 2%");
  });

  it("attributes the reported facts rather than asserting them as its own", () => {
    expect(body).toContain("theo bài đăng trên Báo điện tử Bộ Xây dựng");
    expect(body).toContain("ngày 14/9/2026");
  });

  it("labels its own arithmetic as arithmetic, with the real range", () => {
    // 32,32 × 19,8 = 639,936 triệu and 63,61 × 19,8 = 1.259,478 triệu, from
    // the two figures the source reports. Computed independently, not read
    // off any production module.
    expect(body).toContain("khoảng 640 triệu");
    expect(body).toContain("khoảng 1,26 tỷ");
    expect(body).toContain("phép nhân của FinHome trên số liệu báo đăng");
    expect(body).toContain("không phải báo giá của chủ đầu tư");
  });

  it("gives no eligibility verdict and claims no authority", () => {
    // Social-housing eligibility is decided by the competent authority. The
    // article may report the window; it may not tell a reader they qualify.
    expect(body).toContain("do cơ quan có thẩm quyền xét duyệt");
    expect(body).toContain("FinHome không xác định bạn có thuộc diện được mua");
    for (const claim of [
      "bạn đủ điều kiện",
      "bạn sẽ được mua",
      "chắc chắn được duyệt",
      "FinHome sẽ giúp bạn nộp hồ sơ",
    ]) {
      expect(body).not.toContain(claim);
    }
  });
});
