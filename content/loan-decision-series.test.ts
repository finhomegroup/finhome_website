/**
 * Series wave 2 (2026-10-01): the two loan-decision packages — C05 on
 * /cong-cu/so-sanh-khoan-vay/ and C11 on /cong-cu/lai-co-dinh-hay-tha-noi/ —
 * each reusing its structured article. See
 * docs/loan-decision-education-2026-10-01.md.
 *
 * Every quoted figure is recomputed with `compareLoans`; the "reproduce the
 * example" instructions are replayed against the tools' REAL defaults; every
 * quoted control is a label the tool prints. Photo and export gates are
 * honest in both directions: pending means nothing shipped under that name,
 * not pending means everything is there and distinct.
 *
 * WHAT IT CANNOT: appearance, fonts, a real click, or the identity of anyone
 * in a photo.
 */
import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import {
  LOAN_DECISION_PENDING_EXPORTS,
  LOAN_DECISION_PENDING_PHOTOS,
  LOAN_DECISION_SERIES,
  TOOL_EDUCATION_SERIES,
} from "@/content/tool-education-series";
import { POSTS, getPost, postKind } from "@/content/posts";
import { getEducationArticle } from "@/content/education/articles";
import type { EducationArticle } from "@/content/education/types";
import { getCalculator } from "@/content/calculators/registry";
import { TOOL_NEXT_STEPS } from "@/content/calculators/next-steps";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { LOAN_COMPARE_LEARNING } from "@/content/calculators/loan-compare-learning";
import { FIXED_VS_FLOATING } from "@/content/calculators/fixed-vs-floating";
import { compareLoans, type LoanOption } from "@/lib/calc/loan-compare";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { EducationArticleBody } from "@/components/education/education-article";
import { postCover } from "@/content/post-cover";
import { LOAN_DECISION_AI_IMAGES } from "@/content/loan-decision-ai-images";
import { createHash } from "node:crypto";

const read = (path: string) => readFileSync(path, "utf8");
const SITE = "https://www.finhome.group";
const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")} ₫`;
/** Rounded millions as the prose writes them: "1.041,4", "26,3", "16,11". */
const mil = (n: number, digits = 1) =>
  (n / 1e6).toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const article = (slug: string) => getEducationArticle(slug)!;
const allText = (a: EducationArticle) => JSON.stringify(a);
const prose = (a: EducationArticle) => [...a.shortAnswer, ...a.sections.flatMap((s) => s.paragraphs)].join(" ");
const section = (a: EducationArticle, heading: string) => {
  const s = a.sections.find((x) => x.heading === heading);
  expect(s, heading).toBeDefined();
  return s!;
};
const REPRODUCE = "Tính lại đúng ví dụ của bài trên công cụ";
const pkg = (tool: string) => ({ html: read(`public/social/${tool}/index.html`), caption: read(`public/social/${tool}/caption.md`) });
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));

const C05 = "hai-goi-vay-thang-thap-co-re-hon";
const C11 = "lai-co-dinh-hay-tha-noi";
const AMOUNT = 2e9;
const A: LoanOption = { annualRatePercent: 8.5, termMonths: 240, feePercent: 0 };
const B: LoanOption = { annualRatePercent: 8.5, termMonths: 300, feePercent: 1 };
const FIXED: LoanOption = { annualRatePercent: 10.5, termMonths: 240 };
const floating = (post: number): LoanOption => ({ annualRatePercent: post, termMonths: 240, promoMonths: 12, promoRatePercent: 7.5 });
const at = (options: LoanOption[], horizonMonths: number) => compareLoans({ amount: AMOUNT, options, horizonMonths })!;

describe("the wave maps two tools to their existing articles, no duplicate post", () => {
  it("reuses C05 and C11 in place", () => {
    expect(LOAN_DECISION_SERIES.map((e) => [e.tool, e.article, e.kind])).toEqual([
      ["so-sanh-khoan-vay", C05, "reuse"],
      ["lai-co-dinh-hay-tha-noi", C11, "reuse"],
    ]);
    for (const e of LOAN_DECISION_SERIES) {
      expect(getCalculator(e.tool)?.status, e.tool).toBe("live");
      expect(existsSync(`app/cong-cu/${e.tool}/page.tsx`)).toBe(true);
      expect(postKind(getPost(e.article)!), e.article).toBe("education");
      expect(article(e.article).exercise.toolSlug, e.article).toBe(e.tool);
      // Reuse: no cover slot, so no cover or flow export.
      expect(e.exports).toEqual([]);
      expect(getPost(e.article)!.cover).toBeUndefined();
      expect(TOOL_EDUCATION_SERIES.some((x) => x.tool === e.tool || x.article === e.article)).toBe(false);
    }
    const slugs = POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps each article's computed visual, scenario and formulas unchanged", () => {
    expect(article(C05).visual).toEqual({
      kind: "compareCost",
      title: "Chi phí hai phương án tại tháng thứ 300",
      amount: AMOUNT,
      options: [A, B],
      optionLabels: ["Phương án A", "Phương án B", "Phương án C"],
      horizonMonths: 300,
    });
    const v = article(C11).visual;
    expect(v.kind).toBe("fixedFloatingPaths");
    if (v.kind === "fixedFloatingPaths") {
      expect([v.amount, v.termMonths, v.promoMonths, v.promoRatePercent, v.fixedRatePercent]).toEqual([AMOUNT, 240, 12, 7.5, 10.5]);
      expect(v.postRatePercents).toEqual([9, 11, 13]);
    }
  });

  it("links each tool back to its article through the shared new-tab education link", () => {
    for (const e of LOAN_DECISION_SERIES) {
      expect(TOOL_NEXT_STEPS[e.tool]?.education?.href, e.tool).toBe(`/blog/${e.article}/`);
      const html = renderToStaticMarkup(createElement(ToolNextSteps, { slug: e.tool, promoted: true }));
      expect(html, e.tool).toMatch(new RegExp(`<a\\b[^>]*href="/blog/${e.article}/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`));
    }
  });
});

describe("C05 — monthly cash, interest + fees and debt at month 60 and month 300", () => {
  const a = article(C05);
  const h60 = at([A, B], 60);
  const h300 = at([A, B], 300);
  const [a60, b60] = h60.rows as NonNullable<(typeof h60.rows)[number]>[];
  const [a300, b300] = h300.rows as NonNullable<(typeof h300.rows)[number]>[];

  it("states the engine's own winners: A cheaper at both horizons, no flip", () => {
    expect([h60.bestIndex, h300.bestIndex, h60.horizonChangesWinner]).toEqual([0, 0, false]);
    expect(b60.monthlyPayment).toBeLessThan(a60.monthlyPayment);
  });

  it("quotes every results row exactly as the engine computes it", () => {
    const rows = a.sections.flatMap((s) => s.results?.rows ?? []);
    const expected: Record<string, number> = {
      "Gói A — 20 năm": a60.monthlyPayment,
      "Gói B — 25 năm": b60.monthlyPayment,
      "Tiền đã trả — gói A": a60.horizonPaid,
      "Tiền đã trả — gói B, gồm cả phí": b60.horizonPaid + b60.upfrontFee,
      "Còn nợ — gói A": a60.horizonBalance,
      "Còn nợ — gói B": b60.horizonBalance,
      "Gói A — lãi cả kỳ hạn": a300.totalInterest,
      "Gói B — lãi cả kỳ hạn": b300.totalInterest,
      "Gói B — phí trả một lần": b300.upfrontFee,
    };
    for (const [label, value] of Object.entries(expected)) {
      expect(rows.find((r) => r.label === label)?.value, label).toBe(vnd(value));
    }
    const extra = rows.filter((r) => r.label === "Gói B tốn hơn gói A (lãi + phí)").map((r) => r.value);
    expect(extra).toEqual([vnd(h60.spread), vnd(h300.spread)]);
    expect(b300.upfrontFee).toBe(20_000_000);
  });

  it("explains the household cash trade-off with figures that add up", () => {
    const text = prose(a);
    const cashKept = a60.horizonPaid - (b60.horizonPaid + b60.upfrontFee);
    const extraDebt = b60.horizonBalance - a60.horizonBalance;
    // Cash kept now, minus debt still owed later, is the extra interest + fee.
    expect(cashKept - extraDebt).toBeCloseTo(-h60.spread, 2);
    const relief = a60.monthlyPayment - b60.monthlyPayment; // 1,25 (two decimals)
    expect(text).toContain(`${mil(relief, 2)} triệu`);
    // The quantified evidence lives in the SECTIONS, after the terms are explained.
    const body = a.sections.flatMap((s) => [s.heading, ...s.paragraphs]).join(" ");
    for (const value of [cashKept, extraDebt, h60.spread, a300.totalInterest, b300.totalInterest, h300.spread]) {
      expect(body, mil(value)).toContain(`${mil(value)} triệu`);
    }
    // ONE PLAIN IDEA UP FRONT: at most two amounts, none of the horizon evidence.
    const answer = a.shortAnswer.join(" ");
    expect(answer.match(/\d[\d.,]*\s*(triệu|tỷ)/g)?.length ?? 0).toBeLessThanOrEqual(2);
    expect(answer).toContain(`${mil(relief, 2)} triệu`);
    for (const value of [h300.spread, h60.spread, extraDebt]) expect(answer).not.toContain(mil(value));
    expect(answer).toContain("cùng số tiền vay và cùng lãi suất");
    // Terms are explained before figures; claims are bound to the example.
    expect(a.sections[0].heading).toBe("Khoản trả hằng tháng gồm tiền gốc và tiền lãi");
    expect(text).toContain("Gốc là số tiền bạn mượn");
    expect(text).toContain("Dư nợ là phần gốc chưa trả");
    expect(text).toContain("có thể cộng thêm tiền lãi phát sinh đến ngày trả và phí theo hợp đồng");
    expect(text).toContain("Với hai gói này, những năm đầu phần lớn khoản trả là tiền lãi");
    expect(text).toContain("Nếu gia đình dự định bán nhà");
    expect(text).not.toContain("Nhiều người không giữ");
    expect(text).toContain("chưa chiết khấu");
    expect(text).not.toContain("DANH NGHĨA");
  });

  it("gives exact reproduce steps that turn the tool's defaults into the article's offers", () => {
    const f = LOAN_COMPARE.form;
    // The tool opens on a DIFFERENT sample; the steps must say what to change.
    expect([f.defaultAmount, f.defaults[0].rate, f.defaults[0].term, f.defaults[1].rate, f.defaults[1].term, f.defaultHorizon])
      .toEqual(["2.000.000.000", "8,5", "20", "9,2", "20", "60"]);
    const steps = section(a, REPRODUCE).paragraphs.join(" ");
    expect(steps).toContain("9,2%/năm trong 20 năm");
    expect(steps).toContain(`Giữ “${f.amountLabel}” là 2.000.000.000`);
    expect(steps).toContain(`“${f.optionLabels[0]}” với “${f.rateLabel}” 8,5, “${f.termLabel}” 20`);
    expect(steps).toContain(`Ở “${f.optionLabels[1]}”, đổi “${f.rateLabel}” thành 8,5 và “${f.termLabel}” thành 25`);
    expect(steps).toContain(`mở “${f.optionalFeesTitle}” và nhập 1 vào “${f.feeLabel}”`);
    expect(steps).toContain(`Ô “${f.horizonLabel}” đang là 60`);
    expect(steps).toContain("thành 300");
    // Replaying those edits on the defaults yields the article's offers.
    const replay = (rate: string, termYears: string, fee: string): LoanOption => ({
      annualRatePercent: num(rate), termMonths: num(termYears) * 12, feePercent: fee === "" ? 0 : num(fee),
    });
    expect([replay(f.defaults[0].rate, f.defaults[0].term, f.defaults[0].fee), replay("8,5", "25", "1")]).toEqual([A, B]);
    expect(num(f.defaultAmount)).toBe(AMOUNT);
  });
});

describe("C11 — three named scenarios at month 60 and month 240", () => {
  const a = article(C11);
  const run = (post: number, h: number) => at([FIXED, floating(post)], h);

  it("states each scenario's winners exactly as the engine ranks them", () => {
    expect([run(11, 60).bestIndex, run(11, 240).bestIndex, run(11, 60).horizonChangesWinner]).toEqual([1, 0, true]);
    for (const h of [60, 240]) {
      expect(run(9, h).bestIndex, `9% at ${h}`).toBe(1);
      expect(run(13, h).bestIndex, `13% at ${h}`).toBe(0);
    }
    const text = prose(a);
    expect(text).toContain("Ở kịch bản 9%/năm, phương án ưu đãi tốn ít hơn ở cả hai mốc");
    expect(text).toContain("ở kịch bản 13%/năm, phương án cố định tốn ít hơn ở cả hai mốc");
  });

  it("quotes the 11% scenario's horizon figures and balances from the engine", () => {
    const text = prose(a);
    const answer = a.shortAnswer.join(" ");
    // Horizon evidence in the body only; the short answer stays one plain idea.
    for (const value of [run(11, 60).spread, run(11, 240).spread]) {
      expect(text).toContain(`${mil(value)} triệu`);
      expect(answer).not.toContain(mil(value));
    }
    expect(answer.match(/\d[\d.,]*\s*(triệu|tỷ)/g)?.length ?? 0).toBeLessThanOrEqual(2);
    const [f60, p60] = run(11, 60).rows as NonNullable<ReturnType<typeof run>["rows"][number]>[];
    // The debt comparison is bound to its scenario.
    expect(text).toContain(`Trong kịch bản 11%/năm, ở tháng 60 dư nợ hai bên chênh nhau không nhiều — khoảng ${mil(f60.horizonBalance)} triệu ở bên cố định và ${mil(p60.horizonBalance)} triệu ở bên ưu đãi`);
    // Fixed periods can end; the 20-year fixed side is a stated hypothetical.
    expect(text).toContain("Thời gian cố định có thể chỉ vài năm");
    expect(text).toContain("Mức cố định suốt 20 năm trong bài là giả định");
    expect(answer).toContain("trả ít hơn trong năm đầu");
    expect(text).not.toMatch(/thả nổi luôn|luôn trả ít hơn/);
    // The payment uncertainty leads; the equivalent-rate detail stays last and optional.
    expect(answer).toContain("khoản trả hằng tháng có thể thay đổi");
    expect(a.sections.at(-1)!.heading).toContain("lãi tương đương");
    expect(a.sections.at(-1)!.paragraphs[0]).toContain("có thể bỏ qua");
  });

  it("gives exact reproduce steps from the tool's 9,5% sample to the article's 10,5%", () => {
    const d = FIXED_VS_FLOATING.compare.defaults;
    const f = LOAN_COMPARE.form;
    expect([d[0].rate, d[0].term, d[0].promoMonths, d[1].rate, d[1].term, d[1].promoMonths, d[1].promoRate, f.defaultHorizon])
      .toEqual(["9,5", "20", "", "11", "20", "12", "7,5", "60"]);
    const steps = section(a, REPRODUCE).paragraphs.join(" ");
    const [sideA, sideB] = FIXED_VS_FLOATING.compare.sideNames;
    expect(steps).toContain(`đổi “${f.rateLabel}” của “${sideA}” từ 9,5 thành 10,5`);
    expect(steps).toContain(`“${sideB}” đã là 7,5%/năm trong 12 tháng rồi 11%/năm`);
    expect(steps).toContain(`Ô “${f.horizonLabel}” đang là 60; đổi thành 240`);
    expect(num("10,5")).toBe(FIXED.annualRatePercent);
    expect([num(d[1].rate), num(d[1].promoMonths), num(d[1].promoRate)]).toEqual([11, 12, 7.5]);
  });

  it("the tool's own hint and FAQ name the promotional field exactly as the form prints it", () => {
    const label = LOAN_COMPARE.form.promoRateLabel;
    expect(label).toBe("Lãi ưu đãi");
    for (const text of [FIXED_VS_FLOATING.compare.fixedSideHint, FIXED_VS_FLOATING.faq.items[0].a]) {
      expect(text).toContain(`“${label}”`);
      expect(text).not.toContain("Lãi suất ưu đãi");
    }
  });

  it("treats 20-year fixed as a hypothetical and models a fixed-for-36-months quote on either side", () => {
    const words = allText(a);
    expect(words).toContain("không phải xác nhận có sản phẩm như vậy");
    expect(words).toContain("bên nào cũng nhập được kiểu này");
    expect(words).toContain("ví dụ cố định 36 tháng rồi đổi");
    // The promo pair is how a phased fixed quote is entered — prove the engine accepts it.
    const phased = at([{ annualRatePercent: 11, termMonths: 240, promoMonths: 36, promoRatePercent: 10.5 }, floating(11)], 60);
    expect(phased.rows[0]?.resetMonth).toBe(37);
  });
});

describe("both articles: reproduce separated from own numbers, real controls, no overclaim", () => {
  const printed = new Set<string>(
    [
      ...Object.values(LOAN_COMPARE.form),
      ...Object.values(LOAN_COMPARE.table.rows),
      LOAN_COMPARE_LEARNING.unknownFeesLabel,
      ...FIXED_VS_FLOATING.compare.sideNames,
      ...FIXED_VS_FLOATING.compare.sideNames.flatMap((side) => [
        `${side} — ${FIXED_VS_FLOATING.compare.structureConstant}`,
        `${side} — ${FIXED_VS_FLOATING.compare.structurePhased.replace("{n}", "12")}`,
      ]),
    ]
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .filter((v): v is string => typeof v === "string"),
  );

  it.each([C05, C11])("%s quotes only controls the tool prints, in its reproduce section and exercise", (slug) => {
    const a = article(slug);
    const texts = [...section(a, REPRODUCE).paragraphs, a.exercise.intro, ...a.exercise.steps, a.exercise.change, a.exercise.check];
    for (const [, quoted] of texts.join(" ").matchAll(/“([^”]+)”/g)) expect(printed, `${slug} quotes “${quoted}”`).toContain(quoted);
  });

  it.each([C05, C11])("%s keeps the article's example out of the own-numbers exercise", (slug) => {
    const a = article(slug);
    const exercise = [a.exercise.intro, ...a.exercise.steps].join(" ");
    for (const exampleValue of ["8,5", "9,2", "10,5", "9,5", "2.000.000.000", "thành 25"]) {
      expect(exercise, `${slug} exercise reuses ${exampleValue}`).not.toContain(exampleValue);
    }
    expect(a.exercise.title).toBe("Thử với báo giá của bạn");
    // The narrow storage sentence; no blanket privacy claim.
    expect(a.exercise.intro).toContain("công cụ không tự lưu lại số bạn nhập khi tải lại trang");
    expect(allText(a)).not.toMatch(/không gửi|bảo mật tuyệt đối|không thu thập/);
  });

  it.each([C05, C11])("%s makes no promise the tools cannot support", (slug) => {
    const words = allText(article(slug));
    for (const banned of [/cố định luôn (rẻ|tốt)/, /luôn tốt hơn/, /sẽ tăng|sẽ giảm/, /chắc chắn tiết kiệm|tiết kiệm chắc chắn/, /được (ngân hàng )?duyệt/, /cam kết/, /đảm bảo/]) {
      expect(words, `${slug} ${banned}`).not.toMatch(banned);
    }
    expect(article(slug).provenance).toContain("cập nhật ngày 01/10/2026");
  });

  it("cites the two CFPB concept pages checked for this wave", () => {
    expect(article(C05).sources.items.map((s) => s.url)).toContain("https://www.consumerfinance.gov/owning-a-home/compare/");
    expect(article(C11).sources.items.map((s) => s.url)).toContain(
      "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-rate-and-adjustable-rate-mortgage-arm-loan-en-100/",
    );
  });
});

describe("social packages: approved design, engine figures, captions", () => {
  const h60 = at([A, B], 60);
  const [a60, b60] = h60.rows as NonNullable<(typeof h60.rows)[number]>[];
  const f11 = at([FIXED, floating(11)], 60);
  const [, p11] = f11.rows as NonNullable<(typeof f11.rows)[number]>[];
  // ONE IDEA PER POSTER (editorial repair 2026-10-01). C05: three rows on the
  // common 5-year horizon. C11: known payment against rate uncertainty — the
  // payments only, no horizon totals.
  const FIGURES: Record<string, string[]> = {
    "so-sanh-khoan-vay": [
      `≈${mil(a60.monthlyPayment - b60.monthlyPayment, 2)} triệu`,
      `≈${mil(b60.horizonBalance - a60.horizonBalance)} triệu`,
      `≈${mil(h60.spread)} triệu`,
    ],
    "lai-co-dinh-hay-tha-noi": [
      `≈${mil(f11.rows[0]!.monthlyPayment, 2)} triệu`,
      `≈${mil(p11.monthlyPayment, 2)} triệu`,
      `≈${mil(p11.resetPayment, 2)} triệu`,
      `≈${mil(at([FIXED, floating(13)], 60).rows[1]!.resetPayment, 2)} triệu`,
    ],
  };
  /** Totals that stay in the article, with their assumptions, and off the poster and openers. */
  const ARTICLE_ONLY: Record<string, string[]> = {
    "so-sanh-khoan-vay": [mil(at([A, B], 300).spread)],
    "lai-co-dinh-hay-tha-noi": [mil(f11.spread), mil(at([FIXED, floating(11)], 240).spread)],
  };
  const HEADLINE: Record<string, string> = {
    "so-sanh-khoan-vay": "<h1>Trả ít mỗi tháng.<br>Có chắc<br>vay rẻ hơn?</h1>",
    "lai-co-dinh-hay-tha-noi": "<h1>Lãi cố định<br>hay thả nổi?</h1>",
  };

  for (const e of LOAN_DECISION_SERIES) {
    it(`${e.tool}: poster HTML in the approved pattern, figures from the engine`, () => {
      const { html } = pkg(e.tool);
      expect(html).toContain('<link rel="stylesheet" href="../poster.css">');
      expect(html).toContain('<img class="brand" src="../../logos/logo-finhome-group.svg" alt="FinHome.group">');
      expect(html).toContain('<script src="../poster.js"></script>');
      expect(html).toContain('<meta name="robots" content="noindex">');
      expect(html).toContain(HEADLINE[e.tool]);
      // Exactly the chosen rows, and nothing the article keeps for itself.
      const rows = [...html.matchAll(/<div class="row[^"]*"><span>[^<]+<\/span><b>([^<]+)<\/b><\/div>/g)].map((m) => m[1]);
      expect(rows).toEqual(FIGURES[e.tool]);
      for (const total of ARTICLE_ONLY[e.tool]) expect(html, total).not.toContain(total);
      expect(html).toContain(`href="${SITE}/blog/${e.article}/"`);
      expect(html).toMatch(/giả định/);
      // Assumptions keep their numbers and risk limits; no repeated photo boilerplate.
      const assumptions = html.match(/<p class="assumptions">([\s\S]*?)<\/p>/)![1];
      for (const limit of ["Ví dụ giả định", "Không phải", "đề nghị cho vay", "Số làm tròn"]) expect(assumptions, limit).toContain(limit);
      expect(assumptions).not.toMatch(/ảnh|AI/i);
      expect(html).not.toMatch(/src="https?:|<link[^>]+href="https?:/);
      expect(html).not.toContain("trả đều gốc và lãi");
    });

    it(`${e.tool}: captions for Facebook, Threads and LinkedIn, one question, article link`, () => {
      const { caption } = pkg(e.tool);
      const parts = caption.split(/^# /m).filter(Boolean);
      const part = (name: string) => {
        const p = parts.find((x) => x.startsWith(name));
        expect(p, name).toBeDefined();
        return p!;
      };
      for (const name of ["Caption chính — Facebook", "Caption ngắn — Facebook / Zalo", "Threads"]) {
        expect(part(name).match(/\?/g)?.length, `${e.tool} ${name}`).toBe(1);
        expect(part(name)).toContain(`${SITE}/blog/${e.article}/`);
      }
      expect(part("LinkedIn")).toContain(`${SITE}/blog/${e.article}/`);
      for (const name of ["Alt text cho poster", "Liên kết", "Bàn giao"]) part(name);
      // Openers and Threads stand alone: no total-cost figure stripped of its assumptions.
      for (const name of ["Caption chính — Facebook", "Caption ngắn — Facebook / Zalo", "Threads"]) {
        for (const total of ARTICLE_ONLY[e.tool]) expect(part(name), `${name} ${total}`).not.toContain(total);
        expect(part(name), name).toMatch(/giả định/);
      }
      // Alt text describes the simplified poster: its figures, not the removed ones.
      for (const figure of FIGURES[e.tool]) expect(part("Alt text cho poster")).toContain(figure.replace(/^≈/, "khoảng ").replace(/ → /, " "));
      for (const total of ARTICLE_ONLY[e.tool]) expect(part("Alt text cho poster")).not.toContain(total);
      // No bank recommendation in a social post.
      expect(caption).not.toMatch(/nên chọn ngân hàng|ngân hàng tốt nhất|gói tốt nhất/i);
      expect(caption).toContain(`${SITE}/cong-cu/${e.tool}/`);
      expect(caption).toMatch(/giả định/);
      expect(caption).toContain("Chưa đăng lên tài khoản social");
      expect(caption).not.toMatch(/chắc chắn có lãi|lợi nhuận đảm bảo|được duyệt vay|bùng nổ|sẽ tăng/i);
    });
  }
});

describe("images: the user-approved AI illustrations, disclosed, traceable and distinct", () => {
  const EXCLUDED = ["8055092", "8055525", "6818113", "8374288", "8374269", "7592746"];
  /**
   * EDITORIAL EXCEPTION (user-approved 2026-10-01, these two packages only):
   * library images 01 and 02 from artifacts/ai-people-library-2026-10-01,
   * AI-generated with a Pexels photo as composition reference. The original
   * ten-photo series rule (real people, Pexels credit) is untouched and still
   * enforced by content/tool-education-series.test.ts. Face boxes measured on
   * the 1536 × 1024 images, in display units (long side 2000).
   */
  /** Face boxes measured on the 1536 × 1024 images, display units (long side 2000). */
  const FACES: Record<string, { left: number; right: number; top: number; bottom: number }> = {
    "so-sanh-khoan-vay": { left: 1029, right: 1497, top: 312, bottom: 508 },
    "lai-co-dinh-hay-tha-noi": { left: 1178, right: 1497, top: 247, bottom: 449 },
  };
  /** The committed, project-owned record (CI never needs the local library). */
  const data = (tool: string) => {
    const d = LOAN_DECISION_AI_IMAGES.find((x) => x.tool === tool);
    expect(d, tool).toBeDefined();
    return d!;
  };
  /** The full ten-image library is a LOCAL artifact; checked only where present. */
  const LIBRARY = "artifacts/ai-people-library-2026-10-01";

  it("records exactly the two approved images, one per package, with stock provenance", () => {
    expect(LOAN_DECISION_AI_IMAGES.map((d) => [d.tool, d.article, d.libraryImage.n])).toEqual(
      LOAN_DECISION_SERIES.map((e, i) => [e.tool, e.article, i + 1]),
    );
    expect(LOAN_DECISION_AI_IMAGES.map((d) => d.compositionReference.pexelsId)).toEqual(["7592743", "7593066"]);
    for (const d of LOAN_DECISION_AI_IMAGES) {
      expect(d.approvedOn).toBe("2026-10-01");
      expect(d.generatedSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(d.compositionReference.url).toBe(`https://www.pexels.com/photo/${d.compositionReference.url.split("/photo/")[1]}`);
      expect(d.compositionReference.url).toContain(d.compositionReference.pexelsId);
      expect(d.compositionReference.licence).toBe("https://www.pexels.com/license/");
      // Nothing machine-local leaks into committed data.
      expect(JSON.stringify(d)).not.toMatch(/\/Users\/|Downloads|\.codex/);
    }
    expect(new Set(LOAN_DECISION_AI_IMAGES.map((d) => d.generatedSha256)).size).toBe(2);
  });

  it.runIf(existsSync(`${LIBRARY}/manifest.json`))("LOCAL ONLY: matches the full library manifest and its generated files", () => {
    const manifest = JSON.parse(read(`${LIBRARY}/manifest.json`)) as {
      images: { n: number; outputFile: string; sha256: string; width: number; height: number; reference: { pexelsId: string } }[];
    };
    for (const d of LOAN_DECISION_AI_IMAGES) {
      const entry = manifest.images.find((i) => i.n === d.libraryImage.n)!;
      expect(entry.outputFile).toBe(d.libraryImage.file);
      expect(entry.sha256).toBe(d.generatedSha256);
      expect(entry.reference.pexelsId).toBe(d.compositionReference.pexelsId);
      expect([entry.width, entry.height]).toEqual([d.size.w, d.size.h]);
      const png = `${LIBRARY}/${d.libraryImage.file}`;
      if (existsSync(png)) expect(createHash("sha256").update(readFileSync(png)).digest("hex")).toBe(d.generatedSha256);
    }
  });
  /** JPEG SOF dimensions, walking markers; no image library. */
  const jpegSize = (file: string) => {
    const b = readFileSync(file);
    let i = 2;
    while (i < b.length) {
      const marker = b[i + 1];
      const length = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + length;
    }
    throw new Error(`no SOF in ${file}`);
  };
  /** Every Pexels ID already shipped anywhere else: other packages, homepage, collection hero. */
  const shipped = () => {
    const ids = new Set<string>();
    for (const dir of readdirSync("public/social", { withFileTypes: true })) {
      if (!dir.isDirectory() || LOAN_DECISION_SERIES.some((e) => e.tool === dir.name)) continue;
      const file = `public/social/${dir.name}/index.html`;
      if (existsSync(file)) for (const m of read(file).matchAll(/pexels-(\d+)-original/g)) ids.add(m[1]);
    }
    for (const file of ["content/home.ts", "content/education/collection.ts"]) {
      for (const m of read(file).matchAll(/pexels-(\d+)/g)) ids.add(m[1]);
    }
    return ids;
  };
  const heroIds = (html: string) => {
    const start = html.indexOf('<section class="hero');
    return [...html.slice(start, html.indexOf("</section>", start)).matchAll(/pexels-(\d+)-original\.jpg/g)].map((m) => m[1]);
  };

  it("finds the shipped photos it guards against (non-vacuous)", () => {
    const ids = shipped();
    for (const id of ["7593053", "7592756", "8297072", "7671364"]) expect(ids.has(id), id).toBe(true);
  });

  for (const e of LOAN_DECISION_SERIES) {
    it(`${e.tool}: ${LOAN_DECISION_PENDING_PHOTOS.includes(e.tool) ? "pending — no photo, ID or credit shipped" : "the approved AI illustration, disclosed and traceable"}`, () => {
      const { html, caption } = pkg(e.tool);
      if (LOAN_DECISION_PENDING_PHOTOS.includes(e.tool)) {
        expect(html).toContain('data-photo-pending="true"');
        expect(html).toContain("Ảnh minh họa: đang chờ duyệt");
        for (const text of [html, caption]) expect(text).not.toMatch(/pexels-\d+|pexels\.com\/photo|Ảnh minh họa: [^đ]/);
        return;
      }
      const d = data(e.tool);
      const faces = FACES[e.tool];
      expect(html).not.toContain("data-photo-pending");
      // Every public derivative the data names exists at its declared size.
      const files: [string, number][] = [[d.web.poster, 1536], [d.web.article[0], 720], [d.web.article[1], 1200], [d.web.share, 1200]];
      for (const [path, w] of files) {
        const file = `public${path}`;
        expect(existsSync(file), file).toBe(true);
        expect(jpegSize(file), file).toEqual({ w, h: Math.round((w * d.size.h) / d.size.w) });
      }
      // The poster shows the AI image, never a stock photo or its photographer as author.
      expect(heroIds(html), e.tool).toEqual([]);
      for (const id of EXCLUDED) expect(html + caption).not.toContain(id);
      // ONE small corner tagline (user direction 2026-10-01), stated once.
      expect(html).toContain('<span class="photo-note">Ảnh minh họa AI</span>');
      expect(html.match(/Ảnh minh họa AI/g)).toHaveLength(2); // the note + the alt text
      expect(html).not.toMatch(/\/ Pexels<\/span>/);
      // Caption handoff: AI disclosure, the committed record, stock provenance, no authorship claim.
      expect(caption).toContain("**ảnh minh họa do AI tạo**");
      expect(caption).toContain("`content/loan-decision-ai-images.ts`");
      expect(caption).toContain(`Pexels ${d.compositionReference.pexelsId}`);
      expect(caption).toContain(d.compositionReference.creator);
      expect(caption).toContain("không phải tác giả của ảnh AI này");
      expect(caption).toContain("không phải là giấy phép mới cho ảnh AI");
      expect(caption).not.toMatch(/Ảnh minh họa: [^\n]*\/ Pexels/);
      // Not mirrored; both faces inside the box and clear of the headline wash
      // (transparent from 62% of the hero: poster box x ≥ 270 of 680 × 445,
      // cover box x ≥ 334 of 790 × 520).
      const img = html.match(new RegExp(`<img([^>]*)src="\\.\\./\\.\\.${d.web.poster.replace(/\./g, "\\.")}"([^>]*)>`))!;
      expect(img, e.tool).not.toBeNull();
      const attrs = img[1] + img[2];
      expect(attrs).not.toContain('class="flip"');
      expect(attrs).not.toContain("scaleX(-1)");
      expect(attrs).toMatch(/alt="Ảnh minh họa AI: một người phụ nữ/);
      const v = (name: string) => Number(attrs.match(new RegExp(`--${name}:(-?[\\d.]+)px`))![1]);
      const displayW = 2000;
      for (const [w, x, y, boxW, boxH, clear] of [[v("w"), v("x"), v("y"), 680, 445, 270], [v("cw"), v("cx"), v("cy"), 790, 520, 334]] as const) {
        const s = w / displayW;
        expect(x + faces.left * s, `${e.tool} face left`).toBeGreaterThanOrEqual(clear);
        expect(x + faces.right * s, `${e.tool} face right`).toBeLessThanOrEqual(boxW);
        expect(y + faces.top * s, `${e.tool} head top`).toBeGreaterThanOrEqual(0);
        expect(y + faces.bottom * s, `${e.tool} chin`).toBeLessThanOrEqual(boxH);
        // The image still covers the whole box: no empty strip at any edge.
        expect(x).toBeLessThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(0);
        expect(x + w).toBeGreaterThanOrEqual(boxW);
        expect(y + (w * d.size.h) / d.size.w).toBeGreaterThanOrEqual(boxH);
      }
    });

    it(`${e.tool}: the article shows the same AI image, labelled, and shares it as og:image`, () => {
      const d = data(e.tool);
      const art = article(e.article).illustration!;
      expect(art, e.article).toBeDefined();
      expect(art.src).toBe(d.web.article[0]);
      expect(art.srcSet).toBe(`${d.web.article[0]} 720w, ${d.web.article[1]} 1200w`);
      expect([art.width, art.height]).toEqual([d.size.w, d.size.h]);
      // No overlay badge and no provenance paragraph: one discreet tagline.
      expect(art.badge).toBeUndefined();
      expect(art.caption).toBe("Ảnh minh họa AI");
      expect(art.alt).toMatch(/^Ảnh minh họa AI: một người phụ nữ/);
      const post = getPost(e.article)!;
      expect(post.ogImage).toBe(d.web.share);
      expect(post.cover).toBeUndefined(); // shown once, as the illustration — not also as a page cover
      expect(postCover(post)).toBe(post.ogImage);
      // Rendered once, after the short answer, before the contents.
      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article: article(e.article) }));
      expect(html.split('data-education-illustration="true"').length - 1).toBe(1);
      const at = html.indexOf('data-education-illustration="true"');
      expect(at).toBeGreaterThan(html.indexOf(">Câu trả lời ngắn</h2>"));
      expect(at).toBeLessThan(html.indexOf(">Trong bài này</h2>"));
      const figure = html.slice(at, html.indexOf("</figure>", at));
      expect(figure).not.toContain("absolute left-3"); // no overlay on the photo
      expect(figure).toContain('<figcaption class="mt-2 text-xs text-ink-3">Ảnh minh họa AI</figcaption>');
      // Shown at its natural aspect, full width of the figure: no crop at any viewport.
      expect(figure).toMatch(/<img[^>]*class="block h-auto w-full rounded-xl[^"]*"/);
      expect(figure).not.toMatch(/object-cover|aspect-\[/);
    });
  }

  it("gives the two packages different images", () => {
    expect(new Set(LOAN_DECISION_AI_IMAGES.map((d) => d.web.poster)).size).toBe(2);
    expect(new Set(LOAN_DECISION_AI_IMAGES.map((d) => d.libraryImage.file)).size).toBe(2);
  });
});

describe("exports and the delivery index: nothing claimed before it exists", () => {
  const png = (file: string) => {
    const bytes = readFileSync(file);
    return { sig: bytes.subarray(0, 8).toString("hex"), w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) };
  };
  const index = read("public/social/index.html");

  it("cannot export a poster before its photo is in", () => {
    for (const tool of LOAN_DECISION_PENDING_PHOTOS) expect(LOAN_DECISION_PENDING_EXPORTS, tool).toContain(tool);
    for (const tool of LOAN_DECISION_PENDING_EXPORTS) expect(LOAN_DECISION_SERIES.some((e) => e.tool === tool)).toBe(true);
  });

  for (const e of LOAN_DECISION_SERIES) {
    it(`${e.tool}: PNG gate and index card agree with the pending list`, () => {
      const file = `public/social/${e.tool}/poster.png`;
      if (LOAN_DECISION_PENDING_EXPORTS.includes(e.tool)) {
        expect(existsSync(file), `${e.tool} is exported; remove it from LOAN_DECISION_PENDING_EXPORTS`).toBe(false);
        const card = index.match(new RegExp(`<li class="card pending" data-pending="${e.tool}">([\\s\\S]*?)</li>`))?.[1];
        expect(card, e.tool).toBeDefined();
        for (const href of [`${e.tool}/index.html`, `${e.tool}/caption.md`, `/blog/${e.article}/`, `/cong-cu/${e.tool}/`]) {
          expect(card).toContain(`href="${href}"`);
        }
        expect(card).not.toMatch(/poster\.png|download|PNG sẵn sàng tải/);
        expect(card).toContain("Chưa xuất PNG");
        expect(index).not.toContain(`data-package="${e.tool}"`);
        return;
      }
      expect(png(file)).toEqual({ sig: "89504e470d0a1a0a", w: 1080, h: 1350 });
      expect(index).toContain(`<li class="card" data-package="${e.tool}">`);
      expect(index).not.toContain(`data-pending="${e.tool}"`);
    });
  }
});
