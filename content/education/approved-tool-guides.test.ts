import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { APPROVED_C01, APPROVED_C03, APPROVED_C08 } from "./approved-tool-guides";
import { EducationArticleBody } from "@/components/education/education-article";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { computeAffordability } from "@/lib/calc/affordability";
import { buildPhases, computeFloatingLoan } from "@/lib/calc/floating-loan";
import { compareRentVsBuy } from "@/lib/calc/rent-vs-buy";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { EDUCATION_VISUAL_LABELS } from "./visual-labels";

function jpegDimensions(bytes: Buffer) {
  expect(bytes.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  let offset = 2;
  while (offset + 8 < bytes.length) {
    const marker = bytes[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error("Missing JPEG frame dimensions");
}

describe("approved tool guides use the same hypothetical as the real tools", () => {
  it("C01 keeps housing costs separate and matches the 45/40 household", () => {
    const visual = APPROVED_C01.visual;
    if (visual.kind !== "affordabilityPrice") throw new Error("wrong visual");
    const result = computeAffordability(visual.input)!;
    expect(visual.input.monthlyNetIncome).toBe(40e6);
    expect(visual.input.monthlyHousingCosts).toBe(2e6);
    expect(result.maxPrice).toBeCloseTo(1_939_806_716, 0);
    expect(result.maxLoan).toBeCloseTo(1_498_000_918, 0);
    expect(result.cashToPrice).toBeCloseTo(441_805_799, 0);
    const resolved = resolveEducationVisual(visual, EDUCATION_VISUAL_LABELS);
    if (resolved.kind !== "chart" || resolved.model.kind !== "bars") throw new Error("wrong chart");
    expect(resolved.model.bars).toHaveLength(2);
    expect(APPROVED_C01.visualReading).toContain("Hai thanh");
    expect(APPROVED_C01.visualReading).not.toContain("Ba thanh");
  });

  it("C03 resets in month 13 and compares with the declared 18-million budget", () => {
    const visual = APPROVED_C03.visual;
    if (visual.kind !== "floatingTimeline") throw new Error("wrong visual");
    const result = computeFloatingLoan({ amount: visual.amount, phases: buildPhases(visual)! })!;
    expect(visual.monthlyBudget).toBe(18e6);
    expect(result.firstPayment).toBeCloseTo(16_111_864, 0);
    expect(result.highestPayment).toBeCloseTo(20_479_346, 0);
    expect(result.highestPayment - visual.monthlyBudget!).toBeCloseTo(2_479_346, 0);
    expect(result.paymentShockPercent).toBeCloseTo(27.11, 2);
    expect(APPROVED_C03.visualReading).toContain("tháng 13");
  });

  it("C08 keeps one initial cash pool and flips the endpoint at 0% price growth", () => {
    const visual = APPROVED_C08.visual;
    if (visual.kind !== "rentBuyScenarios") throw new Error("wrong visual");
    expect(visual.growthPercents).toEqual([0, 5, 8]);
    const growth = compareRentVsBuy(visual.input)!;
    const flat = compareRentVsBuy({ ...visual.input, priceGrowthPercent: 0 })!;
    expect(growth.monthlyPayment).toBeCloseTo(18_224_288, 0);
    expect(growth.investedCash).toBe(970e6);
    expect(growth.rent.netCost).toBeCloseTo(1_393_977_016, 0);
    expect(growth.buy.netCost).toBeCloseTo(216_701_462, 0);
    expect(growth.rent.netCost - growth.buy.netCost).toBeCloseTo(1_177_275_554, 0);
    expect(flat.buy.netCost - flat.rent.netCost).toBeCloseTo(652_807_810, 0);
    expect(flat.rent.netCost).toBe(growth.rent.netCost);
  });
});

describe("observed images supplement accessible computed charts", () => {
  for (const article of [APPROVED_C01, APPROVED_C03, APPROVED_C08]) {
    it(`${article.planId} renders real local screenshots, captions and tool links`, () => {
      const media = article.sections.flatMap(section => section.media ? [section.media] : []);
      expect(media).toHaveLength(article.planId === "C01" ? 2 : 1);
      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article }));
      for (const picture of media) {
        const bytes = readFileSync(join(process.cwd(), "public", picture.src));
        expect(picture.src).toMatch(/\.jpg$/);
        expect(jpegDimensions(bytes)).toEqual({ width: picture.width, height: picture.height });
        expect(html).toContain(picture.src);
        expect(html).toContain(picture.caption);
        expect(picture.alt.length).toBeGreaterThan(60);
      }
      expect(html).toContain("<svg");
      expect(html).toContain("<table");
      expect(html).toMatch(new RegExp(`href="/cong-cu/${article.exercise.toolSlug}/?"`));
      expect(html).not.toContain("BẢN THẢO CHỜ DUYỆT");
      expect(html).not.toContain("apps.apple.com");
      expect(html).not.toContain("play.google.com");
      expect(article.provenance).toContain("chưa được chuyên gia độc lập thẩm định");
    });
  }
});

it("explains the money before the financial labels", () => {
  const budget = APPROVED_C01.sections.flatMap(s => s.paragraphs).join(" ");
  expect(budget).toContain("40 − 17 − 3 − 5 − 2 = 13 triệu");
  expect(budget).toContain("Mỗi khoản tiền chỉ được tính vào một ngăn");
  const rate = APPROVED_C03.sections.flatMap(s => s.paragraphs).join(" ");
  expect(rate).toContain("Dư nợ là phần tiền vay bạn chưa trả hết");
  expect(rate).toContain("16,11 triệu, sau đó là 20,48 triệu");
  const rentBuy = APPROVED_C08.sections.flatMap(s => s.paragraphs).join(" ");
  expect(rentBuy).toContain("đã bỏ vào bao nhiêu tiền, và lúc đó còn lại bao nhiêu");
  expect(rentBuy).toContain("tiền bán nhà, trừ khoản nợ chưa trả hết và phí bán");
  expect(rentBuy).toContain("gồm cả vốn ban đầu lẫn phần lãi giả định");
  expect(rentBuy).toContain("trừ khoản đầu tư còn lại và tiền cọc được hoàn");
});

/** Width and height of a lossy (`VP8 `) or extended (`VP8X`) WebP. */
function webpDimensions(bytes: Buffer) {
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (chunk === "VP8 ") {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`Unexpected WebP chunk ${chunk}`);
}

describe("C01's balance illustration sits in its explanatory section, beside — never in place of — the computed visual", () => {
  const art = APPROVED_C01.illustration!;
  const html = renderToStaticMarkup(createElement(EducationArticleBody, { article: APPROVED_C01 }));
  const at = html.indexOf('data-education-illustration="true"');
  const SECTION = "Có 600 triệu, không có nghĩa dùng cả 600 triệu trả trước";

  it("renders once: the AI hero opens the article, the illustration follows the reserve-kept-separate text", () => {
    expect(art).toBeDefined();
    expect(html.split('data-education-illustration="true"').length - 1).toBe(1);
    // Opening (2026-10-01): answer → early tool link → AI web hero → contents.
    const answer = html.indexOf(`>${C.article.answerTitle}</h2>`);
    const earlyTool = html.indexOf(C.article.earlyToolLead);
    const hero = html.indexOf('data-article-hero="true"');
    const contents = html.indexOf(`>${C.article.contentsTitle}</h2>`);
    for (const i of [answer, earlyTool, hero, contents]) expect(i).toBeGreaterThan(-1);
    expect(answer).toBeLessThan(earlyTool);
    expect(earlyTool).toBeLessThan(hero);
    expect(hero).toBeLessThan(contents);
    // Body: the illustration is no longer in the opening; it renders inside
    // the section that keeps the 100 triệu reserve separate, after ALL of its
    // paragraphs and before that section's tool capture and the next section.
    expect(art.inSection).toBe(SECTION);
    const section = APPROVED_C01.sections.find((s) => s.heading === SECTION)!;
    expect(section.paragraphs.join(" ")).toContain("Khoản dự phòng 100 triệu vẫn được giữ riêng");
    const heading = html.indexOf(`>${SECTION}</h2>`);
    const lastParagraph = html.indexOf("Nó là điểm bắt đầu để bạn loại bớt");
    const capture = html.indexOf(section.media!.src);
    const next = APPROVED_C01.sections[APPROVED_C01.sections.indexOf(section) + 1];
    expect(contents).toBeLessThan(html.indexOf(`>${APPROVED_C01.household.title}</h2>`));
    expect(html.indexOf(`>${APPROVED_C01.household.title}</h2>`)).toBeLessThan(heading);
    expect(heading).toBeLessThan(lastParagraph);
    expect(lastParagraph).toBeLessThan(at);
    expect(at).toBeLessThan(capture);
    expect(capture).toBeLessThan(html.indexOf(`>${next.heading}</h2>`));
    // All of that section's financial text is still rendered (emphasis aside).
    for (const p of section.paragraphs) {
      expect(html.replace(/<\/?strong[^>]*>/g, ""), p.slice(0, 40)).toContain(p);
    }
    // The computed visual is still rendered, further down, unchanged (icons
    // in the opening and contents are SVGs too, so search after the figure).
    expect(html.indexOf("<svg", at)).toBeGreaterThan(at);
    expect(html.indexOf("<table", at)).toBeGreaterThan(at);
    expect(html.lastIndexOf(APPROVED_C01.visual.title)).toBeGreaterThan(at);
    // The two observed captures are unchanged and still JPEG screenshots.
    const media = APPROVED_C01.sections.flatMap((s) => (s.media ? [s.media] : []));
    expect(media.map((m) => m.src)).toEqual([
      "/images/education/tool-guides-20260923/01-budget-chart.jpg",
      "/images/education/tool-guides-20260923/01-budget-result.jpg",
    ]);
  });

  it("is a labelled, captioned local WebP set with the declared aspect ratio", () => {
    const figure = html.slice(at, html.indexOf("</figure>", at));
    expect(figure).toContain(`src="${art.src}"`);
    expect(figure).toMatch(new RegExp(`srcSet="${art.srcSet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i"));
    expect(figure).toContain(`alt="${art.alt}"`);
    expect(figure).toContain(art.badge);
    expect(figure).toContain("<figcaption");
    expect(figure).toContain(art.caption);
    expect(art.badge).toBe("Hình minh họa");
    // FULL article-column width (2026-10-01, user preference: an informative
    // figure is not narrower than the text), keeping the overlay badge and
    // the full sentence caption that explains the metaphor.
    expect(art.layout).toBe("full");
    expect(html.slice(html.lastIndexOf("<figure", at), at + 120)).toContain(
      'data-illustration-layout="full" class="w-full"',
    );
    expect(figure).toContain('sizes="(min-width: 768px) 48rem, 100vw"');
    expect(figure).not.toContain("max-w-xl");
    expect(figure).toContain("absolute left-3 top-3");
    expect(figure).toContain('<figcaption class="mt-3 text-sm leading-relaxed text-ink-3">');
    // Explains the metaphor and the reserve, qualifies briefly, and points at
    // nothing "above" it.
    expect(art.caption).toContain("khoản dự phòng");
    expect(art.caption).toContain("không dùng để mua nhà");
    expect(art.caption).toContain("không thể hiện giá nhà hay mức vay");
    expect(art.caption).not.toMatch(/phía trên|ở trên/);
    expect(figure).not.toContain('loading="lazy"');
    const files = art.srcSet.split(",").map((entry) => entry.trim().split(" "));
    expect(files.map(([, w]) => w)).toEqual(["720w", "1200w"]);
    expect(files[0][0]).toBe(art.src);
    for (const [src, w] of files) {
      expect(src).toMatch(/^\/images\/education\/[a-z0-9-]+\.webp$/);
      const size = webpDimensions(readFileSync(join(process.cwd(), "public", src)));
      expect(size.width).toBe(Number.parseInt(w, 10));
      expect(size.width / size.height).toBeCloseTo(art.width / art.height, 2);
    }
  });

  it("is C01's, plus the two AI illustrations the user approved for C05 and C11 — no other article", () => {
    // 2026-10-01: user-approved editorial exception, tested in
    // content/loan-decision-series.test.ts. Any further article still fails here.
    expect(EDUCATION_ARTICLES.filter((a) => a.illustration).map((a) => a.slug)).toEqual([
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "hai-goi-vay-thang-thap-co-re-hon",
      "lai-co-dinh-hay-tha-noi",
    ]);
  });
});
