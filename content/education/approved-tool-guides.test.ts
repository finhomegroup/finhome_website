import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { APPROVED_C01, APPROVED_C03, APPROVED_C08 } from "./approved-tool-guides";
import { EducationArticleBody } from "@/components/education/education-article";
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
