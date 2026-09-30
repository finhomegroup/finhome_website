import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog/vay-mua-xe-con-du-bao-nhieu/",
  notFound: () => {
    throw new Error("notFound");
  },
}));
import { readFileSync, existsSync } from "node:fs";
import { computeAutoLoan } from "@/lib/calc/auto-loan";
import { compareVehicleBudget } from "@/lib/calc/vehicle-budget";
import { getPost, newsPosts, educationPosts, postKind, POSTS } from "@/content/posts";
import { namedExampleHref, namedExampleId } from "@/components/auto-example";
import { AUTO_LEARNING } from "@/content/calculators/auto-learning";
import { autoTermLabel } from "@/components/auto-learning";

const slug = "vay-mua-xe-con-du-bao-nhieu";
const body = readFileSync(`content/posts/${slug}.md`, "utf8");
const input = { price: 700e6, downPayment: 300e6, tradeIn: 0, annualRatePercent: 10, termMonths: 60 };
const vnd = (n: number) => Math.round(n).toLocaleString("vi-VN");

describe("published auto-loan guide", () => {
  it("uses original project logo/font files and correctly encoded image exports", () => {
    const html = readFileSync("public/social/vay-mua-xe/index.html", "utf8");
    expect(html).toContain('../../logos/logo-finhome-group.svg');
    for (const font of ["diaVJ9Gu2AtlbsQszEnmsxwlIY.woff2", "u4FXY2bqWyT9VTGHSZbId85fOAk.woff2"]) {
      expect(html).toContain(font);
      expect(readFileSync("app/fonts.css", "utf8")).toContain(font);
      expect(existsSync(`public/fonts/${font}`)).toBe(true);
    }
    for (const [file, width, height] of [
      ["public/social/vay-mua-xe/poster.png", 1080, 1350],
      ["public/images/blog/auto-budget-cover.png", 1200, 630],
      ["public/images/blog/auto-budget-flow.png", 960, 510],
    ] as const) {
      const bytes = readFileSync(file);
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(bytes.readUInt32BE(16)).toBe(width);
      expect(bytes.readUInt32BE(20)).toBe(height);
    }
  });
  it("matches every precise loan and budget figure to existing production engines", () => {
    const five = computeAutoLoan(input)!;
    const seven = computeAutoLoan({ ...input, termMonths: 84 })!;
    const budget = compareVehicleBudget({ netIncome: 40e6, essentialExpenses: 22e6, otherDebts: 3e6, reserveSaving: 3e6, vehiclePayment: five.loan.monthlyPrincipalInterest, vehicleRunningCosts: 3e6 });
    if (!budget) throw new Error("The published household fixture must produce a budget");
    for (const n of [five.loan.monthlyPrincipalInterest, five.loan.totalInterest, seven.loan.monthlyPrincipalInterest, seven.loan.totalInterest, budget.withCar!, budget.withoutCar]) {
      expect(body).toContain(vnd(n));
    }
    expect(Math.round(budget.withCar!)).toBe(501182);
    expect(Math.round(budget.withCar! - 1e6)).toBe(-498818);
    expect(five.loan.monthlyPrincipalInterest - seven.loan.monthlyPrincipalInterest).toBeCloseTo(1858344, 0);
    expect((seven.loan.totalInterest - five.loan.totalInterest) / 1e6).toBeCloseTo(47.87, 2);
  });

  it("is discoverable without being misfiled as property news or a home-buying exercise", () => {
    const post = getPost(slug)!;
    expect(postKind(post)).toBe("guide");
    expect(post.topics).toEqual([]);
    expect(newsPosts().some(p => p.slug === slug)).toBe(false);
    expect(educationPosts().some(p => p.slug === slug)).toBe(false);
    expect(post.excerpt.length).toBeGreaterThanOrEqual(120);
    expect(post.excerpt.length).toBeLessThanOrEqual(160);
    expect(readFileSync("app/blog/page.tsx", "utf8")).toContain('postKind(post) === "guide"');
  });

  it("keeps media and internal destinations available and has no second h1", () => {
    expect(body).not.toMatch(/^# /m);
    for (const [, link] of body.matchAll(/\]\((\/[^)]+)\)/g)) {
      const [target, fragment] = link.split("#");
      expect(existsSync(target.startsWith("/images/") ? `public${target}` : `app${target}page.tsx`), link).toBe(true);
      // A fragment on a tool link must be a public named example, never data.
      if (fragment !== undefined) expect(namedExampleId(fragment), link).not.toBeNull();
    }
    expect(existsSync(`public${getPost(slug)!.cover}`)).toBe(true);
    expect(existsSync("public/social/vay-mua-xe/poster.png")).toBe(true);
  });
});

describe("article header action and poster wording (repair 2026-09-30)", () => {
  const renderArticle = async (s: string) => {
    const { default: Page } = await import("@/app/blog/[slug]/page");
    return renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: s }) }));
  };

  it("puts one primary Tính với số của tôi button in this guide's header, before the cover", async () => {
    const html = await renderArticle(slug);
    const at = html.indexOf('data-article-header-cta="true"');
    expect(at).toBeGreaterThan(html.indexOf("<h1"));
    // The cover `<img>`, not the JSON-LD image URL at the top of the page.
    const cover = html.indexOf(`<img src="${getPost(slug)!.cover!}"`);
    expect(cover).toBeGreaterThan(-1);
    expect(at).toBeLessThan(cover);
    const block = html.slice(at, html.indexOf("</a>", at));
    // The existing primary button primitive, to the unchanged default route.
    expect(block).toContain("btn-cta-surface");
    expect(block).toMatch(/href="\/cong-cu\/vay-mua-xe\/?"/);
    expect(block).toContain("Tính với số của tôi");
    expect(block).not.toContain("#");
    expect(html.split('data-article-header-cta="true"').length - 1).toBe(1);
  }, 120_000); // first import of the route and site chrome is slow

  it("limits the header action to standalone tool guides — none on news or collection articles", async () => {
    // Since the 2026-09-30 series every standalone tool guide has one, and
    // nothing else does: news and collection articles stay untouched.
    const withCta = POSTS.filter((p) => p.headerCta);
    expect(withCta.map((p) => p.slug)).toContain(slug);
    expect(withCta.map((p) => p.slug).sort()).toEqual(POSTS.filter((p) => postKind(p) === "guide").map((p) => p.slug).sort());
    for (const p of withCta) {
      expect(p.headerCta!.label, p.slug).toBe("Tính với số của tôi");
      expect(p.headerCta!.href, p.slug).toMatch(/^\/cong-cu\/[a-z-]+\/$/);
    }
    const news = newsPosts()[0];
    const education = POSTS.find((p) => postKind(p) === "education")!;
    for (const other of [news.slug, education.slug]) {
      expect(await renderArticle(other), other).not.toContain("data-article-header-cta");
    }
  }, 120_000);

  it("states the annuity plainly on the poster, with layout and assets kept", () => {
    const html = readFileSync("public/social/vay-mua-xe/index.html", "utf8");
    expect(html).toContain("mỗi tháng trả cùng một tổng tiền gốc và lãi");
    expect(html).not.toContain("trả đều gốc và lãi");
    const assumptions = html.slice(html.indexOf('<p class="assumptions">'), html.indexOf("</p>", html.indexOf('<p class="assumptions">')));
    expect(assumptions.split("<br>").length).toBe(4);
    expect(html).toContain("../../images/home/pexels-7593053-original.jpg");
    expect(readFileSync("public/social/vay-mua-xe/caption.md", "utf8")).not.toContain("trả đều gốc và lãi");
  });
});

describe("article ↔ tool journey (review 2026-09-30)", () => {
  const own = "[Tính với số của tôi →](/cong-cu/vay-mua-xe/)";
  const exampleLink = `(${namedExampleHref("vi-du-bai-vay-mua-xe")})`;

  it("offers Tính với số của tôi early and again at the end, to the unchanged default route", () => {
    const first = body.indexOf(own);
    const last = body.lastIndexOf(own);
    expect(first).toBeGreaterThan(-1);
    expect(last).toBeGreaterThan(first);
    // Early: before the first section, ahead of every other tool link.
    expect(first).toBeLessThan(body.indexOf("\n## "));
    expect(first).toBeLessThan(body.indexOf("/cong-cu/chi-phi-nhien-lieu/"));
    // End: after the checks, before the sources.
    expect(last).toBeGreaterThan(body.indexOf("## Đối chiếu trước khi quyết định"));
    expect(last).toBeLessThan(body.indexOf("## Nguồn để đọc thêm"));
  });

  it("links Thử đúng ví dụ này to a public named example at the worked example", () => {
    expect(namedExampleHref("vi-du-bai-vay-mua-xe")).toBe("/cong-cu/vay-mua-xe/#vi-du-bai-vay-mua-xe");
    expect(body).toContain(`[Thử đúng ví dụ này →]${exampleLink}`);
    const contextual = body.indexOf(`Thử đúng ví dụ này →]${exampleLink}`);
    expect(contextual).toBeGreaterThan(body.indexOf("**Còn lại sau khi mua xe**"));
    expect(contextual).toBeLessThan(body.indexOf("## Tiền nuôi xe"));
    // No figure or personal field in any link the article gives.
    for (const [, link] of body.matchAll(/\]\((\/cong-cu\/[^)]+)\)/g)) {
      expect(link, link).not.toMatch(/[?&=]|\d{3}/);
    }
    // The old instruction to retype the example is gone.
    expect(body).not.toContain("không tự nhận các số từ bài này");
  });

  it("teaches the tool's existing trial and undo buttons by their exact labels", () => {
    const exercise = body.slice(body.indexOf("## Tự thử trong vài phút"), body.indexOf("## Đối chiếu"));
    for (const label of [autoTermLabel("years"), AUTO_LEARNING.undo, AUTO_LEARNING.trials.running.label, AUTO_LEARNING.title]) {
      expect(exercise, label).toContain(`**“${label}”**`);
    }
    expect(autoTermLabel("years")).toBe("Kéo dài kỳ hạn thêm 2 năm");
    expect(exercise.indexOf(autoTermLabel("years"))).toBeLessThan(exercise.indexOf(AUTO_LEARNING.undo));
    // The before → after figures quoted for the term press, from the engines.
    const seven = computeAutoLoan({ ...input, termMonths: 84 })!;
    const after = compareVehicleBudget({ netIncome: 40e6, essentialExpenses: 22e6, otherDebts: 3e6, reserveSaving: 3e6, vehiclePayment: seven.loan.monthlyPrincipalInterest, vehicleRunningCosts: 3e6 })!;
    expect((seven.loan.monthlyPrincipalInterest / 1e6).toFixed(1)).toBe("6.6");
    expect((seven.loan.totalInterest / 1e6).toFixed(1)).toBe("157.8");
    expect((after.withCar! / 1e6).toFixed(1)).toBe("2.4");
    expect(exercise).toContain("8,5 → 6,6 triệu");
    expect(exercise).toContain("109,9 → 157,8 triệu");
    expect(exercise).toContain("0,5 → 2,4 triệu");
  });
});
